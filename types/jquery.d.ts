import type { KinetoOptions } from './index.js';
import Kineto from './index.js';

declare global {
  interface JQuery {
    kineto(type: string, options?: KinetoOptions): this;
    destroyKineto(type?: string): this;
  }
}

export function installKineto<T>(jquery: T): T;
export { Kineto };
export default installKineto;
