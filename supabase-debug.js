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
const summaryForm = root?.querySelector("[data-debug-summary-form]");
const summaryFields = summaryForm
  ? Array.from(summaryForm.querySelectorAll("[data-debug-summary-field]"))
  : [];
const summaryStatusEl = root?.querySelector("[data-debug-summary-status]");
const summaryClearButton = root?.querySelector("[data-debug-summary-clear]");
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

const permissionStatusEl = root?.querySelector("[data-debug-permission-status]");
const permissionDetailsEl = root?.querySelector("[data-debug-permission-details]");
const permissionSlugEl = root?.querySelector("[data-debug-permission-slug]");
const permissionIdEl = root?.querySelector("[data-debug-permission-id]");
const permissionUpdatedEl = root?.querySelector("[data-debug-permission-updated]");
const permissionTimeEl = root?.querySelector("[data-debug-permission-time]");
const permissionButton = root?.querySelector("[data-debug-run-permission]");
const permissionIndicator = root?.querySelector('[data-debug-section="permissions"] [data-debug-indicator]');

const sqlStatusEl = root?.querySelector("[data-debug-sql-status]");
const sqlDescriptionEl = root?.querySelector("[data-debug-sql-description]");
const sqlTemplateSelect = root?.querySelector("[data-debug-sql-template]");
const sqlTextarea = root?.querySelector("[data-debug-sql-editor]");
const sqlCopyButton = root?.querySelector("[data-debug-sql-copy]");
const sqlResetButton = root?.querySelector("[data-debug-sql-reset]");
const sqlIndicator = root?.querySelector('[data-debug-section="sql"] [data-debug-indicator]');

const clearLogButton = root?.querySelector("[data-debug-clear-log]");
const copyLogButton = root?.querySelector("[data-debug-copy-log]");

const CATALOG_TABLES = [
  "products",
  "product_badges",
  "product_benefits",
  "product_features",
  "product_faqs",
  "product_gallery",
  "product_included_items",
  "product_life_areas",
  "product_social_proof"
];

const SQL_TABLE_LIST = CATALOG_TABLES.map((table) => `'${table}'`).join(",\n    ");
const SQL_ARRAY_LIST = `ARRAY[${CATALOG_TABLES.map((table) => `'${table}'`).join(", ")}]`;

