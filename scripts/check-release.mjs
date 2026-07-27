import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tag = process.argv[2] || process.env.GITHUB_REF_NAME || '';
const fail = (message) => {
  console.error(`release-check: ${message}`);
  process.exit(1);
};

if (!/^v\d+\.\d+\.\d+$/.test(tag)) fail('tag must match vMAJOR.MINOR.PATCH');

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const features = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));
const requirements = JSON.parse(fs.readFileSync(path.join(root, 'kineto.requirements.json'), 'utf8'));
const version = tag.slice(1);

if (pkg.version !== version) fail(`package.json is ${pkg.version}, tag is ${tag}`);
if (features.libraryVersion !== version) fail(`kineto.features.json is ${features.libraryVersion}`);
if (requirements.libraryVersion !== version) fail(`kineto.requirements.json is ${requirements.libraryVersion}`);

const core = fs.readFileSync(path.join(root, 'src/core.js'), 'utf8');
if (!core.includes(`version: '${version}'`)) fail('src/core.js version is not synchronized');

const changelog = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
if (!new RegExp(`^## \\[${version.replaceAll('.', '\\.')}\\](?:\\s|$)`, 'm').test(changelog)) {
  fail(`CHANGELOG.md has no ${version} section`);
}

const notePath = path.join(root, '.github', 'release-notes', `${tag}.md`);
if (!fs.existsSync(notePath)) fail(`missing .github/release-notes/${tag}.md`);
const note = fs.readFileSync(notePath, 'utf8');
const english = note.indexOf('## English');
const korean = note.indexOf('## 한국어');
if (english < 0 || korean < 0) fail('release note must contain English and 한국어 headings');
if (english > korean) fail('English release notes must appear before Korean notes');
if (!/-\s+\S/.test(note.slice(english, korean))) fail('English release notes are empty');
if (!/-\s+\S/.test(note.slice(korean))) fail('Korean release notes are empty');

console.log(`release-check OK — ${tag}, synchronized versions, English → 한국어 notes.`);
