import { env } from '../utils.js';

// Accordion — animates native <details>/<summary> open & close with a springy
// height morph and a blur-in on the content, keeping the browser's built-in
// semantics and keyboard support (Enter/Space toggle, aria-expanded). Under
// reduced motion it leaves the native <details> untouched (instant, accessible).
export default {
  create(el, opts = {}) {
    const items = el.matches('details') ? [el] : Array.from(el.querySelectorAll('details'));
    if (!items.length) return null;

    const duration = Math.max(0.05, Number(opts.duration ?? 0.4));
    const ease = opts.ease || 'cubic-bezier(.22,.8,.3,1)';
    const single = opts.single === true;
    const blur = Math.max(0, Number(opts.blur ?? 6));
    // Arrow side is a CSS hook: `left` puts the chevron before the label.
    const arrowPosition = opts.arrowPosition === 'left' ? 'left' : 'right';
    el.classList.add('kt-accordion');
    el.classList.toggle('kt-accordion--arrow-left', arrowPosition === 'left');
    const entries = [];

    const build = (details) => {
      const summary = details.querySelector('summary');
      if (!summary) return null;
      const panel = document.createElement('div');
      panel.className = 'kt-accordion-panel';
      panel.style.overflow = 'hidden';
      Array.from(details.childNodes).forEach((node) => { if (node !== summary) panel.appendChild(node); });
      details.appendChild(panel);
      // Styling hooks: `.kt-accordion-summary` on the trigger and `.kt-open` on an
      // open item, so the arrow / colours / effects can be themed purely in CSS
      // (see the default chevron in kineto.css, override via CSS vars or selectors).
      summary.classList.add('kt-accordion-summary');
      if (details.open) details.classList.add('kt-open');
      let anim = null;
      const stop = () => { if (anim) { anim.cancel(); anim = null; } };
      const openIt = () => {
        stop();
        details.open = true;
        details.classList.add('kt-open');
        const target = panel.scrollHeight;
        anim = panel.animate(
          [{ height: '0px', opacity: 0, filter: `blur(${blur}px)` }, { height: `${target}px`, opacity: 1, filter: 'blur(0px)' }],
          { duration: duration * 1000, easing: ease }
        );
        anim.onfinish = () => { panel.style.height = ''; anim = null; };
      };
      const closeIt = () => {
        stop();
        details.classList.remove('kt-open'); // arrow rotates back during the close
        const start = panel.scrollHeight;
        anim = panel.animate(
          [{ height: `${start}px`, opacity: 1, filter: 'blur(0px)' }, { height: '0px', opacity: 0, filter: `blur(${blur}px)` }],
          { duration: duration * 1000, easing: ease }
        );
        anim.onfinish = () => { details.open = false; anim = null; };
      };
      const onClick = (event) => {
        event.preventDefault();
        if (details.open) { closeIt(); return; }
        if (single) entries.forEach((other) => { if (other.details !== details && other.details.open) other.closeIt(); });
        openIt();
      };
      summary.addEventListener('click', onClick);
      const entry = {
        details,
        closeIt,
        destroy() {
          stop();
          summary.removeEventListener('click', onClick);
          summary.classList.remove('kt-accordion-summary');
          details.classList.remove('kt-open');
          Array.from(panel.childNodes).forEach((node) => details.insertBefore(node, panel));
          panel.remove();
        }
      };
      return entry;
    };

    items.forEach((details) => { const entry = build(details); if (entry) entries.push(entry); });

    return {
      el,
      type: 'accordion',
      pause() {},
      resume() {},
      destroy() {
        entries.forEach((entry) => entry.destroy());
        el.classList.remove('kt-accordion', 'kt-accordion--arrow-left');
      }
    };
  },
  // Reduced motion: don't touch <details> — native toggle is instant & accessible.
  reduced(el) {
    return { el, type: 'accordion', pause() {}, resume() {}, destroy() {} };
  }
};
