import { Comment, defineComponent, h, inject, onBeforeUnmount, onMounted, onUpdated, provide, ref, shallowRef, toRef, unref, watch } from 'vue';
import Kineto from '@dong-gri/kineto';
import presence from '@dong-gri/kineto/presence';

const PresenceParentKey = Symbol('kineto-presence-parent');

function normalizeBinding(binding) {
  if (typeof binding.value === 'string') return { type: binding.value, options: {} };
  return {
    type: binding.arg || binding.value?.type,
    options: binding.value?.options || binding.value || {}
  };
}

export const vMotion = {
  mounted(el, binding) {
    const { type, options } = normalizeBinding(binding);
    if (!type) return;
    el.__kinetoType = type;
    Kineto.create(type, el, options);
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue && binding.arg === el.__kinetoType) return;
    const previous = normalizeBinding({ ...binding, value: binding.oldValue });
    const next = normalizeBinding(binding);
    if (!next.type) return;
    if (previous.type) Kineto.destroyModule(el, previous.type);
    el.__kinetoType = next.type;
    Kineto.create(next.type, el, next.options);
  },
  unmounted(el) {
    if (el.__kinetoType) Kineto.destroyModule(el, el.__kinetoType);
    delete el.__kinetoType;
  }
};

export function useKineto(type, options = {}, watchSources = []) {
  const element = ref(null);
  const instance = ref(null);

  const mount = () => {
    if (!element.value || !type) return;
    Kineto.destroyModule(element.value, type);
    instance.value = Kineto.create(type, element.value, options);
  };

  onMounted(mount);
  if (watchSources.length) watch(watchSources, mount, { deep: true });
  onBeforeUnmount(() => {
    if (element.value && type) Kineto.destroyModule(element.value, type);
    instance.value = null;
  });

  return { element, instance, replay: mount };
}

/**
 * Bridge a one-shot Kineto module into Vue's <Transition> hook contract.
 * Vue owns insertion/removal; the adapter only starts the requested module,
 * calls Vue's done callback from the module completion hook, and destroys the
 * temporary instance after Vue confirms the phase has settled.
 *
 * `options` is shared by enter/leave. `enterOptions` and `leaveOptions` may
 * override it for the corresponding phase. A bounded fallback timer keeps a
 * transition from hanging when a custom module does not emit onComplete.
 */
export function useKinetoTransition(type, options = {}) {
  const active = new Map();
  const phaseOptions = (phase) => {
    const override = phase === 'enter' ? options.enterOptions : options.leaveOptions;
    const merged = { ...options, ...(override || {}) };
    delete merged.enterOptions;
    delete merged.leaveOptions;
    return merged;
  };
  const durationMs = (phase) => {
    const phaseConfig = phaseOptions(phase);
    const duration = Math.max(0, Number(phaseConfig.duration ?? 0.4));
    const delay = Math.max(0, Number(phaseConfig.delay ?? 0));
    return (duration + delay) * 1000 + 120;
  };
  const cleanup = (el) => {
    const run = active.get(el);
    if (!run) return;
    clearTimeout(run.timer);
    active.delete(el);
    try { run.instance?.destroy?.(); } catch (_error) { /* best effort during Vue teardown */ }
  };
  const finish = (run) => {
    if (run.finished) return;
    run.finished = true;
    clearTimeout(run.timer);
    run.done?.();
  };
  const start = (el, phase, done) => {
    cleanup(el);
    const run = { instance: null, timer: null, done, finished: false };
    active.set(el, run);
    const config = phaseOptions(phase);
    const userComplete = config.onComplete;
    config.onComplete = (...args) => {
      try { userComplete?.(...args); } finally { finish(run); }
    };
    try {
      run.instance = Kineto.create(type, el, config);
      if (!run.instance) finish(run);
    } catch (_error) {
      finish(run);
    }
    if (!run.finished) run.timer = setTimeout(() => finish(run), durationMs(phase));
  };
  const hooks = {
    onBeforeEnter: (el) => cleanup(el),
    onEnter: (el, done) => start(el, 'enter', done),
    onAfterEnter: (el) => cleanup(el),
    onEnterCancelled: (el) => cleanup(el),
    onBeforeLeave: (el) => cleanup(el),
    onLeave: (el, done) => start(el, 'leave', done),
    onAfterLeave: (el) => cleanup(el),
    onLeaveCancelled: (el) => cleanup(el)
  };
  onBeforeUnmount(() => [...active.keys()].forEach(cleanup));
  return hooks;
}

