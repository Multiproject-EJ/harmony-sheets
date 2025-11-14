-- LovableSheet Feature & Design library storage
-- Provision Supabase tables that power the reusable feature and design selectors in the LovableSheet Next Gen brief form.

create table if not exists public.lovablesheet_feature_library (
  id text primary key,
  label text not null,
  description text not null,
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id) on delete set null
);

create or replace function public.handle_lovablesheet_feature_library_audit()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  new.updated_by = coalesce(auth.uid(), new.updated_by);
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

drop trigger if exists on_lovablesheet_feature_library_audit on public.lovablesheet_feature_library;
create trigger on_lovablesheet_feature_library_audit
  before insert or update on public.lovablesheet_feature_library
  for each row execute function public.handle_lovablesheet_feature_library_audit();

alter table public.lovablesheet_feature_library enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lovablesheet_feature_library'
      and policyname = 'Authenticated users can view feature library'
  ) then
    create policy "Authenticated users can view feature library"
      on public.lovablesheet_feature_library
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
      and tablename = 'lovablesheet_feature_library'
      and policyname = 'Authenticated users can upsert feature library'
  ) then
    create policy "Authenticated users can upsert feature library"
      on public.lovablesheet_feature_library
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
      and tablename = 'lovablesheet_feature_library'
      and policyname = 'Authenticated users can update feature library'
  ) then
    create policy "Authenticated users can update feature library"
      on public.lovablesheet_feature_library
      for update
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end;
$$;

insert into public.lovablesheet_feature_library (id, label, description)
values
  ('screen-size', 'Screen size', 'Document each viewport (1024×768 dialog, full browser canvas, and split view) plus the grid, margin, and zoom rules so Apps Script UI stays pixel perfect.'),
  ('phone-ready', 'Phone ready', 'Explain how the experience collapses into sidebar/phone mode, including stacked layouts, tap targets, and any content that hides or swaps.'),
  ('themes', 'Themes', 'List every color + typography token and the module behavior when a theme toggles so Codex can reuse the system across templates.'),
  ('menu-x', 'Menu X', 'Describe the command palette/menu overlay interaction, keyboard shortcuts, and animation timings for opening, filtering, and dismissing.'),
  ('database-in-sheet', 'Database in sheet', 'Outline the tab-level schema, primary keys, validation rules, and any Apps Script helpers that keep the Sheet-backed database in sync.'),
  ('ai', 'AI', 'Include the model prompt format, sheet inputs, guardrails, and how AI responses are written back so the workflow is reproducible.'),
  ('images-storing', 'Images storing', 'Note how media uploads are handled (Drive, Sheets cells, or CDN), file naming, quotas, and the formulas/scripts that reference each asset.')
on conflict (id) do update set
  label = excluded.label,
  description = excluded.description;

create table if not exists public.lovablesheet_design_library (
  id text primary key,
  label text not null,
  description text not null,
  css_notes text not null default '',
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id) on delete set null
);

create or replace function public.handle_lovablesheet_design_library_audit()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  new.updated_by = coalesce(auth.uid(), new.updated_by);
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

drop trigger if exists on_lovablesheet_design_library_audit on public.lovablesheet_design_library;
create trigger on_lovablesheet_design_library_audit
  before insert or update on public.lovablesheet_design_library
  for each row execute function public.handle_lovablesheet_design_library_audit();

alter table public.lovablesheet_design_library enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'lovablesheet_design_library'
      and policyname = 'Authenticated users can view design library'
  ) then
    create policy "Authenticated users can view design library"
      on public.lovablesheet_design_library
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
      and tablename = 'lovablesheet_design_library'
      and policyname = 'Authenticated users can upsert design library'
  ) then
    create policy "Authenticated users can upsert design library"
      on public.lovablesheet_design_library
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
      and tablename = 'lovablesheet_design_library'
      and policyname = 'Authenticated users can update design library'
  ) then
    create policy "Authenticated users can update design library"
      on public.lovablesheet_design_library
      for update
      using (auth.role() = 'authenticated')
      with check (auth.role() = 'authenticated');
  end if;
end;
$$;

insert into public.lovablesheet_design_library (id, label, description, css_notes)
values
  ('light-color', 'Light Color', 'Airy gradients and bright neutrals with soft drop shadows for productivity dashboards.', 'Use #f8fafc/#e2e8f0 surfaces, 28px radii, and 0 24px 40px rgba(15,23,42,.12) shadows.'),
  ('dark-glass', 'Dark Glass', 'Frosted glass panels with neon accents floating on charcoal backgrounds.', 'Layer rgba(15,23,42,.8) backgrounds, 1px rgba(148,163,184,.32) borders, and blur/backdrop-filter for panels.'),
  ('blue-electro', 'Blue Electro', 'Electric blues with circuit-like dividers for high-tech dashboards.', 'Primary gradient: linear-gradient(135deg,#38bdf8,#6366f1); add glowing outline with rgba(59,130,246,.4).'),
  ('natural-harmony', 'Natural Harmony', 'Organic greens and earth neutrals referencing wellness/planning kits.', 'Pair #065f46 text with #ecfdf5 panels, rounded corners, and thin double borders for botanical vibes.'),
  ('bright-flow', 'Bright Flow', 'Bold gradient ribbons that sweep across cards to show progression.', 'Apply flowing gradient backgrounds with clip-path accents and oversized 48px blur glows.'),
  ('bold-pink', 'Bold Pink', 'Statement fuchsias and corals for marketing launches and playful planners.', 'Use #f472b6 + #fb7185 gradients, strong 1px #be185d borders, and pill buttons.'),
  ('bold-color', 'Bold Color', 'Primary color blocking with crisp typography for storytelling dashboards.', 'Mix #facc15, #2563eb, #f97316 in equal blocks with 12px gutters and sans-serif display fonts.'),
  ('green-pocket', 'Green Pocket', 'Finance-friendly emerald palette paired with ledger-style grid lines.', 'Combine #047857 headers, lined backgrounds, and subtle dollar iconography.'),
  ('solar-dawn', 'Solar Dawn', 'Golden hour gradient washes with soft serif typography for lifestyle products.', 'Gradient from #fcd34d to #f472b6, 36px rounded corners, and serif headings with tracking .08em.'),
  ('noir-terminal', 'Noir Terminal', 'Monospace, high-contrast panels inspired by developer terminals.', 'Background #0f172a, lime green #a3e635 accents, IBM Plex Mono, and inset 1px #1e293b borders.')
on conflict (id) do update set
  label = excluded.label,
  description = excluded.description,
  css_notes = excluded.css_notes;
