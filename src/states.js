import { cssEase, env, q } from './utils.js';

// Motion States is intentionally a small, visual-only primitive. It does not
// own DOM insertion/removal, focus, aria or inert state; Presence and the host
// component remain responsible for those concerns.
const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const px = (value) => `${number(value)}px`;

function normalizeState(value = {}) {
  if (!value || typeof value !== 'object') throw new TypeError('Kineto.states state values must be objects.');
  const output = {};
  if (value.opacity != null) output.opacity = String(Math.max(0, Math.min(1, number(value.opacity, 1))));

  const transforms = [];
  if (value.x != null) transforms.push(`translateX(${px(value.x)})`);
  if (value.y != null) transforms.push(`translateY(${px(value.y)})`);
  if (value.scale != null) transforms.push(`scale(${number(value.scale, 1)})`);
  if (value.rotate != null) transforms.push(`rotate(${number(value.rotate)}deg)`);
  if (value.skewX != null) transforms.push(`skewX(${number(value.skewX)}deg)`);
  if (value.skewY != null) transforms.push(`skewY(${number(value.skewY)}deg)`);
  if (value.transform != null) transforms.push(String(value.transform));
  if (transforms.length) output.transform = transforms.join(' ');

  const filters = [];
  if (value.blur != null) filters.push(`blur(${px(value.blur)})`);
  if (value.brightness != null) filters.push(`brightness(${number(value.brightness, 1)})`);
  if (value.filter != null) filters.push(String(value.filter));
  if (filters.length) output.filter = filters.join(' ');
  return output;
}

function resolveTargets(target) {
  return q(target).filter((item) => item?.nodeType === 1);
}

function childTargets(parents, children) {
  if (!children) return [];
  if (typeof children !== 'string') return resolveTargets(children);
  const result = [];
  parents.forEach((parent) => {
    try { result.push(...parent.querySelectorAll(children)); } catch (_error) { /* invalid selector: no children */ }
  });
  return [...new Set(result)];
}

function stateOptions(options, defaults) {
  const source = { ...defaults, ...options };
  return {
    duration: Math.max(0, number(source.duration, 300)),
    delay: Math.max(0, number(source.delay, 0)),
    stagger: Math.max(0, number(source.stagger, 0)),
    ease: cssEase(source.ease || 'ease'),
    initial: source.initial,
    beforeChildren: source.beforeChildren === true,
    afterChildren: source.afterChildren === true,
    delayChildren: Math.max(0, number(source.delayChildren, 0)),
    reducedMotion: source.reducedMotion
  };
}

/**
 * Create a named visual state controller.
 *
 * The controller is deliberately independent of the module registry so its
 * optional code can be tree-shaken by consumers that do not use states.
 */