/**
 * Host-owned Presence lifecycle for one stable Vue element.
 * Keep the element rendered until leave() resolves; the host owns keyed
 * state removal and can inspect result/status through the returned refs.
 */
export function useKinetoPresence(present = true, options = {}, watchSources = []) {
  const element = ref(null);
  const controller = shallowRef(null);
  const status = ref('idle');
  const result = shallowRef(null);
  const parentRef = inject(PresenceParentKey, null);
  let parentRegistration = null;
  let registeredAtCreate = false;
  const resolveParent = () => options.parent || parentRef?.value || parentRef?.current || null;
  const bindParent = () => {
    const parent = resolveParent();
    if (!parent || !controller.value || parentRegistration || registeredAtCreate || options.parent) return;
    parentRegistration = parent.registerChild?.(controller.value) || null;
  };
  const presentSource = typeof present === 'function'
    || (present && typeof present === 'object' && 'value' in present)
    ? present
    : () => present;
  const sources = [presentSource, ...watchSources];

  const run = () => {
    const lifecycle = controller.value;
    if (!lifecycle) return;
    const promise = lifecycle[unref(present) ? 'enter' : 'leave'](unref(present) ? options.enterOptions : options.exitOptions);
    Promise.resolve(promise).then((nextResult) => {
      status.value = lifecycle.status;
      result.value = nextResult;
      options.onResult?.(nextResult);
    });
  };

  onMounted(() => {
    if (!element.value) return;
    const parent = resolveParent();
    controller.value = presence(element.value, parent && options.parent == null ? { ...options, parent } : options);
    registeredAtCreate = Boolean(parent || options.parent);
    status.value = controller.value.status;
    run();
    bindParent();
  });
  if (parentRef && typeof parentRef === 'object' && 'value' in parentRef) watch(parentRef, bindParent);
  if (sources.length) watch(sources, run, { deep: true });
  onBeforeUnmount(() => {
    parentRegistration?.();
    parentRegistration = null;
    controller.value?.destroy();
    controller.value = null;
  });

  return { element, controller, status, result, replay: run };
}

function normalizePresenceChildren(children = []) {
  const flat = [];
  const visit = (value) => {
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (value && value.type !== Comment) flat.push(value);
  };
  visit(children);
  return flat.map((child, index) => ({
    key: child.key != null ? String(child.key) : `index:${index}`,
    child
  }));
}

function sameVNode(left, right) {
  if (left === right) return true;
  if (!left || !right || left.type !== right.type || left.key !== right.key || left.children !== right.children) return false;
  const leftProps = left.props || {};
  const rightProps = right.props || {};
  const keys = new Set([...Object.keys(leftProps), ...Object.keys(rightProps)]);
  return [...keys].every((key) => leftProps[key] === rightProps[key]);
}

function reconcilePresenceItems(current, incoming, mode, pendingRef) {
  const currentByKey = new Map(current.map((item) => [item.key, item]));
  const incomingKeys = new Set(incoming.map((item) => item.key));
  const exiting = current.filter((item) => !item.present);
  const next = [];
  const additions = [];

  for (const item of incoming) {
    const previous = currentByKey.get(item.key);
    if (previous) next.push({ ...previous, child: item.child, present: true });
    else additions.push(item);
  }

  if (mode === 'wait' && exiting.length && additions.length) pendingRef.value = incoming;
  else {
    pendingRef.value = null;
    next.push(...additions.map((item) => ({ ...item, present: true })));
  }

  for (const item of current) {
    if (!incomingKeys.has(item.key)) next.push({ ...item, present: false });
  }

  const unchanged = next.length === current.length
    && next.every((item, index) => {
      const previous = current[index];
      return previous && previous.key === item.key && sameVNode(previous.child, item.child) && previous.present === item.present;
    });
  return unchanged ? current : next;
}

