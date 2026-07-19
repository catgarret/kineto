import { createElement, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Kineto from '@dong-gri/kineto';

/**
 * React hook for one Kineto module.
 * Recreates the module only when `type` or `dependencies` change.
 */
export function useKineto(type, options = {}, dependencies = []) {
  const elementRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !type) return undefined;
    instanceRef.current = Kineto.create(type, element, options);
    return () => {
      Kineto.destroyModule(element, type);
      instanceRef.current = null;
    };
  // Options are intentionally controlled by the caller through dependencies.
  }, [type, ...dependencies]);

  return { ref: elementRef, instance: instanceRef };
}

/**
 * Generic component wrapper. Example:
 * <Motion as="h2" type="textReveal" options={{ mode: 'hangul' }}>...</Motion>
 */
export const Motion = forwardRef(function Motion(
  { as = 'div', type, options = {}, dependencies = [], children, ...props },
  forwardedRef
) {
  const { ref, instance } = useKineto(type, options, dependencies);
  useImperativeHandle(forwardedRef, () => ({
    get element() { return ref.current; },
    get instance() { return instance.current; }
  }), []);
  return createElement(as, { ...props, ref }, children);
});

export { Kineto };
export default Motion;
