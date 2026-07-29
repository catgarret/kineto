// Derive, per module and per variant, which public options that variant actually
// reads — and write the result into kineto.features.json as `variantOptions`.
//
// WHY THIS EXISTS
// The settings drawer used to gate options through a hand-written `WHEN` table in
// demo/playground.js: one predicate per option, per module, maintained by hand.
// That table is why a new variant showed controls it ignores (Glitch's
// rgb-slice-burst offered `sliceCount`, `duration` and `trigger`, none of which it
// reads) and why fixing one module never fixed the rest. A predicate table cannot
// keep up with the library.
//
// HOW IT WORKS
// Nearly every module funnels its variant into one local variable assigned from
// the options — `const type = opts.preset || opts.type || 'rgb'`. Branches then
// compare that variable against string literals. So:
//   1. find the variant variable (assigned from opts.* with a string fallback),
//   2. walk the AST collecting `opts.X` reads, tracking which variant-comparison
//      branches enclose each read,
//   3. a read inside `if (type === 'crt')` belongs to `crt`; a read outside every
//      variant branch is COMMON and belongs to all variants.
// Options a variant never reads are omitted, and the drawer hides them.
//
// Conservative by construction: anything the analysis cannot attribute lands in
// the common set, so the failure mode is "an option stays visible", never "a
// usable option disappears".
//
//   node scripts/derive-variant-options.mjs           # rewrite the contract
//   node scripts/derive-variant-options.mjs --check    # fail if out of date
//   node scripts/derive-variant-options.mjs --report   # print, write nothing
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractPath = path.join(root, 'kineto.features.json');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

// The OPTION keys that carry a variant. Detection keys off these rather than off
// the local variable's name, because modules do not agree on the name: Lazy uses
// `const requested = opts.effect || opts.preset || 'fade'`, which a name-based
// rule (`effect`/`preset`/`type`/...) would miss entirely.
const VARIANT_OPTIONS = new Set(['type', 'preset', 'effect', 'variant', 'mode', 'style', 'kind']);

function walk(node, visit, parents = []) {
  if (!node || typeof node.type !== 'string') return;
  visit(node, parents);
  const next = [...parents, node];
  for (const key of Object.keys(node)) {
    if (key === 'type' || key === 'start' || key === 'end' || key === 'loc') continue;
    const value = node[key];
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit, next));
    else if (value && typeof value.type === 'string') walk(value, visit, next);
  }
}

