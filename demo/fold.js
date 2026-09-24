/* Module block fold — "데모 더 보기".
 *
 * WHY
 *   A module block used to print every demo it owns. Slider printed ten 400px
 *   cards (one per variant), Reveal twenty-three, and the page ran to 70,000px
 *   — while the "모든 variant 비교" sheet directly above already lays every
 *   variant side by side. A block now opens on its first two ROWS of demos and
 *   keeps the rest behind one button, with the top of the next row peeking out
 *   so the reader can see there is more.
 *
 * HOW (for someone new to this file)
 *   • Folded cards are NOT removed or hidden with display:none. They stay laid
 *     out at their real size; the grid is only clipped (max-height + overflow:
 *     clip). Modules measure their element when they start, and a card that
 *     started inside display:none would measure 0×0 and open broken.
 *   • Folded cards are `inert`: no Tab stop, not in the accessibility tree.
 *     Clipped-but-focusable content would let a keyboard user tab into cards
 *     they cannot see.
 *   • Rows are MEASURED (grouped by each card's top edge), not counted, so the
 *     same rule works at 3-up on desktop and 1-up on a phone, and a `.card.full`
 *     or `.card.wide` is handled without special cases.
 *   • Anything that scrolls to a card must unfold it first. main.js calls
 *     `KINETO_FOLD.reveal(el)`; other scripts dispatch a `kt-demo:reveal` event
 *     on the element (so they do not need to know this file exists).
 *
 * API — window.KINETO_FOLD
 *   attach(body)  make a `.module-block-body.grid` foldable (main.js calls it)
 *   reveal(el)    open the fold hiding `el`, instantly; true if one opened
 *   openAll()     open every fold (tests, printing)
 */
