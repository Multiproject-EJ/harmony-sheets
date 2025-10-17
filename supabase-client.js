import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.42.7/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const STORAGE_KEY = "sb-hs-auth";

let supabaseSingleton = null;

function createSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: STORAGE_KEY
    }
  });
}

export function getSupabaseClient() {
  if (!supabaseSingleton) {
    supabaseSingleton = createSupabaseClient();
  }
  return supabaseSingleton;
}

export function __internalResetSupabaseClient() {
  supabaseSingleton = null;
}
