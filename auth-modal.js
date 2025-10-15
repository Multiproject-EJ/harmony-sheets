import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.42.7/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";
import {
  ACCOUNT_PAGE_PATH,
  ADMIN_DASHBOARD_PATH,
  getPostSignInRedirect,
  isAdminUser
} from "./auth-helpers.js";

const accountItem = document.querySelector("[data-account-menu]");
const toggle = accountItem?.querySelector("[data-account-toggle]");
const dropdown = accountItem?.querySelector("[data-account-dropdown]");
const labelEl = toggle?.querySelector("[data-account-label]");
let accountLinkEl = dropdown?.querySelector("[data-account-link='account']");
let adminLinkEl = dropdown?.querySelector("[data-account-link='admin']");
const skipModal = document.body.classList.contains("page-auth");
const hasSupabaseConfig = isSupabaseConfigured();

let supabaseClient = null;
let modalEl = null;
let statusEl = null;
let forms = [];
let tabs = [];
let resetForm = null;
let resetEmailField = null;
let resetPasswordField = null;
let resetConfirmField = null;
let resetRequestHint = null;
let resetUpdateHint = null;
let resetSubmitButton = null;
let resetMode = "request";
let lastFocusedElement = null;
let signOutButton = null;

if (accountItem && !accountItem.dataset.authState) {
  accountItem.dataset.authState = "signed-out";
}

function setAccountState(user) {
  if (!accountItem || !toggle) return;
  const isSignedIn = Boolean(user);
  accountItem.dataset.authState = isSignedIn ? "signed-in" : "signed-out";

  if (labelEl) {
    labelEl.textContent = isSignedIn ? "My Account" : "Log In/Sign Up";
  }

  if (dropdown) {
    if (isSignedIn) {
      dropdown.hidden = false;
      dropdown.setAttribute("aria-hidden", accountItem.classList.contains("is-open") ? "false" : "true");
    } else {
      dropdown.hidden = true;
      dropdown.setAttribute("aria-hidden", "true");
      if (typeof window.App?.closeAccountMenu === "function") {
        window.App.closeAccountMenu();
      }
    }
  }

  updateAccountLink(user);

  if (toggle) {
    if (isSignedIn && user?.email) {
      toggle.setAttribute("aria-label", `Account menu for ${user.email}`);
    } else {
      toggle.removeAttribute("aria-label");
    }
  }

  if (signOutButton) {
    signOutButton.hidden = !isSignedIn;
    signOutButton.disabled = !isSignedIn;
  }
}

function updateAccountLink(user) {
  if (!dropdown) return;
  if (!accountLinkEl || !dropdown.contains(accountLinkEl)) {
    accountLinkEl = dropdown.querySelector("[data-account-link='account']");
  }
  if (!adminLinkEl || !dropdown.contains(adminLinkEl)) {
    adminLinkEl = dropdown.querySelector("[data-account-link='admin']");
  }
  if (!accountLinkEl) return;

  if (!user) {
    if (skipModal) {
      accountLinkEl.href = "products.html";
      accountLinkEl.textContent = "Browse templates";
    } else {
      accountLinkEl.href = "login.html";
      accountLinkEl.textContent = "My account";
    }
    if (adminLinkEl) {
      adminLinkEl.hidden = true;
      adminLinkEl.setAttribute("aria-hidden", "true");
    }
    return;
  }

  accountLinkEl.href = ACCOUNT_PAGE_PATH;
  accountLinkEl.textContent = "My account";

  if (adminLinkEl) {
    const isAdmin = isAdminUser(user);
    adminLinkEl.hidden = !isAdmin;
    adminLinkEl.setAttribute("aria-hidden", isAdmin ? "false" : "true");
    if (isAdmin) {
      adminLinkEl.href = ADMIN_DASHBOARD_PATH;
    }
  }
}

function maybeRedirectToAdmin(user) {
  if (!isAdminUser(user)) return false;
  const currentPath = window.location.pathname.replace(/^\/+/, "");
  if (currentPath.startsWith(ADMIN_DASHBOARD_PATH)) {
    return false;
  }
  const target = getPostSignInRedirect(user, ADMIN_DASHBOARD_PATH);
  if (!target) return false;
  window.location.href = target;
  return true;
}

