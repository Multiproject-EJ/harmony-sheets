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
  App.qsa(".main-nav a").forEach(a => {
    if (a.href.includes(path)) a.classList.add("active");
  });

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
App.initNav = function() {
  const toggle = App.qs(".nav-toggle");
  const nav = App.qs(".main-nav");
  if (!toggle || !nav) return;

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const handleToggle = () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
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
    const res = await fetch("products.json");
    const products = await res.json();

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
  const iconData = [];

  const sliceIndices = new Map();
  slices.forEach((slice, index) => {
    if (slice.dataset.area) sliceIndices.set(slice.dataset.area, index);
  });

  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return "";
    let value = hex.replace("#", "");
    if (value.length === 3) {
      value = value
        .split("")
        .map(ch => ch + ch)
        .join("");
    }
    const int = parseInt(value, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const iconLookup = new Map();

  if (iconLayer) {
    iconLayer.innerHTML = "";
    slices.forEach((slice, index) => {
      const area = slice.dataset.area;
      const info = App.LIFE_AREAS[area];
      if (!info) return;

      const icon = document.createElement("div");
      icon.className = "life-wheel__icon";
      icon.dataset.area = area;
      icon.style.setProperty("--area-color", info.color);
      icon.style.setProperty("--area-glow", hexToRgba(info.color, 0.34));
      icon.dataset.index = String(index);

      const inner = document.createElement("span");
      inner.className = "life-wheel__icon-inner";
      inner.innerHTML = info.icon || "";

      icon.appendChild(inner);
      iconLayer.appendChild(icon);
      iconLookup.set(area, icon);
      iconData.push({ icon, index });
    });
  } else {
    App.qsa(".life-wheel__icon").forEach(icon => {
      const area = icon.dataset.area;
      if (!area) return;
      const index = sliceIndices.has(area) ? sliceIndices.get(area) : 0;
      icon.dataset.index = String(index ?? 0);
      iconLookup.set(area, icon);
      iconData.push({ icon, index: index ?? 0 });
    });
  }

  const graphic = iconLayer ? iconLayer.closest(".life-wheel__graphic") : null;

  const updateIconPositions = () => {
    if (!iconData.length) return;
    const boundsSource = graphic || iconLayer || App.qs(".life-wheel__graphic");
    if (!boundsSource) return;
    const size = boundsSource.getBoundingClientRect().width;
    if (!size) return;

    const iconSize = Math.max(Math.min(size * 0.16, 68), 44);
    const outerRadius = size * (160 / 360);
    const radius = Math.max(outerRadius - iconSize * 0.5 - size * 0.015, outerRadius * 0.58);
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
      details.style.setProperty("--detail-glow", hexToRgba(color, 0.24));
      details.style.setProperty("--detail-sheen", hexToRgba(color, 0.14));
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
  let resetTimer = null;

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
    activeSlice = slice;
    activeIcon = iconEl || null;
    slice.classList.add("is-active");
    setAccent(info.color);
    render({ ...info, area }, true);
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
    const res = await fetch("products.json");
    const products = await res.json();
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
