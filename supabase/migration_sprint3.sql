-- Sprint 3 Migration: Add ai_context to milestones
-- Run this in Supabase SQL Editor after sprint 2 migration

alter table public.milestones
  add column if not exists ai_context text;
