import type { App, Directive, Ref, WatchSource } from 'vue';
import type { KinetoInstance, KinetoOptions } from './index.js';
import Kineto from './index.js';

export interface MotionBinding {
  type: string;
  options?: KinetoOptions;
}

export const vMotion: Directive<HTMLElement, string | MotionBinding | KinetoOptions>;
export function useKineto(
  type: string,
  options?: KinetoOptions,
  watchSources?: WatchSource[]
): { element: Ref<HTMLElement | null>; instance: Ref<KinetoInstance | null>; replay(): void };
export function install(app: App): void;
export { Kineto };
declare const plugin: { install: typeof install };
export default plugin;
