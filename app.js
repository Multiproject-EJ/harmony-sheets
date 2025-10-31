/*****************************************************
 * Harmony Sheets — App.js v2.0
 *****************************************************/

const App = {};

App.createIcon = function(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${content}</svg>`;
};

App.LIFE_ICONS = {
  love: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="9.5" cy="10" r="3.2" />
      <circle cx="14.5" cy="10" r="3.2" />
      <path d="M6.2 13.8c1.5 2.7 3.5 4.8 5.8 6.4 2.3 -1.6 4.3 -3.7 5.8 -6.4" />
    </g>
  `),
  career: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M8 7V6a4 4 0 0 1 4-4 4 4 0 0 1 4 4v1" />
      <rect x="4" y="7" width="16" height="12" rx="2.5" />
      <path d="M4 12h16" />
      <path d="M12 11.7v2.6" />
    </g>
  `),
  health: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8.5v7" />
      <path d="M8.5 12h7" />
    </g>
  `),
  finances: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <ellipse cx="12" cy="8.5" rx="4.5" ry="2.5" />
      <path d="M7.5 8.5v7c0 1.5 2 2.5 4.5 2.5s4.5 -1 4.5 -2.5v-7" />
      <path d="M7.5 12c0 1.5 2 2.5 4.5 2.5s4.5 -1 4.5 -2.5" />
    </g>
  `),
  fun: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polygon points="12 4.5 14.1 9 19 9.6 15.6 12.7 16.7 17.4 12 14.9 7.3 17.4 8.4 12.7 5 9.6 9.9 9" />
    </g>
  `),
  family: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M4.5 18c0-2.2 1.8-4 4-4h7c2.2 0 4 1.8 4 4" />
      <circle cx="8.5" cy="10" r="3" />
      <circle cx="15.5" cy="11.5" r="2.5" />
    </g>
  `),
  environment: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M4.5 11.5L12 5l7.5 6.5" />
      <path d="M6.5 11.5v8h11v-8" />
      <path d="M11 19.5v-3.5h2v3.5" />
      <path d="M4 19.5h16" />
    </g>
  `),
  spirituality: App.createIcon(`
    <g
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 5V3" />
      <path d="M12 21v-2" />
      <path d="M5 12H3" />
      <path d="M21 12h-2" />
      <path d="M6.8 6.8L5.4 5.4" />
      <path d="M17.2 17.2L18.6 18.6" />
      <path d="M6.8 17.2L5.4 18.6" />
      <path d="M17.2 6.8L18.6 5.4" />
    </g>
  `)
};

App.LIFE_AREAS = {
  love: {
    title: "Love & Romantic Relationships",
    short: "Love",
    color: "#FF4D8D",
    icon: App.LIFE_ICONS.love,
    description: "Create rituals and check-ins that nurture meaningful partnerships.",
    link: "products.html?area=love",
    cta: "Explore relationship tools",
    empty: "We're crafting dedicated templates for Love & Romantic Relationships. In the meantime, explore all Life Harmony tools.",
    menuQuestion: "Craving more moments that feel close and connected?",
    menuHighlights: [
      "Daily affection rituals",
      "Meaningful check-in prompts",
      "Shared memory keepers"
    ]
  },
  career: {
    title: "Career, Growth & Learning",
    short: "Career",
    color: "#7B3FF2",
    icon: App.LIFE_ICONS.career,
    description: "Stay organized, track goals, and keep moving toward your next milestone.",
    link: "products.html?area=career",
    cta: "Stay on track with career tools",
    empty: "We're designing more templates for Career, Growth & Learning. Browse all tools while we build.",
    menuQuestion: "Trying to stay focused on what moves your career forward?",
    menuHighlights: [
      "Skill-building trackers",
      "Project milestone planners",
      "Weekly review rituals"
    ]
  },
  health: {
    title: "Health & Fitness",
    short: "Health",
    color: "#00B46E",
    icon: App.LIFE_ICONS.health,
    description: "Build calm routines for movement, rest, and mindful habits.",
    link: "products.html?area=health",
    cta: "See wellness templates",
    empty: "We're creating new wellness planners for this area. Explore all Life Harmony tools to get started.",
    menuQuestion: "Wish your wellness routine felt consistent and kind?",
    menuHighlights: [
      "Gentle habit loops",
      "Meal & movement maps",
      "Rest and recovery check-ins"
    ]
  },
  finances: {
    title: "Finances",
    short: "Finances",
    color: "#FFB800",
    icon: App.LIFE_ICONS.finances,
    description: "See your money clearly and plan budgets that match your values.",
    link: "products.html?area=finances",
    cta: "Review finance planners",
    empty: "More money clarity tools are coming soon. Until then, browse the full collection.",
    menuQuestion: "Always uncertain about how much you have left each month?",
    menuHighlights: [
      "Clarity-first budget templates",
      "Monthly cash-flow snapshots",
      "Savings goal scorecards"
    ]
  },
  fun: {
    title: "Fun & Recreation",
    short: "Fun",
    color: "#FF6B2C",
    icon: App.LIFE_ICONS.fun,
    description: "Plan adventures, hobbies, and creative breaks that refill your energy.",
    link: "products.html?area=fun",
    cta: "Find fun & recreation ideas",
    empty: "We're crafting playful planners for Fun & Recreation. Explore all tools while we finish them.",
    menuQuestion: "Need a nudge to plan joy between the busy weeks?",
    menuHighlights: [
      "Weekend adventure planners",
      "Creative hobby dashboards",
      "Memory-making bucket lists"
    ]
  },
  family: {
    title: "Family & Friends",
    short: "Family",
    color: "#1A7CFF",
    icon: App.LIFE_ICONS.family,
    description: "Coordinate family schedules and stay connected with the people who matter most.",
    link: "products.html?area=family",
    cta: "Coordinate with family tools",
    empty: "We're building new ways to support Family & Friends. Browse all tools to see what's ready now.",
    menuQuestion: "Want everyone's schedules to finally sync up?",
    menuHighlights: [
      "Shared family agendas",
      "Celebration planning notes",
      "Connection ritual ideas"
    ]
  },
  environment: {
    title: "Living Space",
    short: "Living Space",
    color: "#00B8A0",
    icon: App.LIFE_ICONS.environment,
    description: "Design supportive spaces, tidy routines, and home projects with clarity.",
    link: "products.html?area=environment",
    cta: "Design your ideal space",
    empty: "Fresh templates for your living space are on the way. Check out the full library in the meantime.",
    menuQuestion: "Ready to refresh the spaces you spend the most time in?",
    menuHighlights: [
      "Room reset routines",
      "Seasonal declutter checklists",
      "Home project planners"
    ]
  },
  spirituality: {
    title: "Spirituality & Community",
    short: "Spirituality",
    color: "#4554FF",
    icon: App.LIFE_ICONS.spirituality,
    description: "Cultivate reflection, service, and community practices that ground you.",
    link: "products.html?area=spirituality",
    cta: "Discover community & reflection tools",
    empty: "We're preparing new resources for Spirituality & Community. Explore all tools while we build.",
    menuQuestion: "Longing for a rhythm that keeps you grounded and giving?",
    menuHighlights: [
      "Mindful reflection journals",
      "Community service trackers",
      "Gratitude & intention prompts"
    ]
  }
};

/*****************************************************
 * Hero headline rotation (index)
 *****************************************************/
App.HERO_ROTATIONS = [
  {
    text: "Create Harmony in Your Life",
    color: "#6366F1",
    animation: "glide",
    illustration: "assets/imgIndex1.webp",
    illustrationAlt: "Preview of Harmony Sheets templates displayed on multiple devices"
  },
  {
    text: "From Chaos to Clarity",
    color: "#14B8A6",
    animation: "wave",
    illustration: "assets/imgIndex2.webp",
    illustrationAlt: "Close-up of Harmony Sheets dashboards highlighting clarity tools"
  },
  {
    text: "Your Personal Life Toolkit",
    color: "#2563EB",
    animation: "glide",
    illustration: "assets/imgIndex1.webp",
    illustrationAlt: "Preview of Harmony Sheets templates displayed on multiple devices"
  },
  {
    text: "Easy Life Hack Tools",
    color: "#0EA5E9",
    animation: "wave",
    illustration: "assets/imgIndex2.webp",
    illustrationAlt: "Close-up of Harmony Sheets dashboards highlighting clarity tools"
  },
  {
    text: "Clever Tools. Simple Life.",
    color: "#F97316",
    animation: "glide",
    illustration: "assets/hero-line-balance.svg",
    illustrationAlt: "Line art scales balancing sun and moon shapes"
  },
  {
    text: "Life Made Simple with Tools",
    color: "#2563EB",
    animation: "wave",
    illustration: "assets/imgIndex1.webp",
    illustrationAlt: "Preview of Harmony Sheets templates displayed on multiple devices"
  },
  {
    text: "Freedom Tools for Everyday Wins",
    color: "#0EA5E9",
    animation: "glide",
    illustration: "assets/imgIndex2.webp",
    illustrationAlt: "Close-up of Harmony Sheets dashboards highlighting clarity tools"
  },
  {
    text: "Tools for Ambitious Doers",
    color: "#F97316",
    animation: "wave",
    illustration: "assets/hero-line-balance.svg",
    illustrationAlt: "Line art scales balancing sun and moon shapes"
  },
  {
    text: "Power Up Your Life Plan",
    color: "#6366F1",
    animation: "glide",
    illustration: "assets/imgIndex1.webp",
    illustrationAlt: "Preview of Harmony Sheets templates displayed on multiple devices"
  },
  {
    text: "Design Your Future with Smart Tools",
    color: "#14B8A6",
    animation: "wave",
    illustration: "assets/imgIndex2.webp",
    illustrationAlt: "Close-up of Harmony Sheets dashboards highlighting clarity tools"
  },
  {
    text: "Creative Solutions. Simple Tools.",
    color: "#0EA5E9",
    animation: "glide",
    illustration: "assets/hero-line-balance.svg",
    illustrationAlt: "Line art scales balancing sun and moon shapes"
  }
];

App.initHeroRotation = function() {
  const target = App.qs("[data-hero-rotate]");
  if (!target || target.dataset.heroRotationInit === "true") return;

  target.dataset.heroRotationInit = "true";
  target.setAttribute("aria-live", "polite");

  const illustration = App.qs("[data-hero-illustration]");
  const defaultIllustrationSrc = illustration ? illustration.getAttribute("src") || "" : "";
  const defaultIllustrationAlt = illustration ? illustration.getAttribute("alt") || "" : "";

  const phrases = Array.isArray(App.HERO_ROTATIONS)
    ? App.HERO_ROTATIONS.filter(item => item && item.text)
    : [];
  if (!phrases.length) return;

  const animationClasses = ["is-wave", "is-glide"];

  const getAnimationClass = phrase => {
    switch (phrase && phrase.animation) {
      case "glide":
        return "is-glide";
      case "flip":
        return "is-flip";
      case "wave":
        return "is-wave";
      default:
        return "";
    }
  };

  const renderHeroText = text => {
    const value = typeof text === "string" ? text.trim() : "";
    if (!value) {
      target.textContent = "";
      return;
    }

    const words = value.split(/\s+/);
    const accentCount = words.length > 1 ? Math.min(2, words.length) : 1;
    const leadWords = words.slice(0, words.length - accentCount).join(" ");
    const accentWords = words.slice(-accentCount).join(" ");

    if (leadWords) {
      const lead = document.createElement("span");
      lead.className = "hero-heading__lead";
      lead.textContent = leadWords;
      target.appendChild(lead);
    }

    if (accentWords) {
      if (leadWords) {
        target.appendChild(document.createTextNode(" "));
      }
      const accent = document.createElement("span");
      accent.className = "hero-heading__accent";
      accent.textContent = accentWords;
      target.appendChild(accent);
    }
  };

  const createFlipSpan = (nextText, previousText = "") => {
    const group = document.createElement("span");
    group.className = "hero-flip-line";
    group.setAttribute("aria-hidden", "true");

    const srText = document.createElement("span");
    srText.className = "sr-only";
    srText.textContent = nextText;

    const maxLength = Math.max(nextText.length, previousText.length);
    let flipIndex = 0;

    const toDisplayChar = char => (char === " " ? "\u00A0" : char || "");

    let currentWord = null;
    const ensureWord = () => {
      if (!currentWord) {
        currentWord = document.createElement("span");
        currentWord.className = "hero-flip-word";
      }
      return currentWord;
    };

    const commitWord = () => {
      if (currentWord && currentWord.childNodes.length) {
        group.appendChild(currentWord);
      }
      currentWord = null;
    };

    const appendSpace = () => {
      const spacer = document.createElement("span");
      spacer.className = "hero-letter hero-letter--space";
      spacer.textContent = " ";
      group.appendChild(spacer);
    };

    for (let i = 0; i < maxLength; i += 1) {
      const newChar = nextText[i] ?? "";
      const oldChar = previousText[i] ?? "";

      if (!newChar && !oldChar) {
        continue;
      }

      const newIsSpace = newChar === " ";
      const oldIsSpace = oldChar === " ";

      if (newIsSpace && oldIsSpace) {
        commitWord();
        appendSpace();
        continue;
      }

      if (newChar === oldChar && newChar !== "") {
        const same = document.createElement("span");
        same.className = "hero-letter hero-letter--same";
        same.textContent = toDisplayChar(newChar);
        same.style.animationDelay = `${i * 0.035}s`;
        ensureWord().appendChild(same);
        continue;
      }

      const letter = document.createElement("span");
      letter.className = "hero-letter hero-letter--flip";
      if (newIsSpace || oldIsSpace || (!newChar && !oldChar)) {
        letter.classList.add("hero-letter--space");
      }

      const faces = document.createElement("span");
      faces.className = "hero-letter__faces";
      faces.style.animationDelay = `${flipIndex * 0.08}s`;

      const front = document.createElement("span");
      front.className = "hero-letter__face hero-letter__face--front";
      const displayOld = oldChar || (!oldIsSpace && newChar) || "";
      front.textContent = toDisplayChar(displayOld);
      if (!oldChar || oldIsSpace) {
        front.classList.add("hero-letter__face--blank");
      }

      const back = document.createElement("span");
      back.className = "hero-letter__face hero-letter__face--back";
      back.textContent = toDisplayChar(newChar);
      if (!newChar || newIsSpace) {
        back.classList.add("hero-letter__face--blank");
      }

      faces.appendChild(front);
      faces.appendChild(back);
      letter.appendChild(faces);
      ensureWord().appendChild(letter);

      flipIndex += 1;

      if (newIsSpace) {
        commitWord();
        appendSpace();
      }
    }

    commitWord();
    target.appendChild(group);
    target.appendChild(srText);
  };

  const updateIllustration = phrase => {
    if (!illustration) return;

    const nextSrc =
      phrase && phrase.illustration ? phrase.illustration : defaultIllustrationSrc;
    const hasCustomAlt =
      phrase && Object.prototype.hasOwnProperty.call(phrase, "illustrationAlt");
    const nextAlt = hasCustomAlt ? phrase.illustrationAlt || "" : defaultIllustrationAlt;

    const setAltIfNeeded = () => {
      if (illustration.getAttribute("alt") !== nextAlt) {
        illustration.setAttribute("alt", nextAlt);
      }
    };

    if (!nextSrc || illustration.getAttribute("src") === nextSrc) {
      setAltIfNeeded();
      return;
    }

    const handleLoad = () => {
      illustration.removeEventListener("load", handleLoad);
      setAltIfNeeded();
      window.requestAnimationFrame(() => {
        illustration.classList.remove("is-fading");
      });
    };

    const handleTransitionEnd = event => {
      if (event.target !== illustration || event.propertyName !== "opacity") {
        return;
      }

      illustration.removeEventListener("transitionend", handleTransitionEnd);
      illustration.addEventListener("load", handleLoad);
      illustration.setAttribute("src", nextSrc);

      if (illustration.complete && illustration.naturalWidth !== 0) {
        handleLoad();
      }
    };

    illustration.addEventListener("transitionend", handleTransitionEnd);
    window.requestAnimationFrame(() => {
      illustration.classList.add("is-fading");
    });
  };

  const applyPhrase = (phrase, previousPhrase) => {
    target.innerHTML = "";
    target.dataset.text = phrase.text;
    target.setAttribute("aria-label", phrase.text);
    updateIllustration(phrase);

    if (phrase.animation === "flip") {
      createFlipSpan(phrase.text, previousPhrase ? previousPhrase.text : "");
    } else {
      renderHeroText(phrase.text);
    }
  };

  const triggerAnimation = phrase => {
    const animationClass = getAnimationClass(phrase);
    animationClasses.forEach(cls => target.classList.remove(cls));

    if (!animationClass) return;

    void target.offsetWidth;
    target.classList.add(animationClass);
  };

  let previousPhrase = null;
  applyPhrase(phrases[0], previousPhrase);
  previousPhrase = phrases[0];

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  triggerAnimation(phrases[0]);

  if (phrases.length === 1) return;

  let index = 0;
  const intervalDuration = 5200;

  window.setInterval(() => {
    index = (index + 1) % phrases.length;
    const nextPhrase = phrases[index];
    applyPhrase(nextPhrase, previousPhrase);
    triggerAnimation(nextPhrase);
    previousPhrase = nextPhrase;
  }, intervalDuration);
};

App.NAV_PRODUCT_META = {
  pomodoro: {
    type: "Focus System",
    format: "Web App + Sheets",
    badge: "New",
    image: "assets/Pomodoro1.webp",
    previewImages: [
      "assets/Pomodoro1.webp",
      "assets/imgStudyPlanner1.webp",
      "assets/imgSubscriptions1.webp"
    ]
  },
  "budget-dashboard": {
    type: "Finance Dashboard",
    format: "Sheets",
    badge: "Best-Seller",
    previewImages: [
      "assets/imgBudgetPro1.webp",
      "assets/imgSavings1.webp",
      "assets/imgSubscriptions1.webp"
    ]
  },
  "pomodoro-pro": {
    type: "Focus System",
    format: "Web App + Sheets",
    badge: "Popular",
    image: "assets/Pomodoro1.webp",
    previewImages: [
      "assets/Pomodoro1.webp",
      "assets/imgStudyPlanner1.webp",
      "assets/imgSubscriptions1.webp"
    ]
  }
};

