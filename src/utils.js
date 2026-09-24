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
 * 숫자 옵션 하나를 읽습니다. 유한한 숫자면 `min..max` 안으로 가두고, 숫자가 아니면
 * (없거나, 빈 문자열이거나, `"abc"` 같은 오타면) `fallback` 을 그대로 돌려줍니다.
 * 빈 문자열은 "0" 이 아니라 "아무도 주지 않은 값" 으로 봅니다 — `labeller` 와 같은 규칙입니다.
 *
 * 왜 공용 함수인가: 모듈마다 이 세 줄을 각자 다시 쓰고 있었고(overflowText·rasterizer·
 * states·presence), 복사본마다 "범위를 벗어난 값"을 조금씩 다르게 다뤘습니다. 옵션의
 * 의미는 어디서 읽든 같아야 하므로 한 곳에 둡니다.
 *
 * `fallback` 은 일부러 가두지 않습니다. 기본값이 자기 범위 밖에 있다면 그건 모듈의
 * 버그이고, 조용히 고쳐 주는 쪽이 더 찾기 어렵습니다.
 *
 * @param {unknown} value 작성자가 준 값(`opts.x` 또는 data 속성)
 * @param {number} fallback 숫자가 아닐 때 쓸 기본값
 * @param {number} [min] 최소값(생략하면 아래쪽 제한 없음)
 * @param {number} [max] 최대값(생략하면 위쪽 제한 없음)
 * @returns {number}
 */
