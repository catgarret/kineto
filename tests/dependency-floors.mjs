import assert from 'node:assert/strict';

// These manifest guards accept only the repository's existing stable caret or
// exact form. Broader npm range syntax needs an explicit policy review.
const stableVersion = /^(\^?)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function assertDependencyFloor(actual, minimum, label = 'dependency') {
  const floor = stableVersion.exec(minimum);
  assert.ok(floor, `invalid dependency floor ${minimum}`);
  const message = `${label} must retain the ${minimum} range form and supported major, with no lower minimum; major changes require compatibility review`;
  assert.equal(typeof actual, 'string', message);
  const candidate = stableVersion.exec(actual);
  assert.ok(candidate, message);
  assert.equal(candidate[1], floor[1], message);
  const [major, minor, patch] = candidate.slice(2).map(Number);
  const [floorMajor, floorMinor, floorPatch] = floor.slice(2).map(Number);
  assert.ok([major, minor, patch].every(Number.isSafeInteger), message);
  assert.equal(major, floorMajor, message);
  assert.ok(minor > floorMinor || (minor === floorMinor && patch >= floorPatch), message);
}
