const DEFAULT_TABLE_SELECTOR = "[data-pipeline-table]";
const DEFAULT_TOGGLE_SELECTOR = "[data-pipeline-toggle]";
const DEFAULT_PREVIEW_COUNT = 3;

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function resolveToggleButton(pipelineTable, toggleSelector) {
  if (!pipelineTable || typeof document === "undefined") {
    return null;
  }

  if (pipelineTable.id) {
    const matchingToggle = document.querySelector(
      `[data-pipeline-toggle][aria-controls="${pipelineTable.id}"]`
    );
    if (matchingToggle instanceof HTMLElement) {
      return matchingToggle;
    }
  }

  if (typeof toggleSelector === "string" && toggleSelector.trim().length > 0) {
    const fallbackToggle = document.querySelector(toggleSelector);
    if (fallbackToggle instanceof HTMLElement) {
      return fallbackToggle;
    }
  }

  return null;
}

export function initCollapsiblePipelineTables(options = {}) {
  if (typeof document === "undefined") {
    return;
  }

  const {
    tableSelector = DEFAULT_TABLE_SELECTOR,
    toggleSelector = DEFAULT_TOGGLE_SELECTOR,
    previewCountFallback = DEFAULT_PREVIEW_COUNT
  } = options;

  const fallbackPreviewCount = parsePositiveInteger(
    previewCountFallback,
    DEFAULT_PREVIEW_COUNT
  );

  const tables = Array.from(document.querySelectorAll(tableSelector));
  if (tables.length === 0) {
    return;
  }

  tables.forEach((pipelineTable) => {
    if (!(pipelineTable instanceof HTMLElement)) {
      return;
    }

    if (pipelineTable.dataset.pipelineInitialized === "true") {
      return;
    }

    pipelineTable.dataset.pipelineInitialized = "true";

    const tableBody = pipelineTable.tBodies?.[0] || pipelineTable.querySelector("tbody");
    if (!tableBody) {
      return;
    }

    const parsedPreview = parsePositiveInteger(
      pipelineTable.dataset.previewCount || "",
      fallbackPreviewCount
    );

    const rows = Array.from(tableBody.rows || []);
    if (rows.length === 0) {
      return;
    }

    const previewCount = Math.min(parsedPreview, rows.length);
    const expandableRows = rows.slice(previewCount);

    const pipelineToggleButton = resolveToggleButton(pipelineTable, toggleSelector);
    const pipelineToggleLabel = pipelineToggleButton?.querySelector(
      "[data-pipeline-toggle-label]"
    );

    if (expandableRows.length === 0) {
      if (pipelineToggleButton) {
        pipelineToggleButton.hidden = true;
        pipelineToggleButton.setAttribute("aria-expanded", "true");
      }
      return;
    }

    const setPipelineCollapsed = (shouldCollapse) => {
      expandableRows.forEach((row) => {
        row.hidden = shouldCollapse;
      });

      const collapsedValue = shouldCollapse ? "true" : "false";
      pipelineTable.dataset.pipelineCollapsed = collapsedValue;
      pipelineTable.setAttribute("aria-expanded", shouldCollapse ? "false" : "true");

      if (pipelineToggleButton) {
        pipelineToggleButton.hidden = false;
        pipelineToggleButton.setAttribute("aria-expanded", shouldCollapse ? "false" : "true");
      }

      if (pipelineToggleLabel) {
        pipelineToggleLabel.textContent = shouldCollapse
          ? "Expand full pipeline"
          : "Collapse pipeline";
      }
    };

    pipelineTable.classList.add("admin-table--collapsible");
    pipelineTable.dataset.previewCount = String(previewCount);
    pipelineTable.setAttribute("tabindex", "0");

    setPipelineCollapsed(true);

    if (pipelineToggleButton) {
      pipelineToggleButton.addEventListener("click", () => {
        const isCollapsed = pipelineTable.dataset.pipelineCollapsed === "true";
        setPipelineCollapsed(!isCollapsed);
      });
      return;
    }

    const revealRows = () => {
      setPipelineCollapsed(false);
      pipelineTable.removeEventListener("click", handleClick);
      pipelineTable.removeEventListener("keydown", handleKeydown);
    };

    const handleClick = () => {
      if (pipelineTable.dataset.pipelineCollapsed !== "true") {
        return;
      }
      revealRows();
    };

    const handleKeydown = (event) => {
      if (pipelineTable.dataset.pipelineCollapsed !== "true") {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        revealRows();
      }
    };

    pipelineTable.addEventListener("click", handleClick);
    pipelineTable.addEventListener("keydown", handleKeydown);
  });
}
