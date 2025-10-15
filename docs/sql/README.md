# Supabase SQL bootstrap scripts

This directory collects the SQL you need to provision Harmony Sheets' Supabase-backed authentication tables and policies.

## Authentication and profiles

Run [`../../sql/auth-and-profiles.sql`](../../sql/auth-and-profiles.sql) inside the **SQL Editor** of your Supabase project. It will:

1. Create the `public.profiles` table linked to `auth.users`.
2. Install a trigger that keeps profile rows in sync with new signups.
3. Enable row level security (RLS) and policies so users can only read and update their own profile record.
4. Optionally backfill missing profile rows for existing users.

Because the script is idempotent, you can re-run it safely if you need to recreate the trigger or policies after changes.

Refer back to the [Supabase setup guide](../supabase-setup.md) for the broader project configuration steps (API keys, redirect URLs, etc.).
