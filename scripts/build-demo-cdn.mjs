// Generate a deploy-ready copy of the demo that executes the exact Kineto
// artifacts built and tested from this checkout. Public install snippets still
// point at jsDelivr, but the demo runtime must never lag behind the Pages build.
//
// Run as part of `npm run build`, or on its own: `npm run demo:cdn`.
// `--check` verifies an already-generated site/ instead of writing.
//
// The demo's own scripts and stylesheets are minified on the way into site/.
// `demo/` stays the readable QA source (every browser test runs against it);
// the deployed copy only drops whitespace, comments and local identifiers.
// Both minifiers ship with the repository's Vite toolchain and are
// deterministic, so `--check` can assert byte equality against a fresh pass.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { minifySync } from 'rolldown/experimental';
import { transform as transformCss } from 'lightningcss';
import { renderSiteExtras } from './generate-integrations.mjs';
import { renderRegistrySite } from './build-registry.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const SRC = path.join(root, 'demo');
const OUT = path.join(root, 'site');

const runtimeAssets = [
  ['kineto.umd.min.js', 'kineto.umd.min.js'],
  ['kineto.min.css', 'kineto.min.css']
];

// Demo scripts are classic (non-module) scripts that share state through
// top-level bindings and `window.*`, so top-level names are never mangled.
// Only block-scoped and function-scoped identifiers are shortened.
const JS_MINIFY_OPTIONS = Object.freeze({
  compress: { target: 'es2020' },
  mangle: { toplevel: false },
  codegen: { removeWhitespace: true }
});

export function minifyDemoScript(name, source) {
  const output = minifySync(name, source, JS_MINIFY_OPTIONS);
  if (output.errors?.length) {
    throw new Error(`demo-cdn: could not minify ${name}: ${output.errors.map((error) => error.message).join('; ')}`);
  }
  return output.code;
}

export function minifyDemoStylesheet(name, source) {
  return transformCss({ filename: name, code: Buffer.from(source), minify: true }).code.toString();
}

// Every demo-owned asset in site/ and how its deployed bytes derive from the
// demo/ source. The runtime files copied from dist/ are deliberately absent:
// they must stay byte-identical to the tested build.
export function listDemoAssets(sourceDir = SRC) {
  return fs.readdirSync(sourceDir)
    .filter((file) => /\.(?:js|css)$/.test(file))
    .sort()
    .map((file) => ({ file, minify: file.endsWith('.js') ? minifyDemoScript : minifyDemoStylesheet }));
}

function writeMinifiedDemoAssets() {
  return listDemoAssets().map(({ file, minify }) => {
    const source = fs.readFileSync(path.join(SRC, file), 'utf8');
    const output = minify(file, source);
    fs.writeFileSync(path.join(OUT, file), output);
    return { file, sourceBytes: Buffer.byteLength(source), outputBytes: Buffer.byteLength(output) };
  });
}

// `--check` support: the deployed copy of each demo asset must be exactly what
// a fresh minification of the current demo/ source produces.
export function assertDemoAssets() {
  const errors = [];
  for (const { file, minify } of listDemoAssets()) {
    const output = path.join(OUT, file);
    if (!fs.existsSync(output)) { errors.push(`site/${file} is missing`); continue; }
    const expected = minify(file, fs.readFileSync(path.join(SRC, file), 'utf8'));
    if (fs.readFileSync(output, 'utf8') !== expected) errors.push(`site/${file} is not the minified build of demo/${file}`);
  }
  return errors;
}

// Files the deployed site serves beyond the demo itself: the AI-facing
// `llms.txt` + rules (from kineto.integrations.json) and the shadcn registry
// (`r/*.json`, from registry/). Both are pure renders, so `--check` can assert
// byte equality exactly like the minified demo assets.
export function listSiteExtras() {
  return { ...renderSiteExtras(), ...renderRegistrySite() };
}

