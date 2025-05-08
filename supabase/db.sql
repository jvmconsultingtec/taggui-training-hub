
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
