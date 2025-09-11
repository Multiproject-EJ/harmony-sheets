const App = {};

/*****************************************************
 * Product page logic
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
    const nameEl = document.getElementById("p-name");
    if (nameEl) nameEl.textContent = product.name;
    const titleEl = document.getElementById("p-title");
    if (titleEl) titleEl.textContent = product.name;
    const stickyName = document.getElementById("p-sticky-name");
    if (stickyName) stickyName.textContent = product.name;

    // Tagline
    const taglineEl = document.getElementById("p-tagline");
    if (taglineEl && product.tagline) taglineEl.textContent = product.tagline;

    // Badges
    const badgeBox = document.getElementById("p-badges");
    if (badgeBox && product.badges) {
      badgeBox.innerHTML = product.badges
        .map(b => `<span class="badge">${b}</span>`)
        .join("");
    }

    // Price
    const priceEl = document.getElementById("p-price");
    if (priceEl && product.price) priceEl.textContent = product.price;

    // Features
    const featBox = document.getElementById("p-features");
    if (featBox && product.features) {
      featBox.innerHTML = product.features.map(f => `<li>${f}</li>`).join("");
    }

    // Description
    const descEl = document.getElementById("p-description");
    if (descEl && product.description) descEl.innerHTML = product.description;

    // Social proof
    const social = document.getElementById("p-social");
    if (social && product.socialProof) {
      social.innerHTML = `
        <div class="social-proof">
          <div class="stars">${product.socialProof.stars || ""}</div>
          <div class="muted">${product.socialProof.quote || ""}</div>
        </div>
      `;
    }

    // Benefits
    const benefits = document.getElementById("p-benefits");
    if (benefits && product.benefits) {
      benefits.innerHTML = `
        <div class="features-grid">
          ${product.benefits
            .map(
              b => `
            <div class="feature-card">
              <h4>${b.title}</h4>
              <p>${b.desc}</p>
            </div>`
            )
            .join("")}
        </div>
      `;
    }

    // Color variations
    if (product.colorImage) {
      const img = document.getElementById("p-color-image");
      if (img) img.src = product.colorImage;
      const caption = document.getElementById("p-color-caption");
      if (caption) caption.textContent = product.colorCaption || "";
    } else {
      const section = document.getElementById("p-colors");
      if (section) section.style.display = "none";
    }

    // Demo video
    const demoBox = document.getElementById("p-demo");
    if (demoBox && product.demoVideo) {
      demoBox.innerHTML = `
        <video controls muted playsinline width="100%" height="100%" ${
          product.demoPoster ? `poster="${product.demoPoster}"` : ""
        }>
          <source src="${product.demoVideo}" type="video/mp4">
        </video>
      `;
    } else {
      const section = document.getElementById("p-demo-section");
      if (section) section.style.display = "none";
    }

    // Included
    const incl = document.getElementById("p-included");
    if (incl && product.included) {
      incl.innerHTML = `
        <h3>What you get</h3>
        <ul>${product.included.map(i => `<li>${i}</li>`).join("")}</ul>
      `;
    }

    // FAQs
    const faqs = document.getElementById("p-faqs");
    if (faqs && product.faqs) {
      faqs.innerHTML = `
        <h3>FAQs</h3>
        ${product.faqs
          .map(
            f => `
          <details class="faq">
            <summary>${f.q}</summary>
            <p>${f.a}</p>
          </details>`
          )
          .join("")}
      `;
    }

    // Pricing
    const pt = document.getElementById("p-pricing-title");
    if (pt && product.pricingTitle) pt.textContent = product.pricingTitle;
    const ps = document.getElementById("p-pricing-sub");
    if (ps && product.pricingSub) ps.textContent = product.pricingSub;

    // Links
    ["p-stripe", "p-stripe-2", "p-stripe-sticky"].forEach(id => {
      const el = document.getElementById(id);
      if (el && product.stripe) el.href = product.stripe;
    });
    ["p-etsy", "p-etsy-2", "p-etsy-sticky"].forEach(id => {
      const el = document.getElementById(id);
      if (el && product.etsy) el.href = product.etsy;
    });

    // Suggestion form product_id
    const pid = document.getElementById("product_id");
    if (pid) pid.value = product.id;
  } catch (err) {
    console.error("Error loading product:", err);
  }
};

/*****************************************************
 * Products listing page logic (if needed)
 *****************************************************/
App.initProducts = async function() {
  const container = document.getElementById("products-list");
  if (!container) return;

  try {
    const res = await fetch("products.json");
    const products = await res.json();

    container.innerHTML = products
      .map(
        p => `
      <div class="product-card">
        <a href="product.html?id=${p.id}">
          <div class="thumb"><img src="${p.colorImage || "assets/placeholder.png"}" alt=""></div>
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
