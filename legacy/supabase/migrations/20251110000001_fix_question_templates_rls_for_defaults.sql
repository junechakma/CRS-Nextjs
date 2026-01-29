-- Migration: Fix RLS policy to allow university admins to see default templates
-- This allows university admins to view both default system templates and their university-specific templates

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "users_select_university_templates" ON question_templates;

-- Create new policy that allows:
-- 1. Super admins to see all templates
-- 2. University admins to see their university's templates
-- 3. University admins to see default system templates (where university_id IS NULL and is_default = true)
CREATE POLICY "users_select_university_and_default_templates"
  ON question_templates
  FOR SELECT
  TO authenticated
  USING (
    -- Super admins can see all templates
    get_current_user_role() = 'super_admin'
    OR
    -- University admins can see their own university's templates
    university_id = get_current_user_university_id()
    OR
    -- Anyone can see default system templates
    (university_id IS NULL AND is_default = true)
  );

COMMENT ON POLICY "users_select_university_and_default_templates" ON question_templates IS
  'Allow super admins to see all templates, university admins to see their templates and default system templates';
