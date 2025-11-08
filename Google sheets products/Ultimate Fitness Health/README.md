# Ultimate Fitness & Health Command Center (Draft)

This folder contains the draft Google Sheets + Apps Script prototype for the Ultimate Fitness & Health Command Center product. The goal is to keep every fitness ritual—readiness, workouts, fueling, and recovery—in one guided workspace that can be duplicated into a customer's Google Drive.

## Folder structure

- `code.gs` – Apps Script logic that powers the custom menu, sidebar dashboard, and quick-add forms.
- `ultimate-fitness-health.html` – Sidebar + web demo experience rendered inside Google Sheets and on the Harmony Sheets marketing site.

## Named ranges & tabs expected

The prototype assumes the following Sheets structure. Use this when creating the matching template in Google Sheets:

- `Readiness` – daily HRV, resting HR, readiness score, and notes. Include headers `Date`, `HRV`, `RHR`, `Score`, `Note`.
- `Training Log` – workout entries with headers `Date`, `Session`, `Block`, `Duration`, `Intensity`.
- `Meals` – daily fueling log with headers `Time`, `Meal`, `Protein`, plus any additional macro columns you need.
- `Habits` – rolling habit tracker with headers `Date`, `Habit`, `Status`, `Score`.
- Named ranges `Daily_Focus` and `Target_Sleep` – surfaced at the top of the sidebar for quick reference.

## Quick start checklist

1. Duplicate the Google Sheet template and ensure the tabs + named ranges listed above exist.
2. Paste `code.gs` and `ultimate-fitness-health.html` into the Apps Script editor attached to the sheet.
3. Refresh the sheet to trigger `onOpen()` and load the "Ultimate Fitness" custom menu.
4. Run **Ultimate Fitness → Open fitness dashboard** to test the sidebar experience.
5. Use the quick-add forms to log a workout and a recovery note; confirm the rows appear at the top of `Training Log` and `Readiness` respectively.

## Roadmap notes

- **Wearable imports:** Investigate connectors and API quotas for automatic HRV/RHR sync.
- **Macro targets:** Add configurable daily macro goals and variance callouts to the nutrition panel.
- **Weekly planning:** Layer in a 7-day planner view that highlights planned vs. completed training sessions.

Document findings in this README as the concept evolves so the marketing copy and Supabase metadata stay aligned.
