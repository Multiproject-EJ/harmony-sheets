import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.42.7/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";
import { ACCOUNT_PAGE_PATH, ADMIN_DASHBOARD_PATH, isAdminUser } from "./auth-helpers.js";

const PAGE_PATH = ADMIN_DASHBOARD_PATH || "admin_dashboard.html";

const sections = {
  loading: document.querySelector("[data-admin-dashboard-loading]"),
  unauthorized: document.querySelector("[data-admin-dashboard-unauthorized]"),
  content: document.querySelector("[data-admin-dashboard-content]")
};

const messageEl = document.querySelector("[data-admin-dashboard-message]");
const contentSection = sections.content;

let supabaseClient = null;
let authSubscription = null;
let editorLoaded = false;

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
  if (!target) return;
  window.location.replace(target);
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
  if (!isSupabaseConfigured()) {
    handleUnauthorized(
      "Supabase credentials are missing. Update supabase-config.js to enable admin access."
    );
    return;
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    const sessionUser = data?.session?.user || null;
    if (requireAdmin(sessionUser)) {
      await loadEditorModule();
    }
  } catch (error) {
    console.error("[admin] Failed to verify session", error);
    setUnauthorizedMessage("We couldn't verify your admin access. Please try signing in again.");
    showSection("unauthorized");
  }

  const { data: listener } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    const user = session?.user || null;
    if (!requireAdmin(user)) {
      return;
    }
    await loadEditorModule();
  });
  authSubscription = listener;
}

initialize();

window.addEventListener("beforeunload", () => {
  if (authSubscription && typeof authSubscription.subscription?.unsubscribe === "function") {
    authSubscription.subscription.unsubscribe();
  }
});
