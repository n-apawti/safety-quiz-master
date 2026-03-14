
-- Drop existing FKs pointing to auth.users (PostgREST can't join across schemas)
ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_user_id_fkey;
ALTER TABLE public.quiz_attempts DROP CONSTRAINT quiz_attempts_user_id_fkey;

-- Re-add FKs pointing to public.profiles so PostgREST can join them
ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.quiz_attempts
  ADD CONSTRAINT quiz_attempts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
