# harmony-sheets
Website for Harmony Sheets — smart spreadsheet tools for organization, productivity, and planning.

## Supabase authentication setup

The customer login and freemium sign-up experience lives at [`login.html`](login.html) and is powered by Supabase Auth. Follow the [step-by-step Supabase setup guide](docs/supabase-setup.md) for:

* creating a Supabase account and project,
* configuring email authentication and redirect URLs,
* supplying the anon key to `supabase-config.js`,
* provisioning a `profiles` table (plus row-level security policies) that mirrors stored user metadata, and
* testing the full login, signup, and password reset flows locally.

> **Note:** Because Supabase's anon key is intended to be public, committing it to the static front-end is safe. Never expose service role keys in front-end code.
