// The generated public site must execute the exact local artifacts that CI
// tested, retain public CDN install snippets, carry no ../dist references, and
// expose runtime version/count hooks so header/footer remain traceable.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';
import { rewriteSiteHtml, assertSite, assertDemoAssets, listDemoAssets, minifyDemoScript, minifyDemoStylesheet } from '../scripts/build-demo-cdn.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const features = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));
const version = pkg.version;
const moduleCount = features.moduleCount;

// 1. package version === Kineto.version literal in source
const core = fs.readFileSync(path.join(root, 'src/core.js'), 'utf8');
const m = core.match(/version:\s*'([^']+)'/);
assert.ok(m, 'src/core.js has a version literal');
assert.strictEqual(m[1], version, `Kineto.version (${m[1]}) must equal package.json version (${version})`);

// 2. rewrite of the real demo produces co-deployed runtime references while
// preserving the public unversioned CDN install snippet.
const demoHtml = fs.readFileSync(path.join(root, 'demo/index.html'), 'utf8');
const { html, leftover } = rewriteSiteHtml(demoHtml, { build: 'testhash' });
assert.strictEqual(leftover, 0, 'site must have 0 ../dist references');
assert.ok(/src="\.\/kineto\.umd\.min\.js\?v=testhash"/.test(html), 'site must execute the co-deployed UMD bundle');
assert.ok(/href="\.\/kineto\.min\.css\?v=testhash"/.test(html), 'site must load the co-deployed stylesheet');
assert.ok(/cdn\.jsdelivr\.net\/npm\/@dong-gri\/kineto\/dist/.test(html), 'site must retain the unversioned public CDN install snippet');
assert.strictEqual(assertSite(html).length, 0, 'assertSite must pass on the rewritten html');

for (const asset of ['kineto.umd.min.js', 'kineto.min.css']) {
  assert.deepStrictEqual(
    fs.readFileSync(path.join(root, 'site', asset)),
    fs.readFileSync(path.join(root, 'dist', asset)),
    `site/${asset} must byte-match dist/${asset}`
  );
}

// 2b. Demo-owned scripts/stylesheets ship minified, deterministically derived
// from demo/ so a stale or hand-edited site/ copy fails the check. Classic
// scripts keep their top-level bindings (the demo shares state through them),
// so the deployed copy must still define the same globals as the source.
assert.deepStrictEqual(assertDemoAssets(), [], 'site/ demo assets must be the current minified builds of demo/');
const demoAssets = listDemoAssets();
assert.ok(demoAssets.length >= 10, `expected the demo scripts and stylesheets to be listed (${demoAssets.length})`);
for (const { file } of demoAssets) {
  const source = fs.statSync(path.join(root, 'demo', file)).size;
  const deployed = fs.statSync(path.join(root, 'site', file)).size;
  assert.ok(deployed <= source, `site/${file} (${deployed}) must not be larger than demo/${file} (${source})`);
}
assert.strictEqual(minifyDemoScript('a.js', 'const a = 1;\nwindow.__ktTest = a;'), minifyDemoScript('a.js', 'const a = 1;\nwindow.__ktTest = a;'), 'script minification must be deterministic');
assert.match(minifyDemoScript('shared.js', 'const sharedToken = 1;\nfunction sharedHelper(value) { return value + sharedToken; }\nwindow.sharedHelper = sharedHelper;'), /\bsharedToken\b[\s\S]*\bsharedHelper\b/, 'top-level bindings of classic demo scripts must keep their names');
assert.strictEqual(minifyDemoStylesheet('a.css', '.a {\n  color: red;\n}\n'), '.a{color:red}', 'stylesheet minification must drop whitespace only');
for (const file of ['playground.js', 'main.js', 'styles.css', 'playground.css']) {
  const deployed = fs.readFileSync(path.join(root, 'site', file), 'utf8');
  const source = fs.readFileSync(path.join(root, 'demo', file), 'utf8');
  assert.ok(deployed.length < source.length * 0.8, `site/${file} should be meaningfully smaller than its source (${deployed.length} vs ${source.length})`);
}

// 3. The deploy source owns the GTM snippet, so every generated site/index.html
// includes the exact container once in <head> and once as the body noscript fallback.
assert.strictEqual((demoHtml.match(/googletagmanager\.com\/gtm\.js\?id='\+i/g) || []).length, 1, 'demo must contain exactly one GTM head loader');
assert.strictEqual((demoHtml.match(/'GTM-KFQSFGJL'/g) || []).length, 1, 'demo must configure the GTM container exactly once');
assert.strictEqual((demoHtml.match(/googletagmanager\.com\/ns\.html\?id=GTM-KFQSFGJL/g) || []).length, 1, 'demo must contain exactly one GTM noscript fallback');
assert.ok(/<noscript><iframe class="gtm-noscript"/.test(demoHtml), 'GTM noscript fallback must stay at the body start without an inline style');

// 4. header + footer expose runtime hooks (so they cannot drift), and no stale "34"
assert.ok(/data-kt-version/.test(demoHtml), 'demo has [data-kt-version] hook');
assert.ok(/data-kt-module-count/.test(demoHtml), 'demo has [data-kt-module-count] hook');
assert.ok(/data-kt-build/.test(demoHtml), 'demo has [data-kt-build] hook');
assert.match(demoHtml, new RegExp(`data-kt-module-count>${moduleCount}<`), 'demo count starts from the feature contract');
assert.doesNotMatch(demoHtml, /\b51\b/, 'demo must not retain the previous 51-module copy');

// Keep the project status links visible in the public hero. These are part of
// the demo's trust surface, not optional decoration.
assert.ok(/class="hero-badges"/.test(demoHtml), 'demo keeps the project status badge row');
for (const badge of ['alt="CI"', 'alt="npm"', 'alt="license"', 'alt="jsDelivr"']) {
  assert.ok(demoHtml.includes(badge), `demo keeps the ${badge.slice(5, -1)} badge`);
}

// 5. no stale build artifacts committed. Ignored local OS files are irrelevant
// to a clean checkout, so inspect the Git index rather than the working folder.
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const stale = tracked.filter((file) => /(^|\/)(?:\.fuse_hidden[^/]*|\.DS_Store)$/.test(file));
assert.strictEqual(stale.length, 0, `stale files present: ${stale.join(', ')}`);

// 6. Canonical live-demo links stay synchronized across package/docs/locales.
const linkedDocs = [
  'package.json', 'README.md', 'AI-PROMPT-GUIDE.md', 'docs/RELEASING.md',
  'i18n/README.ko.md', 'i18n/README.jp.md', 'i18n/README.zh-CN.md',
  'i18n/README.zh-TW.md', 'i18n/README.ru.md', 'i18n/README.it.md'
];
for (const relative of linkedDocs) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  assert.ok(source.includes('https://kineto.dongri.me'), `${relative} must use the canonical demo URL`);
  assert.doesNotMatch(source, /https:\/\/git\.dongri\.me\/example\/kineto/);
  // The demo link itself stays the bare canonical URL (no trailing slash);
  // deployed sub-resources such as /r/registry.json and /llms.txt are allowed.
  assert.doesNotMatch(source, /https:\/\/kineto\.dongri\.me\/(?![a-z0-9])/i, `${relative} must not add a trailing slash to the canonical demo URL`);
}

console.log(`site-deploy OK — co-deployed runtime matches dist, public CDN snippets remain, canonical URL/GTM/version(${version})/count/build hooks present.`);
