// `@dong-gri/kineto/auto` — the core with every module known by name and
// imported on demand. Markup (`data-kt-*`) works for all modules; for the JS
// API, `await Kineto.loadModules('tilt')` before `Kineto.tilt(…)`.
// There are no named factory exports here (they would defeat code splitting);
// type-only exports are re-exported so `import type { … }` keeps working.
import type { KinetoOnDemand } from './index.js';

export type * from './index.js';

declare const Kineto: KinetoOnDemand;
export default Kineto;
