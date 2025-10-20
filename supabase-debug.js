import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config.js";
import { getSupabaseClient } from "./supabase-client.js";

const root = document.querySelector("[data-supabase-debug-root]");
if (!root) {
  // Not on the debug page.
  // eslint-disable-next-line no-useless-return
  (function noop() {
    return;
  })();
}

const logContainer = root?.querySelector("[data-debug-log]");
const configStatusEl = root?.querySelector("[data-debug-config-status]");
const configDetailsEl = root?.querySelector("[data-debug-config-details]");
const configUrlEl = root?.querySelector("[data-debug-config-url]");
const configKeyEl = root?.querySelector("[data-debug-config-key]");
const configButton = root?.querySelector("[data-debug-check-config]");
const configIndicator = root?.querySelector('[data-debug-section="config"] [data-debug-indicator]');

const overviewStatusEl = root?.querySelector("[data-debug-overview-status]");
const overviewDetailsEl = root?.querySelector("[data-debug-overview-details]");
const overviewCountEl = root?.querySelector("[data-debug-overview-count]");
const overviewLatestEl = root?.querySelector("[data-debug-overview-latest]");
const overviewUpdatedEl = root?.querySelector("[data-debug-overview-updated]");
const overviewTimeEl = root?.querySelector("[data-debug-overview-time]");
const overviewButton = root?.querySelector("[data-debug-run-overview]");
const overviewIndicator = root?.querySelector('[data-debug-section="overview"] [data-debug-indicator]');

const compareStatusEl = root?.querySelector("[data-debug-compare-status]");
const compareDetailsEl = root?.querySelector("[data-debug-compare-details]");
const compareRemoteEl = root?.querySelector("[data-debug-compare-remote]");
const compareLocalEl = root?.querySelector("[data-debug-compare-local]");
const compareUpdatedEl = root?.querySelector("[data-debug-compare-updated]");
const compareTimeEl = root?.querySelector("[data-debug-compare-time]");
const compareButton = root?.querySelector("[data-debug-run-compare]");
const compareIndicator = root?.querySelector('[data-debug-section="compare"] [data-debug-indicator]');

const clearLogButton = root?.querySelector("[data-debug-clear-log]");

function setIndicatorTone(indicator, tone) {
  if (!indicator) return;
  indicator.setAttribute("data-tone", tone);
}

function setStatus(element, message) {
  if (element) {
    element.textContent = message;
  }
}

function setDetailsVisibility(element, visible) {
  if (!element) return;
  element.hidden = !visible;
}

function setTime(element, date) {
  if (!element || !(date instanceof Date) || Number.isNaN(date.getTime())) {
    return;
  }
  element.dateTime = date.toISOString();
  element.textContent = formatTimestamp(date);
}

function formatTimestamp(date) {
  const formatter = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  return formatter.format(date);
}

function maskKey(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "(not set)";
  }
  const trimmed = value.trim();
  if (trimmed.length <= 8) {
    return trimmed;
  }
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

function appendLog(tone, message, details) {
  if (!logContainer) return;
  const entry = document.createElement("article");
  entry.className = "admin__supabase-log-entry";
  entry.dataset.tone = tone;

  const header = document.createElement("header");
  header.className = "admin__supabase-log-entry__header";
  const timestamp = document.createElement("time");
  timestamp.dateTime = new Date().toISOString();
  timestamp.textContent = formatTimestamp(new Date(timestamp.dateTime));
  header.append(timestamp);

  const text = document.createElement("p");
  text.className = "admin__supabase-log-entry__message";
  text.textContent = message;
  header.append(text);

  entry.append(header);

  if (details != null) {
    const detailBlock = document.createElement("pre");
    detailBlock.className = "admin__supabase-log-entry__details";
    detailBlock.textContent =
      typeof details === "string" ? details : JSON.stringify(details, null, 2);
    entry.append(detailBlock);
  }

  logContainer.prepend(entry);
}