/** Variables assigned from `opts.something` with a string literal fallback. */
function findVariantVariables(ast, declaredVariants) {
  const found = new Map(); // name -> Set of default literals
  walk(ast, (node) => {
    if (node.type !== 'VariableDeclarator' || node.id?.type !== 'Identifier') return;
    if (!node.init) return;
    let readsOpts = false;
    let literal = null;
    walk(node.init, (inner) => {
      if (inner.type === 'MemberExpression' && inner.object?.name === 'opts') {
        const key = inner.property?.name || (inner.property?.type === 'Literal' ? inner.property.value : null);
        if (key && VARIANT_OPTIONS.has(key)) readsOpts = true;
      }
      if (inner.type === 'Literal' && typeof inner.value === 'string') literal = inner.value;
    });
    if (readsOpts && literal != null) {
      if (!found.has(node.id.name)) found.set(node.id.name, new Set());
      found.get(node.id.name).add(literal);
    }
  });
  // Variants are often re-derived from an earlier variant variable rather than
  // from opts: Glitch does `const preset = type === 'digital' ? 'noise' : type`,
  // and every branch then tests `preset`, not `type`. Without following that hop
  // none of Glitch's branches were recognised and every option looked common.
  // Iterate to a fixpoint so chains of any length resolve.
  for (let pass = 0; pass < 4; pass += 1) {
    let added = false;
    walk(ast, (node) => {
      if (node.type !== 'VariableDeclarator' || node.id?.type !== 'Identifier' || !node.init) return;
      if (found.has(node.id.name)) return;
      let referencesVariant = false;
      let literal = null;
      walk(node.init, (inner) => {
        if (inner.type === 'Identifier' && found.has(inner.name)) referencesVariant = true;
        if (inner.type === 'Literal' && typeof inner.value === 'string') literal = inner.value;
      });
      if (referencesVariant) {
        found.set(node.id.name, new Set(literal == null ? [] : [literal]));
        added = true;
      }
    });
    if (!added) break;
  }
  // `opts.mode` is often a secondary behaviour knob rather than the module
  // variant (for example a spinner's arc mode). Keep a candidate only when its
  // comparisons overlap the variants declared by the feature contract. This
  // prevents a secondary mode from claiming options that belong to the real
  // preset and hiding valid controls in the drawer.
  const declared = new Set(declaredVariants);
  const compared = new Map();
  const note = (name, value) => {
    if (!found.has(name) || typeof value !== 'string') return;
    if (!compared.has(name)) compared.set(name, new Set());
    compared.get(name).add(value);
  };
  walk(ast, (node) => {
    if (node.type === 'BinaryExpression' && ['===', '==', '!==', '!='].includes(node.operator)) {
      const id = node.left?.type === 'Identifier' ? node.left : (node.right?.type === 'Identifier' ? node.right : null);
      const lit = node.left?.type === 'Literal' ? node.left : (node.right?.type === 'Literal' ? node.right : null);
      if (id && lit) note(id.name, lit.value);
    }
    if (node.type === 'SwitchStatement' && node.discriminant?.type === 'Identifier') {
      node.cases.forEach((kase) => note(node.discriminant.name, kase.test?.value));
    }
    if (node.type === 'CallExpression' && node.callee?.type === 'MemberExpression'
      && node.callee.property?.name === 'includes'
      && node.callee.object?.type === 'ArrayExpression'
      && node.arguments?.[0]?.type === 'Identifier') {
      node.callee.object.elements.forEach((element) => note(node.arguments[0].name, element?.value));
    }
  });
  for (const name of [...found.keys()]) {
    const labels = new Set([...(found.get(name) || []), ...(compared.get(name) || [])]);
    if (![...labels].some((label) => declared.has(label))) found.delete(name);
  }
  return found;
}

/**
 * Variant labels a condition tests for. `preset === 'crt' || preset === 'vcr'`
 * yields ['crt','vcr']; anything else yields null so the branch is treated as
 * non-variant (its reads stay common).
 */
function variantsInTest(test, names) {
  const labels = [];
  let onlyVariantChecks = true;
  const visit = (node) => {
    if (!node) return;
    if (node.type === 'LogicalExpression' && (node.operator === '||' || node.operator === '&&')) {
      visit(node.left); visit(node.right); return;
    }
    if (node.type === 'BinaryExpression' && (node.operator === '===' || node.operator === '==')) {
      const [a, b] = [node.left, node.right];
      const id = a.type === 'Identifier' ? a : (b.type === 'Identifier' ? b : null);
      const lit = a.type === 'Literal' ? a : (b.type === 'Literal' ? b : null);
      if (id && lit && names.has(id.name) && typeof lit.value === 'string') { labels.push(lit.value); return; }
      onlyVariantChecks = false; return;
    }
    // `['a','b'].includes(preset)`
    if (node.type === 'CallExpression' && node.callee?.type === 'MemberExpression'
      && node.callee.property?.name === 'includes'
      && node.callee.object?.type === 'ArrayExpression'
      && node.arguments?.[0]?.type === 'Identifier' && names.has(node.arguments[0].name)) {
      for (const element of node.callee.object.elements) {
        if (element?.type === 'Literal' && typeof element.value === 'string') labels.push(element.value);
      }
      return;
    }
    onlyVariantChecks = false;
  };
  visit(test);
  return (onlyVariantChecks && labels.length) ? labels : null;
}

