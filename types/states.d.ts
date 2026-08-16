export type {
  KinetoOptions,
  KinetoStateController,
  KinetoStateDefinitions,
  KinetoTarget
} from './index.js';

import type { KinetoOptions, KinetoStateController, KinetoStateDefinitions } from './index.js';

declare function states(
  definitions: KinetoStateDefinitions,
  options?: KinetoOptions
): KinetoStateController;

export { states };
export default states;
