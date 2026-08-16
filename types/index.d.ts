export type KinetoTarget = string | Element | Document | Iterable<Element> | ArrayLike<Element>;
export type KinetoOptions = Record<string, unknown>;

export type ModuleName =
  | 'ambientMedia' | 'blurText' | 'brushReveal' | 'cardGlow' | 'counter' | 'dateTime'
  | 'cssScroll' | 'cursor' | 'fullpage' | 'glitch' | 'lazy' | 'lightbox'
  | 'loader' | 'loadingIndicator' | 'magnetic' | 'marquee' | 'mouseParallax'
  | 'overflowText' | 'pageReveal' | 'pageTransition' | 'parallax' | 'progress'
  | 'reveal' | 'radial' | 'ripple' | 'scrollSequence' | 'scrollVelocity'
  | 'slider' | 'stickyStack' | 'textFill' | 'textReveal' | 'textSplit'
  | 'textTransition' | 'tilt' | 'typewriter' | 'vibrate' | 'confetti'
  | 'accordion' | 'hold' | 'megaMenu' | 'toast' | 'bottomSheet' | 'tabs'
  | 'coverReveal' | 'gesture' | 'drag' | 'tooltip' | 'switch' | 'flip'
  | 'scrollShadows' | 'stickyHeader' | 'horizontalScroll';

export interface KinetoInstance {
  el: Element;
  sourceEl: Element;
  type: string;
  options: KinetoOptions;
  pause(): void;
  resume(): void;
  destroy(): void;
  replay?(): void;
  update?(patch: KinetoOptions, mergedOptions?: KinetoOptions): void;
  [key: string]: unknown;
}

export interface KinetoModule {
  create(element: Element, options: KinetoOptions, kineto: KinetoStatic): KinetoInstance | null | undefined;
  reduced?(element: Element, options: KinetoOptions, kineto: KinetoStatic): KinetoInstance | null | undefined;
  reducedMotion?(element: Element, options: KinetoOptions, kineto: KinetoStatic): KinetoInstance | null | undefined;
  fallback?(element: Element, options: KinetoOptions, kineto: KinetoStatic): KinetoInstance | null | undefined;
}

export type KinetoResult = KinetoInstance | KinetoInstance[] | null;
export type KinetoFactory = (target: KinetoTarget, options?: KinetoOptions) => KinetoResult;

export interface KinetoEnvironment {
  ssr: boolean;
  mobile: boolean;
  touch: boolean;
  reducedMotion: boolean;
  saveData?: boolean;
  [key: string]: unknown;
}

export interface KinetoStateController {
  apply(target: KinetoTarget, state: string, options?: KinetoOptions): Promise<{ status: 'finished' | 'cancelled' }> & { cancel(): void };
  replay(target?: KinetoTarget, state?: string, options?: KinetoOptions): Promise<{ status: 'finished' | 'cancelled' }> & { cancel(): void };
  scan(root?: ParentNode | Element | null, options?: KinetoOptions): Promise<{ status: 'finished' | 'cancelled' }>;
  destroy(): this;
  readonly stateNames: string[];
  readonly ssr?: boolean;
}

export interface KinetoStateDefinitions {
  [name: string]: {
    opacity?: number;
    x?: number;
    y?: number;
    scale?: number;
    rotate?: number;
    skewX?: number;
    skewY?: number;
    blur?: number;
    brightness?: number;
    transform?: string;
    filter?: string;
  };
}

export type KinetoPresenceStatus = 'idle' | 'entering' | 'leaving' | 'finished' | 'destroyed';
export type KinetoPresenceResult = {
  status: 'finished' | 'cancelled' | 'skipped' | 'error';
  reason?: string;
  error?: unknown;
};
export interface KinetoPresenceOptions extends KinetoOptions {
  enter?: unknown;
  exit?: unknown;
  mode?: 'sync' | 'wait' | 'popLayout';
  accessibility?: 'visual-only' | 'managed';
  focusTarget?: KinetoTarget | (() => Element | null);
  safeToRemove?: (element: Element | null, result: KinetoPresenceResult) => void;
  reducedMotion?: boolean;
}
export interface KinetoPresenceController {
  enter(options?: KinetoOptions): Promise<KinetoPresenceResult> & { cancel(): void };
  leave(options?: KinetoOptions): Promise<KinetoPresenceResult> & { cancel(): void };
  cancel(reason?: string): this;
  safeToRemove(callback?: (element: Element | null, result: KinetoPresenceResult) => void): this;
  destroy(): this;
  readonly status: KinetoPresenceStatus;
  readonly ssr: boolean;
}

