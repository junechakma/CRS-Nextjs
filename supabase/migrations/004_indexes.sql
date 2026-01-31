-- ============================================================================
-- CRS - Performance Indexes
-- Optimized for pagination, filtering, and stats queries
-- ============================================================================

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

-- For super admin dashboard - filtering by role, status, plan
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_plan ON users(plan);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_last_active ON users(last_active_at DESC);

-- Composite index for filtered lists with pagination
CREATE INDEX idx_users_role_status_created ON users(role, status, created_at DESC);

-- ============================================================================
-- SUBSCRIPTIONS TABLE INDEXES
-- ============================================================================

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);

-- For finding active subscriptions quickly
CREATE INDEX idx_subscriptions_user_active ON subscriptions(user_id, is_active) WHERE is_active = TRUE;

-- ============================================================================
-- SEMESTERS TABLE INDEXES
-- ============================================================================

CREATE INDEX idx_semesters_user_id ON semesters(user_id);
CREATE INDEX idx_semesters_status ON semesters(status);
CREATE INDEX idx_semesters_dates ON semesters(start_date, end_date);

-- Composite for teacher's semester list
CREATE INDEX idx_semesters_user_status ON semesters(user_id, status, start_date DESC);

-- ============================================================================
-- COURSES TABLE INDEXES
-- ============================================================================

CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_courses_semester_id ON courses(semester_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX idx_courses_last_activity ON courses(last_activity_at DESC NULLS LAST);

-- Composite for teacher's course list with filtering
CREATE INDEX idx_courses_user_status ON courses(user_id, status, created_at DESC);
CREATE INDEX idx_courses_user_semester ON courses(user_id, semester_id, status);

-- For course search
CREATE INDEX idx_courses_name_code ON courses USING gin(to_tsvector('english', name || ' ' || code));

-- ============================================================================
-- QUESTION TEMPLATES TABLE INDEXES
-- ============================================================================

CREATE INDEX idx_question_templates_user_id ON question_templates(user_id);
CREATE INDEX idx_question_templates_is_base ON question_templates(is_base);
CREATE INDEX idx_question_templates_status ON question_templates(status);

-- For template selection dropdown
CREATE INDEX idx_templates_user_active ON question_templates(user_id, status) WHERE status = 'active';
CREATE INDEX idx_templates_base_active ON question_templates(is_base) WHERE is_base = TRUE AND status = 'active';

-- ============================================================================
-- TEMPLATE QUESTIONS TABLE INDEXES
-- ============================================================================

CREATE INDEX idx_template_questions_template_id ON template_questions(template_id);
CREATE INDEX idx_template_questions_order ON template_questions(template_id, order_index);

-- ============================================================================
-- SESSIONS TABLE INDEXES
-- ============================================================================

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_course_id ON sessions(course_id);
CREATE INDEX idx_sessions_template_id ON sessions(template_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_access_code ON sessions(access_code);
CREATE INDEX idx_sessions_scheduled_date ON sessions(scheduled_date);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_sessions_start_time ON sessions(start_time DESC NULLS LAST);

-- For student access - fast lookup by code
CREATE UNIQUE INDEX idx_sessions_access_code_unique ON sessions(access_code);

-- Composite for teacher's session list
CREATE INDEX idx_sessions_user_status ON sessions(user_id, status, created_at DESC);
CREATE INDEX idx_sessions_course_status ON sessions(course_id, status, created_at DESC);

-- For live sessions dashboard
CREATE INDEX idx_sessions_live ON sessions(user_id, status) WHERE status = 'live';

-- For scheduled sessions
CREATE INDEX idx_sessions_scheduled ON sessions(scheduled_date, status) WHERE status = 'scheduled';

-- For auto-complete expired sessions (cron job)
CREATE INDEX idx_sessions_live_end_time ON sessions(end_time) WHERE status = 'live' AND end_time IS NOT NULL;

-- ============================================================================
-- SESSION QUESTIONS TABLE INDEXES
-- ============================================================================

CREATE INDEX idx_session_questions_session_id ON session_questions(session_id);
CREATE INDEX idx_session_questions_order ON session_questions(session_id, order_index);
CREATE INDEX idx_session_questions_original ON session_questions(original_question_id);

-- ============================================================================
-- SESSION RESPONSES TABLE INDEXES
-- ============================================================================

CREATE INDEX idx_session_responses_session_id ON session_responses(session_id);
CREATE INDEX idx_session_responses_submitted_at ON session_responses(submitted_at DESC);
CREATE INDEX idx_session_responses_anonymous_id ON session_responses(anonymous_id);

-- Composite for response listing
CREATE INDEX idx_responses_session_time ON session_responses(session_id, submitted_at DESC);

-- ============================================================================
-- RESPONSE ANSWERS TABLE INDEXES
-- ============================================================================

CREATE INDEX idx_response_answers_response_id ON response_answers(response_id);
CREATE INDEX idx_response_answers_question_id ON response_answers(question_id);

-- Composite for fast answer lookup
CREATE INDEX idx_answers_response_question ON response_answers(response_id, question_id);

-- For analytics - rating aggregation
CREATE INDEX idx_answers_rating ON response_answers(question_id, answer_rating) WHERE answer_rating IS NOT NULL;

-- ============================================================================
-- CLO SETS TABLE INDEXES
-- ============================================================================

CREATE INDEX idx_clo_sets_user_id ON clo_sets(user_id);
CREATE INDEX idx_clo_sets_course_id ON clo_sets(course_id);
CREATE INDEX idx_clo_sets_status ON clo_sets(status);
CREATE INDEX idx_clo_sets_created_at ON clo_sets(created_at DESC);

-- Composite for teacher's CLO list
CREATE INDEX idx_clo_sets_user_status ON clo_sets(user_id, status, created_at DESC);
CREATE INDEX idx_clo_sets_course ON clo_sets(course_id, status);

-- ============================================================================
-- CLOS TABLE INDEXES
-- ============================================================================

CREATE INDEX idx_clos_clo_set_id ON clos(clo_set_id);
CREATE INDEX idx_clos_bloom_level ON clos(bloom_level);
CREATE INDEX idx_clos_order ON clos(clo_set_id, order_index);

-- ============================================================================
-- CLO QUESTION MAPPINGS TABLE INDEXES
-- ============================================================================

CREATE INDEX idx_clo_mappings_clo_id ON clo_question_mappings(clo_id);
CREATE INDEX idx_clo_mappings_question_id ON clo_question_mappings(question_id);
CREATE INDEX idx_clo_mappings_quality ON clo_question_mappings(quality);
CREATE INDEX idx_clo_mappings_relevance ON clo_question_mappings(relevance_score DESC);

-- ============================================================================
-- ANALYTICS REPORTS TABLE INDEXES
-- ============================================================================

CREATE INDEX idx_analytics_user_id ON analytics_reports(user_id);
CREATE INDEX idx_analytics_session_id ON analytics_reports(session_id);
CREATE INDEX idx_analytics_course_id ON analytics_reports(course_id);
CREATE INDEX idx_analytics_clo_set_id ON analytics_reports(clo_set_id);
CREATE INDEX idx_analytics_type ON analytics_reports(report_type);
CREATE INDEX idx_analytics_generated_at ON analytics_reports(generated_at DESC);

-- Composite for report listing
CREATE INDEX idx_analytics_user_type ON analytics_reports(user_id, report_type, generated_at DESC);

-- ============================================================================
-- ACTIVITY LOG TABLE INDEXES
-- ============================================================================

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity_type ON activity_log(entity_type);
CREATE INDEX idx_activity_log_entity_id ON activity_log(entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_action ON activity_log(action);

-- Composite for activity feed with pagination
CREATE INDEX idx_activity_log_created_desc ON activity_log(created_at DESC, id);

-- For user activity history
CREATE INDEX idx_activity_user_time ON activity_log(user_id, created_at DESC);

-- For entity-specific activity
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id, created_at DESC);
