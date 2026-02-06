-- ============================================================================
-- Add description column to semesters table
-- ============================================================================

ALTER TABLE semesters
ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN semesters.description IS 'Optional description or notes for the semester';