function createModal() {
  const template = document.createElement("template");
  template.innerHTML = `
    <div class="auth-modal" data-auth-modal hidden aria-hidden="true">
      <div class="auth-modal__backdrop" data-auth-modal-dismiss></div>
      <div class="auth-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" tabindex="-1">
        <button class="auth-modal__close" type="button" data-auth-modal-dismiss aria-label="Close sign in dialog">
          <span aria-hidden="true">×</span>
        </button>
        <section class="auth auth--modal">
          <div class="auth-card auth-card--modal">
            <div class="auth-card__intro">
              <h2 id="auth-modal-title">Access Harmony Sheets</h2>
              <p>Log in to manage your purchases or create a complimentary freemium account.</p>
            </div>
            <div class="auth-tabs" role="tablist">
              <button id="auth-modal-tab-login" class="auth-tab" type="button" data-auth-tab="login" role="tab" aria-selected="true" aria-controls="auth-modal-login">Sign in</button>
              <button id="auth-modal-tab-signup" class="auth-tab" type="button" data-auth-tab="signup" role="tab" aria-selected="false" aria-controls="auth-modal-signup">Create freemium account</button>
              <button id="auth-modal-tab-reset" class="auth-tab auth-tab--ghost" type="button" data-auth-tab="reset" role="tab" aria-selected="false" aria-controls="auth-modal-reset">Reset password</button>
            </div>
            <div class="auth-forms">
              <form class="auth-form" id="auth-modal-login" data-auth-form="login" role="tabpanel" aria-labelledby="auth-modal-tab-login">
                <div class="form-field">
                  <label for="auth-modal-login-email">Email address</label>
                  <input id="auth-modal-login-email" name="email" type="email" autocomplete="email" required>
                </div>
                <div class="form-field">
                  <label for="auth-modal-login-password">Password</label>
                  <input id="auth-modal-login-password" name="password" type="password" autocomplete="current-password" minlength="6" required>
                </div>
                <button class="btn primary auth-submit" type="submit">Sign in</button>
              </form>
              <form class="auth-form" id="auth-modal-signup" data-auth-form="signup" role="tabpanel" aria-labelledby="auth-modal-tab-signup" hidden>
                <div class="form-field">
                  <label for="auth-modal-signup-email">Email address</label>
                  <input id="auth-modal-signup-email" name="email" type="email" autocomplete="email" required>
                </div>
                <div class="form-field">
                  <label for="auth-modal-signup-password">Password</label>
                  <input id="auth-modal-signup-password" name="password" type="password" autocomplete="new-password" minlength="8" required>
                  <p class="form-hint">Minimum 8 characters. You'll receive freemium access instantly.</p>
                </div>
                <button class="btn primary auth-submit" type="submit">Create freemium account</button>
              </form>
              <form class="auth-form" id="auth-modal-reset" data-auth-form="reset" role="tabpanel" aria-labelledby="auth-modal-tab-reset" hidden>
                <div class="form-field" data-reset-field="email">
                  <label for="auth-modal-reset-email">Email address</label>
                  <input id="auth-modal-reset-email" name="email" type="email" autocomplete="email">
                  <p class="form-hint" data-reset-hint="request">We'll email you a link to set a new password.</p>
                </div>
                <div class="form-field" data-reset-field="new-password" hidden>
                  <label for="auth-modal-reset-password">New password</label>
                  <input id="auth-modal-reset-password" name="password" type="password" autocomplete="new-password" minlength="8">
                </div>
                <div class="form-field" data-reset-field="confirm-password" hidden>
                  <label for="auth-modal-reset-confirm">Confirm new password</label>
                  <input id="auth-modal-reset-confirm" name="confirm" type="password" autocomplete="new-password" minlength="8">
                  <p class="form-hint" data-reset-hint="update" hidden>Enter your new password to finish resetting your account.</p>
                </div>
                <button class="btn primary auth-submit" type="submit">Send reset link</button>
              </form>
            </div>
            <p class="auth-status" data-auth-status role="status" aria-live="polite"></p>
            <p class="auth-card__footnote">Freemium accounts are powered by secure Supabase authentication.</p>
          </div>
        </section>
      </div>
    </div>
  `;
  const modal = template.content.firstElementChild;
  document.body.appendChild(modal);
  return modal;
}

