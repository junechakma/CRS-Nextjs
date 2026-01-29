-- Fix CLO RLS Policy and Trigger
-- Run this in your Supabase SQL Editor

-- Step 1: Create helper function to check course ownership (bypasses RLS)
CREATE OR REPLACE FUNCTION user_owns_course(p_course_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM courses
        WHERE id = p_course_id
        AND teacher_id = p_user_id
    );
END;
$$;

-- Step 2: Drop old trigger
DROP TRIGGER IF EXISTS update_course_clos_timestamp ON course_clos;

-- Step 3: Drop old policies
DROP POLICY IF EXISTS teacher_view_clos_policy ON course_clos;
DROP POLICY IF EXISTS teacher_create_clos_policy ON course_clos;
DROP POLICY IF EXISTS teacher_update_clos_policy ON course_clos;
DROP POLICY IF EXISTS teacher_delete_clos_policy ON course_clos;
DROP POLICY IF EXISTS teacher_manage_clos_policy ON course_clos;

-- Step 4: Recreate trigger
CREATE TRIGGER update_course_clos_timestamp
    BEFORE UPDATE ON course_clos
    FOR EACH ROW
    EXECUTE FUNCTION update_clo_updated_at();

-- Step 5: Create unified policy using the helper function
-- This bypasses RLS issues on the courses table
CREATE POLICY teacher_manage_clos_policy ON course_clos
    FOR ALL
    USING (user_owns_course(course_id, auth.uid()))
    WITH CHECK (user_owns_course(course_id, auth.uid()));

