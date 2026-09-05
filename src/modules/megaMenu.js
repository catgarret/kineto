import { env, snapshotAttributes } from '../utils.js';

let panelUid = 0;

function nextPanelId(panel) {
  let id;
  do {
    id = `kt-menu-panel-${++panelUid}`;
  } while (panel.getRootNode?.().getElementById?.(id) || panel.ownerDocument.getElementById(id));
  return id;
}

// Mega-menu / GNB — turns a nested <nav><ul><li> structure into an accessible
// navigation with hover-to-open dropdowns (Korean GNB style) or full-width
// mega panels. Progressive enhancement: without JS it is a plain nested list;
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
    const layout = opts.layout === 'mega' ? 'mega' : 'dropdown';
    const openDelay = Math.max(0, Number(opts.openDelay ?? 60));
    const closeDelay = Math.max(0, Number(opts.closeDelay ?? 180));
    const duration = Math.max(0.05, Number(opts.duration ?? 0.24));
    const responsive = opts.responsive === 'scroll' || opts.responsive === 'custom'
      ? opts.responsive
      : 'wrap';
    // Optional open/close indicator icon on each trigger (like an accordion):
    // 'chevron' rotates, 'plus' turns into ×. State hook = aria-expanded.
    const indicator = ['chevron', 'plus'].includes(opts.indicator) ? opts.indicator : 'none';

    const restoreMenu = snapshotAttributes(el, ['class']);
    el.classList.add(
      'kt-menu',
      `kt-menu--${layout}`,
      `kt-menu--responsive-${responsive}`,
      `kt-menu--ind-${indicator}`
    );
    const focusables = (panel) => Array.from(panel.querySelectorAll(
      'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'
    ));

    const entries = [];
    let openEntry = null;
    let openTimer = null;
    let closeTimer = null;

    const stopAnimation = (entry) => {
      if (!entry.a) return;
      entry.a.onfinish = entry.a.oncancel = null;
      entry.a.cancel();
      entry.a = null;
    };

    const placeResponsivePanel = ({ p: panel, t: trigger }) => {
      // Both scrollable and wrapped mobile GNBs need a viewport-anchored panel.
      // A dropdown left absolute under a wrapped item can otherwise be clipped
      // by its card or open outside the visible mobile viewport.
      if (responsive === 'custom' || window.innerWidth > 720) return;
      const bottom = trigger.getBoundingClientRect().bottom + 6;
      panel.style.setProperty(
        '--kt-menu-panel-top',
        `${Math.max(12, Math.min(bottom, window.innerHeight - 172))}px`
      );
    };

    const doOpen = (entry) => {
      const { i: item, p: panel, t: trigger } = entry;
      clearTimeout(closeTimer);
      if (openEntry === entry) return;
      if (openEntry) doClose(openEntry, true);
      // Cancel a pending close before making the panel visible. The close
      // animation's oncancel handler hides the panel, so cancelling it after
      // `hidden = false` would immediately undo a rapid reopen.
      stopAnimation(entry);
      openEntry = entry;
      item.classList.add('kt-open');
      trigger.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      placeResponsivePanel(entry);
      if (!reduce && typeof panel.animate === 'function') {
        entry.a = panel.animate(
          [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: duration * 1000, easing: 'cubic-bezier(.22,.8,.3,1)' }
        );
      }
    };

    const doClose = (entry, instant) => {
      if (!entry) return;
      const { i: item, p: panel, t: trigger } = entry;
      item.classList.remove('kt-open');
      trigger.setAttribute('aria-expanded', 'false');
      const hide = () => {
        panel.hidden = true;
        entry.a = null;
      };
      stopAnimation(entry);
      if (reduce || instant || typeof panel.animate !== 'function') hide();
      else {
        entry.a = panel.animate(
          [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-6px)' }],
          { duration: duration * 700, easing: 'ease' }
        );
        entry.a.onfinish = hide;
        entry.a.oncancel = hide;
      }
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
          stopAnimation(entry);
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
