'use client';

// KinetoReveal — viewport entrance for a section, card or list.
//   <KinetoReveal preset="fade-up" once>…</KinetoReveal>
//   <KinetoReveal as="ul" preset="slide-up" stagger={0.08}>…</KinetoReveal>
// A typed wrapper over `Motion` from the React adapter: the instance is created
// on mount and replaced only when a motion prop changes.
import { forwardRef, type ElementType, type ReactNode } from 'react';
import { Motion, type MotionHandle } from '@dong-gri/kineto/react';
import { compact } from '@/lib/kineto-utils';

export type KinetoRevealPreset =
  | 'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right'
  | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
  | 'zoom-in' | 'zoom-out' | 'blur' | 'rise' | 'soft' | 'flip-x' | 'flip-y'
  | 'rotate' | 'mask' | 'wipe' | 'class' | 'clock' | 'swing' | 'skew';

export interface KinetoRevealProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  as?: ElementType;
  preset?: KinetoRevealPreset;
  /** Seconds. */
  duration?: number;
  /** Seconds. */
  delay?: number;
  /** Seconds between children when the element is a list/grid. */
  stagger?: number;
  /** Named easing (`'cubic-out'`, `'spring'`) or a cubic-bezier string. */
  ease?: string;
  /** Play once (default) or every time the element re-enters the viewport. */
  once?: boolean;
  /** Direction for `mask` / `wipe` presets. */
  direction?: 'up' | 'down' | 'left' | 'right';
  children?: ReactNode;
}

export const KinetoReveal = forwardRef<MotionHandle, KinetoRevealProps>(function KinetoReveal(
  { as = 'div', preset = 'fade-up', duration, delay, stagger, ease, once = true, direction, children, ...props },
  ref
) {
  const options = compact({ preset, duration, delay, stagger, ease, once, direction });
  return (
    <Motion ref={ref} as={as} type="reveal" options={options} dependencies={[preset, duration, delay, stagger, ease, once, direction]} {...props}>
      {children}
    </Motion>
  );
});

export default KinetoReveal;
