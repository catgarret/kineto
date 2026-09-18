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
  { name: 'full', entry: 'full', budget: 136, variance: { vite: 4, rolldown: 4 } },
  { name: 'core-reveal', entry: 'core-reveal', budget: 30, variance: { rolldown: 1 } },
  { name: 'core-three', entry: 'core-three', budget: 65, variance: { rolldown: 1 } },
  { name: 'core-states', entry: 'core-states', budget: 35 },
  { name: 'core-presence', entry: 'core-presence', budget: 35 },
  // The same correction measures 143.1 KB in the Rolldown React entry.
  { name: 'react-adapter', entry: 'react', budget: 143, variance: { vite: 1, rolldown: 1 } },
  { name: 'vue-adapter', entry: 'vue', budget: 143, variance: { vite: 1, rolldown: 2 } }
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
