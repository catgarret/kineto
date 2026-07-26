import { clamp, cssEase, env } from '../utils.js';

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
    const requestedDirection = ['left', 'right', 'up', 'down', 'random'].includes(opts.direction) ? opts.direction : 'right';
    const duration = Math.max(0.05, Number(opts.duration ?? 0.7));
    const delay = Math.max(0, Number(opts.delay ?? 0));
    const ease = opts.ease ? cssEase(opts.ease) : 'cubic-bezier(.77,0,.18,1)';
    const layers = clamp(Math.round(Number(opts.layers ?? 2)), 1, 3);
    const stagger = Math.max(0, Number(opts.stagger ?? 120));
    const linesMode = opts.lines === true;
    const pickDirection = () => requestedDirection === 'random'
      ? ['left', 'right', 'up', 'down'][Math.floor(Math.random() * 4)]
      : requestedDirection;
    const exitFor = (direction) => ({
      right: 'translateX(101%)', left: 'translateX(-101%)',
      down: 'translateY(101%)', up: 'translateY(-101%)'
    }[direction]);

    let timers = [];
    const covers = []; // { container, panels[], restoreOverflow, restorePosition }
    let observeTarget = el;
    let unwrap = null;
    let alive = true;

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

    let linesText = null; // original text — restored on destroy (lines mode)

    const coverBlock = () => {
      // Block mode — wrap so panels overlay without disturbing layout.
      const cs = getComputedStyle(el);
      const inline = el.tagName === 'IMG' || cs.display.startsWith('inline');
      const wrap = document.createElement('div');
      wrap.className = 'kt-cover-wrap';
      // Inherit the element's rounding so the panels are clipped to the same
      // shape (otherwise their square corners poke outside a rounded element).
      wrap.style.cssText = `position:relative;overflow:hidden;display:${inline ? 'inline-block' : 'block'};width:${inline ? 'auto' : '100%'};height:${inline ? 'auto' : '100%'};min-width:0;min-height:0;border-radius:${cs.borderRadius};`;
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
      observeTarget = wrap;
      unwrap = () => { if (wrap.parentNode) { wrap.parentNode.insertBefore(el, wrap); wrap.remove(); } };
      coverOf(wrap);
    };

    function buildLines() {
      const raw = el.textContent;
      const words = raw.split(/\s+/).filter((w) => w.length);
      // Nothing to line-split (e.g. an image, or empty) — leave the element
      // untouched so the caller can fall back to a whole-element block cover.
      if (words.length < 1) return false;
      linesText = raw;
      // Measure with plain inline spans (they wrap naturally at the element's
      // real width); group by rendered top via getBoundingClientRect.
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
      return true;
    }

    // Lines mode only when there's real text; otherwise a whole-element cover.
    if (!(linesMode && buildLines())) coverBlock();

    let played = false;
    let io = null;
    let initRaf = null;
    const play = () => {
      if (!alive || played) return;
      played = true;
      const exitTransform = exitFor(pickDirection());
      void el.offsetWidth; // paint the covered start frame first
      requestAnimationFrame(() => {
        covers.forEach((cover, lineIndex) => {
          const lineDelay = delay + (linesMode ? lineIndex * stagger : 0);
          cover.panels.forEach((panel, i) => {
            const order = layers - 1 - i;
          timers.push(setTimeout(() => { if (alive) panel.style.transform = exitTransform; }, lineDelay + order * stagger));
          });
        });
      });
      const totalLines = linesMode ? Math.max(0, covers.length - 1) : 0;
      const total = delay + totalLines * stagger + (layers - 1) * stagger + duration * 1000 + 80;
      timers.push(setTimeout(() => {
        if (!alive) return;
        covers.forEach((cover) => cover.panels.forEach((panel) => panel.remove()));
        opts.onComplete?.(el);
      }, total));
    };

    // Load-aware: if this wraps an <img> that isn't decoded yet, hold the sweep
    // until it loads so the reveal never uncovers a blank frame. `waitForImage`
    // (default true) turns it off. Text (lines) mode never waits.
    const waitForImage = opts.waitForImage !== false;
    const img = !linesMode ? (el.tagName === 'IMG' ? el : (el.querySelector && el.querySelector('img'))) : null;
    const startPlay = () => {
      if (waitForImage && img && !(img.complete && img.naturalWidth)) {
        let fired = false;
        const kick = () => {
          if (fired || !alive) return;
          fired = true;
          img.removeEventListener('load', kick);
          img.removeEventListener('error', kick);
          play();
        };
        try { if (img.decode) img.decode().then(kick, kick); } catch (_e) { /* ignore */ }
        img.addEventListener('load', kick, { once: true });
        img.addEventListener('error', kick, { once: true });
        timers.push(setTimeout(kick, 4000)); // safety: never hang
      } else {
        play();
      }
    };

    if (reduce) {
      // Instantly visible — remove any panels.
      covers.forEach((cover) => cover.panels.forEach((panel) => panel.remove()));
    } else if (typeof IntersectionObserver !== 'undefined') {
      // Live settings recreate a cover while its demo is already visible.
      // Some browsers do not deliver a new observer entry before the opaque
      // start panel paints, leaving the demo black indefinitely. Start directly
      // for an on-screen target; observe only targets that are actually outside.
      initRaf = requestAnimationFrame(() => {
        if (!alive) return;
        const rect = observeTarget.getBoundingClientRect();
        const visibleNow = rect.bottom > 0 && rect.right > 0
          && rect.top < window.innerHeight && rect.left < window.innerWidth;
        if (visibleNow) {
          startPlay();
          return;
        }
        io = new IntersectionObserver((records) => {
          for (const record of records) {
            if (record.isIntersecting) {
              io.disconnect();
              io = null;
              startPlay();
              break;
            }
          }
        }, { threshold: clamp(Number(opts.threshold ?? 0.2), 0, 1) });
        io.observe(observeTarget);
      });
    } else {
      startPlay();
    }

    return {
      el,
      type: 'coverReveal',
      replay() {
        played = false;
        timers.forEach(clearTimeout); timers = [];
        if (reduce) return;
        covers.forEach((cover) => {
          // A replay may be requested before the previous sweep's cleanup timer
          // fires (live settings and gallery shuffle both do this). Remove those
          // panels first; otherwise every replay stacks another opaque layer set.
          cover.panels.forEach((panel) => panel.remove());
          cover.panels = [];
          for (let i = 0; i < layers; i += 1) {
            const c = layers > 1 && i === layers - 1 ? color2 : color;
            const panel = document.createElement('span');
            panel.setAttribute('aria-hidden', 'true');
            panel.style.cssText = `position:absolute;inset:0;background:${c};z-index:${20 + i};transform:translate(0,0);transition:transform ${duration}s ${ease};pointer-events:none;`;
            cover.container.appendChild(panel); cover.panels.push(panel);
          }
        });
        requestAnimationFrame(play);
      },
      pause() {}, resume() {},
      destroy() {
        alive = false;
        io?.disconnect();
        if (initRaf != null) cancelAnimationFrame(initRaf);
        timers.forEach(clearTimeout);
        covers.forEach((cover) => {
          cover.panels.forEach((panel) => panel.remove());
          cover.container.style.overflow = cover.restoreOverflow;
          cover.container.style.position = cover.restorePosition;
        });
        unwrap?.();
        // Lines mode replaced the text with per-line spans — put the text back.
        if (linesText != null) el.textContent = linesText;
      }
    };
  },
  reduced(el, opts) { return this.create(el, opts); }
};
