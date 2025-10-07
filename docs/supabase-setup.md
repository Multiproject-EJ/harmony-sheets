# Supabase setup guide

This walkthrough covers everything needed to power Harmony Sheets authentication with Supabase — from signing up to creating the supporting tables and policies. Follow the sections in order; each builds on the previous step so that, by the end, a new customer can create a freemium account and sign back in without leaving the Harmony Sheets UI.

## Prerequisites

* A Supabase account (GitHub, Google, or email sign in works).
* The domain you will serve Harmony Sheets from. During local development you can use `http://localhost:8000`.
* Access to an email inbox you can use to verify the auth flow.
* Optional but recommended: a custom sender domain or SMTP configuration for production email. Supabase will fall back to a default sender address, but branding the email increases trust.

## 1. Create your Supabase account and project

1. Visit [supabase.com](https://supabase.com) and create an account (GitHub, email, and other providers are supported).
2. After logging in, click **New organization** (or pick an existing one) and choose **New project**.
3. Name the project, select your preferred region, and set a strong **Database Password** (keep it in a secure place; you will need it when connecting to the database in the future).
4. Wait for the project to finish provisioning. Supabase will take a few minutes to set up the Postgres database and API endpoints.

## 2. Configure authentication settings

1. In the project dashboard, open **Authentication → Providers** and toggle **Email** on. (Other providers are optional; the site currently supports email/password.)
2. Still under **Authentication → Providers**, expand **Email** and ensure **Confirm email** is enabled. This forces users to verify their email before they can log in.
3. Go to **Authentication → URL Configuration**:
   * **Site URL** – use the production domain for the site or `http://localhost:8000` during local development. This is the base URL Supabase uses to construct callback links.
   * **Redirect URLs** – add `https://<your-domain>/login.html` and, if you test locally, `http://localhost:8000/login.html`. Supabase uses these to send users back after email confirmation or password resets.
   * If you are using a custom subdomain for authentication (e.g., `auth.<your-domain>`), list it here as well.
4. Optional but recommended: visit **Authentication → Email Templates** and customize the **Confirmation** and **Reset password** templates to match Harmony Sheets branding. Upload a logo and adjust the copy so that users understand the origin of the message.
5. Finally, in **Authentication → Policies**, review password requirements, session length, and refresh token rotation. The defaults work for testing, but tightening them before launch improves security.

## 3. Supply the Supabase keys to the site

1. In the Supabase dashboard, open **Project Settings → API**.
2. Copy the **Project URL** and **anon public** key.
3. In this repository, duplicate [`supabase-config.example.js`](../supabase-config.example.js) as `supabase-config.js` (a placeholder file already exists) and replace the `SUPABASE_URL` and `SUPABASE_ANON_KEY` values with your project's URL and anon key.
4. Commit the public anon key along with the front-end — it is safe to expose. **Never** add the service role key to client code.
5. If you manage configuration through environment variables, you can point the placeholder file to `window.env` or a similar global object; just ensure the values resolve at page load so that `auth.js` can instantiate the Supabase client.

## 4. Create a profiles table that mirrors user metadata

The authentication flow stores a `plan: "freemium"` value in each new user's metadata. To make that value queryable from Postgres (and enforce row-level security), create a `profiles` table linked to `auth.users`.

Open **SQL Editor** in the Supabase dashboard and run [`sql/auth-and-profiles.sql`](../sql/auth-and-profiles.sql) (contents also inlined below for convenience):

```sql
-- Create a table that mirrors the Supabase auth.users table
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique,
  plan text not null default 'freemium',
  full_name text,
  created_at timestamptz not null default timezone('utc', now())
);

-- Keep profiles in sync with auth metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, plan)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'plan', 'freemium'))
  on conflict (id) do update
    set email = excluded.email,
        plan = excluded.plan;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Ensure row-level security is active
alter table public.profiles enable row level security;

-- Allow users to manage their own profile record
create policy "Users can view their profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

This setup automatically creates a profile row when an account is registered and restricts access so that each user can only read or modify their own data.

If you are migrating an existing project with users created before the trigger existed, run the following SQL once to backfill missing `profiles` rows:

```sql
insert into public.profiles (id, email, plan)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'plan', 'freemium')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
```

## 5. Test the flow end-to-end

1. Start the site locally (`python3 -m http.server 8000`) and visit [`http://localhost:8000/login.html`](http://localhost:8000/login.html).
2. Sign up with a new email address. Supabase will send a confirmation email; follow the link to verify the account.
3. After the confirmation, sign in again to confirm authentication works. You should be redirected to `products.html` (or the `redirect` URL query parameter if one is present).
4. In the Supabase dashboard, open **Authentication → Users** to see the new account. Confirm the **Email confirmed** column shows a checkmark.
5. Check **Table Editor → profiles** to confirm the profile row and `plan` value were inserted. Open the row to verify `plan = freemium`.
6. (Optional) Update the `plan` column manually in the dashboard to promote accounts or use SQL updates once you add premium tiers.
7. Repeat the process with a second test user to ensure row-level security blocks cross-account access. Use the SQL editor to run `select * from public.profiles;` while authenticated with the anon key (for example through the Supabase web UI) and confirm you only see your own profile.

Once these steps are complete, the Harmony Sheets login experience is fully backed by Supabase Auth with persistent profile records. Continue monitoring the Supabase dashboard for errors and rate limits, especially after launch, to ensure authentication remains healthy.
