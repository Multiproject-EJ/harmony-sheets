import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.42.7/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./supabase-config.js";
import { ACCOUNT_PAGE_PATH, isAdminUser } from "./auth-helpers.js";

const DEFAULT_PAGE_PATH = "lovablesheet.html";
const SUPPORTED_PAGE_PATHS = new Set([DEFAULT_PAGE_PATH, "lovables_sheet.html"]);

const PAGE_PATH = (() => {
  const currentPath = window.location.pathname.split("/").pop() || DEFAULT_PAGE_PATH;
  return SUPPORTED_PAGE_PATHS.has(currentPath) ? currentPath : DEFAULT_PAGE_PATH;
})();
const BRAIN_BOARD_GROUP_RADIUS = 220;
const BRAIN_BOARD_COLORS = new Set(["sunshine", "meadow", "ocean", "blossom"]);

let brainBoardInitialized = false;

const sections = {
  loading: document.querySelector("[data-lovablesheet-loading]"),
  unauthorized: document.querySelector("[data-lovablesheet-unauthorized]"),
  content: document.querySelector("[data-lovablesheet-content]")
};

const messageEl = document.querySelector("[data-lovablesheet-message]");

let supabaseClient = null;
let authSubscription = null;

function showSection(target) {
  Object.entries(sections).forEach(([key, element]) => {
    if (!element) return;
    element.hidden = key !== target;
  });
}

function redirectTo(target) {
  if (!target) return;
  window.location.replace(target);
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
    handleUnauthorized("You need to sign in with an admin account to view LovableSheet.", redirectUrl);
    return false;
  }

  if (!isAdminUser(user)) {
    handleUnauthorized("LovableSheet is only available to Harmony Sheets admins.", ACCOUNT_PAGE_PATH);
    return false;
  }

  showSection("content");
  initializeBrainBoard();
  return true;
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function setNotePosition(note, x, y) {
  note.dataset.x = String(x);
  note.dataset.y = String(y);
  note.style.setProperty("--note-x", `${x}px`);
  note.style.setProperty("--note-y", `${y}px`);
}

function getNoteCenter(note) {
  const x = Number.parseFloat(note.dataset.x || "0");
  const y = Number.parseFloat(note.dataset.y || "0");
  return {
    x: x + note.offsetWidth / 2,
    y: y + note.offsetHeight / 2
  };
}

