// Deterministic lifecycle checks over a genuinely decoded video frame.
// RAF time and playback/visibility events are controlled, not the renderer.
export async function probeVideoLifecycle(base, publicApi = false) {
  const stylize = publicApi
    ? { create: (el, opts) => window.Kineto.stylize(el, opts) }
    : (await import(`${base}/src/modules/stylize.js`)).default;
  const baseline = window.Kineto.instanceCount;
  const host = document.createElement('div');
  host.className = 'cell';
  const video = document.createElement('video');
  video.muted = true;
  video.src = `${base}/demo/assets/motion-demo.mp4`;
  host.append(video);
  document.body.append(host);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('video fixture decode timed out')), 6000);
    video.addEventListener('loadeddata', () => { clearTimeout(timer); resolve(); }, { once: true });
    video.addEventListener('error', () => { clearTimeout(timer); reject(new Error('video fixture cannot decode')); }, { once: true });
  });
  video.pause();
  const original = [window.requestAnimationFrame, window.cancelAnimationFrame, window.IntersectionObserver];
  const hiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden');
  const frames = new Map();
  const observers = [];
  let serial = 0, time = 0, hidden = false, paused = false, ready = 2;
  Object.defineProperties(video, { paused: { get: () => paused }, ended: { get: () => false }, readyState: { get: () => ready } });
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  window.requestAnimationFrame = (fn) => { const id = ++serial; frames.set(id, fn); return id; };
  window.cancelAnimationFrame = (id) => frames.delete(id);
  window.IntersectionObserver = class {
    constructor(callback, options = {}) {
      this.callback = callback;
      this.options = options;
      this.targets = new Set();
      observers.push(this);
    }
    observe(target) { this.targets.add(target); }
    unobserve(target) { this.targets.delete(target); }
    disconnect() { this.targets.clear(); }
  };
  const triggerObserver = (threshold, rootMargin) => [...observers].reverse().find((candidate) =>
    candidate.targets.has(video)
    && candidate.options?.threshold === threshold
    && candidate.options?.rootMargin === rootMargin
  );
  const tick = (ms = 100) => {
    time += ms;
    for (const [id, fn] of [...frames]) { frames.delete(id); fn(time); }
  };
  const failures = [];
  const check = (value, message) => { if (!value) failures.push(message); };
  let instance;
  const clear = () => { instance?.destroy(); instance = null; check(frames.size === 0, 'destroy clears RAF'); };
  const canvas = () => host.querySelector('canvas');
  try {
    instance = stylize.create(video, { mode: 'reveal', trigger: 'manual' });
    video.dispatchEvent(new Event('playing')); tick();
    check(!canvas() && frames.size === 0, 'manual ignores loaded/playing');
    instance.resume(); tick();
    check(!canvas() && frames.size === 0, 'resume does not bypass manual');
    instance.replay(); tick();
    check(Boolean(canvas()?.width), 'manual replay paints');
    clear();

    instance = stylize.create(video, { mode: 'reveal', trigger: 'view', threshold: 0.4, rootMargin: '20px' });
    video.dispatchEvent(new Event('playing')); tick();
    check(!canvas(), 'view waits for intersection');
    const viewObserver = triggerObserver(0.4, '20px');
    check(Boolean(viewObserver), 'view passes observer options');
    viewObserver?.callback([{ target: video, isIntersecting: true }]); tick();
    check(Boolean(canvas()?.width), 'view intersection paints');
    clear();
    check(viewObserver?.targets.size === 0, 'view observer is released');
    instance = stylize.create(video, { mode: 'reveal', trigger: 'view' });
    const lateObserver = triggerObserver(0.05, '0px');
    clear();
    check(lateObserver?.targets.size === 0, 'destroy before intersection disconnects observer');
    lateObserver?.callback([{ target: video, isIntersecting: true }]); tick();
    check(!canvas() && frames.size === 0, 'late intersection after destroy is inert');

    ready = 0;
    instance = stylize.create(video, { mode: 'reveal', trigger: 'manual' });
    instance.replay(); video.dispatchEvent(new Event('playing')); tick();
    check(!canvas(), 'manual replay before decode waits');
    ready = 2; video.dispatchEvent(new Event('loadeddata')); tick();
    check(Boolean(canvas()?.width), 'queued replay starts after decode');
    clear();
    instance = stylize.create(video, { mode: 'reveal', trigger: 'manual' });
    instance.pause(); instance.replay();
    check(frames.size === 0, 'pause before activation is preserved');
    instance.resume(); tick();
    check(Boolean(canvas()?.width) && frames.size === 1, 'resume after paused activation schedules one frame');
    clear();

    const progress = []; let completed = 0;
    instance = stylize.create(video, {
      mode: 'reveal', duration: 1, delay: 0.3, holdDuration: 0.4,
      onProgress: (p) => progress.push(p), onComplete: () => { completed++; }
    });
    tick(0); tick(200);
    check(!progress.some(p => p > 0), 'delay preserves full texture');
    instance.pause();
    check(frames.size === 0, 'module pause cancels RAF');
    tick(2000); instance.resume(); tick(0); tick(200);
    check(progress.at(-1) > 0 && progress.at(-1) < 0.2, 'pause preserves remaining delay');
    paused = true; video.dispatchEvent(new Event('pause'));
    check(frames.size === 0, 'media pause cancels RAF');
    const before = progress.at(-1);
    tick(2000); paused = false; video.dispatchEvent(new Event('playing')); tick(0);
    check(progress.at(-1) === before, 'media resume preserves progress');
    hidden = true; document.dispatchEvent(new Event('visibilitychange'));
    check(frames.size === 0, 'hidden tab cancels RAF');
    tick(2000); hidden = false; document.dispatchEvent(new Event('visibilitychange')); tick(0);
    check(progress.at(-1) === before, 'visible tab preserves progress');
    tick(900);
    check(progress.at(-1) === 1 && completed === 0 && Boolean(canvas()), 'hold defers completion and layer removal');
    instance.pause(); tick(2000); instance.resume(); tick(0); tick(300);
    check(completed === 0, 'hold is paused too');
    tick(100);
    check(completed === 1 && !canvas() && frames.size === 0, 'hold completes exactly once');
    video.dispatchEvent(new Event('playing')); instance.resume(); tick(2000);
    check(completed === 1 && !canvas() && frames.size === 0, 'completed reveal stays terminal until replay');
    instance.replay(); tick(0);
    check(Boolean(canvas()), 'completed reveal replays');
    clear();

    instance = stylize.create(video, { mode: 'reveal', duration: 0.12,
      onProgress: (p) => { if (p === 1) instance.destroy(); }, onComplete: () => { completed++; } });
    tick(0); tick(200);
    check(completed === 1 && frames.size === 0 && !canvas(), 'callback destroy suppresses completion and rescheduling');
    clear();
    let replayed = false;
    instance = stylize.create(video, { mode: 'reveal', duration: 0.12,
      onProgress: (p) => { if (p === 1 && !replayed) { replayed = true; instance.replay(); } },
      onComplete: () => { completed++; } });
    tick(0); tick(200);
    check(completed === 1 && Boolean(canvas()) && frames.size === 1, 'callback replay leaves only the new run active');
    tick(0); tick(200);
    check(completed === 2 && !canvas() && frames.size === 0, 'callback replay completes the new run once');
    clear();
    const authoredStyle = video.getAttribute('style');
    instance = stylize.create(video, { mode: 'persist' }); tick();
    check(Boolean(canvas()?.getContext('2d').getImageData(0, 0, 1, 1).data[3]), 'persist paints decoded pixels');
    instance.pause(); check(frames.size === 0, 'persist pause cancels RAF');
    instance.resume(); tick(); check(frames.size === 1, 'persist resume starts one RAF');
    clear(); video.dispatchEvent(new Event('playing')); document.dispatchEvent(new Event('visibilitychange'));
    check(video.getAttribute('style') === authoredStyle, 'video restores authored styles');
    check(frames.size === 0, 'destroy removes playback and visibility listeners');
    check(window.Kineto.instanceCount === baseline, 'public API releases instance records');
  } finally {
    instance?.destroy();
    [window.requestAnimationFrame, window.cancelAnimationFrame, window.IntersectionObserver] = original;
    if (hiddenDescriptor) Object.defineProperty(document, 'hidden', hiddenDescriptor);
    else delete document.hidden;
    video.removeAttribute('src'); video.load(); host.remove();
  }
  return failures;
}