function clearLog() {
  if (!logContainer) return;
  logContainer.innerHTML = "";
}

function describeLatest(latest) {
  if (!latest || typeof latest !== "object") {
    return "No recent updates found.";
  }

  const name = typeof latest.name === "string" && latest.name.trim() ? latest.name.trim() : latest.id;
  const updatedAt = latest.updated_at || latest.created_at;
  if (!updatedAt) {
    return name ? `Latest row: ${name}` : "Latest row loaded.";
  }

  try {
    const formattedDate = formatTimestamp(new Date(updatedAt));
    return name ? `${name} — updated ${formattedDate}` : `Updated ${formattedDate}`;
  } catch (error) {
    console.warn("[debug] Failed to format latest row timestamp", error);
    return name ? `${name} — updated ${updatedAt}` : `Updated ${updatedAt}`;
  }
}

function formatError(error) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch (_) {
    return "Unknown error";
  }
}

function ensureSupabaseClient() {
  try {
    return getSupabaseClient();
  } catch (error) {
    appendLog("error", "Failed to initialise Supabase client.", formatError(error));
    throw error;
  }
}

async function querySupabaseOverview(limit = 5) {
  const client = ensureSupabaseClient();
  const query = client
    .from("products")
    .select("id, name, updated_at, created_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  const { data, error, count } = await query;
  if (error) {
    throw error;
  }

  const rows = Array.isArray(data) ? data : [];
  return {
    count: typeof count === "number" ? count : null,
    latest: rows.length ? rows[0] : null,
    rows
  };
}

async function fetchLocalCatalogCount() {
  try {
    const response = await fetch("products.json", { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return Array.isArray(data) ? data.length : null;
  } catch (error) {
    appendLog("warning", "Failed to inspect local products.json.", formatError(error));
    return null;
  }
}

async function runConfigCheck() {
  if (!configButton) return;
  configButton.disabled = true;
  setIndicatorTone(configIndicator, "info");
  setStatus(configStatusEl, "Checking configuration…");
  appendLog("info", "Checking Supabase configuration values.");

  try {
    const configured = isSupabaseConfigured();
    const urlSummary = typeof SUPABASE_URL === "string" ? SUPABASE_URL : "(not set)";
    const anonSummary = maskKey(SUPABASE_ANON_KEY);

    setDetailsVisibility(configDetailsEl, true);
    if (configUrlEl) {
      configUrlEl.textContent = urlSummary;
    }
    if (configKeyEl) {
      configKeyEl.textContent = anonSummary;
    }

    if (configured) {
      setIndicatorTone(configIndicator, "success");
      setStatus(configStatusEl, "Supabase client is configured. Values shown below are in use for this session.");
      appendLog("success", "Supabase configuration looks valid.", { url: urlSummary, anonKey: anonSummary });
    } else {
      setIndicatorTone(configIndicator, "danger");
      setStatus(
        configStatusEl,
        "Supabase configuration appears to be using the bundled fallback. Update the URL and anon key to match your project."
      );
      appendLog("error", "Supabase configuration is using fallback values.", { url: urlSummary, anonKey: anonSummary });
    }
  } catch (error) {
    setIndicatorTone(configIndicator, "danger");
    const message = `Configuration check failed: ${formatError(error)}`;
    setStatus(configStatusEl, message);
    appendLog("error", message, error);
  } finally {
    configButton.disabled = false;
  }
}

async function runOverview() {
  if (!overviewButton) return;
  overviewButton.disabled = true;
  setIndicatorTone(overviewIndicator, "info");
  setStatus(overviewStatusEl, "Running Supabase overview query…");
  setDetailsVisibility(overviewDetailsEl, false);
  setDetailsVisibility(overviewUpdatedEl, false);
  appendLog("info", "Fetching latest products from Supabase.");

  try {
    const overview = await querySupabaseOverview();
    const now = new Date();

    setDetailsVisibility(overviewDetailsEl, true);
    if (overviewCountEl) {
      overviewCountEl.textContent = overview.count == null ? "Unknown" : String(overview.count);
    }
    if (overviewLatestEl) {
      overviewLatestEl.textContent = describeLatest(overview.latest);
    }
    setDetailsVisibility(overviewUpdatedEl, true);
    setTime(overviewTimeEl, now);

    const statusMessage =
      overview.count == null
        ? "Overview loaded, but Supabase did not return a total count."
        : `Supabase returned ${overview.count} product${overview.count === 1 ? "" : "s"}.`;

    setIndicatorTone(overviewIndicator, "success");
    setStatus(overviewStatusEl, statusMessage);
    appendLog("success", statusMessage, overview.rows);
  } catch (error) {
    const message = `Overview query failed: ${formatError(error)}`;
    setIndicatorTone(overviewIndicator, "danger");
    setStatus(overviewStatusEl, message);
    appendLog("error", message, error);
  } finally {
    overviewButton.disabled = false;
  }
}

async function runCompare() {
  if (!compareButton) return;
  compareButton.disabled = true;
  setIndicatorTone(compareIndicator, "info");
  setStatus(compareStatusEl, "Comparing Supabase and local catalog counts…");
  setDetailsVisibility(compareDetailsEl, false);
  setDetailsVisibility(compareUpdatedEl, false);
  appendLog("info", "Comparing Supabase count with products.json.");

  try {
    const [overview, localCount] = await Promise.all([querySupabaseOverview(1), fetchLocalCatalogCount()]);
    const now = new Date();

    setDetailsVisibility(compareDetailsEl, true);
    if (compareRemoteEl) {
      compareRemoteEl.textContent = overview.count == null ? "Unknown" : String(overview.count);
    }
    if (compareLocalEl) {
      compareLocalEl.textContent = localCount == null ? "Unknown" : String(localCount);
    }
    setDetailsVisibility(compareUpdatedEl, true);
    setTime(compareTimeEl, now);

    let statusMessage = "Comparison complete.";
    if (overview.count != null && localCount != null) {
      if (overview.count === localCount) {
        statusMessage = `Counts match. Both sources list ${overview.count} product${overview.count === 1 ? "" : "s"}.`;
      } else {
        const difference = overview.count - localCount;
        const moreOrLess = difference > 0 ? "more" : "fewer";
        statusMessage = `Supabase has ${Math.abs(difference)} ${moreOrLess} product${
          Math.abs(difference) === 1 ? "" : "s"
        } than products.json.`;
      }
    } else if (overview.count != null) {
      statusMessage = `Supabase returned ${overview.count} product${overview.count === 1 ? "" : "s"}, but products.json could not be read.`;
    } else if (localCount != null) {
      statusMessage = `products.json contains ${localCount} product${localCount === 1 ? "" : "s"}, but Supabase did not return a count.`;
    }

    setIndicatorTone(compareIndicator, "success");
    setStatus(compareStatusEl, statusMessage);
    appendLog("success", statusMessage, {
      supabaseCount: overview.count,
      localCount,
      latest: overview.latest
    });
  } catch (error) {
    const message = `Comparison failed: ${formatError(error)}`;
    setIndicatorTone(compareIndicator, "danger");
    setStatus(compareStatusEl, message);
    appendLog("error", message, error);
  } finally {
    compareButton.disabled = false;
  }
}

if (configButton) {
  configButton.addEventListener("click", runConfigCheck);
}

if (overviewButton) {
  overviewButton.addEventListener("click", runOverview);
}

if (compareButton) {
  compareButton.addEventListener("click", runCompare);
}

if (clearLogButton) {
  clearLogButton.addEventListener("click", clearLog);
}

// Auto-run the configuration check when the page loads to surface missing credentials quickly.
if (document.readyState === "complete" || document.readyState === "interactive") {
  runConfigCheck();
} else {
  document.addEventListener("DOMContentLoaded", runConfigCheck);
}
