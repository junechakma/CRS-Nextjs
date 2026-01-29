-- Fix RLS policies to use auth_user_id instead of user_id
-- The issue: auth.uid() returns Supabase Auth ID, but we were comparing to users.id
-- The fix: Compare auth.uid() to users.auth_user_id

-- Drop existing policies
DROP POLICY IF EXISTS "authenticated_select_own_application" ON public.university_applications;
DROP POLICY IF EXISTS "authenticated_insert_own_application" ON public.university_applications;
DROP POLICY IF EXISTS "authenticated_update_own_application" ON public.university_applications;
DROP POLICY IF EXISTS "super_admin_full_access" ON public.university_applications;

-- Policy 1: Allow users to SELECT their own applications
-- Check if the application's user_id matches a user whose auth_user_id equals auth.uid()
CREATE POLICY "authenticated_select_own_application"
ON public.university_applications
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = university_applications.user_id
        AND users.auth_user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE users.auth_user_id = auth.uid()
        AND users.role = 'super_admin'
        AND users.status = 'active'
    )
);

-- Policy 2: Allow university admins to INSERT their own applications
-- Check if the user_id in the new row matches a user whose auth_user_id equals auth.uid()
CREATE POLICY "authenticated_insert_own_application"
ON public.university_applications
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = university_applications.user_id
        AND users.auth_user_id = auth.uid()
        AND users.role = 'university_admin'
    )
);

-- Policy 3: Allow users to UPDATE their own pending applications
CREATE POLICY "authenticated_update_own_application"
ON public.university_applications
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = university_applications.user_id
        AND users.auth_user_id = auth.uid()
    )
    AND application_status = 'pending'
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = university_applications.user_id
        AND users.auth_user_id = auth.uid()
    )
    AND application_status = 'pending'
);

-- Policy 4: Allow super admins full access
CREATE POLICY "super_admin_full_access"
ON public.university_applications
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.auth_user_id = auth.uid()
        AND users.role = 'super_admin'
        AND users.status = 'active'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.auth_user_id = auth.uid()
        AND users.role = 'super_admin'
        AND users.status = 'active'
    )
);

-- Add helpful comments
COMMENT ON POLICY "authenticated_select_own_application" ON public.university_applications IS
'Allows users to view their own applications by matching auth.uid() to users.auth_user_id, and allows super admins to view all';

COMMENT ON POLICY "authenticated_insert_own_application" ON public.university_applications IS
'Allows university admins to create applications by matching auth.uid() to users.auth_user_id';

COMMENT ON POLICY "authenticated_update_own_application" ON public.university_applications IS
'Allows users to update their own pending applications by matching auth.uid() to users.auth_user_id';

COMMENT ON POLICY "super_admin_full_access" ON public.university_applications IS
'Allows super admins full CRUD access by matching auth.uid() to users.auth_user_id';
