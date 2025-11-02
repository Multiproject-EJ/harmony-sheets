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

const NEXTGEN_FEATURE_OPTIONS = [
  { id: "screen-size", label: "Screen size" },
  { id: "phone-ready", label: "Phone ready" },
  { id: "themes", label: "Themes" },
  { id: "menu-x", label: "Menu X" },
  { id: "database-in-sheet", label: "Database in sheet" },
  { id: "ai", label: "AI" },
  { id: "images-storing", label: "Images storing" }
];
const NEXTGEN_FEATURE_MAP = new Map(NEXTGEN_FEATURE_OPTIONS.map((feature) => [feature.id, feature]));
const NEXTGEN_DEFAULT_STANDARD_TEXT = [
  "Produce a google sheets product by completing the following:",
  "1) Make the product page JSON with the stats.",
  "2) Push it to Supabase.",
  "3) Fetch from Supabase.",
  "4) Produce the Google Sheet and HTML (1 file only) and add to a new folder in the ‘Google sheets products and demo’ directory in the repo.",
  "   Link the finished product (the HTML) to the interactive demo section on the product page."
].join("\n");
const NEXTGEN_STORAGE_KEY = "lovablesheet.nextGenEngineBriefs";
const NEXTGEN_STANDARD_TABLE = "lovablesheet_nextgen_standard";
const NEXTGEN_STANDARD_ID = "default";

const nextGenState = {
  initialized: false,
  selectedFeatures: [],
  selectedInspiration: [],
  standardText: NEXTGEN_DEFAULT_STANDARD_TEXT,
  standardEditing: false,
  standardSaving: false,
  standardLoaded: false,
  savedBriefs: [],
  products: [],
  productMap: new Map(),
  activeTrigger: null,
  keydownHandler: null,
  inspirationDialogOpen: false,
  inspirationKeydownHandler: null,
  libraryOpen: false,
  libraryTrigger: null,
  libraryKeydownHandler: null,
  elements: {
    section: null,
    openButton: null,
    openButtons: [],
    status: null,
    list: null,
    empty: null,
    layer: null,
    overlay: null,
    modal: null,
    form: null,
    nameInput: null,
    featureSelect: null,
    featureList: null,
    featureEmpty: null,
    descriptionInput: null,
    notesInput: null,
    standardTextarea: null,
    standardEditButton: null,
    standardSaveButton: null,
    standardCancelButton: null,
    standardStatus: null,
    inspirationButton: null,
    inspirationContainer: null,
    inspirationEmpty: null,
    inspirationList: null,
    productsContainer: null,
    productsLoading: null,
    productsError: null,
    inspirationDialog: null,
    inspirationDialogOverlay: null,
    inspirationDialogClose: null,
    inspirationDialogApply: null,
    inspirationDialogCancel: null,
    formStatus: null,
    cancelButton: null,
    closeButton: null,
    summaryCard: null,
    summaryStatus: null,
    summaryState: null,
    summaryDescription: null,
    libraryButton: null,
    libraryLayer: null,
    libraryOverlay: null,
    libraryDialog: null,
    libraryClose: null
  }
};

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

const thinkingToolButtons = Array.from(document.querySelectorAll("[data-thinking-toggle]"));
const thinkingToolPanels = new Map(
  Array.from(document.querySelectorAll("[data-thinking-panel]"))
    .map((panel) => [panel.dataset.thinkingPanel, panel])
    .filter(([id]) => Boolean(id))
);
const thinkingToolsContainer = document.querySelector("[data-thinking-tools]");
const thinkingToolsToggleButton = document.querySelector("[data-thinking-tools-toggle]");
const thinkingToolsCloseButton = document.querySelector("[data-thinking-tools-close]");
let thinkingToolsDocumentClickListenerAdded = false;
const ideaStageElements = {
  stage: document.querySelector("[data-idea-stage]"),
  output: document.querySelector("[data-idea-output]"),
  hint: document.querySelector("[data-step-two-hint]"),
  clearButton: document.querySelector("[data-idea-clear]"),
  container: document.querySelector("[data-idea-output-container]"),
  summaryCard: document.querySelector("[data-idea-summary-card]"),
  summaryStatus: document.querySelector("[data-idea-summary-status]"),
  summaryState: document.querySelector("[data-idea-summary-state]"),
  summaryTitle: document.querySelector("[data-idea-summary-title]"),
  summaryDescription: document.querySelector("[data-idea-summary-description]"),
  openModalButton: document.querySelector("[data-idea-open-modal]"),
  modalLayer: document.querySelector("[data-idea-modal-layer]"),
  modalDialog: document.querySelector("[data-idea-modal-dialog]"),
  modalOverlay: document.querySelector("[data-idea-modal-overlay]"),
  closeModalButton: document.querySelector("[data-idea-modal-close]"),
  successIndicator: document.querySelector("[data-idea-success]"),
  connector: document.querySelector("[data-idea-connector]"),
  stepTwo: document.querySelector("[data-step-two]"),
  lock: document.querySelector("[data-step-two-lock]"),
  draftTable: document.querySelector("[data-draft-table]"),
  draftTableBody: document.querySelector("[data-draft-table-body]"),
  draftEmpty: document.querySelector("[data-draft-empty]")
};
const stepThreeElements = {
  stage: document.querySelector("[data-step-three]"),
  lock: document.querySelector("[data-step-three-lock]"),
  hint: document.querySelector("[data-step-three-hint]"),
  latest: document.querySelector("[data-step-three-latest]"),
  output: document.querySelector("[data-step-three-output]"),
  status: document.querySelector("[data-step-three-status]"),
  generateButton: document.querySelector("[data-step-three-generate]"),
  sendButton: document.querySelector("[data-step-three-send]")
};
const ideaStageState = {
  selectedProduct: "",
  selectionSource: "empty",
  initialized: false,
  modalOpen: false,
  modalTrigger: null,
  modalKeydownHandler: null
};
const stepThreeState = {
  initialized: false,
  latestBriefId: "",
  latestPrompt: ""
};

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

function setThinkingPanelVisibility(panelId, visible) {
  if (!panelId) return;

  const panel = thinkingToolPanels.get(panelId);
  const trigger = thinkingToolButtons.find((button) => button.dataset.thinkingToggle === panelId);

  if (!panel || !trigger) {
    return;
  }

  if (visible) {
    panel.hidden = false;
    panel.classList.add("thinking-panel--active");
    trigger.setAttribute("aria-expanded", "true");
  } else {
    panel.hidden = true;
    panel.classList.remove("thinking-panel--active");
    trigger.setAttribute("aria-expanded", "false");
  }
}

function collapseThinkingPanels(exceptPanelId) {
  thinkingToolPanels.forEach((_panel, id) => {
    if (id === exceptPanelId) return;
    setThinkingPanelVisibility(id, false);
  });
}

function setThinkingToolsOpen(open) {
  if (!thinkingToolsContainer || !thinkingToolsToggleButton) {
    return;
  }

  thinkingToolsContainer.hidden = !open;
  thinkingToolsContainer.classList.toggle("thinking-tools--open", open);
  thinkingToolsToggleButton.setAttribute("aria-expanded", open ? "true" : "false");
  thinkingToolsToggleButton.classList.toggle("thinking-tools-toggle--spinning", open);

  if (open) {
    thinkingToolsContainer.scrollTop = 0;
  }

  if (!thinkingToolsDocumentClickListenerAdded) {
    document.addEventListener("click", (event) => {
      if (!thinkingToolsContainer || thinkingToolsContainer.hidden) {
        return;
      }

      const target = event.target instanceof Node ? event.target : null;
      if (!target) {
        return;
      }

      if (thinkingToolsContainer.contains(target)) {
        return;
      }
      if (thinkingToolsToggleButton && thinkingToolsToggleButton.contains(target)) {
        return;
      }

      setThinkingToolsOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (!thinkingToolsContainer || thinkingToolsContainer.hidden) {
        return;
      }

      setThinkingToolsOpen(false);
      if (thinkingToolsToggleButton) {
        thinkingToolsToggleButton.focus();
      }
    });

    thinkingToolsDocumentClickListenerAdded = true;
  }

  if (!open) {
    collapseThinkingPanels();
  }
}

function initializeThinkingTools() {
  if (!thinkingToolButtons.length || !thinkingToolPanels.size) {
    return;
  }

  setThinkingToolsOpen(false);

  if (thinkingToolsToggleButton) {
    thinkingToolsToggleButton.addEventListener("click", () => {
      const isExpanded = thinkingToolsToggleButton.getAttribute("aria-expanded") === "true";
      const nextState = !isExpanded;
      setThinkingToolsOpen(nextState);

      if (nextState) {
        window.requestAnimationFrame(() => {
          const firstThinkingToggle = thinkingToolsContainer?.querySelector("[data-thinking-toggle]");
          if (firstThinkingToggle instanceof HTMLElement) {
            firstThinkingToggle.focus();
          }
        });
      }
    });
  }

  if (thinkingToolsCloseButton) {
    thinkingToolsCloseButton.addEventListener("click", () => {
      setThinkingToolsOpen(false);
      if (thinkingToolsToggleButton) {
        thinkingToolsToggleButton.focus();
      }
    });
  }

  thinkingToolButtons.forEach((button) => {
    const { thinkingToggle } = button.dataset;
    if (!thinkingToggle || !thinkingToolPanels.has(thinkingToggle)) {
      button.setAttribute("aria-expanded", "false");
      return;
    }

    setThinkingPanelVisibility(thinkingToggle, false);

    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";

      if (isExpanded) {
        setThinkingPanelVisibility(thinkingToggle, false);
        return;
      }

      collapseThinkingPanels(thinkingToggle);
      setThinkingPanelVisibility(thinkingToggle, true);
    });
  });
}

function formatLifeAreaLabel(lifeAreas) {
  if (!Array.isArray(lifeAreas) || lifeAreas.length === 0) {
    return "Life area: Draft";
  }

  const rawValue = String(lifeAreas[0] ?? "").trim();
  if (!rawValue) {
    return "Life area: Draft";
  }

  const normalized = rawValue
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return `Life area: ${normalized}`;
}

function deriveDraftType(product) {
  if (!product) {
    return "Draft concept";
  }

  const nameSegments = typeof product.name === "string"
    ? product.name.split("—").map((segment) => segment.trim()).filter(Boolean)
    : [];

  if (nameSegments.length > 1) {
    return nameSegments.slice(1).join(" — ");
  }

  if (typeof product.tagline === "string" && product.tagline.trim()) {
    return product.tagline.trim();
  }

  return "Draft concept";
}

