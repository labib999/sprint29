# Sprint29 — AI Agent Guide

This document contains everything another AI coding agent needs to work on this project independently.

---

## 1. Project Identity

Sprint29 is an **AI-assisted mission execution platform** that helps users achieve long-term goals through structured weekly planning.

The core loop: **Plan → Execute → Reflect → Improve**

**The AI is not a chatbot.** It is a planning assistant that analyzes structured data and provides recommendations. Every decision stays with the user.

### 5 Principles

1. Long-term goals over daily to-do lists
2. Weekly execution instead of daily streaks
3. AI assists decisions but never makes them
4. Data-driven reflection
5. Simple, fast and distraction-free interface

---

## 2. Architecture

### Folder Layout

```
src/
  app/                   Next.js App Router pages + API routes
    (app)/               Route group for authenticated pages (shared layout)
      dashboard/         Dashboard page
      weekly/            Weekly planner page
      profile/           Profile page
  features/              Independent feature modules
    auth/                Authentication (Google OAuth + Guest)
    missions/            Mission + Milestone management
    planner/             Weekly planning (Sprint 2)
    ai/                  AI service + prompt templates
    dashboard/           Dashboard (Sprint 4)
  shared/                Reusable UI components
  services/              Supabase client factories
  lib/                   Business logic / utilities
  config/                Application configuration
  types/                 Shared TypeScript interfaces
public/                  Static assets
supabase/                SQL migrations
```

### Route Group `(app)`

All authenticated pages (dashboard, weekly, profile) live under `src/app/(app)/` sharing a single layout in `(app)/layout.tsx` that provides:
- `AuthGuard` — redirects unauthenticated users to `/login`
- `Sidebar` — desktop fixed sidebar (240px, visible lg+)
- `BottomNav` — mobile bottom nav (44px tap targets, visible <lg)

The parentheses do NOT affect URL paths — `/dashboard`, `/weekly`, `/profile` are the actual routes.

### Data Flow

```
React Component
  → Service Function (e.g., createMission)
    → Supabase Client (browser or server factory)
      → Supabase API
```

**Rule:** React components NEVER call Supabase directly. All database access goes through service functions in `src/features/*/services/`.

### Auth Client Split

Supabase clients are split into three files to comply with Next.js 15 server/client boundaries:

| File | Import | Use Case |
|---|---|---|
| `src/services/supabase-browser.ts` | `createBrowserClient` | Client components, AuthContext |
| `src/services/supabase-server.ts` | `createServerClient` (no-op `setAll`) | Server components (read-only session) |
| `src/services/supabase-route-handler.ts` | `createServerClient` (with `cookieStore.set`) | Route handlers, callback routes |

---

## 3. Data Model

### Tables

#### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK → auth.users | Auto-created via trigger |
| email | text | |
| name | text | |
| avatar_url | text | |
| is_guest | boolean | True for anonymous users |
| created_at | timestamptz | |

#### `missions`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid → auth.users | |
| title | text | |
| description | text | |
| impact | integer (1-5) | |
| default_weekly_hours | numeric | Optional pre-fill for milestone forms |
| status | text | active / completed / cancelled |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `milestones`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| mission_id | uuid → missions | Cascade delete |
| title | text | |
| completed | boolean | |
| position | integer | Ordering |
| deadline | date | |
| weekly_committed_hours | numeric | Set at creation |
| hours_planned_total | numeric | Computed once: `weekly_hours × weeks_remaining` |
| hours_logged_total | numeric | Updated when user logs hours |
| ai_context | text | (Sprint 2) Raw user notes for AI suggestions |
| ai_context_expanded | boolean | (Sprint 2) Whether ai_context has been expanded |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `weeks` (Sprint 2)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid → auth.users | |
| week_start | date | Monday |
| week_end | date | Sunday |
| total_hours_planned | numeric | Sum of task estimates |
| total_hours_logged | numeric | Sum of actual logged hours |
| status | text | draft / active / completed |
| reflection | text | (Sprint 3) |
| created_at | timestamptz | |

#### `tasks` (Sprint 2)
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| week_id | uuid → weeks | |
| mission_id | uuid → missions | nullable |
| milestone_id | uuid → milestones | nullable |
| title | text | |
| estimated_hours | numeric | |
| actual_hours | numeric | Default 0 |
| priority_score | numeric | Computed client-side |
| ai_suggested | boolean | Was AI-recommended? |
| position | integer | Ordering |
| completed | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### RLS Pattern

