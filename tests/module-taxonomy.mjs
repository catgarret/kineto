// Every module belongs to exactly ONE category, and the demo must agree with it.
//
// The bug this locks down: category membership used to be written by hand in
// three separate places — the demo's DOM sections, the sidebar's MODULE_GROUPS
// literal, and the docs. They drifted, and the drift was invisible:
//   - dither / ascii / halftone were Lazy variants, so "apply a texture to an
//     image" sat among the lazy-LOADING cards in the Media section;
//   - `marquee` was listed under Media in the sidebar while its cards lived in
//     the Text section;
//   - `coverReveal` was Media in the sidebar and Scroll in the page;
//   - `ripple` was Pointer in the sidebar and Feedback in the page.
//
// The fix is one source of truth — the `category` each module declares in
// scripts/generate-module-metadata.mjs — and this test, which fails the build if
// the demo disagrees with it. See docs/module-taxonomy.md.
//
// Run: node tests/module-taxonomy.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const contract = JSON.parse(read('kineto.features.json'));
const metadata = JSON.parse(read('kineto.module-metadata.json'));
const html = read('demo/index.html');
const mainJs = read('demo/main.js');

const problems = [];
const taxonomy = metadata.taxonomy;
const known = new Set(taxonomy?.order || []);
const categoryOf = new Map(Object.entries(metadata.modules).map(([name, value]) => [name, value.category]));

// 1. Every public module declares exactly one known category.
for (const { name } of contract.modules) {
  const category = categoryOf.get(name);
  if (!category) problems.push(`${name} declares no category (add it to CATEGORIES in scripts/generate-module-metadata.mjs)`);
  else if (!known.has(category)) problems.push(`${name} declares unknown category "${category}"`);
}

// 2. The decision order and the demo's reading order cover the same categories,
//    and no category is left without modules (a sign the taxonomy went stale).
const display = taxonomy?.displayOrder || [];
if ([...display].sort().join() !== [...known].sort().join()) {
  problems.push('taxonomy.displayOrder and taxonomy.order must list the same categories');
}
for (const category of known) {
  if (![...categoryOf.values()].includes(category)) problems.push(`category "${category}" has no modules`);
}

// 3. The demo has exactly one section per category. Category sections are the
//    top-level `section.section.container` blocks; a section nested inside a
//    demo (the fullpage slides) never carries data-demo-category.
const sectionStarts = [...html.matchAll(/<section class="section container"([^>]*)>/g)];
const sections = sectionStarts.map((match, index) => ({
  attrs: match[1],
  id: (match[1].match(/id="([^"]+)"/) || [])[1] || '(no id)',
  category: (match[1].match(/data-demo-category="([^"]+)"/) || [])[1] || null,
  start: match.index,
  end: index + 1 < sectionStarts.length ? sectionStarts[index + 1].index : html.length
}));
const byCategory = new Map();
for (const section of sections) {
  if (!section.category) continue;
  if (!known.has(section.category)) problems.push(`demo section #${section.id} declares unknown category "${section.category}"`);
  if (byCategory.has(section.category)) problems.push(`category "${section.category}" is claimed by two demo sections: #${byCategory.get(section.category).id} and #${section.id}`);
  else byCategory.set(section.category, section);
}
for (const category of known) {
  if (!byCategory.has(category)) problems.push(`no demo section carries data-demo-category="${category}"`);
}

// 4. Every module marks exactly one home card, inside its own category's section.
//    Two markers and the sidebar cannot say which card is the module's; none and
//    it has nowhere to scroll to.
const homes = [...html.matchAll(/data-demo-home="([A-Za-z]+)"/g)];
const seen = new Map();
for (const match of homes) {
  const name = match[1];
  if (seen.has(name)) { problems.push(`${name} has more than one data-demo-home marker`); continue; }
  seen.set(name, match.index);
  if (!categoryOf.has(name)) { problems.push(`data-demo-home="${name}" is not a public module`); continue; }
  const section = sections.find((entry) => match.index >= entry.start && match.index < entry.end);
  const category = categoryOf.get(name);
  if (!section || !section.category) problems.push(`${name}'s home card is not inside a category section`);
  else if (section.category !== category) problems.push(`${name} is categorized "${category}" but its home card sits in the "${section.category}" section (#${section.id})`);
}
for (const { name } of contract.modules) {
  if (!seen.has(name)) problems.push(`${name} has no data-demo-home card in demo/index.html`);
}

// 5. The demo must not hand-write category membership again. It may order the
//    modules inside a category, and that ordering list has to stay honest.
if (/\n\s*const MODULE_GROUPS\s*=\s*\{\s*\n\s*['"]/.test(mainJs)) {
  problems.push('demo/main.js hand-writes MODULE_GROUPS again — build it from the generated taxonomy instead');
}
const orderLiteral = mainJs.match(/const MODULE_ORDER\s*=\s*\[([\s\S]*?)\];/);
if (!orderLiteral) problems.push('demo/main.js no longer declares MODULE_ORDER');
else {
  const ordered = [...orderLiteral[1].matchAll(/'([A-Za-z]+)'/g)].map((match) => match[1]);
  const duplicates = ordered.filter((name, index) => ordered.indexOf(name) !== index);
  if (duplicates.length) problems.push(`MODULE_ORDER repeats: ${[...new Set(duplicates)].join(', ')}`);
  for (const name of ordered) if (!categoryOf.has(name)) problems.push(`MODULE_ORDER names "${name}", which is not a public module`);
  for (const { name } of contract.modules) if (!ordered.includes(name)) problems.push(`MODULE_ORDER is missing ${name}`);
}

if (problems.length) {
  console.error(`module-taxonomy FAILED — ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
  console.error('\nSee docs/module-taxonomy.md for the decision order.');
  process.exit(1);
}
const counts = [...known].map((category) => `${category}:${[...categoryOf.values()].filter((value) => value === category).length}`);
console.log(`module-taxonomy OK — ${contract.moduleCount} modules, one category each (${counts.join(' ')}), demo sections and home cards agree.`);
