-- Sprint29 Database Schema
-- Sprint 0: Users / Profiles table
-- Sprint 1: Missions / Milestones (with pace tracking)

-- ============================================================
-- Sprint 0: Profiles
-- ============================================================

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  name        text,
  avatar_url  text,
  is_guest    boolean default false,
  created_at  timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url, is_guest)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    ),
    new.is_anonymous
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- Sprint 1: Missions
-- ============================================================

create table if not exists public.missions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  title                 text not null,
  description           text,
  impact                integer not null check (impact >= 1 and impact <= 5),
  default_weekly_hours  numeric,
  status                text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_missions_user_id on public.missions(user_id);
create index if not exists idx_missions_status on public.missions(status);

alter table public.missions enable row level security;

create policy "Users can view own missions"
  on public.missions for select
  using (auth.uid() = user_id);

create policy "Users can create own missions"
  on public.missions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own missions"
  on public.missions for update
  using (auth.uid() = user_id);

create policy "Users can delete own missions"
  on public.missions for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Sprint 1: Milestones (with pace tracking)
-- ============================================================

create table if not exists public.milestones (
  id                      uuid primary key default gen_random_uuid(),
  mission_id              uuid not null references public.missions(id) on delete cascade,
  title                   text not null,
  completed               boolean default false,
  position                integer default 0,
  deadline                date,
  weekly_committed_hours  numeric,
  hours_planned_total     numeric,
  hours_logged_total      numeric default 0,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

create index if not exists idx_milestones_mission_id on public.milestones(mission_id);

alter table public.milestones enable row level security;

create policy "Users can view own milestones"
  on public.milestones for select
  using (
    exists (
      select 1 from public.missions
      where missions.id = milestones.mission_id
      and missions.user_id = auth.uid()
    )
  );

create policy "Users can create own milestones"
  on public.milestones for insert
  with check (
    exists (
      select 1 from public.missions
      where missions.id = milestones.mission_id
      and missions.user_id = auth.uid()
    )
  );

create policy "Users can update own milestones"
  on public.milestones for update
  using (
    exists (
      select 1 from public.missions
      where missions.id = milestones.mission_id
      and missions.user_id = auth.uid()
    )
  );

create policy "Users can delete own milestones"
  on public.milestones for delete
  using (
    exists (
      select 1 from public.missions
      where missions.id = milestones.mission_id
      and missions.user_id = auth.uid()
    )
  );
