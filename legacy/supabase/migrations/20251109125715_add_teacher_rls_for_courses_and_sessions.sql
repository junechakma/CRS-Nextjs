-- Add RLS policies for teachers to manage their own courses and response sessions
-- Teachers should be able to:
-- 1. Create new courses
-- 2. Update their own courses
-- 3. Delete their own courses
-- 4. Create response sessions for their courses
-- 5. Update their own response sessions
-- 6. Delete their own response sessions

-- =======================
-- COURSES TABLE POLICIES
-- =======================

-- Policy: Teachers can insert their own courses
CREATE POLICY "teachers_insert_own_courses"
ON public.courses
FOR INSERT
TO authenticated
WITH CHECK (
  teacher_id = get_current_user_id()
  AND get_current_user_role() = 'teacher'
);

-- Policy: Teachers can update their own courses
CREATE POLICY "teachers_update_own_courses"
ON public.courses
FOR UPDATE
TO authenticated
USING (
  teacher_id = get_current_user_id()
  OR get_current_user_role() = ANY (ARRAY['super_admin'::text, 'university_admin'::text, 'faculty_admin'::text, 'department_moderator'::text])
)
WITH CHECK (
  teacher_id = get_current_user_id()
  OR get_current_user_role() = ANY (ARRAY['super_admin'::text, 'university_admin'::text, 'faculty_admin'::text, 'department_moderator'::text])
);

-- Policy: Teachers can delete their own courses
CREATE POLICY "teachers_delete_own_courses"
ON public.courses
FOR DELETE
TO authenticated
USING (
  teacher_id = get_current_user_id()
  OR get_current_user_role() = ANY (ARRAY['super_admin'::text, 'university_admin'::text, 'faculty_admin'::text, 'department_moderator'::text])
);

-- ================================
-- RESPONSE_SESSIONS TABLE POLICIES
-- ================================

-- Policy: Teachers can insert their own response sessions
CREATE POLICY "teachers_insert_own_sessions"
ON public.response_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  teacher_id = get_current_user_id()
  AND get_current_user_role() = 'teacher'
);

-- Policy: Teachers can update their own response sessions
CREATE POLICY "teachers_update_own_sessions"
ON public.response_sessions
FOR UPDATE
TO authenticated
USING (
  teacher_id = get_current_user_id()
  OR get_current_user_role() = ANY (ARRAY['super_admin'::text, 'university_admin'::text, 'faculty_admin'::text, 'department_moderator'::text])
)
WITH CHECK (
  teacher_id = get_current_user_id()
  OR get_current_user_role() = ANY (ARRAY['super_admin'::text, 'university_admin'::text, 'faculty_admin'::text, 'department_moderator'::text])
);

-- Policy: Teachers can delete their own response sessions
CREATE POLICY "teachers_delete_own_sessions"
ON public.response_sessions
FOR DELETE
TO authenticated
USING (
  teacher_id = get_current_user_id()
  OR get_current_user_role() = ANY (ARRAY['super_admin'::text, 'university_admin'::text, 'faculty_admin'::text, 'department_moderator'::text])
);

-- Add comments
COMMENT ON POLICY "teachers_insert_own_courses" ON public.courses IS 'Allows teachers to create new courses';
COMMENT ON POLICY "teachers_update_own_courses" ON public.courses IS 'Allows teachers to update their own courses and admins to update any courses';
COMMENT ON POLICY "teachers_delete_own_courses" ON public.courses IS 'Allows teachers to delete their own courses and admins to delete any courses';
COMMENT ON POLICY "teachers_insert_own_sessions" ON public.response_sessions IS 'Allows teachers to create response sessions for their courses';
COMMENT ON POLICY "teachers_update_own_sessions" ON public.response_sessions IS 'Allows teachers to update their own sessions and admins to update any sessions';
COMMENT ON POLICY "teachers_delete_own_sessions" ON public.response_sessions IS 'Allows teachers to delete their own sessions and admins to delete any sessions';
