import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";

const STORAGE_KEY = "harmony-sheets-bundles-v1";

const state = {
  bundles: [],
  baseline: [],
  selectedSlug: null,
  sortKey: "name",
  sortDir: "asc",
  filter: "all"
};

const REVIEW_CATEGORIES = [
  { key: "marketing", label: "Marketing" },
  { key: "optimization", label: "Optimization" },
  { key: "safeLegal", label: "SAFE & Legal" },
  { key: "identity", label: "Identity" }
];

const STATUS_LABELS = {
  1: "Ready",
  2: "In progress",
  3: "Needs attention"
};

const STATUS_TONES = {
  1: "success",
  2: "warning",
  3: "danger"
};

let baselineSourceLabel = "Supabase dataset";

const subscribers = new Set();

const els = {
  status: document.querySelector("[data-bundles-status]"),
  statusIndicator: document.querySelector("[data-bundles-status-indicator]"),
  workspaceLabel: document.querySelector("[data-bundles-workspace-label]"),
  tableBody: document.querySelector("[data-bundles-table]"),
  tableMeta: document.querySelector("[data-bundles-meta]"),
  tableContainer: document.querySelector("[data-bundles-table-container]"),
  search: document.querySelector("[data-bundles-search]"),
  filter: document.querySelector("[data-bundles-filter]"),
  addButton: document.querySelector("[data-add-bundle]"),
  fetchButton: document.querySelector("[data-bundles-fetch]"),
  fetchButtonLabel: document.querySelector("[data-bundles-fetch-label]"),
  exportButton: document.querySelector("[data-bundles-export]"),
  resetButton: document.querySelector("[data-bundles-reset]"),
  form: document.querySelector("[data-bundle-form]"),
  formTitle: document.querySelector("[data-bundle-form-title]"),
  formMode: document.querySelector("[data-bundle-form-mode]"),
  formPlaceholder: document.querySelector("[data-bundle-editor-empty]"),
  deleteButton: document.querySelector("[data-bundle-delete]"),
  cancelButton: document.querySelector("[data-bundle-cancel]"),
  saveButton: document.querySelector("[data-bundle-save]"),
  formFeedback: document.querySelector("[data-bundle-form-feedback]"),
  modal: document.querySelector("[data-bundle-modal]"),
  modalDialog: document.querySelector("[data-bundle-modal-dialog]"),
  modalDismissTriggers: document.querySelectorAll("[data-bundle-modal-dismiss]"),
  productOptions: document.querySelector("[data-bundle-product-options]")
};

const fetchSupabaseDefaults = {
  label:
    els.fetchButtonLabel?.textContent?.trim() ||
    els.fetchButton?.textContent?.trim() ||
    "Fetch Supabase bundles"
};

const formFields = {
  slug: els.form?.elements.namedItem("slug"),
  name: els.form?.elements.namedItem("name"),
  tagline: els.form?.elements.namedItem("tagline"),
  navTagline: els.form?.elements.namedItem("navTagline"),
  navCta: els.form?.elements.namedItem("navCta"),
  badge: els.form?.elements.namedItem("badge"),
  price: els.form?.elements.namedItem("price"),
  savings: els.form?.elements.namedItem("savings"),
  category: els.form?.elements.namedItem("category"),
  color: els.form?.elements.namedItem("color"),
  navColor: els.form?.elements.namedItem("navColor"),
  cta: els.form?.elements.namedItem("cta"),
  page: els.form?.elements.namedItem("page"),
  stripe: els.form?.elements.namedItem("stripe"),
  products: els.form?.elements.namedItem("products"),
  includes: els.form?.elements.namedItem("includes"),
  draft: els.form?.elements.namedItem("draft"),
  navFeatured: els.form?.elements.namedItem("navFeatured")
};

let lastFocusedTrigger = null;
let productSuggestions = [];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value) {
  return escapeAttribute(value);
}

function formatError(error) {
  if (!error) return "Unknown error.";
  if (error instanceof Error) {
    return error.message || error.toString();
  }
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }
  try {
    return JSON.stringify(error);
  } catch (jsonError) {
    console.warn("[bundles] Failed to serialise error", jsonError);
    return "Unknown error.";
  }
}

function coerceText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function coerceNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function getPosition(entry) {
  if (!entry || typeof entry !== "object") return Number.MAX_SAFE_INTEGER;
  const position = coerceNumber(entry.position);
  return position == null ? Number.MAX_SAFE_INTEGER : position;
}

function sortByPosition(list) {
  return toArray(list)
    .slice()
    .sort((a, b) => getPosition(a) - getPosition(b));
}

function parseStatusScore(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && [1, 2, 3].includes(parsed) ? parsed : null;
}

