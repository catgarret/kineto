// scripts/lane-select.mjs + the run-lane flags built on it.
//
//   1. Shards are dealt by measured time: every step lands in exactly one
//      shard, each shard keeps lane order, and the slowest shard stays close
//      to the ideal (CI takes as long as its slowest shard).
//   2. `--changed` picks the steps a change can affect, and runs everything
//      when a changed file is shared by every step.
//   3. `--record-timings` keeps the file tidy: passing steps update, failures
//      keep their old time, removed tests drop out.
//   4. tests/lane-timings.json is well formed.
//
// Run: node tests/lane-select.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { affectedSteps, balancedShard, declaredPrefixes, matcherFor, stepTextReader, timingKey } from '../scripts/lane-select.mjs';
import { TIMINGS_FILE, mergeTimings, parseArgs, parseLane, readTimings, selectSteps } from '../scripts/run-lane.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const timings = readTimings(path.join(root, TIMINGS_FILE));
const steps = (labels) => labels.map((label) => ({ label, argv: ['tests/retry-browser-test.mjs', label] }));
const labelsOf = (list) => list.map((step) => step.label);
const load = (list, seconds, fallback) => list.reduce((total, step) => total + (seconds[step.label] ?? fallback), 0);

// 1. Balanced shards.
{
  const lane = steps(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
  const seconds = { a: 60, b: 5, c: 5, d: 58, e: 5, f: 30, g: 5 };
  for (const count of [1, 2, 3, 4, 7, 9]) {
    const shards = Array.from({ length: count }, (_, index) => balancedShard(lane, { index: index + 1, count }, seconds));
    assert.deepEqual(shards.flat().map((step) => step.label).sort(), labelsOf(lane).sort(), `${count} shards cover every step exactly once`);
    for (const shard of shards) {
      const positions = shard.map((step) => lane.indexOf(step));
      assert.deepEqual(positions, [...positions].sort((x, y) => x - y), 'a shard runs its steps in lane order');
    }
  }
  // The two slow steps (a, d) no longer share a runner, as round-robin would put them.
  const [one, two] = [1, 2].map((index) => labelsOf(balancedShard(lane, { index, count: 2 }, seconds)));
  assert.ok(!(one.includes('a') && one.includes('d')) && !(two.includes('a') && two.includes('d')), `the two slowest steps split (${one} | ${two})`);
  // No times at all: plain round-robin, so behaviour without a timings file is unchanged.
  assert.deepEqual(labelsOf(balancedShard(lane, { index: 1, count: 3 })), ['a', 'd', 'g']);
  // A step with no time counts as the median of the known ones — deterministic.
  const partial = { a: 60, b: 5, c: 5 };
  assert.deepEqual(balancedShard(lane, { index: 2, count: 2 }, partial), balancedShard(lane, { index: 2, count: 2 }, partial));

  // The real lanes with the real times: every CI shard count is within the
  // LPT bound (4/3 of the best possible), and better than round-robin.
  for (const [lane, browser, count] of [['test:browser', 'chromium', 3], ['test:browser:cross', 'webkit', 3], ['test:browser:cross', 'firefox', 2]]) {
    const real = parseLane(pkg.scripts[lane], lane);
    const measured = timings[timingKey(lane, browser)] || {};
    const known = real.map((step) => measured[step.label]).filter(Number.isFinite).sort((x, y) => x - y);
    if (known.length < real.length / 2) continue; // not recorded yet: nothing to compare
    const fallback = known[Math.floor(known.length / 2)];
    const total = load(real, measured, fallback);
    const longest = Math.max(...real.map((step) => measured[step.label] ?? fallback));
    const best = Math.max(total / count, longest);
    const balanced = Math.max(...Array.from({ length: count }, (_, index) => load(selectSteps(real, { shard: { index: index + 1, count }, seconds: measured }), measured, fallback)));
    const robin = Math.max(...Array.from({ length: count }, (_, index) => load(real.filter((_, position) => position % count === index), measured, fallback)));
    assert.ok(balanced <= best * (4 / 3) + 0.001, `${lane}@${browser} ${count} shards: slowest ${balanced.toFixed(0)}s, ideal ${best.toFixed(0)}s`);
    assert.ok(balanced <= robin, `${lane}@${browser}: balanced (${balanced.toFixed(0)}s) must not be slower than round-robin (${robin.toFixed(0)}s)`);
  }
}

// 2. --changed.
{
  for (const file of ['src/core.js', 'src/utils.js', 'src/kineto.css', 'src/adapters/react.js', 'package.json', 'package-lock.json', 'scripts/run-lane.mjs', 'tests/retry-browser-test.mjs']) {
    assert.equal(matcherFor(file), 'all', `${file} affects every step`);
  }
  const slider = matcherFor('src/modules/slider.js');
  assert.equal(slider('document.querySelector("[data-kt-slider]")'), true);
  assert.equal(slider('Kineto.slider.create(el)'), true);
  assert.equal(slider('sliderish'), false, 'a name match is a whole word');
  assert.equal(matcherFor('src/modules/textSplit.js')('<p data-kt-text-split>'), true, 'camelCase modules match their attribute');
  assert.equal(matcherFor('demo/main.js')("page.goto(`${origin}/demo/index.html`)"), true, 'a demo change runs the steps that open the demo');
  assert.equal(matcherFor('demo/main.js')('page.setContent(html)'), false);
  assert.equal(matcherFor('docs/modules/cursor.md')('read("docs/modules/cursor.md")'), true, 'other files match by path or name');
  assert.deepEqual(declaredPrefixes('// @lane-affected-by src/modules/\n// @lane-affected-by demo/'), ['src/modules/', 'demo/']);

  const lane = steps(['tests/a.mjs', 'tests/b.mjs', 'tests/c.mjs']);
  const text = { 'tests/a.mjs': 'Kineto.slider', 'tests/b.mjs': 'nothing here', 'tests/c.mjs': '// @lane-affected-by src/modules/' };
  const textOf = (step) => text[step.label];
  assert.deepEqual(affectedSteps(lane, [], textOf), { steps: [], all: false, reason: 'no changes' });
  assert.deepEqual(labelsOf(affectedSteps(lane, ['src/modules/slider.js'], textOf).steps), ['tests/a.mjs', 'tests/c.mjs'], 'named, or declared by path');
  assert.deepEqual(labelsOf(affectedSteps(lane, ['tests/b.mjs'], textOf).steps), ['tests/b.mjs'], 'a changed test runs itself');
  const broad = affectedSteps(lane, ['tests/b.mjs', 'src/core.js'], textOf);
  assert.equal(broad.all, true);
  assert.equal(broad.steps, lane);

  // On the real repository: a Slider change runs the Slider tests and the
  // tests that cover every module, and leaves unrelated ones out.
  const browserLane = parseLane(pkg.scripts['test:browser'], 'test:browser');
  const chosen = labelsOf(affectedSteps(browserLane, ['src/modules/slider.js'], stepTextReader(root, pkg.scripts)).steps);
  for (const expected of ['tests/browser/slider-scroll-snap.mjs', 'tests/slider-variant-browser.mjs', 'tests/browser/components-a11y.mjs', 'tests/browser/demo-blocks.mjs', 'tests/browser/idle-cost.mjs']) {
    assert.ok(chosen.includes(expected), `a Slider change runs ${expected} (chose ${chosen.join(', ')})`);
  }
  assert.ok(!chosen.includes('tests/browser/squircle.mjs'), 'a Slider change does not run Squircle');
  assert.ok(chosen.length < browserLane.length / 2, `a one-module change runs well under half the lane (${chosen.length}/${browserLane.length})`);
  // npm steps are read through their script (and the scripts it calls).
  const nodeLane = parseLane(pkg.scripts['test:node'], 'test:node');
  const nodeText = stepTextReader(root, pkg.scripts);
  const sizeStep = nodeLane.find((step) => step.label === 'test:size');
  if (sizeStep) assert.match(nodeText(sizeStep), /bundle-size/, 'an npm step reads the files its script runs');
}

// 3. Recording times.
{
  const before = { '//': 'note', 'test:x@chromium': { 'tests/a.mjs': 10, 'tests/b.mjs': 20, 'tests/gone.mjs': 5 } };
  const after = mergeTimings(before, 'test:x@chromium', [
    { label: 'tests/b.mjs', ok: true, seconds: 12.345 },
    { label: 'tests/a.mjs', ok: false, seconds: 99 },
    { label: 'tests/new.mjs', ok: true, seconds: 3 }
  ], ['tests/a.mjs', 'tests/b.mjs', 'tests/new.mjs']);
  assert.deepEqual(after, { '//': 'note', 'test:x@chromium': { 'tests/a.mjs': 10, 'tests/b.mjs': 12.3, 'tests/new.mjs': 3 } });
  assert.equal(before['test:x@chromium']['tests/b.mjs'], 20, 'the input is not mutated');
}

// 4. The flags and the timings file.
{
  assert.equal(parseArgs(['test:browser', '--changed']).changed, '');
  assert.equal(parseArgs(['test:browser', '--changed=origin/main']).changed, 'origin/main');
  assert.equal(parseArgs(['test:browser']).changed, null);
  assert.equal(parseArgs(['test:browser', '--record-timings']).recordTimings, true);
  for (const bad of [['a', '--changed=$(id)'], ['a', '--changed=a b'], ['a', '--changed=-p'], ['a', '--changed=--output=x'], ['a', '--record-timings', '--repeat', '2']]) {
    assert.throws(() => parseArgs(bad), Error, `reject ${JSON.stringify(bad)}`);
  }
  assert.equal(timingKey('test:browser', 'webkit'), 'test:browser@webkit');
  assert.equal(timingKey('test:browser:cross'), 'test:browser:cross@chromium');
  assert.equal(timingKey('test:node', 'firefox'), 'test:node', 'Node lanes do not depend on the engine');
  for (const [key, entry] of Object.entries(timings)) {
    if (key === '//') continue;
    const lane = key.split('@')[0];
    assert.ok(pkg.scripts[lane], `${TIMINGS_FILE}: "${key}" names a lane that package.json has`);
    assert.ok(entry && typeof entry === 'object', `${key} holds seconds per step`);
    for (const [label, value] of Object.entries(entry)) assert.ok(Number.isFinite(value) && value > 0, `${key} ${label}: ${value}`);
  }
}

console.log('lane-select OK — shards are dealt by measured time (every step once, lane order kept, within the LPT bound), --changed picks the affected steps and runs everything for shared files, and recorded times stay tidy.');