function renderDraftModelsTable(products = []) {
  const { draftTable, draftTableBody, draftEmpty } = ideaStageElements;
  if (!draftTableBody || !draftTable) {
    return;
  }

  draftTableBody.innerHTML = "";

  const drafts = Array.isArray(products) ? products.filter((product) => product && product.draft) : [];

  if (drafts.length === 0) {
    draftTable.hidden = true;
    if (draftEmpty) {
      draftEmpty.hidden = false;
      draftEmpty.textContent = "No draft models found in the admin catalog.";
    }
    return;
  }

  draftTable.hidden = false;
  if (draftEmpty) {
    draftEmpty.hidden = true;
  }

  drafts.forEach((product) => {
    const row = document.createElement("tr");

    const displayName = typeof product.displayName === "string" && product.displayName.trim()
      ? product.displayName.trim()
      : (typeof product.name === "string" ? product.name.trim() : "Draft concept");

    const productCell = document.createElement("td");
    productCell.dataset.label = "Product";

    const lifeArea = document.createElement("span");
    lifeArea.className = "admin-pipeline__life-area";
    lifeArea.textContent = formatLifeAreaLabel(product.lifeAreas);

    const nameEl = document.createElement("span");
    nameEl.className = "admin-pipeline__product";
    nameEl.textContent = displayName;

    productCell.append(lifeArea, nameEl);

    const typeCell = document.createElement("td");
    typeCell.dataset.label = "Type";
    typeCell.textContent = deriveDraftType(product);

    const badgeCell = document.createElement("td");
    badgeCell.dataset.label = "Badge";
    const badge = document.createElement("span");
    badge.className = "admin-pipeline__badge";
    badge.dataset.badge = "draft";
    badge.textContent = "Draft";
    badgeCell.appendChild(badge);

    const priceCell = document.createElement("td");
    priceCell.dataset.label = "Price";
    priceCell.className = "admin-table__price";
    priceCell.textContent = typeof product.price === "string" && product.price.trim() ? product.price.trim() : "—";

    const briefCell = document.createElement("td");
    briefCell.dataset.label = "Use in Brief";
    briefCell.className = "admin-table__brief";

    const briefButton = document.createElement("button");
    briefButton.type = "button";
    briefButton.className = "pipeline-brief-button";
    briefButton.dataset.pipelineBrief = "";
    briefButton.dataset.productName = displayName;

    const buttonIcon = document.createElement("span");
    buttonIcon.className = "pipeline-brief-button__icon";
    buttonIcon.setAttribute("aria-hidden", "true");
    buttonIcon.textContent = "📝";

    const buttonLabel = document.createElement("span");
    buttonLabel.className = "pipeline-brief-button__label";
    buttonLabel.textContent = "Use in Brief";

    briefButton.append(buttonIcon, buttonLabel);
    briefCell.appendChild(briefButton);

    row.append(productCell, typeCell, badgeCell, priceCell, briefCell);
    draftTableBody.appendChild(row);
  });
}

function getIdeaSummaryCopy(state, productName) {
  const trimmedName = typeof productName === "string" && productName.trim().length > 0 ? productName.trim() : "";
  const quotedName = trimmedName ? `“${trimmedName}”` : "your next concept";

  switch (state) {
    case "draft":
      return {
        status: "Draft in play",
        stateText: "Reviewing draft models",
        title: trimmedName || "Draft concept selected",
        description: trimmedName
          ? `${quotedName} is in draft mode. Open the workspace to review and finalize details.`
          : "A draft concept is in review. Open the workspace to keep refining."
      };
    case "ready":
      return {
        status: "Selected",
        stateText: "Ready for briefing",
        title: trimmedName || "Concept locked in",
        description: trimmedName
          ? `${quotedName} is queued for Step 2. Open the workspace to revisit the pipeline anytime.`
          : "A concept is ready for Step 2. Open the workspace to make adjustments."
      };
    default:
      return {
        status: "Empty slot",
        stateText: "Awaiting concept",
        title: "No concept selected",
        description: "Tap to explore the Todo do pipeline and draft models."
      };
  }
}

function updateIdeaSummary() {
  const { summaryCard, summaryStatus, summaryState, summaryTitle, summaryDescription } = ideaStageElements;
  if (!summaryCard) {
    return;
  }

  const state = ideaStageState.selectionSource;
  const copy = getIdeaSummaryCopy(state, ideaStageState.selectedProduct);

  summaryCard.dataset.summaryState = state;

  if (summaryStatus) {
    summaryStatus.textContent = copy.status;
  }
  if (summaryState) {
    summaryState.textContent = copy.stateText;
  }
  if (summaryTitle) {
    summaryTitle.textContent = copy.title;
  }
  if (summaryDescription) {
    summaryDescription.textContent = copy.description;
  }
}

function handleIdeaModalKeydown(event) {
  if (event.key !== "Escape") {
    return;
  }

  event.preventDefault();
  closeIdeaModal();
}

function openIdeaModal(trigger) {
  const { modalLayer, modalDialog } = ideaStageElements;
  if (!modalLayer || !modalDialog || ideaStageState.modalOpen) {
    return;
  }

  ideaStageState.modalOpen = true;
  ideaStageState.modalTrigger = trigger instanceof HTMLElement ? trigger : null;

  modalLayer.hidden = false;
  modalLayer.setAttribute("aria-hidden", "false");
  modalDialog.removeAttribute("aria-hidden");

  document.body.classList.add("lovablesheet-modal-open");

  window.setTimeout(() => {
    try {
      modalDialog.focus();
    } catch (_error) {
      /* Some browsers might not support focus on generic containers. */
    }
  }, 0);

  if (!ideaStageState.modalKeydownHandler) {
    ideaStageState.modalKeydownHandler = handleIdeaModalKeydown;
    document.addEventListener("keydown", ideaStageState.modalKeydownHandler);
  }
}

function closeIdeaModal(options = {}) {
  const { focusTrigger = true } = options;
  const { modalLayer, modalDialog } = ideaStageElements;
  if (!modalLayer || !modalDialog || !ideaStageState.modalOpen) {
    return;
  }

  modalLayer.hidden = true;
  modalLayer.setAttribute("aria-hidden", "true");
  modalDialog.setAttribute("aria-hidden", "true");

  document.body.classList.remove("lovablesheet-modal-open");

  if (ideaStageState.modalKeydownHandler) {
    document.removeEventListener("keydown", ideaStageState.modalKeydownHandler);
    ideaStageState.modalKeydownHandler = null;
  }

  const { modalTrigger } = ideaStageState;
  ideaStageState.modalTrigger = null;
  ideaStageState.modalOpen = false;

  if (focusTrigger && modalTrigger && typeof modalTrigger.focus === "function") {
    modalTrigger.focus();
  }
}

function updateStepTwoAvailability() {
  const { stepTwo, container, clearButton, lock, successIndicator, connector, hint } = ideaStageElements;
  const hasSelection = ideaStageState.selectedProduct.trim().length > 0;

  if (stepTwo) {
    if (hasSelection) {
      stepTwo.dataset.stageLocked = "false";
      stepTwo.removeAttribute("aria-disabled");
    } else {
      stepTwo.dataset.stageLocked = "true";
      stepTwo.setAttribute("aria-disabled", "true");
    }
  }

  if (lock) {
    lock.hidden = hasSelection;
  }

  if (container) {
    container.hidden = !hasSelection;
    container.classList.toggle("lovablesheet-idea__selection--active", hasSelection);
    container.dataset.ideaSelected = hasSelection ? "true" : "false";
  }

  if (hint) {
    hint.hidden = !hasSelection;
  }

  if (clearButton) {
    clearButton.hidden = !hasSelection;
    clearButton.disabled = !hasSelection;
  }

  if (successIndicator) {
    successIndicator.classList.toggle("lovablesheet-idea__success--active", hasSelection);
  }

  if (connector) {
    connector.classList.toggle("lovablesheet-stage__connector--active", hasSelection);
  }

  updateNextGenSummaryCard(hasSelection);
}

function updateNextGenSummaryCard(hasSelection) {
  const {
    summaryCard,
    summaryStatus,
    summaryState,
    summaryDescription
  } = nextGenState.elements;

  if (!summaryCard) {
    return;
  }

  const productName = ideaStageState.selectedProduct.trim();

  summaryCard.dataset.summaryState = hasSelection ? "ready" : "empty";
  summaryCard.dataset.nextgenSelected = hasSelection ? "true" : "false";

  if (hasSelection) {
    summaryCard.removeAttribute("aria-disabled");
  } else {
    summaryCard.setAttribute("aria-disabled", "true");
  }

  if (summaryStatus) {
    summaryStatus.textContent = hasSelection ? "Product ready" : "Locked";
  }

  if (summaryState) {
    summaryState.textContent = hasSelection
      ? productName
        ? `Brief “${productName}” next`
        : "Ready to brief"
      : "Awaiting product selection";
  }

  if (summaryDescription) {
    summaryDescription.textContent = hasSelection
      ? productName
        ? `Open the Next Gen Engine brief to capture the plan for “${productName}”.`
        : "Open the Next Gen Engine brief to capture the plan for your selected product."
      : "Pick a product in Step 1 to compile the Google Sheet Next Gen Engine brief.";
  }
}

function setStepThreeHint(message) {
  const { hint } = stepThreeElements;
  if (!hint) return;
  hint.textContent = message || "";
}

function setStepThreeStatus(message, tone) {
  const { status } = stepThreeElements;
  if (!status) return;
  status.textContent = message || "";
  if (tone) {
    status.dataset.tone = tone;
  } else {
    status.removeAttribute("data-tone");
  }
}

function setStepThreeOutput(value) {
  const { output } = stepThreeElements;
  const nextValue = typeof value === "string" ? value : "";
  if (output) {
    output.value = nextValue;
  }
  stepThreeState.latestPrompt = nextValue;
}

function updateStepThreeLatestBriefLabel(brief) {
  const { latest } = stepThreeElements;
  if (!latest) return;

  if (brief) {
    const savedAt = formatNextGenTimestamp(brief.createdAt);
    latest.hidden = false;
    latest.textContent = savedAt ? `Latest brief: ${brief.productName || "Untitled brief"} • Saved ${savedAt}` : `Latest brief: ${brief.productName || "Untitled brief"}`;
  } else {
    latest.hidden = true;
    latest.textContent = "";
  }
}

