import createStates from './states.js';

// Standalone modular entry. Consumers that already import `@dong-gri/kineto/core`
// can opt into the visual state controller without pulling in the full module
// registry. The full package keeps its Kineto-bound named export in src/index.js.
export const states = (definitions, options = {}) => createStates(definitions, options);
export default states;
