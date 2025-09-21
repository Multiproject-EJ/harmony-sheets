/*****************************************************
 * Harmony Sheets — App.js v2.0
 *****************************************************/

const App = {};

App.createIcon = function(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${content}</svg>`;
};

App.LIFE_ICONS = {
  love: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="9.5" cy="10" r="3.2" />
      <circle cx="14.5" cy="10" r="3.2" />
      <path d="M6.2 13.8c1.5 2.7 3.5 4.8 5.8 6.4 2.3 -1.6 4.3 -3.7 5.8 -6.4" />
    </g>
  `),
  career: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M8 7V6a4 4 0 0 1 4-4 4 4 0 0 1 4 4v1" />
      <rect x="4" y="7" width="16" height="12" rx="2.5" />
      <path d="M4 12h16" />
      <path d="M12 11.7v2.6" />
    </g>
  `),
  health: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8.5v7" />
      <path d="M8.5 12h7" />
    </g>
  `),
  finances: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <ellipse cx="12" cy="8.5" rx="4.5" ry="2.5" />
      <path d="M7.5 8.5v7c0 1.5 2 2.5 4.5 2.5s4.5 -1 4.5 -2.5v-7" />
      <path d="M7.5 12c0 1.5 2 2.5 4.5 2.5s4.5 -1 4.5 -2.5" />
    </g>
  `),
  fun: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polygon points="12 4.5 14.1 9 19 9.6 15.6 12.7 16.7 17.4 12 14.9 7.3 17.4 8.4 12.7 5 9.6 9.9 9" />
    </g>
  `),
  family: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M4.5 18c0-2.2 1.8-4 4-4h7c2.2 0 4 1.8 4 4" />
      <circle cx="8.5" cy="10" r="3" />
      <circle cx="15.5" cy="11.5" r="2.5" />
    </g>
  `),
  environment: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M18.5 5.5c-6.7 -.8 -13 4.3 -13 10.4 0 1.9 1.4 3.5 3.2 3.7 2.1 .3 4.4 -1.4 6 -3.1l3.8 -4.1 -5.4 1.5 -3.6 3.2" />
      <path d="M11 9.5c0 3 1.2 6 3.5 8.5" />
    </g>
  `),
  spirituality: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 5V3" />
      <path d="M12 21v-2" />
      <path d="M5 12H3" />
      <path d="M21 12h-2" />
      <path d="M6.8 6.8L5.4 5.4" />
      <path d="M17.2 17.2L18.6 18.6" />
      <path d="M6.8 17.2L5.4 18.6" />
      <path d="M17.2 6.8L18.6 5.4" />
    </g>
  `)
};

App.LIFE_AREAS = {
  love: {
    title: "Love & Romantic Relationships",
    short: "Love",
    color: "#F471B5",
    icon: App.LIFE_ICONS.love,
    description: "Create rituals and check-ins that nurture meaningful partnerships.",
    link: "products.html?area=love",
    cta: "Explore relationship tools",
    empty: "We're crafting dedicated templates for Love & Romantic Relationships. In the meantime, explore all Life Harmony tools."
  },
  career: {
    title: "Career, Growth & Learning",
    short: "Career",
    color: "#A855F7",
    icon: App.LIFE_ICONS.career,
    description: "Stay organized, track goals, and keep moving toward your next milestone.",
    link: "products.html?area=career",
    cta: "Stay on track with career tools",
    empty: "We're designing more templates for Career, Growth & Learning. Browse all tools while we build."
  },
  health: {
    title: "Health & Fitness",
    short: "Health",
    color: "#22C55E",
    icon: App.LIFE_ICONS.health,
    description: "Build calm routines for movement, rest, and mindful habits.",
    link: "products.html?area=health",
    cta: "See wellness templates",
    empty: "We're creating new wellness planners for this area. Explore all Life Harmony tools to get started."
  },
  finances: {
    title: "Finances",
    short: "Finances",
    color: "#FACC15",
    icon: App.LIFE_ICONS.finances,
    description: "See your money clearly and plan budgets that match your values.",
    link: "products.html?area=finances",
    cta: "Review finance planners",
    empty: "More money clarity tools are coming soon. Until then, browse the full collection."
  },
  fun: {
    title: "Fun & Recreation",
    short: "Fun",
    color: "#FB923C",
    icon: App.LIFE_ICONS.fun,
    description: "Plan adventures, hobbies, and creative breaks that refill your energy.",
    link: "products.html?area=fun",
    cta: "Find fun & recreation ideas",
    empty: "We're crafting playful planners for Fun & Recreation. Explore all tools while we finish them."
  },
  family: {
    title: "Family & Friends",
    short: "Family",
    color: "#60A5FA",
    icon: App.LIFE_ICONS.family,
    description: "Coordinate family schedules and stay connected with the people who matter most.",
    link: "products.html?area=family",
    cta: "Coordinate with family tools",
    empty: "We're building new ways to support Family & Friends. Browse all tools to see what's ready now."
  },
  environment: {
    title: "Physical Environment",
    short: "Environment",
    color: "#14B8A6",
    icon: App.LIFE_ICONS.environment,
    description: "Design supportive spaces, tidy routines, and home projects with clarity.",
    link: "products.html?area=environment",
    cta: "Design your ideal space",
    empty: "Fresh templates for your environment are on the way. Check out the full library in the meantime."
  },
  spirituality: {
    title: "Spirituality & Community",
    short: "Spirituality",
    color: "#6366F1",
    icon: App.LIFE_ICONS.spirituality,
    description: "Cultivate reflection, service, and community practices that ground you.",
    link: "products.html?area=spirituality",
    cta: "Discover community & reflection tools",
    empty: "We're preparing new resources for Spirituality & Community. Explore all tools while we build."
  }
};

/*****************************************************
 * Utils
 *****************************************************/
App.qs = sel => document.querySelector(sel);
App.qsa = sel => Array.from(document.querySelectorAll(sel));

App.hexToRgba = function(hex, alpha = 1) {
  if (!hex) return "";
  let value = hex.replace("#", "");
  if (value.length === 3) {
    value = value
      .split("")
      .map(ch => ch + ch)
      .join("");
  }
  const int = parseInt(value, 16);
  if (Number.isNaN(int)) return "";
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

App.productsPromise = null;
App.loadProducts = function() {
  if (!App.productsPromise) {
    App.productsPromise = fetch("products.json")
      .then(res => res.json())
      .catch(err => {
        App.productsPromise = null;
        throw err;
      });
  }
  return App.productsPromise;
};

/*****************************************************
 * Init
 *****************************************************/
App.init = function() {
  App.initNav();

  // Update footer year
  const yearEl = App.qs("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Highlight active nav item
  const path = window.location.pathname;
  const filename = path === "/" ? "index.html" : path.split("/").pop();
  const topLinks = App.qsa(".main-nav > a.nav-link, .main-nav > .nav-item > a.nav-link");
  topLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (!href) return;
    const linkUrl = new URL(href, window.location.origin);
    const linkFile = linkUrl.pathname.split("/").pop();
    const isProductsLink = linkFile === "products.html";
    if (linkFile === filename || (isProductsLink && (filename === "products.html" || filename === "product.html"))) {
      link.classList.add("active");
    }
  });

  // Build enhanced browse menu
  App.initNavDropdown();

  // Auto-detect page
  if (App.qs("body.page-products")) App.initProducts();
  if (App.qs("body.page-product")) App.initProduct();
  if (App.qs("#life-wheel")) App.initHome();

  // Init suggest form everywhere
  App.initSuggestForm();
};

/*****************************************************
 * Navigation toggle
 *****************************************************/
App.closeBrowseMenu = null;
App.initNav = function() {
  const toggle = App.qs(".nav-toggle");
  const nav = App.qs(".main-nav");
  if (!toggle || !nav) return;

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (typeof App.closeBrowseMenu === "function") {
      App.closeBrowseMenu();
    }
  };

  const handleToggle = () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (!isOpen && typeof App.closeBrowseMenu === "function") {
      App.closeBrowseMenu();
    }
  };

  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;

  toggle.addEventListener("click", () => {
    handleToggle();
  });

  App.qsa(".main-nav a").forEach(link => {
    link.addEventListener("click", () => {
      if (isMobile()) closeMenu();
    });
  });

  window.addEventListener("resize", () => {
    if (!isMobile()) closeMenu();
  });

  window.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });

  closeMenu();
};

/*****************************************************
 * Browse mega menu
 *****************************************************/
App.initNavDropdown = function() {
  const browseItem = App.qs(".nav-item--browse");
  const browseLink = browseItem?.querySelector(".nav-link--browse");
  const mega = browseItem?.querySelector(".nav-mega");
  const content = browseItem?.querySelector("[data-nav-mega-content]");

  if (!browseItem || !browseLink || !mega || !content) {
    App.closeBrowseMenu = null;
    return;
  }

  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;

  const resetMegaPosition = () => {
    mega.style.left = "";
    mega.style.right = "";
  };

  const repositionMega = () => {
    resetMegaPosition();
    if (isMobile()) return;

    const margin = 20;
    const rect = mega.getBoundingClientRect();
    const itemRect = browseItem.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;

    let offset = rect.left - itemRect.left;
    let shift = 0;

    if (rect.left < margin) {
      shift = margin - rect.left;
    } else if (rect.right > viewportWidth - margin) {
      shift = viewportWidth - margin - rect.right;
    }

    if (Math.abs(shift) > 0.5) {
      offset += shift;
      mega.style.left = `${offset}px`;
    }
  };

  let repositionFrame = null;
  const scheduleReposition = () => {
    if (repositionFrame) cancelAnimationFrame(repositionFrame);
    repositionFrame = requestAnimationFrame(() => {
      repositionFrame = null;
      repositionMega();
    });
  };

  const setOpen = open => {
    if (isMobile()) {
      open = false;
    } else if (open) {
      scheduleReposition();
    }
    if (!open) {
      resetMegaPosition();
    }
    browseItem.classList.toggle("is-open", open);
    browseLink.setAttribute("aria-expanded", open ? "true" : "false");
  };
  const close = () => setOpen(false);
  App.closeBrowseMenu = close;
  close();

  browseItem.addEventListener("mouseenter", () => {
    if (!isMobile()) setOpen(true);
  });

  browseItem.addEventListener("mouseleave", () => {
    if (!isMobile()) close();
  });

  browseLink.addEventListener("focus", () => setOpen(true));

  browseItem.addEventListener("focusout", event => {
    if (!browseItem.contains(event.relatedTarget)) close();
  });

  browseItem.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      close();
      browseLink.focus();
    }
  });

  browseLink.addEventListener("click", () => {
    if (isMobile()) setOpen(false);
  });

  window.addEventListener("resize", () => {
    scheduleReposition();
    close();
  });

  const render = products => {
    const byArea = {};
    Object.keys(App.LIFE_AREAS).forEach(key => {
      byArea[key] = [];
    });

    products.forEach(product => {
      if (!Array.isArray(product.lifeAreas)) return;
      product.lifeAreas.forEach(area => {
        if (byArea[area]) byArea[area].push(product);
      });
    });

    Object.values(byArea).forEach(list => {
      list.sort((a, b) => a.name.localeCompare(b.name));
    });

    const groups = Object.entries(App.LIFE_AREAS)
      .map(([key, info]) => {
        const items = byArea[key] || [];
        const productMarkup = items.length
          ? items
              .map(p => `<li><a href="product.html?id=${p.id}">${p.name}</a></li>`)
              .join("")
          : '<li class="nav-mega__empty">Tools coming soon</li>';
        const soft = App.hexToRgba(info.color, 0.12);
        const border = App.hexToRgba(info.color, 0.24);
        const ink = App.hexToRgba(info.color, 0.7);
        return `
          <section class="nav-mega__group" style="--area-color:${info.color};--area-soft:${soft};--area-border:${border};--area-ink:${ink};">
            <header class="nav-mega__heading">
              <span class="nav-mega__badge">${info.short || info.title}</span>
              <span class="nav-mega__label">${info.title}</span>
            </header>
            <ul class="nav-mega__products">${productMarkup}</ul>
            <a class="nav-mega__area-link" href="${info.link}">Open ${info.short || info.title} tools</a>
          </section>
        `;
      })
      .join("");

    content.innerHTML = `
      <div class="nav-mega__grid">
        ${groups}
      </div>
      <div class="nav-mega__footer"><a href="products.html">Browse all Harmony tools</a></div>
    `;
    scheduleReposition();
  };

  App.loadProducts()
    .then(products => {
      render(products);
    })
    .catch(err => {
      console.error("Error building browse menu:", err);
      content.innerHTML = '<p class="nav-mega__placeholder">Unable to load tools right now.</p>';
      scheduleReposition();
    });
};

/*****************************************************
 * Products listing (products.html)
 *****************************************************/
App.initProducts = async function() {
  const container = App.qs("#products-list");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const areaSlug = params.get("area");
  const areaInfo = areaSlug ? App.LIFE_AREAS[areaSlug] : null;
  const heading = App.qs("#products-heading");
  const intro = App.qs("#products-intro");

  try {
    const products = await App.loadProducts();

    if (areaInfo) {
      if (heading) heading.textContent = areaInfo.title;
      if (intro) intro.textContent = areaInfo.description;
      document.title = `${areaInfo.title} — Harmony Sheets`;
    }

    let list = products;
    if (areaInfo) {
      list = products.filter(p => Array.isArray(p.lifeAreas) && p.lifeAreas.includes(areaSlug));
    }

    if (!list.length) {
      const emptyMessage = areaInfo?.empty || "We're crafting new tools for this area. Explore all Life Harmony templates in the meantime.";
      container.innerHTML = `
        <div class="products-empty">
          <p>${emptyMessage}</p>
          <a href="products.html">Browse all tools</a>
        </div>
      `;
      return;
    }

    container.innerHTML = list
      .map(
        p => {
          const tags = Array.isArray(p.lifeAreas)
            ? p.lifeAreas
                .map(tag => App.LIFE_AREAS[tag]?.short)
                .filter(Boolean)
                .map(t => `<span>${t}</span>`)
                .join("")
            : "";

          return `
        <div class="product-card">
          <a href="product.html?id=${p.id}">
            <div class="thumb">
              <img src="${p.colorImage || "assets/placeholder.png"}" alt="">
            </div>
            <h3>${p.name}</h3>
            <p class="muted">${p.tagline || ""}</p>
            <p class="price">${p.price || ""}</p>
            ${tags ? `<div class="product-tags">${tags}</div>` : ""}
          </a>
        </div>
      `;
        }
      )
      .join("");
  } catch (err) {
    console.error("Error loading products:", err);
  }
};

/*****************************************************
 * Home page life wheel (index.html)
 *****************************************************/
App.initHome = function() {
  const details = App.qs("#life-wheel-details");
  const slices = App.qsa(".life-wheel__slice-link");
  if (!details || !slices.length) return;

  const iconLayer = App.qs(".life-wheel__icons");
  const graphic = iconLayer ? iconLayer.closest(".life-wheel__graphic") : App.qs(".life-wheel__graphic");

  const iconData = [];
  const labelData = [];

  const sliceIndices = new Map();
  const sliceLookup = new Map();
  slices.forEach((slice, index) => {
    if (slice.dataset.area) {
      sliceIndices.set(slice.dataset.area, index);
      sliceLookup.set(slice.dataset.area, slice);
    }
  });

  const iconLookup = new Map();
  const labelLookup = new Map();

  let labelLayer = graphic ? graphic.querySelector(".life-wheel__labels") : null;
  if (!labelLayer && graphic) {
    labelLayer = document.createElement("div");
    labelLayer.className = "life-wheel__labels";
    graphic.appendChild(labelLayer);
  }
  if (labelLayer) {
    labelLayer.innerHTML = "";
  }

  if (iconLayer) {
    iconLayer.innerHTML = "";
    slices.forEach((slice, index) => {
      const area = slice.dataset.area;
      const info = App.LIFE_AREAS[area];
      if (!info) return;

      const icon = document.createElement("div");
      icon.className = "life-wheel__icon";
      icon.dataset.area = area;
      icon.dataset.index = String(index);
      icon.style.setProperty("--area-color", info.color);
      icon.style.setProperty("--area-glow", App.hexToRgba(info.color, 0.34));

      const inner = document.createElement("span");
      inner.className = "life-wheel__icon-inner";
      inner.innerHTML = info.icon || "";

      icon.appendChild(inner);
      iconLayer.appendChild(icon);

      iconLookup.set(area, icon);
      iconData.push({ icon, index });

      if (labelLayer) {
        const label = document.createElement("a");
        label.className = "life-wheel__label";
        label.dataset.area = area;
        label.dataset.index = String(index);
        label.textContent = info.short || info.title || "";
        label.style.setProperty("--area-color", info.color);
        label.style.setProperty("--area-glow", App.hexToRgba(info.color, 0.26));
        const sliceEl = sliceLookup.get(area);
        const areaLink = info.link || sliceEl?.getAttribute("href") || `products.html?area=${area}`;
        label.href = areaLink;
        if (info.title) label.setAttribute("aria-label", info.title);
        labelLayer.appendChild(label);
        labelLookup.set(area, label);
        labelData.push({ label, index });

        if (sliceEl) {
          label.addEventListener("mouseenter", () => setActive(sliceEl));
          label.addEventListener("focus", () => setActive(sliceEl));
          label.addEventListener("pointerdown", event => {
            if (event.pointerType === "touch" || event.pointerType === "pen") {
              setActive(sliceEl);
            }
          });
        }
        label.addEventListener("mouseleave", () => scheduleReset());
        label.addEventListener("blur", () => reset());
      }
    });
  } else {
    App.qsa(".life-wheel__icon").forEach(icon => {
      const area = icon.dataset.area;
      if (!area) return;
      const info = App.LIFE_AREAS[area];
      let index = sliceIndices.has(area)
        ? sliceIndices.get(area)
        : parseInt(icon.dataset.index || "0", 10);
      if (!Number.isFinite(index)) index = 0;
      if (info) {
        icon.style.setProperty("--area-color", info.color);
        icon.style.setProperty("--area-glow", App.hexToRgba(info.color, 0.34));
      }
      icon.dataset.index = String(index);
      iconLookup.set(area, icon);
      iconData.push({ icon, index });

      if (labelLayer && info) {
        const label = document.createElement("a");
        label.className = "life-wheel__label";
        label.dataset.area = area;
        label.dataset.index = String(index);
        label.textContent = info.short || info.title || "";
        label.style.setProperty("--area-color", info.color);
        label.style.setProperty("--area-glow", App.hexToRgba(info.color, 0.26));
        const sliceEl = sliceLookup.get(area);
        const areaLink = info.link || sliceEl?.getAttribute("href") || `products.html?area=${area}`;
        label.href = areaLink;
        if (info.title) label.setAttribute("aria-label", info.title);
        labelLayer.appendChild(label);
        labelLookup.set(area, label);
        labelData.push({ label, index });

        if (sliceEl) {
          label.addEventListener("mouseenter", () => setActive(sliceEl));
          label.addEventListener("focus", () => setActive(sliceEl));
          label.addEventListener("pointerdown", event => {
            if (event.pointerType === "touch" || event.pointerType === "pen") {
              setActive(sliceEl);
            }
          });
        }
        label.addEventListener("mouseleave", () => scheduleReset());
        label.addEventListener("blur", () => reset());
      }
    });
  }

  const updateIconPositions = () => {
    if (!iconData.length && !labelData.length) return;
    const boundsSource = graphic || iconLayer || App.qs(".life-wheel__graphic");
    if (!boundsSource) return;
    const size = boundsSource.getBoundingClientRect().width;
    if (!size) return;

    const iconSize = Math.max(Math.min(size * 0.16, 68), 44);
    const outerRadius = size * (160 / 360);
    const radius = Math.max(outerRadius - iconSize * 0.5 - size * 0.015, outerRadius * 0.58);
    const labelRadius = outerRadius + Math.max(size * 0.085, iconSize * 0.5) + size * 0.008;
    const labelFont = Math.max(Math.min(size * 0.045, 18), 12);
    const center = size / 2;

    iconData.forEach(({ icon, index }) => {
      const angleDeg = -90 + index * 45;
      const angleRad = (Math.PI / 180) * angleDeg;
      const x = center + Math.cos(angleRad) * radius;
      const y = center + Math.sin(angleRad) * radius;
      icon.style.setProperty("--icon-x", `${x}px`);
      icon.style.setProperty("--icon-y", `${y}px`);
      icon.style.setProperty("--icon-size", `${iconSize}px`);
    });

    labelData.forEach(({ label, index }) => {
      const angleDeg = -90 + index * 45;
      const angleRad = (Math.PI / 180) * angleDeg;
      const x = center + Math.cos(angleRad) * labelRadius;
      const y = center + Math.sin(angleRad) * labelRadius;
      label.style.setProperty("--label-x", `${x}px`);
      label.style.setProperty("--label-y", `${y}px`);
      label.style.setProperty("--label-font-size", `${labelFont}px`);
      const alignment = Math.cos(angleRad);
      if (Math.abs(alignment) > 0.6) {
        label.dataset.align = alignment > 0 ? "right" : "left";
      } else {
        label.dataset.align = "center";
      }
    });
  };

  updateIconPositions();

  let resizeFrame = null;
  const handleResize = () => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(updateIconPositions);
  };

  window.addEventListener("resize", handleResize);


  const defaultState = {
    title: details.dataset.defaultTitle || "Explore the Life Harmony Wheel",
    description: details.dataset.defaultDescription || "",
    link: details.dataset.defaultLink || "products.html",
    cta: details.dataset.defaultCta || "Browse all Life Harmony tools",
    icon: null,
    color: null,
    area: null
  };

  const setAccent = color => {
    if (color) {
      details.style.setProperty("--detail-color", color);
      details.style.setProperty("--detail-glow", App.hexToRgba(color, 0.24));
      details.style.setProperty("--detail-sheen", App.hexToRgba(color, 0.14));
    } else {
      details.style.removeProperty("--detail-color");
      details.style.removeProperty("--detail-glow");
      details.style.removeProperty("--detail-sheen");
    }
  };

  const render = (state, isActive = false) => {
    const { title, description, link, cta, icon, area } = state;
    const iconMarkup = icon
      ? `<span class="life-wheel__detail-icon" aria-hidden="true">${icon}</span>`
      : "";
    details.innerHTML = `
      ${iconMarkup}
      <div class="life-wheel__detail-copy">
        <h3>${title}</h3>
        <p>${description}</p>
        <a class="life-wheel__cta" href="${link}">${cta}</a>
      </div>
    `;
    if (area) {
      details.dataset.area = area;
    } else {
      details.removeAttribute("data-area");
    }
    details.classList.toggle("has-icon", Boolean(icon));
    details.classList.toggle("is-active", isActive);
  };

  let activeSlice = null;
  let activeIcon = null;
  let activeLabel = null;
  let resetTimer = null;

  const isMobileViewport = () => window.matchMedia("(max-width: 720px)").matches;

  let mobileScrollFrame = null;
  const ensureMobileView = () => {
    if (!isMobileViewport() || !graphic) return;

    const wheelRect = graphic.getBoundingClientRect();
    const detailsRect = details.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const top = Math.min(wheelRect.top, detailsRect.top) + scrollY;
    const bottom = Math.max(wheelRect.bottom, detailsRect.bottom) + scrollY;
    const viewTop = scrollY;
    const viewBottom = viewTop + window.innerHeight;
    const padding = 28;

    if (top >= viewTop + padding && bottom <= viewBottom - padding) {
      return;
    }

    const combined = bottom - top;
    const viewport = window.innerHeight;
    let target = top - padding;
    if (combined + padding * 2 <= viewport) {
      const midpoint = top + combined / 2;
      target = midpoint - viewport / 2;
    }

    const maxTarget = bottom - viewport + padding;
    if (Number.isFinite(maxTarget)) {
      target = Math.min(target, Math.max(0, maxTarget));
    }
    target = Math.max(0, target);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: target,
      behavior: prefersReduced ? "auto" : "smooth"
    });
  };

  const scheduleEnsureMobileView = () => {
    if (!isMobileViewport()) return;
    if (mobileScrollFrame) cancelAnimationFrame(mobileScrollFrame);
    mobileScrollFrame = requestAnimationFrame(() => {
      ensureMobileView();
      mobileScrollFrame = null;
    });
  };

  const setActive = slice => {
    const area = slice.dataset.area;
    const info = App.LIFE_AREAS[area];
    if (!info) return;
    clearTimeout(resetTimer);
    if (activeSlice && activeSlice !== slice) {
      activeSlice.classList.remove("is-active");
    }
    const iconEl = iconLookup.get(area);
    if (activeIcon && activeIcon !== iconEl) {
      activeIcon.classList.remove("is-active");
    }
    if (iconEl) {
      iconEl.classList.add("is-active");
    }
    const labelEl = labelLookup.get(area);
    if (activeLabel && activeLabel !== labelEl) {
      activeLabel.classList.remove("is-active");
    }
    if (labelEl) {
      labelEl.classList.add("is-active");
    }
    activeSlice = slice;
    activeIcon = iconEl || null;
    activeLabel = labelEl || null;
    slice.classList.add("is-active");
    setAccent(info.color);
    render({ ...info, area }, true);
    scheduleEnsureMobileView();
  };

  const reset = () => {
    clearTimeout(resetTimer);
    if (activeSlice) {
      activeSlice.classList.remove("is-active");
      activeSlice = null;
    }
    if (activeIcon) {
      activeIcon.classList.remove("is-active");
      activeIcon = null;
    }
    if (activeLabel) {
      activeLabel.classList.remove("is-active");
      activeLabel = null;
    }
    setAccent(null);
    render(defaultState, false);
  };

  const scheduleReset = () => {
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      if (details.matches(":hover")) return;
      reset();
    }, 140);
  };

  details.addEventListener("mouseenter", () => clearTimeout(resetTimer));
  details.addEventListener("mouseleave", reset);
  details.addEventListener("blur", reset, true);

  slices.forEach(slice => {
    const area = slice.dataset.area;
    const info = App.LIFE_AREAS[area];
    if (info) {
      slice.setAttribute("aria-label", info.title);
      const title = slice.querySelector("title");
      if (title) title.textContent = info.title;
    }

    slice.addEventListener("mouseenter", () => setActive(slice));
    slice.addEventListener("focus", () => setActive(slice));
    slice.addEventListener("mouseleave", scheduleReset);
    slice.addEventListener("blur", reset);
    slice.addEventListener("pointerdown", event => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        setActive(slice);
      }
    });
  });

  render(defaultState, false);
};

/*****************************************************
 * Product detail (product.html)
 *****************************************************/
App.initProduct = async function() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  if (!productId) return;

  try {
    const products = await App.loadProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Title + name
    document.title = product.name + " — Harmony Sheets";
    App.qs("#p-name").textContent = product.name;
    if (App.qs("#p-title")) App.qs("#p-title").textContent = product.name;
    if (App.qs("#p-sticky-name")) App.qs("#p-sticky-name").textContent = product.name;

    // Tagline
    if (product.tagline) App.qs("#p-tagline").textContent = product.tagline;

    // Badges
    if (product.badges && App.qs("#p-badges")) {
      App.qs("#p-badges").innerHTML = product.badges.map(b => `<span class="badge">${b}</span>`).join("");
    }

    // Price
    if (product.price && App.qs("#p-price")) App.qs("#p-price").textContent = product.price;

    // Features
    if (product.features && App.qs("#p-features")) {
      App.qs("#p-features").innerHTML = product.features.map(f => `<li>${f}</li>`).join("");
    }

    // Description
    if (product.description && App.qs("#p-description")) {
      App.qs("#p-description").innerHTML = product.description;
    }

    // Social proof
    if (product.socialProof && App.qs("#p-social")) {
      App.qs("#p-social").innerHTML = `
        <div class="social-proof">
          <div class="stars">${product.socialProof.stars || ""}</div>
          <div class="muted">${product.socialProof.quote || ""}</div>
        </div>`;
    }

    // Benefits
    if (product.benefits && App.qs("#p-benefits")) {
      App.qs("#p-benefits").innerHTML = `
        <div class="features-grid">
          ${product.benefits.map(b => `
            <div class="feature-card">
              <h4>${b.title}</h4>
              <p>${b.desc}</p>
            </div>`).join("")}
        </div>`;
    }

    // Color variations
    if (product.colorImage && App.qs("#p-color-image")) {
      App.qs("#p-color-image").src = product.colorImage;
      if (product.colorCaption) App.qs("#p-color-caption").textContent = product.colorCaption;
    } else if (App.qs("#p-colors")) {
      App.qs("#p-colors").style.display = "none";
    }

    // Demo video
    if (product.demoVideo && App.qs("#p-demo")) {
      App.qs("#p-demo").innerHTML = `
        <video controls muted playsinline width="100%" height="100%" ${product.demoPoster ? `poster="${product.demoPoster}"` : ""}>
          <source src="${product.demoVideo}" type="video/mp4">
        </video>`;
    } else if (App.qs("#p-demo-section")) {
      App.qs("#p-demo-section").style.display = "none";
    }

    // Included
    if (product.included && App.qs("#p-included")) {
      App.qs("#p-included").innerHTML = `
        <h3>What you get</h3>
        <ul>${product.included.map(i => `<li>${i}</li>`).join("")}</ul>`;
    }

    // FAQs
    if (product.faqs && App.qs("#p-faqs")) {
      App.qs("#p-faqs").innerHTML = `
        <h3>FAQs</h3>
        ${product.faqs.map(f => `
          <details class="faq">
            <summary>${f.q}</summary>
            <p>${f.a}</p>
          </details>`).join("")}`;
    }

    // Pricing
    if (product.pricingTitle && App.qs("#p-pricing-title")) App.qs("#p-pricing-title").textContent = product.pricingTitle;
    if (product.pricingSub && App.qs("#p-pricing-sub")) App.qs("#p-pricing-sub").textContent = product.pricingSub;

    // Links
    ["p-stripe", "p-stripe-2", "p-stripe-sticky"].forEach(id => {
      const el = App.qs("#" + id);
      if (el && product.stripe) el.href = product.stripe;
    });
    ["p-etsy", "p-etsy-2", "p-etsy-sticky"].forEach(id => {
      const el = App.qs("#" + id);
      if (el && product.etsy) el.href = product.etsy;
    });

    // Suggestion form product_id
    const pid = App.qs("#product_id");
    if (pid) pid.value = product.id;

    // Init gallery slider
    App.initGallery();
  } catch (err) {
    console.error("Error loading product:", err);
  }
};

/*****************************************************
 * Suggestion form
 *****************************************************/
App.initSuggestForm = function() {
  const form = App.qs("#suggest-form");
  if (!form) return;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const status = App.qs("#suggest-status");
    if (status) status.textContent = "Sending...";
    try {
      // Fake send
      await new Promise(res => setTimeout(res, 600));
      if (status) status.textContent = "Thanks for your idea!";
      form.reset();
    } catch (err) {
      console.error(err);
      if (status) status.textContent = "Error, try again later.";
    }
  });
};

/*****************************************************
 * Gallery slider
 *****************************************************/
App.initGallery = function() {
  const gallery = App.qs("#p-slider");
  if (!gallery) return;

  const slides = App.qsa("#p-slider .slide");
  let idx = 0;
  const show = i => slides.forEach((s, n) => s.style.display = n === i ? "block" : "none");
  if (slides.length) show(idx);

  const prev = gallery.querySelector(".prev");
  const next = gallery.querySelector(".next");
  if (prev) prev.addEventListener("click", () => { idx = (idx - 1 + slides.length) % slides.length; show(idx); });
  if (next) next.addEventListener("click", () => { idx = (idx + 1) % slides.length; show(idx); });
};

/*****************************************************
 * DOM ready
 *****************************************************/
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
