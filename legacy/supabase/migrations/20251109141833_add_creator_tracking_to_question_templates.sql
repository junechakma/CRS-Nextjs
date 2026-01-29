-- Add foreign key constraint for created_by column
-- This ensures created_by references a valid user

ALTER TABLE question_templates
ADD CONSTRAINT question_templates_created_by_fkey
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_question_templates_created_by ON question_templates(created_by);

-- Update RLS policies to better handle creator tracking
-- Drop old policies
DROP POLICY IF EXISTS "admins_manage_templates" ON question_templates;
DROP POLICY IF EXISTS "users_select_university_templates" ON question_templates;

-- New policy: Super admins can manage all templates
CREATE POLICY "super_admins_manage_all_templates"
ON question_templates
FOR ALL
TO authenticated
USING (get_current_user_role() = 'super_admin')
WITH CHECK (get_current_user_role() = 'super_admin');

-- New policy: University admins can manage templates in their university
CREATE POLICY "university_admins_manage_own_templates"
ON question_templates
FOR ALL
TO authenticated
USING (
  get_current_user_role() = 'university_admin'
  AND university_id = get_current_user_university_id()
)
WITH CHECK (
  get_current_user_role() = 'university_admin'
  AND university_id = get_current_user_university_id()
);

-- New policy: Users can view templates from their university OR default templates (university_id IS NULL)
CREATE POLICY "users_view_accessible_templates"
ON question_templates
FOR SELECT
TO authenticated
USING (
  -- Default templates (created by super admin, no university_id)
  university_id IS NULL
  OR
  -- Templates from user's university
  university_id = get_current_user_university_id()
  OR
  -- Super admins can see everything
  get_current_user_role() = 'super_admin'
);

-- Add trigger to automatically set created_by
CREATE OR REPLACE FUNCTION set_question_template_creator()
RETURNS TRIGGER AS $$
BEGIN
  -- Set created_by to current user if not already set
  IF NEW.created_by IS NULL THEN
    NEW.created_by := get_current_user_id();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_question_template_creator_trigger
BEFORE INSERT ON question_templates
FOR EACH ROW
EXECUTE FUNCTION set_question_template_creator();

-- Add comments
COMMENT ON COLUMN question_templates.created_by IS 'User who created this template (super_admin or university_admin)';
COMMENT ON TRIGGER set_question_template_creator_trigger ON question_templates IS 'Automatically sets created_by to current user on insert';
