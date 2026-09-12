import assert from 'node:assert/strict';

// Version comments are informational. Validate the complete uses value so a
// tag, shortened SHA, or SHA with an extra suffix cannot masquerade as a pin.
export function assertPinnedAction(source, action) {
  const references = [...source.matchAll(/^[ \t]*(?:-[ \t]+)?uses:[ \t]*([^\r\n]+)/gm)]
    .map(([, value]) => value.replace(/[ \t]+#.*$/, '').trim())
    .map((value) => value.replace(/^(['"])(.*)\1$/, '$2'))
    .filter((value) => value === action || value.startsWith(`${action}@`));
  assert.ok(references.length > 0, `missing workflow action ${action}`);
  for (const reference of references) {
    const revision = reference.slice(action.length + 1);
    assert.match(revision, /^[0-9a-f]{40}$/, `${action} must use an immutable full commit SHA`);
  }
}
