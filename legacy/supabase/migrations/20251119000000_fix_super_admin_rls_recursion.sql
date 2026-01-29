-- Fix RLS circular dependency for super admin viewing all users
-- The issue: get_current_user_role() is a SQL function that queries users table, triggering RLS
-- Solution: Convert it to a SECURITY DEFINER plpgsql function that bypasses RLS

-- Replace the existing get_current_user_role() function with a SECURITY DEFINER version
-- This will bypass RLS and prevent infinite recursion
CREATE OR REPLACE FUNCTION "public"."get_current_user_role"()
RETURNS "text"
LANGUAGE "plpgsql"
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Query the users table without triggering RLS (SECURITY DEFINER bypasses RLS)
  SELECT role INTO user_role
  FROM public.users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;

  RETURN user_role;
END;
$$;

-- Update the comment
COMMENT ON FUNCTION "public"."get_current_user_role"() IS
'Security definer function that bypasses RLS to get current user role, preventing infinite recursion in RLS policies.';

-- Create helper functions for getting user properties without RLS recursion
CREATE OR REPLACE FUNCTION "public"."get_current_user_university_id"()
RETURNS "uuid"
LANGUAGE "plpgsql"
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uni_id uuid;
BEGIN
  SELECT university_id INTO uni_id
  FROM public.users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;

  RETURN uni_id;
END;
$$;

GRANT EXECUTE ON FUNCTION "public"."get_current_user_university_id"() TO "authenticated";

CREATE OR REPLACE FUNCTION "public"."get_current_user_faculty_id"()
RETURNS "uuid"
LANGUAGE "plpgsql"
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fac_id uuid;
BEGIN
  SELECT faculty_id INTO fac_id
  FROM public.users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;

  RETURN fac_id;
END;
$$;

GRANT EXECUTE ON FUNCTION "public"."get_current_user_faculty_id"() TO "authenticated";

CREATE OR REPLACE FUNCTION "public"."get_current_user_department_id"()
RETURNS "uuid"
LANGUAGE "plpgsql"
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dept_id uuid;
BEGIN
  SELECT department_id INTO dept_id
  FROM public.users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;

  RETURN dept_id;
END;
$$;

GRANT EXECUTE ON FUNCTION "public"."get_current_user_department_id"() TO "authenticated";

-- Drop and recreate the SELECT policies on users table to ensure proper ordering
DROP POLICY IF EXISTS "super_admins_select_all_users" ON "public"."users";
DROP POLICY IF EXISTS "users_select_self" ON "public"."users";
DROP POLICY IF EXISTS "users_select_own_and_managed" ON "public"."users";
DROP POLICY IF EXISTS "admins_select_managed_users" ON "public"."users";
DROP POLICY IF EXISTS "enable_read_own_profile" ON "public"."users";

-- Create super admin policy - now safe from recursion due to SECURITY DEFINER
CREATE POLICY "super_admins_select_all_users"
ON "public"."users"
FOR SELECT
TO "authenticated"
USING (
  "public"."get_current_user_role"() = 'super_admin'
);

-- Policy for users to see their own record
CREATE POLICY "users_select_self"
ON "public"."users"
FOR SELECT
TO "authenticated"
USING (
  "auth_user_id" = "auth"."uid"()
);

-- Policy for admins to see users in their hierarchy using SECURITY DEFINER functions
CREATE POLICY "admins_select_managed_users"
ON "public"."users"
FOR SELECT
TO "authenticated"
USING (
  -- University admins can see users in their university
  (
    "public"."get_current_user_role"() = 'university_admin'
    AND "users"."university_id" = "public"."get_current_user_university_id"()
    AND "public"."get_current_user_university_id"() IS NOT NULL
  )
  OR
  -- Faculty admins can see users in their faculty
  (
    "public"."get_current_user_role"() = 'faculty_admin'
    AND "users"."faculty_id" = "public"."get_current_user_faculty_id"()
    AND "public"."get_current_user_faculty_id"() IS NOT NULL
  )
  OR
  -- Department moderators can see users in their department
  (
    "public"."get_current_user_role"() = 'department_moderator'
    AND "users"."department_id" = "public"."get_current_user_department_id"()
    AND "public"."get_current_user_department_id"() IS NOT NULL
  )
);

-- Add comments explaining the policies
COMMENT ON POLICY "super_admins_select_all_users" ON "public"."users" IS
'Allows super admins to see all users. Uses SECURITY DEFINER function to avoid RLS recursion.';

COMMENT ON POLICY "users_select_self" ON "public"."users" IS
'Allows users to see their own record.';

COMMENT ON POLICY "admins_select_managed_users" ON "public"."users" IS
'Allows admins to see users they manage within their organizational hierarchy. Uses SECURITY DEFINER functions to avoid RLS recursion.';
