import React, { StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createApp, h, nextTick, onBeforeUnmount, onMounted, ref, watch, withDirectives } from 'vue';
import $ from 'jquery';
import Kineto from '@dong-gri/kineto';
import { KinetoPresence as ReactKinetoPresence, Motion, useKineto as useReactKineto, useKinetoPresence as useReactKinetoPresence } from '@dong-gri/kineto/react';
import { KinetoPresence as VueKinetoPresence, vMotion, useKineto as useVueKineto, useKinetoPresence as useVueKinetoPresence } from '@dong-gri/kineto/vue';
import installJQueryKineto from '@dong-gri/kineto/jquery';
import '@dong-gri/kineto/style.css';

const sleep = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));
const results = [];
const fail = (name, error) => results.push({ name, ok: false, error: String(error?.stack || error) });
const pass = (name, detail = '') => results.push({ name, ok: true, detail });
const assert = (condition, message) => { if (!condition) throw new Error(message); };

Kineto.config({ smooth: false, debug: false });

function ReactHookHarness({ type, dependency }) {
  const { ref, instance } = useReactKineto(type, { duration: 0.01 }, [dependency]);
  useEffect(() => {
    window.__reactHookInstanceRef = instance;
  }, [instance]);
  return <div id="react-hook-target" ref={ref}>React hook adapter</div>;
}

function ReactStateHarness({ dependency }) {
  const element = useRef(null);
  useEffect(() => {
    const controller = Kineto.states({
      hidden: { opacity: 0, y: 8 },
      visible: { opacity: 1, y: 0 }
    });
    window.__reactStatesActive = (window.__reactStatesActive || 0) + 1;
    const run = controller.apply(element.current, dependency ? 'visible' : 'hidden', { duration: 0.01 });
    return () => {
      run.cancel();
      controller.destroy();
      window.__reactStatesActive -= 1;
      window.__reactStatesDestroyed = (window.__reactStatesDestroyed || 0) + 1;
    };
  }, [dependency]);
  return <div id="react-state-target" ref={element}>React states adapter</div>;
}

function ReactPresenceHarness({ present }) {
  const lifecycle = useReactKinetoPresence(present, { duration: 0.01, accessibility: 'managed' });
  useEffect(() => {
    window.__reactPresenceActive = (window.__reactPresenceActive || 0) + 1;
    return () => {
      window.__reactPresenceActive -= 1;
    };
  }, []);
  useEffect(() => {
    if (!present && lifecycle.result?.status === 'finished') window.__reactPresenceLeaves = (window.__reactPresenceLeaves || 0) + 1;
  }, [present, lifecycle.result]);
  return <div id="react-presence-target" ref={lifecycle.ref}>React Presence host</div>;
}

function ReactHarness({ type, dependency }) {
  return <>
    <Motion id="react-motion-target" type={type} options={{ duration: 0.01 }} dependencies={[dependency]}>React Motion component</Motion>
    <ReactHookHarness type={type} dependency={dependency} />
    <ReactStateHarness dependency={dependency} />
    <ReactPresenceHarness present={dependency === 0} />
    <ReactKinetoPresence id="react-presence-component-target" present={dependency === 0} options={{ duration: 0.01 }}>React Presence component</ReactKinetoPresence>
  </>;
}

