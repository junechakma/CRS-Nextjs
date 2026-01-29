-- Fix RLS policies for university_applications table
-- This migration ensures authenticated users can create and manage their applications

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "allow_application_insert" ON public.university_applications;
DROP POLICY IF EXISTS "allow_application_select" ON public.university_applications;
DROP POLICY IF EXISTS "allow_application_update" ON public.university_applications;
DROP POLICY IF EXISTS "super_admin_all_access" ON public.university_applications;

-- Enable RLS on university_applications if not already enabled
ALTER TABLE public.university_applications ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to SELECT their own applications
CREATE POLICY "authenticated_select_own_application"
ON public.university_applications
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'super_admin'
        AND users.status = 'active'
    )
);

-- Policy 2: Allow authenticated users to INSERT their own applications
CREATE POLICY "authenticated_insert_own_application"
ON public.university_applications
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'university_admin'
    )
);

-- Policy 3: Allow authenticated users to UPDATE their own pending applications
CREATE POLICY "authenticated_update_own_application"
ON public.university_applications
FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id
    AND application_status = 'pending'
)
WITH CHECK (
    auth.uid() = user_id
    AND application_status = 'pending'
);

-- Policy 4: Allow super admins full access to all applications
CREATE POLICY "super_admin_full_access"
ON public.university_applications
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'super_admin'
        AND users.status = 'active'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'super_admin'
        AND users.status = 'active'
    )
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.university_applications TO authenticated;

-- Add comments
COMMENT ON POLICY "authenticated_select_own_application" ON public.university_applications IS
'Allows authenticated users to view their own applications and super admins to view all applications';

COMMENT ON POLICY "authenticated_insert_own_application" ON public.university_applications IS
'Allows authenticated university admins to create their own applications';

COMMENT ON POLICY "authenticated_update_own_application" ON public.university_applications IS
'Allows authenticated users to update their own pending applications';

COMMENT ON POLICY "super_admin_full_access" ON public.university_applications IS
'Allows super admins full access to all applications for management purposes';
