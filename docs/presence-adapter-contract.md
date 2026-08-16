# Presence framework adapter contract

This document defines the integration boundary for the next React/Vue Presence
work. It is intentionally a contract and fixture milestone, not an
`AnimatePresence`-style component. The current public entry remains the
framework-neutral `@dong-gri/kineto/presence` controller.

## Current supported shape

The host framework owns rendering and DOM insertion/removal. It creates one
controller for a stable element reference, calls `enter()` or `leave()` when
its own state changes, and removes the element only after a successful leave:

```js
const lifecycle = presence(element, {
  mode: 'wait',
  accessibility: 'managed',
  safeToRemove(node, result) {
    if (result.status === 'finished') node.remove();
  }
});

await lifecycle.enter();
const result = await lifecycle.leave();
if (result.status === 'finished') removeFromFrameworkState();
```

The controller must be created after the element is mounted and destroyed in
the framework cleanup hook. A parent must keep the element mounted while an
exit is running; conditionally unmounting it first makes an exit impossible.

## React fixture contract

- A `useRef` is the stable DOM identity.
- `useEffect` creates exactly one controller per mounted element and calls
  `destroy()` in cleanup.
- Strict Mode setup → cleanup → setup must not leak timers, listeners, focus
  state, or controllers.
- A `present` change calls `enter()`/`leave()`; the host remains rendered until
  the leave result is `finished` or `skipped`.
- The current fixture does not infer React keys or remove siblings. A future
  `<KinetoPresence>` component needs a separate keyed-child contract before it
  is published.

## Vue fixture contract

- A template `ref` is the stable DOM identity.
- `onMounted` creates the controller and `onBeforeUnmount` destroys it.
- A reactive `present` source calls `enter()`/`leave()` without replacing the
  controller.
- The host remains in the render tree until the leave result is settled.
- Vue Transition interop, keyed children, and nested exit propagation are
  deferred until their ordering and DOM ownership rules are specified.

## SSR and accessibility boundary

The adapter layer must remain safe when no browser globals exist. The
framework-neutral controller reports `ssr === true` and resolves enter/leave as
`{ status: 'skipped' }` without touching the DOM. Focus movement and managed
`aria-hidden`/`inert` restoration stay in the Presence Core; adapters only keep
the host mounted long enough for the result to settle.

## Release gates for a future adapter API

Before publishing `useKinetoPresence` or `<KinetoPresence>` from either
adapter, the project must add:

1. keyed direct-child identity and reorder tests;
2. Strict Mode / Vue effect replay and cancellation tests;
3. SSR + hydration markup stability checks;
4. `sync`, `wait`, and `popLayout` ordering fixtures;
5. explicit `safeToRemove` and focus ownership examples;
6. React/Vue adapter consumer gzip measurements.

Until those gates exist, consumers should use the standalone controller with
their framework lifecycle hooks as shown above.
