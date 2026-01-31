-- ============================================================================
-- CRS - Views for Dashboard Stats
-- Pre-computed views for fast dashboard loading
-- ============================================================================

-- ============================================================================
-- TEACHER DASHBOARD STATS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW teacher_dashboard_stats AS
SELECT
  u.id AS user_id,
  -- Course stats
  COUNT(DISTINCT c.id) AS total_courses,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active') AS active_courses,
  -- Session stats
  COUNT(DISTINCT s.id) AS total_sessions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'live') AS live_sessions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'scheduled') AS scheduled_sessions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') AS completed_sessions,
  -- Response stats (actual counts - no rate calculation without expected_students)
  COALESCE(SUM(s.response_count), 0)::INTEGER AS total_responses,
  -- Average stats
  COALESCE(AVG(s.avg_rating) FILTER (WHERE s.avg_rating > 0), 0)::DECIMAL(3,2) AS avg_rating,
  -- Average completion time across all sessions
  COALESCE(AVG(s.avg_completion_time_seconds) FILTER (WHERE s.avg_completion_time_seconds > 0), 0)::INTEGER AS avg_completion_time_seconds
FROM users u
LEFT JOIN courses c ON c.user_id = u.id
LEFT JOIN sessions s ON s.course_id = c.id
WHERE u.role = 'teacher'
GROUP BY u.id;

-- ============================================================================
-- SUPER ADMIN DASHBOARD STATS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW super_admin_dashboard_stats AS
SELECT
  -- User stats
  COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'teacher') AS total_teachers,
  COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'teacher' AND u.status = 'active') AS active_teachers,
  COUNT(DISTINCT u.id) FILTER (WHERE u.plan = 'premium') AS premium_users,
  COUNT(DISTINCT u.id) FILTER (WHERE u.plan = 'custom') AS custom_users,
  -- This week signups
  COUNT(DISTINCT u.id) FILTER (
    WHERE u.role = 'teacher' AND u.created_at >= NOW() - INTERVAL '7 days'
  ) AS new_teachers_week,
  -- Session stats
  COUNT(DISTINCT s.id) AS total_sessions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'live') AS active_sessions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') AS completed_sessions,
  -- Response stats
  COALESCE(SUM(s.response_count), 0)::INTEGER AS total_responses,
  COALESCE(AVG(s.avg_rating) FILTER (WHERE s.avg_rating > 0), 0)::DECIMAL(3,2) AS platform_avg_rating,
  -- Course stats
  COUNT(DISTINCT c.id) AS total_courses,
  -- Revenue estimate (premium users * $15)
  (COUNT(DISTINCT u.id) FILTER (WHERE u.plan = 'premium') * 15)::DECIMAL(10,2) AS estimated_mrr
FROM users u
LEFT JOIN courses c ON c.user_id = u.id
LEFT JOIN sessions s ON s.user_id = u.id;

-- ============================================================================
-- PLAN DISTRIBUTION VIEW (for super admin)
-- ============================================================================

CREATE OR REPLACE VIEW plan_distribution AS
SELECT
  plan,
  COUNT(*) AS count,
  ROUND(COUNT(*)::DECIMAL / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100, 1) AS percentage
FROM users
WHERE role = 'teacher'
GROUP BY plan
ORDER BY
  CASE plan
    WHEN 'free' THEN 1
    WHEN 'premium' THEN 2
    WHEN 'custom' THEN 3
  END;

-- ============================================================================
-- COURSE STATS VIEW (with session aggregation)
-- ============================================================================

CREATE OR REPLACE VIEW course_stats AS
SELECT
  c.id,
  c.user_id,
  c.name,
  c.code,
  c.color,
  c.status,
  c.expected_students, -- Optional, teacher-set
  c.created_at,
  -- Session counts
  COUNT(DISTINCT s.id) AS session_count,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'live') AS live_session_count,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'scheduled') AS scheduled_session_count,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') AS completed_session_count,
  -- Response stats
  COALESCE(SUM(s.response_count), 0)::INTEGER AS total_responses,
  COALESCE(AVG(s.avg_rating) FILTER (WHERE s.avg_rating > 0), 0)::DECIMAL(3,2) AS avg_rating,
  -- Last activity
  GREATEST(MAX(s.updated_at), c.last_activity_at) AS last_activity,
  -- Semester info
  sem.name AS semester_name
FROM courses c
LEFT JOIN sessions s ON s.course_id = c.id
LEFT JOIN semesters sem ON c.semester_id = sem.id
GROUP BY c.id, sem.name;

-- ============================================================================
-- SESSION DETAIL VIEW (with response stats)
-- ============================================================================

