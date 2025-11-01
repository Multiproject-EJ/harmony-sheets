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

## Module publishing playbook

### How to add new modules

1. **Populate content fields:** Complete all key/value entries in `products.json`, including `title`, `description`, `ctaLabel`, `sheetId`, `price`, `badge`, and any module-specific metadata. Mirror those fields in the Supabase table if the module must be referenceable server-side.
2. **Prep marketing visuals:** Export gallery and hero screenshots at 1600×900 and 1200×900 respectively, keeping file sizes under 500 KB. Save assets to `assets/modules/<module-name>/` and update references in `editor.js` and `products.html`.
3. **Apply shared styling hooks:** Wrap feature blocks with the `module-card` base class plus any contextual modifiers (for example, `module-card--premium`). Leverage existing utility classes from `style.css` (spacing, typography, and button treatments) rather than authoring new ad-hoc CSS.

### On-brand experience tips

- **Color palette:** Stick to the core Harmony Sheets colors (`--brand-primary`, `--brand-accent`, and neutral grays) defined in `style.css`. Avoid introducing new hex codes unless approved by design.
- **Typography:** Use the bundled web fonts (`Inter` for headings, `Source Sans Pro` for body copy) and adhere to the `h2`, `h3`, `p`, and `button` styles provided by the global stylesheet.
- **Iconography:** Source icons from the existing `assets/icons/` set. Match stroke widths and rounded corners for any custom icons generated in Figma before exporting as optimized SVGs.
- **Supabase/data linking:** Confirm that new modules map to existing Supabase rows via the `module_slug` column. When introducing new relational fields (e.g., bundles, feature flags), update `admin-dashboard.js` and associated Supabase SQL policies so editors can read/write the data.

### Pre-launch QA checklist

- [ ] Accessibility audit: verify keyboard focus order, contrast ratios, and alternative text on new imagery using the browser's accessibility tree.
- [ ] Responsive review: test breakpoints at 360 px, 768 px, 1024 px, and 1440 px to ensure layout integrity across mobile, tablet, and desktop.
- [ ] Formula validation: open the module's sheet template, run all key formulas, and confirm there are no broken references or circular dependencies.