function analyse(source, publicOptions, declaredVariants) {
  const ast = acorn.parse(source, { ecmaVersion: 2023, sourceType: 'module' });
  const names = new Set(findVariantVariables(ast, declaredVariants).keys());
  if (!names.size) return null;
  const allowed = new Set(publicOptions);

  // Map each variant-gated node range to the labels that gate it.
  /** @type {Array<{start:number,end:number,labels:string[],negated:boolean}>} */
  const regions = [];
  walk(ast, (node) => {
    if (node.type === 'IfStatement') {
      const labels = variantsInTest(node.test, names);
      if (labels) {
        regions.push({ start: node.consequent.start, end: node.consequent.end, labels, negated: false });
        // The `else` branch is everything BUT those labels — treat as common so
        // nothing is lost.
      }
    }
    if (node.type === 'SwitchStatement' && node.discriminant?.type === 'Identifier' && names.has(node.discriminant.name)) {
      for (const kase of node.cases) {
        if (kase.test?.type === 'Literal' && typeof kase.test.value === 'string') {
          regions.push({ start: kase.start, end: kase.end, labels: [kase.test.value], negated: false });
        }
      }
    }
    // `preset === 'x' ? a : b` — attribute only the consequent.
    if (node.type === 'ConditionalExpression') {
      const labels = variantsInTest(node.test, names);
      if (labels) regions.push({ start: node.consequent.start, end: node.consequent.end, labels, negated: false });
    }
  });

  const innermostRegion = (node) => {
    const enclosing = regions.filter((r) => node.start >= r.start && node.end <= r.end);
    if (!enclosing.length) return null;
    // Innermost region wins: a read inside a nested variant branch belongs there.
    return enclosing.reduce((a, b) => ((b.end - b.start) < (a.end - a.start) ? b : a));
  };

  // Many modules read every option into a local at the top of the factory and
  // then branch on the variant using those locals — `const channelOffset =
  // Number(opts.channelOffset ?? 6)` followed by `if (preset === 'rgb-slice-burst')
  // { ... channelOffset ... }`. Read position alone puts all of those in the
  // common set, which is why Glitch and Lazy first came out as "no difference".
  // So map single-option aliases and attribute them by where the ALIAS is used.
  const aliasToOption = new Map();
  walk(ast, (node) => {
    if (node.type !== 'VariableDeclarator' || node.id?.type !== 'Identifier' || !node.init) return;
    if (names.has(node.id.name)) return;
    const keys = new Set();
    walk(node.init, (inner) => {
      if (inner.type === 'MemberExpression' && inner.object?.name === 'opts') {
        const key = inner.property?.name || (inner.property?.type === 'Literal' ? inner.property.value : null);
        if (key && allowed.has(key)) keys.add(key);
      }
    });
    // Only unambiguous aliases: an initializer touching two options tells us
    // nothing about which one a later use refers to.
    if (keys.size === 1 && !aliasToOption.has(node.id.name)) aliasToOption.set(node.id.name, [...keys][0]);
  });
  // An alias declared INSIDE a variant branch is already attributed by position;
  // aliases we follow are the top-level ones.
  const aliasDeclaredIn = new Map();
  walk(ast, (node) => {
    if (node.type !== 'VariableDeclarator' || node.id?.type !== 'Identifier') return;
    if (aliasToOption.has(node.id.name)) aliasDeclaredIn.set(node.id.name, innermostRegion(node));
  });

  const common = new Set();
  /** @type {Map<string, Set<string>>} */
  const perVariant = new Map();
  const attribute = (key, region) => {
    if (!region) { common.add(key); return; }
    for (const label of region.labels) {
      if (!perVariant.has(label)) perVariant.set(label, new Set());
      perVariant.get(label).add(key);
    }
  };

  // Pass 1: direct `opts.X` reads, attributed by position.
  const directCommon = new Set();
  walk(ast, (node) => {
    if (node.type !== 'MemberExpression' || node.object?.name !== 'opts') return;
    const key = node.property?.name || (node.property?.type === 'Literal' ? node.property.value : null);
    if (!key || !allowed.has(key)) return;
    const region = innermostRegion(node);
    if (region) attribute(key, region);
    else directCommon.add(key);
  });

  // Pass 2: for options whose only direct read is top-level, look at where their
  // alias is USED. If every use sits inside variant branches, the option belongs
  // to those variants; if any use is unattributed, it stays common.
  const aliasUses = new Map(); // option -> {regions:Set, loose:boolean}
  walk(ast, (node, parents) => {
    if (node.type !== 'Identifier' || !aliasToOption.has(node.name)) return;
    const parent = parents[parents.length - 1];
    // Skip the declaration itself and property keys.
    if (parent?.type === 'VariableDeclarator' && parent.id === node) return;
    if (parent?.type === 'MemberExpression' && parent.property === node && !parent.computed) return;
    if (parent?.type === 'Property' && parent.key === node && !parent.computed) return;
    const option = aliasToOption.get(node.name);
    if (!directCommon.has(option)) return;
    const declaredRegion = aliasDeclaredIn.get(node.name);
    if (declaredRegion) return; // already attributed by its declaration site
    const entry = aliasUses.get(option) || { regions: new Set(), loose: false };
    const region = innermostRegion(node);
    if (region) region.labels.forEach((l) => entry.regions.add(l));
    else entry.loose = true;
    aliasUses.set(option, entry);
  });

  for (const key of directCommon) {
    const use = aliasUses.get(key);
    if (use && !use.loose && use.regions.size) {
      for (const label of use.regions) {
        if (!perVariant.has(label)) perVariant.set(label, new Set());
        perVariant.get(label).add(key);
      }
    } else {
      common.add(key);
    }
  }
  return { common, perVariant };
}

