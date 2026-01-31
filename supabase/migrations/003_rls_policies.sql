-- ============================================================================
-- CRS - Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clo_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE clos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clo_question_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTION: Check if user is super admin
-- ============================================================================

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Super admin can view all users
CREATE POLICY "Super admin can view all users"
  ON users FOR SELECT
  USING (is_super_admin());

-- Super admin can update all users
CREATE POLICY "Super admin can update all users"
  ON users FOR UPDATE
  USING (is_super_admin());

-- Super admin can delete users (except themselves)
CREATE POLICY "Super admin can delete users"
  ON users FOR DELETE
  USING (is_super_admin() AND auth.uid() != id);

-- ============================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Super admin can manage all subscriptions
CREATE POLICY "Super admin full access subscriptions"
  ON subscriptions FOR ALL
  USING (is_super_admin());

-- ============================================================================
-- SEMESTERS TABLE POLICIES
-- ============================================================================

-- Teachers can manage their own semesters
CREATE POLICY "Teachers manage own semesters"
  ON semesters FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Super admin can view all semesters
CREATE POLICY "Super admin view all semesters"
  ON semesters FOR SELECT
  USING (is_super_admin());

-- ============================================================================
-- COURSES TABLE POLICIES
-- ============================================================================

-- Teachers can manage their own courses
CREATE POLICY "Teachers manage own courses"
  ON courses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Super admin can view all courses
CREATE POLICY "Super admin view all courses"
  ON courses FOR SELECT
  USING (is_super_admin());

-- ============================================================================
-- QUESTION TEMPLATES POLICIES
-- ============================================================================

-- Anyone authenticated can read base templates
CREATE POLICY "Read base templates"
  ON question_templates FOR SELECT
  USING (is_base = TRUE AND auth.uid() IS NOT NULL);

-- Teachers can manage their own templates
CREATE POLICY "Teachers manage own templates"
  ON question_templates FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Super admin can manage base templates
CREATE POLICY "Super admin manage base templates"
  ON question_templates FOR ALL
  USING (is_super_admin() AND is_base = TRUE);

-- ============================================================================
-- TEMPLATE QUESTIONS POLICIES
-- ============================================================================

-- Read base template questions
CREATE POLICY "Read base template questions"
  ON template_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM question_templates qt
      WHERE qt.id = template_id AND qt.is_base = TRUE
    )
    AND auth.uid() IS NOT NULL
  );

-- Teachers can manage questions in their own templates
CREATE POLICY "Teachers manage own template questions"
  ON template_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM question_templates qt
      WHERE qt.id = template_id AND qt.user_id = auth.uid()
    )
  );

-- Super admin can manage base template questions
CREATE POLICY "Super admin manage base template questions"
  ON template_questions FOR ALL
  USING (
    is_super_admin() AND
    EXISTS (
      SELECT 1 FROM question_templates qt
      WHERE qt.id = template_id AND qt.is_base = TRUE
    )
  );

-- ============================================================================
-- SESSIONS TABLE POLICIES
-- ============================================================================

-- Teachers can manage their own sessions
CREATE POLICY "Teachers manage own sessions"
  ON sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public can view live session by access code (for students joining)
CREATE POLICY "Public view live sessions by code"
  ON sessions FOR SELECT
  USING (status = 'live');

-- Super admin can view all sessions
CREATE POLICY "Super admin view all sessions"
  ON sessions FOR SELECT
  USING (is_super_admin());

-- ============================================================================
-- SESSION QUESTIONS POLICIES
-- ============================================================================

-- Teachers can manage questions in their sessions
CREATE POLICY "Teachers manage session questions"
  ON session_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- Public can read questions for live sessions (for students)
CREATE POLICY "Public read live session questions"
  ON session_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_id AND s.status = 'live'
    )
  );

-- ============================================================================
-- SESSION RESPONSES POLICIES (Anonymous students)
-- ============================================================================

-- Anyone can insert responses to live sessions
CREATE POLICY "Anyone can submit to live sessions"
  ON session_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_id AND s.status = 'live'
    )
  );

-- Teachers can view responses to their sessions
CREATE POLICY "Teachers view own session responses"
  ON session_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- Super admin can view all responses
CREATE POLICY "Super admin view all responses"
  ON session_responses FOR SELECT
  USING (is_super_admin());

-- ============================================================================
-- RESPONSE ANSWERS POLICIES
-- ============================================================================

-- Anyone can insert answers (linked to their response)
CREATE POLICY "Anyone can submit answers"
  ON response_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM session_responses sr
      JOIN sessions s ON sr.session_id = s.id
      WHERE sr.id = response_id AND s.status = 'live'
    )
  );

-- Teachers can view answers to their sessions
CREATE POLICY "Teachers view session answers"
  ON response_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM session_responses sr
      JOIN sessions s ON sr.session_id = s.id
      WHERE sr.id = response_id AND s.user_id = auth.uid()
    )
  );

-- Super admin can view all answers
CREATE POLICY "Super admin view all answers"
  ON response_answers FOR SELECT
  USING (is_super_admin());

-- ============================================================================
-- CLO SETS POLICIES
-- ============================================================================

-- Teachers can manage their own CLO sets
CREATE POLICY "Teachers manage own clo sets"
  ON clo_sets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Super admin can view all CLO sets
CREATE POLICY "Super admin view all clo sets"
  ON clo_sets FOR SELECT
  USING (is_super_admin());

-- ============================================================================
-- CLOS POLICIES
-- ============================================================================

-- Teachers can manage CLOs in their sets
CREATE POLICY "Teachers manage own clos"
  ON clos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clo_sets cs
      WHERE cs.id = clo_set_id AND cs.user_id = auth.uid()
    )
  );

-- ============================================================================
-- CLO QUESTION MAPPINGS POLICIES
-- ============================================================================

-- Teachers can manage mappings for their CLOs
CREATE POLICY "Teachers manage own clo mappings"
  ON clo_question_mappings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clos c
      JOIN clo_sets cs ON c.clo_set_id = cs.id
      WHERE c.id = clo_id AND cs.user_id = auth.uid()
    )
  );

-- ============================================================================
-- ANALYTICS REPORTS POLICIES
-- ============================================================================

-- Teachers can manage their own reports
CREATE POLICY "Teachers manage own reports"
  ON analytics_reports FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Super admin can view all reports
CREATE POLICY "Super admin view all reports"
  ON analytics_reports FOR SELECT
  USING (is_super_admin());

-- ============================================================================
-- ACTIVITY LOG POLICIES
-- ============================================================================

-- Users can view their own activity
CREATE POLICY "Users view own activity"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

-- Super admin can view and manage all activity
CREATE POLICY "Super admin manage all activity"
  ON activity_log FOR ALL
  USING (is_super_admin());

-- ============================================================================
-- SYSTEM SETTINGS POLICIES
-- ============================================================================

-- Super admin only
CREATE POLICY "Super admin manage system settings"
  ON system_settings FOR ALL
  USING (is_super_admin());

-- Authenticated users can read settings
CREATE POLICY "Authenticated users read settings"
  ON system_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);