export interface KinetoStatic {
  readonly version: string;
  readonly env: KinetoEnvironment;
  readonly prefersReducedMotion: boolean;
  readonly performance: 'low' | 'medium' | 'high';
  readonly registry: Record<string, KinetoModule>;
  readonly instanceCount: number;
  readonly smoothEnabled: boolean;
  readonly lenis: unknown;
  core: Record<string, (...args: any[]) => unknown>;
  config(options?: KinetoOptions): this;
  setReducedMotion(policy: boolean | 'system'): this;
  setEngineSource(sources?: KinetoOptions): this;
  getEngineSource(): KinetoOptions;
  enableSmooth(options?: KinetoOptions): this;
  disableSmooth(): this;
  toggleSmooth(force?: boolean, options?: KinetoOptions): this;
  scrollTo(target: number | KinetoTarget, options?: KinetoOptions): this;
  register(name: string, module: KinetoModule): this;
  unregister(name: string): this;
  create(name: string, target: KinetoTarget, options?: KinetoOptions): KinetoResult;
  scan(root?: ParentNode | Element | null): this;
  init(root?: ParentNode | Element | null): this;
  initModules(targets: KinetoTarget): this;
  autoInit(root?: ParentNode | Element | null): this;
  getInstance(target: KinetoTarget, name?: string): KinetoInstance | KinetoInstance[] | null;
  updateModule(target: KinetoTarget, name: string, patch?: KinetoOptions): boolean;
  destroyModule(target: KinetoTarget, name: string): this;
  replay(target: KinetoTarget, name: string, options?: KinetoOptions): KinetoResult;
  destroy(target?: KinetoTarget): this;
  pause(): this;
  resume(): this;
  refresh(): this;
  states(definitions: KinetoStateDefinitions, options?: KinetoOptions): KinetoStateController;
  listTerminalFramePresets(): unknown;
}

declare const Kineto: KinetoStatic & Record<ModuleName, KinetoFactory>;
export default Kineto;

export const modules: Record<ModuleName, KinetoModule>;
export function listTerminalFramePresets(): unknown;
export function states(definitions: KinetoStateDefinitions, options?: KinetoOptions): KinetoStateController;

export const ambientMedia: KinetoFactory;
export const blurText: KinetoFactory;
export const brushReveal: KinetoFactory;
export const cardGlow: KinetoFactory;
export const counter: KinetoFactory;
export const dateTime: KinetoFactory;
export const cssScroll: KinetoFactory;
export const cursor: KinetoFactory;
export const fullpage: KinetoFactory;
export const glitch: KinetoFactory;
export const lazy: KinetoFactory;
export const lightbox: KinetoFactory;
export const loader: KinetoFactory;
export const loadingIndicator: KinetoFactory;
export const magnetic: KinetoFactory;
export const marquee: KinetoFactory;
export const mouseParallax: KinetoFactory;
export const overflowText: KinetoFactory;
export const pageReveal: KinetoFactory;
export const pageTransition: KinetoFactory;
export const parallax: KinetoFactory;
export const progress: KinetoFactory;
export const reveal: KinetoFactory;
export const radial: KinetoFactory;
export const ripple: KinetoFactory;
export const scrollSequence: KinetoFactory;
export const scrollVelocity: KinetoFactory;
export const slider: KinetoFactory;
export const stickyStack: KinetoFactory;
export const textFill: KinetoFactory;
export const textReveal: KinetoFactory;
export const textSplit: KinetoFactory;
export const textTransition: KinetoFactory;
export const tilt: KinetoFactory;
export const typewriter: KinetoFactory;
export const vibrate: KinetoFactory;
export const confetti: KinetoFactory;
export const accordion: KinetoFactory;
export const hold: KinetoFactory;
export const megaMenu: KinetoFactory;
export const toast: KinetoFactory;
export const bottomSheet: KinetoFactory;
export const tabs: KinetoFactory;
export const coverReveal: KinetoFactory;
export const gesture: KinetoFactory;
export const drag: KinetoFactory;
export const tooltip: KinetoFactory;
declare const switchApi: KinetoFactory;
export { switchApi as switch };
export const flip: KinetoFactory;
export const scrollShadows: KinetoFactory;
export const stickyHeader: KinetoFactory;
export const horizontalScroll: KinetoFactory;
