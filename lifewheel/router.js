(function (global) {
  const LW = (global.LW = global.LW || {});
  const routes = ['dashboard', 'checkin', 'goals', 'habits', 'gallery', 'settings'];
  const templateCache = new Map();

  async function load(route) {
    const main = document.getElementById('lwapp-main');
    if (!routes.includes(route)) {
      route = 'dashboard';
    }
    const template = await getTemplate(route);
    main.innerHTML = template;
    main.setAttribute('data-route', route);
    main.focus();
    setActiveLink(route);
    global.dispatchEvent(new CustomEvent('lw:page-loaded', { detail: { route } }));
  }

  async function getTemplate(route) {
    if (templateCache.has(route)) {
      return templateCache.get(route);
    }
    try {
      const response = await fetch(`./pages/${route}.html`, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const html = await response.text();
      templateCache.set(route, html);
      return html;
    } catch (error) {
      console.warn('[LW] Falling back to cached template', route, error);
      const cache = await caches.open('lwapp-v1');
      const cachedResponse = await cache.match(`./pages/${route}.html`);
      if (cachedResponse) {
        const html = await cachedResponse.text();
        templateCache.set(route, html);
        return html;
      }
      return `<section class="lwapp-card"><p>Offline: page unavailable.</p></section>`;
    }
  }

  function setActiveLink(route) {
    const links = document.querySelectorAll('[data-route]');
    links.forEach((link) => {
      const isActive = link.getAttribute('data-route') === route;
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  function handleHashChange() {
    const hash = global.location.hash.replace('#/', '') || 'dashboard';
    load(hash);
  }

  function init() {
    handleHashChange();
    global.addEventListener('hashchange', handleHashChange);
    const navToggle = document.querySelector('[data-lw-nav-toggle]');
    const nav = document.querySelector('[data-lw-nav]');
    if (navToggle && nav) {
      navToggle.addEventListener('click', () => {
        const open = nav.getAttribute('data-open') === 'true';
        nav.setAttribute('data-open', String(!open));
      });
      nav.addEventListener('click', () => {
        nav.setAttribute('data-open', 'false');
      });
    }
  }

  navigator.serviceWorker?.addEventListener?.('message', (event) => {
    if (event.data?.type === 'LW_NAVIGATE') {
      const route = event.data.route || 'dashboard';
      global.location.hash = `#/${route}`;
    }
    if (event.data?.type === 'LW_PROCESS_OP') {
      global.dispatchEvent(new CustomEvent('lw:process-op', { detail: event.data.payload }));
    }
  });

  LW.router = {
    init,
    load
  };
})(window);
