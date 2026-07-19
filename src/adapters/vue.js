import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import MotionKit from '@dong-gri/motionkit';

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
    el.__motionKitType = type;
    MotionKit.create(type, el, options);
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue && binding.arg === el.__motionKitType) return;
    const previous = normalizeBinding({ ...binding, value: binding.oldValue });
    const next = normalizeBinding(binding);
    if (!next.type) return;
    if (previous.type) MotionKit.destroyModule(el, previous.type);
    el.__motionKitType = next.type;
    MotionKit.create(next.type, el, next.options);
  },
  unmounted(el) {
    if (el.__motionKitType) MotionKit.destroyModule(el, el.__motionKitType);
    delete el.__motionKitType;
  }
};

export function useMotionKit(type, options = {}, watchSources = []) {
  const element = ref(null);
  const instance = ref(null);

  const mount = () => {
    if (!element.value || !type) return;
    MotionKit.destroyModule(element.value, type);
    instance.value = MotionKit.create(type, element.value, options);
  };

  onMounted(mount);
  if (watchSources.length) watch(watchSources, mount, { deep: true });
  onBeforeUnmount(() => {
    if (element.value && type) MotionKit.destroyModule(element.value, type);
    instance.value = null;
  });

  return { element, instance, replay: mount };
}

export function install(app) {
  app.directive('motion', vMotion);
}

export { MotionKit };
export default { install };
