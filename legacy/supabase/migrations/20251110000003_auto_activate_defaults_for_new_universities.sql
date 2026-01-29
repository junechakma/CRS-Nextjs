-- Migration: Auto-activate default templates for universities
-- This ensures that when new universities are created or existing ones access templates,
-- default templates are automatically activated for them

-- Function to auto-activate default templates for a university
CREATE OR REPLACE FUNCTION auto_activate_default_templates_for_university(p_university_id UUID)
RETURNS void AS $$
BEGIN
  -- Insert activation records for all default templates that don't already have one
  INSERT INTO university_template_activations (university_id, template_id, is_active, activated_at)
  SELECT
    p_university_id,
    qt.id,
    true,
    now()
  FROM question_templates qt
  WHERE qt.is_default = true
    AND qt.university_id IS NULL
    AND qt.is_active = true
    AND NOT EXISTS (
      SELECT 1
      FROM university_template_activations uta
      WHERE uta.university_id = p_university_id
        AND uta.template_id = qt.id
    )
  ON CONFLICT (university_id, template_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to auto-activate defaults when a new university is created
CREATE OR REPLACE FUNCTION trigger_auto_activate_defaults_on_university_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM auto_activate_default_templates_for_university(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on universities table
DROP TRIGGER IF EXISTS auto_activate_defaults_on_university_insert ON universities;
CREATE TRIGGER auto_activate_defaults_on_university_insert
  AFTER INSERT ON universities
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_activate_defaults_on_university_insert();

-- Backfill: Activate default templates for all existing universities
DO $$
DECLARE
  university_record RECORD;
BEGIN
  FOR university_record IN SELECT id FROM universities
  LOOP
    PERFORM auto_activate_default_templates_for_university(university_record.id);
  END LOOP;
END $$;

COMMENT ON FUNCTION auto_activate_default_templates_for_university IS
  'Automatically activates all default system templates for a given university';

COMMENT ON FUNCTION trigger_auto_activate_defaults_on_university_insert IS
  'Trigger function that auto-activates default templates when a new university is created';
