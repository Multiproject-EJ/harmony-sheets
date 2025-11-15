# Google Sheets Demo Product Guidelines

This README captures the constraints and patterns that every demo product in this directory must follow. Use it as a checklist before producing or updating any Google Sheets–based demo so that the prototype matches what is technically achievable inside a live spreadsheet.

## Core Principles

1. **Stay native to Sheets.** Everything rendered to the user must come from native Sheets UI elements (cells, charts, pivot tables, slicers, conditional formatting, filters, protected ranges, etc.). Assume the demo will be copied into a blank Google Sheet without access to custom HTML/CSS layouts that would exist on the web.
2. **Keep data tabular.** All structured data lives in worksheet tabs. Favor tall tables (records stored in rows, fields in columns) over wide tables. Avoid hidden storage formats such as merged cells, floating text boxes, or images for storing values.
3. **Single source of truth.** Every calculated value, chart, or visualization must derive from cells in the same spreadsheet. Do not rely on external databases or APIs unless you can reproduce the connection with Apps Script or connected sheets.
4. **Copy/paste ready.** A user should be able to duplicate the entire demo by copying the spreadsheet. Avoid dependencies on shared drives, external assets, or custom install steps that would break when the sheet is duplicated.

## What You Can Do in Google Sheets

- **Formulas & Functions:** All standard Sheets functions (ARRAYFORMULA, QUERY, FILTER, LET, LAMBDA, MAP, REDUCE, BYROW/BYCOL, etc.) are available. Complex calculations should be implemented with combinations of these rather than custom JavaScript logic.
- **Data Validation & Controls:** Dropdowns, checkboxes, sliders (Data > Data validation > Criteria = number, list, checkbox), and smart chips can be used for user inputs.
- **Conditional Formatting:** Color scales, icon sets, custom formulas for cell formatting, and alternating colors can communicate state.
- **Charts & Dashboards:** Native chart types (line, bar, combo, waterfall, histogram, scatter, pie, gauge, scorecard) and pivot tables are fair game. Use filter views or slicers for interactive dashboards.
- **Apps Script Automation:** Installable onEdit/onOpen triggers, custom menu items, custom functions, time-driven triggers, and sidebar/dialog UIs (built with HTML Service) are supported as long as the script code is checked into the demo folder (e.g., `code.gs`). Remember that scripts have execution quotas—keep triggers efficient.
- **Add-on Alternatives:** If a workflow requires add-ons, document the exact marketplace add-on and provide fallback instructions, but prefer native features first.
- **External Data (Connected Sheets):** You can use the built-in connectors (BigQuery, Salesforce, Looker, etc.) or IMPORT functions (IMPORTXML, IMPORTHTML, IMPORTDATA, IMPORTJSON via Apps Script) when demonstrating integrations. Include setup instructions and sample credentials or mock URLs.
- **Protection & Collaboration:** Protected ranges, named ranges, version history, and comments can be showcased to demonstrate collaborative features.

## What You *Cannot* Do (or Must Avoid)

- **No direct DOM/HTML/CSS manipulation:** Unlike a web app, you cannot directly create arbitrary HTML layouts, custom animations, or responsive designs in the grid.
- **No persistent local storage:** You cannot write to local files, browser storage, or external databases without explicit connectors. All state must live in cells or PropertiesService within Apps Script.
- **Limited custom components:** You cannot embed arbitrary React/Vue widgets. Sidebars and dialogs support HTML/JS/CSS, but they run in a sandbox and cannot modify the sheet without Apps Script calls.
- **Execution limits:** Apps Script quotas include 6 minutes per execution, daily call limits, and URLFetch quotas. Heavy data processing must be optimized or offloaded to built-in functions.
- **Offline limitations:** Assume the sheet is used online. Offline mode removes triggers and some data connectors.
- **Restricted file system access:** Apps Script cannot write to random cloud storage without user OAuth scopes. Document any required scopes explicitly.
- **No custom keyboard shortcuts or global hotkeys:** You cannot override Google Sheets shortcuts. Use menus, buttons (drawing objects assigned to scripts), or checkboxes instead.

## Data Modeling Guidelines

1. **Tab Naming Convention:**
   - `Dashboard` for presentation layers.
   - `Inputs` for user-entry tables.
   - `Config` or `Settings` for constants, lists, and named ranges.
   - `Data_*` for raw imports or lookup tables.
   - `Calc_*` for intermediate calculations if the logic becomes complex.
2. **Named Ranges:** Use named ranges for any inputs referenced in formulas or scripts. Document them in a "Dictionary" section of the README or within the sheet (e.g., `Config!A:B`).
3. **Versioning:** If the demo uses Apps Script, set a project version and note it in this README so collaborators know when to deploy updates.
4. **Sample Data:** Include anonymized but realistic sample datasets. If privacy is a concern, generate synthetic data. Note any assumptions about size or data types.
5. **Localization:** Store user-facing strings in a dedicated tab (`Strings`) if the demo needs translation.

## Interaction Patterns

- **Buttons:** Use drawing objects or images assigned to Apps Script functions for button interactions. Label them clearly.
- **Navigation:** Provide a `Dashboard` tab with hyperlinks (Insert > Link) to other sheets or use the built-in `Menu` via Apps Script (e.g., `SpreadsheetApp.getUi().createMenu('Demo')`).
- **Forms:** For data entry, prefer Google Forms linked to the sheet or use structured tables with data validation and Apps Script to append rows.
- **Notifications:** Use `SpreadsheetApp.getUi().alert()` or email notifications via Apps Script for alerts. Document quotas and permissions required.

## Packaging Requirements

1. **Folder Layout:** Each demo product must live in its own subfolder inside `Google sheets products/`. Include:
   - Exported HTML preview (if applicable).
   - `code.gs` (and additional `.gs` or `.html` files) for Apps Script automation.
   - `README.md` specific to the product explaining setup, required permissions, and walkthrough steps.
2. **Replication Instructions:** Provide step-by-step setup instructions in the product README, including:
   - How to copy the master sheet template.
   - How to install/authorize scripts and configure triggers.
   - How to connect to external data sources, if needed.
3. **Testing Checklist:** Every product README should include a checklist verifying formulas, triggers, charts, and data validations after duplication.
4. **Version Control:** When updating a demo, increment a version note (e.g., `Version 1.1 – 2024-04-10`) and summarize changes.

## Quality Assurance Checklist

Before delivering a demo product:

- [ ] Duplicating the sheet preserves all functionality (formulas, named ranges, charts, Apps Script triggers).
- [ ] Tabs are clearly named and color-coded by purpose (inputs, calculations, dashboards).
- [ ] No #REF!, #VALUE!, #N/A, or circular dependency errors are visible.
- [ ] All user inputs are validated (dropdowns, checkboxes, input hints).
- [ ] Sample data is realistic and does not violate privacy policies.
- [ ] Apps Script code passes linting and includes comments for complex logic.
- [ ] Script properties, if used, are documented with default values.
- [ ] Buttons, menus, and navigation links work after the sheet is duplicated.
- [ ] External integrations are mocked or documented with setup steps.
- [ ] The product README references this master guideline and notes any exceptions.

## Additional Resources

- [Google Sheets Function List](https://support.google.com/docs/table/25273)
- [Apps Script Quotas](https://developers.google.com/apps-script/guides/services/quotas)
- [Best Practices for Sheets Performance](https://support.google.com/docs/answer/9009586)
- [Connected Sheets Overview](https://support.google.com/docs/answer/9221449)

Keep this document updated as Sheets capabilities evolve so future demos remain accurate and fully functional.
