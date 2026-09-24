export type KinetoTarget = string | Element | Document | Iterable<Element> | ArrayLike<Element>;
export type KinetoOptions = Record<string, unknown>;

export type ModuleName =
  | 'ambientMedia' | 'blurText' | 'brushReveal' | 'cardGlow' | 'counter' | 'dateTime'
  | 'cssScroll' | 'cursor' | 'fullpage' | 'glitch' | 'lazy' | 'stylize' | 'lightbox'
  | 'loader' | 'loadingIndicator' | 'magnetic' | 'marquee' | 'mouseParallax'
  | 'overflowText' | 'pageReveal' | 'pageTransition' | 'parallax' | 'progress'
  | 'reveal' | 'radial' | 'ripple' | 'scrollSequence' | 'scrollVelocity'
  | 'slider' | 'stickyStack' | 'textFill' | 'textReveal' | 'textSplit'
  | 'textTransition' | 'tilt' | 'typewriter' | 'vibrate' | 'confetti'
  | 'accordion' | 'hold' | 'megaMenu' | 'toast' | 'bottomSheet' | 'tabs'
  | 'coverReveal' | 'gesture' | 'drag' | 'tooltip' | 'switch' | 'flip'
  | 'scrollShadows' | 'stickyHeader' | 'horizontalScroll' | 'squircle' | 'canvasEffect';

export interface KinetoInstance {
  el: Element;
  sourceEl: Element;
  type: string;
  options: KinetoOptions;
  pause(): void;
  resume(): void;
  destroy(): void;
  replay?(): void;
  /**
   * Apply an option change to the running instance. Return `false` for a patch
   * this module cannot apply without rebuilding — `updateModule()` then
   * recreates the instance instead, which is a normal outcome, not an error.
   */
  update?(patch: KinetoOptions, mergedOptions?: KinetoOptions): boolean | void;
  [key: string]: unknown;
}

export interface KinetoModule {
  create(element: Element, options: KinetoOptions, kineto: KinetoStatic): KinetoInstance | null | undefined;
  reduced?(element: Element, options: KinetoOptions, kineto: KinetoStatic): KinetoInstance | null | undefined;
  reducedMotion?(element: Element, options: KinetoOptions, kineto: KinetoStatic): KinetoInstance | null | undefined;
  fallback?(element: Element, options: KinetoOptions, kineto: KinetoStatic): KinetoInstance | null | undefined;
}

export type KinetoResult = KinetoInstance | KinetoInstance[] | null;

/** What a Canvas Effect is handed every call (see docs/modules/canvas-effect.md). */
export interface KinetoCanvasEffectApi<Options extends Record<string, unknown> = Record<string, unknown>, State = any> {
  el: Element;
  canvas: HTMLCanvasElement;
  context: '2d' | 'webgl' | 'webgl2';
  /** The 2D context, or the WebGL context for a WebGL effect. */
  ctx: CanvasRenderingContext2D | WebGLRenderingContext | WebGL2RenderingContext | null;
  /** The WebGL context (null for a 2D effect). */
  gl: WebGLRenderingContext | WebGL2RenderingContext | null;
  /** Only the options the definition declares, coerced to their defaults' types. */
  options: Options;
  /** The effect's own data; setup()'s return value lands here. */
  state: State;
  /** CSS px. */
  width: number;
  height: number;
  /** The capped pixel ratio the backing store is drawn at. */
  dpr: number;
  /** Seconds since start (stops while paused), the last step in seconds, and a frame count. */
  time: number;
  delta: number;
  frame: number;
  pointer: { x: number; y: number; nx: number; ny: number; vx: number; vy: number; inside: boolean; down: boolean; active: boolean };
  scroll: { progress: number; velocity: number };
  quality: 'low' | 'medium' | 'high';
  /** True when only one still frame is drawn. */
  reducedMotion: boolean;
  /** A CSS colour (or var(--token)) as [r, g, b, a] in 0…1, or null. */
  color(value: string | number[]): number[] | null;
  /** Ask for frames again after frame() returned false. */
  wake(): void;
}

/** A Canvas Effect: plain functions, or a fragment shader the host runs. */
export interface KinetoCanvasEffectDefinition<Options extends Record<string, unknown> = Record<string, unknown>, State = any> {
  context?: '2d' | 'webgl' | 'webgl2';
  /** Every option the effect reads, with its default. */
  options?: Options;
  setup?(api: KinetoCanvasEffectApi<Options, State>): State | void;
  resize?(api: KinetoCanvasEffectApi<Options, State>): void;
  /** Return false when nothing moves: the loop rests until input wakes it. */
  frame?(api: KinetoCanvasEffectApi<Options, State>): boolean | void;
  destroy?(api: KinetoCanvasEffectApi<Options, State>): void;
  /** WebGL1 GLSL; the host compiles it and fills uTime, uResolution, uPointer, uPointerDown, uScroll and one uniform per option. */
  fragment?: string;
  /** Extra uniforms for a fragment shader, every frame. */
  uniforms?(api: KinetoCanvasEffectApi<Options, State>): Record<string, number | boolean | string | number[]>;
}

export interface KinetoCanvasEffectDescriptor {
  name: string;
  context: '2d' | 'webgl' | 'webgl2';
  shader: boolean;
  options: Record<string, unknown>;
}
export type KinetoFactory = (target: KinetoTarget, options?: KinetoOptions) => KinetoResult;

export interface KinetoEnvironment {
  ssr: boolean;
  mobile: boolean;
  touch: boolean;
  reducedMotion: boolean;
  saveData?: boolean;
  [key: string]: unknown;
}

