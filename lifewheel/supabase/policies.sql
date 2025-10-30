alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.visions enable row level security;
alter table public.goals enable row level security;
alter table public.steps enable row level security;
alter table public.tasks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.questionnaires enable row level security;
alter table public.questions enable row level security;
alter table public.responses enable row level security;
alter table public.reminders enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.ai_summaries enable row level security;
alter table public.media enable row level security;

create policy "Users can manage their profile" on public.profiles
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage categories" on public.categories
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage visions" on public.visions
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage goals" on public.goals
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage steps" on public.steps
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage tasks" on public.tasks
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage habits" on public.habits
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage habit logs" on public.habit_logs
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage questionnaires" on public.questionnaires
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage questions" on public.questions
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage responses" on public.responses
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage reminders" on public.reminders
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage push subscriptions" on public.push_subscriptions
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage summaries" on public.ai_summaries
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage media" on public.media
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