// ── Explicit pins ────────────────────────────────────────────────────────────
// The AST analysis is conservative on purpose: an option read at the top of the
// factory and consumed inside a shared helper cannot be attributed to a branch,
// so it stays in the common set and the drawer keeps showing it. That is the right
// default (never hide a working control) but it leaves real dead controls behind —
// Lazy showed `steps` on all 13 variants, Slider showed `align` on coverflow where
// the layout is always centred, and the terminal frame presets showed `direction`
// and `transformOrigin` which they never read.
//
// A pin says "this option belongs ONLY to these variants". It is applied after
// derivation and can create a table for a module the analysis found no difference
// in. Pins live here, next to the analysis they correct, and tests/variant-options.mjs
// validates every name.
const PINS = {
  lazy: {
    // The pixelate mosaic ladder. `steps` / `stepCount` / `pixelStart` / `pixelEnd`
    // / `pixelStepCount` are read once up front and handed to the shared stepper.
    steps: ['pixelate'], stepCount: ['pixelate'], pixelStart: ['pixelate'],
    pixelEnd: ['pixelate'], pixelStepCount: ['pixelate'], stepDuration: ['pixelate'],
    // Wave geometry is meaningful only for the wave preset. Grain shares the
    // renderer internally, but exposing these controls there is a dead UI.
    waveAmplitude: ['wave'], waveFrequency: ['wave'], waveSpeed: ['wave'],
    waveSliceHeight: ['wave'], grain: ['grain'],
    // Grain texture controls.
    noise: ['grain', 'dissolve', 'print'], noiseWidth: ['grain', 'dissolve', 'print'],
    noiseHeight: ['grain', 'dissolve', 'print'], noiseContrast: ['grain', 'dissolve', 'print'],
    noiseBlend: ['grain', 'dissolve', 'print'], noiseFps: ['grain', 'dissolve', 'print']
  },
  pageReveal: {
    // `play()` reads `ease` (and `delay`/`duration`) once from the factory
    // closure, so no variant branch contains the read and the analysis dropped
    // `ease` from all 16 variants — the control disappeared for every effect.
    // The public option is `ease`, not `easing`; pins are validated against
    // publicOptions, so a wrong name is silently ignored.
    // Listing every variant marks it common again.
    ease: ['curtain', 'split', 'circle', 'wipe', 'blinds', 'diagonal', 'checker',
      'strips', 'shutter', 'columns', 'fade', 'zoom', 'iris', 'flash',
      'center-slit', 'data-mosaic']
  },
  slider: {
    // coverflow always centres its active slide, so `align` is inert there.
    align: ['slide', 'fade', 'dissolve', 'wipe', 'flip', 'cube', 'cards', 'creative'],
    // Arc geometry belongs to the radial effect only.
    radius: ['radial'], step: ['radial'], activeAngle: ['radial'], position: ['radial'],
    controls: ['radial'],
    // 3D depth is coverflow's own.
    depth: ['coverflow'], rotate: ['coverflow'],
    activeShadow: ['coverflow'], activeShadowOpacity: ['coverflow']
  }
};

