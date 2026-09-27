/**
 * `@dong-gri/kineto` — the default entry during the 0.13 → 1.0 transition.
 *
 * It is the full runtime (the same module as `@dong-gri/kineto/all`, so both
 * share ONE Kineto instance) plus one KT_DEPRECATED notice: in 1.0 the default
 * entry becomes the on-demand core (`@dong-gri/kineto/auto`), and a page that
 * relies on "import the default, every module is there" should pick
 * `/all` or `/auto` explicitly now. docs/entry-points.md explains the choice.
 *
 * The notice follows the deprecation rules (docs/diagnostics-and-deprecation.md):
 * it is sent only to a page that turned diagnostics on (`config({ debug })`,
 * `debugSink`), once. Import happens before the page can turn them on, so this
 * file retries on the first config()/scan() calls and then restores the
 * original methods — the core itself carries none of this.
 *
 * Build: scripts/build-min.mjs copies this file to dist/kineto.default.js with
 * `./index.js` pointing at the minified full runtime and __NOTICE__ replaced by
 * the notice generated from kineto.features.json#entryPoints (scripts/entry-points.mjs).
 */
import Kineto from './index.js';

const NOTICE = /* __NOTICE__ */ null;

if (NOTICE && !Kineto[Symbol.for('kineto.defaultEntryNoticed')]) {
  // One notice per Kineto instance, even if this file is evaluated twice.
  Object.defineProperty(Kineto, Symbol.for('kineto.defaultEntryNoticed'), { value: true });
  const wrapped = ['config', 'scan'];
  const originals = Object.fromEntries(wrapped.map((name) => [name, Kineto[name]]));
  const trySend = () => {
    const event = Kineto.diagnostics.emit(NOTICE);
    // The hub keeps an event in its history only when diagnostics are on.
    if (!Kineto.diagnostics.history.includes(event)) return;
    wrapped.forEach((name) => { Kineto[name] = originals[name]; });
  };
  wrapped.forEach((name) => {
    Kineto[name] = function kinetoDefaultEntryNotice(...args) {
      const result = originals[name].apply(this, args);
      trySend();
      return result;
    };
  });
}

export * from './index.js';
export default Kineto;
