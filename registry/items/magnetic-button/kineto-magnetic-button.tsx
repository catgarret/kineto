'use client';

// KinetoMagneticButton — a button that leans toward the pointer and springs
// back, with an optional click ripple. Renders a plain <button>; pass `as` to
// use another element (an <a>, a shadcn <Button> …).
//   <KinetoMagneticButton className="btn">Get started</KinetoMagneticButton>
//   <KinetoMagneticButton as={Button} ripple={false} strength={0.4}>Buy</KinetoMagneticButton>
// The magnetic pull writes `transform`, so the component never also applies
// gesture/tilt to the same element; the ripple is drawn in its own layer.
import { forwardRef, useEffect, useRef, type ElementType, type ReactNode } from 'react';
import Kineto from '@dong-gri/kineto';
import { compact } from '@/lib/kineto-utils';

export interface KinetoMagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: ElementType;
  /** 0–1: how far the element follows the pointer (default 0.3). */
  strength?: number;
  /** Pointer distance in px that starts the pull. */
  radius?: number;
  /** Add a Material-style click ripple (default true). Turn off with MUI/Vuetify/PrimeVue buttons, which ripple already. */
  ripple?: boolean;
  children?: ReactNode;
}

export const KinetoMagneticButton = forwardRef<HTMLButtonElement, KinetoMagneticButtonProps>(function KinetoMagneticButton(
  { as: Component = 'button', strength = 0.3, radius, ripple = true, children, ...props },
  forwardedRef
) {
  const localRef = useRef<HTMLButtonElement | null>(null);
  const setRef = (node: HTMLButtonElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  useEffect(() => {
    const element = localRef.current;
    if (!element) return undefined;
    Kineto.create('magnetic', element, compact({ strength, radius }));
    if (ripple) Kineto.create('ripple', element, {});
    return () => {
      Kineto.destroyModule(element, 'magnetic');
      Kineto.destroyModule(element, 'ripple');
    };
  }, [strength, radius, ripple]);

  return <Component ref={setRef} {...props}>{children}</Component>;
});

export default KinetoMagneticButton;
