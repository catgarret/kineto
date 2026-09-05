import type { App, DefineComponent, Directive, Ref, WatchSource } from 'vue';
import type { KinetoInstance, KinetoOptions, KinetoPresenceController, KinetoPresenceOptions, KinetoPresenceResult, KinetoPresenceStatus } from './index.js';
import Kineto from './index.js';

export interface MotionBinding {
  type: string;
  options?: KinetoOptions;
}

export interface KinetoTransitionOptions extends KinetoOptions {
  enterOptions?: KinetoOptions;
  leaveOptions?: KinetoOptions;
}

export interface KinetoTransitionHooks {
  onBeforeEnter(el: Element): void;
  onEnter(el: Element, done: () => void): void;
  onAfterEnter(el: Element): void;
  onEnterCancelled(el: Element): void;
  onBeforeLeave(el: Element): void;
  onLeave(el: Element, done: () => void): void;
  onAfterLeave(el: Element): void;
  onLeaveCancelled(el: Element): void;
}

export type KinetoOptionsSource = KinetoOptions | Ref<KinetoOptions> | (() => KinetoOptions);

export const vMotion: Directive<HTMLElement, string | MotionBinding | KinetoOptions>;
export function useKineto(
  type: string,
  options?: KinetoOptionsSource,
  watchSources?: WatchSource[]
): { element: Ref<HTMLElement | null>; instance: Ref<KinetoInstance | null>; replay(): void };
export function useKinetoTransition(
  type: string,
  options?: KinetoTransitionOptions
): KinetoTransitionHooks;
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
export function useKinetoPresenceGroup(
  children?: unknown[],
  options?: KinetoPresenceOptions & { onResult?: (result: KinetoPresenceResult, key: string) => void }
): { items: Ref<readonly { key: string; child: unknown; present: boolean }[]>; sync(children?: unknown[]): void; onResult(key: string, result: KinetoPresenceResult): void };
export const KinetoPresenceGroup: DefineComponent<{
  as?: string | object;
  mode?: 'sync' | 'wait' | 'popLayout';
  options?: KinetoPresenceOptions;
}>;
export function install(app: App): void;
export { Kineto };
declare const plugin: { install: typeof install; KinetoPresence: typeof KinetoPresence; KinetoPresenceGroup: typeof KinetoPresenceGroup };
export default plugin;
