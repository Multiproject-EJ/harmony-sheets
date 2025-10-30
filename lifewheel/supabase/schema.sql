-- Enable UUID generation
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  email text unique,
  timezone text default 'UTC',
  theme text default 'light',
  ai_tone text default 'Encouraging',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  color text default '#3b82f6',
  "order" int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.visions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category_id uuid references public.categories(id) on delete cascade,
  title text not null,
  narrative_md text,
  last_reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category_id uuid references public.categories(id) on delete set null,
  vision_id uuid references public.visions(id) on delete set null,
  title text not null,
  desc_md text,
  image_url text,
  status text default 'planned',
  priority int default 0,
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  goal_id uuid references public.goals(id) on delete cascade,
  title text not null,
  desc_md text,
  status text default 'planned',
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  goal_id uuid references public.goals(id) on delete set null,
  step_id uuid references public.steps(id) on delete set null,
  title text not null,
  status text default 'planned',
  due_date date,
  estimate_mins int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category_id uuid references public.categories(id) on delete set null,
  goal_id uuid references public.goals(id) on delete set null,
  name text not null,
  cadence text default 'daily',
  target_per_week int default 7,
  reminder_time time,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  habit_id uuid references public.habits(id) on delete cascade,
  date date not null,
  value int default 0,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (habit_id, date)
);

create table if not exists public.questionnaires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  period text not null,
  window_start date,
  window_end date,
  submitted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category_id uuid references public.categories(id) on delete set null,
  text text not null,
  type text default 'rating',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  questionnaire_id uuid references public.questionnaires(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  rating int,
  text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  entity text not null,
  entity_id uuid,
  channel text not null,
  rrule text,
  time_of_day time,
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.push_subscriptions (
  id uuid primary key,
  user_id uuid not null,
  endpoint text not null,
  keys_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ai_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source text not null,
  input_ids jsonb,
  summary_md text,
  suggestions_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  file_path text not null,
  linked_entity text,
  linked_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.send_log (
  id bigint generated by default as identity primary key,
  user_id uuid not null,
  reminder_id uuid,
  channel text not null,
  sent_at timestamptz default now(),
  dedupe_key text unique
);

create index if not exists idx_categories_user on public.categories(user_id);
create index if not exists idx_goals_user on public.goals(user_id);
create index if not exists idx_habits_user on public.habits(user_id);
create index if not exists idx_habit_logs_date on public.habit_logs(date);
create index if not exists idx_reminders_user on public.reminders(user_id);
create index if not exists idx_responses_questionnaire on public.responses(questionnaire_id);
