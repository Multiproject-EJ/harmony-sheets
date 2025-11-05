# Common error: LovableSheet page doesn't recognize logged-in admin

## Symptom
- Visiting lovablesheet.html shows the "Access restricted" or "You need an admin account" message even when the same browser is signed in as an admin and other admin pages (e.g., admin_dashboard.html) work.

## Root causes
- Race condition: the page checks session immediately after load; getSession() is null because auth state hasn't been rehydrated yet.
- Missing or misloaded supabase configuration on this page.
- Stale HTML/JS served (duplicate files in repo: lovablesheet.html vs lovables_sheet.html).
- isAdminUser() expecting admin metadata not present in the session this page sees.
- CDN/browser cache serving an old copy of lovablesheet.js.
- **March 2025 regression:** `initializeStepNavigation()` assumed a global `updateIdeaStageUI` existed and referenced it directly. On browsers where that function isn't defined, the page threw `ReferenceError: updateIdeaStageUI is not defined`, leaving the UI stuck on "Loading LovableSheet" forever.

## Quick diagnosis (do these in order)
1. Open devtools Console and Network on lovablesheet.html.
   - Look for console errors, especially `updateIdeaStageUI is not defined` or "Unable to load session" messages from lovablesheet.js.
2. Confirm lovablesheet.js being served is the expected version (check Network -> lovablesheet.js -> response).
3. From console, check current session:
   - `window.supabaseClient?.auth?.getSession()?.then(console.log)`
4. Compare how admin_dashboard checks admin vs lovablesheet.js — inspect both files to find differences.
5. Check the live page source to ensure the correct HTML (lovablesheet.html) is being served (View Page Source).
6. Hard-refresh (Ctrl/Cmd + Shift + R) or clear cache and retry.

## Quick (low-risk) fixes

### 1. Guard step-navigation hook against missing globals

**Symptom:** Console shows `ReferenceError: updateIdeaStageUI is not defined`, and the page never leaves the loading card.

**Resolution:** Update `initializeStepNavigation()` so it only hooks into `updateIdeaStageUI` when that function exists. Example (now in production):

```javascript
const existingUpdateIdeaStageUI =
  (typeof window !== "undefined" && typeof window.updateIdeaStageUI === "function"
    ? window.updateIdeaStageUI
    : null) ||
  (typeof updateIdeaStageUI === "function" ? updateIdeaStageUI : null);

if (existingUpdateIdeaStageUI) {
  const originalFunc = existingUpdateIdeaStageUI;
  window.updateIdeaStageUI = function (...args) {
    const result = originalFunc.apply(this, args);
    checkStep1Completion();
    return result;
  };
}
```

### 2. Prevent immediate redirect when session === null

- Wait briefly for `onAuthStateChange` to deliver a session before redirecting non-admins (see `lovablesheet.js:init()` for the current pattern).

## Permanent recommendations
- Centralize auth checks into a shared helper used by all admin pages.
- Update requireAdmin() to show a Loading state rather than redirecting immediately when session is null.
- Ensure supabase-config.js is included and loaded before lovablesheet.js.
- Remove duplicate HTML files or ensure deployment only uses the canonical file.
- Add logging around session and isAdminUser so you can quickly see in console why a user was rejected.

## Troubleshooting checklist for next time
- Is lovablesheet.js the latest version? (Network response / file hash)
- Is supabase-config loaded before the module?
- Does getSession() return a session on this page? If not, does onAuthStateChange later supply a session?
- Does the session payload include the admin flag used by isAdminUser()?
- Is a CDN caching an older file?
