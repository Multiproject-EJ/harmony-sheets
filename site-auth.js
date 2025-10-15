import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.42.7/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";

const accountItem = document.querySelector("[data-account-menu]");
const toggle = accountItem?.querySelector("[data-account-toggle]");
const dropdown = accountItem?.querySelector("[data-account-dropdown]");
const signOutButton = dropdown?.querySelector("[data-account-signout]");
const signOutDefaultLabel = signOutButton?.textContent?.trim() || "Log out";

const signedOutLabel = toggle?.dataset.authLabelSignedOut || "Log in/Sign up";
const signedInLabel = toggle?.dataset.authLabelSignedIn || "Account";

let supabaseClient = null;
let modalRefs = null;
let activeTab = "login";
let previousFocus = null;
let modalKeydownHandler = null;

function emitAuthState(authenticated, user) {
  document.dispatchEvent(
    new CustomEvent("account-auth-state", {
      detail: {
        authenticated,
        user: user || null,
        label: authenticated ? signedInLabel : signedOutLabel
      }
    })
  );
}

function getFocusableElements(container) {
  if (!container) return [];
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ];
  return Array.from(container.querySelectorAll(selectors.join(","))).filter(
    el => el.offsetParent !== null
  );
}

function setStatus(type, message) {
  if (!modalRefs) return;
  const status = modalRefs.status;
  if (!status) return;
  status.dataset.state = type || "";
  status.textContent = message || "";
}

function clearStatus() {
  setStatus("", "");
}

function setLoading(form, isLoading) {
  if (!form) return;
  const elements = form.querySelectorAll("input, button");
  elements.forEach(element => {
    element.disabled = isLoading;
  });
  const submit = form.querySelector("button[type='submit']");
  if (submit) {
    submit.dataset.loading = isLoading ? "true" : "false";
    const defaultText = submit.dataset.defaultText || submit.textContent;
    const loadingText = submit.dataset.loadingText || defaultText;
    submit.textContent = isLoading ? loadingText : defaultText;
  }
}

function updateSubmitLabels(form) {
  if (!form) return;
  const submit = form.querySelector("button[type='submit']");
  if (submit) {
    submit.dataset.defaultText = submit.textContent;
    if (form.dataset.authForm === "login") {
      submit.dataset.loadingText = "Signing in…";
    } else if (form.dataset.authForm === "signup") {
      submit.dataset.loadingText = "Creating account…";
    }
  }
}

function toggleTab(tab, { focusField = true } = {}) {
  if (!modalRefs) return;
  activeTab = tab;
  modalRefs.tabs.forEach(tabButton => {
    const isSelected = tabButton.dataset.authTab === tab;
    tabButton.classList.toggle("is-active", isSelected);
    tabButton.setAttribute("aria-selected", isSelected ? "true" : "false");
  });

  modalRefs.forms.forEach(form => {
    const isTarget = form.dataset.authForm === tab;
    form.hidden = !isTarget;
    form.setAttribute("aria-hidden", (!isTarget).toString());
    if (isTarget && focusField) {
      const firstInput = form.querySelector("input");
      if (firstInput) {
        requestAnimationFrame(() => firstInput.focus());
      }
    }
  });
  clearStatus();
}

