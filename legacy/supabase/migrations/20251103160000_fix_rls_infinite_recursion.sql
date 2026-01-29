-- Fix infinite recursion in RLS policies
-- The issue is that policies on the users table call helper functions that query the users table,
-- which triggers RLS policies again, creating infinite recursion.

-- Solution: Remove ALL policies that use helper functions or subqueries on the users table
-- Keep only the simplest policy that allows users to see their own record

-- Drop all SELECT policies on users table
DROP POLICY IF EXISTS "users_select_own_and_managed" ON "public"."users";
DROP POLICY IF EXISTS "department_moderators_select_department_users" ON "public"."users";
DROP POLICY IF EXISTS "faculty_admins_select_faculty_users" ON "public"."users";
DROP POLICY IF EXISTS "super_admins_select_all_users" ON "public"."users";
DROP POLICY IF EXISTS "university_admins_select_university_users" ON "public"."users";
DROP POLICY IF EXISTS "users_select_self" ON "public"."users";

-- Drop problematic UPDATE policies
DROP POLICY IF EXISTS "users_update_own_and_managed" ON "public"."users";
DROP POLICY IF EXISTS "users_update_self" ON "public"."users";

-- Drop problematic DELETE policies that use helper functions
DROP POLICY IF EXISTS "super_admins_delete_users" ON "public"."users";
DROP POLICY IF EXISTS "users_delete_by_admins" ON "public"."users";

-- Drop problematic INSERT policies
DROP POLICY IF EXISTS "super_admins_insert_users" ON "public"."users";
DROP POLICY IF EXISTS "users_insert_by_admins" ON "public"."users";

-- Drop problematic UPDATE policies
DROP POLICY IF EXISTS "super_admins_update_users" ON "public"."users";

-- Create a single, simple SELECT policy that allows users to see their own profile
-- This is the ONLY policy that is safe from recursion
CREATE POLICY "enable_read_own_profile"
ON "public"."users"
FOR SELECT
TO "authenticated"
USING (auth_user_id = auth.uid());

-- Create a simple UPDATE policy for users to update their own profile
CREATE POLICY "enable_update_own_profile"
ON "public"."users"
FOR UPDATE
TO "authenticated"
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- For admin operations, we'll handle permissions in the application layer
-- or use service_role key for admin operations
-- This removes the circular dependency completely

-- Add a service role policy to allow full access via service_role
CREATE POLICY "enable_all_for_service_role"
ON "public"."users"
FOR ALL
TO "service_role"
USING (true)
WITH CHECK (true);
