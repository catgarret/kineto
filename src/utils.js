import { getGSAP, getScrollTrigger } from './runtime.js';
import { toCSS as easingToCSS, gsapEase as easingGsap } from './easings.js';

// Resolve any easing token (CSS keyword, easings.net name, 'elastic-out',
// 'bounce-in-out', 'spring', {spring:{…}}, or a raw cubic-bezier/linear string)
// to a valid CSS <easing-function>. Passes unknown values through unchanged, so
// it is safe to wrap module `opts.ease` that historically held raw CSS strings.
export const cssEase = easingToCSS;

// Same idea for GSAP-driven tweens: map a token ('elastic-out', 'sine-in', …)
// to the matching GSAP ease name; unknown/GSAP-native values pass through.
export const gsapEaseName = easingGsap;

// Global motion defaults, set via Kineto.config({ spring: true }). Modules read
// these as the fallback when a per-instance option isn't given, so a single
// switch can give the whole page springy, physical transforms.
export const motionDefaults = { spring: false };
export function setMotionDefaults(patch = {}) { Object.assign(motionDefaults, patch); }

export function env() {
  if (typeof window === 'undefined') {
    return {
      ssr: true,
      reducedMotion: false,
      perf: 'high',
      touch: false,
      hasGyro: false,
      canVibrate: false,
      saveData: false
    };
  }

  // `window` without `navigator` happens in DOM shims and Node < 21 test
  // runtimes (Node 21+ defines a global navigator); treat it as a plain
  // capable browser instead of throwing on the first env() read.
  const nav = typeof navigator !== 'undefined' && navigator ? navigator : {};
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  const reducedMotion = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  const saveData = Boolean(connection?.saveData);
  const slowNetwork = /(^|-)2g|slow-2g/.test(connection?.effectiveType || '');
  const lowMemory = (nav.deviceMemory || 8) < 4;
  const lowCpu = (nav.hardwareConcurrency || 8) < 4;
  const perf = saveData || slowNetwork ? 'low' : (lowMemory || lowCpu ? 'mid' : 'high');

  return {
    ssr: false,
    reducedMotion,
    perf,
    saveData,
    touch: 'ontouchstart' in window || (nav.maxTouchPoints || 0) > 0,
    hasGyro: typeof DeviceOrientationEvent !== 'undefined',
    canVibrate: typeof nav.vibrate === 'function'
  };
}

// iOS 13+ gates DeviceOrientation behind an explicit permission that must be
// requested from a real user gesture — and current WebKit only honours the
// request from a `click`/`touchend`, not always a `pointerdown`. This resolves
// once (shared across every gyro module) on the first tap anywhere on the page,
// so a single interaction unlocks tilt + compass together instead of each
// element needing its own exact tap.
let gyroPermissionPromise = null;
export function ensureGyroPermission() {
  if (typeof DeviceOrientationEvent === 'undefined') return Promise.resolve(false);
  // Android / desktop have no permission gate — motion events flow immediately.
  if (typeof DeviceOrientationEvent.requestPermission !== 'function') return Promise.resolve(true);
  if (gyroPermissionPromise) return gyroPermissionPromise;
  gyroPermissionPromise = new Promise((resolve) => {
    let settled = false;
    const cleanup = () => {
      document.removeEventListener('click', onGesture, true);
      document.removeEventListener('touchend', onGesture, true);
    };
    const finish = (value) => { if (settled) return; settled = true; cleanup(); resolve(value); };
    const onGesture = async () => {
      try {
        const result = await DeviceOrientationEvent.requestPermission();
        if (result === 'granted') finish(true);
        else if (result === 'denied') finish(false);
        // any other result: keep listening for a valid tap
      } catch (_error) {
        // requestPermission() throws when it isn't called from a genuine user
        // activation — e.g. a tap that became a scroll. Keep the listeners so the
        // NEXT real tap can raise the prompt instead of giving up after one try.
      }
    };
    // `click` only fires on real taps (never on scroll), so it is the reliable
    // activation for iOS's motion-permission prompt; `touchend` is a fast path.
    // Capture phase so a child's stopPropagation can't swallow the gesture.
    document.addEventListener('click', onGesture, true);
    document.addEventListener('touchend', onGesture, true);
  });
  return gyroPermissionPromise;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * 모듈이 **스스로 만든** 컨트롤의 접근성 이름을 페이지가 정할 수 있게 합니다.
 *
 * 라이브러리는 읽는 사람의 언어를 알 수 없습니다. 그런데 슬라이더 점, 토스트 닫기 버튼처럼
 * 모듈이 직접 만드는 컨트롤에는 이름이 **있어야** 하므로, 기본값은 영어로 두되 문구는
 * 언제든 페이지가 덮어쓸 수 있어야 합니다. 문자열 하나마다 공개 옵션을 만들면 옵션이
 * 금방 열 개씩 늘어나므로, 모듈마다 `labels` 지도 하나만 공개합니다.
 *
 * 마크업에서도 그대로 됩니다 — `readOpts` 가 JSON 속성 값을 객체로 바꿔 줍니다:
 *   data-kt-labels='{"dot":"슬라이드 {n}으로 이동"}'
 *
 * `{이름}` 자리표시자는 호출할 때 넘긴 값으로 바뀝니다(progress 의 `{value}` 와 같은 규칙).
 * 값이 없는 자리표시자는 건드리지 않아서, 오타가 조용히 빈칸이 되지 않습니다.
 *
 * @param {Record<string,string>} defaults 모듈이 정의한 영어 기본 문구
 * @param {unknown} provided `opts.labels` (객체가 아니면 무시합니다)
 * @returns {(key: string, values?: Record<string, unknown>) => string}
 */
export function labeller(defaults, provided) {
  const supplied = provided && typeof provided === 'object' && !Array.isArray(provided) ? provided : {};
  return (key, values) => {
    const custom = supplied[key];
    const template = typeof custom === 'string' && custom !== '' ? custom : defaults[key];
    if (template == null) return '';
    if (!values) return String(template);
    return String(template).replace(/\{(\w+)\}/g, (match, name) => (
      Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match
    ));
  };
}

export function coerce(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (trimmed !== '' && Number.isFinite(Number(trimmed))) return Number(trimmed);

  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed);
    } catch (_error) {
      return value;
    }
  }
  return value;
}

