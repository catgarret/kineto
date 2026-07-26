import React, { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createApp, h, nextTick, ref, withDirectives } from 'vue';
import $ from 'jquery';
import MotionKit from 'motionkit';
import { Motion, useMotionKit as useReactMotionKit } from 'motionkit/react';
import { vMotion, useMotionKit as useVueMotionKit } from 'motionkit/vue';
import installJQueryMotionKit from 'motionkit/jquery';
import 'motionkit/style.css';

const sleep = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));
const results = [];
const fail = (name, error) => results.push({ name, ok: false, error: String(error?.stack || error) });
const pass = (name, detail = '') => results.push({ name, ok: true, detail });
const assert = (condition, message) => { if (!condition) throw new Error(message); };

MotionKit.config({ smooth: false, debug: false });

function ReactHookHarness({ type, dependency }) {
  const { ref, instance } = useReactMotionKit(type, { duration: 0.01 }, [dependency]);
  useEffect(() => {
    window.__reactHookInstanceRef = instance;
  }, [instance]);
  return <div id="react-hook-target" ref={ref}>React hook adapter</div>;
}

function ReactHarness({ type, dependency }) {
  return <>
    <Motion id="react-motion-target" type={type} options={{ duration: 0.01 }} dependencies={[dependency]}>React Motion component</Motion>
    <ReactHookHarness type={type} dependency={dependency} />
  </>;
}

async function testReact() {
  const host = document.querySelector('#react-root');
  const root = createRoot(host);
  root.render(<StrictMode><ReactHarness type="reveal" dependency={0} /></StrictMode>);
  await sleep(120);
  assert(MotionKit.getInstance(document.querySelector('#react-motion-target'), 'reveal'), 'React Motion did not mount reveal');
  assert(MotionKit.getInstance(document.querySelector('#react-hook-target'), 'reveal'), 'React hook did not mount reveal');
  assert(window.__reactHookInstanceRef?.current, 'React hook instance ref was not populated');

  root.render(<StrictMode><ReactHarness type="textSplit" dependency={1} /></StrictMode>);
  await sleep(120);
  assert(!MotionKit.getInstance(document.querySelector('#react-motion-target'), 'reveal'), 'React old module survived type update');
  assert(MotionKit.getInstance(document.querySelector('#react-motion-target'), 'textSplit'), 'React Motion did not update type');
  assert(MotionKit.getInstance(document.querySelector('#react-hook-target'), 'textSplit'), 'React hook did not update type');

  root.unmount();
  await sleep(80);
  assert(host.childElementCount === 0, 'React root did not unmount');
  assert(MotionKit.instanceCount === 0, `React leaked ${MotionKit.instanceCount} instances`);
  pass('React mount/update/unmount', 'StrictMode component + hook');

  for (let i = 0; i < 40; i += 1) {
    const cycleHost = document.createElement('div');
    document.body.appendChild(cycleHost);
    const cycleRoot = createRoot(cycleHost);
    cycleRoot.render(<StrictMode><ReactHarness type={i % 2 ? 'reveal' : 'textSplit'} dependency={i} /></StrictMode>);
    await sleep(8);
    cycleRoot.unmount();
    cycleHost.remove();
  }
  await sleep(100);
  assert(MotionKit.instanceCount === 0, `React repeated mounts leaked ${MotionKit.instanceCount} instances`);
  pass('React repeated lifecycle', '40 StrictMode cycles, 0 active instances');
}

async function testVue() {
  const host = document.querySelector('#vue-root');
  const type = ref('reveal');
  const app = createApp({
    setup() {
      const composableType = 'reveal';
      const { element, instance } = useVueMotionKit(composableType, { duration: 0.01 });
      window.__vueComposableInstance = instance;
      return () => h('section', [
        withDirectives(h('div', { id: 'vue-directive-target' }, 'Vue directive adapter'), [[vMotion, { type: type.value, options: { duration: 0.01 } }]]),
        h('div', { id: 'vue-composable-target', ref: element }, 'Vue composable adapter')
      ]);
    }
  });
  app.mount(host);
  await nextTick();
  await sleep(100);
  assert(MotionKit.getInstance(document.querySelector('#vue-directive-target'), 'reveal'), 'Vue directive did not mount reveal');
  assert(MotionKit.getInstance(document.querySelector('#vue-composable-target'), 'reveal'), 'Vue composable did not mount reveal');
  assert(window.__vueComposableInstance?.value, 'Vue composable instance ref was not populated');

  type.value = 'textSplit';
  await nextTick();
  await sleep(100);
  assert(!MotionKit.getInstance(document.querySelector('#vue-directive-target'), 'reveal'), 'Vue directive old module survived update');
  assert(MotionKit.getInstance(document.querySelector('#vue-directive-target'), 'textSplit'), 'Vue directive did not update type');

  app.unmount();
  await sleep(80);
  assert(host.childElementCount === 0, 'Vue root did not unmount');
  assert(MotionKit.instanceCount === 0, `Vue leaked ${MotionKit.instanceCount} instances`);
  pass('Vue mount/update/unmount', 'directive + composable');

  for (let i = 0; i < 40; i += 1) {
    const cycleHost = document.createElement('div');
    document.body.appendChild(cycleHost);
    const cycleApp = createApp({
      setup() {
        return () => withDirectives(h('div', `Vue ${i}`), [[vMotion, { type: i % 2 ? 'reveal' : 'textSplit', options: { duration: 0.001 } }]]);
      }
    });
    cycleApp.mount(cycleHost);
    await nextTick();
    cycleApp.unmount();
    cycleHost.remove();
  }
  await sleep(100);
  assert(MotionKit.instanceCount === 0, `Vue repeated mounts leaked ${MotionKit.instanceCount} instances`);
  pass('Vue repeated lifecycle', '40 directive cycles, 0 active instances');
}

async function testJQuery() {
  installJQueryMotionKit($);
  const target = $('#jquery-target');
  const returned = target.motionKit('reveal', { duration: 0.01 });
  await sleep(80);
  assert(returned === target, 'jQuery plugin did not preserve chaining');
  assert(MotionKit.getInstance(target[0], 'reveal'), 'jQuery adapter did not mount reveal');
  target.destroyMotionKit('reveal');
  assert(!MotionKit.getInstance(target[0], 'reveal'), 'jQuery adapter did not destroy module');

  for (let i = 0; i < 100; i += 1) {
    target.motionKit(i % 2 ? 'reveal' : 'textSplit', { duration: 0.001 });
    target.destroyMotionKit();
  }
  await sleep(50);
  assert(MotionKit.instanceCount === 0, `jQuery repeated lifecycle leaked ${MotionKit.instanceCount} instances`);
  pass('jQuery lifecycle', 'chain + 100 create/destroy cycles');
}

async function main() {
  try { await testReact(); } catch (error) { fail('React integration', error); MotionKit.destroy(); }
  try { await testVue(); } catch (error) { fail('Vue integration', error); MotionKit.destroy(); }
  try { await testJQuery(); } catch (error) { fail('jQuery integration', error); MotionKit.destroy(); }
  window.__FRAMEWORK_QA__ = { ok: results.every((item) => item.ok), results, instanceCount: MotionKit.instanceCount };
  document.documentElement.dataset.frameworkQaDone = 'true';
}

main();
