const FALLBACK_URL = "YOUR_SUPABASE_URL";
const FALLBACK_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

function safeGet(object, ...keys) {
  return keys.reduce((value, key) => {
    if (value && typeof value === "object" && key in value) {
      return value[key];
    }
    return undefined;
  }, object);
}

function readFromGlobal(...keys) {
  if (typeof globalThis !== "object" || !globalThis) return undefined;
  return safeGet(globalThis, ...keys);
}

function readFromMeta(name) {
  if (typeof document === "undefined") return undefined;
  const element = document.querySelector(`meta[name="${name}"]`);
  return element?.content;
}

function readConfigValue({
  direct,
  meta,
  env,
  fallback
}) {
  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  if (typeof env === "string" && env.trim()) {
    return env.trim();
  }

  if (typeof meta === "string" && meta.trim()) {
    return meta.trim();
  }

  return fallback;
}

const globalConfig = readFromGlobal("HarmonySheetsSupabase") ?? readFromGlobal("harmonySheetsSupabase") ?? readFromGlobal("SUPABASE_CONFIG") ?? readFromGlobal("env") ?? readFromGlobal("__env") ?? {};

const resolvedUrl = readConfigValue({
  direct:
    readFromGlobal("SUPABASE_URL") ??
    readFromGlobal("Supabase")?.url ??
    readFromGlobal("HarmonySheetsSupabase", "url") ??
    readFromGlobal("__SUPABASE__", "url") ??
    safeGet(globalConfig, "SUPABASE_URL") ??
    safeGet(globalConfig, "supabaseUrl"),
  env:
    readFromGlobal("process", "env", "SUPABASE_URL") ??
    readFromGlobal("process", "env", "VITE_SUPABASE_URL") ??
    readFromGlobal("process", "env", "PUBLIC_SUPABASE_URL"),
  meta: readFromMeta("supabase-url") ?? readFromMeta("harmony-sheets-supabase-url"),
  fallback: FALLBACK_URL
});

const resolvedAnonKey = readConfigValue({
  direct:
    readFromGlobal("SUPABASE_ANON_KEY") ??
    readFromGlobal("Supabase")?.anonKey ??
    readFromGlobal("HarmonySheetsSupabase", "anonKey") ??
    readFromGlobal("__SUPABASE__", "anonKey") ??
    safeGet(globalConfig, "SUPABASE_ANON_KEY") ??
    safeGet(globalConfig, "supabaseAnonKey"),
  env:
    readFromGlobal("process", "env", "SUPABASE_ANON_KEY") ??
    readFromGlobal("process", "env", "VITE_SUPABASE_ANON_KEY") ??
    readFromGlobal("process", "env", "PUBLIC_SUPABASE_ANON_KEY"),
  meta: readFromMeta("supabase-anon-key") ?? readFromMeta("harmony-sheets-supabase-anon-key"),
  fallback: FALLBACK_ANON_KEY
});

const resolvedAdminEmail = readConfigValue({
  direct:
    readFromGlobal("SUPABASE_ADMIN_EMAIL") ??
    readFromGlobal("HarmonySheetsSupabase", "adminEmail") ??
    safeGet(globalConfig, "SUPABASE_ADMIN_EMAIL") ??
    safeGet(globalConfig, "adminEmail"),
  env:
    readFromGlobal("process", "env", "SUPABASE_ADMIN_EMAIL") ??
    readFromGlobal("process", "env", "VITE_SUPABASE_ADMIN_EMAIL") ??
    readFromGlobal("process", "env", "PUBLIC_SUPABASE_ADMIN_EMAIL"),
  meta: readFromMeta("supabase-admin-email") ?? readFromMeta("harmony-sheets-supabase-admin-email"),
  fallback: ""
});

export const SUPABASE_URL = resolvedUrl;
export const SUPABASE_ANON_KEY = resolvedAnonKey;
export const SUPABASE_ADMIN_EMAIL = resolvedAdminEmail; // Optional: set to the admin Supabase email to enable automatic dashboard redirects.

export function isSupabaseConfigured() {
  return (
    typeof SUPABASE_URL === "string" &&
    SUPABASE_URL.startsWith("http") &&
    typeof SUPABASE_ANON_KEY === "string" &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_URL.includes("YOUR_SUPABASE") &&
    !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE")
  );
}
