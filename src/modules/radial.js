import sliderModule from './slider.js';

// Backward-compatible public module. The implementation is shared with
// Slider's radial effect so the two entry points cannot drift or duplicate the
// carousel engine in the bundle.
function createRadial(el, opts = {}) {
  const requested = opts.position;
  const position = ['bottom', 'top', 'left', 'right'].includes(requested)
    ? requested
    : 'bottom';
  // Keep the legacy public option surface explicit. Besides making the
  // compatibility contract auditable, this prevents unrelated slider-only
  // options from leaking through the adapter.
  const radialOptions = {
    preset: 'radial',
    position,
    align: opts.align,
    radius: opts.radius,
    step: opts.step,
    activeAngle: opts.activeAngle,
    duration: opts.duration,
    smoothing: opts.smoothing,
    loop: opts.loop,
    drag: opts.drag,
    controls: opts.controls,
    autoplay: opts.autoplay,
    activeClass: opts.activeClass
  };
  const instance = sliderModule.create(el, {
    ...radialOptions,
    effect: 'radial',
  });
  if (instance) instance.type = 'radial';
  return instance;
}

export default {
  create: createRadial,
  reduced: createRadial
};
