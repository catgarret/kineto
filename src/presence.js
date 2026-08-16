import { env, q } from './utils.js';

const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function result(status, reason, extra = {}) {
  const output = { status };
  if (reason) output.reason = reason;
  return Object.assign(output, extra);
}

function resolveElement(target) {
  return q(target).find((item) => item?.nodeType === 1) || null;
}

function resolveTarget(target, element) {
  if (typeof target === 'function') {
    try { return target(element); } catch (_error) { return null; }
  }
  if (typeof target === 'string') {
    try { return element?.ownerDocument?.querySelector(target) || null; } catch (_error) { return null; }
  }
  return target?.nodeType === 1 ? target : null;
}

function snapshotAttributes(element) {
  return {
    ariaHidden: element.getAttribute('aria-hidden'),
    inert: element.hasAttribute('inert'),
    tabIndex: element.getAttribute('tabindex'),
    pointerEvents: element.style.pointerEvents
  };
}

function restoreAttributes(element, snapshot) {
  if (!element || !snapshot) return;
  if (snapshot.ariaHidden == null) element.removeAttribute('aria-hidden');
  else element.setAttribute('aria-hidden', snapshot.ariaHidden);
  if (snapshot.inert) element.setAttribute('inert', '');
  else element.removeAttribute('inert');
  if (snapshot.tabIndex == null) element.removeAttribute('tabindex');
  else element.setAttribute('tabindex', snapshot.tabIndex);
  element.style.pointerEvents = snapshot.pointerEvents;
}

function focusTarget(element, requested) {
  const target = resolveTarget(requested, element) || element?.ownerDocument?.body;
  if (!target || typeof target.focus !== 'function') return;
  try { target.focus({ preventScroll: true }); } catch (_error) { try { target.focus(); } catch (_ignored) { /* no focus target */ } }
}

function ownsFocus(element) {
  const active = element?.ownerDocument?.activeElement;
  return Boolean(active && (active === element || element.contains?.(active)));
}

function descriptorFor(value) {
  if (!value) return null;
  if (typeof value === 'function') return { run: value, options: {} };
  if (value && typeof value === 'object') {
    if (typeof value.run === 'function') return { run: value.run, options: value.options || {} };
    if (value.state && typeof value.state.apply === 'function' && value.name) {
      return {
        run: (element, context) => value.state.apply(element, value.name, { ...value.options, ...context.options }),
        options: value.options || {}
      };
    }
    if (typeof value.apply === 'function' && value.name) {
      return {
        run: (element, context) => value.apply(element, value.name, { ...value.options, ...context.options }),
        options: value.options || {}
      };
    }
    return { options: value };
  }
  return null;
}

function waitFor(duration, reduced) {
  if (reduced || duration <= 0) return { promise: Promise.resolve(), cancel() {} };
  let timer = null;
  let resolvePromise;
  const promise = new Promise((resolve) => { resolvePromise = resolve; });
  timer = setTimeout(resolvePromise, duration);
  return { promise, cancel() { if (timer) clearTimeout(timer); resolvePromise(); } };
}

/**
 * Coordinate DOM lifetime around a visual enter/exit motion.
 *
 * Presence deliberately does not remove or insert DOM nodes. The host owns that
 * boundary and can use the `safeToRemove` callback after `leave()` resolves.
 */
