# harmony-sheets
Website for Harmony Sheets — smart spreadsheet tools for organization, productivity, and planning.

## Supabase authentication setup

The customer login and freemium sign-up experience lives at [`login.html`](login.html) and is powered by Supabase Auth. Follow the [step-by-step Supabase setup guide](docs/supabase-setup.md) for:

* creating a Supabase account and project,
* configuring email authentication and redirect URLs,
* supplying the anon key to `supabase-config.js` (either inline or via environment/meta configuration),
* provisioning a `profiles` table (plus row-level security policies) that mirrors stored user metadata, and
* testing the full login, signup, and password reset flows locally.

> **Note:** Because Supabase's anon key is intended to be public, committing it to the static front-end is safe. Never expose service role keys in front-end code.

## Admin dashboard

The admin workspace is now the static [`admin_dashboard.html`](admin_dashboard.html) page. Supabase Auth still gates access: the page verifies the visitor's session, checks the admin email or flags via `auth-helpers.js`, and only then loads the product editor (`editor.js`).

To use the dashboard locally:

1. Update [`supabase-config.js`](supabase-config.js) with your Supabase project URL, anon key, and optional admin email override.
2. Serve the site with any static file server (or open `admin_dashboard.html` via `npm run dev` from the project root if you already use Vite/Live Server tooling).
3. Sign in with an authorized admin account. Once authenticated, the editor unlocks, pulls product data from `products.json`, and saves your changes to `localStorage` until you export.

The legacy React/Vite admin bundle has been removed from the repository. Historical Supabase SQL snippets and Edge Function references remain in [`docs/admin-debug-logs/`](docs/admin-debug-logs/) for archival purposes.