function setStatus(type, message) {
  if (!statusEl) return;
  statusEl.dataset.state = type;
  statusEl.textContent = message;
}

function clearStatus() {
  if (!statusEl) return;
  statusEl.dataset.state = "";
  statusEl.textContent = "";
}

function setLoading(form, isLoading) {
  const submitButton = form.querySelector("button[type='submit']");
  if (submitButton) {
    submitButton.disabled = isLoading;
    submitButton.dataset.loading = isLoading ? "true" : "false";
  }
  form.querySelectorAll("input, button").forEach(element => {
    if (element !== submitButton) {
      element.disabled = isLoading;
    }
  });
}

const AUTH_UNAVAILABLE_MESSAGE =
  "Supabase credentials are missing. Update supabase-config.js to enable account access.";

function toggleTab(target) {
  forms.forEach(form => {
    const isActive = form.dataset.authForm === target;
    form.hidden = !isActive;
    form.setAttribute("aria-hidden", (!isActive).toString());
    if (isActive) {
      const focusableInput = Array.from(form.querySelectorAll("input")).find(input => !input.disabled && input.type !== "hidden");
      if (focusableInput) focusableInput.focus();
    }
  });

  tabs.forEach(tab => {
    const isSelected = tab.dataset.authTab === target;
    tab.setAttribute("aria-selected", isSelected.toString());
    tab.classList.toggle("is-active", isSelected);
  });
}

function configureResetForm(mode) {
  resetMode = mode;
  if (!resetForm) return;
  const isUpdate = mode === "update";

  if (resetEmailField) {
    resetEmailField.hidden = isUpdate;
    const emailInput = resetEmailField.querySelector("input");
    if (emailInput) {
      emailInput.required = !isUpdate;
      if (isUpdate) {
        emailInput.value = "";
      } else {
        emailInput.value = emailInput.value.trim();
      }
    }
  }

  if (resetPasswordField) {
    resetPasswordField.hidden = !isUpdate;
    const passwordInput = resetPasswordField.querySelector("input");
    if (passwordInput) passwordInput.required = isUpdate;
  }

  if (resetConfirmField) {
    resetConfirmField.hidden = !isUpdate;
    const confirmInput = resetConfirmField.querySelector("input");
    if (confirmInput) confirmInput.required = isUpdate;
  }

  if (resetRequestHint) resetRequestHint.hidden = isUpdate;
  if (resetUpdateHint) resetUpdateHint.hidden = !isUpdate;

  if (resetSubmitButton) {
    resetSubmitButton.textContent = isUpdate ? "Update password" : "Send reset link";
  }

  if (isUpdate) {
    const passwordInput = resetPasswordField?.querySelector("input");
    if (passwordInput) passwordInput.focus();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  if (!supabaseClient) {
    setStatus("error", AUTH_UNAVAILABLE_MESSAGE);
    return;
  }
  clearStatus();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    setStatus("error", "Please enter your email and password.");
    return;
  }

  setLoading(form, true);
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  setLoading(form, false);

  if (error) {
    setStatus("error", error.message);
    return;
  }

  setStatus("success", "Welcome back! You're signed in.");
  window.setTimeout(() => {
    clearStatus();
    closeModal();
  }, 1100);
}

