-- Fix RLS policies to ensure super admin can see ALL users
-- Issue: Currently super admin can only see themselves due to restrictive RLS policies

-- The problem is that multiple SELECT policies on the users table may be evaluated incorrectly
-- PostgreSQL RLS uses OR logic between policies, but the policies need to be properly structured

-- Drop existing conflicting SELECT policies on users table
DROP POLICY IF EXISTS "users_select_self" ON "public"."users";
DROP POLICY IF EXISTS "users_select_own_and_managed" ON "public"."users";

-- Recreate the super admin policy with higher priority by recreating it last
-- This ensures it's evaluated properly
DROP POLICY IF EXISTS "super_admins_select_all_users" ON "public"."users";
CREATE POLICY "super_admins_select_all_users"
ON "public"."users"
FOR SELECT
TO "authenticated"
USING (
  "public"."get_current_user_role"() = 'super_admin'::text
);

-- Recreate user self-select policy (users can see their own record)
CREATE POLICY "users_select_self"
ON "public"."users"
FOR SELECT
TO "authenticated"
USING (
  "auth_user_id" = "auth"."uid"()
);

-- Recreate policy for users to see managed users (for admins managing their hierarchy)
CREATE POLICY "users_select_own_and_managed"
ON "public"."users"
FOR SELECT
TO "authenticated"
USING (
  "auth_user_id" = "auth"."uid"()
  OR (
    -- University admins can see users in their university
    EXISTS (
      SELECT 1
      FROM "public"."users" AS requesting_user
      WHERE requesting_user."auth_user_id" = "auth"."uid"()
        AND requesting_user."role" = 'university_admin'
        AND "users"."university_id" = requesting_user."university_id"
    )
  )
  OR (
    -- Faculty admins can see users in their faculty
    EXISTS (
      SELECT 1
      FROM "public"."users" AS requesting_user
      WHERE requesting_user."auth_user_id" = "auth"."uid"()
        AND requesting_user."role" = 'faculty_admin'
        AND "users"."faculty_id" = requesting_user."faculty_id"
    )
  )
  OR (
    -- Department moderators can see users in their department
    EXISTS (
      SELECT 1
      FROM "public"."users" AS requesting_user
      WHERE requesting_user."auth_user_id" = "auth"."uid"()
        AND requesting_user."role" = 'department_moderator'
        AND "users"."department_id" = requesting_user."department_id"
    )
  )
);

-- Add comment to document the fix
COMMENT ON POLICY "super_admins_select_all_users" ON "public"."users" IS
'Allows super admins to see ALL users in the system without restrictions. This policy has priority over other SELECT policies.';

COMMENT ON POLICY "users_select_self" ON "public"."users" IS
'Allows users to see their own record.';

COMMENT ON POLICY "users_select_own_and_managed" ON "public"."users" IS
'Allows admins to see users they manage within their organizational hierarchy (university/faculty/department).';