function buildStepThreePrompt(brief) {
  if (!brief) {
    return "";
  }

  const description = brief.description || "No description provided.";
  const notes = brief.notes || "None provided.";

  const features = Array.isArray(brief.features) && brief.features.length
    ? brief.features.map((feature) => `- ${feature.label || feature.id || "Feature"}`).join("\n")
    : "- No feature highlights captured.";

  const inspiration = Array.isArray(brief.inspiration) && brief.inspiration.length
    ? brief.inspiration.map((item) => {
        if (!item) return "";
        const name = item.name || item.id || "Inspiration";
        const draftBadge = item.draft ? " (draft)" : "";
        const scope = item.scope === "features" ? "Feature inspiration" : "Full model";
        const details = item.scope === "features" && item.details ? ` — Focus: ${item.details}` : "";
        return `- ${name}${draftBadge} • ${scope}${details}`;
      }).filter(Boolean).join("\n")
    : "- No inspiration products recorded.";

  const standardText = brief.standardText || NEXTGEN_DEFAULT_STANDARD_TEXT;

  return [
    `You are preparing marketing materials for the Harmony Sheets product "${brief.productName || "Untitled brief"}".`,
    "Use the structured context below to craft launch copy, emails, and promotional assets.",
    "",
    "Product description:",
    description,
    "",
    "Feature highlights:",
    features,
    "",
    "Inspiration references:",
    inspiration,
    "",
    "Standard delivery requirements:",
    standardText,
    "",
    "Additional notes:",
    notes
  ].join("\n");
}

function updateStepThreeAvailability() {
  const { stage, lock, generateButton, sendButton } = stepThreeElements;
  const briefs = Array.isArray(nextGenState.savedBriefs) ? nextGenState.savedBriefs : [];
  const hasBriefs = briefs.length > 0;

  if (stage) {
    stage.dataset.stageLocked = hasBriefs ? "false" : "true";
    if (hasBriefs) {
      stage.removeAttribute("aria-disabled");
    } else {
      stage.setAttribute("aria-disabled", "true");
    }
  }

  if (lock) {
    lock.hidden = hasBriefs;
  }

  setStepThreeHint(hasBriefs
    ? "Step 3 unlocked — build a Codex prompt from your latest brief."
    : "Create a Next Gen brief to unlock Step 3.");

  if (generateButton) {
    generateButton.disabled = !hasBriefs;
    if (!hasBriefs) {
      generateButton.setAttribute("aria-disabled", "true");
    } else {
      generateButton.removeAttribute("aria-disabled");
    }
  }

  if (sendButton) {
    sendButton.disabled = !hasBriefs;
    if (!hasBriefs) {
      sendButton.setAttribute("aria-disabled", "true");
    } else {
      sendButton.removeAttribute("aria-disabled");
    }
  }

  const latestBrief = hasBriefs ? briefs[0] : null;
  updateStepThreeLatestBriefLabel(latestBrief);

  if (!hasBriefs) {
    stepThreeState.latestBriefId = "";
    setStepThreeOutput("");
    setStepThreeStatus("");
    return;
  }

  const selectedExists = briefs.some((brief) => brief.id === stepThreeState.latestBriefId);
  const latestChanged = latestBrief && latestBrief.id !== stepThreeState.latestBriefId;

  if (!selectedExists || latestChanged) {
    stepThreeState.latestBriefId = latestBrief?.id || "";
    if (stepThreeState.latestPrompt) {
      setStepThreeStatus("Latest brief updated. Generate a fresh Codex prompt to reflect the new details.", "info");
    }
    setStepThreeOutput("");
  }
}

function handleStepThreeGenerate() {
  const briefs = Array.isArray(nextGenState.savedBriefs) ? nextGenState.savedBriefs : [];
  if (!briefs.length) {
    setStepThreeStatus("Save a Next Gen brief to generate a Codex prompt.", "error");
    return;
  }

  const latestBrief = briefs[0];
  const prompt = buildStepThreePrompt(latestBrief);
  if (!prompt) {
    setStepThreeStatus("We couldn't create a prompt from that brief. Please try again.", "error");
    return;
  }

  setStepThreeOutput(prompt);
  stepThreeState.latestBriefId = latestBrief.id || "";
  setStepThreeStatus(`Codex prompt created for “${latestBrief.productName || "Untitled brief"}”.`, "success");
}

function handleStepThreeSend() {
  if (!stepThreeState.latestPrompt) {
    setStepThreeStatus("Generate a Codex prompt before sending it to marketing.", "error");
    return;
  }

  const briefs = Array.isArray(nextGenState.savedBriefs) ? nextGenState.savedBriefs : [];
  const targetBrief = briefs.find((brief) => brief.id === stepThreeState.latestBriefId) || briefs[0] || null;
  const productName = targetBrief?.productName ? `“${targetBrief.productName}”` : "This prompt";
  setStepThreeStatus(`${productName} is ready for marketing handoff. (Sending workflow coming soon.)`, "info");
}

function initializeStepThree() {
  if (stepThreeState.initialized) {
    return;
  }

  stepThreeState.initialized = true;
  setStepThreeOutput("");
  setStepThreeStatus("");
  updateStepThreeAvailability();

  const { generateButton, sendButton } = stepThreeElements;

  if (generateButton) {
    generateButton.addEventListener("click", () => {
      setStepThreeStatus("");
      handleStepThreeGenerate();
    });
  }

  if (sendButton) {
    sendButton.addEventListener("click", () => {
      handleStepThreeSend();
    });
  }
}

function setIdeaStageSelection(productName, options = {}) {
  const previousProduct = ideaStageState.selectedProduct;
  const previousSource = ideaStageState.selectionSource;
  const nextValue = typeof productName === "string" ? productName.trim() : "";

  let nextSource = "empty";
  if (nextValue) {
    if (options.source === "draft" || options.source === "ready") {
      nextSource = options.source;
    } else if (previousProduct && previousProduct === nextValue && previousSource !== "empty") {
      nextSource = previousSource;
    } else {
      nextSource = "ready";
    }
  }

  ideaStageState.selectedProduct = nextValue;
  ideaStageState.selectionSource = nextSource;

  const { output, hint } = ideaStageElements;
  if (output) {
    output.textContent = nextValue || "No product selected yet.";
  }

  if (hint) {
    hint.textContent = nextValue
      ? "Step 2 unlocked — open the Next Gen brief to continue."
      : "Select a product from the tables to unlock Step 2.";
  }

  updateIdeaSummary();
  updateStepTwoAvailability();
}

function initializeIdeaStage() {
  if (ideaStageState.initialized) {
    return;
  }

  ideaStageState.initialized = true;
  setIdeaStageSelection("", { source: "reset" });

  const {
    clearButton,
    draftTable,
    draftEmpty,
    openModalButton,
    modalOverlay,
    closeModalButton,
    summaryCard
  } = ideaStageElements;
  if (draftTable) {
    draftTable.hidden = true;
  }
  if (draftEmpty) {
    draftEmpty.hidden = true;
  }

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      setIdeaStageSelection("", { source: "reset" });
    });
  }

  if (openModalButton) {
    openModalButton.addEventListener("click", (event) => {
      event.preventDefault();
      openIdeaModal(openModalButton);
    });
  }

  if (summaryCard) {
    summaryCard.addEventListener("click", (event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest("[data-idea-open-modal]")) {
        return;
      }
      openIdeaModal(openModalButton || summaryCard);
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", () => {
      closeIdeaModal();
    });
  }

  if (closeModalButton) {
    closeModalButton.addEventListener("click", () => {
      closeIdeaModal();
    });
  }
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
  initNextGenEngineBriefs();
  setupBoardLibrary();
  initCollapsiblePipelineTables();
  setupPipelineBriefLaunchers();
  return true;
}

function getNextGenStoredBriefs() {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(NEXTGEN_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => normalizeNextGenBrief(item))
      .filter((item) => item !== null);
  } catch (error) {
    console.warn("[lovablesheet] Failed to parse stored Next Gen briefs", error);
    return [];
  }
}

function persistNextGenBriefs(briefs) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(NEXTGEN_STORAGE_KEY, JSON.stringify(briefs));
  } catch (error) {
    console.error("[lovablesheet] Unable to persist Next Gen briefs", error);
    throw error;
  }
}

function setNextGenStatus(message, tone) {
  const statusEl = nextGenState.elements.status;
  if (!statusEl) return;
  statusEl.textContent = message || "";
  if (tone) {
    statusEl.dataset.tone = tone;
  } else {
    statusEl.removeAttribute("data-tone");
  }
}

function setNextGenFormStatus(message, tone) {
  const statusEl = nextGenState.elements.formStatus;
  if (!statusEl) return;
  statusEl.textContent = message || "";
  if (tone) {
    statusEl.dataset.tone = tone;
  } else {
    statusEl.removeAttribute("data-tone");
  }
}

function setNextGenStandardStatus(message, tone) {
  const statusEl = nextGenState.elements.standardStatus;
  if (!statusEl) return;
  statusEl.textContent = message || "";
  if (tone) {
    statusEl.dataset.tone = tone;
  } else {
    statusEl.removeAttribute("data-tone");
  }
}

function applyNextGenStandardText(value) {
  const normalized = typeof value === "string" && value ? value : NEXTGEN_DEFAULT_STANDARD_TEXT;
  nextGenState.standardText = normalized;
  const textarea = nextGenState.elements.standardTextarea;
  if (textarea) {
    textarea.value = normalized;
    textarea.setAttribute("readonly", "true");
    if (!textarea.classList.contains("nextgen-form__textarea--readonly")) {
      textarea.classList.add("nextgen-form__textarea--readonly");
    }
  }
}

function setNextGenStandardEditing(enabled) {
  const {
    standardTextarea,
    standardEditButton,
    standardSaveButton,
    standardCancelButton
  } = nextGenState.elements;

  nextGenState.standardEditing = Boolean(enabled);

  if (standardTextarea) {
    if (enabled) {
      standardTextarea.removeAttribute("readonly");
      standardTextarea.classList.remove("nextgen-form__textarea--readonly");
      window.setTimeout(() => {
        try {
          standardTextarea.focus();
          const length = standardTextarea.value.length;
          standardTextarea.setSelectionRange(length, length);
        } catch (error) {
          // Ignore focus errors.
        }
      }, 0);
    } else {
      standardTextarea.value = nextGenState.standardText;
      standardTextarea.setAttribute("readonly", "true");
      if (!standardTextarea.classList.contains("nextgen-form__textarea--readonly")) {
        standardTextarea.classList.add("nextgen-form__textarea--readonly");
      }
    }
  }

  if (standardEditButton) {
    standardEditButton.hidden = Boolean(enabled);
    standardEditButton.disabled = nextGenState.standardSaving;
  }
  if (standardSaveButton) {
    standardSaveButton.hidden = !enabled;
    standardSaveButton.disabled = nextGenState.standardSaving;
  }
  if (standardCancelButton) {
    standardCancelButton.hidden = !enabled;
    standardCancelButton.disabled = nextGenState.standardSaving;
  }
}

