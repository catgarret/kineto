const hostStates = new WeakMap();

function rememberProperty(style, name) {
  return {
    value: style.getPropertyValue(name),
    priority: style.getPropertyPriority(name)
  };
}

function restoreProperty(style, name, previous) {
  if (previous.value) style.setProperty(name, previous.value, previous.priority);
  else style.removeProperty(name);
}

/**
 * Adds one composable shadow channel to an interactive element.
 *
 * The stylesheet combines the Tilt and Card Glow channels with the element's
 * pre-existing shadow. Authors can override the generated channel wholesale
 * (`--kt-tilt-shadow` / `--kt-card-glow-shadow`) or adjust its component
 * variables without fighting inline `box-shadow` declarations.
 */
export function createInteractiveShadow(el, namespace, config = {}) {
  const style = el.style;
  let host = hostStates.get(el);
  if (!host) {
    host = {
      refs: 0,
      hadClass: el.classList.contains('kt-interactive-shadow'),
      base: rememberProperty(style, '--kt-shadow-base-runtime'),
      boxShadow: rememberProperty(style, 'box-shadow')
    };
    const computedShadow = getComputedStyle(el).boxShadow;
    if (computedShadow && computedShadow !== 'none') {
      style.setProperty('--kt-shadow-base-runtime', computedShadow);
    }
    el.classList.add('kt-interactive-shadow');
    // The app's card styles are commonly loaded after Kineto's stylesheet.
    // Keep the compositing declaration inline so a later `.card { box-shadow }`
    // rule cannot silently hide the enabled module channels. Authors still
    // control every channel through CSS custom properties.
    style.setProperty(
      'box-shadow',
      'var(--kt-tilt-shadow, var(--kt-tilt-shadow-runtime, 0 0 0 transparent)), '
      + 'var(--kt-card-glow-shadow, var(--kt-card-glow-shadow-runtime, 0 0 0 transparent)), '
      + 'var(--kt-shadow-base, var(--kt-shadow-base-runtime, 0 0 0 transparent))'
    );
    hostStates.set(el, host);
  }
  host.refs += 1;

  const runtimeName = `--kt-${namespace}-shadow-runtime`;
  const activeOpacityName = `--kt-${namespace}-shadow-active-opacity`;
  const previousRuntime = rememberProperty(style, runtimeName);
  const previousOpacity = rememberProperty(style, activeOpacityName);
  const prefix = `--kt-${namespace}-shadow`;
  const enabled = config.enabled === true || Boolean(String(config.css || '').trim());
  const opacity = Math.max(0, Math.min(1, Number(config.opacity ?? 0.28)));
  const blur = Math.max(0, Number(config.blur ?? 34));
  const spread = Number(config.spread ?? -8);
  const color = config.color || '#111827';
  const inset = config.inset === true ? 'inset ' : '';
  const customCss = String(config.css || '').trim();
  let destroyed = false;

  const update = (x = 0, y = 0, active = true) => {
    if (destroyed) return;
    const visible = enabled && active;
    style.setProperty(activeOpacityName, `${visible ? opacity * 100 : 0}%`);
    if (customCss && visible) {
      style.setProperty(runtimeName, customCss);
      return;
    }
    style.setProperty(
      runtimeName,
      `${inset}var(${prefix}-x, ${Number(x).toFixed(2)}px) `
      + `var(${prefix}-y, ${Number(y).toFixed(2)}px) `
      + `var(${prefix}-blur, ${blur}px) `
      + `var(${prefix}-spread, ${spread}px) `
      + `color-mix(in srgb, var(${prefix}-color, ${color}) `
      + `var(${prefix}-opacity, var(${activeOpacityName})), transparent)`
    );
  };

  update(Number(config.x ?? 0), Number(config.y ?? 0), config.active !== false);

  return {
    update,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      restoreProperty(style, runtimeName, previousRuntime);
      restoreProperty(style, activeOpacityName, previousOpacity);
      host.refs -= 1;
      if (host.refs > 0) return;
      restoreProperty(style, '--kt-shadow-base-runtime', host.base);
      restoreProperty(style, 'box-shadow', host.boxShadow);
      if (!host.hadClass) el.classList.remove('kt-interactive-shadow');
      hostStates.delete(el);
    }
  };
}
