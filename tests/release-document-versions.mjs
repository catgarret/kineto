import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { updateReleaseDocumentVersion } from '../scripts/release-document-versions.mjs';

const root = path.resolve(import.meta.dirname, '..');
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const next = '99.99.99';

for (const relative of ['docs/AI-HANDOFF.md', 'docs/QA_REPORT.md']) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const output = updateReleaseDocumentVersion(relative, source, version, next);
  assert.notEqual(output, source, `${relative} must update its current source labels`);
  assert.equal(fs.readFileSync(path.join(root, relative), 'utf8'), source,
    'pure release-document fixtures must not modify the working tree');
  assert.throws(() => updateReleaseDocumentVersion(relative, source, '0.0.0', next),
    /is not 0\.0\.0/, 'an unexpected source version must fail instead of relabeling evidence');
  if (relative.endsWith('AI-HANDOFF.md')) {
    assert.ok(output.includes(`- Current source version: \`${next}\``));
    const published = source.match(/^- Latest published npm version[^\n]+/m)?.[0];
    assert.ok(published && output.includes(published), 'preparing source must preserve last verified npm publication');
    const expected = source.replace(`- Current source version: \`${version}\``, `- Current source version: \`${next}\``);
    assert.equal(output, expected, 'handoff publication and historical evidence must be byte-preserved');
  } else {
    assert.ok(output.startsWith(`# Kineto v${next} QA Report`));
    assert.ok(output.includes(`대상: v${next} 릴리스 후보 소스`));
    assert.ok(output.includes(`\`@dong-gri/kineto\`, 버전은 \`${next}\`입니다.`));
    const evidence = source.slice(source.indexOf('## 배포 후 확인'));
    assert.ok(output.endsWith(evidence), 'existing release runs, dates, hashes, and live checks must be byte-preserved');
  }
}

const sampleHandoff = '- Current source version: `1.2.3`\n- Latest published npm version: `1.2.3`\n- v1.2.3 Release 12345 passed.\n';
assert.equal(updateReleaseDocumentVersion('docs/AI-HANDOFF.md', sampleHandoff, '1.2.3', '1.2.4'),
  '- Current source version: `1.2.4`\n- Latest published npm version: `1.2.3`\n- v1.2.3 Release 12345 passed.\n');
assert.throws(() => updateReleaseDocumentVersion('CHANGELOG.md', '', version, next), /unsupported/);

console.log('release-document-versions OK — candidate source labels update without rewriting verified publication evidence.');
