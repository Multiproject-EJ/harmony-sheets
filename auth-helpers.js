import { SUPABASE_ADMIN_EMAIL } from "./supabase-config.js";

export const ACCOUNT_PAGE_PATH = "account.html";
export const ADMIN_DASHBOARD_PATH = "admin/";

function normalizeEmail(value) {
  if (!value) return "";
  return String(value).trim().toLowerCase();
}

const configuredAdminEmail = normalizeEmail(SUPABASE_ADMIN_EMAIL);

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

  const booleanAdminFlags = [
    user.app_metadata?.is_admin,
    user.user_metadata?.is_admin,
    user.app_metadata?.admin,
    user.user_metadata?.admin
  ];
  if (booleanAdminFlags.some(value => value === true)) {
    return true;
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