function applyPins(module) {
  const pins = PINS[module.name];
  if (!pins) return false;
  const table = module.variantOptions
    || Object.fromEntries(module.variants.map((v) => [v, [...module.publicOptions]]));
  let touched = false;
  for (const [option, allowed] of Object.entries(pins)) {
    if (!module.publicOptions.includes(option)) continue;
    for (const variant of module.variants) {
      const list = table[variant];
      if (!list) continue;
      const keep = allowed.includes(variant);
      const at = list.indexOf(option);
      if (!keep && at >= 0) { list.splice(at, 1); touched = true; }
      // Pins ADD as well as remove. `easing` never appears in any pageReveal
      // branch (play() reads it once from the closure), so a remove-only pin
      // could not put the control back — it was missing from all 16 variants.
      if (keep && at < 0) { list.push(option); touched = true; }
    }
  }
  if (touched) module.variantOptions = Object.fromEntries(
    Object.entries(table).map(([v, list]) => [v, [...list].sort()])
  );
  return touched;
}

const report = [];
let changed = 0;
for (const module of contract.modules) {
  const file = path.join(root, 'src/modules', `${module.name}.js`);
  if (!fs.existsSync(file)) continue;
  const result = analyse(fs.readFileSync(file, 'utf8'), module.publicOptions, module.variants);
  if (!result) continue;
  const { common, perVariant } = result;
  // Only worth declaring when variants genuinely differ. If every variant would
  // get the same list, leaving it out keeps the contract honest and small.
  const declared = {};
  let differs = false;
  for (const variant of module.variants) {
    const own = perVariant.get(variant);
    const set = new Set(common);
    if (own) own.forEach((k) => set.add(k));
    // Options another variant claims exclusively must not show up here.
    for (const [label, keys] of perVariant) {
      if (label === variant) continue;
      for (const key of keys) if (!common.has(key) && !(own && own.has(key))) { set.delete(key); differs = true; }
    }
    declared[variant] = [...set].sort();
  }
  // A table whose variants all end up identical carries no information: it would
  // make the drawer do a lookup and then show everything anyway.
  const distinct = new Set(Object.values(declared).map((list) => [...list].sort().join(',')));
  if (!differs || distinct.size === 1) {
    if (module.variantOptions) { delete module.variantOptions; changed += 1; }
    // A pin can still carve a table out of an otherwise uniform module.
    if (applyPins(module)) { changed += 1; report.push([module.name, 'pinned only']); continue; }
    report.push([module.name, 'variants read the same options — not declared']);
    continue;
  }
  const before = JSON.stringify(module.variantOptions || null);
  module.variantOptions = declared;
  applyPins(module);
  if (before !== JSON.stringify(declared)) changed += 1;
  const sizes = module.variants.map((v) => `${v}:${declared[v].length}`).join(' ');
  report.push([module.name, `${module.publicOptions.length} public -> ${sizes}`]);
}

// Modules with no detectable variant variable still get their pins.
for (const module of contract.modules) {
  if (PINS[module.name] && !module.variantOptions && applyPins(module)) {
    changed += 1;
    report.push([module.name, 'pinned only (no variant variable found)']);
  }
}

if (process.argv.includes('--report')) {
  report.forEach(([name, line]) => console.log(`  ${name.padEnd(18)} ${line}`));
  console.log(`\n${report.length} module(s) analysed, ${changed} would change.`);
} else if (process.argv.includes('--check')) {
  const onDisk = fs.readFileSync(contractPath, 'utf8');
  const next = `${JSON.stringify(contract, null, 2)}\n`;
  if (onDisk !== next) {
    console.error('kineto.features.json variantOptions is stale. Run: node scripts/derive-variant-options.mjs');
    process.exit(1);
  }
  console.log(`derive-variant-options --check OK — ${report.length} modules, variantOptions current.`);
} else {
  fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  console.log(`Derived variantOptions for ${report.length} module(s) (${changed} changed).`);
  report.forEach(([name, line]) => console.log(`  ${name.padEnd(18)} ${line}`));
}
