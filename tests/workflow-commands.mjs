// What a GitHub Actions job runs, in order, and which of those commands read
// the built files in dist/.
//
// Why this exists: dist/ is not tracked (v0.13.0), so every job that reads it
// must run `npm run build` first. The weekly and tag-only workflows run too
// rarely for their own failure to be a useful signal, so
// tests/workflow-build-order.mjs uses these helpers to check the order of every
// job on every pull request.
//
// How "reads the build" is decided — no hand-kept list of scripts:
//   1. A run block and an npm script are read as the same kind of command text.
//      `npm run X` / `npm test`, and any bare word that names a package.json
//      script with a colon (a wrapper argument such as
//      `node scripts/run-lane.mjs test:node`, or a `for c in a:b c:d` list),
//      run that script. `node <file>.mjs` runs that file.
//   2. A script expands into its own commands, recursively. `npm run build` is
//      the one command that produces dist/, so it is not expanded; it marks the
//      job as built from that point on.
//   3. A Node file reads the build when its source, or a local scripts/ or
//      tests/ module it imports, names dist/ as a path ('dist', "dist/…",
//      ../dist/…).
// Limits: commands run from another package (`npm --prefix dir …`,
// `cd dir && npm …`) and shell variables are not followed.
import fs from 'node:fs';
import path from 'node:path';

const DIST_PATH = /(?:\.\.\/dist\/|['"`]dist\/|['"`]dist['"`])/;
const LOCAL_IMPORT = /(?:\bfrom|\bimport)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g;
const FOLLOWED_DIRS = ['scripts', 'tests'];
const BUILD_SCRIPT = 'build';

// Block scalars (`run: |`) keep every more-indented line; plain values stay on
// one line. Returns [{ id, commands: [string] }] in file order.
export function workflowJobs(source) {
  const lines = source.split('\n');
  const jobsLine = lines.findIndex((line) => /^jobs:\s*$/.test(line));
  if (jobsLine === -1) return [];
  const jobs = [];
  let job = null;
  for (let index = jobsLine + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\S/.test(line)) break;
    const jobId = line.match(/^ {2}([\w-]+):\s*$/);
    if (jobId) {
      job = { id: jobId[1], commands: [] };
      jobs.push(job);
      continue;
    }
    const run = line.match(/^(\s*)(- )?run:\s*(.*)$/);
    if (!job || !run) continue;
    const keyIndent = run[1].length + (run[2] ? 2 : 0);
    const value = run[3].trim();
    if (!/^[|>][-+]?$/.test(value)) {
      job.commands.push(value);
      continue;
    }
    const block = [];
    while (index + 1 < lines.length) {
      const next = lines[index + 1];
      if (next.trim() && next.search(/\S/) <= keyIndent) break;
      block.push(next.trim());
      index += 1;
    }
    job.commands.push(block.join('\n'));
  }
  return jobs;
}

// Shell text → ordered { kind: 'script' | 'file', name } events.
export function commandEvents(text, scriptNames) {
  const events = [];
  const logical = text
    .replace(/\\\n/g, ' ')
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'));
  for (const line of logical) {
    const tokens = line.replace(/[;&|()]/g, ' ').split(/\s+/).filter(Boolean)
      .map((token) => token.replace(/^['"]|['"]$/g, ''));
    for (let at = 0; at < tokens.length; at += 1) {
      const token = tokens[at];
      if (token === 'npm') {
        let next = at + 1;
        let otherPackage = false;
        while (tokens[next]?.startsWith('-')) {
          if (/^--prefix(=|$)/.test(tokens[next])) {
            otherPackage = true;
            if (tokens[next] === '--prefix') next += 1;
          }
          next += 1;
        }
        const verb = tokens[next];
        if (otherPackage) { at = next; continue; }
        if (verb === 'test' || verb === 't') {
          events.push({ kind: 'script', name: 'test' });
          at = next;
        } else if (verb === 'run' || verb === 'run-script') {
          let name = next + 1;
          while (tokens[name]?.startsWith('-')) name += 1;
          if (tokens[name] && scriptNames.has(tokens[name])) events.push({ kind: 'script', name: tokens[name] });
          at = name;
        }
        continue;
      }
      if (token === 'node') {
        let next = at + 1;
        while (tokens[next]?.startsWith('-')) next += 1;
        if (/\.m?js$/.test(tokens[next] || '')) {
          events.push({ kind: 'file', name: tokens[next].replace(/^\.\//, '') });
          at = next;
        }
        continue;
      }
      if (token.includes(':') && scriptNames.has(token)) events.push({ kind: 'script', name: token });
    }
  }
  return events;
}

// Creates an analyser bound to one repository root and its package.json scripts.
export function createBuildOrderChecker(root, scripts) {
  const scriptNames = new Set(Object.keys(scripts));
  const readsCache = new Map();

  const readsBuild = (relative, seen = new Set()) => {
    if (readsCache.has(relative)) return readsCache.get(relative);
    if (seen.has(relative)) return false;
    seen.add(relative);
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) throw new Error(`workflow command runs a missing file: ${relative}`);
    const source = fs.readFileSync(absolute, 'utf8');
    let reads = DIST_PATH.test(source);
    for (const [, specifier] of reads ? [] : source.matchAll(LOCAL_IMPORT)) {
      const target = path.relative(root, path.resolve(path.dirname(absolute), specifier));
      if (!FOLLOWED_DIRS.some((dir) => target.startsWith(`${dir}${path.sep}`))) continue;
      if (!fs.existsSync(path.join(root, target)) || !/\.m?js$/.test(target)) continue;
      if (readsBuild(target, seen)) { reads = true; break; }
    }
    readsCache.set(relative, reads);
    return reads;
  };

  // Walks events in order. Returns the first read of dist/ that happens before
  // `npm run build`, with the chain of scripts that led to it, or null.
  const firstUnbuiltRead = (events, state = { built: false }, trail = []) => {
    for (const event of events) {
      if (event.kind === 'script') {
        if (event.name === BUILD_SCRIPT) { state.built = true; continue; }
        if (trail.includes(event.name)) continue;
        const found = firstUnbuiltRead(commandEvents(scripts[event.name], scriptNames), state, [...trail, event.name]);
        if (found) return found;
      } else if (!state.built && readsBuild(event.name)) {
        return { file: event.name, trail };
      }
    }
    return null;
  };

  return {
    readsBuild,
    // → [{ job, file, trail }] for every job that reads dist/ before building.
    workflowViolations(source) {
      return workflowJobs(source).flatMap((job) => {
        const events = job.commands.flatMap((command) => commandEvents(command, scriptNames));
        const found = firstUnbuiltRead(events);
        return found ? [{ job: job.id, ...found }] : [];
      });
    }
  };
}
