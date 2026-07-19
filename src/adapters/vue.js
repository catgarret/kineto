import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Kineto from '@dong-gri/kineto';

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

export function install(app) {
  app.directive('motion', vMotion);
}

export { Kineto };
export default { install };
