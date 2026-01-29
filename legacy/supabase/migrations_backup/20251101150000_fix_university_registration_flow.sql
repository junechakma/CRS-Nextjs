-- Fix the university admin registration flow
-- This migration updates the register_university_admin function to set users as pending
-- instead of active, so they appear in the pending applications list

CREATE OR REPLACE FUNCTION public.register_university_admin(
    p_email character varying,
    p_password character varying,
    p_name character varying,
    p_phone character varying,
    p_university_name character varying,
    p_university_code character varying,
    p_university_address text DEFAULT NULL::text,
    p_university_city character varying DEFAULT NULL::character varying,
    p_university_state character varying DEFAULT NULL::character varying,
    p_university_country character varying DEFAULT NULL::character varying,
    p_university_postal_code character varying DEFAULT NULL::character varying,
    p_university_email character varying DEFAULT NULL::character varying,
    p_university_phone character varying DEFAULT NULL::character varying,
    p_university_website character varying DEFAULT NULL::character varying
)
RETURNS json
LANGUAGE plpgsql
AS $function$
DECLARE
    user_id UUID;
    application_id UUID;
    password_hash VARCHAR(255);
BEGIN
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Email already exists'
        );
    END IF;

    -- Check if university code already exists in applications
    IF EXISTS (SELECT 1 FROM university_applications WHERE university_code = UPPER(p_university_code)) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'University code already exists in applications'
        );
    END IF;

    -- Check if university code already exists in universities
    IF check_university_code_exists(UPPER(p_university_code)) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'University code already exists'
        );
    END IF;

    BEGIN
        -- Hash password
        password_hash := crypt(p_password, gen_salt('bf'));

        -- Create university admin user with PENDING status
        -- They will be activated when super admin approves their application
        INSERT INTO users (
            email, password_hash, role, name, phone,
            status, approval_status, application_date
        )
        VALUES (
            p_email, password_hash, 'university_admin', p_name, p_phone,
            'pending', 'pending', NOW()
        )
        RETURNING id INTO user_id;

        -- Create university application
        INSERT INTO university_applications (
            user_id, university_name, university_code, university_address,
            university_city, university_state, university_country, university_postal_code,
            university_email, university_phone, university_website,
            admin_name, admin_email, admin_phone, application_status
        )
        VALUES (
            user_id, p_university_name, UPPER(p_university_code), p_university_address,
            p_university_city, p_university_state, p_university_country, p_university_postal_code,
            p_university_email, p_university_phone, p_university_website,
            p_name, p_email, p_phone, 'pending'
        )
        RETURNING id INTO application_id;

        RETURN json_build_object(
            'success', true,
            'user_id', user_id,
            'application_id', application_id,
            'message', 'University admin registered successfully. Application is pending approval.'
        );

    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
END;
$function$;

-- Ensure the approve_university_application function properly handles the approval
-- This function should:
-- 1. Create the university record
-- 2. Update the user's university_id
-- 3. Set the university's admin_id
-- 4. Update the user status to active/approved
-- 5. Update the application status to approved

-- The function already does all of this correctly (lines 186-227 in the schema)
-- No changes needed to approve_university_application

COMMENT ON FUNCTION public.register_university_admin IS
'Registers a new university admin with pending status. The admin and their university will be created when a super admin approves the application.';
