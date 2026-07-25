import { env } from '../utils.js';

// Switch — an accessible animated toggle. Attach `data-kt-switch` to a
// <button> (or any element). It becomes role="switch" with aria-checked, a
// sliding thumb and a track colour that changes on/off. Click, Space or Enter
// toggle it; fires `onChange(checked, el)` + a `kt-switch-change` event. API:
// instance.toggle() / instance.set(bool) / instance.checked. Themeable via
// options (size, onColor, offColor, thumbColor, duration). Reduced motion: no
// slide (instant).
export default {
  create(el, opts = {}) {
    const reduce = env().reducedMotion;
    const size = Math.max(14, Number(opts.size ?? 24));            // thumb diameter
    const onColor = opts.onColor || 'var(--kt-switch-on, #ff5b1c)';
    const offColor = opts.offColor || 'var(--kt-switch-off, color-mix(in srgb, currentColor 26%, transparent))';
    const thumbColor = opts.thumbColor || 'var(--kt-switch-thumb, #fff)';
    const duration = Math.max(0, Number(opts.duration ?? 0.22));
    // Form-usable: if a child <input type="checkbox|radio"> is present it becomes
    // the value carrier (submits with the form, fires native change/input), while
    // this element stays the accessible role="switch" control. Pattern:
    //   <button data-kt-switch><input type="checkbox" name="notify" hidden></button>
    const input = el.tagName === 'INPUT' ? null : el.querySelector('input[type="checkbox"], input[type="radio"]');
    if (input) { input.style.position = 'absolute'; input.style.opacity = '0'; input.style.pointerEvents = 'none'; input.style.width = '0'; input.style.height = '0'; input.tabIndex = -1; }
    let checked = opts.checked === true || (input ? input.checked : (el.getAttribute('aria-checked') === 'true' || el.hasAttribute('checked')));

    const prevStyle = el.getAttribute('style');
    const pad = Math.round(size * 0.16);
    const travel = Math.round(size * 0.8);
    el.classList.add('kt-switch');
    el.setAttribute('role', 'switch');
    if (el.tagName !== 'BUTTON' && el.tagName !== 'INPUT' && !el.hasAttribute('tabindex')) el.tabIndex = 0;
    el.style.display = 'inline-flex';
    el.style.alignItems = 'center';
    el.style.boxSizing = 'content-box';
    el.style.width = `${size + travel}px`;
    el.style.height = `${size}px`;
    el.style.padding = `${pad}px`;
    el.style.borderRadius = `${size}px`;
    el.style.border = '0';
    el.style.cursor = 'pointer';
    el.style.transition = `background-color ${duration}s ease`;
    el.style.verticalAlign = 'middle';

    const thumb = document.createElement('span');
    thumb.className = 'kt-switch__thumb';
    thumb.setAttribute('aria-hidden', 'true');
    thumb.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${thumbColor};box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform ${reduce ? 0 : duration}s cubic-bezier(.22,.8,.3,1);will-change:transform;flex:0 0 auto;`;
    el.appendChild(thumb);

    const apply = () => {
      el.setAttribute('aria-checked', checked ? 'true' : 'false');
      el.classList.toggle('kt-on', checked);
      el.style.backgroundColor = checked ? onColor : offColor;
      thumb.style.transform = checked ? `translateX(${travel}px)` : 'translateX(0)';
      if (input && input.checked !== checked) input.checked = checked;
    };
    const toggle = () => {
      checked = !checked;
      apply();
      // Fire the native change/input on the backing form control so forms and
      // listeners see the value, plus the module's own callback + event.
      if (input) { try { input.dispatchEvent(new Event('change', { bubbles: true })); input.dispatchEvent(new Event('input', { bubbles: true })); } catch (_e) { /* older */ } }
      opts.onChange?.(checked, el);
      try { el.dispatchEvent(new CustomEvent('kt-switch-change', { bubbles: true, detail: { checked } })); } catch (_e) { /* older */ }
    };

    const onClick = (event) => { if (event.target === input) return; event.preventDefault(); toggle(); };
    const onKey = (event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); toggle(); } };
    // Reflect external changes to the backing input (e.g. form reset).
    const onInputChange = () => { if (input && input.checked !== checked) { checked = input.checked; apply(); } };
    el.addEventListener('click', onClick);
    el.addEventListener('keydown', onKey);
    if (input) input.addEventListener('change', onInputChange);
    apply();

    return {
      el,
      type: 'switch',
      toggle,
      set(value) { checked = !!value; apply(); },
      get checked() { return checked; },
      pause() {}, resume() {},
      destroy() {
        el.removeEventListener('click', onClick);
        el.removeEventListener('keydown', onKey);
        if (input) { input.removeEventListener('change', onInputChange); input.style.position = ''; input.style.opacity = ''; input.style.pointerEvents = ''; input.style.width = ''; input.style.height = ''; input.removeAttribute('tabindex'); }
        thumb.remove();
        el.classList.remove('kt-switch', 'kt-on');
        el.removeAttribute('role');
        el.removeAttribute('aria-checked');
        if (prevStyle == null) el.removeAttribute('style'); else el.setAttribute('style', prevStyle);
      }
    };
  },
  reduced(el, opts) { return this.create(el, opts); }
};