function handleNextGenStandardEdit() {
  if (!supabaseClient) {
    setNextGenStandardStatus("Supabase connection required to edit the standard text.", "error");
    return;
  }

  setNextGenStandardEditing(true);
  setNextGenStandardStatus("Editing standard text.");
}

function handleNextGenStandardCancel() {
  if (nextGenState.standardSaving) return;
  const textarea = nextGenState.elements.standardTextarea;
  if (textarea) {
    textarea.value = nextGenState.standardText;
  }
  setNextGenStandardEditing(false);
  setNextGenStandardStatus("");
}

async function saveNextGenStandardToSupabase(content) {
  if (!supabaseClient) {
    throw new Error("Supabase client is not available.");
  }

  const payload = { id: NEXTGEN_STANDARD_ID, content };
  const { data, error } = await supabaseClient
    .from(NEXTGEN_STANDARD_TABLE)
    .upsert(payload, { onConflict: "id" })
    .select("content")
    .single();

  if (error) {
    throw error;
  }

  if (data && typeof data.content === "string") {
    return data.content;
  }

  return content;
}

async function handleNextGenStandardSave() {
  const textarea = nextGenState.elements.standardTextarea;
  if (!textarea) return;

  if (!supabaseClient) {
    setNextGenStandardStatus("Supabase connection required to save the standard text.", "error");
    return;
  }

  const value = textarea.value;
  if (!value || !value.trim()) {
    setNextGenStandardStatus("Standard text cannot be empty.", "error");
    textarea.focus();
    return;
  }

  nextGenState.standardSaving = true;
  setNextGenStandardEditing(true);
  setNextGenStandardStatus("Saving standard text…");

  try {
    const saved = await saveNextGenStandardToSupabase(value);
    applyNextGenStandardText(saved);
    setNextGenStandardEditing(false);
    setNextGenStandardStatus("Updated standard text.", "success");
  } catch (error) {
    console.error("[lovablesheet] Unable to save Next Gen standard text", error);
    setNextGenStandardStatus("We couldn't save the standard text. Please try again.", "error");
  } finally {
    nextGenState.standardSaving = false;
    setNextGenStandardEditing(nextGenState.standardEditing);
  }
}

async function loadNextGenStandardFromSupabase() {
  if (nextGenState.standardLoaded) return;
  if (!supabaseClient) return;

  nextGenState.standardLoaded = true;

  try {
    const { data, error } = await supabaseClient
      .from(NEXTGEN_STANDARD_TABLE)
      .select("content")
      .eq("id", NEXTGEN_STANDARD_ID)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data && typeof data.content === "string" && data.content.trim()) {
      applyNextGenStandardText(data.content);
      setNextGenStandardStatus("");
      return;
    }

    setNextGenStandardStatus("");
  } catch (error) {
    console.error("[lovablesheet] Unable to load Next Gen standard text", error);
    setNextGenStandardStatus("We couldn't load the saved standard text. Using the default copy.", "error");
    applyNextGenStandardText(NEXTGEN_DEFAULT_STANDARD_TEXT);
  }
}

function populateNextGenFeatureOptions() {
  const select = nextGenState.elements.featureSelect;
  if (!select) return;

  const existingValues = new Set(Array.from(select.options).map((option) => option.value));
  NEXTGEN_FEATURE_OPTIONS.forEach((feature) => {
    if (existingValues.has(feature.id)) return;
    const option = document.createElement("option");
    option.value = feature.id;
    option.textContent = feature.label;
    select.appendChild(option);
  });
}

function renderNextGenSelectedFeatures() {
  const list = nextGenState.elements.featureList;
  const empty = nextGenState.elements.featureEmpty;
  if (!list) return;

  list.innerHTML = "";
  const features = nextGenState.selectedFeatures;
  if (!features.length) {
    if (empty) {
      empty.hidden = false;
    }
    return;
  }

  if (empty) {
    empty.hidden = true;
  }

  const fragment = document.createDocumentFragment();
  features.forEach((featureId) => {
    const feature = NEXTGEN_FEATURE_MAP.get(featureId) || { id: featureId, label: featureId };
    const item = document.createElement("li");
    item.className = "nextgen-form__chip";
    item.dataset.nextgenFeature = feature.id;

    const labelSpan = document.createElement("span");
    labelSpan.textContent = feature.label;
    item.appendChild(labelSpan);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "nextgen-form__chip-remove";
    removeButton.dataset.nextgenFeatureRemove = feature.id;
    removeButton.setAttribute("aria-label", `Remove ${feature.label}`);
    removeButton.innerHTML = "&times;";
    item.appendChild(removeButton);

    fragment.appendChild(item);
  });

  list.appendChild(fragment);
}

function addNextGenFeature(featureId) {
  if (!featureId || !NEXTGEN_FEATURE_MAP.has(featureId)) {
    return false;
  }

  if (nextGenState.selectedFeatures.includes(featureId)) {
    return false;
  }

  nextGenState.selectedFeatures.push(featureId);
  renderNextGenSelectedFeatures();
  return true;
}

function removeNextGenFeature(featureId) {
  const index = nextGenState.selectedFeatures.indexOf(featureId);
  if (index === -1) return;

  nextGenState.selectedFeatures.splice(index, 1);
  renderNextGenSelectedFeatures();
}

function syncNextGenProductSelections() {
  const { productsContainer } = nextGenState.elements;
  if (!productsContainer) return;
  const selectedIds = new Set(nextGenState.selectedInspiration.map((item) => item.id));
  productsContainer.querySelectorAll("input[type='checkbox']").forEach((input) => {
    input.checked = selectedIds.has(input.value);
  });
}

function renderNextGenSelectedInspiration() {
  const { inspirationContainer, inspirationEmpty, inspirationList } = nextGenState.elements;
  if (!inspirationList) return;

  inspirationList.innerHTML = "";
  const selections = Array.isArray(nextGenState.selectedInspiration) ? nextGenState.selectedInspiration : [];

  if (!selections.length) {
    if (inspirationContainer) {
      inspirationContainer.hidden = true;
    }
    if (inspirationEmpty) {
      inspirationEmpty.hidden = false;
    }
    return;
  }

  if (inspirationContainer) {
    inspirationContainer.hidden = false;
  }
  if (inspirationEmpty) {
    inspirationEmpty.hidden = true;
  }

  const fragment = document.createDocumentFragment();
  selections.forEach((item, index) => {
    if (!item) return;
    const rawId = typeof item.id === "string" && item.id ? item.id : `inspiration-${index}`;
    const sanitizedId = sanitizeNextGenId(rawId, `inspiration-${index}`);
    const name = typeof item.name === "string" && item.name ? item.name : rawId;
    const scope = item.scope === "features" ? "features" : "full";
    const details = typeof item.details === "string" ? item.details : "";

    const entry = document.createElement("article");
    entry.className = "nextgen-form__inspiration-item";
    entry.dataset.nextgenInspirationItem = rawId;

    const header = document.createElement("div");
    header.className = "nextgen-form__inspiration-header";

    const copy = document.createElement("div");
    copy.className = "nextgen-form__inspiration-copy";

    const nameEl = document.createElement("p");
    nameEl.className = "nextgen-form__inspiration-name";
    nameEl.textContent = name;
    copy.appendChild(nameEl);

    const metaEl = document.createElement("p");
    metaEl.className = "nextgen-form__inspiration-meta";
    metaEl.textContent = item.draft ? "Draft • Internal preview" : "Live in storefront";
    copy.appendChild(metaEl);

    header.appendChild(copy);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "nextgen-form__inspiration-remove";
    removeButton.dataset.nextgenInspirationRemove = rawId;
    removeButton.textContent = "Remove";
    header.appendChild(removeButton);

    entry.appendChild(header);

    const options = document.createElement("div");
    options.className = "nextgen-form__inspiration-options";

    const fullLabel = document.createElement("label");
    fullLabel.className = "nextgen-form__inspiration-option";
    const fullInput = document.createElement("input");
    fullInput.type = "radio";
    fullInput.name = `inspiration-scope-${sanitizedId}`;
    fullInput.value = "full";
    fullInput.dataset.nextgenInspirationScope = rawId;
    fullInput.checked = scope !== "features";
    fullLabel.appendChild(fullInput);
    fullLabel.appendChild(document.createTextNode("Full model"));
    options.appendChild(fullLabel);

    const featureLabel = document.createElement("label");
    featureLabel.className = "nextgen-form__inspiration-option";
    const featureInput = document.createElement("input");
    featureInput.type = "radio";
    featureInput.name = `inspiration-scope-${sanitizedId}`;
    featureInput.value = "features";
    featureInput.dataset.nextgenInspirationScope = rawId;
    featureInput.checked = scope === "features";
    featureLabel.appendChild(featureInput);
    featureLabel.appendChild(document.createTextNode("Features"));
    options.appendChild(featureLabel);

    entry.appendChild(options);

    const notes = document.createElement("div");
    notes.className = "nextgen-form__inspiration-notes";
    notes.dataset.nextgenInspirationNotes = rawId;
    notes.hidden = scope !== "features";

    const notesLabel = document.createElement("label");
    notesLabel.className = "nextgen-form__picker-label";
    const notesId = `inspiration-notes-${sanitizedId}`;
    notesLabel.setAttribute("for", notesId);
    notesLabel.textContent = "Feature details";
    notes.appendChild(notesLabel);

    const notesInput = document.createElement("textarea");
    notesInput.className = "nextgen-form__textarea nextgen-form__textarea--condensed";
    notesInput.id = notesId;
    notesInput.rows = 3;
    notesInput.placeholder = "Describe the feature(s) that inspired you.";
    notesInput.dataset.nextgenInspirationDetail = rawId;
    notesInput.value = details;
    notes.appendChild(notesInput);

    entry.appendChild(notes);

    fragment.appendChild(entry);
  });

  inspirationList.appendChild(fragment);
}

function removeNextGenInspiration(productId) {
  const index = nextGenState.selectedInspiration.findIndex((item) => item.id === productId);
  if (index === -1) return;
  nextGenState.selectedInspiration.splice(index, 1);
  renderNextGenSelectedInspiration();
  syncNextGenProductSelections();
}

