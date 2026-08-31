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
  const koreanLocale = /^ko(?:-|$)/i.test(String(locale));
  const validCalendarDate = (year, month, day) => {
    const probe = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return probe.getUTCFullYear() === Number(year)
      && probe.getUTCMonth() === Number(month) - 1
      && probe.getUTCDate() === Number(day);
  };
  const validClockTime = (hour = '0', minute = '0', second = '0', milli = '0') => {
    const hourNumber = Number(hour);
    const minuteNumber = Number(minute);
    const secondNumber = Number(second);
    const milliText = String(milli);
    const milliNumber = Number(milliText.slice(0, 3).padEnd(3, '0'));
    return /^\d+$/.test(milliText)
      && Number.isInteger(hourNumber) && hourNumber >= 0 && hourNumber <= 23
      && Number.isInteger(minuteNumber) && minuteNumber >= 0 && minuteNumber <= 59
      && Number.isInteger(secondNumber) && secondNumber >= 0 && secondNumber <= 59
      && Number.isInteger(milliNumber) && milliNumber >= 0 && milliNumber <= 999;
  };
  const formatMilliseconds = (milli = '0') => {
    const textValue = String(milli);
    if (!/^\d+$/.test(textValue)) return null;
    // Date stores milliseconds only. RFC 3339 and several SQL drivers emit
    // more precision, so retain the first three digits deterministically.
    return textValue.slice(0, 3).padEnd(3, '0');
  };
  const normalizeOffset = (offset) => {
    if (!offset) return '';
    if (String(offset).toUpperCase() === 'Z') return 'Z';
    const match = String(offset).match(/^([+-])(\d{2}):?(\d{2})$/);
    if (!match || Number(match[2]) > 23 || Number(match[3]) > 59) return null;
    return `${match[1]}${match[2]}:${match[3]}`;
  };
  // Parse every year-first separator consistently before handing the value to
  // the permissive platform parser. Date.parse silently rolls values such as
  // 2026-02-31 into March, and browsers disagree on slash/dot timestamps.
  const yearFirst = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:(?:[T\s]+)(\d{1,2})(?::?(\d{2}))?(?::?(\d{2})(?:\.(\d+))?)?\s*(Z|[+-]\d{2}:?\d{2})?)?$/i);
  if (yearFirst) {
    const [, year, month, day, hour, minute = '0', second = '0', milli = '0', rawOffset] = yearFirst;
    if (!validCalendarDate(year, month, day)) return null;
    const offset = normalizeOffset(rawOffset);
    if (rawOffset && !offset) return null;
    if (hour === undefined) {
      if (rawOffset) return null;
      const dateOnly = koreanLocale
        ? new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000+09:00`)
        : new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
      return Number.isNaN(dateOnly.getTime()) ? null : dateOnly;
    }
    if (!validClockTime(hour, minute, second, milli)) return null;
    const suffix = offset || (koreanLocale ? '+09:00' : '');
    const milliseconds = formatMilliseconds(milli);
    if (!milliseconds) return null;
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}.${milliseconds}${suffix}`;
    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
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
    if (!validCalendarDate(year, month, day) || !validClockTime(hour, minute, second, milli)) return null;
    const iso = `${year}-${month}-${day}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}.${milli.padEnd(3, '0')}${koreanLocale ? '+09:00' : ''}`;
    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const koreanClock = text.match(/^(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일(?:\s*(\d{1,2})\s*시)?(?:\s*(\d{1,2})\s*분)?(?:\s*(\d{1,2})\s*초)?$/);
  if (koreanClock) {
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = koreanClock;
    if (!validCalendarDate(year, month, day) || !validClockTime(hour, minute, second)) return null;
    const parsed = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}+09:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const korean = text.match(/^(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일(?:\s+(\d{1,2})(?::(\d{2})(?::(\d{2}))?)?)?$/);
  if (korean) {
    const [, year, month, day, hour = '0', minute = '0', second = '0'] = korean;
    if (!validCalendarDate(year, month, day) || !validClockTime(hour, minute, second)) return null;
    const parsed = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}+09:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const dayFirst = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:[ T](\d{1,2}):?(\d{2})?(?::?(\d{2})(?:\.(\d+))?)?\s*(Z|[+-]\d{2}:?\d{2})?)?$/i);
  if (dayFirst) {
    const [, first, second, year, hour, minute, secondValue, milli = '0', rawOffset] = dayFirst;
    const normalizedHour = hour ?? '0';
    const normalizedMinute = minute ?? '0';
    const normalizedSecond = secondValue ?? '0';
    const firstNumber = Number(first);
    const secondNumber = Number(second);
    const usLocale = /^en-US(?:-|$)/i.test(String(locale));
    const month = firstNumber > 12 ? secondNumber : secondNumber > 12 ? firstNumber : usLocale ? firstNumber : secondNumber;
    const day = firstNumber > 12 ? firstNumber : secondNumber > 12 ? secondNumber : usLocale ? secondNumber : firstNumber;
    const offset = normalizeOffset(rawOffset);
    if (rawOffset && !offset) return null;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && validCalendarDate(year, month, day) && validClockTime(normalizedHour, normalizedMinute, normalizedSecond, milli)) {
      // Korean servers commonly emit `MM/DD/YYYY HH:mm` even when the
      // surrounding locale is Korean. Keep that value anchored to KST so the
      // relative label is stable on UTC CI/SSR hosts. Other locales retain
      // the historical host-local interpretation for ambiguous numeric dates.
      if (koreanLocale || offset) {
        const milliseconds = formatMilliseconds(milli);
        if (!milliseconds) return null;
        const suffix = offset || '+09:00';
        return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(normalizedHour).padStart(2, '0')}:${String(normalizedMinute).padStart(2, '0')}:${String(normalizedSecond).padStart(2, '0')}.${milliseconds}${suffix}`);
      }
      return new Date(Number(year), month - 1, day, Number(normalizedHour), Number(normalizedMinute), Number(normalizedSecond), Number(formatMilliseconds(milli)));
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
