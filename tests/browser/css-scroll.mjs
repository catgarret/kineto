// Scroll-driven Animations contract checks for cssScroll's native and
// ScrollTrigger-backed progress paths.
// Run: node tests/browser/css-scroll.mjs
// Cross-engine: KT_BROWSER=firefox|webkit node tests/browser/css-scroll.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = path.join(root, pathname);
  fs.readFile(file, (error, body) => {
    if (error) {
      response.writeHead(404);
      response.end();
      return;
    }
    response.writeHead(200, { 'content-type': file.endsWith('.js') ? 'text/javascript' : 'text/html' });
    response.end(body);
  });
});
await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;

const launchOptions = browserName === 'chromium'
  ? {
      headless: true,
      ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}),
      args: ['--no-sandbox', '--disable-gpu']
    }
  : { headless: true };
const browser = await browserType.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
const runtimeErrors = [];
page.on('pageerror', (error) => runtimeErrors.push(error.stack || error.message));
page.on('console', (message) => {
  if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
});

const readProgress = (selector, property) => page.evaluate(
  ({ selector: targetSelector, property: customProperty }) =>
    Number.parseFloat(getComputedStyle(document.querySelector(targetSelector)).getPropertyValue(customProperty)),
  { selector, property }
);
const waitForProgress = (selector, property, min, max = 2) => page.waitForFunction(
  ({ selector: targetSelector, property: customProperty, lower, upper }) => {
    const value = Number.parseFloat(getComputedStyle(document.querySelector(targetSelector)).getPropertyValue(customProperty));
    return value > lower && value < upper;
  },
  { selector, property, lower: min, upper: max },
  { timeout: 3000 }
);

