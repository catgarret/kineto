/**
 * `@dong-gri/kineto/auto` — the core plus on-demand modules.
 *
 *   import Kineto from '@dong-gri/kineto/auto';
 *   import '@dong-gri/kineto/style.css';
 *   Kineto.observe(); // or Kineto.autoInit()
 *
 * Every public module is KNOWN (so `data-kt-*` markup keeps working for all of
 * them) but none is IMPORTED until the page's markup asks for it: scan() imports
 * the module, registers it and creates it. Bundlers emit one chunk per module,
 * so the first download is the core only. For the JS API, wait for the module:
 *
 *   await Kineto.loadModules(['tilt', 'reveal']);
 *   Kineto.tilt('.card');
 *
 * This is what the default entry becomes in 1.0 (docs/entry-points.md). The full
 * runtime stays available as `@dong-gri/kineto/all`.
 */
import Kineto from './core.js';
import { installLazyModules } from './lazyModules.js';
import { moduleLoaders } from './moduleLoaders.js';
// Canvas Effect definitions are registered by the page before (or after) the
// markup is scanned, so the tiny registry is part of this entry; the module
// that draws them is still loaded on demand and shares the same registry.
import { defineCanvasEffect, listCanvasEffects } from './modules/canvasEffect/registry.js';

installLazyModules(Kineto);
Object.entries(moduleLoaders).forEach(([name, importer]) => Kineto.registerLazy(name, importer));

Kineto.defineCanvasEffect = defineCanvasEffect;
Kineto.listCanvasEffects = listCanvasEffects;

export default Kineto;
