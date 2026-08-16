import createPresence from './presence.js';

// Optional modular entry. Presence is intentionally not part of the default
// registry/full bundle until its Core contract is promoted from prototype.
export const presence = (target, options = {}) => createPresence(target, options);
export default presence;