App.NAV_AREA_EXTRAS = {
  love: [
    { id: "love-couples-connection", name: "Couples Connection Journal", type: "Journal", format: "PDF", badge: "Popular", price: 19 },
    { id: "love-daily-ritual", name: "Daily Ritual Prompts", type: "Cards", format: "Printable", badge: "", price: 12 },
    { id: "love-memory-keeper", name: "Shared Memory Keeper", type: "Template", format: "Sheets", badge: "Best-Seller", price: 24 },
    { id: "love-date-night", name: "Date Night Generator", type: "Tool", format: "Web App", badge: "New", price: 9 },
    { id: "love-goals", name: "Love Goals Planner", type: "Planner", format: "Sheets", badge: "", price: 14 }
  ],
  career: [
    { id: "career-skill-tracker", name: "Skill Tracker Pro", type: "Tracker", format: "Sheets", badge: "", price: 18 },
    { id: "career-milestone", name: "Milestone Planner", type: "Planner", format: "Sheets", badge: "", price: 16 },
    { id: "career-reflection", name: "Weekly Reflection Guide", type: "Guide", format: "PDF", badge: "New", price: 11 },
    { id: "career-portfolio", name: "Portfolio Projects Board", type: "Board", format: "Sheets", badge: "", price: 15 },
    { id: "career-sprints", name: "Learning Sprints", type: "System", format: "Notion", badge: "", price: 17 }
  ],
  health: [
    { id: "health-habit-loop", name: "Habit Loop Tracker", type: "Tracker", format: "Sheets", badge: "", price: 14 },
    { id: "health-meal-movement", name: "Meal & Movement Planner", type: "Planner", format: "Sheets", badge: "Popular", price: 19 },
    { id: "health-recovery", name: "Recovery Journal", type: "Journal", format: "PDF", badge: "", price: 9 },
    { id: "health-sleep", name: "Sleep Routine Builder", type: "Template", format: "Sheets", badge: "", price: 12 }
  ],
  finances: [
    { id: "finance-budget", name: "Budget Blueprint", type: "Budget", format: "Sheets", badge: "Best-Seller", price: 29 },
    { id: "finance-cashflow", name: "Cash-Flow Dashboard", type: "Dashboard", format: "Sheets", badge: "", price: 24 },
    { id: "finance-savings", name: "Savings Scorecard", type: "Tracker", format: "Sheets", badge: "", price: 12 },
    { id: "finance-debt", name: "Debt Snowball Coach", type: "Template", format: "Sheets", badge: "", price: 15 },
    { id: "finance-investing", name: "Investing Starter Pack", type: "Guide", format: "PDF", badge: "", price: 19 }
  ],
  fun: [
    { id: "fun-weekend", name: "Weekend Adventure Planner", type: "Planner", format: "PDF", badge: "", price: 9 },
    { id: "fun-hobby", name: "Creative Hobby Dashboard", type: "Dashboard", format: "Sheets", badge: "", price: 12 },
    { id: "fun-bucket", name: "Bucket List Builder", type: "Template", format: "Sheets", badge: "", price: 8 }
  ],
  family: [
    { id: "family-agenda", name: "Shared Family Agenda", type: "Planner", format: "Sheets", badge: "", price: 12 },
    { id: "family-celebration", name: "Celebration Planner", type: "Planner", format: "PDF", badge: "", price: 8 },
    { id: "family-rituals", name: "Connection Rituals", type: "Ideas", format: "PDF", badge: "", price: 6 }
  ],
  environment: [
    { id: "environment-room-reset", name: "Room Reset Routine", type: "Checklist", format: "PDF", badge: "", price: 6 },
    { id: "environment-declutter", name: "Seasonal Declutter List", type: "Checklist", format: "PDF", badge: "", price: 7 },
    { id: "environment-home-project", name: "Home Project Planner", type: "Planner", format: "Sheets", badge: "", price: 13 }
  ],
  spirituality: [
    { id: "spirit-reflection", name: "Mindful Reflection Journal", type: "Journal", format: "PDF", badge: "", price: 9 },
    { id: "spirit-service", name: "Community Service Tracker", type: "Tracker", format: "Sheets", badge: "", price: 7 },
    { id: "spirit-gratitude", name: "Gratitude & Intention Log", type: "Journal", format: "PDF", badge: "", price: 6 }
  ]
};

/*****************************************************
 * Utils
 *****************************************************/
App.qs = sel => document.querySelector(sel);
App.qsa = sel => Array.from(document.querySelectorAll(sel));

App.CONSTRUCTION_STORAGE_KEY = "harmonySheets:constructionDismissed";

App.hexToRgba = function(hex, alpha = 1) {
  if (!hex) return "";
  let value = hex.replace("#", "");
  if (value.length === 3) {
    value = value
      .split("")
      .map(ch => ch + ch)
      .join("");
  }
  const int = parseInt(value, 16);
  if (Number.isNaN(int)) return "";
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

App.escapeHtml = function(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

App.formatDebugValue = function(value) {
  if (value === null) return "null";
  if (typeof value === "undefined") return "undefined";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Error) {
    const base = value.message ? `${value.name || "Error"}: ${value.message}` : value.toString();
    return value.stack || base;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch (err) {
    try {
      return String(value);
    } catch (fallbackErr) {
      return "[unserializable value]";
    }
  }
};

App.slugify = function(value) {
  if (!value) return "";
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

App.getProductHeroImage = function(product) {
  if (!product) return "";
  if (typeof product.heroImage === "string" && product.heroImage.trim()) {
    return product.heroImage.trim();
  }
  if (Array.isArray(product.gallery)) {
    const firstImage = product.gallery.find(item => item && item.src);
    if (firstImage && typeof firstImage.src === "string" && firstImage.src.trim()) {
      return firstImage.src.trim();
    }
  }
  return "";
};

App.parallaxItems = [];
App.parallaxListener = null;
App.parallaxRaf = 0;

App.updateParallax = function() {
  if (!Array.isArray(App.parallaxItems) || !App.parallaxItems.length) {
    if (App.parallaxListener) {
      window.removeEventListener("scroll", App.parallaxListener);
      window.removeEventListener("resize", App.parallaxListener);
      App.parallaxListener = null;
    }
    return;
  }

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  App.parallaxItems = App.parallaxItems.filter(item => item && item.el && document.body.contains(item.el));

  if (!App.parallaxItems.length) {
    if (App.parallaxListener) {
      window.removeEventListener("scroll", App.parallaxListener);
      window.removeEventListener("resize", App.parallaxListener);
      App.parallaxListener = null;
    }
    return;
  }

  const viewportCenter = viewportHeight / 2;
  App.parallaxItems.forEach(item => {
    const { el, speed } = item;
    const rect = el.getBoundingClientRect();
    const elementCenter = rect.top + rect.height / 2;
    const distance = viewportCenter - elementCenter;
    const offset = distance * speed;
    el.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
};

App.scheduleParallax = function() {
  if (App.parallaxRaf) cancelAnimationFrame(App.parallaxRaf);
  App.parallaxRaf = requestAnimationFrame(App.updateParallax);
};

App.registerParallax = function(el, speed = 0.25) {
  if (!el) return;
  const parsedSpeed = Number.isFinite(parseFloat(speed)) ? parseFloat(speed) : 0.25;
  const existing = App.parallaxItems.find(item => item.el === el);
  if (existing) {
    existing.speed = parsedSpeed;
  } else {
    App.parallaxItems.push({ el, speed: parsedSpeed });
  }

  if (!App.parallaxListener) {
    App.parallaxListener = () => App.scheduleParallax();
    window.addEventListener("scroll", App.parallaxListener, { passive: true });
    window.addEventListener("resize", App.parallaxListener);
  }

  App.scheduleParallax();
};

App.productsPromise = null;

App.normalizeDraftFlag = function(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    return ["true", "1", "yes", "y", "t", "on", "draft", "inactive", "disabled", "hidden", "archived"].includes(normalized);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return false;
    return value !== 0;
  }
  return Boolean(value);
};

App.normalizeProduct = function(product) {
  if (!product || typeof product !== "object") return product;

  const normalized = { ...product };
  const status = typeof normalized.status === "string" ? normalized.status.trim().toLowerCase() : "";

  let draft = false;
  if (status && ["draft", "inactive", "disabled", "hidden", "archived"].includes(status)) {
    draft = true;
  }

  if (Object.prototype.hasOwnProperty.call(normalized, "draft")) {
    draft = draft || App.normalizeDraftFlag(normalized.draft);
  } else if (Object.prototype.hasOwnProperty.call(normalized, "inactive")) {
    draft = draft || App.normalizeDraftFlag(normalized.inactive);
    delete normalized.inactive;
  }

  normalized.draft = Boolean(draft);
  return normalized;
};

App.isProductActive = function(product) {
  if (!product || typeof product !== "object") return false;
  const normalized = App.normalizeProduct(product);
  return normalized ? !normalized.draft : false;
};

App.filterActiveProducts = function(products) {
  if (!Array.isArray(products)) return [];
  return products
    .map(item => App.normalizeProduct(item))
    .filter(item => item && !item.draft);
};

App.normalizeBundle = function(bundle) {
  if (!bundle || typeof bundle !== "object") return bundle;

  const normalized = { ...bundle };

  const coerceText = value => (typeof value === "string" ? value.trim() : "");
  const coerceFlag = value => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return Number.isFinite(value) && value !== 0;
    if (typeof value === "string") {
      const normalizedValue = value.trim().toLowerCase();
      if (!normalizedValue) return false;
      return ["true", "1", "yes", "y", "on", "featured", "menu", "primary"].includes(normalizedValue);
    }
    if (value == null) return false;
    return Boolean(value);
  };

  const slug = coerceText(normalized.slug) || coerceText(normalized.id);
  if (slug) {
    normalized.slug = slug;
  }

  const status = coerceText(normalized.status).toLowerCase();
  let draft = Boolean(status && ["draft", "inactive", "disabled", "hidden", "archived", "unlisted", "private"].includes(status));
  if (Object.prototype.hasOwnProperty.call(normalized, "draft")) {
    draft = App.normalizeDraftFlag(normalized.draft);
  } else if (Object.prototype.hasOwnProperty.call(normalized, "active")) {
    draft = !coerceFlag(normalized.active);
    delete normalized.active;
  }
  normalized.draft = Boolean(draft);

  let navFeatured = null;
  if (Object.prototype.hasOwnProperty.call(normalized, "navFeatured")) {
    navFeatured = coerceFlag(normalized.navFeatured);
  }

  const altFeatureKeys = ["nav_featured", "featured", "featuredInNav", "menuFeatured", "menu_featured"];
  altFeatureKeys.forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(normalized, key)) return;
    const flag = coerceFlag(normalized[key]);
    if (navFeatured === null) {
      navFeatured = flag;
    } else if (!Object.prototype.hasOwnProperty.call(normalized, "navFeatured")) {
      navFeatured = navFeatured || flag;
    }
    delete normalized[key];
  });

  normalized.navFeatured = Boolean(navFeatured);

  const toStringList = value => {
    if (Array.isArray(value)) {
      return value
        .map(entry => coerceText(entry))
        .filter(Boolean);
    }
    const text = coerceText(value);
    if (!text) return [];
    return text
      .split(/[\n,]/)
      .map(entry => entry.trim())
      .filter(Boolean);
  };

  const productSources = [
    normalized.products,
    normalized.productIds,
    normalized.product_ids,
    normalized.productSlugs,
    normalized.product_slugs
  ];
  normalized.products = [];
  productSources.forEach(source => {
    toStringList(source).forEach(item => {
      if (!normalized.products.includes(item)) {
        normalized.products.push(item);
      }
    });
  });

  const includeSources = [normalized.includes, normalized.items, normalized.bundleItems];
  normalized.includes = [];
  includeSources.forEach(source => {
    toStringList(source).forEach(item => {
      if (!normalized.includes.includes(item)) {
        normalized.includes.push(item);
      }
    });
  });

  return normalized;
};

App.isBundleActive = function(bundle) {
  if (!bundle || typeof bundle !== "object") return false;
  const normalized = App.normalizeBundle(bundle);
  return normalized ? !normalized.draft : false;
};

App.filterActiveBundles = function(bundles) {
  if (!Array.isArray(bundles)) return [];
  return bundles
    .map(item => App.normalizeBundle(item))
    .filter(item => item && !item.draft);
};

App.supabaseConfigCache = undefined;
App.supabaseStatusCache = null;
App.supabaseStatusPromise = null;
App.supabaseProductsCache = null;
App.supabaseBundlesCache = null;
App.supabaseBundlesPromise = null;
App.supabaseProductsPromise = null;

