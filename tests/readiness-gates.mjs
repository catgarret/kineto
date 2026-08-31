import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readiness = read('docs/1.0-readiness.md');
const diagnostics = read('docs/diagnostics-and-deprecation.md');
const flip = read('docs/flip-shared-layout.md');
const moduleStatus = read('docs/module-status.md');
const deviceQa = read('docs/browser-device-qa.md');
const parityWorkflow = read('.github/workflows/live-site-parity.yml');

const evidenceRoot = path.join(root, 'docs', 'qa-evidence');
const physicalEvidenceEntries = fs.existsSync(evidenceRoot)
  ? fs.readdirSync(evidenceRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())
  : [];
const caseStudyRoots = ['docs/case-studies', 'docs/case-study-evidence'];
const caseStudyCount = caseStudyRoots.reduce((count, relative) => {
  const directory = path.join(root, relative);
  if (!fs.existsSync(directory)) return count;
  return count + fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .length;
}, 0);

if (physicalEvidenceEntries.length === 0) {
  assert.match(deviceQa, /iPhone Safari[\s\S]*미실행/);
  assert.match(deviceQa, /Android Chrome[\s\S]*미실행/);
  assert.match(readiness, /브라우저 지원표 \| 진행/);
}
if (caseStudyCount < 3) assert.match(readiness, /외부 실제 사용 사례 \| 조건/);

assert.match(moduleStatus, /\| `deprecated` \| 0 \|/);
assert.match(diagnostics, /migration fixture \| 준비 전/);
assert.match(readiness, /deprecation 정책 \| 진행/);
assert.match(flip, /실제 keyed child 전환 요구가 최소 두 건/);
assert.match(flip, /새 `layout` 모듈로 만들지 않습니다/);
assert.match(parityWorkflow, /schedule:/);
assert.match(parityWorkflow, /workflow_dispatch:/);
assert.match(parityWorkflow, /npm run test:live-site:parity/);

console.log(`readiness-gates OK — physical-device evidence ${physicalEvidenceEntries.length}, case studies ${caseStudyCount}/3, deprecated modules 0, FLIP evidence gate active, parity monitor wired.`);
