// The demo forbids inline presentation: no `style="..."` attributes, no inline
// event handlers, no `cssText` blobs of static design, and no `element.style.x =`
// writes that duplicate a declaration CSS already owns.
//
// Why this is a test and not a convention: an inline style silently outranks the
// stylesheet, so the two drift apart without any visible warning. A real case
// this caught — main.js wrote `scrollMarginTop = '78px'` while styles.css
// declared `scroll-margin-top: 82px`; the inline value won and the CSS was dead.
//
// Runtime geometry that genuinely cannot be static (a drag-resized drawer) is
// published as a CSS custom property via `style.setProperty('--kt-*')`, which
// keeps the `height` / `max-height` declarations in the stylesheet. That form is
// allowed; direct property assignment is not.
//
// Run: node tests/no-inline-styles.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];

// ── 1. demo/index.html: no style attributes, no inline handlers ──────────────
const html = fs.readFileSync(path.join(root, 'demo/index.html'), 'utf8');
const styleAttributes = html.match(/(^|\s)style\s*=\s*"/g) || [];
if (styleAttributes.length) problems.push(`demo/index.html has ${styleAttributes.length} inline style attribute(s)`);

const handlers = html.match(/\son(?:click|load|error|change|input|submit|mouseover|mouseout|mouseenter|mouseleave|focus|blur|keydown|keyup|keypress|scroll|touchstart|touchend|pointerdown|pointerup)\s*=/gi) || [];
if (handlers.length) {
  problems.push(`demo/index.html has ${handlers.length} inline event handler(s): ${[...new Set(handlers.map((h) => h.trim()))].join(', ')}`);
}

// ── 2. demo JS: no direct style property writes, no cssText ──────────────────
// `setProperty('--custom')` is the sanctioned escape hatch and is not matched by
// the pattern below, which only looks for `.style.<prop> =`.
for (const file of ['demo/main.js', 'demo/playground.js']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const lines = source.split('\n');
  lines.forEach((line, index) => {
    if (/\.style\.[a-zA-Z][\w]*\s*=(?!=)/.test(line)) problems.push(`${file}:${index + 1} writes an inline style property — move it to CSS, or publish a --custom-property`);
    if (/\.style\.cssText\s*=/.test(line)) problems.push(`${file}:${index + 1} assigns cssText — static design belongs in a stylesheet`);
  });
  // A style attribute baked into generated markup is the same violation, one
  // level of indirection away.
  const generated = source.match(/style\s*=\s*\\?["'`][^"'`]*[:;]/g) || [];
  if (generated.length) problems.push(`${file} builds markup containing ${generated.length} inline style attribute(s)`);
}

// ── 3. src modules: markup they generate must not carry style attributes ─────
const moduleFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.js')) moduleFiles.push(full);
  }
})(path.join(root, 'src'));

const generatedStyleAttributes = [];
for (const file of moduleFiles) {
  const source = fs.readFileSync(file, 'utf8');
  source.split('\n').forEach((line, index) => {
    // `style="…:…"` inside a string literal — i.e. baked into innerHTML.
    if (/style\s*=\s*\\?["'][^"']*:/.test(line)) {
      generatedStyleAttributes.push(`${path.relative(root, file)}:${index + 1}`);
    }
  });
}
if (generatedStyleAttributes.length) {
  problems.push(`${generatedStyleAttributes.length} module line(s) bake a style attribute into generated markup:\n    - ${generatedStyleAttributes.join('\n    - ')}`);
}

if (problems.length) {
  console.error('no-inline-styles FAILED:\n  - ' + problems.join('\n  - '));
  process.exit(1);
}
console.log(`no-inline-styles OK — demo/index.html: 0 style attributes, 0 inline handlers; demo JS: 0 style writes; ${moduleFiles.length} module files: 0 baked style attributes.`);
