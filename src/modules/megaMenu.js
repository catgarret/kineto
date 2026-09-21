import { dropEmptyAttributes, env, numberOption, snapshotAttributes, snapshotInlineStyles } from '../utils.js';

let panelUid = 0;

function nextPanelId(panel) {
  let id;
  do {
    id = `kt-menu-panel-${++panelUid}`;
  } while (panel.getRootNode?.().getElementById?.(id) || panel.ownerDocument.getElementById(id));
  return id;
}

// Everything inside a panel that a keyboard can land on. This lives at module
// scope because the radial layout places the same list on its arc — two copies
// of a "what counts as an item" selector is exactly how the ring and the
// keyboard order drift apart.
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
const focusables = (panel) => Array.from(panel.querySelectorAll(FOCUSABLE));

/**
 * Where each item sits on the arc, in degrees clockwise from 12 o'clock.
 *
 * `sweep` is the WHOLE arc rather than the gap between two items, so N items
 * are spread over N-1 gaps. A full circle is the exception: there the first and
 * last position are the same point, so dividing by N-1 would stack two items on
 * top of each other and leave a hole opposite them.
 */
function arcAngles(count, start, sweep) {
  if (count <= 1) return [start];
  const steps = Math.abs(sweep) >= 359.5 ? count : count - 1;
  return Array.from({ length: count }, (_, index) => start + (sweep * index) / steps);
}

/**
 * Degrees clockwise from 12 o'clock → the {x, y} offset of that point on a
 * circle of `radius`.
 *
 * Maths measures angles anticlockwise from 3 o'clock, and screen y runs DOWN,
 * which together happen to cancel out into a single -90° turn. Doing it here,
 * once, is what lets the published option mean the obvious thing: `0` is up,
 * `90` is right, the way somebody reading a clock would say it.
 */
function arcOffset(degrees, radius) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: Math.cos(radians) * radius, y: Math.sin(radians) * radius };
}

/**
 * A length for the stylesheet. Trigonometry hands back 1.2e-14 where the answer
 * is plainly zero, and `(-1.2e-14).toFixed(2)` is the string `-0.00` — a value
 * that is correct, unreadable, and different on every platform's last bit.
 */
function px(value) {
  return `${Math.abs(value) < 0.005 ? 0 : Number(value.toFixed(2))}px`;
}

/*
 * HOW A PANEL COMES AND GOES is the only thing the layouts disagree about.
 * Triggers, ARIA, the keyboard map, one-panel-open-at-a-time and the
 * close-on-outside-click are shared — which is the whole reason `radial` is a
 * layout of this module rather than a module of its own. A fourth layout is a
 * fourth object below, not another branch inside doOpen().
 *
 * Each object implements:
 *   attach(entry)                 once, while the menu is being built
 *   open(entry)                   the panel has just been made visible
 *   close(entry, hide, instant)   animate out, then call hide() when the panel
 *                                 may leave the page
 *   cut(entry)                    abandon whatever is in flight (a fast reopen)
 *   detach(entry)                 put back everything attach() changed
 */

/**
 * Stacked panels — `dropdown` and `mega`. The panel slides and fades as one
 * block, which is what it has always done.
 */
function slidePanels({ duration, responsive, reduce }) {
  const animates = (panel) => !reduce && typeof panel.animate === 'function';
  return {
    attach() {},
    detach() {},
    cut(entry) {
      if (!entry.a) return;
      entry.a.onfinish = entry.a.oncancel = null;
      entry.a.cancel();
      entry.a = null;
    },
    open(entry) {
      // Both scrollable and wrapped mobile GNBs need a viewport-anchored panel.
      // A dropdown left absolute under a wrapped item can otherwise be clipped
      // by its card or open outside the visible mobile viewport.
      if (responsive !== 'custom' && window.innerWidth <= 720) {
        const bottom = entry.t.getBoundingClientRect().bottom + 6;
        entry.p.style.setProperty(
          '--kt-menu-panel-top',
          `${Math.max(12, Math.min(bottom, window.innerHeight - 172))}px`
        );
      }
      if (!animates(entry.p)) return;
      entry.a = entry.p.animate(
        [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: duration * 1000, easing: 'cubic-bezier(.22,.8,.3,1)' }
      );
    },
    close(entry, hide, instant) {
      if (instant || !animates(entry.p)) { hide(); return; }
      entry.a = entry.p.animate(
        [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-6px)' }],
        { duration: duration * 700, easing: 'ease' }
      );
      entry.a.onfinish = hide;
      entry.a.oncancel = hide;
    }
  };
}

