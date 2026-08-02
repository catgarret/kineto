import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import scrollSequence from '../src/modules/scrollSequence.js';

const dom = new JSDOM('<div id="sequence"></div>');
const element = dom.window.document.querySelector('#sequence');

assert.equal(scrollSequence.reduced(element, {}), null, 'scrollSequence must not request a placeholder host when no frame source is configured');
assert.equal(element.style.backgroundImage, '', 'missing frame sources must leave the element untouched');

const instance = scrollSequence.reduced(element, { urlPrefix: '/frames/frame_', padding: 4, extension: '.webp' });
assert.match(element.style.backgroundImage, /\/frames\/frame_0001\.webp/, 'an explicit frame prefix must resolve the first reduced-motion frame');
instance.destroy();
assert.equal(element.getAttribute('style'), null, 'destroy must restore the original element after the static fallback');

console.log('scroll-sequence-sources OK — no implicit example.com request; explicit frame sources still resolve.');
