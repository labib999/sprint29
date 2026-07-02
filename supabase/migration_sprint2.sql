-- Sprint 2 Migration: Weeks + Tasks tables
-- Run this in Supabase SQL Editor after sprint 1 migration

-- Weeks table — one row per user per week
create table if not exists public.weeks (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  week_start          date not null,
  week_end            date not null,
  total_hours_planned numeric default 0,
  total_hours_logged  numeric default 0,
  status              text not null default 'draft' check (status in ('draft', 'active', 'completed')),
  reflection          text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists idx_weeks_user_week on public.weeks(user_id, week_start);

alter table public.weeks enable row level security;

create policy "Users can view own weeks"
  on public.weeks for select
  using (auth.uid() = user_id);

create policy "Users can create own weeks"
  on public.weeks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weeks"
  on public.weeks for update
  using (auth.uid() = user_id);

create policy "Users can delete own weeks"
  on public.weeks for delete
  using (auth.uid() = user_id);

-- Tasks table — individual items within a week
create table if not exists public.tasks (
  id              uuid primary key default gen_random_uuid(),
  week_id         uuid not null references public.weeks(id) on delete cascade,
  mission_id      uuid references public.missions(id) on delete set null,
  milestone_id    uuid references public.milestones(id) on delete set null,
  title           text not null,
  estimated_hours numeric not null check (estimated_hours > 0),
  actual_hours    numeric default 0,
  priority_score  numeric default 0,
  ai_suggested    boolean default false,
  position        integer default 0,
  completed       boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_tasks_week on public.tasks(week_id);
create index if not exists idx_tasks_mission on public.tasks(mission_id);

alter table public.tasks enable row level security;

create policy "Users can view own tasks"
  on public.tasks for select
  using (
    exists (
      select 1 from public.weeks
      where weeks.id = tasks.week_id
      and weeks.user_id = auth.uid()
    )
  );

create policy "Users can create own tasks"
  on public.tasks for insert
  with check (
    exists (
      select 1 from public.weeks
      where weeks.id = tasks.week_id
      and weeks.user_id = auth.uid()
    )
  );

create policy "Users can update own tasks"
  on public.tasks for update
  using (
    exists (
      select 1 from public.weeks
      where weeks.id = tasks.week_id
      and weeks.user_id = auth.uid()
    )
  );

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (
    exists (
      select 1 from public.weeks
      where weeks.id = tasks.week_id
      and weeks.user_id = auth.uid()
    )
  );
