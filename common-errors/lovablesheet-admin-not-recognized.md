# Common error: LovableSheet page doesn't recognize logged-in admin

**Occurrence counter:** 2 (last updated 2025-11-14)

1. **2025-03-08 – Missing `updateIdeaStageUI` guard.** ReferenceError prevented `lovablesheet.js` from running, leaving the loading card on screen.
2. **2025-11-14 – Auth listener short-circuit.** `lovablesheet.js` returned before subscribing to Supabase auth events whenever the initial `getSession()` call returned `null`, so admins who already had a valid session stayed stuck on the "Verifying your admin access…" card until they hard-refreshed.

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

### 3. Always subscribe to auth changes even when the first session check fails (Nov 2025)

**Symptom:** Console is clean, but the LovableSheet card stays on "Loading LovableSheet / Verifying your admin access…" forever even though the user is already signed in elsewhere as an admin.

**Root cause:** `lovablesheet.js` used to call `requireAdmin(user)` immediately after `getSession()`/`onAuthStateChange` resolved. If that initial call returned `null` (common when Supabase rehydration is slow), the function returned before registering the long-lived `onAuthStateChange` listener, so later session events were ignored.

**Resolution (Nov 14, 2025):**

- Added an optional `redirect` flag to `requireAdmin()` so the first check can show the unauthorized card without forcing a redirect.
- Updated `init()` to call `requireAdmin(user, { redirect: false })` and, regardless of the outcome, always register the Supabase auth listener so a delayed session will still unlock the page.
- The auth listener now relies on `requireAdmin()` for redirect logic and simply re-initializes the board tools when access is granted.

Increment the counter above any time this checklist is needed again and add a short dated note describing the new root cause + fix.

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