function normalizeStatusTask(task) {
  if (!task) return null;
  if (typeof task === "string") {
    const text = task.trim();
    return text ? { title: text, status: null, detail: "" } : null;
  }
  if (typeof task !== "object") return null;
  const titleSource =
    typeof task.title === "string"
      ? task.title
      : typeof task.name === "string"
      ? task.name
      : "";
  const title = titleSource.trim();
  if (!title) return null;
  const status = parseStatusScore(task.status ?? task.score ?? task.level ?? task.state);
  const detailSource =
    typeof task.detail === "string"
      ? task.detail
      : typeof task.note === "string"
      ? task.note
      : typeof task.description === "string"
      ? task.description
      : "";
  const detail = detailSource.trim();
  return { title, status, detail };
}

function pickStatusEntry(source, key) {
  if (!source || typeof source !== "object") return null;
  const variants = new Set([key]);
  const snake = key.replace(/([A-Z])/g, "_$1").toLowerCase();
  const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase();
  variants.add(snake);
  variants.add(kebab);
  if (key === "safeLegal") {
    variants.add("safeandlegal");
    variants.add("safe_legal");
    variants.add("safe-legal");
  }
  for (const variant of variants) {
    if (Object.prototype.hasOwnProperty.call(source, variant)) {
      return source[variant];
    }
  }
  return null;
}

function normalizeStatusEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return {
      score: parseStatusScore(entry),
      tasks: [],
      note: ""
    };
  }

  const score = parseStatusScore(entry.score ?? entry.status ?? entry.level ?? entry.value);
  const tasks = Array.isArray(entry.tasks)
    ? entry.tasks.map((task) => normalizeStatusTask(task)).filter(Boolean)
    : [];
  const noteSource =
    typeof entry.note === "string"
      ? entry.note
      : typeof entry.summary === "string"
      ? entry.summary
      : typeof entry.description === "string"
      ? entry.description
      : "";
  const note = noteSource.trim();
  return { score, tasks, note };
}

function normalizeReviewStatus(rawStatus) {
  const source = rawStatus && typeof rawStatus === "object" ? rawStatus : {};
  const normalized = {};
  REVIEW_CATEGORIES.forEach(({ key }) => {
    const entry = pickStatusEntry(source, key);
    normalized[key] = normalizeStatusEntry(entry);
  });
  return normalized;
}

function getReviewEntry(bundle, key) {
  if (!bundle || typeof bundle !== "object") {
    return { score: null, tasks: [], note: "" };
  }
  const review = bundle.reviewStatus;
  const entry = review && typeof review === "object" ? review[key] : null;
  if (!entry || typeof entry !== "object") {
    return { score: null, tasks: [], note: "" };
  }
  const score = parseStatusScore(entry.score);
  const tasks = Array.isArray(entry.tasks) ? entry.tasks.slice() : [];
  const note = typeof entry.note === "string" ? entry.note : "";
  return { score, tasks, note };
}

function getStatusLabel(score) {
  return STATUS_LABELS[score] || "Not set";
}

function getStatusTone(score) {
  return STATUS_TONES[score] || "neutral";
}

function encodeStatusPayload(payload) {
  try {
    return encodeURIComponent(JSON.stringify(payload));
  } catch (error) {
    console.warn("[bundles] Failed to encode status payload", error);
    return "";
  }
}

function getSupabaseRestUrl(path) {
  if (typeof SUPABASE_URL !== "string") return null;
  const base = SUPABASE_URL.replace(/\/+$/, "");
  const cleaned = typeof path === "string" ? path.replace(/^\/+/, "") : "";
  return `${base}/${cleaned}`;
}

function getSupabaseHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    Accept: "application/json",
    "Content-Type": "application/json"
  };
}

function buildPriceDisplay(row) {
  const explicit = coerceText(row?.price_display);
  if (explicit) return explicit;

  const amount = coerceNumber(row?.price_amount);
  if (amount == null) return "";

  const currency = coerceText(row?.price_currency) || "USD";
  if (typeof Intl !== "undefined" && typeof Intl.NumberFormat === "function") {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
    } catch (error) {
      // Ignore formatter failures and fall back to a basic display.
    }
  }

  return `$${amount.toFixed(2)}`;
}

function normalizeSupabaseBundleRow(row) {
  if (!row || typeof row !== "object") return null;

  const slug = coerceText(row.slug) || coerceText(row.id);
  const priceAmount = coerceNumber(row.price_amount);
  const priceCurrency = coerceText(row.price_currency) || "USD";

  const includes = sortByPosition(row.bundle_includes)
    .map((item) => coerceText(item?.item))
    .filter(Boolean);

  const products = sortByPosition(row.bundle_products)
    .map((item) => coerceText(item?.product_slug ?? item?.productSlug))
    .filter(Boolean);

  const bundle = {
    slug: slug || undefined,
    name: coerceText(row.name) || slug || "",
    badge: coerceText(row.badge),
    tagline: coerceText(row.tagline),
    navTagline: coerceText(row.nav_tagline),
    navCta: coerceText(row.nav_cta),
    price: buildPriceDisplay(row),
    savings: coerceText(row.savings_display),
    category: coerceText(row.category),
    color: coerceText(row.color_hex),
    navColor: coerceText(row.nav_color_hex),
    cta: coerceText(row.cta_label),
    page: coerceText(row.page_url),
    stripe: coerceText(row.stripe_url),
    includes,
    products,
    navFeatured: row.nav_featured,
    draft: row.draft
  };

  if (priceAmount != null) {
    bundle.priceAmount = priceAmount;
  }
  if (priceCurrency) {
    bundle.priceCurrency = priceCurrency;
  }

  return normalizeBundle(bundle);
}

