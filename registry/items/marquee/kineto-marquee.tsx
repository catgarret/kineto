'use client';

// KinetoMarquee — seamless logo wall / announcement band.
//   <KinetoMarquee speed={60} pauseOnHover>
//     <img src="/logos/a.svg" alt="A" /> <img src="/logos/b.svg" alt="B" /> …
//   </KinetoMarquee>
// Children are cloned by Kineto to fill the track; keep them presentational.
import { forwardRef, type ElementType, type ReactNode } from 'react';
import { Motion, type MotionHandle } from '@dong-gri/kineto/react';
import { compact } from '@/lib/kineto-utils';

export interface KinetoMarqueeProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  as?: ElementType;
  direction?: 'left' | 'right';
  /** Pixels per second. */
  speed?: number;
  pauseOnHover?: boolean;
  /** Flip direction when the page scrolls up. */
  reverseOnScrollUp?: boolean;
  /** Fade the track edges (px). */
  fade?: number;
  children?: ReactNode;
}

export const KinetoMarquee = forwardRef<MotionHandle, KinetoMarqueeProps>(function KinetoMarquee(
  { as = 'div', direction, speed, pauseOnHover, reverseOnScrollUp, fade, children, ...props },
  ref
) {
  const options = compact({ direction, speed, pauseOnHover, reverseOnScrollUp, fade });
  return (
    <Motion ref={ref} as={as} type="marquee" options={options} dependencies={[direction, speed, pauseOnHover, reverseOnScrollUp, fade]} {...props}>
      {children}
    </Motion>
  );
});

export default KinetoMarquee;
