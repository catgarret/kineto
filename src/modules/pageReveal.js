// Local clamp: this module has no other utils dependency and adding one just for
// a two-line helper would pull the whole module graph in.
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

// ── Motion vocabulary ───────────────────────────────────────────────────────
// House curves in the Awwwards / Locomotive / Cuberto register. The single most
// important property for a REVEAL is that the cover leaves at full velocity from
// frame one. A symmetric in-out curve — which this module used to default to —
// spends its first ~15% of the timeline barely moving, and the eye reads that
// initial crawl as a stutter before the transition "catches". Every exit below
// is therefore an -out curve.
const EASE = {
  // Penner expoOut. Violent start, very long tail — the signature page-transition
  // curve. Default for anything that leaves the screen.
  expo: 'cubic-bezier(.16,1,.3,1)',
  // Slightly gentler; for large slow slabs where expo looks snapped.
  quint: 'cubic-bezier(.22,1,.36,1)',
  // Shorter tail, for small travel distances where expo feels floaty.
  quart: 'cubic-bezier(.25,1,.5,1)',
  // The only in-out here. Reserved for motion that must genuinely start at rest.
  inOut: 'cubic-bezier(.76,0,.24,1)'
};

export default {
  create(el, opts) {
    const effect = opts.effect || opts.preset || 'curtain';
    const duration = Math.max(0.1, Number(opts.duration ?? 0.9)) * 1000;
    // The module default is an -out curve (see EASE). `opts.ease` still wins, so
    // a caller who wants the old in-out feel just asks for it.
    const easing = typeof opts.ease === 'string' && (opts.ease.includes('(') || opts.ease.startsWith('ease') || opts.ease === 'linear')
      ? opts.ease
      : EASE.expo;
    // True when the caller pinned a curve. Effects that are built around a
    // specific hand-fitted curve consult this before overriding themselves.
    const easePinned = typeof opts.ease === 'string' && opts.ease.length > 0;
    const color = opts.color || '#0a0908';
    const color2 = opts.color2 || color;
    const delay = Math.max(0, Number(opts.delay ?? 0)) * 1000;
    const direction = opts.direction || 'up';
    const layers = [];
    const players = new Set();
    const timers = new Set();
    // Effects that touch the host element itself (rather than only their own
    // covers) register their undo here so both `done` and `destroy` restore it.
    const cleanups = [];
    let finished = false;

    const later = (callback, ms) => {
      const id = setTimeout(() => { timers.delete(id); callback(); }, ms);
      timers.add(id);
      return id;
    };
    // `parent` defaults to <body>, but any effect that transforms the page itself
    // MUST mount its covers outside the transformed element: a transform makes
    // the element a containing block for `position:fixed` descendants, so a
    // cover parked in <body> would inherit the page's own scale and slide around
    // with it instead of staying pinned to the viewport.
    const layer = (styles, parent) => {
      const node = document.createElement('div');
      node.setAttribute('aria-hidden', 'true');
      node.style.cssText = `position:fixed;z-index:99997;pointer-events:none;background:${color};${styles}`;
      (parent || document.body).appendChild(node);
      layers.push(node);
      return node;
    };
    const play = (node, keyframes, options) => {
      const player = node.animate(keyframes, { duration: beat, delay, easing, fill: 'forwards', ...options });
      players.add(player);
      player.finished.catch(() => {}).finally(() => players.delete(player));
      return player;
    };
    const done = () => {
      if (finished) return;
      finished = true;
      layers.forEach((node) => node.remove());
      cleanups.forEach((undo) => { try { undo(); } catch (_e) { /* already gone */ } });
      opts.onComplete?.();
    };
    // An -out curve front-loads its travel: expo-out is ~90% done by 35% of the
    // timeline, so switching the family to it made every preset read as much
    // faster even though `duration` never changed. Perceived pace is what the
    // eye judges, so each preset carries a multiplier that restores it. These
    // are tuned against `curtain` (1.0), which is the reference feel.
    const PACE = {
      fade: 1.85, zoom: 1.5, shutter: 1.35, diagonal: 1.4, grid: 1.35,
      blinds: 1.2, split: 1.15, curve: 1.3, dissolve: 1.35, push: 1.3,
      fold: 1.3, iris: 1.25, flash: 1.25, curtain: 1.0
    };
    const pace = PACE[effect] ?? 1;
    // Every effect body works in `beat`, never in the raw `duration`.
    const beat = duration * pace;
    // Staggers are expressed as a FRACTION of the timeline, never as a fixed
    // per-item delay. A fixed 70ms step with 6 slats adds 420ms to a 900ms
    // reveal: the last slat starts as the first one finishes, so the group reads
    // as a queue of separate ticks rather than one gesture. Overlap is precisely
    // what makes a stagger feel like a single piece of material moving.
    const spread = (index, count, fraction) =>
      (count < 2 ? 0 : (index / (count - 1)) * beat * fraction);
    // Bands are laid out with a 1px bleed on the trailing side. Percentage-only
    // widths land on fractional device pixels and leave hairline seams that
    // flicker while the band moves.
    const band = (styles, bg) => layer(`background:${bg || color};will-change:transform,opacity;${styles}`);
    // `.finished` on whichever animation is scheduled to end last. Several
    // effects used to hang `done` off the last STARTED animation, which is not
    // the last to finish once per-item durations differ.
    const finishWith = (player) => { player.finished.then(done).catch(done); return player; };

    if (effect === 'split') {
      // Two halves part along the axis. The second half lags by a few percent of
      // the timeline: a perfectly symmetric parting reads as a machine, a small
      // asymmetry reads as a gesture. Both halves also drift slightly past the
      // edge so neither stops visibly at exactly 100%.
      const vertical = direction === 'left' || direction === 'right' || opts.axis === 'x';
      const lag = beat * 0.06;
      if (vertical) {
        const left = band('left:0;top:0;width:calc(50% + 1px);height:100%;');
        const right = band('right:0;top:0;width:calc(50% + 1px);height:100%;', color2);
        play(left, [{ transform: 'translateX(0)' }, { transform: 'translateX(-102%)' }], { easing });
        finishWith(play(right, [{ transform: 'translateX(0)' }, { transform: 'translateX(102%)' }],
          { delay: delay + lag, easing }));
      } else {
        const top = band('left:0;top:0;width:100%;height:calc(50% + 1px);');
        const bottom = band('left:0;bottom:0;width:100%;height:calc(50% + 1px);', color2);
        play(top, [{ transform: 'translateY(0)' }, { transform: 'translateY(-102%)' }], { easing });
        finishWith(play(bottom, [{ transform: 'translateY(0)' }, { transform: 'translateY(102%)' }],
          { delay: delay + lag, easing }));
      }
    } else if (effect === 'blinds') {
      // Vertical slats collapse from ALTERNATING edges. The alternation is what
      // absorbed the old `columns` preset: a set of bands all leaving the same
      // way was indistinguishable from `strips`, and both were indistinguishable
      // from this one.
      const count = Math.max(3, Math.round(Number(opts.count ?? 7)));
      const fraction = clamp(Number(opts.stagger ?? 0.45), 0, 0.8);
      let last = null;
      for (let index = 0; index < count; index += 1) {
        const slat = band(
          `top:0;height:100%;left:${(index / count) * 100}%;width:calc(${100 / count}% + 1px);transform-origin:${index % 2 ? 'bottom' : 'top'};`,
          index % 2 ? color2 : color
        );
        last = play(slat, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], {
          delay: delay + spread(index, count, fraction),
          duration: beat * 0.82,
          easing
        });
      }
      if (last) finishWith(last);
    } else if (effect === 'shutter') {
      // Horizontal slats close from alternating sides, like camera blades. Same
      // family as `blinds` but rotated 90° and driven on the other axis, which is
      // enough to read as a different mechanism.
      const count = Math.max(3, Math.round(Number(opts.count ?? 7)));
      const fraction = clamp(Number(opts.stagger ?? 0.45), 0, 0.8);
      let last = null;
      for (let index = 0; index < count; index += 1) {
        const slat = band(
          `left:0;width:100%;top:${(index / count) * 100}%;height:calc(${100 / count}% + 1px);transform-origin:${index % 2 ? 'right' : 'left'} center;`,
          index % 2 ? color2 : color
        );
        last = play(slat, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], {
          delay: delay + spread(index, count, fraction),
          duration: beat * 0.84,
          easing
        });
      }
      if (last) finishWith(last);
    } else if (effect === 'diagonal') {
      // Angled curtain: a slanted slab sweeps off-screen along its own tilt with
      // a trailing panel behind for depth.
      // `angle` is the family-wide tilt knob (default 14). Diagonal reads it as
      // a negative rake, which is the direction the reference sweeps.
      const angle = -Math.abs(Number(opts.angle ?? 14));
      const shift = direction === 'left' ? '-135%' : '135%';
      const slab = (bg) => band('top:50%;left:50%;width:260vmax;height:260vmax;margin:-130vmax 0 0 -130vmax;', bg);
      const diagonalTrail = slab(color2);
      const diagonalCover = slab(color);
      play(diagonalCover, [
        { transform: `rotate(${angle}deg) translateX(0)` },
        { transform: `rotate(${angle}deg) translateX(${shift})` }
      ], { easing });
      finishWith(play(diagonalTrail, [
        { transform: `rotate(${angle}deg) translateX(0)` },
        { transform: `rotate(${angle}deg) translateX(${shift})` }
      ], { delay: delay + beat * 0.11, duration: beat * 1.05, easing }));
    } else if (effect === 'curve') {
      // The trailing edge of the cover is a CURVE that flattens as it leaves —
      // the single most recognisable page transition in the Awwwards register.
      // Implemented with `border-radius` rather than an SVG path morph: `d` is
      // only animatable in recent engines, whereas an elliptical radius is
      // composited everywhere and needs no second element.
      //
      // The cover is oversized on the travel axis so the bulge can never expose a
      // gap behind it, and the radius peaks mid-flight instead of at an endpoint,
      // which is what sells it as tension in a sheet of material.
      const axis = direction === 'down' ? 'down' : direction === 'left' ? 'left' : direction === 'right' ? 'right' : 'up';
      const horizontal = axis === 'left' || axis === 'right';
      // Curve reads the same knob as a bulge depth in vh/vw: 14 -> ~18, which is
      // the tuned value from the reference.
      const bulge = clamp(Math.abs(Number(opts.angle ?? 14)) * 1.3, 4, 40);
      const cover = band(horizontal
        ? 'top:0;bottom:0;left:-10vw;width:120vw;'
        : 'left:0;right:0;top:-10vh;height:120vh;');
      const radiusFor = (amount) => {
        if (axis === 'up') return `0 0 50% 50% / 0 0 ${amount}vh ${amount}vh`;
        if (axis === 'down') return `50% 50% 0 0 / ${amount}vh ${amount}vh 0 0`;
        if (axis === 'left') return `0 50% 50% 0 / 0 ${amount}vw ${amount}vw 0`;
        return `50% 0 0 50% / ${amount}vw 0 0 ${amount}vw`;
      };
      const sign = (axis === 'up' || axis === 'left') ? -1 : 1;
      const move = (percent) => (horizontal ? `translateX(${percent}%)` : `translateY(${percent}%)`);
      finishWith(play(cover, [
        { transform: move(0), borderRadius: radiusFor(0) },
        { transform: move(sign * 50), borderRadius: radiusFor(bulge), offset: 0.42 },
        { transform: move(sign * 118), borderRadius: radiusFor(0) }
      ], { duration: beat * 1.12, easing: easePinned ? easing : EASE.quint }));
    } else if (effect === 'dissolve') {
      // A feathered gradient mask sweeps the cover away. There is no hard edge
      // anywhere in this one, which is what separates it from every wipe in the
      // set: `curtain` and `curve` both present a defined boundary, this one
      // erases. Only `mask-position` animates, so it stays on the compositor.
      const axis = direction === 'down' ? 'to top' : direction === 'left' ? 'to right' : direction === 'right' ? 'to left' : 'to bottom';
      const horizontal = direction === 'left' || direction === 'right';
      const cover = band('inset:0;');
      // 200% of the element on the travel axis: the opaque half covers it at the
      // start, the transparent half at the end, and the 16% ramp between them is
      // the soft edge (≈32% of the viewport — wide enough to never band).
      const gradient = `linear-gradient(${axis}, #000 0 42%, transparent 58% 100%)`;
      const size = horizontal ? '200% 100%' : '100% 200%';
      const from = horizontal ? (direction === 'left' ? '100% 50%' : '0% 50%') : (direction === 'down' ? '50% 100%' : '50% 0%');
      const to = horizontal ? (direction === 'left' ? '0% 50%' : '100% 50%') : (direction === 'down' ? '50% 0%' : '50% 100%');
      cover.style.maskImage = gradient;
      cover.style.webkitMaskImage = gradient;
      cover.style.maskSize = size;
      cover.style.webkitMaskSize = size;
      cover.style.maskRepeat = 'no-repeat';
      cover.style.webkitMaskRepeat = 'no-repeat';
      finishWith(play(cover, [
        { maskPosition: from, webkitMaskPosition: from },
        { maskPosition: to, webkitMaskPosition: to }
      ], { duration: beat * 1.15, easing: easePinned ? easing : EASE.quint }));
    } else if (effect === 'push') {
      // The cover does not merely uncover the page — it PUSHES it into place. The
      // page enters from the opposite side and settles, so the two surfaces stay
      // in contact for the whole transition. This is the only preset besides
      // `zoom` where the page itself is part of the motion, and the contact is
      // what makes it read as one continuous move instead of a lid coming off.
      const axis = direction === 'down' ? 'down' : direction === 'left' ? 'left' : direction === 'right' ? 'right' : 'up';
      const coverExit = { up: 'translateY(-102%)', down: 'translateY(102%)', left: 'translateX(-102%)', right: 'translateX(102%)' }[axis];
      // VIEWPORT units, never percentages. A percentage translate resolves
      // against the element's OWN border box, and the host here is the document
      // root — on a long page that box is tens of thousands of pixels tall, so
      // `translateY(16%)` threw the page thousands of px down and the scroll
      // position ended up pinned at the bottom. This is the same trap that made
      // `zoom` swing up from the bottom before its origin was fixed: anything
      // measured against the host is measured against the whole DOCUMENT.
      const pageEnter = {
        up: 'translateY(11vh)', down: 'translateY(-11vh)',
        left: 'translateX(11vw)', right: 'translateX(-11vw)'
      }[axis];
      // Same host rule as `zoom`: a transformed <body> becomes the containing
      // block for fixed descendants, so the cover must live on <html>.
      const host = (el === document.body || el === document.documentElement) ? document.documentElement : el;
      const cover = band('inset:0;', color);
      const trail = band('inset:0;', color2);
      trail.style.zIndex = '99996';
      const pushEase = easePinned ? easing : EASE.quint;
      play(trail, [{ transform: 'translate(0,0)' }, { transform: coverExit }],
        { duration: beat * 1.08, easing: pushEase });
      play(cover, [{ transform: 'translate(0,0)' }, { transform: coverExit }],
        { delay: delay + beat * 0.05, easing: pushEase });
      // Scrollable overflow only ever extends toward the block/inline END edge,
      // so translating the page toward that edge — which `push` must do, the
      // page enters from behind the cover — grows the document on every frame.
      // Measured before this guard: 38 distinct `scrollHeight` values during one
      // 1.2s reveal, i.e. the scrollbar thumb resizing on every frame. `zoom`
      // never had this because scaling toward 1 only ever shrinks.
      //
      // Clipping the root for the duration is the fix. The scrollbar it removes
      // is paid back as padding so the page does not jump sideways, and both are
      // reverted through `cleanups` (which runs from `done` AND `destroy`).
      const root = document.documentElement;
      const gutter = window.innerWidth - root.clientWidth;
      const prevOverflow = root.style.overflow;
      const prevPadding = root.style.paddingRight;
      root.style.overflow = 'clip';
      if (gutter > 0) root.style.paddingRight = `${gutter}px`;
      cleanups.push(() => {
        if (prevOverflow) root.style.overflow = prevOverflow; else root.style.removeProperty('overflow');
        if (prevPadding) root.style.paddingRight = prevPadding; else root.style.removeProperty('padding-right');
      });
      // `fill` left at its default so the transform — and the containing block it
      // creates — evaporates the moment it ends.
      const pageIn = host.animate(
        [{ transform: pageEnter }, { transform: 'translate(0,0)' }],
        { duration: beat * 1.08, delay, easing: pushEase }
      );
      players.add(pageIn);
      pageIn.finished.catch(() => {}).finally(() => players.delete(pageIn));
      pageIn.finished.then(done).catch(done);
    } else if (effect === 'grid') {
      // A 2D checker of LARGE blocks collapsing on a diagonal wave.
      //
      // This replaces `shards`, which cut the cover into angled slices and fanned
      // them outward. Two things were wrong with that: while the slices separated
      // you read the page through thin slivers between them, which looks like torn
      // paper rather than a transition, and once the fan was removed it was just
      // `blinds` with a diagonal seam.
      //
      // Blocks collapse in place instead of travelling, so no gap ever opens
      // between two moving pieces. The wave runs corner to corner on (col + row),
      // which is the one ordering neither `blinds` (1D, left to right) nor
      // `data-mosaic` (hundreds of seeded specks) produces.
      const cols = Math.max(2, Math.round(Number(opts.count ?? 7) * 0.6));
      const rows = Math.max(2, Math.round(cols * (window.innerHeight / Math.max(1, window.innerWidth)) * 1.25));
      const fraction = clamp(Number(opts.stagger ?? 0.45), 0, 0.9);
      const maxWave = (cols - 1) + (rows - 1);
      let last = null;
      let lastEnd = -1;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          // Alternating origins keep neighbouring blocks from collapsing the same
          // way, which is what stops the grid reading as a set of independent bars.
          const parity = (col + row) % 2;
          const block = band(
            `left:${(col / cols) * 100}%;top:${(row / rows) * 100}%;`
            + `width:calc(${100 / cols}% + 1px);height:calc(${100 / rows}% + 1px);`
            + `transform-origin:${parity ? 'bottom' : 'top'};`,
            parity ? color2 : color
          );
          const wave = maxWave === 0 ? 0 : (col + row) / maxWave;
          const startAt = delay + wave * beat * fraction;
          const dur = beat * 0.66;
          const player = play(block, [
            { transform: 'scaleY(1)' },
            { transform: 'scaleY(0)' }
          ], { delay: startAt, duration: dur, easing });
          if (startAt + dur > lastEnd) { lastEnd = startAt + dur; last = player; }
        }
      }
      if (last) finishWith(last);
    } else if (effect === 'fold') {
      // The cover concertinas away like a folding screen.
      //
      // This is the second attempt at 3D in this set. The first, `hinge`, rotated
      // a single VIEWPORT-SIZED panel about one edge: at that scale the
      // perspective foreshortening is enormous, so it read as a giant flap rather
      // than a cover, and the flat backing panel sliding out behind it never
      // matched the rotating edge. Narrow bands fix exactly that — each panel is
      // one nth of the width, so its foreshortening is small and the eye reads the
      // set as one folding surface.
      //
      // It also replaces `skew`, which tried to sell speed with shear and blur and
      // still read as a plain slide.
      const count = Math.max(4, Math.round(Number(opts.count ?? 7)));
      const fraction = clamp(Number(opts.stagger ?? 0.45), 0, 0.8);
      const toLeft = direction !== 'right';
      // One shared perspective on the stage, so every panel folds in the SAME
      // camera. Per-panel `perspective()` in the transform would give each its own
      // vanishing point and the fold would splay.
      const stage = layer('inset:0;background:transparent;perspective:1200px;perspective-origin:50% 50%;');
      const panels = [];
      for (let index = 0; index < count; index += 1) {
        const panel = document.createElement('div');
        // Alternating hinge edges are what make it a fold rather than a set of
        // independent doors. Alternating shade sells the crease: real folded
        // material has one face catching light and the next in shadow.
        const hinge = index % 2 ? 'right' : 'left';
        panel.style.cssText = `position:absolute;top:0;bottom:0;`
          + `left:${(index / count) * 100}%;width:calc(${100 / count}% + 1px);`
          + `background:${index % 2 ? color2 : color};transform-origin:${hinge} center;`
          + 'will-change:transform;backface-visibility:hidden;';
        stage.appendChild(panel);
        panels.push(panel);
      }
      let last = null;
      let lastEnd = -1;
      panels.forEach((panel, index) => {
        // The fold runs across the screen, so order by position, not by parity.
        const order = toLeft ? index / (count - 1) : 1 - index / (count - 1);
        const startAt = delay + order * beat * fraction;
        const dur = beat * 0.78;
        // Folding past 90° hides each panel behind its neighbour; the collapse
        // toward the hinge side is what makes the stack gather instead of
        // hovering in place.
        const player = play(panel, [
          { transform: 'translateX(0) rotateY(0deg)' },
          { transform: `translateX(${toLeft ? '-' : ''}${(100 / count) * 0.9}%) rotateY(${index % 2 ? '-' : ''}88deg)` }
        ], { delay: startAt, duration: dur, easing });
        if (startAt + dur > lastEnd) { lastEnd = startAt + dur; last = player; }
      });
      if (last) finishWith(last);
    } else if (effect === 'fade') {
      // A flat opacity ramp is the cheapest-looking transition there is, so the
      // cover also drifts and swells very slightly. The scale is far too small to
      // read as a zoom; it only stops the fade from feeling like a dimmer switch.
      // The stretched duration keeps this preset at the same perceived pace as
      // the staggered ones, which all run past `duration`.
      const overlay = band('inset:0;');
      finishWith(play(overlay, [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(1.045)' }
      ], { easing: easePinned ? easing : EASE.quart }));
    } else if (effect === 'zoom') {
      // The page grows back to 100% from the exact CENTRE OF THE VIEWPORT while
      // the cover cross-fades away. Two earlier attempts were wrong for reasons
      // worth recording, because both looked broken in very specific ways:
      //
      // 1. Four retreating bands leaving a rectangular hole. That is a frame
      //    wipe, not a zoom (the idea survives as `center-slit` / `iris`).
      // 2. A literal port of reveal.js (`scale(.2)` -> `scale(1)` on the page,
      //    `scale(16)` on the cover). reveal.js scales a viewport-sized <section>;
      //    here the host is <body>, whose box is the whole DOCUMENT. So
      //    `transform-origin` defaulted to 50% of the full page height — often
      //    thousands of pixels below the fold — and the content visibly swung up
      //    from the bottom. The cover was mounted inside that same transformed
      //    <body>, which turned it into a scaled child instead of a fixed
      //    overlay, and `scale(16)` on it made the scrollbar flicker.
      //
      // The fixes are the two lines below: mount the cover on <html> (untouched
      // by the transform) and pin `transform-origin` to the geometric centre of
      // the VIEWPORT expressed in the host's own coordinates.
      // Safari treats a transformed <body> differently from Chromium when it
      // contains fixed/sticky descendants. Animate the root viewport box for a
      // page-level reveal so both engines include the header in the same layer.
      const host = (el === document.body || el === document.documentElement) ? document.documentElement : el;
      const hostRect = host.getBoundingClientRect();
      const originX = window.innerWidth / 2 - hostRect.left;
      const originY = window.innerHeight / 2 - hostRect.top;
      host.style.transformOrigin = `${originX}px ${originY}px`;
      // Scaling UP toward 1 can never add scrollable overflow, so there is no
      // scrollbar to flicker and no need to lock the page.
      const startScale = 0.72;
      const zoomEase = easePinned ? easing : EASE.quint;
      // Unlike the cover-based presets, zoom keeps the page continuously
      // visible. A full-viewport cover here briefly hid fixed/sticky chrome even
      // after the host opacity fade was removed, which read as a header flash.
      // Scaling the host is the complete visual effect; no duplicate cover is
      // needed.
      // `fill` stays at its default (none) so the transform — and the containing
      // block it creates for fixed/sticky descendants — evaporates the instant
      // the animation ends. The explicit origin is cleared in the same breath.
      const zoomIn = host.animate([
        { transform: `scale(${startScale})`, opacity: 0 },
        { transform: 'scale(1)', opacity: 1 }
      ], { duration: beat, delay, easing: zoomEase });
      players.add(zoomIn);
      zoomIn.finished.catch(() => {}).finally(() => players.delete(zoomIn));
      // Clearing the origin belongs in `done`, not in a second promise chain off
      // the same animation: two independent chains have no ordering guarantee, so
      // the property could still be set when `onComplete` fired.
      cleanups.push(() => host.style.removeProperty('transform-origin'));
      zoomIn.finished.then(done).catch(done);
    } else if (effect === 'iris') {
      // A hard-edged aperture opens from the centre outwards. `clip-path` clips
      // what stays VISIBLE, so the cover is animated as a circle that shrinks to
      // nothing while a tinted ring trails a beat behind it. This preset absorbed
      // the old `circle`, which was the same gesture done by scaling a round div
      // — indistinguishable on screen, and blurrier, because a scaled border
      // radius resamples its own antialiased edge.
      const ring = band('inset:0;', color2);
      const overlay = band('inset:0;');
      const circle = (radius) => `circle(${radius} at 50% 50%)`;
      play(overlay, [{ clipPath: circle('150%') }, { clipPath: circle('0%') }], { easing });
      finishWith(play(ring, [
        { clipPath: circle('150%') },
        { clipPath: circle('150%'), offset: .16 },
        { clipPath: circle('0%') }
      ], { duration: beat * 1.28, easing }));
    } else if (effect === 'data-mosaic') {
      // Black cover punched through by tiles, the way the reference actually
      // works: the coloured squares are the PAGE showing through holes, not
      // blocks painted on top. Tiles disappear on a seeded schedule so the
      // randomness is reproducible and shaped, not per-frame noise. This preset
      // absorbed `checker`, which was the same grid with a uniform tile size and
      // a `scale(1)->scale(0)` pop per tile.
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
      const total = Math.max(400, beat * 1.45);
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
          const baseSplit = Math.sqrt(avgPerCell);
          const split = roll < smallChance
            ? Math.min(maxSplit, Math.max(2, Math.round(baseSplit * 1.6)))
            : roll < smallChance + (1 - smallChance - largeChance)
              ? Math.min(maxSplit, Math.max(1, Math.round(baseSplit)))
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
      const holes = tiles.map((tile) => layer(
        `left:${tile.x}px;top:${tile.y}px;width:${Math.ceil(tile.w)}px;height:${Math.ceil(tile.h)}px;background:${color};will-change:opacity,transform;`
      ));
      // Every hole is a black tile that vanishes; the base layer vanishes last.
      // 90ms linear was a blink — at 60fps that is five frames of a hard ramp,
      // and with hundreds of tiles the blinks beat against the frame clock and
      // read as static. A slightly longer ease-out plus a sub-pixel shrink makes
      // each tile dissolve instead.
      holes.forEach((node, index) => {
        const t = index / Math.max(1, holes.length - 1);
        later(() => {
          node.style.transition = `opacity 150ms ${EASE.quart}, transform 150ms ${EASE.quart}`;
          node.style.opacity = '0';
          node.style.transform = 'scale(.86)';
        }, delay + noiseMs + t * bodyMs);
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
      //
      // The two curves here are hand-fitted to the reference footage and are
      // deliberately NOT the house -out curves: the initial hold is the whole
      // character of the gesture. `opts.ease` still overrides both.
      const lineWidth = Math.max(8, Number(opts.lineWidth ?? 160));
      const lineHeight = Math.max(0.5, Number(opts.lineHeight ?? 1));
      const vDur = Math.max(0.05, Number(opts.verticalDuration ?? 0.65)) * 1000;
      const hDur = Math.max(0.05, Number(opts.horizontalDuration ?? 0.6)) * 1000;
      const thicken = 180;
      const halfW = lineWidth / 2;
      const halfH = lineHeight / 2;
      const vEase = easePinned ? easing : 'cubic-bezier(.65,0,.35,1)';
      const hEase = easePinned ? easing : 'cubic-bezier(.87,0,.13,1)';
      const top = band(`left:0;right:0;top:0;height:calc(50% - ${halfH}px);transform-origin:top;`);
      const bottom = band(`left:0;right:0;bottom:0;height:calc(50% - ${halfH}px);transform-origin:bottom;`);
      const left = band(`top:0;bottom:0;left:0;width:calc(50% - ${halfW}px);transform-origin:left;`, color2);
      const right = band(`top:0;bottom:0;right:0;width:calc(50% - ${halfW}px);transform-origin:right;`, color2);
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
        finishWith(play(bottom, shutV, { duration: vDur, easing: vEase, delay: delay + hDur }));
      } else {
        play(top, openV, vOpts);
        play(bottom, openV.map((frame) => ({ ...frame })), vOpts);
        play(left, openH, hOpts);
        finishWith(play(right, openH.map((frame) => ({ ...frame })), hOpts));
      }
    } else if (effect === 'flash') {
      // An anamorphic light streak cuts the frame open.
      //
      // The previous version blew an opaque cover out to white and then ramped its
      // opacity to zero. Structurally that IS a fade — a global opacity ramp with a
      // colour change — which is why it read as one. The distinguishing feature of
      // a flash cut is not brightness, it is that the frame is OPENED by the light
      // rather than dimmed away, and that the light has a shape.
      //
      // Reference behaviour (JJ Abrams-style lens streak, and the light-leak cut
      // used on Active Theory / Awwwards intros): a hairline horizontal streak
      // snaps to full width, blows out vertically, and the cover is clipped away
      // from the centre behind it. Nothing anywhere fades globally.
      const bar = layer('left:-10vw;right:-10vw;top:50%;height:2px;margin-top:-1px;'
        + 'background:linear-gradient(90deg,transparent,#fff 12%,#fff 88%,transparent);'
        + 'filter:blur(1.5px);mix-blend-mode:screen;will-change:transform,opacity;');
      const bloom = layer('inset:0;background:transparent;mix-blend-mode:screen;'
        + 'background-image:radial-gradient(120% 40% at 50% 50%,rgba(255,255,255,.85),transparent 70%);'
        + 'will-change:opacity;');
      const cover = band('inset:0;');
      const snap = Math.max(90, beat * 0.16);
      const openMs = Math.max(260, beat * 0.62);
      // 1. The streak snaps to width. Very fast and very short — this is the beat
      //    that reads as "flash" rather than "fade".
      play(bar, [
        { transform: 'scaleX(0) scaleY(1)', opacity: 0 },
        { transform: 'scaleX(1) scaleY(1)', opacity: 1 }
      ], { duration: snap, easing: EASE.quart });
      // 2. It blows out vertically, and the cover is clipped open from the centre
      //    on the same timeline, so the page appears from inside the light.
      play(bar, [
        { transform: 'scaleX(1) scaleY(1)', opacity: 1 },
        { transform: 'scaleX(1) scaleY(90)', opacity: 0.9, offset: 0.55 },
        { transform: 'scaleX(1) scaleY(220)', opacity: 0 }
      ], { delay: delay + snap, duration: openMs, easing: EASE.expo });
      play(bloom, [
        { opacity: 0 },
        { opacity: 1, offset: 0.25 },
        { opacity: 0 }
      ], { delay: delay + snap, duration: openMs * 1.25, easing: EASE.quart });
      // The cover NEVER changes opacity: it is cut away. That is the whole point.
      finishWith(play(cover, [
        { clipPath: 'inset(0 0 0 0)' },
        { clipPath: 'inset(50% 0 50% 0)' }
      ], { delay: delay + snap * 0.8, duration: openMs, easing: EASE.expo }));
    } else {
      // curtain (default): one cover peels away from the chosen edge with a soft
      // secondary panel trailing behind for depth. This preset absorbed `wipe`,
      // which was the identical single-axis scale with the trailing panel
      // removed — a strictly poorer version of the same gesture.
      const trail = band('inset:0;', color2);
      const overlay = band('inset:0;');
      const origin = direction === 'down' ? 'bottom' : direction === 'left' ? 'left' : direction === 'right' ? 'right' : 'top';
      overlay.style.transformOrigin = origin;
      trail.style.transformOrigin = origin;
      const axis = (origin === 'left' || origin === 'right') ? 'scaleX' : 'scaleY';
      play(overlay, [{ transform: `${axis}(1)` }, { transform: `${axis}(0)` }], { easing });
      finishWith(play(trail, [{ transform: `${axis}(1)` }, { transform: `${axis}(0)` }],
        { delay: delay + beat * 0.1, duration: beat * 1.06, easing }));
    }

    // Safety: never leave a cover stuck on screen.
    later(done, delay + beat * 2 + 600);

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
        cleanups.forEach((undo) => { try { undo(); } catch (_e) { /* already gone */ } });
      }
    };
  },
  reduced(_el, opts) {
    opts.onComplete?.();
  }
};
