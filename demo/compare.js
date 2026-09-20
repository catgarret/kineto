/* Variant compare sheet — "모든 variant 비교".
 *
 * 무엇을 하는 파일인가
 * --------------------
 * 모듈 블록마다 버튼을 하나 붙이고, 누르면 그 모듈의 공개 variant를 전부 같은 소재 위에
 * 펼쳐 보여 줍니다. 타일마다 붙여넣을 수 있는 마크업이 같이 붙습니다.
 *
 * 무엇으로 만드나
 * ----------------
 *  · demo/variant-catalog.js  — 어떤 variant가 있고, 그것을 어떤 속성으로 켜는지.
 *                               kineto.features.json 에서 생성됩니다(직접 고치지 않습니다).
 *  · demo/index.html          — 소재. 새로 만들지 않고 데모에 이미 있는 것을 복제하므로,
 *                               비교 화면이 실제 데모와 어긋날 수 없습니다.
 *
 * 흐름 (초급 개발자용 한 줄 요약)
 * --------------------------------
 *  1) 스크립트가 읽히는 순간(= Kineto 가 아직 초기화되기 전) 소재를 통째로 복제해 둔다.
 *     → snapshot(). 초기화 뒤에는 모듈이 DOM 을 자기 마크업으로 바꿔 놓기 때문에 늦습니다.
 *  2) main.js 가 모듈 블록을 만들면서 attach(block, name) 을 부른다. 버튼과 빈 시트만 만든다.
 *  3) 버튼을 누르면 build() 가 타일을 만든다. 타일은 화면에 들어올 때 하나씩 초기화된다.
 *  4) 다시 누르면 Kineto.destroy() 로 정리하고 타일을 비운다. 다음에 열면 처음부터 다시 재생된다.
 *
 * 새 variant 를 추가하는 사람에게: 이 파일은 고칠 필요가 없습니다.
 * `npm run test:variant-compare` 가 무엇이 빠졌는지 알려 줍니다 — docs/variant-compare.md 참고.
 */
