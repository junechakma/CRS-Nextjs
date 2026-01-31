-- ============================================================================
-- CRS - Functions and Triggers
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Generate unique access code for sessions
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    -- Generate code like "AB12-CD34"
    FOR i IN 1..4 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    result := result || '-';
    FOR i IN 1..4 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM sessions WHERE access_code = result) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate access code before insert
CREATE OR REPLACE FUNCTION auto_generate_access_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.access_code IS NULL OR NEW.access_code = '' THEN
    NEW.access_code := generate_access_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_auto_access_code
  BEFORE INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_access_code();

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER semesters_updated_at BEFORE UPDATE ON semesters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER question_templates_updated_at BEFORE UPDATE ON question_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER clo_sets_updated_at BEFORE UPDATE ON clo_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SESSION STATS TRIGGERS
-- ============================================================================

-- Update session response count when new response is added
CREATE OR REPLACE FUNCTION update_session_response_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating DECIMAL(3,2);
  v_avg_completion INTEGER;
BEGIN
  -- Update response count
  UPDATE sessions
  SET response_count = (
    SELECT COUNT(*) FROM session_responses WHERE session_id = NEW.session_id
  ),
  updated_at = NOW()
  WHERE id = NEW.session_id;

  -- Calculate average completion time
  SELECT AVG(completion_time_seconds)::INTEGER INTO v_avg_completion
  FROM session_responses
  WHERE session_id = NEW.session_id AND completion_time_seconds IS NOT NULL;

  UPDATE sessions
  SET avg_completion_time_seconds = v_avg_completion
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER session_response_count_trigger
  AFTER INSERT ON session_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_session_response_stats();

-- Update session and question stats when answer is added
CREATE OR REPLACE FUNCTION update_answer_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_session_id UUID;
  v_question_type TEXT;
  v_avg_rating DECIMAL(3,2);
BEGIN
  -- Get session_id and question type
  SELECT sq.session_id, sq.type INTO v_session_id, v_question_type
  FROM session_questions sq
  WHERE sq.id = NEW.question_id;

  -- Update question response count
  UPDATE session_questions
  SET response_count = (
    SELECT COUNT(*) FROM response_answers WHERE question_id = NEW.question_id
  )
  WHERE id = NEW.question_id;

  -- If it's a rating question, update averages
  IF v_question_type = 'rating' AND NEW.answer_rating IS NOT NULL THEN
    -- Update question avg rating
    UPDATE session_questions
    SET avg_rating = (
      SELECT AVG(answer_rating)::DECIMAL(3,2)
      FROM response_answers
      WHERE question_id = NEW.question_id AND answer_rating IS NOT NULL
    )
    WHERE id = NEW.question_id;

    -- Update session avg rating
    UPDATE sessions
    SET avg_rating = (
      SELECT AVG(sq.avg_rating)::DECIMAL(3,2)
      FROM session_questions sq
      WHERE sq.session_id = v_session_id AND sq.avg_rating IS NOT NULL
    )
    WHERE id = v_session_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER answer_stats_trigger
  AFTER INSERT ON response_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_answer_stats();

-- ============================================================================
-- COURSE STATS TRIGGERS
-- ============================================================================

-- Update course stats when session changes
CREATE OR REPLACE FUNCTION update_course_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_course_id UUID;
BEGIN
  v_course_id := COALESCE(NEW.course_id, OLD.course_id);

  UPDATE courses
  SET
    total_sessions = (
      SELECT COUNT(*) FROM sessions WHERE course_id = v_course_id
    ),
    total_responses = (
      SELECT COALESCE(SUM(response_count), 0)
      FROM sessions WHERE course_id = v_course_id
    ),
    avg_rating = (
      SELECT AVG(avg_rating)::DECIMAL(3,2)
      FROM sessions
      WHERE course_id = v_course_id AND avg_rating > 0
    ),
    last_activity_at = NOW()
  WHERE id = v_course_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_stats_on_session_insert
  AFTER INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_course_stats();

CREATE TRIGGER course_stats_on_session_update
  AFTER UPDATE OF response_count, avg_rating, status ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_course_stats();

CREATE TRIGGER course_stats_on_session_delete
  AFTER DELETE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_course_stats();

-- ============================================================================
-- CLO STATS TRIGGERS
-- ============================================================================

-- Update CLO set stats
CREATE OR REPLACE FUNCTION update_clo_set_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_clo_set_id UUID;
BEGIN
  v_clo_set_id := COALESCE(NEW.clo_set_id, OLD.clo_set_id);

  UPDATE clo_sets
  SET
    clo_count = (SELECT COUNT(*) FROM clos WHERE clo_set_id = v_clo_set_id),
    mapped_questions = (
      SELECT COUNT(DISTINCT cqm.question_id)
      FROM clo_question_mappings cqm
      JOIN clos c ON cqm.clo_id = c.id
      WHERE c.clo_set_id = v_clo_set_id
    ),
    updated_at = NOW()
  WHERE id = v_clo_set_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clo_set_stats_on_clo_change
  AFTER INSERT OR DELETE ON clos
  FOR EACH ROW
  EXECUTE FUNCTION update_clo_set_stats();

