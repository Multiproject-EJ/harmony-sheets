-- LovableSheet board storage for Supabase
-- Run this script inside the Supabase SQL editor to provision the
-- persistence layer for custom brain board layouts.

create extension if not exists "pgcrypto";

create table if not exists public.lovablesheet_boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint lovablesheet_boards_notes_array check (jsonb_typeof(notes) = 'array')
);

create index if not exists lovablesheet_boards_created_by_idx
  on public.lovablesheet_boards (created_by);

create index if not exists lovablesheet_boards_updated_at_idx
  on public.lovablesheet_boards (updated_at desc);

create or replace function public.handle_lovablesheet_boards_audit()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    new.created_at = coalesce(new.created_at, timezone('utc', now()));
    new.created_by = coalesce(new.created_by, auth.uid());
  end if;

  new.updated_at = timezone('utc', now());
  new.updated_by = coalesce(auth.uid(), new.updated_by);

  if new.notes is null then
    new.notes = '[]'::jsonb;
  end if;

  return new;
end;
$$ language plpgsql security definer
set search_path = public;

drop trigger if exists on_lovablesheet_boards_audit on public.lovablesheet_boards;
create trigger on_lovablesheet_boards_audit
  before insert or update on public.lovablesheet_boards
  for each row execute function public.handle_lovablesheet_boards_audit();

alter table public.lovablesheet_boards enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lovablesheet_boards'
      and policyname = 'Users can view their lovablesheet boards'
  ) then
    create policy "Users can view their lovablesheet boards"
      on public.lovablesheet_boards
      for select
      using (auth.uid() = created_by);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lovablesheet_boards'
      and policyname = 'Users can insert lovablesheet boards'
  ) then
    create policy "Users can insert lovablesheet boards"
      on public.lovablesheet_boards
      for insert
      with check (created_by is null or auth.uid() = created_by);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lovablesheet_boards'
      and policyname = 'Users can update their lovablesheet boards'
  ) then
    create policy "Users can update their lovablesheet boards"
      on public.lovablesheet_boards
      for update
      using (auth.uid() = created_by)
      with check (auth.uid() = created_by);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lovablesheet_boards'
      and policyname = 'Users can delete their lovablesheet boards'
  ) then
    create policy "Users can delete their lovablesheet boards"
      on public.lovablesheet_boards
      for delete
      using (auth.uid() = created_by);
  end if;
end;
$$;
