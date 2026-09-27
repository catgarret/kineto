# Entry points — which import to use (0.13 → 1.0)

> Source of truth: `kineto.features.json#entryPoints`. `package.json#exports`,
> the type files and this page are checked against it by `tests/entry-points.mjs`.
> Measured sizes live in [consumer-bundle-size.md](consumer-bundle-size.md).

## Choose

| You want | Import | What happens |
| --- | --- | --- |
| `data-kt-*` markup on a product page, smallest first download | `@dong-gri/kineto/auto` | The core loads first. Every module is **known** by name; the first time markup uses one, it is imported (its own chunk), registered and created. |
| Everything up front, zero configuration, named factories (`import { reveal }`) | `@dong-gri/kineto/all` | The full runtime: all modules imported and registered. This is what `@dong-gri/kineto` was until 0.12. |
| Full control over the bundle | `@dong-gri/kineto/core` + `@dong-gri/kineto/modules/<name>` | Nothing is registered until you call `Kineto.register(name, module)`. |
| A `<script>` tag, no build step | `dist/kineto.umd.min.js` from the CDN | The full runtime as a global `Kineto`. Unchanged. |

```js
// auto — markup-driven
import Kineto from '@dong-gri/kineto/auto';
import '@dong-gri/kineto/style.css';
Kineto.observe();                       // scans now and follows later DOM changes

// JS API on the auto entry: wait for the module first
await Kineto.loadModules(['tilt', 'reveal']);
Kineto.tilt('.card');
```

Use **one** entry per page. Each entry builds its own Kineto object (`/all` and the
default entry are the same one; `/auto` and `/core` share the modular core), so
mixing `/all` with `/auto` gives a page two independent registries.

## The default entry is changing

| Version | `import Kineto from '@dong-gri/kineto'` |
| --- | --- |
| ≤ 0.12 | full runtime |
| **0.13 – 0.x** | full runtime (same file and instance as `/all`), **deprecated meaning**: with diagnostics on, it reports `KT_DEPRECATED` once |
| 1.0 | the on-demand core — behaves like `/auto` |

Nothing breaks in 0.13. The deprecation is about what the bare name will mean,
so the notice follows the opt-in rule of [diagnostics-and-deprecation.md](diagnostics-and-deprecation.md):

```js
Kineto.config({ debug: true });
// { code: 'KT_DEPRECATED', module: 'core', phase: 'runtime', recoverable: true,
//   detail: { entry: '@dong-gri/kineto',
//             replacement: ['@dong-gri/kineto/auto', '@dong-gri/kineto/all'],
//             becomes: '@dong-gri/kineto/auto', changesIn: '1.0.0' } }
```

TypeScript shows the default export as `@deprecated` (types/default.d.ts);
`/all` and `/auto` are not.

### Migrate

| Your code today | Change it to |
| --- | --- |
| `import Kineto from '@dong-gri/kineto'` + only `data-kt-*` markup / `autoInit()` / `observe()` | `@dong-gri/kineto/auto` |
| `import Kineto, { reveal, slider } from '@dong-gri/kineto'` (named factories) | `@dong-gri/kineto/all` |
| `Kineto.tilt(el)` / `Kineto.create('tilt', el)` right after import | `/all`, or `/auto` + `await Kineto.loadModules('tilt')` |
| `Kineto.states(…)` / `Kineto.listTerminalFramePresets()` | `/all`, or `@dong-gri/kineto/states` for States |
| `require('@dong-gri/kineto')` | unchanged (the UMD build); `require('@dong-gri/kineto/all')` is the same file |
| The React / Vue / jQuery adapters | nothing — they import `/all` themselves |

## How `auto` works

1. `src/auto.js` imports the core, installs the on-demand store
   (`src/lazyModules.js`) and registers one importer per module from
   `src/moduleLoaders.js` — a table **generated** from the contract
   (`scripts/generate-module-loaders.mjs`, checked by `npm run test:module-loaders`).
2. `scan()` looks for the `data-kt-*` attribute of registered **and** known
   modules in one traversal. For a known one it calls the importer, registers the
   module and scans the same root again; the second scan creates it (and fetches
   GSAP for scroll modules, as always).
3. The `kt-preload` veil stays up until those imports settled, so an on-demand
   effect applies its first frame before content shows — the same rule GSAP
   modules follow.
4. A failed import (a chunk that did not download, an importer that did not
   return a module) is reported once as `KT_MODULE_LOAD_FAILED`, the markup keeps
   its static content, and later scans do not retry it. `Kineto.loadModules(name)`
   retries explicitly.
5. `create()` cannot wait: for a known module that is not loaded yet it starts the
   import, warns with the `loadModules()` hint and returns `null`.

API added by the auto entry only (`entryPoints["./auto"].api`):

| Method | |
| --- | --- |
| `Kineto.registerLazy(name, importer)` | Make a module known without importing it. `importer` must be a function (usually `() => import('./my-module.js')`); names are identifiers and can never shadow a core method. |
| `Kineto.loadModules(names?)` | Import one name or a list now; with no argument, wait for every import in flight. Resolves to `Kineto`, never rejects. |

### Security

Markup cannot choose what is imported. An attribute only matches a name that page
code registered, and an importer is a function — never a string that becomes a
URL or a path. The generated table uses literal `import('./modules/<name>.js')`
specifiers from the contract.

### Content-Security-Policy and hosting

On-demand chunks are **your** bundle's files, served from your origin by your
bundler, so `script-src 'self'` covers them (no CDN is involved). Pages that
deploy several builds should keep old chunks available for a while so a
long-open tab can still import a module; when an import fails anyway, the markup
simply stays static.

## Measured cost

See [consumer-bundle-size.md](consumer-bundle-size.md): the `auto` row reports the
first download and, separately, the on-demand chunks. CI fails when any module
stops being its own chunk, when the first download grows past its budget, or
when that report no longer matches a fresh measurement.

---

## 한국어 요약

- **`@dong-gri/kineto/auto`** — 코어만 먼저 받습니다. 모든 모듈을 이름으로 알고 있다가, 마크업이 처음 쓰는 순간 그 모듈만 import → 등록 → 생성합니다. `data-kt-*` 55개 모두 그대로 동작합니다. JS API는 `await Kineto.loadModules('tilt')` 뒤에 씁니다.
- **`@dong-gri/kineto/all`** — 0.12까지의 기본 엔트리와 같습니다(모든 모듈을 처음부터 등록, named export 포함).
- **`@dong-gri/kineto`(기본)** — 0.13에서는 `/all`과 같은 파일·같은 인스턴스라 깨지는 것이 없습니다. 의미가 1.0에서 `/auto`로 바뀌므로 deprecated이며, `debug`를 켠 페이지에만 `KT_DEPRECATED`를 한 번 보냅니다. TypeScript에서는 기본 export가 `@deprecated`로 보입니다.
- React·Vue·jQuery 어댑터는 스스로 `/all`을 가져오므로 사용자는 바꿀 것이 없습니다.
- 한 페이지에서는 엔트리를 **하나만** 쓰세요. `/all`과 `/auto`를 섞으면 Kineto 객체가 둘이 됩니다.
- 실패한 import는 `KT_MODULE_LOAD_FAILED`로 한 번 알리고 마크업은 정적 상태로 둡니다. 이후 scan은 다시 시도하지 않고, `loadModules(name)`이 명시적으로 재시도합니다.
- 보안: 마크업은 무엇을 import할지 고를 수 없습니다. 속성은 페이지가 등록한 이름에만 맞고, importer는 문자열이 아니라 함수입니다.