All tables use Row-Level Security with `auth.uid()` checks. Milestones use a subquery to verify ownership through the parent mission:

```sql
create policy "Users can view own milestones"
  on public.milestones for select
  using (
    select 1 from public.missions
    where missions.id = milestones.mission_id
    and missions.user_id = auth.uid()
  );
```

### `computePace()` — Pure Function

Located in `src/features/missions/services/paceService.ts`. Computes:

- `hoursPlannedTotal = weekly_committed_hours × (weeks between creation and deadline)`
- `variance = hoursLoggedTotal - (weekly_committed_hours × elapsed weeks)`
- `requiredPace = (hoursPlannedTotal - hoursLoggedTotal) / remaining weeks`
- `pct = hoursLoggedTotal / hoursPlannedTotal`

---

## 4. Auth Flow

### Google OAuth

1. User clicks "Sign in with Google" on `/login`
2. `AuthContext.signInWithGoogle()` calls `supabase.auth.signInWithOAuth({ provider: "google" })`
3. Browser redirects to Google, then to Supabase callback
4. Supabase redirects to `/auth/callback?code=xxx`
5. `src/app/auth/callback/route.ts` exchanges code for session via `createRouteHandlerSupabaseClient`
6. Redirects to `/dashboard`

### Guest Mode

1. User clicks "Continue as Guest"
2. `AuthContext.signInAsGuest()` calls `supabase.auth.signInAnonymously()`
3. The `onAuthStateChange` listener fires with `SIGNED_IN`
4. `redirectAfterAuth` ref is true → `router.push("/dashboard")`

### AuthContext

- Located at `src/features/auth/context/AuthContext.tsx`
- Uses React Context (no external state library)
- Provides: `user`, `isLoading`, `error`, `signInWithGoogle`, `signInAsGuest`, `signOut`
- Listens to `supabase.auth.onAuthStateChange` for cross-tab sync
- `isLoading` starts true, set to false after first auth state check

### AuthGuard

- Located at `src/features/auth/components/AuthGuard.tsx`
- Wraps protected routes in `(app)/layout.tsx`
- Redirects to `/login` if `!isLoading && !user`
- Returns `null` during loading (no spinner flash)

---

## 5. Sprint Status

| Sprint | Status | Deliverables | Done |
|---|---|---|---|
| 0 | ✅ | Next.js + Supabase + Auth + Deploy | User can sign in |
| 1 | ✅ | Missions + Milestones + Pace tracking | User can fully manage missions |
| 2 | ✅ | Weekly Planner + AI Prioritization + Prompt Enhancer | User receives AI recommendations |
| 3 | ✅ | Tasks + Reflection + Complete Week | User completes a full week |
| 4 | ✅ | Dashboard + Analytics + Design Overhaul | User understands progress |

---

## 6. Design System (Dark Theme Overhaul)

### Theme Tokens

