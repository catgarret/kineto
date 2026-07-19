import { hangulFrames, segmentText, snapshotAttributes } from '../utils.js';

export default {
  create(el, opts) {
    const originalHTML = el.innerHTML;
    const restoreAttributes = snapshotAttributes(el, ['aria-label']);
    const strings = Array.isArray(opts.strings)
      ? opts.strings.map(String)
      : opts.strings != null
        ? [String(opts.strings)]
        : [el.textContent || ''];
    const typeSpeed = Number(opts.typeSpeed ?? 60);
    const eraseSpeed = Number(opts.eraseSpeed ?? 30);
    const pauseAfter = Number(opts.pauseAfter ?? 1500);
    const loop = opts.loop !== false;
    // caret(|) 표시 여부와 모양, 한글 자모 조합 타이핑 여부를 옵션으로 제어한다.
    const caretEnabled = opts.caret !== false;
    const caretChar = String(opts.caretChar ?? '|');
    const hangul = opts.hangul === true || opts.compose === true;

    el.setAttribute('aria-label', strings.join(', '));
    el.innerHTML = `<span class="kt-tw-text" aria-hidden="true"></span>${caretEnabled ? `<span class="kt-tw-caret" aria-hidden="true">${caretChar}</span>` : ''}`;
    const textEl = el.querySelector('.kt-tw-text');
    let stringIndex = 0;
    let charIndex = 0;
    let frameIndex = 0;
    let erasing = false;
    let alive = true;
    let timer = null;

    const framesFor = (grapheme) => (hangul ? hangulFrames(grapheme) : [grapheme]);

    const step = () => {
      if (!alive) return;
      const graphemes = segmentText(strings[stringIndex]);
      if (!erasing) {
        const done = graphemes.slice(0, charIndex).join('');
        if (charIndex >= graphemes.length) {
          textEl.textContent = done;
          if (!loop && stringIndex === strings.length - 1) {
            opts.onComplete?.(el);
            return;
          }
          timer = setTimeout(() => { erasing = true; step(); }, pauseAfter);
          return;
        }
        const frames = framesFor(graphemes[charIndex]);
        textEl.textContent = done + frames[Math.min(frameIndex, frames.length - 1)];
        frameIndex += 1;
        if (frameIndex >= frames.length) {
          frameIndex = 0;
          charIndex += 1;
        }
        timer = setTimeout(step, hangul ? Math.max(16, typeSpeed * 0.72) : typeSpeed);
      } else {
        charIndex -= 1;
        frameIndex = 0;
        textEl.textContent = graphemes.slice(0, Math.max(0, charIndex)).join('');
        if (charIndex <= 0) {
          erasing = false;
          stringIndex = (stringIndex + 1) % strings.length;
          timer = setTimeout(step, typeSpeed);
        } else {
          timer = setTimeout(step, eraseSpeed);
        }
      }
    };
    step();

    return {
      el,
      type: 'typewriter',
      replay: () => {
        clearTimeout(timer);
        stringIndex = 0;
        charIndex = 0;
        frameIndex = 0;
        erasing = false;
        alive = true;
        textEl.textContent = '';
        step();
      },
      pause: () => { alive = false; clearTimeout(timer); },
      resume: () => { if (!alive) { alive = true; step(); } },
      destroy: () => {
        alive = false;
        clearTimeout(timer);
        el.innerHTML = originalHTML;
        restoreAttributes();
      }
    };
  },
  reduced(el, opts) {
    const originalHTML = el.innerHTML;
    const strings = Array.isArray(opts.strings) ? opts.strings : opts.strings != null ? [opts.strings] : [el.textContent];
    el.textContent = String(strings[0] ?? '');
    return { el, type: 'typewriter', pause() {}, resume() {}, destroy() { el.innerHTML = originalHTML; } };
  }
};