function updateNextGenInspirationScope(productId, scope) {
  const target = nextGenState.selectedInspiration.find((item) => item.id === productId);
  if (!target) return;

  const normalized = scope === "features" ? "features" : "full";
  target.scope = normalized;

  const { inspirationList } = nextGenState.elements;
  if (!inspirationList) return;

  inspirationList.querySelectorAll("[data-nextgen-inspiration-notes]").forEach((wrapper) => {
    if (wrapper.dataset.nextgenInspirationNotes === productId) {
      wrapper.hidden = normalized !== "features";
      if (!wrapper.hidden) {
        const textarea = wrapper.querySelector(`[data-nextgen-inspiration-detail="${productId}"]`);
        textarea?.focus?.();
      }
    }
  });
}

function updateNextGenInspirationDetails(productId, value) {
  const target = nextGenState.selectedInspiration.find((item) => item.id === productId);
  if (!target) return;
  target.details = value;
}

function handleNextGenInspirationListClick(event) {
  const removeButton = event.target.closest("[data-nextgen-inspiration-remove]");
  if (!removeButton) return;
  const productId = removeButton.dataset.nextgenInspirationRemove;
  if (!productId) return;
  removeNextGenInspiration(productId);
}

function handleNextGenInspirationListChange(event) {
  const control = event.target.closest("[data-nextgen-inspiration-scope]");
  if (!control) return;
  const productId = control.dataset.nextgenInspirationScope;
  if (!productId) return;
  updateNextGenInspirationScope(productId, control.value);
}

function handleNextGenInspirationListInput(event) {
  const field = event.target.closest("[data-nextgen-inspiration-detail]");
  if (!field) return;
  const productId = field.dataset.nextgenInspirationDetail;
  if (!productId) return;
  updateNextGenInspirationDetails(productId, field.value);
}

function handleNextGenInspirationDialogKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeNextGenInspirationDialog({ focusButton: true });
  }
}

function openNextGenInspirationDialog() {
  const { inspirationDialog, productsContainer } = nextGenState.elements;
  if (!inspirationDialog) return;

  inspirationDialog.hidden = false;
  inspirationDialog.setAttribute("aria-hidden", "false");
  nextGenState.inspirationDialogOpen = true;

  if (productsContainer) {
    if (!productsContainer.childElementCount && nextGenState.products.length) {
      renderNextGenProductOptions(nextGenState.products);
    } else {
      syncNextGenProductSelections();
    }
  }

  if (!nextGenState.inspirationKeydownHandler) {
    nextGenState.inspirationKeydownHandler = handleNextGenInspirationDialogKeydown;
  }
  document.addEventListener("keydown", nextGenState.inspirationKeydownHandler);

  window.setTimeout(() => {
    const focusTarget = inspirationDialog.querySelector("input[type='checkbox']")
      || inspirationDialog.querySelector("button, input, [href], select, textarea");
    focusTarget?.focus?.();
  }, 0);
}

function closeNextGenInspirationDialog(options = {}) {
  const { focusButton = false } = options;
  const { inspirationDialog, inspirationButton } = nextGenState.elements;
  if (!inspirationDialog) return;

  inspirationDialog.hidden = true;
  inspirationDialog.setAttribute("aria-hidden", "true");
  nextGenState.inspirationDialogOpen = false;

  if (nextGenState.inspirationKeydownHandler) {
    document.removeEventListener("keydown", nextGenState.inspirationKeydownHandler);
    nextGenState.inspirationKeydownHandler = null;
  }

  if (focusButton && inspirationButton) {
    window.setTimeout(() => {
      try {
        inspirationButton.focus();
      } catch (error) {
        // Ignore focus issues.
      }
    }, 0);
  }
}

function applyNextGenInspirationSelection() {
  const { productsContainer } = nextGenState.elements;
  if (!productsContainer) return;

  const previous = new Map(nextGenState.selectedInspiration.map((item) => [item.id, item]));
  const selections = [];

  productsContainer.querySelectorAll("input[type='checkbox']").forEach((input) => {
    if (!input.checked) return;
    const id = input.value;
    if (!id) return;
    const name = input.dataset.label || nextGenState.productMap.get(id) || id;
    const draft = input.dataset.draft === "true";
    const existing = previous.get(id);
    selections.push({
      id,
      name,
      draft,
      scope: existing?.scope === "features" ? "features" : "full",
      details: existing?.details || ""
    });
  });

  nextGenState.selectedInspiration = selections;
  renderNextGenSelectedInspiration();
  syncNextGenProductSelections();
  closeNextGenInspirationDialog({ focusButton: true });
}

function resetNextGenForm() {
  const {
    form,
    featureSelect,
    descriptionInput,
    notesInput,
    productsContainer,
    standardTextarea
  } = nextGenState.elements;

  form?.reset();
  if (featureSelect) {
    featureSelect.value = "";
  }
  if (descriptionInput) {
    descriptionInput.value = "";
  }
  if (notesInput) {
    notesInput.value = "";
  }

  nextGenState.selectedFeatures = [];
  renderNextGenSelectedFeatures();

  nextGenState.selectedInspiration = [];
  renderNextGenSelectedInspiration();

  if (productsContainer) {
    productsContainer.querySelectorAll("input[type='checkbox']").forEach((input) => {
      input.checked = false;
    });
  }

  if (standardTextarea) {
    standardTextarea.value = nextGenState.standardText;
  }

  nextGenState.standardEditing = false;
  setNextGenStandardEditing(false);
  setNextGenStandardStatus("");

  setNextGenFormStatus("");
}

function handleNextGenModalKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeNextGenModal({ reset: false, focusTrigger: false });
  }
}

function openNextGenModal(trigger) {
  const { layer, modal, nameInput } = nextGenState.elements;
  if (!layer || !modal) return;

  nextGenState.activeTrigger = trigger || null;
  layer.hidden = false;
  modal.hidden = false;
  layer.setAttribute("aria-hidden", "false");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("lovablesheet-modal-open");

  if (!nextGenState.keydownHandler) {
    nextGenState.keydownHandler = handleNextGenModalKeydown;
    document.addEventListener("keydown", nextGenState.keydownHandler);
  }

  window.setTimeout(() => {
    nameInput?.focus?.();
  }, 0);
}

function closeNextGenModal(options = {}) {
  const { reset = false, focusTrigger = true } = options;
  const { layer, modal } = nextGenState.elements;
  if (!layer || !modal) return;

  closeNextGenInspirationDialog({ focusButton: false });

  modal.hidden = true;
  layer.hidden = true;
  layer.setAttribute("aria-hidden", "true");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lovablesheet-modal-open");

  if (nextGenState.keydownHandler) {
    document.removeEventListener("keydown", nextGenState.keydownHandler);
    nextGenState.keydownHandler = null;
  }

  if (reset) {
    resetNextGenForm();
  }

  if (focusTrigger && nextGenState.activeTrigger && typeof nextGenState.activeTrigger.focus === "function") {
    nextGenState.activeTrigger.focus();
  }
  nextGenState.activeTrigger = null;
}

function handleModuleLibraryKeydown(event) {
  if (event.key !== "Escape") {
    return;
  }

  event.preventDefault();
  closeModuleLibrary({ focusTrigger: true });
}

function openModuleLibrary(trigger) {
  const { libraryLayer, libraryDialog } = nextGenState.elements;
  if (!libraryLayer || !libraryDialog || nextGenState.libraryOpen) {
    return;
  }

  libraryLayer.hidden = false;
  libraryLayer.setAttribute("aria-hidden", "false");
  libraryDialog.hidden = false;
  libraryDialog.setAttribute("aria-hidden", "false");

  nextGenState.libraryOpen = true;
  nextGenState.libraryTrigger = trigger || null;

  document.body.classList.add("lovablesheet-modal-open");

  if (!nextGenState.libraryKeydownHandler) {
    nextGenState.libraryKeydownHandler = handleModuleLibraryKeydown;
    document.addEventListener("keydown", nextGenState.libraryKeydownHandler);
  }

  window.setTimeout(() => {
    const focusTarget =
      nextGenState.elements.libraryClose ||
      libraryDialog.querySelector("a, button, [tabindex]:not([tabindex='-1'])") ||
      libraryDialog;

    if (focusTarget && typeof focusTarget.focus === "function") {
      focusTarget.focus();
    }
  }, 0);
}

function closeModuleLibrary(options = {}) {
  const { focusTrigger = true } = options;
  const { libraryLayer, libraryDialog } = nextGenState.elements;
  if (!libraryLayer || !libraryDialog || !nextGenState.libraryOpen) {
    return;
  }

  libraryLayer.hidden = true;
  libraryLayer.setAttribute("aria-hidden", "true");
  libraryDialog.hidden = true;
  libraryDialog.setAttribute("aria-hidden", "true");

  if (nextGenState.libraryKeydownHandler) {
    document.removeEventListener("keydown", nextGenState.libraryKeydownHandler);
    nextGenState.libraryKeydownHandler = null;
  }

  nextGenState.libraryOpen = false;

  const { libraryTrigger } = nextGenState;
  nextGenState.libraryTrigger = null;

  document.body.classList.remove("lovablesheet-modal-open");

  if (focusTrigger && libraryTrigger && typeof libraryTrigger.focus === "function") {
    libraryTrigger.focus();
  }
}

function extractPipelineProductName(button) {
  if (!button) {
    return "";
  }

  const datasetName = typeof button.dataset.productName === "string" ? button.dataset.productName.trim() : "";
  if (datasetName) {
    return datasetName;
  }

  const label = button.querySelector(".pipeline-brief-button__label");
  if (label?.textContent) {
    const text = label.textContent.trim();
    if (text) {
      return text;
    }
  }

  const fallback = button.textContent?.trim();
  return fallback || "";
}

function launchNextGenBriefFromPipeline(trigger) {
  if (!trigger) {
    return;
  }

  if (!nextGenState.initialized) {
    initNextGenEngineBriefs();
  }

  const productName = extractPipelineProductName(trigger);
  const fromDraftTable = Boolean(trigger.closest("[data-draft-table]"));

  setIdeaStageSelection(productName, { source: fromDraftTable ? "draft" : "ready" });

  resetNextGenForm();
  setNextGenFormStatus("");

  const { nameInput } = nextGenState.elements;
  if (nameInput) {
    nameInput.value = productName;
  }

  closeIdeaModal({ focusTrigger: false });
  openNextGenModal(trigger);

  if (nameInput) {
    window.requestAnimationFrame(() => {
      const length = nameInput.value.length;
      try {
        nameInput.setSelectionRange?.(length, length);
      } catch (_error) {
        /* Some inputs may not support selection when type="number" etc. */
      }
    });
  }
}

