'use client';

// KinetoCounter — animated numbers for KPI tiles and hero stats.
//   <KinetoCounter to={128000} format="," />                 // slot reels
//   <KinetoCounter preset="pop" to={98760} format="," />      // final digits land one by one
//   <KinetoCounter preset="plain" to={4.9} decimals={1} />
// Render the final value as children so the number is readable before
// JavaScript runs (and for crawlers); Kineto animates from `from` to `to`.
import { forwardRef, type ElementType, type ReactNode } from 'react';
import { Motion, type MotionHandle } from '@dong-gri/kineto/react';
import { compact } from '@/lib/kineto-utils';

export type KinetoCounterPreset = 'slot' | 'plain' | 'digit' | 'pop' | 'flip';

export interface KinetoCounterProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  as?: ElementType;
  preset?: KinetoCounterPreset;
  from?: number;
  to: number;
  /** Thousands separator, e.g. `","`. */
  format?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Seconds. */
  duration?: number;
  /** Count only the first time the element enters the viewport (default true). */
  once?: boolean;
  children?: ReactNode;
}

export const KinetoCounter = forwardRef<MotionHandle, KinetoCounterProps>(function KinetoCounter(
  { as = 'span', preset = 'slot', from, to, format, decimals, prefix, suffix, duration, once = true, children, ...props },
  ref
) {
  const options = compact({ preset, from, to, format, decimals, prefix, suffix, duration, once });
  return (
    <Motion ref={ref} as={as} type="counter" options={options} dependencies={[preset, from, to, format, decimals, prefix, suffix, duration, once]} {...props}>
      {children ?? to}
    </Motion>
  );
});

export default KinetoCounter;
