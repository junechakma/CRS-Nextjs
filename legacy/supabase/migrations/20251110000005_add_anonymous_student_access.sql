-- Migration: Add RLS policies for anonymous student access to sessions
-- Students should be able to access active sessions using only the anonymous_key
-- without needing to be authenticated

-- Allow anonymous users to view active sessions by anonymous_key
CREATE POLICY "anonymous_access_active_sessions"
  ON response_sessions
  FOR SELECT
  TO anon
  USING (
    status = 'active'
  );

-- Allow anonymous users to read courses info (needed for session details)
CREATE POLICY "anonymous_read_courses_for_sessions"
  ON courses
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to read teacher names (needed for session details)
CREATE POLICY "anonymous_read_teacher_names"
  ON users
  FOR SELECT
  TO anon
  USING (
    role = 'teacher'
  );

-- Allow anonymous users to submit responses
CREATE POLICY "anonymous_insert_responses"
  ON responses
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Can only insert if session is active
    EXISTS (
      SELECT 1
      FROM response_sessions rs
      WHERE rs.id = responses.session_id
        AND rs.status = 'active'
    )
  );

-- Allow anonymous users to check if they already responded
CREATE POLICY "anonymous_check_own_responses"
  ON responses
  FOR SELECT
  TO anon
  USING (true);

COMMENT ON POLICY "anonymous_access_active_sessions" ON response_sessions IS
  'Allow anonymous students to view active sessions using the anonymous_key';

COMMENT ON POLICY "anonymous_read_courses_for_sessions" ON courses IS
  'Allow anonymous users to read course info for active sessions';

COMMENT ON POLICY "anonymous_read_teacher_names" ON users IS
  'Allow anonymous users to read teacher names for session display';

COMMENT ON POLICY "anonymous_insert_responses" ON responses IS
  'Allow anonymous students to submit responses for active sessions';

COMMENT ON POLICY "anonymous_check_own_responses" ON responses IS
  'Allow anonymous users to check if they already submitted a response';