App.getSupabaseConfig = function() {
  if (App.supabaseConfigCache !== undefined) {
    return App.supabaseConfigCache;
  }

  const FALLBACK_URL = "https://jvjmmzbibpnlzhzzyncx.supabase.co";
  const FALLBACK_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2am1temJpYnBubHpoenp5bmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjYyMzksImV4cCI6MjA3NjEwMjIzOX0.JyaY7kJbbZKKBCj_UX6M-t-eKoK9WJibcJjlLZnSvWA";

  const safeGet = (object, ...keys) =>
    keys.reduce((value, key) => {
      if (value && typeof value === "object" && key in value) {
        return value[key];
      }
      return undefined;
    }, object);

  const readFromMeta = name => {
    if (typeof document === "undefined") return undefined;
    const element = document.querySelector(`meta[name="${name}"]`);
    return element?.content;
  };

  const readConfigValue = ({ direct, env, meta, fallback }) => {
    const sources = [direct, env, meta, fallback];
    for (const value of sources) {
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
    return undefined;
  };

  const globalConfig =
    safeGet(globalThis, "HarmonySheetsSupabase") ??
    safeGet(globalThis, "harmonySheetsSupabase") ??
    safeGet(globalThis, "SUPABASE_CONFIG") ??
    safeGet(globalThis, "env") ??
    safeGet(globalThis, "__env") ??
    {};

  const url = readConfigValue({
    direct:
      safeGet(globalThis, "SUPABASE_URL") ??
      safeGet(globalThis, "Supabase", "url") ??
      safeGet(globalThis, "HarmonySheetsSupabase", "url") ??
      safeGet(globalThis, "__SUPABASE__", "url") ??
      safeGet(globalConfig, "SUPABASE_URL") ??
      safeGet(globalConfig, "supabaseUrl"),
    env:
      safeGet(globalThis, "process", "env", "SUPABASE_URL") ??
      safeGet(globalThis, "process", "env", "VITE_SUPABASE_URL") ??
      safeGet(globalThis, "process", "env", "PUBLIC_SUPABASE_URL"),
    meta: readFromMeta("supabase-url") ?? readFromMeta("harmony-sheets-supabase-url"),
    fallback: FALLBACK_URL
  });

  const anonKey = readConfigValue({
    direct:
      safeGet(globalThis, "SUPABASE_ANON_KEY") ??
      safeGet(globalThis, "Supabase", "anonKey") ??
      safeGet(globalThis, "HarmonySheetsSupabase", "anonKey") ??
      safeGet(globalThis, "__SUPABASE__", "anonKey") ??
      safeGet(globalConfig, "SUPABASE_ANON_KEY") ??
      safeGet(globalConfig, "supabaseAnonKey"),
    env:
      safeGet(globalThis, "process", "env", "SUPABASE_ANON_KEY") ??
      safeGet(globalThis, "process", "env", "VITE_SUPABASE_ANON_KEY") ??
      safeGet(globalThis, "process", "env", "PUBLIC_SUPABASE_ANON_KEY"),
    meta: readFromMeta("supabase-anon-key") ?? readFromMeta("harmony-sheets-supabase-anon-key"),
    fallback: FALLBACK_ANON_KEY
  });

  const isValidUrl = typeof url === "string" && url.startsWith("http");
  const isValidKey = typeof anonKey === "string" && anonKey.length > 20 && !anonKey.includes("YOUR_SUPABASE");

  App.supabaseConfigCache = isValidUrl && isValidKey ? { url, anonKey } : null;
  return App.supabaseConfigCache;
};

App.fetchSupabaseProductStatuses = function() {
  const config = App.getSupabaseConfig();
  if (!config) {
    return Promise.resolve(null);
  }

  if (App.supabaseStatusCache) {
    return Promise.resolve(App.supabaseStatusCache);
  }

  if (App.supabaseStatusPromise) {
    return App.supabaseStatusPromise;
  }

  const { url, anonKey } = config;
  const endpointBase = typeof url === "string" ? url.replace(/\/?$/, "") : "";
  const endpoint = `${endpointBase}/rest/v1/products?select=slug,id,draft`;

  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    Accept: "application/json",
    "Content-Type": "application/json"
  };

  App.supabaseStatusPromise = fetch(endpoint, {
    headers,
    mode: "cors",
    cache: "no-store"
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Supabase responded with ${response.status}`);
      }
      return response.json();
    })
    .then(rows => {
      if (!Array.isArray(rows) || !rows.length) {
        App.supabaseStatusCache = new Map();
        return App.supabaseStatusCache;
      }

      const map = new Map();
      rows.forEach(row => {
        if (!row || typeof row !== "object") return;
        const keys = [];
        if (typeof row.slug === "string" && row.slug.trim()) keys.push(row.slug.trim());
        if (typeof row.id === "string" && row.id.trim()) keys.push(row.id.trim());
        if (!keys.length) return;
        const draft = App.normalizeDraftFlag ? App.normalizeDraftFlag(row.draft) : Boolean(row.draft);
        keys.forEach(key => {
          map.set(key, draft);
        });
      });

      App.supabaseStatusCache = map;
      return App.supabaseStatusCache;
    })
    .catch(error => {
      console.warn("[App] Failed to load Supabase product statuses", error);
      return null;
    })
    .finally(() => {
      App.supabaseStatusPromise = null;
    });

  return App.supabaseStatusPromise;
};

App.applySupabaseDraftOverrides = function(products, overrides) {
  if (!Array.isArray(products) || !overrides) return products;

  products.forEach(product => {
    if (!product || typeof product !== "object") return;
    const keys = [];
    if (typeof product.id === "string" && product.id.trim()) keys.push(product.id.trim());
    if (typeof product.slug === "string" && product.slug.trim()) keys.push(product.slug.trim());

    for (const key of keys) {
      if (overrides.has(key)) {
        const override = overrides.get(key);
        product.draft = App.normalizeDraftFlag ? App.normalizeDraftFlag(override) : Boolean(override);
        break;
      }
    }
  });

  return products;
};

App.fetchSupabaseProducts = function() {
  const config = App.getSupabaseConfig();
  if (!config) {
    return Promise.resolve(null);
  }

  if (Array.isArray(App.supabaseProductsCache)) {
    return Promise.resolve(App.supabaseProductsCache);
  }

  if (App.supabaseProductsPromise) {
    return App.supabaseProductsPromise;
  }

  const { url, anonKey } = config;
  const endpointBase = typeof url === "string" ? url.replace(/\/?$/, "") : "";
  const select = [
    "id",
    "slug",
    "name",
    "tagline",
    "description",
    "price_amount",
    "price_currency",
    "price_display",
    "draft",
    "hero_image",
    "color_image",
    "color_caption",
    "demo_video",
    "demo_poster",
    "virtual_demo",
    "pricing_title",
    "pricing_sub",
    "stripe_url",
    "etsy_url",
    "product_social_proof(*)",
    "product_life_areas(*)",
    "product_badges(*)",
    "product_features(*)",
    "product_gallery(*)",
    "product_included_items(*)",
    "product_faqs(*)",
    "product_benefits(*)"
  ].join(",");
  const endpoint = `${endpointBase}/rest/v1/products?select=${encodeURIComponent(select)}&order=created_at.asc`;

  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    Accept: "application/json",
    "Content-Type": "application/json"
  };

  const toArray = value => (Array.isArray(value) ? value : value ? [value] : []);
  const getPosition = entry => {
    if (!entry || typeof entry !== "object") return Number.MAX_SAFE_INTEGER;
    const raw = entry.position;
    const num = typeof raw === "number" ? raw : parseFloat(raw);
    return Number.isFinite(num) ? num : Number.MAX_SAFE_INTEGER;
  };
  const sortByPosition = list => toArray(list).slice().sort((a, b) => getPosition(a) - getPosition(b));
  const toText = value => (typeof value === "string" ? value : "");
  const toTrimmed = value => (typeof value === "string" ? value.trim() : "");
  const buildPriceDisplay = row => {
    const display = toTrimmed(row.price_display);
    if (display) return display;
    const rawAmount = typeof row.price_amount === "number" ? row.price_amount : parseFloat(row.price_amount);
    if (Number.isFinite(rawAmount)) {
      if (typeof App.formatPrice === "function") {
        return App.formatPrice(rawAmount);
      }
      return `$${rawAmount.toFixed(2)}`;
    }
    return "";
  };

  App.supabaseProductsPromise = fetch(endpoint, {
    headers,
    mode: "cors",
    cache: "no-store"
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Supabase responded with ${response.status}`);
      }
      return response.json();
    })
    .then(rows => {
      if (!Array.isArray(rows)) {
        return null;
      }

      const products = rows
        .map(row => {
          if (!row || typeof row !== "object") return null;

          const slug = toTrimmed(row.slug) || toTrimmed(row.id);
          const priceAmount = typeof row.price_amount === "number" ? row.price_amount : parseFloat(row.price_amount);
          const priceCurrency = toTrimmed(row.price_currency);

          const lifeAreas = sortByPosition(row.product_life_areas)
            .map(item => toTrimmed(item.life_area || item.lifeArea))
            .filter(Boolean);

          const badges = sortByPosition(row.product_badges)
            .map(item => toTrimmed(item.badge))
            .filter(Boolean);

          const features = sortByPosition(row.product_features)
            .map(item => toTrimmed(item.feature))
            .filter(Boolean);

          const included = sortByPosition(row.product_included_items)
            .map(item => toTrimmed(item.included_item || item.item))
            .filter(Boolean);

          const gallery = sortByPosition(row.product_gallery)
            .map(item => {
              if (!item || typeof item !== "object") return null;
              const src = toTrimmed(item.image_src || item.src);
              if (!src) return null;
              const alt = toText(item.image_alt || item.alt || "");
              return { src, alt };
            })
            .filter(Boolean);

          const faqs = sortByPosition(row.product_faqs)
            .map(item => {
              if (!item || typeof item !== "object") return null;
              const question = toTrimmed(item.question || item.q);
              const answer = toText(item.answer || item.a);
              if (!question || !answer) return null;
              return { q: question, a: answer };
            })
            .filter(Boolean);

          const benefits = sortByPosition(row.product_benefits)
            .map(item => {
              if (!item || typeof item !== "object") return null;
              const title = toTrimmed(item.title);
              const description = toText(item.description || item.desc);
              if (!title || !description) return null;
              return { title, desc: description };
            })
            .filter(Boolean);

          const socialSource = row.product_social_proof;
          const socialRaw = Array.isArray(socialSource)
            ? socialSource.find(entry => entry && typeof entry === "object")
            : socialSource;
          const socialProof = socialRaw && typeof socialRaw === "object"
            ? {
                stars: toTrimmed(socialRaw.stars),
                quote: toText(socialRaw.quote)
              }
            : null;

          const product = {
            id: slug || toTrimmed(row.id) || undefined,
            slug: slug || undefined,
            name: toTrimmed(row.name) || slug || "",
            tagline: toTrimmed(row.tagline),
            description: toText(row.description),
            price: buildPriceDisplay(row),
            heroImage: toTrimmed(row.hero_image),
            colorImage: toTrimmed(row.color_image),
            colorCaption: toText(row.color_caption),
            demoVideo: toTrimmed(row.demo_video),
            demoPoster: toTrimmed(row.demo_poster),
            virtualDemo: toTrimmed(row.virtual_demo),
            pricingTitle: toTrimmed(row.pricing_title),
            pricingSub: toTrimmed(row.pricing_sub),
            stripe: toTrimmed(row.stripe_url),
            etsy: toTrimmed(row.etsy_url),
            lifeAreas,
            badges,
            features,
            gallery,
            included,
            faqs,
            benefits
          };

          if (socialProof && (socialProof.stars || socialProof.quote)) {
            product.socialProof = socialProof;
          }

          if (Number.isFinite(priceAmount)) {
            product.priceAmount = priceAmount;
          }
          if (priceCurrency) {
            product.priceCurrency = priceCurrency;
          }

          if (Object.prototype.hasOwnProperty.call(row, "draft")) {
            product.draft = App.normalizeDraftFlag(row.draft);
          }

          return App.normalizeProduct(product);
        })
        .filter(Boolean);

      if (!products.length) {
        App.supabaseProductsCache = null;
        return null;
      }

      App.supabaseProductsCache = products;
      return products;
    })
    .catch(error => {
      console.warn("[App] Failed to load Supabase products", error);
      return null;
    })
    .finally(() => {
      App.supabaseProductsPromise = null;
    });

  return App.supabaseProductsPromise;
};