function trapFocus(event) {
  if (!modalRefs || event.key !== "Tab") return;
  const focusable = getFocusableElements(modalRefs.dialog);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function closeModal() {
  if (!modalRefs || !modalRefs.root.classList.contains("is-open")) return;
  modalRefs.root.classList.remove("is-open");
  modalRefs.root.setAttribute("aria-hidden", "true");
  modalRefs.root.setAttribute("hidden", "");
  document.body.classList.remove("auth-modal-open");
  if (modalKeydownHandler && modalRefs.dialog) {
    modalRefs.dialog.removeEventListener("keydown", modalKeydownHandler);
  }
  modalKeydownHandler = null;
  if (previousFocus) {
    previousFocus.focus();
    previousFocus = null;
  }
  clearStatus();
}

function showModal(tab = "login") {
  if (!isSupabaseConfigured()) {
    window.location.href = "login.html";
    return;
  }

  if (!ensureModal()) return;

  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  modalRefs.root.removeAttribute("hidden");
  modalRefs.root.classList.add("is-open");
  modalRefs.root.setAttribute("aria-hidden", "false");
  document.body.classList.add("auth-modal-open");
  toggleTab(tab);

  modalKeydownHandler = event => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    trapFocus(event);
  };

  if (modalRefs.dialog) {
    modalRefs.dialog.addEventListener("keydown", modalKeydownHandler);
    const focusable = getFocusableElements(modalRefs.dialog);
    const first = focusable.find(el => el.tagName === "INPUT") || focusable[0];
    if (first) first.focus();
  }
}

function createModal() {
  const template = document.createElement("template");
  template.innerHTML = `
    <div class="auth-modal" data-auth-modal hidden aria-hidden="true">
      <div class="auth-modal__overlay" data-auth-close></div>
      <div class="auth-modal__dialog" data-auth-dialog role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button class="auth-modal__close" type="button" data-auth-close aria-label="Close sign-in modal">
          <span aria-hidden="true">×</span>
        </button>
        <div class="auth-modal__header">
          <h2 id="auth-modal-title">Welcome to Harmony Sheets</h2>
          <p class="auth-modal__subtitle">Sign in to access your downloads or create a free account to get started.</p>
          <div class="auth-modal__tabs">
            <button type="button" class="auth-modal__tab is-active" data-auth-tab="login" aria-selected="true">Sign in</button>
            <button type="button" class="auth-modal__tab" data-auth-tab="signup" aria-selected="false">Create account</button>
          </div>
        </div>
        <p class="auth-modal__status" data-auth-status role="status" aria-live="polite"></p>
        <form class="auth-modal__form" data-auth-form="login" aria-hidden="false">
          <div class="auth-modal__field">
            <label for="auth-login-email">Email</label>
            <input id="auth-login-email" type="email" name="email" autocomplete="email" required>
          </div>
          <div class="auth-modal__field">
            <label for="auth-login-password">Password</label>
            <input id="auth-login-password" type="password" name="password" autocomplete="current-password" required>
          </div>
          <button type="submit" class="auth-modal__submit">Sign in</button>
        </form>
        <form class="auth-modal__form" data-auth-form="signup" aria-hidden="true" hidden>
          <div class="auth-modal__field">
            <label for="auth-signup-email">Email</label>
            <input id="auth-signup-email" type="email" name="email" autocomplete="email" required>
          </div>
          <div class="auth-modal__field">
            <label for="auth-signup-password">Password</label>
            <input id="auth-signup-password" type="password" name="password" autocomplete="new-password" minlength="8" required>
            <p class="auth-modal__note">Use at least 8 characters to keep your account secure.</p>
          </div>
          <button type="submit" class="auth-modal__submit">Create account</button>
        </form>
        <p class="auth-modal__hint">Forgot your password? <a href="login.html?mode=reset">Reset it</a> from the full account page.</p>
      </div>
    </div>
  `;

  const fragment = template.content.cloneNode(true);
  const root = fragment.firstElementChild;
  const dialog = root.querySelector("[data-auth-dialog]");
  const status = root.querySelector("[data-auth-status]");
  const tabs = Array.from(root.querySelectorAll("[data-auth-tab]"));
  const forms = Array.from(root.querySelectorAll("[data-auth-form]"));

  tabs.forEach(tabButton => {
    tabButton.addEventListener("click", () => {
      toggleTab(tabButton.dataset.authTab || "login");
    });
  });

  forms.forEach(form => {
    updateSubmitLabels(form);
    if (form.dataset.authForm === "login") {
      form.addEventListener("submit", handleLogin);
    } else if (form.dataset.authForm === "signup") {
      form.addEventListener("submit", handleSignup);
    }
  });

  root.querySelectorAll("[data-auth-close]").forEach(closeEl => {
    closeEl.addEventListener("click", () => closeModal());
  });

  root.addEventListener("click", event => {
    if (event.target === root) {
      closeModal();
    }
  });

  return {
    root,
    dialog,
    status,
    tabs,
    forms
  };
}

