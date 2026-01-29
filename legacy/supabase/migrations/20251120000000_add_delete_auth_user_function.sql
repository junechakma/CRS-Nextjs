-- Create a function to delete a user from auth.users
-- This function can only be called by super admins
CREATE OR REPLACE FUNCTION delete_auth_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calling_user_role text;
BEGIN
  -- Get the role of the calling user
  SELECT role INTO calling_user_role
  FROM public.users
  WHERE auth_user_id = auth.uid();

  -- Only super_admin can delete auth users
  IF calling_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can delete users from authentication';
  END IF;

  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = user_id;

END;
$$;

-- Grant execute permission to authenticated users (the function itself checks for super_admin role)
GRANT EXECUTE ON FUNCTION delete_auth_user(uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION delete_auth_user(uuid) IS 'Deletes a user from Supabase Auth. Can only be called by super admins.';
