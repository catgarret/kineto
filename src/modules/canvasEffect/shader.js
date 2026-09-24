// Canvas Effect — fragment-shader effects.
//
// For `{ fragment: '…GLSL…' }` the host owns the WebGL side: it compiles the
// shader, draws one full-screen triangle and fills these uniforms every frame
// (declare only the ones you use):
//
//   uniform float uTime;         // seconds since start
//   uniform vec2  uResolution;   // canvas size in DEVICE pixels
//   uniform vec2  uPointer;      // 0…1 across the element, y pointing UP (GL)
//   uniform float uPointerDown;  // 1 while pressed
//   uniform float uScroll;       // 0…1, the element's scroll progress
//
// Every option becomes a uniform too, named `u` + the option in PascalCase:
// a number → float, a boolean → float 0/1, a colour string → vec3, an array of
// 2–4 numbers → vec2–vec4. So `options: { speed: 1, color: '#ff5b1c' }` is
// read in GLSL as `uniform float uSpeed; uniform vec3 uColor;`.
//
// Shadertoy-style code (`void mainImage(out vec4 fragColor, in vec2 fragCoord)`
// and no `main`) is wrapped automatically, with iTime, iResolution and iMouse.
// Mind the licence of any shader you copy: Shadertoy's default is
// CC BY-NC-SA 3.0, which does not allow commercial use.

const VERTEX_GL1 = 'attribute vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.0,1.0);}';
const VERTEX_GL2 = '#version 300 es\nin vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.0,1.0);}';
const SHADERTOY_HEADER = 'uniform float iTime;uniform vec3 iResolution;uniform vec4 iMouse;\n';
const SHADERTOY_MAIN = '\nvoid main(){mainImage(gl_FragColor,gl_FragCoord.xy);}';
const DEFAULT_PRECISION = '#ifdef GL_ES\nprecision highp float;\n#endif\n';

/** GLSL for the page's fragment source, with a precision and Shadertoy wrapper when needed. */
export function prepareFragment(source, webgl2) {
  if (webgl2) return source;
  const shadertoy = /\bmainImage\s*\(/.test(source) && !/\bvoid\s+main\s*\(/.test(source);
  const precision = /\bprecision\s+(lowp|mediump|highp)\s+float/.test(source) ? '' : DEFAULT_PRECISION;
  return shadertoy ? `${precision}${SHADERTOY_HEADER}${source}${SHADERTOY_MAIN}` : `${precision}${source}`;
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || 'unknown error';
    gl.deleteShader(shader);
    throw new Error(`[Kineto/canvasEffect] ${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'} shader failed to compile:\n${log}`);
  }
  return shader;
}

const pascal = (key) => `u${key[0].toUpperCase()}${key.slice(1)}`;

/**
 * Build the program and the triangle. Returns what the host needs to draw.
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl
 * @param {string} fragmentSource
 * @param {(value: string) => number[] | null} colorOf  parses a colour string, or null
 */
export function createShaderRuntime(gl, fragmentSource, colorOf) {
  const WebGL2 = globalThis.WebGL2RenderingContext;
  const webgl2 = typeof WebGL2 === 'function' && gl instanceof WebGL2;
  const vertex = compile(gl, gl.VERTEX_SHADER, webgl2 ? VERTEX_GL2 : VERTEX_GL1);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, prepareFragment(fragmentSource, webgl2));
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`[Kineto/canvasEffect] shader program failed to link:\n${gl.getProgramInfoLog(program) || 'unknown error'}`);
  }
  // One triangle that covers the whole clip space — cheaper than a quad.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  const locations = new Map();
  const location = (name) => {
    if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
    return locations.get(name);
  };

  // Write one value to a uniform, choosing the setter from the value's shape.
  const set = (name, value) => {
    const at = location(name);
    if (at == null || value == null) return;
    if (typeof value === 'number') gl.uniform1f(at, value);
    else if (typeof value === 'boolean') gl.uniform1f(at, value ? 1 : 0);
    else if (typeof value === 'string') {
      const rgb = colorOf(value);
      if (rgb) gl.uniform3f(at, rgb[0], rgb[1], rgb[2]);
    } else if (Array.isArray(value) || ArrayBuffer.isView(value)) {
      const list = Array.from(value, Number);
      if (list.length === 2) gl.uniform2f(at, list[0], list[1]);
      else if (list.length === 3) gl.uniform3f(at, list[0], list[1], list[2]);
      else if (list.length === 4) gl.uniform4f(at, list[0], list[1], list[2], list[3]);
    }
  };

  return {
    /** Draw one frame. `extra` are uniforms from the definition's uniforms(api). */
    draw(api, extra) {
      gl.viewport(0, 0, api.canvas.width, api.canvas.height);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      const { width, height } = api.canvas;
      const { nx, ny, x, y, down } = api.pointer;
      set('uTime', api.time);
      set('uResolution', [width, height]);
      set('uPointer', [nx, 1 - ny]);
      set('uPointerDown', down);
      set('uScroll', api.scroll.progress);
      set('iTime', api.time);
      set('iResolution', [width, height, 1]);
      set('iMouse', [x * api.dpr, height - y * api.dpr, down ? 1 : 0, 0]);
      Object.entries(api.options).forEach(([key, value]) => set(pascal(key), value));
      if (extra) Object.entries(extra).forEach(([key, value]) => set(key, value));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destroy() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    }
  };
}
