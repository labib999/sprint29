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
  features/              Independent feature modules
    auth/                Authentication (Google OAuth + Guest)
    missions/            Mission + Milestone management
    planner/             Weekly planning (Sprint 2)
    ai/                  AI service + prompt templates
    dashboard/            Dashboard (Sprint 4)
  shared/                Reusable UI components
  services/              Supabase client factories
  lib/                   Business logic / utilities
  config/                Application configuration
  types/                 Shared TypeScript interfaces
public/                  Static assets
supabase/                SQL migrations
```

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
    exists (
      select 1 from public.missions
      where missions.id = milestones.mission_id
      and missions.user_id = auth.uid()
    )
  );
```

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
- Wraps protected routes
- Redirects to `/login` if `!isLoading && !user`
- Returns `null` during loading (no spinner flash)

---

## 5. Sprint Status

| Sprint | Status | Deliverables | Done |
|---|---|---|---|
| 0 | ✅ | Next.js + Supabase + Auth + Deploy | User can sign in |
| 1 | ✅ | Missions + Milestones + Pace tracking | User can fully manage missions |
| 2 | 🏗️ | Weekly Planner + AI Prioritization | User receives AI recommendations |
| 3 | ⬜ | Tasks + Reflection | User completes a full week |
| 4 | ⬜ | Dashboard + Analytics | User understands progress |

---

## 6. Component Patterns

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

### Modal Pattern

Modals (CreateMissionForm, EditMissionForm) follow the same structure:
- Fixed overlay with `bg-black/50`
- `Card` container centered
- Close button (✕) in header
- Props: `onClose: () => void`
- After success: call `onClose()` + `router.refresh()`

### Inline Form Pattern

Inline forms (CreateMilestoneForm, AddTaskForm) follow:
- Appear below the list when "Add" is clicked
- Fields compact (no modal)
- Cancel + Submit buttons
- Props: `onClose: () => void`

---

## 7. AI Integration Pattern

### Architecture

```
Client Component (AIPanel)
  → AI Service (aiService.ts)
    → API Route (/api/ai/suggest)
      → Groq (llama-3.1-8b-instant)
```

### Key Rules

1. **Prompts live in `src/features/ai/prompts/`** — exported as builder functions (`.ts`), not raw `.txt` files, because `fs.readFileSync` breaks in Vercel's serverless environment
2. **App works without AI** — AI is an enhancement layer
3. **AI only recommends** — user always decides
4. **Graceful degradation** — AI failure shows "unavailable" message, no crash

### Provider: Groq

- Fast inference with llama-3.1-8b-instant, generous free tier
- Get a key at https://console.groq.com/keys
- Set `GROQ_API_KEY` in `.env.local` / Vercel

### Prompt Template Pattern

```typescript
// src/features/ai/prompts/weekly-prioritization.ts
export function buildWeeklyPrompt(missions: Mission[]): string {
  return `You are Sprint29...
[prompt content with ${JSON.stringify(missions, null, 2)}]`;
}
```

Note: Prompts are `.ts` files exporting builder functions, NOT raw `.txt` files read via `fs.readFileSync()`. The latter breaks in Vercel's serverless runtime because the build process doesn't guarantee `.txt` files are available at runtime relative to `process.cwd()`.

### API Route

```typescript
// src/app/api/ai/suggest/route.ts
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callGroq(prompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.1-8b-instant",
  });
  return completion.choices[0]?.message?.content ?? "";
}
```

---

## 8. Key Constants

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

## 9. Development Rules

- Build one sprint at a time — never implement future sprint features
- Keep the application deployable after every change
- Prefer readability over cleverness
- Business logic never belongs inside UI
- One component = one responsibility
- One service = one responsibility
- Avoid duplicated code
- Keep components small
- Favor reusable components
- Update README, ROADMAP, and ARCHITECTURE after every sprint
- Record important architectural decisions in comments

### Deployment Checklist

Before merging:
- [ ] `npm run build` succeeds
- [ ] No console errors in browser
- [ ] Documentation updated
- [ ] New env vars added to Vercel

---

## 10. Common Pitfalls

1. **Cookie setting in server components** — `cookieStore.set()` throws in server components. Use the read-only `supabase-server.ts` for server components and `supabase-route-handler.ts` for route handlers.

2. **Browser extension hydration errors** — Extensions like Bing add `bis_skin_checked` attributes to the DOM. The root layout has `suppressHydrationWarning` on `<body>` and an inline script that strips these attributes before React hydrates.

3. **Stale `.next` cache** — Chunk loading errors (`__webpack_modules__[moduleId] is not a function`) are usually fixed by deleting `.next` and rebuilding.

4. **Supabase anon key format** — New Supabase projects use `sb_publishable_` prefix instead of `eyJ` JWT format. Use it as `NEXT_PUBLIC_SUPABASE_ANON_KEY` — it works the same way.

5. **Route groups in App Router** — Route groups `(name)` do NOT create URL segments. Two `page.tsx` files at the same level (one in a group, one without) will conflict at the same URL.
