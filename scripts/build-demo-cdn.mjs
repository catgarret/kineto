// Generate a deploy-ready copy of the demo that loads Kineto from jsDelivr's
// unversioned package route. The displayed version is read from the loaded runtime, so it
// intentionally follows the version that npm currently serves as latest.
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

// CDN base — the public demo tracks the unversioned package route by design
// (run `npm run purge` after publish to flush jsDelivr's moving cache). The determinism fixes below still
// apply: no leftover ../dist refs, and the ?v= cache-buster is handled.
const cdnBase = `https://cdn.jsdelivr.net/npm/@dong-gri/kineto/dist`;

// Short build id for the footer/debug so a deployed page is traceable to a commit.
function buildId() {
  try { return execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim(); }
  catch (_e) { return `v${version}`; }
}

// Pure, testable rewrite. Points every local ../dist/* reference (with or without
// a ?v= cache-buster) at the pinned CDN, and injects window.__KT_BUILD__ so the
// footer build id is stamped at runtime. Returns { html, leftover }.
export function rewriteSiteHtml(html, { base = cdnBase, build = 'dev' } = {}) {
  let out = html
    // umd.js / umd.min.js  (optional ?v=NNN)
    .replace(/(?:href|src)="\.\.\/dist\/kineto\.umd(?:\.min)?\.js(?:\?v=\d+)?"/g, `src="${base}/kineto.umd.min.js"`)
    // css / min.css       (optional ?v=NNN)
    .replace(/(?:href|src)="\.\.\/dist\/kineto(?:\.min)?\.css(?:\?v=\d+)?"/g, `href="${base}/kineto.min.css"`);
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
  if (!/cdn\.jsdelivr\.net\/npm\/@dong-gri\/kineto\/dist/.test(html)) errors.push('site/index.html missing the unversioned @dong-gri/kineto CDN reference');
  if (/@dong-gri\/kineto@[^/]+/.test(html)) errors.push('site/index.html still pins a CDN version alias');
  return errors;
}

const isMain = fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '');
if (isMain) {
  const check = process.argv.includes('--check');
  if (check) {
    const html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
    const errors = assertSite(html);
    if (errors.length) { console.error('demo-cdn --check FAILED:\n  - ' + errors.join('\n  - ')); process.exit(1); }
    console.log(`demo-cdn --check OK — unversioned CDN, 0 ../dist refs.`);
  } else {
    fs.rmSync(OUT, { recursive: true, force: true });
    fs.cpSync(SRC, OUT, { recursive: true });
    const indexPath = path.join(OUT, 'index.html');
    const { html, leftover } = rewriteSiteHtml(fs.readFileSync(indexPath, 'utf8'), { build: buildId() });
    fs.writeFileSync(indexPath, html);
    const errors = assertSite(html);
    if (errors.length || leftover > 0) {
      console.error(`Generated site/ but assertions FAILED (leftover ../dist=${leftover}):\n  - ` + errors.join('\n  - '));
      process.exit(1);
    }
    console.log(`Generated site/ from demo/ — unversioned Kineto CDN (build ${buildId()}). 0 ../dist refs asserted.`);
  }
}
