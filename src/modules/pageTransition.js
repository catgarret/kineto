import Kineto from '../core.js';

let activeInstance = null;

function maxTransitionMs(el) {
  const style = getComputedStyle(el);
  const durations = style.transitionDuration.split(',').map((value) => Number.parseFloat(value) * (value.includes('ms') ? 1 : 1000));
  const delays = style.transitionDelay.split(',').map((value) => Number.parseFloat(value) * (value.includes('ms') ? 1 : 1000));
  return Math.max(0, ...durations.map((duration, index) => duration + (delays[index] ?? delays[0] ?? 0)));
}

export default {
  create(el, opts) {
    if (activeInstance) return activeInstance;

    const containerSelector = opts.container || 'main';
    const linkSelector = opts.linkSelector || 'a[href]:not([target="_blank"]):not([download]):not([data-kt-no-transition])';
    const animationSelector = opts.animationSelector || '[class*="transition-"]';
    const minDuration = Number(opts.minDuration ?? 400);
    const cache = new Map();
    let controller = null;
    let destroyed = false;
    let navigating = false;

    const shouldHandle = (event, link) => {
      if (!link || event.defaultPrevented || event.button !== 0) return false;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return false;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return false;
      return true;
    };

    const fetchPage = async (url) => {
      if (opts.cache !== false && cache.has(url)) return cache.get(url);
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'X-Kineto-Navigation': '1' }
        });
        if (!response.ok) return null;
        const text = await response.text();
        if (opts.cache !== false) cache.set(url, text);
        return text;
      } catch (error) {
        if (error.name !== 'AbortError') opts.onError?.(error);
        return null;
      }
    };

    const waitForLeave = () => {
      const elements = Array.from(document.querySelectorAll(animationSelector));
      const duration = Math.max(minDuration, ...elements.map(maxTransitionMs));
      return new Promise((resolve) => setTimeout(resolve, duration));
    };

    const activateScripts = (container) => {
      container.querySelectorAll('script').forEach((oldScript) => {
        const script = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attribute) => script.setAttribute(attribute.name, attribute.value));
        script.textContent = oldScript.textContent;
        oldScript.replaceWith(script);
      });
    };

    const renderPage = (htmlText, url, popState) => {
      const doc = new DOMParser().parseFromString(htmlText, 'text/html');
      const currentContainer = document.querySelector(containerSelector);
      const nextContainer = doc.querySelector(containerSelector);
      if (!currentContainer || !nextContainer) return false;

      Kineto.destroy(currentContainer);
      currentContainer.innerHTML = nextContainer.innerHTML;
      Array.from(nextContainer.attributes).forEach((attribute) => {
        if (attribute.name !== 'id') currentContainer.setAttribute(attribute.name, attribute.value);
      });
      if (opts.executeScripts !== false) activateScripts(currentContainer);
      document.title = doc.title || document.title;
      if (!popState) history.pushState({ kinetoUrl: url }, document.title, url);

      window.scrollTo({ top: Number(opts.scrollTop ?? 0), behavior: 'auto' });
      const html = document.documentElement;
      html.classList.remove('kt-is-leaving');
      html.classList.add('kt-is-entering');
      Kineto.scan(currentContainer);
      Kineto.refresh();
      opts.onEnter?.(currentContainer, doc);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        html.classList.remove('kt-is-animating', 'kt-is-entering');
      }));
      return true;
    };

    const navigate = async (url, popState = false) => {
      if (navigating || destroyed) return;
      navigating = true;
      const html = document.documentElement;
      html.classList.add('kt-is-animating', 'kt-is-leaving');
      html.classList.remove('kt-is-entering');
      opts.onLeave?.(url);

      const [htmlText] = await Promise.all([fetchPage(url), waitForLeave()]);
      if (destroyed) return;
      const rendered = htmlText && renderPage(htmlText, url, popState);
      navigating = false;
      if (!rendered) window.location.assign(url);
    };

    const onClick = (event) => {
      const link = event.target.closest?.(linkSelector);
      if (!shouldHandle(event, link)) return;
      event.preventDefault();
      opts.onClick?.(link, event);
      navigate(link.href);
    };
    const onPopState = () => navigate(window.location.href, true);

    if (!history.state?.kinetoUrl) history.replaceState({ ...(history.state || {}), kinetoUrl: window.location.href }, document.title, window.location.href);
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPopState);

    activeInstance = {
      el: document.documentElement,
      type: 'pageTransition',
      navigate,
      pause() {},
      resume() {},
      destroy() {
        destroyed = true;
        controller?.abort();
        document.removeEventListener('click', onClick);
        window.removeEventListener('popstate', onPopState);
        document.documentElement.classList.remove('kt-is-animating', 'kt-is-leaving', 'kt-is-entering');
        if (activeInstance === this) activeInstance = null;
      }
    };
    return activeInstance;
  },
  reduced() {
    // Native navigation is the reduced-motion fallback.
  }
};
