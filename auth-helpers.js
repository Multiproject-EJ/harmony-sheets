import { SUPABASE_ADMIN_EMAIL } from "./supabase-config.js";

export const ACCOUNT_PAGE_PATH = "account.html";
export const ADMIN_DASHBOARD_PATH = "admin_dashboard.html";
export const ADMIN_WORKSPACE_PATH = "admin_customer_service.html";

function normalizeEmail(value) {
  if (!value) return "";
  return String(value).trim().toLowerCase();
}

const configuredAdminEmail = normalizeEmail(SUPABASE_ADMIN_EMAIL);

function getNestedValue(source, path) {
  return path.reduce((value, key) => {
    if (value && typeof value === "object") {
      return value[key];
    }
    return undefined;
  }, source);
}

function isTruthyFlag(value) {
  if (value === true) return true;
  if (typeof value === "number") {
    return Number.isFinite(value) && value !== 0;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    return ["true", "1", "yes", "y", "on", "enabled", "admin", "owner"].includes(normalized);
  }
  return false;
}

const ADMIN_KEYWORDS = new Set(["admin", "administrator", "owner", "superuser"]);

function containsAdminKeyword(value) {
  if (!value) return false;
  if (Array.isArray(value)) {
    return value.some(containsAdminKeyword);
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    return ADMIN_KEYWORDS.has(normalized);
  }
  if (typeof value === "object") {
    return Object.values(value).some(containsAdminKeyword);
  }
  return false;
}

export function getConfiguredAdminEmail() {
  return configuredAdminEmail;
}

export function isAdminUser(user) {
  if (!user || typeof user !== "object") return false;

  const adminEmail = getConfiguredAdminEmail();
  if (adminEmail) {
    const userEmail = normalizeEmail(user.email);
    if (userEmail && userEmail === adminEmail) return true;

    const metaEmailSources = [
      user.user_metadata?.adminEmail,
      user.user_metadata?.admin_email,
      user.user_metadata?.email,
      user.app_metadata?.adminEmail,
      user.app_metadata?.admin_email
    ];
    for (const value of metaEmailSources) {
      if (normalizeEmail(value) === adminEmail) return true;
    }

    const emailCollections = [
      user.user_metadata?.adminEmails,
      user.user_metadata?.admin_emails,
      user.app_metadata?.adminEmails,
      user.app_metadata?.admin_emails
    ];
    for (const collection of emailCollections) {
      if (!collection) continue;
      if (Array.isArray(collection)) {
        if (collection.some(value => normalizeEmail(value) === adminEmail)) {
          return true;
        }
      } else if (typeof collection === "string") {
        const candidates = collection
          .split(/[\s,;]+/)
          .map(normalizeEmail)
          .filter(Boolean);
        if (candidates.includes(adminEmail)) {
          return true;
        }
      }
    }
  }

  if (typeof user.role === "string" && user.role.trim().toLowerCase() === "admin") {
    return true;
  }

  const roleCandidates = [];
  const roleCollections = [
    user.app_metadata?.roles,
    user.user_metadata?.roles
  ];
  for (const roles of roleCollections) {
    if (Array.isArray(roles)) {
      roleCandidates.push(...roles);
    } else if (typeof roles === "string") {
      roleCandidates.push(roles);
    }
  }

  for (const role of roleCandidates) {
    if (typeof role === "string" && role.trim().toLowerCase() === "admin") {
      return true;
    }
  }

  const singleRole = [
    user.app_metadata?.role,
    user.user_metadata?.role
  ].find(value => typeof value === "string");
  if (singleRole && singleRole.trim().toLowerCase() === "admin") {
    return true;
  }

  const adminFlagPaths = [
    ["app_metadata", "is_admin"],
    ["user_metadata", "is_admin"],
    ["app_metadata", "admin"],
    ["user_metadata", "admin"],
    ["app_metadata", "isAdmin"],
    ["user_metadata", "isAdmin"],
    ["app_metadata", "adminUser"],
    ["user_metadata", "adminUser"],
    ["app_metadata", "admin_user"],
    ["user_metadata", "admin_user"],
    ["app_metadata", "is_owner"],
    ["user_metadata", "is_owner"],
    ["app_metadata", "owner"],
    ["user_metadata", "owner"],
    ["app_metadata", "claims", "admin"],
    ["user_metadata", "claims", "admin"],
    ["app_metadata", "claims_admin"],
    ["user_metadata", "claims_admin"],
    ["app_metadata", "permissions"],
    ["user_metadata", "permissions"],
    ["app_metadata", "features"],
    ["user_metadata", "features"],
    ["app_metadata", "flags"],
    ["user_metadata", "flags"]
  ];

  for (const path of adminFlagPaths) {
    const value = getNestedValue(user, path);
    if (isTruthyFlag(value) || containsAdminKeyword(value)) {
      return true;
    }
  }

  return false;
}

export function getPostSignInRedirect(user, fallback = ACCOUNT_PAGE_PATH) {
  if (isAdminUser(user)) {
    return ADMIN_DASHBOARD_PATH;
  }
  if (typeof fallback === "string" && fallback.trim()) {
    return fallback;
  }
  return ACCOUNT_PAGE_PATH;
}

export function sanitizeRedirect(target, fallback = ACCOUNT_PAGE_PATH) {
  const defaultFallback = typeof fallback === "string" && fallback.trim() ? fallback.trim() : ACCOUNT_PAGE_PATH;
  if (!target) return defaultFallback;
  const trimmed = String(target).trim();
  if (!trimmed) return defaultFallback;

  try {
    const resolved = new URL(trimmed, window.location.origin);
    if (resolved.origin !== window.location.origin) {
      return defaultFallback;
    }
    const path = `${resolved.pathname}${resolved.search}${resolved.hash}`;
    return path || defaultFallback;
  } catch (error) {
    return defaultFallback;
  }
}