App.fetchSupabaseBundles = function() {
  const config = App.getSupabaseConfig();
  if (!config) {
    return Promise.resolve(null);
  }

  if (Array.isArray(App.supabaseBundlesCache)) {
    return Promise.resolve(App.supabaseBundlesCache);
  }

  if (App.supabaseBundlesPromise) {
    return App.supabaseBundlesPromise;
  }

  const { url, anonKey } = config;
  const endpointBase = typeof url === "string" ? url.replace(/\/?$/, "") : "";
  const select = [
    "id",
    "slug",
    "name",
    "badge",
    "tagline",
    "nav_tagline",
    "nav_cta",
    "price_amount",
    "price_currency",
    "price_display",
    "savings_display",
    "category",
    "color_hex",
    "nav_color_hex",
    "cta_label",
    "page_url",
    "stripe_url",
    "draft",
    "nav_featured",
    "bundle_includes(*)",
    "bundle_products(*)"
  ].join(",");
  const endpoint = `${endpointBase}/rest/v1/bundles?select=${encodeURIComponent(select)}&order=created_at.asc`;

  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    Accept: "application/json",
    "Content-Type": "application/json"
  };

  const toArray = value => (Array.isArray(value) ? value : value ? [value] : []);
  const getPosition = entry => {
    if (!entry || typeof entry !== "object") return Number.MAX_SAFE_INTEGER;
    const raw = entry.position;
    const num = typeof raw === "number" ? raw : parseFloat(raw);
    return Number.isFinite(num) ? num : Number.MAX_SAFE_INTEGER;
  };
  const sortByPosition = list => toArray(list).slice().sort((a, b) => getPosition(a) - getPosition(b));
  const toTrimmed = value => (typeof value === "string" ? value.trim() : "");
  const toText = value => (typeof value === "string" ? value : "");
  const buildPriceDisplay = row => {
    const display = toTrimmed(row.price_display);
    if (display) return display;
    const rawAmount = typeof row.price_amount === "number" ? row.price_amount : parseFloat(row.price_amount);
    if (Number.isFinite(rawAmount)) {
      if (typeof App.formatPrice === "function") {
        return App.formatPrice(rawAmount);
      }
      return `$${rawAmount.toFixed(2)}`;
    }
    return "";
  };

  App.supabaseBundlesPromise = fetch(endpoint, {
    headers,
    mode: "cors",
    cache: "no-store"
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Supabase responded with ${response.status}`);
      }
      return response.json();
    })
    .then(rows => {
      if (!Array.isArray(rows)) {
        return null;
      }

      const bundles = rows
        .map(row => {
          if (!row || typeof row !== "object") return null;

          const slug = toTrimmed(row.slug) || toTrimmed(row.id);
          const priceAmount = typeof row.price_amount === "number" ? row.price_amount : parseFloat(row.price_amount);
          const priceCurrency = toTrimmed(row.price_currency);

          const includes = sortByPosition(row.bundle_includes)
            .map(item => toTrimmed(item.item))
            .filter(Boolean);

          const products = sortByPosition(row.bundle_products)
            .map(item => toTrimmed(item.product_slug || item.productSlug))
            .filter(Boolean);

          const raw = {
            slug: slug || undefined,
            name: toTrimmed(row.name) || slug || "",
            badge: toTrimmed(row.badge),
            tagline: toTrimmed(row.tagline),
            navTagline: toTrimmed(row.nav_tagline),
            navCta: toTrimmed(row.nav_cta),
            price: buildPriceDisplay(row),
            savings: toTrimmed(row.savings_display),
            category: toTrimmed(row.category),
            color: toTrimmed(row.color_hex),
            navColor: toTrimmed(row.nav_color_hex),
            cta: toTrimmed(row.cta_label),
            page: toTrimmed(row.page_url),
            stripe: toTrimmed(row.stripe_url),
            includes,
            products,
            navFeatured: Boolean(row.nav_featured),
            draft: App.normalizeDraftFlag(row.draft)
          };

          const bundle = App.normalizeBundle(raw);

          if (bundle && Number.isFinite(priceAmount)) {
            bundle.priceAmount = priceAmount;
          }
          if (bundle && priceCurrency) {
            bundle.priceCurrency = priceCurrency;
          }

          return bundle;
        })
        .filter(Boolean);

      App.supabaseBundlesCache = bundles;
      return bundles;
    })
    .catch(error => {
      console.warn("[App] Failed to load Supabase bundles", error);
      return null;
    })
    .finally(() => {
      App.supabaseBundlesPromise = null;
    });

  return App.supabaseBundlesPromise;
};

App.PREVIEW_STORAGE_KEY = "hs-admin-preview-products-v1";
App.PREVIEW_TTL_MS = 1000 * 60 * 60 * 12;
App.previewProductsMeta = null;

App.readPreviewProducts = function() {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return null;
  }

  let raw = null;
  try {
    raw = window.localStorage.getItem(App.PREVIEW_STORAGE_KEY);
  } catch (error) {
    console.warn("[App] Unable to access preview storage", error);
    return null;
  }

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const products = Array.isArray(parsed.products) ? parsed.products : null;
    if (!products || !products.length) return null;

    let expiresAt = null;
    if (parsed.expiresAt) {
      const numeric = typeof parsed.expiresAt === "number" ? parsed.expiresAt : Date.parse(parsed.expiresAt);
      if (Number.isFinite(numeric)) {
        expiresAt = numeric;
      }
    }

    if (!Number.isFinite(expiresAt) && parsed.updatedAt) {
      const updatedAt = Date.parse(parsed.updatedAt);
      if (Number.isFinite(updatedAt)) {
        expiresAt = updatedAt + App.PREVIEW_TTL_MS;
      }
    }

    if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
      window.localStorage.removeItem(App.PREVIEW_STORAGE_KEY);
      return null;
    }

    return {
      products,
      meta: {
        updatedAt: parsed.updatedAt || null,
        expiresAt: Number.isFinite(expiresAt) ? expiresAt : null,
        version: parsed.version || null,
        source: "preview",
        count: products.length
      }
    };
  } catch (error) {
    console.warn("[App] Failed to parse preview products", error);
    try {
      window.localStorage.removeItem(App.PREVIEW_STORAGE_KEY);
    } catch (_) {
      /* noop */
    }
    return null;
  }
};

App.clearPreviewProducts = function() {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return false;
  }
  try {
    window.localStorage.removeItem(App.PREVIEW_STORAGE_KEY);
    App.previewProductsMeta = null;
    return true;
  } catch (error) {
    console.warn("[App] Failed to clear preview products", error);
    return false;
  }
};

App.loadProducts = function() {
  if (!App.productsPromise) {
    App.productsPromise = (async () => {
      const preview = App.readPreviewProducts();
      if (preview) {
        App.previewProductsMeta = preview.meta;
        console.info("[App] Using admin preview products for storefront rendering.", preview.meta);
        return preview.products.map(App.normalizeProduct);
      }

      App.previewProductsMeta = null;
      const supabaseProducts = await App.fetchSupabaseProducts();
      if (Array.isArray(supabaseProducts) && supabaseProducts.length) {
        return supabaseProducts;
      }

      const supabasePromise = App.fetchSupabaseProductStatuses();
      const response = await fetch("products.json");
      const data = await response.json();
      const normalized = Array.isArray(data) ? data.map(App.normalizeProduct) : [];
      let overrides = null;
      try {
        overrides = await supabasePromise;
      } catch (error) {
        console.warn("[App] Supabase overrides failed", error);
      }

      if (overrides instanceof Map && overrides.size) {
        App.applySupabaseDraftOverrides(normalized, overrides);
      }

      return normalized;
    })().catch(err => {
      App.productsPromise = null;
      throw err;
    });
  }
  return App.productsPromise;
};

App.bundlesPromise = null;
App.loadBundles = function() {
  if (!App.bundlesPromise) {
    App.bundlesPromise = (async () => {
      const supabaseBundles = await App.fetchSupabaseBundles();
      if (Array.isArray(supabaseBundles)) {
        return App.filterActiveBundles(supabaseBundles);
      }

      console.warn("[App] Supabase bundles not available. Returning empty bundle list.");
      return [];
    })().catch(err => {
      App.bundlesPromise = null;
      throw err;
    });
  }
  return App.bundlesPromise;
};

/*****************************************************
 * Cart
 *****************************************************/
App.CART_KEY = "hs-cart-v1";
App.cart = { items: [] };
App.cartEls = {};
App.addToCartButtons = [];
App.currentProduct = null;
App.currencyFormatter =
  typeof Intl !== "undefined" && typeof Intl.NumberFormat === "function"
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
    : {
        format: value => {
          const number = Number(value);
          const safe = Number.isFinite(number) ? number : 0;
          return `$${safe.toFixed(2)}`;
        }
      };

App.parsePrice = function(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.,]/g, "");
  if (!cleaned) return 0;
  const normalized = cleaned.replace(/,/g, "");
  const num = parseFloat(normalized);
  return Number.isFinite(num) ? num : 0;
};

App.formatPrice = function(value) {
  const number = Number(value);
  return App.currencyFormatter.format(Number.isFinite(number) ? number : 0);
};

App.loadCartData = function() {
  const storageAvailable = typeof window !== "undefined" && "localStorage" in window;
  if (!storageAvailable) return { items: [] };
  try {
    const raw = window.localStorage.getItem(App.CART_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
    const items = parsed.items
      .map(item => {
        if (!item || !item.id) return null;
        const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
        const priceDisplay = item.priceDisplay || item.price || "";
        const priceValue = typeof item.priceValue === "number" && Number.isFinite(item.priceValue)
          ? item.priceValue
          : App.parsePrice(priceDisplay);
        return {
          id: String(item.id),
          name: item.name || "Harmony Sheets product",
          priceDisplay,
          priceValue,
          quantity,
          url: item.url || (item.id ? `product.html?id=${encodeURIComponent(item.id)}` : "#")
        };
      })
      .filter(Boolean);
    return { items };
  } catch (err) {
    console.warn("Unable to load cart", err);
    return { items: [] };
  }
};

App.saveCartData = function() {
  const storageAvailable = typeof window !== "undefined" && "localStorage" in window;
  if (!storageAvailable) return;
  try {
    window.localStorage.setItem(App.CART_KEY, JSON.stringify({ items: App.cart.items }));
  } catch (err) {
    console.warn("Unable to save cart", err);
  }
};

App.getCartCount = function() {
  return App.cart.items.reduce((total, item) => total + (item.quantity || 0), 0);
};

App.getCartTotal = function() {
  return App.cart.items.reduce((total, item) => total + (item.priceValue || 0) * (item.quantity || 0), 0);
};

App.renderCart = function() {
  const previousCount = typeof App.cartLastCount === "number" ? App.cartLastCount : 0;
  const count = App.getCartCount();
  const toggle = App.cartEls.toggle;
  const countEl = App.cartEls.count;
  const label = App.cartEls.label;
  const mainNav = App.qs(".main-nav");
  const siteHeader = App.qs(".site-header");
  const accountCart = App.qs("[data-account-cart]");

  if (countEl) {
    countEl.textContent = count > 9 ? "9+" : String(count);
    countEl.classList.toggle("is-visible", count > 0);
  }

  if (toggle) {
    toggle.hidden = count === 0;
    toggle.classList.toggle("has-items", count > 0);
    toggle.setAttribute("aria-label", count === 1 ? "View cart (1 item)" : `View cart (${count} items)`);
  }

  if (label) {
    label.textContent = count === 1 ? "View cart (1 item)" : `View cart (${count} items)`;
  }

  if (mainNav) mainNav.classList.toggle("main-nav--cart-active", count > 0);
  if (siteHeader) siteHeader.classList.toggle("cart-has-items", count > 0);

  if (accountCart) {
    const disabled = count === 0;
    accountCart.disabled = disabled;
    accountCart.setAttribute("aria-disabled", disabled ? "true" : "false");
    accountCart.classList.toggle("is-disabled", disabled);
  }

  const shouldAnimate = count > 0 && count > previousCount;
  const resetAnimation = el => {
    if (!el) return;
    el.classList.remove("cart-pop");
    // eslint-disable-next-line no-unused-expressions
    void el.offsetWidth;
    el.classList.add("cart-pop");
  };

  if (shouldAnimate) {
    resetAnimation(toggle);
    resetAnimation(siteHeader);
  }

  if (count === 0) {
    if (toggle) toggle.classList.remove("cart-pop");
    if (siteHeader) siteHeader.classList.remove("cart-pop");
  }

  App.cartLastCount = count;

  const itemsContainer = App.cartEls.items;
  if (itemsContainer) {
    if (!App.cart.items.length) {
      itemsContainer.innerHTML = `<p class="cart-panel__empty">Your cart is empty.</p>`;
    } else {
      itemsContainer.innerHTML = App.cart.items.map(item => {
        const priceEach = item.priceDisplay || App.formatPrice(item.priceValue);
        const subtotal = App.formatPrice((item.priceValue || 0) * item.quantity);
        const name = App.escapeHtml(item.name);
        const url = App.escapeHtml(item.url);
        return `
        <div class="cart-panel__item" data-product-id="${item.id}">
          <div class="cart-panel__item-header">
            <a class="cart-panel__item-name" href="${url}">${name}</a>
            <button type="button" class="cart-panel__remove" data-cart-action="remove" aria-label="Remove from cart">Remove</button>
          </div>
          <div class="cart-panel__item-footer">
            <div class="cart-panel__item-pricing">
              <span>${App.escapeHtml(priceEach)}</span>
              <span class="cart-panel__item-subtotal">${App.escapeHtml(subtotal)}</span>
            </div>
            <div class="cart-panel__item-quantity">
              <button type="button" class="cart-panel__qty-btn" data-cart-action="decrease" aria-label="Decrease quantity">−</button>
              <span class="cart-panel__qty">${item.quantity}</span>
              <button type="button" class="cart-panel__qty-btn" data-cart-action="increase" aria-label="Increase quantity">+</button>
            </div>
          </div>
        </div>`;
      }).join("");
    }
  }

  if (App.cartEls.total) App.cartEls.total.textContent = App.formatPrice(App.getCartTotal());
  if (App.cartEls.checkout) App.cartEls.checkout.disabled = App.cart.items.length === 0;

  if (App.currentProduct && typeof App.updateAddToCartButtons === "function") {
    App.updateAddToCartButtons(App.currentProduct.id);
  }
};

App.openCart = function() {
  if (!App.cartEls.panel) return;
  if (typeof App.closeAccountMenu === "function") App.closeAccountMenu();
  App.showLayer(App.cartEls.panel);
  App.cartEls.panel.classList.add("is-open");
  App.cartEls.panel.setAttribute("aria-hidden", "false");
  if (App.cartEls.overlay) {
    App.showLayer(App.cartEls.overlay);
    App.cartEls.overlay.classList.add("is-active");
  }
  if (App.cartEls.toggle) App.cartEls.toggle.setAttribute("aria-expanded", "true");
  if (typeof App.closeNavMenu === "function") App.closeNavMenu();
  document.body.classList.add("cart-open");
};

App.closeCart = function() {
  if (!App.cartEls.panel) return;
  App.cartEls.panel.classList.remove("is-open");
  App.cartEls.panel.setAttribute("aria-hidden", "true");
  if (App.cartEls.overlay) App.cartEls.overlay.classList.remove("is-active");
  if (App.cartEls.toggle) App.cartEls.toggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("cart-open");
  App.hideLayer(App.cartEls.panel);
  if (App.cartEls.overlay) App.hideLayer(App.cartEls.overlay);
};

App.toggleCart = function() {
  if (!App.cartEls.panel) return;
  if (App.cartEls.panel.classList.contains("is-open")) {
    App.closeCart();
  } else {
    App.openCart();
  }
};

App.addToCart = function(product) {
  if (!product || !product.id) return;
  const existing = App.cart.items.find(item => item.id === product.id);
  const priceValue = App.parsePrice(product.price);
  if (existing) {
    existing.quantity += 1;
  } else {
    App.cart.items.push({
      id: product.id,
      name: product.name || "Harmony Sheets product",
      priceDisplay: product.price || "",
      priceValue,
      quantity: 1,
      url: `product.html?id=${encodeURIComponent(product.id)}`
    });
  }
  App.saveCartData();
  App.renderCart();
  App.openCart();
};

App.changeCartQuantity = function(productId, delta) {
  if (!productId || !delta) return;
  const item = App.cart.items.find(entry => entry.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    App.cart.items = App.cart.items.filter(entry => entry.id !== productId);
  }
  App.saveCartData();
  App.renderCart();
};

App.removeFromCart = function(productId) {
  if (!productId) return;
  App.cart.items = App.cart.items.filter(entry => entry.id !== productId);
  App.saveCartData();
  App.renderCart();
};

App.checkoutCart = function() {
  if (!App.cart.items.length) {
    App.closeCart();
    return;
  }
  App.cart.items = [];
  App.saveCartData();
  App.renderCart();
  App.closeCart();
  window.location.href = "thanks.html";
};

App.initCart = function() {
  App.cart = App.loadCartData();
  App.cartLastCount = App.getCartCount();

  App.cartEls = {
    panel: App.qs("#cart-panel"),
    overlay: App.qs("[data-cart-overlay]"),
    toggle: App.qs("[data-cart-toggle]"),
    items: App.qs("[data-cart-items]"),
    total: App.qs("[data-cart-total]"),
    checkout: App.qs("[data-cart-checkout]"),
    label: App.qs("[data-cart-label]"),
    count: App.qs("[data-cart-count]")
  };

  if (App.cartEls.panel) App.hideLayer(App.cartEls.panel);
  if (App.cartEls.overlay) App.hideLayer(App.cartEls.overlay);

  if (App.cartEls.panel) App.cartEls.panel.setAttribute("aria-hidden", "true");
  if (App.cartEls.toggle) App.cartEls.toggle.setAttribute("aria-expanded", "false");

  const closeBtn = App.qs("[data-cart-close]");

  if (App.cartEls.toggle) App.cartEls.toggle.addEventListener("click", () => App.toggleCart());
  if (closeBtn) closeBtn.addEventListener("click", () => App.closeCart());
  if (App.cartEls.overlay) App.cartEls.overlay.addEventListener("click", () => App.closeCart());

  if (App.cartEls.items) {
    App.cartEls.items.addEventListener("click", event => {
      const action = event.target?.dataset?.cartAction;
      if (!action) return;
      const itemEl = event.target.closest("[data-product-id]");
      if (!itemEl) return;
      const productId = itemEl.getAttribute("data-product-id");
      if (!productId) return;
      if (action === "increase") {
        App.changeCartQuantity(productId, 1);
      } else if (action === "decrease") {
        App.changeCartQuantity(productId, -1);
      } else if (action === "remove") {
        App.removeFromCart(productId);
      }
    });
  }

  if (App.cartEls.checkout) App.cartEls.checkout.addEventListener("click", () => App.checkoutCart());

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && App.cartEls.panel?.classList.contains("is-open")) {
      App.closeCart();
    }
  });

  App.renderCart();
};

/*****************************************************
 * Under construction gate
 *****************************************************/
App.initConstructionGate = function() {
  const gate = App.qs("[data-construction-gate]");
  if (!gate) return;

  const dialog = gate.querySelector("[data-construction-dialog]");
  const continueLink = gate.querySelector("[data-construction-continue]");
  const backdrop = gate.querySelector("[data-construction-dismiss]");
  const storageKey = App.CONSTRUCTION_STORAGE_KEY;

  const hasDismissed = (() => {
    try {
      return window.localStorage.getItem(storageKey) === "1";
    } catch (err) {
      console.warn("Construction gate storage unavailable", err);
      return false;
    }
  })();

  if (hasDismissed) return;

  let dismissed = false;

  const hideGate = () => {
    if (dismissed) return;
    dismissed = true;

    gate.setAttribute("aria-hidden", "true");
    gate.classList.add("is-hiding");
    gate.classList.remove("is-active");
    document.body.classList.remove("is-construction-locked");

    try {
      window.localStorage.setItem(storageKey, "1");
    } catch (err) {
      console.warn("Construction gate storage unavailable", err);
    }

    gate.addEventListener(
      "transitionend",
      () => {
        gate.hidden = true;
        gate.classList.remove("is-hiding");
      },
      { once: true }
    );

    document.removeEventListener("keydown", onKeydown);
  };

  const onKeydown = event => {
    if (event.key === "Escape" || event.key === "Esc") {
      event.preventDefault();
      hideGate();
    }
  };

  gate.hidden = false;
  gate.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-construction-locked");

  requestAnimationFrame(() => {
    gate.classList.add("is-active");
    if (dialog) {
      dialog.focus();
    }
  });

  if (continueLink) {
    continueLink.addEventListener("click", event => {
      event.preventDefault();
      hideGate();
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", hideGate);
  }

  gate.addEventListener("click", event => {
    if (event.target === gate) {
      hideGate();
    }
  });

  document.addEventListener("keydown", onKeydown);
};

/*****************************************************
 * Init
 *****************************************************/
App.init = function() {
  App.initConstructionGate();
  App.initNav();
  App.initAuthLink();
  App.initCart();

  // Update footer year
  const yearEl = App.qs("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Footer newsletter form
  const newsletterForm = App.qs("#footer-newsletter");
  if (newsletterForm) {
    const status = App.qs("#footer-newsletter-status");
    newsletterForm.addEventListener("submit", event => {
      event.preventDefault();
      const formData = new FormData(newsletterForm);
      const email = formData.get("email");
      if (status) {
        status.textContent = email
          ? `Thanks, ${email}! We'll be in touch soon.`
          : "Thanks! We'll be in touch soon.";
      }
      newsletterForm.reset();
    });
  }

  // Highlight active nav item
  const path = window.location.pathname;
  const filename = path === "/" ? "index.html" : path.split("/").pop();
  const topLinks = App.qsa(".main-nav > a.nav-link, .main-nav > .nav-item > a.nav-link");
  topLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (!href) return;
    const linkUrl = new URL(href, window.location.origin);
    const linkFile = linkUrl.pathname.split("/").pop();
    const isProductsLink = linkFile === "products.html";
    if (linkFile === filename || (isProductsLink && (filename === "products.html" || filename === "product.html"))) {
      link.classList.add("active");
    }
  });

  // Build enhanced browse menu
  App.initNavDropdown();

  // Hero headline rotation (home page)
  App.initHeroRotation();
  if (App.qs("[data-home-parallax]")) App.initHomeParallax();
  if (App.qs("[data-questionnaire-modal]")) App.initQuestionnaire();

  // Auto-detect page
  if (App.qs("body.page-products")) App.initProducts();
  if (App.qs("body.page-product")) App.initProduct();
  if (App.qs("#life-wheel")) App.initHome();
  if (App.qs("#bundles-grid")) App.initBundles();

  // Init suggest form everywhere
  App.initSuggestForm();
};

/*****************************************************
 * Navigation toggle
 *****************************************************/
App.closeBrowseMenu = null;
App.closeBundlesMenu = null;
App.closeAccountMenu = null;
App.closeNavMenu = () => {};

App._layerTimers = new WeakMap();

App.setLayerVisibility = function(el, open) {
  if (!el) return;

  if (App._layerTimers.has(el)) {
    clearTimeout(App._layerTimers.get(el));
    App._layerTimers.delete(el);
  }

  if (open) {
    el.classList.remove("is-hidden");
    el.hidden = false;
    el.style.display = "";
    el.style.pointerEvents = "";
    el.setAttribute("aria-hidden", "false");
    return;
  }

  el.classList.add("is-hidden");
  el.setAttribute("aria-hidden", "true");
  el.style.pointerEvents = "none";

  let totalDuration = 0;
  if (typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
    const styles = window.getComputedStyle(el);
    const parseTime = value => {
      if (!value) return 0;
      const trimmed = value.trim();
      if (!trimmed) return 0;
      const numeric = parseFloat(trimmed);
      if (Number.isNaN(numeric)) return 0;
      return trimmed.endsWith("ms") ? numeric : numeric * 1000;
    };
    const durations = (styles.transitionDuration || "0s").split(",");
    const delays = (styles.transitionDelay || "0s").split(",");
    const totals = durations.map((duration, index) => {
      const delay = delays[index] || delays[delays.length - 1] || "0s";
      return parseTime(duration) + parseTime(delay);
    });
    totalDuration = Math.max(0, ...totals);
  }

  if (totalDuration <= 0) {
    el.hidden = true;
    el.style.display = "none";
    return;
  }

  const timer = setTimeout(() => {
    el.hidden = true;
    el.style.display = "none";
    App._layerTimers.delete(el);
  }, totalDuration);
  App._layerTimers.set(el, timer);
};

App.showLayer = function(el) {
  App.setLayerVisibility(el, true);
};

App.hideLayer = function(el) {
  App.setLayerVisibility(el, false);
};
App.initAuthLink = function() {
  const accountItem = App.qs("[data-account-menu]");
  const toggle = accountItem?.querySelector("[data-account-toggle]");
  const dropdown = accountItem?.querySelector("[data-account-dropdown]");

  if (!accountItem || !toggle || !dropdown) {
    App.closeAccountMenu = null;
    return;
  }

  if (!accountItem.dataset.authState) {
    accountItem.dataset.authState = "signed-out";
  }

  const accountLink = dropdown.querySelector('[data-account-link="account"]');
  if (App.qs("body.page-auth") && accountLink) {
    accountLink.href = "products.html";
    accountLink.textContent = "Browse templates";
  }

  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;
  const isAuthenticated = () => accountItem.dataset.authState === "signed-in";

  const setOpen = open => {
    if (!isAuthenticated()) {
      accountItem.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      App.hideLayer(dropdown);
      return;
    }
    accountItem.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    App.setLayerVisibility(dropdown, open);
  };

  const closeMenu = () => setOpen(false);
  const openMenu = () => setOpen(true);

  const updateMenuForAuthState = () => {
    const authed = isAuthenticated();
    toggle.setAttribute("aria-haspopup", authed ? "true" : "dialog");
    if (!authed) {
      closeMenu();
      App.hideLayer(dropdown);
      return;
    }
    if (accountItem.classList.contains("is-open")) {
      App.showLayer(dropdown);
    } else {
      App.hideLayer(dropdown);
    }
  };

  toggle.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated()) {
      if (typeof window.openAuthModal === "function") {
        window.openAuthModal();
      } else {
        window.location.href = "login.html";
      }
      return;
    }
    setOpen(!accountItem.classList.contains("is-open"));
  });

  accountItem.addEventListener("mouseenter", () => {
    if (!isMobile()) openMenu();
  });

  accountItem.addEventListener("mouseleave", () => {
    if (!isMobile()) closeMenu();
  });

  toggle.addEventListener("focus", () => {
    if (!isMobile()) openMenu();
  });

  accountItem.addEventListener("focusout", event => {
    if (!accountItem.contains(event.relatedTarget)) closeMenu();
  });

  accountItem.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeMenu();
      toggle.focus();
    }
  });

  document.addEventListener("click", event => {
    if (!accountItem.contains(event.target)) closeMenu();
  });

  dropdown.addEventListener("click", event => {
    const actionLink = event.target?.closest(".nav-dropdown__link");
    if (!actionLink) return;
    if (actionLink.matches("[data-account-cart]")) {
      event.preventDefault();
      if (typeof App.openCart === "function") App.openCart();
    }
    closeMenu();
  });

  window.addEventListener("resize", () => closeMenu());

  const observer = new MutationObserver(() => updateMenuForAuthState());
  observer.observe(accountItem, { attributes: true, attributeFilter: ["data-auth-state"] });
  updateMenuForAuthState();

  App.closeAccountMenu = closeMenu;
  closeMenu();
};
App.initNav = function() {
  const toggle = App.qs(".nav-toggle");
  const nav = App.qs(".main-nav");
  const siteHeader = App.qs(".site-header");

  const showBrandText = () => {
    if (siteHeader) siteHeader.classList.add("site-header--brand-text-visible");
  };

  const hideBrandText = () => {
    if (siteHeader) siteHeader.classList.remove("site-header--brand-text-visible");
  };

  if (!toggle || !nav) {
    App.closeNavMenu = () => {};
    hideBrandText();
    return;
  }

  nav.addEventListener("mouseenter", () => showBrandText());
  nav.addEventListener("mouseleave", () => hideBrandText());
  nav.addEventListener("focusin", () => showBrandText());
  nav.addEventListener("focusout", event => {
    if (!nav.contains(event.relatedTarget)) hideBrandText();
  });
  nav.addEventListener(
    "touchstart",
    () => {
      showBrandText();
    },
    { passive: true }
  );

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    hideBrandText();
    if (typeof App.closeBrowseMenu === "function") App.closeBrowseMenu();
    if (typeof App.closeBundlesMenu === "function") App.closeBundlesMenu();
    if (typeof App.closeAccountMenu === "function") App.closeAccountMenu();
  };

  const handleToggle = () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (isOpen) {
      showBrandText();
    } else {
      hideBrandText();
      if (typeof App.closeBrowseMenu === "function") App.closeBrowseMenu();
      if (typeof App.closeBundlesMenu === "function") App.closeBundlesMenu();
      if (typeof App.closeAccountMenu === "function") App.closeAccountMenu();
    }
  };

  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;

  toggle.addEventListener("click", () => {
    handleToggle();
  });

  App.qsa(".main-nav a").forEach(link => {
    link.addEventListener("click", () => {
      if (isMobile()) closeMenu();
    });
  });

  window.addEventListener("resize", () => {
    if (!isMobile()) closeMenu();
  });

  window.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });

  App.closeNavMenu = closeMenu;
  closeMenu();
};

