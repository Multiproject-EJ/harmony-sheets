const App = (() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const setYear = () => { const y = new Date().getFullYear(); $$("#year").forEach(el => el.textContent = y); };
  const applyThemeSwitcher = () => {
    $$(".style-switch button").forEach(btn => {
      btn.onclick = () => {
        document.body.className = btn.dataset.theme;
        $$(".style-switch button").forEach(b => b.classList.toggle("active", b===btn));
      };
    });
  };

  const card = p => `
    <a class="card" href="product.html?id=${encodeURIComponent(p.id)}">
      <img src="${p.image}" alt="${p.name}">
      <div class="content">
        <h3>${p.name}</h3>
        <p class="tagline">${p.tagline}</p>
        <p class="price">${p.price}</p>
      </div>
    </a>`;

  async function loadProducts(){
    const res = await fetch('products.json'); return res.json();
  }

  async function initHome(){
    setYear(); applyThemeSwitcher();
    const data = await loadProducts();
    const popular = data.filter(p => p.featured).slice(0,6);
    $("#popular-grid").innerHTML = popular.map(card).join("");
  }

  async function initProducts(){
    setYear(); applyThemeSwitcher();
    const data = await loadProducts();
    const grid = $("#products-grid");
    const controls = { q: $("#q"), category: $("#category"), style: $("#style") };
    const render = () => {
      const q = (controls.q.value||"").toLowerCase();
      const cat = controls.category.value;
      const style = controls.style.value;
      const filtered = data.filter(p =>
        (!cat || p.category===cat) &&
        (!style || p.style===style) &&
        (!q || (p.name+p.tagline+p.keywords.join(" ")).toLowerCase().includes(q))
      );
      grid.innerHTML = filtered.map(card).join("") || "<p>No results.</p>";
    };
    Object.values(controls).forEach(el => el.addEventListener('input', render));
    render();
  }

  async function initProduct(){
    setYear(); applyThemeSwitcher();
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const data = await loadProducts();
    const p = data.find(x => x.id===id) || data[0];

    document.title = `${p.name} — Harmony Sheets`;
    $("#p-title").textContent = document.title;
    $("#p-name").textContent = p.name;
    $("#p-tagline").textContent = p.tagline;
    $("#p-price").textContent = p.price;
    $("#p-image").src = p.image;
    $("#p-buy").href = p.etsy_url;
    $("#p-description").innerHTML = p.description_html;
    $("#p-features").innerHTML = p.features.map(f => `<li>${f}</li>`).join("");
  }

  function initStatic(){ setYear(); applyThemeSwitcher(); }

  return { initHome, initProducts, initProduct, initStatic };
})();
