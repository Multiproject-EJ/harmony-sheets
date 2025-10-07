-- Harmony Sheets Supabase auth + profile bootstrap
-- Run this script inside the Supabase SQL Editor for your project.
-- It provisions the `profiles` table, a sync trigger, and RLS policies
-- needed by the Harmony Sheets front-end authentication flow.

-- 1. Create the public.profiles table tied to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique,
  plan text not null default 'freemium',
  full_name text,
  created_at timestamptz not null default timezone('utc', now())
);

-- 2. Sync auth metadata to profiles whenever a user is created
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

-- 3. Turn on row level security
alter table public.profiles enable row level security;

-- 4. Allow users to read and update only their own profile
create policy "Users can view their profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 5. Optional: backfill profiles for existing users (safe to re-run)
insert into public.profiles (id, email, plan)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'plan', 'freemium')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
