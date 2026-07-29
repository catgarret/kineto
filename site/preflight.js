// Runs before styles paint: restore theme, expose the short preload fallback,
// and stop Prism from scanning before the lazy code playground is mounted.
document.documentElement.classList.add('kt-preload');
setTimeout(() => document.documentElement.classList.remove('kt-preload'), 3000);
try {
  if (localStorage.getItem('kt-theme') === 'light') document.documentElement.classList.add('light');
} catch (_error) {
  // Storage may be unavailable in privacy/sandboxed contexts.
}
window.Prism = window.Prism || {};
window.Prism.manual = true;

// Async webfont CSS without an inline handler: the stylesheet ships as
// media="print" so it never blocks first paint, and is promoted to media="all"
// once loaded. This used to be `onload="this.media='all'"` in index.html — an
// inline event handler, which the demo forbids (and which a strict CSP blocks).
for (const link of document.querySelectorAll('link[data-kt-async-css]')) {
  const promote = () => { link.media = 'all'; };
  if (link.sheet) promote();
  else link.addEventListener('load', promote, { once: true });
}
