-- Migration: Fix RLS policies to allow university admins to see questions from default templates
-- This allows university admins to view questions and template_questions from default system templates

-- Fix questions table RLS policy
DROP POLICY IF EXISTS "university_admins_select_questions" ON questions;

CREATE POLICY "university_admins_select_questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    get_current_user_role() = 'university_admin'
    AND (
      -- University-specific questions
      university_id = get_current_user_university_id()
      OR
      -- Default system questions (no university_id)
      (university_id IS NULL AND is_default = true)
    )
  );

-- Fix template_questions RLS policy
DROP POLICY IF EXISTS "users_select_template_questions" ON template_questions;

CREATE POLICY "users_select_template_questions"
  ON template_questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM question_templates qt
      WHERE qt.id = template_questions.template_id
      AND (
        -- Super admins can see all
        get_current_user_role() = 'super_admin'
        OR
        -- University admins can see their templates
        qt.university_id = get_current_user_university_id()
        OR
        -- Anyone can see template_questions from default templates
        (qt.university_id IS NULL AND qt.is_default = true)
      )
    )
  );

COMMENT ON POLICY "university_admins_select_questions" ON questions IS
  'Allow university admins to see their questions and default system questions';

COMMENT ON POLICY "users_select_template_questions" ON template_questions IS
  'Allow users to see template_questions from their templates and default system templates';
