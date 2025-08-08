-- Create function to ensure a users row exists for the authenticated user
CREATE OR REPLACE FUNCTION public.ensure_user_profile()
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email text;
  v_name text;
  v_company_id uuid;
  v_user public.users%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get email, name and optional company_id from auth.users metadata
  SELECT u.email,
         COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
         COALESCE((u.raw_user_meta_data->>'company_id')::uuid, '00000000-0000-0000-0000-000000000000'::uuid)
  INTO v_email, v_name, v_company_id
  FROM auth.users u
  WHERE u.id = auth.uid();

  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Cannot resolve current user email';
  END IF;

  -- Insert if missing
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()) THEN
    INSERT INTO public.users (id, email, name, company_id, role)
    VALUES (auth.uid(), v_email, v_name, v_company_id, 'COLLABORATOR');
  END IF;

  SELECT * INTO v_user FROM public.users WHERE id = auth.uid();
  RETURN v_user;
END;
$$;

-- Restrict and grant execute to authenticated users
REVOKE ALL ON FUNCTION public.ensure_user_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO authenticated;