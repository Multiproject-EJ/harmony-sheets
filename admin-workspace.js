import { isSupabaseConfigured } from "./supabase-config.js";
import {
  ACCOUNT_PAGE_PATH,
  ADMIN_WORKSPACE_PATH,
  isAdminUser
} from "./auth-helpers.js";
import { getSupabaseClient } from "./supabase-client.js";

const rootHook =
  document.querySelector("[data-admin-workspace-content]") ||
  document.querySelector("[data-admin-workspace-loading]") ||
  document.querySelector("[data-admin-workspace-unauthorized]");

if (!rootHook) {
  (function noop() {
    return;
  })();
} else {
  const PAGE_PATH = ADMIN_WORKSPACE_PATH || "admin_workspace.html";

  const sections = {
    loading: document.querySelector("[data-admin-workspace-loading]"),
    unauthorized: document.querySelector("[data-admin-workspace-unauthorized]"),
    content: document.querySelector("[data-admin-workspace-content]")
  };

  const messageEl = document.querySelector("[data-admin-workspace-message]");

  let supabaseClient = null;
  let authSubscription = null;
  let redirecting = false;

  function showSection(target) {
    Object.entries(sections).forEach(([key, element]) => {
      if (!element) return;
      element.hidden = key !== target;
    });
  }

  function redirectTo(target) {
    if (!target || redirecting) return;
    redirecting = true;
    window.location.replace(target);
    window.setTimeout(() => {
      redirecting = false;
    }, 0);
  }

  function handleUnauthorized(message, redirectTarget) {
    if (messageEl && message) {
      messageEl.textContent = message;
    }
    if (redirectTarget) {
      redirectTo(redirectTarget);
      return;
    }
    showSection("unauthorized");
  }

  function requireAdmin(user) {
    if (!user) {
      const redirectUrl = `login.html?redirect=${encodeURIComponent(PAGE_PATH)}`;
      handleUnauthorized(
        "You need to sign in with an admin account to view the admin workspace.",
        redirectUrl
      );
      return false;
    }

    if (!isAdminUser(user)) {
      handleUnauthorized(
        "The admin workspace is only available to Harmony Sheets admins.",
        ACCOUNT_PAGE_PATH
      );
      return false;
    }

    showSection("content");
    return true;
  }

  async function init() {
    showSection("loading");

    if (!isSupabaseConfigured()) {
      handleUnauthorized(
        "Supabase credentials are missing. Update supabase-config.js to enable admin access."
      );
      return;
    }

    supabaseClient = getSupabaseClient();

    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
      console.error("Unable to load session for admin workspace", error);
      handleUnauthorized(
        "We couldn't verify your admin access. Please try signing in again."
      );
      return;
    }

    const user = data.session?.user;
    if (!requireAdmin(user)) {
      return;
    }

    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user;
        if (!requireAdmin(currentUser)) {
          if (!currentUser) {
            const redirectUrl = `login.html?redirect=${encodeURIComponent(PAGE_PATH)}`;
            redirectTo(redirectUrl);
          } else {
            redirectTo(ACCOUNT_PAGE_PATH);
          }
        }
      }
    );
    authSubscription = listener?.subscription || null;
  }

  init();

  window.addEventListener("beforeunload", () => {
    authSubscription?.unsubscribe?.();
  });
}
