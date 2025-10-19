import { isSupabaseConfigured } from "./supabase-config.js";
import { ACCOUNT_PAGE_PATH, ADMIN_DASHBOARD_PATH, isAdminUser } from "./auth-helpers.js";
import { getSupabaseClient } from "./supabase-client.js";

const ADMIN_PAGE_REGEX = /\/admin_dashboard\.html$/i;
const isAdminPage = ADMIN_PAGE_REGEX.test(location.pathname);

const rootHook =
  isAdminPage &&
  (document.querySelector("[data-admin-dashboard-content]") ||
    document.querySelector("[data-admin-dashboard-loading]") ||
    document.querySelector("[data-admin-dashboard-unauthorized]"));

if (!rootHook) {
  // Not the admin page (or admin DOM missing): make this module a no-op.
  // No listeners, no redirects, no imports.
  // eslint-disable-next-line no-useless-return
  (function noop() {
    return;
  })();
} else {
  const PAGE_PATH = ADMIN_DASHBOARD_PATH || "admin_dashboard.html";

  const sections = {
    loading: document.querySelector("[data-admin-dashboard-loading]"),
    unauthorized: document.querySelector("[data-admin-dashboard-unauthorized]"),
    content: document.querySelector("[data-admin-dashboard-content]")
  };

  const messageEl = document.querySelector("[data-admin-dashboard-message]");
  const contentSection = sections.content;

  const supabaseTestEls = {
    card: document.querySelector("[data-supabase-card]"),
    indicator: document.querySelector("[data-supabase-indicator]"),
    status: document.querySelector("[data-supabase-status]"),
    metrics: document.querySelector("[data-supabase-metrics]"),
    products: document.querySelector("[data-supabase-products]"),
    latest: document.querySelector("[data-supabase-latest]"),
    local: document.querySelector("[data-supabase-local]"),
    updated: document.querySelector("[data-supabase-updated]"),
    updatedTime: document.querySelector("[data-supabase-updated-time]"),
    button: document.querySelector("[data-supabase-test]"),
    buttonLabel: document.querySelector("[data-supabase-test-label]"),
    saveButton: document.querySelector("[data-supabase-save]"),
    saveButtonLabel: document.querySelector("[data-supabase-save-label]")
  };

  const supabaseTestDefaults = {
    label:
      supabaseTestEls.buttonLabel?.textContent?.trim() ||
      supabaseTestEls.button?.textContent?.trim() ||
      "Run test"
  };

  const supabaseSaveDefaults = {
    label:
      supabaseTestEls.saveButtonLabel?.textContent?.trim() ||
      supabaseTestEls.saveButton?.textContent?.trim() ||
      "Save to Supabase"
  };

  const supabaseMetricsState = {
    count: null,
    latest: null,
    localCount: null
  };

  let supabaseClient = null;
  let authSubscription = null;
  let editorLoaded = false;
  let supabaseTesterReady = false;
  let supabaseTestPromise = null;
  let supabaseSavePromise = null;
  let supabaseSaverReady = false;
  let editorModule = null;
  let catalogSnapshot = null;
  let catalogUnsubscribe = null;
  let relativeTimeSupported =
    typeof Intl !== "undefined" && typeof Intl.RelativeTimeFormat === "function";
  let redirecting = false;

  function updateSupabaseStatus(message, tone = "neutral") {
    if (supabaseTestEls.status) {
      supabaseTestEls.status.textContent = message;
    }
    if (supabaseTestEls.indicator) {
      supabaseTestEls.indicator.dataset.tone = tone;
    }
  }

  function setSupabaseButtonState({ disabled, label } = {}) {
    const { button, buttonLabel } = supabaseTestEls;
    if (!button) return;

    if (typeof disabled === "boolean") {
      button.disabled = disabled;
      if (disabled) {
        button.setAttribute("aria-disabled", "true");
      } else {
        button.removeAttribute("aria-disabled");
      }
    }

    if (typeof label === "string") {
      if (buttonLabel) {
        buttonLabel.textContent = label;
      } else {
        button.textContent = label;
      }
    }
  }

  function setSupabaseSaveButtonState({ disabled, label } = {}) {
    const { saveButton, saveButtonLabel } = supabaseTestEls;
    if (!saveButton) return;

    if (typeof disabled === "boolean") {
      saveButton.disabled = disabled;
      if (disabled) {
        saveButton.setAttribute("aria-disabled", "true");
      } else {
        saveButton.removeAttribute("aria-disabled");
      }
    }

    if (typeof label === "string") {
      if (saveButtonLabel) {
        saveButtonLabel.textContent = label;
      } else {
        saveButton.textContent = label;
      }
    }
  }

  function setSupabaseMetrics(updates = {}) {
    const hasCount = Object.prototype.hasOwnProperty.call(updates, "count");
    const hasLatest = Object.prototype.hasOwnProperty.call(updates, "latest");
    const hasLocalCount = Object.prototype.hasOwnProperty.call(updates, "localCount");

    if (hasCount) {
      const value = updates.count;
      supabaseMetricsState.count =
        typeof value === "number" && Number.isFinite(value) ? value : null;

      if (supabaseTestEls.products) {
        supabaseTestEls.products.textContent =
          typeof supabaseMetricsState.count === "number"
            ? supabaseMetricsState.count.toLocaleString()
            : "—";
      }
    }

    if (hasLatest) {
      const value = updates.latest;
      supabaseMetricsState.latest =
        typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

      if (supabaseTestEls.latest) {
        supabaseTestEls.latest.textContent = supabaseMetricsState.latest || "—";
      }
    }

    if (hasLocalCount) {
      const value = updates.localCount;
      if (typeof value === "number" && Number.isFinite(value)) {
        supabaseMetricsState.localCount = value;
      } else if (typeof value === "string" && value.trim().length > 0) {
        supabaseMetricsState.localCount = value.trim();
      } else {
        supabaseMetricsState.localCount = null;
      }

      if (supabaseTestEls.local) {
        if (typeof supabaseMetricsState.localCount === "number") {
          supabaseTestEls.local.textContent = supabaseMetricsState.localCount.toLocaleString();
        } else if (typeof supabaseMetricsState.localCount === "string") {
          supabaseTestEls.local.textContent = supabaseMetricsState.localCount;
        } else {
          supabaseTestEls.local.textContent = "—";
        }
      }
    }

    if (supabaseTestEls.metrics && (hasCount || hasLatest || hasLocalCount)) {
      const hasData =
        typeof supabaseMetricsState.count === "number" ||
        typeof supabaseMetricsState.localCount === "number" ||
        (typeof supabaseMetricsState.localCount === "string" &&
          supabaseMetricsState.localCount.trim().length > 0) ||
        (typeof supabaseMetricsState.latest === "string" &&
          supabaseMetricsState.latest.trim().length > 0);
      supabaseTestEls.metrics.hidden = !hasData;
    }
  }

  function formatTimestamp(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return null;
    }
    const display = date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });
    return {
      date,
      display,
      iso: date.toISOString()
    };
  }

  function formatRelativeTime(date) {
    if (!relativeTimeSupported) return null;
    try {
      const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
      const divisions = [
        { amount: 60, unit: "second" },
        { amount: 60, unit: "minute" },
        { amount: 24, unit: "hour" },
        { amount: 7, unit: "day" },
        { amount: 4.34524, unit: "week" },
        { amount: 12, unit: "month" },
        { amount: Infinity, unit: "year" }
      ];

      let duration = (date.getTime() - Date.now()) / 1000;
      for (const division of divisions) {
        if (Math.abs(duration) < division.amount) {
          return formatter.format(Math.round(duration), division.unit);
        }
        duration /= division.amount;
      }
    } catch (error) {
      console.warn("[admin] Relative time formatting not supported", error);
      relativeTimeSupported = false;
    }
    return null;
  }

  function describeLatestChange(record) {
    if (!record) return null;
    const name = record.name || record.slug || record.id || "Product";
    const timestampValue = record.updated_at || record.created_at;
    const formatted = formatTimestamp(timestampValue);
    const changeType =
      record.updated_at && record.created_at && record.updated_at !== record.created_at
        ? "Updated"
        : "Created";

    if (formatted) {
      const relative = formatRelativeTime(formatted.date);
      const parts = [formatted.display];
      if (relative) {
        parts.push(`(${relative})`);
      }
      return `${name} — ${changeType} ${parts.join(" ")}`.trim();
    }

    return `${name} — ${changeType}`;
  }

  function setSupabaseUpdated(timestamp) {
    const { updated, updatedTime } = supabaseTestEls;
    if (!updated || !updatedTime) return;

    if (!timestamp) {
      updated.hidden = true;
      updatedTime.textContent = "";
      updatedTime.removeAttribute("datetime");
      return;
    }

    const formatted = formatTimestamp(timestamp);
    if (!formatted) {
      updated.hidden = true;
      updatedTime.textContent = "";
      updatedTime.removeAttribute("datetime");
      return;
    }

    updated.hidden = false;
    updatedTime.textContent = formatted.display;
    updatedTime.setAttribute("datetime", formatted.iso);
  }

  async function fetchLocalCatalogCount() {
    if (editorModule && typeof editorModule.getCatalogSnapshot === "function") {
      try {
        const snapshot = editorModule.getCatalogSnapshot();
        if (Array.isArray(snapshot)) {
          return snapshot.length;
        }
      } catch (error) {
        console.warn("[admin] Failed to read catalog snapshot", error);
      }
    }

    if (Array.isArray(catalogSnapshot)) {
      return catalogSnapshot.length;
    }

    try {
      const response = await fetch("products.json", { cache: "no-store" });
      if (!response.ok) return null;
      const data = await response.json();
      return Array.isArray(data) ? data.length : null;
    } catch (error) {
      console.warn("[admin] Failed to inspect local catalog", error);
      return null;
    }
  }

  function cloneCatalog(products) {
    if (!Array.isArray(products)) return null;
    try {
      return JSON.parse(JSON.stringify(products));
    } catch (error) {
      console.warn("[admin] Failed to clone catalog snapshot", error);
      return products.slice();
    }
  }

  function refreshSaveButtonState() {
    if (!supabaseTestEls.saveButton) return;
    if (supabaseSavePromise) return;
    const hasClient = Boolean(supabaseClient);
    const hasCatalog = Array.isArray(catalogSnapshot);
    setSupabaseSaveButtonState({
      disabled: !(hasClient && hasCatalog),
      label: supabaseSaveDefaults.label
    });
  }

  function updateCatalogSnapshot(products) {
    catalogSnapshot = cloneCatalog(products);
    if (Array.isArray(catalogSnapshot)) {
      setSupabaseMetrics({ localCount: catalogSnapshot.length });
    } else {
      setSupabaseMetrics({ localCount: null });
    }

    if (!supabaseSavePromise) {
      refreshSaveButtonState();
    }
  }

  function initializeCatalogSync() {
    if (!editorModule) return;

    if (typeof editorModule.getCatalogSnapshot === "function") {
      try {
        const snapshot = editorModule.getCatalogSnapshot();
        if (Array.isArray(snapshot)) {
          updateCatalogSnapshot(snapshot);
        }
      } catch (error) {
        console.warn("[admin] Failed to load catalog snapshot", error);
      }
    }

    if (typeof editorModule.subscribeToCatalog === "function" && !catalogUnsubscribe) {
      try {
        const unsubscribe = editorModule.subscribeToCatalog(({ products }) => {
          if (Array.isArray(products)) {
            updateCatalogSnapshot(products);
          } else {
            catalogSnapshot = null;
            setSupabaseMetrics({ localCount: null });
            if (!supabaseSavePromise) {
              refreshSaveButtonState();
            }
          }
        });
        if (typeof unsubscribe === "function") {
          catalogUnsubscribe = unsubscribe;
        }
      } catch (error) {
        console.warn("[admin] Failed to subscribe to catalog updates", error);
      }
    }
  }

  function initializeSupabaseSaver() {
    if (supabaseSaverReady) return;
    if (!supabaseTestEls.saveButton) return;

    supabaseTestEls.saveButton.addEventListener("click", () => {
      saveCatalogToSupabase();
    });

    supabaseSaverReady = true;
    refreshSaveButtonState();
  }

  async function fetchSupabaseOverview() {
    if (!supabaseClient) {
      throw new Error("Supabase client is not ready.");
    }

    const query = supabaseClient
      .from("products")
      .select("id, name, updated_at, created_at", { count: "exact" })
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1);

    const { data, error, count } = await query;
    if (error) {
      throw error;
    }

    const latest = Array.isArray(data) && data.length ? data[0] : null;
    return {
      count: typeof count === "number" ? count : null,
      latest
    };
  }

  function formatError(error) {
    if (!error) return "Unknown error.";
    if (typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }
    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }
    try {
      return JSON.stringify(error);
    } catch (jsonError) {
      console.warn("[admin] Failed to serialise error", jsonError);
      return "Unknown error.";
    }
  }

  function cleanText(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
    if (typeof value !== "string") {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  function cleanIdentifier(value) {
    const text = cleanText(value);
    return text ? text : null;
  }

  function extractPriceDetails(product) {
    let amount = null;
    let currency = null;
    let display = null;

    if (!product || typeof product !== "object") {
      return { amount: 0, currency: "USD", display: "$0" };
    }

    if (typeof product.priceAmount === "number" && Number.isFinite(product.priceAmount)) {
      amount = Math.round(product.priceAmount * 100) / 100;
    }

    if (typeof product.priceCurrency === "string" && product.priceCurrency.trim()) {
      currency = product.priceCurrency.trim().toUpperCase();
    }

    if (typeof product.priceDisplay === "string" && product.priceDisplay.trim()) {
      display = product.priceDisplay.trim();
    }

    if (typeof product.price === "number" && Number.isFinite(product.price)) {
      amount = Math.round(product.price * 100) / 100;
      if (!display) {
        display = `$${amount}`;
      }
    } else if (typeof product.price === "string" && product.price.trim()) {
      const trimmed = product.price.trim();
      if (!display) {
        display = trimmed;
      }

      const normalized = trimmed.replace(/,/g, ".");
      const match = normalized.match(/-?\d+(?:\.\d+)?/);
      if (match) {
        const parsed = Number.parseFloat(match[0]);
        if (Number.isFinite(parsed)) {
          amount = Math.round(parsed * 100) / 100;
        }
      }

      if (!currency) {
        const upper = trimmed.toUpperCase();
        if (upper.includes("EUR") || trimmed.startsWith("€")) {
          currency = "EUR";
        } else if (upper.includes("GBP") || trimmed.startsWith("£")) {
          currency = "GBP";
        } else if (upper.includes("USD") || trimmed.startsWith("$")) {
          currency = "USD";
        }
      }
    }

    if (amount == null || !Number.isFinite(amount)) {
      amount = 0;
    }
    if (!currency) {
      currency = "USD";
    }
    if (!display) {
      display = `$${amount}`;
    }

    return { amount, currency, display };
  }

  function buildBaseProductRow(product) {
    const slug = cleanIdentifier(product?.id) || cleanIdentifier(product?.slug);
    if (!slug) {
      throw new Error("A product is missing its ID/slug.");
    }

    const price = extractPriceDetails(product);
    const name = cleanText(product?.name) || slug;

    return {
      slug,
      name,
      tagline: cleanText(product?.tagline),
      description: cleanText(product?.description),
      price_amount: price.amount,
      price_currency: price.currency,
      price_display: price.display,
      draft: Boolean(product?.draft),
      hero_image: cleanText(product?.heroImage || product?.hero_image),
      color_image: cleanText(product?.colorImage || product?.color_image),
      color_caption: cleanText(product?.colorCaption || product?.color_caption),
      demo_video: cleanText(product?.demoVideo || product?.demo_video),
      demo_poster: cleanText(product?.demoPoster || product?.demo_poster),
      virtual_demo: cleanText(product?.virtualDemo || product?.virtual_demo),
      pricing_title: cleanText(product?.pricingTitle || product?.pricing_title),
      pricing_sub: cleanText(product?.pricingSub || product?.pricing_sub),
      stripe_url: cleanText(product?.stripe || product?.stripe_url),
      etsy_url: cleanText(product?.etsy || product?.etsy_url),
      updated_at: new Date().toISOString()
    };
  }

  function buildRelatedRows(products, slugToId) {
    const lifeAreas = [];
    const badges = [];
    const features = [];
    const included = [];
    const gallery = [];
    const faqs = [];
    const benefits = [];
    const socialProof = [];

    products.forEach((product) => {
      const slug = cleanIdentifier(product?.id) || cleanIdentifier(product?.slug);
      if (!slug) return;
      const productId = slugToId.get(slug);
      if (!productId) return;

      (Array.isArray(product?.lifeAreas) ? product.lifeAreas : []).forEach((area, index) => {
        const value = cleanText(area);
        if (value) {
          lifeAreas.push({ product_id: productId, life_area: value, position: index + 1 });
        }
      });

      (Array.isArray(product?.badges) ? product.badges : []).forEach((badge, index) => {
        const value = cleanText(badge);
        if (value) {
          badges.push({ product_id: productId, badge: value, position: index + 1 });
        }
      });

      (Array.isArray(product?.features) ? product.features : []).forEach((feature, index) => {
        const value = cleanText(feature);
        if (value) {
          features.push({ product_id: productId, feature: value, position: index + 1 });
        }
      });

      (Array.isArray(product?.included) ? product.included : []).forEach((item, index) => {
        const value = cleanText(item);
        if (value) {
          included.push({ product_id: productId, included_item: value, position: index + 1 });
        }
      });

      (Array.isArray(product?.gallery) ? product.gallery : []).forEach((entry, index) => {
        if (!entry || typeof entry !== "object") return;
        const src = cleanText(entry.src);
        const alt = cleanText(entry.alt);
        if (src) {
          gallery.push({
            product_id: productId,
            image_src: src,
            image_alt: alt,
            position: index + 1
          });
        }
      });

      (Array.isArray(product?.faqs) ? product.faqs : []).forEach((entry, index) => {
        if (!entry || typeof entry !== "object") return;
        const question = cleanText(entry.q ?? entry.question);
        const answer = cleanText(entry.a ?? entry.answer);
        if (question && answer) {
          faqs.push({
            product_id: productId,
            question,
            answer,
            position: index + 1
          });
        }
      });

      (Array.isArray(product?.benefits) ? product.benefits : []).forEach((entry, index) => {
        if (!entry || typeof entry !== "object") return;
        const title = cleanText(entry.title);
        const description = cleanText(entry.desc ?? entry.description);
        if (title && description) {
          benefits.push({
            product_id: productId,
            title,
            description,
            position: index + 1
          });
        }
      });

      const social = product?.socialProof || product?.social_proof;
      if (social && typeof social === "object") {
        const stars = cleanText(social.stars);
        const quote = cleanText(social.quote);
        if (stars || quote) {
          socialProof.push({
            product_id: productId,
            stars: stars || null,
            quote: quote || null
          });
        }
      }
    });

    return { lifeAreas, badges, features, included, gallery, faqs, benefits, socialProof };
  }

  async function clearRelatedTables(productIds) {
    if (!Array.isArray(productIds) || !productIds.length) return;

    const tables = [
      { name: "product_life_areas", label: "life areas" },
      { name: "product_badges", label: "labels" },
      { name: "product_features", label: "features" },
      { name: "product_included_items", label: "included items" },
      { name: "product_gallery", label: "gallery images" },
      { name: "product_faqs", label: "FAQs" },
      { name: "product_benefits", label: "benefits" },
      { name: "product_social_proof", label: "social proof" }
    ];

    for (const table of tables) {
      const { error } = await supabaseClient
        .from(table.name)
        .delete()
        .in("product_id", productIds);
      if (error) {
        throw new Error(`Failed to reset ${table.label}: ${formatError(error)}`);
      }
    }
  }

  async function insertRows(table, rows, label) {
    if (!Array.isArray(rows) || !rows.length) return;
    const { error } = await supabaseClient.from(table).insert(rows);
    if (error) {
      throw new Error(`Failed to insert ${label}: ${formatError(error)}`);
    }
  }

  async function syncCatalogWithSupabase(products) {
    if (!Array.isArray(products)) {
      throw new Error("No catalog data is available to save.");
    }

    const baseRecords = products.map((product) => buildBaseProductRow(product));

    const seenSlugs = new Set();
    for (const record of baseRecords) {
      if (seenSlugs.has(record.slug)) {
        throw new Error(`Duplicate product ID detected: "${record.slug}".`);
      }
      seenSlugs.add(record.slug);
    }

    if (!baseRecords.length) {
      const { data: existing, error: fetchError } = await supabaseClient
        .from("products")
        .select("id");
      if (fetchError) {
        throw new Error(`Failed to inspect Supabase products: ${formatError(fetchError)}`);
      }
      const ids = (existing || []).map((row) => row.id).filter(Boolean);
      if (ids.length) {
        const { error: deleteError } = await supabaseClient.from("products").delete().in("id", ids);
        if (deleteError) {
          throw new Error(`Failed to clear Supabase products: ${formatError(deleteError)}`);
        }
      }
      return { saved: 0 };
    }

    const { error: upsertError } = await supabaseClient
      .from("products")
      .upsert(baseRecords, { onConflict: "slug" });
    if (upsertError) {
      throw new Error(`Failed to upsert products: ${formatError(upsertError)}`);
    }

    const localSlugs = baseRecords.map((record) => record.slug);
    const { data: idRows, error: idError } = await supabaseClient
      .from("products")
      .select("id, slug")
      .in("slug", localSlugs);
    if (idError) {
      throw new Error(`Failed to confirm product IDs: ${formatError(idError)}`);
    }

    const slugToId = new Map();
    (idRows || []).forEach((row) => {
      if (row && row.slug && row.id) {
        slugToId.set(row.slug, row.id);
      }
    });

    for (const slug of localSlugs) {
      if (!slugToId.has(slug)) {
        throw new Error(`Supabase did not return an ID for product "${slug}".`);
      }
    }

    const productIds = Array.from(slugToId.values());

    const { data: remoteRows, error: remoteError } = await supabaseClient
      .from("products")
      .select("id, slug");
    if (remoteError) {
      throw new Error(`Failed to inspect Supabase products: ${formatError(remoteError)}`);
    }

    const localSlugSet = new Set(localSlugs);
    const staleIds = (remoteRows || [])
      .filter((row) => row && row.slug && !localSlugSet.has(row.slug))
      .map((row) => row.id)
      .filter(Boolean);
    if (staleIds.length) {
      const { error: deleteStaleError } = await supabaseClient
        .from("products")
        .delete()
        .in("id", staleIds);
      if (deleteStaleError) {
        throw new Error(`Failed to remove stale products: ${formatError(deleteStaleError)}`);
      }
    }

    await clearRelatedTables(productIds);

    const relatedRows = buildRelatedRows(products, slugToId);

    await insertRows("product_life_areas", relatedRows.lifeAreas, "life areas");
    await insertRows("product_badges", relatedRows.badges, "labels");
    await insertRows("product_features", relatedRows.features, "features");
    await insertRows("product_included_items", relatedRows.included, "included items");
    await insertRows("product_gallery", relatedRows.gallery, "gallery images");
    await insertRows("product_faqs", relatedRows.faqs, "FAQs");
    await insertRows("product_benefits", relatedRows.benefits, "benefits");
    await insertRows("product_social_proof", relatedRows.socialProof, "social proof");

    return { saved: baseRecords.length };
  }

  function saveCatalogToSupabase() {
    if (!rootHook) {
      return Promise.resolve();
    }
    if (!supabaseClient) {
      updateSupabaseStatus(
        "Supabase client is not ready. Refresh the page and sign in again.",
        "danger"
      );
      refreshSaveButtonState();
      return Promise.resolve();
    }
    if (supabaseSavePromise) {
      return supabaseSavePromise;
    }
    if (!Array.isArray(catalogSnapshot)) {
      updateSupabaseStatus(
        "Local catalog is still loading. Try again once your products appear.",
        "info"
      );
      refreshSaveButtonState();
      return Promise.resolve();
    }

    supabaseSavePromise = (async () => {
      let snapshot = catalogSnapshot;
      if (editorModule && typeof editorModule.getCatalogSnapshot === "function") {
        try {
          const latest = editorModule.getCatalogSnapshot();
          if (Array.isArray(latest)) {
            snapshot = latest;
          }
        } catch (error) {
          console.warn("[admin] Failed to read catalog snapshot before saving", error);
        }
      }

      const productCount = Array.isArray(snapshot) ? snapshot.length : 0;

      updateSupabaseStatus(
        `Saving ${productCount} product${productCount === 1 ? "" : "s"} to Supabase…`,
        "info"
      );
      setSupabaseButtonState({ disabled: true });
      setSupabaseSaveButtonState({ disabled: true, label: "Saving…" });

      try {
        await syncCatalogWithSupabase(Array.isArray(snapshot) ? snapshot : []);
        setSupabaseUpdated(new Date());
        updateSupabaseStatus("Supabase updated. Verifying sync…", "success");
        await runSupabaseTest({ initial: true, source: "save-to-supabase" });
      } catch (error) {
        console.error("[admin] Supabase save failed", error);
        updateSupabaseStatus(`Supabase save failed: ${formatError(error)}`, "danger");
        setSupabaseUpdated(new Date());
      } finally {
        supabaseSavePromise = null;
        setSupabaseSaveButtonState({ disabled: false, label: supabaseSaveDefaults.label });
        setSupabaseButtonState({ disabled: false, label: supabaseTestDefaults.label });
        refreshSaveButtonState();
      }
    })();

    return supabaseSavePromise;
  }

  function runSupabaseTest(options = {}) {
    if (!rootHook) {
      return Promise.resolve();
    }

    const { initial = false, source = "manual", token = null } = options;

    if (!supabaseClient) {
      if (source === "product-save" && token) {
        window.dispatchEvent(
          new CustomEvent("admin:supabase-check", {
            detail: {
              status: "error",
              message: "Supabase client is not ready.",
              source,
              token
            }
          })
        );
      }
      return Promise.resolve();
    }

    if (supabaseTestPromise) {
      return supabaseTestPromise.then(
        () => runSupabaseTest(options),
        () => runSupabaseTest(options)
      );
    }

    const loadingLabel = initial ? "Checking…" : "Testing…";
    const loadingMessage = initial
      ? "Checking Supabase for recent product updates…"
      : "Testing Supabase connection…";

    supabaseTestPromise = (async () => {
      updateSupabaseStatus(loadingMessage, "info");
      setSupabaseButtonState({ disabled: true, label: loadingLabel });

      try {
        const localCountPromise = fetchLocalCatalogCount();
        const overview = await fetchSupabaseOverview();
        const localCount = await localCountPromise;

        const latestDescription =
          describeLatestChange(overview.latest) ||
          (typeof overview.count === "number" && overview.count === 0
            ? "No product records found."
            : "No change details available.");

        const matchesLocal =
          typeof overview.count === "number" &&
          typeof localCount === "number" &&
          overview.count === localCount;

        setSupabaseMetrics({
          count: overview.count,
          latest: latestDescription,
          localCount: localCount ?? "Unavailable"
        });

        let statusMessage = "Supabase connection verified.";
        if (typeof overview.count === "number") {
          if (overview.count === 0) {
            statusMessage = "Supabase connection verified. No products are stored in Supabase.";
          } else if (overview.count === 1) {
            statusMessage = "Supabase connection verified. 1 product found.";
          } else {
            statusMessage = `Supabase connection verified. ${overview.count} products found.`;
          }
        }

        if (typeof overview.count === "number" && typeof localCount === "number") {
          if (matchesLocal) {
            statusMessage += ` Product count matches the local catalog (${localCount}).`;
          } else {
            const difference = overview.count - localCount;
            const diffWord = difference > 0 ? "more" : "fewer";
            const diffAbsolute = Math.abs(difference);
            statusMessage += ` Supabase has ${diffAbsolute} ${diffWord} product${
              diffAbsolute === 1 ? "" : "s"
            } than the local catalog (${localCount}).`;
          }
        } else if (typeof localCount === "number") {
          statusMessage += ` Local catalog contains ${localCount} product${
            localCount === 1 ? "" : "s"
          }.`;
        } else if (localCount == null) {
          statusMessage += " Local catalog could not be loaded.";
        }

        updateSupabaseStatus(statusMessage, "success");
        setSupabaseUpdated(new Date());

        window.dispatchEvent(
          new CustomEvent("admin:supabase-check", {
            detail: {
              status: "success",
              message: statusMessage,
              source,
              token,
              count: typeof overview.count === "number" ? overview.count : null,
              localCount: typeof localCount === "number" ? localCount : null,
              matchesLocal,
              latest: latestDescription
            }
          })
        );
      } catch (error) {
        console.error("[admin] Supabase test failed", error);
        const formattedError = formatError(error);
        updateSupabaseStatus(`Supabase test failed: ${formattedError}`, "danger");
        setSupabaseMetrics({ count: null, latest: null });
        setSupabaseUpdated(new Date());

        window.dispatchEvent(
          new CustomEvent("admin:supabase-check", {
            detail: {
              status: "error",
              message: formattedError,
              source,
              token
            }
          })
        );
      } finally {
        setSupabaseButtonState({ disabled: false, label: supabaseTestDefaults.label });
      }
    })();

    return supabaseTestPromise.finally(() => {
      supabaseTestPromise = null;
    });
  }

  function initializeSupabaseTester() {
    if (supabaseTesterReady) return;
    if (!supabaseTestEls.button) return;

    supabaseTestEls.button.addEventListener("click", () => {
      runSupabaseTest({ source: "manual" });
    });

    supabaseTesterReady = true;
    setSupabaseButtonState({ disabled: false, label: supabaseTestDefaults.label });
  }

  window.addEventListener("admin:product-saved", (event) => {
    const detail = event?.detail || {};
    runSupabaseTest({ source: "product-save", token: detail.token || null });
  });

  function showSection(target) {
    Object.entries(sections).forEach(([key, element]) => {
      if (!element) return;
      element.hidden = key !== target;
    });
  }

  function setUnauthorizedMessage(message) {
    if (messageEl && message) {
      messageEl.textContent = message;
    }
  }

  function redirectTo(target) {
    if (!target || redirecting) return;
    const to = String(target);
    const resolvedTarget = new URL(to, window.location.href).href;
    if (resolvedTarget === window.location.href) {
      return;
    }
    redirecting = true;
    window.setTimeout(() => {
      window.location.replace(resolvedTarget);
      redirecting = false;
    }, 0);
  }

  function handleUnauthorized(message, redirectTarget) {
    if (message) {
      setUnauthorizedMessage(message);
    }
    showSection("unauthorized");
    if (redirectTarget) {
      redirectTo(redirectTarget);
    }
  }

  async function loadEditorModule() {
    if (editorLoaded && editorModule) {
      return editorModule;
    }
    try {
      editorModule = await import("./editor.js");
      editorLoaded = true;
      initializeCatalogSync();
      refreshSaveButtonState();
      return editorModule;
    } catch (error) {
      console.error("[admin] Failed to load editor module", error);
      setUnauthorizedMessage("The admin workspace failed to load. Please refresh the page and try again.");
      showSection("unauthorized");
      return null;
    }
  }

  function enableContent() {
    if (contentSection) {
      contentSection.hidden = false;
    }
    showSection("content");
  }

  function requireAdmin(user) {
    if (!user) {
      const redirectUrl = `login.html?redirect=${encodeURIComponent(PAGE_PATH)}`;
      handleUnauthorized("You need to sign in with an admin account to manage Harmony Sheets products.", redirectUrl);
      return false;
    }

    if (!isAdminUser(user)) {
      handleUnauthorized("This dashboard is restricted to Harmony Sheets admins.", ACCOUNT_PAGE_PATH);
      return false;
    }

    enableContent();
    return true;
  }

  async function initialize() {
    if (!rootHook) {
      return;
    }
    if (!isSupabaseConfigured()) {
      handleUnauthorized(
        "Supabase credentials are missing. Update supabase-config.js to enable admin access."
      );
      return;
    }

    supabaseClient = getSupabaseClient();
    refreshSaveButtonState();

    try {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) throw error;
      const sessionUser = data?.session?.user || null;
      if (requireAdmin(sessionUser)) {
        initializeSupabaseTester();
        initializeSupabaseSaver();
        await loadEditorModule();
        await runSupabaseTest({ initial: true, source: "initial" });
      }
    } catch (error) {
      console.error("[admin] Failed to verify session", error);
      setUnauthorizedMessage("We couldn't verify your admin access. Please try signing in again.");
      showSection("unauthorized");
    }

    if (authSubscription?.subscription?.unsubscribe) {
      authSubscription.subscription.unsubscribe();
    }

    const { data: listener } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user || null;
      if (!requireAdmin(user)) {
        return;
      }
      initializeSupabaseTester();
      initializeSupabaseSaver();
      await loadEditorModule();
      await runSupabaseTest({ initial: true, source: "initial" });
    });
    authSubscription = listener;
  }

  if (rootHook) {
    initialize();

    window.addEventListener("beforeunload", () => {
      if (authSubscription && typeof authSubscription.subscription?.unsubscribe === "function") {
        authSubscription.subscription.unsubscribe();
      }
      if (typeof catalogUnsubscribe === "function") {
        try {
          catalogUnsubscribe();
        } catch (error) {
          console.warn("[admin] Failed to remove catalog subscription", error);
        }
        catalogUnsubscribe = null;
      }
    });
  }

}