async function testReact() {
  const host = document.querySelector('#react-root');
  const root = createRoot(host);
  root.render(<StrictMode><ReactHarness type="reveal" dependency={0} /></StrictMode>);
  await sleep(120);
  assert(Kineto.getInstance(document.querySelector('#react-motion-target'), 'reveal'), 'React Motion did not mount reveal');
  assert(Kineto.getInstance(document.querySelector('#react-hook-target'), 'reveal'), 'React hook did not mount reveal');
  assert(window.__reactHookInstanceRef?.current, 'React hook instance ref was not populated');
  assert(window.__reactStatesActive === 1, 'React states controller did not mount exactly once');
  assert(window.__reactPresenceActive === 1, 'React Presence controller did not mount exactly once');

  root.render(<StrictMode><ReactHarness type="counter" dependency={1} /></StrictMode>);
  await sleep(120);
  assert(!Kineto.getInstance(document.querySelector('#react-motion-target'), 'reveal'), 'React old module survived type update');
  assert(Kineto.getInstance(document.querySelector('#react-motion-target'), 'counter'), 'React Motion did not update type');
  assert(Kineto.getInstance(document.querySelector('#react-hook-target'), 'counter'), 'React hook did not update type');
  assert(window.__reactStatesActive === 1, 'React states controller was not replaced cleanly');
  assert(window.__reactPresenceLeaves >= 1, 'React Presence did not resolve the host-owned leave');

  root.unmount();
  await sleep(80);
  assert(host.childElementCount === 0, 'React root did not unmount');
  assert(Kineto.instanceCount === 0, `React leaked ${Kineto.instanceCount} instances`);
  assert(window.__reactStatesActive === 0, 'React states controller survived unmount');
  assert(window.__reactPresenceActive === 0, 'React Presence controller survived unmount');
  assert(window.__reactStatesDestroyed >= 2, 'React states cleanup did not run for StrictMode/update');
  pass('React mount/update/unmount', 'StrictMode component + hook');

  for (let i = 0; i < 40; i += 1) {
    const cycleHost = document.createElement('div');
    document.body.appendChild(cycleHost);
    const cycleRoot = createRoot(cycleHost);
    cycleRoot.render(<StrictMode><ReactHarness type={i % 2 ? 'reveal' : 'counter'} dependency={i} /></StrictMode>);
    await sleep(8);
    cycleRoot.unmount();
    cycleHost.remove();
  }
  await sleep(100);
  assert(Kineto.instanceCount === 0, `React repeated mounts leaked ${Kineto.instanceCount} instances`);
  pass('React repeated lifecycle', '40 StrictMode cycles, 0 active instances');
}

