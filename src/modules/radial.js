import { clamp, env } from '../utils.js';

// Radial carousel — items arranged around a circle. The wheel can dock to any
// edge (`position: bottom | top | left | right`) so only an arc peeks in, and
// the active item sits at the focal angle. Rotate with prev/next buttons, a
// click on any item, drag, autoplay, or the keyboard (←/→). Accessible: role=group with
// aria-roledescription, aria-current on the active item, a polite live region.
// Reduced motion snaps without the spin. Everything themeable via `.kt-radial*`.
export default {
  create(el, opts = {}) {
    const reduce = env().reducedMotion;
    const items = (() => {
      const marked = Array.from(el.querySelectorAll(':scope > .kt-radial-item'));
      if (marked.length) return marked;
      return Array.from(el.children).filter((c) => c.nodeType === 1 && !c.matches('.kt-radial-controls, button'));
    })();
    if (items.length < 2) return null;

    const radius = Math.max(40, Number(opts.radius ?? 260));
    const step = Number(opts.step ?? 26);
    const position = ['bottom', 'top', 'left', 'right'].includes(opts.position) ? opts.position : 'bottom';
    // Focal angle points AWAY from the docked edge, into the visible area:
    // bottom → up, top → down, left → right, right → left.
    const presetAngle = { bottom: -90, top: 90, left: 0, right: 180 }[position];
    const activeAngle = opts.activeAngle != null ? Number(opts.activeAngle) : presetAngle;
    const duration = Math.max(0, Number(opts.duration ?? 0.6));
    const loop = opts.loop !== false;
    const drag = opts.drag !== false;
    const useControls = opts.controls !== false;

    el.classList.add('kt-radial', `kt-radial--${position}`);
    el.style.setProperty('--kt-radial-radius', `${radius}px`);
    el.setAttribute('role', 'group');
    el.setAttribute('aria-roledescription', 'carousel');

    // Rotation hub: a zero-size point the preset positions at an edge; items
    // orbit around it so only the focal arc shows.
    const hub = document.createElement('div');
    hub.className = 'kt-radial-hub';
    el.appendChild(hub);
    items.forEach((item) => { item.classList.add('kt-radial-item'); hub.appendChild(item); });

    let active = Math.floor(items.length / 2);

    const live = document.createElement('div');
    live.className = 'kt-radial-live';
    live.setAttribute('aria-live', 'polite');
    live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);';
    el.appendChild(live);

    const n = items.length;
    const layout = () => {
      items.forEach((item, i) => {
        let offset = i - active;
        if (loop) { // shortest way around
          offset = ((offset % n) + n) % n;
          if (offset > n / 2) offset -= n;
        }
        // When an item wraps to the opposite side, jump instantly (no transition)
        // so it doesn't sweep across the visible arc.
        const prevOffset = item._ktOffset;
        const teleport = prevOffset !== undefined && Math.abs(offset - prevOffset) > n / 2;
        item._ktOffset = offset;
        const angle = activeAngle + offset * step;
        item.style.transition = (reduce || duration === 0 || teleport) ? 'none' : `transform ${duration}s cubic-bezier(.22,.8,.3,1)`;
        // transform-origin is the hub point (0,0); the inner translate(-50%,-50%)
        // (applied FIRST) centers the item there, then rotate·translate·rotate
        // orbits its centre to radius·(cosθ,sinθ), upright.
        item.style.transform = `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg) translate(-50%, -50%)`;
        const on = i === active;
        item.classList.toggle('kt-active', on);
        item.classList.toggle('active-item', on);
        if (on) item.setAttribute('aria-current', 'true'); else item.removeAttribute('aria-current');
        item.style.zIndex = String(100 - Math.abs(offset));
      });
      live.textContent = `${active + 1} / ${items.length}`;
    };

    const go = (index) => {
      if (loop) active = ((index % items.length) + items.length) % items.length;
      else active = clamp(index, 0, items.length - 1);
      layout();
    };
    const next = () => go(active + 1);
    const prev = () => go(active - 1);

    items.forEach((item, i) => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => go(i));
      if (!item.hasAttribute('tabindex')) item.tabIndex = -1;
    });

    // Controls: reuse an existing .kt-radial-controls block or build one.
    let controls = el.querySelector('.kt-radial-controls');
    let prevBtn = null; let nextBtn = null; let builtControls = false;
    if (useControls) {
      if (!controls) {
        controls = document.createElement('div');
        controls.className = 'kt-radial-controls';
        controls.innerHTML = '<button type="button" class="kt-radial-prev" aria-label="Previous"></button><button type="button" class="kt-radial-next" aria-label="Next"></button>';
        el.appendChild(controls);
        builtControls = true;
      }
      prevBtn = controls.querySelector('.kt-radial-prev, [data-kt-radial-prev]');
      nextBtn = controls.querySelector('.kt-radial-next, [data-kt-radial-next]');
      prevBtn?.addEventListener('click', prev);
      nextBtn?.addEventListener('click', next);
    }

    const onKey = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); next(); }
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); prev(); }
    };
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    el.addEventListener('keydown', onKey);

    // Drag to spin (a full `step` of drag advances one item).
    let dragState = null;
    const dragAxisH = position === 'bottom' || position === 'top';
    // Don't start a drag on the control buttons, and DON'T capture the pointer
    // (capturing stole clicks from the prev/next buttons — hence "had to click
    // repeatedly"). Only spin once the drag actually passes a small threshold.
    const onDown = (e) => {
      if (!drag || e.target.closest('.kt-radial-controls, button')) return;
      dragState = { x: e.clientX, y: e.clientY, start: active, moved: false };
    };
    const onMove = (e) => {
      if (!dragState) return;
      const delta = dragAxisH ? e.clientX - dragState.x : e.clientY - dragState.y;
      if (Math.abs(delta) <= 6) return; // ignore micro-moves (taps/clicks)
      dragState.moved = true;
      go(dragState.start + Math.round(-delta / 60));
    };
    const onUp = () => { dragState = null; };
    if (drag) {
      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
    }

    // Autoplay (pauses on hover / when tab hidden).
    const autoplay = Math.max(0, Number(opts.autoplay ?? 0));
    let timer = null;
    const startAuto = () => { if (autoplay && !reduce) { stopAuto(); timer = setInterval(next, autoplay); } };
    const stopAuto = () => { if (timer) { clearInterval(timer); timer = null; } };
    if (autoplay) {
      el.addEventListener('mouseenter', stopAuto);
      el.addEventListener('mouseleave', startAuto);
      startAuto();
    }

    layout();

    return {
      el,
      type: 'radial',
      next, prev, go,
      pause: stopAuto,
      resume: startAuto,
      destroy() {
        stopAuto();
        el.removeEventListener('keydown', onKey);
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
        el.removeEventListener('mouseenter', stopAuto);
        el.removeEventListener('mouseleave', startAuto);
        prevBtn?.removeEventListener('click', prev);
        nextBtn?.removeEventListener('click', next);
        items.forEach((item) => { item.style.transform = ''; item.style.transition = ''; item.classList.remove('kt-active', 'active-item'); el.appendChild(item); });
        hub.remove();
        live.remove();
        if (builtControls) controls.remove();
        el.classList.remove('kt-radial', `kt-radial--${position}`);
        el.removeAttribute('role'); el.removeAttribute('aria-roledescription');
      }
    };
  },
  reduced(el, opts) { return this.create(el, opts); }
};
