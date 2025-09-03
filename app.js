const App = (() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const setYear = () => $$("#year").forEach(el => el.textContent = new Date().getFullYear());

  const SUPPORT_ENDPOINT = "https://script.google.com/macros/s/PASTE_YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE/exec"; // replace after you deploy

  const catToClass = c => ({
    finance: "cat-finance",
    productivity: "cat-productivity",
    health: "cat-health",
    food: "cat-food",
    creative: "cat-creative",
    planning: "cat-planning"
  }[c] || "");

  const card = p => `
    <a class="card ${catToClass(p.category)}" href="product.html?id=${encodeURIComponent(p.id)}">
      <img src="${p.images?.[0] || p.image}" alt="${p.name}">
      <div class="content">
        <h3>${p.name}</h3>
        <p class="tagline">${p.tagline}</p>
        <p class="price">${p.price}</p>
      </div>
    </a>`;

  async function loadProducts(){ const r = await fetch('products.json'); return r.json(); }
  async function loadBundles(){ const r = await fetch('bundles.json'); return r.json(); }

  // HOME
  async function initHome(){
    setYear();
    const data = await loadProducts();
    const best = data.filter(p => p.featured).slice(0,6);
    $("#home-grid").innerHTML = best.map(card).join("");
  }

  // PRODUCTS
  async function initProducts(){
    setYear();
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat') || "";
    if (cat) document.body.classList.add(catToClass(cat));
    const data = await loadProducts();
    const grid = $("#products-grid");
    const q = $("#q"), style = $("#style");
    const render = () => {
      const query = (q.value||"").toLowerCase();
      const filtered = data.filter(p =>
        (!cat || p.category===cat) &&
        (!style.value || p.style===style.value) &&
        (!query || (p.name + " " + p.tagline + " " + (p.keywords||[]).join(" ")).toLowerCase().includes(query))
      );
      grid.innerHTML = filtered.map(card).join("") || "<p>No results.</p>";
    };
    q.addEventListener('input', render);
    style.addEventListener('change', render);
    render();
  }

  // PRODUCT
  async function initProduct(){
    setYear();
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const products = await loadProducts();
    const p = products.find(x => x.id===id) || products[0];
    document.body.classList.add(catToClass(p.category));

    // hero
    document.title = `${p.name} — Harmony Sheets`;
    $("#p-name").textContent = p.name;
    $("#p-tagline").textContent = p.tagline;
    $("#p-price").textContent = p.price;
    $("#p-etsy").href = p.etsy_url;
    if (p.stripe_link) $("#p-stripe").href = p.stripe_link; else $("#p-stripe").style.display="none";
    $("#p-features").innerHTML = (p.features||[]).map(f => `<li>${f}</li>`).join("");
    $("#p-description").innerHTML = p.description_html || "";

    // slider
    const slider = $("#p-slider");
    const slides = (p.images?.length ? p.images : [p.image]).map(src => `<div class="slide"><img src="${src}" alt=""></div>`);
    slider.insertAdjacentHTML('afterbegin', slides.join(""));
    let idx = 0; const show = i => {
      $$(".slide").forEach((s,j)=> s.classList.toggle('active', j===i));
    };
    show(0);
    slider.querySelector('.prev').onclick = () => { idx = (idx-1 + slides.length)%slides.length; show(idx); };
    slider.querySelector('.next').onclick = () => { idx = (idx+1)%slides.length; show(idx); };

    // video
    if (p.youtube_id){
      $("#p-video").innerHTML = `<iframe src="https://www.youtube.com/embed/${p.youtube_id}" allowfullscreen title="How to use ${p.name}"></iframe>`;
    }

    // reviews
    const revWrap = $("#p-reviews");
    if (p.reviews?.length){
      revWrap.innerHTML = p.reviews.map(r => `
        <div class="review">
          <div class="stars">★★★★★</div>
          <p>${r.text}</p>
          <p class="muted">— ${r.author}</p>
        </div>`).join("");
    } else {
      revWrap.innerHTML = `<p class="muted">Reviews coming soon.</p>`;
    }

    // suggestion form
    $("#product_id").value = p.id;
    const form = $("#suggest-form"), status = $("#suggest-status");
    form?.addEventListener('submit', async (e) => {
      e.preventDefault(); status.textContent = "Sending…";
      const fd = new FormData(form);
      try{
        const res = await fetch(SUPPORT_ENDPOINT, { method:'POST', body:fd, mode:'cors' });
        const ok = res.ok;
        status.textContent = ok ? "Thanks! We got it." : "Hmm, couldn’t send. Try email via FAQ.";
        if (ok) form.reset();
      }catch(err){ status.textContent = "Network error — try again later."; }
    });
  }

  // BUNDLES
  async function initBundles(){
    setYear();
    const bundles = await loadBundles();
    const grid = $("#bundles-grid");
    grid.innerHTML = bundles.map(b => `
      <div class="card ${catToClass(b.category)}">
        <img src="${b.image}" alt="${b.name}">
        <div class="content">
          <h3>${b.name}</h3>
          <p class="tagline">${b.tagline}</p>
          <p class="price">${b.price} <span class="muted">(${b.savings} off)</span></p>
          <a class="btn primary" href="${b.stripe_link}" target="_blank" rel="noopener">Buy Bundle</a>
        </div>
      </div>`).join("");
  }

  // FAQ
  function initFAQ(){
    setYear();
    const form = $("#support-form"), status = $("#support-status");
    form?.addEventListener('submit', async (e)=>{
      e.preventDefault(); status.textContent = "Sending…";
      const fd = new FormData(form);
      fd.append('type','Support');
      try{
        const res = await fetch(SUPPORT_ENDPOINT, { method:'POST', body:fd, mode:'cors' });
        status.textContent = res.ok ? "Thanks! We’ll get back to you." : "Couldn’t send — try again.";
        if (res.ok) form.reset();
      }catch(err){ status.textContent = "Network error — try again later."; }
    });
  }

  function initStatic(){ setYear(); }

  return { initHome, initProducts, initProduct, initBundles, initFAQ, initStatic };
})();