function distanceBetween(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function updateColorControls(note) {
  const currentColor = note.dataset.color;
  note.querySelectorAll("[data-note-color]").forEach((swatch) => {
    const isActive = swatch.dataset.noteColor === currentColor;
    swatch.classList.toggle("is-active", isActive);
    swatch.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function setNoteColor(note, color) {
  if (!BRAIN_BOARD_COLORS.has(color)) return;
  note.dataset.color = color;
  updateColorControls(note);
}

function updateGroupButtonState(note, isActive) {
  const button = note.querySelector("[data-note-group]");
  if (!button) return;
  button.classList.toggle("is-active", isActive);
  button.setAttribute("aria-pressed", isActive ? "true" : "false");
  button.textContent = isActive ? "Moving color group…" : "Move color group";
}

function disableGroupMove(note) {
  note.dataset.groupMode = "false";
  updateGroupButtonState(note, false);
}

function getNearbyColorNotes(activeNote, workspace) {
  const color = activeNote.dataset.color;
  if (!color) return [];
  const origin = getNoteCenter(activeNote);
  return Array.from(workspace.querySelectorAll("[data-note]"))
    .filter((candidate) => candidate !== activeNote && candidate.dataset.color === color)
    .filter((candidate) => distanceBetween(origin, getNoteCenter(candidate)) <= BRAIN_BOARD_GROUP_RADIUS)
    .map((candidate) => ({
      note: candidate,
      startX: Number.parseFloat(candidate.dataset.x || "0"),
      startY: Number.parseFloat(candidate.dataset.y || "0"),
      width: candidate.offsetWidth,
      height: candidate.offsetHeight
    }));
}

function initializeBrainBoard() {
  if (brainBoardInitialized) return;
  const board = document.querySelector("[data-brain-board]");
  if (!board) return;

  const workspace = board.querySelector("[data-brain-board-workspace]");
  if (!workspace) return;

  const notes = Array.from(workspace.querySelectorAll("[data-note]"));
  if (!notes.length) return;

  notes.forEach((note) => {
    const x = Number.parseFloat(note.dataset.x || "0");
    const y = Number.parseFloat(note.dataset.y || "0");
    setNotePosition(note, x, y);
    updateColorControls(note);

    if (!note.dataset.groupMode) {
      note.dataset.groupMode = "false";
      updateGroupButtonState(note, false);
    }

    const handle = note.querySelector("[data-note-handle]");
    if (handle) {
      handle.addEventListener("pointerdown", (event) => {
        if (event.button && event.button !== 0) return;
        if (event.target.closest("[data-note-color]") || event.target.closest("[data-note-group]")) {
          return;
        }
        event.preventDefault();

        const pointerId = event.pointerId;
        const boardWidth = workspace.clientWidth;
        const boardHeight = workspace.clientHeight;
        const noteWidth = note.offsetWidth;
        const noteHeight = note.offsetHeight;
        const maxX = Math.max(0, boardWidth - noteWidth);
        const maxY = Math.max(0, boardHeight - noteHeight);

        const startX = Number.parseFloat(note.dataset.x || "0");
        const startY = Number.parseFloat(note.dataset.y || "0");
        const originPointer = { x: event.clientX, y: event.clientY };

        const groupEnabled = note.dataset.groupMode === "true";
        const nearbyNotes = groupEnabled ? getNearbyColorNotes(note, workspace) : [];

        note.dataset.dragging = "true";
        handle.setPointerCapture(pointerId);

        const onPointerMove = (moveEvent) => {
          const deltaX = moveEvent.clientX - originPointer.x;
          const deltaY = moveEvent.clientY - originPointer.y;

          const targetX = clamp(startX + deltaX, 0, maxX);
          const targetY = clamp(startY + deltaY, 0, maxY);
          setNotePosition(note, targetX, targetY);

          if (groupEnabled && nearbyNotes.length) {
            nearbyNotes.forEach((entry) => {
              const neighborMaxX = Math.max(0, boardWidth - entry.width);
              const neighborMaxY = Math.max(0, boardHeight - entry.height);
              const neighborX = clamp(entry.startX + deltaX, 0, neighborMaxX);
              const neighborY = clamp(entry.startY + deltaY, 0, neighborMaxY);
              setNotePosition(entry.note, neighborX, neighborY);
            });
          }
        };

        const onPointerEnd = () => {
          note.dataset.dragging = "false";
          if (handle.hasPointerCapture(pointerId)) {
            handle.releasePointerCapture(pointerId);
          }
          handle.removeEventListener("pointermove", onPointerMove);
          handle.removeEventListener("pointerup", onPointerEnd);
          handle.removeEventListener("pointercancel", onPointerEnd);

          if (groupEnabled) {
            disableGroupMove(note);
          }
        };

        handle.addEventListener("pointermove", onPointerMove);
        handle.addEventListener("pointerup", onPointerEnd);
        handle.addEventListener("pointercancel", onPointerEnd);
      });
    }

    const groupButton = note.querySelector("[data-note-group]");
    if (groupButton) {
      groupButton.addEventListener("click", () => {
        const active = note.dataset.groupMode === "true";
        const nextActive = !active;
        note.dataset.groupMode = nextActive ? "true" : "false";
        updateGroupButtonState(note, nextActive);
      });
    }

    note.querySelectorAll("[data-note-color]").forEach((swatch) => {
      swatch.addEventListener("click", () => {
        setNoteColor(note, swatch.dataset.noteColor);
      });
    });
  });

  brainBoardInitialized = true;
}

async function init() {
  showSection("loading");

  if (!isSupabaseConfigured()) {
    handleUnauthorized("Supabase credentials are missing. Update supabase-config.js to enable admin access.");
    return;
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    console.error("Unable to load session for LovableSheet", error);
    handleUnauthorized("We couldn't verify your admin access. Please try signing in again.");
    return;
  }

  const user = data.session?.user;
  if (!requireAdmin(user)) {
    return;
  }

  const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
    const currentUser = session?.user;
    if (!requireAdmin(currentUser)) {
      if (!currentUser) {
        const redirectUrl = `login.html?redirect=${encodeURIComponent(PAGE_PATH)}`;
        redirectTo(redirectUrl);
      } else {
        redirectTo(ACCOUNT_PAGE_PATH);
      }
      return;
    }

    initializeBrainBoard();
  });
  authSubscription = listener?.subscription || null;
}

init();

window.addEventListener("beforeunload", () => {
  authSubscription?.unsubscribe?.();
});