CREATE OR REPLACE VIEW session_details AS
SELECT
  s.id,
  s.user_id,
  s.course_id,
  s.name,
  s.description,
  s.access_code,
  s.status,
  s.scheduled_date,
  s.start_time,
  s.end_time,
  s.duration_minutes,
  -- Expected students: use session value, fallback to course value
  COALESCE(s.expected_students, c.expected_students) AS expected_students,
  s.response_count,
  s.avg_rating,
  s.avg_completion_time_seconds,
  s.created_at,
  -- Course info
  c.name AS course_name,
  c.code AS course_code,
  c.color AS course_color,
  -- Response rate calculation (only if expected_students is set)
  CASE
    WHEN COALESCE(s.expected_students, c.expected_students) > 0
    THEN ROUND((s.response_count::DECIMAL / COALESCE(s.expected_students, c.expected_students)) * 100, 1)
    ELSE NULL -- NULL means response rate cannot be calculated
  END AS response_rate,
  -- Question count
  (SELECT COUNT(*) FROM session_questions sq WHERE sq.session_id = s.id) AS question_count
FROM sessions s
JOIN courses c ON s.course_id = c.id;

-- ============================================================================
-- CLO SET STATS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW clo_set_stats AS
SELECT
  cs.id,
  cs.user_id,
  cs.course_id,
  cs.name,
  cs.description,
  cs.color,
  cs.status,
  cs.created_at,
  -- Course info
  c.name AS course_name,
  c.code AS course_code,
  -- CLO counts
  cs.clo_count,
  cs.mapped_questions,
  -- Detailed CLO stats
  COALESCE(AVG(clo.avg_relevance), 0)::DECIMAL(3,2) AS avg_relevance,
  COUNT(DISTINCT cqm.question_id)::INTEGER AS unique_questions_mapped
FROM clo_sets cs
JOIN courses c ON cs.course_id = c.id
LEFT JOIN clos clo ON clo.clo_set_id = cs.id
LEFT JOIN clo_question_mappings cqm ON cqm.clo_id = clo.id
GROUP BY cs.id, c.name, c.code;

-- ============================================================================
-- RECENT ACTIVITY VIEW (for dashboards)
-- ============================================================================

CREATE OR REPLACE VIEW recent_activity AS
SELECT
  al.id,
  al.user_id,
  al.action,
  al.entity_type,
  al.entity_id,
  al.metadata,
  al.created_at,
  u.name AS user_name,
  u.email AS user_email,
  u.plan AS user_plan
FROM activity_log al
JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC;

-- ============================================================================
-- MONTHLY RESPONSE TRENDS VIEW (for analytics)
-- ============================================================================

CREATE OR REPLACE VIEW monthly_response_trends AS
SELECT
  DATE_TRUNC('month', sr.submitted_at) AS month,
  COUNT(*) AS response_count,
  COUNT(DISTINCT sr.session_id) AS session_count,
  COUNT(DISTINCT s.user_id) AS active_teachers
FROM session_responses sr
JOIN sessions s ON sr.session_id = s.id
WHERE sr.submitted_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', sr.submitted_at)
ORDER BY month DESC;

-- ============================================================================
-- TEACHER MONTHLY TRENDS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW teacher_monthly_trends AS
SELECT
  s.user_id,
  DATE_TRUNC('month', sr.submitted_at) AS month,
  COUNT(*) AS response_count,
  COUNT(DISTINCT s.id) AS session_count,
  AVG(
    CASE WHEN ra.answer_rating IS NOT NULL THEN ra.answer_rating ELSE NULL END
  )::DECIMAL(3,2) AS avg_rating
FROM session_responses sr
JOIN sessions s ON sr.session_id = s.id
LEFT JOIN response_answers ra ON ra.response_id = sr.id
WHERE sr.submitted_at >= NOW() - INTERVAL '12 months'
GROUP BY s.user_id, DATE_TRUNC('month', sr.submitted_at)
ORDER BY month DESC;

-- ============================================================================
-- TOP PERFORMING TEACHERS VIEW (for super admin)
-- ============================================================================

CREATE OR REPLACE VIEW top_performing_teachers AS
SELECT
  u.id,
  u.name,
  u.email,
  u.institution,
  u.plan,
  COUNT(DISTINCT s.id) AS total_sessions,
  COALESCE(SUM(s.response_count), 0)::INTEGER AS total_responses,
  COALESCE(AVG(s.avg_rating), 0)::DECIMAL(3,2) AS avg_rating,
  CASE
    WHEN COALESCE(SUM(s.total_students), 0) > 0
    THEN ROUND((COALESCE(SUM(s.response_count), 0)::DECIMAL / SUM(s.total_students)) * 100, 1)
    ELSE 0
  END AS avg_response_rate
