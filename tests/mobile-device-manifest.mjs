import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const doc = fs.readFileSync(path.join(root, 'docs/browser-device-qa.md'), 'utf8');
for (const token of ['iPhone Safari', 'Android Chrome', '미실행', 'screen-recording', 'browser-qa-history.md']) {
  assert.ok(doc.includes(token), `device QA runbook is missing: ${token}`);
}
assert.match(doc, /실제\s+iOS\/Android 성공으로 표기하지 않습니다/);
assert.match(doc, /docs\/qa-evidence\/<YYYY-MM-DD>\/<device>\//);
assert.match(doc, /한 번의 wheel\/touch 이동/);
console.log('mobile-device-manifest OK — physical-device evidence template and emulation boundary are explicit.');
