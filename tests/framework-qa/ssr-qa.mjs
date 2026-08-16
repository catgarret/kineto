import assert from 'node:assert/strict';
import React from 'react';
import { renderToString as renderReactToString } from 'react-dom/server';
import { createSSRApp, h } from 'vue';
import { renderToString as renderVueToString } from '@vue/server-renderer';
import { Motion } from '@dong-gri/kineto/react';
import { useKineto as useVueKineto } from '@dong-gri/kineto/vue';
import Kineto from '@dong-gri/kineto';
import standaloneStates from '@dong-gri/kineto/states';

const reactHtml = renderReactToString(
  React.createElement(Motion, { as: 'section', type: 'reveal', options: { duration: 0.01 } }, 'React SSR')
);
assert.match(reactHtml, /React SSR/, 'React SSR must render adapter children without browser globals');

const VueHarness = {
  setup() {
    const { element } = useVueKineto('reveal', { duration: 0.01 });
    return () => h('section', { ref: element }, 'Vue SSR');
  }
};
const vueHtml = await renderVueToString(createSSRApp(VueHarness));
assert.match(vueHtml, /Vue SSR/, 'Vue SSR must render the composable without browser globals');

const fullController = Kineto.states({ hidden: { opacity: 0 }, visible: { opacity: 1 } });
assert.equal(fullController.ssr, true, 'full States controller must expose SSR mode');
assert.deepEqual(await fullController.apply(null, 'visible'), { status: 'finished' });
fullController.destroy();

const standaloneController = standaloneStates({ hidden: { opacity: 0 }, visible: { opacity: 1 } });
assert.equal(standaloneController.ssr, true, 'standalone States entry must be SSR-safe');
assert.deepEqual(await standaloneController.apply(null, 'visible'), { status: 'finished' });
standaloneController.destroy();

console.log('framework SSR QA OK — React/Vue adapters and full/standalone States render without browser globals.');
