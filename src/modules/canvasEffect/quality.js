// Canvas Effect — quality tiers: how hard an effect may push the device.
//
//   maxDpr  caps the backing-store pixel ratio. A 3× phone drawing at 3× pays
//           nine times the pixels of 1×, and most effects look the same at 1.5–2×.
//   fps     caps the frame rate (0 = the display's own rate).
//
// Both can still be set per instance (`maxDpr`, `fps` options); the tier is
// only the default.
export const QUALITY_TIERS = Object.freeze({
  low: Object.freeze({ maxDpr: 1, fps: 30 }),
  medium: Object.freeze({ maxDpr: 1.5, fps: 60 }),
  high: Object.freeze({ maxDpr: 2, fps: 0 })
});

/**
 * 'auto' (or anything that is not a tier name) picks from what the device says:
 * Kineto.performance 'low' (data saver, a slow link) → low; a mid-range device
 * or a touch screen → medium; everything else → high.
 * @param {string} requested
 * @param {{ performance: string, touch: boolean }} device
 */
export function resolveQuality(requested, { performance, touch }) {
  if (Object.prototype.hasOwnProperty.call(QUALITY_TIERS, requested)) return requested;
  if (performance === 'low') return 'low';
  if (performance === 'mid' || touch) return 'medium';
  return 'high';
}
