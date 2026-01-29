-- Auto-approve teachers when created via Supabase Auth
-- Teachers are created by University Admins, so they should be automatically approved

-- Update the handle_new_user trigger function to auto-approve teachers
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
    -- Auto-approve super_admins and teachers (teachers are created by university admins)
    CASE
      WHEN user_role IN ('super_admin', 'teacher') THEN 'active'
      ELSE 'pending'
    END,
    -- Auto-approve super_admins and teachers
    CASE
      WHEN user_role IN ('super_admin', 'teacher') THEN 'approved'
      ELSE 'pending'
    END,
    user_university_id,
    user_faculty_id,
    user_department_id,
    user_phone,
    user_initial,
    -- Teachers should be required to change password on first login
    CASE
      WHEN user_role = 'teacher' THEN true
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

COMMENT ON FUNCTION public.handle_new_user IS 'Creates user profile when auth user is created. Auto-approves super_admins and teachers.';
