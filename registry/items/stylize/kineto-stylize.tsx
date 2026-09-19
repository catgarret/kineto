'use client';

// KinetoStylize — draws an <img> or <video> as dither, ASCII or halftone on a
// canvas layer. This is a filter, not a loading effect: by default the look
// stays for the media's whole life. For lazy loading use KinetoImage; both can
// sit on one element, and the wrapper is shared.
//   <KinetoStylize src="/cover.webp" alt="" effect="dither" cellSize={8} ditherType="4x4" />
//   <KinetoStylize src="/portrait.webp" alt="" effect="ascii" paperColor="#0b1220" inkColor="#7cf29a" />
//   <KinetoStylize src="/hero.webp" alt="" effect="dither" mode="reveal" trigger="view" />
//   <KinetoStylize as="video" src="/clip.mp4" effect="halftone" muted loop playsInline autoPlay />
// The original element is never hidden, so a source the canvas cannot read back
// (cross-origin without CORS) simply shows as-is.
import { forwardRef, useEffect, useRef, type ImgHTMLAttributes, type VideoHTMLAttributes } from 'react';
import Kineto from '@dong-gri/kineto';
import { compact } from '@/lib/kineto-utils';

export type KinetoStylizeEffect = 'dither' | 'ascii' | 'halftone';

interface KinetoStylizeOwnProps {
  src: string;
  /** Which look to draw. */
  effect?: KinetoStylizeEffect;
  /** `persist` (default) keeps the look; `reveal` plays it once into the original. */
  mode?: 'persist' | 'reveal';
  /** When a reveal starts. Ignored when the look persists. */
  trigger?: 'load' | 'view' | 'manual';
  /** Reveal length in seconds. */
  duration?: number;
  /** Grid cell size in px — smaller means far more cells to draw. */
  cellSize?: number;
  ditherType?: '8x8' | '4x4' | '2x2' | 'random' | 'floyd-steinberg' | 'atkinson';
  halftoneShape?: 'dot' | 'square' | 'line';
  /** Glyph ramp from the darkest to the brightest cell. */
  asciiChars?: string;
  paperColor?: string;
  inkColor?: string;
  accentColor?: string;
  /** Use the image's own colors, posterized to `colorSteps`, instead of paper/ink. */
  originalColors?: boolean;
  colorSteps?: number;
  inverted?: boolean;
  /** Repaint ceiling per second, and pixel-density ceiling, for heavy sources. */
  renderFps?: number;
  maxDpr?: number;
}

export type KinetoStylizeProps =
  | ({ as?: 'img' } & KinetoStylizeOwnProps & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>)
  | ({ as: 'video' } & KinetoStylizeOwnProps & Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'>);

export const KinetoStylize = forwardRef<HTMLImageElement | HTMLVideoElement, KinetoStylizeProps>(
  function KinetoStylize(props, forwardedRef) {
    const {
      as = 'img', src, effect = 'dither', mode, trigger, duration, cellSize, ditherType, halftoneShape,
      asciiChars, paperColor, inkColor, accentColor, originalColors, colorSteps, inverted, renderFps, maxDpr,
      ...rest
    } = props as { as?: 'img' | 'video' } & KinetoStylizeOwnProps & Record<string, unknown>;

    const localRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
    const setRef = (node: HTMLImageElement | HTMLVideoElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    useEffect(() => {
      const element = localRef.current;
      if (!element) return undefined;
      Kineto.create('stylize', element, compact({
        effect, mode, trigger, duration, cellSize, ditherType, halftoneShape, asciiChars,
        paperColor, inkColor, accentColor, originalColors, colorSteps, inverted, renderFps, maxDpr
      }));
      return () => { Kineto.destroyModule(element, 'stylize'); };
    }, [effect, mode, trigger, duration, cellSize, ditherType, halftoneShape, asciiChars,
      paperColor, inkColor, accentColor, originalColors, colorSteps, inverted, renderFps, maxDpr]);

    // Stylize does not load anything, so the source is a real `src` attribute.
    return as === 'video'
      ? <video ref={setRef as (node: HTMLVideoElement | null) => void} src={src} {...(rest as VideoHTMLAttributes<HTMLVideoElement>)} />
      : <img ref={setRef as (node: HTMLImageElement | null) => void} src={src} decoding="async" alt={(rest as { alt?: string }).alt ?? ''} {...(rest as ImgHTMLAttributes<HTMLImageElement>)} />;
  }
);

export default KinetoStylize;
