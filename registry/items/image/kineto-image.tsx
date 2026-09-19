'use client';

// KinetoImage — an <img> that loads lazily with a Kineto reveal instead of a
// static Skeleton box.
//   <KinetoImage src="/hero.webp" alt="" preset="skeleton" />
//   <KinetoImage src="/cover.webp" alt="" preset="blur-up" blur={22} />
// For a dither / ASCII / halftone texture use KinetoStylize — that is a filter
// on the pixels, not a loading effect. Both can sit on one element.
// Drop-in for a plain <img>; the wrapper Kineto creates is removed on unmount.
import { forwardRef, useEffect, useRef, type ImgHTMLAttributes } from 'react';
import Kineto from '@dong-gri/kineto';
import { compact } from '@/lib/kineto-utils';

export type KinetoImagePreset =
  | 'fade' | 'blur-up' | 'wave' | 'grain' | 'skeleton' | 'pixelate' | 'print' | 'dissolve'
  | 'flicker' | 'polaroid' | 'crt' | 'data-mosaic' | 'rgb-slice-burst';

export interface KinetoImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  preset?: KinetoImagePreset;
  /** Seconds. */
  duration?: number;
  /** Seeded tile layout for `data-mosaic` / `rgb-slice-burst`. */
  seed?: number;
  /** `shimmer` (default) or `pulse` for the skeleton preset. */
  skeletonVariant?: 'shimmer' | 'pulse';
  /** Blur radius in px for `blur-up`, `print`, `dissolve`. */
  blur?: number;
}

export const KinetoImage = forwardRef<HTMLImageElement, KinetoImageProps>(function KinetoImage(
  { src, preset = 'skeleton', duration, seed, skeletonVariant, blur, alt = '', ...props },
  forwardedRef
) {
  const localRef = useRef<HTMLImageElement | null>(null);
  const setRef = (node: HTMLImageElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  useEffect(() => {
    const element = localRef.current;
    if (!element) return undefined;
    Kineto.create('lazy', element, compact({ preset, src, duration, seed, skeletonVariant, blur }));
    return () => { Kineto.destroyModule(element, 'lazy'); };
  }, [src, preset, duration, seed, skeletonVariant, blur]);

  // `data-src` keeps the network idle until Kineto decides to load the image.
  return <img ref={setRef} data-src={src} alt={alt} decoding="async" {...props} />;
});

export default KinetoImage;
