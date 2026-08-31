import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const listMarkdown = (relative) => {
  const directory = path.join(root, relative);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(directory, entry.name));
};

// 1) Physical-device evidence has a deterministic, reviewable shape.
const evidenceRoot = path.join(root, 'docs', 'qa-evidence');
if (fs.existsSync(evidenceRoot)) {
  for (const dateEntry of fs.readdirSync(evidenceRoot, { withFileTypes: true })) {
    if (!dateEntry.isDirectory()) continue;
    assert.match(dateEntry.name, /^\d{4}-\d{2}-\d{2}$/, `invalid QA evidence date: ${dateEntry.name}`);
    const dateDirectory = path.join(evidenceRoot, dateEntry.name);
    for (const deviceEntry of fs.readdirSync(dateDirectory, { withFileTypes: true })) {
      if (!deviceEntry.isDirectory()) continue;
      const deviceDirectory = path.join(dateDirectory, deviceEntry.name);
      for (const required of ['environment.md', 'steps.md']) {
        assert.ok(fs.existsSync(path.join(deviceDirectory, required)),
          `physical QA evidence is missing ${required}: ${dateEntry.name}/${deviceEntry.name}`);
      }
      const environment = fs.readFileSync(path.join(deviceDirectory, 'environment.md'), 'utf8');
      const steps = fs.readFileSync(path.join(deviceDirectory, 'steps.md'), 'utf8');
      assert.match(environment, /(기기|device)/i, `environment.md must identify the device: ${deviceEntry.name}`);
      assert.match(environment, /(OS|iOS|Android|운영체제)/i, `environment.md must identify the OS: ${deviceEntry.name}`);
      assert.match(environment, /(Safari|Chrome|브라우저)/i, `environment.md must identify the browser: ${deviceEntry.name}`);
      assert.match(steps, /(기대|expected)/i, `steps.md must record expected behavior: ${deviceEntry.name}`);
      assert.match(steps, /(실제|actual|결과)/i, `steps.md must record actual behavior: ${deviceEntry.name}`);
    }
  }
}

// 2) A case study is evidence, not a count of an unfilled template.
const caseStudyFiles = [
  ...listMarkdown('docs/case-studies'),
  ...listMarkdown('docs/case-study-evidence')
];
for (const file of caseStudyFiles) {
  const content = fs.readFileSync(file, 'utf8');
  assert.match(content, /##\s+(기본 정보|Project|Project information)/i, `case study is missing project information: ${file}`);
  assert.match(content, /##\s+(해결한 작업|Problem|Use case)/i, `case study is missing the use case: ${file}`);
  assert.match(content, /##\s+(검증 결과|Validation|Results)/i, `case study is missing validation results: ${file}`);
  assert.doesNotMatch(content, /<YYYY-MM-DD>|<device>|\bTODO\b|\bTBD\b/i,
    `case study still contains an unfilled placeholder: ${file}`);
  assert.match(content, /(공개 동의|consent|permission)/i, `case study must record publication consent: ${file}`);
}

// 3) A deprecated module cannot be marked without a migration fixture.
const moduleStatus = read('docs/module-status.md');
const deprecatedMatch = moduleStatus.match(/\|\s*`deprecated`\s*\|\s*(\d+)\s*\|/);
assert.ok(deprecatedMatch, 'module status must include a deprecated count');
const deprecatedCount = Number(deprecatedMatch[1]);
const migrationRoot = path.join(root, 'tests', 'deprecation-fixtures');
if (deprecatedCount > 0) {
  assert.ok(fs.existsSync(migrationRoot), 'deprecated modules require tests/deprecation-fixtures');
  assert.ok(fs.readdirSync(migrationRoot, { withFileTypes: true })
    .some((entry) => entry.isFile()), 'deprecated modules require at least one migration fixture');
  assert.doesNotMatch(read('docs/diagnostics-and-deprecation.md'), /migration fixture \| 준비 전/,
    'migration fixture status must be updated when a module is deprecated');
}

// 4) Browser QA history rows must remain attributable to a commit and CI run.
const history = read('docs/browser-qa-history.md');
const rows = history.split('\n').filter((line) => /^\|\s*\d{4}-\d{2}-\d{2}\s*\|/.test(line));
assert.ok(rows.length > 0, 'browser QA history must contain at least one dated row');
for (const row of rows) {
  assert.match(row, /`[0-9a-f]{7,40}`/, `browser QA row is missing a commit: ${row}`);
  assert.match(row, /\|\s*(?:`\d+`|미실행|환경 실패|성공|실패)/, `browser QA row is missing a CI/result value: ${row}`);
}

// 5) Keep this contract in the same CI lane as the other readiness gates.
const packageJson = JSON.parse(read('package.json'));
assert.match(packageJson.scripts['test:node'], /test:readiness-evidence/,
  'test:node must execute the readiness evidence contract');

console.log(`readiness-evidence OK — physical evidence schema, ${caseStudyFiles.length} case studies, deprecated modules ${deprecatedCount}, ${rows.length} browser QA rows.`);
