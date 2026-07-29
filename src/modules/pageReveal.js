// Local clamp: this module has no other utils dependency and adding one just for
// a two-line helper would pull the whole module graph in.
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

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
      // Every other effect layers a stagger or a trailing panel on top of
      // `duration`, so a bare one-shot fade finished noticeably sooner than the
      // rest. Stretching it keeps the family at one perceived pace.
      const overlay = layer('inset:0;');
      play(overlay, [{ opacity: 1 }, { opacity: 0 }], { duration: duration * 1.45, easing: 'ease' })
        .finished.then(done).catch(done);
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
      // A rectangular mask that GROWS from the exact centre of the viewport.
      //
      // A single `clip-path: inset()` on one cover cannot do this — inset keeps the
      // middle and trims the edges, so the page would open from the edges inward,
      // which is the opposite of the reference (measured: the old version animated
      // `inset(0) -> inset(50%)`, i.e. the cover shrank toward the centre).
      // Four solid panels leave a real hole in the middle instead, and all four
      // retreat together so the hole grows as a rectangle. Same construction as
      // `center-slit`, but both axes open at once rather than in sequence.
      //
      // Each panel also scales slightly past its edge, which is what gives the
      // "zoom" read — the frame pushes out of the viewport instead of merely
      // sliding away. `iris` covers the round variant of this idea.
      const band = (styles) => layer(`background:${color};${styles}`);
      const top = band('left:0;right:0;top:0;height:50%;transform-origin:top;');
      const bottom = band('left:0;right:0;bottom:0;height:50%;transform-origin:bottom;');
      const left = band(`top:0;bottom:0;left:0;width:50%;transform-origin:left;background:${color2};`);
      const right = band(`top:0;bottom:0;right:0;width:50%;transform-origin:right;background:${color2};`);
      // The side panels sit under the top/bottom pair, so they carry color2 and
      // read as a thin frame while the rectangle opens.
      const ease = 'cubic-bezier(.22,.8,.3,1)';
      const grow = duration * 1.25;
      play(top, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: grow, easing: ease });
      play(bottom, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: grow, easing: ease });
      play(left, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: grow, easing: ease });
      play(right, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: grow, easing: ease })
        .finished.then(done).catch(done);
    } else if (effect === 'iris') {
      // A hard-edged aperture opens from the centre outwards. `clip-path`
      // clips what stays VISIBLE, so the cover is animated as a circle that
      // shrinks to nothing while a tinted ring trails a beat behind it.
      const ring = layer(`inset:0;background:${color2};`);
      const overlay = layer('inset:0;');
      const circle = (radius) => `circle(${radius} at 50% 50%)`;
      play(overlay, [{ clipPath: circle('150%') }, { clipPath: circle('0%') }]);
      play(ring, [
        { clipPath: circle('150%') },
        { clipPath: circle('150%'), offset: .18 },
        { clipPath: circle('0%') }
      ], { duration: duration * 1.3 }).finished.then(done).catch(done);
    } else if (effect === 'data-mosaic') {
      // Black cover punched through by tiles, the way the reference actually
      // works: the coloured squares are the PAGE showing through holes, not
      // blocks painted on top. Tiles disappear on a seeded schedule so the
      // randomness is reproducible and shaped, not per-frame noise.
      const seed = Math.floor(Number(opts.seed ?? 20260729)) || 1;
      let state = seed >>> 0;
      // mulberry32: tiny, fast, and deterministic for a given seed.
      const rand = () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      const density = clamp(Number(opts.density ?? 1), 0.3, 2);
      const tileMin = Math.max(4, Number(opts.tileMin ?? 10));
      const tileMax = Math.max(tileMin * 2, Number(opts.tileMax ?? 96));
      const largeChance = clamp(Number(opts.largeTileChance ?? 0.15), 0, 1);
      const smallChance = clamp(Number(opts.smallTileChance ?? 0.55), 0, 1);
      const noiseMs = Math.max(0, Number(opts.noiseDuration ?? 0.18)) * 1000;
      const cleanupMs = Math.max(0, Number(opts.cleanupDuration ?? 0.35)) * 1000;
      const total = Math.max(400, duration * 1.45);
      const bodyMs = Math.max(120, total - noiseMs - cleanupMs);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const overscan = Math.max(0, Number(opts.overscan ?? 0));
      // A single full-bleed black layer guarantees no seams between tiles.
      const base = layer(`inset:${-overscan}px;background:${color};`);
      const tiles = [];
      // The previous version capped the tile list while walking cells in
      // row-major order, so the first few cells spent the whole budget and only
      // the top-left corner was ever covered. Size the grid from a TARGET count
      // instead: every cell gets a subdivision, and the total lands on budget by
      // construction, so coverage is always complete.
      const cols = Math.ceil((vw + overscan * 2) / tileMax);
      const rows = Math.ceil((vh + overscan * 2) / tileMax);
      const cells = Math.max(1, cols * rows);
      const target = Math.round(clamp(560 * density, 80, 1400));
      // Average sub-tiles per cell needed to hit the target; split is its sqrt.
      const avgPerCell = clamp(target / cells, 1, 36);
      const maxSplit = Math.max(1, Math.min(6, Math.round(tileMax / tileMin)));
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const roll = rand();
          // Weighted split so small / medium / large blocks all appear, while the
          // mean stays near avgPerCell.
          const base = Math.sqrt(avgPerCell);
          const split = roll < smallChance
            ? Math.min(maxSplit, Math.max(2, Math.round(base * 1.6)))
            : roll < smallChance + (1 - smallChance - largeChance)
              ? Math.min(maxSplit, Math.max(1, Math.round(base)))
              : 1;
          const size = tileMax / split;
          for (let sy = 0; sy < split; sy += 1) {
            for (let sx = 0; sx < split; sx += 1) {
              tiles.push({
                x: -overscan + col * tileMax + sx * size,
                y: -overscan + row * tileMax + sy * size,
                w: size, h: size,
                // Bigger tiles clear later: the eye reads small specks first,
                // then fragments, then whole panels.
                weight: rand() * 0.72 + (size / tileMax) * 0.28
              });
            }
          }
        }
      }
      tiles.sort((a, b) => a.weight - b.weight);
      const holes = tiles.map((tile) => {
        const node = layer(`left:${tile.x}px;top:${tile.y}px;width:${Math.ceil(tile.w)}px;height:${Math.ceil(tile.h)}px;background:${color};`);
        return node;
      });
      // Every hole is a black tile that vanishes; the base layer vanishes last.
      holes.forEach((node, index) => {
        const t = index / Math.max(1, holes.length - 1);
        later(() => { node.style.opacity = '0'; node.style.transition = 'opacity 90ms linear'; },
          delay + noiseMs + t * bodyMs);
      });
      // The base cover has to go as soon as the first holes appear, otherwise
      // nothing would show through it.
      later(() => {
        base.style.transition = `opacity ${Math.round(noiseMs)}ms steps(6,end)`;
        base.style.opacity = '0';
      }, delay + noiseMs * 0.35);
      later(done, delay + noiseMs + bodyMs + cleanupMs);
    } else if (effect === 'center-slit') {
      // A single clip-path inset on one cover can only CLOSE toward the middle —
      // the page would open from the edges inward, the opposite of the reference.
      // Four solid panels leave a real hole in the centre instead: the hole is a
      // hairline, the top/bottom panels retreat to open it vertically, then the
      // side panels retreat to open it horizontally.
      const lineWidth = Math.max(8, Number(opts.lineWidth ?? 160));
      const lineHeight = Math.max(0.5, Number(opts.lineHeight ?? 1));
      const vDur = Math.max(0.05, Number(opts.verticalDuration ?? 0.65)) * 1000;
      const hDur = Math.max(0.05, Number(opts.horizontalDuration ?? 0.6)) * 1000;
      const thicken = 180;
      const halfW = lineWidth / 2;
      const halfH = lineHeight / 2;
      const vEase = 'cubic-bezier(.65,0,.35,1)';
      const hEase = 'cubic-bezier(.87,0,.13,1)';
      const band = (styles) => layer(`background:${color};${styles}`);
      const top = band(`left:0;right:0;top:0;height:calc(50% - ${halfH}px);transform-origin:top;`);
      const bottom = band(`left:0;right:0;bottom:0;height:calc(50% - ${halfH}px);transform-origin:bottom;`);
      const left = band(`top:0;bottom:0;left:0;width:calc(50% - ${halfW}px);transform-origin:left;background:${color2};`);
      const right = band(`top:0;bottom:0;right:0;width:calc(50% - ${halfW}px);transform-origin:right;background:${color2};`);
      const reverse = opts.reverse === true;
      // Vertical first: the hairline grows into a tall, narrow window. A short
      // "thicken" hold at the start matches the reference's initial flick.
      const openV = [
        { transform: 'scaleY(1)', offset: 0 },
        { transform: 'scaleY(.985)', offset: thicken / (thicken + vDur), easing: vEase },
        { transform: 'scaleY(0)', offset: 1 }
      ];
      const openH = [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }];
      const vOpts = { duration: thicken + vDur, easing: vEase, delay };
      const hOpts = { duration: hDur, easing: hEase, delay: delay + thicken + vDur };
      if (reverse) {
        // Closing: horizontal shuts first, then vertical collapses to the line.
        const shutH = [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }];
        const shutV = [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }];
        play(left, shutH, { duration: hDur, easing: hEase, delay });
        play(right, shutH, { duration: hDur, easing: hEase, delay });
        play(top, shutV, { duration: vDur, easing: vEase, delay: delay + hDur });
        play(bottom, shutV, { duration: vDur, easing: vEase, delay: delay + hDur })
          .finished.then(done).catch(done);
      } else {
        play(top, openV, vOpts);
        play(bottom, openV.map((frame) => ({ ...frame })), vOpts);
        play(left, openH, hOpts);
        play(right, openH.map((frame) => ({ ...frame })), hOpts)
          .finished.then(done).catch(done);
      }
    } else if (effect === 'flash') {
      // Plus X's `flashMask`: solid covers translate straight out of frame as
      // whole blocks — no scaling, so nothing stretches — each a beat behind the
      // last, on their signature cubic-bezier(.165,.84,.44,1) ease-out.
      const shift = {
        up: '0,-100%', down: '0,100%', left: '-100%,0', right: '100%,0'
      }[direction] || '0,-100%';
      const flashEase = 'cubic-bezier(.165,.84,.44,1)';
      const back = layer(`inset:0;background:${color2};`);
      const front = layer('inset:0;');
      play(front, [
        { transform: 'translate3d(0,0,0)' },
        { transform: `translate3d(${shift},0)` }
      ], { duration: duration * 1.05, easing: flashEase });
      play(back, [
        { transform: 'translate3d(0,0,0)' },
        { transform: 'translate3d(0,0,0)', offset: .22 },
        { transform: `translate3d(${shift},0)` }
      ], { duration: duration * 1.35, easing: flashEase })
        .finished.then(done).catch(done);
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