/**
 * Radial — the items fan out on an arc around their own trigger instead of
 * stacking under it.
 *
 * The ring is measured ONCE, while the menu is built: it depends on how many
 * links the panel holds and on the options, never on the pointer or on the
 * scroll position, so there is nothing to recompute when it opens.
 *
 * Only the measured numbers reach the DOM — each item's offset and its share of
 * the stagger, as CSS custom properties. The transform that uses them, the
 * collapsed state and the easing all stay in kineto.css, so a page can restyle
 * the ring (or turn it into something else entirely) without touching any
 * JavaScript.
 */
function radialPanels({ radius, start, sweep, stagger, duration, reduce }) {
  const rings = new Map();
  return {
    attach(entry) {
      const items = focusables(entry.p);
      const angles = arcAngles(items.length, start, sweep);
      const undo = items.map((node, index) => {
        const restore = snapshotInlineStyles(node, ['--kt-menu-x', '--kt-menu-y', '--kt-menu-delay']);
        const { x, y } = arcOffset(angles[index], radius);
        node.classList.add('kt-menu-item');
        node.style.setProperty('--kt-menu-x', px(x));
        node.style.setProperty('--kt-menu-y', px(y));
        node.style.setProperty('--kt-menu-delay', `${reduce ? 0 : index * stagger}ms`);
        return () => {
          node.classList.remove('kt-menu-item');
          restore();
          // Putting every property back still leaves the husk of an empty
          // `style=""` on an element that had none. This is the shared helper.
          dropEmptyAttributes(node);
        };
      });
      entry.p.style.setProperty('--kt-menu-ring-duration', `${duration}s`);
      // How long the whole ring takes to settle: the last item waits out
      // everyone else's stagger before it even starts moving.
      const settle = reduce ? 0 : duration * 1000 + Math.max(0, items.length - 1) * stagger;
      rings.set(entry, { undo, settle, timer: null });
    },
    detach(entry) {
      const ring = rings.get(entry);
      if (!ring) return;
      clearTimeout(ring.timer);
      ring.undo.forEach((restore) => restore());
      rings.delete(entry);
    },
    cut(entry) {
      const ring = rings.get(entry);
      if (!ring) return;
      clearTimeout(ring.timer);
      ring.timer = null;
    },
    open(entry) {
      // A moment ago the panel was `hidden`, which is `display:none`, so its
      // items had no box at all — and a transition out of "no box" does not
      // run. Reading a layout property flushes the collapsed state to the
      // screen first, which gives the transition the start value it needs.
      void entry.p.offsetWidth;
      entry.p.classList.add('kt-menu-ring-open');
    },
    close(entry, hide, instant) {
      entry.p.classList.remove('kt-menu-ring-open');
      const ring = rings.get(entry);
      if (instant || !ring?.settle) { hide(); return; }
      // `hidden` is display:none, and that cancels a transition mid-flight, so
      // the panel may only leave once the last item is home.
      ring.timer = setTimeout(hide, ring.settle);
    }
  };
}