/*****************************************************
 * Browse mega menu
 *****************************************************/
App.initNavDropdown = function() {
  const browseItem = App.qs(".nav-item--browse");
  const browseLink = browseItem?.querySelector(".nav-link--browse");
  const mega = browseItem?.querySelector(".nav-mega");
  const content = browseItem?.querySelector("[data-nav-mega-content]");

  if (!browseItem || !browseLink || !mega || !content) {
    App.closeBrowseMenu = null;
    return;
  }

  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;

  let lastShift = null;

  const resetMegaPosition = (clearStored = false) => {
    mega.style.left = "";
    mega.style.right = "";
    mega.style.removeProperty("--mega-adjust");
    if (clearStored) lastShift = null;
  };

  const repositionMega = () => {
    if (isMobile()) {
      resetMegaPosition(true);
      return;
    }

    const previousShift = lastShift;
    mega.style.left = "";
    mega.style.right = "";
    mega.style.removeProperty("--mega-adjust");

    const margin = 20;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportCenter = viewportWidth / 2;
    const linkRect = browseLink.getBoundingClientRect();
    const navCenter = linkRect.left + linkRect.width / 2;

    let shift = viewportCenter - navCenter;
    mega.style.setProperty("--mega-adjust", `${shift}px`);

    const rect = mega.getBoundingClientRect();
    if (rect.left < margin) {
      shift += margin - rect.left;
    } else if (rect.right > viewportWidth - margin) {
      shift -= rect.right - (viewportWidth - margin);
    }

    if (Math.abs(shift) > 0.5) {
      mega.style.setProperty("--mega-adjust", `${shift}px`);
      lastShift = shift;
    } else if (previousShift !== null && Math.abs(previousShift) > 0.5) {
      mega.style.setProperty("--mega-adjust", `${previousShift}px`);
      lastShift = previousShift;
    } else {
      mega.style.removeProperty("--mega-adjust");
      lastShift = null;
    }
  };

  let repositionFrame = null;
  const scheduleReposition = () => {
    if (repositionFrame) cancelAnimationFrame(repositionFrame);
    repositionFrame = requestAnimationFrame(() => {
      repositionFrame = null;
      repositionMega();
    });
  };

  const setOpen = open => {
    if (isMobile()) {
      open = false;
    } else if (open) {
      scheduleReposition();
    }
    if (!open) {
      resetMegaPosition(true);
    }
    browseItem.classList.toggle("is-open", open);
    browseLink.setAttribute("aria-expanded", open ? "true" : "false");
    App.setLayerVisibility(mega, open);
  };
  const close = () => setOpen(false);
  App.closeBrowseMenu = close;
  close();

  browseItem.addEventListener("mouseenter", () => {
    if (!isMobile()) setOpen(true);
  });

  browseItem.addEventListener("mouseleave", () => {
    if (!isMobile()) close();
  });

  browseLink.addEventListener("focus", () => setOpen(true));

  browseItem.addEventListener("focusout", event => {
    if (!browseItem.contains(event.relatedTarget)) close();
  });

  browseItem.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      close();
      browseLink.focus();
    }
  });

  browseLink.addEventListener("click", () => {
    if (isMobile()) setOpen(false);
  });

  window.addEventListener("resize", () => {
    scheduleReposition();
    close();
  });


  const baseAreas = App.LIFE_AREAS || {};
  const baseAreaOrder = Object.keys(baseAreas || {});
  const ALL_CATEGORY_INFO = {
    title: "All Life Harmony Tools",
    short: "All Products",
    color: "#0ea5e9",
    empty: "We're crafting new Life Harmony tools. Explore the rest of the site in the meantime."
  };
  const areaOrder = ["all", ...baseAreaOrder];
  const getCategoryInfo = areaId => {
    if (areaId === "all") return ALL_CATEGORY_INFO;
    return baseAreas?.[areaId] || null;
  };

  if (!baseAreaOrder.length) {
    content.innerHTML = '<p class="nav-mega__placeholder">Life Harmony tools are coming soon.</p>';
    App.loadProducts().catch(err => {
      console.warn("Unable to preload products:", err);
    });
    return;
  }

  const navAccentMap = {
    all: "#0ea5e9",
    love: "#ef5da8",
    career: "#7c5cff",
    health: "#22c55e",
    finances: "#d97706",
    fun: "#f59e0b",
    family: "#60a5fa",
    environment: "#10b981",
    spirituality: "#8b5cf6"
  };

  const navState = {
    cat: areaOrder[0] || "all",
    q: "",
    sort: "badge"
  };

  const formatPriceDisplay = value => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed ? (trimmed.startsWith("$") ? trimmed : `$${trimmed}`) : "";
    }
    const number = Number(value);
    if (!Number.isFinite(number)) return "";
    return number % 1 === 0 ? `$${number.toFixed(0)}` : `$${number.toFixed(2)}`;
  };

  const normalizeEntry = (areaId, item = {}, index = 0) => {
    const fallbackId = `${areaId || "area"}-item-${index}`;
    const id = item.id || fallbackId;
    const name = item.name || "Harmony Sheets tool";
    const type = item.type || "Template";
    const format = item.format || "Sheets";
    const badge = item.badge || "";
    const tagline = item.tagline || "";
    const explicitDisplay = typeof item.priceDisplay === "string" ? item.priceDisplay : "";
    const computedDisplay =
      explicitDisplay ||
      (typeof item.price === "number"
        ? formatPriceDisplay(item.price)
        : typeof item.price === "string"
        ? item.price
        : "");
    const priceDisplay = computedDisplay ? formatPriceDisplay(computedDisplay) : "";
    const areaInfo = getCategoryInfo(areaId) || {};
    const accentColor = navAccentMap[areaId] || areaInfo.color || navAccentMap.all;
    const lifeAreaLabel = areaInfo.short || areaInfo.title || areaId;
    const rawImage = typeof item.image === "string" ? item.image.trim() : "";
    const image = rawImage || "";
    const previewImages = Array.isArray(item.previewImages)
      ? item.previewImages
          .map(src => (typeof src === "string" ? src.trim() : ""))
          .filter(Boolean)
      : [];
    let priceValue = Number.isFinite(item.priceValue) ? item.priceValue : null;
    if (priceValue === null) {
      if (typeof item.price === "number" && Number.isFinite(item.price)) {
        priceValue = item.price;
      } else {
        priceValue = App.parsePrice(priceDisplay);
      }
    }
    if (!Number.isFinite(priceValue)) priceValue = Number.POSITIVE_INFINITY;
    const href =
      item.url ||
      (item.id && typeof item.id === "string" && item.id.startsWith("http")
        ? item.id
        : `products.html?area=${encodeURIComponent(areaId)}`);
    return {
      id,
      name,
      type,
      format,
      badge,
      tagline,
      priceDisplay,
      priceValue,
      url: href,
      image,
      previewImages,
      accentColor,
      lifeAreaId: areaId,
      lifeAreaLabel
    };
  };

  const buildAreaProducts = rawProducts => {
    const hasActiveProducts = Array.isArray(rawProducts) && rawProducts.some(Boolean);
    const map = {};
    areaOrder.forEach(id => {
      map[id] = [];
    });

    if (Array.isArray(rawProducts)) {
      rawProducts.forEach(product => {
        if (!product) return;
        const areas = Array.isArray(product.lifeAreas) ? product.lifeAreas : [];
        if (!areas.length) return;
        const meta = (App.NAV_PRODUCT_META && App.NAV_PRODUCT_META[product.id]) || {};
        const base = {
          id: product.id,
          name: product.name,
          type: meta.type,
          format: meta.format,
          badge: meta.badge,
          priceDisplay: meta.priceDisplay || product.price,
          priceValue: meta.priceValue,
          price: meta.price,
          url: meta.url || `product.html?id=${encodeURIComponent(product.id)}`,
          tagline: product.tagline,
          image: meta.image,
          previewImages: meta.previewImages
        };
        const areaOverrides = meta.areas || {};
        areas.forEach(areaId => {
          if (!map[areaId]) map[areaId] = [];
          const override = areaOverrides[areaId] || {};
          map[areaId].push(normalizeEntry(areaId, { ...base, ...override }, map[areaId].length));
        });
      });
    }

    if (!hasActiveProducts) {
      const extras = App.NAV_AREA_EXTRAS || {};
      Object.entries(extras).forEach(([areaId, items]) => {
        if (!Array.isArray(items) || !items.length) return;
        if (!map[areaId]) map[areaId] = [];
        if (map[areaId].length > 0) return;
        map[areaId] = items.map((item, index) => normalizeEntry(areaId, item, index));
      });
    }

    if (map.all) {
      const existingAll = Array.isArray(map.all) ? map.all.slice() : [];
      const seenAll = new Set();
      const aggregated = [];

      existingAll.forEach(entry => {
        if (!entry) return;
        const key = entry.id || `${entry.name}-${entry.type}`;
        if (seenAll.has(key)) return;
        seenAll.add(key);
        aggregated.push(entry);
      });

      baseAreaOrder.forEach(areaId => {
        const list = Array.isArray(map[areaId]) ? map[areaId] : [];
        list.forEach(entry => {
          if (!entry) return;
          const key = entry.id || `${entry.name}-${entry.type}`;
          if (seenAll.has(key)) return;
          seenAll.add(key);
          aggregated.push(entry);
        });
      });

      map.all = aggregated;
    }

    Object.keys(map).forEach(areaId => {
      const seen = new Set();
      map[areaId] = map[areaId].filter(entry => {
        const key = entry.id || `${entry.name}-${entry.type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });

    return map;
  };

  let areaProducts = buildAreaProducts([]);
  let panelEl = null;
  let rowsEl = null;
  let infoTextEl = null;
  let searchInput = null;
  let sortSelect = null;
  let tableEl = null;
  let activePreviewRow = null;
  let hasRowListeners = false;

  const applyRowImage = (row, src) => {
    if (!row) return;
    if (!src) {
      row.style.removeProperty("--nav-row-image");
      return;
    }
    const safe = String(src).replace(/["\\\n\r]/g, match => {
      if (match === "\n" || match === "\r") return "";
      return `\\${match}`;
    });
    row.style.setProperty("--nav-row-image", `url("${safe}")`);
  };

  const setActiveRow = row => {
    if (activePreviewRow === row) return;
    if (activePreviewRow) {
      activePreviewRow.classList.remove("is-active");
      applyRowImage(activePreviewRow, "");
    }
    activePreviewRow = row || null;
    if (activePreviewRow) {
      activePreviewRow.classList.add("is-active");
      const previewSrc = activePreviewRow.getAttribute("data-preview-image") || "";
      applyRowImage(activePreviewRow, previewSrc);
    }
  };

  const handleRowEvent = event => {
    if (!rowsEl) return;
    const row = event.target.closest("[data-nav-item]");
    if (!row || !rowsEl.contains(row)) return;
    setActiveRow(row);
  };

  const handleRowsMouseLeave = () => {
    setActiveRow(null);
  };

  const handleRowsFocusOut = event => {
    if (!rowsEl) return;
    if (!rowsEl.contains(event.relatedTarget)) {
      setActiveRow(null);
    }
  };

  const attachRowListeners = () => {
    if (!rowsEl || hasRowListeners) return;
    rowsEl.addEventListener("mouseover", handleRowEvent);
    rowsEl.addEventListener("focusin", handleRowEvent);
    rowsEl.addEventListener("mouseleave", handleRowsMouseLeave);
    rowsEl.addEventListener("focusout", handleRowsFocusOut);
    hasRowListeners = true;
  };

  const collectSearchableItems = () => {
    const aggregated = [];
    const seen = new Map();

    areaOrder
      .filter(areaId => areaId !== "all")
      .forEach(areaId => {
      const list = Array.isArray(areaProducts[areaId]) ? areaProducts[areaId] : [];
      if (!list.length) return;
      const areaInfo = getCategoryInfo(areaId) || {};
      const areaLabel = areaInfo.short || areaInfo.title || areaId;

      list.forEach(item => {
        if (!item) return;
        const key = item.id || item.url || `${item.name}-${item.type}`;
        const existing = seen.get(key);
        if (existing) {
          if (!Array.isArray(existing.lifeAreaIds)) existing.lifeAreaIds = [];
          if (!existing.lifeAreaIds.includes(areaId)) {
            existing.lifeAreaIds.push(areaId);
            existing.lifeAreaLabel = existing.lifeAreaIds
              .map(id => {
                const info = getCategoryInfo(id);
                return info?.short || info?.title || id;
              })
              .join(" • ");
          }
          return;
        }

        const clone = { ...item };
        clone.lifeAreaIds = [areaId];
        clone.lifeAreaLabel = areaLabel;
        seen.set(key, clone);
        aggregated.push(clone);
      });
      });

    return aggregated;
  };

  const badgeWeight = badge => {
    const value = String(badge || "").toLowerCase();
    if (!value) return 0;
    if (value.includes("best")) return 3;
    if (value.includes("popular")) return 2;
    if (value.includes("new")) return 1;
    return 0;
  };

  const getBadgeType = badge => {
    const value = String(badge || "").toLowerCase();
    if (!value) return "";
    if (value.includes("best")) return "bestseller";
    if (value.includes("popular")) return "popular";
    if (value.includes("new")) return "new";
    return "";
  };

  const getPreviewSource = item => {
    if (!item) return "";
    const list = Array.isArray(item.previewImages) ? item.previewImages : [];
    const cleaned = list
      .map(src => (typeof src === "string" ? src.trim() : ""))
      .filter(Boolean);
    if (!cleaned.length && item.image) {
      cleaned.push(item.image);
    }
    return cleaned.length ? cleaned[0] : "";
  };

  const updateActive = () => {
    if (!panelEl) return;
    if (!areaOrder.includes(navState.cat)) {
      navState.cat = areaOrder[0];
    }

    const info = getCategoryInfo(navState.cat) || {};
    const accent = navAccentMap[navState.cat] || info.color || navAccentMap.all;
    panelEl.dataset.area = navState.cat;
    panelEl.style.setProperty("--nav-mega-acc", accent);

    if (tableEl) {
      const labelBase = info.title || info.short || "Life Harmony tools";
      tableEl.setAttribute("aria-label", `${labelBase} list`);
    }

    if (searchInput && searchInput.value !== navState.q) {
      searchInput.value = navState.q;
    }

    if (sortSelect && sortSelect.value !== navState.sort) {
      sortSelect.value = navState.sort;
    }

    const query = (navState.q || "").trim().toLowerCase();

    const baseItems = query ? collectSearchableItems() : Array.isArray(areaProducts[navState.cat]) ? areaProducts[navState.cat] : [];

    let filtered = baseItems;
    if (query) {
      filtered = baseItems.filter(item => {
        return [item.name, item.type, item.format, item.badge, item.tagline, item.priceDisplay]
          .some(value => String(value || "").toLowerCase().includes(query));
      });
    }

    const sorted = filtered.slice().sort((a, b) => {
      if (navState.sort === "price") {
        return a.priceValue - b.priceValue;
      }
      if (navState.sort === "badge") {
        const diff = badgeWeight(b.badge) - badgeWeight(a.badge);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });

    const totalItems = sorted.length;

    if (rowsEl) {
      if (!totalItems) {
        const message = query
          ? `No matches for “${navState.q}”.`
          : info.empty || "Fresh tools coming soon.";
        rowsEl.innerHTML = `<tr class="nav-mega__empty-row"><td colspan="4">${App.escapeHtml(message)}</td></tr>`;
        setActiveRow(null);
      } else {
        const rows = sorted
          .map((item, index) => {
            const badgeType = getBadgeType(item.badge);
            const badgeMarkup = item.badge
              ? `<span class="nav-mega__tbadge"${badgeType ? ` data-type="${badgeType}"` : ""}>${App.escapeHtml(item.badge)}</span>`
              : "";
            const priceText = item.priceDisplay ? App.escapeHtml(item.priceDisplay) : "—";
            const url = App.escapeHtml(item.url || `products.html?area=${encodeURIComponent(navState.cat)}`);
            const name = App.escapeHtml(item.name || "Harmony Sheets tool");
            const type = App.escapeHtml(item.type || "Template");
            const navId = String(item.id || `${navState.cat}-item-${index}`);
            const previewSrc = getPreviewSource(item);
            const previewAttr = previewSrc ? ` data-preview-image="${App.escapeHtml(previewSrc)}"` : "";
            const previewClass = previewSrc ? " has-preview" : "";
            const accentColor = item.accentColor ? App.escapeHtml(item.accentColor) : "";
            const dotStyle = accentColor ? ` style="--nav-dot:${accentColor}"` : "";
            const areaInfo =
              item.lifeAreaLabel ||
              getCategoryInfo(navState.cat)?.short ||
              getCategoryInfo(navState.cat)?.title ||
              "Life area";
            const areaLabelText = `Life area: ${areaInfo}`;
            const areaLabel = App.escapeHtml(areaLabelText);
            return `<tr class="nav-mega__row${previewClass}" data-nav-item="${App.escapeHtml(navId)}"${previewAttr}><td class="nav-mega__product-cell"><span class="nav-mega__dot nav-mega__dot--row"${dotStyle} aria-hidden="true"></span><span class="sr-only">${areaLabel}</span><a class="nav-mega__product-link" href="${url}">${name}</a></td><td>${type}</td><td>${badgeMarkup}</td><td class="nav-mega__price">${priceText}</td></tr>`;
          })
          .join("");
        rowsEl.innerHTML = rows;
        setActiveRow(null);
      }
    }

    if (infoTextEl) {
      if (!totalItems) {
        infoTextEl.textContent = query ? `No matches for “${navState.q}”` : "More tools coming soon";
      } else {
        if (query) {
          infoTextEl.textContent = `${totalItems} ${totalItems === 1 ? "tool matches" : "tools match"} “${navState.q}” across Life Harmony`;
        } else {
          infoTextEl.textContent = `${totalItems} ${totalItems === 1 ? "tool" : "tools"} available`;
        }
      }
    }

    scheduleReposition();
  };

  const renderShell = () => {
    const currentInfo = getCategoryInfo(navState.cat) || {};
    const initialLabel = App.escapeHtml(currentInfo.title || currentInfo.short || "Life Harmony tools");

    content.innerHTML = `
      <div class="nav-mega__panel" data-nav-panel data-area="${App.escapeHtml(navState.cat)}">
        <div class="nav-mega__pane">
          <div class="nav-mega__prod">
            <div class="nav-mega__prod-head">
              <div class="nav-mega__tools">
                <label class="nav-mega__search">
                  <span class="sr-only">Search Life Harmony tools</span>
                  <input type="search" placeholder="Search tools…" value="${App.escapeHtml(navState.q)}" data-nav-search>
                </label>
              </div>
              <div class="nav-mega__sort">
                <select class="nav-mega__select" data-nav-sort>
                  <option value="badge"${navState.sort === "badge" ? " selected" : ""}>Sort: Badge</option>
                  <option value="name"${navState.sort === "name" ? " selected" : ""}>Sort: Name</option>
                  <option value="price"${navState.sort === "price" ? " selected" : ""}>Sort: Price</option>
                </select>
              </div>
            </div>
            <div class="nav-mega__scroll">
              <table class="nav-mega__table" data-nav-table aria-label="${initialLabel} list">
                <thead>
                  <tr>
                    <th scope="col" class="nav-mega__product-header" style="width:56%">
                      <span class="nav-mega__product-header-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="8"/>
                            <circle cx="12" cy="12" r="2.8"/>
                            <path d="M12 3.5V8M20.5 12H16M12 20.5V16M3.5 12H8"/>
                          </g>
                        </svg>
                      </span>
                      <span>Product</span>
                    </th>
                    <th scope="col" style="width:18%">Type</th>
                    <th scope="col" style="width:14%">Badge</th>
                    <th scope="col" style="width:12%">Price</th>
                  </tr>
                </thead>
                <tbody data-nav-rows>
                  <tr class="nav-mega__empty-row"><td colspan="4">Loading Life Harmony tools…</td></tr>
                </tbody>
              </table>
            </div>
            <div class="nav-mega__pager">
              <span class="nav-mega__pager-info" data-nav-info>Loading…</span>
              <a class="nav-mega__pager-link" href="products.html">Browse all Harmony tools</a>
            </div>
          </div>
        </div>
      </div>
    `;

    panelEl = content.querySelector("[data-nav-panel]");
    rowsEl = content.querySelector("[data-nav-rows]");
    infoTextEl = content.querySelector("[data-nav-info]");
    searchInput = content.querySelector("[data-nav-search]");
    sortSelect = content.querySelector("[data-nav-sort]");
    tableEl = content.querySelector("[data-nav-table]");

    if (searchInput) {
      searchInput.addEventListener("input", event => {
        navState.q = event.target.value || "";
        updateActive();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", event => {
        navState.sort = event.target.value || "badge";
        updateActive();
      });
    }

    attachRowListeners();

    scheduleReposition();
  };

  renderShell();
  updateActive();

  App.loadProducts()
    .then(products => {
      const activeProducts = App.filterActiveProducts(products);
      areaProducts = buildAreaProducts(activeProducts);
      updateActive();
    })
    .catch(err => {
      console.warn("Unable to preload products:", err);
    });

  const bundleItem = App.qs(".nav-item--bundles");
  const bundleLink = bundleItem?.querySelector(".nav-link--bundles");
  const bundleFlyout = bundleItem?.querySelector(".nav-flyout");
  const bundleContent = bundleItem?.querySelector("[data-nav-bundles]");

  if (!bundleItem || !bundleLink || !bundleFlyout || !bundleContent) {
    App.closeBundlesMenu = () => {};
    return;
  }

  const bundleMatcher = window.matchMedia("(max-width: 720px)");
  const isBundleMobile = () => bundleMatcher.matches;

  const resetBundlePosition = () => {
    bundleFlyout.style.left = "";
    bundleFlyout.style.right = "";
    bundleFlyout.style.removeProperty("--bundle-adjust");
  };

  const repositionBundles = () => {
    if (isBundleMobile()) {
      resetBundlePosition();
      return;
    }

    resetBundlePosition();

    const margin = 20;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const rect = bundleFlyout.getBoundingClientRect();

    let shift = 0;

    if (rect.left < margin) {
      shift += margin - rect.left;
    }

    if (rect.right > viewportWidth - margin) {
      shift -= rect.right - (viewportWidth - margin);
    }

    if (Math.abs(shift) > 0.5) {
      bundleFlyout.style.setProperty("--bundle-adjust", `${shift}px`);
    }
  };

  let bundleRepositionFrame = null;
  const scheduleBundleReposition = () => {
    if (bundleRepositionFrame) cancelAnimationFrame(bundleRepositionFrame);
    bundleRepositionFrame = requestAnimationFrame(() => {
      bundleRepositionFrame = null;
      repositionBundles();
    });
  };

  const setBundleOpen = open => {
    if (isBundleMobile()) open = false;
    bundleItem.classList.toggle("is-open", open);
    bundleLink.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      scheduleBundleReposition();
    } else {
      resetBundlePosition();
    }
    App.setLayerVisibility(bundleFlyout, open);
  };

  const closeBundles = () => setBundleOpen(false);
  const openBundles = () => setBundleOpen(true);
  App.closeBundlesMenu = closeBundles;
  closeBundles();

  bundleItem.addEventListener("mouseenter", () => {
    if (!isBundleMobile()) openBundles();
  });

  bundleItem.addEventListener("mouseleave", () => {
    if (!isBundleMobile()) closeBundles();
  });

  bundleLink.addEventListener("focus", openBundles);

  bundleItem.addEventListener("focusout", event => {
    if (!bundleItem.contains(event.relatedTarget)) closeBundles();
  });

  bundleItem.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeBundles();
      bundleLink.focus();
    }
  });

  bundleLink.addEventListener("click", () => {
    if (isBundleMobile()) closeBundles();
  });

  bundleMatcher.addEventListener("change", () => {
    resetBundlePosition();
    closeBundles();
  });

  bundleContent.addEventListener("click", event => {
    if (event.target.closest("a")) closeBundles();
  });

  const renderBundlesMenu = (list, fromFallback = false) => {
    const featured = Array.isArray(list)
      ? list
          .filter(item => {
            if (!item) return false;
            if (fromFallback) return true;
            if (item.navFeatured === undefined) return Boolean(item.featuredInNav || item.featured || item.nav_featured);
            return Boolean(item.navFeatured);
          })
          .slice(0, 6)
      : [];

    if (!featured.length) {
      bundleContent.innerHTML = '<p class="nav-flyout__placeholder">Visit the bundles page to explore every collection.</p>';
      scheduleBundleReposition();
      return;
    }

    const markup = featured
      .map(item => {
        const slug = App.slugify(item.slug || item.id || item.name || "");
        const detailPage = item.page || item.detailPage || item.detail || item.detail_page;
        const hrefId = slug ? `#bundle-${slug}` : "";
        const rawHref = detailPage ? detailPage : `bundles.html${hrefId}`;
        const href = App.escapeHtml(rawHref);
        const name = App.escapeHtml(item.name || item.title || "Bundle");
        const desc = App.escapeHtml(item.navTagline || item.tagline || "");
        const badge = App.escapeHtml(item.badge || "Bundle");
        const price = App.escapeHtml(item.price || "");
        const savings = App.escapeHtml(item.savings || "");
        const includes = Array.isArray(item.includes) ? item.includes.filter(Boolean).slice(0, 3) : [];
        const includeMarkup = includes.length
          ? `<ul class="nav-bundle-card__includes">${includes
              .map(include => `<li>${App.escapeHtml(include)}</li>`)
              .join("")}</ul>`
          : "";
        const cta = App.escapeHtml(item.navCta || item.cta || "View bundle");
        const baseColor = item.color || item.navColor || "#6366f1";
        const accent = App.escapeHtml(baseColor);
        const soft = App.escapeHtml(App.hexToRgba(baseColor, 0.18));
        return `
          <a class="nav-bundle-card" role="menuitem" href="${href}" style="--bundle-accent:${accent};--bundle-accent-soft:${soft};">
            <span class="nav-bundle-card__badge">${badge}</span>
            <span class="nav-bundle-card__title">${name}</span>
            ${desc ? `<span class="nav-bundle-card__tagline">${desc}</span>` : ""}
            <span class="nav-bundle-card__pricing">
              ${price ? `<strong>${price}</strong>` : ""}
              ${savings ? `<em>Save ${savings}</em>` : ""}
            </span>
            ${includeMarkup}
            <span class="nav-bundle-card__cta">${cta}</span>
          </a>
        `;
      })
      .join("");

    bundleContent.innerHTML = `
      <div class="nav-bundles-grid">
        ${markup}
      </div>
      <div class="nav-flyout__footer"><a href="bundles.html">View all bundles</a></div>
    `;
    scheduleBundleReposition();
  };

  bundleContent.innerHTML = '<p class="nav-flyout__placeholder">Loading bundles…</p>';

  App.loadBundles()
    .then(bundles => {
      renderBundlesMenu(bundles);
      scheduleBundleReposition();
    })
    .catch(err => {
      console.warn("Unable to load bundle menu:", err);
      renderBundlesMenu([]);
      scheduleBundleReposition();
    });

  window.addEventListener("resize", () => {
    scheduleBundleReposition();
    closeBundles();
  });
};

/*****************************************************
 * Bundles page (bundles.html)
 *****************************************************/
App.initBundles = async function() {
  const grid = App.qs("#bundles-grid");
  if (!grid || grid.dataset.bundlesInit === "true") return;
  grid.dataset.bundlesInit = "true";

  const setStatus = message => {
    grid.innerHTML = `<p class="bundles-empty">${App.escapeHtml(message)}</p>`;
  };

  setStatus("Loading bundles…");

  try {
    const bundles = await App.loadBundles();
    if (!Array.isArray(bundles) || !bundles.length) {
      setStatus("Bundle collections are on their way. Check back soon.");
      return;
    }

    const cards = bundles
      .map(bundle => {
        const slug = App.slugify(bundle.slug || bundle.id || bundle.name || "");
        const cardId = slug ? `bundle-${slug}` : "";
        const baseColor = bundle.color || "#6366f1";
        const accent = App.escapeHtml(baseColor);
        const soft = App.escapeHtml(App.hexToRgba(baseColor, 0.18));
        const strong = App.escapeHtml(App.hexToRgba(baseColor, 0.34));
        const badge = App.escapeHtml(bundle.badge || "Bundle");
        const name = App.escapeHtml(bundle.name || "Bundle");
        const tagline = App.escapeHtml(bundle.tagline || "");
        const price = App.escapeHtml(bundle.price || "");
        const savings = App.escapeHtml(bundle.savings || "");
        const includes = Array.isArray(bundle.includes) ? bundle.includes.filter(Boolean) : [];
        const includeMarkup = includes.length
          ? `<ul class="bundle-card__includes">${includes.map(item => `<li>${App.escapeHtml(item)}</li>`).join("")}</ul>`
          : "";
        const link =
          bundle.page ||
          bundle.detailPage ||
          bundle.detail_page ||
          bundle.href ||
          bundle.link ||
          bundle.stripe ||
          bundle.stripe_link ||
          "bundles.html";
        const safeLink = App.escapeHtml(link);
        const openNew = /^https?:/i.test(link);
        const targetAttrs = openNew ? ' target="_blank" rel="noopener"' : "";
        const cta = App.escapeHtml(bundle.cta || "View bundle");

        return `
          <article class="bundle-card"${cardId ? ` id="${cardId}"` : ""} style="--bundle-accent:${accent};--bundle-accent-soft:${soft};--bundle-accent-strong:${strong};">
            <span class="bundle-card__badge">${badge}</span>
            <h3>${name}</h3>
            ${tagline ? `<p class="tagline">${tagline}</p>` : ""}
            <div class="bundle-card__pricing">
              ${price ? `<span class="price">${price}</span>` : ""}
              ${savings ? `<span class="bundle-card__savings">Save ${savings}</span>` : ""}
            </div>
            ${includeMarkup}
            <div class="bundle-card__actions">
              <a class="btn primary" href="${safeLink}"${targetAttrs}>${cta}</a>
            </div>
          </article>
        `;
      })
      .join("");

    grid.innerHTML = cards;

    const preferReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let highlightTimer = null;

    const clearHighlights = () => {
      if (highlightTimer) {
        clearTimeout(highlightTimer);
        highlightTimer = null;
      }
      App.qsa(".bundle-card.is-highlighted").forEach(card => card.classList.remove("is-highlighted"));
    };

    const focusBundleFromHash = () => {
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw) return;
      const normalized = raw.startsWith("bundle-") ? raw.slice(7) : raw;
      const slug = App.slugify(normalized);
      if (!slug) return;
      const id = `bundle-${slug}`;
      const card = document.getElementById(id);
      if (!card) return;
      clearHighlights();
      card.classList.add("is-highlighted");

      const rect = card.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const headerOffset = 96;
      const top = Math.max(rect.top + scrollY - headerOffset, 0);
      window.scrollTo({ top, behavior: preferReducedMotion() ? "auto" : "smooth" });

      highlightTimer = setTimeout(() => {
        card.classList.remove("is-highlighted");
        highlightTimer = null;
      }, 2200);
    };

    focusBundleFromHash();

    if (!grid.dataset.bundleHashBound) {
      window.addEventListener("hashchange", focusBundleFromHash);
      grid.dataset.bundleHashBound = "true";
    }
  } catch (err) {
    console.error("Error loading bundles:", err);
    setStatus("We had trouble loading bundles. Please refresh and try again.");
  }
};

