import { supabase, REDIRECT_TO } from "./supaClient.js";

const modal = document.getElementById("authModal");
const btnOpen = document.getElementById("btnSignIn");
const btnClose = document.getElementById("authClose");
const btnGoogle = document.getElementById("googleSignIn");
const formEmail = document.getElementById("emailForm");
const emailInput = document.getElementById("authEmail");
const msg = document.getElementById("authMsg");
const backdrop = modal?.querySelector(".auth-backdrop");
const accountMenu = btnOpen?.closest("[data-account-menu]");

function setMessage(text, type = "info") {
  if (!msg) return;
  msg.textContent = text || "";
  if (text) {
    msg.dataset.state = type;
  } else {
    delete msg.dataset.state;
  }
}

function openModal() {
  if (!modal) return;
  modal.classList.add("open");
  setMessage("", "");
  if (emailInput) {
    emailInput.value = "";
    emailInput.focus();
  }
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("open");
}

function isSignedIn() {
  return accountMenu?.dataset.authState === "signed-in";
}

btnOpen?.addEventListener("click", event => {
  if (isSignedIn()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openModal();
});

btnClose?.addEventListener("click", closeModal);
backdrop?.addEventListener("click", closeModal);

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal?.classList.contains("open")) {
    closeModal();
  }
});

btnGoogle?.addEventListener("click", async () => {
  try {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: REDIRECT_TO }
    });
  } catch (error) {
    console.error("Google sign-in failed", error);
    setMessage("Google sign-in is unavailable. Try the magic link instead.", "error");
  }
});

formEmail?.addEventListener("submit", async event => {
  event.preventDefault();
  if (!emailInput) return;
  const email = emailInput.value.trim();
  if (!email) {
    setMessage("Enter an email to receive your sign-in link.", "error");
    emailInput.focus();
    return;
  }
  setMessage("Sending magic link…");
  const submitButton = event.submitter instanceof HTMLButtonElement ? event.submitter : null;
  if (submitButton) submitButton.disabled = true;
  emailInput.disabled = true;
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: REDIRECT_TO }
    });
    if (error) {
      setMessage(error.message || "Unable to send magic link.", "error");
    } else {
      setMessage("Check your email for a sign-in link.", "success");
    }
  } catch (error) {
    console.error("Magic link request failed", error);
    setMessage("Something went wrong. Try again.", "error");
  } finally {
    if (submitButton) submitButton.disabled = false;
    if (emailInput) emailInput.disabled = false;
  }
});

if (modal) {
  const previousOpen = window.openAuthModal;
  if (typeof previousOpen === "function") {
    window.legacyOpenAuthModal = previousOpen;
  }
  window.openAuthModal = () => {
    openModal();
  };
  window.closeAuthModal = () => {
    closeModal();
  };
}
