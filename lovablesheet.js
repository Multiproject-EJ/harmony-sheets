import { isSupabaseConfigured } from "./supabase-config.js";
import { ACCOUNT_PAGE_PATH, isAdminUser } from "./auth-helpers.js";
import { getSupabaseClient } from "./supabase-client.js";

const DEFAULT_PAGE_PATH = "lovablesheet.html";
const SUPPORTED_PAGE_PATHS = new Set([DEFAULT_PAGE_PATH, "lovables_sheet.html"]);

const PAGE_PATH = (() => {
  const currentPath = window.location.pathname.split("/").pop() || DEFAULT_PAGE_PATH;
  return SUPPORTED_PAGE_PATHS.has(currentPath) ? currentPath : DEFAULT_PAGE_PATH;
})();
const BRAIN_BOARD_GROUP_RADIUS = 220;
const BRAIN_BOARD_COLORS = new Set(["sunshine", "meadow", "ocean", "blossom"]);
const DEFAULT_BOARD_ID = "default";
const BOARD_STATUS_CLEAR_DELAY = 4000;
const BOARD_SCALE_DEFAULT = 1;
const BOARD_SCALE_MIN = 0.6;
const BOARD_SCALE_MAX = 1.4;
const BOARD_SCALE_STEP = 0.1;
const BOARD_SCALE_TOLERANCE = 0.001;

let brainBoardInitialized = false;
let flowchartBoardInitialized = false;
let brainBoard = null;
let flowchartBoard = null;
let boardSelectEl = null;
let boardSaveButton = null;
let boardStatusEl = null;
let currentBoardId = DEFAULT_BOARD_ID;
let defaultBoardSnapshot = [];
let boardsCache = new Map();
let supabaseBoards = [];
let boardsLoading = false;
let boardsLoaded = false;
let isSavingBoard = false;
let boardStatusTimeoutId = null;

const sections = {
  loading: document.querySelector("[data-lovablesheet-loading]"),
  unauthorized: document.querySelector("[data-lovablesheet-unauthorized]"),
  content: document.querySelector("[data-lovablesheet-content]")
};

