import { isSupabaseConfigured } from "./supabase-config.js";
import { ACCOUNT_PAGE_PATH, isAdminUser } from "./auth-helpers.js";
import { getSupabaseClient } from "./supabase-client.js";
import { initCollapsiblePipelineTables } from "./pipeline-table.js";

const DEFAULT_PAGE_PATH = "lovablesheet.html";
const SUPPORTED_PAGE_PATHS = new Set([DEFAULT_PAGE_PATH, "lovables_sheet.html"]);

const SCROLL_SNAP_CLASS = "lovablesheet-scroll-snap";
const prefersReducedMotionQuery = typeof window !== "undefined" && window.matchMedia
  ? window.matchMedia("(prefers-reduced-motion: reduce)")
  : null;
let reducedMotionListenerInitialized = false;

const PAGE_PATH = (() => {
  const currentPath = window.location.pathname.split("/").pop() || DEFAULT_PAGE_PATH;
  return SUPPORTED_PAGE_PATHS.has(currentPath) ? currentPath : DEFAULT_PAGE_PATH;
})();
const BRAIN_BOARD_GROUP_RADIUS = 220;
const BRAIN_BOARD_DEFAULT_COLUMN_COUNT = 0;
const BRAIN_BOARD_DEFAULT_COLUMN_GAP = 48;
const BRAIN_BOARD_DEFAULT_SNAP_THRESHOLD = 64;
const BRAIN_BOARD_SNAP_INDICATOR_DURATION = 260;
const CUSTOM_COLOR_ID = "custom";
const BRAIN_BOARD_COLOR_PRESETS = [
  { id: "sunshine", label: "Sunshine yellow", value: "#fef3c7" },
  { id: "meadow", label: "Meadow green", value: "#dcfce7" },
  { id: "ocean", label: "Ocean blue", value: "#dbeafe" },
  { id: "blossom", label: "Blossom pink", value: "#fde2e7" },
  { id: "amber", label: "Amber glow", value: "#fef9c3" },
  { id: "coral", label: "Coral sunrise", value: "#ffedd5" },
  { id: "lavender", label: "Lavender bloom", value: "#ede9fe" },
  { id: "mint", label: "Mint fresh", value: "#ccfbf1" },
  { id: "sky", label: "Sky blue", value: "#bae6fd" },
  { id: "graphite", label: "Graphite gray", value: "#e2e8f0" }
];
const BRAIN_BOARD_COLOR_PRESET_MAP = new Map(BRAIN_BOARD_COLOR_PRESETS.map((preset) => [preset.id, preset]));
const BRAIN_BOARD_PRESET_IDS = new Set(BRAIN_BOARD_COLOR_PRESETS.map((preset) => preset.id));
const BRAIN_BOARD_NOTE_SHAPES = [
  { id: "classic", label: "Rounded classic" },
  { id: "square", label: "Square" },
  { id: "diamond", label: "Diamond" },
  { id: "triangle", label: "Triangle" },
  { id: "heart", label: "Heart" },
  { id: "flower", label: "Flower" },
  { id: "cloud", label: "Cloud" }
];
const BRAIN_BOARD_NOTE_SHAPE_MAP = new Map(BRAIN_BOARD_NOTE_SHAPES.map((shape) => [shape.id, shape]));
const BRAIN_BOARD_NOTE_SHAPE_IDS = new Set(BRAIN_BOARD_NOTE_SHAPES.map((shape) => shape.id));
const BRAIN_BOARD_DEFAULT_SHAPE = "classic";
const DEFAULT_BOARD_ID = "default";
const BOARD_STATUS_CLEAR_DELAY = 4000;
const BOARD_SCALE_DEFAULT = 1;
const BOARD_SCALE_MIN = 0.6;
const BOARD_SCALE_MAX = 1.4;
const BOARD_SCALE_STEP = 0.1;
const BOARD_SCALE_TOLERANCE = 0.001;
const NOTE_MIN_WIDTH = 160;
const NOTE_MAX_WIDTH = 560;
const NOTE_MIN_HEIGHT = 210;
const NOTE_MAX_HEIGHT = 840;

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
const boardSaveTriggers = new Set();
let boardSwitcherEl = null;
let boardSwitcherDialog = null;
let boardSwitcherSelect = null;
let boardSwitcherSaveButton = null;
let boardSwitcherLoadButton = null;
let boardSwitcherCloseButton = null;
let boardSwitcherActiveTrigger = null;
const flowchartPromptElements = {
  container: document.querySelector("[data-flowchart-prompt]"),
  output: document.querySelector("[data-flowchart-prompt-output]"),
  compileButton: document.querySelector("[data-flowchart-prompt-generate]"),
  copyButton: document.querySelector("[data-flowchart-prompt-copy]"),
  status: document.querySelector("[data-flowchart-prompt-status]")
};
let flowchartPromptObserver = null;
let flowchartPromptUpdateTimeoutId = null;

const sections = {
  loading: document.querySelector("[data-lovablesheet-loading]"),
  unauthorized: document.querySelector("[data-lovablesheet-unauthorized]"),
  content: document.querySelector("[data-lovablesheet-content]")
};

const messageEl = document.querySelector("[data-lovablesheet-message]");

let supabaseClient = null;
let authSubscription = null;
let redirecting = false;
let boardLibraryInitialized = false;
let boardLayerEl = null;
let boardOverlayEl = null;
const boardModals = new Map();
let activeBoardModalId = null;
let activeBoardTrigger = null;
let boardModalKeydownRegistered = false;

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
  setupBoardLibrary();
  initCollapsiblePipelineTables();
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

function registerBoardSaveTrigger(button) {
  if (!button || boardSaveTriggers.has(button)) return;
  boardSaveTriggers.add(button);
  button.addEventListener("click", () => {
    handleSaveBoard();
  });
}

function setBoardSaveButtonsDisabled(disabled) {
  const isDisabled = Boolean(disabled);
  boardSaveTriggers.forEach((button) => {
    if (!button) return;
    button.disabled = isDisabled;
    if (isDisabled) {
      button.setAttribute("aria-busy", "true");
    } else {
      button.removeAttribute("aria-busy");
    }
  });
}

function openBoardSwitcherDialog(trigger) {
  if (!boardSwitcherEl || !boardSwitcherDialog) return;
  boardSwitcherEl.hidden = false;
  boardSwitcherEl.setAttribute("aria-hidden", "false");
  boardSwitcherActiveTrigger = trigger && typeof trigger.focus === "function" ? trigger : null;
  if (!boardsLoaded) {
    fetchBoards();
  }
  updateBoardOptions(currentBoardId);
  window.requestAnimationFrame(() => {
    boardSwitcherDialog.focus({ preventScroll: true });
  });
}

function closeBoardSwitcherDialog({ returnFocus = true } = {}) {
  if (!boardSwitcherEl) return;
  boardSwitcherEl.hidden = true;
  boardSwitcherEl.setAttribute("aria-hidden", "true");
  if (returnFocus && boardSwitcherActiveTrigger) {
    window.requestAnimationFrame(() => {
      boardSwitcherActiveTrigger?.focus?.();
    });
  }
  boardSwitcherActiveTrigger = null;
}

function normalizeHexColor(value) {
  if (typeof value !== "string") return "";
  const cleaned = value.trim();
  if (!/^#?[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(cleaned)) {
    return "";
  }
  const hex = cleaned.startsWith("#") ? cleaned.slice(1) : cleaned;
  const normalized = hex.length === 3
    ? hex.split("").map((char) => char + char).join("")
    : hex.padStart(6, "0");
  return `#${normalized.toLowerCase()}`;
}