try {
  await page.setContent(`<!doctype html><html><head><style>
    @property --native-progress { syntax: '<number>'; inherits: false; initial-value: 0; }
    @property --view-progress { syntax: '<number>'; inherits: false; initial-value: 0; }
    @keyframes kt-css-scroll-native-progress {
      from { --native-progress: 0; }
      to { --native-progress: 1; }
    }
    @keyframes kt-css-scroll-view-progress {
      from { --view-progress: 0; }
      to { --view-progress: 1; }
    }
    html, body { margin: 0; }
    #native-scrollport { height: 240px; overflow-y: auto; }
    #native-track { height: 1040px; }
    #native { width: 160px; height: 60px; }
    #native-view-scrollport { height: 240px; overflow-y: auto; }
    #view-before { height: 240px; }
    #native-view { width: 160px; height: 80px; }
    #view-after { height: 640px; }
    #fallback-stage { position: relative; height: 2400px; }
    #fallback, #unsupported { position: absolute; width: 160px; height: 120px; }
    #fallback { top: 720px; }
    #unsupported { top: 1500px; }
  </style></head><body>
    <div id="native-scrollport"><div id="native-track">
      <div id="native" style="--native-progress: .25; animation-name: authored-native; animation-timeline: auto; animation-range-start: normal; animation-range-end: normal; animation-fill-mode: none; animation-play-state: paused; animation-timing-function: linear"></div>
    </div></div>
    <div id="native-view-scrollport">
      <div id="view-before"></div>
      <div id="native-view" style="--view-progress: .15; animation-name: authored-view; animation-timeline: auto; animation-range-start: normal; animation-range-end: normal; animation-fill-mode: none; animation-play-state: paused; animation-timing-function: linear"></div>
      <div id="view-after"></div>
    </div>
    <div id="fallback-stage">
      <div id="fallback" style="--fallback-progress: .2; color: rgb(1, 2, 3)"></div>
      <div id="unsupported" style="--unsupported-progress: .35; color: rgb(4, 5, 6)"></div>
      <div id="reduced" style="--reduced-progress: .4 !important"></div>
    </div>
    <script src="http://localhost:${port}/node_modules/gsap/dist/gsap.min.js"></script>
    <script src="http://localhost:${port}/node_modules/gsap/dist/ScrollTrigger.min.js"></script>
    <script src="http://localhost:${port}/dist/kineto.umd.js"></script>
  </body></html>`, { waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.Kineto && window.gsap && window.ScrollTrigger));
  await page.evaluate(() => window.Kineto.setAnimationEngine({
    gsap: window.gsap,
    ScrollTrigger: window.ScrollTrigger
  }));

  const nativeSupport = await page.evaluate(() => ({
    scroll: CSS.supports('animation-timeline', 'scroll(nearest block)'),
    view: CSS.supports('animation-timeline', 'view(block)')
  }));
  if (browserName === 'chromium') {
    assert.deepEqual(nativeSupport, { scroll: true, view: true },
      'the pinned Chromium lane must exercise native scroll() and view() timelines');
  }

  if (nativeSupport.scroll) {
    const nativeSetup = await page.evaluate(() => {
      const element = document.querySelector('#native');
      const snapshot = {
        animationName: element.style.animationName,
        animationTimeline: element.style.animationTimeline,
        animationRangeStart: element.style.animationRangeStart,
        animationRangeEnd: element.style.animationRangeEnd,
        animationFillMode: element.style.animationFillMode,
        animationPlayState: element.style.animationPlayState,
        property: element.style.getPropertyValue('--native-progress'),
        propertyPriority: element.style.getPropertyPriority('--native-progress'),
        timing: element.style.animationTimingFunction
      };
      const instance = window.Kineto.create('cssScroll', element, {
        property: '--native-progress',
        cssAnimation: 'kt-css-scroll-native-progress',
        timeline: 'scroll',
        axis: 'block',
        rangeStart: '0%',
        rangeEnd: '100%'
      });
      window.__KT_NATIVE__ = { element, instance, snapshot };
      return {
        created: Boolean(instance),
        timeline: element.style.animationTimeline,
        animationName: element.style.animationName,
        animations: element.getAnimations().length,
        fallbackTriggers: window.ScrollTrigger.getAll().length
      };
    });
    assert.equal(nativeSetup.created, true, 'native cssScroll must create an instance');
    assert.match(nativeSetup.timeline, /^scroll\(/, 'native cssScroll must install a scroll timeline');
    assert.equal(nativeSetup.animationName, 'kt-css-scroll-native-progress');
    assert.equal(nativeSetup.animations, 1, 'native cssScroll must create one CSS animation');
    assert.equal(nativeSetup.fallbackTriggers, 0, 'native cssScroll must not create a ScrollTrigger');

    await page.evaluate(() => {
      const scroller = document.querySelector('#native-scrollport');
      scroller.scrollTop = (scroller.scrollHeight - scroller.clientHeight) / 2;
    });
    await waitForProgress('#native', '--native-progress', 0.45, 0.55);
    const nativeMiddle = await page.evaluate(() => {
      const scroller = document.querySelector('#native-scrollport');
      return {
        progress: Number.parseFloat(getComputedStyle(document.querySelector('#native')).getPropertyValue('--native-progress')),
        ratio: scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight)
      };
    });
    assert.ok(Math.abs(nativeMiddle.progress - nativeMiddle.ratio) < 0.03,
      `native CSS progress must track actual scroll progress (${JSON.stringify(nativeMiddle)})`);

    await page.evaluate(() => {
      const scroller = document.querySelector('#native-scrollport');
      scroller.scrollTop = scroller.scrollHeight - scroller.clientHeight;
    });
    await waitForProgress('#native', '--native-progress', 0.95);

    const nativeRestore = await page.evaluate(() => {
      const { element, instance, snapshot } = window.__KT_NATIVE__;
      instance.destroy();
      return {
        snapshot,
        restored: {
          animationName: element.style.animationName,
          animationTimeline: element.style.animationTimeline,
          animationRangeStart: element.style.animationRangeStart,
          animationRangeEnd: element.style.animationRangeEnd,
          animationFillMode: element.style.animationFillMode,
          animationPlayState: element.style.animationPlayState,
          property: element.style.getPropertyValue('--native-progress'),
          propertyPriority: element.style.getPropertyPriority('--native-progress'),
          timing: element.style.animationTimingFunction
        },
        registered: Boolean(window.Kineto.getInstance(element, 'cssScroll')),
        instanceCount: window.Kineto.instanceCount
      };
    });
    assert.deepEqual(nativeRestore.restored, nativeRestore.snapshot,
      'native destroy must restore every author-owned animation/property value');
    assert.equal(nativeRestore.registered, false, 'native destroy must clear the core instance record');
    assert.equal(nativeRestore.instanceCount, 0, 'native destroy must leave no Kineto instance');
  }

  if (nativeSupport.view) {
    const viewSetup = await page.evaluate(() => {
      const element = document.querySelector('#native-view');
      const snapshot = {
        animationName: element.style.animationName,
        animationTimeline: element.style.animationTimeline,
        animationRangeStart: element.style.animationRangeStart,
        animationRangeEnd: element.style.animationRangeEnd,
        animationFillMode: element.style.animationFillMode,
        animationPlayState: element.style.animationPlayState,
        property: element.style.getPropertyValue('--view-progress'),
        propertyPriority: element.style.getPropertyPriority('--view-progress'),
        timing: element.style.animationTimingFunction
      };
      const instance = window.Kineto.create('cssScroll', element, {
        property: '--view-progress',
        cssAnimation: 'kt-css-scroll-view-progress',
        timeline: 'view',
        axis: 'block',
        rangeStart: 'entry 0%',
        rangeEnd: 'exit 100%'
      });
      window.__KT_VIEW__ = { element, instance, snapshot };
      return {
        created: Boolean(instance),
        timeline: element.style.animationTimeline,
        animationName: element.style.animationName,
        animations: element.getAnimations().length,
        fallbackTriggers: window.ScrollTrigger.getAll().length
      };
    });
    assert.equal(viewSetup.created, true, 'native view cssScroll must create an instance');
    assert.match(viewSetup.timeline, /^view\(/,
      'native view cssScroll must install a view timeline (block may serialize as the default view())');
    assert.equal(viewSetup.animationName, 'kt-css-scroll-view-progress');
    assert.equal(viewSetup.animations, 1, 'native view cssScroll must create one CSS animation');
    assert.equal(viewSetup.fallbackTriggers, 0, 'native view cssScroll must not create a ScrollTrigger');

    await page.evaluate(() => {
      document.querySelector('#native-view-scrollport').scrollTop = 160;
    });
    await waitForProgress('#native-view', '--view-progress', 0.45, 0.55);
    const viewMiddle = await page.evaluate(() => {
      const scroller = document.querySelector('#native-view-scrollport');
      const target = document.querySelector('#native-view');
      const targetTop = target.getBoundingClientRect().top
        - scroller.getBoundingClientRect().top
        + scroller.scrollTop;
      const start = targetTop - scroller.clientHeight;
      const end = targetTop + target.offsetHeight;
      return {
        progress: Number.parseFloat(getComputedStyle(target).getPropertyValue('--view-progress')),
        expected: (scroller.scrollTop - start) / (end - start)
      };
    });
    assert.ok(Math.abs(viewMiddle.progress - viewMiddle.expected) < 0.03,
      `native view() progress must track the element's actual passage (${JSON.stringify(viewMiddle)})`);

    const viewRestore = await page.evaluate(() => {
      const { element, instance, snapshot } = window.__KT_VIEW__;
      instance.destroy();
      return {
        snapshot,
        restored: {
          animationName: element.style.animationName,
          animationTimeline: element.style.animationTimeline,
          animationRangeStart: element.style.animationRangeStart,
          animationRangeEnd: element.style.animationRangeEnd,
          animationFillMode: element.style.animationFillMode,
          animationPlayState: element.style.animationPlayState,
          property: element.style.getPropertyValue('--view-progress'),
          propertyPriority: element.style.getPropertyPriority('--view-progress'),
          timing: element.style.animationTimingFunction
        },
        registered: Boolean(window.Kineto.getInstance(element, 'cssScroll')),
        instanceCount: window.Kineto.instanceCount
      };
    });
    assert.deepEqual(viewRestore.restored, viewRestore.snapshot,
      'native view destroy must restore every author-owned animation/property value');
    assert.equal(viewRestore.registered, false, 'native view destroy must clear the core instance record');
    assert.equal(viewRestore.instanceCount, 0, 'native view destroy must leave no Kineto instance');
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  const fallbackSetup = await page.evaluate(() => {
    const element = document.querySelector('#fallback');
    const snapshot = {
      property: element.style.getPropertyValue('--fallback-progress'),
      propertyPriority: element.style.getPropertyPriority('--fallback-progress'),
      color: element.style.color
    };
    const updates = [];
    // Omitting cssAnimation is the existing, explicit progress-property path.
    // It must stay usable even in browsers that also support native timelines.
    const instance = window.Kineto.create('cssScroll', element, {
      property: '--fallback-progress',
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (progress) => updates.push(progress)
    });
    window.ScrollTrigger.refresh();
    const trigger = window.ScrollTrigger.getAll()[0];
    window.__KT_FALLBACK__ = { element, instance, snapshot, updates, trigger };
    return {
      created: Boolean(instance),
      triggerCount: window.ScrollTrigger.getAll().length,
      start: trigger?.start,
      end: trigger?.end,
      timeline: element.style.animationTimeline || ''
    };
  });
  assert.equal(fallbackSetup.created, true, 'forced progress-property fallback must create an instance');
  assert.equal(fallbackSetup.triggerCount, 1, 'forced fallback must create exactly one ScrollTrigger');
  assert.equal(fallbackSetup.timeline, '', 'forced fallback must not install a native animation timeline');
  assert.ok(Number.isFinite(fallbackSetup.start) && fallbackSetup.end > fallbackSetup.start,
    `fallback ScrollTrigger needs a measurable range (${JSON.stringify(fallbackSetup)})`);

  await page.evaluate(({ start, end }) => window.scrollTo(0, start + ((end - start) / 2)), fallbackSetup);
  await waitForProgress('#fallback', '--fallback-progress', 0.45, 0.55);
  const fallbackMiddle = await page.evaluate(() => ({
    property: Number.parseFloat(getComputedStyle(document.querySelector('#fallback')).getPropertyValue('--fallback-progress')),
    trigger: window.__KT_FALLBACK__.trigger.progress,
    callback: window.__KT_FALLBACK__.updates.at(-1),
    priority: document.querySelector('#fallback').style.getPropertyPriority('--fallback-progress')
  }));
  assert.ok(Math.abs(fallbackMiddle.property - fallbackMiddle.trigger) < 0.03,
    `fallback CSS property must follow the real ScrollTrigger progress (${JSON.stringify(fallbackMiddle)})`);
  assert.ok(Math.abs(fallbackMiddle.callback - fallbackMiddle.trigger) < 0.03,
    `fallback onUpdate must report the same progress (${JSON.stringify(fallbackMiddle)})`);
  assert.equal(fallbackMiddle.priority, '', 'runtime progress must keep the fallback property at normal priority');

  const fallbackRestore = await page.evaluate(() => {
    const { element, instance, snapshot } = window.__KT_FALLBACK__;
    instance.destroy();
    return {
      snapshot,
      restored: {
        property: element.style.getPropertyValue('--fallback-progress'),
        propertyPriority: element.style.getPropertyPriority('--fallback-progress'),
        color: element.style.color
      },
      registered: Boolean(window.Kineto.getInstance(element, 'cssScroll')),
      triggerCount: window.ScrollTrigger.getAll().length,
      instanceCount: window.Kineto.instanceCount
    };
  });
  assert.deepEqual(fallbackRestore.restored, fallbackRestore.snapshot,
    'fallback destroy must restore the authored custom property, including !important priority');
  assert.equal(fallbackRestore.registered, false, 'fallback destroy must clear the core instance record');
  assert.equal(fallbackRestore.triggerCount, 0, 'fallback destroy must kill its ScrollTrigger');
  assert.equal(fallbackRestore.instanceCount, 0, 'fallback destroy must leave no Kineto instance');

  const priorityRestore = await page.evaluate(() => {
    const element = document.querySelector('#fallback');
    element.style.setProperty('--fallback-progress', '.2', 'important');
    const instance = window.Kineto.create('cssScroll', element, {
      property: '--fallback-progress',
      start: 'top bottom',
      end: 'bottom top'
    });
    window.ScrollTrigger.refresh();
    instance.destroy();
    return {
      property: element.style.getPropertyValue('--fallback-progress'),
      priority: element.style.getPropertyPriority('--fallback-progress'),
      triggerCount: window.ScrollTrigger.getAll().length,
      instanceCount: window.Kineto.instanceCount
    };
  });
  assert.deepEqual(priorityRestore, {
    property: '.2',
    priority: 'important',
    triggerCount: 0,
    instanceCount: 0
  }, 'fallback destroy must preserve an authored !important custom property');

  await page.evaluate(() => window.scrollTo(0, 0));
  const unsupportedSetup = await page.evaluate(() => {
    const element = document.querySelector('#unsupported');
    const exactTimeline = 'scroll(nearest block)';
    const originalSupports = CSS.supports;
    const calls = [];
    CSS.supports = function supports(property, value) {
      calls.push([property, value]);
      if (property === 'animation-timeline' && value === exactTimeline) return false;
      return originalSupports.call(this, property, value);
    };
    let instance;
    try {
      instance = window.Kineto.create('cssScroll', element, {
        property: '--unsupported-progress',
        cssAnimation: 'kt-css-scroll-native-progress',
        timeline: 'scroll',
        axis: 'block',
        start: 'top bottom',
        end: 'bottom top'
      });
    } finally {
      CSS.supports = originalSupports;
    }
    window.ScrollTrigger.refresh();
    const trigger = window.ScrollTrigger.getAll()[0];
    window.__KT_UNSUPPORTED__ = { element, instance, trigger };
    return {
      calls,
      created: Boolean(instance),
      start: trigger?.start,
      end: trigger?.end,
      timeline: element.style.animationTimeline || '',
      triggerCount: window.ScrollTrigger.getAll().length
    };
  });
  assert.ok(unsupportedSetup.calls.some(([, value]) => value === 'scroll(nearest block)'),
    'feature detection must query the exact generated timeline value');
  assert.equal(unsupportedSetup.created, true, 'unsupported exact timeline must degrade to a fallback instance');
  assert.equal(unsupportedSetup.timeline, '', 'unsupported exact timeline must not install CSS longhands');
  assert.equal(unsupportedSetup.triggerCount, 1, 'unsupported exact timeline must create one ScrollTrigger fallback');
  await page.evaluate(({ start, end }) => window.scrollTo(0, start + ((end - start) / 2)), unsupportedSetup);
  await waitForProgress('#unsupported', '--unsupported-progress', 0.45, 0.55);
  const unsupportedProgress = await readProgress('#unsupported', '--unsupported-progress');
  assert.ok(unsupportedProgress > 0.45 && unsupportedProgress < 0.55,
    `unsupported exact timeline must publish fallback progress (${unsupportedProgress})`);
  const unsupportedRestore = await page.evaluate(() => {
    const { element, instance } = window.__KT_UNSUPPORTED__;
    instance.destroy();
    return {
      property: element.style.getPropertyValue('--unsupported-progress'),
      triggerCount: window.ScrollTrigger.getAll().length,
      instanceCount: window.Kineto.instanceCount
    };
  });
  assert.equal(unsupportedRestore.property, '.35');
  assert.equal(unsupportedRestore.triggerCount, 0);
  assert.equal(unsupportedRestore.instanceCount, 0);

  const reducedState = await page.evaluate(() => {
    const element = document.querySelector('#reduced');
    window.Kineto.setReducedMotion('always');
    const instance = window.Kineto.create('cssScroll', element, {
      property: '--reduced-progress',
      cssAnimation: 'kt-css-scroll-native-progress',
      timeline: 'scroll',
      axis: 'block'
    });
    const completed = {
      inline: element.style.getPropertyValue('--reduced-progress'),
      computed: getComputedStyle(element).getPropertyValue('--reduced-progress').trim(),
      priority: element.style.getPropertyPriority('--reduced-progress'),
      animations: element.getAnimations().length,
      triggerCount: window.ScrollTrigger.getAll().length
    };
    instance.destroy();
    const restored = {
      value: element.style.getPropertyValue('--reduced-progress'),
      priority: element.style.getPropertyPriority('--reduced-progress'),
      instanceCount: window.Kineto.instanceCount
    };
    window.Kineto.setReducedMotion('user');
    return { completed, restored };
  });
  assert.deepEqual(reducedState.completed, {
    inline: '1',
    computed: '1',
    priority: 'important',
    animations: 0,
    triggerCount: 0
  }, 'reduced motion must expose the completed progress without a sampled animation');
  assert.deepEqual(reducedState.restored, {
    value: '.4',
    priority: 'important',
    instanceCount: 0
  }, 'reduced-motion destroy must restore the authored custom property and priority');

  assert.deepEqual(runtimeErrors, [], `cssScroll browser runtime errors:\n${runtimeErrors.join('\n')}`);
  console.log(`cssScroll browser QA OK in ${browserName}: scroll=${nativeSupport.scroll}, view=${nativeSupport.view}, fallback=true, lifecycle restored.`);
} finally {
  await browser.close();
  server.close();
}
