-- Sprint 1 Migration: Add pace tracking columns
-- Run this in Supabase SQL Editor (schema.sql already ran for Sprint 0)

-- Missions: add default_weekly_hours, remove old estimated_hours/deadline
alter table public.missions
  add column if not exists default_weekly_hours numeric,
  drop column if exists estimated_hours,
  drop column if exists deadline;

-- Milestones: add pace tracking columns
alter table public.milestones
  add column if not exists deadline date,
  add column if not exists weekly_committed_hours numeric,
  add column if not exists hours_planned_total numeric,
  add column if not exists hours_logged_total numeric default 0;
