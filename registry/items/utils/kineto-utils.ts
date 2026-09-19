// Small helpers shared by the Kineto registry components.
import type { KinetoOptions } from '@dong-gri/kineto';

/**
 * Drop `undefined` entries so an unset prop never overrides a module default
 * (`{ duration: undefined }` would otherwise reach the module as an explicit
 * value in some code paths).
 */
export function compact<T extends KinetoOptions>(options: T): KinetoOptions {
  return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined));
}
