// Reveal `split` — a group of controls rises on a spring, appears as ONE small
// blob in the middle, squashes into a circle, then splits into its children,
// each opening from that circle into its own box; the children's content
// arrives last. (Generalised from the gallery controls on Apple's product
// pages: dot-nav pill + play button. Works for any row: toolbars, chip groups,
// button pairs, a nav and its action.)
//
//   <nav data-kt-reveal="split"> <div class="pill">…</div> <button>…</button> </nav>
//
// Timeline (seconds from the entrance; every curve is a Kineto easing, so
// springs keep their natural pace — `duration` rescales the whole timeline):
//   0          group rises from `distance` px below            (`ease`, spring)
//   0          blob appears: thin vertical pill ×1.3
//   0.18       blob widens to a circle                         (`morphEase`)
//   0.26       blob height settles to a circle → squash/stretch
//   0.52       children take over from the blob and open to their boxes,
//              `stagger` apart                                  (`morphEase`)
//   contentDelay (0.74)  each child's content fades/scales in, 0.2 s apart
//
// Why the blob is a separate element: the children may be any size and
// colour; the blob is the neutral "one shape" they come out of. It is
// absolutely positioned so it never changes the group's layout, and it is
// removed when the entrance ends.
//
// This file is NOT a module. reveal.js reads every option (so the contract
// scanner sees them) and hands the values in, together with its boundary
// observer and class-hook helpers, so `split` behaves like every other preset.
import { measureThenApply, resolveMotion } from '../../utils.js';

const FADE_IN = 0.12;
const MORPH_WIDTH_AT = 0.18;
const MORPH_HEIGHT_AT = 0.26;
const SPLIT_AT = 0.52;
const CONTENT_STEP = 0.2;
const CONTENT_DURATION = 0.2;
const BLOB_WIDTH_RATIO = 30 / 56;   // intro pill: 30 × 80 for a 56 px control
const BLOB_HEIGHT_RATIO = 80 / 56;
const BLOB_SCALE = 1.3;

const px = (n) => `${Math.round(n * 100) / 100}px`;

function surfaceColor(node) {
  const color = getComputedStyle(node).backgroundColor;
  if (!color || color === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(color)) return null;
  return color;
}

function cornerRadius(node, height) {
  const radius = Number.parseFloat(getComputedStyle(node).borderTopLeftRadius) || 0;
  return Math.min(radius, height / 2);
}

/**
 * @param {HTMLElement} el  the group
 * @param {object} o        resolved option values (see reveal.js)
 * @param {object} deps
 * @param {(boundary: (next: number) => void) => { disconnect(): void }} deps.observe
 * @param {(el: Element) => void} deps.enterClasses
 * @param {(el: Element) => void} deps.leaveClasses
 */
