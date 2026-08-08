import assert from 'node:assert/strict';
import React from 'react';
import { renderToString as renderReactToString } from 'react-dom/server';
import { createSSRApp, h } from 'vue';
import { renderToString as renderVueToString } from '@vue/server-renderer';
import { Motion } from '@dong-gri/kineto/react';
import { useKineto as useVueKineto } from '@dong-gri/kineto/vue';

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

console.log('framework SSR QA OK — React and Vue adapters render without browser globals.');
