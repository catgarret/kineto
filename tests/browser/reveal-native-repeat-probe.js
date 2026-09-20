export async function probeNativeRepeat(core) {
  const wait = (ms = 260) => new Promise(resolve => setTimeout(resolve, ms));
  const failures = [];
  const check = (ok, label) => { if (!ok) failures.push(label); };
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;top:20px;left:20px;width:300px;height:180px;overflow:auto';
  host.innerHTML = '<div style="height:900px;position:relative"><div style="position:absolute;top:360px;width:120px;height:60px"><b>First<br>Second</b><b>Third</b></div></div>';
  document.body.append(host);
  const el = host.firstElementChild.firstElementChild;
  const original = el.outerHTML;
  for (const once of [false, true]) {
    host.scrollTop = 0;
    const events = []; let completed = 0, premature = 0;
    const instance = core.create('reveal', el, {
      preset: 'fade-up', once, duration: .12, delay: .02, stagger: .02,
      threshold: .2, rootMargin: '0px', enterClass: 'visible', leaveClass: 'outside',
      onEnter: () => events.push('enter'), onLeave: () => events.push('leave'),
      onEnterBack: () => events.push('enterBack'), onLeaveBack: () => events.push('leaveBack'),
      onComplete: () => {
        completed++;
        if (![...el.children].every(n => Number(getComputedStyle(n).opacity) === 1)) premature++;
      }
    });
    const visible = () => [...el.children].every(n => Number(getComputedStyle(n).opacity) === 1);
    const hidden = () => [...el.children].every(n => Number(getComputedStyle(n).opacity) === 0);
    await wait(); check(events.length === 0, `${once}: no initial invisible boundary`);
    host.scrollTop = 300; await wait();
    check(visible() && completed === 1 && events.join() === 'enter', `${once}: first entrance`);
    instance.replay(); await wait();
    check(visible() && completed === 2 && events.join() === 'enter', `${once}: replay is not an entrance`);
    host.scrollTop = 480; await wait();
    check((once ? visible() : hidden()) && events.join() === 'enter,leave', `${once}: forward exit`);
    host.scrollTop = 300; await wait();
    check(visible() && completed === (once ? 2 : 3) && events.join() === 'enter,leave,enterBack', `${once}: backward entrance`);
    host.scrollTop = 0; await wait();
    check((once ? visible() : hidden()) && events.join() === 'enter,leave,enterBack,leaveBack', `${once}: backward exit`);
    host.scrollTop = 300; await wait();
    check(visible() && completed === (once ? 2 : 4) && events.join() === 'enter,leave,enterBack,leaveBack,enter', `${once}: second entrance`);
    instance.pause(); host.scrollTop = 480; await wait();
    check(visible(), `${once}: paused exit does not move`);
    instance.resume(); await wait();
    check(once ? visible() : hidden(), `${once}: resume follows pending direction`);
    instance.destroy(); const count = events.length;
    instance.replay(); instance.resume(); host.scrollTop = 0; await wait();
    check(el.outerHTML === original && events.length === count && core.instanceCount === 0, `${once}: terminal cleanup`);
    check(premature === 0, `${once}: completion waits for every staggered child`);
  }
  // A transform applied by Reveal must not move its own trigger back into view
  // during reverse playback near the top edge of a nested scroller.
  for (const preset of ['fade-up', 'fade-down', 'slide-up', 'rotate', 'flip-x']) {
    host.scrollTop = 0;
    const events = [];
    const instance = core.create('reveal', el, { preset, once: false, duration: .08,
      rootMargin: '0px', threshold: .2,
      onEnter: () => events.push('enter'), onLeave: () => events.push('leave'),
      onEnterBack: () => events.push('enterBack'), onLeaveBack: () => events.push('leaveBack') });
    await wait(); host.scrollTop = 300; await wait();
    host.scrollTop = 415; await wait(400);
    check(events.join() === 'enter,leave', `${preset}: own transform cannot retrigger near an edge (${events})`);
    check(Number(getComputedStyle(el).opacity) === 0, `${preset}: reverse settles hidden`);
    host.scrollTop = 300; await wait();
    check(events.join() === 'enter,leave,enterBack' && Number(getComputedStyle(el).opacity) === 1, `${preset}: real re-entry still works`);
    instance.destroy(); check(el.outerHTML === original, `${preset}: restores author DOM`);
  }
  for (const hook of ['onEnter', 'onLeave', 'onEnterBack', 'onLeaveBack', 'onClassChange', 'onComplete']) {
    host.scrollTop = 0;
    let armed = false, destroyed = false, after = 0, instance;
    const options = { preset: 'fade-up', once: false, duration: .08, rootMargin: '0px' };
    for (const name of ['onEnter', 'onLeave', 'onEnterBack', 'onLeaveBack', 'onClassChange', 'onComplete']) {
      options[name] = () => {
        if (destroyed) after++;
        if (armed && name === hook && !destroyed) { instance.destroy(); destroyed = true; }
      };
    }
    instance = core.create('reveal', el, options);
    await wait(); armed = true;
    for (const position of [300, 480, 300, 0]) { host.scrollTop = position; await wait(); }
    check(destroyed && after === 0 && el.outerHTML === original && core.instanceCount === 0, `${hook}: callback destroy is terminal`);
    instance.destroy();
  }
  host.remove();
  return failures;
}