async function fetchSupabaseBundles() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const base = getSupabaseRestUrl("rest/v1/bundles");
  if (!base) {
    return null;
  }

  const select = [
    "id",
    "slug",
    "name",
    "badge",
    "tagline",
    "nav_tagline",
    "nav_cta",
    "price_amount",
    "price_currency",
    "price_display",
    "savings_display",
    "category",
    "color_hex",
    "nav_color_hex",
    "cta_label",
    "page_url",
    "stripe_url",
    "draft",
    "nav_featured",
    "bundle_includes(*)",
    "bundle_products(*)"
  ].join(",");

  const endpoint = `${base}?select=${encodeURIComponent(select)}&order=created_at.asc`;

  const response = await fetch(endpoint, {
    headers: getSupabaseHeaders(),
    mode: "cors",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Supabase responded with ${response.status}`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => normalizeSupabaseBundleRow(row)).filter(Boolean);
}

function normalizeFlag(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    return ["true", "1", "yes", "y", "draft", "inactive", "featured"].includes(normalized);
  }
  if (value == null) return false;
  return Boolean(value);
}

function normalizeBundle(bundle) {
  if (!bundle || typeof bundle !== "object") return bundle;
  const normalized = { ...bundle };
  const slug =
    typeof normalized.slug === "string" && normalized.slug.trim()
      ? normalized.slug.trim()
      : typeof normalized.id === "string" && normalized.id.trim()
      ? normalized.id.trim()
      : null;
  if (slug) {
    normalized.slug = slug;
  }
  if (Object.prototype.hasOwnProperty.call(normalized, "draft")) {
    normalized.draft = normalizeFlag(normalized.draft);
  } else {
    normalized.draft = false;
  }
  if (Object.prototype.hasOwnProperty.call(normalized, "navFeatured")) {
    normalized.navFeatured = normalizeFlag(normalized.navFeatured);
  } else if (Object.prototype.hasOwnProperty.call(normalized, "featured")) {
    normalized.navFeatured = normalizeFlag(normalized.featured);
    delete normalized.featured;
  } else {
    normalized.navFeatured = false;
  }
  if (!Array.isArray(normalized.includes)) {
    normalized.includes = [];
  }
  if (!Array.isArray(normalized.products)) {
    const raw = normalized.productIds || normalized.product_slugs || normalized.product_ids;
    if (Array.isArray(raw)) {
      normalized.products = raw.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim());
    } else if (typeof raw === "string") {
      normalized.products = raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    } else {
      normalized.products = [];
    }
  }
  if (!Array.isArray(normalized.includes)) {
    normalized.includes = [];
  }
  const reviewSource =
    (normalized.reviewStatus && typeof normalized.reviewStatus === "object"
      ? normalized.reviewStatus
      : null) ||
    (normalized.review && typeof normalized.review === "object" ? normalized.review : null) ||
    {};
  normalized.reviewStatus = normalizeReviewStatus(reviewSource);
  return normalized;
}

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.warn("[bundles] Failed to parse stored bundles", error);
    return null;
  }
}

function loadFromStorage() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored ? safeParse(stored) : null;
}

function persist({ message = "All bundle changes saved locally.", tone = "success" } = {}) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bundles));
  } catch (error) {
    console.warn("[bundles] Failed to persist bundles", error);
  }
  setWorkspaceSource("Local workspace");
  setStatus(message, tone);
}

function clearStorage() {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("[bundles] Failed to clear bundle storage", error);
  }
}

function setWorkspaceSource(label) {
  if (!els.workspaceLabel) return;
  const text = typeof label === "string" && label.trim() ? label.trim() : "Bundle workspace";
  if (els.workspaceLabel.textContent !== text) {
    els.workspaceLabel.textContent = text;
  }
}

function setStatus(message, tone = "neutral") {
  if (!els.status || !els.statusIndicator) return;
  els.status.textContent = message;
  els.statusIndicator.dataset.tone = tone;
}

function setFetchButtonState({ disabled, label } = {}) {
  if (!els.fetchButton) return;

  if (typeof disabled === "boolean") {
    els.fetchButton.disabled = disabled;
    if (disabled) {
      els.fetchButton.setAttribute("aria-disabled", "true");
    } else {
      els.fetchButton.removeAttribute("aria-disabled");
    }
  }

  if (typeof label === "string") {
    if (els.fetchButtonLabel) {
      els.fetchButtonLabel.textContent = label;
    } else {
      els.fetchButton.textContent = label;
    }
  }
}

function refreshFetchButtonAvailability() {
  if (!els.fetchButton) return;
  const supabaseReady = isSupabaseConfigured();
  setFetchButtonState({
    disabled: !supabaseReady,
    label: fetchSupabaseDefaults.label
  });
}

function setFormFeedback(message, tone = "info") {
  if (!els.formFeedback) return;
  if (!message) {
    els.formFeedback.hidden = true;
    els.formFeedback.textContent = "";
    delete els.formFeedback.dataset.tone;
    return;
  }
  els.formFeedback.hidden = false;
  els.formFeedback.textContent = message;
  els.formFeedback.dataset.tone = tone;
}

function formatPrice(value) {
  if (!value) return "—";
  return value;
}

function priceValue(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const match = value.match(/\d+(?:\.\d+)?/);
    if (match) return Number(match[0]);
  }
  return 0;
}

function getFilteredBundles() {
  const search = (els.search?.value || "").trim().toLowerCase();
  const filter = state.filter;
  const bundles = state.bundles.slice();

  const filtered = bundles.filter((bundle) => {
    const matchesSearch = (() => {
      if (!search) return true;
      const haystack = [bundle.name, bundle.tagline, bundle.badge, ...(bundle.includes || []), ...(bundle.products || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    })();

    if (!matchesSearch) return false;

    switch (filter) {
      case "active":
        return !bundle.draft;
      case "draft":
        return Boolean(bundle.draft);
      case "nav":
        return Boolean(bundle.navFeatured);
      default:
        return true;
    }
  });

  const direction = state.sortDir === "asc" ? 1 : -1;
  const sortKey = state.sortKey;

  filtered.sort((a, b) => {
    switch (sortKey) {
      case "products": {
        const aCount = Array.isArray(a.products) ? a.products.length : 0;
        const bCount = Array.isArray(b.products) ? b.products.length : 0;
        if (aCount === bCount) {
          return a.name.localeCompare(b.name) * direction;
        }
        return (aCount - bCount) * direction;
      }
      case "price": {
        const diff = priceValue(a.price) - priceValue(b.price);
        if (diff === 0) return a.name.localeCompare(b.name) * direction;
        return diff * direction;
      }
      case "featured": {
        if (a.navFeatured === b.navFeatured) {
          return a.name.localeCompare(b.name) * direction;
        }
        return (a.navFeatured ? 1 : 0 - (b.navFeatured ? 1 : 0)) * direction;
      }
      case "name":
      default:
        return a.name.localeCompare(b.name) * direction;
    }
  });

  return filtered;
}

function updateTableMeta(count) {
  if (!els.tableMeta) return;
  els.tableMeta.textContent = `${count} bundle${count === 1 ? "" : "s"}`;
}

function renderEmptyTable(message) {
  if (!els.tableBody) return;
  els.tableBody.innerHTML = `<tr><td colspan="9" class="admin-table__empty">${message}</td></tr>`;
  updateTableMeta(0);
}

function renderReviewStatusCell(bundle, category) {
  const entry = getReviewEntry(bundle, category.key);
  const bundleName = bundle.name || bundle.slug || "Untitled bundle";
  const score = entry.score;
  const tone = getStatusTone(score);
  const classes = ["admin-status-pill", `admin-status-pill--${tone}`];
  if (score == null) {
    classes.push("admin-status-pill--empty");
  } else {
    classes.push(`admin-status-pill--score-${score}`);
  }
  const label = getStatusLabel(score);
  const displayValue = score == null ? "Set" : String(score);
  const payload = {
    entityType: "bundle",
    entityId: bundle.slug || null,
    entityName: bundleName,
    categoryKey: category.key,
    categoryLabel: category.label,
    score,
    statusLabel: label,
    tone,
    note: entry.note || "",
    tasks: Array.isArray(entry.tasks) ? entry.tasks : []
  };
  const encoded = encodeStatusPayload(payload);
  const ariaLabel =
    score == null
      ? `${category.label} status for ${bundleName} not set`
      : `${category.label} status for ${bundleName}: level ${score} — ${label}`;
  return `
        <td data-label="${category.label}">
          <button type="button" class="${classes.join(" ")}" data-status-trigger data-status-entity="bundle" data-status-payload="${escapeAttribute(encoded)}" aria-label="${escapeAttribute(ariaLabel)}">
            <span class="admin-status-pill__value">${escapeHtml(displayValue)}</span>
            <span class="admin-status-pill__label">${escapeHtml(label)}</span>
          </button>
        </td>
  `;
}

function renderTable() {
  if (!els.tableBody) return;
  const bundles = getFilteredBundles();
  if (!bundles.length) {
    renderEmptyTable("No bundles match your filters.");
    return;
  }

  const rows = bundles
    .map((bundle) => {
      const slug = bundle.slug || "";
      const isSelected = state.selectedSlug === slug;
      const productList = Array.isArray(bundle.products) ? bundle.products.filter(Boolean) : [];
      const productLabel = productList.length ? productList.join(", ") : "—";
      const includesCount = Array.isArray(bundle.includes) ? bundle.includes.length : 0;
      const bundleLabel = includesCount ? `${productLabel} (${includesCount} items)` : productLabel;
      const featured = bundle.navFeatured ? "Featured" : "—";
      const draftToggleId = `bundle-draft-${slug || Math.random().toString(36).slice(2)}`;
      const statusCells = REVIEW_CATEGORIES.map((category) =>
        renderReviewStatusCell(bundle, category)
      ).join("");

      return `
        <tr data-row data-id="${slug}">
          <th scope="row">
            <button class="admin-table__select${isSelected ? " is-selected" : ""}" type="button" data-select-bundle data-id="${slug}">
              <span class="admin-table__title">${bundle.name || slug || "Untitled bundle"}</span>
              ${bundle.tagline ? `<span class="admin-table__subtitle">${bundle.tagline}</span>` : ""}
            </button>
          </th>
          <td data-label="Products">${bundleLabel || "—"}</td>
          <td class="admin-table__price" data-label="Price">${formatPrice(bundle.price)}</td>
          <td class="admin-table__status" data-label="Draft">
            <label class="admin-toggle" for="${draftToggleId}">
              <input id="${draftToggleId}" type="checkbox" data-bundle-draft data-id="${slug}" ${bundle.draft ? "checked" : ""}>
              <span class="sr-only">Mark bundle as draft</span>
              <span aria-hidden="true"></span>
            </label>
          </td>
          <td data-label="Menu">${featured}</td>
          ${statusCells}
        </tr>
      `;
    })
    .join("");

  els.tableBody.innerHTML = rows;
  updateTableMeta(bundles.length);
}

function openModal() {
  if (!els.modal) return;
  if (!els.modal.hidden) return;
  lastFocusedTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  els.modal.hidden = false;
  requestAnimationFrame(() => {
    els.modal?.classList.add("is-open");
    document.body.classList.add("admin-editor-open");
    const focusTarget = els.modalDialog || els.form || els.modal;
    focusTarget?.focus?.();
  });
  document.addEventListener("keydown", handleModalKeydown);
}

function closeModal({ restoreFocus = true } = {}) {
  if (!els.modal) return;
  els.modal.classList.remove("is-open");
  document.body.classList.remove("admin-editor-open");
  document.removeEventListener("keydown", handleModalKeydown);
  els.modal.hidden = true;
  if (restoreFocus && lastFocusedTrigger?.focus) {
    lastFocusedTrigger.focus();
  }
  lastFocusedTrigger = null;
}

function handleModalKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    handleCancel();
  }
  if (event.key !== "Tab") return;
  const focusable = Array.from(
    els.modalDialog?.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    ) || []
  ).filter((element) => {
    if (!(element instanceof HTMLElement)) return false;
    if (element.hasAttribute("disabled")) return false;
    return element.offsetParent !== null || element === els.modalDialog;
  });
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else if (document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function fillForm(bundle) {
  if (!els.form) return;
  if (!bundle) {
    els.form.reset();
    if (formFields.draft) formFields.draft.checked = false;
    if (formFields.navFeatured) formFields.navFeatured.checked = false;
    return;
  }
  formFields.slug.value = bundle.slug || "";
  formFields.name.value = bundle.name || "";
  formFields.tagline.value = bundle.tagline || "";
  formFields.navTagline.value = bundle.navTagline || "";
  formFields.navCta.value = bundle.navCta || bundle.cta || "";
  formFields.badge.value = bundle.badge || "";
  formFields.price.value = bundle.price || "";
  formFields.savings.value = bundle.savings || "";
  formFields.category.value = bundle.category || "";
  formFields.color.value = bundle.color || "";
  formFields.navColor.value = bundle.navColor || "";
  formFields.cta.value = bundle.cta || "";
  formFields.page.value = bundle.page || "";
  formFields.stripe.value = bundle.stripe || bundle.stripe_link || "";
  formFields.products.value = Array.isArray(bundle.products) ? bundle.products.join(", ") : "";
  formFields.includes.value = Array.isArray(bundle.includes) ? bundle.includes.join("\n") : "";
  if (formFields.draft) formFields.draft.checked = Boolean(bundle.draft);
  if (formFields.navFeatured) formFields.navFeatured.checked = Boolean(bundle.navFeatured);
}

function selectBundle(slug, { openEditor = true } = {}) {
  const bundle = state.bundles.find((item) => item.slug === slug) || null;
  state.selectedSlug = bundle?.slug || null;
  if (bundle) {
    if (els.formTitle) {
      els.formTitle.textContent = bundle.name || "Untitled bundle";
    }
    if (els.formMode) {
      els.formMode.textContent = "Editing";
    }
    fillForm(bundle);
    setFormFeedback(null);
    if (els.formPlaceholder) {
      els.formPlaceholder.hidden = true;
    }
    if (els.form) {
      els.form.hidden = false;
    }
    if (openEditor) {
      openModal();
    }
  } else {
    handleAddBundle();
  }
  renderTable();
}

function parseList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLines(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildBundlePayload() {
  return {
    slug: formFields.slug.value.trim(),
    name: formFields.name.value.trim(),
    tagline: formFields.tagline.value.trim(),
    navTagline: formFields.navTagline.value.trim(),
    navCta: formFields.navCta.value.trim(),
    badge: formFields.badge.value.trim(),
    price: formFields.price.value.trim(),
    savings: formFields.savings.value.trim(),
    category: formFields.category.value.trim(),
    color: formFields.color.value.trim(),
    navColor: formFields.navColor.value.trim(),
    cta: formFields.cta.value.trim(),
    page: formFields.page.value.trim(),
    stripe: formFields.stripe.value.trim(),
    products: parseList(formFields.products.value.trim()),
    includes: parseLines(formFields.includes.value.trim()),
    draft: Boolean(formFields.draft?.checked),
    navFeatured: Boolean(formFields.navFeatured?.checked)
  };
}

function handleFormSubmit(event) {
  event.preventDefault();
  const payload = buildBundlePayload();

  if (!payload.slug) {
    setStatus("Bundle slug is required.", "danger");
    setFormFeedback("Bundle slug is required.", "danger");
    formFields.slug.focus();
    return;
  }

  const isNew = !state.bundles.some((bundle) => bundle.slug === state.selectedSlug);
  const slugExists = state.bundles.some((bundle) => bundle.slug === payload.slug && bundle.slug !== state.selectedSlug);

  if (slugExists) {
    setStatus("A bundle with that slug already exists.", "danger");
    setFormFeedback("Choose a unique slug for the bundle.", "danger");
    formFields.slug.focus();
    return;
  }

  if (isNew) {
    const newBundle = normalizeBundle({ ...payload });
    state.bundles.push(newBundle);
    state.selectedSlug = newBundle.slug;
    setFormFeedback("New bundle created locally.", "success");
    setStatus("Bundle saved to your local workspace.", "success");
  } else {
    const target = state.bundles.find((bundle) => bundle.slug === state.selectedSlug);
    if (target) {
      Object.assign(target, normalizeBundle({ ...payload }));
      state.selectedSlug = target.slug;
      setFormFeedback("Bundle updated locally.", "success");
      setStatus("Bundle changes saved locally.", "success");
    }
  }

  persist({ message: null });
  renderTable();
  notifySubscribers("update");
}

function handleDelete() {
  if (!state.selectedSlug) return;
  const index = state.bundles.findIndex((bundle) => bundle.slug === state.selectedSlug);
  if (index === -1) return;
  const [removed] = state.bundles.splice(index, 1);
  state.selectedSlug = null;
  persist({ message: "Bundle removed from local workspace.", tone: "warning" });
  setFormFeedback(`Bundle "${removed?.name || removed?.slug}" deleted locally.`, "warning");
  if (els.form) {
    els.form.reset();
    els.form.hidden = true;
  }
  if (els.formPlaceholder) {
    els.formPlaceholder.hidden = false;
  }
  closeModal();
  renderTable();
  notifySubscribers("delete");
}

function handleCancel() {
  if (els.form) {
    els.form.reset();
    els.form.hidden = true;
  }
  if (formFields.draft) formFields.draft.checked = false;
  if (formFields.navFeatured) formFields.navFeatured.checked = false;
  if (els.formPlaceholder) {
    els.formPlaceholder.hidden = false;
  }
  state.selectedSlug = null;
  setFormFeedback(null);
  renderTable();
  closeModal();
}

function handleAddBundle() {
  state.selectedSlug = null;
  if (els.formPlaceholder) {
    els.formPlaceholder.hidden = true;
  }
  if (els.form) {
    els.form.hidden = false;
    els.form.reset();
  }
  if (formFields.draft) formFields.draft.checked = false;
  if (formFields.navFeatured) formFields.navFeatured.checked = false;
  if (els.formTitle) {
    els.formTitle.textContent = "New bundle";
  }
  if (els.formMode) {
    els.formMode.textContent = "Creating";
  }
  setFormFeedback(null);
  openModal();
  formFields.slug?.focus();
}

function handleExport() {
  const blob = new Blob([JSON.stringify(state.bundles, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `harmony-bundles-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  setStatus("Download started. Import the JSON into Supabase or share it with your team.", "info");
}

function handleFetchSupabaseClick(event) {
  event.preventDefault();
  reloadBundlesFromSupabase().catch(() => {
    // Errors are surfaced via status messaging.
  });
}

function handleReset() {
  state.bundles = clone(state.baseline);
  state.selectedSlug = null;
  clearStorage();
  const label = baselineSourceLabel || "Supabase dataset";
  setWorkspaceSource(label);
  setStatus(`Reverted bundles to ${label}.`, "info");
  setFormFeedback(null);
  if (els.form) {
    els.form.reset();
    els.form.hidden = true;
  }
  if (els.formPlaceholder) {
    els.formPlaceholder.hidden = false;
  }
  renderTable();
  refreshFetchButtonAvailability();
  notifySubscribers("reset");
}

function handleDraftToggle(event) {
  const toggle = event.target;
  if (!(toggle instanceof HTMLInputElement)) return;
  if (!toggle.matches("[data-bundle-draft]")) return;
  const slug = toggle.dataset.id;
  const bundle = state.bundles.find((item) => item.slug === slug);
  if (!bundle) return;
  bundle.draft = Boolean(toggle.checked);
  persist({ message: null });
  notifySubscribers("update");
}

function handleTableClick(event) {
  const button = event.target.closest("[data-select-bundle]");
  if (!button) return;
  const slug = button.dataset.id;
  if (!slug) return;
  selectBundle(slug, { openEditor: true });
}

function handleSort(event) {
  const button = event.target.closest("[data-bundles-sort]");
  if (!button) return;
  const key = button.dataset.bundlesSort;
  if (!key) return;
  if (state.sortKey === key) {
    state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
  } else {
    state.sortKey = key;
    state.sortDir = "asc";
  }
  renderTable();
}

function handleSearch() {
  renderTable();
}

function handleFilterChange() {
  const value = els.filter?.value || "all";
  state.filter = value;
  renderTable();
}

function handleTableKeydown(event) {
  if (!["ArrowUp", "ArrowDown"].includes(event.key)) return;
  const rows = Array.from(els.tableBody?.querySelectorAll("[data-row]") || []);
  if (!rows.length) return;
  event.preventDefault();
  const currentIndex = rows.findIndex((row) => row.dataset.id === state.selectedSlug);
  let nextIndex = currentIndex;
  if (event.key === "ArrowDown") {
    nextIndex = currentIndex === -1 ? 0 : Math.min(rows.length - 1, currentIndex + 1);
  } else if (event.key === "ArrowUp") {
    nextIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
  }
  const nextRow = rows[nextIndex];
  if (!nextRow) return;
  const slug = nextRow.dataset.id;
  if (slug) {
    selectBundle(slug, { openEditor: true });
  }
}

function registerEvents() {
  els.tableBody?.addEventListener("change", handleDraftToggle);
  els.tableBody?.addEventListener("click", handleTableClick);
  document.querySelector("[data-bundles-table-container] thead")?.addEventListener("click", handleSort);
  els.search?.addEventListener("input", handleSearch);
  els.filter?.addEventListener("change", handleFilterChange);
  els.addButton?.addEventListener("click", handleAddBundle);
  els.fetchButton?.addEventListener("click", handleFetchSupabaseClick);
  els.exportButton?.addEventListener("click", handleExport);
  els.resetButton?.addEventListener("click", handleReset);
  els.deleteButton?.addEventListener("click", handleDelete);
  els.cancelButton?.addEventListener("click", handleCancel);
  els.form?.addEventListener("submit", handleFormSubmit);
  els.tableContainer?.addEventListener("keydown", handleTableKeydown);
  els.modalDismissTriggers?.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      handleCancel();
    });
  });
  els.modal?.addEventListener("click", (event) => {
    if (event.target === els.modal) {
      handleCancel();
    }
  });
}

