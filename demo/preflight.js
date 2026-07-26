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
