import { clamp, env, lerp, snapshotInlineStyles } from '../utils.js';

export default {
  create(el, opts) {
    const environment = env();
    const mode = opts.mode || opts.preset;

    if (mode === 'compass') {
      // Compass dial: the element rotates to aim at the pointer (or maps the
      // pointer's X position onto a rotation range when compassRange is set).
      const smoothing = clamp(Number(opts.smoothing ?? opts.ease ?? 0.08), 0.01, 1);
      const offset = Number(opts.rotateOffset ?? 0);
      const range = opts.compassRange != null ? Number(opts.compassRange) : null;
      const sensitivity = Number(opts.sensitivity ?? 1);
      const eventTarget = opts.global ? window : el;
      const restore = snapshotInlineStyles(el, ['transform', 'willChange']);
      el.style.willChange = 'transform';
      let target = 0;
      let current = 0;
      let alive = true;
      let rafId = null;
      // On touch devices the dial follows the real device heading (gyro).
      const useGyro = opts.gyro !== false && environment.touch && environment.hasGyro;
      const onGyroCompass = (event) => {
        if (event.alpha == null) return;
        target = -event.alpha * sensitivity;
      };
      let gyroPermission = null;
      const onMove = (event) => {
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        if (range != null) {
          const bounds = opts.global
            ? { left: 0, width: window.innerWidth }
            : rect;
          const normalized = clamp(((event.clientX - bounds.left) / bounds.width - 0.5) * 2, -1, 1);
          target = normalized * range * sensitivity;
        } else {
          const angle = Math.atan2(
            event.clientY - (rect.top + rect.height / 2),
            event.clientX - (rect.left + rect.width / 2)
          ) * 180 / Math.PI;
          target = angle * sensitivity;
        }
      };
      const tick = () => {
        if (!alive) return;
        // Rotate along the shortest arc so the dial never spins the long way.
        let delta = (target - current) % 360;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        current += delta * smoothing;
        el.style.transform = `rotate(${(current + offset).toFixed(3)}deg)`;
        rafId = requestAnimationFrame(tick);
      };
      if (useGyro) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          gyroPermission = async () => {
            try {
              if (await DeviceOrientationEvent.requestPermission() === 'granted') {
                window.addEventListener('deviceorientation', onGyroCompass, { passive: true });
              }
            } catch (_error) { /* requires a user gesture; may be denied */ }
          };
          eventTarget.addEventListener('pointerdown', gyroPermission, { once: true });
        } else {
          window.addEventListener('deviceorientation', onGyroCompass, { passive: true });
        }
      } else {
        eventTarget.addEventListener('pointermove', onMove, { passive: true });
      }
      rafId = requestAnimationFrame(tick);
      return {
        el,
        type: 'mouseParallax',
        pause: () => { alive = false; if (rafId != null) cancelAnimationFrame(rafId); },
        resume: () => { if (!alive) { alive = true; rafId = requestAnimationFrame(tick); } },
        destroy: () => {
          alive = false;
          if (rafId != null) cancelAnimationFrame(rafId);
          eventTarget.removeEventListener('pointermove', onMove);
          window.removeEventListener('deviceorientation', onGyroCompass);
          if (gyroPermission) eventTarget.removeEventListener('pointerdown', gyroPermission);
          restore();
        }
      };
    }

    const ease = opts.ease ?? 0.08;
    const maxX = opts.maxX ?? 40;
    const maxY = opts.maxY ?? 40;
    const eventTarget = opts.global ? window : el;
    const useGyro = opts.gyro !== false && environment.hasGyro && environment.touch;
    const targets = Array.from(el.querySelectorAll('[data-mp-speed], [data-kt-mouse-speed]'));
    if (!targets.length) targets.push(el);
    const restores = targets.map((target) => snapshotInlineStyles(target, ['transform', 'willChange']));

    targets.forEach((target) => { target.style.willChange = 'transform'; });

    let xTarget = 0;
    let yTarget = 0;
    let alive = true;
    let rafId = null;
    const currentX = targets.map(() => 0);
    const currentY = targets.map(() => 0);

    const onPointerMove = (event) => {
      const rect = opts.global
        ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
        : el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      xTarget = (((event.clientX - rect.left) / rect.width) - 0.5) * 2;
      yTarget = (((event.clientY - rect.top) / rect.height) - 0.5) * 2;
    };

    const onGyro = (event) => {
      xTarget = clamp((event.gamma || 0) / 30, -1, 1);
      yTarget = clamp((event.beta || 0) / 30, -1, 1);
    };

    let permissionHandler = null;
    if (useGyro) {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        permissionHandler = async () => {
          try {
            const result = await DeviceOrientationEvent.requestPermission();
            if (result === 'granted') window.addEventListener('deviceorientation', onGyro, { passive: true });
          } catch (_error) {
            // Permission can only be requested from a user gesture and may be denied.
          } finally {
            eventTarget.removeEventListener('pointerdown', permissionHandler);
          }
        };
        eventTarget.addEventListener('pointerdown', permissionHandler, { once: true });
      } else {
        window.addEventListener('deviceorientation', onGyro, { passive: true });
      }
    } else {
      eventTarget.addEventListener('pointermove', onPointerMove, { passive: true });
    }

    const tick = () => {
      if (!alive) return;
      targets.forEach((target, index) => {
        const multiplier = Number(target.dataset.mpSpeed ?? target.dataset.ktMouseSpeed ?? opts.speed ?? 0.05);
        currentX[index] = lerp(currentX[index], xTarget * maxX * multiplier, ease);
        currentY[index] = lerp(currentY[index], yTarget * maxY * multiplier, ease);
        target.style.transform = `translate3d(${currentX[index]}px, ${currentY[index]}px, 0)`;
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return {
      el,
      type: 'mouseParallax',
      pause: () => {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
      },
      resume: () => {
        if (!alive) {
          alive = true;
          rafId = requestAnimationFrame(tick);
        }
      },
      destroy: () => {
        alive = false;
        if (rafId != null) cancelAnimationFrame(rafId);
        eventTarget.removeEventListener('pointermove', onPointerMove);
        if (permissionHandler) eventTarget.removeEventListener('pointerdown', permissionHandler);
        window.removeEventListener('deviceorientation', onGyro);
        restores.forEach((restore) => restore());
      }
    };
  },
  reduced() {},
  fallback(el, opts) {
    return this.create(el, { ...opts, gyro: false });
  }
};
