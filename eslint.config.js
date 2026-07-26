const browserGlobals = {
  window: 'readonly', document: 'readonly', navigator: 'readonly', Element: 'readonly',
  NodeList: 'readonly', HTMLCollection: 'readonly', IntersectionObserver: 'readonly',
  ResizeObserver: 'readonly', requestAnimationFrame: 'readonly', cancelAnimationFrame: 'readonly',
  Image: 'readonly', DOMParser: 'readonly', CSS: 'readonly', getComputedStyle: 'readonly',
  DeviceOrientationEvent: 'readonly', fetch: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly',
  setInterval: 'readonly', clearInterval: 'readonly', console: 'readonly', Map: 'readonly', WeakMap: 'readonly',
  URL: 'readonly', AbortController: 'readonly', history: 'readonly', performance: 'readonly',
  Intl: 'readonly', Symbol: 'readonly',
  // DOM event constructors, observers and browser objects used across modules.
  Event: 'readonly', CustomEvent: 'readonly', MutationObserver: 'readonly',
  localStorage: 'readonly', location: 'readonly', matchMedia: 'readonly'
};

const baseRules = {
  'no-undef': 'error',
  'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
  'no-unreachable': 'error',
  'no-dupe-keys': 'error'
};

export default [
  {
    files: ['src/**/*.js', 'tests/browser-smoke-page.js', 'demo/playground.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: browserGlobals },
    rules: baseRules
  },
  {
    files: ['tests/*.mjs', 'scripts/*.mjs', 'vite.config*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { console: 'readonly', process: 'readonly', fetch: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', URL: 'readonly', window: 'readonly', document: 'readonly' }
    },
    rules: baseRules
  }
];
