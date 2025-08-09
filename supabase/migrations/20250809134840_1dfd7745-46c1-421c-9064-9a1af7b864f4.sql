-- Enable RLS and simplify policies to fix "permission denied" on user_groups and related tables

-- Ensure RLS is enabled on relevant tables
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_group_assignments ENABLE ROW LEVEL SECURITY;

-- Clean up existing user_groups policies to avoid overlaps
DROP POLICY IF EXISTS "Admins can manage user groups" ON public.user_groups;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.user_groups;
DROP POLICY IF EXISTS "Users can access their company groups" ON public.user_groups;
DROP POLICY IF EXISTS "Users can delete groups from their company" ON public.user_groups;
DROP POLICY IF EXISTS "Users can delete groups in same company" ON public.user_groups;
DROP POLICY IF EXISTS "Users can delete their company groups" ON public.user_groups;
DROP POLICY IF EXISTS "Users can insert groups for their company" ON public.user_groups;
DROP POLICY IF EXISTS "Users can update groups from their company" ON public.user_groups;
DROP POLICY IF EXISTS "Users can update groups in same company" ON public.user_groups;
DROP POLICY IF EXISTS "Users can update their company groups" ON public.user_groups;
DROP POLICY IF EXISTS "Users can view groups from their company" ON public.user_groups;
DROP POLICY IF EXISTS "Users can view groups in same company" ON public.user_groups;
DROP POLICY IF EXISTS "Users can view their company groups" ON public.user_groups;

-- Minimal, explicit policies for user_groups
CREATE POLICY user_groups_select_company
ON public.user_groups
FOR SELECT
USING (company_id = public.get_auth_user_company_id());

CREATE POLICY user_groups_insert_admin_company
ON public.user_groups
FOR INSERT
WITH CHECK (public.is_admin() AND company_id = public.get_auth_user_company_id());

CREATE POLICY user_groups_update_admin_company
ON public.user_groups
FOR UPDATE
USING (public.is_admin() AND company_id = public.get_auth_user_company_id())
WITH CHECK (public.is_admin() AND company_id = public.get_auth_user_company_id());

CREATE POLICY user_groups_delete_admin_company
ON public.user_groups
FOR DELETE
USING (public.is_admin() AND company_id = public.get_auth_user_company_id());

-- Clean up existing user_group_members policies
DROP POLICY IF EXISTS "Admins can manage group members" ON public.user_group_members;
DROP POLICY IF EXISTS "Users can access their company group members" ON public.user_group_members;

-- Policies for user_group_members
CREATE POLICY ugm_select_company
ON public.user_group_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_groups g
    WHERE g.id = user_group_members.group_id
      AND g.company_id = public.get_auth_user_company_id()
  )
);

CREATE POLICY ugm_mutate_admin_company
ON public.user_group_members
FOR ALL
USING (
  public.is_admin() AND EXISTS (
    SELECT 1 FROM public.user_groups g
    WHERE g.id = user_group_members.group_id
      AND g.company_id = public.get_auth_user_company_id()
  )
)
WITH CHECK (
  public.is_admin() AND EXISTS (
    SELECT 1 FROM public.user_groups g
    WHERE g.id = user_group_members.group_id
      AND g.company_id = public.get_auth_user_company_id()
  )
);

-- Clean up existing training_group_assignments policies
DROP POLICY IF EXISTS "Admins can manage training group assignments" ON public.training_group_assignments;

-- Policies for training_group_assignments
CREATE POLICY tga_select_company
ON public.training_group_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_groups g
    JOIN public.trainings t ON t.id = training_group_assignments.training_id
    WHERE g.id = training_group_assignments.group_id
      AND g.company_id = public.get_auth_user_company_id()
      AND t.company_id = public.get_auth_user_company_id()
  )
);

CREATE POLICY tga_mutate_admin_company
ON public.training_group_assignments
FOR ALL
USING (
  public.is_admin() AND EXISTS (
    SELECT 1 FROM public.user_groups g
    WHERE g.id = training_group_assignments.group_id
      AND g.company_id = public.get_auth_user_company_id()
  )
)
WITH CHECK (
  public.is_admin() AND EXISTS (
    SELECT 1 FROM public.user_groups g
    WHERE g.id = training_group_assignments.group_id
      AND g.company_id = public.get_auth_user_company_id()
  )
);
