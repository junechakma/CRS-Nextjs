-- Drop the incorrect version of the function if it exists
DROP FUNCTION IF EXISTS "public"."create_university_admin_by_super_admin"(uuid, text, text, text, text, text, jsonb, text);

-- Recreate the correct function with proper signature
-- This function is called AFTER auth.signUp creates the user
-- The handle_new_user trigger already creates the user record, so we just update it
CREATE OR REPLACE FUNCTION "public"."create_university_admin_by_super_admin"(
  p_super_admin_id uuid,
  p_auth_user_id uuid,
  p_email text,
  p_name text,
  p_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_result jsonb;
  v_user_exists boolean;
BEGIN
  -- Verify that the requester is a super admin
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = p_super_admin_id
    AND role = 'super_admin'
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only super admins can create university admins directly';
  END IF;

  -- Check if user was already created by the handle_new_user trigger
  SELECT EXISTS (SELECT 1 FROM users WHERE auth_user_id = p_auth_user_id) INTO v_user_exists;

  IF v_user_exists THEN
    -- User was already created by trigger, just update the approval details
    UPDATE users
    SET
      status = 'active',
      approval_status = 'approved',
      approved_by = p_super_admin_id,
      approval_date = NOW(),
      phone = COALESCE(p_phone, phone),
      name = COALESCE(p_name, name)
    WHERE auth_user_id = p_auth_user_id
    RETURNING id INTO v_user_id;
  ELSE
    -- User doesn't exist yet, create it
    -- (This shouldn't happen if handle_new_user trigger is working)
    INSERT INTO users (
      id,
      auth_user_id,
      email,
      name,
      phone,
      role,
      status,
      approval_status,
      university_id,
      approved_by,
      approval_date,
      application_date
    ) VALUES (
      gen_random_uuid(),
      p_auth_user_id,
      p_email,
      p_name,
      p_phone,
      'university_admin',
      'active',
      'approved',
      NULL,
      p_super_admin_id,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_user_id;
  END IF;

  -- Return result
  v_result := jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'auth_user_id', p_auth_user_id,
    'message', 'University admin created successfully. They can now log in and complete university setup.'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating university admin: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION "public"."create_university_admin_by_super_admin"(uuid, uuid, text, text, text) TO "authenticated";

-- Add comment
COMMENT ON FUNCTION "public"."create_university_admin_by_super_admin"(uuid, uuid, text, text, text) IS
'Allows super admins to directly create and auto-approve university admins. The admin will complete university setup after logging in.';
