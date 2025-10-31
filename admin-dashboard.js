import { isSupabaseConfigured } from "./supabase-config.js";
import { ACCOUNT_PAGE_PATH, ADMIN_DASHBOARD_PATH, isAdminUser } from "./auth-helpers.js";
import { getSupabaseClient } from "./supabase-client.js";
import { initCollapsiblePipelineTables } from "./pipeline-table.js";

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
    bundles: document.querySelector("[data-supabase-bundles]"),
    latest: document.querySelector("[data-supabase-latest]"),
    local: document.querySelector("[data-supabase-local]"),
    localBundles: document.querySelector("[data-supabase-local-bundles]"),
    updated: document.querySelector("[data-supabase-updated]"),
    updatedTime: document.querySelector("[data-supabase-updated-time]"),
    button: document.querySelector("[data-supabase-test]"),
    buttonLabel: document.querySelector("[data-supabase-test-label]"),
    saveButton: document.querySelector("[data-supabase-save]"),
    saveButtonLabel: document.querySelector("[data-supabase-save-label]")
  };

  const supabaseImportEls = {
    button: document.querySelector("[data-import-supabase]")
  };

  const supabaseDebugEls = {
    openTriggers: Array.from(
      document.querySelectorAll("[data-supabase-debug-open]")
    ),
    modal: document.querySelector("[data-supabase-debug-modal]"),
    dialog: document.querySelector("[data-supabase-debug-dialog]"),
    dismissTriggers: Array.from(
      document.querySelectorAll("[data-supabase-debug-dismiss]")
    ),
    frame: document.querySelector("[data-supabase-debug-frame]")
  };

  const adminSheetLink = document.querySelector("[data-admin-sheet-link]");

  if (adminSheetLink) {
    const metaSheetUrl = document
      .querySelector('meta[name="admin-sheet-url"]')
      ?.getAttribute("content");

    const globalSheetUrl =
      (typeof globalThis === "object" &&
        globalThis &&
        ((globalThis.HarmonySheetsAdmin &&
          globalThis.HarmonySheetsAdmin.sheetUrl) ||
          globalThis.ADMIN_SHEET_URL ||
          (globalThis.HarmonySheets &&
            globalThis.HarmonySheets.adminSheetUrl))) ||
      null;

    const resolvedSheetUrl = [globalSheetUrl, metaSheetUrl]
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .map((value) => value.trim())
      .find((value) => /^https?:\/\//i.test(value));

    if (resolvedSheetUrl) {
      adminSheetLink.href = resolvedSheetUrl;
    } else {
      adminSheetLink.removeAttribute("href");
      adminSheetLink.setAttribute("tabindex", "-1");
      adminSheetLink.setAttribute("aria-disabled", "true");
    }
  }


  initCollapsiblePipelineTables();

  const salesEls = {
    source: document.querySelector("[data-sales-source]"),
    updated: document.querySelector("[data-sales-updated]"),
    revenueMonth: document.querySelector("[data-sales-revenue-month]"),
    revenueMonthChange: document.querySelector("[data-sales-revenue-month-change]"),
    ordersMonth: document.querySelector("[data-sales-orders-month]"),
    ordersMonthChange: document.querySelector("[data-sales-orders-month-change]"),
    revenueDay: document.querySelector("[data-sales-revenue-day]"),
    revenueDayChange: document.querySelector("[data-sales-revenue-day-change]"),
    topProduct: document.querySelector("[data-sales-top-product]"),
    topShare: document.querySelector("[data-sales-top-share]")
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

  const supabaseImportDefaults = {
    label:
      supabaseImportEls.button?.textContent?.trim() || "Fetch last data from Supabase"
  };

  const supabaseMetricsState = {
    products: null,
    bundles: null,
    latest: null,
    localProducts: null,
    localBundles: null
  };

  const salesSnapshot = {
    source: "Stripe Live",
    updated: "2024-03-23T09:45:00-04:00",
    revenueMonth: { current: 18420, previous: 16480 },
    ordersMonth: { current: 312, previous: 284 },
    revenueDay: { current: 620, previous: 680 },
    topProduct: {
      name: "Harmony Life Planner",
      currentShare: 0.27,
      previousShare: 0.21
    }
  };

  const KPI_ASK_BUTTON_SELECTOR = "[data-kpi-ask-button]";
  const kpiModalEls = {
    modal: document.querySelector("[data-kpi-modal]"),
    dialog: document.querySelector("[data-kpi-modal-dialog]"),
    question: document.querySelector("[data-kpi-question-field]"),
    context: document.querySelector("[data-kpi-context-field]"),
    status: document.querySelector("[data-kpi-status]"),
    topic: document.querySelector("[data-kpi-topic]"),
    askButton: document.querySelector("[data-kpi-submit]"),
    dismissTriggers: Array.from(document.querySelectorAll("[data-kpi-modal-dismiss]"))
  };

  let supabaseDebugReady = false;
  let supabaseDebugOpen = false;
  let supabaseDebugLoaded = false;
  let supabaseDebugTrigger = null;
  let kpiModalReady = false;
  let kpiModalOpen = false;
  let activeKpiButton = null;
  let kpiCatalogFallback = null;
  let kpiCatalogPromise = null;

  let supabaseClient = null;
  let authSubscription = null;
  let editorLoaded = false;
  let bundlesEditorLoaded = false;
  let supabaseTesterReady = false;
  let supabaseTestPromise = null;
  let supabaseSavePromise = null;
  let supabaseSaverReady = false;
  let supabaseImportPromise = null;
  let supabaseImporterReady = false;
  let editorModule = null;
  let bundlesModule = null;
  let catalogSnapshot = null;
  let catalogUnsubscribe = null;
  let bundlesSnapshot = null;
  let bundlesUnsubscribe = null;
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

  function setSupabaseImportButtonState({ disabled, label } = {}) {
    const { button } = supabaseImportEls;
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
      button.textContent = label;
    }
  }

  function openSupabaseDebugModal(trigger) {
    const { modal, dialog, frame } = supabaseDebugEls;
    if (!modal || !dialog) return;
    if (supabaseDebugOpen) {
      return;
    }

    supabaseDebugTrigger = trigger || null;
    supabaseDebugOpen = true;

    if (!supabaseDebugLoaded && frame) {
      const dataSrc = frame.dataset?.src || frame.getAttribute("data-src");
      const resolvedSrc =
        typeof dataSrc === "string" && dataSrc.trim().length > 0
          ? dataSrc.trim()
          : "supabase-debug.html";
      frame.src = resolvedSrc;
      supabaseDebugLoaded = true;
    }

    modal.hidden = false;
    modal.classList.add("is-open");

    if (document?.body) {
      document.body.classList.add("admin-editor-open");
    }

    window.requestAnimationFrame(() => {
      dialog.focus();
    });
  }

  function closeSupabaseDebugModal() {
    const { modal } = supabaseDebugEls;
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.hidden = true;
    supabaseDebugOpen = false;

    if (document?.body) {
      const remainingOpenModals = document.querySelectorAll(
        ".admin-editor-modal.is-open"
      );
      if (remainingOpenModals.length === 0) {
        document.body.classList.remove("admin-editor-open");
      }
    }

    const trigger = supabaseDebugTrigger;
    supabaseDebugTrigger = null;
    if (trigger && typeof trigger.focus === "function") {
      trigger.focus();
    }
  }

  function initializeSupabaseDebugModal() {
    if (supabaseDebugReady) {
      return;
    }

    const { modal, dialog, dismissTriggers, openTriggers } = supabaseDebugEls;
    if (!modal || !dialog) {
      return;
    }

    if (Array.isArray(openTriggers) && openTriggers.length > 0) {
      openTriggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
          openSupabaseDebugModal(trigger);
        });
      });
    }

    if (Array.isArray(dismissTriggers) && dismissTriggers.length > 0) {
      dismissTriggers.forEach((element) => {
        element.addEventListener("click", () => {
          closeSupabaseDebugModal();
        });
      });
    }

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeSupabaseDebugModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!supabaseDebugOpen) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeSupabaseDebugModal();
      }
    });

    supabaseDebugReady = true;
  }

  function setSupabaseMetrics(updates = {}) {
    const hasProducts = Object.prototype.hasOwnProperty.call(updates, "products");
    const hasBundles = Object.prototype.hasOwnProperty.call(updates, "bundles");
    const hasLatest = Object.prototype.hasOwnProperty.call(updates, "latest");
    const hasLocalProducts = Object.prototype.hasOwnProperty.call(updates, "localProducts");
    const hasLocalBundles = Object.prototype.hasOwnProperty.call(updates, "localBundles");

    if (hasProducts) {
      const value = updates.products;
      supabaseMetricsState.products =
        typeof value === "number" && Number.isFinite(value) ? value : null;
      if (supabaseTestEls.products) {
        supabaseTestEls.products.textContent =
          typeof supabaseMetricsState.products === "number"
            ? supabaseMetricsState.products.toLocaleString()
            : "—";
      }
    }

    if (hasBundles) {
      const value = updates.bundles;
      supabaseMetricsState.bundles =
        typeof value === "number" && Number.isFinite(value) ? value : null;
      if (supabaseTestEls.bundles) {
        supabaseTestEls.bundles.textContent =
          typeof supabaseMetricsState.bundles === "number"
            ? supabaseMetricsState.bundles.toLocaleString()
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

    if (hasLocalProducts) {
      const value = updates.localProducts;
      if (typeof value === "number" && Number.isFinite(value)) {
        supabaseMetricsState.localProducts = value;
      } else if (typeof value === "string" && value.trim()) {
        supabaseMetricsState.localProducts = value.trim();
      } else {
        supabaseMetricsState.localProducts = null;
      }
      if (supabaseTestEls.local) {
        if (typeof supabaseMetricsState.localProducts === "number") {
          supabaseTestEls.local.textContent = supabaseMetricsState.localProducts.toLocaleString();
        } else if (typeof supabaseMetricsState.localProducts === "string") {
          supabaseTestEls.local.textContent = supabaseMetricsState.localProducts;
        } else {
          supabaseTestEls.local.textContent = "—";
        }
      }
    }

    if (hasLocalBundles) {
      const value = updates.localBundles;
      if (typeof value === "number" && Number.isFinite(value)) {
        supabaseMetricsState.localBundles = value;
      } else if (typeof value === "string" && value.trim()) {
        supabaseMetricsState.localBundles = value.trim();
      } else {
        supabaseMetricsState.localBundles = null;
      }
      if (supabaseTestEls.localBundles) {
        if (typeof supabaseMetricsState.localBundles === "number") {
          supabaseTestEls.localBundles.textContent = supabaseMetricsState.localBundles.toLocaleString();
        } else if (typeof supabaseMetricsState.localBundles === "string") {
          supabaseTestEls.localBundles.textContent = supabaseMetricsState.localBundles;
        } else {
          supabaseTestEls.localBundles.textContent = "—";
        }
      }
    }

    if (supabaseTestEls.metrics && (hasProducts || hasBundles || hasLatest || hasLocalProducts || hasLocalBundles)) {
      const hasData =
        typeof supabaseMetricsState.products === "number" ||
        typeof supabaseMetricsState.bundles === "number" ||
        typeof supabaseMetricsState.localProducts === "number" ||
        typeof supabaseMetricsState.localBundles === "number" ||
        (typeof supabaseMetricsState.localProducts === "string" && supabaseMetricsState.localProducts.trim().length > 0) ||
        (typeof supabaseMetricsState.localBundles === "string" && supabaseMetricsState.localBundles.trim().length > 0) ||
        (typeof supabaseMetricsState.latest === "string" && supabaseMetricsState.latest.trim().length > 0);
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

  function formatNumber(value, options = {}) {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    const { minimumFractionDigits = 0, maximumFractionDigits = 0 } = options;
    try {
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits,
        maximumFractionDigits
      }).format(value);
    } catch (error) {
      console.warn("[admin] Number formatting failed", error);
      try {
        return value.toFixed(Math.min(Math.max(maximumFractionDigits, minimumFractionDigits), 3));
      } catch (fallbackError) {
        console.warn("[admin] Number formatting fallback failed", fallbackError);
      }
    }
    return String(value);
  }

  function formatCurrency(value, options = {}) {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    const fractionDigits = value % 1 === 0 ? 0 : 2;
    const baseOptions = {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      ...options
    };
    try {
      return new Intl.NumberFormat(undefined, baseOptions).format(value);
    } catch (error) {
      console.warn("[admin] Currency formatting failed", error);
      const digits = baseOptions.maximumFractionDigits ?? fractionDigits;
      return `$${value.toFixed(digits)}`;
    }
  }

  function joinWithSuffix(value, suffix) {
    if (!suffix) return value;
    const trimmed = typeof value === "string" ? value.trim() : value;
    if (!trimmed) return suffix;
    return `${trimmed} ${suffix}`.trim();
  }

  function describePercentChange(current, previous, { suffix = "vs prior period", decimals = 0 } = {}) {
    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
      return { text: "—", trend: "neutral" };
    }
    if (previous === 0) {
      if (current === 0) {
        return { text: joinWithSuffix("No change", suffix), trend: "flat" };
      }
      return { text: joinWithSuffix("New", suffix), trend: "new" };
    }
    const change = (current - previous) / Math.abs(previous);
    if (!Number.isFinite(change)) {
      return { text: "—", trend: "neutral" };
    }
    if (Math.abs(change) < 0.0005) {
      return { text: joinWithSuffix("No change", suffix), trend: "flat" };
    }
    const magnitude = formatNumber(Math.abs(change * 100), {
      maximumFractionDigits: decimals
    });
    if (!magnitude) {
      return { text: "—", trend: "neutral" };
    }
    const prefix = change > 0 ? "+" : "−";
    return {
      text: joinWithSuffix(`${prefix}${magnitude}%`, suffix),
      trend: change > 0 ? "up" : "down"
    };
  }

  function describePointChange(current, previous, { suffix = "vs prior period", decimals = 1 } = {}) {
    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
      return { text: "—", trend: "neutral" };
    }
    const change = (current - previous) * 100;
    if (!Number.isFinite(change)) {
      return { text: "—", trend: "neutral" };
    }
    if (Math.abs(change) < 0.05) {
      return { text: joinWithSuffix("Flat", suffix), trend: "flat" };
    }
    const magnitude = formatNumber(Math.abs(change), {
      maximumFractionDigits: decimals
    });
    if (!magnitude) {
      return { text: "—", trend: "neutral" };
    }
    const prefix = change > 0 ? "+" : "−";
    return {
      text: joinWithSuffix(`${prefix}${magnitude} pts`, suffix),
      trend: change > 0 ? "up" : "down"
    };
  }

  function applyChange(element, descriptor) {
    if (!element) return;
    const text = descriptor?.text && String(descriptor.text).trim();
    element.textContent = text || "—";
    const trend = descriptor?.trend || "neutral";
    element.dataset.trend = trend;
  }

  function updateSalesSnapshot(snapshot = {}) {
    if (!snapshot || typeof snapshot !== "object") return;
    const hasSalesEls = Object.values(salesEls || {}).some(Boolean);
    if (!hasSalesEls) return;

    if (salesEls.source) {
      salesEls.source.textContent = snapshot.source || "—";
    }

    if (salesEls.updated) {
      if (snapshot.updated) {
        const formatted = formatTimestamp(snapshot.updated);
        if (formatted) {
          salesEls.updated.dateTime = formatted.iso;
          salesEls.updated.setAttribute("datetime", formatted.iso);
          const relative = formatRelativeTime(formatted.date);
          const parts = [formatted.display];
          if (relative) {
            parts.push(`(${relative})`);
          }
          salesEls.updated.textContent = parts.join(" ");
        } else {
          salesEls.updated.dateTime = "";
          salesEls.updated.removeAttribute("datetime");
          salesEls.updated.textContent = snapshot.updated;
        }
      } else {
        salesEls.updated.dateTime = "";
        salesEls.updated.removeAttribute("datetime");
        salesEls.updated.textContent = "—";
      }
    }

    if (salesEls.revenueMonth) {
      const revenue = formatCurrency(snapshot?.revenueMonth?.current);
      salesEls.revenueMonth.textContent = revenue || "—";
      applyChange(
        salesEls.revenueMonthChange,
        describePercentChange(snapshot?.revenueMonth?.current, snapshot?.revenueMonth?.previous, {
          suffix: "vs prior 30 days",
          decimals: 1
        })
      );
    }

    if (salesEls.ordersMonth) {
      const orders = formatNumber(snapshot?.ordersMonth?.current, {
        maximumFractionDigits: 0
      });
      salesEls.ordersMonth.textContent = orders ? `${orders} orders` : "—";
      applyChange(
        salesEls.ordersMonthChange,
        describePercentChange(snapshot?.ordersMonth?.current, snapshot?.ordersMonth?.previous, {
          suffix: "vs prior 30 days",
          decimals: 1
        })
      );
    }

    if (salesEls.revenueDay) {
      const dayRevenue = formatCurrency(snapshot?.revenueDay?.current);
      salesEls.revenueDay.textContent = dayRevenue || "—";
      applyChange(
        salesEls.revenueDayChange,
        describePercentChange(snapshot?.revenueDay?.current, snapshot?.revenueDay?.previous, {
          suffix: "vs prior 24 hours",
          decimals: 1
        })
      );
    }

    if (salesEls.topProduct) {
      const top = snapshot?.topProduct || {};
      const name = top.name || "—";
      const share =
        typeof top.currentShare === "number" && Number.isFinite(top.currentShare)
          ? formatNumber(top.currentShare * 100, { maximumFractionDigits: 1 })
          : null;
      salesEls.topProduct.textContent = share ? `${name} — ${share}% of revenue` : name;
      applyChange(
        salesEls.topShare,
        describePointChange(top.currentShare, top.previousShare, {
          suffix: "vs prior 30 days",
          decimals: 1
        })
      );
    }
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

  async function fetchLocalProductCount() {
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

  async function fetchLocalBundleCount() {
    if (bundlesModule && typeof bundlesModule.getBundlesSnapshot === "function") {
      try {
        const snapshot = bundlesModule.getBundlesSnapshot();
        if (Array.isArray(snapshot)) {
          return snapshot.length;
        }
      } catch (error) {
        console.warn("[admin] Failed to read bundle snapshot", error);
      }
    }

    if (Array.isArray(bundlesSnapshot)) {
      return bundlesSnapshot.length;
    }

    return null;
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
    const hasBundles = Array.isArray(bundlesSnapshot);
    setSupabaseSaveButtonState({
      disabled: !(hasClient && hasCatalog && hasBundles),
      label: supabaseSaveDefaults.label
    });
  }

  function updateCatalogSnapshot(products) {
    catalogSnapshot = cloneCatalog(products);
    if (Array.isArray(catalogSnapshot)) {
      setSupabaseMetrics({ localProducts: catalogSnapshot.length });
      kpiCatalogFallback = cloneCatalog(catalogSnapshot) || catalogSnapshot;
      if (kpiModalOpen && activeKpiButton) {
        populateKpiModal(activeKpiButton);
      }
    } else {
      setSupabaseMetrics({ localProducts: null });
      if (kpiModalOpen) {
        setKpiStatus("Product context is still loading.", "info");
      }
    }

    if (!supabaseSavePromise) {
      refreshSaveButtonState();
    }
  }

  function updateBundlesSnapshot(bundles) {
    if (Array.isArray(bundles)) {
      try {
        bundlesSnapshot = JSON.parse(JSON.stringify(bundles));
      } catch (error) {
        console.warn("[admin] Failed to clone bundles snapshot", error);
        bundlesSnapshot = bundles.slice();
      }
      setSupabaseMetrics({ localBundles: bundlesSnapshot.length });
    } else {
      bundlesSnapshot = null;
      setSupabaseMetrics({ localBundles: null });
    }
  }

  function initializeCatalogSync() {
    if (!editorModule) return;

    if (typeof editorModule.getCatalogSnapshot === "function") {
      try {
        const snapshot = editorModule.getCatalogSnapshot();
        if (Array.isArray(snapshot)) {
          updateCatalogSnapshot(snapshot);
          if (bundlesModule && typeof bundlesModule.setAvailableProducts === "function") {
            bundlesModule.setAvailableProducts(snapshot);
          }
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
            if (bundlesModule && typeof bundlesModule.setAvailableProducts === "function") {
              bundlesModule.setAvailableProducts(products);
            }
          } else {
            catalogSnapshot = null;
            setSupabaseMetrics({ localProducts: null });
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

  function initializeBundlesSync() {
    if (!bundlesModule) return;

    if (typeof bundlesModule.getBundlesSnapshot === "function") {
      try {
        const snapshot = bundlesModule.getBundlesSnapshot();
        if (Array.isArray(snapshot)) {
          updateBundlesSnapshot(snapshot);
        }
      } catch (error) {
        console.warn("[admin] Failed to load bundle snapshot", error);
      }
    }

    if (typeof bundlesModule.subscribeToBundles === "function" && !bundlesUnsubscribe) {
      try {
        const unsubscribe = bundlesModule.subscribeToBundles(({ bundles }) => {
          if (Array.isArray(bundles)) {
            updateBundlesSnapshot(bundles);
          }
        });
        bundlesUnsubscribe = unsubscribe;
      } catch (error) {
        console.warn("[admin] Failed to subscribe to bundle updates", error);
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

    const productQuery = supabaseClient
      .from("products")
      .select("id, name, updated_at, created_at", { count: "exact" })
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1);

    const bundleQuery = supabaseClient
      .from("bundles")
      .select("id, name, updated_at, created_at", { count: "exact" })
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1);

    const [productResult, bundleResult] = await Promise.all([productQuery, bundleQuery]);

    if (productResult.error) {
      throw productResult.error;
    }
    if (bundleResult.error) {
      throw bundleResult.error;
    }

    const productLatest = Array.isArray(productResult.data) && productResult.data.length ? productResult.data[0] : null;
    const bundleLatest = Array.isArray(bundleResult.data) && bundleResult.data.length ? bundleResult.data[0] : null;

    return {
      products: {
        count: typeof productResult.count === "number" ? productResult.count : null,
        latest: productLatest
      },
      bundles: {
        count: typeof bundleResult.count === "number" ? bundleResult.count : null,
        latest: bundleLatest
      }
    };
  }

  function toNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return null;
  }

  function formatPriceDisplayValue(amount, currency, display) {
    if (typeof display === "string" && display.trim()) {
      return display.trim();
    }

    const numericAmount = toNumber(amount);
    if (!Number.isFinite(numericAmount)) {
      return "";
    }

    const resolvedCurrency = (typeof currency === "string" && currency.trim()) || "USD";

    try {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: resolvedCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
      return formatter.format(numericAmount);
    } catch (error) {
      console.warn("[admin] Failed to format Supabase price", error);
      return `${numericAmount} ${resolvedCurrency}`.trim();
    }
  }

  function sortByPosition(rows) {
    if (!Array.isArray(rows)) {
      return [];
    }
    return rows
      .slice()
      .sort((a, b) => {
        const aPos = typeof a?.position === "number" ? a.position : Number.MAX_SAFE_INTEGER;
        const bPos = typeof b?.position === "number" ? b.position : Number.MAX_SAFE_INTEGER;
        return aPos - bPos;
      });
  }

  function mapSupabaseRowToProduct(row) {
    if (!row || typeof row !== "object") {
      return null;
    }

    const slug = cleanIdentifier(row.slug) || cleanIdentifier(row.id);
    if (!slug) {
      return null;
    }

    const priceAmount = toNumber(row.price_amount);
    const priceCurrency = cleanText(row.price_currency)?.toUpperCase() || null;
    const priceDisplay = formatPriceDisplayValue(priceAmount, priceCurrency, cleanText(row.price_display));

    const lifeAreas = sortByPosition(row.product_life_areas)
      .map((item) => cleanText(item?.life_area || item?.lifeArea))
      .filter(Boolean);

    const badges = sortByPosition(row.product_badges)
      .map((item) => cleanText(item?.badge))
      .filter(Boolean);

    const features = sortByPosition(row.product_features)
      .map((item) => cleanText(item?.feature))
      .filter(Boolean);

    const included = sortByPosition(row.product_included_items)
      .map((item) => cleanText(item?.included_item || item?.item))
      .filter(Boolean);

    const gallery = sortByPosition(row.product_gallery)
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const src = cleanText(item.image_src || item.src);
        if (!src) return null;
        const alt = cleanText(item.image_alt || item.alt);
        return { src, alt: alt || "" };
      })
      .filter(Boolean);

    const faqs = sortByPosition(row.product_faqs)
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const question = cleanText(item.question || item.q);
        const answer = cleanText(item.answer || item.a);
        if (!question || !answer) return null;
        return { q: question, a: answer };
      })
      .filter(Boolean);

    const benefits = sortByPosition(row.product_benefits)
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const title = cleanText(item.title);
        const description = cleanText(item.description || item.desc);
        if (!title || !description) return null;
        return { title, desc: description };
      })
      .filter(Boolean);

    const socialSource = Array.isArray(row.product_social_proof)
      ? row.product_social_proof.find((entry) => entry && typeof entry === "object")
      : row.product_social_proof;

    let socialProof = null;
    if (socialSource && typeof socialSource === "object") {
      const stars = cleanText(socialSource.stars);
      const quote = cleanText(socialSource.quote);
      if (stars || quote) {
        socialProof = { stars: stars || null, quote: quote || null };
      }
    }

    const product = {
      id: slug,
      slug,
      name: cleanText(row.name) || slug,
      tagline: cleanText(row.tagline),
      description: cleanText(row.description),
      price: priceDisplay || "",
      heroImage: cleanText(row.hero_image),
      colorImage: cleanText(row.color_image),
      colorCaption: cleanText(row.color_caption),
      demoVideo: cleanText(row.demo_video),
      demoPoster: cleanText(row.demo_poster),
      virtualDemo: cleanText(row.virtual_demo),
      pricingTitle: cleanText(row.pricing_title),
      pricingSub: cleanText(row.pricing_sub),
      stripe: cleanText(row.stripe_url),
      etsy: cleanText(row.etsy_url),
      lifeAreas,
      badges,
      features,
      included,
      gallery,
      faqs,
      benefits,
      draft: Boolean(row.draft)
    };

    if (socialProof) {
      product.socialProof = socialProof;
    }

    if (Number.isFinite(priceAmount)) {
      product.priceAmount = priceAmount;
    }

    if (priceCurrency) {
      product.priceCurrency = priceCurrency;
    }

    return product;
  }

  function mapSupabaseRowToBundle(row) {
    if (!row || typeof row !== "object") {
      return null;
    }

    const slug = cleanIdentifier(row.slug) || cleanIdentifier(row.id);
    if (!slug) {
      return null;
    }

    const priceAmount = toNumber(row.price_amount);
    const priceCurrency = cleanText(row.price_currency)?.toUpperCase() || null;
    const priceDisplay = formatPriceDisplayValue(priceAmount, priceCurrency, cleanText(row.price_display));
    const savingsDisplay = cleanText(row.savings_display);

    const includes = sortByPosition(row.bundle_includes)
      .map((item) => cleanText(item?.item))
      .filter(Boolean);

    const products = sortByPosition(row.bundle_products)
      .map((item) => cleanIdentifier(item?.product_slug || item?.productSlug))
      .filter(Boolean);

    const bundle = {
      slug,
      name: cleanText(row.name) || slug,
      badge: cleanText(row.badge),
      tagline: cleanText(row.tagline),
      navTagline: cleanText(row.nav_tagline),
      navCta: cleanText(row.nav_cta) || cleanText(row.cta_label),
      price: priceDisplay || "",
      savings: savingsDisplay || "",
      category: cleanText(row.category),
      color: cleanText(row.color_hex || row.color),
      navColor: cleanText(row.nav_color_hex || row.nav_color),
      cta: cleanText(row.cta_label) || cleanText(row.nav_cta),
      page: cleanText(row.page_url),
      stripe: cleanText(row.stripe_url),
      draft: Boolean(row.draft),
      navFeatured: Boolean(row.nav_featured),
      products,
      includes
    };

    if (Number.isFinite(priceAmount)) {
      bundle.priceAmount = priceAmount;
    }

    if (priceCurrency) {
      bundle.priceCurrency = priceCurrency;
    }

    return bundle;
  }

  async function fetchSupabaseCatalogRows() {
    if (!supabaseClient) {
      throw new Error("Supabase client is not ready.");
    }

    const query = supabaseClient
      .from("products")
      .select(
        `
          id,
          slug,
          name,
          tagline,
          description,
          price_amount,
          price_currency,
          price_display,
          draft,
          hero_image,
          color_image,
          color_caption,
          demo_video,
          demo_poster,
          virtual_demo,
          pricing_title,
          pricing_sub,
          stripe_url,
          etsy_url,
          product_life_areas ( life_area, position ),
          product_badges ( badge, position ),
          product_features ( feature, position ),
          product_included_items ( included_item, position ),
          product_gallery ( image_src, image_alt, position ),
          product_faqs ( question, answer, position ),
          product_benefits ( title, description, position ),
          product_social_proof ( stars, quote )
        `
      )
      .order("slug", { ascending: true })
      .order("position", { foreignTable: "product_life_areas", ascending: true })
      .order("position", { foreignTable: "product_badges", ascending: true })
      .order("position", { foreignTable: "product_features", ascending: true })
      .order("position", { foreignTable: "product_included_items", ascending: true })
      .order("position", { foreignTable: "product_gallery", ascending: true })
      .order("position", { foreignTable: "product_faqs", ascending: true })
      .order("position", { foreignTable: "product_benefits", ascending: true });

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return Array.isArray(data) ? data : [];
  }

  async function fetchSupabaseBundleRows() {
    if (!supabaseClient) {
      throw new Error("Supabase client is not ready.");
    }

    const query = supabaseClient
      .from("bundles")
      .select(
        `
          id,
          slug,
          name,
          badge,
          tagline,
          nav_tagline,
          nav_cta,
          price_amount,
          price_currency,
          price_display,
          savings_display,
          category,
          color_hex,
          nav_color_hex,
          cta_label,
          page_url,
          stripe_url,
          draft,
          nav_featured,
          bundle_includes ( item, position ),
          bundle_products ( product_slug, position )
        `
      )
      .order("slug", { ascending: true })
      .order("position", { foreignTable: "bundle_includes", ascending: true })
      .order("position", { foreignTable: "bundle_products", ascending: true });

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return Array.isArray(data) ? data : [];
  }

  function importSupabaseCatalog() {
    if (!rootHook) {
      return Promise.resolve();
    }

    if (supabaseImportPromise) {
      return supabaseImportPromise;
    }

    supabaseImportPromise = (async () => {
      if (!supabaseClient) {
        throw new Error("Supabase client is not ready.");
      }

      setSupabaseImportButtonState({ disabled: true, label: "Fetching…" });

      let workspaceModule = null;
      let bundlesWorkspace = null;

      try {
        const [productModule, bundleModule] = await Promise.all([loadEditorModule(), loadBundlesModule()]);
        workspaceModule = productModule;
        bundlesWorkspace = bundleModule;
        if (!workspaceModule || typeof workspaceModule.replaceCatalog !== "function") {
          throw new Error("Catalog workspace is not ready.");
        }
        if (!bundlesWorkspace || typeof bundlesWorkspace.replaceBundles !== "function") {
          throw new Error("Bundle workspace is not ready.");
        }

        updateSupabaseStatus("Fetching latest catalog from Supabase…", "info");
        if (typeof workspaceModule.setWorkspaceStatus === "function") {
          workspaceModule.setWorkspaceStatus("Fetching latest catalog from Supabase…", "info");
        }

        const [productRows, bundleRows] = await Promise.all([
          fetchSupabaseCatalogRows(),
          fetchSupabaseBundleRows()
        ]);

        const products = productRows.map((row) => mapSupabaseRowToProduct(row)).filter(Boolean);
        const bundles = bundleRows.map((row) => mapSupabaseRowToBundle(row)).filter(Boolean);

        const productCount = products.length;
        const bundleCount = bundles.length;

        const productStatusMessage = productCount
          ? `Loaded ${productCount} product${productCount === 1 ? "" : "s"} from Supabase.`
          : "Supabase catalog is empty.";

        workspaceModule.replaceCatalog(products, {
          sourceLabel: "Supabase",
          statusMessage: productStatusMessage,
          statusTone: productCount ? "success" : "warning",
          persistLocal: true,
          updateBaseline: true,
          reason: "supabase-import"
        });

        if (typeof bundlesWorkspace.replaceBundles === "function") {
          const bundleStatusMessage = bundleCount
            ? `Loaded ${bundleCount} bundle${bundleCount === 1 ? "" : "s"} from Supabase.`
            : "Supabase bundle catalog is empty.";
          bundlesWorkspace.replaceBundles(bundles, {
            sourceLabel: "Supabase",
            statusMessage: bundleStatusMessage,
            statusTone: bundleCount ? "success" : "warning",
            persistLocal: true,
            updateBaseline: true,
            reason: "supabase-import"
          });
        }

        updateSupabaseStatus("Supabase catalog imported into workspace.", "success");
        setSupabaseUpdated(new Date());

        await runSupabaseTest({ source: "supabase-import" });
      } catch (error) {
        const formatted = formatError(error);
        console.error("[admin] Supabase import failed", error);
        updateSupabaseStatus(`Supabase import failed: ${formatted}`, "danger");
        if (workspaceModule && typeof workspaceModule.setWorkspaceStatus === "function") {
          workspaceModule.setWorkspaceStatus(`Supabase import failed: ${formatted}`, "danger");
        }
        throw error;
      } finally {
        setSupabaseImportButtonState({ disabled: false, label: supabaseImportDefaults.label });
      }
    })();

    return supabaseImportPromise.finally(() => {
      supabaseImportPromise = null;
    });
  }

  function initializeSupabaseImporter() {
    if (supabaseImporterReady) return;
    if (!supabaseImportEls.button) return;

    supabaseImportEls.button.addEventListener("click", () => {
      importSupabaseCatalog().catch(() => {
        // Error handling is managed inside importSupabaseCatalog via status updates.
      });
    });

    supabaseImporterReady = true;
    setSupabaseImportButtonState({ disabled: false, label: supabaseImportDefaults.label });
  }

  async function bootstrapAdminWorkspace({ autoImport = false } = {}) {
    initializeSupabaseTester();
    initializeSupabaseSaver();
    await loadEditorModule();
    await loadBundlesModule();
    initializeSupabaseImporter();

    if (autoImport) {
      try {
        await importSupabaseCatalog();
        return;
      } catch (error) {
        console.error("[admin] Automatic Supabase import failed", error);
      }
    }

    await runSupabaseTest({ initial: true, source: "initial" });
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

  function setKpiStatus(message, tone = "neutral") {
    if (!kpiModalEls.status) return;
    const statusEl = kpiModalEls.status;
    const text = typeof message === "string" ? message.trim() : "";
    statusEl.textContent = text;
    if (text && tone && tone !== "neutral") {
      statusEl.dataset.tone = tone;
    } else {
      delete statusEl.dataset.tone;
    }
  }

  function matchesProductIdentifier(product, identifier) {
    if (!product || typeof identifier !== "string") return false;
    const target = identifier.trim().toLowerCase();
    if (!target) return false;
    const candidates = [product.id, product.slug, product.name];
    return candidates.some((value) => typeof value === "string" && value.trim().toLowerCase() === target);
  }

  function formatShare(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return null;
    }
    const percent = formatNumber(value * 100, { maximumFractionDigits: 1 });
    return percent ? `${percent}%` : null;
  }

  function formatProductContext(product) {
    if (!product || typeof product !== "object") return null;
    const lines = [];
    const name =
      (typeof product.name === "string" && product.name.trim()) ||
      (typeof product.title === "string" && product.title.trim()) ||
      (typeof product.id === "string" && product.id.trim()) ||
      "Product";
    lines.push(`Product: ${name}`);

    if (typeof product.tagline === "string" && product.tagline.trim()) {
      lines.push(`Tagline: ${product.tagline.trim()}`);
    }

    const priceDetails = extractPriceDetails(product);
    if (priceDetails?.display) {
      lines.push(`Price: ${priceDetails.display}`);
    }

    if (Array.isArray(product.lifeAreas) && product.lifeAreas.length) {
      lines.push(`Life areas: ${product.lifeAreas.join(", ")}`);
    }

    if (Array.isArray(product.badges) && product.badges.length) {
      lines.push(`Badges: ${product.badges.slice(0, 4).join(", ")}`);
    }

    if (Array.isArray(product.features) && product.features.length) {
      lines.push(`Key features: ${product.features.slice(0, 3).join("; ")}`);
    }

    if (Array.isArray(product.included) && product.included.length) {
      lines.push(`Included: ${product.included.slice(0, 3).join("; ")}`);
    }

    return lines.join("\n");
  }

  function formatSalesContext(product) {
    if (!salesSnapshot || typeof salesSnapshot !== "object") return null;
    const lines = [];

    if (salesSnapshot.source) {
      lines.push(`Sales source: ${salesSnapshot.source}`);
    }

    if (salesSnapshot.updated) {
      const formatted = formatTimestamp(salesSnapshot.updated);
      if (formatted) {
        lines.push(`Last updated: ${formatted.display}`);
      }
    }

    if (salesSnapshot.revenueMonth) {
      const revenueDisplay = formatCurrency(salesSnapshot.revenueMonth.current);
      const change = describePercentChange(
        salesSnapshot.revenueMonth.current,
        salesSnapshot.revenueMonth.previous,
        { suffix: "vs last month", decimals: 1 }
      );
      const revenueParts = [];
      revenueParts.push(revenueDisplay || "—");
      if (change?.text) {
        revenueParts.push(`(${change.text})`);
      }
      lines.push(`Monthly revenue: ${revenueParts.join(" ")}`.trim());
    }

    if (salesSnapshot.ordersMonth) {
      const ordersDisplay =
        formatNumber(salesSnapshot.ordersMonth.current, { maximumFractionDigits: 0 }) ||
        (Number.isFinite(salesSnapshot.ordersMonth.current)
          ? String(salesSnapshot.ordersMonth.current)
          : null);
      const change = describePercentChange(
        salesSnapshot.ordersMonth.current,
        salesSnapshot.ordersMonth.previous,
        { suffix: "vs last month", decimals: 1 }
      );
      const orderParts = [];
      orderParts.push(ordersDisplay ? `${ordersDisplay} orders` : "—");
      if (change?.text) {
        orderParts.push(`(${change.text})`);
      }
      lines.push(`Monthly orders: ${orderParts.join(" ")}`.trim());
    }

    if (salesSnapshot.revenueDay) {
      const dailyDisplay = formatCurrency(salesSnapshot.revenueDay.current);
      const change = describePercentChange(
        salesSnapshot.revenueDay.current,
        salesSnapshot.revenueDay.previous,
        { suffix: "vs prior day", decimals: 1 }
      );
      const dayParts = [];
      dayParts.push(dailyDisplay || "—");
      if (change?.text) {
        dayParts.push(`(${change.text})`);
      }
      lines.push(`Daily revenue: ${dayParts.join(" ")}`.trim());
    }

    const top = salesSnapshot.topProduct;
    if (top && typeof top.name === "string" && top.name.trim()) {
      const share = formatShare(top.currentShare);
      const previousShare = formatShare(top.previousShare);
      const details = [];
      if (share) {
        details.push(`${share} of sales`);
      }
      if (previousShare) {
        details.push(`was ${previousShare}`);
      }
      const suffix = details.length ? ` — ${details.join(", ")}` : "";
      if (product && matchesProductIdentifier(product, top.name)) {
        lines.push(`This KPI highlights ${top.name}${suffix}.`);
      } else {
        lines.push(`Top product spotlight: ${top.name}${suffix}.`);
      }
    }

    return lines.join("\n");
  }

  async function requestFallbackCatalog() {
    if (Array.isArray(kpiCatalogFallback) && kpiCatalogFallback.length) {
      return kpiCatalogFallback;
    }
    if (kpiCatalogPromise) {
      return kpiCatalogPromise;
    }

    kpiCatalogPromise = (async () => {
      try {
        const response = await fetch("products.json", { cache: "no-store" });
        if (!response.ok) {
          return null;
        }
        const data = await response.json();
        kpiCatalogFallback = Array.isArray(data) ? data : null;
        return kpiCatalogFallback;
      } catch (error) {
        console.warn("[admin] Failed to fetch catalog for Ask AI dialog", error);
        return null;
      } finally {
        kpiCatalogPromise = null;
      }
    })();

    return kpiCatalogPromise;
  }

  async function getCatalogData() {
    if (Array.isArray(catalogSnapshot) && catalogSnapshot.length) {
      return catalogSnapshot;
    }

    if (editorModule && typeof editorModule.getCatalogSnapshot === "function") {
      try {
        const snapshot = editorModule.getCatalogSnapshot();
        if (Array.isArray(snapshot) && snapshot.length) {
          return snapshot;
        }
      } catch (error) {
        console.warn("[admin] Failed to read catalog for Ask AI dialog", error);
      }
    }

    return requestFallbackCatalog();
  }

  async function buildKpiContext({ productId } = {}) {
    const sections = [];
    let product = null;

    try {
      const products = await getCatalogData();
      if (Array.isArray(products) && products.length) {
        if (productId) {
          const targetId = String(productId).trim().toLowerCase();
          product =
            products.find((item) => matchesProductIdentifier(item, targetId)) ||
            products.find((item) => matchesProductIdentifier(item, productId));
        }

        if (!product) {
          product = products[0];
        }
      }
    } catch (error) {
      console.warn("[admin] Failed to load product context for Ask AI dialog", error);
    }

    const productContext = formatProductContext(product);
    if (productContext) {
      sections.push(productContext);
    }

    const salesContext = formatSalesContext(product);
    if (salesContext) {
      sections.push(salesContext);
    }

    if (!sections.length) {
      return "Product context is still loading.";
    }

    return sections.join("\n\n");
  }

  function composeAiPrompt(question, context) {
    const trimmedQuestion = typeof question === "string" ? question.trim() : "";
    const trimmedContext = typeof context === "string" ? context.trim() : "";

    if (trimmedQuestion && trimmedContext) {
      return `${trimmedQuestion}\n\nProduct context:\n${trimmedContext}`;
    }
    if (trimmedQuestion) {
      return trimmedQuestion;
    }
    if (trimmedContext) {
      return `Product context:\n${trimmedContext}`;
    }
    return "";
  }

  async function copyPromptToClipboard(prompt) {
    if (!prompt || typeof prompt !== "string") {
      return false;
    }
    const clipboard = navigator?.clipboard;
    if (!clipboard || typeof clipboard.writeText !== "function") {
      return false;
    }
    await clipboard.writeText(prompt);
    return true;
  }

  async function handleAskAiSubmit() {
    if (!kpiModalEls.question || !kpiModalEls.context) return;
    const prompt = composeAiPrompt(kpiModalEls.question.value, kpiModalEls.context.value);
    if (!prompt.trim()) {
      setKpiStatus("Add a question or context before asking the AI.", "error");
      return;
    }

    try {
      const copied = await copyPromptToClipboard(prompt);
      if (copied) {
        setKpiStatus("Prompt copied to your clipboard. Paste it into ChatGPT to continue.", "success");
      } else {
        setKpiStatus("Copy the prompt below and paste it into ChatGPT.", "info");
      }
    } catch (error) {
      console.warn("[admin] Failed to copy Ask AI prompt", error);
      setKpiStatus("Copy the prompt below and paste it into ChatGPT.", "error");
    }
  }

  async function populateKpiModal(button) {
    if (!kpiModalEls.context) return;
    const trigger = button || activeKpiButton;
    const productId = trigger?.dataset?.kpiProductId || null;
    const productName = trigger?.dataset?.kpiProductName?.trim() || "";
    const loadingMessage = "Product context is still loading.";

    try {
      const context = await buildKpiContext({ productId });
      if (!kpiModalOpen || activeKpiButton !== trigger) {
        return;
      }
      if (context && context !== "Product context is still loading.") {
        setKpiStatus("Product context loaded. You're ready to ask the AI.", "success");
      } else {
        setKpiStatus("Product context is still loading.", "info");
      }
      let resolvedContext = context || loadingMessage;
      if (productName) {
        resolvedContext = resolvedContext
          ? `Focus product: ${productName}\n\n${resolvedContext}`
          : `Focus product: ${productName}`;
      }
      kpiModalEls.context.value = resolvedContext;
    } catch (error) {
      console.warn("[admin] Failed to populate Ask AI dialog", error);
      if (!kpiModalOpen || activeKpiButton !== trigger) {
        return;
      }
      const errorMessage = "We couldn't load product context. Try again in a moment.";
      const resolvedContext = productName
        ? `Focus product: ${productName}\n\n${errorMessage}`
        : errorMessage;
      kpiModalEls.context.value = resolvedContext;
      setKpiStatus("We couldn't load product context. Try again in a moment.", "error");
    }
  }

  function openKpiModal(button) {
    if (!kpiModalEls.modal || !kpiModalEls.dialog) return;
    activeKpiButton = button || null;
    kpiModalOpen = true;

    const topic = button?.dataset?.kpiName || button?.textContent?.trim() || "your KPI";
    if (kpiModalEls.topic) {
      kpiModalEls.topic.textContent = topic;
    }

    let questionText = button?.dataset?.kpiQuestion || "";
    let productName = button?.dataset?.kpiProductName || "";
    const row = button?.closest("tr");
    if (!questionText && button) {
      const descriptionCell = row?.querySelector("[data-kpi-description]");
      if (descriptionCell) {
        questionText = descriptionCell.textContent?.trim() || "";
      }
    }
    if (!productName && row) {
      const productCell = row.querySelector("[data-kpi-product]");
      productName = productCell?.textContent?.trim() || "";
    }
    if (productName) {
      button.dataset.kpiProductName = productName;
    }
    if (kpiModalEls.question) {
      kpiModalEls.question.value = questionText;
    }

    if (kpiModalEls.context) {
      kpiModalEls.context.value = "Preparing product context…";
    }
    setKpiStatus("Preparing product details…", "info");

    kpiModalEls.modal.hidden = false;
    kpiModalEls.modal.classList.add("is-open");

    window.requestAnimationFrame(() => {
      kpiModalEls.dialog?.focus();
    });

    populateKpiModal(button);
  }

  function closeKpiModal() {
    if (!kpiModalEls.modal) return;
    kpiModalEls.modal.classList.remove("is-open");
    kpiModalEls.modal.hidden = true;
    kpiModalOpen = false;

    if (kpiModalEls.question) {
      kpiModalEls.question.value = "";
    }
    if (kpiModalEls.context) {
      kpiModalEls.context.value = "";
    }
    if (kpiModalEls.topic) {
      kpiModalEls.topic.textContent = "your KPI";
    }
    setKpiStatus("", "neutral");

    const trigger = activeKpiButton;
    activeKpiButton = null;
    if (trigger && typeof trigger.focus === "function") {
      trigger.focus();
    }
  }

  function initializeKpiAsk() {
    if (kpiModalReady) return;
    const { modal, dialog, askButton, dismissTriggers } = kpiModalEls;
    if (!modal || !dialog) return;

    const buttons = Array.from(document.querySelectorAll(KPI_ASK_BUTTON_SELECTOR));
    if (!buttons.length) return;

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        openKpiModal(button);
      });
    });

    dismissTriggers.forEach((element) => {
      element.addEventListener("click", () => {
        closeKpiModal();
      });
    });

    if (askButton) {
      askButton.addEventListener("click", () => {
        handleAskAiSubmit();
      });
    }

    document.addEventListener("keydown", (event) => {
      if (!kpiModalOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeKpiModal();
      }
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeKpiModal();
      }
    });

    kpiModalReady = true;
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

  function buildBaseBundleRow(bundle) {
    const slug = cleanIdentifier(bundle?.slug);
    if (!slug) {
      throw new Error("A bundle is missing its slug.");
    }

    const price = extractPriceDetails(bundle);
    const name = cleanText(bundle?.name) || slug;

    return {
      slug,
      name,
      badge: cleanText(bundle?.badge),
      tagline: cleanText(bundle?.tagline),
      nav_tagline: cleanText(bundle?.navTagline || bundle?.nav_tagline),
      nav_cta: cleanText(bundle?.navCta || bundle?.nav_cta || bundle?.cta),
      price_amount: price.amount,
      price_currency: price.currency,
      price_display: price.display,
      savings_display: cleanText(bundle?.savings || bundle?.savings_display),
      category: cleanText(bundle?.category),
      color_hex: cleanText(bundle?.color || bundle?.color_hex),
      nav_color_hex: cleanText(bundle?.navColor || bundle?.nav_color_hex),
      cta_label: cleanText(bundle?.cta || bundle?.navCta || bundle?.cta_label),
      page_url: cleanText(bundle?.page || bundle?.page_url),
      stripe_url: cleanText(bundle?.stripe || bundle?.stripe_url),
      draft: Boolean(bundle?.draft),
      nav_featured: Boolean(bundle?.navFeatured || bundle?.nav_featured),
      updated_at: new Date().toISOString()
    };
  }

  function buildBundleRelatedRows(bundles, slugToId) {
    const includes = [];
    const bundleProducts = [];

    bundles.forEach((bundle) => {
      const slug = cleanIdentifier(bundle?.slug);
      if (!slug) return;
      const bundleId = slugToId.get(slug);
      if (!bundleId) return;

      (Array.isArray(bundle?.includes) ? bundle.includes : [])
        .map((item) => cleanText(item))
        .filter(Boolean)
        .forEach((item, index) => {
          includes.push({ bundle_id: bundleId, item, position: index + 1 });
        });

      (Array.isArray(bundle?.products) ? bundle.products : [])
        .map((item) => cleanIdentifier(item))
        .filter(Boolean)
        .forEach((productSlug, index) => {
          bundleProducts.push({ bundle_id: bundleId, product_slug: productSlug, position: index + 1 });
        });
    });

    return { includes, products: bundleProducts };
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

  async function clearBundleRelatedTables(bundleIds) {
    if (!Array.isArray(bundleIds) || !bundleIds.length) return;

    const tables = [
      { name: "bundle_includes", label: "bundle includes" },
      { name: "bundle_products", label: "bundle product relationships" }
    ];

    for (const table of tables) {
      const { error } = await supabaseClient
        .from(table.name)
        .delete()
        .in("bundle_id", bundleIds);
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

  async function syncBundlesWithSupabase(bundles) {
    if (!Array.isArray(bundles)) {
      throw new Error("No bundle data is available to save.");
    }

    const baseRecords = bundles.map((bundle) => buildBaseBundleRow(bundle));
    const seenSlugs = new Set();
    for (const record of baseRecords) {
      if (seenSlugs.has(record.slug)) {
        throw new Error(`Duplicate bundle slug detected: "${record.slug}".`);
      }
      seenSlugs.add(record.slug);
    }

    if (!baseRecords.length) {
      const { data: existing, error: fetchError } = await supabaseClient.from("bundles").select("id");
      if (fetchError) {
        throw new Error(`Failed to inspect Supabase bundles: ${formatError(fetchError)}`);
      }
      const ids = (existing || []).map((row) => row.id).filter(Boolean);
      if (ids.length) {
        const { error: deleteError } = await supabaseClient.from("bundles").delete().in("id", ids);
        if (deleteError) {
          throw new Error(`Failed to clear Supabase bundles: ${formatError(deleteError)}`);
        }
      }
      return { saved: 0 };
    }

    const { error: upsertError } = await supabaseClient
      .from("bundles")
      .upsert(baseRecords, { onConflict: "slug" });
    if (upsertError) {
      throw new Error(`Failed to upsert bundles: ${formatError(upsertError)}`);
    }

    const localSlugs = baseRecords.map((record) => record.slug);
    const { data: idRows, error: idError } = await supabaseClient
      .from("bundles")
      .select("id, slug")
      .in("slug", localSlugs);
    if (idError) {
      throw new Error(`Failed to confirm bundle IDs: ${formatError(idError)}`);
    }

    const slugToId = new Map();
    (idRows || []).forEach((row) => {
      if (row && row.slug && row.id) {
        slugToId.set(row.slug, row.id);
      }
    });

    for (const slug of localSlugs) {
      if (!slugToId.has(slug)) {
        throw new Error(`Supabase did not return an ID for bundle "${slug}".`);
      }
    }

    const bundleIds = Array.from(slugToId.values());

    const { data: remoteRows, error: remoteError } = await supabaseClient.from("bundles").select("id, slug");
    if (remoteError) {
      throw new Error(`Failed to inspect Supabase bundles: ${formatError(remoteError)}`);
    }

    const localSlugSet = new Set(localSlugs);
    const staleIds = (remoteRows || [])
      .filter((row) => row && row.slug && !localSlugSet.has(row.slug))
      .map((row) => row.id)
      .filter(Boolean);
    if (staleIds.length) {
      const { error: deleteStaleError } = await supabaseClient
        .from("bundles")
        .delete()
        .in("id", staleIds);
      if (deleteStaleError) {
        throw new Error(`Failed to remove stale bundles: ${formatError(deleteStaleError)}`);
      }
    }

    await clearBundleRelatedTables(bundleIds);

    const relatedRows = buildBundleRelatedRows(bundles, slugToId);
    await insertRows("bundle_includes", relatedRows.includes, "bundle includes");
    await insertRows("bundle_products", relatedRows.products, "bundle product relationships");

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
    if (!Array.isArray(catalogSnapshot) || !Array.isArray(bundlesSnapshot)) {
      updateSupabaseStatus(
        "Local catalog is still loading. Try again once your products and bundles appear.",
        "info"
      );
      refreshSaveButtonState();
      return Promise.resolve();
    }

    supabaseSavePromise = (async () => {
      await loadBundlesModule();
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

      let bundleSnapshot = bundlesSnapshot;
      if (bundlesModule && typeof bundlesModule.getBundlesSnapshot === "function") {
        try {
          const latestBundles = bundlesModule.getBundlesSnapshot();
          if (Array.isArray(latestBundles)) {
            bundleSnapshot = latestBundles;
          }
        } catch (error) {
          console.warn("[admin] Failed to read bundle snapshot before saving", error);
        }
      }

      const productCount = Array.isArray(snapshot) ? snapshot.length : 0;
      const bundleCount = Array.isArray(bundleSnapshot) ? bundleSnapshot.length : 0;

      const statusLabelProducts = `${productCount} product${productCount === 1 ? "" : "s"}`;
      const statusLabelBundles = `${bundleCount} bundle${bundleCount === 1 ? "" : "s"}`;
      updateSupabaseStatus(
        `Saving ${statusLabelProducts} and ${statusLabelBundles} to Supabase…`,
        "info"
      );
      setSupabaseButtonState({ disabled: true });
      setSupabaseSaveButtonState({ disabled: true, label: "Saving…" });

      try {
        await syncCatalogWithSupabase(Array.isArray(snapshot) ? snapshot : []);
        await syncBundlesWithSupabase(Array.isArray(bundleSnapshot) ? bundleSnapshot : []);
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
        const [localProductsPromise, localBundlesPromise] = [
          fetchLocalProductCount(),
          fetchLocalBundleCount()
        ];
        const overview = await fetchSupabaseOverview();
        const localProducts = await localProductsPromise;
        const localBundles = await localBundlesPromise;

        const productOverview = overview?.products || {};
        const bundleOverview = overview?.bundles || {};

        const productCount =
          typeof productOverview.count === "number" ? productOverview.count : null;
        const bundleCount =
          typeof bundleOverview.count === "number" ? bundleOverview.count : null;

        const productLatest = describeLatestChange(productOverview.latest);
        const bundleLatest = describeLatestChange(bundleOverview.latest);
        const latestParts = [];
        if (productLatest) {
          latestParts.push(`Products: ${productLatest}`);
        }
        if (bundleLatest) {
          latestParts.push(`Bundles: ${bundleLatest}`);
        }
        const latestFallback =
          (productCount === 0 && bundleCount === 0)
            ? "No catalog records found."
            : "No change details available.";
        const latestDescription = latestParts.length ? latestParts.join(" | ") : latestFallback;

        const productsMatch =
          typeof productCount === "number" &&
          typeof localProducts === "number" &&
          productCount === localProducts;
        const bundlesMatch =
          typeof bundleCount === "number" &&
          typeof localBundles === "number" &&
          bundleCount === localBundles;

        setSupabaseMetrics({
          products: productCount,
          bundles: bundleCount,
          latest: latestDescription,
          localProducts: localProducts ?? "Unavailable",
          localBundles: localBundles ?? "Unavailable"
        });

        const statusParts = ["Supabase connection verified."];

        if (typeof productCount === "number") {
          if (productCount === 0) {
            statusParts.push("No products are stored in Supabase.");
          } else {
            statusParts.push(
              `${productCount} product${productCount === 1 ? "" : "s"} found in Supabase.`
            );
          }
        }

        if (typeof bundleCount === "number") {
          if (bundleCount === 0) {
            statusParts.push("No bundles are stored in Supabase.");
          } else {
            statusParts.push(
              `${bundleCount} bundle${bundleCount === 1 ? "" : "s"} found in Supabase.`
            );
          }
        }

        if (typeof productCount === "number" && typeof localProducts === "number") {
          if (productsMatch) {
            statusParts.push(`Product count matches the local catalog (${localProducts}).`);
          } else {
            const difference = productCount - localProducts;
            const diffWord = difference > 0 ? "more" : "fewer";
            const diffAbsolute = Math.abs(difference);
            statusParts.push(
              `Supabase has ${diffAbsolute} ${diffWord} product${diffAbsolute === 1 ? "" : "s"} than the local catalog (${localProducts}).`
            );
          }
        } else if (typeof localProducts === "number") {
          statusParts.push(
            `Local workspace contains ${localProducts} product${localProducts === 1 ? "" : "s"}.`
          );
        } else if (localProducts == null) {
          statusParts.push("Local product catalog could not be loaded.");
        }

        if (typeof bundleCount === "number" && typeof localBundles === "number") {
          if (bundlesMatch) {
            statusParts.push(`Bundle count matches the local catalog (${localBundles}).`);
          } else {
            const difference = bundleCount - localBundles;
            const diffWord = difference > 0 ? "more" : "fewer";
            const diffAbsolute = Math.abs(difference);
            statusParts.push(
              `Supabase has ${diffAbsolute} ${diffWord} bundle${diffAbsolute === 1 ? "" : "s"} than the local catalog (${localBundles}).`
            );
          }
        } else if (typeof localBundles === "number") {
          statusParts.push(
            `Local workspace contains ${localBundles} bundle${localBundles === 1 ? "" : "s"}.`
          );
        } else if (localBundles == null) {
          statusParts.push("Local bundle catalog could not be loaded.");
        }

        const statusMessage = statusParts.join(" ");

        updateSupabaseStatus(statusMessage, "success");
        setSupabaseUpdated(new Date());

        window.dispatchEvent(
          new CustomEvent("admin:supabase-check", {
            detail: {
              status: "success",
              message: statusMessage,
              source,
              token,
              count: productCount,
              bundleCount,
              localCount: typeof localProducts === "number" ? localProducts : null,
              localBundleCount: typeof localBundles === "number" ? localBundles : null,
              matchesLocal: productsMatch,
              bundlesMatch,
              latest: latestDescription
            }
          })
        );
      } catch (error) {
        console.error("[admin] Supabase test failed", error);
        const formattedError = formatError(error);
        updateSupabaseStatus(`Supabase test failed: ${formattedError}`, "danger");
        setSupabaseMetrics({ products: null, bundles: null, latest: null });
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

  window.addEventListener("admin:preview-published", async (event) => {
    if (!rootHook) return;
    const detail = event?.detail || {};
    if (detail && Object.prototype.hasOwnProperty.call(detail, "shouldPublish") && !detail.shouldPublish) {
      return;
    }

    const count = typeof detail.count === "number" && Number.isFinite(detail.count) ? detail.count : null;
    const targetLabel =
      count && count > 0
        ? `${count} product${count === 1 ? "" : "s"}`
        : "your catalog";

    await loadEditorModule();

    if (!supabaseClient) {
      updateSupabaseStatus(
        `Preview saved locally for ${targetLabel}, but Supabase is not ready. Refresh and try again to publish live.`,
        "warning"
      );
      return;
    }

    updateSupabaseStatus(`Publishing ${targetLabel} to Supabase…`, "info");

    try {
      await saveCatalogToSupabase();
    } catch (error) {
      console.error("[admin] Failed to publish preview to Supabase", error);
      updateSupabaseStatus(`Preview publish failed: ${formatError(error)}`, "danger");
    }
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

  async function loadBundlesModule() {
    if (bundlesEditorLoaded && bundlesModule) {
      return bundlesModule;
    }
    try {
      bundlesModule = await import("./bundles-editor.js");
      bundlesEditorLoaded = true;
      initializeBundlesSync();
      return bundlesModule;
    } catch (error) {
      console.error("[admin] Failed to load bundle workspace", error);
      return null;
    }
  }

  function enableContent() {
    if (contentSection) {
      contentSection.hidden = false;
    }
    showSection("content");
    updateSalesSnapshot(salesSnapshot);
    initializeSupabaseDebugModal();
    initializeKpiAsk();
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
        await bootstrapAdminWorkspace({ autoImport: true });
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
      await bootstrapAdminWorkspace({ autoImport: true });
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
      if (typeof bundlesUnsubscribe === "function") {
        try {
          bundlesUnsubscribe();
        } catch (error) {
          console.warn("[admin] Failed to remove bundle subscription", error);
        }
        bundlesUnsubscribe = null;
      }
    });
  }

}