function writeSiteExtras() {
  const extras = listSiteExtras();
  for (const [file, content] of Object.entries(extras)) {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  return Object.keys(extras).length;
}

export function assertSiteExtras() {
  const errors = [];
  for (const [file, content] of Object.entries(listSiteExtras())) {
    const target = path.join(root, file);
    if (!fs.existsSync(target)) { errors.push(`${file} is missing`); continue; }
    if (fs.readFileSync(target, 'utf8') !== content) errors.push(`${file} is stale (regenerate with npm run build)`);
  }
  return errors;
}

// Short build id for the footer/debug so a deployed page is traceable to a commit.
function buildId() {
  try { return execSync('git rev-parse --short=7 HEAD', { cwd: root }).toString().trim(); }
  catch (_e) { return `v${version}`; }
}

// Pure, testable rewrite. Points the demo's runtime references at co-deployed
// minimized assets and injects window.__KT_BUILD__ so the footer build id is
// stamped at runtime. The escaped installation snippets are intentionally left
// on the public unversioned CDN route. Returns { html, leftover }.
export function rewriteSiteHtml(html, { base = '.', build = 'dev' } = {}) {
  const suffix = `?v=${encodeURIComponent(build)}`;
  let out = html
    // umd.js / umd.min.js  (optional ?v=NNN)
    .replace(/(?:href|src)="\.\.\/dist\/kineto\.umd(?:\.min)?\.js(?:\?v=\d+)?"/g, `src="${base}/kineto.umd.min.js${suffix}"`)
    // css / min.css       (optional ?v=NNN)
    .replace(/(?:href|src)="\.\.\/dist\/kineto(?:\.min)?\.css(?:\?v=\d+)?"/g, `href="${base}/kineto.min.css${suffix}"`);
  // Stamp the build id just before </head> so main.js can read window.__KT_BUILD__.
  if (!/__KT_BUILD__/.test(out)) {
    out = out.replace(/<\/head>/i, `  <script>window.__KT_BUILD__=${JSON.stringify(build)};</script>\n</head>`);
  }
  // Count REAL local refs only — inside href="/src=" attributes. The escaped
  // install snippet (&lt;script src="https://cdn…"&gt;) is not a ../dist ref.
  const leftover = (out.match(/(?:href|src)="\.\.\/dist\//g) || []).length;
  return { html: out, leftover };
}

export function assertSite(html) {
  const errors = [];
  if (/(?:href|src)="\.\.\/dist\//.test(html)) errors.push('site/index.html still contains ../dist/ references');
  if (!/<script\s+src="\.\/kineto\.umd\.min\.js\?v=[^"]+"><\/script>/.test(html)) errors.push('site/index.html missing the co-deployed Kineto runtime');
  if (!/<link\s+rel="stylesheet"\s+href="\.\/kineto\.min\.css\?v=[^"]+">/.test(html)) errors.push('site/index.html missing the co-deployed Kineto stylesheet');
  if (!/cdn\.jsdelivr\.net\/npm\/@dong-gri\/kineto\/dist/.test(html)) errors.push('site/index.html missing the public unversioned @dong-gri/kineto install snippet');
  return errors;
}

function assertRuntimeAssets() {
  const errors = [];
  for (const [sourceName, outputName] of runtimeAssets) {
    const source = path.join(root, 'dist', sourceName);
    const output = path.join(OUT, outputName);
    if (!fs.existsSync(output)) {
      errors.push(`site/${outputName} is missing`);
      continue;
    }
    if (!fs.readFileSync(source).equals(fs.readFileSync(output))) {
      errors.push(`site/${outputName} does not match dist/${sourceName}`);
    }
  }
  return errors;
}

const isMain = fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '');
if (isMain) {
  const check = process.argv.includes('--check');
  if (check) {
    const html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
    const errors = [...assertSite(html), ...assertRuntimeAssets(), ...assertDemoAssets(), ...assertSiteExtras()];
    if (errors.length) { console.error('demo-cdn --check FAILED:\n  - ' + errors.join('\n  - ')); process.exit(1); }
    console.log(`demo-cdn --check OK — co-deployed runtime matches dist, demo assets are current minified builds, llms.txt/AI rules/registry are current, public CDN snippets retained, 0 ../dist refs.`);
  } else {
    fs.rmSync(OUT, { recursive: true, force: true });
    fs.cpSync(SRC, OUT, { recursive: true });
    const minified = writeMinifiedDemoAssets();
    for (const [sourceName, outputName] of runtimeAssets) {
      fs.copyFileSync(path.join(root, 'dist', sourceName), path.join(OUT, outputName));
    }
    const extras = writeSiteExtras();
    const indexPath = path.join(OUT, 'index.html');
    const { html, leftover } = rewriteSiteHtml(fs.readFileSync(indexPath, 'utf8'), { build: buildId() });
    fs.writeFileSync(indexPath, html);
    const errors = [...assertSite(html), ...assertRuntimeAssets(), ...assertDemoAssets(), ...assertSiteExtras()];
    if (errors.length || leftover > 0) {
      console.error(`Generated site/ but assertions FAILED (leftover ../dist=${leftover}):\n  - ` + errors.join('\n  - '));
      process.exit(1);
    }
    const sourceKb = minified.reduce((total, asset) => total + asset.sourceBytes, 0) / 1024;
    const outputKb = minified.reduce((total, asset) => total + asset.outputBytes, 0) / 1024;
    console.log(`Generated site/ from demo/ — co-deployed tested runtime (build ${buildId()}), public CDN snippets retained, ${minified.length} demo assets minified ${sourceKb.toFixed(1)} KB → ${outputKb.toFixed(1)} KB, ${extras} AI/registry files.`);
  }
}
