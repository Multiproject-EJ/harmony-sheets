# The work process — prompting structure

This guide captures the flow we just followed to turn a pipeline idea into a working draft product for Harmony Sheets.

1. **Review the admin dashboard pipeline.**
   - Open `admin_dashboard.html` and note the first Todo do product at the top of the pipeline table. For now that is **Budget Blueprint**.
2. **Create a draft entry in the product catalog.**
   - Add a new object to `products.json` with rich copy, pricing, feature bullets, and `"draft": true` so it stays internal until launch-ready.
   - Point `virtualDemo` to the demo HTML that lives with the Apps Script mockup so the marketing site can preview the concept in a browser.
3. **Set up the Google Sheets product workspace.**
   - Under the root folder, create `Google sheets products/` and then a subfolder named after the product (for example, `Budget Blueprint`).
   - Inside each product folder add two files:
     - `code.gs` — Google Apps Script logic for the Sheet (menus, sidebar, data helpers).
     - `budget-blueprint.html` (or `index.html`) — the HTML for the sidebar/demo so it can be shown both inside Sheets and on the public site.
4. **Capture a demo-ready Apps Script experience.**
   - Build `code.gs` helpers to assemble a data snapshot, expose quick actions, and accept form submissions from the HTML sidebar.
   - Design the matching HTML so it renders a summary, recent transactions, and a quick-add form when embedded on the web.
5. **Document the process for future products.**
   - Repeat these steps for every pipeline product: pull details from the admin dashboard, scaffold the folder pair, wire up Apps Script + HTML, and drop the draft record into `products.json`.

Following this structure keeps every product consistent: a draft listing ready for Supabase/export, plus a matching Google Sheets experience that doubles as a marketing demo.
