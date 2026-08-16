import assert from 'node:assert/strict';
import createStates from '../src/states.js';

const controller = createStates({
  hidden: { opacity: 0, y: 16, blur: 4 },
  visible: { opacity: 1, y: 0, blur: 0 }
});

assert.deepEqual(controller.stateNames, ['hidden', 'visible']);
assert.deepEqual(await controller.apply('.missing', 'visible'), { status: 'finished' });
assert.deepEqual(await controller.scan(null), { status: 'finished' });
assert.deepEqual(await controller.replay(), { status: 'finished' });
assert.throws(() => createStates({}), /at least one named state/);
assert.throws(() => createStates({ visible: null }), /state values must be objects/);
controller.destroy().destroy();

console.log('Motion States SSR contract OK.');
