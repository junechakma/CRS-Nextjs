-- Auto-approve faculty_admin and department_moderator when created
-- These are always created by University Admin or Faculty Admin, so they should be automatically approved

-- Create a function to set the approved_by field after user creation
-- This uses SECURITY DEFINER to bypass RLS since the auth context may change after signUp
CREATE OR REPLACE FUNCTION public.set_user_approved_by(
  p_user_id UUID,
  p_approved_by UUID
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  UPDATE public.users
  SET 
    approved_by = p_approved_by,
    approval_date = NOW()
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION public.set_user_approved_by IS 'Sets the approved_by field for a user. Uses SECURITY DEFINER to bypass RLS.';

-- Update the handle_new_user trigger function to auto-approve faculty_admin and department_moderator
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_name TEXT;
  user_role TEXT;
  user_university_id UUID;
  user_faculty_id UUID;
  user_department_id UUID;
  user_phone VARCHAR(20);
  user_initial VARCHAR(10);
BEGIN
  -- Extract metadata from raw_user_meta_data
  user_name := NEW.raw_user_meta_data->>'name';
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');

  -- Handle UUID fields - convert from text if present
  BEGIN
    user_university_id := (NEW.raw_user_meta_data->>'university_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    user_university_id := NULL;
  END;

  BEGIN
    user_faculty_id := (NEW.raw_user_meta_data->>'faculty_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    user_faculty_id := NULL;
  END;

  BEGIN
    user_department_id := (NEW.raw_user_meta_data->>'department_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    user_department_id := NULL;
  END;

  user_phone := NEW.raw_user_meta_data->>'phone';
  user_initial := NEW.raw_user_meta_data->>'initial';

  -- Insert into public.users table
  -- SECURITY DEFINER allows this to bypass RLS
  INSERT INTO public.users (
    auth_user_id,
    email,
    name,
    role,
    status,
    approval_status,
    university_id,
    faculty_id,
    department_id,
    phone,
    initial,
    password_change_required,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role,
    -- Auto-approve super_admins, teachers, faculty_admins, and department_moderators
    -- These are always created by admins, not self-registered
    CASE
      WHEN user_role IN ('super_admin', 'teacher', 'faculty_admin', 'department_moderator') THEN 'active'
      ELSE 'pending'
    END,
    -- Auto-approve super_admins, teachers, faculty_admins, and department_moderators
    CASE
      WHEN user_role IN ('super_admin', 'teacher', 'faculty_admin', 'department_moderator') THEN 'approved'
      ELSE 'pending'
    END,
    user_university_id,
    user_faculty_id,
    user_department_id,
    user_phone,
    user_initial,
    -- Teachers, faculty_admins, and department_moderators should change password on first login
    CASE
      WHEN user_role IN ('teacher', 'faculty_admin', 'department_moderator') THEN true
      ELSE false
    END,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (will appear in Postgres logs)
    RAISE WARNING 'Error creating user profile for %: %', NEW.email, SQLERRM;
    -- Re-raise the error to prevent user creation
    RAISE;
END;
$function$;

COMMENT ON FUNCTION public.handle_new_user IS 'Creates user profile when auth user is created. Auto-approves super_admins, teachers, faculty_admins, and department_moderators.';

-- Also update any existing faculty_admins and department_moderators to be active and approved
-- This fixes any existing records that were created before this fix
UPDATE public.users
SET 
  status = 'active',
  approval_status = 'approved',
  updated_at = NOW()
WHERE role IN ('faculty_admin', 'department_moderator')
AND (status = 'pending' OR approval_status = 'pending');