function setupPipelineBriefLaunchers() {
  const tables = Array.from(document.querySelectorAll("[data-pipeline-table]"));
  if (tables.length === 0) {
    return;
  }

  tables.forEach((table) => {
    if (!(table instanceof HTMLElement)) {
      return;
    }

    if (table.dataset.pipelineBriefInitialized === "true") {
      return;
    }

    table.dataset.pipelineBriefInitialized = "true";

    table.addEventListener("click", (event) => {
      const button = event.target.closest("[data-pipeline-brief]");
      if (!button) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      launchNextGenBriefFromPipeline(button);
    });
  });
}

function sanitizeNextGenId(value, fallback) {
  const base = typeof value === "string" && value.trim() ? value.trim() : fallback;
  return base ? base.replace(/[^a-zA-Z0-9_-]+/g, "-") : fallback;
}

async function fetchNextGenProducts() {
  const { productsLoading, productsError } = nextGenState.elements;
  if (productsLoading) {
    productsLoading.hidden = false;
  }
  if (productsError) {
    productsError.hidden = true;
  }

  try {
    const response = await fetch("products.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("products.json did not return an array.");
    }

    const seenIds = new Set();
    const normalized = data
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;
        const rawId = typeof item.id === "string" && item.id.trim() ? item.id.trim() : `product-${index + 1}`;
        const id = sanitizeNextGenId(rawId, `product-${index + 1}`);
        const name = typeof item.name === "string" && item.name.trim() ? item.name.trim() : id;
        const draft = Boolean(item.draft);
        if (seenIds.has(id)) {
          return null;
        }
        seenIds.add(id);

        const segments = name.split("—").map((segment) => segment.trim()).filter(Boolean);
        const displayName = segments.length > 0 ? segments[0] : name;
        const price = typeof item.price === "string" && item.price.trim() ? item.price.trim() : "";
        const lifeAreas = Array.isArray(item.lifeAreas)
          ? item.lifeAreas.map((area) => String(area ?? "").trim()).filter(Boolean)
          : [];
        const tagline = typeof item.tagline === "string" ? item.tagline.trim() : "";

        return { id, name, displayName, draft, price, lifeAreas, tagline };
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

    nextGenState.products = normalized;
    nextGenState.productMap.clear();
    normalized.forEach((product) => {
      nextGenState.productMap.set(product.id, product.name);
    });

    renderNextGenProductOptions(normalized);
    renderDraftModelsTable(normalized);
  } catch (error) {
    console.error("[lovablesheet] Unable to load products for Next Gen brief", error);
    if (productsError) {
      productsError.hidden = false;
    }
    renderDraftModelsTable([]);
    if (ideaStageElements.draftTable) {
      ideaStageElements.draftTable.hidden = true;
    }
    if (ideaStageElements.draftEmpty) {
      ideaStageElements.draftEmpty.hidden = false;
      ideaStageElements.draftEmpty.textContent = "We couldn't load draft models. Refresh to try again.";
    }
  } finally {
    if (productsLoading) {
      productsLoading.hidden = true;
    }
  }
}

function renderNextGenProductOptions(products) {
  const container = nextGenState.elements.productsContainer;
  const productsError = nextGenState.elements.productsError;
  if (!container) return;

  container.innerHTML = "";
  if (productsError) {
    productsError.hidden = true;
  }

  if (!products.length) {
    const empty = document.createElement("p");
    empty.className = "nextgen-form__loading";
    empty.textContent = "No products found in the catalog.";
    container.appendChild(empty);
    return;
  }

  const selectedIds = new Set(nextGenState.selectedInspiration.map((item) => item.id));
  const fragment = document.createDocumentFragment();
  products.forEach((product, index) => {
    const optionId = `nextgen-product-${sanitizeNextGenId(product.id, String(index))}`;
    const label = document.createElement("label");
    label.className = "nextgen-form__product-option";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "nextgen-inspiration";
    input.id = optionId;
    input.value = product.id;
    input.dataset.label = product.name;
    if (product.draft) {
      input.dataset.draft = "true";
    }
    input.checked = selectedIds.has(product.id);

    const copyWrap = document.createElement("span");
    copyWrap.className = "nextgen-form__product-copy";

    const nameEl = document.createElement("span");
    nameEl.className = "nextgen-form__product-name";
    nameEl.textContent = product.name;
    copyWrap.appendChild(nameEl);

    const metaEl = document.createElement("span");
    metaEl.className = "nextgen-form__product-meta";
    metaEl.textContent = product.draft ? "Draft • Internal preview" : "Live in storefront";
    copyWrap.appendChild(metaEl);

    label.appendChild(input);
    label.appendChild(copyWrap);
    fragment.appendChild(label);
  });

  container.appendChild(fragment);
}

function appendNextGenTextSection(parent, title, text) {
  if (!parent || !text) return;
  const section = document.createElement("div");
  section.className = "lovablesheet-nextgen__section";
  const heading = document.createElement("p");
  heading.className = "lovablesheet-nextgen__section-title";
  heading.textContent = title;
  section.appendChild(heading);
  const body = document.createElement("p");
  body.className = "lovablesheet-nextgen__text";
  body.textContent = text;
  section.appendChild(body);
  parent.appendChild(section);
}

function appendNextGenFeaturesSection(parent, features) {
  if (!parent || !Array.isArray(features) || !features.length) return;
  const section = document.createElement("div");
  section.className = "lovablesheet-nextgen__section";
  const heading = document.createElement("p");
  heading.className = "lovablesheet-nextgen__section-title";
  heading.textContent = "Feature highlights";
  section.appendChild(heading);
  const list = document.createElement("ul");
  list.className = "lovablesheet-nextgen__features";
  features.forEach((feature) => {
    if (!feature) return;
    const id = typeof feature.id === "string" ? feature.id : "";
    const label = typeof feature.label === "string" && feature.label ? feature.label : id;
    if (!label) return;
    const item = document.createElement("li");
    item.className = "lovablesheet-nextgen__feature";
    item.textContent = label;
    list.appendChild(item);
  });
  section.appendChild(list);
  parent.appendChild(section);
}

function appendNextGenInspirationSection(parent, inspiration) {
  if (!parent || !Array.isArray(inspiration) || !inspiration.length) return;
  const section = document.createElement("div");
  section.className = "lovablesheet-nextgen__section lovablesheet-nextgen__inspiration";
  const heading = document.createElement("p");
  heading.className = "lovablesheet-nextgen__section-title";
  heading.textContent = "Inspiration products";
  section.appendChild(heading);
  const list = document.createElement("ul");
  list.className = "lovablesheet-nextgen__inspiration-list";
  inspiration.forEach((item) => {
    if (!item) return;
    const name = typeof item.name === "string" && item.name ? item.name : item.id;
    if (!name) return;
    const row = document.createElement("li");
    row.className = "lovablesheet-nextgen__inspiration-item";
    const nameSpan = document.createElement("span");
    nameSpan.textContent = name;
    row.appendChild(nameSpan);
    if (item.draft) {
      const badge = document.createElement("span");
      badge.className = "lovablesheet-nextgen__badge";
      badge.textContent = "Draft";
      row.appendChild(badge);
    }
    const detail = document.createElement("span");
    detail.className = "lovablesheet-nextgen__inspiration-detail";
    const scope = item.scope === "features" ? "features" : "full";
    if (scope === "features") {
      const detailsText = typeof item.details === "string" && item.details.trim() ? item.details.trim() : "Features";
      detail.textContent = detailsText === "Features" ? "Features" : `Features — ${detailsText}`;
    } else {
      detail.textContent = "Full model";
    }
    row.appendChild(detail);
    list.appendChild(row);
  });
  section.appendChild(list);
  parent.appendChild(section);
}

function formatNextGenTimestamp(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return "Saved";
  }
  try {
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch (error) {
    return date.toISOString();
  }
}

function renderNextGenSavedBriefs() {
  const { list, empty } = nextGenState.elements;
  if (!list || !empty) return;

  list.innerHTML = "";
  const briefs = Array.isArray(nextGenState.savedBriefs) ? nextGenState.savedBriefs : [];
  updateStepThreeAvailability();
  if (!briefs.length) {
    empty.hidden = false;
    list.hidden = true;
    return;
  }

  empty.hidden = true;
  list.hidden = false;

  const fragment = document.createDocumentFragment();
  briefs.forEach((brief) => {
    if (!brief) return;
    const entry = document.createElement("details");
    entry.className = "lovablesheet-nextgen__entry";

    const summary = document.createElement("summary");
    const nameSpan = document.createElement("span");
    nameSpan.textContent = brief.productName || "Untitled brief";
    summary.appendChild(nameSpan);
    const dateSpan = document.createElement("span");
    dateSpan.className = "lovablesheet-nextgen__summary-date";
    dateSpan.textContent = formatNextGenTimestamp(brief.createdAt);
    summary.appendChild(dateSpan);
    entry.appendChild(summary);

    const content = document.createElement("div");
    content.className = "lovablesheet-nextgen__entry-content";
    appendNextGenFeaturesSection(content, brief.features);
    appendNextGenTextSection(content, "Free text field", brief.description);
    appendNextGenTextSection(content, "Additional notes", brief.notes);
    appendNextGenInspirationSection(content, brief.inspiration);
    appendNextGenTextSection(content, "Fixed standard text", brief.standardText);

    const actions = document.createElement("div");
    actions.className = "lovablesheet-nextgen__actions";
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn ghost lovablesheet-nextgen__delete";
    deleteButton.dataset.nextgenDelete = brief.id;
    deleteButton.textContent = "Delete brief";
    actions.appendChild(deleteButton);
    content.appendChild(actions);

    entry.appendChild(content);
    fragment.appendChild(entry);
  });

  list.appendChild(fragment);
}

function handleNextGenDelete(briefId) {
  if (!briefId) return;
  const index = nextGenState.savedBriefs.findIndex((brief) => brief.id === briefId);
  if (index === -1) return;

  const [removed] = nextGenState.savedBriefs.splice(index, 1);
  try {
    persistNextGenBriefs(nextGenState.savedBriefs);
  } catch (error) {
    nextGenState.savedBriefs.splice(index, 0, removed);
    setNextGenStatus("We couldn't delete that brief. Please try again.", "error");
    return;
  }

  renderNextGenSavedBriefs();
  const productName = removed?.productName ? `“${removed.productName}”` : "that brief";
  setNextGenStatus(`Deleted ${productName} from your Next Gen briefs.`, "success");
}

