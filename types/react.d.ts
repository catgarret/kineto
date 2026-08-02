import type { ElementType, ForwardRefExoticComponent, HTMLAttributes, ReactNode, RefAttributes, RefObject } from 'react';
import type { KinetoInstance, KinetoOptions } from './index.js';
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
export { Kineto };
export default Motion;
