// One matrix drives both bundlers so a public import combination, product
// budget, or tree-shaking boundary cannot be added to only one report.
export const consumerFixtures = [
  // 2026-09-06: one-shot click media and production text/counter fixes add
  // about 3.3 KB gzip to full consumers. Node 24 measures 136.9 KB full and
  // 140.8/141.8 KB React/Vue in Vite (136.6/140.9/142.3 KB in Rolldown).
  // Raise only full-runtime product budgets by 4 KB; retain runner variance
  // and every core + selected-module budget/tree-shaking boundary.
  // 2026-09-14: masked Reveal/Wave lifecycle adds ~1.2 KB to full gzip
  // (Vite 138.4 KB). Account for code cost, not extra runner variance.
  // Terminal Glitch teardown measures 139.1 KB in Vite; round the product
  // ceiling by 1 KB, retaining the existing runner variance and modular limits.
  // 2026-09-19: the Lazy stylized-media rasterizer (dither / ascii / halftone
  // for <img> and <video>) is full-runtime code: Vite measures 143.2 KB full,
  // 147.1 KB React and 148.2 KB Vue (Rolldown 142.9 / 147.3 / 148.7 KB). The
  // three full-runtime product ceilings absorb that measured cost, rounded to
  // the next KB; runner variance and every core + selected-module boundary
  // stay unchanged, so importing `core` + a few modules still costs the same.
  // 2026-09-19 (quality pass): the Stylize living look — integer device-pixel
  // cells, contrast/brightness levels, six motion behaviours, four pointer
  // reactions and the dissolve/wipe reveal — is full-runtime code inside the
  // shared rasterizer. Raise only the three full-runtime product ceilings by
  // the measured amount; runner variance and every core + selected-module
  // boundary stay exactly as they were.
  { name: 'full', entry: 'full', budget: 148, variance: { vite: 4, rolldown: 4 } },
  { name: 'core-reveal', entry: 'core-reveal', budget: 30, variance: { rolldown: 1 } },
  { name: 'core-three', entry: 'core-three', budget: 65, variance: { rolldown: 1 } },
  { name: 'core-states', entry: 'core-states', budget: 35 },
  { name: 'core-presence', entry: 'core-presence', budget: 35 },
  // The same correction measures 143.1 KB in the Rolldown React entry.
  // See the 2026-09-19 note above: React measures 147.1 / 147.3 KB.
  // 2026-09-20: image timer/Core pause guards measure 153.1 KiB in Vite
  // React. Absorb this measured boundary; keep bundler variance unchanged.
  // 2026-09-20 (control labels): letting the page name the controls the library
  // creates measures 154.0 KiB gzip in the Rolldown React entry. Round this
  // measured accessibility cost only; bundler variance stays unchanged.
  { name: 'react-adapter', entry: 'react', budget: 154, variance: { vite: 1, rolldown: 1 } },
  // 2026-09-18: the Presence status subscription that keeps both adapters in
  // sync with a propagating parent measures 144.1 KB in the Vite Vue entry
  // (React 143.x stays inside its ceiling). Round the Vue product ceiling by
  // 1 KB; runner variance and every modular boundary are unchanged.
  // See the 2026-09-19 note above: Vue measures 148.2 / 148.7 KB.
  // The same lifecycle correction measures 154.2 KiB in Vite Vue.
  { name: 'vue-adapter', entry: 'vue', budget: 154, variance: { vite: 1, rolldown: 2 } }
];

export const treeShakenEntries = [
  'core-reveal',
  'core-three',
  'core-states',
  'core-presence'
];

const fixtureNames = consumerFixtures.map(({ name }) => name);
if (new Set(fixtureNames).size !== fixtureNames.length) {
  throw new Error('Consumer bundle fixture names must be unique');
}
treeShakenEntries.forEach((name) => {
  if (!fixtureNames.includes(name)) throw new Error(`Unknown tree-shaking fixture: ${name}`);
});

export function fixturesFor(bundler) {
  return consumerFixtures.map(({ variance, ...fixture }) => ({
    ...fixture,
    variance: variance?.[bundler] || 0
  }));
}
