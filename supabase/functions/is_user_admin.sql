
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Direct query to check if user is admin without using RLS
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'ADMIN'
  );
END;
$$;
