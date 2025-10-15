-- Harmony Sheets Supabase auth + profile bootstrap
-- Run this script inside the Supabase SQL Editor for your project.
-- It provisions the `profiles` table, a sync trigger, and RLS policies
-- needed by the Harmony Sheets front-end authentication flow.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique,
  plan text not null default 'freemium',
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Ensure columns exist when upgrading from earlier versions of this script
alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

-- 2. Sync auth metadata to profiles whenever a user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, plan, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'plan', 'freemium'),
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'display_name', '')
    )
  )
  on conflict (id) do update
    set email = excluded.email,
        plan = excluded.plan,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
        updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Maintain the updated_at column automatically
create or replace function public.handle_profile_updated()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_profile_updated();

-- 3. Turn on row level security
alter table public.profiles enable row level security;

-- 4. Allow users to read and update only their own profile
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can view their profile'
  ) then
    create policy "Users can view their profile"
      on public.profiles
      for select
      using (auth.uid() = id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can update their profile'
  ) then
    create policy "Users can update their profile"
      on public.profiles
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end;
$$;

-- 5. Optional: backfill profiles for existing users (safe to re-run)
insert into public.profiles (id, email, plan, full_name)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'plan', 'freemium'),
  coalesce(
    nullif(u.raw_user_meta_data->>'full_name', ''),
    nullif(u.raw_user_meta_data->>'name', ''),
    nullif(u.raw_user_meta_data->>'display_name', '')
  )
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
