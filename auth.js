import { isSupabaseConfigured } from "./supabase-config.js";
import { getSupabaseClient } from "./supabase-client.js";
import { getPostSignInRedirect, sanitizeRedirect } from "./auth-helpers.js";

const statusEl = document.querySelector("[data-auth-status]");
const forms = Array.from(document.querySelectorAll("[data-auth-form]"));
const tabs = Array.from(document.querySelectorAll("[data-auth-tab]"));
const redirectParam = new URLSearchParams(window.location.search).get("redirect");
const redirect = sanitizeRedirect(redirectParam, "account.html");

const resetForm = document.querySelector("[data-auth-form='reset']");
const resetEmailField = resetForm?.querySelector("[data-reset-field='email']");
const resetPasswordField = resetForm?.querySelector("[data-reset-field='new-password']");
const resetConfirmField = resetForm?.querySelector("[data-reset-field='confirm-password']");
const resetRequestHint = resetForm?.querySelector("[data-reset-hint='request']");
const resetUpdateHint = resetForm?.querySelector("[data-reset-hint='update']");
const resetSubmitButton = resetForm?.querySelector("button[type='submit']");

let resetMode = "request";
let supabaseClient = null;

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
  form.querySelectorAll("input, button").forEach((element) => {
    if (element !== submitButton) {
      element.disabled = isLoading;
    }
  });
}

function disableAllForms(message) {
  forms.forEach((form) => {
    form.querySelectorAll("input, button").forEach((element) => {
      element.disabled = true;
    });
  });
  tabs.forEach((tab) => {
    tab.disabled = true;
    tab.setAttribute("aria-disabled", "true");
  });
  setStatus("error", message);
}

function toggleTab(target) {
  forms.forEach((form) => {
    const isActive = form.dataset.authForm === target;
    form.hidden = !isActive;
    form.setAttribute("aria-hidden", (!isActive).toString());
    if (isActive) {
      const focusableInput = Array.from(form.querySelectorAll("input")).find(
        (input) => input.offsetParent !== null && !input.disabled && input.type !== "hidden"
      );
      if (focusableInput) focusableInput.focus();
    }
  });

  tabs.forEach((tab) => {
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

function readAuthTabFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") || params.get("tab");
  if (mode && ["login", "signup", "reset"].includes(mode)) {
    return mode;
  }
  return "login";
}

function initTabs() {
  const initialTab = readAuthTabFromUrl();
  toggleTab(initialTab);

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.authTab;
      toggleTab(target);
      const params = new URLSearchParams(window.location.search);
      params.set("mode", target);
      const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.history.replaceState({}, "", newUrl);
    });
  });
}

function removeHashFromUrl() {
  if (window.location.hash) {
    const cleanUrl = window.location.pathname + window.location.search;
    window.history.replaceState({}, "", cleanUrl);
  }
}

async function handleLogin(event) {
  event.preventDefault();
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
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  setLoading(form, false);

  if (error) {
    setStatus("error", error.message);
    return;
  }

  setStatus("success", "Welcome back! Redirecting to your dashboard…");
  setTimeout(() => {
    const target = getPostSignInRedirect(data?.session?.user, redirect);
    window.location.href = target;
  }, 1200);
}

async function handleSignup(event) {
  event.preventDefault();
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
    setStatus("success", "Freemium account created! Redirecting…");
    setTimeout(() => {
      const target = getPostSignInRedirect(data.session?.user, redirect);
      window.location.href = target;
    }, 1200);
  } else {
    setStatus(
      "success",
      "Check your email to confirm your account. You'll be able to sign in once it's verified."
    );
  }
}

async function handleReset(event) {
  event.preventDefault();
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
    removeHashFromUrl();
  }
}

function bindFormHandlers() {
  const loginForm = document.querySelector("[data-auth-form='login']");
  const signupForm = document.querySelector("[data-auth-form='signup']");

  loginForm?.addEventListener("submit", handleLogin);
  signupForm?.addEventListener("submit", handleSignup);
  resetForm?.addEventListener("submit", handleReset);
}

function detectRecoveryFlow() {
  const hash = window.location.hash.replace("#", "");
  const params = new URLSearchParams(hash);
  const type = params.get("type");

  if (type === "recovery") {
    configureResetForm("update");
    toggleTab("reset");
    setStatus("info", "Enter a new password to finish resetting your account.");
    removeHashFromUrl();
  }
}

function init() {
  if (!forms.length || !tabs.length) return;

  initTabs();

  if (!isSupabaseConfigured()) {
    disableAllForms("Supabase credentials are missing. Update supabase-config.js to enable account access.");
    return;
  }

  supabaseClient = getSupabaseClient();

  configureResetForm("request");
  detectRecoveryFlow();
  bindFormHandlers();
}

document.addEventListener("DOMContentLoaded", init);