async function testVue() {
  const host = document.querySelector('#vue-root');
  const type = ref('reveal');
  const presenceVisible = ref(true);
  const app = createApp({
    setup() {
      const composableType = 'reveal';
      const { element, instance } = useVueKineto(composableType, { duration: 0.01 });
      const stateElement = ref(null);
      const presenceLifecycle = useVueKinetoPresence(presenceVisible, { duration: 0.01, accessibility: 'managed' });
      let stateController = null;
      onMounted(() => {
        stateController = Kineto.states({
          hidden: { opacity: 0, y: 8 },
          visible: { opacity: 1, y: 0 }
        });
        window.__vueStatesActive = (window.__vueStatesActive || 0) + 1;
        stateController.apply(stateElement.value, 'visible', { duration: 0.01 });
        window.__vuePresenceActive = (window.__vuePresenceActive || 0) + 1;
        watch(presenceLifecycle.result, (result) => {
          if (!presenceVisible.value && result?.status === 'finished') window.__vuePresenceLeaves = (window.__vuePresenceLeaves || 0) + 1;
        });
      });
      onBeforeUnmount(() => {
        stateController?.destroy();
        stateController = null;
        window.__vuePresenceActive -= 1;
        window.__vueStatesActive -= 1;
        window.__vueStatesDestroyed = (window.__vueStatesDestroyed || 0) + 1;
      });
      window.__vueComposableInstance = instance;
      return () => h('section', [
        withDirectives(h('div', { id: 'vue-directive-target' }, 'Vue directive adapter'), [[vMotion, { type: type.value, options: { duration: 0.01 } }]]),
        h('div', { id: 'vue-composable-target', ref: element }, 'Vue composable adapter'),
        h('div', { id: 'vue-state-target', ref: stateElement }, 'Vue states adapter'),
        h('div', { id: 'vue-presence-target', ref: presenceLifecycle.element }, 'Vue Presence host'),
        h(VueKinetoPresence, { id: 'vue-presence-component-target', present: presenceVisible.value, options: { duration: 0.01 } }, { default: () => 'Vue Presence component' })
      ]);
    }
  });
  app.mount(host);
  await nextTick();
  await sleep(100);
  assert(Kineto.getInstance(document.querySelector('#vue-directive-target'), 'reveal'), 'Vue directive did not mount reveal');
  assert(Kineto.getInstance(document.querySelector('#vue-composable-target'), 'reveal'), 'Vue composable did not mount reveal');
  assert(window.__vueComposableInstance?.value, 'Vue composable instance ref was not populated');
  assert(window.__vueStatesActive === 1, 'Vue states controller did not mount');
  assert(window.__vuePresenceActive === 1, 'Vue Presence controller did not mount exactly once');

  type.value = 'counter';
  presenceVisible.value = false;
  await nextTick();
  await sleep(100);
  assert(!Kineto.getInstance(document.querySelector('#vue-directive-target'), 'reveal'), 'Vue directive old module survived update');
  assert(Kineto.getInstance(document.querySelector('#vue-directive-target'), 'counter'), 'Vue directive did not update type');
  assert(window.__vuePresenceLeaves >= 1, 'Vue Presence did not resolve the host-owned leave');

  app.unmount();
  await sleep(80);
  assert(host.childElementCount === 0, 'Vue root did not unmount');
  assert(Kineto.instanceCount === 0, `Vue leaked ${Kineto.instanceCount} instances`);
  assert(window.__vueStatesActive === 0, 'Vue states controller survived unmount');
  assert(window.__vuePresenceActive === 0, 'Vue Presence controller survived unmount');
  assert(window.__vueStatesDestroyed === 1, 'Vue states cleanup did not run exactly once');
  pass('Vue mount/update/unmount', 'directive + composable');

  for (let i = 0; i < 40; i += 1) {
    const cycleHost = document.createElement('div');
    document.body.appendChild(cycleHost);
    const cycleApp = createApp({
      setup() {
        return () => withDirectives(h('div', `Vue ${i}`), [[vMotion, { type: i % 2 ? 'reveal' : 'counter', options: { duration: 0.001 } }]]);
      }
    });
    cycleApp.mount(cycleHost);
    await nextTick();
    cycleApp.unmount();
    cycleHost.remove();
  }
  await sleep(100);
  assert(Kineto.instanceCount === 0, `Vue repeated mounts leaked ${Kineto.instanceCount} instances`);
  pass('Vue repeated lifecycle', '40 directive cycles, 0 active instances');
}

async function testJQuery() {
  installJQueryKineto($);
  const target = $('#jquery-target');
  const returned = target.kineto('reveal', { duration: 0.01 });
  await sleep(80);
  assert(returned === target, 'jQuery plugin did not preserve chaining');
  assert(Kineto.getInstance(target[0], 'reveal'), 'jQuery adapter did not mount reveal');
  target.destroyKineto('reveal');
  assert(!Kineto.getInstance(target[0], 'reveal'), 'jQuery adapter did not destroy module');

  for (let i = 0; i < 100; i += 1) {
    target.kineto(i % 2 ? 'reveal' : 'textSplit', { duration: 0.001 });
    target.destroyKineto();
  }
  await sleep(50);
  assert(Kineto.instanceCount === 0, `jQuery repeated lifecycle leaked ${Kineto.instanceCount} instances`);
  pass('jQuery lifecycle', 'chain + 100 create/destroy cycles');
}

async function main() {
  try { await testReact(); } catch (error) { fail('React integration', error); Kineto.destroy(); }
  try { await testVue(); } catch (error) { fail('Vue integration', error); Kineto.destroy(); }
  try { await testJQuery(); } catch (error) { fail('jQuery integration', error); Kineto.destroy(); }
  window.__FRAMEWORK_QA__ = { ok: results.every((item) => item.ok), results, instanceCount: Kineto.instanceCount };
  document.documentElement.dataset.frameworkQaDone = 'true';
}

main();
