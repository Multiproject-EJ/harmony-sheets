import { isSupabaseConfigured } from "./supabase-config.js";
import {
  ACCOUNT_PAGE_PATH,
  ADMIN_DASHBOARD_PATH,
  getPostSignInRedirect,
  isAdminUser
} from "./auth-helpers.js";
import { getSupabaseClient } from "./supabase-client.js";

const sections = {
  loading: document.querySelector("[data-account-loading]"),
  view: document.querySelector("[data-account-view]"),
  empty: document.querySelector("[data-account-empty]"),
  error: document.querySelector("[data-account-error]")
};

const statusEl = document.querySelector("[data-account-status]");
const greetingEl = document.querySelector("[data-account-greeting]");
const errorMessageEl = document.querySelector("[data-account-error-message]");
const emailEl = document.querySelector("[data-account-email]");
const planEl = document.querySelector("[data-account-plan]");
const joinedEl = document.querySelector("[data-account-joined]");
const lastSignInEl = document.querySelector("[data-account-last-sign-in]");
const nameEl = document.querySelector("[data-account-name]");
const signOutButton = document.querySelector("[data-account-signout]");
const downloadsList = document.querySelector("[data-account-downloads]");
const downloadsEmptyEl = document.querySelector("[data-account-downloads-empty]");
const purchasesList = document.querySelector("[data-account-purchases]");
const purchasesEmptyEl = document.querySelector("[data-account-purchases-empty]");

let supabaseClient = null;
let isMounted = true;
let redirectingToAdmin = false;

function showSection(targetKey) {
  Object.entries(sections).forEach(([key, element]) => {
    if (!element) return;
    element.hidden = key !== targetKey;
  });
}

function setStatus(type, message) {
  if (!statusEl) return;
  if (!message) {
    statusEl.dataset.state = "";
    statusEl.textContent = "";
    return;
  }
  statusEl.dataset.state = type;
  statusEl.textContent = message;
}

function formatDate(value) {
  if (!value) return "—";
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date);
  } catch (error) {
    return "—";
  }
}

