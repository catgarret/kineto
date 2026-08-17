import { createElement, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Kineto from '@dong-gri/kineto';
import presence from '@dong-gri/kineto/presence';

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
 * Host-owned Presence lifecycle for one stable React element.
 * The element stays rendered while leave() runs; callers decide when their
 * keyed state should remove it after the returned result is settled.
 */
export function useKinetoPresence(present = true, options = {}, dependencies = []) {
  const elementRef = useRef(null);
  const controllerRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    const controller = presence(element, options);
    controllerRef.current = controller;
    setStatus(controller.status);
    return () => {
      controller.destroy();
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  // Presence options are intentionally controlled by the caller through the
  // dependency list, matching useKineto's lifecycle contract.
  }, []);

  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return undefined;
    let active = true;
    const run = controller[present ? 'enter' : 'leave'](present ? options.enterOptions : options.exitOptions);
    Promise.resolve(run).then((nextResult) => {
      if (!active) return;
      setStatus(controller.status);
      setResult(nextResult);
      options.onResult?.(nextResult);
    });
    return () => { active = false; };
  // The caller owns reactivity; dependencies opt into rerunning the lifecycle.
  }, [present, ...dependencies]);

  return { ref: elementRef, controller: controllerRef, status, result };
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

export const KinetoPresence = forwardRef(function KinetoPresence(
  { as = 'div', present = true, options = {}, dependencies = [], children, ...props },
  forwardedRef
) {
  const { ref, controller, status, result } = useKinetoPresence(present, options, dependencies);
  useImperativeHandle(forwardedRef, () => ({
    get element() { return ref.current; },
    get controller() { return controller.current; },
    get status() { return status; },
    get result() { return result; }
  }), [controller, status, result]);
  return createElement(as, { ...props, ref, 'data-kt-presence-status': status }, children);
});

export { Kineto };
export default Motion;
