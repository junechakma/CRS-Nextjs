-- ============================================================================
-- Semester Statistics View - Optimized for Performance
-- This view pre-calculates all semester stats to avoid N+1 queries
-- ============================================================================

-- Enable required extensions first
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- CREATE VIEW
-- ============================================================================

CREATE OR REPLACE VIEW semester_stats AS
SELECT
  s.id,
  s.user_id,
  s.name,
  s.start_date,
  s.end_date,
  s.description,
  s.status,
  s.created_at,
  s.updated_at,

  -- Course count
  COUNT(DISTINCT c.id) AS courses_count,

  -- Student count (sum of expected_students from all courses)
  COALESCE(SUM(c.expected_students), 0) AS students_count,

  -- Session count (count all sessions from courses in this semester)
  COUNT(DISTINCT sess.id) AS sessions_count,

  -- Progress calculation (percentage based on dates)
  CASE
    WHEN CURRENT_DATE > s.end_date THEN 100
    WHEN CURRENT_DATE < s.start_date THEN 0
    ELSE ROUND(
      ((CURRENT_DATE - s.start_date)::NUMERIC /
       NULLIF((s.end_date - s.start_date)::NUMERIC, 0)) * 100
    )::INTEGER
  END AS progress

FROM semesters s
LEFT JOIN courses c ON c.semester_id = s.id
LEFT JOIN sessions sess ON sess.course_id = c.id
GROUP BY s.id, s.user_id, s.name, s.start_date, s.end_date, s.description, s.status, s.created_at, s.updated_at;

-- Add comment
COMMENT ON VIEW semester_stats IS 'Optimized view for semester statistics with pre-calculated counts';

-- ============================================================================
-- Add Indexes for Performance
-- ============================================================================

-- Index for filtering by user and status
CREATE INDEX IF NOT EXISTS idx_semesters_user_status
ON semesters(user_id, status);

-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_semesters_start_date
ON semesters(start_date DESC);

-- Index for search by name (for ILIKE queries using trigram)
CREATE INDEX IF NOT EXISTS idx_semesters_name_trgm
ON semesters USING gin(name gin_trgm_ops);

-- Index for courses.semester_id (foreign key)
CREATE INDEX IF NOT EXISTS idx_courses_semester_id
ON courses(semester_id) WHERE semester_id IS NOT NULL;

-- Index for sessions.course_id
CREATE INDEX IF NOT EXISTS idx_sessions_course_id
ON sessions(course_id);

-- ============================================================================
-- Grant Permissions
-- ============================================================================

-- Grant SELECT on view to authenticated users
GRANT SELECT ON semester_stats TO authenticated;
