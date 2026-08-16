import assert from 'node:assert/strict';
import createPresence from '../src/presence.js';

const presence = createPresence(null, { accessibility: 'managed' });
assert.equal(presence.ssr, true);
assert.deepEqual(await presence.enter(), { status: 'skipped' });
assert.deepEqual(await presence.leave(), { status: 'skipped' });
assert.equal(presence.status, 'skipped');
assert.equal(presence.destroy().status, 'destroyed');
presence.destroy();

console.log('Presence SSR contract OK.');
