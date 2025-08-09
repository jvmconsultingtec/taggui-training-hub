-- Fix recursive RLS on users by replacing self-referencing policies with SECURITY DEFINER helpers

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop problematic and duplicate policies that reference public.users within users policies (causing recursion)
DROP POLICY IF EXISTS "Admins can manage users from same company" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Allow admins to manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view their own user data" ON public.users;
DROP POLICY IF EXISTS "Users from same company are visible" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own user data" ON public.users;

-- Minimal, safe policies (no recursion)

-- 1) Users can view only their own record
CREATE POLICY "Users: select self"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- 2) Admins can view users in their company
CREATE POLICY "Admins: select company users"
ON public.users
FOR SELECT
USING (public.is_admin() AND company_id = public.get_auth_user_company_id());

-- 3) Users can update only their own record
CREATE POLICY "Users: update self"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4) Admins can update users in their company
CREATE POLICY "Admins: update company users"
ON public.users
FOR UPDATE
USING (public.is_admin() AND company_id = public.get_auth_user_company_id())
WITH CHECK (public.is_admin() AND company_id = public.get_auth_user_company_id());

-- 5) Admins can delete users in their company (optional, required by some admin flows)
CREATE POLICY "Admins: delete company users"
ON public.users
FOR DELETE
USING (public.is_admin() AND company_id = public.get_auth_user_company_id());