export function dash(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export function q(target, root = typeof document !== 'undefined' ? document : null) {
  if (!target || !root) return [];
  if (typeof target === 'string') return Array.from(root.querySelectorAll(target));
  if ((typeof window !== 'undefined' && target === window) ||
      (typeof document !== 'undefined' && target === document)) return [target];
  if (typeof Element !== 'undefined' && target instanceof Element) return [target];
  if ((typeof NodeList !== 'undefined' && target instanceof NodeList) ||
      (typeof HTMLCollection !== 'undefined' && target instanceof HTMLCollection) ||
      Array.isArray(target)) {
    return Array.from(target).filter(Boolean);
  }
  if ((typeof target === 'object' || typeof target === 'function') &&
      typeof Symbol !== 'undefined' && typeof target[Symbol.iterator] === 'function') {
    return Array.from(target).filter(Boolean);
  }
  return [];
}

const progressOutputOwners = new WeakMap();

// Keep visible progress copy in sync with Loader/LoadingIndicator without
// coupling either module to a specific UI. Targets may be descendants of the
// host, descendants of a nearest `[data-kt-progress-scope]`, or explicit
// `progressOutput` elements/selectors. Templates use {value}/{progress}/{state}.
export function createProgressOutputs(el, opts = {}) {
  const doc = el?.ownerDocument;
  if (!el || !doc) return { update() {}, destroy() {} };
  let scope = null;
  if (typeof opts.progressScope === 'string') {
    try {
      scope = el.closest(opts.progressScope) || doc.querySelector(opts.progressScope);
    } catch (_error) { /* invalid optional selector: use the nearest default scope */ }
  } else if (opts.progressScope?.querySelectorAll) {
    scope = opts.progressScope;
  }
  scope ||= el.closest('[data-kt-progress-scope]') || el;

  const targets = new Set(scope.querySelectorAll?.('[data-kt-progress-output]') || []);
  const requested = opts.progressOutput;
  if (typeof requested === 'string') {
    let local = [];
    try { local = [...(scope.querySelectorAll?.(requested) || [])]; } catch (_error) { /* invalid selector */ }
    local.forEach((target) => targets.add(target));
    if (!local.length) {
      try { doc.querySelectorAll(requested).forEach((target) => targets.add(target)); } catch (_error) { /* invalid selector */ }
    }
  } else if (requested?.nodeType === 1) {
    targets.add(requested);
  } else if (requested && typeof requested[Symbol.iterator] === 'function') {
    for (const target of requested) if (target?.nodeType === 1) targets.add(target);
  }

  const ownedTargets = [...targets].map((target) => {
    let record = progressOutputOwners.get(target);
    if (!record) {
      record = {
        owners: 0,
        text: target.textContent,
        value: 'value' in target ? target.value : undefined,
        dataValue: target.getAttribute('data-kt-progress-value'),
        state: target.getAttribute('data-kt-progress-state'),
        progressVar: target.style.getPropertyValue('--kt-progress'),
        percentVar: target.style.getPropertyValue('--kt-percent')
      };
      progressOutputOwners.set(target, record);
    }
    record.owners += 1;
    return target;
  });
  let released = false;

  return {
    update(value, state = 'running') {
      const progress = clamp(Number(value) || 0, 0, 100);
      const rounded = Math.round(progress);
      targets.forEach((target) => {
        const template = target.dataset.ktProgressTemplate || opts.progressTemplate || '{value}%';
        const output = String(template)
          .split('{value}').join(String(rounded))
          .split('{progress}').join(String(rounded))
          .split('{state}').join(String(state));
        if ('value' in target && /^(?:INPUT|OUTPUT|PROGRESS)$/.test(target.tagName)) {
          target.value = target.tagName === 'PROGRESS' ? progress : output;
        } else {
          target.textContent = output;
        }
        target.dataset.ktProgressValue = String(rounded);
        target.dataset.ktProgressState = String(state);
        target.style.setProperty('--kt-progress', (progress / 100).toFixed(4));
        target.style.setProperty('--kt-percent', String(rounded));
      });
    },
    destroy() {
      if (released) return;
      released = true;
      ownedTargets.forEach((target) => {
        const record = progressOutputOwners.get(target);
        if (!record || --record.owners > 0) return;
        if (record.value !== undefined) target.value = record.value;
        else target.textContent = record.text;
        if (record.dataValue == null) target.removeAttribute('data-kt-progress-value');
        else target.setAttribute('data-kt-progress-value', record.dataValue);
        if (record.state == null) target.removeAttribute('data-kt-progress-state');
        else target.setAttribute('data-kt-progress-state', record.state);
        if (record.progressVar) target.style.setProperty('--kt-progress', record.progressVar);
        else target.style.removeProperty('--kt-progress');
        if (record.percentVar) target.style.setProperty('--kt-percent', record.percentVar);
        else target.style.removeProperty('--kt-percent');
        progressOutputOwners.delete(target);
      });
    }
  };
}

export function readOpts(el, name) {
  const options = {};
  const activationKey = `kt${name[0].toUpperCase()}${name.slice(1)}`;
  // Most activation values are presets. Radial's frozen public contract predates
  // that convention and names the same concept `position`, so preserve the
  // established API without making `preset` a second public option.
  const activationOption = name === 'radial' ? 'position' : 'preset';

  for (const [key, rawValue] of Object.entries(el.dataset || {})) {
    if (!key.startsWith('kt')) continue;

    if (key === activationKey) {
      const parsed = coerce(rawValue);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        Object.assign(options, parsed);
      } else if (parsed !== true && parsed !== '') {
        options[activationOption] = parsed;
      }
      continue;
    }

    const rest = key.slice(2);
    if (!rest) continue;
    options[rest[0].toLowerCase() + rest.slice(1)] = coerce(rawValue);
  }

  return options;
}

