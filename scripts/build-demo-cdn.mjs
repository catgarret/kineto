// Generate a deploy-ready copy of the demo that executes the exact Kineto
// artifacts built and tested from this checkout. Public install snippets still
// point at jsDelivr, but the demo runtime must never lag behind the Pages build.
//
// Run as part of `npm run build`, or on its own: `npm run demo:cdn`.
// `--check` verifies an already-generated site/ instead of writing.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const SRC = path.join(root, 'demo');
const OUT = path.join(root, 'site');

const runtimeAssets = [
  ['kineto.umd.min.js', 'kineto.umd.min.js'],
  ['kineto.min.css', 'kineto.min.css']
];

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
    const errors = [...assertSite(html), ...assertRuntimeAssets()];
    if (errors.length) { console.error('demo-cdn --check FAILED:\n  - ' + errors.join('\n  - ')); process.exit(1); }
    console.log(`demo-cdn --check OK — co-deployed runtime matches dist, public CDN snippets retained, 0 ../dist refs.`);
  } else {
    fs.rmSync(OUT, { recursive: true, force: true });
    fs.cpSync(SRC, OUT, { recursive: true });
    for (const [sourceName, outputName] of runtimeAssets) {
      fs.copyFileSync(path.join(root, 'dist', sourceName), path.join(OUT, outputName));
    }
    const indexPath = path.join(OUT, 'index.html');
    const { html, leftover } = rewriteSiteHtml(fs.readFileSync(indexPath, 'utf8'), { build: buildId() });
    fs.writeFileSync(indexPath, html);
    const errors = [...assertSite(html), ...assertRuntimeAssets()];
    if (errors.length || leftover > 0) {
      console.error(`Generated site/ but assertions FAILED (leftover ../dist=${leftover}):\n  - ` + errors.join('\n  - '));
      process.exit(1);
    }
    console.log(`Generated site/ from demo/ — co-deployed tested runtime (build ${buildId()}), public CDN snippets retained.`);
  }
}
