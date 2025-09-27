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
    color: "#F471B5",
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
    color: "#A855F7",
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
    color: "#22C55E",
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
    color: "#FACC15",
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
    color: "#FB923C",
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
    color: "#60A5FA",
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
    color: "#14B8A6",
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
    color: "#6366F1",
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
    illustration: "assets/hero-line-harmony.svg",
    illustrationAlt: "Abstract concentric lines with sparkles representing harmony"
  },
  {
    text: "From Chaos to Clarity",
    color: "#14B8A6",
    animation: "wave",
    illustration: "assets/hero-line-clarity.svg",
    illustrationAlt: "Flowing lines gathering into a focused beam"
  },
  {
    text: "Bring Balance to Your Day",
    color: "#F97316",
    animation: "flip",
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

  const animationClasses = ["is-wave", "is-glide", "is-flip"];

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

    if (phrase && phrase.illustration) {
      const nextSrc = phrase.illustration;
      if (illustration.getAttribute("src") !== nextSrc) {
        illustration.setAttribute("src", nextSrc);
      }
    } else if (defaultIllustrationSrc) {
      illustration.setAttribute("src", defaultIllustrationSrc);
    }

    if (phrase && Object.prototype.hasOwnProperty.call(phrase, "illustrationAlt")) {
      illustration.setAttribute("alt", phrase.illustrationAlt || "");
    } else {
      illustration.setAttribute("alt", defaultIllustrationAlt);
    }
  };

  const applyPhrase = (phrase, previousPhrase) => {
    target.innerHTML = "";
    target.dataset.text = phrase.text;
    updateIllustration(phrase);

    if (phrase.animation === "flip") {
      createFlipSpan(phrase.text, previousPhrase ? previousPhrase.text : "");
    } else {
      target.textContent = phrase.text;
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
    image: "assets/Pomodoro1.webp"
  },
  "budget-dashboard": {
    type: "Finance Dashboard",
    format: "Sheets",
    badge: "Best-Seller"
  },
  "pomodoro-pro": {
    type: "Focus System",
    format: "Web App + Sheets",
    badge: "Popular",
    image: "assets/Pomodoro1.webp"
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

App.slugify = function(value) {
  if (!value) return "";
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

App.productsPromise = null;
App.loadProducts = function() {
  if (!App.productsPromise) {
    App.productsPromise = fetch("products.json")
      .then(res => res.json())
      .catch(err => {
        App.productsPromise = null;
        throw err;
      });
  }
  return App.productsPromise;
};

App.bundlesPromise = null;
App.loadBundles = function() {
  if (!App.bundlesPromise) {
    App.bundlesPromise = fetch("bundles.json")
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load bundles: ${res.status}`);
        return res.json();
      })
      .catch(err => {
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
  const count = App.getCartCount();
  const toggle = App.cartEls.toggle;
  const countEl = App.cartEls.count;
  const label = App.cartEls.label;

  if (countEl) {
    countEl.textContent = count > 9 ? "9+" : String(count);
    countEl.classList.toggle("is-visible", count > 0);
  }

  if (toggle) {
    toggle.classList.toggle("has-items", count > 0);
    toggle.setAttribute("aria-label", count === 1 ? "View cart (1 item)" : `View cart (${count} items)`);
  }

  if (label) {
    label.textContent = count === 1 ? "View cart (1 item)" : `View cart (${count} items)`;
  }

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
  App.cartEls.panel.classList.add("is-open");
  App.cartEls.panel.setAttribute("aria-hidden", "false");
  if (App.cartEls.overlay) App.cartEls.overlay.classList.add("is-active");
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
 * Init
 *****************************************************/
App.init = function() {
  App.initNav();
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
App.closeNavMenu = () => {};
App.initNav = function() {
  const toggle = App.qs(".nav-toggle");
  const nav = App.qs(".main-nav");
  if (!toggle || !nav) {
    App.closeNavMenu = () => {};
    return;
  }

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (typeof App.closeBrowseMenu === "function") App.closeBrowseMenu();
    if (typeof App.closeBundlesMenu === "function") App.closeBundlesMenu();
  };

  const handleToggle = () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (!isOpen && typeof App.closeBrowseMenu === "function") App.closeBrowseMenu();
    if (!isOpen && typeof App.closeBundlesMenu === "function") App.closeBundlesMenu();
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
    const accentColor = navAccentMap[areaId] || getCategoryInfo(areaId)?.color || navAccentMap.all;
    const rawImage = typeof item.image === "string" ? item.image.trim() : "";
    const image = rawImage || "";
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
      accentColor
    };
  };

  const buildAreaProducts = rawProducts => {
    const map = {};
    areaOrder.forEach(id => {
      map[id] = [];
    });

    const extras = App.NAV_AREA_EXTRAS || {};
    Object.entries(extras).forEach(([areaId, items]) => {
      if (!Array.isArray(items) || !items.length) return;
      if (!map[areaId]) map[areaId] = [];
      items.forEach(item => {
        map[areaId].push(normalizeEntry(areaId, item, map[areaId].length));
      });
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
          image: meta.image
        };
        const areaOverrides = meta.areas || {};
        areas.forEach(areaId => {
          if (!map[areaId]) map[areaId] = [];
          const override = areaOverrides[areaId] || {};
          map[areaId].push(normalizeEntry(areaId, { ...base, ...override }, map[areaId].length));
        });
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
  const catButtonMap = new Map();
  let rowsEl = null;
  let infoTextEl = null;
  let searchInput = null;
  let sortSelect = null;
  let previewEl = null;
  let previewContentEl = null;
  let tableEl = null;
  let activePreviewId = null;
  let activePreviewRow = null;
  let hasRowListeners = false;
  const previewItemMap = new Map();
  const createInitials = value => {
    const text = String(value || "").trim();
    if (!text) return "HS";
    const parts = text.split(/\s+/).filter(Boolean);
    if (!parts.length) return "HS";
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const setActiveRow = row => {
    if (activePreviewRow === row) return;
    if (activePreviewRow) {
      activePreviewRow.classList.remove("is-active");
    }
    activePreviewRow = row || null;
    if (activePreviewRow) {
      activePreviewRow.classList.add("is-active");
    }
  };

  const resetPreview = () => {
    if (!previewEl || !previewContentEl) return;
    previewContentEl.innerHTML = '<p class="nav-mega__preview-placeholder">Hover a product to see quick facts.</p>';
    previewEl.classList.add("is-empty");
    activePreviewId = null;
    setActiveRow(null);
  };

  const findRowById = id => {
    if (!rowsEl || !id) return null;
    const selectorId = String(id);
    if (window.CSS && typeof window.CSS.escape === "function") {
      return rowsEl.querySelector(`[data-nav-item="${window.CSS.escape(selectorId)}"]`);
    }
    return Array.from(rowsEl.querySelectorAll("[data-nav-item]")).find(row => row.getAttribute("data-nav-item") === selectorId) || null;
  };

  const renderPreview = (item, row, navIdOverride = null) => {
    if (!previewEl || !previewContentEl) return;
    if (!item) {
      resetPreview();
      return;
    }

    const safeName = App.escapeHtml(item.name || "Harmony Sheets tool");
    const safeTagline = App.escapeHtml(item.tagline || "");
    const safeUrl = App.escapeHtml(item.url || "#");
    const fallbackAccent = navAccentMap[navState.cat] || getCategoryInfo(navState.cat)?.color || navAccentMap.all;
    const previewAccent = item.accentColor || fallbackAccent;
    previewEl.style.setProperty("--nav-mega-preview-acc", previewAccent);
    const imageSrc = item.image ? App.escapeHtml(item.image) : "";
    const initials = App.escapeHtml(createInitials(item.name));
    const mediaMarkup = imageSrc
      ? `<div class="nav-mega__preview-media"><img class="nav-mega__preview-img" src="${imageSrc}" alt="${safeName} thumbnail"></div>`
      : `<div class="nav-mega__preview-media nav-mega__preview-media--placeholder" aria-hidden="true"><span>${initials}</span></div>`;
    const facts = [
      item.type ? { label: "Type", value: item.type } : null,
      item.format ? { label: "Format", value: item.format } : null,
      item.priceDisplay ? { label: "Price", value: item.priceDisplay } : null
    ].filter(Boolean);
    const factsMarkup = facts
      .map(fact => `<li><span>${App.escapeHtml(fact.label)}</span><strong>${App.escapeHtml(fact.value)}</strong></li>`)
      .join("");

    previewContentEl.innerHTML = `
      ${mediaMarkup}
      <h3 class="nav-mega__preview-title">${safeName}</h3>
      ${safeTagline ? `<p class="nav-mega__preview-tagline">${safeTagline}</p>` : ""}
      ${factsMarkup ? `<ul class="nav-mega__preview-facts">${factsMarkup}</ul>` : ""}
      <a class="nav-mega__preview-link" href="${safeUrl}">View product</a>
    `;
    previewEl.classList.remove("is-empty");
    const resolvedId = navIdOverride || item.id || null;
    activePreviewId = resolvedId;
    if (row) {
      setActiveRow(row);
    } else if (resolvedId) {
      const foundRow = findRowById(resolvedId);
      setActiveRow(foundRow || null);
    } else {
      setActiveRow(null);
    }
  };

  const previewDefault = () => {
    const first = previewItemMap.keys().next();
    if (!first || first.done) {
      resetPreview();
      return;
    }
    const id = first.value;
    const item = previewItemMap.get(id);
    const row = findRowById(id);
    renderPreview(item, row || undefined, id);
  };

  const handleRowEvent = event => {
    const row = event.target.closest("[data-nav-item]");
    if (!row) return;
    const id = row.getAttribute("data-nav-item");
    if (!id) return;
    const item = previewItemMap.get(id);
    if (!item) return;
    renderPreview(item, row, id);
  };

  const attachRowListeners = () => {
    if (!rowsEl || hasRowListeners) return;
    rowsEl.addEventListener("mouseover", handleRowEvent);
    rowsEl.addEventListener("focusin", handleRowEvent);
    rowsEl.addEventListener("mouseleave", previewDefault);
    rowsEl.addEventListener("focusout", event => {
      if (!rowsEl.contains(event.relatedTarget)) previewDefault();
    });
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

  const updateCounts = () => {
    catButtonMap.forEach(({ count }, id) => {
      if (!count) return;
      const total = Array.isArray(areaProducts[id]) ? areaProducts[id].length : 0;
      count.textContent = total;
    });
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

  const updateActive = () => {
    if (!panelEl) return;
    if (!areaOrder.includes(navState.cat)) {
      navState.cat = areaOrder[0];
    }

    const info = getCategoryInfo(navState.cat) || {};
    const accent = navAccentMap[navState.cat] || info.color || navAccentMap.all;
    panelEl.dataset.area = navState.cat;
    panelEl.style.setProperty("--nav-mega-acc", accent);

    if (previewEl) {
      previewEl.style.setProperty("--nav-mega-preview-acc", accent);
    }

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

    catButtonMap.forEach(({ button }, id) => {
      if (!button) return;
      const isActive = id === navState.cat;
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });

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

    previewItemMap.clear();

    if (rowsEl) {
      if (!totalItems) {
        const message = query
          ? `No matches for “${navState.q}”.`
          : info.empty || "Fresh tools coming soon.";
        rowsEl.innerHTML = `<tr class="nav-mega__empty-row"><td colspan="4">${App.escapeHtml(message)}</td></tr>`;
        resetPreview();
      } else {
        let firstNavId = null;
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
            if (index === 0) firstNavId = navId;
            previewItemMap.set(navId, item);
            return `<tr class="nav-mega__row" data-nav-item="${App.escapeHtml(navId)}"><td><a class="nav-mega__product-link" href="${url}">${name}</a></td><td>${type}</td><td>${badgeMarkup}</td><td class="nav-mega__price">${priceText}</td></tr>`;
          })
          .join("");
        rowsEl.innerHTML = rows;

        if (activePreviewId && previewItemMap.has(activePreviewId)) {
          const activeItem = previewItemMap.get(activePreviewId);
          const activeRow = findRowById(activePreviewId);
          if (activeItem && activeRow) {
            renderPreview(activeItem, activeRow, activePreviewId);
            return;
          }
        }

        resetPreview();
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

    if (!totalItems) {
      previewItemMap.clear();
    }

    scheduleReposition();
  };

  const renderShell = () => {
    const catItems = areaOrder
      .map(id => {
        const info = getCategoryInfo(id);
        if (!info) return "";
        const label = App.escapeHtml(info.short || info.title || id);
        const safeId = App.escapeHtml(id);
        const count = Array.isArray(areaProducts[id]) ? areaProducts[id].length : 0;
        const extraClass = ` nav-mega__catbtn--${safeId}`;
        return `
          <li>
            <button class="nav-mega__catbtn${extraClass}" type="button" data-nav-cat="${safeId}" aria-current="${id === navState.cat}">
              <span class="nav-mega__dot nav-mega__dot--${safeId}"></span>
              <span class="nav-mega__catname">${label}</span>
              <span class="nav-mega__count" data-nav-count>${count}</span>
            </button>
          </li>
        `;
      })
      .join("");

    const currentInfo = getCategoryInfo(navState.cat) || {};
    const initialLabel = App.escapeHtml(currentInfo.title || currentInfo.short || "Life Harmony tools");

    content.innerHTML = `
      <div class="nav-mega__panel" data-nav-panel data-area="${App.escapeHtml(navState.cat)}">
        <div class="nav-mega__pane">
          <aside class="nav-mega__cats">
            <div class="nav-mega__cats-head">Explore</div>
            <ul class="nav-mega__catlist">
              ${catItems}
            </ul>
          </aside>
          <div class="nav-mega__prod">
            <div class="nav-mega__prod-head">
              <div class="nav-mega__tools">
                <label class="nav-mega__search">
                  <span class="sr-only">Search Life Harmony tools</span>
                  <input type="search" placeholder="Search tools…" value="${App.escapeHtml(navState.q)}" data-nav-search>
                </label>
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
                    <th scope="col" style="width:54%">Product</th>
                    <th scope="col" style="width:20%">Type</th>
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
          <div class="nav-mega__preview is-empty" data-nav-preview>
            <div class="nav-mega__preview-content" data-nav-preview-content>
              <p class="nav-mega__preview-placeholder">Hover a product to see quick facts.</p>
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
    previewEl = content.querySelector("[data-nav-preview]");
    previewContentEl = content.querySelector("[data-nav-preview-content]");
    tableEl = content.querySelector("[data-nav-table]");

    catButtonMap.clear();
    content.querySelectorAll("[data-nav-cat]").forEach(btn => {
      const id = btn.getAttribute("data-nav-cat");
      const count = btn.querySelector("[data-nav-count]");
      catButtonMap.set(id, { button: btn, count });
      btn.addEventListener("click", () => {
        if (navState.cat === id) return;
        navState.cat = id;
        updateActive();
      });
    });

    if (previewEl && previewContentEl) {
      resetPreview();
    }

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
  updateCounts();
  updateActive();

  App.loadProducts()
    .then(products => {
      areaProducts = buildAreaProducts(products);
      updateCounts();
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
      renderBundlesMenu(
        [
          {
            slug: "back-to-school",
            name: "Back to School Bundle",
            navTagline: "Class schedules, assignments, and study flow in one dashboard.",
            color: "#2563eb"
          },
          {
            slug: "premium",
            name: "Premium Bundle",
            navTagline: "Unlock the complete toolkit of flagship templates.",
            color: "#7c3aed"
          },
          {
            slug: "full-life-hack",
            name: "Full Life Hack Bundle",
            navTagline: "Transform every area with aligned rituals and dashboards.",
            color: "#0ea5e9"
          },
          {
            slug: "personal-finance",
            name: "Personal Finance Bundle",
            navTagline: "Budgets, debt payoff, and savings snapshots at a glance.",
            color: "#22c55e"
          }
        ],
        true
      );
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

    if (areaInfo) {
      if (heading) heading.textContent = areaInfo.title;
      if (intro) intro.textContent = areaInfo.description;
      document.title = `${areaInfo.title} — Harmony Sheets`;
    }

    let list = products;
    if (areaInfo) {
      list = products.filter(p => Array.isArray(p.lifeAreas) && p.lifeAreas.includes(areaSlug));
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
  const details = App.qs("#life-wheel-details");
  const slices = App.qsa(".life-wheel__slice-link");
  if (!details || !slices.length) return;

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
    area: null
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
    const { title, description, link, cta, icon, area } = state;
    const iconMarkup = icon
      ? `<span class="life-wheel__detail-icon" aria-hidden="true">${icon}</span>`
      : "";
    details.innerHTML = `
      ${iconMarkup}
      <div class="life-wheel__detail-copy">
        <h3>${title}</h3>
        <p>${description}</p>
        <a class="life-wheel__cta" href="${link}">${cta}</a>
      </div>
    `;
    if (area) {
      details.dataset.area = area;
    } else {
      details.removeAttribute("data-area");
    }
    details.classList.toggle("has-icon", Boolean(icon));
    details.classList.toggle("is-active", isActive);
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

    // Gallery images
    const galleryEl = App.qs("#p-slider");
    if (galleryEl) {
      const slides = Array.isArray(product.gallery) ? product.gallery.filter(item => item && item.src) : [];
      if (!slides.length) {
        galleryEl.innerHTML = "";
        galleryEl.style.display = "none";
      } else {
        galleryEl.style.removeProperty("display");
        const fallbackBase = product.name ? `${product.name} preview` : "Product preview";
        const totalSlides = slides.length;
        const slidesMarkup = slides
          .map((item, index) => {
            const src = App.escapeHtml(item.src);
            const rawAlt = typeof item.alt === "string" ? item.alt.trim() : "";
            const altSource = rawAlt || (totalSlides > 1 ? `${fallbackBase} ${index + 1}` : fallbackBase);
            const alt = App.escapeHtml(altSource);
            const styleAttr = index === 0 ? ' style="display:block;"' : "";
            return `<div class="slide"${styleAttr}><img src="${src}" alt="${alt}"></div>`;
          })
          .join("\n");
        const navMarkup = totalSlides > 1
          ? `\n<button class="prev" aria-label="Previous">‹</button>\n<button class="next" aria-label="Next">›</button>`
          : "";
        galleryEl.innerHTML = `${slidesMarkup}${navMarkup}`;
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

    App.prepareProductCart(product);

    // Suggestion form product_id
    const pid = App.qs("#product_id");
    if (pid) pid.value = product.id;

    // Init gallery slider
    App.initGallery();
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
 * Gallery slider
 *****************************************************/
App.initGallery = function() {
  const gallery = App.qs("#p-slider");
  if (!gallery) return;

  const slides = App.qsa("#p-slider .slide");
  let idx = 0;
  const show = i => slides.forEach((s, n) => s.style.display = n === i ? "block" : "none");
  if (slides.length) show(idx);

  const prev = gallery.querySelector(".prev");
  const next = gallery.querySelector(".next");
  if (prev) prev.addEventListener("click", () => { idx = (idx - 1 + slides.length) % slides.length; show(idx); });
  if (next) next.addEventListener("click", () => { idx = (idx + 1) % slides.length; show(idx); });
};

/*****************************************************
 * DOM ready
 *****************************************************/
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
