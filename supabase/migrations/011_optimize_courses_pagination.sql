-- ============================================================================
-- Optimize Courses with Pagination & Add Description
-- ============================================================================

-- Add description column if not exists (it already exists in schema but might be null)
-- This ensures we have the column for user-friendly descriptions
COMMENT ON COLUMN courses.description IS 'Course description with 500 character limit';

-- ============================================================================
-- Course Statistics View - Optimized for Pagination
-- ============================================================================

CREATE OR REPLACE VIEW course_stats_paginated AS
SELECT
  c.id,
  c.user_id,
  c.name,
  c.code,
  c.description,
  c.color,
  c.status,
  c.expected_students,
  c.semester_id,
  c.created_at,
  c.updated_at,
  c.last_activity_at,

  -- Semester info
  sem.name AS semester_name,
  sem.status AS semester_status,

  -- Session counts (pre-calculated)
  COUNT(DISTINCT s.id) AS session_count,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'live') AS live_session_count,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'scheduled') AS scheduled_session_count,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') AS completed_session_count,

  -- Response stats
  COALESCE(SUM(s.response_count), 0)::INTEGER AS total_responses,
  COALESCE(AVG(s.avg_rating) FILTER (WHERE s.avg_rating > 0), 0)::DECIMAL(3,2) AS avg_rating,

  -- Last activity
  GREATEST(MAX(s.updated_at), c.last_activity_at) AS last_activity,

  -- Response rate (if expected_students is set)
  CASE
    WHEN c.expected_students > 0 AND COALESCE(SUM(s.response_count), 0) > 0
    THEN ROUND((COALESCE(SUM(s.response_count), 0)::DECIMAL / (c.expected_students * NULLIF(COUNT(DISTINCT s.id), 0))) * 100, 1)
    ELSE NULL
  END AS avg_response_rate

FROM courses c
LEFT JOIN semesters sem ON c.semester_id = sem.id
LEFT JOIN sessions s ON s.course_id = c.id
GROUP BY c.id, sem.name, sem.status;

-- Add comment
COMMENT ON VIEW course_stats_paginated IS 'Optimized view for course statistics with pagination support';

-- ============================================================================
-- Add Indexes for Performance
-- ============================================================================

-- Index for filtering by user and status
CREATE INDEX IF NOT EXISTS idx_courses_user_status
ON courses(user_id, status);

-- Index for filtering by semester
CREATE INDEX IF NOT EXISTS idx_courses_semester_id_status
ON courses(semester_id, status) WHERE semester_id IS NOT NULL;

-- Index for search by name and code
CREATE INDEX IF NOT EXISTS idx_courses_name_code_trgm
ON courses USING gin((name || ' ' || code) gin_trgm_ops);

-- Index for sorting by last activity
CREATE INDEX IF NOT EXISTS idx_courses_last_activity
ON courses(last_activity_at DESC NULLS LAST);

-- ============================================================================
-- Grant Permissions
-- ============================================================================

GRANT SELECT ON course_stats_paginated TO authenticated;
