// Flow Gradient — a Canvas Effect recipe (WebGL fragment shader).
//
// Two colours flowing through each other over a dark ground, bent by layered
// noise ("domain warping"), pulled toward the pointer and drifting with the
// page's scroll. The whole effect is the shader below: Kineto's canvas host
// compiles it, draws it on a full-screen triangle, fills the built-in uniforms
// (uTime, uResolution, uPointer, uScroll) and turns every option into a uniform
// of its own (`color` → uColor, `speed` → uSpeed …).
//
// Use it:
//   <div data-kt-canvas-effect="flow-gradient" data-kt-color="#ff5b1c"></div>
//   Kineto.canvasEffect(element, { effect: 'flow-gradient', speed: 0.6 });
//
// Where WebGL is not available the host leaves the element's own CSS
// background in place, so give the element one.
(function registerFlowGradient(Kineto) {
  if (!Kineto || typeof Kineto.defineCanvasEffect !== 'function') return;

  Kineto.defineCanvasEffect('flow-gradient', {
    options: {
      color: '#ff5b1c',       // the leading colour
      color2: '#7a5cff',      // the colour it flows into
      background: '#0d0e12',  // the ground between them
      speed: 1,               // flow speed
      distortion: 1,          // how far the noise bends the flow (0 = soft bands)
      strength: 1             // how strongly the pointer pulls it
    },
    fragment: `
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uPointer;
      uniform float uScroll;
      uniform vec3 uColor;
      uniform vec3 uColor2;
      uniform vec3 uBackground;
      uniform float uSpeed;
      uniform float uDistortion;
      uniform float uStrength;

      // Value noise: a smooth random field, and five octaves of it (fbm).
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int octave = 0; octave < 5; octave++) {
          value += amplitude * noise(p);
          p *= 2.02;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        vec2 p = uv * vec2(uResolution.x / uResolution.y, 1.0) * 1.6;
        float t = uTime * 0.12 * uSpeed;

        // The pointer pulls the field toward it, fading with distance.
        vec2 toPointer = uv - uPointer;
        float pull = exp(-dot(toPointer, toPointer) * 8.0) * uStrength;

        // Domain warping: noise feeding the coordinates of more noise.
        vec2 q = vec2(fbm(p + t), fbm(p - t + 3.1));
        vec2 r = vec2(fbm(p + q * 2.0 * uDistortion + vec2(1.7, 9.2) + t * 1.3),
                      fbm(p + q * 2.0 * uDistortion + vec2(8.3, 2.8) - t));
        float field = fbm(p + r * uDistortion + pull * 1.5 + uScroll * 2.0);

        vec3 color = mix(uBackground, uColor, smoothstep(0.2, 0.8, field));
        color = mix(color, uColor2, smoothstep(0.35, 0.95, r.x) * 0.8);
        color += pull * 0.08 * uColor2;
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
})(typeof window !== 'undefined' ? window.Kineto : undefined);
