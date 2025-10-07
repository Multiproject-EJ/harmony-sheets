# harmony-sheets
Website for Harmony Sheets — smart spreadsheet tools for organization, productivity, and planning.

## Supabase authentication setup

The customer login and freemium sign-up experience lives at [`login.html`](login.html) and is powered by Supabase Auth.

1. Create a Supabase project (or reuse an existing one) and enable email/password authentication from **Authentication → Providers → Email**.
2. Copy [`supabase-config.example.js`](supabase-config.example.js) to `supabase-config.js` (this repository already contains a placeholder file) and update the `SUPABASE_URL` and `SUPABASE_ANON_KEY` exports with your project's values.
3. In **Authentication → URL Configuration**, set the **Site URL** to the domain where this site is hosted (or `http://localhost:8000` for local testing) and add `https://<your-domain>/login.html` to the list of Redirect URLs. This allows Supabase to send users back to the login page after confirming their email or resetting their password.
4. (Optional) Adjust **Authentication → Policies** and the email templates to match your brand. The sign-up flow automatically stores a `plan: "freemium"` attribute in the user's metadata when an account is created.
5. Test the flow by visiting [`login.html`](login.html), creating an account, and confirming the email that Supabase sends. You can verify that accounts are saved by checking **Authentication → Users** in the Supabase dashboard; new users will appear with the `freemium` plan metadata.

> **Note:** Because Supabase's anon key is intended to be public, committing it to the static front-end is safe. Never expose service role keys in front-end code.
