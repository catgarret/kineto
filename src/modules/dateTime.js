import { snapshotAttributes } from '../utils.js';

// Accept ISO/RFC timestamps first, then common server-rendered numeric forms
// (2026.08.09, 2026/08/09, 2026년 8월 9일 12:30). Ambiguous day/month input
// follows an explicit locale rule instead of depending on the browser parser.
// Korean server-rendered dates are conventionally KST; include the explicit
// offset so relative output does not depend on the host (or CI runner) TZ.
function parseDate(value, locale = '') {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value < 1e12 ? value * 1000 : value);
  const text = String(value ?? '').trim();
  if (!text) return null;
  if (/^\d{10,13}$/.test(text)) return parseDate(Number(text), locale);
  // Preserve standard ISO/RFC values before the legacy separator normalizer
  // below. Replacing every `.` in an ISO timestamp would turn fractional
  // seconds such as `.453Z` into an invalid `-453Z` suffix.
  const standard = new Date(text);
  if (!Number.isNaN(standard.getTime()) && (
    /^\d{4}-\d{2}-\d{2}(?:$|[T\s])/.test(text)
    || /^[A-Za-z]{3},\s/.test(text)
  )) return standard;
  const compact = text.match(/^(\d{4})(\d{2})(\d{2})(?:(\d{2})(\d{2})(\d{2})(?:\.(\d{1,3}))?)?$/);
  if (compact) {
    const [, year, month, day, hour = '0', minute = '0', second = '0', milli = '0'] = compact;
    return new Date(`${year}-${month}-${day}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}.${milli.padEnd(3, '0')}+09:00`);
  }
  const koreanClock = text.match(/^(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일(?:\s*(\d{1,2})\s*시)?(?:\s*(\d{1,2})\s*분)?(?:\s*(\d{1,2})\s*초)?$/);
  if (koreanClock) {
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = koreanClock;
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}+09:00`);
  }
  const korean = text.match(/^(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일(?:\s+(\d{1,2})(?::(\d{2})(?::(\d{2}))?)?)?$/);
  if (korean) {
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = korean;
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}+09:00`);
  }
  const dayFirst = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:[ T](\d{1,2}):?(\d{2})?(?::?(\d{2}))?)?$/);
  if (dayFirst) {
    const [, first, second, year, hour = '0', minute = '0', secondValue = '0'] = dayFirst;
    const firstNumber = Number(first);
    const secondNumber = Number(second);
    const usLocale = /^en-US(?:-|$)/i.test(String(locale));
    const month = firstNumber > 12 ? secondNumber : secondNumber > 12 ? firstNumber : usLocale ? firstNumber : secondNumber;
    const day = firstNumber > 12 ? firstNumber : secondNumber > 12 ? secondNumber : usLocale ? secondNumber : firstNumber;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      // Korean servers commonly emit `MM/DD/YYYY HH:mm` even when the
      // surrounding locale is Korean. Keep that value anchored to KST so the
      // relative label is stable on UTC CI/SSR hosts. Other locales retain
      // the historical host-local interpretation for ambiguous numeric dates.
      if (/^ko(?:-|$)/i.test(String(locale))) {
        return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(secondValue).padStart(2, '0')}+09:00`);
      }
      return new Date(Number(year), month - 1, day, Number(hour), Number(minute), Number(secondValue));
    }
  }
  const normalized = text.replace(/\./g, '-').replace(/\//g, '-');
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const RELATIVE_UNITS = [['year', 31557600000], ['month', 2629800000], ['week', 604800000], ['day', 86400000], ['hour', 3600000], ['minute', 60000], ['second', 1000]];

function relativeParts(delta, locale, opts) {
  const requested = String(opts.relativeUnit || 'auto');
  const selected = RELATIVE_UNITS.find(([unit]) => unit === requested);
  const [unit, size] = selected || RELATIVE_UNITS.find(([, ms]) => Math.abs(delta) >= ms) || RELATIVE_UNITS.at(-1);
  const raw = delta / size;
  const rounding = String(opts.relativeRounding || 'round');
  const value = rounding === 'floor' ? Math.floor(raw)
    : rounding === 'ceil' ? Math.ceil(raw)
      : rounding === 'trunc' ? Math.trunc(raw) : Math.round(raw);
  return new Intl.RelativeTimeFormat(locale || undefined, {
    numeric: opts.numeric || 'auto', style: opts.relativeStyle || 'long'
  }).format(value, unit);
}

function pastRelativeCutoff(delta, opts) {
  const amount = Number(opts.relativeCutoff ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return false;
  const unit = RELATIVE_UNITS.find(([name]) => name === String(opts.relativeCutoffUnit || 'day'));
  return Boolean(unit) && Math.abs(delta) >= amount * unit[1];
}

export default {
  create(el, opts) {
    const originalHTML = el.innerHTML;
    const originalStyle = el.getAttribute('style');
    const restoreAttributes = snapshotAttributes(el, ['aria-label', 'aria-live', 'datetime']);
    const locale = opts.locale || document.documentElement.lang || undefined;
    const value = opts.value ?? opts.date ?? opts.datetime ?? opts.source ?? el.getAttribute('datetime') ?? el.textContent;
    const date = parseDate(value, locale);
    const mode = opts.mode || opts.preset || 'relative';
    const interval = Math.max(1000, Number(opts.updateInterval ?? 30000));
    const render = () => {
      if (!date) { el.textContent = opts.fallback || originalHTML || ''; return; }
      const now = opts.now ? new Date(opts.now).getTime() : Date.now();
      const delta = date.getTime() - now;
      const relative = relativeParts(delta, locale, opts);
      const absolute = new Intl.DateTimeFormat(locale, {
        dateStyle: opts.dateStyle || 'medium', timeStyle: opts.timeStyle || undefined,
        timeZone: opts.timeZone || undefined
      }).format(date);
      // Relative mode can hand off to the original localized timestamp after a
      // chosen age. `both` is explicit, so it always retains both values.
      el.textContent = mode === 'absolute' ? absolute : mode === 'both' ? `${relative} · ${absolute}` : pastRelativeCutoff(delta, opts) ? absolute : relative;
      el.setAttribute('datetime', date.toISOString());
      el.setAttribute('aria-label', el.textContent);
    };
    el.setAttribute('aria-live', 'off');
    render();
    const timer = mode === 'absolute' || opts.live === false ? null : setInterval(render, interval);
    return {
      el, type: 'dateTime', render,
      destroy() { if (timer) clearInterval(timer); el.innerHTML = originalHTML; if (originalStyle == null) el.removeAttribute('style'); else el.setAttribute('style', originalStyle); restoreAttributes(); }
    };
  }
};
