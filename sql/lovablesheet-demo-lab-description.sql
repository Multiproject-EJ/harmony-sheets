-- LovableSheet iPad demo lab description storage
-- Run inside the Supabase SQL editor to provision editable copy
-- for the Google Sheets iPad preview lab modal.

create table if not exists public.lovablesheet_demo_lab_docs (
  id text primary key,
  content text not null,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id) on delete set null
);

create or replace function public.handle_lovablesheet_demo_lab_docs_audit()
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

drop trigger if exists on_lovablesheet_demo_lab_docs_audit on public.lovablesheet_demo_lab_docs;
create trigger on_lovablesheet_demo_lab_docs_audit
  before insert or update on public.lovablesheet_demo_lab_docs
  for each row execute function public.handle_lovablesheet_demo_lab_docs_audit();

alter table public.lovablesheet_demo_lab_docs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lovablesheet_demo_lab_docs'
      and policyname = 'Users can view demo lab docs'
  ) then
    create policy "Users can view demo lab docs"
      on public.lovablesheet_demo_lab_docs
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
      and tablename = 'lovablesheet_demo_lab_docs'
      and policyname = 'Users can upsert demo lab docs'
  ) then
    create policy "Users can upsert demo lab docs"
      on public.lovablesheet_demo_lab_docs
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
      and tablename = 'lovablesheet_demo_lab_docs'
      and policyname = 'Users can update demo lab docs'
  ) then
    create policy "Users can update demo lab docs"
      on public.lovablesheet_demo_lab_docs
      for update
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end;
$$;

insert into public.lovablesheet_demo_lab_docs (id, content)
values (
  'ipad-lab',
  $$The iPad preview builder mirrors the 1024×768 dialog that Google Sheets renders when HTML Service launches. Use it to mock every UI element before copying the files into a real spreadsheet.

Guidelines:
- Keep demos to one HTML file and one Apps Script (.gs) file so they can be pasted directly into the Google Sheets project.
- Treat the spreadsheet tabs as the database layer. Use built-in Services (Sheets, Properties, UrlFetch) for storage or API calls.
- Avoid tooling that requires a build step. Vanilla HTML, CSS, and JavaScript ensure copy/paste parity with Google Workspace.

When the concept is ready, drop the HTML + Apps Script bundle inside the matching folder in 'Google sheets products/' so the marketing site and Supabase listing can reference it.$$)
on conflict (id) do update set content = excluded.content;
