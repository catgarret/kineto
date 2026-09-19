// Tool implementations — pure functions over the loaded contracts.
//
// The MCP layer (server.mjs) only validates input and forwards it here, so
// every answer can be unit-tested without a transport, and the same logic
// could back a CLI or an HTTP API later. Nothing in this file touches the
// file system, the network or the DOM.
import {
  attributeList, findModule, guidanceFor, isCorePrimitive, modulesInMap,
  snippetFor, suggest, validateOptions, variantKey
} from './lib.mjs';

export const FRAMEWORKS = ['html', 'react', 'vue', 'js'];

/** Levenshtein distance — small helper so unknown option names get a "did you mean". */
function distance(a, b) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return rows[a.length][b.length];
}

function closest(candidate, options) {
  const lower = candidate.toLowerCase();
  return options
    .map((option) => ({ option, score: distance(lower, option.toLowerCase()) }))
    .sort((a, b) => a.score - b.score)
    .filter((entry, index) => index < 3 && entry.score <= Math.max(2, Math.floor(candidate.length / 3)))
    .map((entry) => entry.option);
}

function moduleUrl(contracts, moduleName) {
  const doc = contracts.meta.moduleDocs?.[moduleName];
  return doc ? `${contracts.meta.repository}/blob/main/${doc}` : `${contracts.meta.repository}/blob/main/docs/module-reference.md`;
}

function moduleSummary(contracts, module, usage) {
  const metadata = contracts.metadata.modules?.[module.name] || {};
  return {
    name: module.name,
    attribute: module.attribute,
    defaultVariant: module.defaultVariant,
    variants: module.variants,
    accessibility: metadata.accessibility || null,
    performance: metadata.performance || null,
    reducedMotion: metadata.reducedMotion || null,
    intents: [...(usage.get(module.name) || [])],
    docs: moduleUrl(contracts, module.name)
  };
}

/** kineto_list_modules — every module, optionally filtered by a free-text query. */
export function listModules(contracts, { query = '' } = {}) {
  const usage = modulesInMap(contracts.integrations);
  const needle = query.trim().toLowerCase();
  const modules = contracts.features.modules
    .map((module) => moduleSummary(contracts, module, usage))
    .filter((entry) => !needle || [entry.name, entry.attribute, ...entry.variants, ...entry.intents].some((value) => value.toLowerCase().includes(needle)));
  return { kinetoVersion: contracts.meta.kinetoVersion, count: modules.length, modules };
}

/** kineto_module — the full public contract of one module. */
export function describeModule(contracts, { name }) {
  const module = findModule(contracts.features, name);
  if (!module) {
    return { error: `unknown module "${name}"`, suggestions: closest(name, contracts.features.modules.map((entry) => entry.name)) };
  }
  const usage = modulesInMap(contracts.integrations);
  const key = variantKey(module);
  const recipe = { module: module.name, variant: module.defaultVariant };
  return {
    ...moduleSummary(contracts, module, usage),
    variantKey: key,
    publicOptions: module.publicOptions,
    optionDefaults: module.optionDefaults || {},
    attributeGrammar: `${module.attribute}="<variant>" plus data-kt-<option-name> for each option (camelCase → dashed, e.g. data-kt-glare-opacity)`,
    jsApi: `Kineto.create('${module.name}', element, { ${key}: '${module.defaultVariant}', …options })`,
    snippets: Object.fromEntries(FRAMEWORKS.map((framework) => [framework, snippetFor(recipe, contracts.features, framework)]))
  };
}

function renderRecipe(contracts, recipe, framework, component) {
  const primitive = isCorePrimitive(recipe.module);
  return {
    module: recipe.module,
    variant: recipe.variant || null,
    options: recipe.options || {},
    why: recipe.why,
    attributes: primitive ? null : attributeList(recipe, contracts.features),
    snippet: snippetFor(recipe, contracts.features, framework, component ? { component } : {}),
    docs: primitive ? `${contracts.meta.repository}/blob/main/docs/presence-core-rfc.md` : moduleUrl(contracts, recipe.module)
  };
}

function ecosystemNotes(contracts, ecosystemId) {
  const ecosystem = ecosystemId ? contracts.integrations.ecosystems[ecosystemId] : null;
  if (!ecosystem) return null;
  return { title: ecosystem.title, attach: ecosystem.attach.summary, conflicts: ecosystem.conflicts || [], notes: ecosystem.notes };
}

/** kineto_suggest — rank intents for a description, component or Figma layer name. */
export function suggestIntents(contracts, { query, ecosystem = null, framework = 'html', component = null, limit = 5 }) {
  const ranked = suggest(contracts.integrations, query, { limit });
  const results = ranked.map(({ intent, score, reasons }) => {
    const guidance = ecosystem ? guidanceFor(intent, ecosystem, contracts.integrations) : { decision: 'kineto', equivalent: null };
    return {
      intent: intent.id,
      title: intent.title,
      ko: intent.ko,
      score,
      matched: reasons,
      decision: guidance.decision,
      libraryEquivalent: guidance.equivalent,
      notes: intent.notes || [],
      recipes: intent.recipes.map((recipe) => renderRecipe(contracts, recipe, framework, component))
    };
  });
  return {
    query,
    ecosystem: ecosystem || null,
    framework,
    ecosystemNotes: ecosystemNotes(contracts, ecosystem),
    results,
    hint: results.length ? undefined : 'No intent matched. Try a design word (hero, card, KPI, loading, toast, dialog, scroll, marquee, cursor …) or call kineto_list_modules.'
  };
}