/**
 * Keyed-child Presence state for Vue. Removed VNodes remain rendered until
 * their Core leave result settles; `wait` queues new keys behind exits.
 */
export function useKinetoPresenceGroup(children = [], options = {}) {
  const mode = options.mode || 'sync';
  const pending = shallowRef(null);
  const records = shallowRef(normalizePresenceChildren(children).map((item) => ({ ...item, present: true })));

  const sync = (nextChildren = []) => {
    records.value = reconcilePresenceItems(records.value, normalizePresenceChildren(nextChildren), mode, pending);
  };
  const handleResult = (key, nextResult, _force = false) => {
    options.onResult?.(nextResult, key);
    if (!nextResult || !['finished', 'skipped'].includes(nextResult.status)) return false;
    const item = records.value.find((entry) => entry.key === key);
    if (!item || item.present) return false;
    const remaining = records.value.filter((entry) => entry.key !== key);
    if (mode === 'wait' && !remaining.some((entry) => !entry.present) && pending.value) {
      const queued = pending.value;
      pending.value = null;
      records.value = queued.map((entry) => ({ ...entry, present: true }));
      return false;
    }
    records.value = remaining;
    return false;
  };

  return { items: records, sync, onResult: handleResult };
}

export const KinetoPresence = defineComponent({
  name: 'KinetoPresence',
  inheritAttrs: false,
  props: {
    as: { type: [String, Object], default: 'div' },
    present: { type: Boolean, default: true },
    options: { type: Object, default: () => ({}) },
    watchSources: { type: Array, default: () => [] }
  },
  setup(props, { attrs, slots, expose }) {
    const lifecycle = useKinetoPresence(toRef(props, 'present'), props.options, props.watchSources);
    provide(PresenceParentKey, lifecycle.controller);
    expose(lifecycle);
    return () => h(props.as, {
      ...attrs,
      ref: lifecycle.element,
      'data-kt-presence-status': lifecycle.status.value
    }, slots.default?.());
  }
});

export const KinetoPresenceGroup = defineComponent({
  name: 'KinetoPresenceGroup',
  inheritAttrs: false,
  props: {
    as: { type: [String, Object], default: 'div' },
    mode: { type: String, default: undefined },
    options: { type: Object, default: () => ({}) }
  },
  setup(props, { attrs, slots, expose }) {
    const mode = props.mode || props.options.mode || 'sync';
    const groupOptions = { ...props.options, mode };
    const lifecycle = useKinetoPresenceGroup([], groupOptions);
    const latestChildren = shallowRef([]);
    const mounted = ref(false);
    const syncChildren = () => lifecycle.sync(latestChildren.value);
    onMounted(() => {
      mounted.value = true;
      syncChildren();
    });
    onUpdated(syncChildren);
    expose(lifecycle);
    return () => {
      const slotChildren = slots.default?.() || [];
      latestChildren.value = slotChildren;
      const items = mounted.value || lifecycle.items.value.length
        ? lifecycle.items.value
        : normalizePresenceChildren(slotChildren).map((item) => ({ ...item, present: true }));
      return h(props.as, { ...attrs }, items.map((item) => h(
        KinetoPresence,
        {
          key: item.key,
          present: item.present,
          options: {
            ...groupOptions,
            onResult: undefined,
            safeToRemove: (element, nextResult) => {
              groupOptions.safeToRemove?.(element, nextResult);
              lifecycle.onResult(item.key, nextResult, true);
            }
          }
        },
        { default: () => item.child }
      )));
    };
  }
});

export function install(app) {
  app.directive('motion', vMotion);
}

export { Kineto };
export default { install, KinetoPresence, KinetoPresenceGroup };