/*****************************************************
 * Products listing (products.html)
 *****************************************************/
App.initProducts = async function() {
  const container = App.qs("#products-list");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const areaSlug = params.get("area");
  const areaInfo = areaSlug ? App.LIFE_AREAS[areaSlug] : null;
  const heading = App.qs("#products-heading");
  const intro = App.qs("#products-intro");

  try {
    const products = await App.loadProducts();
    const activeProducts = App.filterActiveProducts(products);

    if (areaInfo) {
      if (heading) heading.textContent = areaInfo.title;
      if (intro) intro.textContent = areaInfo.description;
      document.title = `${areaInfo.title} — Harmony Sheets`;
    }

    let list = activeProducts;
    if (areaInfo) {
      list = activeProducts.filter(p => Array.isArray(p.lifeAreas) && p.lifeAreas.includes(areaSlug));
    }

    if (!list.length) {
      const emptyMessage = areaInfo?.empty || "We're crafting new tools for this area. Explore all Life Harmony templates in the meantime.";
      container.innerHTML = `
        <div class="products-empty">
          <p>${emptyMessage}</p>
          <a href="products.html">Browse all tools</a>
        </div>
      `;
      return;
    }

    container.innerHTML = list
      .map(
        p => {
          const tags = Array.isArray(p.lifeAreas)
            ? p.lifeAreas
                .map(tag => App.LIFE_AREAS[tag]?.short)
                .filter(Boolean)
                .map(t => `<span>${t}</span>`)
                .join("")
            : "";

          return `
        <div class="product-card">
          <a href="product.html?id=${p.id}">
            <div class="thumb">
              <img src="${p.colorImage || "assets/placeholder.png"}" alt="">
            </div>
            <h3>${p.name}</h3>
            <p class="muted">${p.tagline || ""}</p>
            <p class="price">${p.price || ""}</p>
            ${tags ? `<div class="product-tags">${tags}</div>` : ""}
          </a>
        </div>
      `;
        }
      )
      .join("");
  } catch (err) {
    console.error("Error loading products:", err);
  }
};

/*****************************************************
 * Home page life wheel (index.html)
 *****************************************************/