export function G() {
  return getGSAP();
}

export function ST() {
  return getScrollTrigger();
}

export function observeOnce(el, callback, options = {}) {
  if (typeof IntersectionObserver === 'undefined') {
    callback();
    return { disconnect() {}, unobserve() {} };
  }

  const observer = new IntersectionObserver((entries) => {
    const entry = entries.find((item) => item.target === el) || entries[0];
    if (!entry?.isIntersecting) return;
    observer.disconnect();
    callback(entry);
  }, options);
  observer.observe(el);
  return observer;
}


/**
 * `class=""` · `style=""` 처럼 **값이 빈 속성**을 지웁니다.
 *
 * `classList.remove(...)` 나 `style.removeProperty(...)` 로 마지막 값을 없애도 속성 자체는
 * 남습니다. 동작은 같지만 요소가 "만나기 전과 같은 모습"이 아니게 되고, 복원이 끝났는지
 * 눈으로도 검사로도 확인하기 어려워집니다(`tests/leak.mjs` 가 이것을 봅니다).
 * **비어 있을 때만** 지우므로, 같은 요소에 살아 있는 다른 모듈이나 페이지가 넣은 값은
 * 건드리지 않습니다. 모듈이 손댄 **자손**은 모듈이 직접 이 함수를 부르면 됩니다.
 */
