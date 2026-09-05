import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createSSRApp, h, nextTick, ref } from 'vue';
import Kineto from '@dong-gri/kineto';
import { useKineto as useReactKineto } from '@dong-gri/kineto/react';
import { useKineto as useVueKineto } from '@dong-gri/kineto/vue';

const sleep = (ms = 25) => new Promise((resolve) => setTimeout(resolve, ms));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const waitUntil = async (condition, message, timeout = 2000) => {
  const started = performance.now();
  while (!condition() && performance.now() - started < timeout) await sleep();
  assert(condition(), message);
};

const lifecycle = {
  react: { creates: 0, destroys: 0, revisions: [] },
  vue: { creates: 0, destroys: 0, revisions: [] }
};

Kineto.register('hydrationProbe', {
  create(element, options) {
    const framework = element.id.startsWith('react-') ? 'react' : 'vue';
    lifecycle[framework].creates += 1;
    lifecycle[framework].revisions.push(options.revision);
    let destroyed = false;
    return {
      element,
      type: 'hydrationProbe',
      destroy() {
        if (destroyed) return;
        destroyed = true;
        lifecycle[framework].destroys += 1;
      }
    };
  }
});

function ReactHydrationHarness({ revision }) {
  const { ref: element } = useReactKineto('hydrationProbe', { revision }, [revision]);
  return <div id="react-hydration-target" ref={element}>React hydration adapter</div>;
}

function createVueHydrationHarness(revision) {
  return {
    setup() {
      const { element } = useVueKineto(
        'hydrationProbe',
        () => ({ revision: revision.value }),
        [revision]
      );
      return () => h('div', { id: 'vue-hydration-target', ref: element }, 'Vue hydration adapter');
    }
  };
}

async function run() {
  const hydrationMessages = [];
  let reactRoot;
  let vueApp;

  try {
    const reactHost = document.querySelector('#react-hydration-root');
    const reactSsrNode = window.__KINETO_HYDRATION_SSR_NODES__?.react;
    const reactSsrHtml = reactHost.innerHTML;
    reactRoot = hydrateRoot(
      reactHost,
      <ReactHydrationHarness revision={0} />,
      { onRecoverableError: (error) => hydrationMessages.push(`React recoverable: ${error?.message || error}`) }
    );
    await waitUntil(
      () => lifecycle.react.creates === 1,
      `React hydration created ${lifecycle.react.creates} probe instances instead of one`
    );
    assert(reactHost.firstElementChild === reactSsrNode, 'React replaced the server-rendered host node during hydration');
    assert(reactHost.innerHTML === reactSsrHtml, 'React changed the server markup during hydration');
    assert(Kineto.instanceCount === 1, `React hydration left ${Kineto.instanceCount} active instances instead of one`);

    reactRoot.render(<ReactHydrationHarness revision={1} />);
    await waitUntil(
      () => lifecycle.react.creates === 2 && lifecycle.react.destroys === 1,
      `React hydration update did not replace exactly one instance (${JSON.stringify(lifecycle.react)})`
    );
    assert(
      JSON.stringify(lifecycle.react.revisions) === '[0,1]',
      `React hydration create received stale options (${JSON.stringify(lifecycle.react.revisions)})`
    );
    assert(Kineto.instanceCount === 1, `React hydration update left ${Kineto.instanceCount} active instances`);
    reactRoot.unmount();
    reactRoot = null;
    await waitUntil(
      () => lifecycle.react.destroys === 2 && Kineto.instanceCount === 0,
      `React hydration unmount leaked instances (${JSON.stringify(lifecycle.react)}, active ${Kineto.instanceCount})`
    );

    const vueHost = document.querySelector('#vue-hydration-root');
    const vueSsrNode = window.__KINETO_HYDRATION_SSR_NODES__?.vue;
    const vueSsrHtml = vueHost.innerHTML;
    const vueRevision = ref(0);
    vueApp = createSSRApp(createVueHydrationHarness(vueRevision));
    vueApp.config.warnHandler = (message) => hydrationMessages.push(`Vue warning: ${message}`);
    vueApp.config.errorHandler = (error) => hydrationMessages.push(`Vue error: ${error?.message || error}`);
    vueApp.mount(vueHost);
    await waitUntil(
      () => lifecycle.vue.creates === 1,
      `Vue hydration created ${lifecycle.vue.creates} probe instances instead of one`
    );
    assert(vueHost.firstElementChild === vueSsrNode, 'Vue replaced the server-rendered host node during hydration');
    assert(vueHost.innerHTML === vueSsrHtml, 'Vue changed the server markup during hydration');
    assert(Kineto.instanceCount === 1, `Vue hydration left ${Kineto.instanceCount} active instances instead of one`);

    vueRevision.value = 1;
    await nextTick();
    await waitUntil(
      () => lifecycle.vue.creates === 2 && lifecycle.vue.destroys === 1,
      `Vue hydration update did not replace exactly one instance (${JSON.stringify(lifecycle.vue)})`
    );
    assert(
      JSON.stringify(lifecycle.vue.revisions) === '[0,1]',
      `Vue hydration create received stale options (${JSON.stringify(lifecycle.vue.revisions)})`
    );
    assert(Kineto.instanceCount === 1, `Vue hydration update left ${Kineto.instanceCount} active instances`);
    vueApp.unmount();
    vueApp = null;
    await waitUntil(
      () => lifecycle.vue.destroys === 2 && Kineto.instanceCount === 0,
      `Vue hydration unmount leaked instances (${JSON.stringify(lifecycle.vue)}, active ${Kineto.instanceCount})`
    );

    assert(hydrationMessages.length === 0, `Hydration emitted framework errors: ${hydrationMessages.join(' | ')}`);
    window.__KINETO_HYDRATION_QA__ = {
      ok: true,
      lifecycle,
      hydrationMessages,
      instanceCount: Kineto.instanceCount
    };
  } catch (error) {
    try { reactRoot?.unmount(); } catch (_cleanupError) { /* best effort */ }
    try { vueApp?.unmount(); } catch (_cleanupError) { /* best effort */ }
    Kineto.destroy();
    window.__KINETO_HYDRATION_QA__ = {
      ok: false,
      error: String(error?.stack || error),
      lifecycle,
      hydrationMessages,
      instanceCount: Kineto.instanceCount
    };
  } finally {
    Kineto.unregister('hydrationProbe');
    document.documentElement.dataset.hydrationQaDone = 'true';
  }
}

run();