| Token | Value | Usage |
|---|---|---|
| Page bg | `bg-[#0a0a0a]` | Root layout |
| Section bg | `bg-[#111111]` | Cards, panels |
| Elevated bg | `bg-[#1a1a1a]` | Inputs, form containers |
| Text primary | `text-white` | Headings, body |
| Text secondary | `text-[#a1a1aa]` | Labels, muted text |
| Text tertiary | `text-[#555]` | Placeholders, disable state |
| Brand | `bg-brand-600` / `text-brand-500` / `border-brand-500` | Purple (#8b5cf6) |
| Error | `text-red-500` + `bg-red-500/10` | Inline error text (no popups) |

- **No borders** on cards — use `bg-[#111]` contrast against `#0a0a0a` page bg
- **No shadows** except modals (overlay: `bg-black/70`)
- **Inter font** via `next/font/google` in `src/app/layout.tsx`
- **Transition** `transition-colors` on interactive elements
- **Animations** — `scale-in` keyframes for task complete checkmark

### Tailwind Config

Located `tailwind.config.ts`:
- `brand` as primary color palette (`50-950` from purple)
- Only one accent color (purple) — never introduce secondary accent colors
- `Inter` as font family default

### Globals (`src/app/globals.css`)

```css
@layer base {
  input, textarea, select {
    @apply border-[#333] bg-[#1a1a1a] text-white placeholder-[#555]
      rounded-lg px-3 py-2 text-sm;
    @apply focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500;
  }
}
```

---

## 7. Component Patterns

### Client vs Server Components

- **"use client"** components can use hooks, browser APIs, and Supabase browser client
- **Server components** can read session via `createServerSupabaseClient()` (read-only)
- Rule of thumb: if it has `useState`, `useEffect`, `useAuth`, or user interaction → `"use client"`

### List Refetch Pattern

When a mutation happens (create/edit/delete), all list components use a `refreshKey` + `onMutate` pattern:

```tsx
// Parent
const [refreshKey, setRefreshKey] = useState(0);
const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

useEffect(() => {
  fetchData().then(setData);
}, [refreshKey]);

// Passed to children
<Child onMutate={refresh} />
```

After a mutation, the child calls `onMutate()` which increments `refreshKey` → re-runs the fetch effect.

### Inline Create Form (Milestone)

`CreateMilestoneForm.tsx` — Appears below the milestone list, single column:
- Title text input
- Deadline date picker
- Impact as 5 clickable dots (circle buttons, filled up to selection)
- Weekly committed hours number input
- AI Context textarea (optional)
- Cancel + Add buttons

Props: `{ missionId, defaultWeeklyHours, onClose }`

### Modal Create Form (Mission)

`CreateMissionForm.tsx` — Float-centered modal with dark overlay:
- Title text input
- Description textarea
- Impact as 5 clickable dots (same pattern as milestones)
- Default hrs/week number input
- Cancel + Create buttons

Props: `{ onClose }`

After success: calls `onClose()` + `router.refresh()`

### Card

`src/shared/components/Card.tsx` — A simple wrapper:
- `bg-[#111111]` + `rounded-xl` + `p-5`
- No borders, no shadows
- Accepts `className` to extend

### Button

`src/shared/components/Button.tsx` — Named variants:
- `primary` — `bg-brand-600 text-white hover:bg-brand-700`
- `secondary` — `border border-[#333] text-white hover:bg-[#1a1a1a]`
- `ghost` — transparent, `text-[#a1a1aa] hover:text-white`
- Optional `isLoading` prop (shows spinner, disables)

### Sidebar (Desktop)

`src/shared/components/Sidebar.tsx`
- Fixed left, 240px wide, visible `lg:flex`
- Logo + nav items + UserMenu at bottom
- Uses `<Link>` for navigation

### BottomNav (Mobile)

`src/shared/components/BottomNav.tsx`
- Fixed bottom, full width, visible `<lg:flex`
- 4 icon tabs (Dashboard, Weekly, Missions, Profile)
- 44px minimum tap target height
- Active state: brand color

### PaceArc (SVG Half-Circle Gauge)

`src/shared/components/PaceArc.tsx`
- 180° arc opening downward
- Purple stroke for logged hours, gray for remaining
- Scales by `viewBox`, responsive
- Bold "{logged}/{planned}h" inside arc
- "Pace" label below
- 180px diameter on desktop, 120px on mobile

### AIPanel (Slide-in Panel)

`src/features/planner/components/AIPanel.tsx`
- Floating purple button (bottom-right on weekly page)
- Click opens a slide-in panel:
  - Desktop: slides from right edge (400px width)
  - Mobile: slides up as bottom sheet
- Shows AI suggestions for the active milestone
- "Ask AI" button triggers `/api/ai/suggest` with current context

### TaskItem

`src/features/planner/components/TaskItem.tsx`
- Title + estimated hours
- Complete checkbox with `scale-in` animation on the checkmark
- On complete: prompts for actual hours via inline input
- Red inline text for errors (no popups/notifications)

### Pulse Skeleton Loading

All list components (MissionList, MilestoneList, TaskList) show a pulse skeleton while data loads:
```css
className="animate-pulse rounded-lg bg-[#1a1a1a]"
```

---

## 8. AI Integration Pattern

### Architecture

```
Client Component (AIPanel)
  → AI Service (aiService.ts)
    → API Route (/api/ai/suggest)
      → Groq (llama-3.1-8b-instant)
```

### Prompt Enhancer

Before the main suggestion call, raw `ai_context` text from the milestone is expanded via a quick Groq call (system: "You are a goal planning assistant...") into a structured paragraph. The result is stored in the database with `ai_context_expanded = true` so it runs once per milestone.

Flow:
1. Check if milestone has `ai_context` and `!ai_context_expanded`
2. If yes, call Groq to expand it into a structured paragraph
3. Save expanded text back to `ai_context` + set `ai_context_expanded = true`
4. Build the main prompt using the (now structured) ai_context

### Key Rules

1. **Prompts live in `src/features/ai/prompts/`** — exported as builder functions (`.ts`), not raw `.txt` files, because `fs.readFileSync` breaks in Vercel's serverless environment
2. **App works without AI** — AI is an enhancement layer
3. **AI only recommends** — user always decides
4. **Graceful degradation** — AI failure shows inline red error text, app continues

### Provider: Groq

- Fast inference with llama-3.1-8b-instant, generous free tier
- Get a key at https://console.groq.com/keys
- Set `GROQ_API_KEY` in `.env.local` / Vercel

### Prompt Template Pattern

```typescript
// src/features/ai/prompts/weekly-prioritization.ts
export function buildWeeklyPrompt(mission: Mission): string {
  return `You are Sprint29...
[prompt content]`;
}
```

### API Route

```typescript
// src/app/api/ai/suggest/route.ts
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const { milestoneId, weekStart } = await req.json();
  // 1. Fetch milestone with ai_context
  // 2. Expand ai_context if needed
  // 3. Build prompt with expanded context + existing tasks
  // 4. Call groq.chat.completions.create
  // 5. Return suggestions as JSON
}
```

---

## 9. Dashboard Components

Located in `src/features/dashboard/components/`:

### DashboardSummaryCards
- 3 cards in a row: Current Week Progress, Active Missions, Overall Pace
- Each shows a title + value (e.g., "4/10h logged") with mini PaceArc or pulse skeleton

### WeeklyTrendChart
- 4-week bar chart using recharts (BarChart)
- Purple bars for planned hours, gray bars for logged hours
- Responsive width

### UpcomingDeadlines
- Max 5 items, sorted by nearest deadline
- Shows mission title + milestone title + days remaining
- Red text if overdue

### DashboardService

`src/features/dashboard/services/dashboardService.ts`
- `getOverallStats(userId)` — active mission count, total planned vs logged
- `getWeeklyTrend(userId, weeks=4)` — planned/logged per week
- `getUpcomingDeadlines(userId, limit=5)` — nearest deadlines with days remaining

---

## 10. Key Constants

| File | Key exports |
|---|---|
| `src/config/constants.ts` | `APP_NAME`, `ROUTES` (LOGIN, DASHBOARD, WEEKLY, AUTH_CALLBACK) |

### Environment Variables

| Variable | Required for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Public, safe in client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Uses `sb_publishable_` format |
| `GROQ_API_KEY` | AI suggestions | Get key at https://console.groq.com/keys |

---

## 11. Development Rules

- Build one sprint at a time — never implement future sprint features
- Keep the application deployable after every change
- Prefer readability over cleverness
- Business logic never belongs inside UI
- One component = one responsibility
- One service = one responsibility
- Avoid duplicated code
- Keep components small
- Favor reusable components
- Update GUIDE.md after every sprint
- Record important architectural decisions in this guide

### Deployment Checklist

Before merging:
- [ ] `npm run build` succeeds
- [ ] No console errors in browser
- [ ] GUIDE.md updated
- [ ] New env vars added to Vercel

---

## 12. Common Pitfalls

1. **Cookie setting in server components** — `cookieStore.set()` throws in server components. Use the read-only `supabase-server.ts` for server components and `supabase-route-handler.ts` for route handlers.

2. **Browser extension hydration errors** — Extensions like Bing add `bis_skin_checked` attributes to the DOM. The root layout has `suppressHydrationWarning` on `<body>` and an inline script that strips these attributes before React hydrates.

3. **Stale `.next` cache** — Chunk loading errors (`__webpack_modules__[moduleId] is not a function`) are usually fixed by deleting `.next` and rebuilding.

4. **Supabase anon key format** — New Supabase projects use `sb_publishable_` prefix instead of `eyJ` JWT format. Use it as `NEXT_PUBLIC_SUPABASE_ANON_KEY` — it works the same way.

5. **Route groups in App Router** — Route groups `(name)` do NOT create URL segments. Two `page.tsx` files at the same level (one in a group, one without) will conflict at the same URL. Always remove old pages when migrating to a route group.

6. **Dark theme consistency** — Never mix light/dark classes. All pages use `bg-[#0a0a0a]` body. Inputs, textareas, and selects are styled globally in `globals.css`. Avoid inline `border-gray-300` or `text-gray-700` from old light theme.

7. **`.txt` prompt files in Vercel** — `fs.readFileSync(path.resolve('src/features/ai/prompts/file.txt'))` works locally but breaks on Vercel because the CWD differs and `.txt` files are not bundled by Webpack. Always use `.ts` exports instead.
