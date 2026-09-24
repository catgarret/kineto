// Shape Grid — a Canvas Effect recipe (Canvas 2D).
//
// A grid of small shapes that swell, turn and warm up around the pointer, then
// settle back once it leaves. It is only the drawing: Kineto's canvas host
// (src/modules/canvasEffect.js) owns the canvas, the pixel ratio, resizing, the
// frame loop, pausing off screen and teardown.
//
// Use it:
//   <div data-kt-canvas-effect="shape-grid" data-kt-shape="circle"></div>
//   Kineto.canvasEffect(element, { effect: 'shape-grid', color2: '#7a5cff' });
//
// Copy it: this file has no dependencies besides Kineto and can live anywhere
// in a project, loaded before or after Kineto starts.
(function registerShapeGrid(Kineto) {
  if (!Kineto || typeof Kineto.defineCanvasEffect !== 'function') return;

  const QUARTER_TURN = Math.PI / 4;

  // One path per shape, drawn around (0, 0) with a half-size `r`.
  const SHAPES = {
    square(ctx, r) { ctx.rect(-r, -r, r * 2, r * 2); },
    circle(ctx, r) { ctx.arc(0, 0, r, 0, Math.PI * 2); },
    diamond(ctx, r) { ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath(); },
    cross(ctx, r) {
      const t = r * 0.36;
      ctx.rect(-r, -t, r * 2, t * 2);
      ctx.rect(-t, -r, t * 2, r * 2);
    }
  };

  // rgb 0…1 arrays → a CSS colour string, mixed by `t`.
  const mix = (a, b, t) => `rgb(${Math.round((a[0] + (b[0] - a[0]) * t) * 255)},${Math.round((a[1] + (b[1] - a[1]) * t) * 255)},${Math.round((a[2] + (b[2] - a[2]) * t) * 255)})`;

  Kineto.defineCanvasEffect('shape-grid', {
    context: '2d',
    // Every option the effect reads, with its default. The names follow Kineto's
    // shared vocabulary (see docs/modules/canvas-effect.md) wherever one fits.
    options: {
      color: '#3a3f4b',          // shapes at rest
      color2: '#ff5b1c',         // shapes under the pointer
      background: 'transparent', // what the canvas is cleared to
      size: 28,                  // cell size, CSS px
      density: 0.34,             // shape size as a share of its cell, at rest
      strength: 1,               // pointer reach (1 ≈ four cells)
      speed: 1,                  // how quickly shapes follow the pointer
      shape: 'square'            // square | circle | diamond | cross
    },

    // Called once. What it returns becomes `api.state`.
    setup() {
      return { cells: [] };
    },

    // Called after every size change and every option change: rebuild the grid
    // so it always fills the element and follows `size`.
    resize(api) {
      const size = Math.max(8, api.options.size);
      const cols = Math.ceil(api.width / size);
      const rows = Math.ceil(api.height / size);
      const offsetX = (api.width - cols * size) / 2 + size / 2;
      const offsetY = (api.height - rows * size) / 2 + size / 2;
      const previous = api.state.cells;
      api.state.cells = [];
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const index = row * cols + col;
          api.state.cells.push({ x: offsetX + col * size, y: offsetY + row * size, heat: previous[index]?.heat ?? 0 });
        }
      }
    },

    // Called every frame. Returning false lets the host stop asking for frames
    // until the pointer, a scroll or a resize wakes it — an idle grid costs nothing.
    frame(api) {
      const { ctx, dpr, width, height, delta, pointer, options, state } = api;
      const draw = SHAPES[options.shape] || SHAPES.square;
      const rest = api.color(options.color) || [0.23, 0.25, 0.29];
      const hot = api.color(options.color2) || [1, 0.36, 0.11];
      const size = Math.max(8, options.size);
      const reach = size * 4 * Math.max(0, options.strength);
      // Frame-rate independent easing: the same feel at 30, 60 or 120 fps.
      const follow = 1 - Math.exp(-delta * 9 * Math.max(0.05, options.speed));
      const base = Math.min(0.9, Math.max(0.05, options.density));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (options.background !== 'transparent') {
        ctx.fillStyle = options.background;
        ctx.fillRect(0, 0, width, height);
      }

      let moving = false;
      for (const cell of state.cells) {
        const distance = Math.hypot(cell.x - pointer.x, cell.y - pointer.y);
        const target = pointer.inside && reach > 0 ? Math.max(0, 1 - distance / reach) ** 2 : 0;
        cell.heat += (target - cell.heat) * follow;
        if (Math.abs(target - cell.heat) > 0.002) moving = true;
        else cell.heat = target;

        const half = (size / 2) * (base + (0.92 - base) * cell.heat);
        ctx.save();
        ctx.translate(cell.x, cell.y);
        ctx.rotate(cell.heat * QUARTER_TURN);
        ctx.beginPath();
        draw(ctx, half);
        ctx.fillStyle = mix(rest, hot, cell.heat);
        ctx.fill();
        ctx.restore();
      }
      return moving;
    }
  });
})(typeof window !== 'undefined' ? window.Kineto : undefined);