-- Update individual CLO stats
CREATE OR REPLACE FUNCTION update_clo_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_clo_id UUID;
BEGIN
  v_clo_id := COALESCE(NEW.clo_id, OLD.clo_id);

  UPDATE clos
  SET
    mapped_questions = (
      SELECT COUNT(*) FROM clo_question_mappings WHERE clo_id = v_clo_id
    ),
    avg_relevance = (
      SELECT AVG(relevance_score)::DECIMAL(3,2)
      FROM clo_question_mappings
      WHERE clo_id = v_clo_id
    )
  WHERE id = v_clo_id;

  -- Also update parent CLO set
  PERFORM update_clo_set_stats();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clo_stats_on_mapping_change
  AFTER INSERT OR UPDATE OR DELETE ON clo_question_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_clo_stats();

-- ============================================================================
-- SUBSCRIPTION USAGE TRACKING
-- ============================================================================

-- Update subscription usage when course is created
CREATE OR REPLACE FUNCTION update_subscription_course_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE subscriptions
    SET courses_used = courses_used + 1, updated_at = NOW()
    WHERE user_id = NEW.user_id AND is_active = TRUE;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE subscriptions
    SET courses_used = GREATEST(0, courses_used - 1), updated_at = NOW()
    WHERE user_id = OLD.user_id AND is_active = TRUE;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_course_usage
  AFTER INSERT OR DELETE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_course_usage();

-- Update subscription usage when session is created
CREATE OR REPLACE FUNCTION update_subscription_session_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE subscriptions
    SET sessions_used = sessions_used + 1, updated_at = NOW()
    WHERE user_id = NEW.user_id AND is_active = TRUE;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE subscriptions
    SET sessions_used = GREATEST(0, sessions_used - 1), updated_at = NOW()
    WHERE user_id = OLD.user_id AND is_active = TRUE;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_session_usage
  AFTER INSERT OR DELETE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_session_usage();

-- Update subscription usage when CLO set is created
CREATE OR REPLACE FUNCTION update_subscription_clo_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE subscriptions
    SET clo_sets_used = clo_sets_used + 1, updated_at = NOW()
    WHERE user_id = NEW.user_id AND is_active = TRUE;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE subscriptions
    SET clo_sets_used = GREATEST(0, clo_sets_used - 1), updated_at = NOW()
    WHERE user_id = OLD.user_id AND is_active = TRUE;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_clo_usage
  AFTER INSERT OR DELETE ON clo_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_clo_usage();

-- ============================================================================
-- SUBSCRIPTION LIMIT CHECKING FUNCTIONS
-- ============================================================================

-- Check if user can create more courses
CREATE OR REPLACE FUNCTION can_create_course(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_used INTEGER;
BEGIN
  SELECT courses_limit, courses_used INTO v_limit, v_used
  FROM subscriptions
  WHERE user_id = p_user_id AND is_active = TRUE;

  -- If no subscription, use free tier
  IF v_limit IS NULL THEN
    v_limit := 5;
    SELECT COUNT(*) INTO v_used FROM courses WHERE user_id = p_user_id;
  END IF;

  RETURN v_used < v_limit;
END;
$$ LANGUAGE plpgsql;

-- Check if user can create more sessions
CREATE OR REPLACE FUNCTION can_create_session(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_used INTEGER;
BEGIN
  SELECT sessions_limit, sessions_used INTO v_limit, v_used
  FROM subscriptions
  WHERE user_id = p_user_id AND is_active = TRUE;

  IF v_limit IS NULL THEN
    v_limit := 10;
    SELECT COUNT(*) INTO v_used FROM sessions WHERE user_id = p_user_id;
  END IF;

  RETURN v_used < v_limit;
END;
$$ LANGUAGE plpgsql;

-- Check if user can use AI analytics
CREATE OR REPLACE FUNCTION can_use_ai_analytics(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_used INTEGER;
BEGIN
  SELECT ai_analytics_limit, ai_analytics_used INTO v_limit, v_used
  FROM subscriptions
  WHERE user_id = p_user_id AND is_active = TRUE;

  IF v_limit IS NULL THEN
    v_limit := 10;
    v_used := 0;
  END IF;

  RETURN v_used < v_limit;
END;
$$ LANGUAGE plpgsql;

-- Increment AI analytics usage
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE subscriptions
  SET ai_analytics_used = ai_analytics_used + 1, updated_at = NOW()
  WHERE user_id = p_user_id AND is_active = TRUE;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ACTIVITY LOGGING FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USER PROFILE CREATION ON SIGNUP
-- ============================================================================

-- Auto-create user profile when auth.users is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher')
  );

  -- Create default subscription
  INSERT INTO subscriptions (user_id, plan)
  VALUES (NEW.id, 'free');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- SESSION STATUS AUTO-UPDATE
-- ============================================================================

-- Function to auto-complete expired sessions (called by cron)
CREATE OR REPLACE FUNCTION auto_complete_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE sessions
  SET status = 'completed', updated_at = NOW()
  WHERE status = 'live'
    AND end_time IS NOT NULL
    AND end_time < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-start scheduled sessions
CREATE OR REPLACE FUNCTION auto_start_scheduled_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE sessions
  SET status = 'live', start_time = NOW(), updated_at = NOW()
  WHERE status = 'scheduled'
    AND scheduled_date = CURRENT_DATE
    AND (start_time IS NULL OR start_time <= NOW());

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
