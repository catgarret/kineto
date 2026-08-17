import { defineComponent, h, onBeforeUnmount, onMounted, ref, shallowRef, toRef, unref, watch } from 'vue';
import Kineto from '@dong-gri/kineto';
import presence from '@dong-gri/kineto/presence';

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
 * Host-owned Presence lifecycle for one stable Vue element.
 * Keep the element rendered until leave() resolves; the host owns keyed
 * state removal and can inspect result/status through the returned refs.
 */
export function useKinetoPresence(present = true, options = {}, watchSources = []) {
  const element = ref(null);
  const controller = shallowRef(null);
  const status = ref('idle');
  const result = shallowRef(null);
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
    controller.value = presence(element.value, options);
    status.value = controller.value.status;
    run();
  });
  if (sources.length) watch(sources, run, { deep: true });
  onBeforeUnmount(() => {
    controller.value?.destroy();
    controller.value = null;
  });

  return { element, controller, status, result, replay: run };
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
    expose(lifecycle);
    return () => h(props.as, {
      ...attrs,
      ref: lifecycle.element,
      'data-kt-presence-status': lifecycle.status.value
    }, slots.default?.());
  }
});

export function install(app) {
  app.directive('motion', vMotion);
}

export { Kineto };
export default { install, KinetoPresence };