export function dropEmptyAttributes(el, names = ['class', 'style']) {
  if (!el || typeof el.getAttribute !== 'function') return;
  for (const name of names) {
    if (el.getAttribute(name) === '') el.removeAttribute(name);
  }
}

export function snapshotAttributes(el, names) {
  const values = new Map(names.map((name) => [name, el.getAttribute(name)]));
  return () => {
    values.forEach((value, name) => {
      if (value == null) el.removeAttribute(name);
      else el.setAttribute(name, value);
    });
  };
}

// CSS property names for `style.setProperty()`: camelCase (`willChange`,
// `webkitUserDrag`) and kebab-case (`will-change`) both resolve to the
// hyphenated form, including the leading dash of vendor prefixes.
function cssPropertyName(property) {
  if (property.includes('-')) return property;
  return dash(property).replace(/^(webkit|moz|ms|o)-/, '-$1-');
}

function camelPropertyName(property) {
  if (!property.includes('-')) return property;
  return property.replace(/^-/, '').replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
}

// Snapshot the listed inline style properties and return a restore function.
// Restore puts back the exact prior value with its priority (`!important`),
// removes properties the element did not set, and drops an empty `style`
// attribute when the element had none before — so a module's destroy()
// leaves the owned DOM state exactly as it found it.
//
// Browsers expose every declaration through the CSSOM name, which is the only
// path that carries the priority. DOM adapters such as jsdom keep unsupported
// vendor properties (`webkitUserDrag`) solely as camelCase members, so the
// member value is recorded as well and re-applied when the CSSOM name did not
// hold the declaration.
export function snapshotInlineStyles(el, properties) {
  const hadStyleAttribute = el.hasAttribute('style');
  const entries = properties.map((property) => {
    const name = cssPropertyName(property);
    const member = camelPropertyName(property);
    return { name, member, value: el.style.getPropertyValue(name), priority: el.style.getPropertyPriority(name), memberValue: el.style[member] };
  });
  return () => {
    entries.forEach(({ name, member, value, priority, memberValue }) => {
      if (value) {
        el.style.setProperty(name, value, priority);
        return;
      }
      el.style.removeProperty(name);
      if (el.style[member] === memberValue) return;
      if (memberValue === undefined) delete el.style[member];
      else el.style[member] = memberValue;
    });
    if (!hadStyleAttribute && !el.style.length) el.removeAttribute('style');
  };
}

export function noopInstance(el, type, destroy = () => {}) {
  return {
    el,
    type,
    pause() {},
    resume() {},
    destroy
  };
}

const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

export function decomposeHangul(char) {
  const code = char.codePointAt(0);
  if (code < 0xac00 || code > 0xd7a3) return null;
  const index = code - 0xac00;
  const cho = Math.floor(index / 588);
  const jung = Math.floor((index % 588) / 28);
  const jong = index % 28;
  return { cho, jung, jong, pieces: [CHO[cho], JUNG[jung], ...(jong ? [JONG[jong]] : [])] };
}

export function hangulFrames(char) {
  const parts = decomposeHangul(char);
  if (!parts) return [char];
  const frames = [CHO[parts.cho]];
  const openSyllable = String.fromCharCode(0xac00 + (parts.cho * 588) + (parts.jung * 28));
  frames.push(openSyllable);
  if (parts.jong) frames.push(char);
  return frames;
}

export function segmentText(text, decomposeKorean = false) {
  let segments;
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      segments = Array.from(segmenter.segment(text), ({ segment }) => segment);
    } catch (_error) {
      segments = Array.from(text);
    }
  } else {
    segments = Array.from(text);
  }

  if (!decomposeKorean) return segments;
  return segments.map((char) => {
    const decomposed = decomposeHangul(char);
    return {
      char,
      pieces: decomposed?.pieces || [char],
      frames: hangulFrames(char)
    };
  });
}

// `Node.textContent` intentionally omits the visual newline contributed by
// <br>. Text motion modules rebuild their source into generated spans, so read
// authored breaks explicitly before that DOM is replaced. Programmatic text is
// normalised too, keeping Windows and legacy carriage returns on the same path.
export function normalizeTextLineBreaks(text) {
  return String(text ?? '').replace(/\r\n?/g, '\n').replace(/[\u2028\u2029]/g, '\n');
}

