
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

