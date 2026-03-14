-- Allow company_id to be NULL (needed for super_admin who spans all companies)
ALTER TABLE public.user_roles ALTER COLUMN company_id DROP NOT NULL;

-- Update has_role function to handle NULL company_id for super_admin
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role, _company_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (
        _company_id IS NULL
        OR company_id = _company_id
        OR company_id IS NULL
      )
  )
$$;

-- Update RLS on companies so super_admins can manage all
DROP POLICY IF EXISTS "Super admins can manage companies" ON public.companies;
CREATE POLICY "Super admins can manage companies" ON public.companies
  FOR ALL USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Update user_roles RLS for super_admins
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
CREATE POLICY "Super admins can manage all roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'super_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Allow super_admins to view all profiles
DROP POLICY IF EXISTS "Company admins can view profiles in their company" ON public.profiles;
CREATE POLICY "Company admins can view profiles in their company" ON public.profiles
  FOR SELECT USING (
    company_id = get_user_company_id(auth.uid())
    OR has_role(auth.uid(), 'super_admin')
    OR has_role(auth.uid(), 'company_admin', company_id)
  );