const SQL_SNIPPETS = [
  {
    id: "catalog_policy_overview",
    label: "Inspect RLS policies for catalog tables",
    description:
      "Lists row-level security policies currently applied to the catalog tables so you can confirm admin access rules.",
    statement: String.raw`select
  tablename,
  policyname,
  permissive,
  roles,
  command,
  using,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    ${SQL_TABLE_LIST}
  )
order by tablename, policyname;`
  },
  {
    id: "catalog_table_privileges",
    label: "Table privileges for current Supabase role",
    description:
      "Shows which INSERT, UPDATE, and DELETE privileges the signed-in role has on every catalog table.",
    statement: String.raw`select
  table_name,
  has_table_privilege(current_user, format('public.%s', table_name), 'INSERT') as can_insert,
  has_table_privilege(current_user, format('public.%s', table_name), 'UPDATE') as can_update,
  has_table_privilege(current_user, format('public.%s', table_name), 'DELETE') as can_delete
from unnest(${SQL_ARRAY_LIST}) as table_name
order by table_name;`
  },
  {
    id: "catalog_grants",
    label: "Granted privileges from information_schema",
    description:
      "Queries information_schema.table_privileges to confirm how Supabase granted rights to the current role.",
    statement: String.raw`select
  table_name,
  privilege_type,
  is_grantable
from information_schema.table_privileges
where table_schema = 'public'
  and grantee = current_user
  and table_name in (
    ${SQL_TABLE_LIST}
  )
order by table_name, privilege_type;`
  },
  {
    id: "catalog_row_health",
    label: "Row counts and orphan detection",
    description:
      "Counts rows for each catalog table and highlights related rows whose product_id no longer matches a product.",
    statement: String.raw`with counts as (
  select 'products' as table_name, count(*) as row_count from products
  union all select 'product_badges', count(*) from product_badges
  union all select 'product_benefits', count(*) from product_benefits
  union all select 'product_features', count(*) from product_features
  union all select 'product_faqs', count(*) from product_faqs
  union all select 'product_gallery', count(*) from product_gallery
  union all select 'product_included_items', count(*) from product_included_items
  union all select 'product_life_areas', count(*) from product_life_areas
  union all select 'product_social_proof', count(*) from product_social_proof
),
orphans as (
  select 'product_badges' as table_name, count(*) as orphan_rows
  from product_badges pb
  left join products p on pb.product_id = p.id
  where p.id is null
  union all
  select 'product_benefits', count(*)
  from product_benefits pb
  left join products p on pb.product_id = p.id
  where p.id is null
  union all
  select 'product_features', count(*)
  from product_features pf
  left join products p on pf.product_id = p.id
  where p.id is null
  union all
  select 'product_faqs', count(*)
  from product_faqs pf
  left join products p on pf.product_id = p.id
  where p.id is null
  union all
  select 'product_gallery', count(*)
  from product_gallery pg
  left join products p on pg.product_id = p.id
  where p.id is null
  union all
  select 'product_included_items', count(*)
  from product_included_items pii
  left join products p on pii.product_id = p.id
  where p.id is null
  union all
  select 'product_life_areas', count(*)
  from product_life_areas pla
  left join products p on pla.product_id = p.id
  where p.id is null
  union all
  select 'product_social_proof', count(*)
  from product_social_proof psp
  left join products p on psp.product_id = p.id
  where p.id is null
)
select
  c.table_name,
  c.row_count,
  coalesce(o.orphan_rows, 0) as orphan_rows
from counts c
left join orphans o on c.table_name = o.table_name
order by c.table_name;`
  }
];

const SUMMARY_STORAGE_KEY = "hs-debug-summary-v1";
let summarySaveHandle = null;
let activeSqlSnippetId = SQL_SNIPPETS[0]?.id ?? null;
let isSqlDirty = false;

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

function setSummaryStatus(message) {
  if (summaryStatusEl) {
    summaryStatusEl.textContent = message;
  }
}

function setSqlStatus(message, tone = null) {
  if (sqlStatusEl) {
    sqlStatusEl.textContent = message;
  }
  if (tone) {
    setIndicatorTone(sqlIndicator, tone);
  }
}

function loadSummaryFromStorage() {
  if (!summaryFields.length) return;

  try {
    const stored = localStorage.getItem(SUMMARY_STORAGE_KEY);
    if (!stored) {
      setSummaryStatus("Summary is ready to edit.");
      return;
    }

    const parsed = JSON.parse(stored);
    for (const field of summaryFields) {
      const key = field.dataset.debugSummaryField;
      const value = key && typeof parsed[key] === "string" ? parsed[key] : "";
      field.value = value;
    }

    if (parsed.updatedAt) {
      const updatedAt = new Date(parsed.updatedAt);
      if (!Number.isNaN(updatedAt.getTime())) {
        setSummaryStatus(`Summary loaded. Last saved ${formatTimestamp(updatedAt)}.`);
        return;
      }
    }
    setSummaryStatus("Summary loaded from a previous session.");
  } catch (error) {
    setSummaryStatus("Could not load saved summary from local storage.");
    appendLog("warning", "Failed to load debug summary.", formatError(error));
  }
}

