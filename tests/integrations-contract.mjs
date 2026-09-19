// kineto.integrations.json must never name something the library does not
// have. Every recipe module/variant/option is checked against the feature
// contract, every ecosystem reference resolves, every Figma pattern compiles,
// the shared snippet/suggest helpers produce contract-valid output, and the
// generated artefacts (docs/integrations, ai/, site/llms.txt) are current.
//
// Run: node tests/integrations-contract.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  attributeList, findModule, guidanceFor, htmlSnippet, isCorePrimitive, jsSnippet, modulesInMap,
  reactSnippet, suggest, validateOptions, variantKey, vueSnippet
} from '../scripts/integrations/lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const features = JSON.parse(read('kineto.features.json'));
const integrations = JSON.parse(read('kineto.integrations.json'));
const schema = JSON.parse(read('kineto.integrations.schema.json'));
const pkg = JSON.parse(read('package.json'));

// 1. Top-level shape follows the schema's required/allowed keys (a light
//    structural check — the schema file is the documented contract).
assert.deepEqual(Object.keys(integrations).filter((key) => key !== '$schema').sort(), schema.required.slice().sort(), 'top-level keys must match the schema');
assert.match(integrations.integrationsVersion, /^\d+\.\d+\.\d+$/);
assert.equal(integrations.libraryVersion, pkg.version, 'integrations map must track the package version');
assert.ok(integrations.principles.length >= 4, 'the AI principles must stay explicit');
for (const key of ['install', 'css', 'bootstrapScript', 'cdn']) assert.ok(integrations.setup[key], `setup.${key} is required`);
assert.match(integrations.setup.bootstrapScript, /Kineto\.observe\(\)/, 'the recommended bootstrap uses Kineto.observe()');
assert.ok(features.coreApi.includes('observe'), 'observe() must be a public Core API');

// 2. Ecosystems.
const ecosystemIds = Object.keys(integrations.ecosystems);
assert.ok(ecosystemIds.includes('shadcn') && ecosystemIds.includes('bootstrap') && ecosystemIds.includes('vanilla'));
for (const [id, ecosystem] of Object.entries(integrations.ecosystems)) {
  assert.match(id, /^[a-z0-9-]+$/, `ecosystem id ${id}`);
  assert.ok(['html', 'react', 'vue'].includes(ecosystem.framework), `${id}.framework`);
  assert.ok(ecosystem.attach?.pattern && ecosystem.attach.summary && ecosystem.attach.example, `${id}.attach`);
  assert.ok(Array.isArray(ecosystem.provides) && Array.isArray(ecosystem.notes), `${id} provides/notes arrays`);
  assert.match(ecosystem.attach.example, /data-kt-|v-motion|useKineto/, `${id}.attach.example must show a Kineto attachment`);
  // Every activation attribute in the example must belong to a real module.
  for (const match of ecosystem.attach.example.matchAll(/data-kt-([a-z-]+)(?==|\s|>)/g)) {
    const attribute = `data-kt-${match[1]}`;
    const known = features.modules.some((module) => module.attribute === attribute)
      || features.modules.some((module) => module.publicOptions.some((option) => `data-kt-${option.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}` === attribute));
    assert.ok(known, `${id}.attach.example uses unknown attribute ${attribute}`);
  }
  if (ecosystem.registry) {
    assert.match(ecosystem.registry.url, /^https:\/\/kineto\.dongri\.me\/r\/\{name\}\.json$/, `${id}.registry.url must point at the deployed registry`);
    assert.ok(ecosystem.registry.componentsJson.includes(ecosystem.registry.namespace), `${id}.registry.componentsJson must configure the namespace`);
  }
  // Example pages and the QA scripts that prove them must exist in the repo.
  for (const example of ecosystem.examples || []) {
    assert.ok(fs.existsSync(path.join(root, example.path)), `${id}.examples: ${example.path} is missing`);
    if (example.test) assert.ok(fs.existsSync(path.join(root, example.test)), `${id}.examples: ${example.test} is missing`);
  }
}