function notifySubscribers(reason = "update") {
  if (!subscribers.size) return;
  const payload = { bundles: clone(state.bundles), reason };
  subscribers.forEach((subscriber) => {
    try {
      subscriber(payload);
    } catch (error) {
      console.error("[bundles] Subscriber failed", error);
    }
  });
}

async function reloadBundlesFromSupabase({ reason = "supabase-fetch" } = {}) {
  if (!isSupabaseConfigured()) {
    setStatus("Supabase is not configured. Update supabase-config.js to sync bundle data.", "danger");
    refreshFetchButtonAvailability();
    return;
  }

  setFetchButtonState({ disabled: true, label: "Fetching…" });
  setStatus("Fetching bundles from Supabase…", "info");

  try {
    const supabaseBundles = await fetchSupabaseBundles();
    const baseline = Array.isArray(supabaseBundles)
      ? supabaseBundles.map((bundle) => normalizeBundle(bundle))
      : [];

    const count = baseline.length;
    const statusMessage = count
      ? `Loaded ${count} bundle${count === 1 ? "" : "s"} from Supabase.`
      : "Supabase bundle catalog is empty.";
    const statusTone = count ? "success" : "warning";

    replaceBundles(baseline, {
      sourceLabel: "Supabase dataset",
      statusMessage,
      statusTone,
      persistLocal: true,
      updateBaseline: true,
      reason
    });
  } catch (error) {
    console.warn("[bundles] Supabase bundles unavailable", error);
    const formatted = formatError(error);
    setStatus(`Supabase fetch failed: ${formatted}`, "danger");
  } finally {
    refreshFetchButtonAvailability();
  }
}