/** kineto_snippet — markup/code for one module + variant + options, validated first. */
export function renderSnippet(contracts, { module: moduleName, variant = null, options = {}, framework = 'html', component = null }) {
  if (isCorePrimitive(moduleName)) {
    const recipe = { module: moduleName, variant: null, options };
    return { module: moduleName, framework, validation: { ok: true, unknown: [], variantOk: true, variants: [] }, ...renderRecipe(contracts, recipe, framework, component) };
  }
  const module = findModule(contracts.features, moduleName);
  if (!module) return { error: `unknown module "${moduleName}"`, suggestions: closest(moduleName, contracts.features.modules.map((entry) => entry.name)) };
  const key = variantKey(module);
  const { [key]: variantFromOptions, ...rest } = options;
  const chosen = variant || variantFromOptions || module.defaultVariant;
  const validation = validate(contracts, { module: moduleName, options: { ...rest, [key]: chosen } });
  const recipe = { module: moduleName, variant: String(chosen), options: rest };
  return { module: moduleName, framework, validation, ...renderRecipe(contracts, recipe, framework, component) };
}

/** kineto_validate_options — check an options object against a module's public contract. */
export function validate(contracts, { module: moduleName, options = {} }) {
  const result = validateOptions(contracts.features, moduleName, options);
  if (result.error) return { ...result, suggestions: closest(moduleName, contracts.features.modules.map((entry) => entry.name)) };
  const module = findModule(contracts.features, moduleName);
  return {
    ...result,
    module: moduleName,
    attribute: module.attribute,
    didYouMean: Object.fromEntries(result.unknown.map((key) => [key, closest(key, module.publicOptions)])),
    variantHint: result.variantOk ? undefined : `${result.variantKey} must be one of: ${result.variants.join(', ')}`,
    attributeForm: Object.fromEntries(Object.keys(options).filter((key) => module.publicOptions.includes(key)).map((key) => [key, `data-kt-${key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`]))
  };
}

/** kineto_ecosystem — how to attach Kineto next to one UI library / design system. */
export function describeEcosystem(contracts, { id }) {
  const ecosystem = contracts.integrations.ecosystems[id];
  if (!ecosystem) return { error: `unknown ecosystem "${id}"`, ecosystems: Object.keys(contracts.integrations.ecosystems) };
  const intents = contracts.integrations.intents.map((intent) => ({ intent: intent.id, ...guidanceFor(intent, id, contracts.integrations) }));
  return {
    id,
    ...ecosystem,
    setup: contracts.integrations.setup,
    decisions: intents,
    docs: `${contracts.meta.repository}/blob/main/docs/integrations/${id}.md`
  };
}

/**
 * kineto_figma_layers — map Figma layers (name + optional type/fontSize/
 * imageFill/text from the Figma MCP) to intents and ready attribute lists.
 * This is the "read the design, pick the motion" step of a Figma → code flow:
 * layer names are matched against each intent's `figma` patterns first and
 * the node facts below act as the tiebreaker, mirroring figmaHints.nodeTypeRules.
 */
function intentFromNodeFacts(layer) {
  const type = String(layer.type || '').toUpperCase();
  const text = String(layer.text || '');
  if (layer.imageFill === true || type === 'IMAGE') return 'image-loading';
  if (type === 'TEXT' && text && text.replace(/[\s,.%$₩€£+-]/g, '').length && /^[\d\s,.%$₩€£+-]+$/.test(text)) return 'kpi-number';
  if (type === 'TEXT' && Number(layer.fontSize) >= 40) return 'hero-headline';
  if (type === 'INSTANCE' && /button|cta/i.test(layer.name)) return 'cta-button';
  return null;
}

// Figma's automatic layer names ("Frame 13", "Rectangle 4", "Group 2") carry
// no design meaning; only the node facts decide for those.
const AUTO_LAYER_NAME = /^(?:frame|group|rectangle|ellipse|polygon|star|vector|line|text|image|component|instance|slice|section|boolean)\s*\d*$/i;

export function mapFigmaLayers(contracts, { layers, ecosystem = null, framework = 'html' }) {
  const byId = new Map(contracts.integrations.intents.map((intent) => [intent.id, intent]));
  const mapped = layers.map((layer) => {
    const [best] = AUTO_LAYER_NAME.test(layer.name.trim()) ? [] : suggest(contracts.integrations, layer.name, { limit: 1 });
    const factIntent = intentFromNodeFacts(layer);
    const intent = best?.intent || (factIntent ? byId.get(factIntent) : null);
    if (!intent) return { layer: layer.name, type: layer.type || null, intent: null, reason: 'no intent matched — keep the layer static or ask the designer' };
    const guidance = ecosystem ? guidanceFor(intent, ecosystem, contracts.integrations) : { decision: 'kineto', equivalent: null };
    const [recipe] = intent.recipes;
    return {
      layer: layer.name,
      type: layer.type || null,
      intent: intent.id,
      title: intent.title,
      matched: best ? best.reasons : [`node facts → ${factIntent}`],
      decision: guidance.decision,
      libraryEquivalent: guidance.equivalent,
      recipe: renderRecipe(contracts, recipe, framework, null)
    };
  });
  return { ecosystem, framework, workflow: contracts.integrations.figmaHints.workflow, nodeTypeRules: contracts.integrations.figmaHints.nodeTypeRules, layers: mapped };
}
