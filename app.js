/*****************************************************
 * Harmony Sheets — App.js v2.0
 *****************************************************/

const App = {};

/*****************************************************
 * Utils
 *****************************************************/
App.qs = sel => document.querySelector(sel);
App.qsa = sel => Array.from(document.querySelectorAll(sel));

/*****************************************************
 * Init
 *****************************************************/
App.init = function() {
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

  // Init suggest form everywhere
  App.initSuggestForm();
};

/*****************************************************
 * Products listing (products.html)
 *****************************************************/
App.initProducts = async function() {
  const container = App.qs("#products-list");
  if (!container) return;

  try {
    const res = await fetch("products.json");
    const products = await res.json();

    container.innerHTML = products
      .map(
        p => `
        <div class="product-card">
          <a href="product.html?id=${p.id}">
            <div class="thumb">
              <img src="${p.colorImage || "assets/placeholder.png"}" alt="">
            </div>
            <h3>${p.name}</h3>
            <p class="muted">${p.tagline || ""}</p>
            <p class="price">${p.price || ""}</p>
          </a>
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error("Error loading products:", err);
  }
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
