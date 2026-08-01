// Flush the jsDelivr unversioned cache after publishing, so the demo (which loads
// @dong-gri/kineto) picks up the new build immediately instead of waiting
// out jsDelivr's multi-hour cache. Run after `npm publish`: `npm run purge`.
const files = [
  'kineto.umd.min.js',
  'kineto.umd.cjs',
  'kineto.min.js',
  'kineto.js',
  'kineto.min.css',
  'kineto.css'
];

let ok = 0;
for (const file of files) {
  const url = `https://purge.jsdelivr.net/npm/@dong-gri/kineto/dist/${file}`;
  try {
    const res = await fetch(url);
    console.log(`${res.ok ? '✓' : '·'} ${res.status}  ${file}`);
    if (res.ok) ok += 1;
  } catch (error) {
    console.warn(`! failed  ${file}  — ${error.message}`);
  }
}
console.log(`\njsDelivr unversioned purge: ${ok}/${files.length} files flushed.`);
console.log('The demo will now load the freshly published build (may take a few seconds to propagate).');
