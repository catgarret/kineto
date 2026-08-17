import type { App, DefineComponent, Directive, Ref, WatchSource } from 'vue';
import type { KinetoInstance, KinetoOptions, KinetoPresenceController, KinetoPresenceOptions, KinetoPresenceResult, KinetoPresenceStatus } from './index.js';
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
export function useKinetoPresence(
  present?: boolean | Ref<boolean> | (() => boolean),
  options?: KinetoPresenceOptions & { enterOptions?: KinetoOptions; exitOptions?: KinetoOptions; onResult?: (result: KinetoPresenceResult) => void },
  watchSources?: WatchSource[]
): { element: Ref<HTMLElement | null>; controller: Ref<KinetoPresenceController | null>; status: Ref<KinetoPresenceStatus>; result: Ref<KinetoPresenceResult | null>; replay(): void };
export const KinetoPresence: DefineComponent<{
  as?: string | object;
  present?: boolean;
  options?: KinetoPresenceOptions;
  watchSources?: WatchSource[];
}>;
export function install(app: App): void;
export { Kineto };
declare const plugin: { install: typeof install };
export default plugin;
