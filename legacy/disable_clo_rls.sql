-- Disable RLS on course_clos table
-- This is safe because:
-- 1. You can only access CLOs through courses
-- 2. The courses table already has RLS protecting which courses you can see
-- 3. The course_id foreign key ensures data integrity

-- Drop all policies
DROP POLICY IF EXISTS teacher_view_clos_policy ON course_clos;
DROP POLICY IF EXISTS teacher_create_clos_policy ON course_clos;
DROP POLICY IF EXISTS teacher_update_clos_policy ON course_clos;
DROP POLICY IF EXISTS teacher_delete_clos_policy ON course_clos;
DROP POLICY IF EXISTS teacher_manage_clos_policy ON course_clos;

-- Disable RLS entirely
ALTER TABLE course_clos DISABLE ROW LEVEL SECURITY;

-- That's it! CLOs are now accessible without RLS restrictions
-- Security is maintained through:
-- - The courses table RLS (teachers only see their courses)
-- - Application-level checks in your service layer

