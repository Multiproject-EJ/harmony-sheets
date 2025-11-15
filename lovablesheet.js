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

const NEXTGEN_FEATURE_LIBRARY_TABLE = "lovablesheet_feature_library";
const NEXTGEN_DESIGN_LIBRARY_TABLE = "lovablesheet_design_library";
const NEXTGEN_FEATURE_LIBRARY_DEFAULTS = [
  {
    id: "screen-size",
    label: "Screen size",
    description:
      "Document each viewport (1024×768 dialog, full browser canvas, and split view) plus the grid, margin, and zoom rules so Apps Script UI stays pixel perfect."
  },
  {
    id: "phone-ready",
    label: "Phone ready",
    description:
      "Explain how the experience collapses into sidebar/phone mode, including stacked layouts, tap targets, and any content that hides or swaps."
  },
  {
    id: "themes",
    label: "Themes",
    description:
      "List every color + typography token and the module behavior when a theme toggles so Codex can reuse the system across templates."
  },
  {
    id: "menu-x",
    label: "Menu X",
    description:
      "Describe the command palette/menu overlay interaction, keyboard shortcuts, and animation timings for opening, filtering, and dismissing."
  },
  {
    id: "database-in-sheet",
    label: "Database in sheet",
    description:
      "Outline the tab-level schema, primary keys, validation rules, and any Apps Script helpers that keep the Sheet-backed database in sync."
  },
  {
    id: "ai",
    label: "AI",
    description:
      "Include the model prompt format, sheet inputs, guardrails, and how AI responses are written back so the workflow is reproducible."
  },
  {
    id: "images-storing",
    label: "Images storing",
    description:
      "Note how media uploads are handled (Drive, Sheets cells, or CDN), file naming, quotas, and the formulas/scripts that reference each asset."
  }
];
const GREEN_WALLET_HABIT_THEME_SPEC = [
  "# Green Wallet Habit Theme Export",
  "",
  "## Theme Purpose & Mood",
  "- **Essence:** A calm but energized system for reinforcing conscious financial habits, sustainability, and long-term growth.",
  "- **Personality keywords:** grounded, luminous, trustworthy, botanical, data-aware, optimistic, nurturing.",
  "- **Emotional targets:** inspire daily discipline without anxiety, communicate eco-friendly wealth, keep interactions warm and human.",
  "",
  "## Color System",
  "| Role | Hex | Usage & Notes |",
  "| --- | --- | --- |",
  "| **Primary Canopy** | `#1D5C4D` | Signature evergreen tone; anchors navigation, hero blocks, and dominant controls across web, mobile, and desktop apps. |",
  "| **Primary Light** | `#3F8B72` | Secondary fills, gradients, hover states, supporting backgrounds for cards or HUDs. |",
  "| **Growth Accent** | `#8FE1A2` | Highlights upward trends, success states, progress bars, CTA outlines. Works for shader tints in games. |",
  "| **Sunlit Accent** | `#F2C94C` | Warm spark for notifications, achievement medals, key icons. Use sparingly (≤10% area). |",
  "| **Charcoal Soil** | `#1B1F23` | Text on light surfaces, cinematic overlays, nighttime dashboard backgrounds. |",
  "| **Mist White** | `#F6FBF8` | Default canvas, UI chrome, diegetic HUD panels, typography backgrounds. |",
  "| **Muted Clay** | `#C3B8A0` | Secondary text, dividers, muted buttons, props in 3D scenes. |",
  "",
  "### Gradients & Effects",
  "- **Morning Growth:** `#1D5C4D → #3F8B72 → #8FE1A2` (left-to-right or radial); use for hero sections, splash screens, level backgrounds.",
  "- **Lumen Glow:** apply soft light overlay `rgba(242, 201, 76, 0.25)` for callouts and particle effects.",
  "- **Shadow philosophy:** soft, long shadows to convey natural light (blur 24–40px, opacity 15%).",
  "",
  "## Typography & Voice",
  "- **Headline family:** \"Space Grotesk\" or \"Sora\"; geometric warmth, uppercasing optional for large hero statements.",
  "- **Body family:** \"Inter\" or \"IBM Plex Sans\"; accessible, modern, works in code editors, HUDs, and captions.",
  "- **Monospace:** \"JetBrains Mono\" for data readouts, CLI tools, or in-game terminals.",
  "- **Tone of copy:** supportive coach, first-person plural, positive reinforcement (\"Let’s revisit your goals\" vs. \"You failed\").",
  "",
  "## Iconography & Motifs",
  "- Soft-rounded rectangles, leaf-inspired chevrons, seeds/sprouts for progress.",
  "- Use thin-line icons with occasional filled nodes to show milestones.",
  "- Graph motifs: curved branches, stacking leaves representing budgets.",
  "",
  "## Interaction & Motion Principles",
  "- Motion should feel organic: ease-in-out, 300–600ms depending on platform.",
  "- Micro-interactions highlight progress (e.g., pulsing leaf when savings increase).",
  "- Sound palette (if applicable): soft wood clicks, subtle wind chimes, low-frequency confirmation chimes.",
  "",
  "## Layout Guidance (Web, Apps, Games)",
  "- **Web/App dashboards:** layered cards floating above Mist White with Primary Canopy headers. Use Growth Accent for progress bars and data pulses.",
  "- **Mobile:** maintain 8px baseline grid; accent colors reserved for CTA buttons and streak indicators.",
  "- **Game HUDs:** minimal frames, translucent Mist White panels, Growth Accent outlines for actionable elements.",
  "- **Environmental storytelling:** combine botanical textures with modern finance iconography (coins with leaf engravings, digital vines around data panels).",
  "",
  "## Components & Patterns",
  "- **Call-to-Action Buttons:** Primary Canopy fill, Mist White text, 12px radius. Hover/press lifts with Growth Accent border.",
  "- **Cards & Panels:** Mist White fill, Charcoal Soil text, optional top strip in Primary Light.",
  "- **Achievement Badges:** circular or pentagonal shapes, Sunlit Accent core, Growth Accent rings.",
  "- **Notifications:** slide-in leaves, color-coded states (success = Growth Accent, warning = Sunlit Accent, neutral = Muted Clay).",
  "",
  "## Cross-Media Adaptation Tips",
  "1. **Consistent materials:** translate colors into shader/material libraries (e.g., Unity URP, Unreal) by matching HEX to linear color.",
  "2. **Print packaging or merch:** favor recycled textures; use Primary Canopy as dominant ink, Growth Accent for foil stamping.",
  "3. **Voice UI / chatbots:** pair tonal guidelines with friendly, supportive responses.",
  "4. **3D assets:** matte greens with subtle specular highlights to avoid plastic feel.",
  "5. **Accessibility:** maintain 4.5:1 contrast for text; provide dyslexia-friendly font option (e.g., OpenDyslexic) without breaking hierarchy.",
  "",
  "## Sample Scene Descriptions",
  "- **Onboarding:** animated seed sprouting into a wallet icon, gradient background (Morning Growth), supportive copy.",
  "- **Progress Celebration:** confetti of micro-leaves drifting upward, Sunlit Accent sparkles.",
  "- **Deep Dive Analytics:** dark Charcoal Soil canvas with neon Growth Accent graphs, ambient glow.",
  "",
  "## Implementation Checklist",
  "- [ ] Import typography families (Space Grotesk, Inter) across platforms.",
  "- [ ] Define color tokens in design system (web variables, mobile asset catalog, game engine materials).",
  "- [ ] Document component states (idle, hover, pressed, disabled) using colors above.",
  "- [ ] Prepare icon set with botanical geometry.",
  "- [ ] Create motion presets (ease timings, keyframe guidelines).",
  "",
  "Use this document as the canonical reference when exporting the Green Wallet Habit Theme to new products, ensuring every experience feels cohesive, eco-minded, and habit-building."
].join("\n");