export function createSplitReveal(el, o, { observe, enterClasses, leaveClasses }) {
  const parts = Array.from(el.children);
  const once = o.once !== false;

  // Everything this preset writes, so destroy() hands the element back as found.
  const saved = [el, ...parts, ...parts.flatMap((node) => Array.from(node.children))]
    .map((node) => [node, node.getAttribute('style')]);
  const savedClass = el.getAttribute('class');
  const restoreStyles = () => saved.forEach(([node, value]) => {
    if (value == null) node.removeAttribute('style');
    else node.setAttribute('style', value);
  });

  let blob = null;
  let animations = [];
  let cancelMeasure = null;
  let observer = null;
  let destroyed = false;
  let played = false;
  let paused = false;
  let run = 0;

  const hide = () => { el.style.opacity = '0'; };
  const clear = () => {
    run += 1;
    cancelMeasure?.();
    cancelMeasure = null;
    animations.forEach((animation) => { animation.onfinish = null; animation.cancel(); });
    animations = [];
    blob?.remove();
    blob = null;
    restoreStyles();
  };
  const track = (animation) => { animations.push(animation); if (paused) animation.pause(); return animation; };

  // The timeline in "design seconds", then rescaled when `duration` is set.
  const timeline = (count) => {
    const rise = resolveMotion({ ease: o.ease }, { ease: 'spring-bouncy', springable: false });
    const morph = resolveMotion({ ease: o.morphEase }, { ease: 'spring(0.4s, 0.3)', springable: false });
    const stagger = Math.max(0, Number(o.stagger ?? 0.04));
    const contentDelay = Math.max(0, Number(o.contentDelay ?? 0.74));
    const end = Math.max(
      rise.seconds,
      SPLIT_AT + stagger * (count - 1) + morph.seconds,
      contentDelay + CONTENT_STEP * (count - 1) + CONTENT_DURATION
    );
    const duration = Number(o.duration);
    const scale = Number.isFinite(duration) && duration > 0 ? duration / end : 1;
    const delay = Math.max(0, Number(o.delay ?? 0));
    return {
      rise, morph, stagger, contentDelay,
      at: (seconds) => (delay + seconds * scale) * 1000,
      len: (seconds) => Math.max(1, seconds * scale * 1000)
    };
  };

  const finish = (token) => {
    if (destroyed || token !== run) return;
    animations.forEach((animation) => { animation.onfinish = null; animation.cancel(); });
    animations = [];
    blob?.remove();
    blob = null;
    restoreStyles();
    o.onComplete?.(el);
  };

  const play = () => {
    if (destroyed) return;
    clear();
    played = true;
    const token = run;
    enterClasses(el);
    if (typeof el.animate !== 'function' || !parts.length) { o.onComplete?.(el); return; }
    hide();
    cancelMeasure = measureThenApply(() => {
      const group = el.getBoundingClientRect();
      const boxes = parts.map((node) => node.getBoundingClientRect());
      return {
        group,
        boxes,
        size: Math.max(1, ...boxes.map((box) => box.height)),
        radii: parts.map((node, index) => cornerRadius(node, boxes[index].height)),
        color: o.color || surfaceColor(parts[0]) || 'currentColor',
        position: getComputedStyle(el).position
      };
    }, ({ group, boxes, size, radii, color, position }) => {
      cancelMeasure = null;
      if (destroyed || token !== run) return;
      const { rise, morph, stagger, contentDelay, at, len } = timeline(parts.length);
      const distance = Number.isFinite(Number(o.distance)) ? Number(o.distance) : 180;
      el.style.opacity = '';
      if (position === 'static') el.style.position = 'relative';
      const cx = group.width / 2;
      const cy = group.height / 2;

      // 1. The group fades in and rises on its spring.
      track(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: len(FADE_IN), delay: at(0), fill: 'backwards' }));
      track(el.animate([{ translate: `0 ${px(distance)}` }, { translate: '0 0' }],
        { duration: len(rise.seconds), delay: at(0), easing: rise.css, fill: 'backwards' }));

      // 2. The blob: a thin vertical pill that squashes into a circle.
      blob = document.createElement('span');
      blob.setAttribute('aria-hidden', 'true');
      blob.className = 'kt-reveal-split-blob';
      Object.assign(blob.style, {
        position: 'absolute', left: px(cx), top: px(cy), width: px(size), height: px(size),
        translate: '-50% -50%', borderRadius: '999px', background: color, pointerEvents: 'none', zIndex: '1'
      });
      el.prepend(blob);
      const thin = px(size * BLOB_WIDTH_RATIO);
      const tall = px(size * BLOB_HEIGHT_RATIO);
      const morphTiming = (start) => ({ duration: len(morph.seconds), delay: at(start), easing: morph.css, fill: 'backwards' });
      track(blob.animate([{ scale: BLOB_SCALE }, { scale: 1 }], morphTiming(0)));
      track(blob.animate([{ width: thin }, { width: px(size) }], morphTiming(MORPH_WIDTH_AT)));
      track(blob.animate([{ height: tall }, { height: px(size) }], morphTiming(MORPH_HEIGHT_AT)));
      track(blob.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1, delay: at(SPLIT_AT), fill: 'forwards' }));

      // 3. Each child opens from the blob's circle at the group centre into its box.
      parts.forEach((node, index) => {
        const box = boxes[index];
        const dx = cx - (box.left - group.left + box.width / 2);
        const dy = cy - (box.top - group.top + box.height / 2);
        const insetX = Math.max(0, (box.width - size) / 2);
        const insetY = Math.max(0, (box.height - size) / 2);
        const start = SPLIT_AT + index * stagger;
        track(node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: at(start), fill: 'backwards' }));
        track(node.animate([
          { translate: `${px(dx)} ${px(dy)}`, clipPath: `inset(${px(insetY)} ${px(insetX)} round ${px(size / 2)})` },
          { translate: '0 0', clipPath: `inset(0px 0px round ${px(radii[index])})` }
        ], morphTiming(start)));

        // 4. The content arrives after the shapes.
        Array.from(node.children).forEach((child) => {
          track(child.animate([{ opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }],
            { duration: len(CONTENT_DURATION), delay: at(contentDelay + index * CONTENT_STEP), easing: 'ease-out', fill: 'backwards' }));
        });
      });

      Promise.all(animations.map((animation) => animation.finished)).then(() => finish(token)).catch(() => {});
    });
  };

  const boundary = (next) => {
    if (destroyed) return;
    if (next % 2 === 0) {
      if (!played || !once) play();
      if (destroyed) return;
      (next === 0 ? o.onEnter : o.onEnterBack)?.(el);
      return;
    }
    (next === 1 ? o.onLeave : o.onLeaveBack)?.(el);
    if (destroyed || once) return;
    clear();
    played = false;
    leaveClasses(el);
    hide();
  };

  hide();
  observer = observe(boundary);

  return {
    el,
    type: 'reveal',
    replay(next) { if (next) Object.assign(o, next); play(); },
    pause() { paused = true; animations.forEach((animation) => animation.pause()); },
    resume() { paused = false; animations.forEach((animation) => animation.play()); },
    destroy() {
      destroyed = true;
      observer?.disconnect();
      clear();
      if (savedClass == null) el.removeAttribute('class');
      else el.setAttribute('class', savedClass);
    }
  };
}
