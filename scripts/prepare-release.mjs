import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { updateReleaseDocumentVersion } from './release-document-versions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const spec = process.argv[2];
const fail = (message) => {
  console.error(`release-prepare: ${message}`);
  process.exit(1);
};
const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: 'inherit' });

if (!spec) fail('pass patch, minor, major, or an explicit MAJOR.MINOR.PATCH version');
const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim();
if (status) fail('working tree must be clean; commit feature/fix work before preparing a release');

const packagePath = path.join(root, 'package.json');
const lockPath = path.join(root, 'package-lock.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const current = pkg.version;
const parsed = current.match(/^(\d+)\.(\d+)\.(\d+)$/)?.slice(1).map(Number);
if (!parsed) fail(`invalid current package version: ${current}`);

const bump = ([major, minor, patch], kind) => {
  if (kind === 'major') return `${major + 1}.0.0`;
  if (kind === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
};
const next = ['patch', 'minor', 'major'].includes(spec) ? bump(parsed, spec) : spec;
if (!/^\d+\.\d+\.\d+$/.test(next)) fail(`invalid target version: ${next}`);
if (next === current) fail('target version must differ from the current version');

const changelogPath = path.join(root, 'CHANGELOG.md');
const changelog = fs.readFileSync(changelogPath, 'utf8');
const unreleasedPattern = /## \[Unreleased\]\s*\n+### English\s*\n([\s\S]*?)\n+### 한국어\s*\n([\s\S]*?)(?=\n## \[)/;
const match = changelog.match(unreleasedPattern);
if (!match) fail('top Unreleased section must contain English then 한국어 headings');
const english = match[1].trim();
const korean = match[2].trim();
if (!/-\s+\S/.test(english) || !/-\s+\S/.test(korean)) {
  fail('both Unreleased language sections need at least one release bullet');
}

const date = new Date().toISOString().slice(0, 10);
const freshUnreleased = `## [Unreleased]\n\n### English\n\n<!-- Add matching English release bullets here. -->\n\n### 한국어\n\n<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->\n\n## [${next}] - ${date}\n\n### English\n\n${english}\n\n### 한국어\n\n${korean}`;
fs.writeFileSync(changelogPath, changelog.replace(unreleasedPattern, freshUnreleased));

pkg.version = next;
fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
lock.version = next;
if (lock.packages?.['']) lock.packages[''].version = next;
fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

for (const relative of [
  'tests/consumer-bundles/package-lock.json',
  'tests/framework-qa/package-lock.json'
]) {
  const fixtureLockPath = path.join(root, relative);
  const fixtureLock = JSON.parse(fs.readFileSync(fixtureLockPath, 'utf8'));
  const linkedRoot = fixtureLock.packages?.['../..'];
  if (linkedRoot?.version !== current) fail(`${relative} linked root is not ${current}`);
  linkedRoot.version = next;
  fs.writeFileSync(fixtureLockPath, `${JSON.stringify(fixtureLock, null, 2)}\n`);
}

const versionFiles = [
  'src/core.js',
  'FEATURE_CONTRACT.md',
  'OWNER_REQUIREMENTS.md',
  'kineto.features.json',
  'kineto.requirements.json',
  'demo/index.html',
  'docs/README.md',
  'docs/getting-started.md',
  'docs/STABILIZATION_REPORT.md',
  'docs/CONTEXT.md'
];
for (const relative of versionFiles) {
  const file = path.join(root, relative);
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(current)) fail(`${relative} does not contain current version ${current}`);
  fs.writeFileSync(file, source.replaceAll(current, next));
}

for (const relative of ['docs/QA_REPORT.md', 'docs/AI-HANDOFF.md']) {
  const file = path.join(root, relative);
  const source = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, updateReleaseDocumentVersion(relative, source, current, next));
}

// The roadmap contains historical release references that must not be changed
// wholesale. Synchronize only its explicit baseline and leave the meaningful
// `v<next>에서` evidence line for release review to validate.
const roadmapPath = path.join(root, 'docs', 'ROADMAP.md');
const roadmap = fs.readFileSync(roadmapPath, 'utf8');
const roadmapBaseline = new RegExp(`^(> 기준 버전: )v${current.replaceAll('.', '\\.')}(?=\\s|·)`, 'm');
if (!roadmapBaseline.test(roadmap)) fail(`docs/ROADMAP.md baseline is not v${current}`);
fs.writeFileSync(roadmapPath, roadmap.replace(roadmapBaseline, `$1v${next}`));

const releaseNote = `# Kineto v${next}\n\n## English\n\n${english}\n\n## 한국어\n\n${korean}\n`;
const noteDir = path.join(root, '.github', 'release-notes');
fs.mkdirSync(noteDir, { recursive: true });
fs.writeFileSync(path.join(noteDir, `v${next}.md`), releaseNote);

run('npm', ['run', 'docs:contract']);
run(process.execPath, [path.join(root, 'scripts', 'generate-module-metadata.mjs')]);
run('npm', ['run', 'build']);
run(process.execPath, [path.join(root, 'scripts', 'check-release.mjs'), `v${next}`]);

console.log(`\nPrepared Kineto v${next}.`);
console.log('Next: review changes, run npm run verify, commit as release: prepare v' + next);
console.log('After explicit approval to publish: npm run release:ship -- v' + next);
