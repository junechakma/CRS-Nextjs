-- ============================================================================
-- Optimize Sessions with Pagination
-- ============================================================================

-- ============================================================================
-- Session Statistics View - Optimized for Pagination
-- ============================================================================

CREATE OR REPLACE VIEW session_stats_paginated AS
SELECT
  s.id,
  s.user_id,
  s.course_id,
  s.template_id,
  s.name,
  s.description,
  s.access_code,
  s.status,
  s.scheduled_date,
  s.start_time,
  s.end_time,
  s.duration_minutes,
  s.expected_students,
  s.response_count,
  s.avg_rating,
  s.avg_completion_time_seconds,
  s.created_at,
  s.updated_at,

  -- Course info
  c.name AS course_name,
  c.code AS course_code,
  c.color AS course_color,

  -- Use session's expected_students if set, otherwise fallback to course
  COALESCE(s.expected_students, c.expected_students) AS total_expected_students,

  -- Response rate calculation
  CASE
    WHEN COALESCE(s.expected_students, c.expected_students) > 0
    THEN ROUND((s.response_count::DECIMAL / COALESCE(s.expected_students, c.expected_students)) * 100, 1)
    ELSE NULL
  END AS response_rate,

  -- Question count
  (SELECT COUNT(*) FROM session_questions sq WHERE sq.session_id = s.id) AS question_count,

  -- Time calculations
  CASE
    WHEN s.status = 'live' AND s.start_time IS NOT NULL
    THEN EXTRACT(EPOCH FROM (NOW() - s.start_time))::INTEGER / 60  -- Minutes active
    WHEN s.status = 'scheduled' AND s.start_time IS NOT NULL AND s.start_time > NOW()
    THEN EXTRACT(EPOCH FROM (s.start_time - NOW()))::INTEGER / 60  -- Minutes until start
    ELSE NULL
  END AS time_info_minutes

FROM sessions s
INNER JOIN courses c ON s.course_id = c.id;

-- Add comment
COMMENT ON VIEW session_stats_paginated IS 'Optimized view for session statistics with pagination support';

-- ============================================================================
-- Add Indexes for Performance
-- ============================================================================

-- Index for filtering by user and status
CREATE INDEX IF NOT EXISTS idx_sessions_user_status
ON sessions(user_id, status);

-- Index for filtering by course
CREATE INDEX IF NOT EXISTS idx_sessions_course_status
ON sessions(course_id, status);

-- Index for search by name
CREATE INDEX IF NOT EXISTS idx_sessions_name_trgm
ON sessions USING gin(name gin_trgm_ops);

-- Index for sorting by start_time
CREATE INDEX IF NOT EXISTS idx_sessions_start_time
ON sessions(start_time DESC NULLS LAST);

-- Index for sorting by created_at
CREATE INDEX IF NOT EXISTS idx_sessions_created_at
ON sessions(created_at DESC);

-- Composite index for common queries (user + status + start_time)
CREATE INDEX IF NOT EXISTS idx_sessions_user_status_start
ON sessions(user_id, status, start_time DESC NULLS LAST);

-- ============================================================================
-- Grant Permissions
-- ============================================================================

GRANT SELECT ON session_stats_paginated TO authenticated;