FROM users u
LEFT JOIN sessions s ON s.user_id = u.id AND s.status = 'completed'
WHERE u.role = 'teacher'
GROUP BY u.id
ORDER BY total_responses DESC;

-- ============================================================================
-- SUBSCRIPTION USAGE VIEW
-- ============================================================================

CREATE OR REPLACE VIEW subscription_usage AS
SELECT
  s.id,
  s.user_id,
  s.plan,
  s.billing_cycle,
  s.is_active,
  s.expires_at,
  -- Limits
  s.courses_limit,
  s.sessions_limit,
  s.ai_analytics_limit,
  s.clo_sets_limit,
  -- Usage
  s.courses_used,
  s.sessions_used,
  s.ai_analytics_used,
  s.clo_sets_used,
  -- Usage percentages
  CASE WHEN s.courses_limit > 0
    THEN ROUND((s.courses_used::DECIMAL / s.courses_limit) * 100, 1)
    ELSE 0
  END AS courses_usage_percent,
  CASE WHEN s.sessions_limit > 0
    THEN ROUND((s.sessions_used::DECIMAL / s.sessions_limit) * 100, 1)
    ELSE 0
  END AS sessions_usage_percent,
  CASE WHEN s.ai_analytics_limit > 0
    THEN ROUND((s.ai_analytics_used::DECIMAL / s.ai_analytics_limit) * 100, 1)
    ELSE 0
  END AS ai_usage_percent,
  CASE WHEN s.clo_sets_limit > 0
    THEN ROUND((s.clo_sets_used::DECIMAL / s.clo_sets_limit) * 100, 1)
    ELSE 0
  END AS clo_sets_usage_percent,
  -- User info
  u.name AS user_name,
  u.email AS user_email
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.is_active = TRUE;

-- ============================================================================
-- QUESTION RESPONSE DISTRIBUTION VIEW (for session analytics)
-- ============================================================================

CREATE OR REPLACE VIEW question_response_distribution AS
SELECT
  sq.id AS question_id,
  sq.session_id,
  sq.text AS question_text,
  sq.type AS question_type,
  sq.scale,
  sq.options,
  sq.response_count,
  sq.avg_rating,
  -- For rating questions: distribution
  CASE WHEN sq.type = 'rating' THEN
    (SELECT jsonb_object_agg(rating_value, rating_count)
     FROM (
       SELECT
         answer_rating AS rating_value,
         COUNT(*) AS rating_count
       FROM response_answers
       WHERE question_id = sq.id AND answer_rating IS NOT NULL
       GROUP BY answer_rating
       ORDER BY answer_rating
     ) dist)
  ELSE NULL END AS rating_distribution,
  -- For boolean questions: yes/no counts
  CASE WHEN sq.type = 'boolean' THEN
    jsonb_build_object(
      'yes', (SELECT COUNT(*) FROM response_answers WHERE question_id = sq.id AND answer_boolean = TRUE),
      'no', (SELECT COUNT(*) FROM response_answers WHERE question_id = sq.id AND answer_boolean = FALSE)
    )
  ELSE NULL END AS boolean_distribution,
  -- For multiple choice: option counts
  CASE WHEN sq.type = 'multiple' THEN
    (SELECT jsonb_object_agg(answer_choice, choice_count)
     FROM (
       SELECT
         answer_choice,
         COUNT(*) AS choice_count
       FROM response_answers
       WHERE question_id = sq.id AND answer_choice IS NOT NULL
       GROUP BY answer_choice
     ) dist)
  ELSE NULL END AS choice_distribution
FROM session_questions sq;

-- ============================================================================
-- GRANT SELECT ON VIEWS TO AUTHENTICATED USERS
-- ============================================================================

-- These views inherit RLS from underlying tables through the functions
-- but we need to grant access to the views themselves

GRANT SELECT ON teacher_dashboard_stats TO authenticated;
GRANT SELECT ON course_stats TO authenticated;
GRANT SELECT ON session_details TO authenticated;
GRANT SELECT ON clo_set_stats TO authenticated;
GRANT SELECT ON subscription_usage TO authenticated;
GRANT SELECT ON teacher_monthly_trends TO authenticated;
GRANT SELECT ON question_response_distribution TO authenticated;

-- Super admin only views
GRANT SELECT ON super_admin_dashboard_stats TO authenticated;
GRANT SELECT ON plan_distribution TO authenticated;
GRANT SELECT ON recent_activity TO authenticated;
GRANT SELECT ON monthly_response_trends TO authenticated;
GRANT SELECT ON top_performing_teachers TO authenticated;
