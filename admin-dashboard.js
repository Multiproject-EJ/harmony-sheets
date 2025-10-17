import { isSupabaseConfigured } from "./supabase-config.js";
import { ACCOUNT_PAGE_PATH, ADMIN_DASHBOARD_PATH, isAdminUser } from "./auth-helpers.js";
import { getSupabaseClient } from "./supabase-client.js";

const ADMIN_PAGE_REGEX = /\/admin_dashboard\.html$/i;
const isAdminPage = ADMIN_PAGE_REGEX.test(location.pathname);

if (!isAdminPage) {
  // Not the admin page → do nothing in this file.
  // Prevents auth listeners, editor imports, and any redirects from running globally.
  // eslint-disable-next-line no-useless-return
  (function noop() {
    return;
  })();
}

const rootHook = !isAdminPage
  ? null
  : document.querySelector("[data-admin-dashboard-content]") ||
    document.querySelector("[data-admin-dashboard-loading]") ||
    document.querySelector("[data-admin-dashboard-unauthorized]");

const shouldRunAdminDashboard = Boolean(rootHook);

if (isAdminPage && !shouldRunAdminDashboard) {
  // Admin DOM isn’t on this page; don’t run anything
  // eslint-disable-next-line no-useless-return
  (function noop() {
    return;
  })();
}

const PAGE_PATH = ADMIN_DASHBOARD_PATH || "admin_dashboard.html";

const sections = {
  loading: shouldRunAdminDashboard ? document.querySelector("[data-admin-dashboard-loading]") : null,
  unauthorized: shouldRunAdminDashboard
    ? document.querySelector("[data-admin-dashboard-unauthorized]")
    : null,
  content: shouldRunAdminDashboard ? document.querySelector("[data-admin-dashboard-content]") : null
};

const messageEl = shouldRunAdminDashboard ? document.querySelector("[data-admin-dashboard-message]") : null;
const contentSection = sections.content;

const supabaseTestEls = shouldRunAdminDashboard
  ? {
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
      buttonLabel: document.querySelector("[data-supabase-test-label]")
    }
  : {
      card: null,
      indicator: null,
      status: null,
      metrics: null,
      products: null,
      latest: null,
      local: null,
      updated: null,
      updatedTime: null,
      button: null,
      buttonLabel: null
    };

const supabaseTestDefaults = {
  label:
    supabaseTestEls.buttonLabel?.textContent?.trim() ||
    supabaseTestEls.button?.textContent?.trim() ||
    "Run test"
};

let supabaseClient = null;
let authSubscription = null;
let editorLoaded = false;
let supabaseTesterReady = false;
let supabaseTestPromise = null;
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

function setSupabaseMetrics({ count = null, latest = null, localCount = null } = {}) {
  if (supabaseTestEls.products) {
    supabaseTestEls.products.textContent =
      typeof count === "number" && Number.isFinite(count) ? count.toLocaleString() : "—";
  }

  if (supabaseTestEls.latest) {
    supabaseTestEls.latest.textContent = latest && String(latest).trim() ? latest : "—";
  }

  if (supabaseTestEls.local) {
    supabaseTestEls.local.textContent =
      typeof localCount === "number" && Number.isFinite(localCount)
        ? localCount.toLocaleString()
        : typeof localCount === "string" && localCount.trim()
        ? localCount.trim()
        : "—";
  }

  if (supabaseTestEls.metrics) {
    const hasData =
      (typeof count === "number" && Number.isFinite(count)) ||
      (typeof localCount === "number" && Number.isFinite(localCount)) ||
      (typeof latest === "string" && latest.trim().length > 0);
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

function runSupabaseTest(options = {}) {
  if (!shouldRunAdminDashboard || !supabaseClient) {
    return Promise.resolve();
  }
  if (supabaseTestPromise) {
    return supabaseTestPromise;
  }

  const { initial = false } = options;
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
        if (overview.count === localCount) {
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
    } catch (error) {
      console.error("[admin] Supabase test failed", error);
      updateSupabaseStatus(`Supabase test failed: ${formatError(error)}`, "danger");
      setSupabaseMetrics();
      setSupabaseUpdated(new Date());
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
    runSupabaseTest();
  });

  supabaseTesterReady = true;
  setSupabaseButtonState({ disabled: false, label: supabaseTestDefaults.label });
}

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
  if (editorLoaded) return;
  try {
    await import("./editor.js");
    editorLoaded = true;
  } catch (error) {
    console.error("[admin] Failed to load editor module", error);
    setUnauthorizedMessage("The admin workspace failed to load. Please refresh the page and try again.");
    showSection("unauthorized");
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
  if (!shouldRunAdminDashboard) {
    return;
  }
  if (!isSupabaseConfigured()) {
    handleUnauthorized(
      "Supabase credentials are missing. Update supabase-config.js to enable admin access."
    );
    return;
  }

  supabaseClient = getSupabaseClient();

  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    const sessionUser = data?.session?.user || null;
    if (requireAdmin(sessionUser)) {
      initializeSupabaseTester();
      await loadEditorModule();
      await runSupabaseTest({ initial: true });
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
    await loadEditorModule();
    await runSupabaseTest({ initial: true });
  });
  authSubscription = listener;
}

if (shouldRunAdminDashboard) {
  initialize();

  window.addEventListener("beforeunload", () => {
    if (authSubscription && typeof authSubscription.subscription?.unsubscribe === "function") {
      authSubscription.subscription.unsubscribe();
    }
  });
}
