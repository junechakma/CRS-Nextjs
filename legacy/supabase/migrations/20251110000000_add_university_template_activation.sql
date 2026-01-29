-- Migration: Add university-specific template activation tracking
-- This allows universities to activate/deactivate both default (system) and custom templates

-- Create a table to track which templates are active for each university
CREATE TABLE IF NOT EXISTS university_template_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES question_templates(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  activated_at TIMESTAMPTZ DEFAULT now(),
  activated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one activation record per university-template pair
  UNIQUE(university_id, template_id)
);

-- Add index for faster lookups
CREATE INDEX idx_university_template_activations_university ON university_template_activations(university_id);
CREATE INDEX idx_university_template_activations_template ON university_template_activations(template_id);
CREATE INDEX idx_university_template_activations_active ON university_template_activations(university_id, is_active);

-- Add RLS policies
ALTER TABLE university_template_activations ENABLE ROW LEVEL SECURITY;

-- University admins can view their own university's activations
CREATE POLICY "University admins can view their university template activations"
  ON university_template_activations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.university_id = university_template_activations.university_id
        AND users.role = 'university_admin'
    )
  );

-- University admins can manage their university's template activations
CREATE POLICY "University admins can manage their university template activations"
  ON university_template_activations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.university_id = university_template_activations.university_id
        AND users.role = 'university_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.university_id = university_template_activations.university_id
        AND users.role = 'university_admin'
    )
  );

-- Super admins can view all activations
CREATE POLICY "Super admins can view all template activations"
  ON university_template_activations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'super_admin'
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_university_template_activations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_university_template_activations_updated_at
  BEFORE UPDATE ON university_template_activations
  FOR EACH ROW
  EXECUTE FUNCTION update_university_template_activations_updated_at();

-- Migrate existing data: Set default templates as active for all universities by default
-- This ensures backward compatibility
INSERT INTO university_template_activations (university_id, template_id, is_active, activated_at)
SELECT
  u.id as university_id,
  qt.id as template_id,
  true as is_active,
  now() as activated_at
FROM universities u
CROSS JOIN question_templates qt
WHERE qt.is_default = true
  AND qt.university_id IS NULL
  AND qt.is_active = true
ON CONFLICT (university_id, template_id) DO NOTHING;

-- Create helper function to get active templates for a university
-- This returns both default templates (if active) and university-specific templates
CREATE OR REPLACE FUNCTION get_university_active_templates(p_university_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  is_default BOOLEAN,
  is_active BOOLEAN,
  university_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  activation_status BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    qt.id,
    qt.name,
    qt.description,
    qt.is_default,
    qt.is_active as template_is_active,
    qt.university_id,
    qt.created_by,
    qt.created_at,
    qt.updated_at,
    COALESCE(uta.is_active, qt.is_default AND qt.is_active) as activation_status
  FROM question_templates qt
  LEFT JOIN university_template_activations uta
    ON uta.template_id = qt.id
    AND uta.university_id = p_university_id
  WHERE
    -- Include default system templates
    (qt.university_id IS NULL AND qt.is_default = true)
    -- Include university-specific templates
    OR qt.university_id = p_university_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE university_template_activations IS 'Tracks which question templates are active for each university';
COMMENT ON FUNCTION get_university_active_templates IS 'Returns all templates (default and custom) with activation status for a university';
