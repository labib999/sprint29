# Sprint29

## Overview

Sprint29 is an AI-assisted mission execution platform designed to help users achieve long-term goals through structured weekly planning.

Unlike traditional to-do list applications, Sprint29 focuses on helping users decide **what they should work on next**, rather than simply storing tasks.

The application follows a continuous execution loop:

Plan → Execute → Reflect → Improve

The AI is **not** a chatbot. It acts as a planning assistant that analyzes structured user data and provides recommendations while leaving every decision to the user.

---

## Philosophy

Sprint29 is built around five principles:

1. Long-term goals over daily to-do lists.
2. Weekly execution instead of daily streaks.
3. AI assists decisions but never makes them.
4. Data-driven reflection.
5. Simple, fast and distraction-free interface.

---

## Sprint Status

Sprint 0 — Foundation (Complete)

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS v3
- Supabase integration (via @supabase/ssr)
- Google OAuth
- Guest Mode (Supabase Anonymous Auth)
- Vercel deployment ready

> **Definition of Done:** User can sign in. Project is deployed to Vercel.

---

## MVP Features

- User Authentication (Google + Guest) ✅
- Create Missions (Sprint 1)
- Create Milestones (Sprint 1)
- Weekly Planning (Sprint 2)
- Tasks (Sprint 3)
- Weekly Reflection (Sprint 3)
- Dashboard (Sprint 4)
- AI Priority Suggestions (Sprint 2)
- Progress Analytics (Sprint 4)

---

## Technology

Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 3

Backend

- Next.js API Routes

Database

- Supabase (PostgreSQL)

Authentication

- Google OAuth
- Guest Mode (Anonymous)

AI

- Claude API (preferred)
- Easily replaceable provider

Deployment

- Vercel

---

## V1 Goal

Create a working AI-assisted planner that users can use every week.

Everything else belongs in future versions.

---

## Future Versions

- Categories
- Objectives
- Goal Health Score
- AI Task Generation
- Pattern Intelligence
- Calendar Sync
- Team Collaboration
- Native Mobile App