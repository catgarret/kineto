// One matrix drives both bundlers so a public import combination, product
// budget, or tree-shaking boundary cannot be added to only one report.
export const consumerFixtures = [
  // Keep the product ceilings stable. Only the measured cross-runner byte
  // differences are expressed as bundler-specific variance.
  { name: 'full', entry: 'full', budget: 130, variance: { vite: 4, rolldown: 4 } },
  { name: 'core-reveal', entry: 'core-reveal', budget: 30, variance: { rolldown: 1 } },
  { name: 'core-three', entry: 'core-three', budget: 65, variance: { rolldown: 1 } },
  { name: 'core-states', entry: 'core-states', budget: 35 },
  { name: 'core-presence', entry: 'core-presence', budget: 35 },
  { name: 'react-adapter', entry: 'react', budget: 138, variance: { vite: 1, rolldown: 1 } },
  { name: 'vue-adapter', entry: 'vue', budget: 138, variance: { vite: 1, rolldown: 2 } }
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
