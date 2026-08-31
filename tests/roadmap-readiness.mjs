import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const packageJson = JSON.parse(read('package.json'));
const contract = JSON.parse(read('kineto.features.json'));
const requirements = JSON.parse(read('kineto.requirements.json'));
const contributing = read('CONTRIBUTING.md');
const featureContract = read('FEATURE_CONTRACT.md');
const handoff = read('docs/AI-HANDOFF.md');
const context = read('docs/CONTEXT.md');
const stabilization = read('docs/STABILIZATION_REPORT.md');
const qaReport = read('docs/QA_REPORT.md');
const roadmap = read('docs/ROADMAP.md');
const readiness = read('docs/1.0-readiness.md');
const qaHistory = read('docs/browser-qa-history.md');
const caseStudy = read('docs/case-study-template.md');

assert.match(contributing, new RegExp(`${contract.moduleCount}개 모듈·${contract.coreApi.length}개 Core API·${requirements.requirements.length}개 소유자 요구사항`));
assert.match(contributing, /npm run ci/);
assert.match(contributing, /npm run verify/);
assert.match(featureContract, new RegExp(`Core public property: \\*\\*${contract.coreProperties.length}개\\*\\*`));
assert.match(featureContract, new RegExp(`Core API: \\*\\*${contract.coreApi.length}개\\*\\*`));
assert.match(handoff, new RegExp(`Public surface: ${contract.moduleCount} modules and ${contract.coreApi.length} Core APIs`));
assert.match(context, new RegExp(`Core API: ${contract.coreApi.length}개`));
assert.match(stabilization, new RegExp(`${contract.moduleCount}개 모듈과 ${contract.coreApi.length}개 Core API`));
assert.match(qaReport, new RegExp(`${contract.moduleCount} modules, ${contract.coreApi.length} Core APIs`));
assert.match(roadmap, /최소 3개의 외부 실제 사용 사례/);
assert.match(roadmap, /실제 keyed child 전환 요구 2건/);
assert.match(roadmap, /P2 \| Motion States 확장/);
assert.match(roadmap, /P2 \| Presence Core 확장/);
assert.match(roadmap, /데모 정합성·복사 경로·troubleshooting/);
assert.match(roadmap, /core` \+ 필요한\n모듈 entry/);
assert.match(readiness, /실서비스 1곳 투입/);
assert.match(read('docs/browser-qa-matrix.md'), /`pageReveal`,\n`pageTransition`, `slider`/);
assert.match(qaHistory, /`8a880e2`.*`33412656491`.*`33413636565`/);
assert.match(qaHistory, /`aba05d9`.*`33414388601`.*`33415329474`/);
for (const token of ['기록일', 'Kineto 버전', 'reduced-motion', '키보드·focus·ARIA', '소비자 번들 측정값', '공개 동의']) {
  assert.ok(caseStudy.includes(token), `case-study template is missing ${token}`);
}
const issueTemplates = {
  bug: ['version', 'module', 'reproduction', 'environment'],
  feature: ['use-case', 'proposed-api', 'fallback', 'cost'],
  browser: ['engine', 'device', 'checkpoint', 'evidence', 'steps']
};
for (const [name, fields] of Object.entries(issueTemplates)) {
  const file = `.github/ISSUE_TEMPLATE/${name === 'bug' ? 'bug-report' : name === 'feature' ? 'feature-request' : 'browser-qa'}.yml`;
  const content = read(file);
  assert.match(content, /^name:/m);
  for (const field of fields) assert.match(content, new RegExp(`^\\s+id: ${field}$`, 'm'), `${file} is missing ${field}`);
}
assert.equal(packageJson.version, contract.libraryVersion, 'roadmap readiness uses the current contract version');
console.log(`roadmap-readiness OK — v${packageJson.version}, ${contract.moduleCount} modules, ${requirements.requirements.length} requirements, issue/case-study gates present.`);