export function textWithLineBreaks(el) {
  if (!el?.childNodes) return normalizeTextLineBreaks(el?.textContent || '');
  let text = '';
  const visit = (node) => {
    if (node.nodeType === 3) {
      text += node.nodeValue || '';
      return;
    }
    if (node.nodeType !== 1) return;
    if (node.tagName === 'BR') {
      text += '\n';
      return;
    }
    node.childNodes.forEach(visit);
  };
  el.childNodes.forEach(visit);
  return normalizeTextLineBreaks(text);
}

// Preserve inline markup in static/reduced-motion text while giving authored
// text-node newlines the same visible meaning as an explicit <br>.
export function renderTextLineBreaks(el) {
  Array.from(el.childNodes).forEach((node) => {
    if (node.nodeType === 3) {
      const text = normalizeTextLineBreaks(node.nodeValue);
      if (!text.includes('\n')) return;
      const fragment = document.createDocumentFragment();
      text.split(/(\n)/).forEach((part) => {
        if (part) fragment.appendChild(part === '\n' ? document.createElement('br') : document.createTextNode(part));
      });
      node.replaceWith(fragment);
    } else if (node.nodeType === 1 && !['SCRIPT', 'STYLE'].includes(node.tagName)) {
      renderTextLineBreaks(node);
    }
  });
}

// Reinsert author-owned nodes instead of parsing an HTML string on teardown.
// Besides preserving listeners, this retains CRLF text nodes exactly.
export function snapshotChildNodes(el) {
  const entries = [];
  const visit = (node) => {
    const children = Array.from(node.childNodes);
    entries.push([node, children]);
    children.forEach((child) => { if (child.nodeType === 1) visit(child); });
  };
  visit(el);
  return () => entries.forEach(([node, children]) => node.replaceChildren(...children));
}

export function formatNumber(value, { decimals = 0, format = '', locale } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  if (format === ',' || locale) {
    return new Intl.NumberFormat(locale || 'en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  }
  return number.toFixed(decimals);
}

export function parseColor(input) {
  const value = String(input).trim();
  const hex = value.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a };
  }
  const fn = value.match(/rgba?\(([^)]+)\)/i);
  if (fn) {
    const parts = fn[1].split(',').map((part) => Number.parseFloat(part));
    return { r: parts[0] || 0, g: parts[1] || 0, b: parts[2] || 0, a: parts[3] == null ? 1 : parts[3] };
  }
  return null;
}

// Shared scramble coloring for shuffle / textReveal decode / flicker:
//  - rainbow: random full-hue colors (default look)
//  - rainbowColors: hex/rgba stops — colors are sampled algorithmically from
//    the gradient between them instead of the full rainbow
//  - scrambleFade: brightness-only flicker (random opacity), usable instead
//    of (or together with) color
export function scramblePainter(opts) {
  const fade = opts.scrambleFade === true;
  // Fade takes precedence: when on, scrambling uses brightness/opacity only,
  // never color — even if rainbow is also checked.
  const rainbow = opts.rainbow === true && !fade;
  if (!rainbow && !fade) return null;
  let palette = opts.rainbowColors;
  if (typeof palette === 'string') palette = palette.split(',').map((item) => item.trim()).filter(Boolean);
  const stops = Array.isArray(palette) && palette.length ? palette.map(parseColor).filter(Boolean) : null;
  const sample = () => {
    if (stops && stops.length) {
      if (stops.length === 1) {
        const c = stops[0];
        return `rgba(${c.r},${c.g},${c.b},${c.a})`;
      }
      const t = Math.random() * (stops.length - 1);
      const i = Math.min(stops.length - 2, Math.floor(t));
      const f = t - i;
      const a = stops[i];
      const b = stops[i + 1];
      const mix = (x, y) => Math.round(x + (y - x) * f);
      return `rgba(${mix(a.r, b.r)},${mix(a.g, b.g)},${mix(a.b, b.b)},${(a.a + (b.a - a.a) * f).toFixed(3)})`;
    }
    return `hsl(${Math.floor(Math.random() * 360)},92%,62%)`;
  };
  return {
    paint(node) {
      if (rainbow) node.style.color = sample();
      if (fade) node.style.opacity = (0.25 + Math.random() * 0.75).toFixed(2);
    },
    clear(node) {
      if (rainbow) node.style.color = '';
      if (fade) node.style.opacity = '';
    }
  };
}
