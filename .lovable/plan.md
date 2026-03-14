
## Phase 1 Plan: Fix Build Errors + Auth + Company Routing

### Step 1 — Fix Build Errors

Three files have incomplete `video_assets` objects that are missing `failure_prompt` and `success_prompt`:

- `src/lib/api.ts` — `generateQuestionAssets` stub
- `src/lib/mockData.ts` — `generateMockQuestion` and `generateMockQuestions`
- `src/pages/QuizEditor.tsx` — `handleAddQuestion`

Fix: add `failure_prompt: ''` and `success_prompt: ''` to each incomplete `video_assets` literal.

---

### Step 2 — Supabase Connection

Connect your existing Supabase project via the connector prompt.

---

### Step 3 — Database Schema

4 new tables via Supabase migrations:

```text
companies
  id uuid PK
  name text
  slug text UNIQUE          ← used in URL: /acme/admin/...
  logo_url text
  banner_url text
  primary_color text        ← hex, e.g. "#2563eb"
  created_at timestamptz

app_role enum: 'super_admin' | 'company_admin' | 'employee'

user_roles
  id uuid PK
  user_id uuid → auth.users
  role app_role
  company_id uuid → companies
  UNIQUE(user_id, company_id)

profiles
  id uuid PK = auth.uid()
  company_id uuid → companies
  display_name text
  avatar_url text

quiz_attempts
  id uuid PK
  user_id uuid → auth.users
  quiz_id text             ← matches backend quiz ID
  score integer
  total integer
  answers_json jsonb
  completed_at timestamptz
```

RLS policies:
- Users read/write only their own profile
- Users read only their own company's data
- `has_role()` security definer function for admin checks

---

### Step 4 — Auth Pages

**`/login`** — Email + password login and signup tabs using `supabase.auth`

**Route guard** — `ProtectedRoute` component that redirects unauthenticated users to `/login`

---

### Step 5 — Company Routing + Branding Context

**`/:companySlug/*`** — A wrapper route that:
1. Looks up the company by slug from Supabase
2. Verifies the current user belongs to that company
3. Injects `--primary` CSS variable and exposes logo/banner via `CompanyContext`

**Landing page `/`** — Simple public hero page with "Sign In" button. Replaces the current dashboard (the dashboard moves to `/:companySlug/admin/`).

---

### Step 6 — Company Home (Employee View)

**`/:companySlug/`** — Employee landing:
- Company banner + logo
- List of available quizzes (calls existing backend API filtered by company)
- "Start Quiz" navigates to `/:companySlug/quiz/:quizId`

---

### Step 7 — Admin Dashboard Shell

**`/:companySlug/admin/`** — Admin home:
- Stat cards: total employees, quizzes, completion rate
- Sidebar nav: Overview / Employees / Materials / Quizzes / Settings

**`/:companySlug/admin/employees`** — Employee table with invite button (sends Supabase invite email)

**`/:companySlug/admin/materials`** — Existing upload wizard + list of manuals (scoped to company)

---

### What is NOT in Phase 1
- Quiz attempt tracking / results dashboard (Phase 2)
- Company branding settings page (Phase 2)
- Presentation mode changes (already works)

---

### Files to create / modify

| Action | File |
|---|---|
| Fix | `src/lib/api.ts`, `src/lib/mockData.ts`, `src/pages/QuizEditor.tsx` |
| Create | `supabase/migrations/001_companies_and_auth.sql` |
| Create | `src/integrations/supabase/client.ts` |
| Create | `src/contexts/CompanyContext.tsx` |
| Create | `src/contexts/AuthContext.tsx` |
| Create | `src/components/ProtectedRoute.tsx` |
| Create | `src/pages/Landing.tsx` |
| Create | `src/pages/Login.tsx` |
| Create | `src/pages/CompanyHome.tsx` |
| Create | `src/pages/admin/AdminDashboard.tsx` |
| Create | `src/pages/admin/AdminEmployees.tsx` |
| Create | `src/pages/admin/AdminMaterials.tsx` |
| Modify | `src/App.tsx` — add all new routes |
| Modify | `src/pages/Index.tsx` → becomes `Landing.tsx` |
