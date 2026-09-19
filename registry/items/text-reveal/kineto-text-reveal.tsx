'use client';

// KinetoTextReveal — headline entrance where characters resolve into place.
//   <KinetoTextReveal as="h1" preset="stream">Launch week</KinetoTextReveal>
//   <KinetoTextReveal preset="hangul">안녕하세요</KinetoTextReveal>   // Korean jamo assembly
// The text content is read from the element, so the children must be plain text.
import { forwardRef, type ElementType } from 'react';
import { Motion, type MotionHandle } from '@dong-gri/kineto/react';
import { compact } from '@/lib/kineto-utils';

export type KinetoTextRevealPreset = 'stream' | 'char' | 'word' | 'line' | 'bounce' | 'hangul' | 'decode' | 'flicker' | 'shuffle';

export interface KinetoTextRevealProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  as?: ElementType;
  preset?: KinetoTextRevealPreset;
  /** Milliseconds per character for the streaming presets. */
  speed?: number;
  /** Seconds between characters/words for the staggered presets. */
  stagger?: number;
  /** Seconds. */
  duration?: number;
  /** Seconds. */
  delay?: number;
  /** Replay every time the element re-enters the viewport. */
  loop?: boolean;
  children: string;
}

export const KinetoTextReveal = forwardRef<MotionHandle, KinetoTextRevealProps>(function KinetoTextReveal(
  { as = 'h1', preset = 'stream', speed, stagger, duration, delay, loop, children, ...props },
  ref
) {
  const options = compact({ preset, speed, stagger, duration, delay, loop });
  return (
    <Motion ref={ref} as={as} type="textReveal" options={options} dependencies={[preset, speed, stagger, duration, delay, loop, children]} {...props}>
      {children}
    </Motion>
  );
});

export default KinetoTextReveal;