function normalizeNextGenBrief(brief) {
  if (!brief || typeof brief !== "object") {
    return null;
  }

  const id = typeof brief.id === "string" && brief.id.trim()
    ? brief.id.trim()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const productName = typeof brief.productName === "string" && brief.productName.trim()
    ? brief.productName.trim()
    : "Untitled brief";
  const description = typeof brief.description === "string" ? brief.description.trim() : "";
  const notes = typeof brief.notes === "string" ? brief.notes.trim() : "";
  const standardText = typeof brief.standardText === "string" && brief.standardText.trim()
    ? brief.standardText
    : NEXTGEN_DEFAULT_STANDARD_TEXT;
  const createdAt = typeof brief.createdAt === "string" && brief.createdAt.trim()
    ? brief.createdAt.trim()
    : new Date().toISOString();

  const features = Array.isArray(brief.features)
    ? brief.features
        .map((feature) => {
          if (!feature) return null;
          if (typeof feature === "string") {
            const normalized = NEXTGEN_FEATURE_MAP.get(feature);
            if (normalized) {
              return { id: normalized.id, label: normalized.label };
            }
            return { id: feature, label: feature };
          }
          if (typeof feature === "object") {
            const rawId = typeof feature.id === "string" && feature.id ? feature.id : typeof feature.value === "string" ? feature.value : "";
            const normalized = NEXTGEN_FEATURE_MAP.get(rawId);
            const label = typeof feature.label === "string" && feature.label
              ? feature.label
              : normalized?.label || rawId;
            if (!label) return null;
            return {
              id: normalized?.id || rawId || label,
              label
            };
          }
          return null;
        })
        .filter((item) => item && item.label)
    : [];

  const inspiration = Array.isArray(brief.inspiration)
    ? brief.inspiration
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }
          const rawId = typeof item.id === "string" && item.id
            ? item.id
            : typeof item.value === "string"
              ? item.value
              : "";
          const name = typeof item.name === "string" && item.name
            ? item.name
            : typeof item.title === "string" && item.title
              ? item.title
              : nextGenState.productMap.get(rawId) || rawId;
          if (!rawId && !name) {
            return null;
          }
          const normalizedScope = (() => {
            const scopeValue = typeof item.scope === "string" ? item.scope.trim().toLowerCase() : "";
            if (scopeValue === "features") {
              return "features";
            }
            const typeValue = typeof item.type === "string" ? item.type.trim().toLowerCase() : "";
            if (typeValue === "features") {
              return "features";
            }
            return "full";
          })();
          const rawDetails = typeof item.details === "string"
            ? item.details
            : typeof item.featureDetails === "string"
              ? item.featureDetails
              : typeof item.focus === "string"
                ? item.focus
                : "";
          const details = normalizedScope === "features" ? rawDetails.trim() : "";
          return {
            id: rawId || name,
            name: name || rawId,
            draft: Boolean(item.draft),
            scope: normalizedScope,
            details
          };
        })
        .filter(Boolean)
    : [];

  return {
    id,
    productName,
    description,
    notes,
    standardText,
    createdAt,
    features,
    inspiration
  };
}

function handleNextGenFormSubmit(event) {
  event.preventDefault();

  const { nameInput, descriptionInput, notesInput, standardTextarea } = nextGenState.elements;
  const productName = nameInput?.value?.trim() ?? "";
  if (!productName) {
    setNextGenFormStatus("Name of product is required.", "error");
    nameInput?.focus?.();
    return;
  }

  const features = nextGenState.selectedFeatures.map((featureId) => {
    const feature = NEXTGEN_FEATURE_MAP.get(featureId) || { id: featureId, label: featureId };
    return { id: feature.id, label: feature.label };
  });

  const description = descriptionInput?.value?.trim() ?? "";
  const notes = notesInput?.value?.trim() ?? "";

  const inspiration = Array.isArray(nextGenState.selectedInspiration)
    ? nextGenState.selectedInspiration.map((item) => {
        if (!item) return null;
        const id = typeof item.id === "string" ? item.id : "";
        const name = typeof item.name === "string" && item.name ? item.name : nextGenState.productMap.get(id) || id;
        if (!id && !name) return null;
        const scope = item.scope === "features" ? "features" : "full";
        const details = scope === "features" && typeof item.details === "string" ? item.details.trim() : "";
        return {
          id: id || name,
          name,
          draft: Boolean(item.draft),
          scope,
          details
        };
      }).filter(Boolean)
    : [];

  const standardValue = standardTextarea?.value;
  const brief = normalizeNextGenBrief({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productName,
    description,
    notes,
    standardText:
      typeof standardValue === "string" && standardValue.trim()
        ? standardValue
        : nextGenState.standardText || NEXTGEN_DEFAULT_STANDARD_TEXT,
    features,
    inspiration,
    createdAt: new Date().toISOString()
  });

  if (!brief) {
    setNextGenFormStatus("We couldn't build this brief. Please try again.", "error");
    return;
  }

  nextGenState.savedBriefs = [brief, ...nextGenState.savedBriefs];
  try {
    persistNextGenBriefs(nextGenState.savedBriefs);
  } catch (error) {
    nextGenState.savedBriefs.shift();
    setNextGenFormStatus("We couldn't save your brief. Clear some storage and try again.", "error");
    return;
  }

  renderNextGenSavedBriefs();
  setNextGenStatus(`Saved “${brief.productName}” to your Next Gen briefs.`, "success");
  closeNextGenModal({ reset: true, focusTrigger: true });
}