const NEXTGEN_DESIGN_LIBRARY_DEFAULTS = [
  {
    id: "light-color",
    label: "Light Color",
    description: "Airy gradients and bright neutrals with soft drop shadows for productivity dashboards.",
    cssNotes: "Use #f8fafc/#e2e8f0 surfaces, 28px radii, and 0 24px 40px rgba(15,23,42,.12) shadows."
  },
  {
    id: "dark-glass",
    label: "Dark Glass",
    description: "Frosted glass panels with neon accents floating on charcoal backgrounds.",
    cssNotes: "Layer rgba(15,23,42,.8) backgrounds, 1px rgba(148,163,184,.32) borders, and blur/backdrop-filter for panels."
  },
  {
    id: "blue-electro",
    label: "Blue Electro",
    description: "Electric blues with circuit-like dividers for high-tech dashboards.",
    cssNotes: "Primary gradient: linear-gradient(135deg,#38bdf8,#6366f1); add glowing outline with rgba(59,130,246,.4)."
  },
  {
    id: "natural-harmony",
    label: "Natural Harmony",
    description: "Organic greens and earth neutrals referencing wellness/planning kits.",
    cssNotes: "Pair #065f46 text with #ecfdf5 panels, rounded corners, and thin double borders for botanical vibes."
  },
  {
    id: "bright-flow",
    label: "Bright Flow",
    description: "Bold gradient ribbons that sweep across cards to show progression.",
    cssNotes: "Apply flowing gradient backgrounds with clip-path accents and oversized 48px blur glows."
  },
  {
    id: "bold-pink",
    label: "Bold Pink",
    description: "Statement fuchsias and corals for marketing launches and playful planners.",
    cssNotes: "Use #f472b6 + #fb7185 gradients, strong 1px #be185d borders, and pill buttons."
  },
  {
    id: "bold-color",
    label: "Bold Color",
    description: "Primary color blocking with crisp typography for storytelling dashboards.",
    cssNotes: "Mix #facc15, #2563eb, #f97316 in equal blocks with 12px gutters and sans-serif display fonts."
  },
  {
    id: "green-pocket",
    label: "Green Pocket",
    description: "Finance-friendly emerald palette paired with ledger-style grid lines.",
    cssNotes: "Combine #047857 headers, lined backgrounds, and subtle dollar iconography."
  },
  {
    id: "green-wallet-habit",
    label: "Green Wallet Habit Theme",
    description: "Eco-minded finance theme emphasizing habit-building systems and botanical cues.",
    cssNotes: GREEN_WALLET_HABIT_THEME_SPEC
  },
  {
    id: "solar-dawn",
    label: "Solar Dawn",
    description: "Golden hour gradient washes with soft serif typography for lifestyle products.",
    cssNotes: "Gradient from #fcd34d to #f472b6, 36px rounded corners, and serif headings with tracking .08em."
  },
  {
    id: "noir-terminal",
    label: "Noir Terminal",
    description: "Monospace, high-contrast panels inspired by developer terminals.",
    cssNotes: "Background #0f172a, lime green #a3e635 accents, IBM Plex Mono, and inset 1px #1e293b borders."
  }
];
const NEXTGEN_DESIGN_THEME_PREVIEWS = {
  "light-color": {
    style:
      "--theme-bg:linear-gradient(135deg,#f8fafc,#e2e8f0);--theme-border:rgba(148,163,184,.35);--theme-text:#0f172a;--theme-button-bg:#0f172a;--theme-shadow:0 24px 40px rgba(15,23,42,.12);",
    palette: ["#F8FAFC", "#E2E8F0", "#94A3B8"],
    fontSample: "Inter / Medium 18px",
    buttonLabel: "Primary action",
    notes: "Use #F8FAFC/#E2E8F0 surfaces, 28px radii, and airy drop shadows."
  },
  "dark-glass": {
    style:
      "--theme-bg:linear-gradient(120deg,rgba(15,23,42,.8),rgba(15,23,42,.92));--theme-border:rgba(148,163,184,.32);--theme-text:#e2e8f0;--theme-button-bg:linear-gradient(135deg,#475569,#0f172a);--theme-shadow:0 18px 40px rgba(2,6,23,.65);",
    palette: ["#0F172A", "rgba(15,23,42,.8)", "#94A3B8"],
    fontSample: "Space Grotesk / Bold 20px",
    buttonLabel: "Frosted CTA",
    notes: "Layer frosted glass panels, neon accents, and blur/backdrop filters for depth."
  },
  "blue-electro": {
    style:
      "--theme-bg:linear-gradient(135deg,#38bdf8,#6366f1);--theme-border:rgba(59,130,246,.45);--theme-text:#0f172a;--theme-button-bg:linear-gradient(135deg,#1d4ed8,#22d3ee);--theme-shadow:0 28px 60px rgba(15,23,42,.35);",
    palette: ["#38BDF8", "#6366F1", "#0EA5E9"],
    fontSample: "JetBrains Mono / SemiBold",
    fontClass: "design-theme-mini__font--mono",
    buttonLabel: "Glow button",
    notes: "Primary gradient: linear-gradient(135deg,#38BDF8,#6366F1) with glowing outlines."
  },
  "natural-harmony": {
    style:
      "--theme-bg:linear-gradient(120deg,#ecfdf5,#d1fae5);--theme-border:rgba(16,185,129,.4);--theme-text:#065f46;--theme-button-bg:#047857;--theme-shadow:0 18px 36px rgba(5,150,105,.25);",
    palette: ["#065F46", "#ECFDF5", "#F4F1DE"],
    fontSample: "Playfair Display / Semibold",
    fontClass: "design-theme-mini__font--serif",
    buttonLabel: "Botanical CTA",
    notes: "Pair deep greens with botanical double borders and organic gradients."
  },
  "bright-flow": {
    style:
      "--theme-bg:linear-gradient(160deg,#f0abfc,#38bdf8);--theme-border:rgba(14,165,233,.35);--theme-text:#0f172a;--theme-button-bg:linear-gradient(120deg,#f472b6,#22d3ee);--theme-shadow:0 20px 48px rgba(244,114,182,.35);",
    palette: ["#F472B6", "#FB7185", "#38BDF8"],
    fontSample: "Poppins / SemiBold",
    buttonLabel: "Gradient CTA",
    notes: "Apply flowing ribbon gradients and oversized blur glows to hero cards."
  },
  "bold-pink": {
    style:
      "--theme-bg:linear-gradient(160deg,#fce7f3,#ffe4e6);--theme-border:rgba(244,114,182,.4);--theme-text:#9d174d;--theme-button-bg:linear-gradient(120deg,#f472b6,#fb7185);--theme-shadow:0 18px 40px rgba(190,24,93,.25);",
    palette: ["#F472B6", "#FB7185", "#BE185D"],
    fontSample: "Montserrat / Bold Caps",
    buttonLabel: "Statement CTA",
    notes: "Use saturated gradients, pill buttons, and confident caps for launches."
  },
  "bold-color": {
    style:
      "--theme-bg:linear-gradient(140deg,#fde047,#f97316);--theme-border:rgba(249,115,22,.45);--theme-text:#0f172a;--theme-button-bg:#0f172a;--theme-shadow:0 22px 44px rgba(249,115,22,.25);",
    palette: ["#FACC15", "#2563EB", "#F97316"],
    fontSample: "Sohne / Bold 20px",
    buttonLabel: "Block CTA",
    notes: "Mix FACC15, 2563EB, and F97316 in equal blocks with crisp gutters."
  },
  "green-pocket": {
    style:
      "--theme-bg:linear-gradient(135deg,#bbf7d0,#ecfccb);--theme-border:rgba(34,197,94,.35);--theme-text:#065f46;--theme-button-bg:#047857;--theme-shadow:0 18px 36px rgba(16,185,129,.25);",
    palette: ["#047857", "#10B981", "#BBF7D0"],
    fontSample: "Inter / SemiBold",
    buttonLabel: "Ledger CTA",
    notes: "Combine emerald headers with ledger grid lines and subtle dollar iconography."
  },
  "green-wallet-habit": {
    style:
      "--theme-bg:linear-gradient(140deg,#1d5c4d,#3f8b72);--theme-border:rgba(63,139,114,.5);--theme-text:#f6fbf8;--theme-button-bg:#1d5c4d;--theme-shadow:0 20px 40px rgba(29,92,77,.35);",
    palette: ["#1D5C4D", "#3F8B72", "#8FE1A2"],
    fontSample: "Space Grotesk / Bold",
    buttonLabel: "Habit CTA",
    notes: "Use evergreen gradients, botanical motifs, and supportive coaching tone."
  },
  "solar-dawn": {
    style:
      "--theme-bg:linear-gradient(135deg,#fcd34d,#f472b6);--theme-border:rgba(251,191,36,.45);--theme-text:#7c2d12;--theme-button-bg:#f97316;--theme-shadow:0 18px 38px rgba(249,115,22,.35);",
    palette: ["#FCD34D", "#F472B6", "#F97316"],
    fontSample: "Playfair Display / Medium",
    fontClass: "design-theme-mini__font--serif",
    buttonLabel: "Sunrise CTA",
    notes: "Gradient from #FCD34D to #F472B6 with 36px radii and serif headings."
  },
  "noir-terminal": {
    style:
      "--theme-bg:linear-gradient(145deg,#0f172a,#1e293b);--theme-border:rgba(15,23,42,.7);--theme-text:#e2e8f0;--theme-button-bg:#0f172a;--theme-shadow:0 24px 44px rgba(15,23,42,.6);",
    palette: ["#0F172A", "#1E293B", "#A3E635"],
    fontSample: "IBM Plex Mono / Medium",
    fontClass: "design-theme-mini__font--mono",
    buttonLabel: "Terminal CTA",
    notes: "Background #0F172A, lime #A3E635 accents, and inset borders for terminal vibes."
  }
};
const NEXTGEN_DEFAULT_STANDARD_TEXT = [
  "Produce a google sheets product by completing the following:",
  "1) Make the product page JSON with the stats.",
  "2) Push it to Supabase.",
  "3) Fetch from Supabase.",
  "4) Produce the Google Sheet and HTML (1 file only) and add to a new folder in the ‘Google sheets products and demo’ directory in the repo.",
  "   Link the finished product (the HTML) to the interactive demo section on the product page."
].join("\n");
const PROMPT_CHAT_INTRO = "You are building a Google Sheets product with Harmony Sheets.";
const NEXTGEN_STORAGE_KEY = "lovablesheet.nextGenEngineBriefs";
const NEXTGEN_STANDARD_TABLE = "lovablesheet_nextgen_standard";
const NEXTGEN_STANDARD_ID = "default";
const PROMPT_SYSTEM_INTRO_ID = "prompt_system_intro";
const PROMPT_COMPANION_OVERRIDES_KEY = "lovablesheet.promptCompanionOverrides";
const DEMO_LAB_DEFAULT_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Harmony Sheets demo lab</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; }
    * { box-sizing: border-box; }
    body { margin: 0; background: radial-gradient(circle at top,#f8fafc,#e2e8f0); padding: 28px; }
    .demo-shell { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 32px; padding: clamp(24px,4vw,40px); box-shadow: 0 32px 80px rgba(15,23,42,.16); display: grid; gap: clamp(18px,4vw,28px); }
    .demo-header { display: grid; gap: 18px; }
    .eyebrow { text-transform: uppercase; letter-spacing: .24em; font-size: .72rem; color: #94a3b8; margin: 0 0 6px; }
    h1 { margin: 0; font-size: clamp(1.8rem,4vw,2.4rem); }
    p { margin: 0; line-height: 1.6; color: #475569; }
    .demo-search { display: grid; gap: 6px; font-weight: 600; color: #0f172a; }
    .demo-search input { border-radius: 999px; border: 1px solid rgba(148,163,184,.4); padding: 12px 18px; font-size: 1rem; font-family: inherit; background: rgba(248,250,252,.9); box-shadow: inset 0 1px 1px rgba(255,255,255,.8); }
    .demo-search input:focus { outline: 3px solid rgba(59,130,246,.25); outline-offset: 2px; }
    .demo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .demo-card { border: 1px solid rgba(148,163,184,.4); border-radius: 24px; padding: 18px; background: linear-gradient(145deg,rgba(248,250,252,.95),rgba(226,232,240,.9)); box-shadow: 0 14px 30px rgba(15,23,42,.08); display: grid; gap: 10px; text-align: left; cursor: pointer; transition: transform .2s ease, box-shadow .2s ease; }
    .demo-card:hover, .demo-card:focus-visible { transform: translateY(-3px); box-shadow: 0 24px 45px rgba(15,23,42,.18); outline: none; }
    .demo-card__tag { font-size: .8rem; font-weight: 600; color: #0f172a; background: rgba(15,23,42,.08); padding: 4px 10px; border-radius: 999px; width: fit-content; }
    .demo-card__tag--live { background: rgba(34,197,94,.18); color: #166534; }
    .demo-card__tag--draft { background: rgba(251,191,36,.2); color: #92400e; }
    .demo-card__title { font-size: 1.2rem; color: #0f172a; }
    .demo-card__meta { font-size: .95rem; color: #475569; }
    .demo-footer { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; border-top: 1px solid rgba(148,163,184,.25); padding-top: 18px; }
    .demo-sync { border: none; background: #0f172a; color: #fff; font-weight: 600; border-radius: 999px; padding: 10px 20px; cursor: pointer; box-shadow: 0 16px 40px rgba(15,23,42,.28); }
    .demo-sync:focus-visible { outline: 3px solid rgba(59,130,246,.35); outline-offset: 2px; }
    .demo-log { font-size: .95rem; font-weight: 600; color: #0f172a; }
    .demo-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.6); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; padding: clamp(16px,6vw,40px); }
    .demo-overlay[hidden] { display: none; }
    .demo-overlay__panel { background: #fff; width: min(640px, 96vw); border-radius: 36px; padding: clamp(24px,5vw,40px); box-shadow: 0 40px 110px rgba(15,23,42,.32); display: grid; gap: 16px; position: relative; }
    .demo-overlay__close { position: absolute; top: 18px; right: 18px; width: 44px; height: 44px; border-radius: 50%; border: 1px solid rgba(148,163,184,.4); background: rgba(248,250,252,.95); font-size: 1.6rem; cursor: pointer; }
    .demo-overlay__close:focus-visible { outline: 3px solid rgba(59,130,246,.35); outline-offset: 2px; }
    .demo-overlay__eyebrow { margin: 0; font-size: .8rem; letter-spacing: .22em; text-transform: uppercase; color: #94a3b8; }
    .demo-overlay__title { margin: 0; font-size: clamp(1.8rem,4vw,2.4rem); }
    .demo-overlay__tagline { margin: 0; color: #475569; }
    .demo-overlay__meta { display: flex; flex-wrap: wrap; gap: 12px; font-weight: 600; color: #0f172a; }
    .demo-overlay__checklist { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
    .demo-overlay__checklist li { padding: 10px 14px; border-radius: 18px; background: rgba(248,250,252,.9); border: 1px solid rgba(148,163,184,.35); font-size: .95rem; color: #0f172a; }
    .demo-overlay__action { border: none; background: #2563eb; color: #fff; font-weight: 600; padding: 12px 22px; border-radius: 999px; cursor: pointer; box-shadow: 0 18px 45px rgba(37,99,235,.35); justify-self: start; }
    .demo-overlay__action:focus-visible { outline: 3px solid rgba(59,130,246,.35); outline-offset: 2px; }
  </style>
</head>
<body>
  <main class="demo-shell">
    <header class="demo-header">
      <div>
        <p class="eyebrow">Prototype inventory</p>
        <h1>Apps Script window preview</h1>
        <p>Tap any tile to open a fullscreen dialog. The layout matches the HTML Service window that launches from Google Sheets, so every interaction feels production ready.</p>
      </div>
      <label class="demo-search">
        <span>Quick filter</span>
        <input type="search" placeholder="Search rituals, areas, or tags" data-demo-search>
      </label>
    </header>
    <section class="demo-grid">
      <button type="button" class="demo-card" data-demo-product="focus-kit" data-keywords="focus kit live energy rituals">
        <span class="demo-card__tag demo-card__tag--live">Live</span>
        <strong class="demo-card__title">Focus Kit HQ</strong>
        <span class="demo-card__meta">Energy + flow rituals</span>
      </button>
      <button type="button" class="demo-card" data-demo-product="weekender" data-keywords="weekend planner live adventure">
        <span class="demo-card__tag demo-card__tag--live">Live</span>
        <strong class="demo-card__title">Weekender Console</strong>
        <span class="demo-card__meta">Adventure + calendar sync</span>
      </button>
      <button type="button" class="demo-card" data-demo-product="rituals" data-keywords="draft rituals automation love">
        <span class="demo-card__tag demo-card__tag--draft">Draft</span>
        <strong class="demo-card__title">Connection Rituals Lab</strong>
        <span class="demo-card__meta">Draft • Love &amp; relationships</span>
      </button>
    </section>
    <footer class="demo-footer">
      <button type="button" class="demo-sync" data-demo-sync>Simulate sync</button>
      <p class="demo-log" data-demo-log>Waiting for a test run…</p>
    </footer>
  </main>
  <div class="demo-overlay" data-demo-overlay hidden>
    <article class="demo-overlay__panel" data-demo-panel tabindex="-1" aria-live="polite">
      <button class="demo-overlay__close" type="button" data-demo-close aria-label="Close preview">×</button>
      <p class="demo-overlay__eyebrow" data-demo-collection>Collection</p>
      <h2 class="demo-overlay__title" data-demo-title>Product</h2>
      <p class="demo-overlay__tagline" data-demo-tagline></p>
      <div class="demo-overlay__meta">
        <span class="demo-overlay__status" data-demo-status></span>
        <span class="demo-overlay__updated" data-demo-updated></span>
      </div>
      <ul class="demo-overlay__checklist" data-demo-checklist></ul>
      <button type="button" class="demo-overlay__action" data-demo-panel-sync>Run Sheet sync</button>
    </article>
  </div>
</body>
</html>`;
const DEMO_LAB_DEFAULT_SCRIPT = `(() => {
  const DEMO_PRODUCTS = {
    'focus-kit': {
      title: 'Focus Kit HQ',
      collection: 'Energy rituals • Live',
      tagline: 'Inventory dialog that keeps energy + flow rituals synced between teammates.',
      status: 'Live storefront',
      updated: 'Updated 2 minutes ago',
      checklist: [
        '✅ Personal ritual templates synced from the Sheet tabs.',
        '✅ Send-to-Slack automation wired to Apps Script.',
        '↻ Queue new rituals for review before publishing live.'
      ]
    },
    weekender: {
      title: 'Weekender Console',
      collection: 'Fun & travel • Live',
      tagline: 'Plot multi-day adventures and push the plan straight into Google Calendar.',
      status: 'Live storefront',
      updated: 'Updated 8 minutes ago',
      checklist: [
        '✅ Shared itinerary synced from the Trips tab.',
        '✅ Calendar push ready for review.',
        '↻ Trail weather and packing list refresh nightly.'
      ]
    },
    rituals: {
      title: 'Connection Rituals Lab',
      collection: 'Love & relationships • Draft',
      tagline: 'Draft automation that rotates intimacy prompts and gratitude check-ins.',
      status: 'Draft in studio',
      updated: 'Synced 1 hour ago',
      checklist: [
        '✅ Prompt library saved to the Sheet for copy/paste.',
        '↻ Automations staged for QA.',
        '☐ Voice + tone sample still needs approval.'
      ]
    }
  };

  const overlay = document.querySelector('[data-demo-overlay]');
  const panel = overlay?.querySelector('[data-demo-panel]');
  const collectionEl = panel?.querySelector('[data-demo-collection]');
  const titleEl = panel?.querySelector('[data-demo-title]');
  const taglineEl = panel?.querySelector('[data-demo-tagline]');
  const statusEl = panel?.querySelector('[data-demo-status]');
  const updatedEl = panel?.querySelector('[data-demo-updated]');
  const checklistEl = panel?.querySelector('[data-demo-checklist]');
  const panelSyncButton = panel?.querySelector('[data-demo-panel-sync]');
  const closeButton = panel?.querySelector('[data-demo-close]');
  const log = document.querySelector('[data-demo-log]');
  const syncButton = document.querySelector('[data-demo-sync]');
  const searchInput = document.querySelector('[data-demo-search]');

  function renderOverlay(product) {
    if (!panel || !product) return;
    if (collectionEl) collectionEl.textContent = product.collection;
    if (titleEl) titleEl.textContent = product.title;
    if (taglineEl) taglineEl.textContent = product.tagline;
    if (statusEl) statusEl.textContent = product.status;
    if (updatedEl) updatedEl.textContent = product.updated;
    if (checklistEl) {
      checklistEl.innerHTML = '';
      product.checklist.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        checklistEl.appendChild(li);
      });
    }
  }

  function openProduct(productId) {
    const product = DEMO_PRODUCTS[productId];
    if (!overlay || !product) return;
    overlay.hidden = false;
    overlay.dataset.activeProduct = productId;
    renderOverlay(product);
    window.requestAnimationFrame(() => {
      panel?.focus();
    });
  }

  function closeProduct() {
    if (!overlay) return;
    overlay.hidden = true;
    overlay.dataset.activeProduct = '';
  }

  document.querySelectorAll('[data-demo-product]').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-demo-product');
      if (id) {
        openProduct(id);
      }
    });
  });

  overlay?.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeProduct();
    }
  });
  closeButton?.addEventListener('click', closeProduct);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay && !overlay.hidden) {
      closeProduct();
    }
  });

  function handleSync() {
    const activeId = overlay?.dataset.activeProduct;
    const activeProduct = activeId ? DEMO_PRODUCTS[activeId] : null;
    const stamp = new Date().toLocaleTimeString();
    if (log) {
      log.textContent = activeProduct
        ? 'Synced ' + activeProduct.title + ' at ' + stamp + '.'
        : 'Synced inventory queue at ' + stamp + '.';
    }
    if (statusEl && activeProduct) {
      statusEl.textContent = activeProduct.status + ' • Synced just now';
    }
  }

  syncButton?.addEventListener('click', handleSync);
  panelSyncButton?.addEventListener('click', () => {
    handleSync();
    closeProduct();
  });

  searchInput?.addEventListener('input', (event) => {
    const value = event.target.value.trim().toLowerCase();
    document.querySelectorAll('[data-demo-product]').forEach((card) => {
      const keywords = card.dataset.keywords?.toLowerCase() ?? '';
      card.hidden = Boolean(value) && !keywords.includes(value);
    });
  });
})();`;
const DEMO_DOCS_TABLE = "lovablesheet_demo_lab_docs";
const DEMO_DOCS_ID = "ipad-lab";
const DEMO_DOCS_DEFAULT_TEXT = [
  "The iPad preview builder mirrors the 1024×768 dialog that Google Sheets renders when we launch HTML Service from Apps Script. Use it to mock every UI element before copying the files into a real spreadsheet.",
  "Guidelines:\n- Keep demos to one HTML file and one Apps Script (.gs) file so they can be pasted directly into the Google Sheets project.\n- Treat the spreadsheet tabs as the database layer. Use built-in Services (Sheets, Properties, UrlFetch) for any storage or API calls.\n- Avoid tooling that requires a build step. Vanilla HTML, CSS, and JavaScript ensure copy/paste parity with Google Workspace.",
  "When the concept is ready, drop the HTML + Apps Script bundle inside the matching folder in 'Google sheets products/' so the marketing site and Supabase listing can reference it."
].join("\n\n");

const nextGenState = {
  initialized: false,
  selectedFeatures: [],
  selectedDesigns: [],
  selectedInspiration: [],
  featureLibrary: [...NEXTGEN_FEATURE_LIBRARY_DEFAULTS],
  featureMap: new Map(NEXTGEN_FEATURE_LIBRARY_DEFAULTS.map((feature) => [feature.id, feature])),
  featureLibraryLoaded: false,
  featureLibraryLoading: false,
  designLibrary: [...NEXTGEN_DESIGN_LIBRARY_DEFAULTS],
  designMap: new Map(NEXTGEN_DESIGN_LIBRARY_DEFAULTS.map((design) => [design.id, design])),
  designLibraryLoaded: false,
  designLibraryLoading: false,
  standardText: NEXTGEN_DEFAULT_STANDARD_TEXT,
  standardEditing: false,
  standardSaving: false,
  standardLoaded: false,
  savedBriefs: [],
  products: [],
  productMap: new Map(),
  inspirationDialogOpen: false,
  inspirationKeydownHandler: null,
  libraryOpen: false,
  libraryTrigger: null,
  libraryKeydownHandler: null,
  featureDialogOpen: false,
  featureDialogSaving: false,
  featureDialogTrigger: null,
  featureDialogKeydownHandler: null,
  featureDialogSlugDirty: false,
  designDialogOpen: false,
  designDialogSaving: false,
  designDialogTrigger: null,
  designDialogKeydownHandler: null,
  designDialogSlugDirty: false,
  elements: {
    section: null,
    openButton: null,
    openButtons: [],
    status: null,
    list: null,
    empty: null,
    form: null,
    nameInput: null,
    featureMatrix: null,
    featureGrid: null,
    featureLoading: null,
    featureEmpty: null,
    featureAddButton: null,
    designAddButton: null,
    designMatrix: null,
    designGrid: null,
    designLoading: null,
    designEmpty: null,
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
    summaryCard: null,
    summaryStatus: null,
    summaryState: null,
    summaryDescription: null,
    libraryButton: null,
    libraryLayer: null,
    libraryOverlay: null,
    libraryDialog: null,
    libraryClose: null,
    featureDialog: null,
    featureDialogOverlay: null,
    featureDialogClose: null,
    featureDialogCancel: null,
    featureDialogForm: null,
    featureDialogStatus: null,
    featureDialogNameInput: null,
    featureDialogIdInput: null,
    featureDialogDescriptionInput: null,
    featureDialogSave: null,
    designDialog: null,
    designDialogOverlay: null,
    designDialogClose: null,
    designDialogCancel: null,
    designDialogForm: null,
    designDialogStatus: null,
    designDialogNameInput: null,
    designDialogIdInput: null,
    designDialogDescriptionInput: null,
    designDialogCssInput: null,
    designDialogSave: null
  }
};

const demoLabState = {
  initialized: false,
  docsLoaded: false,
  docsSaving: false,
  docsOpen: false,
  docsTrigger: null,
  docsKeydownHandler: null,
  docsContent: DEMO_DOCS_DEFAULT_TEXT,
  elements: {
    section: null,
    htmlInput: null,
    scriptInput: null,
    urlInput: null,
    runButton: null,
    resetButton: null,
    status: null,
    iframe: null,
    productSelect: null,
    docsButton: null,
    docsLayer: null,
    docsOverlay: null,
    docsModal: null,
    docsClose: null,
    docsCancel: null,
    docsSave: null,
    docsTextarea: null,
    docsStatus: null
  }
};

let brainBoardInitialized = false;
let flowchartBoardInitialized = false;
let brainBoard = null;
let flowchartBoard = null;
let boardSelectEl = null;
let boardTableBodies = [];
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

function setDemoLabStatus(message = "", tone = "") {
  const status = demoLabState.elements.status;
  if (!status) return;
  status.textContent = message;
  if (tone) {
    status.dataset.tone = tone;
  } else {
    delete status.dataset.tone;
  }
}

function setDemoDocsStatus(message = "", tone = "") {
  const status = demoLabState.elements.docsStatus;
  if (!status) return;
  status.textContent = message;
  if (tone) {
    status.dataset.tone = tone;
  } else {
    delete status.dataset.tone;
  }
}

function buildDemoLabMarkup(html, script) {
  const baseHtml = html && html.trim() ? html : DEMO_LAB_DEFAULT_HTML;
  const scriptContent = script && script.trim() ? script : "";
  if (!scriptContent) {
    return baseHtml;
  }

  if (/<\/(body|html)>/i.test(baseHtml)) {
    return baseHtml.replace(/<\/body>/i, `<script>\n${scriptContent}\n<\/script>\n</body>`);
  }

  return `${baseHtml}\n<script>\n${scriptContent}\n<\/script>`;
}

function handleDemoLabRun(event) {
  if (event) {
    event.preventDefault();
  }

  const { iframe, htmlInput, scriptInput, urlInput } = demoLabState.elements;
  if (!iframe) {
    return;
  }

  const externalUrl = urlInput?.value?.trim();
  if (externalUrl) {
    if (/^javascript:/i.test(externalUrl)) {
      setDemoLabStatus("Blocked unsupported URL scheme.", "error");
      return;
    }
    iframe.srcdoc = "";
    iframe.src = externalUrl;
    setDemoLabStatus(`Loading ${externalUrl} inside the iPad frame…`);
    return;
  }

  const htmlValue = htmlInput?.value ?? "";
  const scriptValue = scriptInput?.value ?? "";
  const markup = buildDemoLabMarkup(htmlValue, scriptValue);

  if (!markup.trim()) {
    setDemoLabStatus("Add HTML or point to a demo URL to render.", "error");
    return;
  }

  iframe.removeAttribute("src");
  iframe.srcdoc = markup;
  setDemoLabStatus("Rendering inline HTML + Apps Script inside the iPad frame.", "success");
}

function handleDemoLabReset() {
  const { htmlInput, scriptInput, urlInput } = demoLabState.elements;
  if (htmlInput) {
    htmlInput.value = DEMO_LAB_DEFAULT_HTML.trim();
  }
  if (scriptInput) {
    scriptInput.value = DEMO_LAB_DEFAULT_SCRIPT.trim();
  }
  if (urlInput) {
    urlInput.value = "";
  }
  if (demoLabState.elements.productSelect) {
    demoLabState.elements.productSelect.value = "";
  }
  setDemoLabStatus("Restored the sample bundle. Run the preview to see it in action.");
  handleDemoLabRun();
}

function handleDemoLabUrlInput() {
  const urlValue = demoLabState.elements.urlInput?.value?.trim();
  if (urlValue) {
    setDemoLabStatus("External demo URL detected. Click Run preview to load it inside the device frame.");
    return;
  }
  setDemoLabStatus("Inline HTML mode active. Click Run preview after editing the fields above.");
}

function normalizeDemoUrl(url) {
  if (typeof url !== "string") {
    return "";
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  try {
    return encodeURI(trimmed);
  } catch {
    return trimmed.replace(/\s/g, "%20");
  }
}

function updateDemoLabProductPicker(products = []) {
  const select = demoLabState.elements.productSelect;
  if (!select) {
    return;
  }

  const previousValue = select.value;
  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a product demo…";
  select.appendChild(placeholder);

  const live = [];
  const drafts = [];
  products.forEach((product) => {
    if (!product || !product.id) {
      return;
    }
    if (product.draft) {
      drafts.push(product);
    } else {
      live.push(product);
    }
  });

  const appendGroup = (label, list) => {
    if (!list.length) {
      return;
    }
    const group = document.createElement("optgroup");
    group.label = label;
    list.forEach((product) => {
      const option = document.createElement("option");
      option.value = product.id;
      const name = product.name || product.displayName || product.id;
      option.textContent = product.draft && !label.toLowerCase().includes("draft") ? `${name} (Draft)` : name;
      if (product.demoUrl) {
        option.dataset.demoUrl = product.demoUrl;
      } else {
        option.textContent = `${option.textContent} — Demo coming soon`;
      }
      group.appendChild(option);
    });
    select.appendChild(group);
  };

  appendGroup("Live products", live);
  appendGroup("Draft concepts", drafts);

  const restored = Array.from(select.options).some((option) => {
    if (previousValue && option.value === previousValue) {
      select.value = previousValue;
      return true;
    }
    return false;
  });
  if (!restored) {
    select.value = "";
  }
}

function handleDemoLabProductChange(event) {
  const select = event?.currentTarget;
  if (!select) {
    return;
  }
  const selectedOption = select.options[select.selectedIndex];
  const urlInput = demoLabState.elements.urlInput;

  if (!selectedOption || !selectedOption.value) {
    if (urlInput) {
      urlInput.value = "";
    }
    setDemoLabStatus("Inline HTML mode active. Click Run preview after editing the fields above.");
    handleDemoLabRun();
    return;
  }

  const demoUrl = selectedOption.dataset.demoUrl;
  if (!demoUrl) {
    setDemoLabStatus("That product doesn't have a linked demo yet.", "error");
    return;
  }

  if (urlInput) {
    urlInput.value = demoUrl;
  }
  handleDemoLabRun();
}

function applyDemoDocsText() {
  const textarea = demoLabState.elements.docsTextarea;
  if (!textarea) return;
  textarea.value = demoLabState.docsContent;
}

async function loadDemoDocsFromSupabase() {
  if (demoLabState.docsLoaded) {
    return;
  }
  if (!supabaseClient) {
    setDemoDocsStatus("Connect Supabase to load the shared description.", "error");
    return;
  }

  setDemoDocsStatus("Loading saved description…");

  try {
    const { data, error } = await supabaseClient
      .from(DEMO_DOCS_TABLE)
      .select("content")
      .eq("id", DEMO_DOCS_ID)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data?.content && data.content.trim()) {
      demoLabState.docsContent = data.content;
      applyDemoDocsText();
      setDemoDocsStatus("Loaded saved description.", "success");
      demoLabState.docsLoaded = true;
      return;
    }

    setDemoDocsStatus("No saved description yet. Add details and click save to publish them.");
    demoLabState.docsLoaded = true;
  } catch (err) {
    console.error("[lovablesheet] Unable to load demo lab description", err);
    setDemoDocsStatus("Unable to load the saved description. Showing the default copy.", "error");
  }
}

async function handleDemoDocsSave(event) {
  if (event) {
    event.preventDefault();
  }
  if (demoLabState.docsSaving) {
    return;
  }

  const textarea = demoLabState.elements.docsTextarea;
  if (!textarea) {
    return;
  }

  const value = textarea.value?.trim();
  if (!value) {
    setDemoDocsStatus("Description cannot be empty.", "error");
    textarea.focus();
    return;
  }

  if (!supabaseClient) {
    setDemoDocsStatus("Supabase connection required to save the description.", "error");
    return;
  }

  demoLabState.docsSaving = true;
  if (demoLabState.elements.docsSave) {
    demoLabState.elements.docsSave.disabled = true;
  }
  setDemoDocsStatus("Saving description…");

  try {
    const payload = { id: DEMO_DOCS_ID, content: value };
    const { data, error } = await supabaseClient
      .from(DEMO_DOCS_TABLE)
      .upsert(payload, { onConflict: "id" })
      .select("content")
      .single();

    if (error) {
      throw error;
    }

    if (data?.content) {
      demoLabState.docsContent = data.content;
    } else {
      demoLabState.docsContent = value;
    }

    demoLabState.docsLoaded = true;
    setDemoDocsStatus("Description saved to Supabase.", "success");
  } catch (err) {
    console.error("[lovablesheet] Unable to save demo lab description", err);
    setDemoDocsStatus("We couldn't save the description. Try again.", "error");
  } finally {
    demoLabState.docsSaving = false;
    if (demoLabState.elements.docsSave) {
      demoLabState.elements.docsSave.disabled = false;
    }
  }
}

function closeDemoDocsModal() {
  const { docsLayer, docsModal } = demoLabState.elements;
  if (!docsLayer || !docsModal) {
    return;
  }

  docsLayer.hidden = true;
  docsModal.hidden = true;
  demoLabState.docsOpen = false;
  document.body.classList.remove("lovablesheet-modal-open");
  setDemoDocsStatus("");
  if (demoLabState.docsTrigger) {
    demoLabState.docsTrigger.focus();
  }
  demoLabState.docsTrigger = null;
}

function handleDemoDocsCancel(event) {
  if (event) {
    event.preventDefault();
  }
  if (demoLabState.docsSaving) {
    return;
  }
  applyDemoDocsText();
  closeDemoDocsModal();
}

function openDemoDocsModal(trigger) {
  const { docsLayer, docsModal } = demoLabState.elements;
  if (!docsLayer || !docsModal) {
    return;
  }

  demoLabState.docsTrigger = trigger || null;
  demoLabState.docsOpen = true;
  docsLayer.hidden = false;
  docsModal.hidden = false;
  document.body.classList.add("lovablesheet-modal-open");
  applyDemoDocsText();
  setDemoDocsStatus("");
  loadDemoDocsFromSupabase();

  window.requestAnimationFrame(() => {
    docsModal.focus();
  });
}

function initializeDemoLab() {
  if (demoLabState.initialized) {
    return;
  }

  const section = document.querySelector("[data-demo-lab]");
  if (!section) {
    return;
  }

  demoLabState.initialized = true;
  const elements = demoLabState.elements;
  elements.section = section;
  elements.htmlInput = section.querySelector("[data-demo-html]") ?? null;
  elements.scriptInput = section.querySelector("[data-demo-script]") ?? null;
  elements.urlInput = section.querySelector("[data-demo-url]") ?? null;
  elements.runButton = section.querySelector("[data-demo-run]") ?? null;
  elements.resetButton = section.querySelector("[data-demo-reset]") ?? null;
  elements.status = section.querySelector("[data-demo-status]") ?? null;
  elements.iframe = section.querySelector("[data-demo-preview]") ?? null;
  elements.productSelect = section.querySelector("[data-demo-product-picker]") ?? null;
  elements.docsButton = section.querySelector("[data-demo-docs-open]") ?? null;
  elements.docsLayer = document.querySelector("[data-demo-docs-layer]") ?? null;
  elements.docsOverlay = elements.docsLayer?.querySelector("[data-demo-docs-overlay]") ?? null;
  elements.docsModal = elements.docsLayer?.querySelector("[data-demo-docs-modal]") ?? null;
  elements.docsClose = elements.docsLayer?.querySelector("[data-demo-docs-close]") ?? null;
  elements.docsCancel = elements.docsLayer?.querySelector("[data-demo-docs-cancel]") ?? null;
  elements.docsSave = elements.docsLayer?.querySelector("[data-demo-docs-save]") ?? null;
  elements.docsTextarea = elements.docsLayer?.querySelector("[data-demo-docs-text]") ?? null;
  elements.docsStatus = elements.docsLayer?.querySelector("[data-demo-docs-status]") ?? null;

  if (elements.htmlInput && !elements.htmlInput.value.trim()) {
    elements.htmlInput.value = DEMO_LAB_DEFAULT_HTML.trim();
  }
  if (elements.scriptInput && !elements.scriptInput.value.trim()) {
    elements.scriptInput.value = DEMO_LAB_DEFAULT_SCRIPT.trim();
  }
  applyDemoDocsText();
  setDemoLabStatus("Paste HTML + Apps Script or point to a demo URL to render the preview.");

  elements.runButton?.addEventListener("click", handleDemoLabRun);
  elements.resetButton?.addEventListener("click", handleDemoLabReset);
  elements.urlInput?.addEventListener("input", handleDemoLabUrlInput);
  elements.productSelect?.addEventListener("change", handleDemoLabProductChange);

  elements.docsButton?.addEventListener("click", () => openDemoDocsModal(elements.docsButton));
  elements.docsOverlay?.addEventListener("click", closeDemoDocsModal);
  elements.docsClose?.addEventListener("click", closeDemoDocsModal);
  elements.docsCancel?.addEventListener("click", handleDemoDocsCancel);
  elements.docsSave?.addEventListener("click", handleDemoDocsSave);

  if (!demoLabState.docsKeydownHandler) {
    demoLabState.docsKeydownHandler = (event) => {
      if (event.key === "Escape" && demoLabState.docsOpen) {
        event.preventDefault();
        closeDemoDocsModal();
      }
    };
    document.addEventListener("keydown", demoLabState.docsKeydownHandler);
  }

  window.requestAnimationFrame(() => {
    handleDemoLabRun();
  });
}
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
  manualInput: document.querySelector("[data-idea-manual-input]"),
  successIndicator: document.querySelector("[data-idea-success]"),
  successIcon: document.querySelector("[data-idea-success-icon]"),
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
  sendButton: document.querySelector("[data-step-three-send]"),
  copyButton: document.querySelector("[data-step-three-copy]")
};
const ideaStageState = {
  selectedProduct: "",
  selectionSource: "empty",
  initialized: false
};
const stepThreeState = {
  initialized: false,
  latestBriefId: "",
  latestPrompt: ""
};
const hasMatchMedia = typeof window !== "undefined" && typeof window.matchMedia === "function";
const promptChatLayoutQueries = {
  desktop: hasMatchMedia ? window.matchMedia("(min-width: 1024px)") : null,
  mobile: hasMatchMedia ? window.matchMedia("(max-width: 640px)") : null
};
const promptChatMessageTargets = {
  product: "[data-idea-stage]",
  prompt: "[data-step-three]"
};
const promptChatState = {
  initialized: false,
  isOpen: false,
  hasOpenedOnMobile: false,
  layoutListenersRegistered: false,
  layout: {
    isDesktop: false,
    isMobile: false
  },
  elements: {
    panel: document.querySelector("[data-prompt-chat-panel]"),
    messages: document.querySelector("[data-prompt-chat-messages]"),
    toggle: document.querySelector("[data-prompt-chat-toggle]"),
    closeButton: document.querySelector("[data-prompt-chat-close]")
  }
};
const promptCompanionEditorState = {
  initialized: false,
  dialogOpen: false,
  dialogType: "",
  dialogTrigger: null,
  saving: false,
  systemIntroLoaded: false,
  systemIntro: PROMPT_CHAT_INTRO,
  overrides: new Map(),
  elements: {
    layer: null,
    overlay: null,
    dialog: null,
    closeButton: null,
    cancelButton: null,
    saveButton: null,
    input: null,
    label: null,
    title: null,
    description: null,
    status: null,
    scopeRadios: [],
    productScopeLabel: null,
    scopeLegend: null
  },
  keydownHandler: null
};
const fixedInfoDialogState = {
  initialized: false,
  isOpen: false,
  dialogTrigger: null,
  keydownHandler: null,
  elements: {
    trigger: document.querySelector("[data-fixed-info-open]") ?? null,
    layer: null,
    overlay: null,
    dialog: null,
    closeButton: null,
    systemText: null,
    standardText: null,
    focusTarget: null,
    editButtons: []
  }
};
const quickActionElements = {
  container: document.querySelector("[data-quick-actions]"),
  toggle: document.querySelector("[data-quick-actions-toggle]"),
  menu: document.querySelector("[data-quick-actions-menu]")
};
const quickActionState = {
  initialized: false,
  isOpen: false,
  documentClickHandler: null
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

function getPromptCompanionProductKey(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getPromptCompanionOverride(productKey) {
  if (!productKey) return null;
  return promptCompanionEditorState.overrides.get(productKey) || null;
}

function persistPromptCompanionOverrides() {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  const payload = {};
  promptCompanionEditorState.overrides.forEach((value, key) => {
    if (!value) return;
    payload[key] = value;
  });
  const serialized = Object.keys(payload).length ? JSON.stringify(payload) : "";
  if (serialized) {
    window.localStorage.setItem(PROMPT_COMPANION_OVERRIDES_KEY, serialized);
  } else {
    window.localStorage.removeItem(PROMPT_COMPANION_OVERRIDES_KEY);
  }
}

function loadPromptCompanionOverridesFromStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    const raw = window.localStorage.getItem(PROMPT_COMPANION_OVERRIDES_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return;
    }
    Object.entries(parsed).forEach(([key, value]) => {
      if (!key || typeof value !== "object" || value === null) {
        return;
      }
      const normalizedKey = getPromptCompanionProductKey(key);
      if (!normalizedKey) {
        return;
      }
      const normalizedValue = {};
      if (typeof value.systemIntro === "string" && value.systemIntro.trim()) {
        normalizedValue.systemIntro = value.systemIntro.trim();
      }
      if (typeof value.standardText === "string" && value.standardText.trim()) {
        normalizedValue.standardText = value.standardText.trim();
      }
      if (Object.keys(normalizedValue).length) {
        promptCompanionEditorState.overrides.set(normalizedKey, normalizedValue);
      }
    });
  } catch (error) {
    console.warn("[lovablesheet] Unable to load prompt companion overrides", error);
  }
}

function updatePromptCompanionOverride(productKey, updates) {
  if (!productKey || !updates || typeof updates !== "object") {
    return;
  }
  const current = promptCompanionEditorState.overrides.get(productKey) || {};
  const next = { ...current };
  Object.entries(updates).forEach(([key, value]) => {
    if (typeof value === "string" && value.trim()) {
      next[key] = value.trim();
    } else {
      delete next[key];
    }
  });
  if (!next.systemIntro && !next.standardText) {
    promptCompanionEditorState.overrides.delete(productKey);
  } else {
    promptCompanionEditorState.overrides.set(productKey, next);
  }
  persistPromptCompanionOverrides();
}

function clearPromptCompanionOverrideField(productKey, field) {
  if (!productKey || !field) return;
  const current = promptCompanionEditorState.overrides.get(productKey);
  if (!current) return;
  if (field in current) {
    delete current[field];
  }
  if (!current.systemIntro && !current.standardText) {
    promptCompanionEditorState.overrides.delete(productKey);
  } else {
    promptCompanionEditorState.overrides.set(productKey, current);
  }
  persistPromptCompanionOverrides();
}

function getActiveSystemIntro() {
  const productKey = getPromptCompanionProductKey(ideaStageState.selectedProduct);
  const override = getPromptCompanionOverride(productKey);
  if (override?.systemIntro) {
    return override.systemIntro;
  }
  return promptCompanionEditorState.systemIntro || PROMPT_CHAT_INTRO;
}

function getActiveStandardText() {
  const productKey = getPromptCompanionProductKey(ideaStageState.selectedProduct);
  const override = getPromptCompanionOverride(productKey);
  if (override?.standardText) {
    return override.standardText;
  }
  return nextGenState.standardText || NEXTGEN_DEFAULT_STANDARD_TEXT;
}

function renderFixedInfoDialogContent() {
  const { systemText, standardText } = fixedInfoDialogState.elements;
  const systemIntro = getActiveSystemIntro();
  const standardCopy = getActiveStandardText();
  if (systemText) {
    systemText.textContent = systemIntro || "No system intro configured yet.";
  }
  if (standardText) {
    standardText.textContent = standardCopy || "No standard text configured yet.";
  }
}

function setFixedInfoTriggerState(isPressed) {
  const trigger = fixedInfoDialogState.elements.trigger;
  if (trigger) {
    trigger.setAttribute("aria-pressed", isPressed ? "true" : "false");
  }
}

function openFixedInfoDialog(trigger) {
  if (!fixedInfoDialogState.initialized) {
    initializeFixedInfoDialog();
  }
  if (fixedInfoDialogState.isOpen) {
    return;
  }

  const { layer, dialog, focusTarget } = fixedInfoDialogState.elements;
  if (!layer || !dialog) {
    return;
  }

  fixedInfoDialogState.isOpen = true;
  fixedInfoDialogState.dialogTrigger = trigger || fixedInfoDialogState.elements.trigger || null;
  renderFixedInfoDialogContent();

  layer.hidden = false;
  dialog.hidden = false;
  dialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("lovablesheet-modal-open");
  setFixedInfoTriggerState(true);

  window.requestAnimationFrame(() => {
    const target = focusTarget || dialog;
    try {
      target.focus();
    } catch (_error) {
      /* ignore */
    }
  });

  if (!fixedInfoDialogState.keydownHandler) {
    fixedInfoDialogState.keydownHandler = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFixedInfoDialog();
      }
    };
  }

  document.addEventListener("keydown", fixedInfoDialogState.keydownHandler);
}

function closeFixedInfoDialog(options = {}) {
  if (!fixedInfoDialogState.isOpen) {
    return;
  }

  const { layer, dialog } = fixedInfoDialogState.elements;

  if (layer) {
    layer.hidden = true;
  }
  if (dialog) {
    dialog.hidden = true;
    dialog.setAttribute("aria-hidden", "true");
  }

  fixedInfoDialogState.isOpen = false;
  setFixedInfoTriggerState(false);
  document.body.classList.remove("lovablesheet-modal-open");

  if (fixedInfoDialogState.keydownHandler) {
    document.removeEventListener("keydown", fixedInfoDialogState.keydownHandler);
    fixedInfoDialogState.keydownHandler = null;
  }

  const shouldFocusTrigger = options.focusTrigger !== false;
  if (shouldFocusTrigger) {
    const trigger = fixedInfoDialogState.dialogTrigger || fixedInfoDialogState.elements.trigger;
    if (trigger) {
      window.requestAnimationFrame(() => {
        try {
          trigger.focus();
        } catch (_error) {
          /* noop */
        }
      });
    }
  }

  fixedInfoDialogState.dialogTrigger = null;
}

function initializeFixedInfoDialog() {
  if (fixedInfoDialogState.initialized) {
    return;
  }

  const elements = fixedInfoDialogState.elements;
  elements.layer = document.querySelector("[data-fixed-info-layer]") ?? null;
  elements.overlay = elements.layer?.querySelector("[data-fixed-info-overlay]") ?? null;
  elements.dialog = elements.layer?.querySelector("[data-fixed-info-dialog]") ?? null;
  elements.closeButton = elements.layer?.querySelector("[data-fixed-info-close]") ?? null;
  elements.systemText = elements.layer?.querySelector("[data-fixed-info-system]") ?? null;
  elements.standardText = elements.layer?.querySelector("[data-fixed-info-standard]") ?? null;
  elements.focusTarget = elements.layer?.querySelector("[data-fixed-info-focus]") ?? null;
  elements.editButtons = Array.from(document.querySelectorAll("[data-fixed-info-edit]"));

  const { trigger, overlay, closeButton, editButtons } = elements;

  if (trigger) {
    trigger.addEventListener("click", () => {
      openFixedInfoDialog(trigger);
    });
  }

  if (overlay) {
    overlay.addEventListener("click", () => {
      closeFixedInfoDialog();
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      closeFixedInfoDialog();
    });
  }

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.fixedInfoEdit === "standard" ? "standard" : "system";
      closeFixedInfoDialog({ focusTrigger: false });
      openPromptCompanionDialog(type, button);
    });
  });

  fixedInfoDialogState.initialized = true;
  setFixedInfoTriggerState(false);
  renderFixedInfoDialogContent();
}

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

function scrollElementIntoView(element) {
  if (!element) {
    return;
  }

  const prefersReducedMotion = prefersReducedMotionQuery?.matches;
  const behavior = prefersReducedMotion ? "auto" : "smooth";

  try {
    element.scrollIntoView({ behavior, block: "start" });
  } catch (_error) {
    try {
      element.scrollIntoView(true);
    } catch (_innerError) {
      /* Swallow scroll issues silently. */
    }
  }
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

  const headingRow = document.createElement("tr");
  headingRow.className = "admin-table__group-row";
  const headingCell = document.createElement("td");
  headingCell.colSpan = 2;
  headingCell.textContent = "Draft models";
  headingRow.appendChild(headingCell);
  draftTableBody.appendChild(headingRow);

  drafts.forEach((product) => {
    const row = document.createElement("tr");
    row.className = "admin-table__draft-row";

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

    row.append(productCell, briefCell);
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

function updateStepTwoAvailability() {
  const { stepTwo, container, clearButton, lock, successIndicator, successIcon, connector, hint } = ideaStageElements;
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
    container.hidden = false;
    container.classList.toggle("lovablesheet-idea__selection--active", hasSelection);
    container.dataset.ideaSelected = hasSelection ? "true" : "false";
  }

  if (hint) {
    hint.hidden = false;
  }

  if (clearButton) {
    clearButton.hidden = !hasSelection;
    clearButton.disabled = !hasSelection;
  }

  if (successIndicator) {
    successIndicator.classList.toggle("lovablesheet-idea__success--active", hasSelection);
  }

  if (successIcon) {
    successIcon.textContent = hasSelection ? "✓" : "○";
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

  const quickButtons = document.querySelectorAll("[data-nextgen-quick-open]");
  quickButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    button.disabled = !hasSelection;
    if (hasSelection) {
      button.removeAttribute("aria-disabled");
    } else {
      button.setAttribute("aria-disabled", "true");
    }
  });
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
  renderPromptChatMessages();
  updateStepThreeOptionStates();
}

function stepThreeHasBriefs() {
  const briefs = Array.isArray(nextGenState.savedBriefs) ? nextGenState.savedBriefs : [];
  return briefs.length > 0;
}

function updateStepThreeOptionStates(hasBriefsOverride) {
  const { copyButton, sendButton } = stepThreeElements;
  const stageUnlocked = typeof hasBriefsOverride === "boolean" ? hasBriefsOverride : stepThreeHasBriefs();
  const hasPrompt = Boolean(stepThreeState.latestPrompt);
  const disableOptions = !stageUnlocked || !hasPrompt;

  if (copyButton) {
    copyButton.disabled = disableOptions;
  }

  if (sendButton) {
    sendButton.disabled = disableOptions;
    if (disableOptions) {
      sendButton.setAttribute("aria-disabled", "true");
    } else {
      sendButton.removeAttribute("aria-disabled");
    }
  }
}

function setPromptCompanionDialogStatus(message, tone = "") {
  const statusEl = promptCompanionEditorState.elements.status;
  if (!statusEl) return;
  statusEl.textContent = message || "";
  if (tone) {
    statusEl.dataset.tone = tone;
  } else {
    statusEl.removeAttribute("data-tone");
  }
}

function setPromptCompanionDialogSaving(isSaving) {
  promptCompanionEditorState.saving = Boolean(isSaving);
  const { saveButton, cancelButton, closeButton } = promptCompanionEditorState.elements;
  [saveButton, cancelButton, closeButton].forEach((button) => {
    if (button) {
      button.disabled = promptCompanionEditorState.saving;
    }
  });
}

function getPromptCompanionDialogScope() {
  const radios = promptCompanionEditorState.elements.scopeRadios || [];
  const checked = radios.find((input) => input.checked && !input.disabled);
  if (checked?.value === "global") {
    return "global";
  }
  return "product";
}

function openPromptCompanionDialog(type, trigger) {
  if (!type || (type !== "system" && type !== "standard")) {
    return;
  }
  if (promptCompanionEditorState.dialogOpen) {
    return;
  }

  if (!promptCompanionEditorState.initialized) {
    initializePromptCompanionEditor();
  }

  const elements = promptCompanionEditorState.elements;
  const { layer, dialog, input, label, title, description, productScopeLabel } = elements;
  if (!layer || !dialog || !input) {
    return;
  }

  promptCompanionEditorState.dialogOpen = true;
  promptCompanionEditorState.dialogType = type;
  promptCompanionEditorState.dialogTrigger = trigger || null;
  setPromptCompanionDialogStatus("");
  setPromptCompanionDialogSaving(false);

  layer.hidden = false;
  dialog.hidden = false;
  dialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("lovablesheet-modal-open");

  const productName = ideaStageState.selectedProduct.trim();
  const productKey = getPromptCompanionProductKey(productName);
  const override = getPromptCompanionOverride(productKey);
  const fieldName = type === "standard" ? "standardText" : "systemIntro";
  const overrideValue = override?.[fieldName];
  const fallbackValue = type === "standard" ? getActiveStandardText() : getActiveSystemIntro();
  const initialValue = overrideValue || fallbackValue || "";

  input.value = initialValue;
  if (label) {
    label.textContent = type === "standard" ? "Fixed standard text" : "System instructions";
  }
  if (title) {
    title.textContent = type === "standard" ? "Edit fixed standard text" : "Edit system instructions";
  }
  if (description) {
    description.textContent = type === "standard"
      ? "Update the instructions appended to every Codex prompt before it is generated."
      : "Change the top-level system instructions used when briefing Codex.";
  }

  const radios = elements.scopeRadios || [];
  const productRadio = radios.find((radio) => radio.dataset.promptEditorScope === "product");
  const globalRadio = radios.find((radio) => radio.dataset.promptEditorScope === "global");
  const hasProduct = Boolean(productKey);

  if (productRadio) {
    productRadio.disabled = !hasProduct;
    productRadio.checked = hasProduct;
  }
  if (globalRadio) {
    globalRadio.checked = !hasProduct;
  }
  if (!hasProduct && globalRadio) {
    globalRadio.checked = true;
  }
  if (productScopeLabel) {
    productScopeLabel.textContent = hasProduct ? `Only for “${productName}”` : "Select a product to enable";
  }

  if (!promptCompanionEditorState.keydownHandler) {
    promptCompanionEditorState.keydownHandler = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePromptCompanionDialog({ focusTrigger: true });
      }
    };
  }

  document.addEventListener("keydown", promptCompanionEditorState.keydownHandler);

  window.setTimeout(() => {
    try {
      input.focus();
      const length = input.value.length;
      input.setSelectionRange(length, length);
    } catch (_error) {
      /* ignore focus issues */
    }
  }, 0);
}

function closePromptCompanionDialog(options = {}) {
  const { focusTrigger = true } = options;
  if (!promptCompanionEditorState.dialogOpen || promptCompanionEditorState.saving) {
    return;
  }

  const elements = promptCompanionEditorState.elements;
  const { layer, dialog } = elements;
  if (dialog) {
    dialog.hidden = true;
    dialog.setAttribute("aria-hidden", "true");
  }
  if (layer) {
    layer.hidden = true;
  }
  document.body.classList.remove("lovablesheet-modal-open");

  if (promptCompanionEditorState.keydownHandler) {
    document.removeEventListener("keydown", promptCompanionEditorState.keydownHandler);
    promptCompanionEditorState.keydownHandler = null;
  }

  promptCompanionEditorState.dialogOpen = false;
  promptCompanionEditorState.dialogType = "";
  setPromptCompanionDialogStatus("");

  const trigger = promptCompanionEditorState.dialogTrigger;
  promptCompanionEditorState.dialogTrigger = null;
  if (focusTrigger && trigger && typeof trigger.focus === "function") {
    try {
      trigger.focus();
    } catch (_error) {
      /* ignore focus */
    }
  }
}

async function handlePromptCompanionDialogSave() {
  if (promptCompanionEditorState.saving) {
    return;
  }
  const type = promptCompanionEditorState.dialogType;
  if (!type) {
    return;
  }
  const elements = promptCompanionEditorState.elements;
  const { input } = elements;
  if (!input) {
    return;
  }

  const value = input.value?.trim() ?? "";
  if (!value) {
    setPromptCompanionDialogStatus("Instructions cannot be empty.", "error");
    input.focus();
    return;
  }

  const scope = getPromptCompanionDialogScope();
  const productName = ideaStageState.selectedProduct.trim();
  const productKey = getPromptCompanionProductKey(productName);
  const fieldName = type === "standard" ? "standardText" : "systemIntro";

  if (scope === "product") {
    if (!productKey) {
      setPromptCompanionDialogStatus("Select a product to save per-product instructions.", "error");
      return;
    }
    updatePromptCompanionOverride(productKey, { [fieldName]: value });
    renderPromptChatMessages();
    closePromptCompanionDialog({ focusTrigger: true });
    return;
  }

  if (!supabaseClient) {
    setPromptCompanionDialogStatus("Supabase connection required to save globally.", "error");
    return;
  }

  setPromptCompanionDialogSaving(true);
  setPromptCompanionDialogStatus("Saving to Supabase…");

  try {
    if (type === "standard") {
      const saved = await saveNextGenStandardToSupabase(value);
      applyNextGenStandardText(saved);
    } else {
      const saved = await savePromptSystemIntroToSupabase(value);
      applyPromptSystemIntro(saved);
    }
    if (productKey) {
      clearPromptCompanionOverrideField(productKey, fieldName);
    }
    closePromptCompanionDialog({ focusTrigger: true });
  } catch (error) {
    console.error("[lovablesheet] Unable to save prompt companion instructions", error);
    setPromptCompanionDialogStatus("We couldn't save those instructions. Try again.", "error");
  } finally {
    setPromptCompanionDialogSaving(false);
  }
}

function buildPromptChatMessages() {
  const messages = [];

  const selectedProduct = ideaStageState.selectedProduct?.trim();
  messages.push({
    id: "product",
    tone: "product",
    heading: "Product focus",
    text: selectedProduct ? selectedProduct : "Select a product in Step 1 to personalize this prompt.",
    targetSelector: promptChatMessageTargets.product,
    targetLabel: "Product selection stage"
  });

  const latestPrompt = (stepThreeState.latestPrompt || "").trim();
  if (latestPrompt) {
    const segments = latestPrompt.split(/\n{2,}/).map((segment) => segment.trim()).filter(Boolean);
    if (segments.length) {
      segments.forEach((segment, index) => {
        messages.push({
          id: `prompt-${index}`,
          tone: "prompt",
          heading: index === 0 ? "Codex prompt" : "Prompt detail",
          text: segment,
          targetSelector: promptChatMessageTargets.prompt,
          targetLabel: "Codex builder"
        });
      });
    } else {
      messages.push({
        id: "prompt-single",
        tone: "prompt",
        heading: "Codex prompt",
        text: latestPrompt,
        targetSelector: promptChatMessageTargets.prompt,
        targetLabel: "Codex builder"
      });
    }
  } else {
    messages.push({
      id: "prompt-empty",
      tone: "prompt",
      heading: "Codex prompt",
      text: "Generate a Codex prompt in Step 3 to preview it in chat form.",
      targetSelector: promptChatMessageTargets.prompt,
      targetLabel: "Codex builder"
    });
  }

  return messages;
}

function handlePromptChatMessageNavigation(targetSelector) {
  if (!targetSelector) return;

  const target = document.querySelector(targetSelector);
  if (!target) {
    return;
  }

  scrollElementIntoView(target);

  if (promptChatState.layout?.isMobile) {
    window.requestAnimationFrame(() => {
      setPromptChatOpen(false);
    });
  }
}

function applyPromptChatMessageTarget(element, message) {
  if (!element || !message) {
    return;
  }

  if (message.editable) {
    const heading = message.heading || "Prompt detail";
    const actionLabel = message.editable === "standard"
      ? "Edit fixed standard text"
      : "Edit system instructions";
    const activate = () => {
      openPromptCompanionDialog(message.editable, element);
    };
    element.classList.add("prompt-chat-panel__message--interactive");
    element.dataset.promptChatTarget = message.editable;
    element.setAttribute("role", "button");
    element.tabIndex = 0;
    element.setAttribute("aria-label", `${heading} — ${actionLabel}`);
    element.addEventListener("click", activate);
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
    return;
  }

  if (!message.targetSelector) {
    return;
  }

  const label = message.targetLabel || "Jump to LovableSheet stage";
  const heading = message.heading || "Prompt detail";
  const targetSelector = message.targetSelector;

  const activate = () => {
    handlePromptChatMessageNavigation(targetSelector);
  };

  element.classList.add("prompt-chat-panel__message--interactive");
  element.dataset.promptChatTarget = targetSelector;
  element.setAttribute("role", "button");
  element.tabIndex = 0;
  element.setAttribute("aria-label", `${heading} — ${label}`);
  element.addEventListener("click", activate);
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  });
}

function renderPromptChatMessages() {
  const container = promptChatState.elements.messages;
  if (!container) {
    return;
  }

  const messages = buildPromptChatMessages();
  container.innerHTML = "";

  messages.forEach((message) => {
    const item = document.createElement("article");
    item.className = "prompt-chat-panel__message";
    if (message.tone) {
      item.classList.add(`prompt-chat-panel__message--${message.tone}`);
    }

    const heading = document.createElement("p");
    heading.className = "prompt-chat-panel__message-heading";
    heading.textContent = message.heading || "Prompt detail";

    const text = document.createElement("p");
    text.className = "prompt-chat-panel__message-text";
    text.textContent = message.text || "";

    item.appendChild(heading);
    item.appendChild(text);

    applyPromptChatMessageTarget(item, message);

    container.appendChild(item);
  });

  renderFixedInfoDialogContent();
  container.scrollTop = container.scrollHeight;
}

function updatePromptChatControls() {
  const { toggle, closeButton } = promptChatState.elements;
  const isDesktop = Boolean(promptChatState.layout?.isDesktop);

  if (toggle) {
    toggle.hidden = false;
    toggle.removeAttribute("aria-hidden");
  }

  if (closeButton) {
    closeButton.hidden = isDesktop;
  }
}

function syncPromptChatVisibility() {
  updatePromptChatControls();

  if (promptChatState.layout?.isDesktop) {
    setPromptChatOpen(true, { force: true });
    return;
  }

  if (promptChatState.layout?.isMobile && !promptChatState.hasOpenedOnMobile) {
    setPromptChatOpen(true);
    promptChatState.hasOpenedOnMobile = true;
  }
}

function updatePromptChatLayoutState() {
  const body = document.body;
  const isDesktop = Boolean(promptChatLayoutQueries.desktop?.matches);
  const isMobile = Boolean(promptChatLayoutQueries.mobile?.matches);

  promptChatState.layout = { isDesktop, isMobile };

  if (body) {
    body.classList.toggle("lovablesheet-chat-desktop", isDesktop);
    body.classList.toggle("lovablesheet-chat-mobile", isMobile);
  }

  if (!isMobile) {
    promptChatState.hasOpenedOnMobile = false;
    setQuickActionsOpen(false);
  }

  syncPromptChatVisibility();
}

function registerPromptChatLayoutListeners() {
  if (promptChatState.layoutListenersRegistered) {
    return;
  }

  promptChatState.layoutListenersRegistered = true;

  const handleChange = () => {
    updatePromptChatLayoutState();
  };

  Object.values(promptChatLayoutQueries).forEach((query) => {
    if (!query) return;
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handleChange);
    } else if (typeof query.addListener === "function") {
      query.addListener(handleChange);
    }
  });

  if (typeof window !== "undefined") {
    window.addEventListener("resize", handleChange);
  }
}

function setQuickActionsOpen(isOpen) {
  if (!quickActionElements.container) {
    quickActionState.isOpen = false;
    return;
  }

  quickActionState.isOpen = Boolean(isOpen);
  const { menu, toggle } = quickActionElements;

  if (menu) {
    menu.hidden = !quickActionState.isOpen;
  }

  if (toggle) {
    toggle.setAttribute("aria-expanded", quickActionState.isOpen ? "true" : "false");
  }
}

function toggleQuickActionsMenu() {
  setQuickActionsOpen(!quickActionState.isOpen);
}

function handleQuickActionSelection(action) {
  switch (action) {
    case "start-new": {
      if (ideaStageElements.clearButton && !ideaStageElements.clearButton.hidden) {
        ideaStageElements.clearButton.click();
      }
      if (ideaStageElements.stage) {
        scrollElementIntoView(ideaStageElements.stage);
      }
      break;
    }
    case "go-step-three": {
      if (stepThreeElements.stage) {
        scrollElementIntoView(stepThreeElements.stage);
      }
      break;
    }
    case "focus-chat": {
      setPromptChatOpen(true);
      if (!promptChatState.layout?.isDesktop && promptChatState.elements.panel) {
        scrollElementIntoView(promptChatState.elements.panel);
      }
      break;
    }
    default:
      break;
  }

  setQuickActionsOpen(false);
}

function initializeQuickActionsMenu() {
  if (quickActionState.initialized) {
    return;
  }

  const { container, toggle } = quickActionElements;
  if (!container || !toggle) {
    return;
  }

  quickActionState.initialized = true;

  toggle.addEventListener("click", () => {
    toggleQuickActionsMenu();
  });

  container.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && quickActionState.isOpen) {
      event.preventDefault();
      setQuickActionsOpen(false);
    }
  });

  container.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-quick-action]");
    if (actionButton) {
      event.preventDefault();
      handleQuickActionSelection(actionButton.dataset.quickAction);
    }
  });

  quickActionState.documentClickHandler = (event) => {
    if (!quickActionElements.container?.contains(event.target)) {
      setQuickActionsOpen(false);
    }
  };

  document.addEventListener("click", quickActionState.documentClickHandler);
}

function setPromptChatOpen(isOpen, options = {}) {
  const shouldForceOpen = options.force || promptChatState.layout?.isDesktop;
  const nextOpen = shouldForceOpen ? true : Boolean(isOpen);
  promptChatState.isOpen = nextOpen;

  const { panel, toggle } = promptChatState.elements;

  if (panel) {
    if (promptChatState.isOpen) {
      panel.hidden = false;
      panel.setAttribute("aria-hidden", "false");
    } else {
      panel.hidden = true;
      panel.setAttribute("aria-hidden", "true");
    }
  }

  if (toggle) {
    toggle.setAttribute("aria-pressed", promptChatState.isOpen ? "true" : "false");
  }
}

function togglePromptChat() {
  setPromptChatOpen(!promptChatState.isOpen);
}

function initializePromptChat() {
  if (promptChatState.initialized) {
    return;
  }

  promptChatState.initialized = true;
  renderPromptChatMessages();

  const { toggle, closeButton, panel } = promptChatState.elements;

  if (panel) {
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      togglePromptChat();
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      setPromptChatOpen(false);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && promptChatState.isOpen) {
      setPromptChatOpen(false);
    }
  });

  registerPromptChatLayoutListeners();
  updatePromptChatLayoutState();

  if (!promptChatState.layout?.isDesktop && !promptChatState.layout?.isMobile) {
    setPromptChatOpen(false);
  }
}

function initializePromptCompanionEditor() {
  if (promptCompanionEditorState.initialized) {
    return;
  }

  promptCompanionEditorState.initialized = true;
  loadPromptCompanionOverridesFromStorage();

  const elements = promptCompanionEditorState.elements;
  elements.layer = document.querySelector("[data-prompt-editor-layer]") ?? null;
  if (!elements.layer) {
    return;
  }
  elements.overlay = elements.layer.querySelector("[data-prompt-editor-overlay]") ?? null;
  elements.dialog = elements.layer.querySelector("[data-prompt-editor-dialog]") ?? null;
  elements.closeButton = elements.layer.querySelector("[data-prompt-editor-close]") ?? null;
  elements.cancelButton = elements.layer.querySelector("[data-prompt-editor-cancel]") ?? null;
  elements.saveButton = elements.layer.querySelector("[data-prompt-editor-save]") ?? null;
  elements.input = elements.layer.querySelector("[data-prompt-editor-input]") ?? null;
  elements.label = elements.layer.querySelector("[data-prompt-editor-label]") ?? null;
  elements.title = elements.layer.querySelector("[data-prompt-editor-title]") ?? null;
  elements.description = elements.layer.querySelector("[data-prompt-editor-description]") ?? null;
  elements.status = elements.layer.querySelector("[data-prompt-editor-status]") ?? null;
  elements.productScopeLabel = elements.layer.querySelector("[data-prompt-editor-product]") ?? null;
  elements.scopeRadios = Array.from(elements.layer.querySelectorAll("[data-prompt-editor-scope]"));

  if (elements.overlay) {
    elements.overlay.addEventListener("click", () => {
      closePromptCompanionDialog({ focusTrigger: false });
    });
  }
  if (elements.closeButton) {
    elements.closeButton.addEventListener("click", () => {
      closePromptCompanionDialog({ focusTrigger: true });
    });
  }
  if (elements.cancelButton) {
    elements.cancelButton.addEventListener("click", () => {
      closePromptCompanionDialog({ focusTrigger: true });
    });
  }
  if (elements.saveButton) {
    elements.saveButton.addEventListener("click", () => {
      handlePromptCompanionDialogSave();
    });
  }

  if (elements.dialog) {
    elements.dialog.hidden = true;
    elements.dialog.setAttribute("aria-hidden", "true");
  }
  elements.layer.hidden = true;
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
    ? brief.features
        .map((feature) => {
          if (!feature) return "";
          const label = feature.label || feature.id || "Feature";
          const detail = typeof feature.description === "string" && feature.description.trim()
            ? feature.description.trim()
            : "";
          return detail ? `- ${label}: ${detail}` : `- ${label}`;
        })
        .filter(Boolean)
        .join("\n")
    : "- No feature highlights captured.";

  const designs = Array.isArray(brief.designs) && brief.designs.length
    ? brief.designs
        .map((design) => {
          if (!design) return "";
          const label = design.label || design.id || "Design";
          const description = typeof design.description === "string" && design.description.trim()
            ? design.description.trim()
            : "";
          const cssNotes = typeof design.cssNotes === "string" && design.cssNotes.trim() ? design.cssNotes.trim() : "";
          const detailParts = [];
          if (description) detailParts.push(description);
          if (cssNotes) detailParts.push(`CSS: ${cssNotes}`);
          return detailParts.length ? `- ${label} — ${detailParts.join(" | ")}` : `- ${label}`;
        })
        .filter(Boolean)
        .join("\n")
    : "- No design references selected.";

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
    "Design references:",
    designs,
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
  const { stage, lock, generateButton } = stepThreeElements;
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

  updateStepThreeOptionStates(hasBriefs);

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

async function copyTextToClipboard(text) {
  if (typeof text !== "string" || !text) {
    return false;
  }

  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn("[lovablesheet] Clipboard API copy failed", error);
    }
  }

  if (typeof document === "undefined") {
    return false;
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (error) {
    console.warn("[lovablesheet] execCommand copy failed", error);
    return false;
  }
}

async function handleStepThreeCopy() {
  if (!stepThreeState.latestPrompt) {
    setStepThreeStatus("Generate a Codex prompt before copying it to your clipboard.", "error");
    return;
  }

  const copied = await copyTextToClipboard(stepThreeState.latestPrompt);
  if (copied) {
    setStepThreeStatus("Codex prompt copied to your clipboard.", "success");
  } else {
    setStepThreeStatus("We couldn't copy the prompt. Select the text manually as a fallback.", "error");
  }
}

function initializeStepThree() {
  if (stepThreeState.initialized) {
    return;
  }

  stepThreeState.initialized = true;
  setStepThreeOutput("");
  setStepThreeStatus("");
  updateStepThreeAvailability();

  const { generateButton, sendButton, copyButton } = stepThreeElements;

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

  if (copyButton) {
    copyButton.addEventListener("click", () => {
      handleStepThreeCopy();
    });
  }
}

function syncSelectedProductInputs(value, options = {}) {
  const { skipManual = false, skipNextGen = false } = options;
  const normalized = typeof value === "string" ? value : "";

  if (!skipManual && ideaStageElements.manualInput) {
    if (ideaStageElements.manualInput.value !== normalized) {
      ideaStageElements.manualInput.value = normalized;
    }
  }

  if (!skipNextGen && nextGenState.elements?.nameInput) {
    const { nameInput } = nextGenState.elements;
    if (nameInput && nameInput.value !== normalized) {
      nameInput.value = normalized;
    }
  }
}

function setIdeaStageSelection(productName, options = {}) {
  const previousProduct = ideaStageState.selectedProduct;
  const previousSource = ideaStageState.selectionSource;
  const nextValue = typeof productName === "string" ? productName.trim() : "";
  const origin = typeof options.origin === "string" ? options.origin : "";

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

  syncSelectedProductInputs(nextValue, {
    skipManual: origin === "manual",
    skipNextGen: origin === "nextgen"
  });

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
  renderPromptChatMessages();
}

function initializeIdeaStage() {
  if (ideaStageState.initialized) {
    return;
  }

  ideaStageState.initialized = true;
  setIdeaStageSelection("", { source: "reset" });

  const { clearButton, draftTable, draftEmpty, manualInput } = ideaStageElements;
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

  if (manualInput) {
    manualInput.addEventListener("input", () => {
      setIdeaStageSelection(manualInput.value || "", { origin: "manual" });
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

function requireAdmin(user, { redirect = true } = {}) {
  if (!user) {
    const redirectUrl = `login.html?redirect=${encodeURIComponent(PAGE_PATH)}`;
    handleUnauthorized(
      "You need to sign in with an admin account to view LovableSheet.",
      redirect ? redirectUrl : undefined
    );
    return false;
  }

  if (!isAdminUser(user)) {
    handleUnauthorized(
      "LovableSheet is only available to Harmony Sheets admins.",
      redirect ? ACCOUNT_PAGE_PATH : undefined
    );
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

function applyPromptSystemIntro(value) {
  const normalized = typeof value === "string" && value.trim() ? value.trim() : PROMPT_CHAT_INTRO;
  promptCompanionEditorState.systemIntro = normalized;
  renderPromptChatMessages();
  renderFixedInfoDialogContent();
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
  renderPromptChatMessages();
  renderFixedInfoDialogContent();
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

async function savePromptSystemIntroToSupabase(content) {
  if (!supabaseClient) {
    throw new Error("Supabase client is not available.");
  }

  const payload = { id: PROMPT_SYSTEM_INTRO_ID, content };
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

async function loadPromptSystemIntroFromSupabase() {
  if (promptCompanionEditorState.systemIntroLoaded) return;
  if (!supabaseClient) return;

  promptCompanionEditorState.systemIntroLoaded = true;

  try {
    const { data, error } = await supabaseClient
      .from(NEXTGEN_STANDARD_TABLE)
      .select("content")
      .eq("id", PROMPT_SYSTEM_INTRO_ID)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data && typeof data.content === "string" && data.content.trim()) {
      applyPromptSystemIntro(data.content);
      return;
    }
  } catch (error) {
    console.error("[lovablesheet] Unable to load prompt system intro", error);
  }
}

function normalizeFeatureLibraryItem(item) {
  if (!item || typeof item !== "object") return null;
  const rawId = typeof item.id === "string" && item.id.trim()
    ? item.id.trim()
    : typeof item.slug === "string" && item.slug.trim()
      ? item.slug.trim()
      : typeof item.label === "string" && item.label.trim()
        ? item.label.trim()
        : "";
  const sanitized = rawId ? sanitizeNextGenId(rawId, rawId).toLowerCase() : "";
  if (!sanitized) return null;
  const label = typeof item.label === "string" && item.label.trim() ? item.label.trim() : sanitized;
  const description = typeof item.description === "string" && item.description.trim() ? item.description.trim() : "";
  return { id: sanitized, label, description };
}

function normalizeDesignLibraryItem(item) {
  if (!item || typeof item !== "object") return null;
  const rawId = typeof item.id === "string" && item.id.trim()
    ? item.id.trim()
    : typeof item.slug === "string" && item.slug.trim()
      ? item.slug.trim()
      : typeof item.label === "string" && item.label.trim()
        ? item.label.trim()
        : "";
  const id = rawId ? sanitizeNextGenId(rawId, rawId).toLowerCase() : "";
  if (!id) return null;
  const label = typeof item.label === "string" && item.label.trim() ? item.label.trim() : id;
  const description = typeof item.description === "string" && item.description.trim() ? item.description.trim() : "";
  const cssNotes = typeof item.cssNotes === "string" && item.cssNotes.trim()
    ? item.cssNotes.trim()
    : typeof item.css_notes === "string" && item.css_notes.trim()
      ? item.css_notes.trim()
      : typeof item.css === "string" && item.css.trim()
        ? item.css.trim()
        : typeof item.styles === "string" && item.styles.trim()
          ? item.styles.trim()
          : "";
  return { id, label, description, cssNotes };
}

function sortLibraryByLabel(list) {
  return [...list].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

function setFeatureLibrary(items) {
  const normalized = Array.isArray(items) ? items.map((item) => normalizeFeatureLibraryItem(item)).filter(Boolean) : [];
  const library = normalized.length ? sortLibraryByLabel(normalized) : [...NEXTGEN_FEATURE_LIBRARY_DEFAULTS];
  nextGenState.featureLibrary = library;
  nextGenState.featureMap = new Map(library.map((feature) => [feature.id, feature]));
  pruneNextGenFeatureSelection();
}

function setDesignLibrary(items) {
  const normalized = Array.isArray(items) ? items.map((item) => normalizeDesignLibraryItem(item)).filter(Boolean) : [];
  const library = normalized.length ? sortLibraryByLabel(normalized) : [...NEXTGEN_DESIGN_LIBRARY_DEFAULTS];
  nextGenState.designLibrary = library;
  nextGenState.designMap = new Map(library.map((design) => [design.id, design]));
  pruneNextGenDesignSelection();
}

function pruneNextGenFeatureSelection() {
  const valid = nextGenState.selectedFeatures.filter((id) => nextGenState.featureMap.has(id));
  if (valid.length !== nextGenState.selectedFeatures.length) {
    nextGenState.selectedFeatures = valid;
    syncNextGenFeatureCheckboxes();
  }
  updateNextGenFeatureSummary();
}

function pruneNextGenDesignSelection() {
  const valid = nextGenState.selectedDesigns.filter((id) => nextGenState.designMap.has(id));
  if (valid.length !== nextGenState.selectedDesigns.length) {
    nextGenState.selectedDesigns = valid;
    syncNextGenDesignCheckboxes();
  }
  updateNextGenDesignSummary();
}

function renderNextGenFeatureLibrary() {
  const grid = nextGenState.elements.featureGrid;
  const loading = nextGenState.elements.featureLoading;
  if (!grid) return;

  grid.innerHTML = "";
  const features = nextGenState.featureLibrary;
  if (!features.length) {
    grid.hidden = true;
    if (loading) {
      loading.hidden = false;
      loading.textContent = "No stored features yet.";
    }
    updateNextGenFeatureSummary();
    return;
  }

  if (loading) {
    loading.hidden = true;
  }

  const fragment = document.createDocumentFragment();
  features.forEach((feature, index) => {
    if (!feature) return;
    const optionId = `nextgen-feature-${sanitizeNextGenId(feature.id, String(index))}`;
    const card = document.createElement("label");
    card.className = "nextgen-form__feature-card";
    card.setAttribute("for", optionId);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = optionId;
    checkbox.value = feature.id;
    checkbox.dataset.nextgenFeatureCheckbox = "true";
    checkbox.checked = nextGenState.selectedFeatures.includes(feature.id);
    card.appendChild(checkbox);

    const title = document.createElement("span");
    title.className = "nextgen-form__feature-card-title";
    title.textContent = feature.label;
    card.appendChild(title);

    if (feature.description) {
      const description = document.createElement("p");
      description.className = "nextgen-form__feature-card-description";
      description.textContent = feature.description;
      card.appendChild(description);
    }

    fragment.appendChild(card);
  });

  grid.hidden = false;
  grid.appendChild(fragment);
  syncNextGenFeatureCheckboxes();
  updateNextGenFeatureSummary();
}

function buildDesignThemePreview(design) {
  if (!design) return null;
  const previewData = NEXTGEN_DESIGN_THEME_PREVIEWS[design.id];
  if (!previewData) {
    return null;
  }

  const preview = document.createElement("div");
  preview.className = "design-theme-mini";
  preview.dataset.designTheme = design.id;
  if (previewData.style) {
    preview.style.cssText = previewData.style;
  }

  if (Array.isArray(previewData.palette) && previewData.palette.length) {
    const swatches = document.createElement("div");
    swatches.className = "design-theme-mini__swatches";
    previewData.palette.forEach((color) => {
      const swatch = document.createElement("span");
      swatch.className = "design-theme-mini__swatch";
      swatch.style.setProperty("--swatch-color", color);
      swatch.textContent = color;
      swatches.appendChild(swatch);
    });
    preview.appendChild(swatches);
  }

  if (previewData.fontSample) {
    const font = document.createElement("p");
    font.className = "design-theme-mini__font";
    if (previewData.fontClass) {
      font.classList.add(previewData.fontClass);
    }
    font.textContent = previewData.fontSample;
    preview.appendChild(font);
  }

  const cta = document.createElement("span");
  cta.className = "design-theme-mini__cta";
  cta.textContent = previewData.buttonLabel || "Primary CTA";
  preview.appendChild(cta);

  const notesText = previewData.notes || design.cssNotes;
  if (notesText) {
    const notes = document.createElement("p");
    notes.className = "design-theme-mini__notes";
    notes.textContent = notesText;
    preview.appendChild(notes);
  }

  return preview;
}

function renderNextGenDesignLibrary() {
  const grid = nextGenState.elements.designGrid;
  const loading = nextGenState.elements.designLoading;
  if (!grid) return;

  grid.innerHTML = "";
  const designs = nextGenState.designLibrary;
  if (!designs.length) {
    grid.hidden = true;
    if (loading) {
      loading.hidden = false;
      loading.textContent = "No stored design references yet.";
    }
    updateNextGenDesignSummary();
    return;
  }

  if (loading) {
    loading.hidden = true;
  }

  const fragment = document.createDocumentFragment();
  designs.forEach((design, index) => {
    if (!design) return;
    const optionId = `nextgen-design-${sanitizeNextGenId(design.id, String(index))}`;
    const card = document.createElement("label");
    card.className = "nextgen-form__feature-card nextgen-form__feature-card--design";
    card.setAttribute("for", optionId);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = optionId;
    checkbox.value = design.id;
    checkbox.dataset.nextgenDesignCheckbox = "true";
    checkbox.checked = nextGenState.selectedDesigns.includes(design.id);
    card.appendChild(checkbox);

    const title = document.createElement("span");
    title.className = "nextgen-form__feature-card-title";
    title.textContent = design.label;
    card.appendChild(title);

    if (design.description) {
      const description = document.createElement("p");
      description.className = "nextgen-form__feature-card-description";
      description.textContent = design.description;
      card.appendChild(description);
    }

    if (design.cssNotes) {
      const meta = document.createElement("span");
      meta.className = "nextgen-form__feature-meta";
      meta.textContent = design.cssNotes;
      card.appendChild(meta);
    }

    const preview = buildDesignThemePreview(design);
    if (preview) {
      card.appendChild(preview);
    }

    fragment.appendChild(card);
  });

  grid.hidden = false;
  grid.appendChild(fragment);
  syncNextGenDesignCheckboxes();
  updateNextGenDesignSummary();
}

function syncNextGenFeatureCheckboxes() {
  const grid = nextGenState.elements.featureGrid;
  if (!grid) return;
  const selected = new Set(nextGenState.selectedFeatures);
  grid.querySelectorAll("[data-nextgen-feature-checkbox]").forEach((input) => {
    input.checked = selected.has(input.value);
  });
}

function syncNextGenDesignCheckboxes() {
  const grid = nextGenState.elements.designGrid;
  if (!grid) return;
  const selected = new Set(nextGenState.selectedDesigns);
  grid.querySelectorAll("[data-nextgen-design-checkbox]").forEach((input) => {
    input.checked = selected.has(input.value);
  });
}

function updateNextGenFeatureSummary() {
  const empty = nextGenState.elements.featureEmpty;
  if (!empty) return;
  empty.hidden = nextGenState.selectedFeatures.length > 0;
}

function updateNextGenDesignSummary() {
  const empty = nextGenState.elements.designEmpty;
  if (!empty) return;
  empty.hidden = nextGenState.selectedDesigns.length > 0;
}

function handleFeatureGridChange(event) {
  const input = event.target.closest("[data-nextgen-feature-checkbox]");
  if (!input) return;
  toggleNextGenFeature(input.value, input.checked);
}

function handleDesignGridChange(event) {
  const input = event.target.closest("[data-nextgen-design-checkbox]");
  if (!input) return;
  toggleNextGenDesign(input.value, input.checked);
}

function setNextGenFeatureSelection(featureIds) {
  const valid = Array.isArray(featureIds) ? featureIds.filter((id) => nextGenState.featureMap.has(id)) : [];
  nextGenState.selectedFeatures = [...new Set(valid)];
  syncNextGenFeatureCheckboxes();
  updateNextGenFeatureSummary();
}

function setNextGenDesignSelection(designIds) {
  const valid = Array.isArray(designIds) ? designIds.filter((id) => nextGenState.designMap.has(id)) : [];
  nextGenState.selectedDesigns = [...new Set(valid)];
  syncNextGenDesignCheckboxes();
  updateNextGenDesignSummary();
}

function toggleNextGenFeature(featureId, enabled) {
  if (!featureId || !nextGenState.featureMap.has(featureId)) {
    return;
  }
  const selected = new Set(nextGenState.selectedFeatures);
  if (enabled) {
    selected.add(featureId);
  } else {
    selected.delete(featureId);
  }
  nextGenState.selectedFeatures = Array.from(selected);
  updateNextGenFeatureSummary();
}

function toggleNextGenDesign(designId, enabled) {
  if (!designId || !nextGenState.designMap.has(designId)) {
    return;
  }
  const selected = new Set(nextGenState.selectedDesigns);
  if (enabled) {
    selected.add(designId);
  } else {
    selected.delete(designId);
  }
  nextGenState.selectedDesigns = Array.from(selected);
  updateNextGenDesignSummary();
}

function mergeFeatureIntoLibrary(feature) {
  if (!feature || !feature.id) return;
  const filtered = nextGenState.featureLibrary.filter((item) => item.id !== feature.id);
  filtered.push(feature);
  nextGenState.featureLibrary = sortLibraryByLabel(filtered);
  nextGenState.featureMap.set(feature.id, feature);
  pruneNextGenFeatureSelection();
  renderNextGenFeatureLibrary();
}

function mergeDesignIntoLibrary(design) {
  if (!design || !design.id) return;
  const filtered = nextGenState.designLibrary.filter((item) => item.id !== design.id);
  filtered.push(design);
  nextGenState.designLibrary = sortLibraryByLabel(filtered);
  nextGenState.designMap.set(design.id, design);
  pruneNextGenDesignSelection();
  renderNextGenDesignLibrary();
}

async function loadNextGenFeatureLibrary() {
  if (nextGenState.featureLibraryLoaded || nextGenState.featureLibraryLoading) {
    return;
  }
  nextGenState.featureLibraryLoading = true;

  if (!supabaseClient) {
    nextGenState.featureLibraryLoaded = true;
    nextGenState.featureLibraryLoading = false;
    renderNextGenFeatureLibrary();
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from(NEXTGEN_FEATURE_LIBRARY_TABLE)
      .select("id,label,description")
      .order("label", { ascending: true });
    if (error) {
      throw error;
    }
    setFeatureLibrary(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("[lovablesheet] Unable to load feature library", error);
    setFeatureLibrary([]);
  } finally {
    nextGenState.featureLibraryLoaded = true;
    nextGenState.featureLibraryLoading = false;
    renderNextGenFeatureLibrary();
  }
}

async function loadNextGenDesignLibrary() {
  if (nextGenState.designLibraryLoaded || nextGenState.designLibraryLoading) {
    return;
  }
  nextGenState.designLibraryLoading = true;

  if (!supabaseClient) {
    nextGenState.designLibraryLoaded = true;
    nextGenState.designLibraryLoading = false;
    renderNextGenDesignLibrary();
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from(NEXTGEN_DESIGN_LIBRARY_TABLE)
      .select("id,label,description,css_notes")
      .order("label", { ascending: true });
    if (error) {
      throw error;
    }
    setDesignLibrary(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("[lovablesheet] Unable to load design library", error);
    setDesignLibrary([]);
  } finally {
    nextGenState.designLibraryLoaded = true;
    nextGenState.designLibraryLoading = false;
    renderNextGenDesignLibrary();
  }
}

function resetFeatureDialogForm() {
  const { featureDialogForm, featureDialogNameInput, featureDialogIdInput, featureDialogDescriptionInput } = nextGenState.elements;
  featureDialogForm?.reset();
  if (featureDialogNameInput) {
    featureDialogNameInput.value = "";
  }
  if (featureDialogIdInput) {
    featureDialogIdInput.value = "";
  }
  if (featureDialogDescriptionInput) {
    featureDialogDescriptionInput.value = "";
  }
  nextGenState.featureDialogSlugDirty = false;
}

function setNextGenFeatureDialogStatus(message, tone = "") {
  const statusEl = nextGenState.elements.featureDialogStatus;
  if (!statusEl) return;
  statusEl.textContent = message || "";
  if (tone) {
    statusEl.dataset.tone = tone;
  } else {
    delete statusEl.dataset.tone;
  }
}

function setNextGenFeatureDialogSaving(isSaving) {
  nextGenState.featureDialogSaving = Boolean(isSaving);
  const { featureDialogSave, featureDialogCancel, featureDialogClose } = nextGenState.elements;
  [featureDialogSave, featureDialogCancel, featureDialogClose].forEach((button) => {
    if (button) {
      button.disabled = nextGenState.featureDialogSaving;
    }
  });
}

function handleFeatureDialogKeydown(event) {
  if (event.key !== "Escape") {
    return;
  }
  event.preventDefault();
  closeNextGenFeatureDialog({ focusTrigger: true });
}

function openNextGenFeatureDialog(trigger) {
  const { featureDialog } = nextGenState.elements;
  if (!featureDialog || nextGenState.featureDialogOpen) {
    return;
  }
  if (!supabaseClient) {
    setNextGenFormStatus("Supabase connection required to add new features.", "error");
    return;
  }
  featureDialog.hidden = false;
  featureDialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("lovablesheet-modal-open");
  nextGenState.featureDialogOpen = true;
  nextGenState.featureDialogTrigger = trigger || null;
  setNextGenFeatureDialogStatus("");
  setNextGenFeatureDialogSaving(false);
  resetFeatureDialogForm();

  if (!nextGenState.featureDialogKeydownHandler) {
    nextGenState.featureDialogKeydownHandler = handleFeatureDialogKeydown;
    document.addEventListener("keydown", nextGenState.featureDialogKeydownHandler);
  }

  window.setTimeout(() => {
    try {
      nextGenState.elements.featureDialogNameInput?.focus();
    } catch (error) {
      console.warn("[lovablesheet] Unable to focus feature dialog", error);
    }
  }, 0);
}

function closeNextGenFeatureDialog(options = {}) {
  const { focusTrigger = true } = options;
  const { featureDialog } = nextGenState.elements;
  if (!featureDialog || !nextGenState.featureDialogOpen || nextGenState.featureDialogSaving) {
    return;
  }
  featureDialog.hidden = true;
  featureDialog.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lovablesheet-modal-open");
  if (nextGenState.featureDialogKeydownHandler) {
    document.removeEventListener("keydown", nextGenState.featureDialogKeydownHandler);
    nextGenState.featureDialogKeydownHandler = null;
  }
  nextGenState.featureDialogOpen = false;
  const trigger = nextGenState.featureDialogTrigger;
  nextGenState.featureDialogTrigger = null;
  if (focusTrigger && trigger && typeof trigger.focus === "function") {
    try {
      trigger.focus();
    } catch (_error) {
      /* ignore */
    }
  }
}

async function handleNextGenFeatureDialogSubmit(event) {
  event.preventDefault();
  if (nextGenState.featureDialogSaving) return;
  if (!supabaseClient) {
    setNextGenFeatureDialogStatus("Supabase connection required to save features.", "error");
    return;
  }

  const { featureDialogNameInput, featureDialogIdInput, featureDialogDescriptionInput } = nextGenState.elements;
  const label = featureDialogNameInput?.value?.trim() ?? "";
  if (!label) {
    setNextGenFeatureDialogStatus("Name is required.", "error");
    featureDialogNameInput?.focus();
    return;
  }

  const slugSource = featureDialogIdInput?.value?.trim() || label;
  const id = sanitizeNextGenId(slugSource, label).toLowerCase();
  if (!id) {
    setNextGenFeatureDialogStatus("Provide a valid feature slug.", "error");
    featureDialogIdInput?.focus();
    return;
  }

  const description = featureDialogDescriptionInput?.value?.trim() ?? "";
  if (!description) {
    setNextGenFeatureDialogStatus("Add the longer explanation.", "error");
    featureDialogDescriptionInput?.focus();
    return;
  }

  setNextGenFeatureDialogSaving(true);
  setNextGenFeatureDialogStatus("Saving feature…");

  try {
    const payload = { id, label, description };
    const { data, error } = await supabaseClient
      .from(NEXTGEN_FEATURE_LIBRARY_TABLE)
      .upsert(payload, { onConflict: "id" })
      .select("id,label,description")
      .single();
    if (error) {
      throw error;
    }
    const normalized = normalizeFeatureLibraryItem(data);
    if (normalized) {
      mergeFeatureIntoLibrary(normalized);
      if (!nextGenState.selectedFeatures.includes(normalized.id)) {
        nextGenState.selectedFeatures.push(normalized.id);
      }
      syncNextGenFeatureCheckboxes();
      updateNextGenFeatureSummary();
      setNextGenFormStatus(`Added “${normalized.label}” to the feature library.`, "success");
    }
    setNextGenFeatureDialogStatus("Feature saved.", "success");
    closeNextGenFeatureDialog({ focusTrigger: true });
  } catch (error) {
    console.error("[lovablesheet] Unable to save Next Gen feature", error);
    setNextGenFeatureDialogStatus("We couldn't save that feature. Try again.", "error");
  } finally {
    setNextGenFeatureDialogSaving(false);
  }
}

function handleNextGenFeatureDialogLabelInput() {
  const { featureDialogNameInput, featureDialogIdInput } = nextGenState.elements;
  if (!featureDialogNameInput || !featureDialogIdInput) return;
  if (nextGenState.featureDialogSlugDirty) {
    return;
  }
  const generated = sanitizeNextGenId(featureDialogNameInput.value, "").toLowerCase();
  featureDialogIdInput.value = generated;
}

function resetDesignDialogForm() {
  const {
    designDialogForm,
    designDialogNameInput,
    designDialogIdInput,
    designDialogDescriptionInput,
    designDialogCssInput
  } = nextGenState.elements;
  designDialogForm?.reset();
  if (designDialogNameInput) designDialogNameInput.value = "";
  if (designDialogIdInput) designDialogIdInput.value = "";
  if (designDialogDescriptionInput) designDialogDescriptionInput.value = "";
  if (designDialogCssInput) designDialogCssInput.value = "";
  nextGenState.designDialogSlugDirty = false;
}

function setNextGenDesignDialogStatus(message, tone = "") {
  const statusEl = nextGenState.elements.designDialogStatus;
  if (!statusEl) return;
  statusEl.textContent = message || "";
  if (tone) {
    statusEl.dataset.tone = tone;
  } else {
    delete statusEl.dataset.tone;
  }
}

function setNextGenDesignDialogSaving(isSaving) {
  nextGenState.designDialogSaving = Boolean(isSaving);
  const { designDialogSave, designDialogCancel, designDialogClose } = nextGenState.elements;
  [designDialogSave, designDialogCancel, designDialogClose].forEach((button) => {
    if (button) {
      button.disabled = nextGenState.designDialogSaving;
    }
  });
}

function handleDesignDialogKeydown(event) {
  if (event.key !== "Escape") {
    return;
  }
  event.preventDefault();
  closeNextGenDesignDialog({ focusTrigger: true });
}

function openNextGenDesignDialog(trigger) {
  const { designDialog } = nextGenState.elements;
  if (!designDialog || nextGenState.designDialogOpen) {
    return;
  }
  if (!supabaseClient) {
    setNextGenFormStatus("Supabase connection required to add new designs.", "error");
    return;
  }
  designDialog.hidden = false;
  designDialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("lovablesheet-modal-open");
  nextGenState.designDialogOpen = true;
  nextGenState.designDialogTrigger = trigger || null;
  setNextGenDesignDialogStatus("");
  setNextGenDesignDialogSaving(false);
  resetDesignDialogForm();

  if (!nextGenState.designDialogKeydownHandler) {
    nextGenState.designDialogKeydownHandler = handleDesignDialogKeydown;
    document.addEventListener("keydown", nextGenState.designDialogKeydownHandler);
  }

  window.setTimeout(() => {
    try {
      nextGenState.elements.designDialogNameInput?.focus();
    } catch (error) {
      console.warn("[lovablesheet] Unable to focus design dialog", error);
    }
  }, 0);
}

function closeNextGenDesignDialog(options = {}) {
  const { focusTrigger = true } = options;
  const { designDialog } = nextGenState.elements;
  if (!designDialog || !nextGenState.designDialogOpen || nextGenState.designDialogSaving) {
    return;
  }
  designDialog.hidden = true;
  designDialog.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lovablesheet-modal-open");
  if (nextGenState.designDialogKeydownHandler) {
    document.removeEventListener("keydown", nextGenState.designDialogKeydownHandler);
    nextGenState.designDialogKeydownHandler = null;
  }
  nextGenState.designDialogOpen = false;
  const trigger = nextGenState.designDialogTrigger;
  nextGenState.designDialogTrigger = null;
  if (focusTrigger && trigger && typeof trigger.focus === "function") {
    try {
      trigger.focus();
    } catch (_error) {
      /* ignore */
    }
  }
}

async function handleNextGenDesignDialogSubmit(event) {
  event.preventDefault();
  if (nextGenState.designDialogSaving) return;
  if (!supabaseClient) {
    setNextGenDesignDialogStatus("Supabase connection required to save designs.", "error");
    return;
  }

  const {
    designDialogNameInput,
    designDialogIdInput,
    designDialogDescriptionInput,
    designDialogCssInput
  } = nextGenState.elements;
  const label = designDialogNameInput?.value?.trim() ?? "";
  if (!label) {
    setNextGenDesignDialogStatus("Name is required.", "error");
    designDialogNameInput?.focus();
    return;
  }

  const slugSource = designDialogIdInput?.value?.trim() || label;
  const id = sanitizeNextGenId(slugSource, label).toLowerCase();
  if (!id) {
    setNextGenDesignDialogStatus("Provide a valid design slug.", "error");
    designDialogIdInput?.focus();
    return;
  }

  const description = designDialogDescriptionInput?.value?.trim() ?? "";
  if (!description) {
    setNextGenDesignDialogStatus("Add the design description.", "error");
    designDialogDescriptionInput?.focus();
    return;
  }

  const cssNotes = designDialogCssInput?.value?.trim() ?? "";
  if (!cssNotes) {
    setNextGenDesignDialogStatus("Include the CSS notes.", "error");
    designDialogCssInput?.focus();
    return;
  }

  setNextGenDesignDialogSaving(true);
  setNextGenDesignDialogStatus("Saving design…");

  try {
    const payload = { id, label, description, css_notes: cssNotes };
    const { data, error } = await supabaseClient
      .from(NEXTGEN_DESIGN_LIBRARY_TABLE)
      .upsert(payload, { onConflict: "id" })
      .select("id,label,description,css_notes")
      .single();
    if (error) {
      throw error;
    }
    const normalized = normalizeDesignLibraryItem(data);
    if (normalized) {
      mergeDesignIntoLibrary(normalized);
      if (!nextGenState.selectedDesigns.includes(normalized.id)) {
        nextGenState.selectedDesigns.push(normalized.id);
      }
      syncNextGenDesignCheckboxes();
      updateNextGenDesignSummary();
      setNextGenFormStatus(`Added “${normalized.label}” to the design library.`, "success");
    }
    setNextGenDesignDialogStatus("Design saved.", "success");
    closeNextGenDesignDialog({ focusTrigger: true });
  } catch (error) {
    console.error("[lovablesheet] Unable to save Next Gen design", error);
    setNextGenDesignDialogStatus("We couldn't save that design. Try again.", "error");
  } finally {
    setNextGenDesignDialogSaving(false);
  }
}

function handleNextGenDesignDialogLabelInput() {
  const { designDialogNameInput, designDialogIdInput } = nextGenState.elements;
  if (!designDialogNameInput || !designDialogIdInput) return;
  if (nextGenState.designDialogSlugDirty) {
    return;
  }
  const generated = sanitizeNextGenId(designDialogNameInput.value, "").toLowerCase();
  designDialogIdInput.value = generated;
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
    nameInput,
    descriptionInput,
    notesInput,
    productsContainer,
    standardTextarea
  } = nextGenState.elements;

  form?.reset();
  setNextGenFeatureSelection([]);
  setNextGenDesignSelection([]);
  if (descriptionInput) {
    descriptionInput.value = "";
  }
  if (notesInput) {
    notesInput.value = "";
  }

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

  if (nameInput) {
    syncSelectedProductInputs(ideaStageState.selectedProduct, { skipManual: true });
  }
}

function focusNextGenForm(options = {}) {
  const { focusField = false } = options;
  const { form, nameInput } = nextGenState.elements;
  if (!form) {
    return;
  }

  scrollElementIntoView(form);

  if (!focusField) {
    return;
  }

  const fallbackTarget = form.querySelector("input, textarea, select, button");
  const focusTarget = nameInput || fallbackTarget;
  if (!focusTarget) {
    return;
  }

  window.setTimeout(() => {
    try {
      focusTarget.focus({ preventScroll: true });
    } catch (_error) {
      try {
        focusTarget.focus();
      } catch (_innerError) {
        /* Ignore focus errors. */
      }
    }
  }, 150);
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

  setIdeaStageSelection(productName, {
    source: fromDraftTable ? "draft" : "ready",
    origin: "pipeline"
  });

  resetNextGenForm();
  setNextGenFormStatus("");

  const { nameInput } = nextGenState.elements;

  focusNextGenForm({ focusField: true });

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
        const rawDemoUrl = typeof item.virtualDemo === "string" ? item.virtualDemo : "";
        const demoUrl = normalizeDemoUrl(rawDemoUrl);

        return { id, name, displayName, draft, price, lifeAreas, tagline, demoUrl };
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
    updateDemoLabProductPicker(normalized);
  } catch (error) {
    console.error("[lovablesheet] Unable to load products for Next Gen brief", error);
    if (productsError) {
      productsError.hidden = false;
    }
    renderDraftModelsTable([]);
    updateDemoLabProductPicker([]);
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
    const title = document.createElement("p");
    title.className = "lovablesheet-nextgen__feature-title";
    title.textContent = label;
    item.appendChild(title);
    const detail = typeof feature.description === "string" && feature.description.trim() ? feature.description.trim() : "";
    if (detail) {
      const copy = document.createElement("p");
      copy.className = "lovablesheet-nextgen__feature-copy";
      copy.textContent = detail;
      item.appendChild(copy);
    }
    list.appendChild(item);
  });
  section.appendChild(list);
  parent.appendChild(section);
}

function appendNextGenDesignsSection(parent, designs) {
  if (!parent || !Array.isArray(designs) || !designs.length) return;
  const section = document.createElement("div");
  section.className = "lovablesheet-nextgen__section";
  const heading = document.createElement("p");
  heading.className = "lovablesheet-nextgen__section-title";
  heading.textContent = "Design references";
  section.appendChild(heading);
  const list = document.createElement("ul");
  list.className = "lovablesheet-nextgen__designs";
  designs.forEach((design) => {
    if (!design) return;
    const id = typeof design.id === "string" ? design.id : "";
    const label = typeof design.label === "string" && design.label ? design.label : id;
    if (!label) return;
    const item = document.createElement("li");
    item.className = "lovablesheet-nextgen__design";
    const title = document.createElement("p");
    title.className = "lovablesheet-nextgen__design-title";
    title.textContent = label;
    item.appendChild(title);
    const description = typeof design.description === "string" && design.description.trim() ? design.description.trim() : "";
    if (description) {
      const notes = document.createElement("p");
      notes.className = "lovablesheet-nextgen__design-notes";
      notes.textContent = description;
      item.appendChild(notes);
    }
    const cssNotes = typeof design.cssNotes === "string" && design.cssNotes.trim() ? design.cssNotes.trim() : "";
    if (cssNotes) {
      const css = document.createElement("p");
      css.className = "lovablesheet-nextgen__design-css";
      css.textContent = cssNotes;
      item.appendChild(css);
    }
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
    appendNextGenDesignsSection(content, brief.designs);
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

function normalizeBriefFeature(feature) {
  if (!feature) return null;
  if (typeof feature === "string") {
    const libraryFeature = nextGenState.featureMap.get(feature);
    if (libraryFeature) {
      return { id: libraryFeature.id, label: libraryFeature.label, description: libraryFeature.description || "" };
    }
    return { id: feature, label: feature, description: "" };
  }
  if (typeof feature === "object") {
    const rawId = typeof feature.id === "string" && feature.id ? feature.id : typeof feature.value === "string" ? feature.value : "";
    if (!rawId) return null;
    const libraryFeature = nextGenState.featureMap.get(rawId) || null;
    const label = typeof feature.label === "string" && feature.label ? feature.label : libraryFeature?.label || rawId;
    const description = typeof feature.description === "string" && feature.description
      ? feature.description
      : typeof feature.details === "string" && feature.details
        ? feature.details
        : libraryFeature?.description || "";
    return { id: rawId, label, description };
  }
  return null;
}

function normalizeBriefDesign(design) {
  if (!design) return null;
  if (typeof design === "string") {
    const libraryDesign = nextGenState.designMap.get(design);
    if (libraryDesign) {
      return {
        id: libraryDesign.id,
        label: libraryDesign.label,
        description: libraryDesign.description || "",
        cssNotes: libraryDesign.cssNotes || ""
      };
    }
    return { id: design, label: design, description: "", cssNotes: "" };
  }
  if (typeof design === "object") {
    const rawId = typeof design.id === "string" && design.id
      ? design.id
      : typeof design.value === "string" && design.value
        ? design.value
        : "";
    if (!rawId) return null;
    const libraryDesign = nextGenState.designMap.get(rawId) || null;
    const label = typeof design.label === "string" && design.label ? design.label : libraryDesign?.label || rawId;
    const description = typeof design.description === "string" && design.description
      ? design.description
      : libraryDesign?.description || "";
    const cssNotes = typeof design.cssNotes === "string" && design.cssNotes
      ? design.cssNotes
      : typeof design.css_notes === "string" && design.css_notes
        ? design.css_notes
        : typeof design.css === "string" && design.css
          ? design.css
          : typeof design.styles === "string" && design.styles
            ? design.styles
            : libraryDesign?.cssNotes || "";
    return { id: rawId, label, description, cssNotes };
  }
  return null;
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
    ? brief.features.map((item) => normalizeBriefFeature(item)).filter(Boolean)
    : [];

  const designs = Array.isArray(brief.designs)
    ? brief.designs.map((item) => normalizeBriefDesign(item)).filter(Boolean)
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
    designs,
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
    const feature = nextGenState.featureMap.get(featureId) || { id: featureId, label: featureId, description: "" };
    return { id: feature.id, label: feature.label, description: feature.description || "" };
  });

  const designs = nextGenState.selectedDesigns.map((designId) => {
    const design = nextGenState.designMap.get(designId) || { id: designId, label: designId, description: "", cssNotes: "" };
    return {
      id: design.id,
      label: design.label,
      description: design.description || "",
      cssNotes: design.cssNotes || ""
    };
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
  const productOverride = getPromptCompanionOverride(getPromptCompanionProductKey(productName));
  const overrideStandard = typeof productOverride?.standardText === "string" && productOverride.standardText.trim()
    ? productOverride.standardText.trim()
    : "";
  const briefStandardText = overrideStandard
    ? overrideStandard
    : typeof standardValue === "string" && standardValue.trim()
      ? standardValue
      : nextGenState.standardText || NEXTGEN_DEFAULT_STANDARD_TEXT;
  const brief = normalizeNextGenBrief({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productName,
    description,
    notes,
    standardText: briefStandardText,
    features,
    designs,
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
  closeNextGenInspirationDialog({ focusButton: false });
  resetNextGenForm();
  setNextGenFormStatus("Next Gen brief saved.", "success");
  focusNextGenForm();

  showStep(2);
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
  elements.openButtons = Array.from(document.querySelectorAll("[data-nextgen-open]"));
  elements.openButton = elements.openButtons[0] ?? null;
  elements.status = section.querySelector("[data-nextgen-status]") ?? null;
  elements.list = section.querySelector("[data-nextgen-list]") ?? null;
  elements.empty = section.querySelector("[data-nextgen-empty]") ?? null;
  elements.form = document.querySelector("[data-nextgen-form]") ?? null;
  elements.nameInput = elements.form?.querySelector("[data-nextgen-name]") ?? null;
  elements.featureMatrix = elements.form?.querySelector("[data-nextgen-feature-matrix]") ?? null;
  elements.featureGrid = elements.form?.querySelector("[data-nextgen-feature-grid]") ?? null;
  elements.featureLoading = elements.form?.querySelector("[data-nextgen-feature-loading]") ?? null;
  elements.featureEmpty = elements.form?.querySelector("[data-nextgen-feature-empty]") ?? null;
  elements.featureAddButton = elements.form?.querySelector("[data-nextgen-feature-add]") ?? null;
  elements.designAddButton = elements.form?.querySelector("[data-nextgen-design-add]") ?? null;
  elements.designMatrix = elements.form?.querySelector("[data-nextgen-design-matrix]") ?? null;
  elements.designGrid = elements.form?.querySelector("[data-nextgen-design-grid]") ?? null;
  elements.designLoading = elements.form?.querySelector("[data-nextgen-design-loading]") ?? null;
  elements.designEmpty = elements.form?.querySelector("[data-nextgen-design-empty]") ?? null;
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
  elements.summaryCard = document.querySelector("[data-nextgen-summary-card]") ?? null;
  elements.summaryStatus = document.querySelector("[data-nextgen-summary-status]") ?? null;
  elements.summaryState = document.querySelector("[data-nextgen-summary-state-text]") ?? null;
  elements.summaryDescription = document.querySelector("[data-nextgen-summary-description]") ?? null;
  elements.libraryButton = document.querySelector("[data-module-library-open]") ?? null;
  elements.libraryLayer = document.querySelector("[data-module-library-layer]") ?? null;
  elements.libraryOverlay = elements.libraryLayer?.querySelector("[data-module-library-overlay]") ?? null;
  elements.libraryDialog = elements.libraryLayer?.querySelector("[data-module-library-dialog]") ?? null;
  elements.libraryClose = elements.libraryLayer?.querySelector("[data-module-library-close]") ?? null;
  elements.featureDialog = elements.form?.querySelector("[data-nextgen-feature-dialog]") ?? null;
  elements.featureDialogOverlay = elements.featureDialog?.querySelector("[data-nextgen-feature-dialog-overlay]") ?? null;
  elements.featureDialogClose = elements.featureDialog?.querySelector("[data-nextgen-feature-dialog-close]") ?? null;
  elements.featureDialogCancel = elements.featureDialog?.querySelector("[data-nextgen-feature-dialog-cancel]") ?? null;
  elements.featureDialogForm = elements.featureDialog?.querySelector("[data-nextgen-feature-form]") ?? null;
  elements.featureDialogStatus = elements.featureDialog?.querySelector("[data-nextgen-feature-status]") ?? null;
  elements.featureDialogNameInput = elements.featureDialog?.querySelector("[data-nextgen-feature-name]") ?? null;
  elements.featureDialogIdInput = elements.featureDialog?.querySelector("[data-nextgen-feature-id]") ?? null;
  elements.featureDialogDescriptionInput = elements.featureDialog?.querySelector("[data-nextgen-feature-description]") ?? null;
  elements.featureDialogSave = elements.featureDialog?.querySelector("[data-nextgen-feature-dialog-save]") ?? null;
  elements.designDialog = elements.form?.querySelector("[data-nextgen-design-dialog]") ?? null;
  elements.designDialogOverlay = elements.designDialog?.querySelector("[data-nextgen-design-dialog-overlay]") ?? null;
  elements.designDialogClose = elements.designDialog?.querySelector("[data-nextgen-design-dialog-close]") ?? null;
  elements.designDialogCancel = elements.designDialog?.querySelector("[data-nextgen-design-dialog-cancel]") ?? null;
  elements.designDialogForm = elements.designDialog?.querySelector("[data-nextgen-design-form]") ?? null;
  elements.designDialogStatus = elements.designDialog?.querySelector("[data-nextgen-design-status]") ?? null;
  elements.designDialogNameInput = elements.designDialog?.querySelector("[data-nextgen-design-name]") ?? null;
  elements.designDialogIdInput = elements.designDialog?.querySelector("[data-nextgen-design-id]") ?? null;
  elements.designDialogDescriptionInput = elements.designDialog?.querySelector("[data-nextgen-design-description]") ?? null;
  elements.designDialogCssInput = elements.designDialog?.querySelector("[data-nextgen-design-css]") ?? null;
  elements.designDialogSave = elements.designDialog?.querySelector("[data-nextgen-design-dialog-save]") ?? null;

  applyNextGenStandardText(nextGenState.standardText);
  setNextGenStandardEditing(false);
  setNextGenStandardStatus("");

  renderNextGenFeatureLibrary();
  renderNextGenDesignLibrary();
  updateNextGenFeatureSummary();
  updateNextGenDesignSummary();
  renderNextGenSelectedInspiration();

  if (elements.nameInput) {
    elements.nameInput.addEventListener("input", () => {
      setIdeaStageSelection(elements.nameInput.value || "", { origin: "nextgen" });
    });
  }

  syncSelectedProductInputs(ideaStageState.selectedProduct, { skipManual: true });

  nextGenState.savedBriefs = getNextGenStoredBriefs();
  renderNextGenSavedBriefs();
  setNextGenStatus("");

  if (elements.openButtons.length) {
    elements.openButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setNextGenFormStatus("");
        focusNextGenForm({ focusField: true });
      });
    });
  }

  if (elements.cancelButton) {
    elements.cancelButton.addEventListener("click", () => {
      resetNextGenForm();
      setNextGenFormStatus("Form cleared.");
      focusNextGenForm();
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
      focusNextGenForm({ focusField: true });
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

  if (elements.featureGrid) {
    elements.featureGrid.addEventListener("change", handleFeatureGridChange);
  }

  if (elements.designGrid) {
    elements.designGrid.addEventListener("change", handleDesignGridChange);
  }

  if (elements.featureAddButton) {
    elements.featureAddButton.addEventListener("click", () => {
      openNextGenFeatureDialog(elements.featureAddButton);
    });
  }

  if (elements.designAddButton) {
    elements.designAddButton.addEventListener("click", () => {
      openNextGenDesignDialog(elements.designAddButton);
    });
  }

  if (elements.featureDialogOverlay) {
    elements.featureDialogOverlay.addEventListener("click", () => {
      closeNextGenFeatureDialog({ focusTrigger: true });
    });
  }

  if (elements.featureDialogClose) {
    elements.featureDialogClose.addEventListener("click", () => {
      closeNextGenFeatureDialog({ focusTrigger: true });
    });
  }

  if (elements.featureDialogCancel) {
    elements.featureDialogCancel.addEventListener("click", () => {
      closeNextGenFeatureDialog({ focusTrigger: true });
    });
  }

  if (elements.featureDialogForm) {
    elements.featureDialogForm.addEventListener("submit", handleNextGenFeatureDialogSubmit);
  }

  if (elements.featureDialogNameInput) {
    elements.featureDialogNameInput.addEventListener("input", handleNextGenFeatureDialogLabelInput);
  }

  if (elements.featureDialogIdInput) {
    elements.featureDialogIdInput.addEventListener("input", (event) => {
      const value = typeof event.target.value === "string" ? event.target.value : elements.featureDialogIdInput.value;
      nextGenState.featureDialogSlugDirty = Boolean(value?.trim());
    });
  }

  if (elements.designDialogOverlay) {
    elements.designDialogOverlay.addEventListener("click", () => {
      closeNextGenDesignDialog({ focusTrigger: true });
    });
  }

  if (elements.designDialogClose) {
    elements.designDialogClose.addEventListener("click", () => {
      closeNextGenDesignDialog({ focusTrigger: true });
    });
  }

  if (elements.designDialogCancel) {
    elements.designDialogCancel.addEventListener("click", () => {
      closeNextGenDesignDialog({ focusTrigger: true });
    });
  }

  if (elements.designDialogForm) {
    elements.designDialogForm.addEventListener("submit", handleNextGenDesignDialogSubmit);
  }

  if (elements.designDialogNameInput) {
    elements.designDialogNameInput.addEventListener("input", handleNextGenDesignDialogLabelInput);
  }

  if (elements.designDialogIdInput) {
    elements.designDialogIdInput.addEventListener("input", (event) => {
      const value = typeof event.target.value === "string" ? event.target.value : elements.designDialogIdInput.value;
      nextGenState.designDialogSlugDirty = Boolean(value?.trim());
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
  loadNextGenFeatureLibrary();
  loadNextGenDesignLibrary();
  loadNextGenStandardFromSupabase();
  loadPromptSystemIntroFromSupabase();
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
    this.activeShapeMenu = null;
    this.handleDocumentPointerDown = (event) => {
      if (this.activeColorMenu) {
        const { menu, toggle } = this.activeColorMenu;
        if (menu.contains(event.target) || toggle.contains(event.target)) {
          // Don't close if clicking inside
        } else {
          this.closeColorMenu();
        }
      }
      if (this.activeShapeMenu) {
        const { menu, toggle } = this.activeShapeMenu;
        if (menu.contains(event.target) || toggle.contains(event.target)) {
          // Don't close if clicking inside
        } else {
          this.closeShapeMenu();
        }
      }
    };
    this.handleDocumentKeyDown = (event) => {
      if (event.key === "Escape") {
        if (this.activeColorMenu) {
          event.preventDefault();
          const { toggle } = this.activeColorMenu;
          this.closeColorMenu();
          toggle?.focus?.();
        }
        if (this.activeShapeMenu) {
          event.preventDefault();
          const { toggle } = this.activeShapeMenu;
          this.closeShapeMenu();
          toggle?.focus?.();
        }
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

    if (this.activeShapeMenu?.note === note) {
      this.closeShapeMenu();
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

    const shapeMenu = note.querySelector("[data-note-shape-menu]");
    if (!shapeMenu) return;

    let optionsContainer = shapeMenu.querySelector("[data-note-shape-options]");
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

      shapeMenu.appendChild(section);
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
        this.closeShapeMenu(shapeMenu);
      });
      optionsContainer.dataset.shapeOptionsBound = "true";
    }

    // Update the shape preview dot
    this.updateShapePreviewDot(note);
  }

  updateShapeControls(note) {
    if (!note) return;
    const activeShape = this.ensureNoteShape(note);
    const shapeMenu = note.querySelector("[data-note-shape-menu]");
    if (!shapeMenu) return;
    const optionsContainer = shapeMenu.querySelector("[data-note-shape-options]");
    if (!optionsContainer) return;

    optionsContainer.querySelectorAll("[data-note-shape]").forEach((button) => {
      const isActive = button.dataset.noteShape === activeShape;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    // Update the shape preview dot
    this.updateShapePreviewDot(note);
  }

  updateShapePreviewDot(note) {
    if (!note) return;
    const activeShape = note.dataset.shape || "classic";
    const previewDot = note.querySelector("[data-note-shape-preview-dot]");
    if (previewDot) {
      previewDot.setAttribute("data-shape", activeShape);
    }
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

  openShapeMenu(note, toggle, menu) {
    if (!toggle || !menu) return;
    const alreadyOpen = this.activeShapeMenu?.menu === menu;
    if (alreadyOpen) return;

    this.closeShapeMenu();

    toggle.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    window.requestAnimationFrame(() => {
      menu.classList.add("is-open");
    });

    this.activeShapeMenu = { note, toggle, menu };
    document.addEventListener("pointerdown", this.handleDocumentPointerDown);
    document.addEventListener("keydown", this.handleDocumentKeyDown);
  }

  closeShapeMenu(targetMenu) {
    if (!this.activeShapeMenu) return;
    if (targetMenu && this.activeShapeMenu.menu !== targetMenu) {
      return;
    }

    const { menu, toggle } = this.activeShapeMenu;
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

    this.activeShapeMenu = null;
  }

  updateGroupButtonState(note, isActive) {
    const button = note.querySelector("[data-note-group]");
    if (!button) return;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
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

    const shapeToggle = note.querySelector("[data-note-shape-toggle]");
    const shapeMenu = note.querySelector("[data-note-shape-menu]");

    if (shapeToggle && shapeMenu) {
      shapeToggle.addEventListener("click", (event) => {
        event.preventDefault();
        const isOpen = this.activeShapeMenu?.menu === shapeMenu;
        if (isOpen) {
          this.closeShapeMenu(shapeMenu);
        } else {
          this.openShapeMenu(note, shapeToggle, shapeMenu);
        }
      });
    }

    if (shapeMenu) {
      shapeMenu.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          this.closeShapeMenu(shapeMenu);
          shapeToggle?.focus?.();
        }
      });
    }

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
  boardTableBodies = Array.from(document.querySelectorAll("[data-board-table-body]"));
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

  // Setup table row click handlers
  document.addEventListener("click", (event) => {
    const row = event.target.closest("[data-board-row]");
    if (!row) return;
    const boardId = row.dataset.boardId;
    if (!boardId) return;
    selectBoard(boardId);
    openBoardModal("brain", row);
  });

  // Setup table keyboard navigation
  document.addEventListener("keydown", (event) => {
    const row = event.target.closest("[data-board-row]");
    if (!row) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const boardId = row.dataset.boardId;
      if (!boardId) return;
      selectBoard(boardId);
      openBoardModal("brain", row);
    }
  });

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
  }
  
  updateBoardOptions(DEFAULT_BOARD_ID);

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

function formatBoardTimestamp(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    const options = { month: 'short', day: 'numeric' };
    if (date.getFullYear() !== now.getFullYear()) {
      options.year = 'numeric';
    }
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    return "—";
  }
}

function getStickyCount(board) {
  if (!board || !board.notes) return 0;
  try {
    if (Array.isArray(board.notes)) {
      return board.notes.length;
    }
    return 0;
  } catch (error) {
    return 0;
  }
}

function updateBoardOptions(targetSelection = currentBoardId) {
  const selects = [];
  if (boardSelectEl) selects.push(boardSelectEl);
  if (boardSwitcherSelect) selects.push(boardSwitcherSelect);

  const sortedBoards = [...supabaseBoards].sort((a, b) => {
    const nameA = a.name.toLocaleLowerCase();
    const nameB = b.name.toLocaleLowerCase();
    if (nameA === nameB) return 0;
    return nameA < nameB ? -1 : 1;
  });

  const defaultBoard = boardsCache.get(DEFAULT_BOARD_ID);
  const boards = [
    { 
      id: DEFAULT_BOARD_ID, 
      name: "Default Board (Demo)", 
      sticky_count: getStickyCount(defaultBoard),
      last_save: null
    },
    ...sortedBoards.map((board) => ({ 
      id: board.id, 
      name: board.name,
      sticky_count: getStickyCount(board),
      last_save: board.updated_at || board.created_at
    }))
  ];

  const fallback = boards.some((board) => board.id === targetSelection)
    ? targetSelection
    : boards.some((board) => board.id === currentBoardId)
      ? currentBoardId
      : DEFAULT_BOARD_ID;

  // Update select dropdowns if they exist (for board switcher)
  selects.forEach((select) => {
    select.innerHTML = "";
    boards.forEach((board) => {
      const element = document.createElement("option");
      element.value = board.id;
      element.textContent = board.name;
      select.appendChild(element);
    });
    const targetValue = boards.some((board) => board.id === fallback) ? fallback : DEFAULT_BOARD_ID;
    select.value = targetValue;
  });

  // Update table views
  boardTableBodies.forEach((tbody) => {
    tbody.innerHTML = "";
    boards.forEach((board) => {
      const row = document.createElement("tr");
      row.className = "brain-board-library__row";
      row.dataset.boardId = board.id;
      row.dataset.boardRow = "";
      row.setAttribute("tabindex", "0");
      row.setAttribute("role", "button");
      
      if (board.id === currentBoardId) {
        row.setAttribute("aria-selected", "true");
      }

      const titleCell = document.createElement("td");
      titleCell.dataset.label = "Title";
      titleCell.textContent = board.name;

      const stickyCell = document.createElement("td");
      stickyCell.dataset.label = "# Sticky's";
      stickyCell.textContent = board.sticky_count.toString();

      const saveCell = document.createElement("td");
      saveCell.dataset.label = "Last Save";
      saveCell.textContent = formatBoardTimestamp(board.last_save);

      row.appendChild(titleCell);
      row.appendChild(stickyCell);
      row.appendChild(saveCell);

      tbody.appendChild(row);
    });
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

  // Update table row selection
  document.querySelectorAll("[data-board-row]").forEach((row) => {
    if (row.dataset.boardId === targetId) {
      row.setAttribute("aria-selected", "true");
    } else {
      row.removeAttribute("aria-selected");
    }
  });

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

// Step navigation and celebration screen
const stepNavigationState = {
  currentStep: 1,
  totalSteps: 3,
  celebrationShown: false,
  elements: {
    progressDots: Array.from(document.querySelectorAll('[data-progress-step]')),
    progressFill: document.querySelector('[data-progress-fill]'),
    celebrationScreen: document.querySelector('[data-celebration-screen]'),
    celebrationMessage: document.querySelector('[data-celebration-message]'),
    celebrationNextButton: document.querySelector('[data-celebration-next]'),
    stages: [
      document.querySelector('[data-idea-stage]'),
      document.querySelector('[data-step-two]'),
      document.querySelector('[data-step-three]')
    ]
  }
};

function updateProgressDots() {
  const { progressDots, progressFill } = stepNavigationState.elements;
  const { currentStep, totalSteps } = stepNavigationState;

  progressDots.forEach((dot, index) => {
    if (!dot) {
      return;
    }
    const stepNumber = index + 1;
    if (stepNumber < currentStep) {
      dot.setAttribute('data-status', 'completed');
    } else if (stepNumber === currentStep) {
      dot.setAttribute('data-status', 'active');
    } else {
      dot.setAttribute('data-status', 'upcoming');
    }
  });

  if (progressFill) {
    const ratio = totalSteps <= 1 ? 1 : (currentStep - 1) / (totalSteps - 1);
    const clamped = Math.min(Math.max(ratio, 0), 1);
    progressFill.style.width = `${clamped * 100}%`;
  }
}

function updateStageStatuses(stepNumber) {
  const { stages } = stepNavigationState.elements;
  if (!Array.isArray(stages)) {
    return;
  }

  stages.forEach((stage, index) => {
    if (!stage) {
      return;
    }
    const stageStepNumber = index + 1;
    if (stageStepNumber < stepNumber) {
      stage.dataset.stageStatus = 'completed';
    } else if (stageStepNumber === stepNumber) {
      stage.dataset.stageStatus = 'active';
    } else {
      stage.dataset.stageStatus = 'upcoming';
    }
  });
}

function showStep(stepNumber) {
  const normalizedStep = Math.min(Math.max(stepNumber, 1), stepNavigationState.totalSteps);
  stepNavigationState.currentStep = normalizedStep;
  updateStageStatuses(normalizedStep);
  updateProgressDots();
}

function showCelebrationScreen(completedStep) {
  const { celebrationScreen, celebrationMessage } = stepNavigationState.elements;

  if (!celebrationScreen) return;

  const messages = {
    1: "You've completed Step 1: Idea generation!",
    2: "You've completed Step 2: Next Gen brief!",
    3: "You've completed all steps! Great work!"
  };

  if (celebrationMessage) {
    celebrationMessage.textContent = messages[completedStep] || `You've completed Step ${completedStep}!`;
  }

  // Create confetti particles
  const confettiContainer = celebrationScreen.querySelector('.lovablesheet-celebration__confetti');
  if (confettiContainer) {
    confettiContainer.innerHTML = ''; // Clear existing confetti
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'lovablesheet-celebration__confetti-piece';
      confetti.style.cssText = `
        position: absolute;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        top: -20px;
        opacity: ${Math.random() * 0.5 + 0.5};
        animation: confetti-fall ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 0.5}s forwards;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      `;
      confettiContainer.appendChild(confetti);
    }
  }

  celebrationScreen.hidden = false;
  stepNavigationState.celebrationShown = true;
}

function hideCelebrationScreen() {
  const { celebrationScreen } = stepNavigationState.elements;

  if (!celebrationScreen) return;

  celebrationScreen.hidden = true;
  stepNavigationState.celebrationShown = false;
}

function goToNextStep() {
  const { currentStep, totalSteps } = stepNavigationState;

  hideCelebrationScreen();

  if (currentStep < totalSteps) {
    showStep(currentStep + 1);
  }
}

function initializeStepNavigation() {
  const { celebrationNextButton, celebrationScreen, stages } = stepNavigationState.elements;

  stepNavigationState.currentStep = 1;
  updateStageStatuses(stepNavigationState.currentStep);
  updateProgressDots();

  // Set up celebration screen button
  if (celebrationNextButton) {
    celebrationNextButton.addEventListener('click', goToNextStep);
  }

  // Close celebration on overlay click
  if (celebrationScreen) {
    const overlay = celebrationScreen.querySelector('.lovablesheet-celebration__overlay');
    if (overlay) {
      overlay.addEventListener('click', goToNextStep);
    }
  }

  // Monitor step 1 completion (when a product is selected)
  const existingUpdateIdeaStageUI =
    (typeof window !== "undefined" && typeof window.updateIdeaStageUI === "function"
      ? window.updateIdeaStageUI
      : null) ||
    (typeof updateIdeaStageUI === "function" ? updateIdeaStageUI : null);
  let step1CompletionDetected = false;

  const checkStep1Completion = () => {
    const hasSelection = ideaStageState.selectedProduct.trim().length > 0;
    if (hasSelection && !step1CompletionDetected && stepNavigationState.currentStep === 1) {
      step1CompletionDetected = true;
      setTimeout(() => {
        showCelebrationScreen(1);
      }, 800);
    } else if (!hasSelection) {
      step1CompletionDetected = false;
    }
  };

  // Wrap the updateIdeaStageUI function to detect completion
  if (existingUpdateIdeaStageUI) {
    const originalFunc = existingUpdateIdeaStageUI;
    window.updateIdeaStageUI = function(...args) {
      const result = originalFunc.apply(this, args);
      checkStep1Completion();
      return result;
    };
  }

  // Monitor step 2 completion (when a Next Gen brief is created)
  let step2CompletionDetected = false;

  const checkStep2Completion = () => {
    const briefs = Array.isArray(nextGenState.savedBriefs) ? nextGenState.savedBriefs : [];
    const hasBriefs = briefs.length > 0;

    if (hasBriefs && !step2CompletionDetected && stepNavigationState.currentStep === 2) {
      step2CompletionDetected = true;
      setTimeout(() => {
        showCelebrationScreen(2);
      }, 800);
    } else if (!hasBriefs) {
      step2CompletionDetected = false;
    }
  };

  // Set up a mutation observer to watch for Next Gen brief changes
  const nextGenListEl = document.querySelector('[data-nextgen-list]');
  if (nextGenListEl) {
    const observer = new MutationObserver(() => {
      checkStep2Completion();
    });
    observer.observe(nextGenListEl, { childList: true, subtree: true });
  }
}

initializeStepNavigation();

// Brain Tools UI
const brainToolsState = {
  activeDialog: null,
  elements: {
    dialogLayer: document.querySelector('[data-brain-tool-dialog-layer]'),
    dialogOverlay: document.querySelector('[data-brain-tool-dialog-overlay]'),
    dialogs: {
      sticky: document.querySelector('[data-brain-tool-dialog="sticky"]'),
      flowchart: document.querySelector('[data-brain-tool-dialog="flowchart"]'),
      ipad: document.querySelector('[data-brain-tool-dialog="ipad"]')
    }
  }
};

function openBrainToolDialog(dialogType) {
  const { dialogLayer, dialogs } = brainToolsState.elements;
  
  if (!dialogLayer || !dialogs[dialogType]) {
    return;
  }
  
  // Close any open dialog first
  closeBrainToolDialog();
  
  brainToolsState.activeDialog = dialogType;
  dialogLayer.hidden = false;
  dialogs[dialogType].hidden = false;
  document.body.classList.add('lovablesheet-modal-open');
  
  // Focus the dialog
  window.requestAnimationFrame(() => {
    dialogs[dialogType].focus();
  });
}

function closeBrainToolDialog() {
  const { dialogLayer, dialogs } = brainToolsState.elements;
  
  if (!dialogLayer) {
    return;
  }
  
  dialogLayer.hidden = true;
  
  if (brainToolsState.activeDialog && dialogs[brainToolsState.activeDialog]) {
    dialogs[brainToolsState.activeDialog].hidden = true;
  }
  
  brainToolsState.activeDialog = null;
  document.body.classList.remove('lovablesheet-modal-open');
}

function initializeBrainTools() {
  const { dialogOverlay } = brainToolsState.elements;

  // Tool buttons
  document.querySelectorAll('[data-brain-tool-open]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialogType = button.dataset.brainToolOpen;
      openBrainToolDialog(dialogType);
    });
  });
  
  // Close buttons
  document.querySelectorAll('[data-brain-tool-dialog-close]').forEach((button) => {
    button.addEventListener('click', () => {
      closeBrainToolDialog();
    });
  });
  
  // Overlay click
  if (dialogOverlay) {
    dialogOverlay.addEventListener('click', () => {
      closeBrainToolDialog();
    });
  }
  
  // Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && brainToolsState.activeDialog) {
      event.preventDefault();
      closeBrainToolDialog();
    }
  });
  
  // Click outside to close actions
}