const messageEl = document.querySelector("[data-lovablesheet-message]");

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
    handleUnauthorized("You need to sign in with an admin account to view LovableSheet.", redirectUrl);
    return false;
  }

  if (!isAdminUser(user)) {
    handleUnauthorized("LovableSheet is only available to Harmony Sheets admins.", ACCOUNT_PAGE_PATH);
    return false;
  }

  showSection("content");
  initializeStickyBoards();
  return true;
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function distanceBetween(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function cloneNotes(notes = []) {
  if (!Array.isArray(notes)) return [];
  return notes.map((note) => ({
    color: BRAIN_BOARD_COLORS.has(note.color) ? note.color : "sunshine",
    x: Number.isFinite(Number(note.x)) ? Number(note.x) : 0,
    y: Number.isFinite(Number(note.y)) ? Number(note.y) : 0,
    label: typeof note.label === "string" ? note.label : "",
    body: typeof note.body === "string" ? note.body : "",
    placeholder: typeof note.placeholder === "string" ? note.placeholder : ""
  }));
}

class StickyBoard {
  constructor(root, options = {}) {
    const { noteTemplate, onNoteCreated, onScaleChange, initialScale } = options;

    this.root = root || null;
    this.workspace = this.root?.querySelector("[data-board-workspace]") ?? null;
    this.menu = this.root?.querySelector(".brain-board-menu") ?? null;
    this.noteTemplate = noteTemplate ?? document.getElementById("brain-board-note-template");
    this.onNoteCreated = typeof onNoteCreated === "function" ? onNoteCreated : null;
    this.onScaleChange = typeof onScaleChange === "function" ? onScaleChange : null;

    this.scaleMin = BOARD_SCALE_MIN;
    this.scaleMax = BOARD_SCALE_MAX;
    this.scaleStep = BOARD_SCALE_STEP;
    this.scaleTolerance = BOARD_SCALE_TOLERANCE;
    this.groupRadius = BRAIN_BOARD_GROUP_RADIUS;
    this.colors = BRAIN_BOARD_COLORS;

    this.scale = BOARD_SCALE_DEFAULT;
    const initialScaleAttr = this.root?.dataset.boardInitialScale;
    const parsedAttrScale = typeof initialScaleAttr === "string" ? Number.parseFloat(initialScaleAttr) : Number.NaN;
    if (Number.isFinite(parsedAttrScale)) {
      this.scale = clamp(parsedAttrScale, this.scaleMin, this.scaleMax);
    }
    if (Number.isFinite(initialScale)) {
      this.scale = clamp(initialScale, this.scaleMin, this.scaleMax);
    }

    this.addButton = this.menu?.querySelector("[data-board-add]") ?? this.menu?.querySelector(".brain-board-menu__add") ?? null;
    this.zoomOutButton = this.menu?.querySelector("[data-board-zoom-out]") ?? null;
    this.zoomInButton = this.menu?.querySelector("[data-board-zoom-in]") ?? null;
    this.zoomDisplayEl = this.menu?.querySelector("[data-board-zoom-display]") ?? null;
    this.zoomSliderEl = this.menu?.querySelector("[data-board-zoom-slider]") ?? null;
    this.zoomFitButton = this.menu?.querySelector("[data-board-zoom-fit]") ?? null;

    this.controlsBound = false;
  }

  initialize() {
    if (!this.root || !this.workspace || !this.noteTemplate) {
      return false;
    }

    this.workspace.querySelectorAll("[data-note]").forEach((note) => {
      this.setupNote(note);
    });

    this.bindControls();
    this.applyScale();
    return true;
  }

  bindControls() {
    if (this.controlsBound) return;
    this.controlsBound = true;

    if (this.addButton) {
      this.addButton.addEventListener("click", () => {
        const newNote = this.createNewNote();
        if (newNote && this.onNoteCreated) {
          this.onNoteCreated(newNote);
        }
      });
    }

    if (this.zoomOutButton) {
      this.zoomOutButton.addEventListener("click", () => {
        this.adjustScale(-this.scaleStep);
      });
    }

    if (this.zoomInButton) {
      this.zoomInButton.addEventListener("click", () => {
        this.adjustScale(this.scaleStep);
      });
    }

    if (this.zoomFitButton) {
      this.zoomFitButton.addEventListener("click", () => {
        this.setScale(this.getFitScale());
      });
    }

    if (this.zoomSliderEl) {
      this.zoomSliderEl.min = `${Math.round(this.scaleMin * 100)}`;
      this.zoomSliderEl.max = `${Math.round(this.scaleMax * 100)}`;
      this.zoomSliderEl.step = "1";
      this.zoomSliderEl.value = `${Math.round(this.scale * 100)}`;
      this.zoomSliderEl.addEventListener("input", (event) => {
        const nextValue = Number.parseInt(event.target.value, 10);
        if (Number.isNaN(nextValue)) return;
        this.setScale(nextValue / 100);
      });
    }

    this.updateZoomControls();
  }

  getScale() {
    return this.scale;
  }

  setScale(nextScale) {
    const clamped = clamp(nextScale, this.scaleMin, this.scaleMax);
    const rounded = Math.round(clamped * 100) / 100;
    this.scale = rounded;
    this.applyScale();
    if (this.onScaleChange) {
      this.onScaleChange(this.scale);
    }
  }

  adjustScale(delta) {
    this.setScale(this.scale + delta);
  }

  getFitScale() {
    if (!this.workspace) return this.scale;
    const notes = Array.from(this.workspace.querySelectorAll("[data-note]"));
    if (!notes.length) {
      return this.scale;
    }

    const boardWidth = this.workspace.clientWidth;
    const boardHeight = this.workspace.clientHeight;
    if (boardWidth <= 0 || boardHeight <= 0) {
      return this.scale;
    }

    let maxRight = 0;
    let maxBottom = 0;

    notes.forEach((note) => {
      const x = Number.parseFloat(note.dataset.x || "0");
      const y = Number.parseFloat(note.dataset.y || "0");
      const width = note.offsetWidth;
      const height = note.offsetHeight;

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
      }

      maxRight = Math.max(maxRight, x + width);
      maxBottom = Math.max(maxBottom, y + height);
    });

    if (maxRight <= 0 || maxBottom <= 0) {
      return this.scale;
    }

    const fitScale = Math.min(boardWidth / maxRight, boardHeight / maxBottom);
    if (!Number.isFinite(fitScale) || fitScale <= 0) {
      return this.scale;
    }

    return clamp(fitScale, this.scaleMin, this.scaleMax);
  }

  applyScale() {
    if (!this.workspace) return;
    this.workspace.style.removeProperty("transform");
    this.workspace.style.setProperty("--board-note-scale", `${this.scale}`);
    this.workspace.querySelectorAll("[data-note]").forEach((note) => {
      const x = Number.parseFloat(note.dataset.x || "0");
      const y = Number.parseFloat(note.dataset.y || "0");
      this.applyNoteTransform(note, x, y);
    });
    this.updateZoomControls();
  }

  updateZoomControls() {
    const percent = Math.round(this.scale * 100);

    if (this.zoomDisplayEl) {
      this.zoomDisplayEl.textContent = `${percent}%`;
    }

    if (this.zoomSliderEl && Number.parseInt(this.zoomSliderEl.value, 10) !== percent) {
      this.zoomSliderEl.value = `${percent}`;
    }

    if (this.zoomOutButton) {
      this.zoomOutButton.disabled = this.scale <= this.scaleMin + this.scaleTolerance;
    }

    if (this.zoomInButton) {
      this.zoomInButton.disabled = this.scale >= this.scaleMax - this.scaleTolerance;
    }

    if (this.zoomFitButton) {
      const hasNotes = Boolean(this.workspace?.querySelector("[data-note]"));
      this.zoomFitButton.disabled = !hasNotes;
    }
  }

  applyNoteTransform(note, x, y) {
    if (!note) return;
    note.style.setProperty("--note-scale", `${this.scale}`);
    note.style.setProperty("--note-translate-x", `${x * this.scale}px`);
    note.style.setProperty("--note-translate-y", `${y * this.scale}px`);
  }

  setNotePosition(note, x, y) {
    note.dataset.x = String(x);
    note.dataset.y = String(y);
    note.style.setProperty("--note-x", `${x}px`);
    note.style.setProperty("--note-y", `${y}px`);
    this.applyNoteTransform(note, x, y);
  }

  getNoteCenter(note) {
    const x = Number.parseFloat(note.dataset.x || "0");
    const y = Number.parseFloat(note.dataset.y || "0");
    return {
      x: x * this.scale + (note.offsetWidth * this.scale) / 2,
      y: y * this.scale + (note.offsetHeight * this.scale) / 2
    };
  }

  updateColorControls(note) {
    const currentColor = note.dataset.color;
    note.querySelectorAll("[data-note-color]").forEach((swatch) => {
      const isActive = swatch.dataset.noteColor === currentColor;
      swatch.classList.toggle("is-active", isActive);
      swatch.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  setNoteColor(note, color) {
    if (!this.colors.has(color)) return;
    note.dataset.color = color;
    this.updateColorControls(note);
  }

  updateGroupButtonState(note, isActive) {
    const button = note.querySelector("[data-note-group]");
    if (!button) return;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
    button.textContent = isActive ? "Moving color group…" : "Move color group";
  }

  disableGroupMove(note) {
    note.dataset.groupMode = "false";
    this.updateGroupButtonState(note, false);
  }

  getNearbyColorNotes(activeNote) {
    if (!this.workspace) return [];
    const color = activeNote.dataset.color;
    if (!color) return [];
    const origin = this.getNoteCenter(activeNote);
    const radius = this.groupRadius * this.scale;
    return Array.from(this.workspace.querySelectorAll("[data-note]"))
      .filter((candidate) => candidate !== activeNote && candidate.dataset.color === color)
      .filter((candidate) => distanceBetween(origin, this.getNoteCenter(candidate)) <= radius)
      .map((candidate) => ({
        note: candidate,
        startX: Number.parseFloat(candidate.dataset.x || "0"),
        startY: Number.parseFloat(candidate.dataset.y || "0"),
        width: candidate.offsetWidth * this.scale,
        height: candidate.offsetHeight * this.scale
      }));
  }

  setupNote(note) {
    if (!note) return;

    const x = Number.parseFloat(note.dataset.x || "0");
    const y = Number.parseFloat(note.dataset.y || "0");
    this.setNotePosition(note, x, y);
    this.updateColorControls(note);

    const isGroupMode = note.dataset.groupMode === "true";
    note.dataset.groupMode = isGroupMode ? "true" : "false";
    this.updateGroupButtonState(note, isGroupMode);

    const handle = note.querySelector("[data-note-handle]");
    if (handle) {
      handle.addEventListener("pointerdown", (event) => {
        if (!this.workspace) return;
        if (event.button && event.button !== 0) return;
        if (event.target.closest("[data-note-color]") || event.target.closest("[data-note-group]")) {
          return;
        }
        event.preventDefault();

        const pointerId = event.pointerId;
        const boardWidth = this.workspace.clientWidth;
        const boardHeight = this.workspace.clientHeight;
        const noteWidth = note.offsetWidth * this.scale;
        const noteHeight = note.offsetHeight * this.scale;
        const maxX = Math.max(0, (boardWidth - noteWidth) / this.scale);
        const maxY = Math.max(0, (boardHeight - noteHeight) / this.scale);

        const startX = Number.parseFloat(note.dataset.x || "0");
        const startY = Number.parseFloat(note.dataset.y || "0");
        const originPointer = { x: event.clientX, y: event.clientY };

        const groupEnabled = note.dataset.groupMode === "true";
        const nearbyNotes = groupEnabled ? this.getNearbyColorNotes(note) : [];

        note.dataset.dragging = "true";
        handle.setPointerCapture(pointerId);

        const onPointerMove = (moveEvent) => {
          const deltaX = (moveEvent.clientX - originPointer.x) / this.scale;
          const deltaY = (moveEvent.clientY - originPointer.y) / this.scale;

          const targetX = clamp(startX + deltaX, 0, maxX);
          const targetY = clamp(startY + deltaY, 0, maxY);
          this.setNotePosition(note, targetX, targetY);

          if (groupEnabled && nearbyNotes.length) {
            nearbyNotes.forEach((entry) => {
              const neighborMaxX = Math.max(0, (boardWidth - entry.width) / this.scale);
              const neighborMaxY = Math.max(0, (boardHeight - entry.height) / this.scale);
              const neighborX = clamp(entry.startX + deltaX, 0, neighborMaxX);
              const neighborY = clamp(entry.startY + deltaY, 0, neighborMaxY);
              this.setNotePosition(entry.note, neighborX, neighborY);
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
            this.disableGroupMove(note);
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
        this.updateGroupButtonState(note, nextActive);
      });
    }

    note.querySelectorAll("[data-note-color]").forEach((swatch) => {
      swatch.addEventListener("click", () => {
        this.setNoteColor(note, swatch.dataset.noteColor);
      });
    });
  }

  createNoteElement(noteData) {
    if (!this.noteTemplate?.content?.firstElementChild) {
      console.error("Missing brain board note template.");
      return null;
    }
    const element = this.noteTemplate.content.firstElementChild.cloneNode(true);
    const labelEl = element.querySelector("[data-note-label]");
    if (labelEl) {
      labelEl.textContent = noteData?.label || "";
    }
    const bodyEl = element.querySelector("[data-note-body]");
    if (bodyEl) {
      bodyEl.innerHTML = noteData?.body || "";
      if (noteData?.placeholder) {
        bodyEl.setAttribute("data-placeholder", noteData.placeholder);
      } else if (bodyEl.hasAttribute("data-placeholder")) {
        const defaultPlaceholder = bodyEl.getAttribute("data-placeholder");
        if (!defaultPlaceholder) {
          bodyEl.removeAttribute("data-placeholder");
        }
      }
    }

    const color = noteData?.color;
    if (color && this.colors.has(color)) {
      this.setNoteColor(element, color);
    } else {
      this.setNoteColor(element, "sunshine");
    }

    const x = Number.isFinite(Number(noteData?.x)) ? Number(noteData.x) : 0;
    const y = Number.isFinite(Number(noteData?.y)) ? Number(noteData.y) : 0;
    this.setNotePosition(element, x, y);
    element.dataset.groupMode = "false";
    return element;
  }

  createNewNote() {
    if (!this.workspace) return null;

    const nextIndex = this.workspace.querySelectorAll("[data-note]").length + 1;
    const defaultLabel = `Note ${nextIndex}`;
    const noteElement = this.createNoteElement({
      color: "sunshine",
      label: defaultLabel,
      body: "",
      placeholder: "Click to capture an idea"
    });

    if (!noteElement) return null;

    this.workspace.appendChild(noteElement);
    this.setupNote(noteElement);

    window.requestAnimationFrame(() => {
      const noteWidth = noteElement.offsetWidth * this.scale;
      const noteHeight = noteElement.offsetHeight * this.scale;
      const boardWidth = this.workspace.clientWidth;
      const boardHeight = this.workspace.clientHeight;
      const maxX = Math.max(0, (boardWidth - noteWidth) / this.scale);
      const maxY = Math.max(0, (boardHeight - noteHeight) / this.scale);

      let targetX = maxX;
      let targetY = 0;

      if (this.menu) {
        const workspaceRect = this.workspace.getBoundingClientRect();
        const menuRect = this.menu.getBoundingClientRect();
        const gap = 4;
        const relativeMenuLeft = (menuRect.left - workspaceRect.left) / this.scale;
        const relativeMenuTop = (menuRect.top - workspaceRect.top) / this.scale;
        const adjustedGap = gap / this.scale;

        targetX = clamp(relativeMenuLeft - noteElement.offsetWidth - adjustedGap, 0, maxX);
        targetY = clamp(relativeMenuTop, 0, maxY);
      }

      this.setNotePosition(noteElement, targetX, targetY);

      const bodyEl = noteElement.querySelector("[data-note-body]");
      bodyEl?.focus?.({ preventScroll: true });
    });

    this.updateZoomControls();

    return noteElement;
  }

  captureSnapshot() {
    if (!this.workspace) return [];
    return Array.from(this.workspace.querySelectorAll("[data-note]")).map((note) => {
      const bodyEl = note.querySelector("[data-note-body]");
      const labelEl = note.querySelector("[data-note-label]");
      return {
        color: note.dataset.color || "sunshine",
        x: Number.parseFloat(note.dataset.x || "0") || 0,
        y: Number.parseFloat(note.dataset.y || "0") || 0,
        label: labelEl ? labelEl.textContent?.trim() || "" : "",
        body: bodyEl ? bodyEl.innerHTML : "",
        placeholder: bodyEl?.getAttribute("data-placeholder") || ""
      };
    });
  }

  renderNotes(notes = []) {
    if (!this.workspace) return;
    this.workspace.innerHTML = "";
    cloneNotes(notes).forEach((noteData) => {
      const noteElement = this.createNoteElement(noteData);
      if (noteElement) {
        this.workspace.appendChild(noteElement);
        this.setupNote(noteElement);
      }
    });
    this.applyScale();
  }
}

function initializeStickyBoards() {
  setupBrainBoard();
  setupFlowchartBoard();
}

function setupBrainBoard() {
  if (brainBoardInitialized) return;
  const board = document.querySelector("[data-brain-board]");
  if (!board) return;

  const noteTemplate = document.getElementById("brain-board-note-template");
  if (!noteTemplate) {
    console.error("Missing brain board note template.");
    return;
  }

  brainBoard = new StickyBoard(board, {
    noteTemplate,
    onNoteCreated: () => {
      setBoardStatus("Added a new sticky note to the board.");
    }
  });

  if (!brainBoard.initialize()) {
    brainBoard = null;
    return;
  }

  boardSelectEl = board.querySelector("[data-board-select]");
  boardSaveButton = board.querySelector("[data-board-save]");
  boardStatusEl = board.querySelector("[data-board-status]");

  defaultBoardSnapshot = brainBoard.captureSnapshot();
  boardsCache.set(DEFAULT_BOARD_ID, {
    id: DEFAULT_BOARD_ID,
    name: "Default Board",
    notes: cloneNotes(defaultBoardSnapshot)
  });
  currentBoardId = DEFAULT_BOARD_ID;

  if (boardSelectEl) {
    boardSelectEl.addEventListener("change", (event) => {
      selectBoard(event.target.value);
    });
    updateBoardOptions(DEFAULT_BOARD_ID);
    boardSelectEl.value = DEFAULT_BOARD_ID;
  }

  if (boardSaveButton) {
    boardSaveButton.addEventListener("click", handleSaveBoard);
  }

  brainBoardInitialized = true;
}

function setupFlowchartBoard() {
  if (flowchartBoardInitialized) return;
  const board = document.querySelector("[data-flowchart-board]");
  if (!board) return;

  const noteTemplate = document.getElementById("brain-board-note-template");
  if (!noteTemplate) {
    console.error("Missing brain board note template.");
    return;
  }

  flowchartBoard = new StickyBoard(board, { noteTemplate });
  if (!flowchartBoard.initialize()) {
    flowchartBoard = null;
    return;
  }

  flowchartBoardInitialized = true;
}

function setBoardStatus(message, tone = "neutral") {
  if (!boardStatusEl) return;
  if (boardStatusTimeoutId) {
    window.clearTimeout(boardStatusTimeoutId);
    boardStatusTimeoutId = null;
  }

  boardStatusEl.textContent = message || "";
  boardStatusEl.classList.remove("is-success", "is-error");
  if (tone === "success") {
    boardStatusEl.classList.add("is-success");
  } else if (tone === "error") {
    boardStatusEl.classList.add("is-error");
  }

  if (message && tone !== "error") {
    boardStatusTimeoutId = window.setTimeout(() => {
      if (boardStatusEl.textContent === message) {
        boardStatusEl.textContent = "";
        boardStatusEl.classList.remove("is-success", "is-error");
      }
    }, BOARD_STATUS_CLEAR_DELAY);
  }
}

function updateBoardOptions(targetSelection = currentBoardId) {
  if (!boardSelectEl) return;

  const sortedBoards = [...supabaseBoards].sort((a, b) => {
    const nameA = a.name.toLocaleLowerCase();
    const nameB = b.name.toLocaleLowerCase();
    if (nameA === nameB) return 0;
    return nameA < nameB ? -1 : 1;
  });

  boardSelectEl.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = DEFAULT_BOARD_ID;
  defaultOption.textContent = "Default Board (Demo)";
  boardSelectEl.appendChild(defaultOption);

  sortedBoards.forEach((board) => {
    const option = document.createElement("option");
    option.value = board.id;
    option.textContent = board.name;
    boardSelectEl.appendChild(option);
  });

  const fallback = boardsCache.has(targetSelection)
    ? targetSelection
    : boardsCache.has(currentBoardId)
      ? currentBoardId
      : DEFAULT_BOARD_ID;

  boardSelectEl.value = fallback;
}

function selectBoard(boardId, { announce = true } = {}) {
  const targetId = boardsCache.has(boardId) ? boardId : DEFAULT_BOARD_ID;
  const board = boardsCache.get(targetId);
  if (!board) return;

  currentBoardId = targetId;
  if (boardSelectEl && boardSelectEl.value !== targetId) {
    boardSelectEl.value = targetId;
  }

  if (brainBoard) {
    brainBoard.renderNotes(board.notes);
  }

  if (announce) {
    if (targetId === DEFAULT_BOARD_ID) {
      setBoardStatus("Loaded the default demo board.");
    } else {
      setBoardStatus(`Loaded “${board.name}”.`);
    }
  }
}

function normalizeBoardRecord(record) {
  if (!record || !record.id) return null;
  const name = typeof record.name === "string" && record.name.trim() ? record.name.trim() : "Untitled Board";
  return {
    id: record.id,
    name,
    notes: cloneNotes(record.notes),
    updated_at: record.updated_at || record.created_at || null
  };
}

function setSupabaseBoards(records = []) {
  const normalized = records
    .map(normalizeBoardRecord)
    .filter(Boolean);

  supabaseBoards = normalized;

  Array.from(boardsCache.keys()).forEach((key) => {
    if (key !== DEFAULT_BOARD_ID) {
      boardsCache.delete(key);
    }
  });

  normalized.forEach((board) => {
    boardsCache.set(board.id, {
      ...board,
      notes: cloneNotes(board.notes)
    });
  });

  const activeBoardId = currentBoardId;
  updateBoardOptions(activeBoardId);

  if (brainBoardInitialized && activeBoardId !== DEFAULT_BOARD_ID && !boardsCache.has(activeBoardId)) {
    selectBoard(DEFAULT_BOARD_ID, { announce: false });
  }
}

async function fetchBoards() {
  if (!supabaseClient || boardsLoading) return;

  if (!boardsLoaded && (!boardStatusEl || !boardStatusEl.textContent)) {
    setBoardStatus("Loading saved boards…");
  }

  boardsLoading = true;
  try {
    const { data, error } = await supabaseClient
      .from("lovablesheet_boards")
      .select("id, name, notes, updated_at, created_at")
      .order("updated_at", { ascending: false, nullsLast: true })
      .order("created_at", { ascending: false, nullsLast: true });

    if (error) {
      throw error;
    }

    setSupabaseBoards(data || []);

    if (!boardsLoaded) {
      setBoardStatus("");
    }

    boardsLoaded = true;
  } catch (error) {
    console.error("Unable to load LovableSheet boards", error);
    setBoardStatus("We couldn't load your saved boards. Please try again.", "error");
  } finally {
    boardsLoading = false;
  }
}

async function handleSaveBoard() {
  if (!supabaseClient || isSavingBoard || !brainBoard) return;
  const notes = brainBoard.captureSnapshot();

  const existingBoard = boardsCache.get(currentBoardId);
  const promptMessage = currentBoardId === DEFAULT_BOARD_ID
    ? "Name your board to save it to Supabase:"
    : "Update the name for this board:";
  const suggestedName = existingBoard?.name || "";
  const nameInput = window.prompt(promptMessage, suggestedName);

  if (nameInput === null) {
    setBoardStatus("Save cancelled.");
    return;
  }

  const normalizedName = nameInput.trim();
  if (!normalizedName) {
    setBoardStatus("Board name is required to save.", "error");
    return;
  }

  isSavingBoard = true;
  if (boardSaveButton) {
    boardSaveButton.disabled = true;
  }
  setBoardStatus("Saving board…");

  try {
    if (currentBoardId === DEFAULT_BOARD_ID) {
      const { data, error } = await supabaseClient
        .from("lovablesheet_boards")
        .insert({ name: normalizedName, notes })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const normalized = normalizeBoardRecord(data);
      if (!normalized) {
        throw new Error("Supabase returned an invalid board payload.");
      }

      supabaseBoards = supabaseBoards.filter((board) => board.id !== normalized.id).concat(normalized);
      boardsCache.set(normalized.id, {
        ...normalized,
        notes: cloneNotes(normalized.notes)
      });
      currentBoardId = normalized.id;
      updateBoardOptions(currentBoardId);
      if (boardSelectEl) {
        boardSelectEl.value = currentBoardId;
      }
      setBoardStatus(`Saved “${normalized.name}” to Supabase.`, "success");
    } else {
      const { data, error } = await supabaseClient
        .from("lovablesheet_boards")
        .update({ name: normalizedName, notes })
        .eq("id", currentBoardId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const normalized = normalizeBoardRecord(data);
      if (!normalized) {
        throw new Error("Supabase returned an invalid board payload.");
      }

      const index = supabaseBoards.findIndex((board) => board.id === normalized.id);
      if (index === -1) {
        supabaseBoards.push(normalized);
      } else {
        supabaseBoards[index] = normalized;
      }

      boardsCache.set(normalized.id, {
        ...normalized,
        notes: cloneNotes(normalized.notes)
      });
      updateBoardOptions(currentBoardId);
      setBoardStatus(`Saved “${normalized.name}” to Supabase.`, "success");
    }
  } catch (error) {
    console.error("Unable to save LovableSheet board", error);
    setBoardStatus("We couldn't save your board. Please try again.", "error");
  } finally {
    isSavingBoard = false;
    if (boardSaveButton) {
      boardSaveButton.disabled = false;
    }
  }
}

async function init() {
  showSection("loading");

  if (!isSupabaseConfigured()) {
    handleUnauthorized("Supabase credentials are missing. Update supabase-config.js to enable admin access.");
    return;
  }

  supabaseClient = getSupabaseClient();

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

  initializeStickyBoards();
  await fetchBoards();

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

    initializeStickyBoards();
    fetchBoards();
  });
  authSubscription = listener?.subscription || null;
}

init();

window.addEventListener("beforeunload", () => {
  authSubscription?.unsubscribe?.();
});
