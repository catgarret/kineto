// Real decoded pixels, with a controlled RAF/timer clock for pause boundaries.
export async function probeImageLifecycle(base, publicApi = false) {
  const stylize = publicApi ? { create: (el, opts) => window.Kineto.stylize(el, opts) }
    : (await import(`${base}/src/modules/stylize.js`)).default;
  const host = document.createElement('div'); host.className = 'cell';
  const img = new Image(); img.src = `${base}/demo/assets/gallery-01.webp`;
  host.append(img); document.body.append(host); await img.decode();
  // Use a known still PNG, not the conservative animated-WebP extension path.
  const copy = document.createElement('canvas'); copy.width = 240; copy.height = 160;
  copy.getContext('2d').drawImage(img, 0, 0, 240, 160);
  img.src = copy.toDataURL(); await img.decode();
  // Firefox can resolve decode() before complete flips in the load task.
  for (let attempt = 0; !img.complete && attempt < 250; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  if (!img.complete || !img.naturalWidth) throw new Error('still image fixture did not finish loading');
  const original = [window.requestAnimationFrame, window.cancelAnimationFrame, window.setTimeout, window.clearTimeout, window.ResizeObserver];
  const nowDescriptor = Object.getOwnPropertyDescriptor(performance, 'now');
  const hiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden');
  const frames = new Map(), timers = new Map(), observers = new Set();
  let time = 0, serial = 0, hidden = false, instance;
  Object.defineProperty(performance, 'now', { configurable: true, value: () => time });
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  window.requestAnimationFrame = fn => { const id = ++serial; frames.set(id, fn); return id; };
  window.cancelAnimationFrame = id => frames.delete(id);
  window.setTimeout = (fn, delay = 0) => { const id = ++serial; timers.set(id, { fn, at: time + delay }); return id; };
  window.clearTimeout = id => timers.delete(id);
  window.ResizeObserver = class {
    constructor(fn) { this.fn = fn; }
    observe() { observers.add(this); }
    disconnect() { observers.delete(this); }
  };
  const tick = (ms = 0) => {
    time += ms;
    for (const [id, timer] of [...timers]) if (timer.at <= time) { timers.delete(id); timer.fn(); }
    for (const [id, fn] of [...frames]) { frames.delete(id); fn(time); }
  };
  const failures = [], baseline = window.Kineto.instanceCount;
  const check = (ok, message) => { if (!ok) failures.push(message); };
  const idle = () => frames.size === 0 && timers.size === 0;
  const canvas = () => host.querySelector('canvas');
  const clear = () => { instance?.destroy(); instance = null; check(idle() && observers.size === 0, 'destroy removes all pending work'); };
  const visibility = value => { hidden = value; document.dispatchEvent(new Event('visibilitychange')); };
  try {
    const progress = []; let complete = 0;
    instance = stylize.create(img, { mode: 'reveal', delay: 0.3, duration: 1, holdDuration: 0.4,
      onProgress: p => progress.push(p), onComplete: () => { complete++; } });
    tick(100); instance.pause();
    check(idle(), 'delay pause cancels timer and RAF');
    tick(2000); instance.resume(); tick(199);
    check(progress.length === 0, 'delay retains its remaining time');
    tick(1); tick(250);
    const before = progress.at(-1);
    check(before > 0 && before < 0.5, 'reveal begins after the resumed delay');
    instance.pause(); check(idle(), 'reveal pause cancels RAF');
    tick(2000); instance.resume(); tick();
    check(progress.at(-1) === before, 'reveal resume preserves progress');
    visibility(true); check(idle(), 'hidden tab cancels RAF');
    tick(2000); visibility(false); tick();
    check(progress.at(-1) === before, 'visibility resume preserves progress');
    tick(750); tick(100); visibility(true);
    check(progress.at(-1) === 1 && complete === 0 && idle(), 'hold suspension keeps the completion pending');
    tick(2000); instance.pause(); visibility(false);
    check(idle(), 'visible tab does not override an explicit pause');
    instance.resume(); tick(299); check(complete === 0, 'hold preserves the remaining time');
    tick(1); check(complete === 1 && !canvas() && idle(), 'hold finishes once');
    instance.resume(); visibility(true); visibility(false); tick(2000);
    check(complete === 1 && idle(), 'completed reveal does not restart');
    instance.pause(); instance.replay(); tick(2000);
    check(complete === 1 && idle(), 'paused replay schedules nothing');
    instance.resume(); tick(300); tick(1000); tick(400);
    check(complete === 2 && idle(), 'paused replay restarts on resume');
    clear();

    instance = stylize.create(img, { motion: 'drift' }); tick(); tick(100);
    instance.pause(); check(idle(), 'living texture pause cancels RAF');
    tick(2000); instance.resume(); tick(); check(frames.size === 1, 'living texture resumes one RAF');
    visibility(true); check(idle(), 'hidden living texture stops RAF');
    tick(2000); visibility(false); tick(); check(frames.size === 1, 'visible living texture resumes one RAF');
    clear();

    instance = stylize.create(img);
    check(idle() && observers.size === 1, 'still texture uses resize only');
    const width = canvas().width;
    instance.pause(); host.style.width = '120px';
    for (const observer of observers) observer.fn();
    check(canvas().width === width && idle(), 'paused resize defers drawing');
    instance.resume();
    check(canvas().width < width && idle(), 'resume repaints a resized still without a RAF loop');
    clear(); host.style.width = '';

    let started = 0;
    visibility(true);
    instance = stylize.create(img, { onComplete: () => { started++; } });
    check(started === 0 && idle(), 'hidden initialization defers painting and callbacks');
    visibility(false); check(started === 1 && idle(), 'visible initialization paints once');
    clear();

    let replayed = false;
    instance = stylize.create(img, { mode: 'reveal', duration: 0.12,
      onProgress: p => { if (p === 1 && !replayed) { replayed = true; instance.replay(); } },
      onComplete: () => { complete++; } });
    tick(); tick(200); tick();
    check(complete === 2 && Boolean(canvas()), 'callback replay cannot finish the replacement run');
    tick(200); tick(); check(complete === 3 && idle(), 'replacement reveal completes once');
    clear(); visibility(true); visibility(false);
    check(idle() && window.Kineto.instanceCount === baseline, 'destroy releases visibility listener and public record');
  } finally {
    instance?.destroy();
    [window.requestAnimationFrame, window.cancelAnimationFrame, window.setTimeout, window.clearTimeout, window.ResizeObserver] = original;
    if (nowDescriptor) Object.defineProperty(performance, 'now', nowDescriptor); else delete performance.now;
    if (hiddenDescriptor) Object.defineProperty(document, 'hidden', hiddenDescriptor); else delete document.hidden;
    host.remove();
  }
  return failures;
}