async function handleSignup(event) {
  event.preventDefault();
  if (!supabaseClient) {
    setStatus("error", AUTH_UNAVAILABLE_MESSAGE);
    return;
  }
  clearStatus();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    setStatus("error", "Enter an email and password to create your freemium account.");
    return;
  }

  if (password.length < 8) {
    setStatus("error", "Passwords must be at least 8 characters long.");
    return;
  }

  setLoading(form, true);
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { plan: "freemium" },
      emailRedirectTo: `${window.location.origin}/login.html?mode=login`,
    },
  });
  setLoading(form, false);

  if (error) {
    setStatus("error", error.message);
    return;
  }

  if (data.session) {
    setStatus("success", "Freemium account created! You're all set.");
    window.setTimeout(() => {
      clearStatus();
      closeModal();
    }, 1100);
  } else {
    setStatus("success", "Check your email to confirm your account before signing in.");
    form.reset();
  }
}

async function handleReset(event) {
  event.preventDefault();
  if (!supabaseClient) {
    setStatus("error", AUTH_UNAVAILABLE_MESSAGE);
    return;
  }
  clearStatus();
  const form = event.currentTarget;

  if (resetMode === "request") {
    const emailInput = resetEmailField?.querySelector("input");
    const email = String(emailInput?.value || "").trim();
    if (!email) {
      setStatus("error", "Enter the email you used for your account.");
      return;
    }

    setLoading(form, true);
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login.html?mode=reset`,
    });
    setLoading(form, false);

    if (error) {
      setStatus("error", error.message);
      return;
    }

    setStatus("success", "Password reset email sent! Check your inbox for the next steps.");
    form.reset();
  } else {
    const passwordInput = resetPasswordField?.querySelector("input");
    const confirmInput = resetConfirmField?.querySelector("input");
    const password = String(passwordInput?.value || "").trim();
    const confirm = String(confirmInput?.value || "").trim();

    if (!password || !confirm) {
      setStatus("error", "Enter and confirm your new password.");
      return;
    }

    if (password !== confirm) {
      setStatus("error", "Passwords do not match. Try again.");
      return;
    }

    setLoading(form, true);
    const { error } = await supabaseClient.auth.updateUser({ password });
    setLoading(form, false);

    if (error) {
      setStatus("error", error.message);
      return;
    }

    setStatus("success", "Password updated! You can now sign in with your new credentials.");
    configureResetForm("request");
    form.reset();
    toggleTab("login");
  }
}

function bindFormHandlers() {
  const loginForm = modalEl?.querySelector("[data-auth-form='login']");
  const signupForm = modalEl?.querySelector("[data-auth-form='signup']");

  loginForm?.addEventListener("submit", handleLogin);
  signupForm?.addEventListener("submit", handleSignup);
  resetForm?.addEventListener("submit", handleReset);
}

function openModal(initialTab = "login") {
  if (!modalEl || skipModal) {
    return;
  }
  if (typeof window.App?.closeAccountMenu === "function") {
    window.App.closeAccountMenu();
  }
  const allowedTabs = ["login", "signup", "reset"];
  const targetTab = allowedTabs.includes(initialTab) ? initialTab : "login";
  toggleTab(targetTab);
  if (targetTab !== "reset") {
    configureResetForm("request");
  }
  clearStatus();
  lastFocusedElement = document.activeElement;
  modalEl.hidden = false;
  modalEl.setAttribute("aria-hidden", "false");
  modalEl.classList.add("is-open");
  document.body.classList.add("auth-modal-open");
  const dialog = modalEl.querySelector(".auth-modal__dialog");
  dialog?.focus();
}

function closeModal() {
  if (!modalEl || modalEl.hidden) return;
  modalEl.classList.remove("is-open");
  modalEl.setAttribute("aria-hidden", "true");
  modalEl.hidden = true;
  document.body.classList.remove("auth-modal-open");
  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

function initFocusTrap() {
  if (!modalEl) return;
  modalEl.addEventListener("keydown", event => {
    if (event.key !== "Tab") return;
    const focusable = Array.from(modalEl.querySelectorAll(
      "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"
    ));
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
  });
}

function initModalEvents() {
  if (!modalEl) return;
  modalEl.querySelectorAll("[data-auth-modal-dismiss]").forEach(element => {
    element.addEventListener("click", () => closeModal());
  });
  modalEl.addEventListener("click", event => {
    if (event.target === modalEl) {
      closeModal();
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modalEl.hidden) {
      closeModal();
    }
  });
}

function detectRecoveryFlow() {
  if (!modalEl) return;
  const hash = window.location.hash.replace("#", "");
  const params = new URLSearchParams(hash);
  const type = params.get("type");

  if (type === "recovery") {
    configureResetForm("update");
    toggleTab("reset");
    setStatus("info", "Enter a new password to finish resetting your account.");
    openModal("reset");
  }
}

function initTabs() {
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.authTab || "login";
      toggleTab(target);
    });
  });
}

function ensureSignOutButton() {
  if (!dropdown) return;
  signOutButton = dropdown.querySelector("[data-account-signout]");
  if (!signOutButton) {
    signOutButton = document.createElement("button");
    signOutButton.type = "button";
    signOutButton.className = "nav-dropdown__link nav-dropdown__link--action";
    signOutButton.textContent = "Sign out";
    signOutButton.dataset.accountSignout = "true";
    const cartButton = dropdown.querySelector("[data-account-cart]");
    if (cartButton?.nextSibling) {
      dropdown.insertBefore(signOutButton, cartButton.nextSibling);
    } else {
      dropdown.appendChild(signOutButton);
    }
  }
  signOutButton.hidden = true;
  signOutButton.disabled = true;
  signOutButton.addEventListener("click", async () => {
    if (!supabaseClient) return;
    signOutButton.disabled = true;
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error("Unable to sign out", error);
      signOutButton.disabled = false;
      return;
    }
    setStatus("info", "You've been signed out.");
    window.setTimeout(() => clearStatus(), 1500);
  });
}

function initModal() {
  if (skipModal || !accountItem || !toggle) {
    window.openAuthModal = mode => {
      const params = new URLSearchParams();
      if (mode) params.set("mode", mode);
      const query = params.toString();
      window.location.href = query ? `login.html?${query}` : "login.html";
    };
    return;
  }

  modalEl = createModal();
  statusEl = modalEl.querySelector("[data-auth-status]");
  forms = Array.from(modalEl.querySelectorAll("[data-auth-form]"));
  tabs = Array.from(modalEl.querySelectorAll("[data-auth-tab]"));
  resetForm = modalEl.querySelector("[data-auth-form='reset']");
  resetEmailField = resetForm?.querySelector("[data-reset-field='email']");
  resetPasswordField = resetForm?.querySelector("[data-reset-field='new-password']");
  resetConfirmField = resetForm?.querySelector("[data-reset-field='confirm-password']");
  resetRequestHint = resetForm?.querySelector("[data-reset-hint='request']");
  resetUpdateHint = resetForm?.querySelector("[data-reset-hint='update']");
  resetSubmitButton = resetForm?.querySelector("button[type='submit']");

  initTabs();
  bindFormHandlers();
  configureResetForm("request");
  initFocusTrap();
  initModalEvents();
  detectRecoveryFlow();
  ensureSignOutButton();

  window.openAuthModal = (mode = "login") => {
    openModal(mode);
  };
}

function initSupabase() {
  if (!accountItem || !toggle) return;

  if (!hasSupabaseConfig) {
    setAccountState(null);
    if (!skipModal) {
      setStatus("error", AUTH_UNAVAILABLE_MESSAGE);
    }
    return;
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  const applySession = session => {
    setAccountState(session?.user || null);
  };

  supabaseClient.auth.getSession().then(({ data }) => {
    applySession(data.session);
  });

  supabaseClient.auth.onAuthStateChange((event, session) => {
    applySession(session);
    if (event === "SIGNED_IN") {
      if (maybeRedirectToAdmin(session?.user)) {
        return;
      }
      if (!skipModal) {
        setStatus("success", "You're signed in! Enjoy exploring Harmony Sheets.");
        window.setTimeout(() => {
          clearStatus();
          closeModal();
        }, 1200);
      }
    }
    if (event === "SIGNED_OUT" && !skipModal) {
      clearStatus();
      configureResetForm("request");
    }
  });
}

initModal();
initSupabase();

export {};