async function handleLogin(event) {
  event.preventDefault();
  if (!supabaseClient) {
    window.location.href = "login.html";
    return;
  }
  clearStatus();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    setStatus("error", "Enter your email and password to continue.");
    return;
  }

  setLoading(form, true);
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus("error", error.message);
      return;
    }
    const session = data?.session || null;
    if (session?.user) {
      emitAuthState(true, session.user);
      setStatus("success", "Welcome back! You're signed in.");
      setTimeout(() => closeModal(), 800);
    } else {
      setStatus("success", "Check your email to finish signing in.");
    }
  } catch (error) {
    setStatus("error", error.message || "Unable to sign in right now.");
  } finally {
    setLoading(form, false);
  }
}

async function handleSignup(event) {
  event.preventDefault();
  if (!supabaseClient) {
    window.location.href = "login.html";
    return;
  }
  clearStatus();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    setStatus("error", "Enter an email and password to create your account.");
    return;
  }

  if (password.length < 8) {
    setStatus("error", "Passwords must be at least 8 characters long.");
    return;
  }

  setLoading(form, true);
  try {
    const redirectUrl = new URL("login.html", window.location.href).href;
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { plan: "freemium" }
      }
    });
    if (error) {
      setStatus("error", error.message);
      return;
    }
    const session = data?.session || null;
    if (session?.user) {
      emitAuthState(true, session.user);
      setStatus("success", "Account created! You're now signed in.");
      setTimeout(() => closeModal(), 800);
    } else {
      setStatus(
        "success",
        "Check your email to confirm your account. Once verified, you can sign in here."
      );
      toggleTab("login", { focusField: false });
    }
  } catch (error) {
    setStatus("error", error.message || "Unable to create your account right now.");
  } finally {
    setLoading(form, false);
  }
}

async function signOut() {
  if (!supabaseClient) {
    window.location.href = "login.html";
    return;
  }
  if (signOutButton) {
    signOutButton.disabled = true;
    signOutButton.dataset.loading = "true";
    signOutButton.textContent = "Signing out…";
  }
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error("Supabase signOut error", error);
    }
    emitAuthState(false, null);
  } catch (error) {
    console.error("Unable to sign out", error);
  } finally {
    if (signOutButton) {
      signOutButton.disabled = false;
      signOutButton.dataset.loading = "false";
      signOutButton.textContent = signOutDefaultLabel;
    }
  }
}

function ensureModal() {
  if (modalRefs) return modalRefs;
  if (!document.body) return null;
  modalRefs = createModal();
  document.body.appendChild(modalRefs.root);
  return modalRefs;
}

async function initialiseAuth() {
  emitAuthState(false, null);

  if (!accountItem || !toggle) {
    return;
  }

  if (!isSupabaseConfigured()) {
    return;
  }

  ensureModal();
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (!error) {
      const session = data?.session || null;
      if (session?.user) emitAuthState(true, session.user);
    }
  } catch (error) {
    console.error("Unable to fetch Supabase session", error);
  }

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      emitAuthState(true, session.user);
      closeModal();
    } else {
      emitAuthState(false, null);
    }
  });
}

window.HarmonyAuth = {
  openModal(tab = "login") {
    showModal(tab);
  },
  closeModal,
  async signOut() {
    await signOut();
  }
};

if (accountItem && toggle) {
  ensureModal();
  initialiseAuth();
} else {
  emitAuthState(false, null);
}
