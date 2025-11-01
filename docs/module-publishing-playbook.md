# Module Publishing Playbook

This guide covers the workflow for shipping new Harmony Sheets storefront modules from content entry through launch QA. It lives alongside the website codebase to document the hand-off between the public store, the internal admin tools, and the Google Sheets source files stored in `Google sheets products/` and `Google sheets demo/`.

When a module graduates from the demo site, copy the Apps Script bundle from the repo into the production Google Sheet's script editor. The sheet itself acts as the product database, while the HTML service popup provides the UI layer inside Google Sheets. This ensures the downloadable file customers receive matches the experience previewed on harmony-sheets.com.

## How to add new modules

1. **Populate content fields:** Complete all key/value entries in `products.json`, including `title`, `description`, `ctaLabel`, `sheetId`, `price`, `badge`, and any module-specific metadata. Mirror those fields in the Supabase table if the module must be referenceable server-side.
2. **Prep marketing visuals:** Export gallery and hero screenshots at 1600×900 and 1200×900 respectively, keeping file sizes under 500 KB. Save assets to `assets/modules/<module-name>/` and update references in `editor.js` and `products.html`.
3. **Apply shared styling hooks:** Wrap feature blocks with the `module-card` base class plus any contextual modifiers (for example, `module-card--premium`). Leverage existing utility classes from `style.css` (spacing, typography, and button treatments) rather than authoring new ad-hoc CSS.

## On-brand experience tips

- **Color palette:** Stick to the core Harmony Sheets colors (`--brand-primary`, `--brand-accent`, and neutral grays) defined in `style.css`. Avoid introducing new hex codes unless approved by design.
- **Typography:** Use the bundled web fonts (`Inter` for headings, `Source Sans Pro` for body copy) and adhere to the `h2`, `h3`, `p`, and `button` styles provided by the global stylesheet.
- **Iconography:** Source icons from the existing `assets/icons/` set. Match stroke widths and rounded corners for any custom icons generated in Figma before exporting as optimized SVGs.
- **Supabase/data linking:** Confirm that new modules map to existing Supabase rows via the `module_slug` column. When introducing new relational fields (e.g., bundles, feature flags), update `admin-dashboard.js` and associated Supabase SQL policies so editors can read/write the data.

## Pre-launch QA checklist

- [ ] Accessibility audit: verify keyboard focus order, contrast ratios, and alternative text on new imagery using the browser's accessibility tree.
- [ ] Responsive review: test breakpoints at 360 px, 768 px, 1024 px, and 1440 px to ensure layout integrity across mobile, tablet, and desktop.
- [ ] Formula validation: open the module's sheet template, run all key formulas, and confirm there are no broken references or circular dependencies.
