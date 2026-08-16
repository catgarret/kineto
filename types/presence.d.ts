export type {
  KinetoOptions,
  KinetoPresenceController,
  KinetoPresenceOptions,
  KinetoPresenceResult,
  KinetoPresenceStatus,
  KinetoTarget
} from './index.js';

import type { KinetoPresenceController, KinetoPresenceOptions, KinetoTarget } from './index.js';

declare function presence(target: KinetoTarget, options?: KinetoPresenceOptions): KinetoPresenceController;

export { presence };
export default presence;