// 3. Intents: unique ids, valid recipes, valid Figma patterns, valid guidance.
const intentIds = new Set();
let recipeCount = 0;
for (const intent of integrations.intents) {
  assert.ok(!intentIds.has(intent.id), `duplicate intent ${intent.id}`);
  intentIds.add(intent.id);
  assert.ok(intent.title && intent.ko && intent.keywords.length, `${intent.id} needs title/ko/keywords`);
  assert.ok([null, 'prefer-library', 'enhance'].includes(intent.provideWhenLibraryHas), `${intent.id}.provideWhenLibraryHas`);
  for (const pattern of intent.figma) assert.doesNotThrow(() => new RegExp(pattern, 'i'), `${intent.id} figma pattern /${pattern}/ must compile`);
  for (const [ecosystemId] of Object.entries(intent.libraryEquivalents || {})) {
    assert.ok(ecosystemIds.includes(ecosystemId), `${intent.id}.libraryEquivalents names unknown ecosystem ${ecosystemId}`);
  }
  if (intent.provideWhenLibraryHas) {
    assert.ok(Object.keys(intent.libraryEquivalents || {}).length, `${intent.id} says the library may provide it but lists no equivalents`);
  }
  for (const recipe of intent.recipes) {
    recipeCount += 1;
    assert.ok(recipe.why, `${intent.id}/${recipe.module} needs a "why"`);
    if (isCorePrimitive(recipe.module)) {
      assert.equal(recipe.variant, undefined, `${intent.id}/${recipe.module}: core primitives have no variant`);
      continue;
    }
    const module = findModule(features, recipe.module);
    assert.ok(module, `${intent.id} names unknown module ${recipe.module}`);
    if (recipe.variant) assert.ok(module.variants.includes(recipe.variant), `${intent.id}: ${recipe.module} has no variant ${recipe.variant}`);
    const result = validateOptions(features, recipe.module, recipe.options || {});
    assert.deepEqual(result.unknown, [], `${intent.id}: ${recipe.module} options ${result.unknown.join(', ')} are not public`);
    // Snippets derived from the recipe must only use contract attributes.
    const attributes = attributeList(recipe, features);
    for (const match of attributes.matchAll(/data-kt-([a-z0-9-]+)/g)) {
      const attribute = `data-kt-${match[1]}`;
      const isActivation = attribute === module.attribute;
      const isOption = module.publicOptions.some((option) => `data-kt-${option.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}` === attribute);
      assert.ok(isActivation || isOption, `${intent.id}: generated attribute ${attribute} is not part of ${recipe.module}`);
    }
    for (const snippet of [htmlSnippet(recipe, features), reactSnippet(recipe, features), vueSnippet(recipe, features), jsSnippet(recipe, features)]) {
      assert.ok(snippet.includes(module.attribute) || snippet.includes(`'${recipe.module}'`), `${intent.id}: snippet must reference ${recipe.module}`);
    }
    if (recipe.variant) assert.match(jsSnippet(recipe, features), new RegExp(`${variantKey(module)}: "${recipe.variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`), `${intent.id}: JS snippet folds the variant under ${variantKey(module)}`);
  }
}
assert.ok(integrations.intents.length >= 20, `expected a broad intent map, got ${integrations.intents.length}`);

// 4. Coverage: the map must touch most of the public modules so an AI tool
//    can find a home for what the library ships.
const used = modulesInMap(integrations);
const uncovered = features.modules.map((module) => module.name).filter((name) => !used.has(name));
assert.ok(uncovered.length <= 4, `too many public modules without an intent: ${uncovered.join(', ')}`);

// 5. Figma hints reference real intents.
for (const rule of integrations.figmaHints.nodeTypeRules) assert.ok(intentIds.has(rule.intent), `figma rule → unknown intent ${rule.intent}`);
assert.ok(integrations.figmaHints.workflow.length >= 3);

// 6. Guidance and suggestion helpers behave.
const toast = integrations.intents.find((intent) => intent.id === 'toast');
assert.equal(guidanceFor(toast, 'shadcn', integrations).decision, 'prefer-library');
assert.equal(guidanceFor(toast, 'vanilla', integrations).decision, 'kineto');
const dialog = integrations.intents.find((intent) => intent.id === 'dialog-enter-exit');
assert.equal(guidanceFor(dialog, 'bootstrap', integrations).decision, 'enhance');
assert.equal(suggest(integrations, 'Hero / KV title')[0].intent.id, 'hero-headline');
assert.equal(suggest(integrations, 'Product card thumbnail')[0].intent.id, 'card-hover');
assert.equal(suggest(integrations, '실시간 순위 티커')[0].intent.id, 'marquee-ticker');
assert.equal(suggest(integrations, 'Skeleton image placeholder')[0].intent.id, 'image-loading');
assert.deepEqual(suggest(integrations, ''), []);
assert.equal(validateOptions(features, 'reveal', { preset: 'nope' }).variantOk, false);
assert.deepEqual(validateOptions(features, 'reveal', { bogus: 1 }).unknown, ['bogus']);
assert.equal(validateOptions(features, 'nothing', {}).ok, false);

// 7. Generated artefacts are current (docs/integrations, ai/, site/llms.txt,
//    and the contract copies inside packages/kineto-mcp).
const { renderAll } = await import('../scripts/generate-integrations.mjs');
const { renderMcpPackage } = await import('../scripts/build-mcp.mjs');
const contracts = { features, integrations, pkg };
const stale = [];
for (const [file, content] of Object.entries({ ...renderAll(contracts), ...renderMcpPackage(contracts) })) {
  const target = path.join(root, file);
  if (!fs.existsSync(target)) { stale.push(`${file} (missing)`); continue; }
  if (fs.readFileSync(target, 'utf8') !== content) stale.push(file);
}
assert.deepEqual(stale, [], `generated integration artefacts are stale — run npm run integrations:build:\n  - ${stale.join('\n  - ')}`);

// 8. No documentation still imports the unscoped package name.
for (const file of ['README.md', 'AI-PROMPT-GUIDE.md', 'examples/react/README.md', 'examples/vue/README.md', 'examples/jquery/README.md', 'docs/getting-started.md']) {
  assert.doesNotMatch(read(file), /from ['"]kineto(\/|['"])|npm install kineto\b|import ['"]kineto\//, `${file} still references the unscoped "kineto" package`);
}

console.log(`integrations-contract OK — ${ecosystemIds.length} ecosystems, ${integrations.intents.length} intents, ${recipeCount} recipes validated against ${features.moduleCount} modules; ${used.size} modules covered (${uncovered.length} without an intent: ${uncovered.join(', ') || 'none'}); generated docs, AI rules, llms.txt and the MCP contract copies are current.`);