App.initHome = function() {
  const bestsellersGrid = App.qs("#home-grid");
  if (bestsellersGrid) {
    App.loadProducts()
      .then(products => {
        const activeProducts = App.filterActiveProducts(products);
        if (!activeProducts.length) {
          bestsellersGrid.innerHTML = "<p class=\"muted\">New templates are on the way. Check back soon!</p>";
          return;
        }

        const cards = activeProducts
          .map(product => {
            const productId = product && product.id ? String(product.id) : "";
            const link = productId ? `product.html?id=${encodeURIComponent(productId)}` : "products.html";
            const href = App.escapeHtml(link);
            const image = App.escapeHtml(product.colorImage || "assets/placeholder.png");
            const name = App.escapeHtml(product.name || "Harmony Sheets template");
            const tagline = App.escapeHtml(product.tagline || "");
            const price = App.escapeHtml(product.price || "");
            const tags = Array.isArray(product.lifeAreas)
              ? product.lifeAreas
                  .map(area => App.LIFE_AREAS[area]?.short)
                  .filter(Boolean)
                  .map(label => `<span>${App.escapeHtml(label)}</span>`)
                  .join("")
              : "";

            return `
              <div class="product-card">
                <a href="${href}">
                  <div class="thumb">
                    <img src="${image}" alt="">
                  </div>
                  <h3>${name}</h3>
                  <p class="muted">${tagline}</p>
                  <p class="price">${price}</p>
                  ${tags ? `<div class="product-tags">${tags}</div>` : ""}
                </a>
              </div>
            `;
          })
          .join("");

        bestsellersGrid.innerHTML = cards;
      })
      .catch(err => {
        console.error("Failed to load products for home bestsellers", err);
        bestsellersGrid.innerHTML = "<p class=\"muted\">We couldn't load featured templates right now. Please refresh.</p>";
      });
  }

  const details = App.qs("#life-wheel-details");
  const slices = App.qsa(".life-wheel__slice-link");
  if (!details || !slices.length) return;

  const defaultMarkup = details.innerHTML.trim();

  const iconLayer = App.qs(".life-wheel__icons");
  const graphic = iconLayer ? iconLayer.closest(".life-wheel__graphic") : App.qs(".life-wheel__graphic");

  const iconData = [];
  const labelData = [];

  const sliceIndices = new Map();
  const sliceLookup = new Map();
  slices.forEach((slice, index) => {
    if (slice.dataset.area) {
      sliceIndices.set(slice.dataset.area, index);
      sliceLookup.set(slice.dataset.area, slice);
    }
  });

  const iconLookup = new Map();
  const labelLookup = new Map();

  let labelLayer = graphic ? graphic.querySelector(".life-wheel__labels") : null;
  if (!labelLayer && graphic) {
    labelLayer = document.createElement("div");
    labelLayer.className = "life-wheel__labels";
    graphic.appendChild(labelLayer);
  }
  if (labelLayer) {
    labelLayer.innerHTML = "";
  }

  if (iconLayer) {
    iconLayer.innerHTML = "";
    slices.forEach((slice, index) => {
      const area = slice.dataset.area;
      const info = App.LIFE_AREAS[area];
      if (!info) return;

      const icon = document.createElement("div");
      icon.className = "life-wheel__icon";
      icon.dataset.area = area;
      icon.dataset.index = String(index);
      icon.style.setProperty("--area-color", info.color);
      icon.style.setProperty("--area-glow", App.hexToRgba(info.color, 0.34));

      const inner = document.createElement("span");
      inner.className = "life-wheel__icon-inner";
      inner.innerHTML = info.icon || "";

      icon.appendChild(inner);
      iconLayer.appendChild(icon);

      iconLookup.set(area, icon);
      iconData.push({ icon, index });

      if (labelLayer) {
        const label = document.createElement("a");
        label.className = "life-wheel__label";
        label.dataset.area = area;
        label.dataset.index = String(index);
        label.textContent = info.short || info.title || "";
        label.style.setProperty("--area-color", info.color);
        label.style.setProperty("--area-glow", App.hexToRgba(info.color, 0.26));
        const sliceEl = sliceLookup.get(area);
        const areaLink = info.link || sliceEl?.getAttribute("href") || `products.html?area=${area}`;
        label.href = areaLink;
        if (info.title) label.setAttribute("aria-label", info.title);
        labelLayer.appendChild(label);
        labelLookup.set(area, label);
        labelData.push({ label, index });

        if (sliceEl) {
          label.addEventListener("mouseenter", () => setActive(sliceEl));
          label.addEventListener("focus", () => setActive(sliceEl));
          label.addEventListener("pointerdown", event => {
            if (event.pointerType === "touch" || event.pointerType === "pen") {
              setActive(sliceEl);
            }
          });
        }
        label.addEventListener("mouseleave", () => scheduleReset());
        label.addEventListener("blur", () => reset());
      }
    });
  } else {
    App.qsa(".life-wheel__icon").forEach(icon => {
      const area = icon.dataset.area;
      if (!area) return;
      const info = App.LIFE_AREAS[area];
      let index = sliceIndices.has(area)
        ? sliceIndices.get(area)
        : parseInt(icon.dataset.index || "0", 10);
      if (!Number.isFinite(index)) index = 0;
      if (info) {
        icon.style.setProperty("--area-color", info.color);
        icon.style.setProperty("--area-glow", App.hexToRgba(info.color, 0.34));
      }
      icon.dataset.index = String(index);
      iconLookup.set(area, icon);
      iconData.push({ icon, index });

      if (labelLayer && info) {
        const label = document.createElement("a");
        label.className = "life-wheel__label";
        label.dataset.area = area;
        label.dataset.index = String(index);
        label.textContent = info.short || info.title || "";
        label.style.setProperty("--area-color", info.color);
        label.style.setProperty("--area-glow", App.hexToRgba(info.color, 0.26));
        const sliceEl = sliceLookup.get(area);
        const areaLink = info.link || sliceEl?.getAttribute("href") || `products.html?area=${area}`;
        label.href = areaLink;
        if (info.title) label.setAttribute("aria-label", info.title);
        labelLayer.appendChild(label);
        labelLookup.set(area, label);
        labelData.push({ label, index });

        if (sliceEl) {
          label.addEventListener("mouseenter", () => setActive(sliceEl));
          label.addEventListener("focus", () => setActive(sliceEl));
          label.addEventListener("pointerdown", event => {
            if (event.pointerType === "touch" || event.pointerType === "pen") {
              setActive(sliceEl);
            }
          });
        }
        label.addEventListener("mouseleave", () => scheduleReset());
        label.addEventListener("blur", () => reset());
      }
    });
  }

  const updateIconPositions = () => {
    if (!iconData.length && !labelData.length) return;
    const boundsSource = graphic || iconLayer || App.qs(".life-wheel__graphic");
    if (!boundsSource) return;
    const size = boundsSource.getBoundingClientRect().width;
    if (!size) return;

    const iconSize = Math.max(Math.min(size * 0.16, 68), 44);
    const outerRadius = size * (160 / 360);
    const radius = Math.max(outerRadius - iconSize * 0.5 - size * 0.015, outerRadius * 0.58);
    const labelRadius = outerRadius + Math.max(size * 0.085, iconSize * 0.5) + size * 0.008;
    const labelFont = Math.max(Math.min(size * 0.045, 18), 12);
    const center = size / 2;

    iconData.forEach(({ icon, index }) => {
      const angleDeg = -90 + index * 45;
      const angleRad = (Math.PI / 180) * angleDeg;
      const x = center + Math.cos(angleRad) * radius;
      const y = center + Math.sin(angleRad) * radius;
      icon.style.setProperty("--icon-x", `${x}px`);
      icon.style.setProperty("--icon-y", `${y}px`);
      icon.style.setProperty("--icon-size", `${iconSize}px`);
    });

    labelData.forEach(({ label, index }) => {
      const angleDeg = -90 + index * 45;
      const angleRad = (Math.PI / 180) * angleDeg;
      const x = center + Math.cos(angleRad) * labelRadius;
      const y = center + Math.sin(angleRad) * labelRadius;
      label.style.setProperty("--label-x", `${x}px`);
      label.style.setProperty("--label-y", `${y}px`);
      label.style.setProperty("--label-font-size", `${labelFont}px`);
      const alignment = Math.cos(angleRad);
      if (Math.abs(alignment) > 0.6) {
        label.dataset.align = alignment > 0 ? "right" : "left";
      } else {
        label.dataset.align = "center";
      }
    });
  };

  updateIconPositions();

  let resizeFrame = null;
  const handleResize = () => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(updateIconPositions);
  };

  window.addEventListener("resize", handleResize);


  const defaultState = {
    title: details.dataset.defaultTitle || "Explore the Life Harmony Wheel",
    description: details.dataset.defaultDescription || "",
    link: details.dataset.defaultLink || "products.html",
    cta: details.dataset.defaultCta || "Browse all Life Harmony tools",
    icon: null,
    color: null,
    area: null,
    customMarkup: defaultMarkup || null
  };

  const setAccent = color => {
    if (color) {
      details.style.setProperty("--detail-color", color);
      details.style.setProperty("--detail-glow", App.hexToRgba(color, 0.24));
      details.style.setProperty("--detail-sheen", App.hexToRgba(color, 0.14));
    } else {
      details.style.removeProperty("--detail-color");
      details.style.removeProperty("--detail-glow");
      details.style.removeProperty("--detail-sheen");
    }
  };

  const render = (state, isActive = false) => {
    const { title, description, link, cta, icon, area, customMarkup } = state;
    const iconMarkup = icon
      ? `<span class="life-wheel__detail-icon" aria-hidden="true">${icon}</span>`
      : "";
    if (customMarkup) {
      details.innerHTML = customMarkup;
    } else {
      details.innerHTML = `
        ${iconMarkup}
        <div class="life-wheel__detail-copy">
          <h3>${title}</h3>
          <p>${description}</p>
          <a class="life-wheel__cta" href="${link}">${cta}</a>
        </div>
      `;
    }
    if (area) {
      details.dataset.area = area;
    } else {
      details.removeAttribute("data-area");
    }
    details.classList.toggle("has-icon", Boolean(icon));
    details.classList.toggle("is-active", isActive);
    if (customMarkup) {
      App.initHeroRotation();
    }
  };

  let activeSlice = null;
  let activeIcon = null;
  let activeLabel = null;
  let resetTimer = null;

  const isMobileViewport = () => window.matchMedia("(max-width: 720px)").matches;

  let mobileScrollFrame = null;
  const ensureMobileView = () => {
    if (!isMobileViewport() || !graphic) return;

    const wheelRect = graphic.getBoundingClientRect();
    const detailsRect = details.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const top = Math.min(wheelRect.top, detailsRect.top) + scrollY;
    const bottom = Math.max(wheelRect.bottom, detailsRect.bottom) + scrollY;
    const viewTop = scrollY;
    const viewBottom = viewTop + window.innerHeight;
    const padding = 28;

    if (top >= viewTop + padding && bottom <= viewBottom - padding) {
      return;
    }

    const combined = bottom - top;
    const viewport = window.innerHeight;
    let target = top - padding;
    if (combined + padding * 2 <= viewport) {
      const midpoint = top + combined / 2;
      target = midpoint - viewport / 2;
    }

    const maxTarget = bottom - viewport + padding;
    if (Number.isFinite(maxTarget)) {
      target = Math.min(target, Math.max(0, maxTarget));
    }
    target = Math.max(0, target);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: target,
      behavior: prefersReduced ? "auto" : "smooth"
    });
  };

  const scheduleEnsureMobileView = () => {
    if (!isMobileViewport()) return;
    if (mobileScrollFrame) cancelAnimationFrame(mobileScrollFrame);
    mobileScrollFrame = requestAnimationFrame(() => {
      ensureMobileView();
      mobileScrollFrame = null;
    });
  };

  const setActive = slice => {
    const area = slice.dataset.area;
    const info = App.LIFE_AREAS[area];
    if (!info) return;
    clearTimeout(resetTimer);
    if (activeSlice && activeSlice !== slice) {
      activeSlice.classList.remove("is-active");
    }
    const iconEl = iconLookup.get(area);
    if (activeIcon && activeIcon !== iconEl) {
      activeIcon.classList.remove("is-active");
    }
    if (iconEl) {
      iconEl.classList.add("is-active");
    }
    const labelEl = labelLookup.get(area);
    if (activeLabel && activeLabel !== labelEl) {
      activeLabel.classList.remove("is-active");
    }
    if (labelEl) {
      labelEl.classList.add("is-active");
    }
    activeSlice = slice;
    activeIcon = iconEl || null;
    activeLabel = labelEl || null;
    slice.classList.add("is-active");
    setAccent(info.color);
    render({ ...info, area }, true);
    scheduleEnsureMobileView();
  };

  const reset = () => {
    clearTimeout(resetTimer);
    if (activeSlice) {
      activeSlice.classList.remove("is-active");
      activeSlice = null;
    }
    if (activeIcon) {
      activeIcon.classList.remove("is-active");
      activeIcon = null;
    }
    if (activeLabel) {
      activeLabel.classList.remove("is-active");
      activeLabel = null;
    }
    setAccent(null);
    render(defaultState, false);
  };

  const scheduleReset = () => {
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      if (details.matches(":hover")) return;
      reset();
    }, 140);
  };

  details.addEventListener("mouseenter", () => clearTimeout(resetTimer));
  details.addEventListener("mouseleave", reset);
  details.addEventListener("blur", reset, true);

  slices.forEach(slice => {
    const area = slice.dataset.area;
    const info = App.LIFE_AREAS[area];
    if (info) {
      slice.setAttribute("aria-label", info.title);
      const title = slice.querySelector("title");
      if (title) title.textContent = info.title;
    }

    slice.addEventListener("mouseenter", () => setActive(slice));
    slice.addEventListener("focus", () => setActive(slice));
    slice.addEventListener("mouseleave", scheduleReset);
    slice.addEventListener("blur", reset);
    slice.addEventListener("pointerdown", event => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        setActive(slice);
      }
    });
  });

  render(defaultState, false);
};

/*****************************************************
 * Home questionnaire modal (index.html)
 *****************************************************/
