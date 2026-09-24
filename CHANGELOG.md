# Changelog

## [Unreleased]

### English

- Stop Scroll Sequence from clearing/redrawing the same rounded frame on every GSAP scrub tick. Preload/render work now runs only when the requested integer frame changes, while resize still forces the current frame to repaint; `onFrame` therefore tracks actual paints rather than duplicate tween updates.

- Deduplicate Loader/Loading Indicator progress-output DOM writes during smoothed updates: visible templates, rounded metadata and `--kt-percent` now update only when their represented value/state/template changes, while continuous `--kt-progress` and native `<progress>.value` precision remain intact.

- Reduce `Kineto.scan()` activation discovery from one selector traversal per registered module to one traversal per engine tier, preserving registry-order creation and re-discovering GSAP markup only when an asynchronous engine load requires it; lock 100 registered native modules to one traversal in the deterministic performance suite.
- Make autoplay hover timing deterministic and sample hero motion on animation frames so hosted-runner delays do not produce false browser failures.

- Pin all workflow runners to Ubuntu 24.04 and reject implicit OS migrations in the workflow contract test.

- Account for the measured Node 24/npm 11 archive compression delta with a 1 KB packed budget margin; keep the same 80-file package surface.

<!-- Add matching English release bullets here. -->
- Make Scroll Velocity's `blur` variant blur. It fell through to the skew transform with `maxBlur` at 0, so `data-kt-scroll-velocity="blur"` looked exactly like `skew`; it now leaves the transform alone and softens the element with scroll speed (8 px at full speed unless `maxBlur` says otherwise). `tests/scroll-velocity.mjs` drives all five variants at the same speed and requires five different looks. The settings drawer now takes Scroll Velocity's and Text Reveal's effect lists from the contract as well — Scroll Velocity offered an unlisted `combo` instead of `blur`, Text Reveal had lost `shuffle` — and `tests/demo-control-contract.mjs` checks every drawer's preset list against the contract instead of six hand-picked ones, with Mouse Parallax as the one documented exception (its `pointer` and `gyro` are chosen by the device).
- Read `hold` in seconds or milliseconds in Text Transition (`hold`/`pause`, and `duration` as before), Text Split and Text Reveal: 20 or less is seconds, more is milliseconds, through one shared reader (`timeMs` in `src/utils.js`). All three read milliseconds only, so the integration map's Text Transition recipe (`hold: 1.4`, which AI tools and the MCP server hand out) swapped words 1.4 ms apart, and Text Split's contract default `hold: 1.2` clamped to 200 ms; that default is corrected to the 2000 ms the module actually uses. `docs/common-options.md` documents the rule.
- Add Text Transition `pop`: each letter springs up from small, low and tilted, overshoots about 10 % and settles, while the old text leaves in one short fade — the per-letter title change many product sites use. The curve is a damped spring (damping ratio 0.5) sampled into keyframes and played linearly, so Chromium, Firefox and WebKit draw the same motion with no animation library; `duration` is the time to settle (1 s by default) and `stagger` defaults to 20 ms. Fix Text Transition tuning leaking between instances: `blur`, `startScale` and `endScale` were written into one module-level keyframe table from `create()`, so the last Text Transition created set the blur and scales of every other one from its second text on. Each instance now builds its own keyframes. The settings drawer takes the effect list from the contract (it had lost `flip`), `derive-variant-options` now recognises a table keyed by variant name, so the drawer shows `blur` only for Blur and the scales only for Scale, and Text Transition joins the variant distinctness audit. Gate: `tests/browser/text-transition.mjs` in all three engines.
- Give the deployed demo content-hash cache keys. `demo/index.html` referred to its own scripts and stylesheets with one hand-typed `?v=` number that had to be bumped by hand (and was, for one file, just before this change), so after a deploy a returning visitor could run the new page against yesterday's script. The site build now writes a short hash of each deployed file into `site/index.html`; the source says `?v=dev`, `demo-cdn --check` and `tests/site-deploy.mjs` fail on a stale or hand-written key, and a reference that points outside `site/` is never read.
- Add **Canvas Effect** (module 55, `data-kt-canvas-effect`): a host for canvas and WebGL effects you write yourself — the React Bits kind of interactive background, particle field or shader — rather than a set of effects shipped in the library. An effect is only its drawing code, registered with `Kineto.defineCanvasEffect(name, { options, setup, resize, frame, destroy })` or given as a bare `fragment` shader; the host owns the rest: the canvas behind the element's content, sizing to its padding box, the pixel-ratio cap (`maxDpr`), one frame loop with an `fps` cap and a rest state (`frame()` returns false and nothing is drawn until pointer, scroll, a resize or an update wakes it), pointer and scroll signals read once per frame, off-screen and hidden-tab suspension, a single still frame under reduced motion, `quality` tiers for weak devices, WebGL context loss, and a fallback to the element's own CSS background where WebGL is missing or the effect throws. Shaders get `uTime`, `uResolution`, `uPointer`, `uPointerDown` and `uScroll`, and every option arrives as a uniform of its own (`color` → `uColor`); Shadertoy-style `mainImage` code is wrapped automatically. Effects share one option vocabulary — `color`, `color2`, `background`, `speed`, `density`, `size`, `strength`, `distortion` — so markup, the demo's settings drawer and AI-written effects mean the same thing by the same name, and an option the chosen effect does not read is reported once. Markup can only NAME an effect the page registered: a `data-kt-*` value is parsed as JSON, so a definition arriving through options is refused rather than compiled. An element that asked for an effect before its script loaded starts the moment it is defined. `AI-PROMPT-GUIDE.md` gains the prompt to hand an AI (one definition, not a component), the demo gains Shape Grid (Canvas 2D), Flow Gradient (shader) and a card that copies that prompt, and `docs/modules/canvas-effect.md` is the reference. Locked as MK-CANVAS-001.
- One rule for when the library stops working on its own: an instance is suspended while the tab is hidden OR its element is off screen, kept apart from the page's own `pause()`, applied in one place (`syncSuspension` in `src/core.js`). A module opts into the off-screen half with `offscreen: 'pause'` (or a function of its options) and is watched by one shared IntersectionObserver. Marquee, Mouse Parallax, Scroll Velocity, Loading Indicator, Card Glow, Glitch, Overflow Text, Stylize, Text Transition and Typewriter now stop off screen, and `[data-kt-offscreen]` holds Kineto's own CSS keyframes inside a suspended element. On the demo, the idle page went from 787 rAF callbacks a second (every one of them Kineto's) to none, and style recalculation from about 290 ms to under 30 ms per second.
- Let modules whose `pause()` is public state suspend quietly. A module may implement `suspend(on)`; the core then calls it on every change of the rule above instead of `pause()`/`resume()`, and the page's own pause and resume go straight to the module. Loading Indicator does: off screen its terminal frames and CSS animations stop, while its state, `data-kt-loading-state` and its `statechange` events stay exactly as the page left them.
- Fix Loading Indicator coming back as "running" after a tab switch. `resume()` set `running` from any state, and the hidden-tab round trip called it on every indicator, so a completed or hidden one reported itself running again. `pause()` and `resume()` now only move between `running` and `paused`.
- Make loops that have caught up stop asking for frames: Cursor (follower, chain and snake), Mouse Parallax and its compass, and Marquee's scroll lean settle and are woken by input. Fix a pause in mid-motion stranding them: `pause()` cancelled the frame but kept its id, so `wake()` believed a loop was still scheduled and never started one again.
- Measure Overflow Text in a shared layout pass. Each instance wrote its DOM, then read a width, inside `create()`, so a page that created many at once laid itself out once per instance — 150 lines cost 200 forced layouts, the demo's 236 settings titles about half a second. Every instance now builds first and all of them measure together on the next frame (`measureThenApply` in `src/utils.js`, cancellable from `destroy()`); 150 lines cost 1. Resuming a line that fits no longer rebuilds it, which the off-screen suspension would otherwise have done on every scroll.
- Hold a hidden cursor's keyframes still. The text ring kept spinning at `opacity: 0` with the pointer nowhere near, keeping the compositor busy; `kt-cursor-idle` now pauses it until the cursor shows.
- Put `kt-lightbox-open` on `<html>` while the viewer is open, so a page can restyle what sits under it with a class selector instead of `body:has(#kt-lightbox:not([hidden]))`. A `:has()` on `<body>` made the browser re-check the whole page on every DOM change.
- Keep words together when text motion wraps. Text Reveal, Blur Text, Text Split, Text Transition and Text Fill wrap each letter in an inline-block, and a line may break between any two inline-blocks, so a narrow column split words mid-letter. Letters are now grouped into non-wrapping word boxes (`wordBox` / `wordSink` in `src/utils.js`).
- Demo: every card now hands over its code — `tests/browser/demo-code-access.mjs` opens playgrounds across the page and checks that copying gives exactly the HTML shown, and Squircle, the Mega-menu overview and the Lenis card gained the code access they lacked. Module blocks share one twelve-track grid with per-block column counts and a measured last row, a module whose card lives in another block says where it is, the compound terminal loaders take a full row on phones again (a later rule of equal specificity had put them back into one 150px cell), the settings list follows the contract instead of three hand-typed copies, the Stylize motion switch and the Fold switch use the stage's floating controls, and a copied snippet no longer carries state the library writes on an element (`data-kt-offscreen`, `data-kt-overflow-active`), which pasted into a page would have pinned it there.
- Demo load and idle cost: two `:has()` rules that made the browser re-check a whole card — or the whole page — on every text change are classes now, cutting load long tasks from about 4.3 s to 3.0 s; the row rebalancer measures every grid in one pass; the status-bar tint is read in a frame callback and follows the intro canvas while it is up (the theme toggle used to overwrite it); the smooth-scroll switch past the hero is kept by an IntersectionObserver instead of measuring on every scroll event; and the module count in every language comes from the live registry through a `{moduleCount}` token, replacing a regex that rewrote the old counts it happened to know.
- New regression gates: `tests/browser/idle-cost.mjs` (idle frames, settle and wake, off-screen suspension, pause/resume precedence, the quiet loader), `tests/browser/create-cost.mjs` (forced layouts when creating many instances), `tests/browser/canvas-effect.mjs` and `tests/canvas-effect.mjs`, `tests/browser/demo-code-access.mjs` and `tests/browser/text-word-wrap.mjs`, all but the demo check in the Firefox and WebKit lanes too. Module counts in tests and docs are read from the contract instead of being written down.
- Fix Dock neighbour jumps with a continuous packing anchor, container-relative coordinates and settled frame suspension.
- Refine Liquid Glass edge refraction, show a clear capsule, restore smooth light return and pause/resume, and test decoded pixels instead of PNG compression size.
- Reduce live-DOM work by scanning overlapping mutation subtrees once, skipping option parsing for existing instances, and cancelling queued work on observer disconnect.
- Let Scroll Velocity sleep after spring/lerp settling and wake on input; preserve explicit pause and make teardown terminal, including callback-triggered teardown.
- Reuse sampled pixels for Stylize dither output, replace full-grid diffusion buffers with reusable 2–3-row storage, and avoid repeated monochrome Canvas colour writes. Lock pixel parity and work counts with deterministic performance regressions.
- Fix `snapshotAttributes` leaving an empty `style=""` behind. Removing the `style` attribute ONCE is not enough after the CSSOM has written to it: measured in all three engines, Chromium and WebKit answer a `removeAttribute('style')` by emptying the declaration block and serialising it straight back, so an element that had no attribute at all keeps a husk of one; Firefox drops it. Every module that snapshots an attribute and writes an inline style was handing the element back subtly changed, and only a cross-browser test on the exact markup would ever have shown it. The helper now takes the husk with it, the way `dropEmptyAttributes` already does for the ones a `classList.remove()` leaves.
- Give Squircle a lifecycle smoke fixture. The smoke page builds one per registered module and fails if the two lists disagree, so module 54 shipping without one made `npm run test:demo` fail on `smoke registry mismatch` — and because that block sits at the very end of demo QA, everything before it still looked green while CI stayed red and the demo deploy was skipped for three commits.
- Drive the Card Glow pointer check through the real input pipeline. A hand-built `new PointerEvent('pointermove', { clientX })` arrives without usable coordinates in WebKit, so the module had nothing to move its lit rim to and the check failed on a browser where the feature works.
- Stop measuring the runner instead of the module in the glass blur check. Headless Firefox and WebKit accept `backdrop-filter: blur(12px)` and composite nothing at all, so a pixel comparison there says nothing about Card Glow. The test now measures a plain control div with an inline `backdrop-filter` over the same stripes first, and only asserts the pixels where the engine actually paints one — a control that lands at 12.9x on Chromium and 1.0x on the other two, so a Chromium run cannot take the skip branch by accident.
- Add a **radial** Mega-menu layout (`data-kt-layout="radial"`). The panel's links fan out on an arc around their own trigger instead of stacking under it: `radius` sets how far, `startAngle` where the arc begins (0 is straight up and the angle grows clockwise, the way a clock is read), `sweep` how much of a circle it covers, and `stagger` the head start between one item and the next. A full circle drops the last step so the first and last item do not land on the same point. Everything else about the menu — the trigger, the ARIA, the keyboard map, one panel open at a time, close on Escape or an outside click — is the same code the other two layouts run, which is why this is a layout rather than a module of its own.
- Only the measured numbers reach the DOM. The module writes each item's offset and its share of the stagger as CSS custom properties and `kineto.css` owns the transform, the collapsed state and the easing, so a page can restyle the ring — or turn it into something else entirely — without touching any JavaScript. `--kt-menu-ring-scale` is the hook that comes out of that: `radius` is fixed when the menu is built, but a phone needs a smaller circle than the desktop card the menu was authored for, and resizing the whole ring is a media query's job rather than JavaScript's. The ring is measured once when the menu is built, not on every open: it depends on the item count and the options, never on the pointer.
- Two things the ring had to be measured to get right. A panel that was `hidden` a moment ago has no box at all, and a transition out of "no box" never runs, so the collapsed state has to be flushed to the screen before the open class arrives — otherwise the items simply appear at their places with no fan-out. And `hidden` is `display:none`, which cancels a transition mid-flight: the panel may only leave once the last item is home, so closing collapses the ring onto the trigger instead of making it vanish. Both are measured from `getBoundingClientRect()` in the new test, not from the properties the module wrote down.
- Teach the variant-option derivation about `layout`. The ring's four options are read only inside `layout === 'radial'`, but `layout` was not one of the keys the analysis recognised as carrying a variant, so a plain dropdown's settings drawer would have offered a `sweep` control it never reads — exactly the drift that script exists to prevent. Mega-menu's every option is now documented in all seven languages too, which takes the tooltip ratchet from 109 gaps to 103.
- One numeric-option reader for the library. `overflowText`, `rasterizer`, `states` and `presence` each carried their own copy of the same three lines, and the copies disagreed about what an out-of-range value means. `utils.numberOption(value, fallback, min, max)` replaces all four and fixes a trap they shared: `Number('')` is `0`, so a `data-kt-speed=""` written by a template that had nothing to put there used to mean "speed zero" — an animation that never moved, from an attribute that looks empty. An empty string is now a value nobody supplied, the same rule `labeller` already used for its strings.
- Add **pull-to-refresh** as a second Gesture (`data-kt-gesture="pull"`). Drag a scroll container down from its top and the content stretches against you, an arc fills as you go, and letting go past the threshold asks the page to refresh — whatever the page hands back, a promise or nothing, decides when the gesture ends. It only engages when the container is already at the top and the drag is downward, so it never turns an ordinary scroll into a refresh, and the wording that screen readers hear is a `labels` map like every other string in the library.
- Resistance belongs at the END of a pull. The obvious formulation — a single exponential easing towards the limit — is stiffest exactly where the gesture starts, and it took 157px of finger to reach a 60px threshold: the control felt broken rather than springy. It is now straight up to the threshold and eases only past it, so 40px of finger moves 28px and 120px moves 79px against a 110px limit.
- Add **tap-to-confirm** as a third Hold mode (`data-kt-mode="tap"`). A destructive button becomes its own confirmation instead of opening a dialog: the first press arms it and its label becomes the question, a second press within `duration` confirms, and Escape, a click anywhere else, losing focus or simply running out of time each put it back. The first press reaches nothing — not the link, not the form, not the page's own click handler — which is the difference between a confirmation and a decoration. The label comes back from a snapshot of the button's child nodes rather than a remembered string, so an icon-plus-text button returns as itself instead of as text alone, and the question itself is a `labels` map because a library cannot know what language its host page is in.
- Add **Dock** as a second Magnetic behaviour (`data-kt-magnetic="dock"`), the row of icons that magnifies around the cursor. What makes it a dock rather than "icons that get bigger" is the re-packing: the row opens up so the grown icon has somewhere to be, instead of scaling into its neighbours. The growth follows a raised cosine rather than a straight line, because a linear falloff has a corner at the edge of its range and the eye catches the moment an icon starts moving. Everything is a transform, so the page around the dock never reflows, and `axis` handles vertical docks.
- Add **Fold** as a FLIP move style (`data-kt-mode="fold"`), the hand-over a folding phone makes when it opens. The difference from `crossfade` is one thing: the middle of the change is soft. Two layouts dissolving through each other read as two pictures swapping; blurring them as they pass reads as one surface being re-formed — the arriving layout comes in blurred at the old layout's box and sharpens into its new one, while a pinned copy of the old layout holds its place in space and blurs away. Nothing jumps at a threshold, which is the whole point of the effect on a device whose screen changes size in your hands. `foldBlur` sets how soft the middle gets.
- Add **Liquid Glass** as Card Glow's seventh look (`data-kt-card-glow="glass"`). Four things make a pane read as glass rather than as a blurred rectangle: the backdrop is blurred and its colour pushed, a bright rim runs along the lit edge and fades round the back, a soft sheen sits inside the top, and what is behind BENDS at the rim the way it does through a real bevel. The first three are plain CSS and always happen. The bend is a displacement map generated per pane from its own size and corner radius, applied through an SVG filter used as a `backdrop-filter` — which is Chromium only today, so elsewhere it is simply dropped and the other three carry the look. The lit edge follows the pointer, so tilting a card feels like tilting an object rather than crossfading a picture of one. The filter lives inside the pane's own layer and leaves with it.
- The trap this variant had to avoid: Card Glow isolates a card (`isolation: isolate`) for every other look, and a `backdrop-filter` inside an isolated stacking context has no backdrop to filter — the glass comes out completely clear while every computed style looks correct. Glass skips the isolation, and the test measures the rendered pixels rather than the style: a PNG of the pane over a hard stripe pattern is 11x the size of the bare stripes beside it, where an unfiltered pane would be 1x and a flat tint below 1.
- Fix the Card Glow settings drawer offering a `pointer` glow that does not exist. Picking it silently gave the default spotlight, while `edge` — a real look — could not be chosen from the drawer at all.
- Add **Squircle** (module 54): the corner shape CSS cannot draw everywhere. Apple's corners are superellipses, not circles — flatter along the sides, turning harder at the end — which is why a plain `border-radius` card never quite looks like an iOS one. CSS gained `corner-shape` for exactly this, but as of September 2026 it is Chromium only, so Safari and Firefox have no way to draw one at all. `data-kt-squircle` uses the real property where it exists and draws the identical curve with a `clip-path` outline everywhere else: `squircle`, `round`, `bevel`, `scoop`, `notch`, `square`, and any `superellipse(K)` in between. With no radius of its own it upgrades the `border-radius` the element already has, so a design system stays the source of truth. A border is redrawn along the curve instead of being cut off at the corners, and the outline is redrawn when the box resizes.
- Three things the shape had to be measured to get right, each caught by comparing against Chromium's own `corner-shape` rather than by reading the spec. The polyfill left the `border-radius` in place, so the clip was intersected with a round corner and a squircle came out round — the one shape people actually ask for silently did nothing. A negative `superellipse(K)` is not the formula with a fractional exponent but the *mirror* of the positive curve, a genuinely different shape: measured, `scoop` meets the 45° diagonal at 70.7% of the radius, not 75%. And at the ends of the family `Math.cos(Math.PI / 2)` is 6.1e-17 rather than 0, which raised to a tiny power is 0.98, so `notch` stopped short of its own corner and collapsed into a bar.
- Let the settings drawer's tooltip audit see the whole drawer. It read the first `FIELDS` literal out of `demo/playground.js` and therefore checked 32 of the 50 modules the drawer actually builds — the rest are appended with `Object.assign` further down, where a control could ship with no (?) at all and the audit still reported "0 gaps". It now runs the real script and reads the manifest it publishes, which found 110 options across 16 modules that have never had a tooltip. Those are listed explicitly as a ratchet that may only shrink: writing a tooltip and leaving the entry in fails the build just as loudly as a new gap.
- Make a moving texture stoppable and a still one movable. Stylize already had `motion`, but it could only be chosen when the effect was created: turning it off meant tearing the effect down and building it again, which re-decodes the picture and blinks. `Kineto.updateModule(img, 'stylize', { motion: 'none' })` now changes it on the running effect — same canvas, no blink — and the frame loop starts or stops with it, so a stopped look also stops costing frames (measured: 0 draws in 600ms where a running one draws 12+). The same call in reverse starts a still dither, ASCII or halftone moving, and the speed is remembered while it is off, so switching back on resumes at the same pace. Instances expose `motion`, the motion actually in effect, which is not always the one the markup asked for — reduced motion drops it — so a page's own motion switch can tell the truth rather than guess. The demo's five texture cards now carry that switch.
- Let a module decline an option change instead of throwing to refuse it. `update()` may now return `false` for a patch it cannot apply live, and `updateModule()` quietly recreates the instance — the same outcome as a module with no `update()` at all. Before, the only way to signal "not this one" was to throw, which logged an error for something that is not an error. Stylize is the first user: it takes the living-look options in place and asks for a rebuild for everything else.
- Keep Pixel Shift on the glyphs. The effect measured the element box, but a block is full width — so when `PIXEL ERROR` wrapped to two short lines, slices and noise burst in the empty space beside the words and the glitch looked stuck to the block rather than to the text. It now works from the line rectangles the text actually occupies. On the demo's own fixture 12 of 28 slices used to land in that empty space; now none do.
- Make Data Mosaic a mosaic. Every `tileMax` cell split by the same factor, so the tiles converged on a single pitch — with a 48px cell and a 6px floor the whole cover came out in two sizes, which reads as a plain grid rather than a mosaic. Tiles now come from a recursive subdivision, so coarse blocks and fine grain share the frame, and each burst lays out afresh instead of replaying the identical pattern. `tileMin`/`tileMax` set the range and the demo card now shows it.
- Rebuild RGB Slice Burst out of the photo. It used to lay flat colour bars over the image and fade them out — no motion, no relation to the picture, closer to a debug overlay than a glitch. The slices are now channel-multiplied copies of the image itself, shoved sideways and stuttered through a few frames: most drift a few pixels so contrast edges fringe, a minority tear across, and the lanes are shuffled so much of the frame stays clean.
- Let the dither reveal melt instead of speckle. `dissolve` cleared cells in independent random order, so halfway through the transition the photo was scattered with isolated black and white cells — dirt on the picture rather than a dither coming off it. The order now comes from an interpolated coarse lattice, so cells clear in patches with a dithery fringe: neighbouring cells differ by 0.07 on average where per-cell noise gave 0.34.
- Drop the Radial compatibility card from the demo. It only restated that `data-kt-radial` is another way into Slider's radial effect, so the demo showed the same carousel twice, and the full-width pair left the Native Scroll Snap card alone on its row. The Radial Carousel card now sits beside it, carries the `radial` home and declares itself that module's comparison material. `data-kt-radial` is unchanged and still public.
- Make Blur Text's pause actually pause. Kineto promises to suspend active instances when the tab is hidden, and Blur Text's `pause()` only reached for a GSAP tween. On the native path — which is what runs before GSAP is fetched, and on any page that never loads it — the reveal is a row of staggered `setTimeout`s that nothing stopped, so a backgrounded tab kept revealing characters. Pause now holds those timers with their remaining delay and resume re-arms only what is left, so a paused reveal continues where it stopped instead of jumping back to the start.
- Say why nothing happened. When an element asks for a module through `data-kt-*` and the module decides it cannot attach — Tabs without a tablist, Slider without slides — `create()` returns null. That is not an error, so there was no exception, no console output and no visible change: the author was left with "it doesn't work" and nothing to go on, and there are 78 such places across the modules. A `KT_NOT_APPLICABLE` diagnostic now names the module and the element (`div#pricing.card`), so turning on `debug` shows exactly which elements were declined and why to look at their markup. Diagnostics are opt-in, so a page that has not asked for them stays completely silent, and the detail carries no page text — only a short identifier the author can search for.
- Give the element back the way it was found. `destroy()` restored listeners, timers and generated nodes but not everything it had written onto the markup itself. Tabs was the worst: after destroy the DOM was still a fully wired tab widget — `role="tab"`, generated ids, `aria-controls`, `aria-selected`, `tabindex`, the indicator span — so a screen reader announced a working widget that answered nothing, which is worse than never having touched it. Drag and Switch left `tabindex="0"`, so the element stayed in the tab order after the behaviour was gone. Bottom Sheet left the accessible name it had invented. Scroll Shadows took its snapshot *after* setting `overflow`, so it remembered its own change as the original and left the element a scroll container forever. Card Glow and Accordion left `style=""` and `class=""` on children they had promoted. Each of these now records what it writes before it writes it, through the snapshot helpers that already existed, and `dropEmptyAttributes` handles the empty husks a `classList.remove()` leaves behind.
- Ask the leak suite a harder question. It checked listeners, rAF handles and observers on 8 of 53 modules. It now also compares the element's own markup before create and after destroy, checks `document.body` and `document.head`, and calls `destroy()` a second time to prove it is safe — on 33 modules. A suite that looks at a handful of modules reads as "safe" when it means "unexamined"; every defect above was invisible to it until the question changed.
- Let the Lightbox's stylesheet and thumbnail names leave with it. The viewer already tore down its shared root when the last instance went, but the `<style id="kt-lightbox-style">` it injected alongside stayed in `document.head` for the rest of the session — dead CSS on every page that had ever opened a lightbox. Thumbnails were also labelled with a bare number, so a screen reader announced "3, button" with nothing to place it; they now read "Item 3 of 12" through the same `labels` map. The leak suite grew with them: it checks `document.head` as well as `document.body`, naming the library's own runtime stylesheet as the one node a module destroy must not take, and it now runs on 33 modules instead of 8 — the narrow list is why the Toast region went unnoticed for so long.
- Take the Toast notification region down with the last instance. The shared `role="region"` container was appended to `document.body` on the first toast and never removed, so a page that showed one notification kept an empty "Notifications" landmark in its accessibility tree for the rest of the session, and `destroy()` did not restore the document it had changed. It is now reference-counted the way the Lightbox already reference-counts its shared viewer: the region survives while any instance can still show into it and goes when the last one is destroyed. `destroy()` also takes that instance's on-screen toasts with it instead of leaving them to a timer, so unmounting a component in a single-page app no longer leaves its notifications floating. The leak suite now checks `document.body` after every destroy, not just listeners, rAF handles and observers — the class of leftover it was blind to.
- Stop inventing user-visible words the page cannot change. Bottom Sheet's resize grip hard-coded a Korean `title`, so every site using `resizable` showed Korean to all of its readers regardless of language; it was the last user-facing Korean string in `src/`. Slider dots ("Go to slide 3"), the autoplay pause button, Fullpage dots, Toast's region and dismiss button and the Lightbox's twelve control names were hard-coded English, which a screen reader then read out in the middle of a Korean or Japanese page. Each module now publishes one `labels` map (`utils.labeller`) whose defaults are the documented English, so nothing changes unless a page asks; `{n}`/`{total}` placeholders follow the existing `{value}` convention and a JSON attribute works from markup: `data-kt-labels='{"dot":"Go to slide {n}"}'`. Bottom Sheet's tooltip is the separate `resizeLabel` option (`''` turns it off) because it has no other controls. `tests/control-labels.mjs` gates both halves: a source scan that fails the build the moment a module invents a word, and mounted checks that the defaults ship and a supplied map wins.
- Translate the demo's tooltips. The demo could translate body text and accessible names but had no path for `title`, so three replay tooltips and the sheet grip stayed Korean in the other six languages — the same button gave a screen reader one name and a mouse user another. Tooltips now travel the declarative `data-demo-i18n-title` path beside the accessible-name one, module option strings are declared with `data-demo-i18n-option`, and the hand-written per-module special case that kept the back-to-top ring localized is gone. Demo QA checks `title` the way it already checked `aria-label`, naming the offending element when it fails.
- Honor native Reveal repetition and all four viewport boundary callbacks, keep reverse playback and observation through replay/pause, and prevent self-triggering at transformed edges. Share the existing clipped-boundary observer and retain authored DOM and animation cleanup.
- Keep comparison-region accessible names synchronized with language changes by referencing their live module heading and translated toggle label.
- Fix Page Transition destroying the page on Back. A history entry that differs only by its hash is a move inside the document the browser has already made, but the module refetched the URL anyway and swapped the container — so everything the page built after load was gone. On the demo that was two clicks away: open a module from the sidebar, press Back, and 53 module blocks, 227 settings panels and 34 compare sheets all became zero. Clicks already refused a hash-only URL; history moves now follow the same rule, and a real path change still transitions both ways. `tests/browser/page-transition-hash.mjs` holds both halves.
- Make a compare sheet addressable. Opening one puts `#cmp-<module>` in the address bar and closing it restores `#mod-<module>`, so "look at all 23 Reveal presets and tell me which" is a link you can send. The sheet is a labelled region, Escape closes it and returns focus to the button, and the scroll observer no longer overwrites the hash of an open sheet.
- Preserve image Stylize delay, reveal and hold time across pause/hidden tabs; suspend RAF/timers, defer static resize and paused replay, and guard callback re-entry. Core now keeps explicit instance/global pause separate from visibility suspension, including public API teardown.
- Honor Stylize video reveal triggers, queued manual replay, delay and hold duration. Suspend video-effect RAF work during module/media pause or hidden tabs, preserve active reveal time, and prevent callback teardown from completing or rescheduling a destroyed effect; keep existing defaults and Lazy aliases.
- Teach the integration map the new textures. The `media-texture` intent gains four recipes — the `noise` dither for photographs, the `cluster` print screen, a 45° newspaper halftone and an open-ring editorial screen — plus a note on picking `ditherType` by subject rather than taste, and the keywords an agent actually types (newsprint, risograph, screen angle, 신문, 인쇄물). Without this an agent asked for a print-looking photo had no way to know `cluster` or `halftoneAngle` existed, and would have reached for a smaller cell size instead.
- Keep Stylize's persistent texture static under reduced motion by disabling added motion/pointer effects; make image/video teardown idempotent and stop image-controller scheduling when a rendering/progress callback destroys it, with browser regressions.
- Widen what Stylize can actually draw. `ditherType` gains `16x16`, `cluster` and `noise`, and the Bayer matrices are now generated by the recursive doubling rule instead of three typed-out tables, so a new size is one entry. `cluster` is the print screen — ink grows as one blob per cell rather than scattered pixels. `noise` is the one that answers "it looks coarse": interleaved gradient noise has no repeating tile at all, so a photograph at a 2–3px cell reads as texture instead of as an 8x8 weave. The demo's Living Grain card uses it now.
- Give halftone real shapes and a screen angle. `halftoneShape` gains `cross`, `diamond`, `ring` and `triangle` alongside dot, square and line, and the new `halftoneAngle` tilts the dot lattice itself, which is what print does and what stops the grid from reading as a table. Ink per unit area is unchanged at every angle (measured: mean luminance 201.5–202.4 across 0–90°).
- Make every motion move every look. `drift` slides the ordered matrix, so on looks that have no matrix — error-diffusion, `random` and `noise` dither, and halftone — it did nothing at all, which reads as an option that does not work. Those looks now get a smooth travelling tone wave instead; a per-cell random value there would dissolve the picture, which is the trap this renderer already learned once. `tests/browser/stylize-patterns.mjs` plays all thirty look-by-motion pairs and fails on any that hold still, and equally on a `none` that does not.
- Give the last seven public variants their own demo cards — Lazy `data-mosaic` and `rgb-slice-burst`, Cursor `blob`, and Glitch `noise`, `crt`, `reveal` and `rgb-slice-burst` — and stop counting deprecated aliases as owing one. A deprecated variant keeps working for a minor, but the contract's position is "don't write this any more", so a dedicated card that reads as a choice would contradict it; the compare sheet shows those three behind a Deprecated badge instead. The audit now measures dedicated markup against live variants and fails if a deprecated one ever gets a card: 81/81.
- Use the demo's own replay control inside the compare sheet instead of a second design for the same action. A tile is 210px wide, and the text button wrapped onto its own line under the markup; the round icon the demo cards already float on a stage fits and is the control people know.
- Snapshot only the specimens a module actually needs. The sheet used to clone up to twelve candidates per module at page load — 135 clones — when what it needs is one per capability its variants require, which is one for most modules and never more than three. 28 clones now, and the gate keeps it there.
- Give every module block a **Compare all variants** sheet: one click lays every public variant of that module out on the same material, with copy-ready markup on each tile and a **Replay all** that runs them together. The material is not written for the sheet — it is cloned from the demo's own cards, snapshotted before Kineto initializes, and picked per variant by the requirement the contract already declares, so Glitch's `rgb` gets the text card while its `datamosh` gets the image one. 168 of the 211 variants play live side by side; `pageReveal` and `loader` forward to the demo's own controls because only one can be on screen at a time, and the eight modules whose variants are combinations of options rather than one switch say so on the tile. `npm run test:variant-compare` fails the build when a new variant has no material, no control and no recorded reason — the preview screen the roadmap promises can no longer quietly lose a variant.
- Let Stylize colours be design tokens: `data-kt-ink-color="var(--fg)"` now resolves against the page's own custom properties, read from the element the effect is on, so a section that re-themes its tokens re-themes the effect. `var(--x, fallback)` behaves exactly as CSS does. A design system should be pointed at, not transcribed into hex codes that drift.
- Make the feature contract the single source for deprecated markup. `kineto.features.json` gains `deprecatedVariants`, `kineto.integrations.json` gains a required `deprecations` block with the replacement and the reason, the generated AI rules print a "do not generate these any more" table, and the module reference marks the variants inline. CI fails if the contract deprecates a variant the map gives agents no replacement for.
- Add living-look recipes to the `media-texture` intent so an agent asked for an image that feels alive or reacts to the pointer finds `motion` and `pointer` instead of inventing a canvas effect of its own.
- Make the stylized looks crisp. Cells are now laid out on whole device pixels: with a CSS-pixel grid one cell lands on 2.4 device pixels and nearest-neighbour upscaling gives some cells two pixels and their neighbours three, which is what made dither and halftone read as a blurry, shimmering screen. Every dot is now identical.
- Add `contrast` and `brightness` to Stylize. A photograph sits in the middle of the tonal range and dithers to grey mush; pushing contrast is what gives the print look its snap, and it was the missing control rather than a rendering bug.
- Add `motion` to Stylize — the look keeps moving on a still picture instead of being painted once: `drift` crawls the ordered matrix like film grain, `shuffle` keeps swapping glyphs of similar brightness (the living terminal), `scan` sweeps a band, `flow` slides the grid, `pulse` breathes the exposure, with `motionSpeed` and `motionAmount` to tune them. `drift` slides the matrix rather than re-rolling each cell's threshold, because a random threshold turns an ordered dither into a random one and dissolves the picture into noise.
- Add `pointer` to Stylize: `lens` redraws the circle under the pointer at its own `pointerCellSize` so the picture sharpens exactly where you point, `spotlight` adds ink around it, and `ripple` sends waves out from it.
- Add a `transition` for Stylize reveals and make `dissolve` the default. The old `shrink` walks the cell size down, so the middle of every reveal is a half-resolution blur; `dissolve` keeps the look at its authored size and clears it cell by cell, and `wipe` does the same behind a diagonal edge. `shrink` stays the default for the deprecated Lazy aliases only.
- Rebuild the Stylize demos around what the effect actually is: a living grain dither, a shuffling ASCII portrait, a pointer lens, colour diffusion, a halftone video under a scan band, and one lazy-loaded image whose dither dissolves away — the loading case done properly rather than as a Lazy variant.
- Add `stylize` (`data-kt-stylize`), a graphic-texture module for images and video: `dither`, `ascii` and `halftone` draw the media on a canvas layer with `mode: persist` (the default — the look stays for the media's whole life, redrawn on resize and frame by frame for animated sources and `<video>`) or `mode: reveal` (played once on `load`, in `view`, or on a `manual` replay, shrinking its cells into the original picture). The three looks moved here from Lazy, where they never belonged: Lazy's job is to *fetch* an image, and these redraw pixels that are already there. Locked as owner requirement MK-STYLIZE-001 and proven by `tests/browser/stylize.mjs` across three engines.
- `data-kt-lazy="dither|ascii|halftone"` keep working for one minor release as deprecated aliases. They render through the same rasterizer and lifecycle as Stylize, so the pixels are identical, and they emit a recoverable `KT_DEPRECATED` diagnostic naming the replacement to consumers who opted into `debug`. This is Kineto's first deprecation; `docs/diagnostics-and-deprecation.md` now carries the migration example. Both modules can sit on one element — Stylize reuses the wrapper Lazy creates.
- Give every module exactly one declared category and generate the demo's sections, sidebar groups and module index from it. Category membership used to be hand-written in three places and had drifted: `marquee` was filed under Media in the sidebar while its cards lived in Text, `coverReveal` was Media on the left and Scroll in the page, and `ripple` was Pointer on the left and Feedback in the page. The demo gains an **Effects** section (Stylize, Glitch, Brush Reveal, Ambient Media) split by what the effect is applied to, `textFill` joins Text, and the pointer-driven cards join Pointer. `docs/module-taxonomy.md` records the decision order, and `npm run test:taxonomy` fails the build when a module has no category, has two home cards, or has one that sits in the wrong section.
- Give `radial` its own `data-kt-radial` demo card and nav entry. It is a public module, but it was only ever demoed through Slider's radial effect, so the demo counts had to add it back by hand.
- Fix `Kineto.env` throwing `ReferenceError: navigator is not defined` when a `window` exists without a `navigator` global (DOM shims and Node < 21 test runtimes; Node 21+ defines one): the environment probe now treats a missing navigator as a plain capable browser. This is what failed the Node 20.19 engine-contract job on the first v0.11.0 CI run via `tests/observe.mjs`; the test now also exposes jsdom's navigator like a browser would.
- Dependabot no longer proposes major bumps for the `tests/integrations` fixture: the UI-library majors there are the ones the integration map documents, so a new major is reviewed together with the docs and tests instead of landing as a failing automatic PR.

### 한국어

- Scroll Sequence가 GSAP scrub 갱신마다 같은 반올림 프레임을 반복해서 clear/redraw하던 작업을 제거했습니다. 요청한 정수 프레임이 바뀔 때만 preload/render하고, resize에서는 현재 프레임을 강제로 다시 그립니다. 이에 따라 `onFrame`은 중복 tween tick이 아니라 실제 paint에만 호출됩니다.

- Loader/Loading Indicator의 smoothing 갱신 중 progress output DOM 쓰기를 중복 제거했습니다. 표시 template, 반올림 metadata, `--kt-percent`는 표현 값/state/template이 바뀔 때만 갱신하고, 연속 `--kt-progress`와 네이티브 `<progress>.value` 정밀도는 그대로 유지합니다.

- `Kineto.scan()`의 활성화 탐색을 등록 모듈마다 한 번씩 DOM 검색하던 방식에서 엔진 그룹당 한 번으로 줄였습니다. 모듈 등록 순서의 생성 동작은 유지하고, 비동기 GSAP 로딩이 실제로 필요한 경우에만 완료 시 GSAP 마크업을 다시 찾습니다. 결정적 성능 테스트에서 네이티브 모듈 100개가 selector traversal 1회만 사용하도록 고정했습니다.
- 자동재생 호버 검사 시간을 제어하고 첫 화면 움직임을 애니메이션 프레임마다 측정해 CI 실행 지연으로 인한 잘못된 실패를 방지했습니다.

- 모든 워크플로 실행 환경을 Ubuntu 24.04로 고정하고, 계약 검사로 암묵적인 운영체제 전환을 차단합니다.

- Node 24/npm 11에서 확인된 압축 크기 차이에 맞춰 패키지 압축 상한에 1KB 여유를 반영했습니다. 패키지 파일 80개 구성은 유지합니다.

- 배포 데모에 **내용 해시 캐시 키**를 씁니다. `demo/index.html`은 자기 스크립트·스타일시트를 손으로 적은 `?v=` 숫자 하나로 불렀고, 그 숫자는 사람이 올려야 했습니다(이번 변경 직전에도 한 파일만 손으로 올렸습니다). 그래서 배포 뒤 다시 찾은 방문자가 새 페이지를 어제 스크립트로 실행할 수 있었습니다. 이제 사이트 빌드가 배포되는 파일마다 짧은 해시를 `site/index.html`에 적고, 소스는 `?v=dev`만 씁니다. 낡았거나 손으로 쓴 키는 `demo-cdn --check`와 `tests/site-deploy.mjs`가 거부하며, `site/` 밖을 가리키는 참조는 읽지 않습니다.
- Scroll Velocity의 `blur` variant가 실제로 흐려지게 했습니다. `maxBlur`가 0인 채 skew transform으로 넘어가서 `data-kt-scroll-velocity="blur"`가 `skew`와 똑같아 보였습니다. 이제 transform은 건드리지 않고 스크롤 속도만큼 요소를 흐리게 합니다(`maxBlur`를 주지 않으면 최고 속도에서 8px). `tests/scroll-velocity.mjs`가 다섯 variant를 같은 속도로 움직여 다섯 가지 다른 모습인지 확인합니다. 설정창은 Scroll Velocity와 Text Reveal의 효과 목록도 계약에서 가져옵니다 — Scroll Velocity는 `blur` 대신 계약에 없는 `combo`를, Text Reveal은 `shuffle`이 빠진 목록을 보여 주고 있었습니다. `tests/demo-control-contract.mjs`는 손으로 고른 여섯 모듈 대신 모든 설정창의 preset 목록을 계약과 대조하며, 예외는 기기가 `pointer`·`gyro`를 고르는 Mouse Parallax 하나이고 이유를 적어 두었습니다.
- Text Transition(`hold`/`pause`, 그리고 기존처럼 `duration`)·Text Split·Text Reveal의 `hold`를 초와 밀리초 둘 다로 읽습니다. 20 이하는 초, 그보다 크면 밀리초이고, 공용 리더 하나(`src/utils.js`의 `timeMs`)를 씁니다. 셋 다 밀리초만 읽었기 때문에, AI 도구와 MCP 서버가 내주는 연동 지도의 Text Transition 레시피(`hold: 1.4`)는 단어를 1.4ms 간격으로 바꿨고, Text Split 계약 기본값 `hold: 1.2`는 200ms로 잘렸습니다. 그 기본값은 모듈이 실제로 쓰는 2000ms로 바로잡았습니다. 규칙은 `docs/common-options.md`에 적었습니다.
- Text Transition에 `pop`을 추가했습니다. 글자마다 아래에서 작고 기울어진 채 튀어 올라 약 10 % 넘쳤다가 자리 잡고, 이전 텍스트는 짧은 페이드 한 번으로 사라집니다 — 많은 제품 사이트가 제목을 바꿀 때 쓰는 글자 단위 입장입니다. 곡선은 감쇠비 0.5의 스프링을 keyframe으로 샘플링해 linear로 재생하므로 Chromium·Firefox·WebKit이 애니메이션 라이브러리 없이 같은 움직임을 그립니다. `duration`은 자리 잡는 시간(기본 1초), `stagger` 기본값은 20ms입니다. Text Transition 조절값이 인스턴스끼리 섞이던 문제도 고쳤습니다: `blur`·`startScale`·`endScale`을 `create()`에서 모듈 전체가 쓰는 keyframe 표 하나에 써 넣어서, 마지막으로 만든 Text Transition이 다른 모든 인스턴스의 두 번째 텍스트부터 흐림과 배율을 정했습니다. 이제 인스턴스마다 자기 keyframe을 만듭니다. 설정창은 효과 목록을 계약에서 가져오고(`flip`이 빠져 있었습니다), `derive-variant-options`가 variant 이름을 키로 하는 표를 알아보게 되어 `blur`는 Blur에서만, 배율은 Scale에서만 보이며, Text Transition이 variant 구분 감사에 들어갔습니다. 게이트: 세 엔진의 `tests/browser/text-transition.mjs`.
- **Canvas Effect**(55번째 모듈, `data-kt-canvas-effect`)를 추가했습니다. 효과를 라이브러리에 싣는 대신, 직접 만든 캔버스·WebGL 효과 — React Bits 같은 인터랙티브 배경·파티클·셰이더 — 를 돌리는 **호스트**입니다. 효과는 그리는 코드만 `Kineto.defineCanvasEffect(name, { options, setup, resize, frame, destroy })`로 등록하거나 `fragment` 셰이더 하나로 주면 되고, 나머지는 호스트가 맡습니다: 요소 콘텐츠 뒤의 캔버스, padding box에 맞춘 크기, 픽셀 비율 상한(`maxDpr`), `fps` 상한과 휴식 상태가 있는 하나의 프레임 루프(`frame()`이 false를 반환하면 포인터·스크롤·리사이즈·업데이트가 깨울 때까지 그리지 않음), 프레임마다 한 번 읽는 포인터·스크롤 신호, 화면 밖·숨은 탭 일시정지, 축소 모션의 정지 프레임 한 장, 저사양 기기용 `quality` 단계, WebGL 컨텍스트 소실, 그리고 WebGL이 없거나 효과가 오류를 내면 요소 자신의 CSS 배경으로 되돌아가기까지입니다. 셰이더는 `uTime`·`uResolution`·`uPointer`·`uPointerDown`·`uScroll`을 받고, 옵션마다 같은 이름의 uniform이 생기며(`color` → `uColor`), Shadertoy 형식의 `mainImage` 코드는 자동으로 감쌉니다. 효과들은 `color`·`color2`·`background`·`speed`·`density`·`size`·`strength`·`distortion`이라는 공용 옵션 어휘를 써서, 마크업·데모 설정창·AI가 쓴 효과가 같은 이름으로 같은 뜻을 말합니다. 효과가 읽지 않는 어휘 옵션은 콘솔에 한 번 알립니다. 마크업은 페이지가 등록한 효과의 **이름만** 가리킬 수 있습니다 — `data-kt-*` 값은 JSON으로 해석되므로, 옵션으로 들어온 정의는 컴파일하지 않고 거절합니다. 효과 스크립트가 늦게 로드되어도, 정의되는 순간 그 이름을 요청했던 요소가 시작합니다. `AI-PROMPT-GUIDE.md`에 AI에게 줄 프롬프트(컴포넌트가 아니라 정의 하나)를, 데모에 Shape Grid(Canvas 2D)·Flow Gradient(셰이더)·그 프롬프트를 복사하는 카드를 추가했고, 기준 문서는 `docs/modules/canvas-effect.md`입니다. MK-CANVAS-001로 고정했습니다.
- 라이브러리가 스스로 멈추는 규칙을 하나로 만들었습니다: **탭이 숨었거나 요소가 화면 밖이면** 인스턴스를 일시정지하고, 페이지가 직접 부른 `pause()`와는 따로 관리하며, 한 곳(`src/core.js`의 `syncSuspension`)에서만 적용합니다. 모듈은 `offscreen: 'pause'`(또는 옵션을 받는 함수)로 화면 밖 절반에 참여하고, IntersectionObserver 하나가 모두를 지켜봅니다. Marquee·Mouse Parallax·Scroll Velocity·Loading Indicator·Card Glow·Glitch·Overflow Text·Stylize·Text Transition·Typewriter가 이제 화면 밖에서 멈추고, `[data-kt-offscreen]`이 일시정지된 요소 안의 Kineto 키프레임도 멈춥니다. 데모에서 아무것도 하지 않는 페이지의 rAF 콜백이 초당 787개(전부 Kineto)에서 0개로, 스타일 재계산이 초당 약 290ms에서 30ms 미만으로 줄었습니다.
- `pause()`가 공개 상태인 모듈은 **조용히** 멈출 수 있게 했습니다. 모듈이 `suspend(on)`을 구현하면 코어는 위 규칙이 바뀔 때마다 `pause()`/`resume()` 대신 그것을 부르고, 페이지의 pause·resume은 곧바로 모듈로 갑니다. Loading Indicator가 이 방식입니다: 화면 밖에서는 터미널 프레임과 CSS 애니메이션이 멈추지만, 상태·`data-kt-loading-state`·`statechange` 이벤트는 페이지가 둔 그대로입니다.
- 탭을 전환했다 돌아오면 Loading Indicator가 "running"으로 되살아나던 문제를 고쳤습니다. `resume()`이 어떤 상태에서든 `running`으로 바꿨고 숨은 탭 왕복이 모든 인디케이터에 그것을 불러서, 완료되거나 숨긴 인디케이터가 다시 실행 중이라고 보고했습니다. 이제 `pause()`와 `resume()`은 `running`과 `paused` 사이만 오갑니다.
- 따라잡은 루프가 프레임 요청을 멈춥니다: Cursor(팔로워·체인·스네이크), Mouse Parallax와 나침반, Marquee의 스크롤 기울기가 안정되면 쉬고 입력이 깨웁니다. 움직이는 중에 일시정지하면 루프가 영영 멈추던 문제도 고쳤습니다 — `pause()`가 프레임은 취소하고 id는 남겨 두어, `wake()`가 루프가 아직 예약돼 있다고 믿고 다시 시작하지 않았습니다.
- Overflow Text를 **공유 레이아웃 패스**에서 측정합니다. 인스턴스마다 `create()` 안에서 DOM을 쓰고 폭을 읽었기 때문에, 한 번에 여러 개를 만드는 페이지는 인스턴스 수만큼 레이아웃을 다시 계산했습니다 — 150줄에 강제 레이아웃 200번, 데모의 설정 제목 236개로 약 0.5초. 이제 모두 먼저 만들고 다음 프레임에 한꺼번에 측정합니다(`src/utils.js`의 `measureThenApply`, `destroy()`에서 취소 가능). 150줄에 1번입니다. 넘치지 않는 줄은 다시 재생할 때 새로 만들지 않습니다 — 화면 밖 일시정지 때문에 스크롤할 때마다 그럴 뻔했습니다.
- 숨은 커서의 키프레임을 멈춥니다. 텍스트 링이 포인터가 없는데도 `opacity: 0`으로 계속 돌며 컴포지터를 쉬지 못하게 했습니다. 커서가 보일 때까지 `kt-cursor-idle`이 멈춰 둡니다.
- 라이트박스가 열려 있는 동안 `<html>`에 `kt-lightbox-open` 클래스를 붙입니다. 뒤에 깔린 요소를 `body:has(#kt-lightbox:not([hidden]))` 대신 클래스 선택자로 바꿀 수 있습니다. `<body>`의 `:has()`는 DOM이 바뀔 때마다 페이지 전체를 다시 검사하게 만들었습니다.
- 텍스트 모션이 줄바꿈될 때 단어를 지킵니다. Text Reveal·Blur Text·Text Split·Text Transition·Text Fill은 글자마다 inline-block으로 감싸는데, inline-block 사이는 어디서든 줄이 바뀔 수 있어서 좁은 칸에서 단어가 글자 중간에 쪼개졌습니다. 이제 글자를 줄바꿈하지 않는 단어 상자로 묶습니다(`src/utils.js`의 `wordBox`/`wordSink`).
- 데모: 모든 카드가 코드를 내줍니다 — `tests/browser/demo-code-access.mjs`가 페이지 곳곳의 설정창을 열어 복사한 결과가 보이는 HTML과 정확히 같은지 확인하고, 코드를 볼 방법이 없던 Squircle·메가메뉴 개요·Lenis 카드에 복사 경로를 넣었습니다. 모듈 블록은 12트랙 격자 하나에 블록별 열 수와 측정한 마지막 줄을 쓰고, 카드가 다른 블록에 있는 모듈은 그 위치를 안내하며, 복합 터미널 로더가 휴대폰에서 다시 한 줄 전체를 차지합니다(같은 명시도의 뒤쪽 규칙이 150px 한 칸으로 되돌려 놓았습니다). 설정 목록은 손으로 쓴 세 벌 대신 계약을 따르고, Stylize 모션 스위치와 Fold 스위치는 스테이지의 떠 있는 컨트롤을 쓰며, 복사한 코드에 라이브러리가 요소에 써 둔 상태(`data-kt-offscreen`·`data-kt-overflow-active`)가 더는 섞이지 않습니다 — 그대로 붙여 넣으면 그 상태가 고정되었을 것입니다.
- 데모 로딩·유휴 비용: 텍스트가 바뀔 때마다 카드 전체 — 또는 페이지 전체 — 를 다시 검사하게 하던 `:has()` 규칙 둘을 클래스로 바꿔 로딩 중 긴 작업이 약 4.3초에서 3.0초로 줄었고, 행 균형 조정은 모든 격자를 한 번에 측정합니다. 상태 표시줄 색은 프레임 콜백에서 읽고 인트로 캔버스가 떠 있는 동안에는 그 색을 따릅니다(테마 토글이 덮어쓰고 있었습니다). 히어로를 지나면 켜지는 부드러운 스크롤은 스크롤 이벤트마다 재는 대신 IntersectionObserver가 지키고, 모든 언어의 모듈 수는 `{moduleCount}` 토큰으로 실제 레지스트리에서 가져옵니다 — 알고 있던 옛 숫자만 바꿔 쓰던 정규식을 대신합니다.
- 새 회귀 게이트: `tests/browser/idle-cost.mjs`(유휴 프레임, 안정·깨우기, 화면 밖 일시정지, pause/resume 우선순위, 조용한 로더), `tests/browser/create-cost.mjs`(한꺼번에 만들 때의 강제 레이아웃), `tests/browser/canvas-effect.mjs`·`tests/canvas-effect.mjs`, `tests/browser/demo-code-access.mjs`, `tests/browser/text-word-wrap.mjs`. 데모 검사를 뺀 전부가 Firefox·WebKit 레인에서도 돕니다. 테스트와 문서의 모듈 수는 적어 두지 않고 계약에서 읽습니다.
- Dock 배치 기준점을 연속 보간해 주변 아이콘이 튀는 문제를 수정했습니다. 컨테이너 기준 좌표를 사용하고 정착하면 프레임을 멈춥니다.
- Liquid Glass 가장자리 굴절과 투명한 캡슐 데모, 반사광 복귀와 pause/resume을 개선하고 실제 픽셀로 블러를 검증합니다.
- DOM 변경의 중첩 하위 트리를 한 번만 탐색하고 기존 인스턴스의 옵션 재파싱을 생략하며, 관찰 해제 시 예약된 탐색도 취소합니다.
- Scroll Velocity의 탄성·보간이 안정되면 RAF를 중지하고 입력 시 재개합니다. 명시적 일시정지를 보존하고 콜백 안에서 종료해도 다시 실행되지 않습니다.
- Stylize 디더 출력에 샘플 픽셀을 재사용하고 전체 격자 오차 버퍼를 재사용 가능한 2~3행 버퍼로 줄이며, 단색 Canvas의 반복 색상 설정을 제거합니다. 결정적 회귀 테스트로 픽셀 동일성과 작업 횟수를 검증합니다.

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- `snapshotAttributes` 가 빈 `style=""` 를 남기던 문제를 고쳤습니다. CSSOM 이 인라인 스타일을 쓴 뒤에는 `style` 속성을 **한 번 지워서는 지워지지 않습니다.** 세 엔진에서 직접 재 보니, 크로미엄과 웹킷은 `removeAttribute('style')` 에 대해 선언 블록을 비운 뒤 그것을 그대로 다시 직렬화해서, 원래 속성이 아예 없던 요소에 껍데기를 남깁니다(파이어폭스는 지웁니다). 속성을 스냅샷하고 인라인 스타일을 쓰는 모든 모듈이 요소를 조금씩 달라진 채로 돌려주고 있었고, 정확히 같은 마크업으로 크로스브라우저 테스트를 돌려야만 보이는 종류의 차이였습니다. 이제 헬퍼가 껍데기까지 가져갑니다 — `classList.remove()` 가 남기는 껍데기를 `dropEmptyAttributes` 가 이미 그렇게 처리하고 있었습니다.
- Squircle 에 수명주기 스모크 픽스처를 넣었습니다. 스모크 페이지는 등록된 모듈마다 픽스처를 하나씩 만들고 두 목록이 어긋나면 실패하는데, 54번째 모듈이 픽스처 없이 나가면서 `npm run test:demo` 가 `smoke registry mismatch` 로 떨어지고 있었습니다. 이 블록이 데모 QA 의 **맨 끝**에 있어서 그 앞은 전부 초록으로 보였고, 그동안 CI 는 빨간불이었으며 데모 배포가 세 커밋 동안 건너뛰어졌습니다.
- Card Glow 의 포인터 검사를 실제 입력 경로로 돌렸습니다. 손으로 만든 `new PointerEvent('pointermove', { clientX })` 는 웹킷에서 좌표가 전달되지 않아, 모듈이 테두리를 옮길 대상이 없었고 **동작하는 브라우저에서 검사만 실패**했습니다.
- 유리 블러 검사가 모듈이 아니라 러너를 재던 것을 고쳤습니다. 헤드리스 파이어폭스와 웹킷은 `backdrop-filter: blur(12px)` 선언을 받아들이고도 아무것도 합성하지 않기 때문에, 그 환경의 픽셀 비교는 Card Glow 에 대해 아무 말도 하지 못합니다. 이제 같은 줄무늬 위에 인라인 `backdrop-filter` 를 건 평범한 대조용 div 를 먼저 재고, 엔진이 실제로 그리는 경우에만 픽셀을 단언합니다 — 대조군이 크로미엄에서 12.9배, 나머지 둘에서 1.0배로 나오므로 크로미엄 실행이 실수로 건너뛰는 일은 없습니다.
- 메가메뉴에 **radial(방사형)** 레이아웃을 추가했습니다(`data-kt-layout="radial"`). 패널의 링크가 항목 아래에 쌓이는 대신 트리거 둘레로 부채꼴을 그리며 펼쳐집니다. `radius` 는 거리, `startAngle` 은 부채꼴이 시작하는 각도(0 이 12시 방향이고 시계 방향으로 커집니다 — 시계를 읽는 방식 그대로입니다), `sweep` 은 전체가 원의 얼마를 차지하는지, `stagger` 는 항목 사이의 출발 시차입니다. 완전한 원일 때는 마지막 한 칸을 빼서 첫 항목과 마지막 항목이 같은 자리에 겹치지 않게 합니다. 트리거·ARIA·키보드·한 번에 하나만 열림·Esc 와 바깥 클릭으로 닫힘 등 나머지 전부는 다른 두 레이아웃이 쓰는 바로 그 코드입니다. 이것이 별도 모듈이 아니라 레이아웃인 이유입니다.
- **DOM 에는 측정한 숫자만 들어갑니다.** 모듈은 각 항목의 좌표와 시차만 CSS 사용자 지정 속성으로 쓰고, 변형·접힌 상태·이징은 `kineto.css` 가 갖습니다. 그래서 페이지는 자바스크립트를 건드리지 않고도 이 고리의 모양을 바꾸거나 아예 다른 것으로 만들 수 있습니다. 여기서 나오는 것이 `--kt-menu-ring-scale` 입니다 — `radius` 는 메뉴를 만들 때 고정되지만, 데스크톱 카드에 맞춰 쓴 고리를 휴대폰에서는 더 작게 그려야 하고 그건 자바스크립트가 아니라 미디어 쿼리의 일입니다. 부채꼴은 열 때마다가 아니라 메뉴를 만들 때 한 번만 계산합니다 — 항목 수와 옵션에만 달려 있고 포인터와는 무관하기 때문입니다.
- **직접 재 보고서야 맞춘 것이 둘 있습니다.** 조금 전까지 `hidden` 이던 패널은 상자 자체가 없었고, "상자가 없는 상태"에서 출발하는 전환은 아예 실행되지 않습니다. 그래서 여는 클래스가 붙기 전에 접힌 상태를 화면에 한 번 반영해야 합니다 — 그러지 않으면 항목이 펼쳐지지 않고 제자리에 그냥 나타납니다. 또 `hidden` 은 `display:none` 이라 진행 중인 전환을 끊어 버리므로, 마지막 항목이 돌아온 뒤에야 패널이 사라질 수 있습니다. 덕분에 닫을 때 고리가 사라지지 않고 트리거 위로 접혀 들어옵니다. 새 테스트는 이 둘을 모듈이 써 넣은 속성이 아니라 `getBoundingClientRect()` 로 잰 위치에서 확인합니다.
- **variant 옵션 도출기에 `layout` 을 알려 주었습니다.** 부채꼴의 네 옵션은 `layout === 'radial'` 안에서만 읽지만, `layout` 은 분석기가 variant 운반자로 인정하는 키가 아니었습니다. 그대로 뒀다면 평범한 드롭다운의 설정 서랍에 읽지도 않는 `sweep` 컨트롤이 떴을 것이고, 그건 바로 그 스크립트가 막으려고 있는 어긋남입니다. 메가메뉴의 모든 옵션 설명도 7개 언어로 채워, 툴팁 래칫이 109개에서 103개로 줄었습니다.
- **숫자 옵션을 읽는 함수를 하나로 합쳤습니다.** `overflowText`·`rasterizer`·`states`·`presence` 가 같은 세 줄을 각자 복사해 갖고 있었고, 복사본마다 범위를 벗어난 값을 조금씩 다르게 다뤘습니다. `utils.numberOption(value, fallback, min, max)` 이 넷을 대신하면서 공통으로 있던 함정도 고쳤습니다 — `Number('')` 는 `0` 이라, 넣을 값이 없어 비워 둔 `data-kt-speed=""` 가 "속도 0" 이 되어 버렸습니다. 비어 보이는 속성 하나로 움직이지 않는 애니메이션이 나온 것입니다. 이제 빈 문자열은 아무도 주지 않은 값으로 봅니다. `labeller` 가 문구에 이미 쓰던 규칙과 같습니다.
- **당겨서 새로고침**을 Gesture 의 두 번째 동작으로 추가했습니다(`data-kt-gesture="pull"`). 스크롤 영역을 맨 위에서 아래로 당기면 내용이 저항하며 늘어나고, 호가 차오르고, 기준점을 넘겨 놓으면 페이지에 새로고침을 요청합니다. 페이지가 무엇을 돌려주든 — 프로미스든 아무것도 아니든 — 그게 제스처가 끝나는 시점을 정합니다. **컨테이너가 이미 맨 위에 있고 아래로 당길 때만** 걸리므로 평범한 스크롤이 새로고침으로 바뀌는 일이 없고, 스크린리더가 읽는 문구는 다른 모든 문자열과 마찬가지로 `labels` 맵입니다.
- **저항은 당김의 끝에 있어야 합니다.** 당연해 보이는 식(한계값을 향한 지수 감쇠 하나)은 **제스처가 시작하는 바로 그 지점에서 가장 뻑뻑해서**, 60px 기준점에 닿는 데 손가락 157px 가 필요했습니다 — 탄력 있는 게 아니라 고장 난 느낌이었습니다. 지금은 기준점까지는 직선이고 그 뒤부터만 완만해집니다: 손가락 40px 에 28px, 120px 에 79px(한계 110px).
- **제자리 확인**을 Hold 의 세 번째 모드로 추가했습니다(`data-kt-mode="tap"`). 삭제 버튼이 모달을 띄우는 대신 **스스로 확인창이 됩니다**: 처음 누르면 버튼이 준비 상태가 되고 라벨이 질문으로 바뀌며, `duration` 안에 한 번 더 누르면 확정됩니다. Escape, 다른 곳 클릭, 포커스 이탈, 시간 초과 — 넷 다 원래대로 되돌립니다. **첫 번째 누름은 아무 데도 닿지 않습니다** — 링크도, 폼 제출도, 페이지가 달아 둔 click 핸들러도. 이게 확인 장치와 장식의 차이입니다. 라벨은 기억해 둔 문자열이 아니라 **자식 노드 스냅샷**에서 복원하므로, 아이콘+글자 버튼이 글자만 남지 않고 원래 모습 그대로 돌아옵니다. 질문 문구 자체는 `labels` 맵입니다 — 라이브러리는 호스트 페이지가 무슨 언어인지 알 수 없으니까요.
- **Dock**을 Magnetic 의 두 번째 동작으로 추가했습니다(`data-kt-magnetic="dock"`). 커서 주변에서 아이콘이 확대되는 그 줄입니다. "아이콘이 커진다"와 갈리는 지점은 **줄이 다시 짜인다**는 것입니다 — 커진 아이콘이 들어갈 자리가 생기도록 줄이 벌어지고, 이웃 위로 겹쳐 자라지 않습니다. 커지는 정도는 직선이 아니라 **올림 코사인**을 따릅니다. 선형으로 줄이면 반응 범위의 끝에 각이 생겨서, 아이콘이 움직이기 시작하는 순간이 눈에 걸립니다. 전부 transform 이라 주변 레이아웃은 다시 계산되지 않고, `axis` 로 세로 독도 됩니다.
- **Fold**을 FLIP 의 이동 방식으로 추가했습니다(`data-kt-mode="fold"`). 접히는 폰이 펴질 때 화면이 넘어가는 그 동작입니다. `crossfade` 와 다른 점은 딱 하나 — **바뀌는 도중이 부드럽다**는 것입니다. 두 배치가 그냥 교차되면 사진 두 장이 바뀌는 것으로 읽히는데, 지나가는 동안 흐려지면 **하나의 면이 다시 짜이는 것**으로 읽힙니다. 새 배치는 옛 배치의 자리에서 흐린 채로 들어와 선명해지고, 옛 배치의 복사본은 **공간상 제자리를 지키며** 흐려져 사라집니다. 어느 지점에서도 툭 끊기지 않는다는 것이 손 안에서 화면 크기가 바뀌는 기기에서 이 효과가 존재하는 이유입니다. `foldBlur` 로 중간이 얼마나 흐려질지 정합니다.
- **Liquid Glass**를 Card Glow의 일곱 번째 룩으로 추가했습니다(`data-kt-card-glow="glass"`). 유리처럼 보이려면 네 가지가 필요합니다: 뒤가 흐려지고 색이 진해질 것, 빛 드는 쪽 테두리가 밝게 서고 뒤로 갈수록 사라질 것, 안쪽 윗면에 은은한 반사가 돌 것, 그리고 **가장자리에서 배경이 실제로 휠 것**. 앞의 셋은 순수 CSS라 언제나 동작합니다. 휘는 것은 패널의 크기와 모서리 반지름으로 그때그때 만든 변위맵을 SVG 필터로 `backdrop-filter`에 물리는 방식인데, 이건 현재 크로미엄에만 있어서 나머지 브라우저에서는 조용히 빠지고 앞의 셋이 룩을 책임집니다. 밝은 테두리는 포인터를 따라 돌아서, 카드를 기울이면 사진이 교차되는 게 아니라 **물체가 기울어지는** 느낌이 납니다. 필터는 패널 자신의 레이어 안에 살기 때문에 패널과 함께 사라집니다.
- 이 룩이 피해야 했던 함정: Card Glow는 다른 모든 룩에서 카드를 `isolation: isolate` 로 격리하는데, **격리된 stacking context 안의 `backdrop-filter`는 필터링할 배경 자체가 없습니다** — computed style은 멀쩡해 보이는데 유리만 완전히 투명하게 나옵니다. glass 는 격리를 건너뛰고, 검사는 스타일이 아니라 **실제로 그려진 픽셀**을 잽니다: 딱딱한 줄무늬 위에 놓인 패널의 PNG 가 옆의 맨 줄무늬보다 **11배** 큽니다(필터가 안 먹으면 1배, 그냥 단색으로 덮으면 1배 미만).
- Card Glow 설정 서랍이 **존재하지 않는 `pointer` 글로우**를 보여 주던 것을 고쳤습니다. 고르면 조용히 기본 spotlight 가 나왔고, 정작 실재하는 `edge` 는 서랍에서 고를 수가 없었습니다.
- **Squircle**(54번째 모듈)을 추가했습니다. 애플의 모서리는 원이 아니라 초타원입니다 — 변은 더 평평하고 끝에서 더 급하게 꺾입니다. 그냥 `border-radius`를 준 카드가 아무리 해도 iOS처럼 안 보이는 이유가 이것입니다. CSS에 `corner-shape`가 생겼지만 2026년 9월 기준 **크로미엄 전용**이라 Safari·Firefox에서는 아예 그릴 방법이 없습니다. `data-kt-squircle`은 되는 곳에서는 진짜 속성을 쓰고, 안 되는 곳에서는 `clip-path` 윤곽으로 **같은 곡선**을 그립니다: `squircle`·`round`·`bevel`·`scoop`·`notch`·`square`, 그리고 그 사이의 모든 `superellipse(K)`. 반지름을 따로 주지 않으면 요소에 이미 걸린 `border-radius`를 그대로 살리므로 디자인 시스템이 계속 정본입니다. 테두리는 모서리에서 잘려 나가는 대신 같은 곡선을 따라 다시 그리고, 상자 크기가 바뀌면 윤곽도 다시 그립니다.
- 모양을 맞추려면 **재 봐야만** 알 수 있었던 것이 셋 있었고, 셋 다 명세를 읽어서가 아니라 크로미엄의 `corner-shape`와 나란히 놓고 비교해서 찾았습니다. ① 폴리필이 `border-radius`를 그대로 둬서 클립이 둥근 모서리와 **교집합**이 되었고, 그 결과 스퀘어클이 그냥 둥글게 나왔습니다 — 사람들이 실제로 원하는 그 하나가 조용히 아무 일도 안 하고 있었습니다. ② 음수 `superellipse(K)`는 지수를 분수로 넣는 게 아니라 양수 곡선을 **거울로 뒤집은** 것이고, 둘은 실제로 다른 모양입니다. 측정값으로 `scoop`은 45° 대각선을 반지름의 75%가 아니라 **70.7%**에서 지납니다. ③ 양 끝에서는 `Math.cos(Math.PI / 2)`가 0이 아니라 6.1e-17이고 여기에 아주 작은 지수를 씌우면 0.98이 되어, `notch`가 자기 모서리에 닿지 못하고 막대 모양으로 무너졌습니다.
- 설정 서랍의 툴팁 검사가 **서랍 전체**를 보게 했습니다. 예전에는 `demo/playground.js`의 첫 번째 `FIELDS` 리터럴만 읽어서 서랍이 실제로 만드는 50개 모듈 중 32개만 검사했습니다. 나머지는 아래쪽에서 `Object.assign`으로 붙는데, 거기에 추가한 옵션은 (?)가 하나도 없어도 검사는 "0 gaps"라고 답했습니다. 이제 실제 스크립트를 실행해 스크립트가 내놓는 목록을 읽고, 그러자 **16개 모듈 110개 옵션**이 한 번도 툴팁을 가진 적이 없다는 사실이 드러났습니다. 이 목록은 **줄어들기만 하는 래칫**으로 명시해 두었습니다 — 툴팁을 써 놓고 목록에서 지우지 않아도 새 누락과 똑같이 빌드가 실패합니다.
- 움직이는 질감은 멈출 수 있게, 멈춰 있는 질감은 움직일 수 있게 했습니다. Stylize 에 `motion` 옵션은 원래 있었지만 **만들 때 한 번** 고르는 값이라, 끄려면 효과를 부수고 다시 만들어야 했고 그때마다 그림이 다시 디코딩되며 깜빡였습니다. 이제 `Kineto.updateModule(img, 'stylize', { motion: 'none' })` 가 돌아가는 효과를 제자리에서 바꿉니다 — 같은 캔버스, 깜빡임 없음. 프레임 루프도 같이 멈추므로 멈춘 룩은 비용도 멈춥니다(측정: 돌아갈 때 600ms 에 12프레임 이상, 멈춘 뒤 0프레임). 반대 방향도 같아서 정지해 있던 디더·ASCII·하프톤을 움직이게 할 수 있고, 꺼 둔 동안 속도는 기억하므로 다시 켜면 같은 속도로 이어집니다. 인스턴스는 **실제로 적용된** 모션을 `motion` 으로 알려 줍니다. 사용자가 '동작 줄이기'를 켜 두면 마크업이 요청한 것과 달라지기 때문이며, 페이지가 만든 모션 스위치가 마크업을 보고 추측하는 대신 사실을 말할 수 있습니다. 데모의 질감 카드 다섯 개에 그 스위치를 달았습니다.
- 모듈이 옵션 변경을 **거절**할 수 있게 했습니다. 예전에는 "이 값은 제자리에서 못 바꾼다"를 알릴 방법이 예외를 던지는 것뿐이었고, 오류가 아닌 일에 오류 로그가 남았습니다. 이제 `update()` 가 `false` 를 돌려주면 `updateModule()` 이 조용히 인스턴스를 다시 만듭니다 — `update()` 가 아예 없는 모듈과 같은 결과입니다. Stylize 가 첫 사용자로, 살아 있는 룩 옵션은 제자리에서 받고 나머지는 재생성을 요청합니다.
- Pixel Shift 를 글자 위에만 둡니다. 효과가 요소 상자를 기준으로 삼았는데 블록은 100% 폭이라, `PIXEL ERROR` 가 짧은 두 줄로 접히면 글자 옆 빈 공간에서도 조각과 노이즈가 터졌습니다. 효과가 글자가 아니라 블록에 걸린 것처럼 보이던 이유입니다. 이제 글자가 실제로 차지하는 줄 사각형에서 계산합니다. 검사용 고정 예제에서 예전에는 28개 중 12개가 그 빈 공간에 떨어졌고, 지금은 하나도 없습니다.
- Data Mosaic 을 실제 모자이크로 만들었습니다. `tileMax` 칸마다 같은 배율로 쪼개다 보니 타일이 한 가지 눈금으로 수렴했고, 48px 칸에 6px 바닥을 줘도 결과가 **두 가지 크기**로만 나와 모자이크가 아니라 규칙적인 격자로 읽혔습니다. 이제 재귀 분할로 만들어 굵은 덩어리와 고운 알갱이가 한 화면에 섞이고, 버스트마다 배치를 새로 잡아 같은 그림을 반복하지 않습니다. `tileMin`·`tileMax` 가 그 범위이고 데모 카드가 이제 그것을 드러냅니다.
- RGB Slice Burst 를 사진에서 다시 만들었습니다. 예전에는 단색 띠를 얹고 사라지게 할 뿐이라 움직임도 없고 사진과 아무 관계도 없어서, 글리치라기보다 디버그 오버레이에 가까웠습니다. 이제 슬라이스가 **사진 자신**을 채널 색으로 곱한 사본이고, 좌우로 밀려 몇 프레임 튑니다. 대부분은 몇 px 만 어긋나 대비 경계에 색 테두리를 만들고 일부만 크게 찢어지며, 레인을 섞어 프레임 대부분은 깨끗하게 남깁니다.
- 디더 리빌이 점이 아니라 덩어리로 걷히게 했습니다. `dissolve` 가 셀마다 독립 난수로 지워서 전환 중간에 사진 위에 고립된 흑백 셀만 흩어져 남았습니다 — 디더가 걷히는 것이 아니라 사진에 때가 낀 모습이었습니다. 이제 굵은 격자에서 보간한 값으로 차례를 정해, 자글자글한 가장자리를 유지한 채 지역 단위로 걷힙니다. 이웃 셀 간 차이가 평균 0.07 로, 셀 단위 난수의 0.34 와 확연히 다릅니다.
- 데모에서 Radial 하위 호환 카드를 뺐습니다. `data-kt-radial` 이 Slider 의 radial 효과로 들어가는 또 다른 입구라는 설명뿐이라 같은 캐러셀을 두 번 보여 주고 있었고, 전체 폭 카드 두 장 때문에 Native Scroll Snap 카드가 한 줄을 혼자 쓰고 있었습니다. 이제 Radial Carousel 카드가 그 옆에 서고, `radial` 의 홈이자 비교 시트의 소재를 겸합니다. `data-kt-radial` 자체는 그대로 공개 API 입니다.
- Blur Text 의 일시정지가 실제로 멈추게 했습니다. Kineto 는 탭이 숨겨지면 활성 인스턴스를 멈춘다고 약속하는데, Blur Text 의 `pause()` 는 GSAP tween 만 붙잡고 있었습니다. GSAP 을 아직 가져오지 않은 상태(그리고 끝내 불러오지 않는 페이지)에서 도는 native 경로는 글자마다 `setTimeout` 을 걸어 차례로 띄우는데, 그것을 멈추는 것이 아무것도 없어서 숨긴 탭에서도 글자가 계속 나타났습니다. 이제 일시정지가 그 예약들을 **남은 지연과 함께** 붙잡고, 재개할 때 남은 만큼만 다시 겁니다 — 처음으로 되돌아가 이미 나타난 글자가 다시 튀지 않습니다.
- 아무 일도 일어나지 않은 이유를 말해 줍니다. 요소가 `data-kt-*` 로 모듈을 요청했는데 모듈이 그 마크업에는 붙을 수 없다고 판단하면(tablist 없는 Tabs, 슬라이드 없는 Slider 등) `create()` 가 null 을 돌려줍니다. 오류가 아니라서 예외도 콘솔 출력도 화면 변화도 없었고, 작성자에게는 "동작하지 않는다"만 남았습니다 — 모듈 소스에 이런 자리가 78곳입니다. 이제 `KT_NOT_APPLICABLE` 진단이 어느 모듈이 어느 요소에서 물러났는지(`div#pricing.card`) 알려 주므로, `debug` 를 켜면 어떤 요소를 확인해야 하는지 바로 보입니다. 진단은 opt-in 이라 요청하지 않은 페이지는 완전히 조용하고, `detail` 에는 페이지 텍스트 없이 작성자가 검색할 수 있는 짧은 식별자만 담습니다.
- 요소를 만나기 전 모습 그대로 돌려줍니다. `destroy()` 가 리스너·타이머·생성한 노드는 되돌렸지만, 마크업에 직접 써 넣은 것까지는 아니었습니다. 가장 심한 것은 Tabs 였습니다 — destroy 뒤에도 `role="tab"`·생성한 id·`aria-controls`·`aria-selected`·`tabindex`·인디케이터 span 이 그대로 남아, 스크린 리더에는 완전히 동작하는 탭 위젯으로 들리는데 아무 반응도 하지 않았습니다. 손대지 않은 것보다 나쁜 상태입니다. Drag 와 Switch 는 `tabindex="0"` 을 남겨 동작이 사라진 뒤에도 요소가 탭 순서에 머물렀고, Bottom Sheet 는 자기가 지은 접근성 이름을 남겼습니다. Scroll Shadows 는 `overflow` 를 **바꾼 뒤에** 스냅샷을 찍어 자기 변경을 "원래 값"으로 기억했고, 그래서 요소가 영영 스크롤 컨테이너로 남았습니다. Card Glow 와 Accordion 은 손댄 자식에게 `style=""`·`class=""` 라는 빈 껍데기를 남겼습니다. 이제 각자 **쓰기 전에** 기억하며, 이미 있던 스냅샷 헬퍼를 그대로 씁니다. 빈 껍데기는 새 `dropEmptyAttributes` 가 정리합니다.
- leak 검사에 더 어려운 질문을 시킵니다. 예전에는 53개 중 8개 모듈의 리스너·RAF·observer 만 봤습니다. 이제 create 전과 destroy 후의 **요소 마크업 자체**를 비교하고, `document.body` 와 `document.head` 를 확인하며, `destroy()` 를 한 번 더 불러 안전한지까지 봅니다 — 대상은 33개 모듈입니다. 몇 개만 보는 검사는 "안전"처럼 보이지만 실제로는 "확인하지 않음"입니다. 위의 결함은 전부, 질문이 바뀌기 전까지 이 검사에 보이지 않았습니다.
- Lightbox 의 스타일시트와 썸네일 이름도 함께 나가게 했습니다. 공유 뷰어는 마지막 인스턴스가 사라질 때 이미 치우고 있었지만, 같이 주입한 `<style id="kt-lightbox-style">` 는 세션 내내 `document.head` 에 남았습니다 — 라이트박스를 한 번이라도 연 페이지마다 죽은 CSS 가 붙어 있던 셈입니다. 썸네일 이름도 숫자 하나뿐이라 스크린 리더가 "3, 버튼"이라고만 읽어 위치를 알 수 없었는데, 이제 같은 `labels` 지도를 통해 "Item 3 of 12" 로 읽힙니다. leak 검사도 함께 넓혔습니다 — `document.body` 뿐 아니라 `document.head` 까지 보고, 모듈 destroy 가 건드리면 안 되는 단 하나(라이브러리 런타임 스타일시트)를 이름으로 명시하며, 검사 대상이 8개에서 33개 모듈로 늘었습니다. 대상이 좁았던 것이 Toast 의 남는 region 을 오래 못 본 이유입니다.
- Toast 알림 region 을 마지막 인스턴스와 함께 걷어냅니다. 공유 `role="region"` 컨테이너를 첫 토스트에서 `document.body` 에 붙인 뒤 한 번도 지우지 않아서, 알림을 한 번이라도 띄운 페이지에는 그 세션 내내 빈 "Notifications" 랜드마크가 접근성 트리에 남았고 `destroy()` 가 자기가 바꾼 문서를 되돌리지 않았습니다. 이제 Lightbox 가 공유 뷰어에 이미 쓰고 있는 방식 그대로 참조 수를 셉니다 — 아직 띄울 수 있는 인스턴스가 있으면 남고, 마지막 하나가 사라질 때 지워집니다. `destroy()` 는 그 인스턴스가 띄워 둔 토스트도 타이머에 맡기지 않고 함께 걷어내므로, SPA 에서 화면을 떠난 컴포넌트의 알림이 계속 떠 있지 않습니다. leak 검사는 이제 리스너·RAF·observer 뿐 아니라 destroy 뒤의 `document.body` 까지 봅니다 — 지금까지 보지 못하던 종류의 잔여물입니다.
- 라이브러리가 페이지가 바꿀 수 없는 문구를 지어내지 않게 했습니다. Bottom Sheet의 높이 조절 그립이 한국어 `title`을 하드코딩하고 있어서, `resizable`을 켠 모든 사이트가 방문자 언어와 무관하게 한국어를 보여 주었습니다 — `src/`에 남아 있던 마지막 사용자 대면 한국어 문자열이었습니다. 슬라이더 점("Go to slide 3")·자동재생 일시정지 버튼·Fullpage 점·Toast의 region과 닫기 버튼·Lightbox의 컨트롤 이름 12개는 영어로 박혀 있어, 한국어나 일본어 페이지 한가운데에서 스크린 리더가 영어를 읽었습니다. 이제 모듈마다 `labels` 지도 하나를 공개하고(`utils.labeller`) 기본값은 문서에 적힌 영어 그대로라 페이지가 요구하지 않으면 아무것도 달라지지 않습니다. `{n}`·`{total}` 자리표시자는 기존 `{value}` 규칙을 따르고, 마크업에서는 JSON 속성으로 바로 됩니다: `data-kt-labels='{"dot":"슬라이드 {n}으로 이동"}'`. Bottom Sheet는 다른 컨트롤이 없어 툴팁만 있는 `resizeLabel` 옵션으로 두었습니다(`''`이면 툴팁 없음). `tests/control-labels.mjs`가 양쪽을 지킵니다 — 모듈이 말을 지어내는 순간 빌드를 떨어뜨리는 소스 검사와, 기본값이 실제로 나가고 넘긴 지도가 이기는지 보는 실제 마운트 검사입니다.
- 데모의 툴팁을 번역합니다. 데모에는 본문과 접근성 이름을 번역하는 경로는 있었지만 `title` 경로가 없어서, 재생 버튼 3개와 시트 그립의 툴팁이 나머지 6개 언어에서 한국어로 남았습니다 — 같은 버튼인데 스크린 리더와 마우스 사용자가 서로 다른 이름을 받았습니다. 이제 툴팁도 접근성 이름 바로 옆의 선언형 경로 `data-demo-i18n-title`을 쓰고, 모듈 옵션으로 들어가는 문구는 `data-demo-i18n-option`으로 선언하며, back-to-top 링만을 위해 손으로 적어 두었던 모듈별 특수 처리는 사라졌습니다. 데모 QA는 `aria-label`과 똑같이 `title`을 검사하고, 실패하면 어느 요소인지 함께 알려 줍니다.
- Native Reveal의 반복과 네 방향 viewport 경계 콜백을 연결하고 Replay·일시정지 후에도 역재생과 감지를 유지합니다. 자체 transform으로 경계에서 재진입이 반복되지 않도록 하고, 기존 잘림 영역 감지기를 공유하며 작성자 DOM과 애니메이션 정리를 보존합니다.
- 비교 영역의 접근성 이름이 모듈 제목과 번역된 버튼 문구를 참조하도록 하여 언어 변경 후에도 처음 언어로 남지 않게 수정했습니다.
- 뒤로가기가 페이지를 파괴하던 Page Transition 버그를 고쳤습니다. 해시만 다른 history 항목은 브라우저가 이미 끝낸 같은 문서 안의 이동인데, 모듈이 그때도 URL을 다시 가져와 컨테이너를 갈아 끼웠습니다. 그래서 로드 이후에 페이지가 만든 것이 전부 사라졌습니다. 데모에서는 두 번의 클릭이면 재현됐습니다 — 사이드바에서 모듈을 열고 뒤로가기를 누르면 모듈 블록 53개·설정 패널 227개·비교 시트 34개가 전부 0이 됐습니다. 클릭 경로에는 원래부터 해시 전용 URL을 거르는 규칙이 있었고, 이제 history 이동도 같은 규칙을 따릅니다. 경로가 실제로 바뀌면 여전히 전환합니다. `tests/browser/page-transition-hash.mjs`가 양쪽을 함께 지킵니다.
- 비교 시트를 주소로 가리킬 수 있게 했습니다. 열면 주소가 `#cmp-<모듈>`이 되고 닫으면 `#mod-<모듈>`로 돌아옵니다. "Reveal 프리셋 23개 다 보고 뭐가 나은지 얘기하자"를 링크 하나로 보낼 수 있습니다. 시트는 이름이 있는 region이고 Esc로 닫으면 포커스가 버튼으로 돌아오며, 스크롤 관찰자가 열린 시트의 주소를 덮어쓰지 않습니다.
- 이미지 Stylize의 지연·재생·완료 대기 시간을 일시정지와 숨김 탭에서 보존하고 RAF·타이머를 중단합니다. 정지 이미지 크기 변경·중단 중 재재생을 재개까지 보류하고 콜백 재진입을 보호합니다. Core는 명시적 인스턴스/전체 일시정지를 탭 숨김과 구분하며, 종료한 공개 API의 재실행도 차단합니다.
- Stylize 영상 리빌의 실행 조건, 로드 전 수동 재생 요청, 지연·완료 대기 시간을 반영했습니다. 모듈·영상 일시정지와 숨김 탭에서 RAF를 중단하고 진행 시간을 보존하며, 콜백에서 종료한 효과의 완료·재예약을 차단했습니다. 기존 기본값과 Lazy 별칭은 유지합니다.
- 연동 지도에 새 질감을 가르쳤습니다. `media-texture` 의도에 레시피 4개(사진용 `noise` 디더, `cluster` 인쇄 스크린, 45도 신문 망점, 속이 빈 링 스크린)와 "취향이 아니라 대상에 따라 `ditherType`을 고르라"는 지침, 그리고 에이전트가 실제로 입력하는 키워드(newsprint·risograph·screen angle·신문·인쇄물)를 추가했습니다. 이게 없으면 "인쇄물처럼 보이는 사진" 요청을 받은 에이전트가 `cluster`나 `halftoneAngle`의 존재를 알 길이 없어 셀 크기만 줄이게 됩니다.
- 모션 축소 환경에서 Stylize의 질감은 유지하고 추가 모션·포인터 반응은 비활성화했습니다. 이미지·영상의 중복 종료를 막고 렌더링·진행 콜백에서 종료한 이미지 컨트롤러가 작업을 재예약하지 않도록 브라우저 회귀 검사를 추가했습니다.
- Stylize가 실제로 그릴 수 있는 그림을 넓혔습니다. `ditherType`에 `16x16`·`cluster`·`noise`를 추가했고, Bayer 행렬은 표 세 개를 적어 두는 대신 재귀 배가 규칙으로 생성합니다(새 크기는 한 줄). `cluster`는 점이 셀 가운데에서 한 덩어리로 자라는 인쇄 스크린이고, `noise`는 "엉성해 보인다"에 대한 답입니다 — 반복되는 타일이 아예 없어서 2~3px 셀의 사진이 8x8 격자 무늬가 아니라 질감으로 보입니다. 데모의 Living Grain 카드가 이 패턴을 씁니다.
- 하프톤에 제대로 된 도형과 스크린 각도를 주었습니다. `halftoneShape`에 `cross`·`diamond`·`ring`·`triangle`을 더했고, 새 `halftoneAngle`은 망점 격자 자체를 기울입니다. 인쇄가 판을 기울이는 이유와 같고, 격자가 표처럼 읽히는 것을 없애는 가장 큰 요인입니다. 각도를 바꿔도 단위 면적당 잉크 양은 같습니다(실측: 0~90도에서 평균 휘도 201.5~202.4).
- 모든 motion이 모든 룩에서 움직입니다. `drift`는 정렬 행렬을 미는 방식이라 행렬이 없는 룩 — 오차 확산·`random`·`noise` 디더와 halftone — 에서는 아무 일도 하지 않았고, 그건 "옵션이 동작하지 않는다"로 보입니다. 이제 그런 룩에는 부드럽게 이동하는 톤 파동을 더합니다. 여기서 셀마다 난수를 뽑으면 그림이 녹아내린다는 것은 이 렌더러가 이미 한 번 배운 함정입니다. `tests/browser/stylize-patterns.mjs`가 룩 × motion 30개 조합을 전부 재생해 보고, 멈춰 있는 조합이 있으면 실패합니다. 반대로 `none`이 움직여도 실패합니다.
- 마지막 7개 공개 variant에 전용 데모 카드를 주었습니다 — Lazy `data-mosaic`·`rgb-slice-burst`, Cursor `blob`, Glitch `noise`·`crt`·`reveal`·`rgb-slice-burst`. 그리고 지원 중단 예정 alias는 전용 카드 대상에서 뺐습니다. deprecated variant는 한 minor 동안 계속 동작하지만 계약의 입장은 "이제 쓰지 마세요"라서, 선택지처럼 보이는 전용 카드를 주면 그 입장과 어긋납니다. 대신 비교 시트가 "지원 중단 예정" 배지와 함께 보여 줍니다. 감사는 이제 살아 있는 variant를 분모로 세고, deprecated에 카드가 생기면 실패합니다: 81/81.
- 비교 시트의 다시 재생을 데모가 이미 쓰는 컨트롤로 되돌렸습니다. 타일 폭이 210px이라 텍스트 버튼이 마크업 아래로 줄바꿈되어 지저분했고, 같은 동작에 디자인이 두 개가 되는 문제도 있었습니다. 데모 카드가 무대 위에 띄우는 원형 아이콘을 그대로 씁니다.
- 스냅샷을 필요한 만큼만 복제합니다. 시트는 페이지를 여는 순간 모듈마다 후보를 최대 12개씩 복제했고(총 135개), 실제로 필요한 건 그 모듈의 variant가 요구하는 능력마다 하나씩 — 대부분 1개, 많아야 3개입니다. 이제 28개이며 게이트가 그 상한을 지킵니다.
- 모듈 블록마다 **모든 variant 비교** 시트를 추가했습니다. 한 번 누르면 그 모듈의 공개 variant가 전부 같은 소재 위에 펼쳐지고, 타일마다 그대로 붙여넣을 마크업이 붙으며, **전체 다시 재생**으로 한꺼번에 돌려 볼 수 있습니다. 소재는 시트용으로 새로 만든 것이 아니라 데모의 카드를 Kineto 초기화 전에 복제해 둔 것이고, variant마다 계약이 이미 선언해 둔 요구 조건으로 고르기 때문에 Glitch의 `rgb`는 텍스트 카드를, `datamosh`는 이미지 카드를 가져갑니다. 211개 중 168개가 나란히 살아 움직이고, `pageReveal`·`loader`는 한 번에 하나만 화면에 띄울 수 있어 데모가 이미 가진 컨트롤로 넘기며, variant가 한 옵션이 아니라 옵션 조합인 8개 모듈은 그 이유를 타일에 적습니다. `npm run test:variant-compare`는 새 variant에 소재도 컨트롤도 기록된 이유도 없으면 빌드를 떨어뜨립니다 — 로드맵이 약속한 검수 화면에서 variant가 조용히 빠지는 길이 없어졌습니다.
- Stylize의 색이 디자인 토큰을 그대로 받습니다. `data-kt-ink-color="var(--fg)"`가 페이지의 사용자 정의 속성으로 해석되며, 효과가 붙은 요소 기준으로 읽기 때문에 섹션이 토큰을 덮어써 테마를 바꾸면 그 안의 효과도 따라갑니다. `var(--x, 폴백)`도 CSS와 동일하게 동작합니다. 디자인 시스템은 hex로 베껴 적을 게 아니라 가리켜야 합니다.
- deprecated 마크업의 원본을 기능 계약 하나로 모았습니다. `kineto.features.json`에 `deprecatedVariants`를 두고, `kineto.integrations.json`에는 대체 마크업과 이유를 담은 `deprecations` 블록을 필수로 추가했으며, 생성되는 AI 규칙에 "이제 이건 생성하지 마세요" 표가 들어가고 module reference에도 표시됩니다. 계약이 deprecated로 표시한 variant에 대해 지도가 대체안을 주지 않으면 CI가 실패합니다.
- `media-texture` 의도에 살아 있는 효과 레시피를 추가했습니다. "살아 움직이는 이미지", "포인터에 반응하는" 같은 요청을 받은 에이전트가 직접 canvas 효과를 만들어 내는 대신 `motion`·`pointer`를 찾도록 했습니다.
- 스타일 효과를 선명하게 만들었습니다. 격자를 항상 device pixel 정수 배로 배치합니다. CSS 픽셀 기준이면 한 셀이 2.4 device pixel에 걸쳐 어떤 셀은 2px, 옆 셀은 3px이 되고, 이 불균일이 디더·하프톤을 뿌옇고 어른거리게 만든 원인이었습니다. 이제 모든 점이 같은 크기입니다.
- Stylize에 `contrast`·`brightness`를 추가했습니다. 사진은 대부분 중간 톤이라 그대로 디더하면 회색 죽이 됩니다. 인쇄물 같은 질감은 렌더링 문제가 아니라 이 조절값이 없어서 안 나오던 것이고, 대비를 올리는 것만으로 형태가 또렷해집니다.
- Stylize에 `motion`을 추가했습니다. 정지 이미지에서도 효과가 한 번 그려지고 멈추는 대신 계속 움직입니다. `drift`는 정렬 행렬이 기어가며 필름 그레인처럼 일렁이고, `shuffle`은 밝기가 비슷한 글자끼리 계속 교체되며(살아 있는 터미널), `scan`은 밴드가 훑고, `flow`는 격자가 흐르고, `pulse`는 노출이 숨 쉽니다. 속도·세기는 `motionSpeed`·`motionAmount`로 조절합니다. `drift`가 셀마다 임계값을 다시 뽑지 않고 행렬을 이동시키는 이유는, 임계값을 무작위로 다시 뽑으면 정렬 디더가 랜덤 디더가 되어 사진이 노이즈로 녹아내리기 때문입니다.
- Stylize에 `pointer`를 추가했습니다. `lens`는 커서 아래 원형 영역만 `pointerCellSize` 격자로 다시 그려 가리킨 곳이 선명해지고, `spotlight`는 주변에 잉크를 더하며, `ripple`은 커서에서 물결을 퍼뜨립니다.
- Stylize 리빌에 `transition`을 추가하고 기본값을 `dissolve`로 바꿨습니다. 기존 `shrink`는 셀 크기를 줄여 나가기 때문에 리빌 중간이 항상 절반 해상도의 흐릿한 상태였습니다. `dissolve`는 작성한 셀 크기를 유지한 채 셀 단위로 걷어내고, `wipe`는 같은 방식에 대각선 경계를 더합니다. `shrink`는 deprecated Lazy alias의 기본값으로만 남습니다.
- Stylize 데모를 효과의 성격에 맞게 다시 짰습니다. 살아 있는 그레인 디더, 계속 바뀌는 ASCII 인물, 포인터 렌즈, 컬러 오차 확산, 스캔 밴드가 지나가는 하프톤 영상, 그리고 지연 로딩된 이미지의 디더가 셀 단위로 걷히는 카드 — 로딩 사례를 Lazy variant가 아니라 제대로 된 방식으로 보여 줍니다.
- 이미지·영상 그래픽 질감 모듈 `stylize`(`data-kt-stylize`)를 추가했습니다. `dither`·`ascii`·`halftone`이 미디어를 canvas 레이어에 그리며, `mode: persist`(기본값 — 미디어가 살아 있는 내내 유지되고 크기 변화에 다시 그리며 애니메이션 소스와 `<video>`는 프레임마다 다시 그립니다)와 `mode: reveal`(`load`·`view`·`manual` replay에서 한 번 재생하며 셀을 줄여 원본으로 이어집니다)을 지원합니다. 세 효과는 Lazy에서 이 모듈로 옮겨 왔습니다. Lazy가 하는 일은 이미지를 *가져오는* 것이고 이 셋은 이미 있는 픽셀을 다시 그리는 것이라, 애초에 Lazy의 variant가 아니었습니다. 소유자 요구사항 MK-STYLIZE-001로 고정했고 세 엔진 `tests/browser/stylize.mjs`로 증명합니다.
- `data-kt-lazy="dither|ascii|halftone"`은 한 minor 동안 deprecated alias로 그대로 동작합니다. Stylize와 같은 rasterizer·lifecycle을 쓰므로 결과 픽셀이 동일하고, `debug`를 켠 소비자에게 대체 속성을 알리는 `KT_DEPRECATED` 진단을 한 번 보냅니다. Kineto의 첫 deprecation이며 `docs/diagnostics-and-deprecation.md`에 migration 예제를 함께 넣었습니다. 두 모듈을 한 요소에 붙일 수 있고, Stylize는 Lazy가 만든 wrapper를 재사용합니다.
- 모듈마다 카테고리를 정확히 하나씩 선언하게 하고, 데모의 섹션·사이드바 그룹·모듈 인덱스를 전부 그 선언에서 생성합니다. 기존에는 카테고리가 세 곳에 손으로 적혀 있어 이미 어긋나 있었습니다. `marquee`는 사이드바에서 Media인데 카드는 Text 섹션에, `coverReveal`은 사이드바 Media·페이지 Scroll에, `ripple`은 사이드바 Pointer·페이지 Feedback에 있었습니다. 데모에 **Effects** 섹션(Stylize·Glitch·Brush Reveal·Ambient Media)을 추가해 대상별로 나눠 보여 주고, `textFill`은 Text로, 포인터로 구동하는 카드들은 Pointer로 옮겼습니다. 판단 순서는 `docs/module-taxonomy.md`에 기록했고, `npm run test:taxonomy`가 카테고리 미선언·대표 카드 중복·선언과 다른 섹션 배치를 CI에서 막습니다.
- `radial`에 `data-kt-radial`을 쓰는 전용 데모 카드와 내비게이션 항목을 주었습니다. 공개 모듈인데도 Slider의 radial 효과로만 시연되어 데모 집계에서 손으로 보정해야 했습니다.
- `window`는 있는데 `navigator` 전역이 없는 환경(DOM shim, Node 21 미만 테스트 런타임; Node 21+는 전역 navigator를 제공)에서 `Kineto.env`가 `ReferenceError: navigator is not defined`를 던지던 문제를 고쳤습니다. 환경 감지가 navigator 부재를 일반 브라우저로 취급합니다. 첫 v0.11.0 CI에서 `tests/observe.mjs`를 통해 Node 20.19 엔진 계약 job이 실패한 원인이며, 테스트도 브라우저처럼 jsdom의 navigator를 노출합니다.
- Dependabot이 `tests/integrations` fixture의 메이저 업데이트를 제안하지 않습니다. 그 fixture의 UI 라이브러리 메이저는 연동 지도가 문서화한 버전이므로, 새 메이저는 실패하는 자동 PR 대신 문서·테스트와 함께 수동으로 검토합니다.

## [0.11.0] - 2026-09-19

### English

<!-- Add matching English release bullets here. -->
- Add `Kineto.observe(root?, { scan, attributes })`, the 29th Core API: a MutationObserver-based live-DOM mode that scans the root once, attaches modules to `data-kt-*` elements added later (batched per microtask), releases the instances of elements that leave the DOM, optionally reacts to `data-kt-*` attribute changes, stays idempotent per root, returns an inert handle during SSR, and is disconnected by a global `destroy()`. Covered by `tests/observe.mjs` and typed in `types/index.d.ts`.
- Add the integration map `kineto.integrations.json` (+ JSON schema): twelve ecosystems (vanilla, shadcn/ui, Tailwind, Bootstrap 5, MUI, Mantine, Chakra UI, Ant Design, daisyUI, Nuxt UI, PrimeVue, Vuetify) with attach patterns, what each library already provides and the combinations to avoid; thirty design intents (hero headline, section entrance, card hover, KPI number, image loading, dialog enter/exit, toast, marquee, page transition …) with contract-validated recipes, English/Korean keywords and Figma layer-name patterns; and a Figma MCP workflow. `npm run integrations:build` generates `docs/integrations/*.md`, the agent rules `ai/kineto.rules.md`, the Cursor rule `ai/cursor/kineto.mdc`, `site/llms.txt` and `site/ai/kineto.rules.md`; `tests/integrations-contract.mjs` checks every recipe, attribute and snippet against the feature contract and fails when a generated file is stale.
- Publish a shadcn registry from the demo site (`registry/` → `site/r/registry.json` + `site/r/<name>.json`, namespace `@kineto` → `https://kineto.dongri.me/r/{name}.json`): typed React wrappers `provider` (mounts `Kineto.observe()`), `reveal`, `text-reveal`, `counter`, `image`, `marquee`, `tilt-card`, `magnetic-button`, `presence`, `page-reveal`, the shared `utils` lib and an `ai-rules` item that installs the Cursor rule and Markdown rules into a project. `scripts/build-registry.mjs` validates the sources (kebab names, `'use client'`, URL-form registry dependencies, scoped package imports) and `npm run build` regenerates the site copies.
- Prove the map against the real libraries in a new locked fixture `tests/integrations/` (`test:integrations`): MUI, Mantine, Chakra UI and Ant Design components forward `data-kt-*` props (server render → jsdom → `Kineto.scan()`), a React client render is attached and released by `Kineto.observe()`, Vuetify and PrimeVue let attrs fall through under SSR, every registry component type-checks under strict TypeScript with the real React types, and the shadcn CLI installs the items into a fresh project both by URL and through the `@kineto` namespace.
- Add a Bootstrap 5 coexistence example (`examples/bootstrap/index.html`: sticky navbar with a Kineto reading-progress bar, `textSplit` hero, modal trigger with `ripple` + `magnetic`, Bootstrap-only tooltip, staggered KPI counters, tilt/glow cards with `lazy` images, a Bootstrap carousel and accordion left to Bootstrap, a marquee, dynamic cards and toasts) and drive it in Chromium (`tests/integrations/bootstrap-qa.mjs`): the pinned CDN files must match the installed `bootstrap` package byte for byte (SRI verified offline), Bootstrap keeps owning modal focus, tooltip, accordion and carousel while Kineto instances live on the same elements, `observe()` attaches to and releases dynamic cards/toasts, `destroy()` leaves Bootstrap intact, and no library logs an error.
- Add the Kineto MCP server package `packages/kineto-mcp` (`@dong-gri/kineto-mcp`, stdio only, not yet published): `kineto_suggest`, `kineto_figma_layers`, `kineto_snippet`, `kineto_validate_options` (with "did you mean" hints), `kineto_module`, `kineto_list_modules`, `kineto_ecosystem`; resources `kineto://rules|integrations|features|meta`; prompt `kineto_apply_motion`. It answers from contract copies synced by `scripts/build-mcp.mjs` (checked by the contract test), validates every input with bounded schemas, and is exercised end to end over stdio by `npm run test:mcp` in CI.
- Scope the Pages deploy concurrency group to real deploys (`demo-site-main` for `main` pushes and manual dispatch, a run-scoped group otherwise): a Dependabot-branch CI completion previously entered the shared `demo-site` group as a skipped `workflow_run` and cancelled the in-flight v0.10.0 deploy, leaving kineto.dongri.me on the previous build. Locked by `tests/release-automation.mjs`; RELEASING documents the re-deploy path.
- Extend the repository gates to the new packages: audited lockfiles, Dependabot, lockfile-boundary (publishable package kind) and supply-chain floors (picomatch is now checked per major line — the shadcn CLI still needs the patched 2.3.2 line via micromatch), `test:observe`/`test:integrations`/`test:mcp` in `test:node` and both workflows, ESLint over the fixture and the MCP package, and README (all seven languages), docs index, getting started and the AI prompt guide now cover `observe()`, the integration guides, the registry and the MCP server. The React/Vue/jQuery example READMEs install the scoped `@dong-gri/kineto` package instead of the unscoped name.
- Record the verified v0.10.0 release: successful CI and Release runs, byte-identical npm/GitHub tarballs with matching provenance subject and release commit, and the cancelled canonical Pages deploy with its cause and fix.
- Give the MCP server its own release path: `scripts/release-targets.mjs` maps tag prefixes to packages (`v*` → `@dong-gri/kineto`, `mcp-v*` → `@dong-gri/kineto-mcp`), `npm run release:ship` routes through it, `scripts/check-mcp-release.mjs` validates tag ↔ version, byte-identical contract copies, the package changelog and the bilingual note, and `.github/workflows/release-mcp.yml` verifies the tagged source, packs one digest-checked tarball and publishes it with provenance from a least-privilege job before creating the GitHub Release; `release:prepare` now also tracks the linked root version in `tests/integrations/package-lock.json`.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 29번째 Core API `Kineto.observe(root?, { scan, attributes })`를 추가했습니다. MutationObserver 기반 라이브 DOM 모드로, root를 한 번 스캔한 뒤 나중에 추가되는 `data-kt-*` 요소를 마이크로태스크 단위로 묶어 붙이고, DOM에서 빠진 요소의 인스턴스를 정리하며, 선택적으로 `data-kt-*` 속성 변경에 반응합니다. root당 한 번만 유지되고 SSR에서는 비활성 핸들을 돌려주며 전역 `destroy()`가 함께 해제합니다. `tests/observe.mjs`로 검증하고 `types/index.d.ts`에 타입을 추가했습니다.
- 연동 지도 `kineto.integrations.json`(+ JSON 스키마)을 추가했습니다. 12개 생태계(vanilla, shadcn/ui, Tailwind, Bootstrap 5, MUI, Mantine, Chakra UI, Ant Design, daisyUI, Nuxt UI, PrimeVue, Vuetify)의 붙이는 방식·라이브러리가 이미 제공하는 것·피해야 할 조합, 30개 디자인 의도(히어로 헤드라인, 섹션 등장, 카드 호버, KPI 숫자, 이미지 로딩, 다이얼로그 진입/퇴장, 토스트, 마퀴, 페이지 전환 …)의 계약 검증 레시피와 영/한 키워드·Figma 레이어 이름 패턴, Figma MCP 워크플로우를 담습니다. `npm run integrations:build`가 `docs/integrations/*.md`, 에이전트 규칙 `ai/kineto.rules.md`, Cursor 규칙 `ai/cursor/kineto.mdc`, `site/llms.txt`, `site/ai/kineto.rules.md`를 생성하고, `tests/integrations-contract.mjs`가 모든 레시피·속성·스니펫을 기능 계약과 대조하며 생성물이 오래되면 실패합니다.
- 데모 사이트에서 shadcn 레지스트리를 제공합니다(`registry/` → `site/r/registry.json` + `site/r/<name>.json`, 네임스페이스 `@kineto` → `https://kineto.dongri.me/r/{name}.json`). 타입 지원 React 래퍼 `provider`(`Kineto.observe()` 마운트), `reveal`, `text-reveal`, `counter`, `image`, `marquee`, `tilt-card`, `magnetic-button`, `presence`, `page-reveal`, 공용 `utils`, 그리고 Cursor 규칙과 Markdown 규칙을 프로젝트에 설치하는 `ai-rules` 항목입니다. `scripts/build-registry.mjs`가 원본을 검증하고(kebab 이름, `'use client'`, URL 형식 registry 의존성, scoped 패키지 import) `npm run build`가 사이트 사본을 재생성합니다.
- 새 잠금 fixture `tests/integrations/`(`test:integrations`)에서 지도를 실제 라이브러리로 증명합니다. MUI·Mantine·Chakra UI·Ant Design 컴포넌트가 `data-kt-*` prop을 DOM으로 전달하고(서버 렌더 → jsdom → `Kineto.scan()`), React 클라이언트 렌더를 `Kineto.observe()`가 붙이고 해제하며, Vuetify·PrimeVue가 SSR에서 attrs를 통과시키고, 모든 레지스트리 컴포넌트가 실제 React 타입으로 strict TypeScript를 통과하고, shadcn CLI가 URL과 `@kineto` 네임스페이스 두 방식으로 새 프로젝트에 항목을 설치합니다.
- Bootstrap 5 공존 예제(`examples/bootstrap/index.html`: Kineto 읽기 진행 막대를 단 sticky 내비게이션, `textSplit` 히어로, `ripple`+`magnetic` 모달 트리거, Bootstrap 전용 툴팁, stagger KPI 카운터, `lazy` 이미지를 넣은 tilt/glow 카드, Bootstrap에 맡긴 캐러셀·아코디언, 마퀴, 동적 카드·토스트)를 추가하고 Chromium에서 구동합니다(`tests/integrations/bootstrap-qa.mjs`). 고정한 CDN 파일이 설치된 `bootstrap` 패키지와 바이트 단위로 일치해야 하고(SRI를 오프라인에서 검증), 모달 포커스·툴팁·아코디언·캐러셀은 Bootstrap이 계속 소유하면서 같은 요소에 Kineto 인스턴스가 살아 있고, `observe()`가 동적 카드·토스트를 붙이고 해제하며, `destroy()` 뒤에도 Bootstrap이 온전하고, 두 라이브러리 모두 오류를 남기지 않아야 합니다.
- Kineto MCP 서버 패키지 `packages/kineto-mcp`(`@dong-gri/kineto-mcp`, stdio 전용, 아직 미게시)를 추가했습니다. `kineto_suggest`, `kineto_figma_layers`, `kineto_snippet`, `kineto_validate_options`(“혹시 이 옵션?” 힌트 포함), `kineto_module`, `kineto_list_modules`, `kineto_ecosystem` 도구와 `kineto://rules|integrations|features|meta` 리소스, `kineto_apply_motion` 프롬프트를 제공합니다. `scripts/build-mcp.mjs`가 동기화하는 계약 사본(계약 테스트가 검사)에서만 답하고, 모든 입력을 상한이 있는 스키마로 검증하며, CI의 `npm run test:mcp`가 stdio로 끝까지 실행합니다.
- Pages 배포 concurrency 그룹을 실제 배포에만 적용합니다(`main` push·수동 dispatch는 `demo-site-main`, 그 외는 실행별 그룹). 이전에는 Dependabot 브랜치 CI 완료가 skip된 `workflow_run`으로 공용 `demo-site` 그룹에 들어와 진행 중이던 v0.10.0 배포를 취소했고, kineto.dongri.me는 이전 빌드에 머물렀습니다. `tests/release-automation.mjs`로 고정하고 RELEASING에 재배포 경로를 적었습니다.
- 저장소 게이트를 새 패키지까지 넓혔습니다. 감사 대상 lockfile, Dependabot, lockfile 경계(게시용 패키지 종류), 공급망 하한(picomatch를 메이저 라인별로 검사 — shadcn CLI는 micromatch를 통해 패치된 2.3.2 라인이 여전히 필요), `test:node`와 두 워크플로우의 `test:observe`/`test:integrations`/`test:mcp`, fixture·MCP 패키지까지 ESLint, 그리고 README(7개 언어)·문서 인덱스·Getting Started·AI 프롬프트 가이드에 `observe()`·연동 가이드·레지스트리·MCP 서버를 반영했습니다. React/Vue/jQuery 예제 README는 unscoped 이름 대신 `@dong-gri/kineto`를 설치합니다.
- 검증된 v0.10.0 릴리스를 기록했습니다: 성공한 CI·Release 실행, provenance subject·릴리스 커밋이 일치하는 동일 바이트 npm/GitHub tarball, 그리고 취소된 canonical Pages 배포의 원인과 수정.
- MCP 서버에 독립 릴리스 경로를 만들었습니다. `scripts/release-targets.mjs`가 태그 접두사를 패키지에 매핑하고(`v*` → `@dong-gri/kineto`, `mcp-v*` → `@dong-gri/kineto-mcp`), `npm run release:ship`이 이를 거치며, `scripts/check-mcp-release.mjs`가 태그 ↔ 버전, 바이트 동일한 계약 사본, 패키지 changelog, 이중언어 노트를 검증하고, `.github/workflows/release-mcp.yml`이 태그 소스를 검증한 뒤 digest를 확인한 tarball 하나를 최소 권한 job에서 provenance와 함께 게시하고 GitHub Release를 만듭니다. `release:prepare`는 `tests/integrations/package-lock.json`의 링크된 root 버전도 함께 올립니다.
## [0.10.0] - 2026-09-18

### English

<!-- Add matching English release bullets here. -->
- Add three stylized Lazy variants on one shared canvas rasterizer (`src/modules/lazy/stylizedMedia.js`): `dither` (Bayer 2×2/4×4/8×8, seeded random, Floyd–Steinberg and Atkinson error diffusion), `ascii` (a configurable glyph-density ramp), and `halftone` (dot, square, or line screens). Each reveals by shrinking its cells into the original picture and crossfading, or keeps the look permanently with `persist`; they apply to `<img>` (animated GIF/APNG/WebP keep re-rendering) and to `<video>` frame by frame, honour `paperColor`/`inkColor`/`accentColor`, `originalColors` + `colorSteps`, `inverted`, `cellSize`, `renderFps`/`maxDpr` and the low-performance frame cap, and leave the original media visible underneath when a cross-origin source cannot be read back. Locked as owner requirement MK-LAZY-008 (feature contract 1.4.0, requirements 3.2.0); proven by a three-engine pixel suite (`tests/browser/lazy-stylized.mjs`) and a Node unit suite for the rasterizer.
- Declare a `media` variant capability (an `<img>` or a `<video>`) and use it for Lazy `fade`, `dither`, `ascii`, and `halftone`, so the demo drawer offers exactly the variants a `<video>` card can run.
- Apply contract-derived variant gating the moment a settings drawer opens, not only after the first edit: opening the CRT card previously showed all 24 Lazy controls (pixelate steps, wave amplitude, …) and hid them on the first change. Groups whose every control is gated off no longer render an empty header. Guarded by two new `drawer-layout` checks.
- Add four Lazy demo cards (two-tone dither reveal, colour error-diffusion reveal, persistent ASCII, persistent halftone video) with descriptions in seven languages, drawer controls and tooltips for the twelve new options, default values declared in the contract, and updated module docs; the cards opt out of legacy `?kt=` ordinals so historical share links stay stable.
- Guides: define what counts as real-usage evidence and when a variant graduates to its own module, add "canonical docs are the AI design system" and "the demo is the review surface" principles (derived from the 2026-09-18 Surfit article on AI-era product design), state that a push and a release are separate approvals (a push redeploys the public demo), document the `data-demo-no-legacy-share` rule, and unify the local Chromium override on `KT_CHROME` (`MK_CHROMIUM` stays as an alias).
- Account for the measured cost of the stylized renderer (about 13 KB raw / 4.7 KB gzip in every full artifact): raise only the JS bundle, package and full/React/Vue consumer ceilings to the next measured KB; runner variance, CSS, modular core budgets and the 77-file package boundary are unchanged.
- Record the verified v0.9.9 release: successful CI, Release, and canonical Pages runs on the new GitHub Actions majors, byte-identical npm/GitHub tarballs with matching provenance subject and release commit, and a canonical deployment whose 16 first-party assets (now including the minified demo bundle) byte-match the tested build.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 공용 canvas rasterizer(`src/modules/lazy/stylizedMedia.js`) 하나 위에 Lazy 스타일화 variant 세 개를 추가했습니다: `dither`(Bayer 2×2/4×4/8×8, seed 고정 random, Floyd–Steinberg·Atkinson 오차 확산), `ascii`(설정 가능한 글리프 밀도 ramp), `halftone`(점·사각·선 망점). 각 효과는 셀을 잘게 쪼개 원본으로 크로스페이드하는 리빌이거나 `persist`로 영구 필터가 되며, `<img>`(GIF/APNG/WebP는 계속 재렌더)와 `<video>`에 프레임 단위로 적용됩니다. `paperColor`/`inkColor`/`accentColor`, `originalColors`+`colorSteps`, `inverted`, `cellSize`, `renderFps`/`maxDpr`와 저성능 프레임 상한을 지원하고, CORS 없는 다른 origin 소스처럼 픽셀을 읽을 수 없으면 원본 미디어를 그대로 보여 줍니다. 소유자 요구사항 MK-LAZY-008로 고정했으며(기능 계약 1.4.0, 요구사항 3.2.0), 세 엔진 픽셀 검사(`tests/browser/lazy-stylized.mjs`)와 rasterizer Node 단위 검사로 증명합니다.
- `media` variant 능력(`<img>` 또는 `<video>`)을 선언하고 Lazy `fade`·`dither`·`ascii`·`halftone`에 적용해, 데모 설정창이 `<video>` 카드에서 실제로 동작하는 variant만 제공합니다.
- 계약에서 파생한 variant 옵션 gating을 첫 옵션 변경 뒤가 아니라 설정창이 열리는 순간부터 적용합니다. 이전에는 CRT 카드를 열면 Lazy 옵션 24개(픽셀 단계, 물결 진폭 등)가 모두 보였다가 첫 변경 때 숨겨졌습니다. 모든 옵션이 숨겨진 그룹은 빈 헤더를 그리지 않습니다. `drawer-layout` 검사 2건으로 보호합니다.
- Lazy 데모 카드 4개(2색 디더 리빌, 원본색 오차 확산 리빌, ASCII 영구 필터, 망점 영상 영구 필터)와 7개 언어 설명, 새 옵션 12개의 설정창 컨트롤·도움말, 계약에 선언한 기본값, 모듈 문서를 추가했습니다. 새 카드는 과거 `?kt=` 순번을 쓰지 않아 기존 공유 링크가 유지됩니다.
- 가이드: 실사용 근거의 정의와 variant가 독립 모듈로 승격되는 기준을 명시하고, “정본 문서가 AI의 디자인 시스템”·“데모는 검수 화면” 원칙(2026-09-18 서핏 매거진의 AI 시대 프로덕트 디자인 글에서 도출)을 추가했습니다. push와 release는 별도 승인이라는 점(push는 공개 데모를 재배포), `data-demo-no-legacy-share` 규칙, 로컬 Chromium 지정 변수 `KT_CHROME` 통일(`MK_CHROMIUM`은 별칭)을 문서화했습니다.
- 스타일화 렌더러의 측정 비용(모든 전체 산출물에서 약 13KB raw / 4.7KB gzip)을 반영해 JS 번들·패키지·full/React/Vue 소비자 상한만 다음 측정 KB로 올렸습니다. runner variance, CSS, 모듈형 core 예산과 77파일 패키지 경계는 그대로입니다.
- 검증된 v0.9.9 릴리스를 기록했습니다: 새 GitHub Actions 메이저에서 성공한 CI·Release·canonical Pages 실행, provenance subject·릴리스 커밋이 일치하는 동일 바이트 npm/GitHub tarball, 그리고 (minify된 데모 번들을 포함한) 자체 자산 16개가 테스트된 빌드와 바이트 일치하는 canonical 배포.
## [0.9.9] - 2026-09-18

### English

<!-- Add matching English release bullets here. -->
- Update the pinned GitHub Actions to checkout 7.0.1, setup-node 7.0.0, upload-artifact 7.0.1, upload-pages-artifact 5.0.0, and deploy-pages 5.0.1 — the open Dependabot proposals, with every SHA verified against the upstream tags before pinning.
- Minify the demo's own scripts and stylesheets into the deployed `site/` (about 220 KB raw / 58 KB gzip less per visit) while `demo/` stays the readable QA source; `demo:cdn --check`, `test:site`, and a new Chromium `site-smoke` lane prove the deployed bytes are the current deterministic build and still boot, localize, open settings, apply live options, and restore share links.
- Share one priority-preserving `snapshotInlineStyles()` across modules: restore keeps `!important`, removes properties the element never set, drops an empty `style` attribute the element did not have, and accepts camelCase or kebab-case names including vendor prefixes; Glitch uses it instead of a module-local copy.
- Add `subscribe(listener)` to the Presence controller and keep the React/Vue `status`/`result` in sync through it, so a child driven by a parent's `propagate: true` exit reports `finished` instead of freezing at `leaving`; the framework QA nested-propagation assertion now passes deterministically instead of depending on timing. Record the measured package and Vue consumer cost of these correctness/security bytes by rounding the packed/unpacked and Vue ceilings by 1 KB with the same 77 files.
- Treat demo `?kt=` settings links as untrusted input: fields a module renders as HTML (Tooltip content/html, Cursor templates, Toast icon, Overflow Text items) are never serialized into or restored from a link, and resource URLs (Cursor images/sprites, Ambient source) restore only when they stay on the demo origin. A crafted link could previously execute script on the public demo; `tests/browser/share-link-policy.mjs` proves the payloads are inert while benign fields still restore.
- Reuse a pre-existing engine `<script>` tag only when it carries the same SHA-384 integrity Kineto would inject, so an unverified tag for the GSAP/ScrollTrigger/Lenis URL can no longer bypass subresource integrity.
- Make Glitch teardown terminal across text, image, CRT/VCR, and RGB Slice Burst renderers: prevent retained instances from restarting work or overwriting later edits, and restore owned image/host styles with their original priorities, opacity, and animation play state.
- Record the Glitch correctness cost (~0.2 KiB UMD gzip); adjust only exceeded package, minified ESM, UMD raw, full-consumer and React ceilings while retaining runner variance, modular/Vue budgets and the 77-file package boundary.
- Complete dedicated Reveal demo coverage with Blur, Rise, Soft, and Rotate comparisons, seven-language descriptions, settings/replay/share regressions, and a gate preventing any of the 23 public presets from losing its example; preserve runtime behavior and package budgets.
- Add five directional Reveal comparisons (Fade Down/Left/Right and Slide Down/Right), with seven-language descriptions of the actual starting positions, connected controls, replay/copy/share coverage, and unchanged runtime behavior.
- Add five matched Reveal comparison demos for Fade, Zoom In/Out and Flip X/Y, with seven-language descriptions, connected settings and replay, unique semantic sharing, and desktop/mobile layout regressions; preserve historical share links and the runtime package.
- Honor opt-in Wave palettes and background blending without changing the default distortion; share the existing clock, resolve target-scoped CSS colors, restore author blending, and expose localized demo controls with rendered-pixel regressions.
- Account for the measured Wave feature cost (~0.3 KiB UMD gzip, 534.0 KiB packed/1770.3 KiB unpacked), adjusting only affected ceilings while retaining 77 files and zero required runtime dependencies.
- Synchronize React/Vue lifecycle QA with bounded state assertions instead of fixed mount/update sleeps; preserve completion, DOM removal and leak checks and test timeout diagnostics without changing the runtime package.
- Restore native class-only Reveal observation after pause/resume; preserve completed once-only entrances and prevent destroyed instances from restarting, with normal/low-tier browser regressions.
- Preserve all Reveal presets and class-only hooks in low-performance mode without using loaded GSAP/ScrollTrigger; avoid repeated full-list scans on native animation completion, batch class tokens, and correct the external-engine bundle documentation.
- Support native Reveal pause/resume through owned Web Animations, preserving entrance delay, stagger, and existing easing without stopping author animations; cancel pending playback on replay/destroy and retain the legacy CSS fallback.
- Unify Mask, Wipe, and Clock Reveal playback across GSAP/native paths: reversible re-entry, ordered boundary callbacks, stagger completion, pause/resume, clipped ancestor visibility, and safe replay/destroy.
- Honor Glitch Wave trigger, one-shot looping, duration, delay, and randomness; preserve playback phase and original filter priority, stop hidden-tab work, and prevent destroyed instances from restarting.
- Add a localized one-shot Wave demo and restore its seed/displacement controls and copied options; retain historical shared URLs and include Wave behavior checks in all browser gates.
- Record the measured lifecycle cost (~1.2 KB full consumer gzip and ~4.2 KB packed archive), adjusting only affected budgets while preserving runner variance, modular budgets, zero required dependencies, and the 77-file package boundary.
- Record the verified v0.9.8 release, byte-identical npm/GitHub packages and linked provenance metadata, successful CI, and canonical/backup parity for all twelve first-party scripts/styles and four click-media assets.
- Preserve the QA report's source-package version marker for automated release preparation, separately from verified publication evidence.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 고정된 GitHub Actions를 checkout 7.0.1, setup-node 7.0.0, upload-artifact 7.0.1, upload-pages-artifact 5.0.0, deploy-pages 5.0.1로 갱신했습니다. 열려 있던 Dependabot 제안이며, 고정 전에 모든 SHA를 업스트림 태그와 대조했습니다.
- 배포용 `site/`에 데모 자체 스크립트·스타일시트를 minify해 담습니다(방문당 약 220KB raw / 58KB gzip 절감). `demo/`는 읽기 쉬운 QA 원본으로 유지하고, `demo:cdn --check`·`test:site`·새 Chromium `site-smoke` 레인이 배포 바이트가 최신 결정적 빌드이며 부팅·다국어·설정 열기·실시간 옵션 적용·공유 링크 복원이 동작함을 검사합니다.
- 우선순위를 보존하는 `snapshotInlineStyles()` 하나를 모듈이 공유합니다. 복원 시 `!important`를 유지하고, 요소가 설정하지 않았던 속성은 제거하며, 원래 없던 빈 `style` 속성을 남기지 않고, camelCase·kebab-case·vendor prefix 이름을 모두 받습니다. Glitch는 모듈 내부 복사본 대신 이 공용 함수를 사용합니다.
- Presence 컨트롤러에 `subscribe(listener)`를 추가하고 React/Vue의 `status`·`result`를 이 구독으로 동기화합니다. 부모의 `propagate: true` exit로 끝난 자식이 `leaving`에 멈추지 않고 `finished`를 보고하며, framework QA의 중첩 전파 단언이 타이밍에 의존하지 않고 통과합니다. 이 정확성·보안 바이트의 측정된 패키지·Vue 소비자 비용을 기록해 packed/unpacked·Vue 상한만 1KB 반올림하고 77개 파일 범위는 유지합니다.
- 데모의 `?kt=` 설정 링크를 신뢰할 수 없는 입력으로 다룹니다. 모듈이 HTML로 렌더링하는 필드(Tooltip content/html, Cursor 템플릿, Toast icon, Overflow Text items)는 링크에 담지도 복원하지도 않고, 리소스 URL(Cursor 이미지·스프라이트, Ambient 소스)은 데모와 같은 origin일 때만 복원합니다. 이전에는 조작된 링크가 공개 데모에서 스크립트를 실행할 수 있었으며, `tests/browser/share-link-policy.mjs`가 페이로드 무력화와 일반 필드 복원을 함께 검사합니다.
- 기존 엔진 `<script>` 태그는 Kineto가 주입할 SHA-384 integrity와 같은 값을 가진 경우에만 재사용합니다. 검증되지 않은 GSAP/ScrollTrigger/Lenis 태그로 subresource integrity를 우회할 수 없습니다.
- Glitch 텍스트·이미지·CRT/VCR·RGB Slice Burst의 종료 후 재시작과 후속 편집 덮어쓰기를 막았습니다. 이미지·호스트의 소유 스타일을 원래 우선순위·투명도·애니메이션 재생 상태와 함께 복원합니다.
- Glitch 수정 비용(UMD gzip 약 0.2KiB)을 기록하고 초과한 패키지·minified ESM·UMD raw·전체 소비자·React 상한만 조정했습니다. runner variance·모듈 조합/Vue 예산·77개 패키지 파일 범위는 유지합니다.
- Blur·Rise·Soft·Rotate 비교 카드와 7개 언어 설명으로 Reveal 전용 데모 23개를 완성하고 설정·재생·공유 회귀 검사 및 예제 누락 방지 게이트를 추가했습니다. 런타임 동작과 패키지 예산은 유지합니다.
- Fade Down/Left/Right·Slide Down/Right 방향 비교 데모 5개와 실제 시작 위치의 7개 언어 설명·설정·Replay·복사·공유 검사를 추가했습니다. 기존 런타임 동작은 변경하지 않습니다.
- Fade·Zoom In/Out·Flip X/Y의 동일 조건 Reveal 비교 데모 5개와 7개 언어 설명·설정·Replay·고유 공유 링크·데스크톱/모바일 레이아웃 회귀 검사를 추가했습니다. 과거 공유 링크와 런타임 패키지는 유지합니다.
- 기본 왜곡을 유지하면서 Wave의 선택적 색상 배열·배경 합성을 연결했습니다. 기존 타이머 공유·대상 문맥의 CSS 색상 해석·원래 합성 스타일 복원과 다국어 데모 설정·렌더링 픽셀 회귀 검사를 추가했습니다.
- Wave 기능 비용(UMD gzip 약 0.3KiB 증가, 패키지 압축 534.0KiB·해제 1770.3KiB)을 측정해 해당 상한만 조정하고 77개 파일·필수 런타임 의존성 0개를 유지했습니다.
- React/Vue lifecycle QA의 고정 mount/update 대기를 제한 시간 내 상태 단언으로 교체했습니다. 완료·DOM 제거·누수 검사를 유지하고 시간 초과 진단을 검사하며, 런타임 패키지는 변경하지 않습니다.
- Native class-only Reveal의 일시 정지 후 viewport 관찰을 복구하고, 완료한 1회 진입과 destroy 후 재시작 방지를 보존합니다. 일반·저성능 티어 브라우저 회귀 검사를 추가했습니다.
- 저성능 모드에서 로드된 GSAP·ScrollTrigger를 사용하지 않으면서 Reveal 프리셋과 class-only hook을 보존합니다. Native 애니메이션 완료 시 전체 목록 재검색을 없애고 class token을 묶어 처리하며, 외부 엔진 번들 설명을 바로잡았습니다.
- Native Reveal이 소유한 Web Animation으로 대기 시간·stagger·기존 easing을 보존하는 일시 정지·재개를 지원하고, 작성자의 애니메이션은 유지합니다. replay/destroy 취소 처리를 보강하며 구형 CSS 대체 경로는 보존합니다.
- Mask·Wipe·Clock Reveal의 GSAP/native 재생을 통합해 역재생·재진입, 경계 callback, stagger 완료, 일시 정지·재개, 조상 clipping 감지와 안전한 replay/destroy를 지원합니다.
- Glitch Wave의 시작·1회 반복·시간·지연·변화 폭 설정을 연결하고, 진행률과 원본 filter priority 보존·숨김 탭 연산 정지·destroy 후 재시작 차단을 적용했습니다.
- 다국어 Wave 1회 재생 데모와 seed·왜곡량 설정 및 복사 옵션을 복구하고, 과거 공유 URL을 보존하며 모든 브라우저 gate에 Wave 동작 검사를 연결했습니다.
- 상태 관리 보강 비용(전체 소비자 gzip 약 1.2KB·압축 패키지 약 4.2KB 증가)을 기록하고 해당 예산만 조정했습니다. 러너 오차·모듈 조합 예산·필수 의존성 0개·77개 파일 경계는 유지합니다.
- v0.9.8 릴리스의 npm/GitHub 동일 패키지와 provenance metadata 연결, CI 성공, 두 도메인의 자체 JS/CSS 12개·클릭 미디어 4개 일치 근거를 기록했습니다.
- 자동 릴리스 준비가 사용하는 QA 보고서의 소스 패키지 버전 표식을 실제 게시 증거와 구분해 유지했습니다.
## [0.9.8] - 2026-09-12

### English

<!-- Add matching English release bullets here. -->
- Restore Slider track/radial author state and sibling order, share native image-drag guards without overwriting unrelated image styles, and clean up grab-cursor listeners and queued auto-height writes; exercise all ten effects, image dragging, and replay in three browser engines.
- Repair Reveal's clipped-target automatic entrance, unintended native vertical offset, mask/wipe defaults, final GSAP skew, and replay/destroy cleanup; honor native delay and completion timing and verify all 23 presets with and without GSAP in Chromium, Firefox, and WebKit.
- Add six Slider and three Reveal comparison cards with all seven demo locales and semantic settings links that preserve historical shared URLs; restore missing Swing, Skew, and Wave settings choices, increase dedicated high-risk variant demos from 47/78 to 56/78, and synchronize the 1.0 readiness evidence to the verified v0.9.7 deployment.
- Validate GitHub Actions by their actual action names and immutable full SHA pins instead of informational major-version comments, retaining negative checks for tags, branches, malformed hashes, and unpinned duplicates; permit stable dependency minor/patch updates within existing supported-major and minimum-version boundaries.
- Rebuild animated hero copy on locale changes so visible text, accessible labels, replay, and destroy restoration retain the selected language.
- Record the verified v0.9.7 release, matching npm/GitHub tarballs and provenance metadata, successful cross-browser workflows, and canonical/backup parity for all twelve first-party scripts/styles and four click-media assets.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- Slider Track/Radial의 작성자 상태·원래 노드 순서를 복원하고, 다른 이미지 스타일을 덮어쓰지 않는 native drag 차단을 공유하며, grab cursor 리스너·예약된 자동 높이 쓰기를 정리합니다. 세 브라우저 엔진에서 10개 효과·이미지 드래그·Replay를 검사합니다.
- Reveal의 완전 clip 대상 자동 진입·불필요한 native 세로 이동·Mask/Wipe 기본 방향·GSAP 종료 skew·replay/destroy 정리를 수정했습니다. native delay와 완료 시점을 지키고, 23개 프리셋의 GSAP 유무별 동작을 Chromium·Firefox·WebKit에서 검증합니다.
- 데모 7개 언어와 과거 공유 URL을 유지하는 semantic 설정 링크를 갖춘 Slider 6개·Reveal 3개 비교 카드를 추가했습니다. 누락된 Swing·Skew·Wave 설정 선택을 복구하고, 고위험 variant 전용 데모를 47/78에서 56/78로 확대했으며 1.0 준비도 근거를 검증된 v0.9.7 배포로 최신화했습니다.
- GitHub Actions의 참고용 major 버전 주석 대신 실제 action 이름과 불변 full SHA pin을 검사합니다. 태그·branch·잘못된 hash·고정되지 않은 중복 step을 거부하며, 의존성은 기존 지원 major·최소 버전 경계를 유지하는 안정 minor·patch 업데이트를 허용합니다.
- 언어 전환 시 첫 화면 애니메이션 문구를 재생성해 화면 텍스트·접근성 이름·Replay·destroy 복원이 선택한 언어를 유지하도록 수정했습니다.
- v0.9.7의 npm/GitHub 동일 tarball·provenance metadata, 교차 브라우저 workflow 성공과 두 도메인의 자체 JS/CSS 12개·클릭 미디어 4개 일치를 기록했습니다.
## [0.9.7] - 2026-09-06

### English

<!-- Add matching English release bullets here. -->
- Account for the measured one-shot media and text/lifecycle fix cost in full-runtime and package budgets (about 3.3 KB additional Vite full-consumer gzip), while retaining core-plus-module budgets, zero runtime dependencies, and the 52-module/77-file release surface.
- Check both GitHub workflows against the package test manifest, including exhaustive demo-control, click-media, and live-site-script checks; isolate nine external demo resources in offline QA and preserve historical npm versions, workflow IDs, and checksums during version preparation.
- Normalize GIF, APNG, and animated WebP click images to one play, restart each click independently, and share pointer/touch cleanup; expose format examples and image/sprite controls with explicit CORS and lifetime behavior.
- Consolidate Quad Dot Pulse into the Quad Dot Chase preset, remove duplicate public choices, and retain the old preset name and shared-link compatibility.
- Keep the demo's one-gesture hero transition with a multi-frame ease-out landing, and consume the remaining wheel/touch gesture until it settles so native momentum and smooth scrolling cannot add a second jump.
- Preserve authored `<br>` and programmatic `\n` line breaks across Text Split, Text Reveal, and Blur Text, including reduced motion and author-state restoration; cancel native flicker animations and stale completions on replay/destroy, and constrain Counter slot and clock reels to the consumer's computed line-height.
- Verify cssScroll native scroll/view progress and ScrollTrigger fallback with real Chromium, Firefox, and WebKit scrolling; preserve authored animation and custom-property state on destroy, provide a reversible reduced-motion final state, and expose all three existing variants in the localized demo.
- Replace the representative first-range demo check with a deterministic audit of every distinct rendered drawer control across 51 modules and seven input types, verifying option reflection, debounced rebuilds, and zero duplicate instances; also reject duplicate runtime field keys.
- Expand the variant-distinctness gate from Page Reveal to all 78 public variants across Reveal, Lazy, Cursor, Overflow Text, Glitch, and Slider, enforcing unique source fingerprints plus direct-demo and generated-settings parity.
- Record the v0.9.5 publish-stage path failure and the successful v0.9.6 end-to-end release evidence: cross-browser CI, npm SLSA provenance, byte-identical npm/GitHub tarballs, canonical Pages, and synchronized backup hosting.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 1회 재생 미디어와 텍스트·lifecycle 수정의 실측 비용(Vite 전체 소비자 gzip 약 3.3KB 증가)을 full runtime·패키지 예산에 반영하고, core+모듈 조합 예산·runtime 의존성 0개·52개 모듈/77개 배포 파일 범위는 유지합니다.
- 데모 설정 전수·클릭 미디어·live-site-script 검사를 포함한 두 GitHub workflow의 등록 상태를 package test manifest와 대조합니다. 외부 데모 리소스 9개를 offline QA fixture로 격리하고, 새 버전 준비 중 과거 npm 버전·workflow ID·checksum 검증 기록을 유지합니다.
- GIF·APNG·animated WebP 클릭 이미지를 1회 재생으로 정규화하고 클릭마다 독립 재시작하며 포인터·터치 cleanup을 통합했습니다. 포맷별 예제와 이미지·스프라이트 설정에 CORS 및 표시 수명 동작을 명시합니다.
- Quad Dot Pulse를 Quad Dot Chase 프리셋에 통합해 중복 공개 선택지를 제거하고, 기존 프리셋 이름과 공유 링크 호환성을 유지했습니다.
- 데모 첫 화면의 한 제스처 전환과 여러 프레임의 감속 착지를 유지하면서 남은 wheel·touch 입력을 정착까지 처리해 native 관성과 smooth scroll이 두 번째 점프를 만들지 않도록 수정했습니다.
- Text Split·Text Reveal·Blur Text에서 작성한 `<br>`와 문자열의 `\n`을 모션 축소·원본 상태 복원까지 보존합니다. native flicker 애니메이션과 이전 실행의 완료 callback을 replay·destroy 시 정리하고, Counter Slot·Clock reel을 소비자 UI의 computed line-height 안으로 제한했습니다.
- cssScroll의 native scroll/view 진행률과 ScrollTrigger fallback을 Chromium·Firefox·WebKit 실제 스크롤로 검증하고, destroy 시 작성자 animation·custom-property 상태를 복원하며, 되돌릴 수 있는 reduced-motion 완료 상태와 기존 variant 3개의 다국어 데모를 제공합니다.
- 카드별 첫 range만 확인하던 데모 검사를 51개 모듈·7개 입력 타입의 렌더된 고유 drawer control 전수 검사로 교체해 옵션 반영·debounce 재빌드·중복 인스턴스 0건을 검증하고, 런타임 필드 키 중복도 차단합니다.
- Page Reveal에 한정됐던 variant 구분 검사를 Reveal·Lazy·Cursor·Overflow Text·Glitch·Slider의 공개 variant 78개로 확대하고, 고유 source fingerprint와 전용 데모·생성형 설정의 정합성을 함께 검증합니다.
- v0.9.5 게시 단계의 경로 해석 실패와 v0.9.6의 교차 브라우저 CI·npm SLSA provenance·npm/GitHub 동일 tarball·공식 Pages·백업 호스팅 동기화 성공 근거를 함께 기록했습니다.
## [0.9.6] - 2026-09-05

### English

<!-- Add matching English release bullets here. -->
- Pass the checksum-verified release tarball to npm as an explicit local path, preventing npm 11 from interpreting `release-artifact/...tgz` as a GitHub package spec.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- checksum 검증을 마친 릴리스 tarball을 명시적인 로컬 경로로 npm에 전달해 npm 11이 `release-artifact/...tgz`를 GitHub 패키지 명세로 오인하지 않도록 수정했습니다.
## [0.9.5] - 2026-09-05

### English

<!-- Add matching English release bullets here. -->
- Translate the generated back-to-top progress-ring control in all seven demo locales, preserve that locale across observer-driven replacement, and make its accessibility QA deterministic by separating application controls from intentionally authored Korean animation content.
- Probe an absent local release tag without printing an expected Git fatal, and document pushed-tag fix-forward handling after a failed publish workflow.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 생성된 맨 위로 이동 progress-ring 컨트롤을 데모 7개 언어로 번역하고 observer 재생성 후에도 해당 locale을 유지하며, 접근성 QA에서 앱 컨트롤과 의도적으로 한국어로 작성된 애니메이션 본문을 분리해 검사합니다.
- 없는 로컬 릴리스 태그를 확인할 때 예상된 Git fatal 문구를 출력하지 않고, 푸시된 태그의 배포 workflow가 실패한 경우도 새 patch로 정방향 수정하도록 문서화했습니다.
## [0.9.4] - 2026-09-05

### English

<!-- Add matching English release bullets here. -->
- Deploy the exact tested JavaScript and CSS with the demo, require the expected commit and byte hashes through bounded propagation and request timeouts in live verification, and keep public jsDelivr installation snippets intact.
- Give demo settings collision-tested semantic v2 share keys with v1-link compatibility and hash landing, then add skip navigation, complete ARIA tab relationships, roving keyboard controls, and seven-locale accessible names for user controls.
- Keep Mega Menu panel IDs collision-free across simultaneous instances and restore authored class, style, hidden, ID, and ARIA state after cancelling animations on destroy; exercise every one of the 52 modules through create, replay, duplicate-init, and destroy in Chromium, Firefox, and WebKit.
- Add real React and Vue hydration QA, resolve Vue object/ref/getter options immediately before each replacement, and share matching Vite/Rolldown budgets for Core plus States and Presence entry combinations.
- Audit all three lockfiles with durable but locally ignored reports, update bounded development dependencies, lock optional network primitives and Lenis 1.3.26 SRI, and document the current Socket alert triage without hiding unavoidable packaging signals.
- Pin every third-party workflow action to a full commit SHA, cover supported Node 20/22 runtimes, require cross-browser release gates and one checksum-bound tarball, and make jsDelivr purging bounded and fatal on partial failure.
- Keep the roadmap baseline, fixture lock metadata, and generated module metadata synchronized during release preparation so the generated candidate passes its own contracts.
- Restore automatic backup-site synchronization without a cross-repository Kineto secret by rebuilding the latest successful main CI commit in a read-only job and limiting the write-scoped job to `example/kineto`.
- Add a weekly and manually dispatched live-site parity alert that stays independent from canonical Pages deployment.
- Add a readiness-gate check that keeps physical-device, external-case, deprecation, and FLIP evidence statuses honest in CI.
- Enforce the zero-runtime-dependency and optional-peer metadata boundary in the supply-chain test.
- Add a readiness-evidence contract for physical-device artifacts, case-study completeness, deprecation fixtures, and attributable browser QA history.
- Clarify the roadmap gate: demo parity and modular entry guidance are P0, while new States/Presence expansion waits for real demand and high-risk WebKit coverage remains explicit.
- Record the readiness-evidence and roadmap-priority CI/Pages outcomes in the browser QA history with canonical/backup parity markers.
- Enforce lockfileVersion 3, public npm registry tarballs, integrity metadata, and the two fixture-only local Kineto links in CI and release checks.
- Add a weekly and manually dispatched supply-chain audit that reproduces a locked install, runs npm audit, and checks the package surface without treating Socket scores as a substitute for triage.
- Absorb only the measured Node 24/npm 11 package-metadata archive boundary from the new supply-chain contract, keeping runtime gzip, unpacked, and release-file budgets unchanged.
- Add weekly Dependabot coverage for npm and GitHub Actions, generate an SPDX SBOM with a 14-day audit artifact, and enforce the no-install-lifecycle-script policy.
- Give the hosted WebKit full-demo lane one additional bounded process-group retry while keeping assertion failures fatal.
- Harden Radial image dragging with WebKit user-drag suppression and a capturing `dragstart` guard, restoring authored image styles on destroy.
- Normalize timezone-less SQL/ISO timestamps for Korean server output and reject impossible calendar dates instead of silently rolling them into another day.
- Absorb the measured 2.7 KB unpacked cost of the Radial/dateTime safety guards and the measured 514.2 KB Node 24 packed archive boundary while keeping the 77-file surface and consumer gzip budgets unchanged.
- Add an explicit canonical/backup live-site parity check with a local fixture, including build-marker drift detection without coupling the backup repository to deployment.
- Sync the separate Pages backup at `catgarret.github.io/example/kineto` to the verified v0.9.3 demo artifact without changing its site-wide CNAME.
- Absorb only the measured sub-1 KB raw cost of the Radial/dateTime guards in the artifact-size check; keep compressed budgets and dependency protection unchanged.
- Keep the Radial drag regression assertion portable across engines that do not expose the WebKit-only `-webkit-user-drag` computed property.
- Normalize vendor-prefixed computed style access in the Radial browser checkpoint so WebKit and Firefox validate the same interaction contract.
- Record the successful Node 24, Firefox, WebKit, canonical Pages, backup Pages, and live-site parity evidence for the Radial/dateTime follow-up.
- Harden dateTime parsing across dash, slash, and dot year-first inputs, validate clock ranges, preserve explicit offsets, and add cross-locale rollover regression coverage.
- Absorb the measured sub-1 KB raw UMD artifact increase from strict date parsing while keeping compressed bundle ceilings and the zero-engine dependency guard unchanged.
- Keep the measured strict-parser raw increase within the ESM artifact ceiling without widening any compressed consumer budget.
- Align the packed archive ceiling with the measured Node 24/npm 11 515.6 KB result while keeping the release file allowlist fixed.
- Scope the measured Node 24 Rolldown Vue-adapter compression variance to that independent fixture, leaving the 138 KB consumer product budget unchanged.
- Accept the measured 1731.3 KB unpacked archive produced by the dateTime input-compatibility guards, keeping the 77-file surface and consumer gzip budgets unchanged.
- Raise only the minified ESM raw artifact ceiling to 406 KB for the measured dateTime compatibility guard; compressed product budgets remain unchanged.
- Round the Node 24/npm 11 packed archive ceiling to 517 KB after measuring 528410 bytes, keeping the fixed 77-file allowlist and unpacked budget.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 데모가 테스트한 JavaScript·CSS를 그대로 함께 배포하고 제한된 전파 대기·요청 timeout을 둔 live 검증에서 기대 커밋과 파일 hash까지 확인하며, 공개 jsDelivr 설치 예시는 유지합니다.
- 데모 설정 공유 주소를 충돌 검사한 의미 기반 v2 key로 안정화하면서 v1 링크 호환성과 hash 착지를 보존하고, skip navigation·완전한 ARIA tab 관계·roving keyboard 조작·사용자 조작 UI의 7개 언어 접근성 이름을 추가했습니다.
- 동시에 존재하는 Mega Menu panel ID가 충돌하지 않게 하고 destroy에서 animation을 취소한 뒤 작성자 class·style·hidden·ID·ARIA 상태를 복원하며, Chromium·Firefox·WebKit에서 52개 전 모듈의 생성·재생·중복 초기화·해제를 검사합니다.
- 실제 React·Vue hydration QA를 추가하고 Vue 객체·ref·getter options를 매 교체 직전에 다시 평가하며, Core에 States·Presence를 조합한 Vite/Rolldown 소비자 예산을 동일하게 측정합니다.
- 세 lockfile을 Git에서 제외되는 개별 report로 audit하고 제한된 개발 의존성을 갱신했으며, 선택적 network primitive와 Lenis 1.3.26 SRI를 고정하고 회피할 수 없는 packaging 신호를 숨기지 않은 현재 Socket 경고 판정을 기록했습니다.
- 모든 외부 workflow action을 전체 commit SHA로 고정하고 지원 Node 20/22를 검사하며, 교차 브라우저 release gate와 checksum에 결속된 단일 tarball을 요구하고 jsDelivr purge의 재시도·시간을 제한해 일부 실패도 치명적으로 처리합니다.
- 릴리스 준비 과정에서 로드맵 기준 버전·fixture lock metadata·생성형 모듈 metadata를 함께 동기화해 생성된 후보가 자체 계약을 통과하도록 했습니다.
- Kineto 저장소의 cross-repository secret 없이 최신 main CI 성공 commit을 read-only job에서 다시 빌드하고, 쓰기 권한 job은 `example/kineto`만 바꾸도록 제한해 백업 사이트 자동 동기화를 복구했습니다.
- canonical Pages 배포를 막지 않도록 분리한 주간·수동 live-site parity 경보 workflow를 추가했습니다.
- 실기기·외부 사례·deprecation·FLIP 증거 상태가 CI에서 완료로 오인되지 않도록 readiness-gate 검사를 추가했습니다.
- 공급망 검사에서 런타임 의존성 0개와 optional peer metadata 경계를 고정해 payload drift를 조기에 감지합니다.
- 실기기 증거 형식·case study 필수 기록·deprecation fixture·브라우저 QA 이력의 추적 가능성을 readiness-evidence 검사로 고정했습니다.
- 데모 정합성·모듈형 entry 안내를 P0으로 올리고, States/Presence 확장은 실제 요구 전까지 보류하며 고위험 WebKit 대상을 명시했습니다.
- readiness-evidence와 로드맵 우선순위 변경의 CI·Pages 결과 및 canonical/backup parity build marker를 브라우저 QA 이력에 기록했습니다.
- CI와 릴리스 검사에서 lockfileVersion 3, public npm registry tarball, integrity metadata, fixture 전용 로컬 Kineto link 2개 경계를 강제합니다.
- 주간·수동 공급망 audit에서 잠금 설치·npm audit·패키지 표면을 재현하고, Socket 점수를 개별 경고 triage의 대체값으로 사용하지 않도록 범위를 분리했습니다.
- 새 공급망 계약으로 발생한 Node 24/npm 11 패키지 metadata archive 경계만 측정값에 맞춰 흡수했으며 runtime gzip·unpacked·릴리스 파일 예산은 유지합니다.
- npm·GitHub Actions를 주간 Dependabot 대상으로 분리하고 SPDX SBOM·14일 audit artifact를 생성하며 install lifecycle script 금지 정책을 강제합니다.
- hosted WebKit 전체 데모 lane에는 assertion 실패를 숨기지 않는 bounded process-group 재시도 1회를 추가했습니다.
- Radial 이미지 드래그에 WebKit user-drag 차단과 capturing `dragstart` guard를 적용하고 destroy 시 작성자 스타일을 복원합니다.
- 한국어 서버 출력의 시간대 없는 SQL/ISO 시각을 안정적으로 정규화하고 존재하지 않는 날짜를 다른 날짜로 자동 보정하지 않습니다.
- Radial/dateTime 안전 guard의 측정된 unpacked 2.7KB 비용과 Node 24에서 측정된 packed 514.2KB archive 경계를 반영하되, 77개 파일 표면과 소비자 gzip 예산은 유지합니다.
- 백업 저장소를 배포 대상에 결합하지 않고도 canonical·백업의 버전·모듈 수·GTM·CDN·build marker drift를 검사하는 live-site parity 명령과 로컬 fixture를 추가했습니다.
- 별도 Pages 백업 경로 `catgarret.github.io/example/kineto`를 검증된 v0.9.3 데모 산출물과 동기화했으며 사이트 전체 CNAME은 변경하지 않았습니다.
- Radial/dateTime guard의 측정된 1KB 미만 raw 비용만 산출물 크기 검사에 반영하고, 압축 예산과 의존성 보호 상한은 유지합니다.
- WebKit 전용 `-webkit-user-drag` 계산 속성을 노출하지 않는 브라우저에서도 Radial 드래그 회귀 검사가 올바르게 동작하도록 엔진별 검사를 분리했습니다.
- Radial 브라우저 체크포인트에서 vendor prefix 계산 스타일을 정규화해 WebKit·Firefox가 동일한 상호작용 계약을 검증하도록 했습니다.
- Radial/dateTime 후속 작업의 Node 24·Firefox·WebKit·canonical Pages·backup Pages·live-site parity 성공 증거를 브라우저 QA 이력에 기록했습니다.
- dateTime의 연-월-일(`-`, `/`, `.`) 입력을 엄격하게 검증하고 시각 범위를 검사하며 명시적 offset을 보존하고, locale별 날짜 rollover 회귀 테스트를 추가했습니다.
- 엄격한 날짜 파서로 인한 UMD 산출물의 측정된 1KB 미만 raw 증가만 반영하고, 압축 번들 상한과 엔진 의존성 0개 경계는 유지합니다.
- 엄격한 파서의 측정된 raw 증가를 ESM 산출물 상한에만 반영하고, 소비자 압축 예산은 늘리지 않습니다.
- Node 24/npm 11에서 측정된 packed 515.6KB 결과만 archive 상한에 반영하고, 릴리스 파일 허용 목록은 고정합니다.
- Node 24 Rolldown Vue adapter의 측정된 압축 variance만 독립 fixture에 한정해 반영하고, 138KB 소비자 제품 예산은 유지합니다.
- dateTime 입력 호환성 guard로 측정된 unpacked 1731.3KB archive 경계만 반영하고, 77개 파일 표면과 소비자 gzip 예산은 유지합니다.
- dateTime 호환성 guard로 측정된 minified ESM raw 산출물만 406KB 상한으로 조정하고, 압축 제품 예산은 유지합니다.
- Node 24/npm 11에서 측정된 528410 bytes packed archive 경계를 517KB로 반영하고, 77개 파일 허용 목록과 unpacked 예산은 유지합니다.
## [0.9.3] - 2026-08-31

### English

<!-- Add matching English release bullets here. -->
- Bound the full Chromium browser QA lane to 240 seconds per attempt with three fresh retries in CI and release, and annotate `test:browser` when the gate still fails.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 전체 Chromium 브라우저 QA를 CI와 릴리스에서 시도당 240초·새 프로세스 3회로 제한하고, 재시도 후에도 실패하면 `test:browser` annotation을 남기도록 했습니다.
## [0.9.2] - 2026-08-31

### English

<!-- Add matching English release bullets here. -->
- Keep JavaScript artifact gzip ceilings unchanged while absorbing only the measured Node 24/Linux boundary variance, and annotate failing site/release subcommands in CI logs.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- JavaScript 산출물 gzip 제품 상한은 유지하고 Node 24/Linux 경계의 제한된 variance만 흡수했으며, CI 로그에서 site/release 하위 실패 명령을 식별하도록 했습니다.
## [0.9.1] - 2026-08-31

### English

<!-- Add matching English release bullets here. -->
- Widen only the full consumer fixture's bounded runner variance to cover the measured 133.2 KB Node 24/Linux gzip output, keeping the 130 KB product budget unchanged.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 130KB 제품 예산은 유지하면서 Node 24/Linux에서 측정된 133.2KB gzip 결과를 수용하도록 전체 consumer fixture의 제한된 runner variance만 조정했습니다.
## [0.9.0] - 2026-08-31

### English

<!-- Add matching English release bullets here. -->
- Add an opt-in native CSS Scroll Snap path for simple horizontal `slide` sliders, with strict eligibility, transform fallback, shared API/change semantics, mouse drag, keyboard, wheel, touch, sync, and authored-style restoration.
- Add a browser regression fixture covering native scroll position, manual scroll lifecycle, API navigation, mouse drag, keyboard navigation, sync, ineligible-effect fallback, and `destroy()` restoration.
- Make the first Slider demo viewport fill its card width; the component keeps coverflow shadow room without shrinking the authored demo area.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 단순한 수평 `slide` 슬라이더에 strict eligibility와 transform fallback을 갖춘 native CSS Scroll Snap opt-in 경로를 추가하고, API/change 의미·마우스 드래그·키보드·휠·터치·sync·authored 스타일 복원을 일관되게 유지했습니다.
- native 스크롤 위치·수동 스크롤 lifecycle·API 이동·마우스 드래그·키보드·sync·조건 밖 효과 fallback·`destroy()` 복원을 고정하는 브라우저 회귀 fixture를 추가했습니다.
- 첫 번째 Slider 데모 viewport가 카드 너비를 모두 사용하도록 조정하고, coverflow 그림자 여백은 컴포넌트 내부에서 유지하도록 했습니다.
## [0.8.105] - 2026-08-24

### English

<!-- Add matching English release bullets here. -->
- Fix Date Time ISO timestamps with fractional seconds so the `Both · relative + absolute` demo renders both values instead of retaining its placeholder text.
- Preserve the module deep-link hash when opening a shared demo-settings URL, so restoring a card cannot override the requested `#mod-…` destination on mobile or Safari.
- Add independent Slider track controls for release momentum, edge bounce, and sticky snap while preserving the existing fractional release target by default; document the native Scroll Snap and FLIP evidence gates in a dedicated RFC.
- Record the successful hosted CI, Firefox/WebKit matrix, Pages deployment, and live-site verification for the Slider physics follow-up.
- Add a pinned Rolldown consumer fixture alongside Vite, with separate gzip budgets and a generated report that distinguishes cross-bundler evidence from universal byte promises.
- Bound Playwright Chromium binary installation to five minutes per attempt with three required retries and kept apt dependency provisioning out of the main lane, so a stalled browser or package mirror cannot leave CI running until its global timeout.
- Annotate the exact consumer/framework subcommand when the hosted grouped check fails, preserving the hard gate while making remote-only failures actionable without private logs.
- Emit failure annotations from locked nested installs and consumer/Rolldown budget checks so a hosted failure identifies its failing boundary even when job logs require authentication.
- Account for the measured 0.3 KB Linux esbuild gzip delta at the full consumer fixture boundary while keeping the 130 KB product budget unchanged.
- Keep Firefox/WebKit matrix lanes on bounded browser-binary installs without apt provisioning, while restoring the Chromium lane's required libraries behind a 10-minute timeout so full browser QA remains runnable without an unbounded package-mirror wait.
- Connect cross-browser smoke servers through their originating Playwright engine instead of always using Chromium, restoring the WebKit smoke contract.
- Provision WebKit's required runtime libraries in its bounded matrix lane while retaining the faster Firefox binary-only path.
- Record the successful hosted v0.8.104 verification across Chromium, Firefox, WebKit, Pages, and both live-site hostnames.
- Add an opt-in public diagnostics hub with stable `KT_*` codes, bounded history, sink/subscriber APIs, and validation while keeping default consumers silent.
- Add an iOS Safari/Android Chrome physical-device QA runbook and evidence format without counting Playwright emulation as device success.
- Audit all 16 Page Reveal variants against distinct source mechanisms and keep removed aliases out of the public contract.
- Promote Cover Reveal gallery and Radial Carousel layer checks into the cross-engine `heavy-layout` regression checkpoint to catch clipping and ghost-image regressions.
- Absorb the measured Node 24/npm 11 diagnostics package archive boundary without widening the release file allowlist.
- Refresh the roadmap baseline to v0.8.104 and record the WebKit Tabs recovery, 52-module live-site check, and post-deploy verification evidence.
- Add a Korean troubleshooting guide for modular imports, hidden layouts, mobile Mega Menu, Slider/Radial drag, Page Reveal distinctions, date parsing, Scroll Shadows, SSR, CDN/SRI/GTM, CI, and reduced motion.
- Add a docs-navigation CI audit that keeps the package version, 52-module reference, module index, roadmap, and troubleshooting headings synchronized.
- Document when to use the full entry versus `core` + module imports and link the troubleshooting path from both README indexes.
- Absorb the measured 0.3 KB Node 24/npm 11 release-tarball boundary without widening the runtime file allowlist, and run the docs-navigation audit in the hosted CI group.
- Add a single generated 52-module usage and quality matrix, neutral demo badges for accessibility/performance/reduced-motion status, and a CI completeness check that keeps the demo surface and docs aligned.
- Bound Playwright Firefox/WebKit binary installation to five minutes per attempt with three required retries, so a stalled browser CDN cannot consume the full matrix job without producing a useful failure.
- Promote transform, clip, fixed/sticky, mask, and 3D layer boundaries for pageReveal, pageTransition, slider, stickyStack, stickyHeader, lightbox, cursor, and fullpage into a cross-engine `heavy-layout` demo-polish checkpoint, verified in Chromium, Firefox, and WebKit.
- Add a browser-layer QA matrix with module risk boundaries, used-value measurement rules, release triage categories, and criteria for promoting additional modules into the cross-engine checkpoint.
- Add five roadmap decision documents covering QA history, FLIP shared-layout scope, 1.0 readiness, preset/runtime boundaries, and platform progressive enhancement.
- Derive demo variant choices from the feature contract, remove stale Page Reveal/Loader effects, and add browser-support, consumer-bundle, module-status, and 1.0 diagnostics/deprecation audits.
- Add contract-aware contribution and issue forms for reproducible bugs, gated feature proposals, and browser/device QA evidence, plus a case-study template and CI readiness check for the long-term 1.0 gate.
- Record the successful `b6dbc87` Node/Firefox/WebKit matrix and Pages deployment in the browser QA history.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 소수 초가 포함된 Date Time ISO 시각을 정상 파싱해 `Both · relative + absolute` 데모가 placeholder 대신 상대·절대 시각을 함께 표시하도록 수정했습니다.
- 데모 설정 공유 URL의 `#mod-…` 모듈 딥링크를 보존해 카드 설정 복원이 모바일·Safari에서 요청한 이동 위치를 덮어쓰지 않도록 수정했습니다.
- Slider track에 release momentum·edge bounce·sticky snap을 서로 독립적으로 설정할 수 있게 추가했습니다. 기본값은 기존 fractional release target을 보존하며, native Scroll Snap과 FLIP은 별도 RFC의 증거 gate로 문서화했습니다.
- Slider physics 후속 변경의 hosted CI·Firefox/WebKit matrix·Pages 배포·live-site 검증 성공 결과를 기록했습니다.
- Vite와 함께 고정된 Rolldown 소비자 fixture를 추가하고, bundler 간 근거와 모든 bundler의 절대 바이트 약속을 구분하는 gzip 예산·생성 보고서를 연결했습니다.
- Playwright Chromium 바이너리 설치를 시도당 5분, 최대 3회로 제한하고 메인 lane에서는 apt 의존성 설치를 제외해 브라우저·패키지 mirror 정체가 CI를 전역 timeout까지 붙잡지 않도록 했습니다.
- hosted grouped check가 실패하면 정확히 어떤 consumer/framework 하위 명령인지 annotation으로 남겨 private log 없이도 원격 전용 실패를 추적할 수 있게 했습니다. 테스트 gate 자체는 유지합니다.
- locked nested install과 consumer/Rolldown 예산 검사가 실패할 때도 annotation을 남겨 job log 인증이 없어도 어느 경계에서 실패했는지 확인할 수 있게 했습니다.
- full consumer fixture에서 측정된 Linux esbuild gzip 0.3KB 차이만 반영하고 130KB 제품 예산 자체는 유지했습니다.
- Firefox/WebKit matrix lane은 apt 의존성 설치 없이 제한된 브라우저 바이너리를 사용하고, 전체 browser QA에 필요한 Chromium 라이브러리는 10분 timeout 안에서 복원해 package mirror 정체가 무기한 대기하지 않도록 했습니다.
- 교차 브라우저 smoke server를 항상 Chromium client로 연결하지 않고 생성한 Playwright engine으로 연결해 WebKit smoke 계약을 복구했습니다.
- WebKit matrix lane에는 필요한 runtime library를 제한 시간 안에 설치하고 Firefox는 빠른 바이너리-only 경로를 유지했습니다.
- Chromium·Firefox·WebKit·Pages와 두 live-site hostname에서 v0.8.104 hosted 검증이 성공한 근거를 기록했습니다.
- 기본 소비자는 조용하게 유지하면서 안정적인 `KT_*` 코드, 제한된 history, sink/subscriber API와 validation을 제공하는 opt-in 공개 diagnostics hub를 추가했습니다.
- iOS Safari·Android Chrome 실기기 QA 실행표와 증거 형식을 추가했으며, Playwright emulation을 실기기 성공으로 집계하지 않습니다.
- 16개 Page Reveal variant를 서로 다른 소스 메커니즘과 대조 감사하고, 제거된 alias가 공개 contract로 돌아오지 않도록 고정했습니다.
- Cover Reveal gallery와 Radial Carousel 레이어 검사를 교차 엔진 `heavy-layout` 회귀 체크포인트로 승격해 clipping·고스트 이미지 회귀를 잡도록 했습니다.
- release 파일 allowlist를 넓히지 않고 Node 24/npm 11 diagnostics 패키지 archive의 측정된 경계 차이만 흡수했습니다.
- 로드맵 기준을 v0.8.104로 갱신하고 WebKit Tabs 복구, 52개 모듈 live-site 점검, 배포 후 검증 근거를 기록했습니다.
- 모듈형 import, 숨겨진 레이아웃, 모바일 Mega Menu, Slider/Radial 드래그, Page Reveal 차이, 날짜 파싱, Scroll Shadows, SSR, CDN/SRI/GTM, CI, reduced motion을 증상별로 설명하는 한국어 troubleshooting 문서를 추가했습니다.
- package 버전·52개 module reference·module index·로드맵·troubleshooting heading의 동기화를 유지하는 docs-navigation CI 감사를 추가했습니다.
- 전체 엔트리와 `core` + 모듈 import를 언제 선택할지 문서화하고 두 README 색인에서 troubleshooting 경로를 연결했습니다.
- Node 24/npm 11에서 측정된 release tarball 0.3KB 경계만 흡수하고 runtime 파일 allowlist는 넓히지 않았으며, hosted CI 그룹에도 docs-navigation 감사를 포함했습니다.
- 52개 모듈의 사용 시점·피해야 할 상황·접근성·성능·reduced motion 상태를 단일 생성 매트릭스와 데모 뱃지로 연결하고, 데모·문서 누락을 잡는 CI completeness 검사를 추가했습니다.
- Playwright Firefox/WebKit 바이너리 설치를 시도당 5분, 최대 3회로 제한해 브라우저 CDN이 멈춰도 matrix job 전체 시간을 소모하지 않고 원인을 남기도록 했습니다.
- pageReveal·pageTransition·slider·stickyStack·stickyHeader·lightbox·cursor·fullpage의 transform·clip·fixed/sticky·mask·3D 레이어 경계를 `demo-polish`의 교차 엔진 `heavy-layout` 체크포인트로 승격하고 Chromium·Firefox·WebKit에서 검증했습니다.
- 모듈별 레이어 위험, used value 측정 규칙, 릴리스 triage 분류, 추가 모듈 편입 조건을 정리한 브라우저 레이어 QA 매트릭스를 추가하고 docs-navigation CI에 연결했습니다.
- 브라우저 QA 이력, FLIP shared-layout 범위, 1.0 계약 준비도, preset/runtime 경계, 플랫폼 progressive enhancement를 다루는 로드맵 문서 5개를 추가했습니다.
- 기능 계약에서 데모 variant 선택지를 생성해 오래된 Page Reveal·Loader 효과를 제거하고, 브라우저 지원표·소비자 번들·모듈 상태·1.0 진단/deprecation 감사를 추가했습니다.
- 계약 수치를 자동 감시하는 기여 가이드와 재현 가능한 버그·게이트가 포함된 기능 제안·브라우저/실기기 QA issue form, 실제 사용 사례 템플릿과 장기 1.0 readiness CI 검사를 추가했습니다.
- `b6dbc87`의 Node·Firefox·WebKit matrix와 Pages 배포 성공 결과를 브라우저 QA 이력에 기록했습니다.
## [0.8.104] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Give the Firefox/WebKit full demo-polish lane a third bounded attempt and a 20-minute job ceiling, while keeping the Chromium and cross-browser smoke contracts unchanged.
- Serialize the Firefox/WebKit hosted lanes and retain per-engine progress logs so WebKit resource contention or a stalled checkpoint can be diagnosed without weakening the gate.
- Bound the detached data-URL image readiness probe in Cover Reveal QA so a WebKit decode stall cannot consume all three browser retries.
- Emit the last completed demo-polish checkpoint as a CI annotation when a browser retry is terminated, keeping hosted-runner failures actionable without relaxing the gate.
- Synchronize both Cover Reveal mask regressions on their actual clip-path/stagger states instead of fixed delays, preserving the WebKit assertions while tolerating slow first-paint delivery.
- Keep the exhaustive help-field audit in Chromium's integrated lane and use a representative lazy drawer audit in Firefox/WebKit, so hosted engine QA reaches the motion checks within its bounded retry window.
- Make the line-mask regression sample unambiguously multi-line across engine font metrics, so stagger coverage tests the mask rather than an accidental single-line layout.
- Synchronize the Page Reveal zoom probe on the actual root animation and accept an already-exited color panel in slow WebKit mask timing while still requiring the color1 layer contract.
- Reposition Tabs indicators when a previously hidden tab set becomes visible, including WebKit where an ancestor visibility change may not resize the tablist.
- Watch hidden-ancestor mutations as a final Tabs visibility signal so WebKit reliably remeasures indicators when intersection and resize notifications are both skipped.
- Raise only the UMD raw ceiling by 1 KB for the measured hidden-tab recovery watcher; keep the consumer-facing gzip ceiling unchanged.
- Expose `tabs.refresh()` and invoke it after demo panels are revealed, giving externally hidden tab sets a deterministic post-layout indicator measurement path on WebKit.
- Cover delayed WebKit hidden-attribute commits with immediate, two-frame, and bounded follow-up Tabs measurements instead of an open-ended polling loop.
- Refresh the technical roadmap baseline to v0.8.103 and record the shipped View Transitions, provenance, and Node 24 verification evidence.
- Make Pages wait for the triggering CI run to finish and deploy only after that run succeeds, even when GitHub emits the workflow-run event before its conclusion is populated.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- Chromium과 cross-browser smoke 계약은 유지하면서 Firefox/WebKit 전체 demo-polish 단계에 제한된 세 번째 시도와 20분 작업 상한을 적용합니다.
- Firefox/WebKit 호스팅 단계를 엔진별로 직렬화하고 엔진별 진행 로그를 보존해 WebKit 자원 경합이나 정지한 체크포인트를 게이트 완화 없이 진단할 수 있게 합니다.
- Cover Reveal QA의 분리된 data URL 이미지 준비 대기를 제한해 WebKit decode 정지가 세 번의 브라우저 재시도를 모두 소모하지 않게 합니다.
- 브라우저 재시도가 종료될 때 마지막 demo-polish 체크포인트를 CI annotation으로 남겨 게이트를 완화하지 않고도 호스팅 러너 실패 원인을 확인할 수 있게 합니다.
- Cover Reveal mask 회귀 검사를 고정 지연이 아닌 실제 clip-path·stagger 상태에 동기화해 WebKit의 느린 첫 페인트에서도 검증을 약화하지 않고 통과하도록 합니다.
- 전체 help-field 감사는 Chromium 통합 단계에 유지하고 Firefox/WebKit에서는 대표 lazy 드로어를 감사해 호스팅 엔진 QA가 제한된 재시도 안에 모션 검사까지 도달하도록 합니다.
- line-mask 회귀 샘플을 엔진별 글꼴 측정에서도 확실한 여러 줄로 고정해 우연한 한 줄 레이아웃이 아닌 stagger mask를 검증합니다.
- Page Reveal zoom 검사를 실제 루트 애니메이션 생성 시점에 동기화하고, 느린 WebKit의 mask 타이밍에서 이미 빠져나간 색상 패널도 허용하되 color1 레이어 계약은 계속 검증합니다.
- 숨겨져 있던 탭 세트가 표시될 때 Tabs indicator를 다시 배치하며, 조상 visibility 변경이 tablist 크기 변경으로 전달되지 않을 수 있는 WebKit도 포함합니다.
- intersection와 resize 알림을 모두 건너뛸 수 있는 WebKit에서도 숨겨진 조상 변경을 감지해 Tabs indicator를 확실히 다시 측정합니다.
- 숨겨진 탭 복구 watcher의 측정된 비용만 반영해 UMD raw 상한을 1KB 올리고, 소비자가 체감하는 gzip 상한은 그대로 유지합니다.
- `tabs.refresh()`를 공개하고 데모 패널을 표시한 뒤 호출해 외부에서 숨겼던 탭 세트도 WebKit에서 인디케이터를 확실히 다시 측정하도록 합니다.
- WebKit의 지연된 hidden 속성 반영도 무한 polling 없이 즉시·두 프레임·제한된 후속 Tabs 측정으로 처리합니다.
- 기술 로드맵의 기준을 v0.8.103으로 갱신하고 배포된 View Transitions·provenance·Node 24 검증 근거를 기록합니다.
- GitHub가 workflow-run conclusion을 채우기 전에 이벤트를 보내더라도 Pages가 CI 완료까지 기다리고 성공한 경우에만 배포하도록 보강합니다.
## [0.8.103] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Verify the canonical Pages URL after deployment, including runtime version, module count, GTM, and the unversioned CDN route.
- Run the real demo-polish regression suite in the Firefox and WebKit CI lanes so Radial, mobile Mega Menu, drawer layout, and Page Reveal engine regressions cannot hide behind smoke-only coverage.
- Add Page Reveal mechanism smoke assertions for curtain, flash, iris, dissolve, fade, and push so visually-collapsing presets fail at the source-level boundary before a demo review.
- Keep the browser-coverage promise synchronized in release automation and QA reports, including cross-browser demo checks and post-Deploy live-site verification.
- Preserve Firefox/WebKit smoke and demo-polish screenshots as seven-day CI artifacts when a cross-browser lane fails, so engine-specific regressions remain inspectable.
- Add the opt-in Vue `useKinetoTransition()` bridge for `<Transition>` enter/leave hooks, phase-specific options, cancellation cleanup, and bounded completion fallback.
- Add opt-in same-document View Transitions enhancement to `flip` for keyed reorders, with authored-name restoration and automatic FLIP fallback.
- Keep the 130/135 KB consumer budgets and entry allowlist unchanged while absorbing only measured Node 24 runner variance for consumer bundles and distributable ESM gzip output.
- Create the GitHub Release with the runner's built-in `gh` CLI so transient codeload 429/502 failures from an external release action do not block npm publication.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 배포 후 canonical Pages URL에서 런타임 버전·모듈 수·GTM·unversioned CDN 경로를 실제로 확인합니다.
- Firefox·WebKit CI 단계에서 실제 데모 polish 회귀 검사를 실행해 Radial·모바일 Mega Menu·드로어 레이아웃·Page Reveal 엔진 회귀가 smoke 검사 뒤에 숨지 않게 합니다.
- curtain·flash·iris·dissolve·fade·push의 Page Reveal 메커니즘 smoke 검사를 추가해 시각적으로 합쳐지는 preset이 데모 검토 전 소스 경계에서 실패하게 합니다.
- 릴리스 자동화와 QA 보고서의 브라우저 범위 약속을 실제 cross-browser demo 검사와 배포 후 live-site 검증까지 동기화합니다.
- cross-browser 단계가 실패하면 Firefox/WebKit smoke·demo-polish 스크린샷을 7일간 CI 아티팩트로 보존해 엔진별 회귀를 확인할 수 있게 합니다.
- Vue `<Transition>`의 enter/leave 훅을 연결하는 opt-in `useKinetoTransition()`과 phase별 옵션·취소 정리·완료 fallback을 추가합니다.
- `flip`의 keyed same-document 재배치에서 opt-in View Transitions 경로를 사용하고, 기존 이름을 복원하며 미지원 환경에서는 FLIP으로 자동 fallback합니다.
- 소비자 번들과 배포용 ESM gzip에서 측정된 Node 24 러너 차이만 제한적으로 흡수하고 130/135KB 소비자 예산과 엔트리 허용 목록은 유지합니다.
- 외부 release action의 codeload 429/502 오류로 npm 배포가 막히지 않도록 러너 기본 `gh` CLI로 GitHub Release를 생성합니다.
## [0.8.102] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Add opt-in spring settling to Radial and share the Slider physics controls without changing the legacy cubic default.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 기존 cubic 기본 동작은 유지하면서 Radial에도 Slider 물리 제어값을 공유하는 opt-in 스프링 정착을 추가했습니다.
## [0.8.101] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Normalize ambiguous slash-form server dates in Korean locale as KST (+09:00), keeping relative labels stable across UTC hosts.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 한국어 locale의 슬래시형 모호한 서버 날짜도 한국 표준시(+09:00)로 정규화해 UTC 호스트에서 상대 시간 표기가 달라지지 않게 했습니다.
## [0.8.100] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Treat compact `YYYYMMDD[HHmmss]` server timestamps as Korean (+09:00) dates, keeping relative output stable on UTC hosts.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 압축형 `YYYYMMDD[HHmmss]` 서버 시각도 한국 표준시(+09:00) 날짜로 처리해 UTC 호스트에서도 상대 시간 결과가 달라지지 않게 했습니다.
## [0.8.99] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Fixed the date-time regression fixture to pin its Korean server timestamp comparison to `+09:00`, matching the parser contract on UTC runners.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 한국어 서버 날짜 파서 계약과 UTC 러너의 결과가 달라지지 않도록 날짜·시간 회귀 fixture의 비교 시각에 `+09:00`을 고정했습니다.
## [0.8.98] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Emit the exact uncaught assertion from motion-regression QA as a GitHub annotation so runner-only failures remain diagnosable without authenticated logs.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 러너에서만 발생하는 실패도 인증된 로그 없이 진단할 수 있도록 motion-regression QA의 처리되지 않은 assertion을 정확한 GitHub annotation으로 남깁니다.
## [0.8.97] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Keep runtime-regression checks running after an individual failure and emit the exact failed command as a GitHub annotation before failing the group.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 런타임 회귀 그룹에서 개별 검사가 실패해도 나머지 검사를 계속 실행하고, 그룹 실패 전에 정확한 명령을 GitHub annotation으로 남깁니다.
## [0.8.96] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Split the Node verification chain into five retryable groups so CI failures identify the contracts/package, consumer/framework, demo-surface, runtime-regression, or site/release boundary.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- CI 실패가 계약·패키지, 소비자·프레임워크, 데모 표면, 런타임 회귀, 사이트·릴리스 중 어느 경계인지 드러나도록 Node 검증 체인을 5개 재시도 가능 그룹으로 나눴습니다.
## [0.8.95] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Split CI and release verification into retryable lint, build, Node, demo, browser, packaging, and audit stages so runner-only failures identify their exact boundary.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 러너에서만 발생하는 실패의 정확한 경계를 확인할 수 있도록 CI·릴리스 검증을 lint, build, Node, 데모, 브라우저, 패키징, audit 단계로 나누고 각 단계를 재시도·로그 보존합니다.
## [0.8.94] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Preserve full CI and release verification logs as failure artifacts so runner-only failures can be diagnosed without rerunning blindly.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 러너에서만 발생하는 실패를 무작정 재실행하지 않고 진단할 수 있도록 전체 CI·릴리스 검증 로그를 실패 artifact로 보존합니다.
## [0.8.93] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Increased the bounded full CI/release verification retry policy to three attempts for transient browser and generated-bundle runner failures.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 일시적인 브라우저·생성 번들 러너 실패를 흡수하도록 전체 CI/릴리스 검증 재시도 정책을 3회로 조정했습니다.
## [0.8.92] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Preserved the 130 KB consumer bundle budget while allowing a measured 1 KB Node 24/Linux gzip variance at the generated-byte boundary.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 130KB consumer bundle 예산은 유지하고 생성 바이트 경계에서 발생하는 Node 24/Linux gzip 변동만 1KB까지 허용하도록 조정했습니다.
## [0.8.91] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Widened only the measured npm packed-size headroom for Node 24/npm 11 so the release workflow accepts the same 76-file allowlist across runners.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 동일한 76개 파일 allowlist를 러너별로 유지할 수 있도록 Node 24/npm 11에서 측정된 npm packed-size 여유만 조정했습니다.
## [0.8.90] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Expanded the date-time demo into past, future, combined, and absolute-handoff examples so every relative-time mode is visible and configurable.
- Normalized compact, Korean clock-text, and locale-aware day/month server timestamps before relative or absolute formatting.
- Fixed reduced-motion `secondsOnly` counters to keep the `000S` elapsed/countdown contract, and locked Clock/Elapsed seconds/Countdown demos to equal three-column desktop rows.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 날짜·시간 데모를 과거·미래·상대+절대·절대 날짜 전환 예제로 확장해 상대 시간 모드와 설정을 모두 확인할 수 있게 했습니다.
- 압축형 날짜, 한국어 시각 문장, locale 기준 일/월 표기의 서버 날짜를 정규화한 뒤 상대·절대 형식으로 처리합니다.
- reduced-motion에서도 `000S` elapsed/countdown 계약을 유지하도록 `secondsOnly`를 보완하고 Clock/Elapsed seconds/Countdown 데모를 데스크톱 3열 동일 폭으로 고정했습니다.
## [0.8.89] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Added opt-in nested Presence propagation for React and Vue: parent exit now waits for registered keyed children and preserves child-before-parent `safeToRemove` ordering.
- Kept Vue keyed groups stable when a propagated parent exit settles, while allowing the same keys to re-enter cleanly.
- Kept the npm release allowlist unchanged and absorbed only the measured nested-propagation package-size increase.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- React·Vue에서 선택형 중첩 Presence 전파를 지원합니다. 부모 exit가 등록된 keyed child를 기다리고 자식 `safeToRemove`가 부모보다 먼저 호출됩니다.
- 부모 전파 exit가 끝난 뒤에도 Vue keyed group이 안정적으로 유지되며 같은 key가 다시 enter할 수 있습니다.
- npm 릴리스 허용 목록은 그대로 유지하고 중첩 전파로 측정된 패키지 용량 증가만 반영했습니다.
## [0.8.88] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.87] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Added opt-in React/Vue `KinetoPresenceGroup` wrappers that track direct keyed children and retain exiting nodes until Presence settles, including `sync`/`wait`/`popLayout` forwarding.
- Kept the npm release allowlist unchanged while accounting for the measured keyed-child adapter source cost and cross-runner package variance.
- Kept the Vue adapter's 135 KB product budget strict while documenting a bounded 1 KB verification variance for the Linux runner's gzip output.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- React·Vue에 direct keyed child를 추적하고 Presence가 완료될 때까지 나가는 노드를 유지하는 `KinetoPresenceGroup`을 추가했습니다. `sync`/`wait`/`popLayout` 전달도 지원합니다.
- npm 릴리스 허용 목록은 그대로 유지하고 keyed child adapter 소스 용량과 러너별 패키지 편차만 측정값에 반영했습니다.
- Vue adapter의 135KB 제품 예산은 유지하고 Linux 러너 gzip 출력의 제한된 1KB 검증 편차만 문서화했습니다.
## [0.8.86] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Adjusted the packed-size budget for the measured Node 24/npm 11 GitHub runner variance without changing the release file allowlist.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- Node 24/npm 11 GitHub runner의 패키지 압축 크기 차이를 반영해 허용 한계를 조정했습니다. 릴리스 파일 허용 목록은 변경하지 않았습니다.
## [0.8.85] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Added host-owned React and Vue Presence composables/components with stable lifecycle refs, SSR-safe setup, and explicit enter/leave results; keyed-child auto-removal remains gated.
- Kept the npm release allowlist unchanged while accounting for the measured source cost of the new Presence adapters.
- Corrected the Presence Core RFC status so the completed Vanilla prototype is distinguished from the still-gated React/Vue adapters.
- Synced the roadmap baseline to v0.8.85 and recorded that `kineto.dongri.me` is canonical while the separate GitHub Pages copy is a manual backup.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 안정적인 lifecycle ref, SSR 안전한 초기화, 명시적인 enter/leave 결과를 제공하는 React·Vue Presence composable/component를 추가했습니다. keyed child 자동 제거는 아직 출시 게이트로 남겨 두었습니다.
- npm 릴리스 허용 목록은 그대로 유지하고 새 Presence adapter 소스의 측정된 패키지 용량만 반영했습니다.
- Presence Core RFC의 상태를 완료된 Vanilla prototype과 아직 출시를 보류한 React/Vue adapter가 구분되도록 바로잡았습니다.
- 로드맵 기준 버전을 v0.8.85로 맞추고 `kineto.dongri.me`를 공식 주소로, 별도 GitHub Pages 사본을 수동 백업으로 명시했습니다.
## [0.8.84] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Included the opt-in Slider spring settling feature from the failed v0.8.83 candidate in the next publishable patch.
- Increased the full consumer-bundle runner variance to a bounded 0.75 KB so Node 24/Linux gzip output at the rounding edge does not reject the 130 KB product budget.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 실패한 v0.8.83 후보에 들어갔던 Slider 선택형 스프링 정착 기능을 다음에 배포할 패치에 포함합니다.
- 130KB 제품 예산은 유지하면서 Node 24/Linux gzip 출력이 반올림 경계에서 거부되지 않도록 전체 소비자 번들의 러너 편차 한도를 0.75KB로 제한적으로 조정했습니다.
## [0.8.83] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Added opt-in Slider spring settling with public `stiffness`, `damping`, and `mass` controls; the existing interpolation remains the default and Radial hides the track-only controls.
- Kept the release package allowlist unchanged while accounting for the spring controls' measured unpacked archive cost.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- Slider에 선택형 스프링 정착과 공개 `stiffness`, `damping`, `mass` 조절을 추가했습니다. 기존 보간이 기본값으로 유지되며 Radial에서는 트랙 전용 컨트롤을 숨깁니다.
- 스프링 컨트롤로 늘어난 측정된 압축 해제 아카이브 용량만 반영했으며 릴리스 패키지 허용 목록은 그대로 유지했습니다.
## [0.8.82] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Extended the browser QA attempt timeout to 180 seconds so slower shared runners can finish the full demo and animated-media checks before a retry.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 느린 공유 러너에서도 전체 데모·애니메이션 미디어 검사를 재시도 전에 완료할 수 있도록 브라우저 QA 시도 제한을 180초로 늘렸습니다.
## [0.8.81] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Increased the release archive size guard by a measured 1 KB cross-runner margin; the npm allowlist and unpacked/file-count limits are unchanged.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- GitHub Actions와 로컬 npm 압축 차이를 반영해 릴리스 아카이브 크기 검사에 측정된 1KB 여유만 추가했습니다. npm 허용 목록과 압축 해제·파일 수 제한은 그대로입니다.
## [0.8.80] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Added the opt-in Slider `velocityInfluence` control for tuning release momentum; the default remains `0.35` and Radial hides the irrelevant field.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- Slider 해제 관성을 조절하는 선택형 `velocityInfluence` 컨트롤을 추가했습니다. 기본값은 `0.35`로 유지되며 Radial에서는 무관한 필드를 숨깁니다.
## [0.8.79] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Made Slider settling elapsed-time based with a capped frame delta, keeping release motion consistent across 60/90/120Hz displays and long background-tab gaps.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- Slider 정착을 경과 시간 기반으로 바꾸고 프레임 간격 상한을 적용해 60/90/120Hz 화면과 긴 백그라운드 탭 복귀에서도 해제 모션이 일관되도록 했습니다.
## [0.8.78] - 2026-08-17

### English

<!-- Add matching English release bullets here. -->
- Improved Slider drag release inertia by weighting up to five recent pointer samples by recency.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 최근 최대 5개 포인터 샘플을 순서로 가중해 Slider 드래그 해제 관성을 더 안정적으로 계산합니다.
## [0.8.77] - 2026-08-17

### English

- Added opt-in visibility lifecycle control for Slider and Radial: offscreen instances now stop transition rAF, autoplay, and progress work by default, with `pauseWhenOffscreen:false` for continuous playback.

### 한국어

- Slider·Radial이 화면 밖에 있을 때 전환 rAF·자동 재생·진행 UI 작업을 기본으로 멈추도록 했고, 계속 재생하려면 `pauseWhenOffscreen:false`로 선택할 수 있게 했습니다.
## [0.8.76] - 2026-08-16

### English

- Kept the 130 KB consumer budget strict while documenting a bounded 0.5 KB gzip variance for cross-platform runner output.

<!-- Add matching English release bullets here. -->

### 한국어

- 130KB 소비자 예산은 유지하고, 플랫폼별 러너 출력 차이만 허용하는 제한된 0.5KB gzip 편차를 문서화했습니다.

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.75] - 2026-08-16

### English

- Reduced the Radial smoothing branch so Linux consumer-bundle gzip stays below the 130 KB release budget without changing its behavior.

<!-- Add matching English release bullets here. -->

### 한국어

- Radial smoothing 동작은 유지하면서 Linux 소비자 번들도 130KB 릴리스 예산 아래에 남도록 해당 경로의 번들 크기를 줄였습니다.

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.74] - 2026-08-16

### English

- CI now retries the complete verification command once after transient runner or browser failures, while keeping the pass requirement strict.

<!-- Add matching English release bullets here. -->

### 한국어

- 일시적인 러너·브라우저 실패로 전체 검증이 중단되지 않도록 검증 명령을 한 번 재시도하되, 두 번째 실행도 반드시 통과해야 하도록 CI를 보강했습니다.

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.73] - 2026-08-16

### English

<!-- Add matching English release bullets here. -->
- Added opt-in Radial `smoothing` so orbit transitions can share the track slider's frame-based settling while preserving the existing duration default.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 기존 duration 기본 동작은 유지하면서 Radial에도 트랙 슬라이더와 같은 프레임 기반 정착감을 선택적으로 적용하는 `smoothing` 옵션을 추가했습니다.
## [0.8.72] - 2026-08-16

### English

<!-- Add matching English release bullets here. -->
- Restored direct GitHub Pages deployment from the verified `site/` artifact so the canonical demo receives updates after CI without a cross-repository token; added regression checks for the CI, npm, license, and jsDelivr badges.
- Synchronized the demo's visible module count and all locale copy with the 52-module feature contract, with a regression check preventing stale 51-module text.
- Hardened Radial Carousel touch handling and native drag prevention, restoring authored `draggable` and `touch-action` values on destroy.
- Reduced Radial Carousel's drag-protection bookkeeping so the full consumer bundle remains within the Node 24 gzip budget.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 검증된 `site/` artifact를 canonical 데모의 GitHub Pages에 직접 배포하도록 복구해 cross-repository token 없이 CI 후 최신 내용이 반영되게 하고, CI·npm·license·jsDelivr 배지 회귀 검사를 추가했습니다.
- 데모에 표시되는 모듈 수와 모든 locale copy를 52개 feature contract와 동기화하고, 오래된 51개 문구가 재발하지 않도록 회귀 검사를 추가했습니다.
- Radial Carousel의 터치 처리와 native drag preview 차단을 보강하고, destroy 시 작성자가 지정한 `draggable`·`touch-action` 값을 복원하게 했습니다.
- Radial Carousel의 드래그 보호 bookkeeping을 줄여 전체 소비자 번들이 Node 24 gzip 예산 안에 유지되도록 했습니다.
## [0.8.71] - 2026-08-16

### English

<!-- Add matching English release bullets here. -->
- Restored direct GitHub Pages deployment from the verified `site/` artifact so the canonical demo receives updates after CI without a cross-repository token; added regression checks for the CI, npm, license, and jsDelivr badges.
- Synchronized the demo's visible module count and all locale copy with the 52-module feature contract, with a regression check preventing stale 51-module text.
- Hardened Radial Carousel touch handling and native drag prevention, restoring authored `draggable` and `touch-action` values on destroy.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 검증된 `site/` artifact를 canonical 데모의 GitHub Pages에 직접 배포하도록 복구해 cross-repository token 없이 CI 후 최신 내용이 반영되게 하고, CI·npm·license·jsDelivr 배지 회귀 검사를 추가했습니다.
- 데모에 표시되는 모듈 수와 모든 locale copy를 52개 feature contract와 동기화하고, 오래된 51개 문구가 재발하지 않도록 회귀 검사를 추가했습니다.
- Radial Carousel의 터치 처리와 native drag preview 차단을 보강하고, destroy 시 작성자가 지정한 `draggable`·`touch-action` 값을 복원하게 했습니다.
## [0.8.70] - 2026-08-16

### English

<!-- Add matching English release bullets here. -->
- Added a Presence framework-adapter contract and React/Vue consumer fixtures that verify host-owned exit timing, cleanup, and SSR behavior before publishing keyed adapter components.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- keyed adapter component를 공개하기 전에 host가 DOM을 소유한 exit timing·cleanup·SSR 경계를 검증하는 Presence framework adapter 계약과 React/Vue 소비자 fixture를 추가했습니다.
## [0.8.69] - 2026-08-16

### English

<!-- Add matching English release bullets here. -->
- Added a Presence Core RFC that fixes cancellation, re-entry, safe-to-remove, focus/ARIA/inert, SSR, and reduced-motion gates before implementation.
- Added an opt-in `@dong-gri/kineto/presence` prototype with cancellable enter/exit, wait-mode re-entry, safe-to-remove callbacks, managed accessibility restoration, and SSR/reduced-motion fallbacks.

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
- 구현 전에 취소·재진입·safe-to-remove·focus/ARIA/inert·SSR·reduced motion 출시 게이트를 고정하는 Presence Core RFC를 추가했습니다.
- 취소 가능한 enter/exit, wait 모드 재진입, safe-to-remove callback, 접근성 상태 복원, SSR/reduced motion fallback을 지원하는 선택형 `@dong-gri/kineto/presence` prototype을 추가했습니다.
## [0.8.68] - 2026-08-16

### English

- Aligned the packed release budget with the measured Node 24/npm 11 runner while keeping the npm allowlist unchanged.

### 한국어

- npm allowlist는 유지하면서 Node 24/npm 11 실행기에서 측정되는 패키지 압축 크기를 반영하도록 릴리스 예산을 조정했습니다.
## [0.8.67] - 2026-08-16

### English

- Added a standalone `@dong-gri/kineto/states` modular entry so Core consumers can opt into Motion States without the full module registry.
- Added Core + States consumer gzip coverage and React/Vue lifecycle plus full/standalone SSR checks for state controllers.

### 한국어

- 전체 모듈 레지스트리 없이 Core와 Motion States만 선택할 수 있도록 독립 `@dong-gri/kineto/states` 모듈 엔트리를 추가했습니다.
- Core + States 소비자 gzip 예산과 React/Vue lifecycle, full/standalone States SSR 검증을 추가했습니다.
## [0.8.66] - 2026-08-16

### English

<!-- Add matching English release bullets here. -->

### 한국어

<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.65] - 2026-08-16

### English

- Added the first Motion States API with restricted visual states, cancellable apply/replay, HTML state scanning, destroy restoration, and reduced-motion final-state handling.
- Stabilized playground option help tooltips by removing animation sampling races and keeping the explanation visible while the settings drawer transfers focus.

### 한국어

- 제한된 시각 상태 집합, 취소 가능한 apply/replay, HTML 상태 스캔, destroy 복원, reduced motion 최종 상태 적용을 지원하는 Motion States 초기 API를 추가했습니다.
- 플레이그라운드 옵션 도움말에서 애니메이션 초기 프레임과 설정창 포커스 이동으로 툴팁이 사라지는 경합을 없애고 설명이 안정적으로 표시되도록 했습니다.
## [0.8.64] - 2026-08-15

### English

- Added a Motion States RFC with two real usage examples, lifecycle/cancellation semantics, bundle limits, accessibility boundaries, and explicit release gates before any public API is implemented.
- Extended the first-screen snap's opposite-direction momentum guard to cover the full landing animation on slower runners, while preserving same-direction momentum.

### 한국어

- 실제 사용 예제 2개, lifecycle·취소 의미, 번들 한도, 접근성 경계, 공개 API 구현 전 출시 게이트를 정의한 Motion States RFC를 추가했습니다.
- 느린 러너에서도 첫 화면 스냅의 반대 방향 관성 꼬리를 전체 착지 애니메이션 동안 차단하되 같은 방향 관성은 유지하도록 보호 시간을 확장했습니다.
## [0.8.63] - 2026-08-15

### English

- Kept playground help tooltips visible through focus changes and drawer reflow, removing a timing-sensitive failure in remote browser QA.

### 한국어

- 포커스 이동과 설정창 재배치 중에도 플레이그라운드 도움말 툴팁을 유지해 원격 브라우저 QA에서 발생하던 타이밍 의존 실패를 제거했습니다.
## [0.8.62] - 2026-08-15

### English

- Added framework-specific playground copy tabs for Vanilla HTML, Vanilla JS, React, Vue, and CSS variables, including current option values and an explicit Vanilla fallback for page-level modules.
- Made playground help tooltips use an explicit manual trigger so click/focus help remains visible while the settings drawer reflows in slower browsers and CI.

### 한국어

- 플레이그라운드 코드 복사 탭을 Vanilla HTML, Vanilla JS, React, Vue, CSS 변수로 확장하고 현재 옵션 값을 반영합니다. 페이지 단위 모듈은 어댑터가 없는 이유와 Vanilla fallback을 명시합니다.
- 설정창이 느린 브라우저나 CI에서 재배치될 때도 클릭·포커스 도움말이 유지되도록 플레이그라운드 도움말 툴팁을 명시적 수동 트리거로 변경했습니다.
## [0.8.61] - 2026-08-15

### English

- Radial now consumes the click generated after a drag instead of relying on a short timing window, keeping drag navigation stable on slower browsers and CI runners.

### 한국어

- Radial이 드래그 직후 발생하는 클릭을 짧은 시간 제한이 아니라 다음 이벤트 자체로 소비하도록 바꿔 느린 브라우저와 CI에서도 드래그 이동이 안정적으로 유지됩니다.
## [0.8.60] - 2026-08-15

### English

- Made Korean server-rendered Date Time values timezone-stable by parsing them as KST instead of the host environment's local timezone.
- Kept Brush Reveal's dynamically inserted images out of native drag previews, so late image hydration cannot reintroduce a translucent ghost.

### 한국어

- 한국어 서버 날짜를 호스트 환경의 로컬 시간대가 아니라 KST로 파싱해 Date Time 상대 표기가 CI와 SSR 환경에서도 동일하게 나오도록 수정했습니다.
- Brush Reveal에 나중에 삽입되는 이미지도 기본 드래그 고스트가 생기지 않도록 처리해 지연 이미지 하이드레이션 뒤에도 반투명 미리보기가 나타나지 않습니다.
## [0.8.59] - 2026-08-09

### English

- Added copyable, compact demo-setting URLs that restore safe changed controls for the selected example.
<!-- Add matching English release bullets here. -->

### 한국어

- 선택한 예시의 변경된 안전한 설정만 복원하는 짧은 데모 설정 URL 복사를 추가했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.58] - 2026-08-09

### English

- Retried locked nested QA installs after transient npm registry timeouts, while retaining strict lockfile installs and bounded retry delays.
<!-- Add matching English release bullets here. -->

### 한국어

- 잠깐의 npm 레지스트리 타임아웃은 제한된 재시도로 다시 시도하되, lockfile을 엄격히 따르는 설치 방식은 유지합니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.57] - 2026-08-09

### English

- Aligned CI with the Node 24/npm 11 release runtime, so the same full verification runs before a tag is created.
- Recalibrated Kineto's own bundle budgets after the 52-module release while retaining explicit GSAP/Lenis source and CDN-boundary checks.
<!-- Add matching English release bullets here. -->

### 한국어

- CI를 Node 24/npm 11 릴리스 런타임과 맞춰 태그를 만들기 전에 동일한 전체 검증을 실행합니다.
- 52개 모듈 릴리스 기준으로 Kineto 자체 번들 예산을 다시 측정했습니다. GSAP/Lenis의 소스·CDN 경계 검사는 그대로 유지합니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.56] - 2026-08-09

### English

- Prevented native image drag previews from appearing while painting a Brush Reveal stroke.
- Expanded Date Time relative formatting with selectable units, long/short/narrow style, rounding, and an automatic absolute-date cutoff.
- **Breaking:** removed preset names that were duplicates of another preset and replaced each with a distinct mechanism, keeping every module's preset count unchanged. Page Reveal dropped `circle`, `wipe`, `columns`, `strips` and `checker` for `curve`, `dissolve`, `push`, `grid` and `fold`; Text Transition's `slide` (literally the same object as `slide-up`) became `flip`; Glitch's `digital` (an alias that redirected to `noise`) became `wave`; Card Glow's `pointer` (identical to `spotlight`) became `edge`; Reveal's `zoom` and `flip` (indistinguishable from `zoom-in` and `flip-x`) became `swing` and `skew`.
- Rebuilt Page Reveal's timing on expo-out curves with a per-preset pace multiplier, so presets no longer start with a visible hesitation and all sixteen settle at a comparable perceived speed.
- Fixed Page Reveal `push` throwing the page to the bottom of the document: a percentage translate on the document root resolves against the whole document, not the viewport.
- Rewrote Page Reveal `flash` as an anamorphic light streak that clips the cover open, replacing a whiteout that ramped opacity and therefore read as `fade`.
- Fixed Reveal's no-GSAP fallback silently discarding rotation, shear, 3D and transform-origin, which left `rotate`, `flip-x` and `flip-y` rendering as a plain slide-and-fade.
- Fixed the Slider coverflow active shadow being clipped: the wrap now uses `overflow: clip` with a clip margin instead of two conflicting overflow decisions in the same module.
- Loader, Page Reveal and Page Transition settings now update the copied HTML as well as the JavaScript; their HTML tab used to be a fixed snippet that ignored every control.
- Added a development warning when two modules that both write the host element's `transform` are mounted on the same element, since one silently overwrites the other. `docs/rfc/module-composition.md` records the measurements and the proposed fix.
<!-- Add matching English release bullets here. -->

### 한국어

- **호환성 변경:** 다른 프리셋과 사실상 같았던 프리셋 이름을 제거하고 각각 다른 메커니즘으로 교체했습니다. 모듈별 프리셋 개수는 그대로입니다. Page Reveal은 `circle`·`wipe`·`columns`·`strips`·`checker`를 빼고 `curve`·`dissolve`·`push`·`grid`·`fold`를 넣었고, Text Transition의 `slide`(`slide-up`과 같은 객체였습니다)는 `flip`으로, Glitch의 `digital`(`noise`로 리다이렉트되던 별칭)은 `wave`로, Card Glow의 `pointer`(`spotlight`와 동일)는 `edge`로, Reveal의 `zoom`·`flip`(`zoom-in`·`flip-x`와 구분 불가)은 `swing`·`skew`로 바뀌었습니다.
- Page Reveal의 타이밍을 expo-out 곡선과 프리셋별 배속 계수로 다시 잡았습니다. 시작 직후 멈칫하던 느낌이 사라지고 16개 프리셋의 체감 속도가 맞춰집니다.
- Page Reveal `push`가 페이지를 문서 맨 아래로 밀어버리던 문제를 고쳤습니다. 문서 루트에 건 퍼센트 translate는 뷰포트가 아니라 문서 전체를 기준으로 계산됩니다.
- Page Reveal `flash`를 커버를 잘라 여는 애너모픽 광선으로 다시 만들었습니다. 이전 화이트아웃은 opacity를 램프해서 구조적으로 `fade`와 같았습니다.
- Reveal의 GSAP 미사용 폴백이 회전·전단·3D·transform-origin을 조용히 버리던 문제를 고쳤습니다. 그래서 `rotate`·`flip-x`·`flip-y`가 단순 슬라이드 페이드로만 보였습니다.
- Slider 코버플로우 액티브 섀도가 잘리던 문제를 고쳤습니다. 같은 모듈 안에서 충돌하던 두 개의 overflow 설정을 `overflow: clip` + clip margin으로 통일했습니다.
- Loader·Page Reveal·Page Transition 설정이 JavaScript뿐 아니라 복사용 HTML에도 반영됩니다. 기존에는 HTML 탭이 어떤 설정에도 반응하지 않는 고정 스니펫이었습니다.
- 호스트 요소의 `transform`을 함께 쓰는 두 모듈이 같은 요소에 올라가면 개발 중 경고를 띄웁니다. 한쪽이 다른 쪽을 조용히 덮어쓰기 때문입니다. 측정 결과와 해결안은 `docs/rfc/module-composition.md`에 정리했습니다.
- Brush Reveal을 문지를 때 브라우저 기본 이미지 드래그 고스트가 나타나지 않도록 수정했습니다.
- Date Time 상대 표기에 단위 선택, long/short/narrow 스타일, 반올림 방식, 일정 기간 이후 절대 날짜 자동 전환을 추가했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.55] - 2026-08-09

### English

- Clarified and exposed seconds-only Clock settings so `000S` supports both elapsed time from `since` and a remaining-seconds countdown to `until`.
- Fixed the Elapsed seconds Counter specialization: it now keeps the Clock renderer when a stale or conflicting mode is supplied, and its demo no longer exposes incompatible modes.
<!-- Add matching English release bullets here. -->

### 한국어

- `000S` 초 단위 표기는 `since` 기준 경과 시간과 `until` 기준 남은 시간 카운트다운을 모두 지원하도록 문구와 설정을 보완했습니다.
- Elapsed seconds Counter는 이전 설정에 충돌하는 모드가 남아 있어도 Clock 렌더러를 유지하도록 수정했고, 데모에서는 호환되지 않는 모드 선택을 숨겼습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.54] - 2026-08-08

### English

- Replaced private registry URLs captured in the framework QA lockfile with public npm URLs, so hosted runners can install its fixture dependencies.
<!-- Add matching English release bullets here. -->

### 한국어

- framework QA lockfile에 기록된 사설 레지스트리 URL을 공개 npm URL로 교체해 호스팅 러너도 fixture 의존성을 설치할 수 있게 했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.53] - 2026-08-08

### English

- Added an explicit Counter demo card for elapsed `000S` seconds, including its server-origin timestamp attributes.
- Restored a smooth hero scene transition for the deliberate one-gesture snap while retaining its momentum guard.
- Added the Date Time module for relative, absolute, and combined timestamps, with common server-date parsing and lifecycle cleanup.
- Made Page Reveal Flash a white double-exposure pulse with a tinted afterimage; Fade remains a continuous colour-cover dissolve.
- Normalized all Counter demo rows to equal three-column cards, vertically centered settings summary controls, and made the Date Time demo show a live past timestamp with its full settings panel.
<!-- Add matching English release bullets here. -->

### 한국어

- Counter에 서버 기준 시점과 함께 `000S` 경과 초 표시를 바로 확인할 수 있는 전용 데모 카드를 추가했습니다.
- 한 번의 입력으로 이동하는 첫 화면 장면 전환은 유지하되, 관성 차단을 유지한 채 부드러운 전환으로 복원했습니다.
- 일반적인 서버 날짜 형식을 인식하고 상대 시간·절대 시간·동시 표기를 제공하며 lifecycle 정리를 지원하는 Date Time 모듈을 추가했습니다.
- Page Reveal Flash를 흰색 이중 노출 펄스와 색상 잔상으로 분리하고, Fade는 연속적인 색상 커버 페이드로 유지했습니다.
- Counter 데모의 모든 행을 동일한 3열 카드로 정렬하고 설정 요약 컨트롤을 수직 중앙에 맞췄으며, Date Time 데모는 실제 과거 시각과 전체 설정 패널을 표시하도록 수정했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.52] - 2026-08-08

### English

- Made the release-package budget robust to the measured Node 24/npm 11 archive compression variance without widening the package allowlist.
<!-- Add matching English release bullets here. -->

### 한국어

- 패키지 허용 목록은 유지한 채 Node 24/npm 11에서 확인된 아카이브 압축 편차를 반영하도록 릴리스 패키지 예산을 조정했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.51] - 2026-08-08

### English

- Added the GTM-KFQSFGJL loader and no-script fallback to the demo source so every generated deployment includes the same Google Tag Manager container.
- Added a staged product and engineering roadmap covering consumer bundle budgets, adapter reliability, Motion States, Presence, shared layout, 1.0 gates, ecosystem growth, and explicit non-goals.
- Tightened inline terminal indicators, made Page Reveal Flash a distinct exposure pulse, restored touch opening for responsive Mega Menus, and improved edge fades, Reveal distance controls, and Slider drag handling.
- Added seconds-only Counter clocks, reliable blinking separators, consumer bundle budgets, React/Vue lifecycle and SSR fixtures, and supply-chain reporting guidance.
- Removed the default terminal frame-width reservation and vertically centered inline terminal glyphs; a fixed viewport is now reserved only when `viewportWidth` is explicitly set.
- Applied the Slider drag protections to Radial Carousel: images no longer create native ghost drags, swipes keep pointer ownership after the movement threshold, and the following click is ignored.
- Fixed responsive Dropdown as well as Mega Menu panels: touch toggles now share the mobile path and every non-custom responsive panel is viewport-bounded.
- Kept the demo hero's one-gesture bidirectional scene snap while suppressing gesture momentum after a landing and limiting reverse entry to the actual section boundary.
<!-- Add matching English release bullets here. -->

### 한국어

- 데모 원본에 GTM-KFQSFGJL 로더와 noscript fallback을 추가해 생성되는 모든 배포 사이트에 같은 Google Tag Manager 컨테이너가 포함되도록 했습니다.
- 소비자 번들 예산, 어댑터 안정성, Motion States, Presence, shared layout, 1.0 진입 조건, 생태계 확장 및 명시적 비목표를 단기·중기·장기로 정리한 제품·기술 로드맵을 추가했습니다.
- 인라인 터미널 표시기의 여백을 줄이고, Page Reveal Flash를 별도 노출 펄스로 구분했으며, 반응형 Mega Menu의 터치 열기와 가장자리 페이드, Reveal 거리 조절, Slider 드래그를 개선했습니다.
- 초 단위 Counter 시계와 안정적인 구분자 깜빡임, 소비자 번들 예산, React/Vue lifecycle·SSR fixture, 공급망 대응 문서를 추가했습니다.
- 터미널 프레임의 기본 폭 예약을 제거하고 인라인 특수문자를 수직 중앙에 맞췄습니다. 고정 폭은 이제 `viewportWidth`를 명시한 경우에만 예약됩니다.
- Radial Carousel에도 Slider의 드래그 보호를 적용했습니다. 이미지 고스트 드래그를 막고, 이동 임계값 뒤 스와이프의 포인터 소유권을 유지하며, 뒤따르는 클릭은 무시합니다.
- Mega Menu뿐 아니라 일반 Dropdown도 수정했습니다. 터치 토글은 같은 모바일 경로를 사용하며, `custom` 이외의 반응형 패널은 모두 뷰포트 안에 고정됩니다.
- 데모 첫 화면의 한 번 스크롤 양방향 장면 이동은 유지하되, 도착 뒤 관성을 차단하고 실제 섹션 경계에서만 역방향 진입하도록 해 튕김을 없앴습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.50] - 2026-08-02

### English

- Preserved each Fullpage section's internal scroll position when paging away and returning, while keeping first entry anchored at the top.
<!-- Add matching English release bullets here. -->

### 한국어

- Fullpage 섹션에 처음 진입할 때는 내부 스크롤 맨 위에서 시작하되, 다른 장에 다녀오면 각 섹션의 마지막 내부 스크롤 위치를 유지하도록 수정했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.49] - 2026-08-02

### English

- Added first-party TypeScript declarations for the full, modular, React, Vue, and jQuery package surfaces, enforced them in CI and installed-tarball checks, and removed the package's unnecessary dependency on itself.
- Protected default CDN engine downloads with SHA-384 subresource integrity, allowed custom engine sources to provide matching integrity metadata, and stopped Scroll Sequence from making an implicit request to an example.com placeholder when no frame source is configured.
- Corrected Loading Indicator Spokes so `normal` runs left-to-right and `reverse` runs right-to-left, with browser coverage for both phase orders.
- Aligned the bundle-size ceilings with the measured cost of pinned CDN integrity metadata while retaining tight guards against dependency bloat.
<!-- Add matching English release bullets here. -->

### 한국어

- 전체 패키지와 모듈형 import, React, Vue, jQuery 어댑터에 공식 TypeScript 선언을 추가하고 CI 및 설치 tarball 검사에 포함했으며, 패키지가 자기 자신을 의존하던 불필요한 항목을 제거했습니다.
- 기본 CDN 엔진 다운로드에 SHA-384 하위 리소스 무결성 검증을 적용하고 사용자 지정 엔진에 대응하는 integrity 설정을 추가했으며, 프레임 소스가 없는 Scroll Sequence가 example.com placeholder를 암묵적으로 요청하지 않도록 수정했습니다.
- Loading Indicator Spokes의 `normal`이 왼쪽에서 오른쪽으로, `reverse`가 오른쪽에서 왼쪽으로 진행하도록 방향을 바로잡고 두 위상 순서를 브라우저 테스트로 고정했습니다.
- 고정 CDN 무결성 메타데이터의 실제 측정 크기에 맞춰 번들 용량 상한을 조정하되, 의존성 비대화를 막는 엄격한 기준은 유지했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.47] - 2026-08-02

### English

- Made FLIP `crossfade` simultaneously fade an old-position visual clone out and the live new-position item in, and fixed Reset for nested Cover Reveal + Flip demos without detaching the reveal targets.
- Kept settings sections in their assigned masonry columns when ordinary option changes only alter fields inside an existing section.
- Made Cover Reveal `auto` extract a distinct, deterministic two-color palette per actual image element instead of relying on a gallery-level fallback; the Staggered Gallery now declares `auto` directly in its source markup.
- Normalized cursor following and Page Reveal Zoom across Safari frame rates, fixed Safari Lightbox Grid and Slider dot layout, and tuned the demo's Safari scroll/hover timing.
- Added diverse two-color image sampling to Cover Reveal, switched its image demos from a fixed palette to per-image `auto`, and made `mask:true` replace the final colored panel with an outer mask around each complete cover unit.
- Fixed Coverflow boundary/shadow sizing and Safari pagination artifacts, sealed Dissolve's rounded edges against inactive-slide color leakage, and added a complete-wheel Radial Slider layout with `position: 'center'` whose demo keeps its circles opaque, separated, and inside the stage.
- Made Cover Reveal Mask opt-in in the staggered gallery and matched the replaced final panel's per-line timing. The Radial demo now opens at Bottom, uses separate center/docked geometry, and animates every item from one shared angular position; Coverflow reserves a clipped lower gutter for its active shadow.
- Made FLIP `fade` visibly sequential at the old and new slots with a short transparent handoff, and combined Page Reveal Zoom's scale with an opacity 0→1 entrance.
<!-- Add matching English release bullets here. -->

### 한국어

- FLIP `crossfade`가 이전 위치의 시각 복제본을 Fade-out하는 동시에 새 위치의 실제 요소를 Fade-in하도록 구분하고, 중첩된 Cover Reveal + Flip 데모를 초기화해도 Reveal 대상이 분리되지 않도록 수정했습니다.
- 일반 옵션 변경으로 기존 설정 섹션 안의 필드만 달라질 때 섹션 자체가 다른 masonry 열로 이동하지 않도록 위치를 고정했습니다.
- Cover Reveal `auto`가 갤러리 공통 fallback에 의존하지 않고 실제 이미지 요소마다 대표색 두 개를 결정론적으로 별도 추출하도록 수정했으며, Staggered Gallery 원본 마크업도 직접 `auto`를 선언하도록 변경했습니다.
- Safari 프레임 속도에서도 커서 추종과 Page Reveal Zoom이 일관되도록 보정하고, Safari Lightbox Grid와 Slider 점 레이아웃 및 데모 스크롤·호버 타이밍을 수정했습니다.
- Cover Reveal에 서로 구별되는 이미지 대표색 두 개 추출을 추가하고 이미지 데모를 고정 팔레트에서 이미지별 `auto`로 전환했으며, `mask:true`가 마지막 색상 패널을 각 커버 전체를 감싸는 최상위 마스크로 교체하도록 수정했습니다.
- Coverflow 경계·그림자 크기와 Safari 페이지네이션 깨짐을 바로잡고, Dissolve의 둥근 모서리에서 비활성 이미지 색이 새는 현상을 차단했습니다. Radial Slider에는 원 전체를 표시하는 `position: 'center'`를 추가하고 데모 원이 반투명하게 겹치거나 무대 밖으로 잘리지 않도록 다듬었습니다.
- Staggered Gallery의 Cover Reveal Mask 기본값을 끄고 교체된 마지막 패널과 동일한 줄별 시간차로 마스크가 재생되도록 맞췄습니다. Radial 데모는 Bottom으로 시작하고 Center·도크 배치를 따로 조절하며, 모든 항목을 하나의 각도 값으로 회전시켜 끝 잔상을 없앴습니다. Coverflow는 클리핑 경계 안에 하단 그림자 여백을 확보했습니다.
- FLIP `fade`가 이전 위치에서 완전히 사라진 뒤 짧은 공백을 거쳐 새 위치에서 나타나도록 구분하고, Page Reveal Zoom에는 확대와 함께 opacity 0→1 진입을 적용했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.46] - 2026-08-01

### English

- Kept the persistent demo header visible and zooming with the rest of the page during Page Reveal `zoom` by removing the host-wide opacity fade.
- Removed Page Reveal Zoom's redundant full-viewport cover so the header no longer flashes behind it, added a left-right `pingpong` Loading Indicator bar mode, and made every generated settings field expose a non-shrinking, translated help button that works by hover, focus, or click.
- Kept the active Radial Carousel item fixed when switching from `infinite` to `off`, and removed click-handler accumulation across recreations.
- Expanded Flip reorder modes with motionless `none`, renamed the previous dissolve to `crossfade`, made `fade` pause between outgoing and incoming layouts, and made `scale` visibly shrink and grow without an opacity fade. Documented that `watch` observes external direct-child DOM mutations while instance reorder methods always play explicitly.
- Preserved the page scroll position across full-page Loader scroll locks, including overlapping Loader instances.
- Differentiated terminal presets: Braille remains a rotating two-dot spinner, Braille Pulse now visibly fills, holds, and drains, while Circle and Clock are documented as clockwise and anticlockwise variants.
- Added compact CI, npm version, license, and jsDelivr badges to the demo hero with keyboard focus styles and working external destinations.
- Automated the separate `catgarret.github.io/example/kineto` deployment after successful `main` CI, retained a moving jsDelivr runtime route, and refreshes its cache after npm publication.
- Changed the canonical live-demo URL to `kineto.dongri.me` for direct Cloudflare Pages hosting while retaining the existing separate-site deployment as a backup.
<!-- Add matching English release bullets here. -->

### 한국어

- Page Reveal `zoom`에서 대상 전체의 불투명도 페이드를 제거해 고정 헤더가 사라지거나 멈춰 있지 않고 나머지 페이지와 함께 확대되도록 수정했습니다.
- Page Reveal Zoom의 중복 전체 화면 커버를 제거해 헤더 깜박임을 없애고, Loading Indicator 막대에 좌우 왕복 `pingpong` 모드를 추가했습니다. 모든 설정 필드의 번역된 도움말 버튼이 잘리지 않고 호버·포커스·클릭으로 열리도록 보강했습니다.
- Radial Carousel의 반복 모드를 `infinite`에서 `off`로 바꿔도 활성 항목 위치를 유지하고, 재생성할 때 클릭 핸들러가 누적되지 않도록 수정했습니다.
- Flip 재배치 모드에 모션 없는 `none`을 추가하고 기존 디졸브를 `crossfade`로 이름 붙였습니다. `fade`는 이전 상태가 사라진 뒤 새 상태가 등장하며, `scale`은 불투명도 페이드 없이 축소·확대됩니다. `watch`는 외부 직계 자식 DOM 변경만 감지하고 인스턴스 재배치 메서드는 항상 명시적으로 재생한다는 점도 문서화했습니다.
- 전체 화면 Loader가 스크롤을 잠갔다 해제해도 페이지 위치가 맨 위로 돌아가지 않도록 했으며, Loader가 겹쳐 실행되는 경우도 기존 위치를 보존합니다.
- Braille은 두 점 회전형, Braille Pulse는 채움·유지·비움 게이지형으로 구분했습니다. Circle과 Clock은 각각 시계 방향·반시계 방향임을 데모와 문서에 명시했습니다.
- 데모 첫 화면에 CI, npm 버전, 라이선스, jsDelivr 배지를 작은 상태 행으로 추가하고 키보드 포커스와 실제 외부 링크를 적용했습니다.
- `main` CI 통과 후 별도 `catgarret.github.io/example/kineto`를 자동 배포하도록 구성하고, jsDelivr 최신 런타임 경로를 유지하면서 npm 발행 뒤 해당 캐시를 갱신하도록 했습니다.
- 기존 별도 사이트 배포는 백업으로 유지하면서 Cloudflare Pages에서 직접 제공할 수 있도록 공식 라이브 데모 주소를 `kineto.dongri.me`로 변경했습니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.45] - 2026-08-01

### English

- Fixed Hover Roll links restarting on click when pointer hover and keyboard focus overlapped; the label now restores only after both states leave.
<!-- Add matching English release bullets here. -->

### 한국어

- Hover Roll 링크에서 포인터 호버와 키보드 포커스가 겹칠 때 클릭으로 모션이 재시작되던 문제를 수정했습니다. 이제 두 상태가 모두 해제된 뒤에만 원래 라벨로 돌아갑니다.
<!-- 위 영문과 대응하는 한국어 릴리스 항목을 여기에 추가합니다. -->
## [0.8.44] - 2026-08-01

### English

- Added code-split `core` and `modules/*` package entry points so applications can register only the modules they use, with installed-tarball coverage and package-size budgets.
- Reduced runtime and rendering overhead with disposable environment listeners, bounded and retryable engine loading, low-performance fallbacks, lazy demo images, and compatibility-safe replacements for newer JavaScript APIs.
- Added Playwright Firefox and WebKit smoke jobs to GitHub Actions alongside the existing Chromium browser suite.
- Corrected Page Reveal `zoom` so its rectangular opening grows outward from the viewport centre instead of shrinking the cover inward.
- Gated settings by the selected variant: Lazy wave controls appear only for `wave`, pixel-step controls only for `pixelate`, and grain controls only for `grain`; terminal presets likewise hide unsupported direction and origin fields.
- Fixed Scroll Shadows to treat `axis:"x"` as horizontal, and contained Coverflow's active-slide shadow inside the demo card without clipping the intended shadow room.
- Localized terminal-frame descriptions across all seven demo languages and removed a duplicate full-grid measurement pass during responsive resizing.
- Fixed Tabs initialized inside hidden demo panels so the active underline or segmented pill appears on first reveal, without requiring a click or viewport resize.
- Added Mega Menu `responsive` modes (`wrap`, `scroll`, `custom`). The demo uses the single-row swipe mode on narrow screens, while open dropdown and mega panels remain viewport-bounded instead of being clipped by the scroller.
- Made the Page Transition effect picker a single swipeable mobile row and automatically scroll the selected effect into view.
- Added opt-in Coverflow active-slide shadows with configurable opacity and CSS tokens; the default remains off for backward-compatible rendering.
- Fixed responsive demo layout edge cases: compound Loading Indicator labels fit on mobile, a final lone card fills its row even after a full-width card, and mega menus open on the first hover while their two-column mobile panels stay inside the viewport.
- Fixed Loading Indicator settings and motion: the drawer now exposes its real `spinner` / `spin` defaults, preset changes hide unsupported controls, Scanner animates until an explicit progress value arrives, and bar/arc grow modes use slower continuous easing without low-refresh stepping.
- Added Lazy `wave` and `grain` reveals with configurable amplitude, frequency, speed, slice height, film grain, FPS and DPR limits. The existing `noise` and `zoom` compatibility aliases keep their prior meanings.
- Unified determinate loading output: Loader and Loading Indicator update scoped `data-kt-progress-output` text, CSS variables and ARIA values; Loading Indicator can subscribe to an existing Loader through `bindProgress()` or `progressSource`.
- Rebuilt `AI-PROMPT-GUIDE.md` around one canonical English application prompt with Korean usage guidance, current 51-module boundaries, Wave/Grain and shared determinate-progress examples. The repository-focused English AI handoff and Korean owner guide remain separate and intact.
- Shared one radial carousel engine between Slider's `effect:"radial"` and the backward-compatible standalone `radial` module. The 51-module public surface and `data-kt-radial` / `Kineto.radial()` entry points remain intact.
- Hardened preset-aware settings: secondary `mode` values can no longer be mistaken for module variants, defaults participate in every visibility decision, Slider hides effect-specific no-op controls, and incompatible track/radial markup choices are not offered.
- Split the GNB demo into read-only overview, dropdown, and mega-menu tabs so each editable example owns an independent settings panel.
- Documented bounded module composition, deferred module-entry/tree-shaking work, and mandatory copy-paste Git commands for agents without repository integration.
- Extended Slider with `perGroup`, `breakpoints`, `grabCursor`, `slideToClickedSlide`, `autoHeight` and `sync` — the last one links two sliders for the Swiper "thumbs gallery" / slick `asNavFor` pattern in either direction.
- Added Page Reveal `center-slit`, `iris`, `flash` and `data-mosaic`, preserved the existing `zoom` preset for compatibility, and removed only `panels` and `reveal-text` (duplicates of `strips` and a weak rule wipe).
- Added Glitch `rgb-slice-burst`: seeded, weighted-preset bursts of channel separation, slice shifts and artifact blocks with a clean recovery frame, and made `randomness` actually scale the plan spread.
- Added `data-mosaic` and `rgb-slice-burst` to Lazy so an image can assemble out of tiles or land through one glitch burst.
- Added Cover Reveal `mask` lead-in with `maskDirection`, plus `exit()`, `refresh()` and `watch` so a reordered list vanishes and re-enters instead of silently mutating.
- Added Flip `mode` (`slide`, `fade`, `fade-slide`, `scale`) and Text Split `drift` / `squeeze`.
- Made compound terminal indicators fully composable: `showSpinner`, `showLabel`, `showStatus` and `stepTotal` toggle each part, and one shared meter renderer means `dotCount`, `spread`, `fillChar` and `emptyChar` behave identically in Terminal Meter and Spinner + Meter.
- Fixed terminal frame spinners: `white-space:pre` restored the collapsed spaces that made every sprite track look stationary, descenders are no longer clipped, cursor presets keep a fixed width by blinking a persistent caret, and Marquee scrolls left-to-right with Hangul kept intact via grapheme segmentation plus optional `shuffle` / `decode` reveals.
- Corrected Text Shimmer direction: percentage `background-position` on an oversized image resolves to a negative span, so `normal` had been running right-to-left.
- Declared variant capabilities in the feature contract (`variantCapabilities` / `variantRequires`). `npm run sync:options` mirrors them into the playground, which now probes the real target, so a variant that cannot run on an element is never offered. Guarded by `tests/variant-capabilities.mjs` and documented in `docs/ARCHITECTURE.md`.
- Bottom Sheet and the settings drawer now allow text selection in the header while still resizing on a vertical drag; `maxHeight` applies as a ceiling in every mode and accepts `vh`, `%` or px.
- Page Loader can hand its exit to a Page Reveal effect via `revealEffect`, animating the loader itself rather than stacking a second cover on top.
- Overhauled Loading Indicator visuals (dual ring, orbit, spokes rotation, stretch/squeeze bar) and rebuilt Terminal Meter with true text characters for strict A11y compliance. Deployed automatic conditional option visibility across all 51 modules in the Playground.
- Added real progress support for Terminal Meter & Blocks, expanded ASCII/Unicode spinner frame presets (including braille-bounce, corners, squares, boxes), fixed light mode text shimmer looping, upgraded Orbit and Dual ring spinners, and implemented a smart auto-responsive Tetris-like grid layout for settings controls.
- Polished Loading Indicator visuals and behavior: removed default shadows, rebuilt equal-size dual rings, fixed spokes and reverse playback, refined orbit and Glow motion, made light-theme shimmer visible with a seamless loop, animated Terminal Meter, and added ASCII, Braille, arrow, line, circle and custom-frame terminal presets.
- Added `transformOrigin` to transform-driven loading variants and synchronized the playground, feature contract, documentation, localization and regression coverage.
- Restored the Cover Reveal line-demo display type, compacted the settings drawer with a draggable visible grip and groups-only scrolling, and cleared stale persisted drawer heights.
- Bottom Sheet header resizing now keeps the original top grip active as a second drag surface, with exact border-box height tracking. Toast countdown rings retain their depleted state through the exit animation instead of flashing full.
- Audited v0.8.43 for release readiness: all bundle and package budgets now pass, the npm dry-run contains 11 allowlisted files at 341.4 KiB compressed, and the approval-gated shipping sequence is documented.
- Added a separate inline Loading Indicator module with comet, dual-ring, spokes and orbit spinners; dots; indeterminate glow bars; text shimmer; and four symbol-only terminal styles.
- Kept Loader focused on full-page slot, circular and bar overlays while Loading Indicator remains in normal document flow.
- Added indicator lifecycle control through `show()`, `hide()`, `complete()`, `trackPromise()`, `finished`, callbacks, `kt-loading-indicator-*` events and custom renderer hooks.
- Added granular CSS tokens and preset-aware settings. Wandering Eyes is intentionally excluded.
- Replaced measured settings-panel masonry with deterministic two-column grid flow. A single or unpaired last group now spans the full row without overlap.
- Limited Bottom Sheet resizing to its handle or header so body text remains selectable.
- Fixed the settings-drawer easing field towering over every neighbouring control: a 430px container-query threshold matched the 420px controls column, so the field stacked and `aspect-ratio:1; width:100%` inflated the curve to 420×420 — the field measured 709.6px tall against 49.6px for a plain field. The threshold is now 330px, the stacked curve is capped at 200px, and an empty copy-status no longer reserves a 14px band. Field height: 709.6px → 263.6px.
- Replaced the demo's hand-written per-variant `WHEN` predicates with option support DERIVED from the module sources. `scripts/derive-variant-options.mjs` parses each module with acorn, finds the variable its variant funnels through (following re-derivations like `const preset = type === 'digital' ? 'noise' : type`), attributes every `opts.X` read to the variant branch enclosing it, and follows single-option locals so modules that read their options up front — Glitch and Lazy both do — are analysed correctly. The result is written to the contract as `variantOptions` and mirrored into the drawer, so adding a variant needs no demo edit. Glitch now shows 9 controls on `rgb` and 19 on `rgb-slice-burst` instead of the same list either way; 13 modules and 117 variants are gated this way. The analysis is conservative: anything it cannot attribute stays visible.
- Reserved exactly what a compound terminal meter needs instead of a hardcoded 17ch, sized for a 10-cell bar. Spinner + Meter measured 252px inside a 240px demo stage and was clipped; it is now 214px with 0px of width jitter as the percentage runs 9% -> 100%.
- Merged Text Shimmer/Wave and Tabs/Segmented into tabbed cards, found by scanning all 172 demo cards for groups whose `data-kt-*` key set is identical and only values differ. The other candidate groups are preset galleries (the 35 frame spinners, Glitch/Lazy presets) and Fullpage, whose cards differ in page structure rather than in option values, so tabbing them would hide the point of the demo.
- Gave every settings-drawer control a declared resting value. 176 of 371 fields showed an EMPTY input whenever the demo markup did not spell the option out as a `data-kt-*` attribute, so the panel disagreed with the running demo until you touched the control — which then wrote an attribute that had never existed. Defaults now live in `kineto.features.json` as `optionDefaults`, are mirrored into the demo by `sync:options`, and `tests/option-defaults.mjs` fails the build if a new control ships without one. Blank fields: 176 -> 0.
- Completed option tooltips: 371 drawer fields x 7 languages, 0 gaps. 29 fields (Slider, Glitch, Lazy) had no tooltip at all, 20 Cursor tooltips existed only in ko/en, and 16 merely restated their own label ("Glare opacity" -> "Glare opacity."). `tests/help-coverage.mjs` now rejects missing, over-long and label-restating tooltips.
- Removed inline presentation from the demo and from module-generated markup: the intro overlay's `cssText`, the root scroll locks, a `scrollMarginTop` that silently overrode a 4px-different CSS declaration, the async-font `onload` handler, and 5 `style="..."` attributes baked into innerHTML in cursor/lazy/progress. Runtime geometry that cannot be static (the drag-resized drawer) now publishes `--kt-drawer-h` instead. `tests/no-inline-styles.mjs` guards all of it.
- Rebuilt the Terminal Scanner preset: `direction:'reverse'` now mirrors the arrowhead (`[ <=== ]` against `[ ===> ]`) instead of replaying the same frames backwards, `dotCount` sets the track length, and a numeric `progress` fills the beam like the arc, the bar and the Terminal Meter. Compound presets can request a shorter meter through `compound.meterCount`.

### 한국어

- 애플리케이션이 사용하는 모듈만 등록할 수 있도록 코드 분할된 `core` 및 `modules/*` 패키지 진입점을 추가하고, 설치된 tarball 검증과 패키지 용량 예산을 적용했습니다.
- 해제 가능한 환경 감시자, 제한 시간·재시도 가능한 엔진 로딩, 저성능 환경 기능 축소, 데모 이미지 지연 로딩, 최신 JavaScript API의 호환성 안전 대체로 런타임·렌더링 비용을 줄였습니다.
- 기존 Chromium 브라우저 스위트와 함께 Playwright Firefox·WebKit 스모크 검증을 GitHub Actions에 추가했습니다.
- Page Reveal `zoom`의 사각형 노출이 커버를 중앙으로 줄이는 대신 화면 중앙에서 바깥쪽으로 커지도록 바로잡았습니다.
- Lazy 설정은 선택한 효과에 필요한 항목만 표시합니다. Wave 조절값은 `wave`, 픽셀 단계는 `pixelate`, 입자값은 `grain`에서만 보입니다. 터미널 프리셋도 실제 지원 여부에 따라 방향·원점 옵션을 숨깁니다.
- `axis:"x"` Scroll Shadows를 수평으로 해석하도록 고쳤고, Coverflow의 활성 그림자는 카드 밖으로 새지 않으면서 내부에서 잘리지 않도록 여백을 확보했습니다.
- 터미널 프레임 스피너 설명을 7개 언어로 맞추고, 반응형 변경 시 전체 데모 그리드를 중복 측정하던 작업을 제거했습니다.
- 숨겨진 데모 패널 안에서 초기화된 Tabs도 처음 열 때 활성 밑줄·세그먼트 필이 바로 보이도록 수정했습니다. 클릭이나 화면 크기 변경이 필요하지 않습니다.
- Mega Menu에 `responsive` 모드(`wrap`, `scroll`, `custom`)를 추가했습니다. 데모는 좁은 화면에서 한 줄 스와이프를 사용하며, 열린 드롭다운·메가 패널은 스크롤 영역에 잘리지 않고 화면 안에 표시됩니다.
- 모바일 Page Transition 효과 선택을 한 줄 가로 스와이프로 바꾸고, 선택한 효과가 자동으로 화면 안에 들어오도록 했습니다.
- Coverflow 활성 슬라이드 그림자를 선택형 옵션으로 추가했습니다. 투명도와 CSS 토큰을 제공하며 기존 화면 호환성을 위해 기본값은 꺼짐입니다.
- 반응형 데모 배치의 경계 조건을 고쳤습니다. 모바일에서 Loading Indicator 복합 문구가 잘리지 않고, 전체 폭 카드 뒤 마지막 한 장이 행을 채우며, 메가메뉴가 첫 hover에 열리고 모바일 2열 패널은 화면 안에 머뭅니다.
- Loading Indicator의 설정과 동작을 바로잡았습니다. 설정창에 실제 기본값 `spinner` / `spin`이 표시되고 프리셋 변경 시 미지원 옵션을 숨기며, Scanner는 명시적인 진행률을 받기 전까지 움직입니다. 막대·원호 grow 모션은 저주사율에서도 끊기지 않도록 더 느리고 연속적인 이징으로 다듬었습니다.
- Lazy에 `wave`·`grain` 노출 효과를 추가했습니다. 진폭·주파수·속도·조각 높이·필름 입자·FPS·DPR을 조절하며, 기존 `noise`·`zoom` 호환 별칭의 의미는 유지합니다.
- Loader와 Loading Indicator의 실제 진행률 출력을 통합했습니다. 범위 안의 `data-kt-progress-output` 문구·CSS 변수·ARIA 값이 함께 바뀌며, Loading Indicator는 `bindProgress()` 또는 `progressSource`로 기존 Loader를 구독합니다.
- `AI-PROMPT-GUIDE.md`를 영문 애플리케이션 프롬프트 기준본과 한국어 사용 안내 구조로 다시 썼습니다. 51개 모듈의 역할, Wave·Grain, 실제 진행률 공유 예시를 최신화했으며, 저장소용 영문 AI 인수인계와 한국어 소유자 안내는 별도로 유지합니다.
- Slider의 `effect:"radial"`과 기존 독립 `radial` 모듈이 같은 원형 캐러셀 엔진을 사용하도록 통합했습니다. 51개 공개 모듈과 `data-kt-radial` / `Kineto.radial()` 진입점은 그대로 유지합니다.
- 프리셋별 설정 노출을 보강했습니다. 보조 `mode`를 모듈 variant로 오인하지 않고, 기본값을 모든 노출 판단에 반영하며, Slider는 효과별 무의미한 옵션과 현재 마크업에서 실행할 수 없는 트랙/원형 효과를 제공하지 않습니다.
- GNB 데모를 전체 보기·드롭다운·메가메뉴 탭으로 나눴습니다. 전체 보기는 읽기 전용이고 편집 가능한 두 예시는 각각 독립 설정창을 사용합니다.
- 결합도가 낮은 모듈 연동 범위, 추후 트리셰이킹 계획, Git 연동이 없는 에이전트의 복사·붙여넣기 명령 제공 원칙을 문서화했습니다.
- Slider에 `perGroup`, `breakpoints`, `grabCursor`, `slideToClickedSlide`, `autoHeight`, `sync`를 추가했습니다. `sync`는 두 슬라이더를 양방향으로 연결해 Swiper의 썸네일 갤러리 / slick의 `asNavFor` 패턴을 지원합니다.
- Page Reveal에 `center-slit`, `iris`, `flash`, `data-mosaic`을 추가하고 기존 `zoom` 프리셋은 호환성을 위해 유지했으며, `strips`와 중복되는 `panels`와 완성도가 낮은 `reveal-text`만 제거했습니다.
- Glitch에 `rgb-slice-burst`를 추가했습니다. 시드 기반 가중 프리셋으로 채널 분리·슬라이스 밀림·아티팩트 블록을 조합한 짧은 버스트 뒤 완전히 깨끗한 프레임으로 복귀하며, `randomness`가 계획의 변동 폭을 실제로 조절합니다.
- Lazy에도 `data-mosaic`과 `rgb-slice-burst`를 추가해 이미지가 타일로 조립되거나 한 번의 글리치로 등장합니다.
- Cover Reveal에 `mask` 선행 노출과 `maskDirection`을 추가하고, `exit()`·`refresh()`·`watch`로 목록이 바뀔 때 사라졌다 다시 등장하도록 했습니다.
- Flip에 `mode`(`slide`, `fade`, `fade-slide`, `scale`), Text Split에 `drift`·`squeeze`를 추가했습니다.
- 컴파운드 터미널 인디케이터를 완전히 조립 가능하게 했습니다. `showSpinner`·`showLabel`·`showStatus`·`stepTotal`로 각 부분을 켜고 끄며, 미터 렌더러를 하나로 합쳐 `dotCount`·`spread`·`fillChar`·`emptyChar`가 Terminal Meter와 Spinner + Meter에서 동일하게 동작합니다.
- 터미널 프레임 스피너를 수정했습니다. `white-space:pre`로 붕괴됐던 연속 공백을 되살려 모든 스프라이트가 실제로 움직이게 했고, 디센더 잘림을 없앴으며, 커서 프리셋은 커서를 항상 두고 opacity만 깜박여 폭이 변하지 않습니다. Marquee는 좌→우로 흐르고 자소 분할로 한글 결합을 유지하며 `shuffle`·`decode` 연출을 옵션으로 제공합니다.
- Text Shimmer 방향을 바로잡았습니다. 박스보다 넓은 이미지의 퍼센트 `background-position`은 음수 구간으로 해석되므로, 지금까지 `normal`이 우→좌로 흐르고 있었습니다.
- 기능 계약에 variant 능력 선언(`variantCapabilities` / `variantRequires`)을 추가했습니다. `npm run sync:options`가 이를 플레이그라운드로 자동 반영하고, 설정창이 실제 대상을 검사해 실행할 수 없는 variant는 아예 제공하지 않습니다. `tests/variant-capabilities.mjs`로 보호하고 `docs/ARCHITECTURE.md`에 가이드를 남겼습니다.
- 바텀시트와 설정창 헤더에서 텍스트 선택과 수직 드래그 리사이즈가 함께 동작하도록 했고, `maxHeight`가 모든 모드에서 상한으로 적용되며 `vh`·`%`·px를 받습니다.
- Page Loader가 `revealEffect`로 Page Reveal 연출에 퇴장을 넘길 수 있습니다. 위에 커버를 덮는 대신 로더 자신이 그 효과로 걷힙니다.
- Loading Indicator 비주얼 퀄리티를 향상(듀얼 링, 궤도, 살 회전, 스트레치/스퀴즈 모션 추가)하고, 접근성 향상을 위해 터미널 미터를 텍스트 기반으로 새로 구현했습니다. 플레이그라운드의 전체 51개 모듈에 대해 비활성 옵션을 자동으로 숨기는 의존성 로직을 적용했습니다.
- Terminal Meter 및 Blocks에 실제 진행률(setProgress) 연동을 추가하고, braille-bounce·corners·squares·boxes 등 유니코드 스피너 프리셋을 확장했습니다. 라이트 모드 시머 루프 및 Orbit·Dual ring 스피너를 개선하였으며, 설정창 항목 수 및 아코디언 상태에 따라 빈 공간 없이 자동 정렬되는 반응형 테트리스 그리드를 구축했습니다.
- Loading Indicator의 기본 그림자를 제거하고 동일 크기 듀얼 링, 스포크·역방향 재생, 오빗, Glow 진행 모션, 라이트 모드 시머의 자연스러운 루프, 움직이는 Terminal Meter를 정비했습니다. ASCII·Braille·화살표·라인·원형·사용자 프레임 터미널 프리셋도 추가했습니다.
- transform 기반 로딩 타입에 `transformOrigin`을 추가하고 설정창, 기능 계약, 문서, 번역, 회귀 테스트를 동기화했습니다.
- Cover Reveal 줄 단위 데모의 큰 타이포를 복구하고, 설정창을 더 낮고 촘촘하게 정리했습니다. 보이는 회색 그립으로 높이를 조절할 수 있고 설정 그룹만 스크롤하며, 오래 저장된 높이값은 제거합니다.
- 바텀시트의 헤더 조절 모드에서도 기존 상단 그립을 함께 사용할 수 있도록 했고 `border-box` 기준으로 정확히 높이가 바뀝니다. Toast 카운트다운 링은 닫히기 직전 다시 차오르지 않고 소진 상태를 유지합니다.
- v0.8.43 배포 준비 상태를 점검했습니다. 모든 번들·패키지 예산이 통과했고 npm dry-run은 허용된 11개 파일, 압축 341.4 KiB이며 승인 후 배포 절차를 문서화했습니다.
- 코멧·듀얼 링·스포크·오빗 스피너, 점, 후광 바, 텍스트 시머, 기호형 터미널 표시를 별도 인라인 Loading Indicator 모듈로 추가했습니다.
- Loader는 전체 화면 Slot·Circular·Bar 오버레이만 담당하고, Loading Indicator는 일반 콘텐츠 흐름 안에서 동작합니다.
- `show()`, `hide()`, `complete()`, `trackPromise()`, `finished`, 콜백, 이벤트와 사용자 렌더러로 수명주기를 제어할 수 있습니다.
- 크기·두께·속도·방향·후광·글꼴을 옵션과 CSS 토큰으로 조절합니다. Wandering Eyes는 포함하지 않습니다.
- 설정창의 높이 측정형 배치를 제거했습니다. 하나만 남거나 홀수로 남은 마지막 그룹은 겹치지 않고 전체 폭을 사용합니다.
- 바텀시트는 그립이나 헤더에서만 높이를 조절해 본문 텍스트 선택을 방해하지 않습니다.
- 설정창의 easing 필드가 다른 옵션보다 과하게 크던 문제를 고쳤습니다. 컨테이너 쿼리 임계값 430px이 420px 폭의 옵션 컬럼에 매칭돼 세로 적층으로 바뀌고, `aspect-ratio:1; width:100%`가 곡선을 420×420으로 부풀려 필드 높이가 709.6px(일반 필드 49.6px)이 됐습니다. 임계값을 330px로 낮추고 적층 시 곡선 폭을 200px로 제한했으며, 비어 있는 복사 상태 줄이 14px을 예약하지 않게 했습니다. 필드 높이 709.6px → 263.6px.
- 데모에 손으로 적어두던 variant별 `WHEN` 조건식을 모듈 소스에서 도출한 지원 옵션으로 교체했습니다. `scripts/derive-variant-options.mjs`가 acorn으로 각 모듈을 파싱해 variant가 흐르는 변수를 찾고(`const preset = type === 'digital' ? 'noise' : type` 같은 파생도 추적), 모든 `opts.X` 읽기를 그것을 감싼 variant 분기에 귀속시키며, 옵션을 상단에서 지역변수로 먼저 읽는 모듈(Glitch·Lazy가 그렇습니다)도 지역변수 사용처를 따라가 정확히 분석합니다. 결과는 계약서의 `variantOptions`에 기록되고 설정창으로 복제되므로, variant를 추가해도 데모를 고칠 필요가 없습니다. Glitch는 `rgb`에서 9개, `rgb-slice-burst`에서 19개를 보여주며(이전에는 어느 쪽이든 같은 목록), 13개 모듈 117개 variant가 이렇게 게이팅됩니다. 분석은 보수적이어서 귀속하지 못한 옵션은 계속 보입니다.
- 복합 터미널 미터의 예약 폭을 10칸 기준 하드코딩 17ch 대신 실제 셀 수에서 유도합니다. Spinner + Meter가 240px 스테이지 안에서 252px로 측정돼 잘리고 있었고, 지금은 214px이며 퍼센트가 9%→100%로 변하는 동안 폭 흔들림이 0px입니다.
- Text Shimmer/Wave와 Tabs/Segmented를 탭 카드로 묶었습니다. 데모 카드 172개 전체에서 `data-kt-*` 키 집합이 동일하고 값만 다른 그룹을 스캔해 찾았습니다. 나머지 후보는 프리셋 갤러리(프레임 스피너 35종, Glitch·Lazy 프리셋)와 Fullpage였고, Fullpage는 옵션 값이 아니라 페이지 구조가 다른 카드들이어서 탭으로 묶으면 데모의 요점이 가려집니다.
- 설정창의 모든 컨트롤에 기본값을 선언했습니다. 371개 필드 중 176개가 데모 마크업에 `data-kt-*` 속성으로 적혀 있지 않으면 빈칸으로 떴고, 그래서 컨트롤을 만지기 전까지 설정창과 실제 데모가 어긋났습니다(만지는 순간 없던 속성이 처음 생겼습니다). 이제 기본값은 `kineto.features.json`의 `optionDefaults`에 있고 `sync:options`가 데모로 복제하며, 새 컨트롤이 기본값 없이 들어오면 `tests/option-defaults.mjs`가 빌드를 실패시킵니다. 빈칸 176 → 0.
- 옵션 툴팁을 전부 채웠습니다. 371개 필드 × 7개 언어, 누락 0. 29개(Slider·Glitch·Lazy)는 툴팁이 아예 없었고, Cursor 20개는 ko/en에만 있었으며, 16개는 라벨을 그대로 반복하고 있었습니다("Glare opacity" → "Glare opacity."). `tests/help-coverage.mjs`가 누락·과다길이·라벨 반복을 모두 거부합니다.
- 데모와 모듈 생성 마크업에서 인라인 표현을 제거했습니다. 인트로 오버레이의 `cssText`, 루트 스크롤 락, CSS 선언과 4px 어긋난 채 조용히 이기고 있던 `scrollMarginTop`, 폰트 비동기 로딩의 `onload` 핸들러, cursor·lazy·progress의 innerHTML에 박혀 있던 `style="…"` 5개입니다. 정적일 수 없는 런타임 값(드래그로 조절한 설정창 높이)은 `--kt-drawer-h`로 발행합니다. `tests/no-inline-styles.mjs`가 전부 감시합니다.
- 터미널 Scanner 프리셋을 다시 만들었습니다. `direction:'reverse'`가 같은 프레임을 거꾸로 재생하는 대신 화살촉을 뒤집고(`[ ===> ]` ↔ `[ <=== ]`), `dotCount`로 트랙 길이를 정하며, 숫자 `progress`를 주면 아크·바·터미널 미터처럼 채워집니다. 복합 프리셋은 `compound.meterCount`로 더 짧은 미터를 요청할 수 있습니다.

Kineto follows Semantic Versioning. Public scope is additionally governed by `FEATURE_CONTRACT.md`.
## [0.8.43]

- **Automated releases and AI handoff**: added repository-wide Codex/Claude
  completion rules, bilingual release notes, version preparation, tag shipping,
  npm Trusted Publishing, and GitHub Release automation.
- **Lean distribution**: reduced the npm/GitHub Release tarball from about
  1.06 MB to 293 KB by publishing only minimized runtime entry points. CI now
  enforces packed/unpacked/file-count budgets and installs the real tarball to
  verify ESM, CommonJS, and CSS exports.
- **Cover Reveal colour system**: supports a fixed colour, a two-colour layer pair, random selection within a user palette, or an automatically derived harmonious palette. Gallery cards now use the same public options shown in the playground.
- **Colour controls**: playground colour values preserve HEX, RGB(A), HSL(A), and CSS custom-property input while retaining a native colour swatch. Scroll Shadows exposes the useful shadow colour control with an RGBA default and infers its cover colour from the surface/CSS variable.
- **Playground polish**: contextual help uses Kineto's viewport-aware fixed tooltip without changing sheet scroll height; Ease controls are more compact; invalid Hover Roll mode choices are hidden; the footer, multi-row FLIP example, accordion spacing, and Confetti completion icon were refined.
- **Demo layout and reliability**: settings triggers now sit directly below their demo stages, Sticky/Floating/Horizontal scroll examples have native fallbacks, and fullpage/tab/slider/cover layouts are balanced. The rejected Split-flap Minimal variant and its standalone code/docs were removed.
- **Playground UX**: settings update live without a redundant Apply button; the settings/code views cross-fade in a content-sized responsive drawer, groups flow through a height-aware two-column layout and expand to full width when alone, and an unpaired collapsed group also fills its row. The Ease editor fills its two tracks with a square graph, unsupported option combinations stay hidden, and invalid values roll back to the last working state.
- **Module updates**: Slider adds dissolve, dots, CSS-customizable progress, and pause controls; hover and manual pauses preserve the remaining autoplay time instead of restarting the interval, while coverflow keeps its adjacent-card preview. Tilt and Card Glow add composable pointer-following shadows with full option and CSS-variable control. Reveal clock masks staggered list items independently. Fullpage now absorbs the gesture tail after a page change so a newly entered long section always starts at the top and scrolls internally only on the next gesture. Cover Reveal adds random direction and FLIP composition; FLIP adds reorder/shuffle/sort APIs; Scroll Shadows adds transitions, CSS variables, state APIs, and change events.
- **Runtime hardening**: option attributes that share another module's activation name (`progress`, `hold`, `drag`, `cursor`) are no longer double-initialized, preventing settings-driven destroy/recreate collisions.
- **Demo content and documentation**: Korean descriptions were tightened and completed across every card, translations and module contracts were synchronized to the 51-module registry, and obsolete standalone Shuffle help was folded into Text Reveal. Static inline styles/scripts were moved into the demo CSS/JS, and generated/package artifacts now pass browser, lifecycle, structure, dependency, size, and package checks.

## [0.8.42]

- **Accessibility & progressive enhancement**: `hold` and `progress` now provide a **reduced-motion path** so they keep working (hold confirms on click; the progress bar / back-to-top still render) instead of being no-op'd; `bottomSheet` dialog gets an accessible name (from a heading, `aria-label`, or `label`); `lightbox` traps <kbd>Tab</kbd> focus inside the modal; the reduced-motion "show it anyway" CSS now also covers `text-transition` / `shuffle` / `cover-reveal` / `text-fill`.
- **Performance**: `progress` no longer runs a permanent per-frame rAF (it idles when settled and wakes on scroll/resize) and caches its target element instead of `querySelector` every frame; `marquee` caches its width (re-measured on resize) instead of reading `offsetWidth` each frame; `radial.destroy()` now fully restores items (removes `kt-radial-item`, clearing the lingering `will-change`).
- **slider**: `wheel:true` — mouse-wheel navigation (whichever wheel axis has the larger delta pages the slider, throttled to one slide per flick).
- **tooltip**: `effect` (`fade` / `scale` / `shift` / `none`) for the show/hide animation; colours/shape stay themeable via `--kt-tooltip-*`.
- **radial**: items fade out toward the arc edges so a wrapping/leaving item no longer lingers as a translucent ghost.
- **Demo**: content reorganized into 7 category sections (Text / Media / Scroll / Pointer / Components / Feedback / System) matching the sidebar nav order 1:1; card descriptions trimmed to a single line; sticky-header / cover-to-fixed demos moved into cards with an options panel; loader/intro overlays cover the scrollbar-gutter; asset cache-busting.

## [0.8.41]

- **Scroll toolkit — three new modules** (now 51), CSS-first where the browser allows:
  - **`scrollShadows`** (`data-kt-scroll-shadows`): soft edge shadows on a scroll container that melt away at each end. Pure-CSS gradient technique — no per-scroll JS. Options: `axis`, `size`, `color`, `shadow`.
  - **`stickyHeader`** (`data-kt-sticky-header`): a sticky header that gains a shadow and (optionally) shrinks past a threshold — the shrinking-header / cover-to-fixed pattern. Publishes `--kt-header-progress` (0→1) for custom scrubbed styling. Options: `offset`, `distance`, `shrink`, `shadow`, `activeClass`, `onChange`.
  - **`horizontalScroll`** (`data-kt-horizontal-scroll`): pins a stage and slides its inner track sideways as you scroll vertically. Universal (no GSAP needed), `smooth` for inertial easing; `destroy()` rebuilds the original DOM.
- **`cssScroll` engine** gained `timeline:"scroll"` (links to the scrollport, for reading bars / reverse columns) alongside the default `view()`, plus an `axis` option — so more scroll-driven-animation patterns resolve to native CSS timelines when supported.
- **Global spring** — `Kineto.config({ spring: true })` gives `reveal` entrances and `gesture` feedback springy, overshooting easing by default (still overridable per element).
- **Segmented tabs fixes**: the active pill is restored in **vertical** orientation (was collapsing to zero height), marker motion / effects apply in both orientations, and activating a tab no longer reflows its width/height (a hidden bold twin reserves the space).
- **Tabs** `indicatorMotion` (`slide`/`none`/`fade`) — controls the moving marker independent of the panel `effect`.
- **overflowText**: item **scene transitions** (fade/dissolve/flip/page) no longer collapse the parent height mid-swap (box is locked to the tallest item and items cross-fade in place); **scroll-fade `crossfade`** rewritten to a clean end→start cross-dissolve so characters no longer smear over each other.
- **Toast** `progressBar:"fill"` — the whole toast box fills like a progress bar (in addition to `bar`/`ring`).
- **Confetti** `once:true` — fire a single burst instead of on every click.
- **Playground — easing editor**: `ease` / `easing` fields are now a **preset picker with a live cubic-bezier curve preview** (easings.net curves, CSS keywords, spring/back, GSAP eases) — pick a feel and see the curve, then copy the code.
- **scrollShadows** also gained `opacity` (0–1 shadow strength) and `shape:"radial"|"linear"` (soft bloom vs straight edge gradient).
- **scrollShadows** `mode:"mask"` — instead of edge shadows, the content itself **dissolves** at the overflowing edges via a scroll-aware gradient mask (ramped smoothly, not toggled). Shadow colour now reads a themeable `--kt-scroll-shadow` CSS variable.
- **marquee** `fade` — a gradient edge-mask (px) so continuous strips / logo rows dissolve at the ends instead of hard-cutting.
- **radial** `align:"center"` — places the active item at the container's centre for any dock/angle (was clipping at the docked edge).
- **parallax** now has a **native (non-GSAP) scroll fallback**, so parallax + reverse-scrolling-column layouts work everywhere, degrading gracefully.
- **textFill** — rounded glyph edges (e.g. the right of an "O") are no longer shaved off under tight letter-spacing.
- **Lightbox**: new `thumbnails:true` shows a **filmstrip** of the group's thumbnails inside the viewer (click to jump, active highlighted); the strip uses the on-page thumbnail so it stays light even when `data-kt-src` points at a big original (thumbnail↔original was already supported via `data-kt-src`). The playground panel now exposes `share`/`thumbnails` so it matches the live demo.

## [0.8.40]

- **Layout (FLIP) motion — new module `flip`** (48th): `data-kt-flip` smoothly animates children when they're reordered, added, or removed (First-Last-Invert-Play via a `MutationObserver`). Options: `duration`, `ease`, `stagger`, `item`, `watch`; API `record()` / `play()`. Fully accessible (honours reduced-motion) and `destroy()` restores the DOM untouched.
- **Brush Reveal — scratch-card API**: `hold:true` only paints while the pointer is pressed (click-drag), matching a lottery scratch card; default still paints on hover/drag. `threshold` (0–1) fires `onReveal(p, el)` + a `kt-brush-reveal` event once that fraction of the back image is uncovered, and `onProgress(p, el)` + `kt-brush-progress` stream the ratio continuously. New `progress()` API returns the current ratio.
- **Text Transition — reveal direction**: `charDirection` adds `rtl` (right→left) and `random` alongside the default `ltr`, so characters can cascade in from either side or scatter in.
- **Tabs — marker motion**: new `indicatorMotion` (`slide` / `none` / `fade`) controls the moving tab pill/underline itself, independent of the panel `effect` — glide it, snap it instantly, or blink it across.
- **Segmented tabs — vertical fix**: the active pill now spans the column width and moves vertically when `orientation:"vertical"` (was breaking horizontally).

## [0.8.39]

- **Toast polish**: default duration is now **10s (max 30s)**; clean **line-symbol icons** per type (no emoji); when using the countdown **ring**, the type icon sits in the ring's centre (no more overlap).
- **Switch — form-usable**: wrap a checkbox (`<button data-kt-switch><input type="checkbox" name="notify" hidden></button>`) and the switch drives it — it submits with the form and fires native `change`/`input` — while staying an accessible `role="switch"` control. Radios work the same way.
- **Tabs — selection API**: `onChange(index, tab, panel)` callback + a `kt-tabs-change` event on every change (so a segmented control can drive form state / analytics).
- **Segmented tabs** active pill now uses a `currentColor` mix so it's clearly visible on any background (was invisible on dark).
- **Radial carousel**: the active item exposes `.kt-active` / `.active-item` / `aria-current` for custom styling; the demo now scales the active thumbnail up and dims the rest.
- **Demo Module Index**: all 47 modules are listed and every chip scrolls to its section (button-triggered/body-level modules like loader, pageReveal, pageTransition now map correctly).
- **Gesture** `origin` and **Hold** `mash` `step`/`decay` demos retuned so the options' effect is clear.
- **overflowText — item scene transitions**: `fade` / `dissolve` / `flip` / `page` now also cycle **discrete item children** (like `rolling`), not just paginated overflowing text — automatically when the element holds ≥2 item children (keeping full markup).
- **Segmented tabs** demo: white active pill in light theme, light overlay in dark.

## [0.8.38]

- **Toast rewrite for robustness + customization**:
  - **Instant-dismiss fixed for good**: dismissal is now driven ONLY by a timer that can never drop below 300 ms; the progress bar/ring is purely visual (and stays in sync on hover). No event or hover can make a toast vanish instantly.
  - **`type:"none"`** (no accent/icon) added alongside info/success/warning/error.
  - **`icon` option**: default is the accent-coloured type glyph; `icon:false` removes it; or pass a custom string / emoji / inline SVG. Cleaner default than the old dot, and fully restyleable via `.kt-toast__icon` — or set a per-type background with `.kt-toast--error{--kt-toast-bg:…}`.
- Added **docs/DESIGN-PRINCIPLES.md** — every module (current 47 + future) must be optimized, accessible, progressively degrading, easy to apply, and easy to customize (options + CSS variables + class hooks); retro-applied where missing.

## [0.8.37]

- **New module `data-kt-switch` (46 → 47)** — accessible animated toggle: role="switch" + aria-checked, sliding thumb, click/Space/Enter, `onChange(checked, el)` + `kt-switch-change` event, `instance.toggle()/set()/checked`. Options `size`, `onColor`, `offColor`, `thumbColor`, `duration` (or `--kt-switch-*` CSS vars).
- **Tabs — segmented style**: add the `kt-tabs--segment` class to render the animated indicator as a sliding pill behind the active tab (the "Published / Scheduled / Drafts" look). Themeable via `--kt-seg-*`.
- **overflowText `scroll-fade` — `crossfade` option**: two overlapping tracks so the end fades out while the start fades in (no empty gap between passes).
- **Loader — headless API**: the built-in `renderUI` (custom DOM) and `onProgress` callback already allow full custom loaders; now the progress is also streamed to CSS variables `--kt-loader-progress` (0–1) and `--kt-loader-percent` (0–100) on the element, so a custom loader can be built in pure CSS. Built-in visuals stay restyleable via the `kt-loader-*` classes.
- **Lightbox — download button** (`download:true`) next to Share, and confirmed per-image thumbnail↔full-resolution: the thumbnail is the `<img src>`, the full image is `data-kt-src` (each image independent). Download fetches the full image as a blob (works cross-origin).

## [0.8.36]

- **overflowText — two new modes**: `fade` (pure page crossfade, no noise) and `scroll-fade` (scroll to the end, fade out, fade the start back in, repeat — a soft-looping marquee with no hard jump).
- **Hold — `mode:"mash"`** (button-mashing): each tap adds `step` and the fill `decay`s between taps, so rapid taps climb it to full — for games/UI mechanics. Also: fill is themeable via `color` / `--kt-hold-fill` and a `blend` (mix-blend-mode) option; new `instance.progress()`.
- **Accordion — `effect` option**: `blur` (blur + fade + height, default), `fade` (fade + height), or `none` (plain height, no opacity/blur).
- **Tabs — richer `effect`**: `fade` · `slide` · `blur` (blur-in) · `cross` (outgoing fades out, then incoming fades in) · `none` (instant, and the indicator no longer slides). The indicator is CSS-customizable (`--kt-tab-accent`, `--kt-tab-indicator-size`, or override `.kt-tabs__indicator`).
- **Reading Progress playground**: when `property` is a CSS variable (headless), the bar/ring `ui` options are hidden — switching them was clipping the custom-gauge demo.
- **Gesture — `origin` option** (transform-origin: center/top/bottom/left/right or any value) so the hover/press scale grows from where you want.
- **Toast**: type is now visually distinct via a small type-coloured dot (info/success/warning/error) instead of the removed border; `barColor` option (or `--kt-toast-bar`) for the progress colour; `progressBar` also accepts `"ring"`; `dismissible` toggles the close button; hardened the auto-dismiss timer so a stray hover can't make it vanish instantly.

## [0.8.35]

- **New module `data-kt-tooltip` (45 → 46)** — accessible, themeable tooltips: content from `content`/`title`/`aria-label`, `placement` (top/bottom/left/right, auto-flips at the viewport edge), `trigger` (hover / focus / click / manual), `delay` / `hideDelay`, `offset`, `duration`, `interactive`. role="tooltip" + aria-describedby, shows on keyboard focus, Esc closes. Theme with `--kt-tooltip-*`.
- **Toast progress option renamed** `progress` → **`progressBar`** (`data-kt-progress-bar`) — the old name collided with the `progress` module's `data-kt-progress` activation attribute, which was attaching a scroll-progress bar to the toast button (squished button, "Progress + Toast" panel, broken stacking/timing).
- **Class Hook (and all in-place) replay fixed**: the playground now replays via the instance's own `replay()` (no forced recreate), so `classOnly` reveals re-trigger their CSS transition.
- **Reading Progress — headless API**: set `property` to a CSS custom property (e.g. `--read`) to stream the 0–1 progress into it and render any custom shape from CSS; `onUpdate(value, el)` fires every frame. No built-in bar/ring required.
- **Bottom sheet** default now uses `light-dark()` + `color-scheme` so it adapts to the user's OS light/dark automatically (no site theming needed), still overridable via `--kt-sheet-bg` / `--kt-sheet-fg`.
- **Tooltip re-show fix**: it showed once then never again — `show()` cancelling a lingering hide animation fired that animation's `oncancel`, which re-hid the freshly-shown tooltip. `done` is now guarded by the visible state.
- **Rolling ticker replay fix**: replaying appended a second rolling viewport each time (stacked tracks, only the last animating). `buildRolling` now clears prior output first.
- **Toast**: `progressBar` now accepts `"ring"` for a circular countdown (as well as `"bar"`/`true`). The flicker/instant-dismiss users saw was the `data-kt-progress`↔`progress`-module collision, resolved by the `progressBar` rename in this release.
- **Composition note**: modules stack — e.g. `data-kt-magnetic data-kt-ripple` gives a magnetic button with a click ripple (demoed).

## [0.8.34]

- **Playground robustness (systemic)**: DOM-mutating modules (text-split, wrap, line-split, item-move) are now restored to their pristine snapshot before each live rebuild (keeping the current option values), so toggling options no longer leaves a demo broken until Reset. Stacked containers (e.g. ambient over lazy) are skipped to avoid wiping an inner module.
- **Full destroy() audit of all 45 modules** for restore-completeness. Fixes found:
  - **`loader`**: the page-fill overlay was never removed on destroy and accumulated on every recreate; also guarded against removing the host element when a custom `renderUI` returns no root.
  - **`hold`**: now restores the element's `position`/`overflow` and clears `kt-hold-confirmed` / `aria-pressed` on destroy.
  - **`cardGlow`**: restores the inline `position` it promoted onto child elements.
- **`coverReveal`**: `lines` mode on an element with no text (e.g. an image) now falls back to a whole-element block cover instead of blanking it; original text is restored on destroy.

## [0.8.33]

- **2 new Motion-benchmarked modules (43 → 45)**:
  - **`data-kt-gesture`** — whileHover / whileTap feedback: springs up (+ optional `lift`) on hover/focus, presses down on pointer/Enter/Space. Options: `hoverScale`, `tapScale`, `lift`, `duration`, `ease`. Keyboard-accessible; no-op under reduced motion.
  - **`data-kt-drag`** — draggable with `axis` lock, `bounds:"parent"` containment, `snapBack` spring-return, `inertia` momentum, and a `handle` selector. Focus + arrow keys nudge (Shift = larger). Reduced motion keeps drag, drops momentum.
- **Cursor**: empty cursor holders (`<div data-kt-cursor>` with no children/text) are now treated as **global** automatically, so the native OS cursor is reliably hidden (a stretched empty holder was being mis-detected as a scoped container).
- **Demo i18n**: language switch no longer breaks Replay — module-bearing elements (e.g. the text `coverReveal`) are excluded from the translation pass that rewrites paragraph HTML.
- All README translations (ko/jp/zh-CN/zh-TW/ru/it) and AI-PROMPT-GUIDE updated to 45 modules.

- **Radial carousel**: prev/next now advance on a single click (the pointer-capture that stole clicks is gone), wrap-around items jump instantly instead of sweeping across the arc, and the `left`/`right` dock focal angles are corrected (items were landing off-screen).
- **Cover reveal**: load-aware — when wrapping an `<img>` that isn't decoded yet it waits for load before sweeping (`waitForImage`, default on), so it never uncovers a blank frame; inherits the element's `border-radius` so panels clip to rounded corners; text (`lines`) mode split fixed to real rendered lines with sequential per-line reveal and 2-layer support.
- **Mega-menu**: the open/close indicator is now a clean SVG chevron (was a crude CSS border caret); ↑/↓ move between links in an open panel.
- **Accordion (demo)**: header padding moved onto `<summary>` so the whole header row toggles, not just the text.
- **Toast**: progress-bar default colour is the key orange (not the green type accent); demo button no longer squished.
- **Cursor (demo)**: inner dot grows on hover (instead of scaling the outer ring); thinner, slightly translucent ring; inverts over content via `mix-blend-mode`.
- **Demo**: hero no longer drifts with the pointer.

## [0.8.32]

- **New module `data-kt-cover-reveal` (42 → 43)**: one or two coloured panels cover an element and sweep away when it scrolls into view — a block/curtain reveal. Options: `color`, `color2`, `direction`, `duration`, `delay`, `ease`, `layers` (1–3), `stagger`, `threshold`.
- **Hold-to-confirm now performs the action** on completion, so it's usable without extra wiring: an `<a href>` navigates, a submit button (or `submit:true` / `data-kt-hold-submit`) submits the closest form, and `action="#selector"` clicks that element. The `kt-hold-confirm` event is cancelable (preventDefault to skip), and `onComplete(el)` still fires. Opt out with `submit:false`.
- **Toast**: opt-in countdown **progress bar** (`progress:true`, colour `--kt-toast-bar`/`--kt-toast-accent`) that pauses with the timer on hover; a **stack limit** (`max`, default 5) that evicts the oldest; multiple toasts stack with spacing. Position, size, colours and layout stay CSS-customizable (`--kt-toast-*`).
- **Cursor**: the demo cursor is reworked to match a proper reference — a small dot + smoothly-lagging outlined ring that inverts over content (`mix-blend-mode:difference`) and expands over links (dot hides). All via existing options (`hoverScale`, `hoverEffect`, `hideDotOnHover`, `mixBlendMode`, `borderWidth`).
- **Demo**: removed the pointer-parallax drift from the hero (the main content no longer moves with the mouse).
- **Lightbox `crossfade` fixed**: it was identical to `fade`. It now does a true cross-dissolve (outgoing frame fades out over the incoming one), distinct from `fade` (incoming only) and `dissolve` (blur).
- **Bottom sheet backdrop fix**: no more flash to full black then settle — the fade now targets the configured `backdropOpacity`, and that value is applied to the backdrop element itself (it was previously set where it couldn't reach it, so the option was ignored).
- **Mega-menu keyboard**: ↑/↓ now move between links inside an open panel (in addition to ←/→ across top items, Enter/Space/↓ to open, Esc to close).
- **Radial carousel geometry fixed**: the items were mis-positioned; the orbit transform origin and centering order are corrected so items sit on the arc.
- **Mouse Parallax**: reverted the global default multiplier to its original subtle value (the earlier change made the demo hero drift with the pointer). The demo's dedicated parallax card sets `speed` explicitly instead.

## [0.8.31]

- **New module `data-kt-radial` — radial / circular carousel (41 → 42)**: items orbit a hub docked to any edge (`position: bottom | top | left | right`) so only the focal arc shows. Rotate via prev/next, click an item, drag, autoplay, or ←/→. Accessible (role=group, aria-current, live region), reduced-motion snaps. Options: `radius`, `step`, `activeAngle`, `position`, `duration`, `loop`, `drag`, `controls`, `autoplay`.
- **Mega-menu / GNB — real-world options**:
  - Per-item trigger override: `<li data-kt-menu-trigger="click">` mixes click dropdowns with hover mega-menus in one bar.
  - Hover zone: `<li data-kt-menu-open="#selector">` opens that item when the pointer enters any matching element (e.g. a banner opens the mega).
  - `indicator: "chevron" | "plus"` shows an open/close icon on each trigger (state = aria-expanded).
  - **Fixed the broken mega layout**: a mega `<li>` is now a static container so its panel spans the whole bar (not the narrow item) — the collapsed/overlapping columns are gone.
  - **Ships clean default styling** for panel links (no raw browser blue/underline), list resets, focus rings — themeable via `--kt-menu-accent` / `--kt-menu-hover-bg`.
- **Lightbox — `transition` option** for the image change effect: `rise` (default) · `fade` / `crossfade` · `dissolve` · `slide` (direction-aware) · `zoom` · `none`.
- **Bottom sheet fixes**: reopening after close now works (the close animation's `oncancel` no longer hides a freshly reopened sheet). Backdrop is fully themeable — colour (`--kt-sheet-backdrop-bg`), opacity (`backdropOpacity`), and blur (`--kt-sheet-backdrop-blur`); width via `--kt-sheet-width`.
- **Toast**: removed the default left accent border (opt-in only now).
- Playground: radialCarousel, the new megaMenu `indicator`, and the lightbox `transition` are all exposed as live controls with copyable code.

## [0.8.30]

- **3 new modules (38 → 41)**:
  - **`data-kt-toast`** — transient status notifications in a shared live region (`role="status"`, or `"alert"` for warning/error), auto-dismiss with hover/focus pause, dismiss button, imperative `instance.show(msg, overrides)`. Options: `type`, `position`, `duration`, `dismissible`, `message`. Themeable via `.kt-toast*` / CSS variables.
  - **`data-kt-bottom-sheet`** — panel that slides up from the bottom with backdrop, drag-to-dismiss handle, Esc/backdrop close, focus trap and focus return. Triggers via `data-kt-sheet-trigger="#id"`. Options: `backdrop`, `backdropOpacity`, `dismissible`, `handle`, `duration`, `trigger`.
  - **`data-kt-tabs`** — WAI-ARIA / KRDS tab pattern: roving tabindex, ←/→ (↑/↓ vertical), Home/End, `automatic`/`manual` activation, animated indicator, panel fade/slide. Options: `activation`, `orientation`, `effect`, `indicator`, `duration`.
- **Playground: every new component is now fully customizable + copyable.** confetti, hold, accordion, megaMenu, toast, bottomSheet and tabs were added to the playground registry, so each demo card now has the live "Customize & copy code" drawer with option controls and HTML/JS copy — previously confetti and the others had no options panel at all.
- **Mouse Parallax fix**: the default per-layer multiplier was `0.05`, so `maxX`/`maxY` produced only ~1px of movement (effectively invisible). Default is now `1` — `maxX`/`maxY` are the real travel in px; layered depth stays opt-in per child via `data-mp-speed`.
- **Accordion**: cleaner default chevron (SVG-mask caret, vertically centred) and a new `arrowPosition:"left" | "right"` option (`.kt-accordion--arrow-left`).
- **Mega-menu**: fixed the broken demo layout — panels are dropdowns by default and only go full-width when the `<li>` has `.kt-menu-mega` (or `layout:"mega"`); removed the hover gap between trigger and panel.
- **AI-PROMPT-GUIDE.md**: added all seven UI/interaction modules (accordion, confetti, hold, megaMenu, toast, bottomSheet, tabs) to the module lists, the intent→module table, and a new customization cheat-sheet.

## [0.8.29]

- **New module `data-kt-mega-menu` (37 → 38)** — accessible GNB / mega-menu navigation. Hover-to-open dropdowns (Korean GNB style) or full-width mega panels (`layout:"mega"`), one open at a time. Progressive enhancement over a plain nested `<ul>`; full keyboard support (Enter/Space/↓ open, Esc close & return focus, ←/→ move between top items), automatic `aria-haspopup` / `aria-expanded` / `aria-controls`, outside-click & Esc to close, `openDelay` / `closeDelay` / `duration` / `trigger`.
- **Confetti — `trigger:"view"`**: fires once when the element scrolls into view, for success / completion screens where the burst should go off in the background on arrival. Colours, count, gravity, spread, and scalar remain fully customizable (e.g. a monochrome dark-mode palette).
- **Accordion — CSS theming hooks**: the open item now gets a `.kt-open` class and the trigger a `.kt-accordion-summary` class. A default rotating chevron ships in the stylesheet, themeable via `--kt-accordion-arrow`, `--kt-accordion-arrow-size`, `--kt-accordion-arrow-weight`, `--kt-accordion-arrow-duration`, or replaceable by restyling `.kt-accordion-summary::after`.
- **Demo — section re-categorization**: added a dedicated **Components** section (11) for disclosure / navigation UI; Accordion moved there out of "Content Entrance", Mega-menu added. Confetti and Hold cards now expose their options; corrected the stale "34 modules" labels to 38.

## [0.8.28]

- **3 new modules (34 → 37)** — filling gaps benchmarked against Motion UI / Toss, all attribute-driven, a11y-aware, progressively enhanced:
  - **`data-kt-accordion`**: animates native `<details>`/`<summary>` with a springy height morph + blur-in, keeping keyboard & aria; `single` (one-open), `duration`, `ease`, `blur`. Reduced motion leaves the native (instant) accordion.
  - **`data-kt-confetti`**: canvas celebration burst on click / `trigger:"auto"` / manual `.fire()`; `count`, `spread`, `colors`, `duration`, `gravity`, `scalar`. Skipped under reduced motion; the rAF loop stops once particles die.
  - **`data-kt-hold`**: hold-to-confirm control with a sweeping fill; fires a `kt-hold-confirm` event + `onComplete`, rewinds on early release; pointer + keyboard.
- **Ambient video — follows the frame, not just play state**: the glow now fades in with the first decodable frame (poster/paused frame included), keeps showing the frozen frame on pause/end, and only fades out when the video truly shows nothing (source cleared).
- **Demo — spacing fix**: standalone full-width cards in a section (e.g. "Scroll text fill" + "Direction responsive") were glued together with no gap; consecutive section-level cards/grids now share the 16px grid rhythm. New Accordion / Confetti / Hold-to-confirm demo cards added.

## [0.8.27]

- **Lazy pixelate — film-grain noise (Pixel-Mosaic parity)**: the pixel-mosaic reveal now composites monochrome noise that fades out as the picture resolves, matching the standalone Pixel-Mosaic-Lazy-Loader. On by default; `data-kt-noise="false"` (or `0`) disables it, a number sets peak opacity. Steps / stepCount / explicit px steps already worked.
- **Ambient media — synced to the media**: the glow starts hidden and fades in with the content — images fade in when their clone decodes; videos fade in on play, out on pause/end, and only sample while actually playing (YouTube-style). No more blurred backdrop sitting over a blank/paused box.
- **Optimization**: reveal releases its `will-change` GPU layer on completion; the ambient video sampler uses a desynchronized canvas. (Existing modern patterns kept: IntersectionObserver gating, rAF fps caps, DPR caps, off-screen/hidden-tab pause.)

## [0.8.26]

- **Docs — iOS `viewport-fit=cover` note**: README (+ all 6 translations) and AI-PROMPT-GUIDE now tell consumers to add `viewport-fit=cover` so full-screen effects reach under the notch & home bar.

## [0.8.25 audit]

- **Fix — clip/mask on iOS Safari (audit)**: every clip-path animation now also sets `-webkit-clip-path` so iOS repaints intermediate frames instead of popping to the end — reveal wipe/mask (gsap), loader exit wipe/mask (CSS transition), and the textTransition / overflowText / glitch WAAPI keyframes. Full-screen overlays (loader, pageReveal, pageTransition) are `position:fixed;inset:0`, so they cover the notch & home-bar when the host page uses `viewport-fit=cover`.

## [0.8.24]

- **Demo — iOS notch & home-bar**: `viewport-fit=cover` + a `theme-color` meta (kept in sync with the light/dark toggle) + base bg on `<html>` + safe-area padding on the header, so the notch and home-bar areas match the page instead of showing mismatched colors — including the intro loader, whose orange fill now reaches the screen edges (theme-color also tinted to the intro canvas while it plays).
- **Fix — lazy blur-up/fade/polaroid replay**: these animate the <img> via a CSS transition that lingered after the first run, so on replay the start value animated and immediately cancelled the reveal (nothing visible). The transition is now reset + a reflow forced before each run, so replay re-animates from the start.

## [0.8.23]

- **Fix — Wipe/mask stayed blank (real bug)**: the clip branch referenced `ease` before its declaration (TDZ), so `play()` threw and the clip never animated — the element stayed fully clipped (white). ease is now computed inside the branch; wipe reveals correctly.

## [0.8.22]

- **Demo deploy — moving alias + purge script**: the site used a moving version alias; run `npm run purge` after publishing to flush the jsDelivr cache so the newest build shows immediately.

## [0.8.21]

- **Demo deploy — pin exact version (fixes stale fixes)**: the generated site switched from a moving version alias to `@<version>`. jsDelivr can cache moving aliases for hours or days, so published library fixes (wipe, slider loop, counter…) kept serving an old bundle on the demo. Pinning the immutable exact version loads each release fresh, no purge needed.

## [0.8.20]

- **Fix — progress ring off-center (root cause)**: a mobile `@media` rule lifted *every* `.kt-progress-ring` with `bottom:calc(...)!important`, shoving the in-card static ring up ~78px. Scoped it to `body>.kt-progress-ring` so only the floating corner ring is lifted; the demo ring now centers.

## [0.8.19]

- **Demo — progress ring centered (absolute fill)**: the ring container now absolutely fills its stage and grid-centers, independent of any flex/grid height quirks, so the indicator is dead-center on mobile.

## [0.8.18]

- **Fix — horizontal pinned deck clipped**: the horizontal sticky-stack deck used `vh` for its height, so on mobile the bottom of a panel was clipped while scrolling down (URL bar showing). It now uses `svh` so panels always fit.
- **Fix — mobile pinned-scroll bounce**: ScrollTrigger no longer refreshes on the mobile URL-bar show/hide resize (`ignoreMobileResize`), so sticky-stack / scroll-sequence sections stop jumping the page down to the footer.
- **Demo — progress ring centered (for real)**: the ring stage now flex-centers, fixing the indicator being clipped at the top on mobile.

## [0.8.17]

- **Demo — progress ring truly centered**: the ring stage now fills its cell and grid-centers the indicator, so it sits dead-center vertically on mobile instead of drifting up.

## [0.8.16]

- **Demo — first-screen snap only after content is seen**: the hero→first-section snap now waits until the hero is fully scrolled into view, so a hero taller than the viewport (low-res / small window) reveals its cut-off content by normal scroll before snapping instead of jumping straight past it.
- **Demo — iOS motion button removed**: the built-in permission gate grants DeviceOrientation on the first genuine tap, so tilt + compass work without the extra button.

## [0.8.15]

- **Demo — Fullpage inner-scroll shown**: the "Fullpage Sections" demo now has a long section (02) that scrolls its own content before paging to the next, demonstrating the inner-scroll-then-advance behavior added in 0.8.13.

## [0.8.14]

- **Wipe/mask — actually animates now**: the real cause was that the bundled gsap won't tween a `clip-path: inset()` string (it stayed frozen fully-clipped = blank). Wipe/mask now run on a numeric proxy tween and build the inset string in onUpdate, so the reveal always plays (via ScrollTrigger or the IntersectionObserver backup) and on replay.
- **Lazy replay on Safari/iOS**: `preload` now resolves immediately for an already-cached image (Safari doesn't re-fire `onload` for a cached src), so BlurUp/Fade replay no longer hangs.
- **Demo — mobile notice keeps the border**: the touch “desktop only” overlay redraws the stage's 1px border so cards don't look broken.
- **Demo — progress ring centered**: the ring stage uses explicit flex centering so the indicator sits dead-center on mobile.
- **Demo — motion button placement**: the iOS “모션 센서 켜기” button sits above the bottom bar and fades out over the footer so it never overlaps it (still auto-dismisses after granting).

## [0.8.13]

- **Reveal — reliable entrance (fixes stuck Wipe)**: an IntersectionObserver backup now guarantees a reveal plays when it actually enters the viewport, even if ScrollTrigger measured its position before images/intro settled or the element was already on screen. Wipe no longer stays blank.
- **Slider — two loop styles**: `loop:'infinite'` (or `true`) endlessly wraps seamlessly; `loop:'rewind'` plays to the last slide then returns to the first; `loop:'off'` disables.
- **Counter (split-flap) — up & down**: the flip counter supports decreasing values (folds up) as well as increasing (folds down), following `from`→`to`.
- **Lazy skeleton/pulse — no icon ghost**: the pulse opacity keyframe is stopped before the fade-out, so the skeleton + icon disappear cleanly instead of lingering over the loaded image.
- **Fullpage — auto-advance + inner scroll**: new `autoAdvance` (ms) steps sections on a timer (pauses when hidden, resets on manual nav); a section taller than the viewport scrolls its own content before the deck pages on.
- **iOS — motion enable button** and **mobile demo polish**: a visible “모션 센서 켜기” button guarantees a valid tap to grant DeviceOrientation; pointer-only demos show a dimmed “desktop only” notice on touch; progress ring centers vertically; `scrollbar-gutter` is desktop-only to reduce mobile scroll jitter.

## [0.8.12]

- **iOS gyroscope — retry until granted**: the motion-permission gate now retries on each genuine tap (a first tap that turns into a scroll no longer permanently gives up) and listens in the capture phase, using `click`/`touchend`.

## [0.8.11]

- **Packaging — leaner tarball**: `.DS_Store` and stray `.fuse_hidden*` filesystem artifacts are excluded from the published package via negation patterns in the `files` list (a plain `.npmignore` is bypassed when `files` whitelists whole folders). Publish size dropped and no junk files ship.

## [0.8.10]

- **Fix — iOS gyroscope (tilt + compass)**: motion effects stopped working on iOS because the DeviceOrientation permission was requested per-element from `pointerdown`, which recent WebKit no longer treats as a valid user-activation for the permission prompt. There is now one shared permission gate triggered by the first `click`/`touchend` anywhere on the page, so a single tap unlocks the gyroscope for every tilt and compass element at once.

## [0.8.9]

- **Counter (slot) — direction follows the count**: a decreasing counter (e.g. a 34,000 → 10,000 discount) now rolls its digits downward (new digits drop in from above), while an increasing counter still rolls upward. Previously every reel scrolled up regardless of direction.
- **Demo — narrow-phone responsiveness**: the card grid drops to a single fluid column below 560px (the old `minmax(330px,…)` forced horizontal overflow that clipped cards and the overflow-text bar on iPhone-width screens), the overflow-text bar is now fluid, and the settings drawer gets a dedicated ≤480px layout (single-column controls, tighter gutters, wrapping header actions).

## [0.8.8]

- **Fix — `replay()` now works for on-screen elements**: `Kineto.replay()` used to destroy and recreate the instance, which built a fresh ScrollTrigger that never fires `onEnter` for an element already in view — so reveal effects stayed frozen at their start (e.g. `wipe` showed a blank/white box, `class` hooks did nothing). Replay now calls the instance's own `replay()` in place, and reveal's replay plays the entrance as a one-shot independent of the scroll trigger.
- **Slider / Coverflow — true infinite loop**: `loop` now cycles seamlessly in both directions with no snap-back at the ends. Slides are rendered at their shortest distance around a ring (no cloned DOM nodes), so drag, buttons, keyboard and autoplay all wrap continuously. `loop` stays an opt-in option (off by default).
- **Cursor (orbit) — press feedback**: while the orbit ring is bloomed over a hover target, pressing now contracts it by `pressScale` so a click is felt.
- **Lightbox — share no longer closes the viewer**: dismissing the native share sheet by clicking the page previously registered as a backdrop click and closed the lightbox; close is now suppressed while sharing (and briefly after).
- **Demo — intro scroll lock restored**: scrolling is locked at the root while the intro is up, so lazy images loading in behind it no longer shift the layout and jolt the scroll position when the intro releases.
- **Demo — no layout jank on overflow toggle**: `scrollbar-gutter: stable` reserves the scrollbar's width, so toggling `overflow:hidden` (intro, sitemap, lightbox) no longer changes the page width.

## [0.8.7]

- **Lightbox — share, editable zoom, swipe, EXIF**: opt-in `share` button (Web Share API, falls back to copying the URL); click the zoom percentage to type an exact value (double-click resets); swipe left/right to change image on touch when not zoomed; opt-in `exif` reads camera/exposure tags from the file and appends them to the info line (best-effort — silently skipped when absent or CORS-blocked).
- **Higher-quality CRT / VCR**: added an RGB aperture-grille (phosphor stripes), softer vignette, a gentle non-strobe flicker and a slow refresh sweep; VCR now has analogue SVG-turbulence noise, chromatic bleed and a tracking band. CRT power-on toned down — removed the horizontal flip/overstretch and softened the roll bar and overexposure.
- **Demo — sitemap centering**: the Module Index overlay now opens centred on screen; header icon button vertically aligned.

- **Continuous CRT / VCR effect** (`data-kt-glitch="crt"` / `"vcr"` on an image): a CSS overlay with 1px scanlines, a sweeping roll bar, vignette and flicker; VCR adds tracking noise and a picture jitter. Lightweight (no canvas). Added to the Media & UI demo.
- **Fix — glitch no longer destroys images**: text glitch presets (rgb/noise) applied to an image (or any element without text) previously blanked the content to grey; they now no-op safely. Any glitch preset is safe on any target.
- **CRT power-on (`lazy` crt)**: added black roll bars sweeping up/down as the picture powers on, for a more convincing tube feel.
- **Card Glow — press / tap reaction**: pressing/tapping moves the light to the touch point and pulses a brightness burst (touch + corner taps get a response without hover).
- **Demo — Module Index sitemap**: a header button opens a full overview of every section; each entry jumps straight to that module (in-page anchors, no page transition).
- **Playground selects**: restored the dropdown arrow in the options drawer (a `background` shorthand was wiping the arrow image) and gave the value room on the right.

## [0.8.5]

- **New `lazy` effect — `crt`**: old CRT / cathode-ray TV power-on. A bright line snaps open, the picture expands vertically out of it with an overexposed bloom, then settles behind a faint scanline overlay. Added to the demo and the playground effect list.
- **Lightbox mobile toolbar**: on narrow screens the centered `1 / N` counter overlapped the zoom/close controls — it now drops into flow so the counter sits left and the controls right (no overlap); zoom/close buttons are square.
- **Demo mobile fixes**: lightbox thumbnail grid no longer overlaps (robust 2-column, square thumbnails); the ripple sample is more visible (higher opacity) so the effect reads on touch.
- **Tooling — CDN demo generator**: `npm run demo:cdn` (also part of `npm run build`) regenerates a deploy-ready `site/` copy of the demo with the Kineto script/style pinned to the exact CDN version — no more hand-editing the public demo on every update, and no stale-cache surprises. `site/` is git-ignored (build output).
- **README**: added an "AI vibe-coding" credit line to the footer of all seven language READMEs.

## [0.8.4]

- **ambientMedia performance**: the video-sampling loop now pauses when the element scrolls off-screen or the tab is hidden (IntersectionObserver + visibilitychange), instead of sampling every frame forever. Cuts background work on long pages and weaker mobile GPUs.
- **Demo**: lighter `backdrop-filter` blur on mobile (8px instead of 20px) to reduce Android scroll jank; hidden scrollbar on the fullpage "first-slide" host; header language select / theme switch vertically centered; dark-mode toggle knob given more contrast; guarded against stray horizontal scroll.
- **Repo hygiene**: `tests/` untracked (kept locally, ignored) and the duplicate root `README.ko.md` removed (Korean lives in `i18n/`).

## [0.8.3]

- **GSAP conflict when a CDN copy is also loaded**: Kineto bundles gsap + ScrollTrigger, but if the host page also loaded gsap from a CDN there were two gsap instances — ScrollTrigger registered on one while Kineto animated on the other, so every scrollTrigger tween failed ("Invalid property scrollTrigger … Missing plugin? gsap.registerPlugin()") and scroll-sequence, sticky-stack (floating/horizontal scale-fade), parallax scrub and textFill silently stopped. Kineto now prefers the gsap/ScrollTrigger already present on the page and registers the plugin, so loading them from a CDN no longer breaks anything (loading them is unnecessary either way).
- **Fullpage swipe on mobile**: vertical and mixed-axis decks now use `touch-action:none` and hand the gesture off to the outer scroll themselves at the first/last section, so swipes are captured reliably instead of competing with the page's native scroll — without trapping the page at the edges.
- **Playground**: pressing Apply on a touch device now gives a short success haptic.
- **Ripple on touch devices**: the click-ripple was suppressed on some mobile browsers because touch `pointerdown` can report a non-zero `button`. The guard now only ignores secondary *mouse* buttons, so taps on phones (iOS Safari, Android Chrome) trigger the ripple.
- **npm README fix**: the npm package now ships only the English `README.md`, so the package page reliably shows it instead of arbitrarily picking one of the translated `README.*.md` files. All translations remain available in the GitHub repository.

## [0.8.2]

- **Brand consistency**: replaced the remaining all-caps `MOTIONKIT` strings — including the default `cursor` ring/orbit/snake text shipped in the library — with `KINETO`. Demo header, title, and footer updated to the current version.
- **README**: English is the default README with the other languages linked; added the five headline effect previews (GIF) and a short note on the origin of the name (from *kinetic* / Greek *kínēsis*, "motion").

## [0.8.1]

- **Fix: framework adapters resolve the scoped package.** The React, Vue, and jQuery adapters imported the core as `kineto`; after the rename to `@dong-gri/kineto` that no longer resolved, breaking adapter users on 0.8.0. They now import `@dong-gri/kineto`.
- Removed a stray duplicated `demo/kineto/` directory from the package.

## [0.8.0 development archive]

### Added / Changed (release prep)

- **Counter `from`**: counters can start from any value, not just 0, and animate up or down to `to` (e.g. a 34,000 → 10,000 discount). `plain` tweens the value; `slot` rolls each digit reel from the start digit to the target in the correct direction. Exposed in the demo playground and shown in a new "Discount" card.
- **Fullpage scroll hand-off (Chrome mouse wheel)**: restored `overscroll-behavior:contain` on the pager to stop the compositor from chain-scrolling the parent on uncancelable wheel events, and drive the outer scroll manually at the edges so nothing gets trapped. Normalises `deltaMode` (line/page → px) for mice that don't report pixels. Inside a scroll container the deck only takes over once it is fully pinned, so scrolling back up lets the parent rise first.
- **Safari `file://` fix**: removed `?v=` cache-buster query strings from local demo resources — Safari refuses query strings on `file://` URLs, which had blocked the whole bundle from loading. The demo intro loader also has a failsafe so it can never leave the page blank.
- **Header (dark mode)**: the brand button now sets its own `color` (buttons don't inherit it), so the wordmark is visible in dark mode.
- **Release packaging**: package renamed to `@dong-gri/kineto` with repository/homepage/bugs/keywords and `publishConfig.access: public`; READMEs (ko/en/ja) rewritten; added `PUBLISH-GUIDE.md` and `VSCODE-GUIDE.md`; removed the stale `kineto-0.5.1-stabilized` snapshot and stray `.DS_Store` files.

### Changed / Added (round 24 — inline options panel & polish)

- **Options are a wide floating dock with a spotlight.** The panel is a wide bottom dock; the card being edited is lifted above a light dim (no blur on the example) and scrolled into view, so you watch the live effect while adjusting. Toss/Supabase-style layout: grouped setting cards, label + value on one row, boolean toggles as switches, focus rings, and the code preview tucked into a collapsible "코드 보기" drawer. Actions (Replay/Apply/Reset/close) live in a sticky head; the sheet keeps its rounded top.
- **Fullpage — real mixed axis.** A single sequence can change direction per step: `axis:"mixed"` with `data-kt-fp-axis="x|y"` on each section (e.g. A→B→C horizontal, C→D vertical). Sections are placed on a 2D grid and the track translates in both axes. Added to the playground axis select.
- **Fullpage coexists with normal scroll.** At an edge it can't move toward, the wheel gesture is now fully released — even mid-gesture — so an outer scroll container or the page takes over. New demo: two slides that hand off to a normal-scroll area + footer ("첫 화면만 슬라이드").
- **Cursor orbit** demo now has a hover target so the ellipse→circle bloom is visible; **cursor image** demo shows the click burst (`clickSprite`/`clickImage` fire on click for any cursor type).
- **Glitch** gains a `reveal` preset: the flicker/decode-in load effect as a one-shot on an image, with its own `duration`.
- **Haptic** buttons show a toast on PC/iOS explaining vibration only fires on supported (mainly Android) hardware, instead of silently doing nothing.
- The Customize summary now scrolls long / translated module names with Kineto's own overflowText instead of clipping them.
- Lightbox Viewer grid rows trimmed to a fixed height so images no longer overlap the Customize summary.
- **Brand symbol.** New Kineto mark (`assets/logo.svg` / `demo/favicon.svg`) — a rounded tile with an object tracing an easing curve and a fading motion trail. Wired into the demo header (replacing the plain square), the favicon, and all READMEs.
- **Reusable toast** (`window.ktToast(msg)`): multi-line via `\n`, always centered, one shared component. Used by the copy buttons ("복사되었습니다"), Apply/Reset/Replay, and the Haptic-unsupported hint.
- **Fullpage release fix.** Dropped `overscroll-behavior:contain` on the container — because it's an overflow:hidden scroll container, `contain` was blocking wheel chaining and trapping the gesture. The wheel handoff is now gesture-scoped: while the deck can move, a whole flick is hijacked (one step, outer never scrolls); the outer scroller only takes over on a *fresh* gesture once the deck is exhausted — so fullpage and page never scroll at the same time. The coexistence demo fills its host and its normal-scroll area has a warm tint so it no longer reads as an error.
- **Lightbox fade speed fix.** When a lightbox shares `data-kt-duration` with another module on the same element (e.g. a lazy loader), the loader's long duration used to bleed into the backdrop fade. New `lightboxDuration` option (`data-kt-lightbox-duration`) overrides just the viewer fade; default lowered to 0.12s. The ambient/animated demo lightboxes now open/close at the same speed as the Lightbox Viewer.

### Fixed / Added (round 23 — media fixes, real photos & cursor hover)

- **ambientMedia no longer breaks on option change**: live edits rebuild only the edited module (single `rebuildModule`), so a stacked card (ambient over a lazy image + lightbox) never tears its own subtree out. Full "Apply" tears down then recreates inner-before-container.
- Lightbox demo opens fast (gallery `duration:0.12`, entry animation 240→170ms).
- Cursor image/custom react to hover: `hoverSrc` swaps the image, `hoverTemplate` swaps the custom HTML, `hoverClass` adds a class for your own CSS. Demo Image/Custom cards show it (image swap, DRAG→OPEN).
- **Real photo gallery**: 6 supplied images optimized to webp (28–64KB) and wired into the Lightbox Viewer (now 6, tidy 3-col grid, no overlap with the panel), Slider/Coverflow, Image Glitch, Brush Reveal and all Image Loading Effects cards.
- The Customize summary module name uses Kineto's own overflowText (bounce, pause on hover) when it's wider than its slot — also covers longer translated strings.

### Added (round 22 — counter/cursor customization & drawer notes)

- Counter flip (incl. clock/countdown): `seamColor` (fold-line color), `shadow` (toggle/custom drop-shadow), and `separatorColor` (comma/colon color) — all also overridable via CSS vars `--kt-counter-seam`, `--kt-counter-flip-shadow`, `--kt-counter-separator`.
- Cursor **snake**: eased, gentler shrink (`snakeMinScale`, sqrt curve) so glyphs stay legible instead of collapsing instantly.
- Cursor **orbit**: blooms from a flat ellipse into a larger full circle on hover over links (`orbitHoverScale`).
- Cursor **image / custom**: added demo cards + full tooltips (the HELP set never had a `cursor` module before — now ko/en, others fall back to en), with `src/width/height` and `template` exposed in the panel.
- clickSprite already auto-detects frame size/count; the demo now omits explicit sizes to show it, and the verbose sprite-sheet explanation moved into the drawer as a `data-kt-note` block (a reusable "notes in the settings drawer" mechanism).

### Changed (round 21 — full i18n tooltips, scramble & footer)

- Option `?` tooltips are now translated in **all 7 languages** (ko/en/ja/zh-CN/zh-TW/ru/it, 291 entries each, full key parity) in `demo/help-i18n.js`, switching live with the language selector.
- Scramble: `scrambleFade` now takes precedence over `rainbow` — when fade is on, scrambling uses brightness only (no color). `textReveal` flicker mode no longer applies rainbow (decode only).
- Settings apply is fail-safe: options the current preset doesn't support (WHEN-hidden) are dropped before create, and a bad combo can't blank the demo — it restores the captured defaults with a note.
- Intro loader percentage is black on a light brand canvas (no more cyan difference blend); GitHub buttons use the Phosphor GitHub icon; footer rewritten in natural Korean with a line break, `dongri.me` creator link, MIT + "AI 바이브코딩으로 제작" note (also in README).

### Added (round 20 — release packaging & demo polish)

- **Minified distributables + CDN**: `npm run build` now also emits `dist/kineto.min.js` (ESM, rolldown-minified, gzip ~62KB), `dist/kineto.umd.min.js` (CDN drop-in) and `dist/kineto.min.css`. `package.json` `unpkg`/`jsdelivr` fields point at the min UMD, and `exports` adds `./min` and `./umd`.
- **README bundle documentation**: a "번들 · 배포 포맷" table (file / format / use / gzip size) plus CDN (`jsdelivr`/`unpkg`), ESM CDN (`/+esm`), and optional GSAP/Lenis snippets; demo install box points at the npm CDN paths.
- **Tooltip i18n**: option `?` tooltips are now multilingual (`demo/help-i18n.js`, Korean + full English, 291 entries) and follow the language selector with per-key English→Korean fallback (ja/zh/ru/it fall back to English).
- **Phosphor Icons** across the demo chrome (via jsDelivr CDN): replay FABs, theme switch (sun/moon), hero support icons — replacing the hand-rolled inline SVGs that overlapped/looked off. The library itself stays icon-font-free (zero dependencies).
- **Intro loader redesign**: oversized thin Wanted Sans percentage (clamp up to 14rem, weight 100), a `KINETO` monospace wordmark, and `difference` blend so the number stays vivid over both the dark start and the rising orange fill.

### Fixed (round 19 — release QA)

- Intro loader was invisible on fast/cached loads twice over: the "already loaded → skip" branch always won on file://, and the whole-page fade veil (`body{opacity:0}`) also hid the loader overlay. The loader now always shows (resolved promise + minDuration) and the fade veil only covers the content containers (header/layout/footer), never the overlay.
- Loader scroll lock now locks the **root scroller** too (body overflow alone doesn't propagate when `<html>` has `overflow-x:clip`) and restores both on exit/destroy — applies to every loader, not just the intro.
- Intro percentage set in thin Wanted Sans (variable weight 100, tabular numerals) — `!important`ed over the module's inline slot typography.
- demo-qa waits for the deferred module boot before asserting.
- **Release QA sweep** (headless, full demo): 40 replay FABs, 87 option panels opened/changed/closed, lightbox open→nav→zoom→reset→close, 3 loaders with scroll-lock/restore, page reveals, fullpage round-trip, slider next/prev, 7-language cycle, theme round-trip, `Kineto.destroy()` → 0 instances → re-init — **zero page/console errors**. Full suite green: contract 34, owner requirements 46, package surface, utils/SSR, browser smoke; demo-qa passes except the sandbox-only H.264 video assert.

### Added (round 18 — demo split, Page Reveal panel & fixes)

- Demo split into `index.html` / `styles.css` / `main.js` (pre-paint theme/preload scripts stay inline by design); QA/requirement tests read the split files.
- Page Reveal card gained a full Customize panel (effect/direction/duration/delay/colors/pieces/stagger/angle) — the effect buttons and the panel share the same options.
- Loader: `exit:'slide'` is directional now (exitDirection or the fill direction), and `exit:'wipe'` actually sweeps — the mask transition had no start state, so it snapped instead of animating.
- Scramble options broke when the painter moved into utils (the option names vanished from the modules' contract extraction, so the playground filtered `data-kt-rainbow` & co. away) — modules now pass the options explicitly; rainbow / palette-range / fade all work from the drawer.
- Drawer field show/hide had silently stopped (descriptor kind guard was too broad) — WHEN-based visibility works again for every module.
- Mobile: the hero column was locked at 640px by its content and got clipped — it now stretches to the container (100%/min-width:0), verified at 390px.
- First visit: the whole page fades in (0.65s) the moment the preload veil lifts, with the entrance choreography playing underneath (skipped under reduced motion).

### Added (round 17 — loader fill everywhere & snap-x wheel)

- The intro's background-fill treatment is now a first-class **loader option set**, exposed in the Loading playground: `fill` (up/down/left/right), `fillColor`, `labelColor`, `labelBlend` (difference/exclusion/screen/overlay) — and a new **`exit:'wipe'` directional mask-out** that sweeps the finished overlay away (`exitDirection` defaults to the fill direction). The demo's Run slot ships with fill-up + difference label + wipe exit.
- Fullpage: wheel now works in `mode:'snap'` + `axis:'x'` (vertical wheel steps the horizontal snap container, gesture-grouped like transform mode).
- Cursor sprite auto-probe moved off the options object (WeakMap) so the feature contract stays clean.

### Added (round 16 — deterministic startup, axes everywhere & full i18n)

- **Deterministic startup (library + demo)**: new `kt-preload` convention — an inline script adds the class to `<html>` at first paint, entrance-animated elements stay invisible (kineto.css rules), and `scan()` releases the veil after modules apply their initial states. No more content flashing before its entrance plays, on any connection speed. The demo defers all module init to window `load`, covered by a **slot intro loader** (orange, thin mono type) whose background fills like a giant progress bar.
- **loader**: `fill` ('up'/'down'/'left'/'right') fills the overlay background with `fillColor` as progress rises; `labelColor` + `labelBlend` (e.g. `difference`) keep the percentage readable over the fill.
- **fullpage**: `axis:'x'` (horizontal paging — dots at bottom, arrow keys, nesting inside a vertical container gives mixed layouts), mouse **drag-swipe** (`drag`, on by default), and snap mode actually scrolls now (the percent chain was collapsing; dots sync to native snapping). Horizontal demo card added.
- **slider/coverflow**: `axis:'y'` — vertical sliding and vertical coverflow (rotateX), drag and arrow keys follow the axis.
- **Scramble styling** shared by shuffle + textReveal decode/flicker: `rainbow`, `rainbowColors` (hex/rgba stops sampled algorithmically instead of the full rainbow) and `scrambleFade` (brightness-only flicker).
- **vibrate**: `trigger:'manual'` + `instance.play()` for firing patterns from code; every module's JS code tab now shows selector-based usage (`Kineto.module('#id'|'.class', options)`).
- **cursor clickSprite** auto-detects frame size/count from the sheet (square frames assumed) when width/frames are omitted — explicit options still win.
- **tilt / cardGlow**: `disableOnMobile` switches the effect off entirely on touch devices.
- **i18n completed**: all 68 card descriptions translated into the 6 languages (plus chips/tooltips/support/footer); tooltips wrap at punctuation (`white-space:pre-line`).
- Lightbox: clicking the empty area beside the image now closes the viewer (drag/zoom-safe) — the stage was swallowing backdrop clicks; gallery demo grew to 4 images.
- Playground: drawer controls use the accent color (no more UA blue); the GSAP/LENIS install rows really hide now (`[hidden]` was losing to `display:flex`).

### Added (round 15 — clock everywhere, no-flicker drawer & hero refinements)

- Counter clock family gained `clockStyle:'flip'` — real time, countdown and elapsed timers can now render as a split-flap board (tile options fully compatible), alongside roll/fade/instant.
- Options drawer no longer flickers: option changes sync field visibility **in place** (fields toggle `hidden`) instead of rebuilding the panel; ESC closes the drawer and returns focus to its trigger.
- Module Index badges jump to the section demoing that module (keyboard accessible).
- Page Reveal `diagonal` rebuilt as a real angled curtain sweep (slanted cover + trailing panel, `angle`/`direction` options) — no more corner shrink.
- Hero: dependency toggles (Scroll Scrub / Smooth Scroll, English labels) sit inline in the support line and reveal the matching GSAP/LENIS CDN rows; chips renamed (간편설치 · 구형 브라우저 고려 · …) with centered, caret-arrow tooltips that break lines at punctuation; chip labels/tooltips, support line and footer brand are translated in all 7 languages; hero-meta spacing 50px; install badges auto-size (LENIS no longer cramped).
- Detail pass: summary flex gap 2px; Card Glow cards get a wider option panel (escaping the 50px card padding) with relaxed tracking, and their content stacks centered with a 12px gap.

### Added (round 14 — first-screen snap, 7 languages & final polish)

- Demo hero is a full-viewport (100svh) first screen: one scroll gesture snaps to the first section fullpage-style — and scrolling up from there snaps back — with gesture-grouped momentum swallowing on wheel and touch; everything below scrolls normally. Disabled under prefers-reduced-motion. The header brand (Kineto 0.8.0) scrolls to the top on click.
- Language selector grew to 7 languages: 한국어 · English · 日本語 · 简体中文 · 繁體中文 · Русский · Italiano (section copies + hero lead, `<html lang>` synced).
- Hero feature chips rewritten in plain Korean with centered hover tooltips (arrow caret) explaining each point; the dependency line now says it plainly — the core runs standalone, and an "PLUS" install row provides copyable GSAP + ScrollTrigger + Lenis CDN tags for the scroll-scrub/smooth modules.
- Counter countdown rolls digits downward by default (they're decreasing); `rollDirection` still overrides.

### Fixed (round 14)

- Snake cursor restored to the original loose elastic chain — and when the letters converge at rest, each glyph scales down with its spread so the stack collapses into a 1–2px dot (measured scale 0.12) instead of a letter blob.
- Slider/Coverflow: the Prev/Next row sat flush against the options summary — cards with real control rows keep a separated panel with proper spacing (16px, own border and radius).
- Module Index group labels vertically centered against their chip rows.

### Fixed (round 13 — gesture isolation & detail pass)

- **Fullpage really swallows momentum now**: wheel events are grouped into gestures (280ms window) — once a gesture triggers a step, its entire momentum tail is preventDefault-ed, and touch swipes navigate at the threshold then consume the rest of the touch. `overscroll-behavior:contain` blocks scroll chaining on mobile. Verified: 14 rapid wheel events → exactly one section step, 0px page movement.
- Theme switch: states were inverted — dark mode now highlights the moon (knob on the moon side), light highlights the sun; icons are larger filled monochrome glyphs (no accent colors).
- "Blink colon" (and other true-by-default checkboxes: seconds, lightbox toolbar/info/minimap, fullpage dots/wheel/touch/keyboard) rendered unchecked in the drawer while actually on — defaults registered so the panel reflects and controls them correctly.
- Counter digits clipped in narrow cards — counter stages use container queries to scale the type down (with the old vw clamp as fallback), everything centered and fully visible.
- Content Entrance preview cards now join their Customize summary (shared corner radii) like every other section.
- Footer: the top border runs full-bleed and meets the sidebar divider (no more floating inset line with a dead gap above it).

### Added (round 12 — clock modes, countdown & theme switch)

- Counter clock: `clockStyle` (roll · fade · instant), `rollDirection` (up/down), **countdown** (`until`) and **elapsed** (`since`) modes with automatic day count (`daysLabel`, `showDays`) and onComplete at zero; the layout rebuilds itself when the day digits change. Reduced motion renders plain updating text for all clock modes. Demo gains a Countdown card (D-day to 2027).
- Theme control is now a real switch — sun/moon at each end, sliding knob, `role="switch"` + `aria-checked`, larger icons.
- Install box: npm row is a copyable `npm install kineto` like the others; CDN/ESM snippets point at `dong-gri/kineto`.

### Fixed (round 12)

- Brush Reveal at `opacity:1` never looked opaque: the trail fade ran *after* the re-stamp (permanently one step below full), and the blur filter diluted the core. The loop now fades first then stamps, and a crisp unfiltered core is re-laid over the blurred pass — opacity 1 is truly opaque.
- Fullpage: wheel/touch during a section transition is swallowed completely, so the page behind no longer scrolls mid-animation (verified 0px page movement); the demo container and its Customize summary now share joined corner radii.
- The sidebar divider ended with the sticky nav and looked cut off next to the footer — the border moved to the main column, running the full content height.

### Added (round 11 — fullpage, progress UI & clock) — 34 modules

- **fullpage** (new 34th module): fullpage.js-style section paging — wheel / touch swipe / keyboard / dot navigation, `mode:'snap'` for native scroll-snap, loop, callbacks. Percent-based transforms adapt to any resize instantly; the container releases scroll at its edges so it never traps the page; reduced motion falls back to native snap scrolling.
- **progress** module grew visual shapes: `ui:'bar'` (fixed or in-place track+fill, thickness/radius/gradient/trackColor/position) and `ui:'ring'` (SVG circle, size/stroke, `showPercent`, `clickToTop` back-to-top button, corner + offset, `showAfter`, `hideAtEnd`, smoothing, per-element `target`). Themable via `--kt-progress-*` variables. The demo's floating TOP button is now this ring.
- **counter**: `clock` mode — a live clock (HH:MM:SS) where only changing digits roll and the colon blinks each second (`seconds`, `hour12`, `blink`, `clockSeparator`, `rollDuration`); grouping separator accepts any character (`separator`), and `blinkSeparators` makes separators blink in the other modes. Reduced motion renders a plain updating time.
- **shuffle**: `rainbow` option — scrambled characters flash in random rainbow colors (or a custom `rainbowColors` palette) until they settle.
- **pageReveal**: three new effects — `checker` (random tile grid), `strips` (shuffled vertical strips), `shutter` (alternating horizontal blades).

### Fixed (round 11)

- **Hero markup had one extra `</div>`** (introduced with the install box), which closed `<main>` early and spilled every section out of the layout grid — breaking the sidebar's sticky positioning. Rebalanced; sidebar sticks again.
- Hero title: the text-reveal char split defeated `background-clip:text` (giant black blocks). The title is now a static element with the flowing gradient glow.
- Marquee `pauseOnHover` never actually paused: the scroll-recovery drift pulled the velocity back to base every frame. Hover now holds the line still (verified: 0px movement while hovered).
- Header scroll bar moved inside the header (it sat above it, and its unfilled track showed an unblurred 2px gap).

### Added (round 10 — hero identity & lightbox polish)

- Lightbox: `backdropBlur` option (px, 0 disables) alongside `backdropOpacity`; zoom −/+/reset buttons disable themselves at min/max/100%; the whole viewer is now designer-themable via CSS custom properties (`--kt-lightbox-backdrop`, `--kt-lightbox-backdrop-blur`, `--kt-lightbox-button-bg/-border/-color/-radius`, `--kt-lightbox-radius`) — explicit JS options still win.
- Demo: hero title flows with an animated gradient glow (disabled under prefers-reduced-motion); theme switch is a sun/moon icon toggle; floating TOP button bottom-right (sits above the mobile nav); install box with copyable CDN/ESM snippets and an "npm 준비 중" row replaces the three wordy fact cards; custom cursors switch to `mix-blend-mode:difference` while the lightbox is open so they stay visible over the dim.

### Fixed (round 10)

- Stage ↔ Customize summary joining now applies to every card section (Counter, image loading, Text Overflow, feedback, Text Motion, entrance, Media & UI, cursor) — not just Loading.
- Replay buttons that sat outside a `.replay-row` (media cards) were still text buttons; the FAB conversion now catches every replay control.
- Card Glow cards force white text, which made the panel summary invisible in light theme — panels now set their own text color and stretch to full card width.
- Section copies rewritten as natural two-line Korean (with matching EN), `<a class="btn">` links lose their underline, and the Page Transition card explains itself in two sentences.

### Changed (round 9 — hero/footer & sticky fix)

- Hero: demo buttons and the "Live playground" notice removed; replaced with a GitHub link, feature chips (progressive enhancement, reduced-motion, mobile/gyro, standards/a11y) and three fact cards — browser support, optional dependencies (GSAP · ScrollTrigger · Lenis), install (UMD/ESM, npm 준비 중). Lead copy now breaks into two lines.
- Footer redesigned: brand statement + Project / Release columns + fine print; build stamp kept.
- Replay FAB moved to the bottom-right of each stage; dropped the `btn` class so later-cascade button styles can't hide or reshape it.
- Loader preview stages and their Customize summary now join into one block (shared corner radii, no gap); summaries elsewhere get more top margin, module name in the summary is right-aligned, standalone playground hosts span full width.
- Options drawer slides in from the right; shadow softened.
- Page Transition card gained a live "Transition reload" link (falls back to normal navigation where fetch is unavailable).

### Fixed (round 9)

- **Sticky broke site-wide** (Scroll Sequence showed a long empty run): `overflow-x:hidden` on `<body>` stopped propagating to the viewport once `<html>` got `overflow-x:clip`, turning the body into a clip container that killed `position:sticky`. Removed the body rule — the html clip alone prevents horizontal scroll.
- Brush Reveal: faint ghost no longer lingers — fade accelerates 4× once remaining ink is faint, so the tail snaps away.

### Added (round 8 — mobile & polish)

- Lightbox: two-finger pinch zoom on touch; mobile safe-area insets for toolbar, nav arrows and bottom metadata; `closeOnBackdrop` option exposed in the playground.
- Brush reveal: scratch-card behavior on touch (`touch-action:none`, paint starts on touch-down); trail healing — older strokes fade continuously while the spot under the pointer stays re-inked every frame.
- Cursor click effects work on touch devices (tap spawns the sprite/one-shot image even though pointer visuals stay disabled).
- Marquee: `skew` option — the line leans with scroll velocity and springs back.
- Slider: horizontal swipe wins over page scroll once a drag starts (touch).
- Demo: mobile bottom navigation bar (scroll-spy chips, safe-area aware); module index grouped by category (Text/Media/Scroll/Pointer/System); replay is a floating icon on each stage; options drawer portals to `<body>` so it renders correctly from tilted cards.

### Fixed (round 8)

- `--font-mono` definition became self-referential during a global font replacement, silently invalidating every `font: … var(--font-mono)` shorthand (section numbers rendered giant). Restored the full stack; numbers now render at the requested 16px IBM Plex Mono.
- Mobile horizontal scroll removed (`overflow-x: clip` on the root scroller); Korean copy no longer breaks mid-word (`word-break: keep-all`, `text-wrap: pretty`).
- Playground: LIVE badge removed, summary slimmed with a fixed-width +/− glyph (no text shift), open-state keeps the border radius; the `?` tooltip opens downward inside the drawer without spawning a horizontal scrollbar.
- Text Motion stages have fixed heights so cycling text no longer reflows the page while scrolling (덜컹거림 해소).

### Added (round 7)

- Vibrate: named haptic presets — `tap`, `double-tap`, `soft`, `rigid`, `heavy`, `success`, `warning`, `error`, `ratchet`(드르륵), `heartbeat`, `long-press` (Web Vibration API has no amplitude control, so texture comes from pulse timing).
- Tilt: gyroscope fallback on touch devices (device orientation drives the tilt; iOS permission handled on first tap).
- Compass: follows the real device heading via gyroscope on mobile.
- Sticky Stack: `align: center | top` — pinned content now centers in the viewport by default (vertical stack, horizontal scroll and floating sequence).
- Cursor: click effects — `clickSprite` (sprite-sheet burst with frame count/size/duration) or `clickImage` (one-shot GIF/APNG/WebP, restarted via cache-busted src). Touch devices still disable cursors entirely.
- Demo: language selector (KO/EN, persisted) replaces the header counter link; theme choice persisted to localStorage; Wanted Sans (body) + IBM Plex Mono (mechanical/numeric type) via CDN.
- Demo structure: Cursor and Smooth Scroll split — the Lenis runtime card now lives in Scroll Effects.

### Fixed (round 7)

- Sidebar/앵커 잠김 완전 해결: `overflow-anchor`를 실제 스크롤러(html)에 적용하고, 해시 이동을 JS 스크롤 + `replaceState`로 바꿔 브라우저의 fragment 재고정이 아예 발동하지 않게 함.
- Ambient image glitch: 색수차 고스트·인버트 슬라이스·스캔라인을 추가해 플랫한 일러스트에서도 버스트가 확실히 보이도록 강화.
- Brush reveal: 호버 중 정지해도 칠이 유지되고(치유는 포인터가 떠난 뒤 시작), 브러시 중심이 기본 불투명(`opacity` 옵션), file:// 이미지에서 치유가 멈추던 taint 문제 제거(픽셀 판독 없는 잉크 추적).
- Lightbox 딤드가 커서 위를 덮어 포인터가 사라지던 z-index 역전 수정.
- Section 번호 타이포를 IBM Plex Mono 기반으로 작고 타이트하게 조정.

### Added (round 6)

- Counter pop: landing origin option `popAlign: bottom | center | top`.
- Lazy skeleton: `skeletonColor` / `skeletonHighlight` / `skeletonIcon` exposed in the playground.
- Overflow Text `page-roll` mode: no horizontal marquee at all — the first page holds, then remaining pages swap by vertical rolling only (`rollDuration`, `rollDirection`, `pageDuration`).
- Glitch `image` preset: standalone ambient glitch bursts over a live image (independent from lazy loading; `sliceCount`, `trigger: hover` supported).
- Brush reveal: real airbrush spread — `softness` now scales the falloff band, plus `blur` for extra gaussian edge.
- Playground: options irrelevant to the current preset are hidden (live re-filter on preset change), and every option has a `?` tooltip with a friendly Korean explanation.
- Demo layout overhaul: sticky sidebar navigation with numbered sections and scroll-spy highlighting; compact hero; uniform card grid (`build r8-20260718`).

### Fixed (round 6)

- Rolling + pauseOnHover: hovering mid-roll restarted a cancelled animation from frame 0 and dropped scheduled steps (freezing on the wrong item); running animations now pause/resume properly and deferred steps fire on pointer-leave.

### Added (round 5 — 33 modules)

- **brushReveal** (new module): pointer paints a second image through a soft Photoshop-style round brush (day→night masking); strokes heal back or persist (`radius`, `softness`, `fade`, `persist`).
- Reveal `clock` preset: conic clock-wipe mask sweeps the content in like a watch hand (`startAngle`, `clockDirection`).
- Mouse Parallax `compass` mode: element rotates to aim at the pointer along the shortest arc, or maps pointer X onto a rotation range (`compassRange`, `rotateOffset`, `smoothing`, `sensitivity`).
- Text Reveal `decode` mode (RF Online style): characters appear in order, flickering through random glyphs before settling — generated from live text, no per-char markup (`flickerCount`, `loop`, `hold`, `chars`).
- Text Reveal `flicker` mode (Callisto TextFlicker): characters strobe on irregularly like failing fluorescents; `flickerLoop` keeps an ambient re-flicker running.
- Lazy `flicker` effect (Callisto ImageFlicker): image loads through canvas slice displacements, blackout flashes and a ghost pass, then settles (`glitchStrength`, `sliceCount`).
- Slider: active slide now centers in plain slide mode too; `align: 'left'` restores edge alignment.
- Cursor: small `+` cross-point variant kept alongside the full-viewport crosshair (`full: false`, `crosshairSize`).

### Fixed (round 5)

- Full-viewport crosshair was invisible: the transformed cursor wrapper became the containing block for its fixed hairlines and collapsed them to 0×0.
- Cursor hover label now sits centered inside the grown dot (no more collision with the ring outline); the dot auto-grows to fit the label.
- Page Reveal buttons only worked once: instances are one-shot and the demo now drops the previous record before re-running.
- Text/overflow dissolve no longer blurs (read as glow); Text Transition gained the same noisy `dissolve` effect.
- Demo: dark editorial redesign is now the default theme (orange accent, mono section numbering); scroll anchoring disabled to prevent snap-back while effects animate; assets cache-busted per build (`build r6-20260718`).

### Added (round 4)

- Overflow Text: `dissolve` mode — characters flicker apart with jitter/micro-blur noise (not a crossfade) and reassemble as the next page (`dissolveDuration`, `jitter`).
- Overflow Text rolling: items can be HTML markup children (div/span/b/em…), not just strings; aria-label uses the plain text.
- Cursor: hover now grows the inner dot while the ring/text-ring keeps its size (`hoverEffect: 'dot' | 'ring'`, `hoverDotSize`, `hoverDotOpacity`).

### Fixed (round 4)

- Overflow Text page/flip/once truncated the tail of the text: overflow was measured against the padded element box instead of the content viewport.
- Coverflow: the last slide never landed dead-center — slide width was measured from a scaled/rotated side slide; now uses layout width.
- Lightbox: title/description moved directly under the image (fade out while zoomed); metadata floated up from the screen edge.

### Fixed (round 3)

- Demo assets are now cache-busted (`?v=r3-20260718`): Chrome kept serving a stale `dist/kineto.umd.js` from the file:// cache, which made every new module look broken (typewriter hangul/caret, text transition, glitch, new cursors, shuffle fix). The footer shows the build stamp.
- Counter flip: bare mode no longer flashes shaded boxes — fold shading only applies to tiles.
- Cursor sparkle: pooled stars restarted mid-transition and never became visible after the first burst; transitions are now re-armed per spawn so stars keep coming.
- Overflow Text: full timing control — `speed`, `delay`(시작), `endPause`(끝 대기), new `restartDelay`(한 사이클 후 재시작 대기), `pageDuration`/`flipDuration` — all exposed in the playground.
- Demo visual refresh: numbered section headers, refined light/dark palettes, softer card shadows with hover states, cleaner hero/footer.

### Added (round 2)

- Typewriter: caret(|) on/off (`caret`, `caretChar`) and Hangul jamo-composition typing (`hangul`) — merges the old Hangul reveal demo into Typewriter.
- Counter: true split-flap `flip` mode — each digit folds at the middle like a Solari board; tile chrome optional (`tile`, `tileColor`, `tileTextColor`, `tileRadius`, `bareBackground`, `gap`).
- Overflow Text: `flip` mode — page-sized text flips like a departure board (`flipDuration`, `flipDirection`).
- Card Glow: `comet` mode — traveling gradient light along the card outline (original border glow, with optional soft halo).
- Cursor: reference set restored — `text` (rotating circular text), `trail` (elastic dot tail), `orbit`, `snake`, `sparkle` (star particles), full-viewport `crosshair`.
- Page Reveal: `blinds`, `diagonal` effects plus `direction`, `axis`, `count`, `stagger` options; rebuilt on WAAPI.
- Text Transition: `shimmer` (AI gradient sweep) and `charMode` per-character enter/leave.

### Fixed (round 2)

- Glitch and Text Transition rebuilt without animation-engine dependency (WAAPI); glitch picks screen/multiply blending from the background so RGB slices are visible on light themes too.
- Skeleton placeholder now fills the actual image box instead of collapsing into a thin bar.
- Shuffle locks per-glyph widths so multi-line text can no longer collapse to one line mid-scramble.
- Demo playground: removed the rule that expanded a card to span 6 columns when its panel opened (grid no longer breaks); grids top-align cards.
- Lightbox: index counter truly centered, title/description centered under the image, metadata centered at the bottom edge.

### Added

- Text Split: `spin`, `flip`, `scale`, `blur`, `slide-up`, `slide-down` entrance animations plus Toss-style text swap (`texts`, `hold`, `swapOut`, `swapEase`, `onSwap`).
- Card Glow: restored the original rotating conic `aurora` outer halo that leaks beyond the card edge.
- Cursor: scoped cursors (`data-kt-cursor` on a bounded element activates only inside it), `full` crosshair, `dot` toggle for ring mode, `global`/`hideDotOnHover` options.
- Lazy Polaroid: instant-photo development curve with optional paper frame (`frame`, `frameColor`, `keepFrame`).
- Lazy Print: soft printing-edge highlight (`edgeWidth`, `edgeOpacity`) with eased scan.
- Lazy Skeleton: media-icon placeholder (`skeletonIcon`) and refined diagonal shimmer.
- Lightbox: index counter, item fade/rise transition, grab/grabbing pan cursors.

### Changed

- Pixelate now runs on the owner's Pixel Mosaic engine: real pixel-block stages in CSS pixels (auto largest→1px), equal time slices, canvas redraw of the live `<img>` so animated media keeps playing (`steps` in px, `stepCount`, `renderFps`, `maxDpr`; legacy ratio options still map).
- `zoom` lazy preset merged into `blur-up` (duplicate effect removed from the contract).
- Cursor dot now tracks the pointer instantly while the follower eases behind it (original trailing feel), and global cursors yield inside scoped regions so two cursors never overlap.
- Slider/Coverflow rebuilt on a single rAF-spring position engine: drag, buttons, keyboard, autoplay share one value; velocity fling on release; collapsed-height bug fixed.
- Overflow Text rewind/page masks now run on the visible viewport instead of the full track, with soft directional nudge easing.
- Scroll Text Fill uses fractional per-glyph gradient fill for a continuous sweep.
- Lightbox visual refresh: blurred backdrop, ghost buttons, compact nav.

### Fixed

- package-lock.json pointed at a private registry mirror, breaking `npm install` outside that network; regenerated against registry.npmjs.org.
- Slider first-slide inline height was cleared, collapsing wrappers without CSS min-height.

## [0.8.0] - 2026-07-18

### Added

- Added animated-media-safe composition across Lazy, Ambient Media and Lightbox for GIF, APNG and animated WebP.
- Added Skeleton shimmer/pulse variants, dynamic-noise Progressive Print/Dissolve, directional MP3 masks, realtime ranking rolling, surface reflection, luminous border, Reveal class hooks, spring velocity controls, full viewer controls, real Loader sources, custom cursor modes and optional Lenis runtime APIs.
- Expanded the owner contract to 46 requirements and the live demo to 58 configurable playgrounds.

### Changed

- Rebuilt Pixelate and Print around live image layers instead of permanently flattening animated media to canvas.
- Rebuilt Ambient Media to use live image clones or sampled video frames.
- Rebuilt Lightbox as a full-viewport customizable grouped viewer with lazy-effect composition.
- Rebuilt Coverflow around one transform path and removed the duplicate demo button handler.

### Fixed

- Fixed Skeleton creating an overlay object without appending it to the lazy wrapper.
- Fixed Coverflow moving two slides per demo button click.
- Fixed Smooth service recursive teardown and media wrapper insertion edge cases.
- Fixed zoomed Lightbox stages capturing pointer events from Previous/Next controls.
- Fixed animated-media QA stalls by replacing stability-dependent screenshots with direct CDP capture and deterministic Ambient frame markers.
- Corrected module documentation that still described Pixelate as Canvas-based and Lightbox as a native dialog.

## [0.7.1] - 2026-07-18

### Added

- Added a reusable live playground to adjustable demos with module-specific controls, instant re-creation, Replay, Apply, and Reset.
- Added synchronized HTML and JavaScript code tabs with a working clipboard action.
- Added playground QA that changes Counter options, verifies generated code and copy behavior, resets the original DOM, and checks instance-count stability.
- Added `MK-DEMO-002` to the owner requirements contract so future AI-assisted edits cannot silently remove the playground.

### Changed

- Included the `demo` directory in the npm package surface.
- Expanded open playground cards on desktop for a more usable settings layout.
- Cleaned generated JavaScript options by filtering them through each module's public option contract.

### Fixed

- Fixed asynchronous clipboard handlers losing `event.currentTarget` after `await`.
- Kept Loader demo buttons and playground controls on the same live option state.

## [0.7.0] - 2026-07-18

### Corrected

- Reclassified `circular` and `bar` as Loader modes and removed `circular` from Counter.
- Changed Counter `pop` to render the final formatted value immediately and land characters sequentially from a larger scale without count-up.
- Restored the Material-style button `ripple` module and separated Pointer/Button Feedback from Card Glow/Tilt.
- Rebuilt Lazy effects so `skeleton` is a true shimmer placeholder, `print` is blur + fine noise resolving through a directional sharp scan, and `dissolve` globally removes fine noise and blur.
- Moved `slide-up` and `wipe` into viewport-triggered Reveal presets instead of image Lazy loading.
- Restored the original RGB slice Glitch and repaired replayable Shuffle Decode and Text Transition.
- Made MP3 overflow modes distinct: Bounce reverses, Rewind masks out and invisibly resets, and Page changes instantly by viewport-width steps.
- Repaired Coverflow controls/drag/index, Ambient Media stacking, and grouped simple-fade Lightbox navigation.
- Added replay controls throughout Text Motion and content entrance demos.

### Added

- `kineto.requirements.json` and expanded `OWNER_REQUIREMENTS.md` with 29 machine-tested owner requirements.
- Full categorized 32-module QA demo.
- Browser assertions for Counter/Loader classification, image effect convergence, MP3 mode semantics, replay controls, ripple cleanup, bounded glow, media UI, and zero-instance teardown.

### Fixed

- Pixelate could remove its Canvas before the browser had committed the final native-lazy image, leaving a blank result.
- Horizontal and floating Sticky Stack modes were incorrectly parsed as the default vertical mode.
- WAAPI `fill-forwards` prevented the hidden Rewind reset from returning to the start.
- Slider fallback slides overlapped because generated slides were positioned absolutely.
- Ambient Media glow could be hidden behind the page stacking context.

## [0.5.1] - 2026-07-17

### Stabilized

- Preserved all **30** modules. Previous documents said 29 while the actual source exported 30; no module was deleted to reconcile the mismatch.
- Rebuilt the core registry and lifecycle handling with duplicate initialization protection.
- Fixed direct `instance.destroy()` so it also removes the stale core record and permits clean recreation.
- Added consistent `create`, `pause`, `resume`, `replay`, and `destroy` behavior across modules.
- Repaired undefined runtime references including GSAP/ScrollTrigger helpers, text segmentation, interpolation, presets, and utility functions.
- Registered GSAP and ScrollTrigger in ESM environments instead of relying only on browser globals.
- Repaired Lenis integration and global visibility pause/resume.
- Reworked lazy media effects, including Canvas pixelate with CORS-safe fallback.
- Repaired Hangul composition frames and grapheme segmentation for text reveal effects.
- Repaired slider pointer, keyboard, autoplay, hover pause, accessibility state, and cleanup behavior.
- Repaired page transition content replacement, history handling, abortable fetch, re-scan, and teardown.
- Fixed timers/listeners/observers/RAF/GSAP cleanup across modules, including pageReveal timer cleanup.
- Restored compatibility methods used by the existing demo under `Kineto.core`.
- Preserved property descriptors while normalizing instances so live getters such as `slider.index` remain live.
- Restored original HTML, inline styles, and ARIA attributes for repaired modules, including reduced-motion fallbacks.
- Replaced the slot counter's fixed row height with computed typography-aware line height.
- Tore down Lenis and visibility services when the final instance is destroyed.
- Added regression checks for unknown-module no-op behavior, descendant destruction, replacement-option replay, and reduced-motion static rendering.

### Added

- `kineto.features.json`: machine-readable module/API contract covering modules, activation attributes, variants, public options, root properties, and core methods.
- `FEATURE_CONTRACT.md`: no-silent-feature-change rules.
- `AGENTS.md`: strict workflow for AI-assisted patches.
- React, Vue 3, and jQuery adapter entry points.
- ESM, browser UMD, CommonJS-compatible UMD copy, and stable CSS exports.
- ESLint, exact public-surface/option contract test, generated documentation check, Chromium lifecycle smoke test, package surface test, and `npm run verify`.

### Changed

- Correct package CSS import is now `kineto/style.css`.
- Browser bundle is `dist/kineto.umd.js`; CommonJS uses `dist/kineto.umd.cjs`.
- Primary documentation now describes tested behavior and known limitations instead of unverified performance or compatibility claims.
- Build tooling updated to Vite 8.1.5 and Playwright Core 1.61.1.

### Security

- Updated build tooling; `npm audit` reports zero known vulnerabilities at release verification time.

## [0.5.0] - 2026-04-26

- Expanded the experimental library into a broad interaction toolkit.
- Added the modules that now form the 30-module v0.5 public surface.
- This version contained documentation, runtime, package export, and lifecycle inconsistencies corrected in v0.5.1.

## [0.2.0] - 2026-04-26

- Added lazy image effects and the first expanded interaction module set.
- Introduced environment detection, fallback handling, module docs, and examples.

## [0.1.0] - 2026-04-26

- Initial core, parallax, reveal, counter, GSAP/ScrollTrigger, Lenis, architecture document, and demo.
