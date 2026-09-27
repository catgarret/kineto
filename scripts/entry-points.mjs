// Package entry points, read from kineto.features.json#entryPoints (the source
// of truth). Build scripts and tests import from here so the deprecation notice
// wording, the package subpaths and the type files cannot drift apart.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

export const ENTRY_POINTS = contract.entryPoints;

/** `./auto` → `@dong-gri/kineto/auto`, `.` → `@dong-gri/kineto`. */
export const specifier = (subpath) => (subpath === '.' ? packageJson.name : `${packageJson.name}/${subpath.slice(2)}`);

const defaultEntry = ENTRY_POINTS['.'];
if (!defaultEntry?.deprecated) throw new Error('kineto.features.json#entryPoints["."] must describe its deprecation');

// The diagnostic the default entry raises (dist/kineto.default.js). Same shape as
// the other KT_DEPRECATED notices (docs/diagnostics-and-deprecation.md): opt-in,
// no page content, names the replacement.
export const DEFAULT_ENTRY_NOTICE = Object.freeze({
  code: 'KT_DEPRECATED',
  module: 'core',
  phase: 'runtime',
  recoverable: true,
  detail: {
    entry: specifier('.'),
    replacement: defaultEntry.deprecated.replacements.map(specifier),
    becomes: specifier(defaultEntry.deprecated.becomes),
    changesIn: defaultEntry.deprecated.changesIn
  }
});
