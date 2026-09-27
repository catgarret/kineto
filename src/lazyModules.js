/**
 * On-demand module loading — installed only by the `@dong-gri/kineto/auto`
 * entry (src/auto.js). The full and core entries never import this file.
 *
 * What it does
 *   Every module is registered by NAME with an importer (a function returning
 *   `import('./modules/<name>.js')`). When `scan()` meets `data-kt-<name>` for a
 *   module that is known but not imported, the core asks this store to load
 *   it, the store registers it, and the core scans again. Bundlers turn each
 *   `import()` into its own chunk, so a page downloads only what its markup uses.
 *
 * Public API it adds (auto entry only; kineto.features.json#entryPoints["./auto"].api)
 *   Kineto.registerLazy(name, importer)  make a module known without importing it
 *   Kineto.loadModules(names?)           import now; without names, wait for all in flight
 *
 * Security
 *   Markup never chooses WHAT is imported: an attribute can only match a name
 *   page code registered, and the importer is a function written by the page
 *   (or the generated src/moduleLoaders.js) — never a string used as a URL/path.
 *
 * States of one name
 *   known → loading (promise in flight) → registered (Kineto.register; the
 *   importer is then ignored) | failed (left out of discovery until loadModules() asks for
 *   that name again, so a broken chunk cannot make scan → load → scan loop).
 */

// Module names are identifiers (`tilt`, `textReveal`, `switch`); dash() turns
// them into the `data-kt-*` attribute, so nothing else could be activated anyway.
const NAME_PATTERN = /^[a-z][A-Za-z0-9]{0,63}$/;

import { setModuleSource } from './core.js';

export function installLazyModules(Kineto) {
  const importers = new Map(); // name → () => Promise<module | { default: module }>
  const loading = new Map();   // name → Promise<boolean>
  const failed = new Set();
  const codes = Kineto.diagnosticCodes;
  const emit = (payload) => Kineto.diagnostics.emit(payload);

  // A name stops being "on demand" once a real module is registered under it
  // (by this store or by the page's own Kineto.register(), which also adds the
  // `Kineto.<name>()` shorthand). A name that is a core method (`config`, …)
  // therefore can never be shadowed by an on-demand module either.
  const registered = (name) => typeof Kineto[name] === 'function';
  const known = (name) => importers.has(name) && !registered(name);

  // The hook object core.js calls (see `moduleSource` there).
  const source = {
    has: known,
    /** Names scan() should look for: known, not imported, not failed. */
    discoverable: () => Array.from(importers.keys()).filter((name) => !failed.has(name) && !registered(name)),
    /**
     * Resolves `true` once the module is registered, `false` when it could not
     * be. Never rejects: markup keeps its static content (progressive
     * enhancement), and the failure is reported once.
     */
    load(name) {
      if (loading.has(name)) return loading.get(name);
      const importer = importers.get(name);
      if (!importer) return Promise.resolve(false);
      failed.delete(name); // an explicit load is allowed to retry a failure
      const promise = Promise.resolve()
        .then(() => importer())
        .then((loaded) => {
          const module = loaded && typeof loaded === 'object' && 'default' in loaded ? loaded.default : loaded;
          if (!module || typeof module.create !== 'function') throw new TypeError(`on-demand module "${name}" has no create() function`);
          Kineto.register(name, module);
          return true;
        })
        .catch((error) => {
          failed.add(name);
          console.warn(`[Kineto] Module "${name}" could not be loaded on demand; its markup stays static.`, error);
          emit({ code: codes.MODULE_LOAD_FAILED, module: name, phase: 'register', recoverable: true, cause: error });
          return false;
        })
        .finally(() => loading.delete(name));
      loading.set(name, promise);
      return promise;
    },
    loadAll: (names) => Promise.all(names.map((name) => source.load(name))),
    /** create() asked for a module that is still on its way: start it, say how to wait. */
    notLoaded(name) {
      source.load(name);
      console.warn(`[Kineto] "${name}" loads on demand: await Kineto.loadModules('${name}') before create().`);
      emit({ code: codes.UNKNOWN_MODULE, module: name, phase: 'create', recoverable: true, detail: { loading: true } });
      return null;
    }
  };

  setModuleSource(source);

  /**
   * Make a module known by name without importing it. `importer` is usually
   * `() => import('./my-module.js')`. No effect for a registered name.
   */
  Kineto.registerLazy = function registerLazy(name, importer) {
    if (registered(name)) return Kineto;
    if (typeof name !== 'string' || !NAME_PATTERN.test(name) || typeof importer !== 'function') {
      console.warn(`[Kineto] registerLazy("${name}") needs a module name and an importer function.`);
      emit({ code: codes.INVALID_MODULE, module: String(name || 'unknown'), phase: 'register', recoverable: true });
      return Kineto;
    }
    importers.set(name, importer);
    failed.delete(name);
    return Kineto;
  };

  /**
   * Import on-demand modules now: one name or a list. Without names, wait for
   * every import already in flight. Resolves to Kineto (a failed import is
   * reported as KT_MODULE_LOAD_FAILED and does not reject).
   */
  Kineto.loadModules = function loadModules(names) {
    if (names === undefined || names === null) return Promise.all(Array.from(loading.values())).then(() => Kineto);
    const list = (Array.isArray(names) ? names : [names]).map(String);
    return Promise.all(list.map((name) => {
      if (registered(name)) return true;
      if (importers.has(name)) return source.load(name);
      console.warn(`[Kineto] Unknown module: ${name}`);
      emit({ code: codes.UNKNOWN_MODULE, module: name, phase: 'register', recoverable: true });
      return false;
    })).then(() => Kineto);
  };

  return Kineto;
}
