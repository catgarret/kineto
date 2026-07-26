export default {
  create(el, opts) {
    const effect = opts.effect || opts.preset || 'curtain';
    const duration = Math.max(0.1, Number(opts.duration ?? 0.9)) * 1000;
    const easing = typeof opts.ease === 'string' && (opts.ease.includes('(') || opts.ease.startsWith('ease') || opts.ease === 'linear')
      ? opts.ease
      : 'cubic-bezier(.76,0,.24,1)';
    const color = opts.color || '#0a0908';
    const color2 = opts.color2 || color;
    const delay = Math.max(0, Number(opts.delay ?? 0)) * 1000;
    const direction = opts.direction || 'up';
    const layers = [];
    const players = new Set();
    const timers = new Set();
    let finished = false;

    const later = (callback, ms) => {
      const id = setTimeout(() => { timers.delete(id); callback(); }, ms);
      timers.add(id);
      return id;
    };
    const layer = (styles) => {
      const node = document.createElement('div');
      node.setAttribute('aria-hidden', 'true');
      node.style.cssText = `position:fixed;z-index:99997;pointer-events:none;background:${color};${styles}`;
      document.body.appendChild(node);
      layers.push(node);
      return node;
    };
    const play = (node, keyframes, options) => {
      const player = node.animate(keyframes, { duration, delay, easing, fill: 'forwards', ...options });
      players.add(player);
      player.finished.catch(() => {}).finally(() => players.delete(player));
      return player;
    };
    const done = () => {
      if (finished) return;
      finished = true;
      layers.forEach((node) => node.remove());
      opts.onComplete?.();
    };

    if (effect === 'split') {
      const vertical = direction === 'left' || direction === 'right' || opts.axis === 'x';
      if (vertical) {
        const left = layer('left:0;top:0;width:50%;height:100%;');
        const right = layer(`right:0;top:0;width:50%;height:100%;background:${color2};`);
        play(left, [{ transform: 'translateX(0)' }, { transform: 'translateX(-100%)' }]);
        play(right, [{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }]).finished.then(done).catch(done);
      } else {
        const top = layer('left:0;top:0;width:100%;height:50%;');
        const bottom = layer(`left:0;bottom:0;width:100%;height:50%;background:${color2};`);
        play(top, [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }]);
        play(bottom, [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }]).finished.then(done).catch(done);
      }
    } else if (effect === 'blinds') {
      // Staggered vertical slats.
      const count = Math.max(3, Math.round(Number(opts.count ?? 6)));
      const stagger = Math.max(0, Number(opts.stagger ?? 0.07)) * 1000;
      let last = null;
      for (let index = 0; index < count; index += 1) {
        const slat = layer(`top:0;height:100%;left:${(index / count) * 100}%;width:${100 / count + 0.1}%;background:${index % 2 ? color2 : color};transform-origin:top;`);
        last = play(slat, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { delay: delay + index * stagger });
      }
      last?.finished.then(done).catch(done);
    } else if (effect === 'diagonal') {
      // Angled curtain: a slanted cover sweeps off-screen along its tilt with
      // a trailing panel behind for depth — a real diagonal wipe, not a
      // corner shrink.
      const angle = Number(opts.angle ?? -14);
      const shift = direction === 'left' ? '-120%' : '120%';
      const slab = (bg) => layer(`top:50%;left:50%;width:260vmax;height:260vmax;margin:-130vmax 0 0 -130vmax;background:${bg};will-change:transform;`);
      const diagonalTrail = slab(color2);
      const diagonalCover = slab(color);
      play(diagonalCover, [
        { transform: `rotate(${angle}deg) translateX(0)` },
        { transform: `rotate(${angle}deg) translateX(${shift})` }
      ]);
      play(diagonalTrail, [
        { transform: `rotate(${angle}deg) translateX(0)` },
        { transform: `rotate(${angle}deg) translateX(${shift})` }
      ], { delay: delay + duration * 0.14 }).finished.then(done).catch(done);
    } else if (effect === 'circle') {
      const overlay = layer('width:200vmax;height:200vmax;top:50%;left:50%;margin:-100vmax 0 0 -100vmax;border-radius:50%;');
      play(overlay, [{ transform: 'scale(1)' }, { transform: 'scale(0)' }]).finished.then(done).catch(done);
    } else if (effect === 'wipe') {
      const overlay = layer('inset:0;');
      const origin = direction === 'left' ? 'left' : direction === 'up' ? 'top' : direction === 'down' ? 'bottom' : 'right';
      overlay.style.transformOrigin = origin;
      const axis = (origin === 'left' || origin === 'right') ? 'scaleX' : 'scaleY';
      play(overlay, [{ transform: `${axis}(1)` }, { transform: `${axis}(0)` }]).finished.then(done).catch(done);
    } else if (effect === 'fade') {
      const overlay = layer('inset:0;');
      play(overlay, [{ opacity: 1 }, { opacity: 0 }], { easing: 'ease' }).finished.then(done).catch(done);
    } else if (effect === 'checker') {
      // Grid of tiles popping away in a random order.
      const columns = Math.max(2, Math.round(Number(opts.count ?? 8)));
      const rows = Math.max(2, Math.round(columns * (window.innerHeight / Math.max(1, window.innerWidth))));
      const total = columns * rows;
      const order = Array.from({ length: total }, (_, index) => index).sort(() => Math.random() - 0.5);
      const stagger = Math.max(0, Number(opts.stagger ?? 0.012)) * 1000;
      let last = null;
      order.forEach((cellIndex, orderIndex) => {
        const column = cellIndex % columns;
        const row = Math.floor(cellIndex / columns);
        const tile = layer(`left:${(column / columns) * 100}%;top:${(row / rows) * 100}%;width:${100 / columns + 0.1}%;height:${100 / rows + 0.1}%;background:${(column + row) % 2 ? color2 : color};`);
        last = play(tile, [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(0)', opacity: 0 }
        ], { duration: Math.max(160, duration * 0.45), delay: delay + orderIndex * stagger });
      });
      last?.finished.then(done).catch(done);
    } else if (effect === 'strips') {
      // Vertical strips sliding away in a shuffled order.
      const count = Math.max(3, Math.round(Number(opts.count ?? 9)));
      const order = Array.from({ length: count }, (_, index) => index).sort(() => Math.random() - 0.5);
      const stagger = Math.max(0, Number(opts.stagger ?? 0.05)) * 1000;
      const up = direction !== 'down';
      let last = null;
      order.forEach((stripIndex, orderIndex) => {
        const strip = layer(`top:0;height:100%;left:${(stripIndex / count) * 100}%;width:${100 / count + 0.1}%;background:${stripIndex % 2 ? color2 : color};`);
        last = play(strip, [
          { transform: 'translateY(0)' },
          { transform: `translateY(${up ? '-102%' : '102%'})` }
        ], { duration: Math.max(200, duration * 0.7), delay: delay + orderIndex * stagger });
      });
      last?.finished.then(done).catch(done);
    } else if (effect === 'shutter') {
      // Horizontal slats opening from alternating sides, like camera blades.
      const count = Math.max(3, Math.round(Number(opts.count ?? 6)));
      const stagger = Math.max(0, Number(opts.stagger ?? 0.06)) * 1000;
      let last = null;
      for (let index = 0; index < count; index += 1) {
        const slat = layer(`left:0;width:100%;top:${(index / count) * 100}%;height:${100 / count + 0.1}%;background:${index % 2 ? color2 : color};transform-origin:${index % 2 ? 'right' : 'left'} center;`);
        last = play(slat, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { delay: delay + index * stagger });
      }
      last?.finished.then(done).catch(done);
    } else if (effect === 'columns') {
      // Editorial columns peel upward/downward in alternating directions.
      const count = Math.max(3, Math.round(Number(opts.count ?? 6)));
      const stagger = Math.max(0, Number(opts.stagger ?? 0.055)) * 1000;
      let last = null;
      for (let index = 0; index < count; index += 1) {
        const column = layer(`top:0;height:100%;left:${(index / count) * 100}%;width:${100 / count + 0.1}%;background:${index % 2 ? color2 : color};`);
        last = play(column, [
          { transform: 'translateY(0)' },
          { transform: `translateY(${index % 2 ? '102%' : '-102%'})` }
        ], { duration: Math.max(220, duration * 0.74), delay: delay + index * stagger });
      }
      last?.finished.then(done).catch(done);
    } else if (effect === 'zoom') {
      // A full cover pushes toward the viewer while fading away.
      const overlay = layer(`inset:0;background:radial-gradient(circle at 50% 45%,${color2},${color});`);
      play(overlay, [
        { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' },
        { transform: 'scale(1.22)', opacity: 0, filter: 'blur(12px)' }
      ], { easing: 'cubic-bezier(.22,.8,.3,1)' }).finished.then(done).catch(done);
    } else {
      // curtain (default): the cover peels away in the chosen direction with a
      // soft secondary panel trailing behind for depth.
      const trail = layer(`inset:0;background:${color2};`);
      const overlay = layer('inset:0;');
      const origin = direction === 'down' ? 'bottom' : direction === 'left' ? 'left' : direction === 'right' ? 'right' : 'top';
      overlay.style.transformOrigin = origin;
      trail.style.transformOrigin = origin;
      const axis = (origin === 'left' || origin === 'right') ? 'scaleX' : 'scaleY';
      play(overlay, [{ transform: `${axis}(1)` }, { transform: `${axis}(0)` }]);
      play(trail, [{ transform: `${axis}(1)` }, { transform: `${axis}(0)` }], { delay: delay + duration * 0.12 })
        .finished.then(done).catch(done);
    }

    // Safety: never leave a cover stuck on screen.
    later(done, delay + duration * 2 + 600);

    return {
      el,
      type: 'pageReveal',
      pause: () => players.forEach((player) => player.pause()),
      resume: () => players.forEach((player) => player.play()),
      destroy: () => {
        players.forEach((player) => player.cancel());
        players.clear();
        timers.forEach(clearTimeout);
        timers.clear();
        layers.forEach((node) => node.remove());
      }
    };
  },
  reduced(_el, opts) {
    opts.onComplete?.();
  }
};
