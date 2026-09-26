// LAYOUT-SHIFT REFRESH
//
// ScrollTrigger measures where each trigger starts and ends once, when it
// refreshes. It refreshes by itself on window resize and on `load`, but not
// when the document grows or shrinks on its own: an image above a pinned
// section finishes loading, an accordion opens, a "show more" button reveals
// cards. Every trigger below that change keeps firing at the old scroll
// positions, so a pinned section lands on top of the content that moved in
// under it — the overlap the demo showed below "Class Hook".
//
// This watcher closes that gap. While at least one ScrollTrigger-driven
// instance is alive, it watches the body's height and asks ScrollTrigger to
// refresh once the height has stopped changing for `settleMs`.
//
// Three details keep it cheap and loop-free:
//   • ScrollTrigger's own refresh changes the height too (pin spacers). The
//     height right after a refresh is remembered as the settled height, and a
//     resize that ends at that height is ignored.
//   • Resizes are debounced, so an animated height change (an accordion
//     opening over 400ms) costs one refresh at the end, not one per frame.
//   • It also waits for the page to stop scrolling. A refresh re-measures
//     every trigger in one long task and puts the scroll position back, which
//     stalls a scroll in progress and ends a touch fling on iOS. Pages whose
//     content settles as the reader scrolls (blocks that skip rendering until
//     they near the screen) otherwise refreshed several times per swipe.
//
// Pages that manage refreshes themselves turn it off with
// `Kineto.config({ autoRefresh: false })`.

/** Height changes smaller than this (sub-pixel rounding) are not layout shifts. */
const MIN_SHIFT_PX = 1;

/**
 * @param {object} deps
 * @param {() => any} deps.getScrollTrigger  Returns the ScrollTrigger global, or null.
 * @param {() => boolean} deps.isEnabled     Reads `config.autoRefresh` at the moment of use.
 * @param {number} [deps.settleMs=200]       Quiet time before refreshing.
 */
export function createLayoutRefresh({ getScrollTrigger, isEnabled, settleMs = 200 }) {
  let observer = null;
  let timer = 0;
  let settledHeight = -1;
  let refreshListener = null;
  let listenedTrigger = null;
  let lastScrollAt = -Infinity;

  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const bodyHeight = () => document.body?.getBoundingClientRect().height || 0;
  const onScroll = () => { lastScrollAt = now(); };

  function refreshNow() {
    timer = 0;
    if (!observer || !isEnabled()) return;
    const sinceScroll = now() - lastScrollAt;
    if (sinceScroll < settleMs) {
      timer = setTimeout(refreshNow, settleMs - sinceScroll);
      return;
    }
    const scrollTrigger = getScrollTrigger();
    // The height may have returned to where it was while we waited.
    if (Math.abs(bodyHeight() - settledHeight) < MIN_SHIFT_PX) return;
    scrollTrigger?.refresh?.();
  }

  function onResize(entries) {
    if (!isEnabled()) return;
    const entry = entries[entries.length - 1];
    const height = entry?.contentRect?.height ?? bodyHeight();
    if (Math.abs(height - settledHeight) < MIN_SHIFT_PX) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(refreshNow, settleMs);
  }

  function listenForRefresh() {
    const scrollTrigger = getScrollTrigger();
    if (!scrollTrigger?.addEventListener || listenedTrigger === scrollTrigger) return;
    refreshListener = () => { settledHeight = bodyHeight(); };
    scrollTrigger.addEventListener('refresh', refreshListener);
    listenedTrigger = scrollTrigger;
  }

  return {
    /** Starts watching. Safe to call repeatedly; only the first call attaches. */
    start() {
      if (typeof document === 'undefined' || !document.body) return;
      // ScrollTrigger may arrive after the first instance (it is fetched on
      // demand), so try to hook its refresh event on every start().
      listenForRefresh();
      if (observer || typeof ResizeObserver === 'undefined') return;
      settledHeight = bodyHeight();
      observer = new ResizeObserver(onResize);
      observer.observe(document.body);
      window.addEventListener('scroll', onScroll, { passive: true });
    },

    /** Stops watching and forgets everything; start() begins afresh. */
    stop() {
      if (timer) clearTimeout(timer);
      timer = 0;
      observer?.disconnect();
      if (observer) window.removeEventListener('scroll', onScroll);
      observer = null;
      lastScrollAt = -Infinity;
      if (listenedTrigger && refreshListener) listenedTrigger.removeEventListener?.('refresh', refreshListener);
      listenedTrigger = null;
      refreshListener = null;
      settledHeight = -1;
    }
  };
}
