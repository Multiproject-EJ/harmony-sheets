-- LovableSheet Next Gen standard text storage for Supabase
-- Run this script inside the Supabase SQL editor to provision the
-- editable copy deck for the "Fixed standard text" field in Next Gen briefs.

create table if not exists public.lovablesheet_nextgen_standard (
  id text primary key,
  content text not null,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id) on delete set null
);

create or replace function public.handle_lovablesheet_nextgen_standard_audit()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    new.updated_at = timezone('utc', now());
    new.updated_by = coalesce(new.updated_by, auth.uid());
  elsif tg_op = 'UPDATE' then
    new.updated_at = timezone('utc', now());
    new.updated_by = coalesce(auth.uid(), new.updated_by);
  end if;
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

drop trigger if exists on_lovablesheet_nextgen_standard_audit on public.lovablesheet_nextgen_standard;
create trigger on_lovablesheet_nextgen_standard_audit
  before insert or update on public.lovablesheet_nextgen_standard
  for each row execute function public.handle_lovablesheet_nextgen_standard_audit();

alter table public.lovablesheet_nextgen_standard enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lovablesheet_nextgen_standard'
      and policyname = 'Users can view nextgen standard text'
  ) then
    create policy "Users can view nextgen standard text"
      on public.lovablesheet_nextgen_standard
      for select
      using (auth.role() = 'authenticated');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lovablesheet_nextgen_standard'
      and policyname = 'Users can upsert nextgen standard text'
  ) then
    create policy "Users can upsert nextgen standard text"
      on public.lovablesheet_nextgen_standard
      for insert
      with check (auth.role() = 'authenticated');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lovablesheet_nextgen_standard'
      and policyname = 'Users can update nextgen standard text'
  ) then
    create policy "Users can update nextgen standard text"
      on public.lovablesheet_nextgen_standard
      for update
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end;
$$;

insert into public.lovablesheet_nextgen_standard (id, content)
values (
  'default',
  $$Produce a google sheets product by completing the following:
1) Make the product page JSON with the stats.
2) Push it to Supabase.
3) Fetch from Supabase.
4) Produce the Google Sheet and HTML (1 file only) and add to a new folder in the ‘Google sheets products and demo’ directory in the repo.
   Link the finished product (the HTML) to the interactive demo section on the product page.$$
)
on conflict (id) do nothing;