/* global window, document */
(function () {
  'use strict';

  var CATALOG = (typeof window !== 'undefined' && window.KINETO_VARIANT_CATALOG) || { modules: {}, capabilities: {} };
  var MODULE_META = (typeof window !== 'undefined' && window.KINETO_MODULE_METADATA) || {};

  // 데모가 "부모 크기를 그대로 쓴다"고 표시해 둔 소재. 타일 무대에서는 확정 높이를 줘야 합니다.
  var FILL_CLASS = /(^|\s)u-fill(\s|$)/;

  var LANGUAGE_INDEX = { en: 0, ja: 1, 'zh-CN': 2, 'zh-TW': 3, ru: 4, it: 5 };
  /** 데모의 다른 UI와 같은 사전을 씁니다. 한국어 원문이 곧 키입니다. */
  function t(key) {
    var language = (document.documentElement && document.documentElement.lang) || 'ko';
    if (language === 'ko') return key;
    var dictionary = window.KINETO_COPY_I18N && window.KINETO_COPY_I18N.ui;
    var values = dictionary && dictionary[key];
    var index = LANGUAGE_INDEX[language];
    return (values && values[index]) || key;
  }

  function escapeSelector(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value).replace(/[^\w-]/g, '\\$&');
  }

  function mainRoot() {
    return document.querySelector('main') || document.body || document;
  }

  /** 모든 모듈의 활성화 속성. 복제한 소재에서 다른 모듈을 떼어 내는 데 씁니다. */
  function allActivationAttributes() {
    var names = Object.keys(MODULE_META);
    if (!names.length) names = Object.keys(CATALOG.modules);
    return names.map(function (name) {
      return 'data-kt-' + name.replace(/[A-Z]/g, function (char) { return '-' + char.toLowerCase(); });
    });
  }

  // ── 1. 요구 조건 ───────────────────────────────────────────────────────────
  // kineto.features.json 의 variantCapabilities 를 DOM 술어로 옮긴 것입니다.
  // 한 군데에만 있어야 해서 테스트도 이 함수를 그대로 불러 씁니다.
  function satisfies(node, requires) {
    if (!node) return false;
    var hasImage = (node.matches && node.matches('img')) || !!node.querySelector('img');
    var hasVideo = (node.matches && node.matches('video')) || !!node.querySelector('video');
    switch (requires) {
      case 'image': return hasImage;
      case 'video': return hasVideo;
      case 'media': return hasImage || hasVideo;
      case 'text': return !hasImage && !!String(node.textContent || '').trim();
      case 'items': return node.children.length >= 2;
      case 'track': return !!node.querySelector('.kt-slider-track');
      default: return true;
    }
  }

  // ── 2. 소재 스냅샷 ─────────────────────────────────────────────────────────
  // Kineto 가 초기화되기 전에 한 번만 돕니다. 초기화 뒤의 DOM 은 모듈이 만든 결과물이라
  // 그것을 복제하면 "이미 실행된 모습"을 복제하게 됩니다.
  //
  // 복제는 필요한 만큼만 합니다. 한 모듈이 실제로 필요로 하는 소재는 "그 모듈의 variant 들이
  // 요구하는 능력의 가짓수"만큼이고(대부분 1개, Glitch 처럼 텍스트와 이미지를 함께 쓰는
  // 모듈만 2~3개), 후보 목록 전체를 복제하면 페이지를 여는 순간 쓸모없는 복제본이 수백 개
  // 생깁니다. 그래서 능력별로 첫 번째로 맞는 후보 하나씩만 들고 있습니다.
  var specimens = {};       // { module: { capability: clonedNode } }
  var authoredOptions = {}; // { module: { variant: { 속성이름: 값 } } }
  var snapshotDone = false;

  function specimenCandidates(name, entry) {
    var root = mainRoot();
    var selector = '[' + entry.attribute + ']';
    var ordered = [];
    var seen = [];
    function push(node) {
      if (!node || seen.indexOf(node) !== -1) return;
      if (node.closest && node.closest('[data-variant-compare]')) return;
      seen.push(node);
      ordered.push(node);
    }
    // 1순위: 비교용 소재를 직접 지정한 요소
    Array.prototype.forEach.call(root.querySelectorAll('[data-demo-specimen="' + escapeSelector(name) + '"]'), push);
    // 2순위: 모듈의 홈 카드 안에 있는 인스턴스
    var home = root.querySelector('[data-demo-home="' + escapeSelector(name) + '"]');
    if (home) {
      if (home.matches && home.matches(selector)) push(home);
      Array.prototype.forEach.call(home.querySelectorAll(selector), push);
    }
    // 3순위: 데모의 나머지 인스턴스(문서 순서)
    Array.prototype.forEach.call(root.querySelectorAll(selector), push);
    return ordered;
  }

  /** 이 요소가 보여 주고 있는 variant 이름. 속성이 비어 있으면 모듈의 기본 variant 입니다. */
  function variantOf(entry, node) {
    var value = entry.carrier === 'activation'
      ? node.getAttribute(entry.attribute)
      : (entry.carrierAttribute ? node.getAttribute(entry.carrierAttribute) : null);
    return (value && String(value).trim()) || entry.defaultVariant;
  }

  function moduleOptionsOf(entry, node) {
    var options = {};
    Array.prototype.forEach.call(node.attributes, function (attribute) {
      if (entry.optionAttributes.indexOf(attribute.name) === -1) return;
      if (entry.clearAttributes.indexOf(attribute.name) !== -1) return;
      options[attribute.name] = attribute.value;
    });
    return options;
  }

  /** 이 모듈의 variant 들이 요구하는 능력의 집합. 복제할 소재의 가짓수이기도 합니다. */
  function neededCapabilities(entry) {
    var seen = [];
    entry.variants.forEach(function (variant) {
      if (seen.indexOf(variant.requires) === -1) seen.push(variant.requires);
    });
    return seen;
  }

  function snapshot() {
    if (snapshotDone) return;
    snapshotDone = true;
    Object.keys(CATALOG.modules).forEach(function (name) {
      var entry = CATALOG.modules[name];
      if (entry.preview !== 'grid') return;
      var candidates = specimenCandidates(name, entry);
      // 능력마다 첫 번째로 맞는 후보 하나씩만 복제합니다.
      var byCapability = {};
      neededCapabilities(entry).forEach(function (capability) {
        for (var index = 0; index < candidates.length; index += 1) {
          if (!satisfies(candidates[index], capability)) continue;
          byCapability[capability] = candidates[index].cloneNode(true);
          return;
        }
      });
      specimens[name] = byCapability;
      // 각 variant 로 authoring 된 인스턴스가 있으면 그 옵션만 기억해 둡니다(복제는 하지
      // 않습니다). 소재는 같게 두고 옵션만 그 variant 에 맞게 입히기 위한 것입니다.
      var perVariant = {};
      candidates.forEach(function (node) {
        var variant = variantOf(entry, node);
        if (!variant || perVariant[variant]) return;
        perVariant[variant] = moduleOptionsOf(entry, node);
      });
      authoredOptions[name] = perVariant;
    });
  }

  /**
   * 스냅샷이 실제로 들고 있는 양. 페이지를 여는 순간 치르는 비용이라 게이트가 지켜봅니다
   * (tests/variant-compare.mjs) — 능력 하나당 복제본 하나를 넘기면 실패합니다.
   */
  function stats() {
    var clones = 0;
    var needed = 0;
    Object.keys(specimens).forEach(function (name) {
      clones += Object.keys(specimens[name]).length;
      needed += neededCapabilities(CATALOG.modules[name]).length;
    });
    return { modules: Object.keys(specimens).length, clones: clones, needed: needed };
  }

  /** 이 variant 를 보여 줄 수 있는 소재. 없으면 null. */
  function specimenFor(name, requires) {
    return (specimens[name] || {})[requires] || null;
  }

  // ── 3. 타일 만들기 ─────────────────────────────────────────────────────────
  /**
   * 복제한 소재에서 "이 모듈 하나만" 남깁니다. 규칙이 뿌리와 자식에서 다릅니다.
   *
   *   뿌리   — 이 모듈의 활성화 속성과 공개 옵션만 남깁니다. 타일이 딱 하나의 모듈을,
   *            딱 하나의 variant 로 보여 주게 하는 것이 비교 시트의 존재 이유입니다.
   *   자식   — 다른 모듈의 활성화 속성만 지웁니다. `data-kt-menu-trigger` 처럼 소재의
   *            구조를 이루는 역할 속성까지 지우면 소재 자체가 망가집니다.
   *
   * id 와 data-demo-* 는 원본 카드를 가리키는 표식이라 어디에 있든 지웁니다.
   */
  function isolateModule(node, entry) {
    var activations = allActivationAttributes();
    var nodes = [node].concat(Array.prototype.slice.call(node.querySelectorAll('*')));
    nodes.forEach(function (element, index) {
      var isRoot = index === 0;
      Array.prototype.slice.call(element.attributes).forEach(function (attribute) {
        var name = attribute.name;
        if (name === 'id' || name.indexOf('data-demo') === 0) { element.removeAttribute(name); return; }
        if (name.indexOf('data-kt-') !== 0) return;
        if (name === entry.attribute) return;
        if (isRoot) {
          if (entry.optionAttributes.indexOf(name) === -1) element.removeAttribute(name);
          return;
        }
        if (activations.indexOf(name) !== -1) element.removeAttribute(name);
      });
    });
  }

  function prepareMaterial(name, entry, variant) {
    var source = specimenFor(name, variant.requires);
    if (!source) return null;
    var clone = source.cloneNode(true);
    isolateModule(clone, entry);
    // variant 를 나르는 옵션을 먼저 지웁니다. 남겨 두면 authoring 된 값이 우리가 지정한
    // variant 를 이겨 버립니다 (모듈들이 `opts.mode || opts.preset` 처럼 읽기 때문입니다).
    entry.clearAttributes.forEach(function (attribute) { clone.removeAttribute(attribute); });
    var authored = (authoredOptions[name] || {})[variant.name] || {};
    Object.keys(authored).forEach(function (attribute) { clone.setAttribute(attribute, authored[attribute]); });
    if (entry.carrier === 'activation') clone.setAttribute(entry.attribute, variant.name);
    else {
      if (!clone.hasAttribute(entry.attribute)) clone.setAttribute(entry.attribute, '');
      clone.setAttribute(entry.carrierAttribute, variant.name);
    }
    return clone;
  }

  /** 타일에 붙는, 그대로 복사해 쓸 수 있는 마크업 한 줄. */
  function markupFor(entry, variant) {
    if (entry.preview !== 'grid') {
      return entry.attribute + '="' + variant.name + '"';
    }
    if (entry.carrier === 'activation') return entry.attribute + '="' + variant.name + '"';
    return entry.attribute + ' ' + entry.carrierAttribute + '="' + variant.name + '"';
  }

  /**
   * 타일의 "다시 재생". 데모 카드가 쓰는 것과 **같은** 컨트롤입니다 — 무대 오른쪽 아래에
   * 떠 있는 원형 아이콘 버튼(`.replay-fab`, styles.css). 시트만 다른 모양을 쓰면 같은 동작에
   * 두 가지 디자인이 생기고, 좁은 타일에서는 아래 줄로 접혀 줄바꿈이 납니다.
   */
  function replayControl() {
    var element = document.createElement('button');
    element.type = 'button';
    element.className = 'replay-fab variant-tile__replay';
    element.innerHTML = '<i class="ph-bold ph-arrow-counter-clockwise" aria-hidden="true"></i>';
    element.dataset.demoI18nAriaLabel = '다시 재생';
    element.setAttribute('aria-label', t('다시 재생'));
    element.title = t('다시 재생');
    return element;
  }

  function button(className, labelKey, iconClass) {
    var element = document.createElement('button');
    element.type = 'button';
    element.className = className;
    if (iconClass) {
      var icon = document.createElement('i');
      icon.className = iconClass;
      icon.setAttribute('aria-hidden', 'true');
      element.appendChild(icon);
    }
    var label = document.createElement('span');
    label.dataset.demoI18nText = labelKey;
    label.textContent = t(labelKey);
    element.appendChild(label);
    return element;
  }

  function badge(className, labelKey) {
    var element = document.createElement('span');
    element.className = className;
    element.dataset.demoI18nText = labelKey;
    element.textContent = t(labelKey);
    return element;
  }

  function buildTile(name, entry, variant) {
    var tile = document.createElement('article');
    tile.className = 'variant-tile';
    tile.dataset.variant = variant.name;
    tile.dataset.variantModule = name;

    var head = document.createElement('header');
    head.className = 'variant-tile__head';
    var title = document.createElement('span');
    title.className = 'variant-tile__name';
    title.textContent = variant.name;
    head.appendChild(title);
    if (variant.name === entry.defaultVariant) head.appendChild(badge('variant-tile__badge', '기본값'));
    if (variant.deprecated) head.appendChild(badge('variant-tile__badge variant-tile__badge--deprecated', '지원 중단 예정'));
    tile.appendChild(head);

    var stage = document.createElement('div');
    stage.className = 'variant-tile__stage';
    tile.appendChild(stage);

    if (entry.preview === 'grid') {
      var material = prepareMaterial(name, entry, variant);
      if (material) {
        // 확정 높이는 초기화 **전에** 정해야 합니다. 모듈은 만들어질 때 한 번 상자를 재고,
        // 그 뒤에 무대 크기를 바꿔도 다시 재지 않기 때문입니다.
        if (FILL_CLASS.test(material.className || '')) stage.classList.add('is-filled');
        stage.appendChild(material);
        stage.appendChild(replayControl());
        tile.dataset.variantPending = 'true';
      } else {
        // 여기 오면 안 됩니다 — tests/variant-compare.mjs 가 막습니다. 그래도 조용히
        // 빈 칸을 보여 주는 대신 무엇이 없는지 말해 줍니다.
        stage.appendChild(missingNote(variant.requires));
      }
    } else {
      stage.classList.add('variant-tile__stage--action');
      stage.appendChild(actionFor(name, entry, variant));
    }

    var footer = document.createElement('div');
    footer.className = 'variant-tile__foot';
    var markup = document.createElement('code');
    markup.className = 'variant-tile__markup';
    markup.textContent = markupFor(entry, variant);
    footer.appendChild(markup);
    var copy = button('variant-tile__copy', '복사', 'ph-bold ph-copy');
    copy.dataset.variantCopy = markup.textContent;
    footer.appendChild(copy);
    tile.appendChild(footer);
    return tile;
  }

  function missingNote(requires) {
    var note = document.createElement('p');
    note.className = 'variant-tile__missing';
    note.textContent = t('이 variant를 보여 줄 소재가 데모에 없습니다') + ' (' + requires + ')';
    return note;
  }

  /** grid 가 아닌 모듈의 타일에 들어가는 버튼. 데모가 이미 가진 컨트롤로 보냅니다. */
  function actionFor(name, entry, variant) {
    var action = button('variant-tile__action', entry.preview === 'control' ? '재생' : '데모에서 보기',
      entry.preview === 'control' ? 'ph-bold ph-play' : 'ph-bold ph-arrow-right');
    action.dataset.variantAction = entry.preview;
    action.dataset.variantTarget = name + ':' + variant.name;
    return action;
  }

  // ── 4. 시트 ────────────────────────────────────────────────────────────────
  var pendingObserver = null;
  function observeTile(tile) {
    var stage = tile.querySelector('.variant-tile__stage');
    if (!stage) return;
    if (typeof window.IntersectionObserver !== 'function') { initTile(tile); return; }
    if (!pendingObserver) {
      pendingObserver = new window.IntersectionObserver(function (entries) {
        entries.forEach(function (record) {
          if (!record.isIntersecting) return;
          pendingObserver.unobserve(record.target);
          initTile(record.target);
        });
      }, { rootMargin: '200px 0px' });
    }
    pendingObserver.observe(tile);
  }

  /** 타일은 화면에 들어올 때 처음으로 초기화됩니다. 23개짜리 시트도 비용이 한꺼번에 들지 않습니다. */
  function initTile(tile) {
    if (tile.dataset.variantPending !== 'true') return;
    tile.dataset.variantPending = 'false';
    var stage = tile.querySelector('.variant-tile__stage');
    if (!stage || !window.Kineto) return;
    try { window.Kineto.init(stage); } catch (error) { tile.dataset.variantFailed = 'true'; }
    fitToStage(stage);
  }

  /**
   * 소재는 원래 데모 카드 크기에 맞춰 authoring 된 것이라 타일보다 넓을 수 있습니다(큰 제목
   * 타이포그래피가 대표적입니다). 넘치는 만큼만 줄여서 타일 안에 담습니다.
   *
   * 값은 CSS 커스텀 속성으로만 내보냅니다 — 실제 transform 선언은 styles.css 가 갖고 있고,
   * 데모는 인라인 스타일을 금지합니다(tests/no-inline-styles.mjs).
   */
  function fitToStage(stage) {
    var material = materialOf(stage);
    if (!material || typeof material.getBoundingClientRect !== 'function') return;
    var measure = function () {
      var box = material.getBoundingClientRect();
      // `u-fill` 표시가 없는데도 높이가 접힌 소재(항목을 전부 절대 배치하는 경우)를 위한
      // 안전망입니다. 확정 높이를 준 다음 그 크기로 한 번 다시 만들어 줍니다.
      if (box.height < 40 && !stage.classList.contains('is-filled')) {
        stage.classList.add('is-filled');
        if (window.Kineto) {
          try { window.Kineto.destroy(stage); window.Kineto.init(stage); } catch (error) { /* 이 소재는 이대로 둡니다 */ }
        }
        return;
      }
      var available = stage.clientWidth - 8;
      var width = material.scrollWidth || box.width;
      if (!available || !width || width <= available) return;
      var scale = Math.max(0.45, available / width);
      stage.style.setProperty('--variant-fit', String(Math.round(scale * 1000) / 1000));
      stage.classList.add('is-fitted');
    };
    if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(measure);
    else measure();
  }

  function buildSheet(sheet) {
    var name = sheet.dataset.variantSheet;
    var entry = CATALOG.modules[name];
    if (!entry || sheet.dataset.variantBuilt === 'true') return;
    sheet.dataset.variantBuilt = 'true';

    if (entry.reason) {
      var note = document.createElement('p');
      note.className = 'variant-compare__note';
      note.dataset.demoI18nText = entry.reason;
      note.textContent = t(entry.reason);
      sheet.appendChild(note);
    }
    if (entry.preview === 'grid') {
      // 16개 lazy 효과가 같은 이미지 위에서 동시에 재생될 때가 이 시트의 쓸모가 가장 큰
      // 순간입니다 — 한 번에 다시 돌릴 수 있어야 비교가 됩니다.
      var tools = document.createElement('div');
      tools.className = 'variant-compare__tools';
      tools.appendChild(button('variant-compare__replay-all', '전체 다시 재생', 'ph-bold ph-arrows-clockwise'));
      sheet.appendChild(tools);
    }
    var grid = document.createElement('div');
    grid.className = 'variant-compare__grid';
    grid.dataset.variantCount = String(entry.variants.length);
    entry.variants.forEach(function (variant) {
      var tile = buildTile(name, entry, variant);
      grid.appendChild(tile);
      if (tile.dataset.variantPending === 'true') observeTile(tile);
    });
    sheet.appendChild(grid);
  }

  function clearSheet(sheet) {
    if (sheet.dataset.variantBuilt !== 'true') return;
    if (window.Kineto) { try { window.Kineto.destroy(sheet); } catch (error) { /* 이미 정리됨 */ } }
    if (pendingObserver) {
      Array.prototype.forEach.call(sheet.querySelectorAll('.variant-tile'), function (tile) { pendingObserver.unobserve(tile); });
    }
    sheet.textContent = '';
    sheet.dataset.variantBuilt = 'false';
  }

  /**
   * 모듈 블록에 "모든 variant 비교" 버튼과 (비어 있는) 시트를 붙입니다.
   * main.js 가 블록을 만들면서 부릅니다. variant 가 하나뿐인 모듈은 조용히 건너뜁니다.
   */
  function attach(block, name) {
    var entry = CATALOG.modules[name];
    if (!block || !entry || block.querySelector('[data-variant-compare]')) return null;
    snapshot();

    var wrapper = document.createElement('div');
    wrapper.className = 'variant-compare';
    wrapper.dataset.variantCompare = name;

    var toggle = button('variant-compare__toggle', '모든 variant 비교', 'ph-bold ph-squares-four');
    var count = document.createElement('span');
    count.className = 'variant-compare__count';
    count.textContent = String(entry.variants.length);
    toggle.appendChild(count);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'cmp-' + name);
    wrapper.appendChild(toggle);

    var sheet = document.createElement('div');
    sheet.className = 'variant-compare__sheet';
    sheet.id = 'cmp-' + name;
    sheet.dataset.variantSheet = name;
    sheet.dataset.variantBuilt = 'false';
    sheet.setAttribute('role', 'region');
    sheet.setAttribute('aria-label', t('모든 variant 비교') + ' — ' + name);
    sheet.hidden = true;
    wrapper.appendChild(sheet);

    // 버튼은 제목 아래, 시트는 그 바로 밑. 데모 본문은 그대로 이어집니다.
    var anchor = block.querySelector('.module-block-quality') || block.querySelector('.module-block-sub');
    if (anchor && anchor.parentNode === block) block.insertBefore(wrapper, anchor.nextSibling);
    else block.appendChild(wrapper);
    // `#cmp-<모듈>` 로 들어온 방문자에게는 블록이 만들어지는 즉시 시트가 열려 있어야 합니다.
    if (window.location.hash === '#cmp-' + name) setSheetOpen(wrapper, true, { hash: false });
    return wrapper;
  }

  /**
   * 열린 시트는 주소로 가리킬 수 있어야 합니다. "Reveal의 23개를 다 보고 얘기하자"를
   * 링크 하나로 보낼 수 있어야 검수 화면이기 때문입니다. `#cmp-<모듈>` 이 그 주소이고,
   * demo/main.js 의 해시 내비게이션이 `#mod-` 과 똑같이 취급합니다.
   */
  function writeHash(name, open) {
    var next = (open ? '#cmp-' : '#mod-') + name;
    if (window.location.hash === next) return;
    try { window.history.replaceState(window.history.state, '', next); } catch (error) { /* file:// */ }
  }

  function setSheetOpen(wrapper, open, options) {
    var sheet = wrapper && wrapper.querySelector('.variant-compare__sheet');
    var toggle = wrapper && wrapper.querySelector('.variant-compare__toggle');
    if (!sheet || !toggle || sheet.hidden !== open) return false;
    if (open) {
      buildSheet(sheet);
      sheet.hidden = false;
    } else {
      sheet.hidden = true;
      clearSheet(sheet);
    }
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    wrapper.classList.toggle('is-open', open);
    if (!options || options.hash !== false) writeHash(wrapper.dataset.variantCompare, open);
    return true;
  }

  function toggleSheet(toggle) {
    var wrapper = toggle.closest('[data-variant-compare]');
    var sheet = wrapper && wrapper.querySelector('.variant-compare__sheet');
    if (!sheet) return;
    setSheetOpen(wrapper, sheet.hidden);
  }

  /** 주소가 `#cmp-<모듈>` 이면 그 시트를 엽니다. 열려 있던 다른 시트는 닫습니다. */
  function syncFromHash() {
    var match = /^#cmp-([A-Za-z0-9]+)$/.exec(window.location.hash || '');
    var wanted = match ? match[1] : null;
    Array.prototype.forEach.call(document.querySelectorAll('[data-variant-compare]'), function (wrapper) {
      var open = wrapper.dataset.variantCompare === wanted;
      var sheet = wrapper.querySelector('.variant-compare__sheet');
      if (!sheet || sheet.hidden !== open) return;
      setSheetOpen(wrapper, open, { hash: false });
    });
  }

  function copyMarkup(trigger) {
    var text = trigger.dataset.variantCopy || '';
    var label = trigger.querySelector('span');
    var done = function () {
      if (!label) return;
      label.dataset.demoI18nText = '복사됨';
      label.textContent = t('복사됨');
      window.setTimeout(function () {
        label.dataset.demoI18nText = '복사';
        label.textContent = t('복사');
      }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { /* 권한 거부 — 마크업은 화면에 그대로 보입니다 */ });
    }
  }

  /** 무대에 올라간 소재. 무대에는 소재와 다시 재생 버튼만 있습니다. */
  function materialOf(stage) {
    return stage ? stage.querySelector(':scope > *:not(.replay-fab):not(.variant-tile__missing)') : null;
  }

  function replayTile(tile) {
    var stage = tile && tile.querySelector('.variant-tile__stage');
    if (!stage || !window.Kineto) return;
    if (tile.dataset.variantPending === 'true') { initTile(tile); return; }
    var name = tile.dataset.variantModule;
    try { window.Kineto.replay(materialOf(stage), name); } catch (error) { /* 이 모듈은 replay 를 제공하지 않습니다 */ }
  }

  function replayAll(trigger) {
    var sheet = trigger.closest('.variant-compare__sheet');
    if (!sheet) return;
    Array.prototype.forEach.call(sheet.querySelectorAll('.variant-tile'), replayTile);
  }

  /** grid 가 아닌 모듈: 데모가 가진 컨트롤을 대신 눌러 주거나, 모듈 데모로 보냅니다. */
  function runAction(trigger) {
    var target = String(trigger.dataset.variantTarget || '');
    var parts = target.split(':');
    var name = parts.shift();
    var variant = parts.join(':');
    var control = document.querySelector('[data-demo-variant="' + escapeSelector(target) + '"]');
    var destination = control || document.querySelector('[data-demo-home="' + escapeSelector(name) + '"]');
    if (!destination) return;
    destination.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (!control) return;
    // 스크롤이 끝난 뒤에 눌러야 무엇이 일어났는지 보입니다.
    window.setTimeout(function () { control.click(); }, 420);
    void variant;
  }

  function onClick(event) {
    var toggle = event.target.closest && event.target.closest('.variant-compare__toggle');
    if (toggle) { toggleSheet(toggle); return; }
    var copy = event.target.closest && event.target.closest('.variant-tile__copy');
    if (copy) { copyMarkup(copy); return; }
    var replayEverything = event.target.closest && event.target.closest('.variant-compare__replay-all');
    if (replayEverything) { replayAll(replayEverything); return; }
    var replay = event.target.closest && event.target.closest('.variant-tile__replay');
    if (replay) { replayTile(replay.closest('.variant-tile')); return; }
    var action = event.target.closest && event.target.closest('.variant-tile__action');
    if (action) runAction(action);
  }

  function onKeydown(event) {
    if (event.key !== 'Escape') return;
    var wrapper = event.target.closest && event.target.closest('[data-variant-compare].is-open');
    if (!wrapper) return;
    setSheetOpen(wrapper, false);
    wrapper.querySelector('.variant-compare__toggle')?.focus();
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydown);
    window.addEventListener('hashchange', syncFromHash);
    // Kineto 가 초기화되기 전에 소재를 복제해 둡니다. 이 스크립트는 </body> 앞에서 읽히고
    // autoInit 은 DOMContentLoaded 를 기다리므로, 여기가 마지막이자 가장 안전한 시점입니다.
    if (document.readyState === 'loading') snapshot();
  }

  window.KINETO_COMPARE = {
    attach: attach,
    snapshot: snapshot,
    syncFromHash: syncFromHash,
    // 테스트가 같은 구현을 그대로 확인할 수 있도록 내보냅니다(사본을 만들지 않기 위해서입니다).
    stats: stats,
    satisfies: satisfies,
    specimenFor: specimenFor,
    specimenCandidates: specimenCandidates,
    markupFor: markupFor,
    prepareMaterial: prepareMaterial,
    catalog: CATALOG
  };
}());
