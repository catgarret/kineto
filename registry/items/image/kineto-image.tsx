'use client';

// KinetoImage — an <img> that loads lazily with a Kineto reveal (or a
// permanent stylized filter) instead of a static Skeleton box.
//   <KinetoImage src="/hero.webp" alt="" preset="skeleton" />
//   <KinetoImage src="/cover.webp" alt="" preset="dither" cellSize={8} ditherType="4x4" paperColor="#f1ede2" inkColor="#ff4a1c" />
//   <KinetoImage src="/portrait.webp" alt="" preset="ascii" persist />
// Drop-in for a plain <img>; the wrapper Kineto creates is removed on unmount.
import { forwardRef, useEffect, useRef, type ImgHTMLAttributes } from 'react';
import Kineto from '@dong-gri/kineto';
import { compact } from '@/lib/kineto-utils';

export type KinetoImagePreset =
  | 'fade' | 'blur-up' | 'wave' | 'grain' | 'skeleton' | 'pixelate' | 'print' | 'dissolve'
  | 'flicker' | 'polaroid' | 'crt' | 'data-mosaic' | 'rgb-slice-burst' | 'dither' | 'ascii' | 'halftone';

export interface KinetoImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  preset?: KinetoImagePreset;
  /** Seconds. */
  duration?: number;
  /** Keep the stylized look (dither / ascii / halftone) instead of revealing the original. */
  persist?: boolean;
  cellSize?: number;
  ditherType?: '8x8' | '4x4' | '2x2' | 'random' | 'floyd-steinberg' | 'atkinson';
  halftoneShape?: 'dot' | 'square' | 'line';
  paperColor?: string;
  inkColor?: string;
  accentColor?: string;
  originalColors?: boolean;
  /** `shimmer` (default) or `pulse` for the skeleton preset. */
  skeletonVariant?: 'shimmer' | 'pulse';
  /** Blur radius in px for `blur-up`, `print`, `dissolve`. */
  blur?: number;
}

export const KinetoImage = forwardRef<HTMLImageElement, KinetoImageProps>(function KinetoImage(
  { src, preset = 'skeleton', duration, persist, cellSize, ditherType, halftoneShape, paperColor, inkColor, accentColor, originalColors, skeletonVariant, blur, alt = '', ...props },
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
    Kineto.create('lazy', element, compact({ preset, src, duration, persist, cellSize, ditherType, halftoneShape, paperColor, inkColor, accentColor, originalColors, skeletonVariant, blur }));
    return () => { Kineto.destroyModule(element, 'lazy'); };
  }, [src, preset, duration, persist, cellSize, ditherType, halftoneShape, paperColor, inkColor, accentColor, originalColors, skeletonVariant, blur]);

  // `data-src` keeps the network idle until Kineto decides to load the image.
  return <img ref={setRef} data-src={src} alt={alt} decoding="async" {...props} />;
});

export default KinetoImage;