function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  const value = normalized.slice(1);
  const bigint = Number.parseInt(value, 16);
  if (!Number.isFinite(bigint)) return null;
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const normalizeChannel = (channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = normalizeChannel(rgb.r);
  const g = normalizeChannel(rgb.g);
  const b = normalizeChannel(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function mixHexColors(colorA, colorB, weight = 0.5) {
  const rgbA = hexToRgb(colorA);
  const rgbB = hexToRgb(colorB);
  if (!rgbA || !rgbB) return normalizeHexColor(colorA) || "";
  const clampedWeight = clamp(Number(weight), 0, 1);
  const mix = (a, b) => Math.round(a * (1 - clampedWeight) + b * clampedWeight);
  const componentToHex = (component) => component.toString(16).padStart(2, "0");
  const r = mix(rgbA.r, rgbB.r);
  const g = mix(rgbA.g, rgbB.g);
  const b = mix(rgbA.b, rgbB.b);
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

function extractTextFromHtml(html) {
  if (typeof html !== "string" || !html.trim()) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const text = temp.textContent || "";
  return text.replace(/\s+/g, " ").trim();
}

function setFlowchartPromptStatus(message, tone = "neutral") {
  const statusEl = flowchartPromptElements.status;
  if (!statusEl) return;
  statusEl.textContent = message || "";
  statusEl.classList.remove("is-success", "is-error");
  if (tone === "success") {
    statusEl.classList.add("is-success");
  } else if (tone === "error") {
    statusEl.classList.add("is-error");
  }
}

function compileFlowchartPrompt({ announce = true } = {}) {
  const { output, container } = flowchartPromptElements;
  if (!output || !flowchartBoard) return "";

  const notes = flowchartBoard.captureSnapshot();
  const processed = notes
    .map((note) => {
      const label = typeof note.label === "string" ? note.label.trim() : "";
      const body = extractTextFromHtml(note.body);
      if (!label && !body) return null;
      return {
        label,
        body,
        x: Number.isFinite(Number(note.x)) ? Number(note.x) : 0,
        y: Number.isFinite(Number(note.y)) ? Number(note.y) : 0
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const deltaY = a.y - b.y;
      if (Math.abs(deltaY) > 1) {
        return deltaY;
      }
      return a.x - b.x;
    });

  const promptParts = processed.map((note, index) => {
    const prefix = note.label || `Note ${index + 1}`;
    if (!note.body) {
      return prefix;
    }
    return `${prefix}: ${note.body}`;
  });

  const prompt = promptParts.join("\n\n");
  output.value = prompt;

  if (container) {
    container.dataset.promptEmpty = promptParts.length ? "false" : "true";
  }

  if (!promptParts.length) {
    if (announce || !flowchartPromptElements.status?.textContent) {
      setFlowchartPromptStatus("Add flowchart notes to build your prompt.");
    }
    return "";
  }

  if (announce) {
    const total = promptParts.length;
    const summary = total === 1
      ? "Combined 1 flowchart note into a prompt."
      : `Combined ${total} flowchart notes into a prompt.`;
    setFlowchartPromptStatus(summary, "success");
  }

  return prompt;
}

function scheduleFlowchartPromptUpdate() {
  if (flowchartPromptUpdateTimeoutId) {
    window.clearTimeout(flowchartPromptUpdateTimeoutId);
  }
  flowchartPromptUpdateTimeoutId = window.setTimeout(() => {
    flowchartPromptUpdateTimeoutId = null;
    compileFlowchartPrompt({ announce: false });
  }, 300);
}

async function copyFlowchartPrompt() {
  const { output } = flowchartPromptElements;
  if (!output) return;

  const text = output.value.trim();
  if (!text) {
    setFlowchartPromptStatus("Compile the flowchart prompt before copying it.", "error");
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      output.focus();
      output.select();
      const successful = document.execCommand ? document.execCommand("copy") : false;
      output.setSelectionRange(text.length, text.length);
      output.blur();
      if (!successful) {
        throw new Error("execCommand copy was unsuccessful");
      }
    }
    setFlowchartPromptStatus("Copied the flowchart prompt to your clipboard.", "success");
  } catch (error) {
    console.error("Unable to copy flowchart prompt.", error);
    setFlowchartPromptStatus("Copy is unavailable. Select the text manually to share it.", "error");
  }
}

function setupFlowchartPrompt(board) {
  const { container, compileButton, copyButton } = flowchartPromptElements;
  if (!container || !board) return;

  compileButton?.addEventListener("click", () => {
    compileFlowchartPrompt();
  });

  copyButton?.addEventListener("click", () => {
    copyFlowchartPrompt();
  });

  const workspace = board.querySelector("[data-board-workspace]");
  if (workspace) {
    workspace.addEventListener("input", scheduleFlowchartPromptUpdate);

    if (flowchartPromptObserver) {
      flowchartPromptObserver.disconnect();
    }

    flowchartPromptObserver = new MutationObserver(scheduleFlowchartPromptUpdate);
    flowchartPromptObserver.observe(workspace, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["data-x", "data-y", "data-color", "data-custom-color"]
    });
  }

  compileFlowchartPrompt({ announce: true });
}

function normalizeNoteColorValue(color) {
  if (typeof color !== "string") {
    return "sunshine";
  }
  const trimmed = color.trim();
  if (BRAIN_BOARD_PRESET_IDS.has(trimmed)) {
    return trimmed;
  }
  const normalizedHex = normalizeHexColor(trimmed);
  if (normalizedHex) {
    return normalizedHex;
  }
  return "sunshine";
}

function cloneNotes(notes = []) {
  if (!Array.isArray(notes)) return [];
  return notes.map((note) => ({
    color: normalizeNoteColorValue(note.color),
    x: Number.isFinite(Number(note.x)) ? Number(note.x) : 0,
    y: Number.isFinite(Number(note.y)) ? Number(note.y) : 0,
    width: parsePositiveNumber(note.width),
    height: parsePositiveNumber(note.height),
    label: typeof note.label === "string" ? note.label : "",
    body: typeof note.body === "string" ? note.body : "",
    placeholder: typeof note.placeholder === "string" ? note.placeholder : "",
    shape: normalizeNoteShapeValue(note.shape)
  }));
}

function parsePositiveNumber(value) {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function normalizeNoteShapeValue(shape) {
  if (typeof shape !== "string") {
    return BRAIN_BOARD_DEFAULT_SHAPE;
  }
  const trimmed = shape.trim().toLocaleLowerCase();
  if (BRAIN_BOARD_NOTE_SHAPE_IDS.has(trimmed)) {
    return trimmed;
  }
  return BRAIN_BOARD_DEFAULT_SHAPE;
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

    this.columnOverlay = null;
    this.columnCount = BRAIN_BOARD_DEFAULT_COLUMN_COUNT;
    this.columnGap = BRAIN_BOARD_DEFAULT_COLUMN_GAP;
    this.columnSnapThreshold = BRAIN_BOARD_DEFAULT_SNAP_THRESHOLD;
    this.snapIndicatorTimeouts = new WeakMap();

    this.labelEditor = {
      container: null,
      input: null,
      emojiButtons: [],
      note: null,
      trigger: null,
      initialValue: ""
    };
    this.boundLabelEditorOutside = this.handleLabelEditorOutside.bind(this);
    this.boundLabelEditorFocus = this.handleLabelEditorFocus.bind(this);
    this.boundLabelEditorReposition = this.repositionLabelEditor.bind(this);

    this.scaleMin = BOARD_SCALE_MIN;
    this.scaleMax = BOARD_SCALE_MAX;
    this.scaleStep = BOARD_SCALE_STEP;
    this.scaleTolerance = BOARD_SCALE_TOLERANCE;
    this.groupRadius = BRAIN_BOARD_GROUP_RADIUS;
    this.colorPresets = BRAIN_BOARD_COLOR_PRESET_MAP;
    this.presetIds = BRAIN_BOARD_PRESET_IDS;
    this.defaultPreset = this.colorPresets.get("sunshine") ?? { value: "#fef3c7" };
    this.noteShapes = BRAIN_BOARD_NOTE_SHAPE_MAP;
    this.shapeIds = BRAIN_BOARD_NOTE_SHAPE_IDS;
    this.defaultShape = BRAIN_BOARD_DEFAULT_SHAPE;
    this.noteMinWidth = NOTE_MIN_WIDTH;
    this.noteMaxWidth = NOTE_MAX_WIDTH;
    this.noteMinHeight = NOTE_MIN_HEIGHT;
    this.noteMaxHeight = NOTE_MAX_HEIGHT;

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
    this.menuToggleButton = this.menu?.querySelector("[data-board-menu-toggle]") ?? null;
    this.inlineSaveButton = this.menu?.querySelector("[data-board-save-inline]") ?? null;
    this.switcherButton = this.menu?.querySelector("[data-board-switcher-open]") ?? null;
    this.menuOpen = false;
    this.menuOutsideListenerBound = false;

    this.controlsBound = false;
    this.activeColorMenu = null;
    this.handleDocumentPointerDown = (event) => {
      if (!this.activeColorMenu) return;
      const { menu, toggle } = this.activeColorMenu;
      if (menu.contains(event.target) || toggle.contains(event.target)) {
        return;
      }
      this.closeColorMenu();
    };
    this.handleDocumentKeyDown = (event) => {
      if (!this.activeColorMenu) return;
      if (event.key === "Escape") {
        event.preventDefault();
        const { toggle } = this.activeColorMenu;
        this.closeColorMenu();
        toggle?.focus?.();
      }
    };
    this.handleMenuKeydown = (event) => {
      if (event.key === "Escape" && this.menuOpen) {
        event.preventDefault();
        this.closeMenu();
        this.menuToggleButton?.focus?.();
      }
    };
    this.handleDocumentPointerDownMenu = (event) => {
      if (!this.menu || !this.menuOpen) return;
      if (this.menu.contains(event.target)) {
        return;
      }
      this.closeMenu();
    };
    this.columnVisualFrame = null;

    this.initializeLabelEditor();
  }

  initialize() {
    if (!this.root || !this.workspace || !this.noteTemplate) {
      return false;
    }

    this.setupColumns();
    this.workspace.querySelectorAll("[data-note]").forEach((note) => {
      this.setupNote(note);
    });

    this.bindControls();
    this.fitToNotes();
    this.scheduleColumnVisualUpdate();
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
        this.closeMenu();
      });
    }

    if (this.zoomOutButton) {
      this.zoomOutButton.addEventListener("click", () => {
        this.adjustScale(-this.scaleStep);
        this.closeMenu();
      });
    }

    if (this.zoomInButton) {
      this.zoomInButton.addEventListener("click", () => {
        this.adjustScale(this.scaleStep);
        this.closeMenu();
      });
    }

    if (this.zoomFitButton) {
      this.zoomFitButton.addEventListener("click", () => {
        this.setScale(this.getFitScale());
        this.closeMenu();
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

    if (this.menuToggleButton) {
      this.menuToggleButton.addEventListener("click", () => {
        this.toggleMenu();
      });
      this.menuToggleButton.setAttribute("aria-expanded", "false");
    }

    if (this.menu) {
      this.menu.addEventListener("keydown", this.handleMenuKeydown);
    }

    if (this.inlineSaveButton) {
      registerBoardSaveTrigger(this.inlineSaveButton);
      this.inlineSaveButton.addEventListener("click", () => {
        this.closeMenu();
      });
    }

    if (this.switcherButton) {
      this.switcherButton.addEventListener("click", () => {
        const focusTarget = this.menuToggleButton ?? this.switcherButton;
        openBoardSwitcherDialog(focusTarget);
        this.closeMenu();
      });
    }

    if (!this.menuOutsideListenerBound) {
      document.addEventListener("pointerdown", this.handleDocumentPointerDownMenu);
      this.menuOutsideListenerBound = true;
    }

    this.updateZoomControls();
  }

  openMenu() {
    if (!this.menu || this.menuOpen) return;
    this.menuOpen = true;
    this.menu.classList.add("is-open");
    if (this.menuToggleButton) {
      this.menuToggleButton.setAttribute("aria-expanded", "true");
    }
  }

  closeMenu() {
    if (!this.menu || !this.menuOpen) return;
    this.menuOpen = false;
    this.menu.classList.remove("is-open");
    if (this.menuToggleButton) {
      this.menuToggleButton.setAttribute("aria-expanded", "false");
    }
  }

  toggleMenu() {
    if (this.menuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
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

  fitToNotes() {
    const targetScale = this.getFitScale();
    if (!Number.isFinite(targetScale)) {
      this.applyScale();
      return;
    }

    if (Math.abs(targetScale - this.scale) > this.scaleTolerance) {
      this.setScale(targetScale);
    } else {
      this.applyScale();
    }
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

  deleteNote(note) {
    if (!note || !this.workspace || !this.workspace.contains(note)) return;

    if (this.activeColorMenu?.note === note) {
      this.closeColorMenu();
    }

    if (this.labelEditor.note === note) {
      this.closeLabelEditor();
    }

    const wasFocused = note.contains(document.activeElement);
    note.remove();
    this.updateZoomControls();
    this.scheduleColumnVisualUpdate();

    if (wasFocused) {
      this.addButton?.focus?.({ preventScroll: true });
    }
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
    if (!note) return;

    let currentColor = note.dataset.color || "sunshine";
    const customColor = note.dataset.customColor;
    let activePresetId = "";
    let previewColor = "";

    if (this.presetIds.has(currentColor)) {
      activePresetId = currentColor;
      previewColor = this.colorPresets.get(currentColor)?.value || this.defaultPreset.value;
    } else if (customColor && normalizeHexColor(customColor)) {
      currentColor = CUSTOM_COLOR_ID;
      previewColor = normalizeHexColor(customColor);
      note.dataset.color = CUSTOM_COLOR_ID;
    } else if (!this.presetIds.has(currentColor) && normalizeHexColor(currentColor)) {
      const normalized = normalizeHexColor(currentColor);
      note.dataset.color = CUSTOM_COLOR_ID;
      note.dataset.customColor = normalized;
      previewColor = normalized;
    } else {
      note.dataset.color = "sunshine";
      activePresetId = "sunshine";
      previewColor = this.defaultPreset.value;
      delete note.dataset.customColor;
    }

    const resolvedColor = previewColor || this.defaultPreset.value;
    const previewEl = note.querySelector("[data-note-color-preview]");
    if (previewEl) {
      previewEl.style.setProperty("--note-color-preview", resolvedColor);
      previewEl.style.background = resolvedColor;
    }

    const colorPicker = note.querySelector("[data-note-color-picker]");
    if (colorPicker && resolvedColor) {
      colorPicker.value = resolvedColor;
    }

    note.querySelectorAll("[data-note-color]").forEach((swatch) => {
      const isActive = activePresetId && swatch.dataset.noteColor === activePresetId;
      swatch.classList.toggle("is-active", Boolean(isActive));
      swatch.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    this.ensureShapeControls(note);
    this.updateShapeControls(note);
  }

  setNoteColor(note, color) {
    if (!note || typeof color !== "string") return;

    const trimmed = color.trim();
    if (this.presetIds.has(trimmed)) {
      this.applyPresetColor(note, trimmed);
      this.updateColorControls(note);
      return;
    }

    const normalizedHex = normalizeHexColor(trimmed);
    if (!normalizedHex) return;
    this.applyCustomColor(note, normalizedHex);
    this.updateColorControls(note);
  }

  applyPresetColor(note, presetId) {
    note.dataset.color = presetId;
    delete note.dataset.customColor;
    note.style.removeProperty("--note-custom-bg");
    note.style.removeProperty("--note-custom-ink");
    note.style.removeProperty("--note-custom-border");
    note.style.removeProperty("--note-custom-shadow");
    note.style.removeProperty("--note-custom-glow");
  }

  applyCustomColor(note, hexColor) {
    note.dataset.color = CUSTOM_COLOR_ID;
    note.dataset.customColor = hexColor;

    const textColor = relativeLuminance(hexColor) > 0.6 ? "#0f172a" : "#f8fafc";
    const borderBlendTarget = textColor === "#f8fafc" ? "#0f172a" : "#ffffff";
    const borderColor = mixHexColors(hexColor, borderBlendTarget, textColor === "#f8fafc" ? 0.6 : 0.35) || textColor;
    const glowColor = mixHexColors(hexColor, "#0f172a", 0.45) || hexColor;

    note.style.setProperty("--note-custom-bg", hexColor);
    note.style.setProperty("--note-custom-ink", textColor);
    note.style.setProperty("--note-custom-border", borderColor);
    note.style.setProperty("--note-custom-shadow", "0 20px 34px rgba(15,23,42,.24)");
    note.style.setProperty("--note-custom-glow", glowColor);
  }

  setNoteSize(note, width, height) {
    if (!note) return;

    if (Number.isFinite(width) && width > 0) {
      const minWidth = this.noteMinWidth || NOTE_MIN_WIDTH;
      const maxWidth = Number.isFinite(this.noteMaxWidth) ? this.noteMaxWidth : width;
      const resolvedMax = Number.isFinite(maxWidth) ? Math.max(minWidth, maxWidth) : minWidth;
      const clampedWidth = clamp(width, minWidth, resolvedMax);
      note.dataset.width = `${clampedWidth}`;
      note.style.setProperty("--note-width", `${clampedWidth}px`);
    } else {
      delete note.dataset.width;
      note.style.removeProperty("--note-width");
    }

    if (Number.isFinite(height) && height > 0) {
      const minHeight = this.noteMinHeight || NOTE_MIN_HEIGHT;
      const maxHeight = Number.isFinite(this.noteMaxHeight) ? this.noteMaxHeight : height;
      const resolvedMaxHeight = Number.isFinite(maxHeight) ? Math.max(minHeight, maxHeight) : minHeight;
      const clampedHeight = clamp(height, minHeight, resolvedMaxHeight);
      note.dataset.height = `${clampedHeight}`;
      note.style.setProperty("--note-height", `${clampedHeight}px`);
    } else {
      delete note.dataset.height;
      note.style.removeProperty("--note-height");
    }
  }

  ensureResizeHandle(note) {
    if (!note) return null;
    let handle = note.querySelector("[data-note-resize]");
    if (!handle) {
      handle = document.createElement("button");
      handle.type = "button";
      handle.className = "brain-board__resize-handle";
      handle.dataset.noteResize = "true";
      handle.setAttribute("aria-label", "Resize sticky note");
      handle.setAttribute("tabindex", "-1");
      const srLabel = document.createElement("span");
      srLabel.className = "sr-only";
      srLabel.textContent = "Resize sticky note";
      handle.appendChild(srLabel);
      note.appendChild(handle);
    }
    return handle;
  }

  ensureNoteShape(note) {
    if (!note) {
      return this.defaultShape;
    }
    const normalized = normalizeNoteShapeValue(note.dataset.shape);
    note.dataset.shape = normalized;
    return normalized;
  }

  ensureShapeControls(note) {
    if (!note) return;

    const colorMenu = note.querySelector("[data-note-color-menu]");
    if (!colorMenu) return;

    let optionsContainer = colorMenu.querySelector("[data-note-shape-options]");
    if (!optionsContainer) {
      const section = document.createElement("div");
      section.className = "brain-board__menu-section";
      section.setAttribute("role", "group");
      section.setAttribute("aria-label", "Sticky note design");
      section.dataset.noteShapeSection = "true";

      const heading = document.createElement("p");
      heading.className = "brain-board__menu-heading";
      heading.textContent = "Note shape";
      section.appendChild(heading);

      optionsContainer = document.createElement("div");
      optionsContainer.className = "brain-board__menu-options brain-board__menu-options--shapes";
      optionsContainer.dataset.noteShapeOptions = "true";
      section.appendChild(optionsContainer);

      const divider = colorMenu.querySelector(".brain-board__menu-divider");
      if (divider) {
        colorMenu.insertBefore(section, divider);
      } else {
        colorMenu.appendChild(section);
      }
    }

    if (!optionsContainer) return;

    if (!optionsContainer.dataset.shapeOptionsBuilt) {
      optionsContainer.innerHTML = "";
      const shapes = this.noteShapes ? Array.from(this.noteShapes.values()) : BRAIN_BOARD_NOTE_SHAPES;
      shapes.forEach((shape) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "brain-board__shape-button";
        button.dataset.noteShape = shape.id;
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-label", shape.label);
        button.title = shape.label;

        const preview = document.createElement("span");
        preview.className = "brain-board__shape-preview";
        preview.dataset.shapePreview = shape.id;
        button.appendChild(preview);

        const srLabel = document.createElement("span");
        srLabel.className = "sr-only";
        srLabel.textContent = shape.label;
        button.appendChild(srLabel);

        optionsContainer.appendChild(button);
      });
      optionsContainer.dataset.shapeOptionsBuilt = "true";
    }

    if (!optionsContainer.dataset.shapeOptionsBound) {
      optionsContainer.addEventListener("click", (event) => {
        const button = event.target.closest("[data-note-shape]");
        if (!button || !optionsContainer.contains(button)) {
          return;
        }
        event.preventDefault();
        this.setNoteShape(note, button.dataset.noteShape);
        this.closeColorMenu(colorMenu);
      });
      optionsContainer.dataset.shapeOptionsBound = "true";
    }
  }

  updateShapeControls(note) {
    if (!note) return;
    const activeShape = this.ensureNoteShape(note);
    const colorMenu = note.querySelector("[data-note-color-menu]");
    if (!colorMenu) return;
    const optionsContainer = colorMenu.querySelector("[data-note-shape-options]");
    if (!optionsContainer) return;

    optionsContainer.querySelectorAll("[data-note-shape]").forEach((button) => {
      const isActive = button.dataset.noteShape === activeShape;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  setNoteShape(note, shapeId) {
    if (!note) return;
    const normalized = normalizeNoteShapeValue(shapeId);
    note.dataset.shape = normalized;
    this.updateShapeControls(note);
    this.scheduleColumnVisualUpdate();
  }

  openColorMenu(note, toggle, menu) {
    if (!toggle || !menu) return;
    const alreadyOpen = this.activeColorMenu?.menu === menu;
    if (alreadyOpen) return;

    this.closeColorMenu();

    toggle.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    window.requestAnimationFrame(() => {
      menu.classList.add("is-open");
    });

    this.activeColorMenu = { note, toggle, menu };
    document.addEventListener("pointerdown", this.handleDocumentPointerDown);
    document.addEventListener("keydown", this.handleDocumentKeyDown);
  }

  closeColorMenu(targetMenu) {
    if (!this.activeColorMenu) return;
    if (targetMenu && this.activeColorMenu.menu !== targetMenu) {
      return;
    }

    const { menu, toggle } = this.activeColorMenu;
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");

    const hideMenu = () => {
      menu.hidden = true;
      menu.removeEventListener("transitionend", hideMenu);
    };
    menu.addEventListener("transitionend", hideMenu, { once: true });
    window.setTimeout(() => {
      if (!menu.classList.contains("is-open")) {
        menu.hidden = true;
      }
    }, 180);

    document.removeEventListener("pointerdown", this.handleDocumentPointerDown);
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
    this.activeColorMenu = null;
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

  setupColumns() {
    if (!this.workspace) return;

    this.columnOverlay = this.workspace.querySelector("[data-board-columns-overlay]") ?? null;

    const columnCountAttr = this.workspace.dataset.boardColumns;
    const parsedCount = Number.parseInt(columnCountAttr ?? "", 10);
    this.columnCount = Number.isFinite(parsedCount) && parsedCount > 0 ? parsedCount : BRAIN_BOARD_DEFAULT_COLUMN_COUNT;

    const columnGapAttr = this.workspace.dataset.boardColumnGap;
    const parsedGap = Number.parseFloat(columnGapAttr ?? "");
    this.columnGap = Number.isFinite(parsedGap) && parsedGap >= 0 ? parsedGap : BRAIN_BOARD_DEFAULT_COLUMN_GAP;

    const snapAttr = this.workspace.dataset.boardSnapThreshold;
    const parsedSnap = Number.parseFloat(snapAttr ?? "");
    this.columnSnapThreshold = Number.isFinite(parsedSnap) && parsedSnap >= 0 ? parsedSnap : BRAIN_BOARD_DEFAULT_SNAP_THRESHOLD;

    if (this.columnOverlay) {
      this.columnOverlay.innerHTML = "";
      if (this.columnCount > 0) {
        this.columnOverlay.dataset.active = "true";
        const fragment = document.createDocumentFragment();
        for (let index = 0; index < this.columnCount; index += 1) {
          const columnEl = document.createElement("div");
          columnEl.className = "brain-board__column";
          columnEl.setAttribute("aria-hidden", "true");
          columnEl.dataset.columnIndex = `${index}`;
          fragment.appendChild(columnEl);
        }
        this.columnOverlay.appendChild(fragment);
      } else {
        this.columnOverlay.removeAttribute("data-active");
      }
    }

    this.updateColumnStyles();
    this.scheduleColumnVisualUpdate();
  }

  updateColumnStyles() {
    if (!this.workspace) return;
    const countValue = Math.max(0, Number.parseInt(`${this.columnCount}`, 10) || 0);
    const gapValue = Math.max(0, Number.parseFloat(`${this.columnGap}`) || 0);
    this.workspace.style.setProperty("--brain-board-column-count", `${countValue}`);
    this.workspace.style.setProperty("--brain-board-column-gap", `${gapValue}px`);
    if (this.columnOverlay) {
      if (countValue > 0) {
        this.columnOverlay.dataset.active = "true";
      } else {
        this.columnOverlay.removeAttribute("data-active");
      }
    }
  }

  getColumnMetrics(boardWidthPx) {
    if (!this.workspace) return null;
    if (!Number.isFinite(boardWidthPx) || boardWidthPx <= 0) return null;
    if (!this.columnCount || this.columnCount <= 0) return null;

    const boardWidthUnits = boardWidthPx / this.scale;
    const gapUnits = Math.max(0, this.columnGap) / this.scale;
    const totalGapUnits = gapUnits * (this.columnCount - 1);
    const availableWidthUnits = boardWidthUnits - totalGapUnits;
    if (!(availableWidthUnits > 0)) {
      return null;
    }

    const columnWidthUnits = availableWidthUnits / this.columnCount;
    if (!(columnWidthUnits > 0)) {
      return null;
    }

    const metrics = [];
    let cursor = 0;
    for (let index = 0; index < this.columnCount; index += 1) {
      const start = cursor;
      const end = start + columnWidthUnits;
      const center = start + columnWidthUnits / 2;
      metrics.push({ index, start, end, center, width: columnWidthUnits });
      cursor = end + gapUnits;
    }

    return { columnWidthUnits, gapUnits, metrics };
  }

  scheduleColumnVisualUpdate() {
    if (this.columnVisualFrame) return;
    this.columnVisualFrame = window.requestAnimationFrame(() => {
      this.columnVisualFrame = null;
      this.applyColumnVisuals();
    });
  }

  applyColumnVisuals() {
    if (!this.columnOverlay) {
      return;
    }

    if (!this.workspace || !this.columnCount || this.columnCount <= 0) {
      this.columnOverlay.querySelectorAll(".brain-board__column").forEach((column) => {
        column.style.removeProperty("--brain-board-column-scale");
        column.classList.remove("is-expanded");
      });
      return;
    }

    const boardWidth = this.workspace.clientWidth;
    if (!(boardWidth > 0)) {
      return;
    }

    const metrics = this.getColumnMetrics(boardWidth);
    if (!metrics) {
      return;
    }

    const baseWidth = metrics.columnWidthUnits;
    const columnWidths = new Array(this.columnCount).fill(baseWidth);

    this.workspace.querySelectorAll("[data-note][data-column]").forEach((note) => {
      const columnIndex = Number.parseInt(note.dataset.column, 10) - 1;
      if (!Number.isInteger(columnIndex) || columnIndex < 0 || columnIndex >= columnWidths.length) {
        return;
      }
      const noteWidth = note.offsetWidth;
      if (Number.isFinite(noteWidth) && noteWidth > columnWidths[columnIndex]) {
        columnWidths[columnIndex] = noteWidth;
      }
    });

    this.columnOverlay.querySelectorAll(".brain-board__column").forEach((columnEl, index) => {
      const width = columnWidths[index] ?? baseWidth;
      const scale = baseWidth > 0 ? Math.max(width / baseWidth, 1) : 1;
      columnEl.style.setProperty("--brain-board-column-scale", `${scale}`);
      columnEl.classList.toggle("is-expanded", scale > 1.01);
    });
  }

  getColumnSnapTarget({ boardWidthPx, noteWidthUnits, targetX }) {
    if (!this.workspace) return null;
    if (!Number.isFinite(targetX)) return null;
    if (!Number.isFinite(noteWidthUnits) || noteWidthUnits <= 0) return null;

    const metrics = this.getColumnMetrics(boardWidthPx);
    if (!metrics) return null;

    const { metrics: columns } = metrics;
    if (!columns.length) return null;

    const boardWidthUnits = boardWidthPx / this.scale;
    const maxX = Math.max(0, boardWidthUnits - noteWidthUnits);
    const thresholdUnits = Math.max(0, this.columnSnapThreshold) / this.scale;
    const noteCenter = targetX + noteWidthUnits / 2;

    let closest = null;
    columns.forEach((column) => {
      const distance = Math.abs(noteCenter - column.center);
      if (distance <= thresholdUnits) {
        if (!closest || distance < closest.distance) {
          closest = { column, distance };
        }
      }
    });

    if (!closest) return null;

    const snapX = clamp(closest.column.center - noteWidthUnits / 2, 0, maxX);
    return { columnIndex: closest.column.index, x: snapX };
  }

  showSnapIndicator(note) {
    if (!note) return;
    const existing = this.snapIndicatorTimeouts.get(note);
    if (existing) {
      window.clearTimeout(existing);
    }
    note.dataset.snapIndicator = "true";
    const timeoutId = window.setTimeout(() => {
      note.removeAttribute("data-snap-indicator");
      this.snapIndicatorTimeouts.delete(note);
    }, BRAIN_BOARD_SNAP_INDICATOR_DURATION);
    this.snapIndicatorTimeouts.set(note, timeoutId);
  }

  clearSnapIndicator(note) {
    if (!note) return;
    const existing = this.snapIndicatorTimeouts.get(note);
    if (existing) {
      window.clearTimeout(existing);
      this.snapIndicatorTimeouts.delete(note);
    }
    note.removeAttribute("data-snap-indicator");
  }

  initializeLabelEditor() {
    const container = this.root?.querySelector("[data-note-label-editor]") ?? null;
    const input = container?.querySelector("[data-note-label-input]") ?? null;
    const emojiButtons = container ? Array.from(container.querySelectorAll("[data-note-label-emoji]")) : [];

    this.labelEditor.container = container;
    this.labelEditor.input = input ?? null;
    this.labelEditor.emojiButtons = emojiButtons;
    this.labelEditor.note = null;
    this.labelEditor.trigger = null;
    this.labelEditor.initialValue = "";

    if (!container) {
      return;
    }

    if (input) {
      input.addEventListener("input", () => {
        this.syncLabelEditorInput();
      });
      input.addEventListener("keydown", (event) => {
        this.handleLabelEditorInputKeydown(event);
      });
    }

    emojiButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const emoji = button.dataset.noteLabelEmoji || button.textContent || "";
        if (!emoji) return;
        this.insertLabelEmoji(emoji);
      });
    });
  }

  syncLabelEditorInput() {
    if (!this.labelEditor.note || !this.labelEditor.input) return;
    const labelEl = this.labelEditor.note.querySelector("[data-note-label]");
    if (!labelEl) return;
    labelEl.textContent = this.labelEditor.input.value || "";
  }

  insertLabelEmoji(emoji) {
    if (!this.labelEditor.input) return;
    const input = this.labelEditor.input;
    const start = Number.isFinite(input.selectionStart) ? input.selectionStart : input.value.length;
    const end = Number.isFinite(input.selectionEnd) ? input.selectionEnd : input.value.length;
    const nextValue = `${input.value.slice(0, start)}${emoji}${input.value.slice(end)}`;
    input.value = nextValue;
    const nextCursor = start + emoji.length;
    if (typeof input.setSelectionRange === "function") {
      input.setSelectionRange(nextCursor, nextCursor);
    }
    this.syncLabelEditorInput();
    input.focus({ preventScroll: true });
  }

  handleLabelEditorInputKeydown(event) {
    if (!this.labelEditor.container || this.labelEditor.container.hidden) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      this.restoreLabelEditorInitialValue();
      this.closeLabelEditor({ restoreFocus: true });
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.syncLabelEditorInput();
      this.closeLabelEditor({ restoreFocus: true });
    }
  }

  restoreLabelEditorInitialValue() {
    if (!this.labelEditor.note) return;
    const labelEl = this.labelEditor.note.querySelector("[data-note-label]");
    if (!labelEl) return;
    const initial = this.labelEditor.initialValue || "";
    if (this.labelEditor.input) {
      this.labelEditor.input.value = initial;
    }
    labelEl.textContent = initial;
  }

  openLabelEditor(note, trigger) {
    if (!this.labelEditor.container || !note || !trigger) {
      return;
    }

    if (!this.labelEditor.container.hidden && this.labelEditor.note === note) {
      this.closeLabelEditor({ restoreFocus: true });
      return;
    }

    this.closeLabelEditor();

    const labelEl = note.querySelector("[data-note-label]");
    const currentValue = labelEl?.textContent ?? "";

    this.labelEditor.note = note;
    this.labelEditor.trigger = trigger;
    this.labelEditor.initialValue = currentValue;

    if (this.labelEditor.input) {
      this.labelEditor.input.value = currentValue;
    }

    trigger.setAttribute("aria-expanded", "true");

    this.labelEditor.container.hidden = false;
    this.repositionLabelEditor();
    window.requestAnimationFrame(() => {
      this.repositionLabelEditor();
      if (this.labelEditor.input) {
        this.labelEditor.input.focus({ preventScroll: true });
        const end = this.labelEditor.input.value.length;
        if (typeof this.labelEditor.input.setSelectionRange === "function") {
          this.labelEditor.input.setSelectionRange(0, end);
        }
      }
    });

    document.addEventListener("pointerdown", this.boundLabelEditorOutside, true);
    document.addEventListener("focusin", this.boundLabelEditorFocus, true);
    window.addEventListener("resize", this.boundLabelEditorReposition);
    document.addEventListener("scroll", this.boundLabelEditorReposition, true);
  }

  closeLabelEditor(options = {}) {
    if (!this.labelEditor.container) {
      return;
    }

    const { restoreFocus = false } = options;
    const trigger = this.labelEditor.trigger;

    if (!this.labelEditor.container.hidden) {
      this.labelEditor.container.hidden = true;
    }
    this.labelEditor.container.style.top = "";
    this.labelEditor.container.style.left = "";

    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }

    document.removeEventListener("pointerdown", this.boundLabelEditorOutside, true);
    document.removeEventListener("focusin", this.boundLabelEditorFocus, true);
    window.removeEventListener("resize", this.boundLabelEditorReposition);
    document.removeEventListener("scroll", this.boundLabelEditorReposition, true);

    this.labelEditor.note = null;
    this.labelEditor.trigger = null;
    this.labelEditor.initialValue = "";

    if (restoreFocus) {
      trigger?.focus?.({ preventScroll: true });
    }
  }

  handleLabelEditorOutside(event) {
    if (!this.labelEditor.container || this.labelEditor.container.hidden) {
      return;
    }
    const target = event.target;
    if (this.labelEditor.container.contains(target)) {
      return;
    }
    if (this.labelEditor.trigger?.contains(target)) {
      return;
    }
    this.closeLabelEditor();
  }

  handleLabelEditorFocus(event) {
    if (!this.labelEditor.container || this.labelEditor.container.hidden) {
      return;
    }
    const target = event.target;
    if (this.labelEditor.container.contains(target)) {
      return;
    }
    if (this.labelEditor.trigger?.contains(target)) {
      return;
    }
    this.closeLabelEditor();
  }

  repositionLabelEditor() {
    if (!this.labelEditor.container || this.labelEditor.container.hidden || !this.labelEditor.trigger) {
      return;
    }

    const container = this.labelEditor.container;
    const trigger = this.labelEditor.trigger;
    const triggerRect = trigger.getBoundingClientRect();
    if (!triggerRect || (triggerRect.width === 0 && triggerRect.height === 0)) {
      return;
    }

    container.style.top = "0px";
    container.style.left = "0px";
    const popoverRect = container.getBoundingClientRect();

    const margin = 16;
    const viewportWidth = document.documentElement?.clientWidth || window.innerWidth || 0;
    const viewportHeight = document.documentElement?.clientHeight || window.innerHeight || 0;

    let top = triggerRect.bottom + 12;
    let left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;

    if (left < margin) {
      left = margin;
    } else if (left + popoverRect.width > viewportWidth - margin) {
      left = Math.max(margin, viewportWidth - margin - popoverRect.width);
    }

    if (top + popoverRect.height > viewportHeight - margin) {
      top = triggerRect.top - 12 - popoverRect.height;
    }

    if (top < margin) {
      top = Math.min(triggerRect.bottom + 12, Math.max(margin, viewportHeight - margin - popoverRect.height));
    }

    container.style.top = `${Math.round(top)}px`;
    container.style.left = `${Math.round(left)}px`;
  }

  setupNote(note) {
    if (!note) return;

    const x = Number.parseFloat(note.dataset.x || "0");
    const y = Number.parseFloat(note.dataset.y || "0");
    this.setNotePosition(note, x, y);
    const storedWidth = Number.parseFloat(note.dataset.width || "NaN");
    const storedHeight = Number.parseFloat(note.dataset.height || "NaN");
    this.setNoteSize(note, storedWidth, storedHeight);
    this.ensureNoteShape(note);
    this.updateColorControls(note);

    const isGroupMode = note.dataset.groupMode === "true";
    note.dataset.groupMode = isGroupMode ? "true" : "false";
    this.updateGroupButtonState(note, isGroupMode);

    const handle = note.querySelector("[data-note-handle]");
    if (handle) {
      handle.addEventListener("pointerdown", (event) => {
        if (!this.workspace) return;
        if (event.button && event.button !== 0) return;
        if (
          event.target.closest("[data-note-color]") ||
          event.target.closest("[data-note-group]") ||
          event.target.closest("[data-note-color-toggle]") ||
          event.target.closest("[data-note-color-picker]") ||
          event.target.closest("[data-note-menu-button]") ||
          event.target.closest("[data-note-label-trigger]")
        ) {
          return;
        }
        event.preventDefault();

        this.closeLabelEditor();

        const pointerId = event.pointerId;
        const boardWidth = this.workspace.clientWidth;
        const boardHeight = this.workspace.clientHeight;
        const noteWidthUnits = note.offsetWidth;
        const noteWidth = noteWidthUnits * this.scale;
        const noteHeight = note.offsetHeight * this.scale;
        const maxX = Math.max(0, (boardWidth - noteWidth) / this.scale);
        const maxY = Math.max(0, (boardHeight - noteHeight) / this.scale);

        const startX = Number.parseFloat(note.dataset.x || "0");
        const startY = Number.parseFloat(note.dataset.y || "0");
        const originPointer = { x: event.clientX, y: event.clientY };

        const groupEnabled = note.dataset.groupMode === "true";
        const nearbyNotes = groupEnabled ? this.getNearbyColorNotes(note) : [];

        note.dataset.dragging = "true";
        let activeSnap = null;
        handle.setPointerCapture(pointerId);

        const onPointerMove = (moveEvent) => {
          const deltaX = (moveEvent.clientX - originPointer.x) / this.scale;
          const deltaY = (moveEvent.clientY - originPointer.y) / this.scale;

          const targetX = clamp(startX + deltaX, 0, maxX);
          const targetY = clamp(startY + deltaY, 0, maxY);
          const snapTarget = this.getColumnSnapTarget({
            boardWidthPx: boardWidth,
            noteWidthUnits,
            targetX
          });

          let appliedX = targetX;
          if (snapTarget) {
            activeSnap = snapTarget;
            appliedX = snapTarget.x;
            note.dataset.column = `${snapTarget.columnIndex + 1}`;
          } else {
            activeSnap = null;
            note.removeAttribute("data-column");
            this.clearSnapIndicator(note);
          }

          this.setNotePosition(note, appliedX, targetY);
          this.scheduleColumnVisualUpdate();

          if (groupEnabled && nearbyNotes.length) {
            const offsetAdjustmentX = appliedX - targetX;
            nearbyNotes.forEach((entry) => {
              const neighborMaxX = Math.max(0, (boardWidth - entry.width) / this.scale);
              const neighborMaxY = Math.max(0, (boardHeight - entry.height) / this.scale);
              const neighborX = clamp(entry.startX + deltaX + offsetAdjustmentX, 0, neighborMaxX);
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

          if (activeSnap) {
            note.dataset.column = `${activeSnap.columnIndex + 1}`;
            this.showSnapIndicator(note);
          } else {
            note.removeAttribute("data-column");
            this.clearSnapIndicator(note);
          }

          if (groupEnabled) {
            this.disableGroupMove(note);
          }

          this.scheduleColumnVisualUpdate();
        };

        handle.addEventListener("pointermove", onPointerMove);
        handle.addEventListener("pointerup", onPointerEnd);
        handle.addEventListener("pointercancel", onPointerEnd);
      });
    }

    const resizeHandle = this.ensureResizeHandle(note);
    if (resizeHandle && !resizeHandle.dataset.resizeBound) {
      resizeHandle.dataset.resizeBound = "true";
      resizeHandle.addEventListener("pointerdown", (event) => {
        if (!this.workspace) return;
        if (event.button && event.button !== 0) return;
        event.preventDefault();

        const pointerId = event.pointerId;
        const origin = { x: event.clientX, y: event.clientY };
        const startWidth = note.offsetWidth;
        const startHeight = note.offsetHeight;
        const startX = Number.parseFloat(note.dataset.x || "0");
        const startY = Number.parseFloat(note.dataset.y || "0");
        const boardWidthUnits = this.workspace.clientWidth / this.scale;
        const boardHeightUnits = this.workspace.clientHeight / this.scale;

        note.dataset.resizing = "true";
        resizeHandle.setPointerCapture(pointerId);

        const onPointerMove = (moveEvent) => {
          const deltaX = (moveEvent.clientX - origin.x) / this.scale;
          const deltaY = (moveEvent.clientY - origin.y) / this.scale;

          const availableWidth = Number.isFinite(boardWidthUnits)
            ? Math.max(this.noteMinWidth, boardWidthUnits - startX)
            : Math.max(this.noteMinWidth, this.noteMaxWidth || this.noteMinWidth);
          const availableHeight = Number.isFinite(boardHeightUnits)
            ? Math.max(this.noteMinHeight, boardHeightUnits - startY)
            : Math.max(this.noteMinHeight, this.noteMaxHeight || this.noteMinHeight);

          const maxWidth = Number.isFinite(this.noteMaxWidth)
            ? Math.min(this.noteMaxWidth, availableWidth)
            : availableWidth;
          const maxHeight = Number.isFinite(this.noteMaxHeight)
            ? Math.min(this.noteMaxHeight, availableHeight)
            : availableHeight;

          const resolvedMaxWidth = Number.isFinite(maxWidth) ? Math.max(this.noteMinWidth, maxWidth) : this.noteMinWidth;
          const resolvedMaxHeight = Number.isFinite(maxHeight) ? Math.max(this.noteMinHeight, maxHeight) : this.noteMinHeight;

          const nextWidth = clamp(startWidth + deltaX, this.noteMinWidth, resolvedMaxWidth);
          const nextHeight = clamp(startHeight + deltaY, this.noteMinHeight, resolvedMaxHeight);

          this.setNoteSize(note, nextWidth, nextHeight);
          this.scheduleColumnVisualUpdate();
        };

        const finalizeResize = () => {
          delete note.dataset.resizing;
          if (resizeHandle.hasPointerCapture(pointerId)) {
            resizeHandle.releasePointerCapture(pointerId);
          }
          resizeHandle.removeEventListener("pointermove", onPointerMove);
          resizeHandle.removeEventListener("pointerup", finalizeResize);
          resizeHandle.removeEventListener("pointercancel", finalizeResize);

          const boardWidth = this.workspace.clientWidth;
          const boardHeight = this.workspace.clientHeight;
          const currentX = Number.parseFloat(note.dataset.x || "0");
          const currentY = Number.parseFloat(note.dataset.y || "0");

          if (boardWidth > 0) {
            const maxX = Math.max(0, (boardWidth - note.offsetWidth * this.scale) / this.scale);
            if (currentX > maxX) {
              this.setNotePosition(note, maxX, currentY);
            }
          }

          if (boardHeight > 0) {
            const maxY = Math.max(0, (boardHeight - note.offsetHeight * this.scale) / this.scale);
            if (currentY > maxY) {
              this.setNotePosition(note, Number.parseFloat(note.dataset.x || "0"), maxY);
            }
          }

          this.scheduleColumnVisualUpdate();
        };

        resizeHandle.addEventListener("pointermove", onPointerMove);
        resizeHandle.addEventListener("pointerup", finalizeResize);
        resizeHandle.addEventListener("pointercancel", finalizeResize);
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

    const labelTrigger = note.querySelector("[data-note-label-trigger]");
    if (labelTrigger) {
      labelTrigger.setAttribute("aria-expanded", "false");
      if (this.labelEditor.container) {
        labelTrigger.removeAttribute("aria-disabled");
        labelTrigger.removeAttribute("disabled");
        labelTrigger.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!this.labelEditor.container.hidden && this.labelEditor.note === note) {
            this.closeLabelEditor({ restoreFocus: true });
          } else {
            this.openLabelEditor(note, labelTrigger);
          }
        });
      } else {
        labelTrigger.setAttribute("aria-disabled", "true");
      }
    }

    const colorToggle = note.querySelector("[data-note-color-toggle]");
    const colorMenu = note.querySelector("[data-note-color-menu]");
    const colorPicker = note.querySelector("[data-note-color-picker]");

    if (colorToggle && colorMenu) {
      colorToggle.addEventListener("click", (event) => {
        event.preventDefault();
        const isOpen = this.activeColorMenu?.menu === colorMenu;
        if (isOpen) {
          this.closeColorMenu(colorMenu);
        } else {
          this.openColorMenu(note, colorToggle, colorMenu);
        }
      });
    }

    if (colorMenu) {
      colorMenu.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          this.closeColorMenu(colorMenu);
          colorToggle?.focus?.();
        }
      });
    }

    note.querySelectorAll("[data-note-color]").forEach((swatch) => {
      swatch.addEventListener("click", () => {
        this.setNoteColor(note, swatch.dataset.noteColor);
        this.closeColorMenu(colorMenu);
      });
    });

    this.ensureShapeControls(note);

    if (colorPicker) {
      colorPicker.addEventListener("input", () => {
        this.setNoteColor(note, colorPicker.value);
      });
      colorPicker.addEventListener("change", () => {
        this.closeColorMenu(colorMenu);
      });
    }

    const deleteButton = note.querySelector("[data-note-delete]");
    if (deleteButton) {
      deleteButton.addEventListener("click", () => {
        this.deleteNote(note);
      });
    }
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

    const color = normalizeNoteColorValue(noteData?.color);
    this.setNoteColor(element, color);

    const shape = normalizeNoteShapeValue(noteData?.shape);
    element.dataset.shape = shape;

    const noteWidth = parsePositiveNumber(noteData?.width);
    const noteHeight = parsePositiveNumber(noteData?.height);
    this.setNoteSize(element, noteWidth ?? Number.NaN, noteHeight ?? Number.NaN);

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
    this.scheduleColumnVisualUpdate();

    return noteElement;
  }

  captureSnapshot() {
    if (!this.workspace) return [];
    return Array.from(this.workspace.querySelectorAll("[data-note]")).map((note) => {
      const bodyEl = note.querySelector("[data-note-body]");
      const labelEl = note.querySelector("[data-note-label]");
      return {
        color: note.dataset.customColor || note.dataset.color || "sunshine",
        x: Number.parseFloat(note.dataset.x || "0") || 0,
        y: Number.parseFloat(note.dataset.y || "0") || 0,
        width: parsePositiveNumber(note.dataset.width),
        height: parsePositiveNumber(note.dataset.height),
        label: labelEl ? labelEl.textContent?.trim() || "" : "",
        body: bodyEl ? bodyEl.innerHTML : "",
        placeholder: bodyEl?.getAttribute("data-placeholder") || "",
        shape: normalizeNoteShapeValue(note.dataset.shape)
      };
    });
  }

  renderNotes(notes = []) {
    if (!this.workspace) return;
    this.closeLabelEditor();
    this.workspace.innerHTML = "";
    cloneNotes(notes).forEach((noteData) => {
      const noteElement = this.createNoteElement(noteData);
      if (noteElement) {
        this.workspace.appendChild(noteElement);
        this.setupNote(noteElement);
      }
    });
    this.fitToNotes();
    this.scheduleColumnVisualUpdate();
  }
}

function enableStickyBoardScrollSnap() {
  const root = document.documentElement;
  if (!root) {
    return;
  }

  if (!reducedMotionListenerInitialized && prefersReducedMotionQuery) {
    const handlePreferenceChange = (event) => {
      if (event.matches) {
        root.classList.remove(SCROLL_SNAP_CLASS);
      } else {
        enableStickyBoardScrollSnap();
      }
    };

    if (typeof prefersReducedMotionQuery.addEventListener === "function") {
      prefersReducedMotionQuery.addEventListener("change", handlePreferenceChange);
    } else if (typeof prefersReducedMotionQuery.addListener === "function") {
      prefersReducedMotionQuery.addListener(handlePreferenceChange);
    }

    reducedMotionListenerInitialized = true;
  }

  if (prefersReducedMotionQuery?.matches) {
    root.classList.remove(SCROLL_SNAP_CLASS);
    return;
  }

  if (!root.classList.contains(SCROLL_SNAP_CLASS)) {
    root.classList.add(SCROLL_SNAP_CLASS);
  }
}

function initializeStickyBoards() {
  enableStickyBoardScrollSnap();
  setupBrainBoard();
  setupFlowchartBoard();
}

function closeActiveBoardModal({ restoreFocus = true } = {}) {
  if (!activeBoardModalId) return;
  const modal = boardModals.get(activeBoardModalId);
  if (modal) {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
  }
  closeBoardSwitcherDialog({ returnFocus: false });
  activeBoardModalId = null;
  if (boardLayerEl) {
    boardLayerEl.hidden = true;
    boardLayerEl.setAttribute("aria-hidden", "true");
  }
  if (document.body) {
    document.body.classList.remove("lovablesheet-modal-open");
  }
  if (restoreFocus && activeBoardTrigger && typeof activeBoardTrigger.focus === "function") {
    activeBoardTrigger.focus();
  }
  activeBoardTrigger = null;
}

function openBoardModal(boardId, trigger) {
  if (!boardLayerEl || !boardModals.has(boardId)) return;
  if (activeBoardModalId && activeBoardModalId !== boardId) {
    closeActiveBoardModal({ restoreFocus: false });
  }

  const modal = boardModals.get(boardId);
  if (!modal) return;

  boardLayerEl.hidden = false;
  boardLayerEl.setAttribute("aria-hidden", "false");
  boardModals.forEach((element, id) => {
    if (id === boardId) {
      element.hidden = false;
      element.setAttribute("aria-hidden", "false");
    } else {
      element.hidden = true;
      element.setAttribute("aria-hidden", "true");
    }
  });

  if (document.body) {
    document.body.classList.add("lovablesheet-modal-open");
  }

  activeBoardModalId = boardId;
  activeBoardTrigger = trigger && typeof trigger.focus === "function" ? trigger : null;

  if (boardId === "brain" && brainBoard) {
    brainBoard.fitToNotes();
  } else if (boardId === "flowchart" && flowchartBoard) {
    flowchartBoard.fitToNotes();
  }

  const dialog = modal.querySelector("[data-board-modal-dialog]");
  if (dialog) {
    dialog.setAttribute("tabindex", "-1");
    window.requestAnimationFrame(() => {
      dialog.focus({ preventScroll: true });
    });
  }
}

function handleBoardModalKeydown(event) {
  if (event.key === "Escape" && activeBoardModalId) {
    event.preventDefault();
    closeActiveBoardModal();
  }
}

function setupBoardLibrary() {
  if (boardLibraryInitialized) return;

  boardLayerEl = document.querySelector("[data-board-layer]");
  if (!boardLayerEl) {
    boardLibraryInitialized = true;
    return;
  }

  boardLayerEl.setAttribute("aria-hidden", boardLayerEl.hidden ? "true" : "false");

  boardOverlayEl = boardLayerEl.querySelector("[data-board-modal-overlay]") ?? null;
  boardModals.clear();
  boardLayerEl.querySelectorAll("[data-board-modal]").forEach((modal) => {
    const identifier = modal.dataset.boardModal;
    if (!identifier) return;
    boardModals.set(identifier, modal);
    modal.setAttribute("aria-hidden", modal.hidden ? "true" : "false");
  });

  document.querySelectorAll("[data-board-launch]").forEach((button) => {
    const targetId = button.dataset.boardLaunch;
    if (!targetId) return;
    button.addEventListener("click", () => {
      openBoardModal(targetId, button);
    });
  });

  boardLayerEl.querySelectorAll("[data-board-close]").forEach((button) => {
    button.addEventListener("click", () => {
      closeActiveBoardModal();
    });
  });

  boardOverlayEl?.addEventListener("click", () => {
    closeActiveBoardModal();
  });

  if (!boardModalKeydownRegistered) {
    document.addEventListener("keydown", handleBoardModalKeydown);
    boardModalKeydownRegistered = true;
  }

  boardLibraryInitialized = true;
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

  boardSelectEl = document.querySelector("[data-board-select]");
  boardSaveButton = document.querySelector("[data-board-save]");
  boardStatusEl = document.querySelector("[data-board-status]");
  boardSwitcherEl = board.querySelector("[data-board-switcher]") ?? null;
  boardSwitcherDialog = boardSwitcherEl?.querySelector(".brain-board-switcher__dialog") ?? null;
  boardSwitcherSelect = boardSwitcherEl?.querySelector("[data-board-switcher-select]") ?? null;
  boardSwitcherSaveButton = boardSwitcherEl?.querySelector("[data-board-switcher-save]") ?? null;
  boardSwitcherLoadButton = boardSwitcherEl?.querySelector("[data-board-switcher-load]") ?? null;
  boardSwitcherCloseButton = boardSwitcherEl?.querySelector("[data-board-switcher-close]") ?? null;

  if (boardSwitcherEl) {
    boardSwitcherEl.setAttribute("aria-hidden", boardSwitcherEl.hidden ? "true" : "false");
    boardSwitcherEl.querySelectorAll("[data-board-switcher-dismiss]").forEach((element) => {
      element.addEventListener("click", () => {
        closeBoardSwitcherDialog();
      });
    });
    boardSwitcherEl.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeBoardSwitcherDialog();
      }
    });
  }

  if (boardSwitcherCloseButton) {
    boardSwitcherCloseButton.addEventListener("click", () => {
      closeBoardSwitcherDialog();
    });
  }

  if (boardSwitcherDialog) {
    boardSwitcherDialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeBoardSwitcherDialog();
      }
    });
  }

  if (boardSwitcherSaveButton) {
    registerBoardSaveTrigger(boardSwitcherSaveButton);
  }

  if (boardSwitcherLoadButton) {
    boardSwitcherLoadButton.addEventListener("click", () => {
      const targetId = boardSwitcherSelect?.value;
      if (!targetId) return;
      selectBoard(targetId);
      closeBoardSwitcherDialog();
    });
  }

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
  } else if (boardSwitcherSelect) {
    updateBoardOptions(DEFAULT_BOARD_ID);
  }

  registerBoardSaveTrigger(boardSaveButton);

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

  setupFlowchartPrompt(board);

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
  const selects = [];
  if (boardSelectEl) selects.push(boardSelectEl);
  if (boardSwitcherSelect) selects.push(boardSwitcherSelect);
  if (!selects.length) return;

  const sortedBoards = [...supabaseBoards].sort((a, b) => {
    const nameA = a.name.toLocaleLowerCase();
    const nameB = b.name.toLocaleLowerCase();
    if (nameA === nameB) return 0;
    return nameA < nameB ? -1 : 1;
  });

  const options = [
    { value: DEFAULT_BOARD_ID, label: "Default Board (Demo)" },
    ...sortedBoards.map((board) => ({ value: board.id, label: board.name }))
  ];

  const fallback = options.some((option) => option.value === targetSelection)
    ? targetSelection
    : options.some((option) => option.value === currentBoardId)
      ? currentBoardId
      : DEFAULT_BOARD_ID;

  selects.forEach((select) => {
    select.innerHTML = "";
    options.forEach((option) => {
      const element = document.createElement("option");
      element.value = option.value;
      element.textContent = option.label;
      select.appendChild(element);
    });
    const targetValue = options.some((option) => option.value === fallback) ? fallback : DEFAULT_BOARD_ID;
    select.value = targetValue;
  });
}

function selectBoard(boardId, { announce = true } = {}) {
  const targetId = boardsCache.has(boardId) ? boardId : DEFAULT_BOARD_ID;
  const board = boardsCache.get(targetId);
  if (!board) return;

  currentBoardId = targetId;
  if (boardSelectEl && boardSelectEl.value !== targetId) {
    boardSelectEl.value = targetId;
  }
  if (boardSwitcherSelect && boardSwitcherSelect.value !== targetId) {
    boardSwitcherSelect.value = targetId;
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
  setBoardSaveButtonsDisabled(true);
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
    setBoardSaveButtonsDisabled(false);
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
