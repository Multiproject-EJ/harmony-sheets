# Admin dashboard static bundle fallback (Oct 16, 2025)

## Summary
Both debug snapshots taken on October 16, 2025 show the admin dashboard bootloader determining that it was running on the production host (`www.harmony-sheets.com`) and therefore skipping the Vite dev-server probe. In this mode the dashboard should immediately hydrate from the pre-built static bundle located under `admin/assets/`. The logs confirm that we never attempt to contact the dev server and no runtime errors were captured, so the issue is limited to the environment routing logic rather than a JavaScript failure.

## Root cause
* Requests to `/admin/` are being served from the public production host. The bootloader treats any non-local hostname as production and forces the static bundle path.
* The current production build of the static bundle has not been refreshed since the last set of Supabase schema changes. As a result, once the static code loads it is missing the newer API surface and silently stalls on data fetches.

## Remediation plan
1. **Rebuild the admin bundle**: run `npm install` (if needed) and then `npm run build:admin` to regenerate `admin/assets/admin.css` and `admin/assets/admin.js` against the latest code.
2. **Deploy the updated assets**: publish the refreshed files to the CDN bucket backing `https://www.harmony-sheets.com/admin/assets/` and purge the CDN cache so new visitors pick up the update immediately.
3. **Add a regression check**: update the deployment playbook to include a smoke test that loads `/admin/` with `?debug=1` and verifies that `window.HarmonySheetsAdminBoot.assets.static.status` reports `"success"`.
4. **Add a temporary host override**: update `admin/index.html` to honor a `?forceDev=1` query flag that bypasses the host check, then document the option so engineers can opt into the Vite dev server during remote debugging sessions from staging domains.

## Current status
* Bundle rebuild scheduled for the next deployment window.
* CDN publish checklist updated with the new smoke test.
* Implementation ticket filed to add and document the `?forceDev=1` override during the next sprint.
