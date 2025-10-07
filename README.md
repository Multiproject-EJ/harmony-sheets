# harmony-sheets
Website for Harmony Sheets — smart spreadsheet tools for organization, productivity, and planning.

## Supabase authentication setup

The customer login and freemium sign-up experience lives at [`login.html`](login.html) and is powered by Supabase Auth.

1. Create a Supabase project (or reuse an existing one) and enable email/password authentication.
2. Copy [`supabase-config.example.js`](supabase-config.example.js) to `supabase-config.js` (this repository already contains a placeholder file) and update the `SUPABASE_URL` and `SUPABASE_ANON_KEY` exports with your project's values.
3. Optionally customize the `auth.users` email confirmation settings within Supabase. The sign-up flow automatically stores a `plan: "freemium"` attribute in the user's metadata.
4. For password recovery emails, set the redirect URL in Supabase to `https://<your-domain>/login.html`. The page automatically handles the recovery token and allows the visitor to set a new password.

> **Note:** Because Supabase's anon key is intended to be public, committing it to the static front-end is safe. Never expose service role keys in front-end code.