initializeDemoLab();
initializePromptCompanionEditor();
initializeFixedInfoDialog();
initializePromptChat();
initializeQuickActionsMenu();
initializeBrainTools();

async function init() {
  showSection("loading");

  if (!isSupabaseConfigured()) {
    handleUnauthorized("Supabase credentials are missing. Update supabase-config.js to enable admin access.");
    return;
  }

  supabaseClient = getSupabaseClient();

  try {
    console.log("LovableSheet: init - checking session");

    // Try to get session synchronously first
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
      console.error("Unable to load session for LovableSheet", error);
      handleUnauthorized("We couldn't verify your admin access. Please try signing in again.");
      return;
    }

    // If getSession() returns a session, use it. Otherwise wait briefly for auth rehydration.
    let user = data?.session?.user ?? null;

    if (!user) {
      console.log("LovableSheet: no session from getSession(); waiting up to 2000ms for onAuthStateChange...");
      user = await new Promise((resolve) => {
        let resolved = false;
        let listener = null;
        
        const cleanup = () => {
          if (listener?.subscription?.unsubscribe) {
            try {
              listener.subscription.unsubscribe();
            } catch (_) {}
          }
        };

        const timeout = setTimeout(() => {
          if (resolved) return;
          resolved = true;
          cleanup();
          console.log("LovableSheet: auth state wait timed out (no session).");
          resolve(null);
        }, 2000);

        // Subscribe to auth state changes and resolve early if a session arrives.
        const { data: listenerData } = supabaseClient.auth.onAuthStateChange((_event, session) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeout);
          cleanup();
          console.log("LovableSheet: onAuthStateChange delivered session:", session);
          resolve(session?.user ?? null);
        });
        
        listener = listenerData;
      });
    } else {
      console.log("LovableSheet: session found from getSession()", user);
    }

    // Show the correct state without forcing a redirect on the initial check.
    const hasAdminAccess = requireAdmin(user, { redirect: false });

    if (hasAdminAccess) {
      initializeStickyBoards();
      await fetchBoards();
    }

    // Subscribe to auth state changes to handle sign-out or role changes.
    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;

      if (!requireAdmin(currentUser)) {
        return;
      }

      // Re-initialize admin UI bits if necessary.
      initializeStickyBoards();
      fetchBoards();
    });

    authSubscription = listener?.subscription || null;
  } catch (err) {
    console.error("LovableSheet initialization failed:", err);
    handleUnauthorized("We couldn't verify your admin access. Please try signing in again.");
  }
}

init();

window.addEventListener("beforeunload", () => {
  authSubscription?.unsubscribe?.();
});