function persistSummary() {
  if (!summaryFields.length) return;

  const payload = {};
  let hasContent = false;

  for (const field of summaryFields) {
    const key = field.dataset.debugSummaryField;
    if (!key) continue;
    payload[key] = field.value;
    if (!hasContent && typeof field.value === "string" && field.value.trim()) {
      hasContent = true;
    }
  }

  try {
    if (!hasContent) {
      localStorage.removeItem(SUMMARY_STORAGE_KEY);
      setSummaryStatus("Summary is empty. Add notes to save them locally.");
      return;
    }

    const timestamp = new Date();
    payload.updatedAt = timestamp.toISOString();
    localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(payload));
    setSummaryStatus(`Saved locally at ${formatTimestamp(timestamp)}.`);
  } catch (error) {
    setSummaryStatus("Could not save summary (local storage is unavailable).");
    appendLog("warning", "Failed to persist debug summary.", formatError(error));
  }
}

function scheduleSummarySave() {
  if (!summaryFields.length) return;
  if (summarySaveHandle) {
    clearTimeout(summarySaveHandle);
  }
  summarySaveHandle = setTimeout(() => {
    summarySaveHandle = null;
    persistSummary();
  }, 400);
}

function handleSummaryInput() {
  scheduleSummarySave();
}

function clearSummary() {
  if (!summaryFields.length) return;

  if (summarySaveHandle) {
    clearTimeout(summarySaveHandle);
    summarySaveHandle = null;
  }

  for (const field of summaryFields) {
    field.value = "";
  }

  try {
    localStorage.removeItem(SUMMARY_STORAGE_KEY);
    setSummaryStatus("Summary cleared. Start capturing new notes.");
  } catch (error) {
    setSummaryStatus("Summary cleared, but local storage could not be updated.");
    appendLog("warning", "Failed to fully clear debug summary from storage.", formatError(error));
    return;
  }

  appendLog("info", "Debug summary cleared.");
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

function generateTestSlug() {
  const random = Math.random().toString(36).slice(2, 8);
  const timestamp = Date.now().toString(36);
  return `debug-${timestamp}-${random}`;
}

function buildTestProduct(slug, now) {
  return {
    slug,
    name: `Debug diagnostics ${slug.slice(-4)}`,
    tagline: "Temporary row created by supabase-debug",
    description: "This product verifies Supabase permissions and is deleted immediately after the test.",
    price_amount: 0,
    price_currency: "USD",
    price_display: "$0.00",
    draft: true,
    hero_image: null,
    color_image: null,
    color_caption: null,
    demo_video: null,
    demo_poster: null,
    virtual_demo: null,
    pricing_title: null,
    pricing_sub: null,
    stripe_url: null,
    etsy_url: null,
    updated_at: now.toISOString()
  };
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

function buildLogTranscript() {
  if (!logContainer) return "";
  const entries = Array.from(logContainer.querySelectorAll(".admin__supabase-log-entry"));
  if (!entries.length) {
    return "";
  }

  return entries
    .slice()
    .reverse()
    .map((entry) => {
      const tone = entry.getAttribute("data-tone") ?? "info";
      const timeEl = entry.querySelector("time");
      const messageEl = entry.querySelector(".admin__supabase-log-entry__message");
      const detailsEl = entry.querySelector(".admin__supabase-log-entry__details");

      const iso = timeEl?.dateTime;
      let timestamp = timeEl?.textContent ?? "";
      if (iso) {
        const parsed = new Date(iso);
        if (!Number.isNaN(parsed.getTime())) {
          timestamp = parsed.toISOString();
        }
      }

      const message = messageEl?.textContent ?? "";
      const lines = [`[${timestamp}] (${tone}) ${message}`];

      if (detailsEl?.textContent) {
        const detailLines = detailsEl.textContent.split("\n").map((line) => `  ${line}`);
        lines.push(detailLines.join("\n"));
      }

      return lines.join("\n");
    })
    .join("\n\n");
}

async function copyToClipboard(text) {
  if (typeof text !== "string") {
    throw new Error("Clipboard payload must be a string.");
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (!document?.body) {
    throw new Error("Clipboard API is unavailable in this environment.");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);

  const selection = document.getSelection();
  const previousRange = selection?.rangeCount ? selection.getRangeAt(0) : null;

  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const succeeded = document.execCommand("copy");

  textarea.remove();
  if (selection) {
    selection.removeAllRanges();
    if (previousRange) {
      selection.addRange(previousRange);
    }
  }

  if (!succeeded) {
    throw new Error("Copy command was blocked by the browser.");
  }
}

async function copyLogToClipboard() {
  if (!logContainer) return;

  const transcript = buildLogTranscript();
  if (!transcript.trim()) {
    appendLog("info", "Debug log is empty. Run a test before copying.");
    return;
  }

  try {
    const entryCount = logContainer.childElementCount;
    await copyToClipboard(transcript);
    appendLog("success", "Debug log copied to clipboard.", { entries: entryCount });
  } catch (error) {
    appendLog("error", "Failed to copy debug log to clipboard.", formatError(error));
  }
}

function getSqlSnippet(snippetId) {
  if (!SQL_SNIPPETS.length) {
    return null;
  }
  if (snippetId) {
    const found = SQL_SNIPPETS.find((snippet) => snippet.id === snippetId);
    if (found) {
      return found;
    }
  }
  return SQL_SNIPPETS[0];
}

function applySqlSnippet(snippet) {
  if (!snippet) return;
  activeSqlSnippetId = snippet.id;
  if (sqlTemplateSelect) {
    sqlTemplateSelect.value = snippet.id;
  }
  if (sqlTextarea) {
    sqlTextarea.value = snippet.statement;
    sqlTextarea.disabled = false;
  }
  if (sqlDescriptionEl) {
    sqlDescriptionEl.textContent = snippet.description;
  }
  isSqlDirty = false;
}

function initialiseSqlSection() {
  if (!sqlTemplateSelect || !sqlTextarea || !sqlStatusEl) {
    return;
  }

  if (!SQL_SNIPPETS.length) {
    sqlTemplateSelect.innerHTML = "";
    sqlTemplateSelect.disabled = true;
    if (sqlDescriptionEl) {
      sqlDescriptionEl.textContent = "Add entries to SQL_SNIPPETS in supabase-debug.js to expose presets here.";
    }
    sqlTextarea.value = "";
    sqlTextarea.placeholder = "No SQL presets are defined yet.";
    sqlTextarea.disabled = true;
    if (sqlCopyButton) sqlCopyButton.disabled = true;
    if (sqlResetButton) sqlResetButton.disabled = true;
    setSqlStatus("SQL presets are not configured.", "danger");
    return;
  }

  sqlTemplateSelect.disabled = false;
  sqlTextarea.disabled = false;
  if (sqlCopyButton) sqlCopyButton.disabled = false;
  if (sqlResetButton) sqlResetButton.disabled = false;

  sqlTemplateSelect.innerHTML = "";
  for (const snippet of SQL_SNIPPETS) {
    const option = document.createElement("option");
    option.value = snippet.id;
    option.textContent = snippet.label;
    sqlTemplateSelect.append(option);
  }

  const initialSnippet = getSqlSnippet(activeSqlSnippetId);
  applySqlSnippet(initialSnippet);
  setSqlStatus(
    initialSnippet
      ? `Loaded “${initialSnippet.label}”. Copy the snippet into Supabase to run it.`
      : "Select a SQL preset to begin.",
    "neutral"
  );
}

function handleSqlTemplateChange(event) {
  const snippet = getSqlSnippet(event?.target?.value);
  if (!snippet) return;
  applySqlSnippet(snippet);
  setSqlStatus(`Loaded preset “${snippet.label}”.`, "info");
  appendLog("info", `Loaded SQL preset: ${snippet.label}.`, { presetId: snippet.id });
}

function handleSqlEditorInput() {
  if (!sqlTextarea) return;
  isSqlDirty = true;
  setSqlStatus("SQL modified. Copy to share or run in Supabase.", "info");
}

async function handleSqlCopy() {
  if (!sqlTextarea) return;
  const text = sqlTextarea.value ?? "";
  if (!text.trim()) {
    setSqlStatus("SQL snippet is empty. Add content before copying.", "danger");
    appendLog("warning", "Attempted to copy an empty SQL snippet.");
    return;
  }

  try {
    await copyToClipboard(text);
    const snippet = getSqlSnippet(activeSqlSnippetId);
    const message = isSqlDirty
      ? "Copied modified SQL to clipboard."
      : snippet
      ? `Copied preset “${snippet.label}” to clipboard.`
      : "Copied SQL to clipboard.";
    setSqlStatus(message, "success");
    appendLog("success", message, {
      presetId: snippet?.id ?? null,
      preset: snippet?.label ?? null,
      modified: isSqlDirty,
      length: text.length
    });
  } catch (error) {
    const message = `Failed to copy SQL: ${formatError(error)}`;
    setSqlStatus(message, "danger");
    appendLog("error", message, formatError(error));
  }
}

function handleSqlReset() {
  const snippet = getSqlSnippet(activeSqlSnippetId);
  if (!snippet) {
    return;
  }
  applySqlSnippet(snippet);
  setSqlStatus(`Reset SQL editor to preset “${snippet.label}”.`, "info");
  appendLog("info", `SQL editor reset to preset: ${snippet.label}.`, { presetId: snippet.id });
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

async function runPermissionCheck() {
  if (!permissionButton) return;
  permissionButton.disabled = true;
  setIndicatorTone(permissionIndicator, "info");
  setStatus(permissionStatusEl, "Running Supabase permission test…");
  setDetailsVisibility(permissionDetailsEl, false);
  setDetailsVisibility(permissionUpdatedEl, false);
  appendLog("info", "Running Supabase permission test using temporary catalog rows.");

  let client;
  try {
    client = ensureSupabaseClient();
  } catch (error) {
    setIndicatorTone(permissionIndicator, "danger");
    const message = `Permission test failed: ${formatError(error)}`;
    setStatus(permissionStatusEl, message);
    appendLog("error", message, error);
    permissionButton.disabled = false;
    return;
  }

  const now = new Date();
  const slug = generateTestSlug();
  const productPayload = buildTestProduct(slug, now);
  let productId = null;
  let productInserted = false;
  let productDeleted = false;
  const touchedTables = [];
  const relationTemplates = [
    {
      table: "product_social_proof",
      buildRows: (id) => [{ product_id: id, quote: "Debug permission check", stars: "★★★★★" }]
    },
    {
      table: "product_life_areas",
      buildRows: (id) => [{ product_id: id, life_area: "Diagnostics", position: 1 }]
    },
    {
      table: "product_badges",
      buildRows: (id) => [{ product_id: id, badge: "Permission test", position: 1 }]
    },
    {
      table: "product_features",
      buildRows: (id) => [{ product_id: id, feature: "Able to insert", position: 1 }]
    },
    {
      table: "product_included_items",
      buildRows: (id) => [{ product_id: id, included_item: "Cleanup after test", position: 1 }]
    },
    {
      table: "product_gallery",
      buildRows: (id) => [
        { product_id: id, image_src: "diagnostics-placeholder.png", image_alt: "Diagnostics", position: 1 }
      ]
    },
    {
      table: "product_faqs",
      buildRows: (id) => [
        { product_id: id, question: "Why does this exist?", answer: "To verify Supabase policies.", position: 1 }
      ]
    },
    {
      table: "product_benefits",
      buildRows: (id) => [
        { product_id: id, title: "Confidence", description: "Confirms insert/delete permissions.", position: 1 }
      ]
    }
  ];

  try {
    const { data, error } = await client
      .from("products")
      .upsert(productPayload, { onConflict: "slug" })
      .select("id, slug")
      .single();

    if (error) {
      throw new Error(`Failed to insert test product: ${formatError(error)}`);
    }

    if (!data || !data.id) {
      throw new Error("Supabase did not return an ID for the test product.");
    }

    productId = data.id;
    productInserted = true;

    if (permissionSlugEl) {
      permissionSlugEl.textContent = slug;
    }
    if (permissionIdEl) {
      permissionIdEl.textContent = productId;
    }
    setDetailsVisibility(permissionDetailsEl, true);

    for (const { table, buildRows } of relationTemplates) {
      const rows = buildRows(productId);
      const { error: insertError } = await client.from(table).insert(rows);
      if (insertError) {
        throw new Error(`Failed to insert into ${table}: ${formatError(insertError)}`);
      }
      touchedTables.push(table);
    }

    for (const table of [...touchedTables].reverse()) {
      const { error: deleteError } = await client.from(table).delete().eq("product_id", productId);
      if (deleteError) {
        throw new Error(`Failed to delete test rows from ${table}: ${formatError(deleteError)}`);
      }
    }

    const { error: deleteProductError } = await client.from("products").delete().eq("id", productId);
    if (deleteProductError) {
      throw new Error(`Failed to delete test product: ${formatError(deleteProductError)}`);
    }
    productDeleted = true;

    const finishedAt = new Date();
    setDetailsVisibility(permissionUpdatedEl, true);
    setTime(permissionTimeEl, finishedAt);
    const message = "Permission checks passed. Supabase allowed catalog inserts and deletes.";
    setIndicatorTone(permissionIndicator, "success");
    setStatus(permissionStatusEl, message);
    appendLog("success", message, { slug, productId, tables: touchedTables });
  } catch (error) {
    setIndicatorTone(permissionIndicator, "danger");
    const message = `Permission test failed: ${formatError(error)}`;
    setStatus(permissionStatusEl, message);
    appendLog("error", message, { error: formatError(error), slug, productId, tables: touchedTables });
  } finally {
    if (productInserted && !productDeleted && productId) {
      const tablesToClean = relationTemplates.map((template) => template.table);

      for (const table of tablesToClean) {
        try {
          await client.from(table).delete().eq("product_id", productId);
        } catch (cleanupError) {
          appendLog("warning", `Cleanup failed for ${table}.`, formatError(cleanupError));
        }
      }

      try {
        await client.from("products").delete().eq("id", productId);
      } catch (cleanupError) {
        appendLog("warning", "Cleanup failed for products table.", formatError(cleanupError));
      }
    }

    permissionButton.disabled = false;
  }
}

if (summaryFields.length) {
  for (const field of summaryFields) {
    field.addEventListener("input", handleSummaryInput);
  }
  loadSummaryFromStorage();
}

if (summaryClearButton) {
  summaryClearButton.addEventListener("click", clearSummary);
}

if (sqlTemplateSelect) {
  sqlTemplateSelect.addEventListener("change", handleSqlTemplateChange);
}

if (sqlTextarea) {
  sqlTextarea.addEventListener("input", handleSqlEditorInput);
}

if (sqlCopyButton) {
  sqlCopyButton.addEventListener("click", handleSqlCopy);
}

if (sqlResetButton) {
  sqlResetButton.addEventListener("click", handleSqlReset);
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

if (permissionButton) {
  permissionButton.addEventListener("click", runPermissionCheck);
}

if (clearLogButton) {
  clearLogButton.addEventListener("click", clearLog);
}

if (copyLogButton) {
  copyLogButton.addEventListener("click", copyLogToClipboard);
}

initialiseSqlSection();

// Auto-run the configuration check when the page loads to surface missing credentials quickly.
if (document.readyState === "complete" || document.readyState === "interactive") {
  runConfigCheck();
} else {
  document.addEventListener("DOMContentLoaded", runConfigCheck);
}
