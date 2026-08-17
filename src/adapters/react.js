import { Children, createContext, createElement, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Kineto from '@dong-gri/kineto';
import presence from '@dong-gri/kineto/presence';

const PresenceParentContext = createContext(null);

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
  const parentController = useContext(PresenceParentContext);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    const parent = options.parent || parentController;
    const controller = presence(element, parent && options.parent == null ? { ...options, parent } : options);
    controllerRef.current = controller;
    setStatus(controller.status);
    return () => {
      controller.destroy();
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  // Presence options are intentionally controlled by the caller through the
  // dependency list, matching useKineto's lifecycle contract.
  }, [parentController]);

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
  }, [present, parentController, ...dependencies]);

  return { ref: elementRef, controller: controllerRef, status, result };
}

function normalizePresenceChildren(children) {
  return Children.toArray(children).map((child, index) => ({
    key: child && typeof child === 'object' && child.key != null ? String(child.key) : `index:${index}`,
    child
  }));
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

  if (mode === 'wait' && exiting.length && additions.length) pendingRef.current = incoming;
  else {
    pendingRef.current = null;
    next.push(...additions.map((item) => ({ ...item, present: true })));
  }

  for (const item of current) {
    if (!incomingKeys.has(item.key)) next.push({ ...item, present: false });
  }

  const unchanged = next.length === current.length
    && next.every((item, index) => {
      const previous = current[index];
      return previous && previous.key === item.key && previous.child === item.child && previous.present === item.present;
    });
  return unchanged ? current : next;
}

/**
 * Keyed-child Presence state for React. Removed children stay mounted until
 * their Core leave result is finished/skipped; `wait` queues new keys until
 * all exiting children have settled.
 */
export function useKinetoPresenceGroup(children, options = {}) {
  const mode = options.mode || 'sync';
  const pendingRef = useRef(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const incoming = normalizePresenceChildren(children);
  const [items, setItems] = useState(() => incoming.map((item) => ({ ...item, present: true })));

  useEffect(() => {
    setItems((current) => reconcilePresenceItems(current, incoming, mode, pendingRef));
  }, [children, mode]);

  const handleResult = (key, nextResult, _force = false) => {
    optionsRef.current.onResult?.(nextResult, key);
    if (!nextResult || !['finished', 'skipped'].includes(nextResult.status)) return;
    setItems((current) => {
      const item = current.find((entry) => entry.key === key);
      if (!item || item.present) return current;
      const remaining = current.filter((entry) => entry.key !== key);
      if (mode === 'wait' && !remaining.some((entry) => !entry.present) && pendingRef.current) {
        const queued = pendingRef.current;
        pendingRef.current = null;
        return queued.map((entry) => ({ ...entry, present: true }));
      }
      return remaining;
    });
  };

  return { items, onResult: handleResult };
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
  return createElement(
    PresenceParentContext.Provider,
    { value: controller.current },
    createElement(as, { ...props, ref, 'data-kt-presence-status': status }, children)
  );
});

export function KinetoPresenceGroup({ as = 'div', mode, options = {}, children, ...props }) {
  const effectiveMode = mode || options.mode || 'sync';
  const groupOptions = { ...options, mode: effectiveMode };
  const { items, onResult } = useKinetoPresenceGroup(children, groupOptions);
  return createElement(as, props, items.map((item) => createElement(
    KinetoPresence,
    {
      key: item.key,
      present: item.present,
      options: {
        ...groupOptions,
        onResult: undefined,
        safeToRemove: (element, nextResult) => {
          groupOptions.safeToRemove?.(element, nextResult);
          groupOptions.onResult?.(nextResult, item.key);
          onResult(item.key, nextResult, true);
        }
      }
    },
    item.child
  )));
}

export { Kineto };
export default Motion;