async function loadBundles() {
  const stored = loadFromStorage();
  const supabaseReady = isSupabaseConfigured();

  refreshFetchButtonAvailability();

  if (supabaseReady) {
    setFetchButtonState({ disabled: true, label: "Fetching…" });
  }

  try {
    if (supabaseReady) {
      const supabaseBundles = await fetchSupabaseBundles();
      if (Array.isArray(supabaseBundles)) {
        const baseline = supabaseBundles.map((bundle) => normalizeBundle(bundle));
        state.baseline = clone(baseline);
        baselineSourceLabel = "Supabase dataset";

        if (stored && Array.isArray(stored) && stored.length) {
          state.bundles = stored.map((bundle) => normalizeBundle(bundle));
          setWorkspaceSource("Local workspace");
          setStatus("Loaded bundles from local workspace. Save to Supabase when you're ready.", "info");
        } else {
          state.bundles = clone(state.baseline);
          setWorkspaceSource(baselineSourceLabel);
          const tone = state.bundles.length ? "success" : "info";
          const message = state.bundles.length
            ? "Loaded bundles from Supabase."
            : "Supabase is ready. Add your first bundle to get started.";
          setStatus(message, tone);
        }

        renderTable();
        notifySubscribers("load");
        return;
      }
    }
  } catch (error) {
    console.warn("[bundles] Supabase bundles unavailable", error);
  } finally {
    if (supabaseReady) {
      refreshFetchButtonAvailability();
    }
  }

  if (stored && Array.isArray(stored) && stored.length) {
    const normalized = stored.map((bundle) => normalizeBundle(bundle));
    state.baseline = clone(normalized);
    baselineSourceLabel = "Local workspace";
    state.bundles = clone(state.baseline);
    setWorkspaceSource("Local workspace");
    const tone = supabaseReady ? "warning" : "info";
    const message = supabaseReady
      ? "Supabase unavailable. Loaded bundles from local workspace."
      : "Loaded bundles from local workspace.";
    setStatus(message, tone);
    renderTable();
    notifySubscribers("load");
    refreshFetchButtonAvailability();
    return;
  }

  if (!supabaseReady) {
    setStatus("Supabase is not configured. Update supabase-config.js to sync bundle data.", "danger");
  } else {
    setStatus("Unable to load bundles. Refresh to try again.", "danger");
  }
  renderEmptyTable("Could not load bundles.");
  refreshFetchButtonAvailability();
}