export default function createPresence(target, defaults = {}, kineto = null) {
  const element = resolveElement(target);
  const runtime = env();
  const config = { mode: 'sync', accessibility: 'visual-only', ...defaults };
  let destroyed = false;
  let active = null;
  let queued = null;
  let status = 'idle';
  let accessibilitySnapshot = null;
  let layoutSnapshot = null;
  let safeRemoval = typeof config.safeToRemove === 'function' ? config.safeToRemove : null;

  const managed = config.accessibility === 'managed';
  const reduced = Boolean(config.reducedMotion === true || kineto?.prefersReducedMotion || runtime.reducedMotion);

  const restoreManaged = () => {
    if (!element || !accessibilitySnapshot) return;
    restoreAttributes(element, accessibilitySnapshot);
    accessibilitySnapshot = null;
  };
  const applyManaged = (direction, options) => {
    if (!element || !managed) return;
    if (!accessibilitySnapshot) accessibilitySnapshot = snapshotAttributes(element);
    if (direction === 'leave' && ownsFocus(element)) focusTarget(element, options.focusTarget ?? config.focusTarget);
    element.setAttribute('aria-hidden', 'true');
    element.setAttribute('inert', '');
    element.style.pointerEvents = 'none';
  };
  const captureLayout = (direction, options) => {
    if (direction !== 'leave' || (config.mode || options.mode) !== 'popLayout' || !element?.getBoundingClientRect) return;
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    layoutSnapshot = {
      position: element.style.position,
      inset: element.style.inset,
      width: element.style.width,
      height: element.style.height,
      zIndex: element.style.zIndex
    };
    Object.assign(element.style, {
      position: 'fixed',
      inset: `${rect.top}px auto auto ${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      zIndex: options.zIndex || '1'
    });
  };
  const restoreLayout = () => {
    if (!element || !layoutSnapshot) return;
    Object.assign(element.style, layoutSnapshot);
    layoutSnapshot = null;
  };

  const finish = (run, outcome) => {
    if (!run || run.settled) return;
    run.settled = true;
    if (run.timer) run.timer.cancel();
    if (run.motion?.cancel && outcome.status !== 'finished' && outcome.status !== 'skipped') {
      try { run.motion.cancel(); } catch (_error) { /* adapter already stopped */ }
    }
    if (active === run) active = null;
    status = outcome.status === 'cancelled' ? 'idle' : outcome.status;
    if (run.direction === 'enter' && (outcome.status === 'finished' || outcome.status === 'skipped')) restoreManaged();
    if (run.direction === 'leave' && (outcome.status === 'cancelled' || outcome.status === 'error')) {
      restoreLayout();
      restoreManaged();
    }
    if (run.direction === 'leave' && (outcome.status === 'finished' || outcome.status === 'skipped')) {
      if (safeRemoval && !run.safeCalled) {
        run.safeCalled = true;
        try { safeRemoval(element, outcome); } catch (error) { outcome = result('error', 'safeToRemove', { error }); }
      }
    }
    run.resolve(outcome);
    if (queued && !destroyed && run.direction === 'leave' && outcome.status !== 'error') {
      const next = queued;
      queued = null;
      start(next.direction, next.options).then(next.resolve, next.reject);
    }
  };

  const cancel = (run, reason = 'reenter') => finish(run, result('cancelled', reason));

  const start = (direction, options = {}) => {
    if (destroyed) return Promise.resolve(result('cancelled', 'destroy'));
    if (runtime.ssr || !element) {
      status = 'skipped';
      return Promise.resolve(result('skipped'));
    }
    const current = active;
    if (current && current.direction === direction) return current.promise;
    if (current && current.direction !== direction) {
      if ((config.mode || options.mode) === 'wait' && direction === 'enter' && current.direction === 'leave') {
        if (queued) queued.resolve(result('cancelled', 'reenter'));
        return new Promise((resolve, reject) => { queued = { direction, options, resolve, reject }; });
      }
      cancel(current);
    }
    if (direction === 'enter') restoreLayout();
    const run = {
      direction,
      options,
      settled: false,
      safeCalled: false,
      resolve: null,
      reject: null,
      timer: null,
      motion: null
    };
    run.promise = new Promise((resolve, reject) => { run.resolve = resolve; run.reject = reject; });
    run.promise.cancel = () => cancel(run);
    active = run;
    status = direction === 'enter' ? 'entering' : 'leaving';
    applyManaged(direction, options);
    captureLayout(direction, options);
    const descriptor = descriptorFor(options.motion ?? config[direction]);
    if (reduced) {
      if (descriptor?.run) {
        try {
          const motion = descriptor.run(element, { direction, options: { ...descriptor.options, ...options, reducedMotion: 'final' } });
          run.motion = motion && typeof motion.cancel === 'function' ? motion : null;
        } catch (_error) { /* final state is best effort in reduced mode */ }
      }
      finish(run, result('skipped'));
      return run.promise;
    }
    try {
      const motion = descriptor?.run?.(element, { direction, options: { ...descriptor.options, ...options } });
      run.motion = motion && typeof motion.cancel === 'function' ? motion : null;
      const motionPromise = motion && typeof motion.then === 'function' ? motion : Promise.resolve();
      const fallback = descriptor?.run ? null : waitFor(number(options.duration ?? config.duration, 0) + number(options.delay ?? config.delay, 0), false);
      run.timer = fallback;
      Promise.race([motionPromise, fallback?.promise || Promise.resolve()]).then(
        () => finish(run, result('finished')),
        (error) => finish(run, result('error', 'motion', { error }))
      );
    } catch (error) {
      finish(run, result('error', 'motion', { error }));
    }
    return run.promise;
  };

  const controller = {
    enter(options = {}) { return start('enter', options); },
    leave(options = {}) { return start('leave', options); },
    cancel(reason = 'cancel') { if (active) cancel(active, reason); return controller; },
    safeToRemove(callback) { safeRemoval = typeof callback === 'function' ? callback : null; return controller; },
    destroy() {
      if (destroyed) return controller;
      destroyed = true;
      if (active) cancel(active, 'destroy');
      if (queued) { queued.resolve(result('cancelled', 'destroy')); queued = null; }
      restoreLayout();
      restoreManaged();
      status = 'destroyed';
      return controller;
    },
    get status() { return status; },
    get ssr() { return runtime.ssr; }
  };
  return controller;
}