export default function createStates(definitions = {}, defaults = {}, kineto = null) {
  if (!definitions || typeof definitions !== 'object' || Array.isArray(definitions)) {
    throw new TypeError('Kineto.states() expects a named state object.');
  }
  const states = new Map(Object.entries(definitions).map(([name, value]) => [name, normalizeState(value)]));
  if (!states.size) throw new TypeError('Kineto.states() needs at least one named state.');

  const original = new Map();
  const active = new Map();
  const runs = new Set();
  let last = null;
  let destroyed = false;

  const remember = (el) => {
    if (!original.has(el)) original.set(el, el.getAttribute('style'));
  };
  const render = (el, style) => {
    remember(el);
    Object.entries(style).forEach(([key, value]) => { el.style[key] = value; });
  };
  const restore = () => {
    original.forEach((style, el) => {
      if (!el?.isConnected && !el?.style) return;
      if (style == null) el.removeAttribute('style');
      else el.setAttribute('style', style);
    });
    original.clear();
  };

  const finishRun = (run, status) => {
    if (run.status) return;
    run.status = status;
    run.entries.forEach((entry) => {
      if (active.get(entry.el) === run) active.delete(entry.el);
      if (entry.timer) clearTimeout(entry.timer);
      try { entry.animation?.cancel?.(); } catch (_error) { /* already finished */ }
    });
    runs.delete(run);
    run.resolve({ status });
  };

  const cancelRun = (run) => finishRun(run, 'cancelled');

  const animateElement = (run, el, from, to, options, index) => {
    remember(el);
    const previous = active.get(el);
    if (previous && previous !== run) cancelRun(previous);
    active.set(el, run);
    const entry = { el, animation: null, timer: null, done: false };
    run.entries.push(entry);
    const complete = () => {
      if (entry.done || run.status) return;
      entry.done = true;
      render(el, to);
      if (active.get(el) === run) active.delete(el);
      run.remaining -= 1;
      if (!run.remaining) finishRun(run, 'finished');
    };
    const delay = options.delay + options.stagger * index;
    if (run.reduced || !options.duration) {
      entry.timer = setTimeout(complete, delay);
      if (!delay) complete();
      return;
    }
    if (typeof el.animate === 'function') {
      const frames = from ? [from, to] : [{}, to];
      try {
        const animation = el.animate(frames, {
          duration: options.duration,
          delay,
          easing: options.ease,
          fill: 'both'
        });
        entry.animation = animation;
        animation.finished.then(complete, () => {
          if (!run.status) cancelRun(run);
        });
        return;
      } catch (_error) { /* use the style fallback below */ }
    }
    // Older WebKit and non-browser DOM implementations still receive the
    // final state. The timeout keeps the Promise lifecycle equivalent.
    entry.timer = setTimeout(complete, delay + options.duration);
  };

  const apply = (target, stateName, options = {}) => {
    if (destroyed) return Promise.resolve({ status: 'cancelled' });
    const to = states.get(stateName);
    if (!to) return Promise.reject(new RangeError(`Unknown Kineto state: ${stateName}`));
    const parents = resolveTargets(target);
    const children = childTargets(parents, options.children);
    const settings = stateOptions(options, defaults);
    const all = settings.beforeChildren ? [...children, ...parents] : [...parents, ...children];
    const unique = [...new Set(all)];
    const initialName = settings.initial;
    const initial = initialName && initialName !== false ? states.get(initialName) : null;
    if (initial) unique.forEach((el) => render(el, initial));
    if (!unique.length) return Promise.resolve({ status: 'finished' });

    const run = {
      entries: [],
      remaining: unique.length,
      status: null,
      resolve: null,
      reduced: Boolean(settings.reducedMotion === 'final' || kineto?.prefersReducedMotion || env().reducedMotion)
    };
    const promise = new Promise((resolvePromise) => { run.resolve = resolvePromise; });
    promise.cancel = () => cancelRun(run);
    runs.add(run);
    last = { target, stateName, options: { ...options, initial: false } };
    const parentSpan = settings.duration + settings.stagger * Math.max(0, parents.length - 1);
    const childSpan = settings.duration + settings.stagger * Math.max(0, children.length - 1);
    const childOptions = {
      ...settings,
      delay: settings.delay + settings.delayChildren + (settings.afterChildren ? parentSpan : 0)
    };
    const parentOptions = {
      ...settings,
      delay: settings.delay + (settings.beforeChildren ? childSpan + settings.delayChildren : 0)
    };
    unique.forEach((el) => {
      const isChild = children.includes(el);
      const currentOptions = isChild ? childOptions : parentOptions;
      const groupIndex = isChild ? children.indexOf(el) : parents.indexOf(el);
      animateElement(run, el, initial || null, to, currentOptions, Math.max(0, groupIndex));
    });
    return promise;
  };

  const controller = {
    apply,
    replay(target = last?.target, stateName = last?.stateName, options = last?.options || {}) {
      if (!target || !stateName) return Promise.resolve({ status: 'finished' });
      return apply(target, stateName, { ...options, initial: false });
    },
    scan(root = typeof document !== 'undefined' ? document : null, options = {}) {
      const jobs = [];
      if (root?.querySelectorAll) root.querySelectorAll('[data-kt-state]').forEach((el) => {
        const name = el.getAttribute('data-kt-state');
        if (name && states.has(name)) jobs.push(apply(el, name, options));
      });
      return Promise.all(jobs).then((results) => results.at(-1) || { status: 'finished' });
    },
    destroy() {
      if (destroyed) return controller;
      destroyed = true;
      [...runs].forEach(cancelRun);
      restore();
      last = null;
      return controller;
    },
    get stateNames() { return [...states.keys()]; }
  };
  // Touch the environment once so SSR calls stay side-effect free while a
  // browser controller still follows the same cached reduced-motion policy.
  if (env().ssr) controller.ssr = true;
  return controller;
}
