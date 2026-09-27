// CommonJS view of the package (`require('@dong-gri/kineto')`,
// `require('@dong-gri/kineto/all')`): the UMD build, whose module.exports is the
// full-runtime Kineto object. Named ESM exports are not part of the UMD build.
import type { KinetoFactory, KinetoStatic, ModuleName } from './index.js';

declare const Kineto: KinetoStatic & Record<ModuleName, KinetoFactory>;
export = Kineto;
