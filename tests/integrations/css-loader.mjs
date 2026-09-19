// Node loader hook: UI libraries ship `import './x.css'` for bundlers. Under
// plain Node (this QA renders on the server) a stylesheet import becomes an
// empty module so the component code can be evaluated.
export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) return { format: 'module', shortCircuit: true, source: 'export default {};' };
  return nextLoad(url, context);
}