// Mega-menu / GNB — turns a nested <nav><ul><li> structure into an accessible
// navigation with hover-to-open dropdowns (Korean GNB style), full-width mega
// panels, or a radial menu whose items fan out around their own trigger.
// Progressive enhancement: without JS it is a plain nested list;
// the module adds the interaction, ARIA (aria-haspopup / aria-expanded /
// aria-controls) and full keyboard support (Enter/Space/↓ open, Esc close &
// return focus, ←/→ move between top items). One panel open at a time.
//
// Expected markup:
//   <nav data-kt-mega-menu>
//     <ul>
//       <li><button>Products</button><div class="kt-menu-panel">…</div></li>
//       …
//     </ul>
//   </nav>
//
// The same markup is the radial menu — `layout="radial"` places the panel's
// links on an arc around their trigger instead of stacking them underneath.
export default {
  create(el, opts = {}) {
    const directItems = Array.from(el.querySelectorAll('li')).filter(
      (li) => li.querySelector(':scope > .kt-menu-panel')
    );
    if (!directItems.length) return null;

    const reduce = env().reducedMotion;
    // `hover` and `pointer` describe the PRIMARY input only. On a touchscreen
    // laptop — a Surface, a touch-enabled Windows notebook, an iPad with a
    // trackpad — the primary pointer is reported as coarse and non-hovering even
    // though a mouse is attached and in use. `(hover: hover)` is false there, so
    // the mouseenter listeners below were never bound, the pointer handler bails
    // out on `pointerType === 'mouse'`, and hovering the menu did nothing at all
    // while clicking still worked.
    //
    // `any-hover` / `any-pointer` are the queries for "at least one available
    // input can do this", which is the actual question being asked. A phone still
    // answers no (it has no fine, hovering input), so touch behaviour is
    // unchanged.
    const canHover = typeof matchMedia !== 'undefined'
      && matchMedia('(any-hover: hover) and (any-pointer: fine)').matches;
    const trigger = opts.trigger === 'click' ? 'click' : 'hover';
    const layout = ['mega', 'radial'].includes(opts.layout) ? opts.layout : 'dropdown';
    const openDelay = numberOption(opts.openDelay, 60, 0);
    const closeDelay = numberOption(opts.closeDelay, 180, 0);
    const duration = numberOption(opts.duration, 0.24, 0.05);
    const responsive = opts.responsive === 'scroll' || opts.responsive === 'custom'
      ? opts.responsive
      : 'wrap';
    // Optional open/close indicator icon on each trigger (like an accordion):
    // 'chevron' rotates, 'plus' turns into ×. State hook = aria-expanded.
    const indicator = ['chevron', 'plus'].includes(opts.indicator) ? opts.indicator : 'none';

    // The ring's four options are read HERE, inside the layout test, so that
    // scripts/derive-variant-options.mjs attributes them to `radial` alone. A
    // dropdown offering a `sweep` control it never reads is exactly the drift
    // that script exists to prevent.
    const transition = layout === 'radial'
      ? radialPanels({
        radius: numberOption(opts.radius, 104, 8, 2000),
        start: numberOption(opts.startAngle, -90, -360, 360),
        sweep: numberOption(opts.sweep, 180, -360, 360),
        stagger: numberOption(opts.stagger, 40, 0, 2000),
        duration,
        reduce
      })
      : slidePanels({ duration, responsive, reduce });

    const restoreMenu = snapshotAttributes(el, ['class']);
    el.classList.add(
      'kt-menu',
      `kt-menu--${layout}`,
      `kt-menu--responsive-${responsive}`,
      `kt-menu--ind-${indicator}`
    );
    const entries = [];
    let openEntry = null;
    let openTimer = null;
    let closeTimer = null;

    const doOpen = (entry) => {
      const { i: item, p: panel, t: trg } = entry;
      clearTimeout(closeTimer);
      if (openEntry === entry) return;
      if (openEntry) doClose(openEntry, true);
      // Abandon a pending close before making the panel visible. Closing hides
      // the panel when it finishes, so letting that land after `hidden = false`
      // would immediately undo a rapid reopen.
      transition.cut(entry);
      openEntry = entry;
      item.classList.add('kt-open');
      trg.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      transition.open(entry);
    };

    const doClose = (entry, instant) => {
      if (!entry) return;
      const { i: item, p: panel, t: trg } = entry;
      item.classList.remove('kt-open');
      trg.setAttribute('aria-expanded', 'false');
      const hide = () => {
        panel.hidden = true;
        entry.a = null;
      };
      transition.cut(entry);
      transition.close(entry, hide, instant);
      if (openEntry === entry) openEntry = null;
    };

    directItems.forEach((li) => {
      const panel = li.querySelector(':scope > .kt-menu-panel');
      const trg = li.querySelector('a,button,summary,[role="button"]') || li.firstElementChild;
      if (!panel || !trg) return;
      const restore = [
        snapshotAttributes(li, ['class']),
        snapshotAttributes(trg, ['class', 'aria-haspopup', 'aria-expanded', 'aria-controls']),
        snapshotAttributes(panel, ['class', 'style', 'id', 'hidden'])
      ];
      if (!panel.id) panel.id = nextPanelId(panel);
      panel.hidden = true;
      trg.setAttribute('aria-haspopup', 'true');
      trg.setAttribute('aria-expanded', 'false');
      trg.setAttribute('aria-controls', panel.id);
      trg.classList.add('kt-menu-trigger');
      // Per-item trigger override: mix hover mega-menus with click dropdowns.
      const rawItemTrigger = li.getAttribute('data-kt-menu-trigger');
      const itemTrigger = rawItemTrigger === 'click' ? 'click' : rawItemTrigger === 'hover' ? 'hover' : trigger;
      // Optional external hover zone(s): pointing at any element matching this
      // selector opens THIS item's panel (e.g. hovering a banner opens the mega).
      const zoneSel = li.getAttribute('data-kt-menu-open');
      const zones = zoneSel ? Array.from(document.querySelectorAll(zoneSel)) : [];

      // Compact keys keep this private hot-path record from being repeated
      // verbatim across the ESM, UMD and modular release artifacts.
      const entry = {
        i: li, p: panel, t: trg, a: null,
        r: restore
      };
      const index = () => entries.indexOf(entry);

      const onEnter = () => { clearTimeout(closeTimer); clearTimeout(openTimer); openTimer = setTimeout(() => doOpen(entry), openDelay); };
      const onLeave = () => { clearTimeout(openTimer); clearTimeout(closeTimer); closeTimer = setTimeout(() => doClose(entry), closeDelay); };
      const onClick = (event) => {
        // A viewport can become narrow while still reporting a fine, hoverable
        // pointer (desktop resize, split-screen, or a tablet with a mouse).
        // Keep normal desktop hover/navigation behaviour, but let responsive
        // menus toggle by click at the same breakpoint used by the CSS.
        if (hoverMode && canHover && window.innerWidth > 720) return;
        event.preventDefault();
        (openEntry === entry) ? doClose(entry) : doOpen(entry);
      };
      const onKey = (event) => {
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault(); doOpen(entry); focusables(panel)[0]?.focus();
        } else if (event.key === 'Escape') {
          doClose(entry); trg.focus();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault(); entries[(index() + 1) % entries.length].t.focus();
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault(); entries[(index() - 1 + entries.length) % entries.length].t.focus();
        }
      };
      const onPanelKey = (event) => {
        if (event.key === 'Escape') { doClose(entry); trg.focus(); return; }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          // Roving up/down movement between the links inside the open panel.
          const links = focusables(panel);
          if (!links.length) return;
          event.preventDefault();
          const cur = links.indexOf(document.activeElement);
          const nextIdx = event.key === 'ArrowDown'
            ? (cur + 1) % links.length
            : (cur - 1 + links.length) % links.length;
          links[nextIdx].focus();
        }
      };
      const onFocusOut = (event) => { if (!li.contains(event.relatedTarget)) doClose(entry); };

      const hoverMode = itemTrigger === 'hover';
      if (canHover && (hoverMode || zones.length)) { li.addEventListener('mouseenter', onEnter); li.addEventListener('mouseleave', onLeave); }
      // Touch browsers consistently synthesize click, but opening on pointerup
      // as well avoids a menu being lost when a page-level touch handler cancels
      // that synthetic click. The timestamp guard keeps one tap to one toggle.
      let lastTouchToggle = -Infinity;
      const onPointerUp = (event) => {
        if (event.pointerType === 'mouse' || (hoverMode && canHover && window.innerWidth > 720)) return;
        const now = performance.now();
        if (now - lastTouchToggle < 400) return;
        lastTouchToggle = now;
        event.preventDefault();
        (openEntry === entry) ? doClose(entry) : doOpen(entry);
      };
      const guardedClick = (event) => {
        if (event.detail === 0 || performance.now() - lastTouchToggle >= 400) onClick(event);
      };
      trg.addEventListener('pointerup', onPointerUp);
      trg.addEventListener('click', guardedClick);
      if (canHover) zones.forEach((z) => { z.addEventListener('mouseenter', onEnter); z.addEventListener('mouseleave', onLeave); });
      trg.addEventListener('keydown', onKey);
      panel.addEventListener('keydown', onPanelKey);
      li.addEventListener('focusout', onFocusOut);

      entry.h = [onEnter, onLeave, guardedClick, onPointerUp, onKey, onPanelKey, onFocusOut, zones];
      // Last, because a layout that measures its items (radial) needs the panel
      // in its final, hidden-but-wired state before it reads them.
      transition.attach(entry);
      entries.push(entry);
    });

    if (!entries.length) { restoreMenu(); return null; }

    // Click / Esc anywhere outside an open menu closes it.
    const onDocDown = (event) => { if (openEntry && !openEntry.i.contains(event.target)) doClose(openEntry); };
    const onDocKey = (event) => { if (event.key === 'Escape' && openEntry) { const e = openEntry; doClose(e); e.t.focus(); } };
    document.addEventListener('pointerdown', onDocDown, true);
    document.addEventListener('keydown', onDocKey);

    return {
      el,
      type: 'megaMenu',
      pause() {},
      resume() {},
      destroy() {
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
        document.removeEventListener('pointerdown', onDocDown, true);
        document.removeEventListener('keydown', onDocKey);
        entries.forEach((entry) => {
          const { i: item, p: panel, t: trigger, h: handlers, r: restore } = entry;
          const [onEnter, onLeave, onClick, onPointerUp, onKey, onPanelKey, onFocusOut, zones] = handlers;
          transition.cut(entry);
          transition.detach(entry);
          item.removeEventListener('mouseenter', onEnter);
          item.removeEventListener('mouseleave', onLeave);
          trigger.removeEventListener('pointerup', onPointerUp);
          trigger.removeEventListener('click', onClick);
          trigger.removeEventListener('keydown', onKey);
          panel.removeEventListener('keydown', onPanelKey);
          item.removeEventListener('focusout', onFocusOut);
          zones.forEach((z) => { z.removeEventListener('mouseenter', onEnter); z.removeEventListener('mouseleave', onLeave); });
          restore.forEach((restoreState) => restoreState());
        });
        restoreMenu();
      }
    };
  },
  // Reduced motion: still fully functional, just no open/close animation.
  reduced(el, opts) { return this.create(el, opts); }
};
