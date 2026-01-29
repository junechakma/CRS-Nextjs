-- Migration to use Supabase Auth for teacher creation
-- This removes the need for password_hash column and pgcrypto functions

-- Make password_hash column nullable since we're using Supabase Auth
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Drop the old create_teacher function that uses manual password hashing
DROP FUNCTION IF EXISTS public.create_teacher(uuid, uuid, character varying, character varying, character varying, character varying, character varying);

-- Drop old update/delete functions
DROP FUNCTION IF EXISTS public.update_teacher_by_admin(uuid, uuid, character varying, character varying, character varying, character varying, uuid);
DROP FUNCTION IF EXISTS public.update_teacher_status_by_admin(uuid, uuid, character varying);
DROP FUNCTION IF EXISTS public.delete_teacher_by_admin(uuid, uuid);

-- Drop the password hashing trigger if it exists
DROP TRIGGER IF EXISTS hash_password_on_insert ON users;
DROP FUNCTION IF EXISTS public.hash_password() CASCADE;

-- Add a comment explaining the new approach
COMMENT ON COLUMN users.password_hash IS 'Deprecated - Using Supabase Auth for authentication. This column is kept for backward compatibility but should be NULL for new users.';

-- Create function to insert teacher after Supabase Auth user is created
-- This function bypasses RLS using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.create_teacher_record(
    p_auth_user_id uuid,
    p_email character varying,
    p_name character varying,
    p_initial character varying,
    p_phone character varying,
    p_university_id uuid,
    p_faculty_id uuid,
    p_department_id uuid,
    p_approved_by uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert user record
    INSERT INTO users (
        id,
        email,
        role,
        name,
        phone,
        initial,
        university_id,
        faculty_id,
        department_id,
        status,
        approval_status,
        password_change_required,
        approved_by,
        approval_date
    ) VALUES (
        p_auth_user_id,
        p_email,
        'teacher',
        p_name,
        NULLIF(p_phone, ''),
        UPPER(p_initial),
        p_university_id,
        p_faculty_id,
        p_department_id,
        'active',
        'approved',
        true,
        p_approved_by,
        NOW()
    );

    RETURN json_build_object(
        'success', true,
        'teacher_id', p_auth_user_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_teacher_record(uuid, character varying, character varying, character varying, character varying, uuid, uuid, uuid, uuid) TO authenticated;

COMMENT ON FUNCTION public.create_teacher_record IS 'Creates teacher record in database after Supabase Auth user is created - bypasses RLS with SECURITY DEFINER';
