-- Migration: Add RLS policy for teachers to view questions
-- Teachers need to see questions from both their university's templates and default templates

-- Add policy for teachers to select questions
CREATE POLICY "teachers_select_questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    get_current_user_role() = 'teacher'
    AND (
      -- University-specific questions
      university_id = get_current_user_university_id()
      OR
      -- Default system questions (no university_id)
      (university_id IS NULL AND is_default = true AND is_active = true)
    )
  );

COMMENT ON POLICY "teachers_select_questions" ON questions IS
  'Allow teachers to see questions from their university and active default questions';

-- Also add policy for teachers to select template_questions
-- (They need this to see which questions belong to which templates)
CREATE POLICY "teachers_select_template_questions"
  ON template_questions
  FOR SELECT
  TO authenticated
  USING (
    get_current_user_role() = 'teacher'
    AND EXISTS (
      SELECT 1
      FROM question_templates qt
      WHERE qt.id = template_questions.template_id
      AND (
        -- University admins can see their templates
        qt.university_id = get_current_user_university_id()
        OR
        -- Anyone can see template_questions from default templates
        (qt.university_id IS NULL AND qt.is_default = true)
      )
    )
  );

COMMENT ON POLICY "teachers_select_template_questions" ON template_questions IS
  'Allow teachers to see template_questions from their university templates and default system templates';