App.initQuestionnaire = function() {
  const modal = App.qs("[data-questionnaire-modal]");
  if (!modal || modal.dataset.initialized) return;

  const dialog = modal.querySelector("[data-questionnaire-dialog]");
  const form = modal.querySelector("[data-questionnaire-form]");
  if (!dialog || !form) return;

  const openers = App.qsa("[data-questionnaire-open]");
  if (!openers.length) return;

  modal.dataset.initialized = "true";

  const overlay = modal.querySelector("[data-questionnaire-overlay]");
  const closeButtons = modal.querySelectorAll("[data-questionnaire-close]");
  const result = modal.querySelector("[data-questionnaire-result]");
  const resultTitle = modal.querySelector("[data-questionnaire-result-title]");
  const resultText = modal.querySelector("[data-questionnaire-result-text]");
  const resultHighlights = modal.querySelector("[data-questionnaire-result-highlights]");
  const resultLink = modal.querySelector("[data-questionnaire-result-link]");
  const firstInput = modal.querySelector("[data-questionnaire-initial]");
  const defaultLinkText = resultLink ? resultLink.textContent : "";
  const defaultLinkHref = resultLink ? resultLink.getAttribute("href") : "";
  const focusableSelector = "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])";
  let lastFocused = null;

  const resetResult = () => {
    if (!result) return;
    result.hidden = true;
    result.setAttribute("aria-hidden", "true");
    if (resultTitle) resultTitle.textContent = "";
    if (resultText) resultText.textContent = "";
    if (resultHighlights) {
      resultHighlights.innerHTML = "";
      resultHighlights.hidden = true;
    }
    if (resultLink) {
      resultLink.textContent = defaultLinkText || "Browse templates";
      resultLink.setAttribute("href", defaultLinkHref || "products.html");
    }
  };

  resetResult();

  const getFocusable = () =>
    Array.from(dialog.querySelectorAll(focusableSelector)).filter(el => {
      if (el.disabled) return false;
      if (el.getAttribute("aria-hidden") === "true") return false;
      if (el.closest("[hidden]")) return false;
      return true;
    });

  const closeModal = () => {
    dialog.removeEventListener("keydown", handleKeyDown);
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modal.hidden = true;
    document.body.classList.remove("questionnaire-open");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };

  const handleKeyDown = event => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getFocusable();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const openModal = () => {
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.hidden = false;
    modal.removeAttribute("hidden");
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("is-open");
    document.body.classList.add("questionnaire-open");
    form.reset();
    resetResult();

    requestAnimationFrame(() => {
      const target = firstInput && typeof firstInput.focus === "function" ? firstInput : dialog;
      if (target && typeof target.focus === "function") target.focus();
    });

    dialog.addEventListener("keydown", handleKeyDown);
  };

  openers.forEach(trigger => {
    trigger.addEventListener("click", event => {
      event.preventDefault();
      openModal();
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener("click", event => {
      event.preventDefault();
      closeModal();
    });
  });

  if (overlay) {
    overlay.addEventListener("click", () => {
      closeModal();
    });
  }

  form.addEventListener("change", () => {
    resetResult();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(form);
    const area = formData.get("focus-area");
    const areas = App.LIFE_AREAS || {};
    const info = area ? areas[area] : null;

    const fallback = {
      title: "Explore the Harmony Sheets library",
      description: "Browse the full collection to find a template that fits right now.",
      link: "products.html",
      cta: "Browse all templates"
    };

    const details = info || fallback;
    if (resultTitle) resultTitle.textContent = details.title || fallback.title;
    if (resultText) resultText.textContent = details.description || fallback.description;

    if (resultHighlights) {
      const highlights = info && Array.isArray(info.menuHighlights) ? info.menuHighlights.filter(Boolean) : [];
      if (highlights.length) {
        resultHighlights.innerHTML = highlights.map(item => `<li>${item}</li>`).join("");
        resultHighlights.hidden = false;
      } else {
        resultHighlights.innerHTML = "";
        resultHighlights.hidden = true;
      }
    }

    if (resultLink) {
      const href = details.link || defaultLinkHref || "products.html";
      const text = details.cta || defaultLinkText || "Browse templates";
      resultLink.setAttribute("href", href);
      resultLink.textContent = text;
    }

    if (result) {
      result.hidden = false;
      result.setAttribute("aria-hidden", "false");
    }
  });
};

/*****************************************************
 * Home parallax feature (index.html)
 *****************************************************/
App.initHomeParallax = async function() {
  const sections = App.qsa("[data-home-parallax]");
  if (!sections.length) return;

  let productsCache = null;
  const loadProducts = async () => {
    if (productsCache) return productsCache;
    try {
      productsCache = await App.loadProducts();
      return productsCache;
    } catch (err) {
      console.error("Failed to load products for home parallax", err);
      return null;
    }
  };

  const getProductById = async id => {
    if (!id) return null;
    const allProducts = await loadProducts();
    if (!Array.isArray(allProducts)) return null;
    return allProducts.find(item => item && item.id === id) || null;
  };

  for (const section of sections) {
    try {
      const productId = section.dataset.featuredProduct;
      const manualImage = section.dataset.image;
      const parallaxEl = section.querySelector(".hero-parallax__media");

      let product = null;
      if (productId) {
        product = await getProductById(productId);
      }

      let backgroundImage = "";
      if (manualImage && manualImage.trim()) {
        backgroundImage = manualImage.trim();
      } else if (product) {
        backgroundImage = App.getProductHeroImage(product);
      }

      if (parallaxEl) {
        if (backgroundImage) {
          const encodedUrl = encodeURI(backgroundImage);
          parallaxEl.style.backgroundImage = `url("${encodedUrl}")`;
          parallaxEl.classList.add("is-active");
          const speedAttr = parseFloat(parallaxEl.dataset.parallaxSpeed || section.dataset.parallaxSpeed || "0.25");
          App.registerParallax(parallaxEl, Number.isFinite(speedAttr) ? speedAttr : 0.25);
        } else {
          parallaxEl.classList.add("is-hidden");
        }
      }

      if (!product) continue;

      const nameEl = section.querySelector("[data-home-name]");
      if (nameEl && product.name) nameEl.textContent = product.name;

      const taglineEl = section.querySelector("[data-home-tagline]");
      if (taglineEl && product.tagline) taglineEl.textContent = product.tagline;

      const badgesEl = section.querySelector("[data-home-badges]");
      if (badgesEl && Array.isArray(product.badges) && product.badges.length) {
        badgesEl.innerHTML = product.badges
          .slice(0, 4)
          .map(badge => `<span class="badge">${badge}</span>`)
          .join("");
      }

      const featuresEl = section.querySelector("[data-home-features]");
      if (featuresEl && Array.isArray(product.features) && product.features.length) {
        featuresEl.innerHTML = product.features
          .slice(0, 3)
          .map(feature => `<li>${feature}</li>`)
          .join("");
      }

      const priceEl = section.querySelector("[data-home-price]");
      if (priceEl && product.price) priceEl.textContent = product.price;

      const ctaEl = section.querySelector("[data-home-link]");
      if (ctaEl) {
        const productUrl = `product.html?id=${encodeURIComponent(product.id)}`;
        ctaEl.href = productUrl;
      }
    } catch (err) {
      console.error("Failed to initialize home parallax section", err);
    }
  }
};

/*****************************************************
 * Product cart helpers
 *****************************************************/
App.prepareProductCart = function(product) {
  if (!product || !product.id) return;
  App.currentProduct = product;
  App.addToCartButtons = App.qsa("[data-add-to-cart]");
  if (!App.addToCartButtons.length) return;
  const productId = product.id;
  App.addToCartButtons.forEach(btn => {
    btn.disabled = false;
    btn.dataset.cartProductId = productId;
    if (!btn.dataset.cartBound) {
      btn.addEventListener("click", () => {
        App.addToCart(product);
        App.showAddToCartFeedback(productId);
      });
      btn.dataset.cartBound = "true";
    }
  });
  App.updateAddToCartButtons(productId);
};

App.updateAddToCartButtons = function(productId) {
  if (!App.addToCartButtons || !App.addToCartButtons.length) return;
  const inCart = App.cart.items.some(item => item.id === productId);
  App.addToCartButtons.forEach(btn => {
    if (btn.dataset.cartProductId !== productId) return;
    btn.classList.remove("is-added");
    if (inCart) {
      btn.classList.add("is-in-cart");
      btn.textContent = "In cart";
    } else {
      btn.classList.remove("is-in-cart");
      btn.textContent = "Add to cart";
    }
  });
};

App.showAddToCartFeedback = function(productId) {
  if (!App.addToCartButtons || !App.addToCartButtons.length) return;
  App.addToCartButtons.forEach(btn => {
    if (btn.dataset.cartProductId !== productId) return;
    btn.classList.add("is-added");
    btn.classList.remove("is-in-cart");
    btn.textContent = "Added!";
    setTimeout(() => {
      btn.classList.remove("is-added");
      App.updateAddToCartButtons(productId);
    }, 1400);
  });
};


/*****************************************************
 * Product detail (product.html)
 *****************************************************/
App.initProduct = async function() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  if (!productId) return;

  try {
    const products = await App.loadProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;

    App.currentProduct = product;

    if (product.draft) {
      document.body.classList.add("product-draft");
      const statusEl = App.qs("#p-status");
      if (statusEl) {
        statusEl.innerHTML = "<strong>Draft preview</strong> This listing is hidden from the public catalog. Use the demo below to keep iterating.";
        statusEl.removeAttribute("hidden");
      }
      const draftActions = App.qs("#p-draft-actions");
      if (draftActions) draftActions.removeAttribute("hidden");
      const draftDemoLink = App.qs("#p-draft-demo");
      if (draftDemoLink) {
        if (product.virtualDemo) {
          draftDemoLink.href = product.virtualDemo;
          draftDemoLink.removeAttribute("hidden");
        } else {
          draftDemoLink.setAttribute("hidden", "");
        }
      }
    } else {
      document.body.classList.remove("product-draft");
      const statusEl = App.qs("#p-status");
      if (statusEl) {
        statusEl.innerHTML = "";
        statusEl.setAttribute("hidden", "");
      }
      const draftActions = App.qs("#p-draft-actions");
      if (draftActions) draftActions.setAttribute("hidden", "");
      const draftDemoLink = App.qs("#p-draft-demo");
      if (draftDemoLink) {
        draftDemoLink.removeAttribute("href");
        draftDemoLink.setAttribute("hidden", "");
      }
    }

    // Hero background image
    const parallaxEl = App.qs("#p-parallax");
    if (parallaxEl) {
      const heroImageUrl = App.getProductHeroImage(product);
      if (heroImageUrl) {
        const encodedUrl = encodeURI(heroImageUrl);
        parallaxEl.style.backgroundImage = `url("${encodedUrl}")`;
        parallaxEl.classList.add("is-active");
        const speedAttr = parseFloat(parallaxEl.dataset.parallaxSpeed || "0.25");
        App.registerParallax(parallaxEl, Number.isFinite(speedAttr) ? speedAttr : 0.25);
      } else {
        parallaxEl.classList.add("is-hidden");
      }
    }

    // Title + name
    document.title = product.name + " — Harmony Sheets";
    App.qs("#p-name").textContent = product.name;
    if (App.qs("#p-title")) App.qs("#p-title").textContent = product.name;

    // Tagline
    if (product.tagline) App.qs("#p-tagline").textContent = product.tagline;

    // Badges
    if (product.badges && App.qs("#p-badges")) {
      App.qs("#p-badges").innerHTML = product.badges.map(b => `<span class="badge">${b}</span>`).join("");
    }

    // Price
    if (product.price && App.qs("#p-price")) App.qs("#p-price").textContent = product.price;

    // Features
    if (product.features && App.qs("#p-features")) {
      App.qs("#p-features").innerHTML = product.features.map(f => `<li>${f}</li>`).join("");
    }

    // Description
    if (product.description && App.qs("#p-description")) {
      App.qs("#p-description").innerHTML = product.description;
    }

    // Social proof
    if (product.socialProof && App.qs("#p-social")) {
      App.qs("#p-social").innerHTML = `
        <div class="social-proof">
          <div class="stars">${product.socialProof.stars || ""}</div>
          <div class="muted">${product.socialProof.quote || ""}</div>
        </div>`;
    }

    // Benefits
    if (product.benefits && App.qs("#p-benefits")) {
      App.qs("#p-benefits").innerHTML = `
        <div class="features-grid">
          ${product.benefits.map(b => `
            <div class="feature-card">
              <h4>${b.title}</h4>
              <p>${b.desc}</p>
            </div>`).join("")}
        </div>`;
    }

    // Color variations
    if (product.colorImage && App.qs("#p-color-image")) {
      App.qs("#p-color-image").src = product.colorImage;
      if (product.colorCaption) App.qs("#p-color-caption").textContent = product.colorCaption;
    } else if (App.qs("#p-colors")) {
      App.qs("#p-colors").style.display = "none";
    }

    // Demo video
    if (product.demoVideo && App.qs("#p-demo")) {
      App.qs("#p-demo").innerHTML = `
        <video controls muted playsinline width="100%" height="100%" ${product.demoPoster ? `poster="${product.demoPoster}"` : ""}>
          <source src="${product.demoVideo}" type="video/mp4">
        </video>`;
    } else if (App.qs("#p-demo-section")) {
      App.qs("#p-demo-section").style.display = "none";
    }

    // Virtual demo
    const virtualDemoFrame = App.qs('[data-virtual-demo]');
    const DEFAULT_VIRTUAL_DEMO = 'Google sheets products/demo/pomodoro.html';
    if (virtualDemoFrame) {
      const screen = virtualDemoFrame.querySelector('.device-frame__screen');
      const virtualDemoUrl = product.virtualDemo || DEFAULT_VIRTUAL_DEMO;
      if (virtualDemoUrl && screen) {
        virtualDemoFrame.setAttribute('data-loading', 'true');
        screen.innerHTML = `
          <div class="virtual-demo">
            <div class="virtual-demo__viewport" data-demo-viewport>
              <iframe src="${virtualDemoUrl}" title="${product.name} interactive demo" loading="lazy"></iframe>
            </div>
          </div>`;

        const iframe = screen.querySelector('iframe');
        const viewport = screen.querySelector('[data-demo-viewport]');
        const BASE_WIDTH = 1300;
        const BASE_HEIGHT = 800;

        const scaleFrame = () => {
          if (!viewport || !iframe) return;
          const width = viewport.clientWidth;
          if (!width) return;
          const scale = width / BASE_WIDTH;
          iframe.style.width = `${BASE_WIDTH}px`;
          iframe.style.height = `${BASE_HEIGHT}px`;
          iframe.style.transform = `scale(${scale})`;
        };

        if (iframe) {
          iframe.style.position = 'absolute';
          iframe.style.left = '0';
          iframe.style.top = '0';
          iframe.style.transformOrigin = 'top left';
          iframe.addEventListener('load', () => {
            virtualDemoFrame.removeAttribute('data-loading');
            scaleFrame();
          });
        }

        if (typeof ResizeObserver !== 'undefined' && viewport) {
          const resizeObserver = new ResizeObserver(() => scaleFrame());
          resizeObserver.observe(viewport);
        }

        window.addEventListener('resize', scaleFrame);
        requestAnimationFrame(() => scaleFrame());

        if (viewport) {
          viewport.setAttribute('tabindex', '0');
          viewport.setAttribute('role', 'button');
          viewport.setAttribute('aria-haspopup', 'dialog');
          viewport.setAttribute('aria-expanded', 'false');
          viewport.setAttribute('aria-label', `Open the interactive ${product.name} demo`);

          if (!viewport.querySelector('.virtual-demo__cta')) {
            viewport.insertAdjacentHTML('beforeend', `
              <div class="virtual-demo__cta">
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span>Launch interactive demo</span>
              </div>
            `);
          }

          let modalInstance;
          let modalKeybound = false;

          const closeModal = () => {
            if (!modalInstance || modalInstance.hasAttribute('hidden')) return;
            modalInstance.classList.remove('is-active');
            document.body.classList.remove('virtual-demo-modal-open');
            viewport.setAttribute('aria-expanded', 'false');

            const iframeEl = modalInstance.querySelector('iframe');
            if (iframeEl) iframeEl.blur();

            const finalizeClose = () => {
              modalInstance.setAttribute('hidden', '');
            };

            const onTransitionEnd = () => {
              finalizeClose();
              modalInstance.removeEventListener('transitionend', onTransitionEnd);
            };

            modalInstance.addEventListener('transitionend', onTransitionEnd, { once: true });
            window.setTimeout(() => {
              if (modalInstance && !modalInstance.classList.contains('is-active')) finalizeClose();
            }, 320);

            window.setTimeout(() => viewport.focus(), 50);
          };

          const handleGlobalKeydown = event => {
            if (event.key === 'Escape') closeModal();
          };

          const getModal = () => {
            if (!modalInstance) {
              modalInstance = document.createElement('div');
              modalInstance.className = 'virtual-demo-modal';
              modalInstance.setAttribute('data-demo-modal', '');
              modalInstance.setAttribute('hidden', '');
              modalInstance.innerHTML = `
                <div class="virtual-demo-modal__backdrop" data-demo-dismiss></div>
                <div class="virtual-demo-modal__content" role="dialog" aria-modal="true">
                  <button type="button" class="virtual-demo-modal__close" data-demo-dismiss aria-label="Close interactive demo">
                    <span aria-hidden="true">×</span>
                  </button>
                  <div class="virtual-demo-modal__body">
                    <iframe loading="lazy" allowfullscreen></iframe>
                  </div>
                </div>`;

              document.body.appendChild(modalInstance);

              modalInstance.querySelectorAll('[data-demo-dismiss]').forEach(element => {
                element.addEventListener('click', () => closeModal());
              });
            }

            if (!modalKeybound) {
              document.addEventListener('keydown', handleGlobalKeydown);
              modalKeybound = true;
            }

            return modalInstance;
          };

          const openModal = () => {
            const modalEl = getModal();
            const dialogEl = modalEl.querySelector('.virtual-demo-modal__content');
            if (dialogEl) dialogEl.setAttribute('aria-label', `${product.name} interactive demo`);

            const iframeEl = modalEl.querySelector('iframe');
            if (iframeEl) {
              iframeEl.title = `${product.name} interactive demo`;
              if (iframeEl.src !== virtualDemoUrl) iframeEl.src = virtualDemoUrl;
            }

            modalEl.removeAttribute('hidden');
            requestAnimationFrame(() => modalEl.classList.add('is-active'));
            document.body.classList.add('virtual-demo-modal-open');
            viewport.setAttribute('aria-expanded', 'true');

            const closeButton = modalEl.querySelector('.virtual-demo-modal__close');
            window.setTimeout(() => closeButton && closeButton.focus(), 150);
          };

          viewport.addEventListener('click', event => {
            event.preventDefault();
            openModal();
          });

          viewport.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openModal();
            }
          });
        }
      } else if (screen) {
        const guideSection = App.qs('#p-virtual-guide');
        if (guideSection) guideSection.style.display = 'none';
        virtualDemoFrame.style.display = 'none';
        screen.innerHTML = '<p>This is where the live product preview will appear.</p>';
      }
    }

    // Included
    if (product.included && App.qs("#p-included")) {
      App.qs("#p-included").innerHTML = `
        <h3>What you get</h3>
        <ul>${product.included.map(i => `<li>${i}</li>`).join("")}</ul>`;
    }

    // FAQs
    if (product.faqs && App.qs("#p-faqs")) {
      App.qs("#p-faqs").innerHTML = `
        <h3>FAQs</h3>
        ${product.faqs.map(f => `
          <details class="faq">
            <summary>${f.q}</summary>
            <p>${f.a}</p>
          </details>`).join("")}`;
    }

    // Pricing
    if (product.pricingTitle && App.qs("#p-pricing-title")) App.qs("#p-pricing-title").textContent = product.pricingTitle;
    if (product.pricingSub && App.qs("#p-pricing-sub")) App.qs("#p-pricing-sub").textContent = product.pricingSub;

    // Links
    ["p-stripe", "p-stripe-2"].forEach(id => {
      const el = App.qs("#" + id);
      if (el && product.stripe) el.href = product.stripe;
    });
    ["p-etsy", "p-etsy-2"].forEach(id => {
      const el = App.qs("#" + id);
      if (el && product.etsy) el.href = product.etsy;
    });

    if (product.draft) {
      App.qsa("[data-add-to-cart]").forEach(btn => {
        if (!btn) return;
        btn.disabled = true;
        btn.textContent = "Draft preview";
        btn.classList.add("is-disabled");
        btn.setAttribute("aria-disabled", "true");
      });
      if (App.qs("#p-pricing-title")) App.qs("#p-pricing-title").textContent = "Product in draft review";
      if (App.qs("#p-pricing-sub")) App.qs("#p-pricing-sub").textContent = "Purchasing is disabled until this template is ready to launch.";
    } else {
      App.qsa("[data-add-to-cart]").forEach(btn => {
        if (!btn) return;
        btn.disabled = false;
        btn.removeAttribute("aria-disabled");
        btn.classList.remove("is-disabled");
        if (!btn.dataset.cartProductId) {
          btn.textContent = "Add to cart";
        }
      });
      App.prepareProductCart(product);
    }

    // Suggestion form product_id
    const pid = App.qs("#product_id");
    if (pid) pid.value = product.id;

  } catch (err) {
    console.error("Error loading product:", err);
  }
};

/*****************************************************
 * Suggestion form
 *****************************************************/
App.initSuggestForm = function() {
  const form = App.qs("#suggest-form");
  if (!form) return;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const status = App.qs("#suggest-status");
    if (status) status.textContent = "Sending...";
    try {
      // Fake send
      await new Promise(res => setTimeout(res, 600));
      if (status) status.textContent = "Thanks for your idea!";
      form.reset();
    } catch (err) {
      console.error(err);
      if (status) status.textContent = "Error, try again later.";
    }
  });
};

/*****************************************************
 * DOM ready
 *****************************************************/
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
