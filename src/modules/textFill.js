import { clamp, segmentText, snapshotAttributes, ST } from '../utils.js';

export default {
  create(el, opts) {
    const scrollTrigger = ST();
    if (!scrollTrigger) return null;

    const baseColor = opts.baseColor || 'rgba(255,255,255,.15)';
    const fillColor = opts.fillColor || 'currentColor';
    const originalHTML = el.innerHTML;
    const restoreAttributes = snapshotAttributes(el, ['aria-label']);
    const text = el.textContent || '';
    el.setAttribute('aria-label', text);
    el.innerHTML = '';

    const spans = segmentText(text).map((char) => {
      if (/^\s$/.test(char)) {
        el.appendChild(document.createTextNode(char));
        return null;
      }
      const span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      span.textContent = char;
      // A hair of side padding (with compensating negative margin so layout is
      // unchanged) enlarges the background-clip:text box, so rounded glyph edges
      // — e.g. the right of an "O" — aren't shaved off under negative letter-spacing.
      span.style.cssText = `display:inline-block;padding:0 .06em;margin:0 -.06em;background-image:linear-gradient(to right,${fillColor} 50%,${baseColor} 50%);background-size:200% 100%;background-position:100% 0;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;`;
      el.appendChild(span);
      return span;
    }).filter(Boolean);

    // Fractional fill: finished glyphs are solid, the active glyph sweeps
    // left-to-right, so the fill feels continuous instead of stepping.
    const paint = (progress) => {
      const exact = clamp(progress, 0, 1) * spans.length;
      spans.forEach((span, index) => {
        const local = clamp(exact - index, 0, 1);
        span.style.backgroundPosition = `${100 - local * 100}% 0`;
      });
    };
    paint(0);

    const trigger = scrollTrigger.create({
      trigger: el,
      start: opts.start || 'top 70%',
      end: opts.end || 'bottom 30%',
      scrub: opts.scrub ?? 0.8,
      onUpdate: (self) => {
        paint(self.progress);
        opts.onUpdate?.(self.progress, el, self);
      }
    });

    return {
      el,
      type: 'textFill',
      pause: () => trigger.disable(),
      resume: () => trigger.enable(),
      destroy: () => {
        trigger.kill();
        el.innerHTML = originalHTML;
        restoreAttributes();
      }
    };
  },
  reduced(el) {
    const spans = Array.from(el.querySelectorAll('span'));
    const colors = spans.map((span) => span.style.color);
    spans.forEach((span) => { span.style.color = 'currentColor'; });
    return {
      el, type: 'textFill', pause() {}, resume() {},
      destroy() { spans.forEach((span, index) => { span.style.color = colors[index]; }); }
    };
  }
};
