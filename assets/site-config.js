export const SITES = {
  "www.harmony-sheets.com": {
    supabaseUrl: "https://jvjmmzbbipnlzhzzyncx.supabase.co",
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2am1temJpYnBubHpoenp5bmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjYyMzksImV4cCI6MjA3NjEwMjIzOX0.JyaY7kJbbZKKBCj_UX6M-t-eKoK9WJibcJjlLZnSvWA",
    redirectTo: "https://www.harmony-sheets.com/auth/callback"
  },
  "harmony-sheets.com": {
    supabaseUrl: "https://jvjmmzbbipnlzhzzyncx.supabase.co",
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2am1temJpYnBubHpoenp5bmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjYyMzksImV4cCI6MjA3NjEwMjIzOX0.JyaY7kJbbZKKBCj_UX6M-t-eKoK9WJibcJjlLZnSvWA",
    redirectTo: "https://harmony-sheets.com/auth/callback"
  },

  // Placeholder for re-use in LifeGoalApp repo later (do not modify here)
  "www.lifegoalapp.com": {
    supabaseUrl: "https://muanayogiboxoofktkynv.supabase.co",
    anonKey: "<LIFEGOAL_ANON_KEY>",
    redirectTo: "https://www.lifegoalapp.com/auth/callback"
  },
  "lifegoalapp.com": {
    supabaseUrl: "https://muanayogiboxoofktkynv.supabase.co",
    anonKey: "<LIFEGOAL_ANON_KEY>",
    redirectTo: "https://lifegoalapp.com/auth/callback"
  }
};

export function getSiteConfig() {
  return SITES[location.hostname] || SITES["www.harmony-sheets.com"];
}
