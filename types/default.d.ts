// `@dong-gri/kineto` — the default entry. In 0.13 it is the full runtime (the
// same file as `@dong-gri/kineto/all`); in 1.0 it becomes the on-demand core
// (`@dong-gri/kineto/auto`). See docs/entry-points.md.
import type { KinetoFactory, KinetoStatic, ModuleName } from './index.js';

export * from './index.js';

/**
 * @deprecated Since 0.13.0 the meaning of the default entry is changing: in 1.0
 * `@dong-gri/kineto` becomes the on-demand core. Pick the behaviour you want now:
 * `@dong-gri/kineto/auto` (modules are imported when markup uses them) or
 * `@dong-gri/kineto/all` (every module up front, as today). docs/entry-points.md
 */
declare const Kineto: KinetoStatic & Record<ModuleName, KinetoFactory>;
export default Kineto;