export type KinetoDiagnosticCode =
  | 'KT_DEBUG'
  | 'KT_INVALID_MODULE'
  | 'KT_UNKNOWN_MODULE'
  | 'KT_CREATE_FAILED'
  | 'KT_NOT_APPLICABLE'
  | 'KT_UPDATE_FAILED'
  | 'KT_DESTROY_FAILED'
  | 'KT_LIFECYCLE_FAILED'
  | 'KT_TRANSFORM_CONFLICT'
  | 'KT_DEPRECATED'
  | 'KT_NATIVE_FALLBACK';

export interface KinetoDiagnostic {
  readonly code: KinetoDiagnosticCode | (string & {});
  readonly module: string;
  readonly phase: 'register' | 'create' | 'update' | 'destroy' | 'replay' | 'runtime';
  readonly recoverable: boolean;
  readonly cause?: unknown;
  readonly detail?: unknown;
  readonly timestamp: number;
}

export interface KinetoDiagnostics {
  create(input: Omit<KinetoDiagnostic, 'timestamp'> & { timestamp?: number }): KinetoDiagnostic;
  emit(input: Omit<KinetoDiagnostic, 'timestamp'> & { timestamp?: number }): KinetoDiagnostic;
  subscribe(listener: (event: KinetoDiagnostic) => void): () => boolean;
  clear(): void;
  readonly history: KinetoDiagnostic[];
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

export type KinetoPresenceStatus = 'idle' | 'entering' | 'leaving' | 'finished' | 'skipped' | 'error' | 'destroyed';
/** Receives every status change; `result` is set when a run settled and `null` for transitions. */
export type KinetoPresenceListener = (status: KinetoPresenceStatus, result: KinetoPresenceResult | null) => void;
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
  parent?: KinetoPresenceController;
  propagate?: boolean;
}
export interface KinetoPresenceController {
  enter(options?: KinetoOptions): Promise<KinetoPresenceResult> & { cancel(): void };
  leave(options?: KinetoOptions): Promise<KinetoPresenceResult> & { cancel(): void };
  cancel(reason?: string): this;
  registerChild(child: KinetoPresenceController): () => void;
  safeToRemove(callback?: (element: Element | null, result: KinetoPresenceResult) => void): this;
  /** Observe status changes from every run, including runs a propagating parent starts. Returns an unsubscribe function. */
  subscribe(listener: KinetoPresenceListener): () => void;
  destroy(): this;
  readonly status: KinetoPresenceStatus;
  readonly ssr: boolean;
  readonly childCount: number;
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
  readonly diagnostics: KinetoDiagnostics;
  readonly diagnosticCodes: Readonly<Record<string, KinetoDiagnosticCode>>;
  core: Record<string, (...args: any[]) => unknown>;
  config(options?: KinetoOptions): this;
  /** 'always' / true: reduced motion everywhere · 'never' / false: full motion · 'user' / 'system': follow the OS setting. */
  setReducedMotion(policy: 'always' | 'never' | 'user' | 'system' | boolean): this;
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
  /**
   * Watch a root for markup added or removed after the first scan (React/Vue
   * renders, UI-library portals and modals). Added subtrees are scanned;
   * instances whose element left the document are destroyed.
   */
  observe(root?: ParentNode | Element | string | null, options?: KinetoObserveOptions): KinetoObserverHandle;
  getInstance(target: KinetoTarget, name?: string): KinetoInstance | KinetoInstance[] | null;
  /**
   * Change an instance's options. Returns true when at least one instance took
   * the change in place; false when it had to be recreated to apply it.
   */
  updateModule(target: KinetoTarget, name: string, patch?: KinetoOptions): boolean;
  destroyModule(target: KinetoTarget, name: string): this;
  replay(target: KinetoTarget, name: string, options?: KinetoOptions): KinetoResult;
  destroy(target?: KinetoTarget): this;
  pause(): this;
  resume(): this;
  refresh(): this;
  states(definitions: KinetoStateDefinitions, options?: KinetoOptions): KinetoStateController;
  listTerminalFramePresets(): unknown;
  /** Register a Canvas Effect under a name markup can use (`data-kt-canvas-effect="name"`). */
  defineCanvasEffect<Options extends Record<string, unknown>>(name: string, definition: KinetoCanvasEffectDefinition<Options>): string;
  /** Every registered Canvas Effect, with the options it reads. */
  listCanvasEffects(): KinetoCanvasEffectDescriptor[];
}

export interface KinetoObserveOptions {
  /** Scan the root immediately (default true). */
  scan?: boolean;
  /** Also react when a `data-kt-*` attribute is added to an existing element (default false). */
  attributes?: boolean;
}

export interface KinetoObserverHandle {
  root: ParentNode | Element | null;
  active: boolean;
  /** Stop watching. Existing instances stay alive. */
  disconnect(): void;
}

declare const Kineto: KinetoStatic & Record<ModuleName, KinetoFactory>;
export default Kineto;

export const modules: Record<ModuleName, KinetoModule>;
export function listTerminalFramePresets(): unknown;
export function states(definitions: KinetoStateDefinitions, options?: KinetoOptions): KinetoStateController;
export function defineCanvasEffect<Options extends Record<string, unknown>>(name: string, definition: KinetoCanvasEffectDefinition<Options>): string;
export function listCanvasEffects(): KinetoCanvasEffectDescriptor[];

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
export const stylize: KinetoFactory;
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
export const squircle: KinetoFactory;
export const canvasEffect: KinetoFactory;
