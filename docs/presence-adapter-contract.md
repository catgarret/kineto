# Presence framework adapter contract

This document defines the integration boundary for the React/Vue Presence
adapters. The framework-neutral
`@dong-gri/kineto/presence` controller remains the source of truth.

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
- `<KinetoPresenceGroup>` is the opt-in keyed-child wrapper. It tracks direct
  child keys, keeps removed children mounted until `finished`/`skipped`, and
  preserves the incoming order while exits settle.

## Vue fixture contract

- A template `ref` is the stable DOM identity.
- `onMounted` creates the controller and `onBeforeUnmount` destroys it.
- A reactive `present` source calls `enter()`/`leave()` without replacing the
  controller.
- The host remains in the render tree until the leave result is settled.
- `<KinetoPresenceGroup>` provides the same direct-child key contract. Nested
  parent exit propagation is enabled when the parent opts into `propagate: true`;
  `useKinetoTransition()` provides an explicit `<Transition>` hook bridge for
  one-shot module enter/leave effects.

## Adapter API (v0.8.89)

Both adapters expose a host-owned Presence composable, a small element wrapper,
and an opt-in keyed-child group. The group creates one controller per direct
child key, keeps removed children mounted during `leave()`, and removes the
wrapper only after the Core result settles. A parent `KinetoPresence` can opt
into nested exit propagation with `propagate: true`; the host still owns DOM
insertion/removal.

```jsx
import { KinetoPresence, useKinetoPresence } from '@dong-gri/kineto/react';

function Panel({ present }) {
  const lifecycle = useKinetoPresence(present, {
    accessibility: 'managed',
    exit: { state: states, name: 'hidden' }
  });
  return <section ref={lifecycle.ref}>{present ? 'Visible' : 'Leaving'}</section>;
}
```

For keyed children, use the explicit group boundary. The default `sync` mode
allows entering and exiting keys together; `wait` queues new keys until all
exits finish; `popLayout` forwards the Core layout snapshot policy.

```jsx
import { KinetoPresenceGroup } from '@dong-gri/kineto/react';

<KinetoPresenceGroup mode="wait" options={{ duration: 180 }}>
  {items.map((item) => <article key={item.id}>{item.label}</article>)}
</KinetoPresenceGroup>
```

Vue provides the equivalent `useKinetoPresence` composable and
`KinetoPresence` component. `present` may be a boolean, ref, or getter. The
`useKinetoTransition(type, options)` composable returns Vue transition hooks;
`enterOptions` and `leaveOptions` override shared module options per phase. Both
implementations are SSR-safe: no controller is created without a DOM element,
and the standalone controller resolves SSR calls as `skipped`.

```js
import { Transition, h, ref } from 'vue';
import { useKinetoTransition } from '@dong-gri/kineto/vue';

const visible = ref(true);
const hooks = useKinetoTransition('reveal', {
  enterOptions: { preset: 'fade-up', duration: 0.35 },
  leaveOptions: { preset: 'fade', duration: 0.2 }
});

h(Transition, hooks, {
  default: () => visible.value ? h('section', 'Content') : null
});
```

The adapter invokes Vue's `done` callback from `onComplete`, cleans up after
`onAfterEnter`/`onAfterLeave`, handles cancellation hooks, and falls back to a
bounded `duration + delay` timer when a custom module does not emit completion.

## SSR and accessibility boundary

The adapter layer must remain safe when no browser globals exist. The
framework-neutral controller reports `ssr === true` and resolves enter/leave as
`{ status: 'skipped' }` without touching the DOM. Focus movement and managed
`aria-hidden`/`inert` restoration stay in the Presence Core; adapters only keep
the host mounted long enough for the result to settle.

## Release gates for the next adapter batch

Before expanding framework transition interop, the project must add:

1. nested parent/child identity and reorder tests across repeated parent enter/leave;
2. Strict Mode / Vue effect replay and cancellation tests for nested groups;
3. SSR + hydration markup stability checks;
4. `sync`, `wait`, and `popLayout` ordering fixtures;
5. explicit `safeToRemove` and focus ownership examples;
6. React/Vue adapter consumer gzip measurements.

The Vue Transition hook bridge is now covered by the framework fixture. The
remaining gates apply to future keyed-transition expansion and shared-layout
interop; consumers should continue to use the group for direct keyed children
and the host-owned composables or standalone controller for custom DOM
ownership.