function initNextGenEngineBriefs() {
  if (nextGenState.initialized) return;

  const section = document.querySelector("[data-nextgen-section]");
  if (!section) {
    nextGenState.initialized = true;
    return;
  }

  const elements = nextGenState.elements;
  elements.section = section;
  elements.openButtons = Array.from(section.querySelectorAll("[data-nextgen-open]"));
  elements.openButton = elements.openButtons[0] ?? null;
  elements.status = section.querySelector("[data-nextgen-status]") ?? null;
  elements.list = section.querySelector("[data-nextgen-list]") ?? null;
  elements.empty = section.querySelector("[data-nextgen-empty]") ?? null;
  elements.layer = document.querySelector("[data-nextgen-layer]") ?? null;
  elements.overlay = elements.layer?.querySelector("[data-nextgen-overlay]") ?? null;
  elements.modal = elements.layer?.querySelector("[data-nextgen-modal]") ?? null;
  elements.form = elements.modal?.querySelector("[data-nextgen-form]") ?? null;
  elements.nameInput = elements.form?.querySelector("[data-nextgen-name]") ?? null;
  elements.featureSelect = elements.form?.querySelector("[data-nextgen-feature-select]") ?? null;
  elements.featureList = elements.form?.querySelector("[data-nextgen-feature-list]") ?? null;
  elements.featureEmpty = elements.form?.querySelector("[data-nextgen-feature-empty]") ?? null;
  elements.descriptionInput = elements.form?.querySelector("[data-nextgen-description]") ?? null;
  elements.notesInput = elements.form?.querySelector("[data-nextgen-notes]") ?? null;
  elements.standardTextarea = elements.form?.querySelector("[data-nextgen-standard]") ?? null;
  elements.standardEditButton = elements.form?.querySelector("[data-nextgen-standard-edit]") ?? null;
  elements.standardSaveButton = elements.form?.querySelector("[data-nextgen-standard-save]") ?? null;
  elements.standardCancelButton = elements.form?.querySelector("[data-nextgen-standard-cancel]") ?? null;
  elements.standardStatus = elements.form?.querySelector("[data-nextgen-standard-status]") ?? null;
  elements.inspirationButton = elements.form?.querySelector("[data-nextgen-inspiration-open]") ?? null;
  elements.inspirationContainer = elements.form?.querySelector("[data-nextgen-inspiration-selected]") ?? null;
  elements.inspirationEmpty = elements.form?.querySelector("[data-nextgen-inspiration-empty]") ?? null;
  elements.inspirationList = elements.form?.querySelector("[data-nextgen-inspiration-list]") ?? null;
  elements.inspirationDialog = elements.form?.querySelector("[data-nextgen-products-dialog]") ?? null;
  elements.inspirationDialogOverlay = elements.inspirationDialog?.querySelector("[data-nextgen-products-overlay]") ?? null;
  elements.inspirationDialogClose = elements.inspirationDialog?.querySelector("[data-nextgen-products-close]") ?? null;
  elements.inspirationDialogApply = elements.inspirationDialog?.querySelector("[data-nextgen-products-apply]") ?? null;
  elements.inspirationDialogCancel = elements.inspirationDialog?.querySelector("[data-nextgen-products-cancel]") ?? null;
  elements.productsContainer = elements.inspirationDialog?.querySelector("[data-nextgen-products]") ?? null;
  elements.productsLoading = elements.inspirationDialog?.querySelector("[data-nextgen-products-loading]") ?? null;
  elements.productsError = elements.inspirationDialog?.querySelector("[data-nextgen-products-error]") ?? null;
  elements.formStatus = elements.form?.querySelector("[data-nextgen-form-status]") ?? null;
  elements.cancelButton = elements.form?.querySelector("[data-nextgen-cancel]") ?? null;
  elements.closeButton = elements.form?.querySelector("[data-nextgen-close]") ?? null;
  elements.summaryCard = section.querySelector("[data-nextgen-summary-card]") ?? null;
  elements.summaryStatus = section.querySelector("[data-nextgen-summary-status]") ?? null;
  elements.summaryState = section.querySelector("[data-nextgen-summary-state-text]") ?? null;
  elements.summaryDescription = section.querySelector("[data-nextgen-summary-description]") ?? null;
  elements.libraryButton = section.querySelector("[data-module-library-open]") ?? null;
  elements.libraryLayer = document.querySelector("[data-module-library-layer]") ?? null;
  elements.libraryOverlay = elements.libraryLayer?.querySelector("[data-module-library-overlay]") ?? null;
  elements.libraryDialog = elements.libraryLayer?.querySelector("[data-module-library-dialog]") ?? null;
  elements.libraryClose = elements.libraryLayer?.querySelector("[data-module-library-close]") ?? null;

  applyNextGenStandardText(nextGenState.standardText);
  setNextGenStandardEditing(false);
  setNextGenStandardStatus("");

  populateNextGenFeatureOptions();
  renderNextGenSelectedFeatures();
  renderNextGenSelectedInspiration();

  nextGenState.savedBriefs = getNextGenStoredBriefs();
  renderNextGenSavedBriefs();
  setNextGenStatus("");

  if (elements.openButtons.length) {
    elements.openButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setNextGenFormStatus("");
        openNextGenModal(button);
      });
    });
  }

  if (elements.overlay) {
    elements.overlay.addEventListener("click", () => {
      closeNextGenModal({ reset: true, focusTrigger: true });
    });
  }

  if (elements.closeButton) {
    elements.closeButton.addEventListener("click", () => {
      closeNextGenModal({ reset: true, focusTrigger: true });
    });
  }

  if (elements.cancelButton) {
    elements.cancelButton.addEventListener("click", () => {
      closeNextGenModal({ reset: true, focusTrigger: true });
    });
  }

  if (elements.summaryCard) {
    elements.summaryCard.addEventListener("click", (event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest("[data-nextgen-open]")) {
        return;
      }
      if (target?.closest("[data-module-library-open]")) {
        return;
      }
      if (!ideaStageState.selectedProduct.trim()) {
        return;
      }
      setNextGenFormStatus("");
      openNextGenModal(elements.openButton || elements.summaryCard);
    });
  }

  if (elements.libraryButton) {
    elements.libraryButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openModuleLibrary(elements.libraryButton);
    });
  }

  if (elements.libraryOverlay) {
    elements.libraryOverlay.addEventListener("click", () => {
      closeModuleLibrary({ focusTrigger: true });
    });
  }

  if (elements.libraryClose) {
    elements.libraryClose.addEventListener("click", () => {
      closeModuleLibrary({ focusTrigger: true });
    });
  }

  if (elements.featureSelect) {
    elements.featureSelect.addEventListener("change", (event) => {
      const value = event.target.value;
      if (!value) return;
      const added = addNextGenFeature(value);
      event.target.value = "";
      if (!added) {
        setNextGenFormStatus("That feature is already selected.", "error");
      } else {
        setNextGenFormStatus("");
      }
    });
  }

  if (elements.featureList) {
    elements.featureList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-nextgen-feature-remove]");
      if (!button) return;
      const featureId = button.dataset.nextgenFeatureRemove;
      if (!featureId) return;
      removeNextGenFeature(featureId);
    });
  }

  if (elements.form) {
    elements.form.addEventListener("submit", handleNextGenFormSubmit);
  }

  if (elements.standardEditButton) {
    elements.standardEditButton.addEventListener("click", handleNextGenStandardEdit);
  }
  if (elements.standardSaveButton) {
    elements.standardSaveButton.addEventListener("click", handleNextGenStandardSave);
  }
  if (elements.standardCancelButton) {
    elements.standardCancelButton.addEventListener("click", handleNextGenStandardCancel);
  }

  if (elements.inspirationButton) {
    elements.inspirationButton.addEventListener("click", () => {
      setNextGenFormStatus("");
      openNextGenInspirationDialog();
    });
  }

  if (elements.inspirationDialogOverlay) {
    elements.inspirationDialogOverlay.addEventListener("click", () => {
      closeNextGenInspirationDialog({ focusButton: true });
    });
  }

  if (elements.inspirationDialogClose) {
    elements.inspirationDialogClose.addEventListener("click", () => {
      closeNextGenInspirationDialog({ focusButton: true });
    });
  }

  if (elements.inspirationDialogCancel) {
    elements.inspirationDialogCancel.addEventListener("click", () => {
      closeNextGenInspirationDialog({ focusButton: true });
    });
  }

  if (elements.inspirationDialogApply) {
    elements.inspirationDialogApply.addEventListener("click", () => {
      applyNextGenInspirationSelection();
    });
  }

  if (elements.inspirationList) {
    elements.inspirationList.addEventListener("click", handleNextGenInspirationListClick);
    elements.inspirationList.addEventListener("change", handleNextGenInspirationListChange);
    elements.inspirationList.addEventListener("input", handleNextGenInspirationListInput);
  }

  if (elements.list) {
    elements.list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-nextgen-delete]");
      if (!button) return;
      const briefId = button.dataset.nextgenDelete;
      if (!briefId) return;
      handleNextGenDelete(briefId);
    });
  }

  fetchNextGenProducts();
  loadNextGenStandardFromSupabase();
  updateNextGenSummaryCard(ideaStageState.selectedProduct.trim().length > 0);

  nextGenState.initialized = true;
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
    this.workspaceSizeUpdateScheduled = false;

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
    this.scheduleWorkspaceSizeUpdate();
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

  scheduleWorkspaceSizeUpdate() {
    if (this.workspaceSizeUpdateScheduled) return;
    this.workspaceSizeUpdateScheduled = true;
    window.requestAnimationFrame(() => {
      this.workspaceSizeUpdateScheduled = false;
      this.updateWorkspaceSize();
    });
  }

  getWorkspacePadding() {
    if (!this.workspace) {
      return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    const styles = window.getComputedStyle(this.workspace);
    const parse = (value) => {
      const parsed = Number.parseFloat(value || "");
      return Number.isFinite(parsed) ? parsed : 0;
    };

    return {
      top: parse(styles.paddingTop),
      right: parse(styles.paddingRight),
      bottom: parse(styles.paddingBottom),
      left: parse(styles.paddingLeft)
    };
  }

  getWorkspaceDimensions() {
    if (!this.workspace) {
      return { width: 0, height: 0 };
    }

    const width = Math.max(this.workspace.scrollWidth, this.workspace.clientWidth);
    const height = Math.max(this.workspace.scrollHeight, this.workspace.clientHeight);
    return { width, height };
  }

  updateWorkspaceSize() {
    if (!this.workspace) return;

    const notes = Array.from(this.workspace.querySelectorAll("[data-note]"));
    if (!notes.length) {
      this.workspace.style.removeProperty("--brain-board-canvas-width");
      this.workspace.style.removeProperty("--brain-board-canvas-height");
      return;
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

      const right = x + (Number.isFinite(width) ? width : 0);
      const bottom = y + (Number.isFinite(height) ? height : 0);
      if (Number.isFinite(right)) {
        maxRight = Math.max(maxRight, right);
      }
      if (Number.isFinite(bottom)) {
        maxBottom = Math.max(maxBottom, bottom);
      }
    });

    const padding = this.getWorkspacePadding();
    const totalWidth = Math.max(0, maxRight + padding.left + padding.right);
    const totalHeight = Math.max(0, maxBottom + padding.top + padding.bottom);

    if (totalWidth > 0) {
      this.workspace.style.setProperty("--brain-board-canvas-width", `${totalWidth}px`);
    } else {
      this.workspace.style.removeProperty("--brain-board-canvas-width");
    }

    if (totalHeight > 0) {
      this.workspace.style.setProperty("--brain-board-canvas-height", `${totalHeight}px`);
    } else {
      this.workspace.style.removeProperty("--brain-board-canvas-height");
    }
  }

  setNotePosition(note, x, y) {
    note.dataset.x = String(x);
    note.dataset.y = String(y);
    note.style.setProperty("--note-x", `${x}px`);
    note.style.setProperty("--note-y", `${y}px`);
    this.applyNoteTransform(note, x, y);
    this.scheduleWorkspaceSizeUpdate();
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
    this.scheduleWorkspaceSizeUpdate();

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
      const maxWidth = Number.isFinite(this.noteMaxWidth) ? this.noteMaxWidth : Number.POSITIVE_INFINITY;
      const resolvedMax = Number.isFinite(maxWidth) ? Math.max(minWidth, maxWidth) : Number.POSITIVE_INFINITY;
      const clampedWidth = clamp(width, minWidth, resolvedMax);
      note.dataset.width = `${clampedWidth}`;
      note.style.setProperty("--note-width", `${clampedWidth}px`);
    } else {
      delete note.dataset.width;
      note.style.removeProperty("--note-width");
    }

    if (Number.isFinite(height) && height > 0) {
      const minHeight = this.noteMinHeight || NOTE_MIN_HEIGHT;
      const maxHeight = Number.isFinite(this.noteMaxHeight) ? this.noteMaxHeight : Number.POSITIVE_INFINITY;
      const resolvedMaxHeight = Number.isFinite(maxHeight) ? Math.max(minHeight, maxHeight) : Number.POSITIVE_INFINITY;
      const clampedHeight = clamp(height, minHeight, resolvedMaxHeight);
      note.dataset.height = `${clampedHeight}`;
      note.style.setProperty("--note-height", `${clampedHeight}px`);
    } else {
      delete note.dataset.height;
      note.style.removeProperty("--note-height");
    }

    this.scheduleWorkspaceSizeUpdate();
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

    const { width: boardWidth } = this.getWorkspaceDimensions();
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
        const { width: boardWidth } = this.getWorkspaceDimensions();
        const noteWidthUnits = note.offsetWidth;

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

          const targetX = Math.max(0, startX + deltaX);
          const targetY = Math.max(0, startY + deltaY);
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
              const neighborX = Math.max(0, entry.startX + deltaX + offsetAdjustmentX);
              const neighborY = Math.max(0, entry.startY + deltaY);
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
        note.dataset.resizing = "true";
        resizeHandle.setPointerCapture(pointerId);

        const onPointerMove = (moveEvent) => {
          const deltaX = (moveEvent.clientX - origin.x) / this.scale;
          const deltaY = (moveEvent.clientY - origin.y) / this.scale;

          const maxWidth = Number.isFinite(this.noteMaxWidth) ? this.noteMaxWidth : Number.POSITIVE_INFINITY;
          const maxHeight = Number.isFinite(this.noteMaxHeight) ? this.noteMaxHeight : Number.POSITIVE_INFINITY;

          const nextWidth = clamp(startWidth + deltaX, this.noteMinWidth, maxWidth);
          const nextHeight = clamp(startHeight + deltaY, this.noteMinHeight, maxHeight);

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

            this.scheduleColumnVisualUpdate();
            this.scheduleWorkspaceSizeUpdate();
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
      const { width: boardWidth } = this.getWorkspaceDimensions();

      let targetX = Math.max(0, (boardWidth - noteWidth) / this.scale);
      let targetY = 0;

      if (this.menu) {
        const workspaceRect = this.workspace.getBoundingClientRect();
        const menuRect = this.menu.getBoundingClientRect();
        const gap = 4;
        const relativeMenuLeft = (menuRect.left - workspaceRect.left) / this.scale;
        const relativeMenuTop = (menuRect.top - workspaceRect.top) / this.scale;
        const adjustedGap = gap / this.scale;

        targetX = Math.max(0, relativeMenuLeft - noteElement.offsetWidth - adjustedGap);
        targetY = Math.max(0, relativeMenuTop);
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
    this.scheduleWorkspaceSizeUpdate();
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

initializeIdeaStage();
initializeStepThree();
initializeThinkingTools();

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
