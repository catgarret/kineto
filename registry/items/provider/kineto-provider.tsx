'use client';

// KinetoProvider — mount once in the root layout (Next.js App Router, Vite,
// Remix …). It loads Kineto's stylesheet and starts `Kineto.observe()`, so any
// element that reaches the DOM with a `data-kt-*` attribute — shadcn Cards,
// Radix portals, dialogs, lists rendered later — is animated automatically and
// cleaned up when it unmounts. Nothing else is required in child components.
import { useEffect, type ReactNode } from 'react';
import Kineto from '@dong-gri/kineto';
import '@dong-gri/kineto/style.css';

export interface KinetoProviderProps {
  children?: ReactNode;
  /** Passed to `Kineto.config()` before observing (smooth scroll, performance tier, debug …). */
  config?: Parameters<typeof Kineto.config>[0];
  /** Also react when a `data-kt-*` attribute is added to an existing element (default false). */
  watchAttributes?: boolean;
}

export function KinetoProvider({ children, config, watchAttributes = false }: KinetoProviderProps) {
  useEffect(() => {
    if (config) Kineto.config(config);
    const handle = Kineto.observe(document, { attributes: watchAttributes });
    return () => handle.disconnect();
    // `config` is applied once at mount; pass a new key to remount if it must change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchAttributes]);
  return <>{children}</>;
}

export default KinetoProvider;
