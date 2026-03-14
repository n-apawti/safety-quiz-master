

## Plan

### 1. Fix the edge function build error
The `err` variable in the catch block is typed as `unknown` in TypeScript strict mode. Change `err.message` to `(err as Error).message` on line 137 of `invite-employee/index.ts`.

### 2. Deploy the edge function
Deploy the `invite-employee` edge function to the connected backend.

### 3. Run all database migrations
Execute the three existing migration SQL files to create the full schema (tables, enums, functions, RLS policies, triggers) on the new backend:
- Migration 1: Core schema (companies, user_roles, profiles, quiz_attempts, has_role, RLS, triggers)
- Migration 2: Allow nullable company_id for super_admin, update has_role function
- Migration 3: Re-point foreign keys to public.profiles

### 4. Make n.apawti@gmail.com a super_admin
After the user signs up or is found in the system, insert a row into `user_roles` with their user ID, role `super_admin`, and `company_id` as NULL. This will be done via a SQL insert after confirming the user exists in auth/profiles.

**Note:** The email has a typo (`.con` instead of `.com`). I'll confirm with you before proceeding — did you mean **n.apawti@gmail.com**?

