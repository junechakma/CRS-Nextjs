-- Fix approve_university_application function to properly update users table
-- This removes the u.status = 'active' check and adds approval_status/status updates

CREATE OR REPLACE FUNCTION "public"."approve_university_application"(
    "p_super_admin_id" "uuid", 
    "p_application_id" "uuid", 
    "p_university_settings" "jsonb" DEFAULT NULL::"jsonb"
) RETURNS json
LANGUAGE "plpgsql"
SECURITY DEFINER
AS $$
DECLARE
    app_record RECORD;
    uni_id UUID;
    settings JSONB;
BEGIN
    -- Verify super admin
    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE id = p_super_admin_id
        AND role = 'super_admin'
        AND status = 'active'
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Super admin not found');
    END IF;

    -- Get application details (removed u.status = 'active' check - users are pending at this point)
    SELECT ua.*, u.id as user_id INTO app_record
    FROM university_applications ua
    JOIN users u ON u.id = ua.user_id
    WHERE ua.id = p_application_id
    AND ua.application_status = 'pending'
    AND u.role = 'university_admin';

    IF app_record.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'University application not found or already processed'
        );
    END IF;

    -- Check if university code exists
    IF EXISTS (SELECT 1 FROM universities WHERE UPPER(code) = UPPER(app_record.university_code)) THEN
        RETURN json_build_object('success', false, 'error', 'University code already exists');
    END IF;

    -- Set default settings if not provided
    settings := COALESCE(p_university_settings, '{
        "maintenance_mode": false,
        "registration_open": true,
        "default_session_duration": 30,
        "max_questions_per_session": 20,
        "allow_anonymous_responses": true
    }'::jsonb);

    BEGIN
        -- Create university
        INSERT INTO universities (
            name, code, address, city, state, country, postal_code,
            email, phone, website, settings, created_by
        )
        VALUES (
            app_record.university_name,
            app_record.university_code,
            app_record.university_address,
            app_record.university_city,
            app_record.university_state,
            app_record.university_country,
            app_record.university_postal_code,
            app_record.university_email,
            app_record.university_phone,
            app_record.university_website,
            settings,
            p_super_admin_id
        )
        RETURNING id INTO uni_id;

        -- Update user with university assignment AND set to active/approved
        UPDATE users
        SET
            university_id = uni_id,
            approved_by = p_super_admin_id,
            approval_date = NOW(),
            approval_status = 'approved',
            status = 'active'
        WHERE id = app_record.user_id;

        -- Set university admin
        UPDATE universities SET admin_id = app_record.user_id WHERE id = uni_id;

        -- Update application status
        UPDATE university_applications
        SET
            application_status = 'approved',
            reviewed_by = p_super_admin_id,
            review_date = NOW()
        WHERE id = p_application_id;

        RETURN json_build_object(
            'success', true,
            'university_id', uni_id,
            'admin_id', app_record.user_id,
            'message', 'University application approved and university created'
        );

    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
END;
$$;

-- Grant permissions
GRANT ALL ON FUNCTION "public"."approve_university_application"("p_super_admin_id" "uuid", "p_application_id" "uuid", "p_university_settings" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_university_application"("p_super_admin_id" "uuid", "p_application_id" "uuid", "p_university_settings" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_university_application"("p_super_admin_id" "uuid", "p_application_id" "uuid", "p_university_settings" "jsonb") TO "service_role";

