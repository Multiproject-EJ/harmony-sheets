# Supabase post-setup checklist

With your Supabase project URL and anon key now wired into the Harmony Sheets front-end, use this checklist to finish hardening the auth flow and confirming that the navigation behaves as expected across the site.

## 1. Verify the database bootstrap

- [ ] Run [`sql/auth-and-profiles.sql`](../sql/auth-and-profiles.sql) in the Supabase SQL Editor if you have not already. This script provisions the `public.profiles` table, sync trigger, and row-level security policies required by the front-end.
- [ ] Open **Table Editor → profiles** in Supabase and confirm that a record appears after you create a test account. The `plan` column should default to `freemium`.
- [ ] If you had existing users before installing the trigger, re-run the bootstrap script to backfill any missing profile rows. It is safe to execute multiple times.

## 2. Confirm the on-site experience

- [ ] Serve the site locally (for example: `python3 -m http.server 8000`) and visit [`http://localhost:8000/`](http://localhost:8000/).
- [ ] Click **Log In/Sign Up** in the header to open the modal. Sign up with a fresh test email and complete the confirmation email Supabase sends.
- [ ] After verification, reload the home page and ensure the header button now reads **Account** with the dropdown links visible.
- [ ] Open the dropdown and use **Log out** to confirm the state returns to **Log In/Sign Up**.
- [ ] Navigate between pages (e.g., `products.html`, `faq.html`) while signed in to ensure the account label and dropdown remain in sync.

## 3. Double-check the dedicated account page

- [ ] Visit [`http://localhost:8000/login.html`](http://localhost:8000/login.html) directly.
- [ ] Exercise the **Sign in**, **Create freemium account**, and **Reset password** tabs to confirm they match Supabase’s behaviour. Successful sign-in should redirect you to `products.html` by default.
- [ ] Use a password reset email to walk through the update form. Supabase will append `access_token` and `refresh_token` parameters to the reset link — once you finish, the script cleans up the URL.

## 4. Polish authentication emails

- [ ] In the Supabase dashboard, open **Authentication → Email Templates** and customize the confirmation and password-reset messages with Harmony Sheets branding.
- [ ] Configure a custom SMTP sender (or Supabase-managed domain) so customers trust the email origin.

## 5. Connect the admin tools (optional, but recommended)

- [ ] Inside [`admin/`](../admin/), copy `.env.local.example` to `.env.local` and populate the Supabase URL, anon key, and the email address that should have admin access.
- [ ] Install dependencies (`npm install`) and run the development server (`npm run dev`).
- [ ] Sign in with the admin email and confirm you can reach the product management dashboard.

## 6. Monitor and iterate

- [ ] Enable [Supabase Auth rate-limit alerts](https://supabase.com/docs/guides/platform/logs/auth#rate-limits) so you know if bots hit the signup form.
- [ ] Periodically review **Authentication → Users** and **Logs → Auth** to watch for unexpected errors.
- [ ] When you introduce paid plans, extend `public.profiles.plan` to track the current tier or join it with your billing tables.

Completing the checklist ensures Supabase backs every customer touchpoint — the modal, the dedicated account page, and the admin dashboard — before you launch to real users.
