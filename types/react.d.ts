import type { ElementType, ForwardRefExoticComponent, HTMLAttributes, ReactNode, RefAttributes, RefObject } from 'react';
import type { KinetoInstance, KinetoOptions, KinetoPresenceController, KinetoPresenceOptions, KinetoPresenceResult, KinetoPresenceStatus } from './index.js';
import Kineto from './index.js';

export interface UseKinetoResult<T extends HTMLElement = HTMLElement> {
  ref: RefObject<T | null>;
  instance: RefObject<KinetoInstance | null>;
}

export function useKineto<T extends HTMLElement = HTMLElement>(
  type: string,
  options?: KinetoOptions,
  dependencies?: readonly unknown[]
): UseKinetoResult<T>;

export interface UseKinetoPresenceResult<T extends HTMLElement = HTMLElement> {
  ref: RefObject<T | null>;
  controller: RefObject<KinetoPresenceController | null>;
  status: KinetoPresenceStatus;
  result: KinetoPresenceResult | null;
}

export function useKinetoPresence<T extends HTMLElement = HTMLElement>(
  present?: boolean,
  options?: KinetoPresenceOptions & { enterOptions?: KinetoOptions; exitOptions?: KinetoOptions; onResult?: (result: KinetoPresenceResult) => void },
  dependencies?: readonly unknown[]
): UseKinetoPresenceResult<T>;

export interface MotionHandle {
  readonly element: HTMLElement | null;
  readonly instance: KinetoInstance | null;
}

export interface MotionProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  type: string;
  options?: KinetoOptions;
  dependencies?: readonly unknown[];
  children?: ReactNode;
}

export const Motion: ForwardRefExoticComponent<MotionProps & RefAttributes<MotionHandle>>;
export interface KinetoPresenceHandle {
  readonly element: HTMLElement | null;
  readonly controller: KinetoPresenceController | null;
  readonly status: KinetoPresenceStatus;
  readonly result: KinetoPresenceResult | null;
}
export interface KinetoPresenceProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  present?: boolean;
  options?: KinetoPresenceOptions & { enterOptions?: KinetoOptions; exitOptions?: KinetoOptions; onResult?: (result: KinetoPresenceResult) => void };
  dependencies?: readonly unknown[];
  children?: ReactNode;
}
export const KinetoPresence: ForwardRefExoticComponent<KinetoPresenceProps & RefAttributes<KinetoPresenceHandle>>;
export { Kineto };
export default Motion;
