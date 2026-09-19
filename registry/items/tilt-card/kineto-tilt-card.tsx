'use client';

// KinetoTiltCard — pointer-following 3D tilt (with glare) or a pointer glow.
//   <KinetoTiltCard>…</KinetoTiltCard>                              // tilt + glare
//   <KinetoTiltCard effect="glow" glow="border">…</KinetoTiltCard>  // luminous border
// Wrap a shadcn <Card> (or any block) — the wrapper is the element that tilts.
// Tilt writes `transform`; do not combine it with other transform effects
// (magnetic, gesture) on the same element.
import { forwardRef, type ElementType, type ReactNode } from 'react';
import { Motion, type MotionHandle } from '@dong-gri/kineto/react';
import { compact } from '@/lib/kineto-utils';

export interface KinetoTiltCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  as?: ElementType;
  /** `tilt` (default) uses the tilt module; `glow` uses the cardGlow module. */
  effect?: 'tilt' | 'glow';
  /** Max tilt angle in degrees. */
  max?: number;
  /** Show the moving glare highlight (tilt). */
  glare?: boolean;
  /** Scale while hovered (tilt). */
  scale?: number;
  /** Glow preset when `effect="glow"`. */
  glow?: 'spotlight' | 'edge' | 'border' | 'comet' | 'aurora' | 'shine';
  /** Glow colour, e.g. `#7c4dff`. */
  color?: string;
  children?: ReactNode;
}

export const KinetoTiltCard = forwardRef<MotionHandle, KinetoTiltCardProps>(function KinetoTiltCard(
  { as = 'div', effect = 'tilt', max, glare = true, scale, glow = 'spotlight', color, children, ...props },
  ref
) {
  const type = effect === 'glow' ? 'cardGlow' : 'tilt';
  const options = effect === 'glow'
    ? compact({ preset: glow, color })
    : compact({ preset: glare ? 'tilt-glare' : 'tilt', max, scale });
  return (
    <Motion ref={ref} as={as} type={type} options={options} dependencies={[effect, max, glare, scale, glow, color]} {...props}>
      {children}
    </Motion>
  );
});

export default KinetoTiltCard;