function updateProductOptions() {
  if (!els.productOptions) return;
  if (!Array.isArray(productSuggestions)) {
    els.productOptions.innerHTML = "";
    return;
  }
  const options = productSuggestions
    .filter((product) => product && typeof product === "object")
    .map((product) => {
      const slug = product.slug || product.id || "";
      const name = product.name || slug;
      if (!slug) return "";
      return `<option value="${slug}">${name}</option>`;
    })
    .filter(Boolean)
    .join("");
  els.productOptions.innerHTML = options;
}

export function setAvailableProducts(products) {
  if (!Array.isArray(products)) {
    productSuggestions = [];
  } else {
    productSuggestions = products.map((product) => ({
      slug: product.slug || product.id || "",
      name: product.name || product.title || product.slug || "Product"
    }));
  }
  updateProductOptions();
}

export function getBundlesSnapshot() {
  return clone(state.bundles);
}

export function subscribeToBundles(callback) {
  if (typeof callback !== "function") {
    throw new TypeError("Bundle subscriber must be a function");
  }
  try {
    callback({ bundles: clone(state.bundles), reason: "subscribe" });
  } catch (error) {
    console.error("[bundles] Subscriber failed during initial emit", error);
  }
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

export function replaceBundles(bundles, options = {}) {
  const {
    sourceLabel = "Bundle workspace",
    statusMessage = null,
    statusTone = "success",
    persistLocal = true,
    updateBaseline = false,
    reason = "replace"
  } = options || {};

  const normalized = Array.isArray(bundles) ? bundles.map((bundle) => normalizeBundle(bundle)) : [];
  state.bundles = clone(normalized);
  if (updateBaseline) {
    state.baseline = clone(normalized);
    baselineSourceLabel = sourceLabel || "Bundle workspace";
  }
  state.selectedSlug = null;

  if (persistLocal && typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bundles));
    } catch (error) {
      console.warn("[bundles] Failed to persist bundles", error);
    }
  }

  setWorkspaceSource(sourceLabel);
  if (statusMessage) {
    setStatus(statusMessage, statusTone);
  }

  setFormFeedback(null);
  if (els.form) {
    els.form.reset();
    els.form.hidden = true;
  }
  if (els.formPlaceholder) {
    els.formPlaceholder.hidden = false;
  }
  closeModal({ restoreFocus: false });
  renderTable();
  notifySubscribers(reason);
}

export function setWorkspaceStatus(message, tone = "neutral") {
  setStatus(message, tone);
}

registerEvents();
renderTable();
loadBundles();

