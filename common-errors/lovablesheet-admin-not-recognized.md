# Common error: LovableSheet page doesn't recognise logged-in admin

## Symptom
- Visiting https://www.harmony-sheets.com/lovablesheet.html shows the "Access restricted" or "You need an admin account" message even when the same browser is signed in as an admin and other admin pages (e.g., admin_dashboard.html) work.

## Root causes
- Race condition: the page checks session immediately after load; getSession() is null because auth state hasn't been rehydrated yet.
- Missing or misloaded supabase configuration on this page.
- Stale HTML/JS served (duplicate files in repo: lovablesheet.html vs lovables_sheet.html).
- isAdminUser() expecting admin metadata not present in the session this page sees.
- CDN/browser cache serving an old copy of lovablesheet.js.

## Quick diagnosis (do these in order)
1. Open devtools Console and Network on lovablesheet.html.
   - Look for console errors, especially around "Unable to load session" or custom logs from lovablesheet.js.
2. Confirm lovablesheet.js being served is the expected version (check Network -> lovablesheet.js -> response).
3. From console, check current session:
   - `window.supabaseClient?.auth?.getSession()?.then(console.log)`
4. Compare how admin_dashboard checks admin vs lovablesheet.js — inspect both files to find differences.
5. Check the live page source to ensure the correct HTML (lovablesheet.html) is being served (View Page Source).
6. Hard-refresh (Ctrl/Cmd + Shift + R) or clear cache and retry.

## Quick (low-risk) fix
- Prevent immediate redirect when session==null. Wait briefly for auth state change.

Example snippet to add to `lovablesheet.js` init():

```javascript
// Debug and small wait so a recently rehydrated session is caught
const { data, error } = await supabaseClient.auth.getSession();
let user = data?.session?.user;
if (!user) {
  // wait up to 2s for onAuthStateChange to deliver a session
  user = await new Promise(resolve => {
    const timeout = setTimeout(() => resolve(null), 2000);
    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      clearTimeout(timeout);
      listener?.subscription?.unsubscribe?.();
      resolve(session?.user ?? null);
    });
  });
}
if (!requireAdmin(user)) return;
```

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