function formatPlan(plan) {
  if (!plan) return "Freemium";
  const normalized = String(plan).trim();
  if (!normalized) return "Freemium";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function setTextContent(element, value) {
  if (!element) return;
  element.textContent = value || "—";
}

function updateGreeting(name, plan) {
  if (!greetingEl) return;
  if (name) {
    greetingEl.textContent = `Here are your ${formatPlan(plan).toLowerCase()} Harmony Sheets, ${name}.`;
  } else {
    greetingEl.textContent = `Here are your ${formatPlan(plan).toLowerCase()} Harmony Sheets details.`;
  }
}

function getPreferredName(user, profile) {
  const sources = [
    profile?.full_name,
    user?.user_metadata?.full_name,
    user?.user_metadata?.name,
    user?.app_metadata?.full_name,
    user?.app_metadata?.name
  ];
  for (const value of sources) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function normalizePurchaseRecord(record) {
  if (!record || typeof record !== "object") {
    return null;
  }
  const createdAt = record.created_at || record.fulfilled_at || record.inserted_at || record.completed_at || record.purchased_at;
  const downloadUrl =
    record.download_url || record.downloadUrl || record.file_url || record.fileUrl || record.url || record.share_link;
  const reference =
    record.reference || record.order_reference || record.order_id || record.orderId || record.invoice_number || record.id;
  let priceValue = record.price ?? record.amount ?? record.total;
  if (typeof priceValue === "string") {
    const parsed = parseFloat(priceValue.replace(/[^0-9.-]/g, ""));
    priceValue = Number.isFinite(parsed) ? parsed : null;
  } else if (!Number.isFinite(priceValue)) {
    priceValue = null;
  }
  const currency = record.currency || record.currency_code || "USD";
  const name =
    record.product_name ||
    record.product_title ||
    record.product ||
    record.name ||
    record.product_id ||
    record.productId ||
    "Harmony Sheets template";

  return {
    id: record.id || reference || name,
    name,
    createdAt,
    downloadUrl,
    reference,
    priceValue,
    currency
  };
}

function formatPrice(value, currency = "USD") {
  const formatter = window.App?.currencyFormatter;
  if (formatter && typeof formatter.format === "function" && String(currency).toUpperCase() === "USD") {
    return formatter.format(value ?? 0);
  }
  const safeValue = typeof value === "number" && Number.isFinite(value) ? value : Number(value) || 0;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(safeValue);
  } catch (error) {
    return `$${safeValue.toFixed(2)}`;
  }
}

function renderList(listElement, emptyElement, items, { isDownload = false } = {}) {
  if (!listElement || !emptyElement) return;
  listElement.innerHTML = "";

  if (!Array.isArray(items) || !items.length) {
    listElement.hidden = true;
    emptyElement.hidden = false;
    return;
  }

  emptyElement.hidden = true;
  listElement.hidden = false;

  items.forEach(item => {
    const li = document.createElement("li");
    li.className = "account-list__item";

    const details = document.createElement("div");
    details.className = "account-list__details";

    const title = document.createElement("strong");
    title.textContent = item.name || "Harmony Sheets template";
    details.appendChild(title);

    const metaParts = [];
    if (item.createdAt) {
      metaParts.push(isDownload ? `Added ${formatDate(item.createdAt)}` : `Purchased ${formatDate(item.createdAt)}`);
    }
    if (!isDownload && item.reference) {
      metaParts.push(`Order #${String(item.reference).slice(0, 10)}`);
    }
    if (!isDownload && typeof item.priceValue !== "undefined" && item.priceValue !== null) {
      metaParts.push(formatPrice(item.priceValue, item.currency));
    }
    if (metaParts.length) {
      const meta = document.createElement("span");
      meta.className = "account-list__meta";
      meta.textContent = metaParts.join(" • ");
      details.appendChild(meta);
    }

    li.appendChild(details);

    if (isDownload && item.downloadUrl) {
      const link = document.createElement("a");
      link.className = "account-list__action";
      link.href = item.downloadUrl;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Download copy";
      li.appendChild(link);
    }

    listElement.appendChild(li);
  });
}

async function loadProfile(user) {
  if (!supabaseClient) return null;
  try {
    const baseQuery = supabaseClient
      .from("profiles")
      .select("full_name, plan, created_at")
      .eq("id", user.id);
    const { data, error } =
      typeof baseQuery.maybeSingle === "function"
        ? await baseQuery.maybeSingle()
        : await baseQuery.single();
    if (error) {
      if (error.code === "42P01" || error.code === "PGRST116") {
        return null;
      }
      throw error;
    }
    return data || null;
  } catch (error) {
    console.warn("Unable to load profile", error);
    setStatus("error", "We couldn't load your profile details. Try refreshing the page.");
    return null;
  }
}

async function loadPurchases(user) {
  if (!supabaseClient) return [];
  try {
    let query = supabaseClient
      .from("purchases")
      .select("id, product_name, product_title, product_id, created_at, fulfilled_at, download_url, downloadUrl, reference, price, amount, total, currency, currency_code")
      .order("created_at", { ascending: false });

    const filterClause = `user_id.eq.${user.id},profile_id.eq.${user.id}`;
    if (typeof query.or === "function") {
      query = query.or(filterClause);
    } else {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;
    if (error) {
      if (error.code === "42P01" || error.code === "PGRST116") {
        return [];
      }
      throw error;
    }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Unable to load purchases", error);
    setStatus("error", "We couldn't load your purchase history. Please try again later.");
    return [];
  }
}

async function hydrateAccount(user) {
  if (!isMounted) return;
  if (!user) {
    showSection("empty");
    setStatus("", "");
    if (signOutButton) {
      signOutButton.hidden = true;
      signOutButton.disabled = false;
    }
    return;
  }

  if (isAdminUser(user)) {
    const target = getPostSignInRedirect(user, ADMIN_DASHBOARD_PATH);
    const currentPath = window.location.pathname.replace(/^\/+/, "");
    if (!currentPath.startsWith(ADMIN_DASHBOARD_PATH) && !redirectingToAdmin) {
      redirectingToAdmin = true;
      window.location.href = target;
      window.setTimeout(() => {
        redirectingToAdmin = false;
      }, 0);
    }
    return;
  }

  showSection("view");
  setStatus("", "");

  const profilePromise = loadProfile(user);
  const purchasesPromise = loadPurchases(user);

  setTextContent(emailEl, user.email || "—");
  setTextContent(planEl, formatPlan(user.user_metadata?.plan || user.app_metadata?.plan));
  setTextContent(joinedEl, formatDate(user.created_at));
  setTextContent(lastSignInEl, formatDate(user.last_sign_in_at));

  const profile = await profilePromise;
  if (profile) {
    setTextContent(planEl, formatPlan(profile.plan));
    setTextContent(joinedEl, formatDate(profile.created_at));
  }

  const preferredName = getPreferredName(user, profile);
  setTextContent(nameEl, preferredName || "—");
  updateGreeting(preferredName, profile?.plan || user.user_metadata?.plan || user.app_metadata?.plan);

  const purchases = await purchasesPromise;
  const normalized = purchases
    .map(normalizePurchaseRecord)
    .filter(Boolean);
  const downloads = normalized.filter(item => Boolean(item.downloadUrl));

  renderList(downloadsList, downloadsEmptyEl, downloads, { isDownload: true });
  renderList(purchasesList, purchasesEmptyEl, normalized);

  if (signOutButton) {
    signOutButton.hidden = false;
    signOutButton.disabled = false;
  }
}

function initSupabase() {
  if (!isSupabaseConfigured()) {
    showSection("error");
    if (errorMessageEl) {
      errorMessageEl.textContent = "Supabase credentials are missing. Update supabase-config.js to view your Harmony Sheets account.";
    }
    return;
  }

  supabaseClient = getSupabaseClient();

  if (signOutButton) {
    signOutButton.addEventListener("click", async () => {
      if (!supabaseClient) return;
      signOutButton.disabled = true;
      try {
        await supabaseClient.auth.signOut();
        window.location.href = `login.html?redirect=${encodeURIComponent(ACCOUNT_PAGE_PATH)}`;
      } catch (error) {
        console.warn("Unable to sign out", error);
        setStatus("error", "We couldn't sign you out. Please try again.");
        signOutButton.disabled = false;
      }
    });
  }

  supabaseClient.auth
    .getSession()
    .then(({ data }) => {
      if (!isMounted) return;
      const user = data.session?.user;
      if (!user) {
        showSection("empty");
        return;
      }
      hydrateAccount(user);
    })
    .catch(error => {
      console.warn("Unable to fetch session", error);
      showSection("error");
      if (errorMessageEl) {
        errorMessageEl.textContent = "We couldn't verify your session. Try signing in again.";
      }
    });

  const { data: listener } = supabaseClient.auth.onAuthStateChange((event, session) => {
    if (!isMounted) return;
    if (event === "SIGNED_OUT") {
      showSection("empty");
      setStatus("", "");
      if (signOutButton) {
        signOutButton.hidden = true;
        signOutButton.disabled = false;
      }
      return;
    }
    if (event === "SIGNED_IN") {
      hydrateAccount(session?.user || null);
    }
  });

  window.addEventListener("beforeunload", () => {
    listener?.subscription?.unsubscribe();
  });
}

function init() {
  showSection("loading");
  initSupabase();
}

document.addEventListener("DOMContentLoaded", init);

window.addEventListener("unload", () => {
  isMounted = false;
});

export {};