export function numberOption(value, fallback = 0, min = -Infinity, max = Infinity) {
  // `Number('')` is 0, so a `data-kt-speed=""` written by a template that had
  // nothing to put there used to mean "speed zero" — an animation that never
  // moved, from an attribute that looks empty. An empty string is a value
  // nobody supplied, which is the same rule `labeller` uses for its strings.
  if (typeof value === 'string' && value.trim() === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
}

// A timing option of 20 or less is read as SECONDS, anything larger as
// milliseconds (see timeMs). Nobody holds a phrase for 20 ms, and nobody
// waits 20 s between two words, so the two ranges never collide.
const SECONDS_UP_TO = 20;

/**
 * A time given in seconds or milliseconds, returned in milliseconds.
 *
 * Kineto's timing options have always been written both ways — `duration:
 * 0.6` in JS, `data-kt-hold="1600"` in markup — and a reader that assumed one
 * unit silently broke the other: a recipe's `hold: 1.4` became 1.4 ms. Read
 * every timing option through this so both spellings mean what they look like.
 * Empty, negative or non-numeric values fall back (same rule as numberOption).
 *
 * @param {unknown} value
 * @param {number} fallbackMs  used when no usable value was given
 * @returns {number} milliseconds
 */
export function timeMs(value, fallbackMs) {
  if (value == null || (typeof value === 'string' && value.trim() === '')) return fallbackMs;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return fallbackMs;
  return number <= SECONDS_UP_TO ? number * 1000 : number;
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

/**
 * A TEXT option's value. An attribute written without a value (`data-kt-x` or
 * `data-kt-x=""`) reads as `true` — right for a switch, wrong for text: a
 * counter with `data-kt-prefix=""` used to print "true" before every number.
 * For text, present-but-empty means empty; absent means the fallback.
 */
export function textOption(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  if (value === true || value === false) return '';
  return String(value);
}

export function dash(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * querySelectorAll for a selector that came from an OPTION (markup or data):
 * an invalid selector is that option's mistake, so it matches nothing instead
 * of throwing out of the module that asked.
 */
export function selectAll(selector, root = typeof document !== 'undefined' ? document : null) {
  if (!selector || !root?.querySelectorAll) return [];
  try { return Array.from(root.querySelectorAll(String(selector))); }
  catch (_error) { return []; }
}

/** An attribute-selector-safe form of `value` (quotes and backslashes escaped). */
export function cssString(value) {
  const text = String(value ?? '');
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(text);
  return text.replace(/["\\]/g, '\\$&');
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
  const rendered = new WeakMap();

  return {
    update(value, state = 'running') {
      const progress = clamp(Number(value) || 0, 0, 100);
      const rounded = Math.round(progress);
      const roundedText = String(rounded);
      const stateText = String(state);
      const progressText = (progress / 100).toFixed(4);
      targets.forEach((target) => {
        const template = String(target.dataset.ktProgressTemplate || opts.progressTemplate || '{value}%');
        const previous = rendered.get(target);
        const discreteChanged = !previous
          || previous.rounded !== rounded
          || previous.state !== stateText
          || previous.template !== template;
        const progressChanged = !previous || previous.progress !== progressText;

        // The visible/template output and rounded metadata only change at an
        // integer boundary, state change, or live template change. Loader
        // smoothing may call this dozens of times inside the same percentage;
        // avoid repeating equivalent DOM string writes on every tick.
        if (discreteChanged) {
          const output = template
            .split('{value}').join(roundedText)
            .split('{progress}').join(roundedText)
            .split('{state}').join(stateText);
          if ('value' in target && /^(?:INPUT|OUTPUT|PROGRESS)$/.test(target.tagName)) {
            if (target.tagName !== 'PROGRESS') target.value = output;
          } else {
            target.textContent = output;
          }
          target.dataset.ktProgressValue = roundedText;
          target.dataset.ktProgressState = stateText;
          target.style.setProperty('--kt-percent', roundedText);
        }

        // <progress>.value is a public numeric surface and keeps the full input
        // precision. The CSS custom property is serialized to four decimals by
        // contract, so identical serialized values are safe to deduplicate.
        // A <progress> reads its value on ITS OWN scale — 0 to `max`, and `max`
        // defaults to 1 — so write the fraction of max, not Kineto's 0–100: a
        // bare <progress> used to be pinned full from the first percent.
        if (target.tagName === 'PROGRESS') target.value = (progress / 100) * (target.max || 1);
        if (progressChanged) target.style.setProperty('--kt-progress', progressText);

        rendered.set(target, {
          rounded,
          state: stateText,
          template,
          progress: progressText
        });
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

/**
 * IntersectionObserver 가 한 번에 넘겨준 기록 중 **가장 최근 것**을 고릅니다.
 *
 * 콜백 한 번에 같은 요소의 기록이 여러 개 올 수 있습니다. 대표적으로 관찰을 시작한
 * 직후 다른 모듈(Ambient Media 의 래퍼 등)이나 프레임워크가 요소를 DOM 안에서 옮기면
 * `[안 보임, 보임]` 두 개가 한 묶음으로 옵니다. 기록은 시간 순이라 **마지막 것이 지금
 * 상태**인데, 첫 번째만 읽으면 이미 화면에 들어온 요소를 "안 보인다"고 판단하고 그대로
 * 끝나 버립니다(Lazy 이미지가 영영 안 뜨던 원인). 한 요소만 관찰하는 콜백은
 * `([entry]) =>` 대신 항상 이 함수를 쓰세요.
 *
 * @param {IntersectionObserverEntry[]} entries 콜백이 받은 기록 배열
 * @param {Element} [target] 이 요소의 기록만 봅니다. 생략하면 묶음 전체의 마지막 기록.
 * @returns {IntersectionObserverEntry|undefined}
 */
export function latestEntry(entries, target) {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    if (!target || entries[index].target === target) return entries[index];
  }
  return undefined;
}

export function observeOnce(el, callback, options = {}) {
  if (typeof IntersectionObserver === 'undefined') {
    callback();
    return { disconnect() {}, unobserve() {} };
  }

  const observer = new IntersectionObserver((entries) => {
    const entry = latestEntry(entries, el);
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
      if (value != null) {
        el.setAttribute(name, value);
        return;
      }
      el.removeAttribute(name);
      // Removing `style` ONCE is not enough once the CSSOM has written to it.
      // Measured in all three engines: after `el.style.setProperty(...)`, a
      // `removeAttribute('style')` leaves `style=""` behind in Chromium and
      // WebKit — the declaration block is emptied and serialised straight back
      // — while Firefox drops the attribute outright. A second call removes the
      // husk. It lives here rather than in each caller so that every module
      // that snapshots an attribute hands the element back the way it found it;
      // `dropEmptyAttributes` does the same thing for the husks a
      // `classList.remove()` leaves.
      if (el.getAttribute(name) === '') el.removeAttribute(name);
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
/**
 * 글자를 쪼갠 텍스트가 **단어 중간에서 줄바꿈되지 않게** 합니다.
 *
 * 글자 애니메이션은 글자마다 `inline-block` span 을 만들어야 각자 움직일 수 있습니다. 그런데
 * 브라우저는 **inline-block 두 개 사이 어디서든** 줄을 바꿀 수 있어서, "YOUR PLATFORM" 이
 * "YOU / R PLATFORM" 으로 갈라집니다(데모의 Text Reveal Flicker 카드에서 실제로 보였습니다).
 * 연속된 글자를 `white-space: nowrap` 인 단어 상자 하나로 묶으면 단어 사이의 공백만 줄바꿈
 * 자리로 남아, 쪼개기 전의 텍스트와 똑같이 줄이 바뀝니다.
 *
 * 단어 상자는 inline(기본 span) 입니다. inline-block 으로 만들면 상자가 변형을 가진
 * 요소처럼 취급될 수 있어, 3D 로 도는 글자(textSplit 의 preserve-3d)가 평평해질 수 있습니다.
 *
 * @returns {HTMLSpanElement}
 */
export function wordBox() {
  const box = document.createElement('span');
  box.className = 'kt-text-word';
  box.style.whiteSpace = 'nowrap';
  return box;
}

/**
 * 쪼갠 글자를 부모에 붙이는 창구입니다. `add(node)` 는 지금 단어에 글자를 넣고(없으면 단어
 * 상자를 새로 엽니다), `gap(node)` 는 단어를 닫고 공백·줄바꿈·간격 요소를 부모에 직접 붙입니다.
 * 모든 글자 분할 모듈이 이 하나를 쓰므로, "단어는 한 줄에" 라는 규칙이 모듈마다 따로 놀지
 * 않습니다.
 *
 * @param {Element} parent
 * @returns {{ add: (node: Node) => Node, gap: (node: Node) => Node }}
 */
export function wordSink(parent) {
  let word = null;
  return {
    add(node) {
      if (!word) {
        word = wordBox();
        parent.appendChild(word);
      }
      word.appendChild(node);
      return node;
    },
    gap(node) {
      word = null;
      parent.appendChild(node);
      return node;
    }
  };
}

// ---------------------------------------------------------------------------
// Batched layout reads.
//
// Reading a size (clientWidth, getBoundingClientRect, getComputedStyle…) right
// after changing the DOM forces the browser to lay the page out on the spot.
// A module that writes then reads inside create() therefore costs one full
// layout PER INSTANCE when a page creates hundreds of them in one scan — the
// demo's 236 Overflow Text titles alone spent about half a second doing it.
//
// measureThenApply(read, apply) queues the pair instead. On the next frame ALL
// queued reads run first (one layout serves every one of them), then all the
// applies, in the order they were queued. An apply that queues more work goes
// to the frame after, so a read never sees another instance's half-written DOM.
// Without requestAnimationFrame (SSR, some test shims) it runs immediately.
// ---------------------------------------------------------------------------
const layoutQueue = [];
let layoutFrame = null;

function flushLayoutQueue() {
  layoutFrame = null;
  const jobs = layoutQueue.splice(0);
  const results = jobs.map(({ read }) => {
    try {
      return { ok: true, value: read() };
    } catch (error) {
      return { ok: false, error };
    }
  });
  jobs.forEach(({ apply }, index) => {
    const result = results[index];
    try {
      if (!result.ok) throw result.error;
      apply(result.value);
    } catch (error) {
      console.error('[Kineto] a batched layout step failed:', error);
    }
  });
}

/**
 * Queue a layout read and the DOM write that depends on it (see above).
 * @template T
 * @param {() => T} read   Only reads layout/style. Must not write to the DOM.
 * @param {(value: T) => void} apply   Writes, using what `read` returned.
 * @returns {() => void} cancel — drops the job if it has not run yet (call it
 *   from destroy()); the shared frame is cancelled once nothing is left in it.
 */
export function measureThenApply(read, apply) {
  const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null;
  if (!raf) {
    apply(read());
    return () => {};
  }
  const job = { read, apply };
  layoutQueue.push(job);
  if (layoutFrame == null) layoutFrame = raf(flushLayoutQueue);
  return () => {
    const index = layoutQueue.indexOf(job);
    if (index < 0) return;
    layoutQueue.splice(index, 1);
    if (!layoutQueue.length && layoutFrame != null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(layoutFrame);
      layoutFrame = null;
    }
  };
}

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
