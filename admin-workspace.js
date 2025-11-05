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
  const PAGE_PATH = ADMIN_WORKSPACE_PATH || "admin_dashboard.html#customer-service";

  const sections = {
    loading: document.querySelector("[data-admin-workspace-loading]"),
    unauthorized: document.querySelector("[data-admin-workspace-unauthorized]"),
    content: document.querySelector("[data-admin-workspace-content]")
  };

  const messageEl = document.querySelector("[data-admin-workspace-message]");
  const customerServiceForm = document.querySelector(
    "[data-admin-customer-service-form]"
  );
  const customerServiceInput = customerServiceForm?.querySelector(
    "input[name='google-web-app-url']"
  );
  const customerServiceEmbed = document.querySelector(
    "[data-admin-customer-service-embed]"
  );
  const customerServicePlaceholder = document.querySelector(
    "[data-admin-customer-service-placeholder]"
  );

  const STORAGE_KEY = "harmonySheets.adminCustomerService.webAppUrl";
  let currentEmbedFrame = null;
  let customerServiceInitialized = false;

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
        "You need to sign in with an admin account to view the customer service workspace.",
        redirectUrl
      );
      return false;
    }

    if (!isAdminUser(user)) {
      handleUnauthorized(
        "The customer service workspace is only available to Harmony Sheets admins.",
        ACCOUNT_PAGE_PATH
      );
      return false;
    }

    showSection("content");
    initializeCustomerServiceEmbed();
    return true;
  }

  function sanitizeUrl(value) {
    if (!value || typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = new URL(trimmed, window.location.origin);
      if (!parsed.protocol.startsWith("http")) {
        return null;
      }
      return parsed.toString();
    } catch (_error) {
      return null;
    }
  }

  function saveEmbedUrl(url) {
    try {
      if (!url) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, url);
      }
    } catch (_error) {
      // localStorage might be unavailable (private mode, etc.)
    }
  }

  function loadStoredEmbedUrl() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return sanitizeUrl(stored);
    } catch (_error) {
      return null;
    }
  }

  function showPlaceholder() {
    if (customerServicePlaceholder) {
      customerServicePlaceholder.hidden = false;
    }
  }

  function hidePlaceholder() {
    if (customerServicePlaceholder) {
      customerServicePlaceholder.hidden = true;
    }
  }

  function clearCurrentEmbed() {
    if (currentEmbedFrame && currentEmbedFrame.parentElement) {
      currentEmbedFrame.parentElement.removeChild(currentEmbedFrame);
    }
    currentEmbedFrame = null;
  }

  function renderEmbed(url) {
    if (!customerServiceEmbed) return;

    const sanitized = sanitizeUrl(url);
    if (!sanitized) {
      clearCurrentEmbed();
      showPlaceholder();
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.src = sanitized;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer";
    iframe.title = "Google Sheets customer service dashboard";
    iframe.setAttribute("data-admin-customer-service-frame", "");
    iframe.className = "admin-customer-service__frame";

    clearCurrentEmbed();
    hidePlaceholder();
    customerServiceEmbed.appendChild(iframe);
    currentEmbedFrame = iframe;
  }

  function initializeCustomerServiceEmbed() {
    if (!customerServiceEmbed || customerServiceInitialized) return;

    customerServiceInitialized = true;

    const storedUrl = loadStoredEmbedUrl();
    if (storedUrl && customerServiceInput) {
      customerServiceInput.value = storedUrl;
    }
    renderEmbed(storedUrl);

    if (customerServiceForm) {
      customerServiceForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(customerServiceForm);
        const submittedUrl = sanitizeUrl(formData.get("google-web-app-url"));

        if (!submittedUrl) {
          customerServiceInput?.focus();
          renderEmbed(null);
          saveEmbedUrl(null);
          return;
        }

        if (customerServiceInput) {
          customerServiceInput.value = submittedUrl;
        }

        saveEmbedUrl(submittedUrl);
        renderEmbed(submittedUrl);
      });
    }
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
      console.error("Unable to load session for admin customer service", error);
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
