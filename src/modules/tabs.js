import { clamp, env } from '../utils.js';

// Tabs — accessible tabbed interface following the WAI-ARIA / KRDS tab pattern.
// Markup: a container with `data-kt-tabs`, a tablist (`[role=tablist]` or
// `.kt-tablist`) of buttons, and matching panels (`[role=tabpanel]`,
// `.kt-tabpanel`, or `[data-kt-tabpanel]`) in source order.
//
// Keyboard (roving tabindex): ←/→ (or ↑/↓ when vertical) move between tabs,
// Home/End jump to first/last. `activation:"automatic"` (default) selects on
// focus; `"manual"` waits for Enter/Space. An animated indicator underlines the
// active tab; panels cross-fade/slide per `effect`. All themeable via
// `.kt-tab* ` classes and CSS variables.
export default {
  create(el, opts = {}) {
    const reduce = env().reducedMotion;
    const activation = opts.activation === 'manual' ? 'manual' : 'automatic';
    const orientation = opts.orientation === 'vertical' ? 'vertical' : 'horizontal';
    const duration = Math.max(0, Number(opts.duration ?? 0.28));
    const showIndicator = opts.indicator !== false;
    const effect = opts.effect || 'fade';

    const list = el.querySelector('[role="tablist"], .kt-tablist') || el.firstElementChild;
    if (!list) return null;
    const tabs = Array.from(list.querySelectorAll('button, a, [role="tab"], .kt-tab'))
      .filter((node) => node.closest('[role="tablist"], .kt-tablist') === list);
    const panels = Array.from(el.querySelectorAll('[role="tabpanel"], .kt-tabpanel, [data-kt-tabpanel]'));
    if (!tabs.length || !panels.length) return null;

    el.classList.add('kt-tabs', `kt-tabs--${orientation}`);
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-orientation', orientation);

    let indicator = null;
    if (showIndicator) {
      indicator = document.createElement('span');
      indicator.className = 'kt-tabs__indicator';
      indicator.setAttribute('aria-hidden', 'true');
      list.appendChild(indicator);
      if (getComputedStyle(list).position === 'static') list.style.position = 'relative';
    }

    let active = Math.max(0, tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true'));
    if (active < 0) active = 0;

    const uid = Math.random().toString(36).slice(2, 7);
    tabs.forEach((tab, i) => {
      tab.setAttribute('role', 'tab');
      tab.id = tab.id || `kt-tab-${uid}-${i}`;
      const panel = panels[i];
      if (panel) {
        panel.setAttribute('role', 'tabpanel');
        panel.id = panel.id || `kt-tabpanel-${uid}-${i}`;
        panel.setAttribute('aria-labelledby', tab.id);
        panel.setAttribute('tabindex', '0');
        tab.setAttribute('aria-controls', panel.id);
      }
    });

    const moveIndicator = () => {
      if (!indicator) return;
      const tab = tabs[active];
      if (orientation === 'vertical') {
        indicator.style.transform = `translateY(${tab.offsetTop}px)`;
        indicator.style.height = `${tab.offsetHeight}px`;
        indicator.style.width = '';
      } else {
        indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
        indicator.style.width = `${tab.offsetWidth}px`;
      }
    };

    const select = (index, focusTab = true) => {
      active = clamp(index, 0, tabs.length - 1);
      tabs.forEach((tab, i) => {
        const on = i === active;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.setAttribute('tabindex', on ? '0' : '-1');
        tab.classList.toggle('kt-active', on);
        const panel = panels[i];
        if (!panel) return;
        if (on) {
          panel.hidden = false;
          panel.classList.add('kt-active');
          if (!reduce && effect !== 'none' && duration > 0) {
            const from = effect === 'slide' ? 'translateX(8px)' : 'none';
            panel.animate([{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }], { duration: duration * 1000, easing: 'cubic-bezier(.22,.8,.3,1)' });
          }
        } else {
          panel.hidden = true;
          panel.classList.remove('kt-active');
        }
      });
      moveIndicator();
      if (focusTab) tabs[active].focus();
    };

    const onClick = (event) => { const i = tabs.indexOf(event.currentTarget); if (i >= 0) { event.preventDefault(); select(i, false); } };
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const onKey = (event) => {
      let next = null;
      if (event.key === nextKey) next = (tabs.indexOf(event.currentTarget) + 1) % tabs.length;
      else if (event.key === prevKey) next = (tabs.indexOf(event.currentTarget) - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else if ((event.key === 'Enter' || event.key === ' ') && activation === 'manual') { event.preventDefault(); select(tabs.indexOf(event.currentTarget), false); return; }
      if (next == null) return;
      event.preventDefault();
      tabs[next].focus();
      if (activation === 'automatic') select(next, false);
    };

    tabs.forEach((tab) => { tab.addEventListener('click', onClick); tab.addEventListener('keydown', onKey); });
    select(active, false);
    const onResize = () => moveIndicator();
    window.addEventListener('resize', onResize);
    requestAnimationFrame(moveIndicator);

    return {
      el,
      type: 'tabs',
      select: (i) => select(i, false),
      pause() {},
      resume() {},
      destroy() {
        window.removeEventListener('resize', onResize);
        tabs.forEach((tab) => { tab.removeEventListener('click', onClick); tab.removeEventListener('keydown', onKey); });
        indicator?.remove();
        el.classList.remove('kt-tabs', `kt-tabs--${orientation}`);
        panels.forEach((panel) => { panel.hidden = false; });
      }
    };
  },
  // Reduced motion: fully functional, just no panel/indicator animation.
  reduced(el, opts) { return this.create(el, opts); }
};
