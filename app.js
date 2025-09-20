/*****************************************************
 * Harmony Sheets — App.js v2.0
 *****************************************************/

const App = {};

App.LIFE_AREAS = {
  love: {
    title: "Love & Romantic Relationships",
    short: "Love",
    description: "Create rituals and check-ins that nurture meaningful partnerships.",
    link: "products.html?area=love",
    cta: "Explore relationship tools",
    empty: "We're crafting dedicated templates for Love & Romantic Relationships. In the meantime, explore all Life Harmony tools."
  },
  career: {
    title: "Career, Growth & Learning",
    short: "Career",
    description: "Stay organized, track goals, and keep moving toward your next milestone.",
    link: "products.html?area=career",
    cta: "Stay on track with career tools",
    empty: "We're designing more templates for Career, Growth & Learning. Browse all tools while we build."
  },
  health: {
    title: "Health & Fitness",
    short: "Health",
    description: "Build calm routines for movement, rest, and mindful habits.",
    link: "products.html?area=health",
    cta: "See wellness templates",
    empty: "We're creating new wellness planners for this area. Explore all Life Harmony tools to get started."
  },
  finances: {
    title: "Finances",
    short: "Finances",
    description: "See your money clearly and plan budgets that match your values.",
    link: "products.html?area=finances",
    cta: "Review finance planners",
    empty: "More money clarity tools are coming soon. Until then, browse the full collection."
  },
  fun: {
    title: "Fun & Recreation",
    short: "Fun",
    description: "Plan adventures, hobbies, and creative breaks that refill your energy.",
    link: "products.html?area=fun",
    cta: "Find fun & recreation ideas",
    empty: "We're crafting playful planners for Fun & Recreation. Explore all tools while we finish them."
  },
  family: {
    title: "Family & Friends",
    short: "Family",
    description: "Coordinate family schedules and stay connected with the people who matter most.",
    link: "products.html?area=family",
    cta: "Coordinate with family tools",
    empty: "We're building new ways to support Family & Friends. Browse all tools to see what's ready now."
  },
  environment: {
    title: "Physical Environment",
    short: "Environment",
    description: "Design supportive spaces, tidy routines, and home projects with clarity.",
    link: "products.html?area=environment",
    cta: "Design your ideal space",
    empty: "Fresh templates for your environment are on the way. Check out the full library in the meantime."
  },
  spirituality: {
    title: "Spirituality & Community",
    short: "Spirituality",
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

  const defaultState = {
    title: details.dataset.defaultTitle || "Explore the Life Harmony Wheel",
    description: details.dataset.defaultDescription || "",
    link: details.dataset.defaultLink || "products.html",
    cta: details.dataset.defaultCta || "Browse all Life Harmony tools"
  };

  const render = (state, isActive = false) => {
    const { title, description, link, cta } = state;
    details.innerHTML = `
      <h3>${title}</h3>
      <p>${description}</p>
      <a class="life-wheel__cta" href="${link}">${cta}</a>
    `;
    details.classList.toggle("is-active", isActive);
  };

  let activeSlice = null;
  let resetTimer = null;

  const setActive = slice => {
    const area = slice.dataset.area;
    const info = App.LIFE_AREAS[area];
    if (!info) return;
    clearTimeout(resetTimer);
    if (activeSlice && activeSlice !== slice) {
      activeSlice.classList.remove("is-active");
    }
    activeSlice = slice;
    slice.classList.add("is-active");
    render(info, true);
  };

  const reset = () => {
    clearTimeout(resetTimer);
    if (activeSlice) {
      activeSlice.classList.remove("is-active");
      activeSlice = null;
    }
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
