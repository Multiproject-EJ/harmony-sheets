# harmony-sheets
Website for Harmony Sheets — smart spreadsheet tools for organization, productivity, and planning.

## Supabase authentication setup

The customer login and freemium sign-up experience lives at [`login.html`](login.html) and is powered by Supabase Auth. Follow the [step-by-step Supabase setup guide](docs/supabase-setup.md) for:

* creating a Supabase account and project,
* configuring email authentication and redirect URLs,
* supplying the anon key to `supabase-config.js`,
* provisioning a `profiles` table (plus row-level security policies) that mirrors stored user metadata (see also the quick reference in [`docs/sql/`](docs/sql/)), and
* testing the full login, signup, and password reset flows locally.

> **Note:** Because Supabase's anon key is intended to be public, committing it to the static front-end is safe. Never expose service role keys in front-end code.

## Admin dashboard

A TypeScript React dashboard for managing Stripe products now lives in [`admin/`](admin/). It uses Supabase Auth to gate access to a single admin email and syncs product changes with Stripe via Supabase Edge Functions.

To run the admin dashboard locally:

1. Install dependencies:

   ```bash
   cd admin
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and provide your Supabase project URL, anon key, and the admin email address that is allowed to sign in.
3. Start the dev server:

   ```bash
   npm run dev
   ```

The Supabase SQL snippets required for the dashboard are available in [`admin/sql/`](admin/sql/), and the corresponding Edge Functions for syncing with Stripe are in [`admin/supabase_functions/`](admin/supabase_functions/).