(function () {
  'use strict';

  /** Rows a closed block shows in full. */
  var FOLD_ROWS = 2;
  /** Fewer hidden cards than this are simply shown — one card is not worth a click. */
  var MIN_HIDDEN = 2;
  /** How much of the first hidden row peeks out under the fade, in px. */
  var PEEK = 72;
  /** Cards whose top edges differ by less than this share a row. */
  var ROW_TOLERANCE = 2;

  var LANGUAGE_INDEX = { en: 0, ja: 1, 'zh-CN': 2, 'zh-TW': 3, ru: 4, it: 5 };
  /** Same dictionary as the rest of the demo UI; the Korean source is the key. */
  function t(key) {
    var language = document.documentElement.lang || 'ko';
    if (language === 'ko') return key;
    var values = window.KINETO_COPY_I18N && window.KINETO_COPY_I18N.ui && window.KINETO_COPY_I18N.ui[key];
    return (values && values[LANGUAGE_INDEX[language]]) || key;
  }

  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var bodies = new Set();
  var pending = new Set();
  var frame = 0;
  var sequence = 0;

  // One observer for the grids (width changes re-flow the rows) and their
  // cards (an image that loads makes a row taller, and the cut must follow).
  var observer = typeof ResizeObserver === 'function'
    ? new ResizeObserver(function (entries) {
        entries.forEach(function (entry) {
          var body = bodies.has(entry.target) ? entry.target : entry.target.parentElement;
          if (body && bodies.has(body)) pending.add(body);
        });
        schedule();
      })
    : null;

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(function () {
      frame = 0;
      var list = Array.from(pending);
      pending.clear();
      // Measure every grid first, then write — one layout for the whole page.
      var plans = list.map(function (body) { return { body: body, plan: planFold(body) }; });
      plans.forEach(function (item) { applyFold(item.body, item.plan); });
    });
  }

  function cardsOf(body) {
    return Array.prototype.filter.call(body.children, function (child) { return child.nodeType === 1; });
  }

  /** Measure only: which cards fall below the first FOLD_ROWS rows, and where to cut. */
  function planFold(body) {
    if (!body.isConnected) return null;
    var top = body.getBoundingClientRect().top;
    var rows = [];
    cardsOf(body).forEach(function (card) {
      var rect = card.getBoundingClientRect();
      if (!rect.height && !rect.width) return;
      var cardTop = rect.top - top;
      var row = null;
      for (var i = 0; i < rows.length; i += 1) {
        if (Math.abs(rows[i].top - cardTop) < ROW_TOLERANCE) { row = rows[i]; break; }
      }
      if (!row) { row = { top: cardTop, bottom: 0, cards: [] }; rows.push(row); }
      row.bottom = Math.max(row.bottom, rect.bottom - top);
      row.cards.push(card);
    });
    rows.sort(function (a, b) { return a.top - b.top; });
    var hidden = [];
    rows.slice(FOLD_ROWS).forEach(function (row) { hidden = hidden.concat(row.cards); });
    if (hidden.length < MIN_HIDDEN) return null;
    return { cut: Math.ceil(rows[FOLD_ROWS - 1].bottom), hidden: hidden };
  }

  /** Write only. `plan` null means the block fits in two rows at this width. */
  function applyFold(body, plan) {
    var state = body.dataset.demoFold;
    // A fold that is animating finishes first; its transitionend re-queues it.
    if (state === 'opening') return;
    var control = controlOf(body);
    body.dataset.demoFoldActive = plan ? 'true' : 'false';
    if (control) control.hidden = !plan;
    var hidden = new Set(plan ? plan.hidden : []);
    var closed = state === 'closed' && Boolean(plan);
    cardsOf(body).forEach(function (card) {
      var fold = closed && hidden.has(card);
      if (card.inert !== fold) card.inert = fold;
      if (fold) card.setAttribute('data-demo-folded', '');
      else card.removeAttribute('data-demo-folded');
    });
    if (!plan) { body.style.removeProperty('max-height'); return; }
    body.dataset.demoFoldCut = String(plan.cut + PEEK);
    var count = control && control.querySelector('.module-fold__count');
    if (count) count.textContent = '+' + plan.hidden.length;
    if (closed) {
      var height = (plan.cut + PEEK) + 'px';
      if (body.style.maxHeight !== height) body.style.maxHeight = height;
    } else body.style.removeProperty('max-height');
  }

  function controlOf(body) {
    var next = body.nextElementSibling;
    return next && next.classList.contains('module-fold') ? next : null;
  }

  function syncButton(body) {
    var control = controlOf(body);
    var button = control && control.querySelector('button');
    if (!button) return;
    var open = body.dataset.demoFold === 'open' || body.dataset.demoFold === 'opening';
    button.setAttribute('aria-expanded', String(open));
    // Two labels, one visible — the demo's i18n pass translates both.
    button.querySelectorAll('[data-demo-i18n-text]').forEach(function (label, index) {
      label.hidden = open ? index === 0 : index === 1;
    });
    var count = button.querySelector('.module-fold__count');
    if (count) count.hidden = open;
  }

  function finish(body, state) {
    body.dataset.demoFold = state;
    pending.add(body);
    schedule();
  }

  /**
   * Opening animates from the cut height to the full height. Closing is
   * instant and ANCHORED: the button stays exactly where the reader clicked it
   * while the rows above it fold away. An animated close would slide the page
   * up by the whole folded height under the reader's pointer (1,600px for
   * Slider) and then have to jump back.
   */
  function setOpen(body, open, options) {
    var instant = (options && options.instant) || reduceMotion.matches;
    if (!open) { closeAnchored(body); return; }
    var from = body.getBoundingClientRect().height;
    var full = body.scrollHeight;
    body.dataset.demoFold = 'opening';
    syncButton(body);
    cardsOf(body).forEach(function (card) { card.inert = false; card.removeAttribute('data-demo-folded'); });
    if (instant) {
      body.style.removeProperty('max-height');
      finish(body, 'open');
      return;
    }
    body.style.maxHeight = from + 'px';
    // Commit the start height before setting the end height, or no transition runs.
    void body.offsetHeight;
    body.style.maxHeight = full + 'px';
    var done = false;
    var settle = function (event) {
      if (done || (event && (event.target !== body || event.propertyName !== 'max-height'))) return;
      done = true;
      body.removeEventListener('transitionend', settle);
      body.style.removeProperty('max-height');
      finish(body, 'open');
    };
    body.addEventListener('transitionend', settle);
    // A background tab delivers no transitionend; never stay half-open.
    setTimeout(settle, 700);
  }

  function closeAnchored(body) {
    var control = controlOf(body);
    var before = control ? control.getBoundingClientRect().top : 0;
    var cut = Number(body.dataset.demoFoldCut) || body.getBoundingClientRect().height;
    // No transition for this one write: `transition` would animate it.
    body.style.transition = 'none';
    body.style.maxHeight = cut + 'px';
    body.dataset.demoFold = 'closed';
    syncButton(body);
    // Fold (and make inert) right now, not on the next frame: a card that is
    // already clipped must not stay reachable by Tab for even one frame.
    applyFold(body, planFold(body));
    var shift = control ? control.getBoundingClientRect().top - before : 0;
    if (Math.abs(shift) > 1) window.scrollTo({ top: window.scrollY + shift, behavior: 'instant' });
    void body.offsetHeight;
    body.style.removeProperty('transition');
  }

  function attach(body) {
    if (!body || bodies.has(body) || !body.classList.contains('grid')) return;
    bodies.add(body);
    sequence += 1;
    if (!body.id) body.id = 'fold-' + sequence;
    body.dataset.demoFold = 'closed';
    body.dataset.demoFoldActive = 'false';

    var control = document.createElement('div');
    control.className = 'module-fold';
    control.hidden = true;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'module-fold__toggle';
    button.setAttribute('aria-controls', body.id);
    button.setAttribute('aria-expanded', 'false');
    ['데모 더 보기', '데모 접기'].forEach(function (key, index) {
      var label = document.createElement('span');
      label.dataset.demoI18nText = key;
      label.textContent = t(key);
      label.hidden = index === 1;
      button.appendChild(label);
    });
    var count = document.createElement('span');
    count.className = 'module-fold__count';
    button.appendChild(count);
    var icon = document.createElement('i');
    icon.className = 'ph-bold ph-caret-down';
    icon.setAttribute('aria-hidden', 'true');
    button.appendChild(icon);
    button.addEventListener('click', function () {
      var state = body.dataset.demoFold;
      if (state === 'opening') return;
      setOpen(body, state !== 'open');
    });
    control.appendChild(button);
    body.insertAdjacentElement('afterend', control);

    if (observer) {
      observer.observe(body);
      cardsOf(body).forEach(function (card) { observer.observe(card); });
    }
    pending.add(body);
    schedule();
  }

  /** Open the fold hiding `el` right now, so a scroll to `el` lands on it. */
  function reveal(el) {
    var card = el && el.closest ? el.closest('[data-demo-folded]') : null;
    var body = card && card.parentElement;
    if (!body || !bodies.has(body)) return false;
    setOpen(body, true, { instant: true });
    return true;
  }

  function openAll() {
    bodies.forEach(function (body) {
      if (body.dataset.demoFold !== 'open') setOpen(body, true, { instant: true });
    });
  }

  document.addEventListener('kt-demo:reveal', function (event) { reveal(event.target); });
  // Printing a folded page would cut the cards off mid-row.
  window.addEventListener('beforeprint', openAll);

  window.KINETO_FOLD = { attach: attach, reveal: reveal, openAll: openAll };
})();
