-- Add RLS policies for University Admins to manage users in their university
-- This allows University Admins to:
-- 1. Read all users in their university (needed to view teachers, students, etc.)
-- 2. Update users in their university (needed to manage teachers)
-- 3. Insert users in their university (needed to create teachers)

-- Helper function to check if current user is a university admin
CREATE OR REPLACE FUNCTION public.is_university_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE auth_user_id = auth.uid()
    AND role = 'university_admin'
    AND status = 'active'
    AND approval_status = 'approved'
  );
$$;

-- Helper function to get current user's university_id
CREATE OR REPLACE FUNCTION public.get_user_university_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT university_id
  FROM public.users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- Policy: University Admins can read all users in their university
CREATE POLICY "university_admin_read_university_users"
ON public.users
FOR SELECT
TO authenticated
USING (
  -- User can read their own profile
  auth_user_id = auth.uid()
  OR
  -- OR user is a university admin and the target user is in the same university
  (
    public.is_university_admin()
    AND university_id = public.get_user_university_id()
  )
);

-- Policy: University Admins can insert users in their university (for creating teachers)
CREATE POLICY "university_admin_insert_university_users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_university_admin()
  AND university_id = public.get_user_university_id()
);

-- Policy: University Admins can update users in their university (except their own role/status)
CREATE POLICY "university_admin_update_university_users"
ON public.users
FOR UPDATE
TO authenticated
USING (
  -- User can update their own profile
  auth_user_id = auth.uid()
  OR
  -- OR user is a university admin and the target user is in the same university
  (
    public.is_university_admin()
    AND university_id = public.get_user_university_id()
  )
)
WITH CHECK (
  -- Same check for updates
  auth_user_id = auth.uid()
  OR
  (
    public.is_university_admin()
    AND university_id = public.get_user_university_id()
  )
);

-- Drop the old restrictive policies
DROP POLICY IF EXISTS "enable_read_own_profile" ON public.users;
DROP POLICY IF EXISTS "enable_update_own_profile" ON public.users;

-- Add comments
COMMENT ON FUNCTION public.is_university_admin IS 'Returns true if the current user is an active, approved university admin';
COMMENT ON FUNCTION public.get_user_university_id IS 'Returns the university_id of the current user';
COMMENT ON POLICY "university_admin_read_university_users" ON public.users IS 'Allows university admins to read all users in their university';
COMMENT ON POLICY "university_admin_insert_university_users" ON public.users IS 'Allows university admins to insert users in their university';
COMMENT ON POLICY "university_admin_update_university_users" ON public.users IS 'Allows university admins to update users in their university';
