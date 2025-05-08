

-- Create a stored procedure to fetch users without recursion
CREATE OR REPLACE FUNCTION public.fetch_company_users()
RETURNS SETOF public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Return all users from the same company as the authenticated user
  RETURN QUERY
  SELECT u.*
  FROM public.users u
  WHERE u.company_id = (
    SELECT company_id
    FROM public.users
    WHERE id = auth.uid()
  );
END;
$$;

-- Create a function to check if a user has access to a training
CREATE OR REPLACE FUNCTION public.user_has_training_access(p_user_id UUID, p_training_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_has_access BOOLEAN;
BEGIN
  -- Check if there's a direct assignment
  SELECT EXISTS (
    SELECT 1 FROM training_assignments 
    WHERE user_id = p_user_id AND training_id = p_training_id
  ) INTO v_has_access;

  -- If no direct assignment, check for group assignment
  IF NOT v_has_access THEN
    SELECT EXISTS (
      SELECT 1 
      FROM training_group_assignments tga
      JOIN user_group_members ugm ON tga.group_id = ugm.group_id
      WHERE ugm.user_id = p_user_id AND tga.training_id = p_training_id
    ) INTO v_has_access;
  END IF;

  RETURN v_has_access;
END;
$$;

-- Create a function to check if the current user is an admin (without parameters)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$;

-- Create a function to safely check if a specific user belongs to the same company
-- This will be used in RLS policies to avoid recursion
CREATE OR REPLACE FUNCTION public.check_same_company_access(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_company_id UUID;
  v_target_company_id UUID;
BEGIN
  -- Get current user's company
  SELECT company_id INTO v_user_company_id 
  FROM public.users 
  WHERE id = auth.uid();
  
  -- Get target user's company
  SELECT company_id INTO v_target_company_id 
  FROM public.users 
  WHERE id = target_user_id;
  
  -- Return true if same company
  RETURN v_user_company_id = v_target_company_id;
END;
$$;

-- Create a function to get the current user's company ID
-- This avoids recursion issues in RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Direct query to public.users to get the company_id
  SELECT company_id 
  FROM public.users 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Add a more reliable way to get authenticated user's company ID
CREATE OR REPLACE FUNCTION public.get_auth_user_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Direct query to get company_id without using RLS
  SELECT company_id INTO v_company_id 
  FROM public.users 
  WHERE id = auth.uid();
  
  RETURN v_company_id;
END;
$$;

-- Create a function for user groups access that doesn't recursively query the same table
CREATE OR REPLACE FUNCTION public.can_access_user_group(group_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_company_id UUID;
  v_group_company_id UUID;
BEGIN
  -- Get authenticated user's company ID using our helper function
  v_user_company_id := public.get_auth_user_company_id();
  
  -- Get the group's company ID
  SELECT company_id INTO v_group_company_id 
  FROM public.user_groups 
  WHERE id = group_id;
  
  -- Return true if same company
  RETURN v_user_company_id = v_group_company_id;
END;
$$;

-- Create a function to safely check if a user can access a group member
CREATE OR REPLACE FUNCTION public.can_access_group_member(member_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_company_id UUID;
  v_group_id UUID;
  v_group_company_id UUID;
BEGIN
  -- Get authenticated user's company ID
  v_user_company_id := public.get_auth_user_company_id();
  
  -- Get the group ID for this member
  SELECT group_id INTO v_group_id 
  FROM public.user_group_members 
  WHERE id = member_id;
  
  -- Get the group's company ID
  SELECT company_id INTO v_group_company_id 
  FROM public.user_groups 
  WHERE id = v_group_id;
  
  -- Return true if same company
  RETURN v_user_company_id = v_group_company_id;
END;
$$;

