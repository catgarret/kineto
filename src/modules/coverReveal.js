import { clamp, env } from '../utils.js';

// Cover reveal — coloured panel(s) cover the target and sweep away when it
// scrolls into view. Two modes:
//   • block (default): covers the whole element — good for images/cards.
//   • lines (`lines:true`): splits text into its rendered lines and covers each
//     line to its own width, revealing them one after another (staggered) —
//     the cover hugs the text, not the surrounding box.
// Options: color / color2 (panel colours), direction, duration, delay, ease,
// layers (1–3), stagger (ms between layers, and between lines), threshold.
// Reduced motion reveals instantly with no panels.
export default {
  create(el, opts = {}) {
    const reduce = env().reducedMotion;
    const color = opts.color || '#ff5b1c';
    const color2 = opts.color2 || '#12141a';
    const direction = ['left', 'right', 'up', 'down'].includes(opts.direction) ? opts.direction : 'right';
    const duration = Math.max(0.05, Number(opts.duration ?? 0.7));
    const delay = Math.max(0, Number(opts.delay ?? 0));
    const ease = opts.ease || 'cubic-bezier(.77,0,.18,1)';
    const layers = clamp(Math.round(Number(opts.layers ?? 2)), 1, 3);
    const stagger = Math.max(0, Number(opts.stagger ?? 120));
    const linesMode = opts.lines === true;
    const exitTransform = {
      right: 'translateX(101%)', left: 'translateX(-101%)',
      down: 'translateY(101%)', up: 'translateY(-101%)'
    }[direction];

    let timers = [];
    const covers = []; // { container, panels[], restoreOverflow, restorePosition }
    let observeTarget = el;
    let unwrap = null;

    // Add cover panels over a container and return a play() for it.
    const coverOf = (container) => {
      const restorePosition = container.style.position;
      const restoreOverflow = container.style.overflow;
      if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
      container.style.overflow = 'hidden';
      const panels = [];
      for (let i = 0; i < layers; i += 1) {
        const c = layers > 1 && i === layers - 1 ? color2 : color;
        const panel = document.createElement('span');
        panel.setAttribute('aria-hidden', 'true');
        panel.style.cssText = `position:absolute;inset:0;background:${c};z-index:${20 + i};transform:translate(0,0);transition:transform ${duration}s ${ease};pointer-events:none;will-change:transform;`;
        container.appendChild(panel);
        panels.push(panel);
      }
      covers.push({ container, panels, restorePosition, restoreOverflow });
      return panels;
    };

    if (linesMode) {
      // Split text into rendered lines, wrap each line, cover per line.
      buildLines();
    } else {
      // Block mode — wrap so panels overlay without disturbing layout.
      const cs = getComputedStyle(el);
      const inline = el.tagName === 'IMG' || cs.display.startsWith('inline');
      const wrap = document.createElement('div');
      wrap.className = 'kt-cover-wrap';
      wrap.style.cssText = `position:relative;overflow:hidden;display:${inline ? 'inline-block' : 'block'};`;
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
      observeTarget = wrap;
      unwrap = () => { if (wrap.parentNode) { wrap.parentNode.insertBefore(el, wrap); wrap.remove(); } };
      coverOf(wrap);
    }

    function buildLines() {
      const raw = el.textContent;
      // Measure with plain inline spans (they wrap naturally at the element's
      // real width); group by rendered top via getBoundingClientRect.
      const words = raw.split(/\s+/).filter((w) => w.length);
      el.textContent = '';
      const wordSpans = words.map((w, i) => {
        const s = document.createElement('span');
        s.textContent = w;
        el.appendChild(s);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
        return s;
      });
      const lines = [];
      let current = null; let lastTop = null;
      wordSpans.forEach((s) => {
        const top = Math.round(s.getBoundingClientRect().top);
        if (lastTop === null || Math.abs(top - lastTop) > 3) { current = []; lines.push(current); lastTop = top; }
        current.push(s);
      });
      el.textContent = '';
      lines.forEach((group) => {
        const line = document.createElement('span');
        line.className = 'kt-cover-line';
        line.style.cssText = 'position:relative;display:block;overflow:hidden;width:max-content;max-width:100%;';
        line.textContent = group.map((s) => s.textContent).join(' ');
        el.appendChild(line);
        coverOf(line);
      });
    }

    let played = false;
    let io = null;
    const play = () => {
      if (played) return;
      played = true;
      void el.offsetWidth; // paint the covered start frame first
      requestAnimationFrame(() => {
        covers.forEach((cover, lineIndex) => {
          const lineDelay = delay + (linesMode ? lineIndex * stagger : 0);
          cover.panels.forEach((panel, i) => {
            const order = layers - 1 - i;
            timers.push(setTimeout(() => { panel.style.transform = exitTransform; }, lineDelay + order * stagger));
          });
        });
      });
      const totalLines = linesMode ? Math.max(0, covers.length - 1) : 0;
      const total = delay + totalLines * stagger + (layers - 1) * stagger + duration * 1000 + 80;
      timers.push(setTimeout(() => {
        covers.forEach((cover) => cover.panels.forEach((panel) => panel.remove()));
        opts.onComplete?.(el);
      }, total));
    };

    if (reduce) {
      // Instantly visible — remove any panels.
      covers.forEach((cover) => cover.panels.forEach((panel) => panel.remove()));
    } else if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((records) => {
        for (const record of records) { if (record.isIntersecting) { io.disconnect(); io = null; play(); break; } }
      }, { threshold: clamp(Number(opts.threshold ?? 0.2), 0, 1) });
      io.observe(observeTarget);
    } else {
      play();
    }

    return {
      el,
      type: 'coverReveal',
      replay() {
        played = false;
        timers.forEach(clearTimeout); timers = [];
        if (reduce) return;
        covers.forEach((cover) => {
          cover.panels = [];
          for (let i = 0; i < layers; i += 1) {
            const c = layers > 1 && i === layers - 1 ? color2 : color;
            const panel = document.createElement('span');
            panel.style.cssText = `position:absolute;inset:0;background:${c};z-index:${20 + i};transform:translate(0,0);transition:transform ${duration}s ${ease};pointer-events:none;`;
            cover.container.appendChild(panel); cover.panels.push(panel);
          }
        });
        requestAnimationFrame(play);
      },
      pause() {}, resume() {},
      destroy() {
        io?.disconnect();
        timers.forEach(clearTimeout);
        covers.forEach((cover) => {
          cover.panels.forEach((panel) => panel.remove());
          cover.container.style.overflow = cover.restoreOverflow;
          cover.container.style.position = cover.restorePosition;
        });
        unwrap?.();
      }
    };
  },
  reduced(el, opts) { return this.create(el, opts); }
};
