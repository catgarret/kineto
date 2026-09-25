// Deferred creation: `Kineto.config({ defer: true })`.
//
// A long page can carry hundreds of effects, and scan() used to create every
// one of them at start-up — each with its own DOM writes, measurements,
// observers, tweens and canvases. On the demo (500+ instances) that held a
// phone's main thread for seconds after load. With `defer`, an element found
// by scan() is created only when it comes within one viewport of the screen
// (an IntersectionObserver with a 100% margin), so start-up pays for what the
// reader can reach and the rest is created on the way.
//
// Which modules wait is the module's own declaration (`defer: true` in its
// definition): visual effects whose element must be on screen to matter.
// Modules that shape the page before anyone scrolls — pins, page-level
// overlays, components with keyboard/ARIA behaviour — are always created at
// once. Direct JavaScript calls (`Kineto.reveal(el)`, `Kineto.create()`) are
// never deferred: only markup discovered by scan() waits.
//
// Options are read when the instance is finally created, not when the element
// was discovered, so markup edited in between is honoured.

/**
 * @param {{ create: (el: Element, name: string) => void, rootMargin?: string }} options
 *   `create(el, name)` is called once per queued (element, module) pair, in the
 *   order the pairs were queued, when the element approaches the viewport.
 */
export function createDeferral({ create, rootMargin = '100% 0px' }) {
  // element → module names, in discovery order
  const pending = new Map();
  let observer = null;

  const flush = (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const names = pending.get(el);
      pending.delete(el);
      observer?.unobserve(el);
      if (!names || !el.isConnected) return;
      names.forEach((name) => create(el, name));
    });
    if (!pending.size) stop();
  };

  function stop() {
    observer?.disconnect();
    observer = null;
  }

  return {
    /**
     * Queue `name` for `el`. Returns false when it cannot be deferred (no
     * IntersectionObserver): the caller then creates it at once.
     */
    queue(el, name) {
      if (typeof IntersectionObserver === 'undefined' || typeof el?.getBoundingClientRect !== 'function') return false;
      observer ||= new IntersectionObserver(flush, { rootMargin });
      let names = pending.get(el);
      if (!names) {
        names = new Set();
        pending.set(el, names);
        observer.observe(el);
      }
      names.add(name);
      return true;
    },

    has: (el, name) => Boolean(pending.get(el)?.has(name)),

    /** Forget queued work for elements inside any of `roots` (or `null`: all). */
    cancel(roots = null) {
      Array.from(pending.keys()).forEach((el) => {
        const inside = !roots || roots.some((root) => root === el
          || (typeof root?.contains === 'function' && root.contains(el))
          || (typeof document !== 'undefined' && root === document));
        if (!inside) return;
        pending.delete(el);
        observer?.unobserve(el);
      });
      if (!pending.size) stop();
    },

    /** Drop queued work for elements that left the document. */
    prune() {
      Array.from(pending.keys()).forEach((el) => {
        if (el.isConnected) return;
        pending.delete(el);
        observer?.unobserve(el);
      });
      if (!pending.size) stop();
    },

    get size() { return pending.size; }
  };
}
