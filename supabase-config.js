export const SUPABASE_URL = "https://jvjmmzbibpnlzhzzyncx.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2am1temJpYnBubHpoenp5bmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjYyMzksImV4cCI6MjA3NjEwMjIzOX0.JyaY7kJbbZKKBCj_UX6M-t-eKoK9WJibcJjlLZnSvWA";

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
