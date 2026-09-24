// Canvas Effect — the effect registry.
//
// An effect is a small object of plain functions (docs/modules/canvas-effect.md):
//
//   {
//     context: '2d' | 'webgl' | 'webgl2',   // which drawing context it needs
//     options: { color: '#ff5b1c', … },     // every option it reads, with defaults
//     setup(api)   → state (optional),       // once, after the canvas exists
//     resize(api),                           // after every backing-store resize
//     frame(api)   → false to rest,          // every animation frame
//     destroy(api)                           // once, when the instance goes away
//   }
//
// or, for a fragment shader, `{ fragment: '…GLSL…', options, uniforms(api) }` —
// the host then owns the WebGL side (see shader.js).
//
// SECURITY: a definition is CODE, so only the page's own scripts can register
// one. Markup can only NAME a registered effect (`data-kt-canvas-effect="grid"`);
// nothing read from an attribute is ever compiled, evaluated or fetched, so
// markup from a CMS or a user cannot run anything through this module.

const registry = new Map();
// Elements that asked for an effect before it was defined (a definition script
// that loads after Kineto has scanned the page). Defining the effect starts them.
const waiting = new Map(); // name → Map(element → start())

const NAME_PATTERN = /^[a-z][a-z0-9-]{0,63}$/;
const CONTEXTS = Object.freeze(['2d', 'webgl', 'webgl2']);
const HOOKS = Object.freeze(['setup', 'resize', 'frame', 'destroy', 'uniforms']);

function fail(label, message) {
  throw new TypeError(`[Kineto/canvasEffect] ${label}: ${message}`);
}

/**
 * Check a definition and return a frozen, normalised copy of it.
 * Throws a TypeError that says exactly what is wrong — an AI or a person
 * writing an effect should never have to guess.
 */
function normalizeEffect(definition, label = 'effect') {
  if (!definition || typeof definition !== 'object') fail(label, 'a definition must be an object');
  const fragment = typeof definition.fragment === 'string' && definition.fragment.trim() ? definition.fragment : null;
  const context = definition.context ?? (fragment ? 'webgl' : '2d');
  if (!CONTEXTS.includes(context)) fail(label, `context must be one of ${CONTEXTS.join(', ')}`);
  if (fragment && context === '2d') fail(label, 'a fragment shader needs a webgl or webgl2 context');
  if (!fragment && typeof definition.frame !== 'function') fail(label, 'needs a frame(api) function or a fragment shader');
  HOOKS.forEach((hook) => {
    if (definition[hook] != null && typeof definition[hook] !== 'function') fail(label, `${hook} must be a function`);
  });
  const options = definition.options && typeof definition.options === 'object' ? { ...definition.options } : {};
  return Object.freeze({ ...definition, context, fragment, options: Object.freeze(options) });
}

/**
 * Register an effect under a name that markup can use.
 * Defining a name again replaces it for instances created from then on.
 * @returns {string} the name
 */
export function defineCanvasEffect(name, definition) {
  const key = String(name ?? '');
  if (!NAME_PATTERN.test(key)) fail(key || '(no name)', 'use lower-case letters, digits and dashes, starting with a letter');
  registry.set(key, normalizeEffect(definition, key));
  const pending = waiting.get(key);
  if (pending) {
    waiting.delete(key);
    pending.forEach((start, el) => { if (el.isConnected) start(); });
  }
  return key;
}

/**
 * Every registered effect, described for tooling: which drawing context it
 * uses, whether it is a bare fragment shader, and the options it reads with
 * their defaults. The demo's settings drawer uses `options` to show only the
 * controls the chosen effect actually reads.
 * @returns {{ name: string, context: string, shader: boolean, options: Record<string, unknown> }[]}
 */
export function listCanvasEffects() {
  return Array.from(registry, ([name, effect]) => ({
    name,
    context: effect.context,
    shader: Boolean(effect.fragment),
    options: { ...effect.options }
  }));
}

/** The registered effect of that name, or null. Names only — see the note above. */
export function resolveCanvasEffect(name) {
  return typeof name === 'string' ? registry.get(name) || null : null;
}

/**
 * Remember an element that asked for an effect that does not exist yet, so a
 * later defineCanvasEffect() can start it. Disconnected elements are dropped
 * as new ones arrive, so a name that is never defined cannot hold on to them.
 */
export function waitForCanvasEffect(name, el, start) {
  const key = String(name ?? '');
  if (!NAME_PATTERN.test(key)) return;
  if (!waiting.has(key)) waiting.set(key, new Map());
  const pending = waiting.get(key);
  pending.forEach((_start, other) => { if (!other.isConnected) pending.delete(other); });
  pending.set(el, start);
}
