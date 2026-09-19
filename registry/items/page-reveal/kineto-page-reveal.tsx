'use client';

// KinetoPageReveal — first-paint overlay (curtain, iris, blinds …) that opens
// once the page is ready. Mount it once, e.g. in the root layout next to
// <KinetoProvider>. It renders nothing; the overlay is created on <body>.
//   <KinetoPageReveal preset="curtain" color="#0a0908" />
// SPA routers own navigation, so this only plays on the initial load; use
// KinetoPresence for route content transitions.
import { useEffect } from 'react';
import Kineto from '@dong-gri/kineto';
import { compact } from '@/lib/kineto-utils';

export type KinetoPageRevealPreset =
  | 'curtain' | 'split' | 'blinds' | 'diagonal' | 'shutter' | 'fade' | 'zoom' | 'iris' | 'flash'
  | 'center-slit' | 'data-mosaic' | 'curve' | 'dissolve' | 'push' | 'grid' | 'fold';

export interface KinetoPageRevealProps {
  preset?: KinetoPageRevealPreset;
  color?: string;
  color2?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Seconds. */
  duration?: number;
  /** Seconds. */
  delay?: number;
}

export function KinetoPageReveal({ preset = 'curtain', color, color2, direction, duration, delay }: KinetoPageRevealProps) {
  useEffect(() => {
    const body = document.body;
    Kineto.create('pageReveal', body, compact({ preset, color, color2, direction, duration, delay }));
    return () => { Kineto.destroyModule(body, 'pageReveal'); };
  }, [preset, color, color2, direction, duration, delay]);
  return null;
}

export default KinetoPageReveal;
