import { clamp, snapshotAttributes, snapshotInlineStyles } from '../utils.js';

// Scroll progress with three shapes:
//  - default: drives the element itself (scaleX / width), unchanged behaviour
//  - ui:'bar'  : builds a track + fill reading-progress bar (fixed or in-place)
//  - ui:'ring' : builds a circular SVG indicator, optionally a back-to-top button
// Both UI shapes expose kt-progress-* classes and read their colors from CSS
// custom properties (--kt-progress-color/-track/-ring-bg) so designers can
// restyle them from a stylesheet.

function progressReader(opts) {
  const target = opts.target || 'page';
  return () => {
    if (target === 'page') {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    }
    const targetEl = document.querySelector(target);
    if (!targetEl) return 0;
    const rect = targetEl.getBoundingClientRect();
    return clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
  };
}

function cornerStyle(position, offset) {
  const [y, x] = String(position || 'bottom-right').split('-');
  return `${y === 'top' ? 'top' : 'bottom'}:${offset}px;${x === 'left' ? 'left' : 'right'}:${offset}px;`;
}

export default {
  create(el, opts) {
    const ui = opts.ui || '';
    const smoothing = clamp(Number(opts.smoothing ?? 0), 0, 0.95);
    const showAfter = Math.max(0, Number(opts.showAfter ?? 0));
    const hideAtEnd = opts.hideAtEnd === true;
    const getProgress = progressReader(opts);
    let alive = true;
    let rafId = null;
    let shown = 0;
    let apply = null;
    const created = [];

    const tick = () => {
      if (!alive) return;
      const raw = getProgress();
      shown = smoothing > 0 ? shown + (raw - shown) * (1 - smoothing) : raw;
      apply?.(shown, raw);
      opts.onUpdate?.(shown, el);
      rafId = requestAnimationFrame(tick);
    };

    const visibility = (node, raw) => {
      if (!showAfter && !hideAtEnd) return;
      const hidden = (showAfter > 0 && window.scrollY < showAfter) || (hideAtEnd && raw >= 0.999);
      node.style.opacity = hidden ? '0' : '1';
      node.style.pointerEvents = hidden ? 'none' : '';
    };

    let restore = null;
    let restoreAttributes = null;

    if (ui === 'bar') {
      const thickness = Math.max(1, Number(opts.thickness ?? 3));
      const attach = opts.attach || 'fixed';
      const positionSide = opts.position === 'bottom' ? 'bottom' : 'top';
      const radius = Math.max(0, Number(opts.radius ?? 0));
      const color = opts.color || 'var(--kt-progress-color,#ff5b1c)';
      const fillBackground = opts.color2 ? `linear-gradient(90deg,${color},${opts.color2})` : color;
      const track = document.createElement('div');
      track.className = 'kt-progress-bar';
      track.setAttribute('aria-hidden', 'true');
      track.style.cssText = attach === 'fixed'
        ? `position:fixed;left:0;right:0;${positionSide}:0;height:${thickness}px;z-index:${Number(opts.zIndex ?? 1002)};background:${opts.trackColor || 'var(--kt-progress-track,transparent)'};border-radius:${radius}px;transition:opacity .25s ease;`
        : `position:relative;width:100%;height:${thickness}px;background:${opts.trackColor || 'var(--kt-progress-track,rgba(128,128,128,.18))'};border-radius:${radius}px;overflow:hidden;transition:opacity .25s ease;`;
      const fill = document.createElement('div');
      fill.className = 'kt-progress-bar-fill';
      fill.style.cssText = `width:100%;height:100%;background:${fillBackground};border-radius:inherit;transform:scaleX(0);transform-origin:left center;will-change:transform;`;
      track.appendChild(fill);
      (attach === 'fixed' ? document.body : el).appendChild(track);
      created.push(track);
      apply = (value, raw) => {
        fill.style.transform = `scaleX(${value})`;
        visibility(track, raw);
      };
    } else if (ui === 'ring') {
      const size = Math.max(20, Number(opts.size ?? 46));
      const stroke = Math.max(1, Number(opts.stroke ?? 3));
      const attach = opts.attach || 'fixed';
      const showPercent = opts.showPercent === true;
      const clickToTop = opts.clickToTop === true;
      const ringRadius = (size - stroke) / 2;
      const circumference = 2 * Math.PI * ringRadius;
      const color = opts.color || 'var(--kt-progress-color,#ff5b1c)';
      const trackColor = opts.trackColor || 'var(--kt-progress-track,rgba(128,128,128,.22))';
      const root = document.createElement(clickToTop ? 'button' : 'div');
      root.className = 'kt-progress-ring';
      if (clickToTop) {
        root.type = 'button';
        root.setAttribute('aria-label', opts.label || 'Scroll back to top');
      } else {
        root.setAttribute('aria-hidden', 'true');
      }
      root.style.cssText = `${attach === 'fixed' ? `position:fixed;${cornerStyle(opts.position, Math.max(0, Number(opts.offset ?? 18)))}z-index:${Number(opts.zIndex ?? 1200)};` : 'position:relative;'}width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;border:0;padding:0;background:var(--kt-progress-ring-bg,transparent);border-radius:50%;${clickToTop ? 'cursor:pointer;' : ''}transition:opacity .25s ease;color:inherit;`;
      root.innerHTML = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true" style="position:absolute;inset:0;transform:rotate(-90deg);">`
        + `<circle class="kt-progress-ring-track" cx="${size / 2}" cy="${size / 2}" r="${ringRadius}" fill="none" stroke="${trackColor}" stroke-width="${stroke}"/>`
        + `<circle class="kt-progress-ring-fill" cx="${size / 2}" cy="${size / 2}" r="${ringRadius}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"/>`
        + '</svg>';
      const center = document.createElement('span');
      center.className = 'kt-progress-ring-label';
      center.style.cssText = `position:relative;font:600 ${Math.round(size * (showPercent ? 0.26 : 0.36))}px/1 ui-monospace,monospace;user-select:none;`;
      center.textContent = showPercent ? '0%' : (clickToTop ? '↑' : '');
      root.appendChild(center);
      const fillCircle = root.querySelector('.kt-progress-ring-fill');
      if (clickToTop) root.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
      (attach === 'fixed' ? document.body : el).appendChild(root);
      created.push(root);
      apply = (value, raw) => {
        fillCircle.setAttribute('stroke-dashoffset', String(circumference * (1 - value)));
        if (showPercent) center.textContent = `${Math.round(value * 100)}%`;
        visibility(root, raw);
      };
    } else {
      const property = opts.property || 'scaleX';
      restore = snapshotInlineStyles(el, ['transform', 'transformOrigin', 'width', 'willChange']);
      restoreAttributes = snapshotAttributes(el, ['aria-hidden']);
      el.style.transformOrigin = 'left center';
      el.style.willChange = property === 'scaleX' ? 'transform' : 'width';
      el.setAttribute('aria-hidden', 'true');
      apply = (value) => {
        if (property === 'scaleX') el.style.transform = `scaleX(${value})`;
        else el.style.width = `${value * 100}%`;
      };
    }

    rafId = requestAnimationFrame(tick);

    return {
      el,
      type: 'progress',
      pause: () => { alive = false; if (rafId != null) cancelAnimationFrame(rafId); },
      resume: () => { if (!alive) { alive = true; rafId = requestAnimationFrame(tick); } },
      destroy: () => {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
        created.forEach((node) => node.remove());
        restoreAttributes?.();
        restore?.();
      }
    };
  }
};
