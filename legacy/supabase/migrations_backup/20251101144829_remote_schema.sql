-- Encryption keys table was removed in later migrations, commenting out these revokes
-- revoke delete on table "public"."encryption_keys" from "service_role";
-- revoke insert on table "public"."encryption_keys" from "service_role";
-- revoke references on table "public"."encryption_keys" from "service_role";
-- revoke select on table "public"."encryption_keys" from "service_role";
-- revoke trigger on table "public"."encryption_keys" from "service_role";
-- revoke truncate on table "public"."encryption_keys" from "service_role";
-- revoke update on table "public"."encryption_keys" from "service_role";

alter table "public"."courses" drop constraint "courses_status_check";

alter table "public"."departments" drop constraint "departments_status_check";

alter table "public"."email_logs" drop constraint "email_logs_status_check";

alter table "public"."faculties" drop constraint "faculties_status_check";

alter table "public"."questions" drop constraint "questions_category_check";

alter table "public"."questions" drop constraint "questions_type_check";

alter table "public"."response_sessions" drop constraint "response_sessions_status_check";

alter table "public"."responses" drop constraint "responses_status_check";

alter table "public"."semesters" drop constraint "semesters_name_check";

alter table "public"."semesters" drop constraint "semesters_status_check";

alter table "public"."universities" drop constraint "universities_status_check";

alter table "public"."university_applications" drop constraint "university_applications_application_status_check";

alter table "public"."users" drop constraint "users_approval_status_check";

alter table "public"."users" drop constraint "users_role_check";

alter table "public"."users" drop constraint "users_status_check";

alter table "public"."audit_log" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."courses" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."departments" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."durations" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."faculties" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."question_templates" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."questions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."response_sessions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."responses" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."semesters" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."teacher_feedback" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."template_questions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."universities" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."university_applications" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."users" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."courses" add constraint "courses_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]))) not valid;

alter table "public"."courses" validate constraint "courses_status_check";

alter table "public"."departments" add constraint "departments_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[]))) not valid;

alter table "public"."departments" validate constraint "departments_status_check";

alter table "public"."email_logs" add constraint "email_logs_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'failed'::character varying, 'delivered'::character varying])::text[]))) not valid;

alter table "public"."email_logs" validate constraint "email_logs_status_check";

alter table "public"."faculties" add constraint "faculties_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[]))) not valid;

alter table "public"."faculties" validate constraint "faculties_status_check";

alter table "public"."questions" add constraint "questions_category_check" CHECK (((category)::text = ANY ((ARRAY['instructor'::character varying, 'content'::character varying, 'delivery'::character varying, 'assessment'::character varying, 'overall'::character varying])::text[]))) not valid;

alter table "public"."questions" validate constraint "questions_category_check";

alter table "public"."questions" add constraint "questions_type_check" CHECK (((type)::text = ANY ((ARRAY['rating'::character varying, 'multiple_choice'::character varying, 'text'::character varying, 'yes_no'::character varying])::text[]))) not valid;

alter table "public"."questions" validate constraint "questions_type_check";

alter table "public"."response_sessions" add constraint "response_sessions_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'active'::character varying, 'completed'::character varying, 'expired'::character varying, 'cancelled'::character varying])::text[]))) not valid;

alter table "public"."response_sessions" validate constraint "response_sessions_status_check";

alter table "public"."responses" add constraint "responses_status_check" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'submitted'::character varying, 'validated'::character varying, 'flagged'::character varying])::text[]))) not valid;

alter table "public"."responses" validate constraint "responses_status_check";

alter table "public"."semesters" add constraint "semesters_name_check" CHECK (((name)::text = ANY ((ARRAY['Spring'::character varying, 'Summer'::character varying, 'Autumn'::character varying, 'Year'::character varying])::text[]))) not valid;

alter table "public"."semesters" validate constraint "semesters_name_check";

alter table "public"."semesters" add constraint "semesters_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'completed'::character varying])::text[]))) not valid;

alter table "public"."semesters" validate constraint "semesters_status_check";

alter table "public"."universities" add constraint "universities_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying])::text[]))) not valid;

alter table "public"."universities" validate constraint "universities_status_check";

alter table "public"."university_applications" add constraint "university_applications_application_status_check" CHECK (((application_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."university_applications" validate constraint "university_applications_application_status_check";

alter table "public"."users" add constraint "users_approval_status_check" CHECK (((approval_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."users" validate constraint "users_approval_status_check";

alter table "public"."users" add constraint "users_role_check" CHECK (((role)::text = ANY ((ARRAY['super_admin'::character varying, 'university_admin'::character varying, 'faculty_admin'::character varying, 'department_moderator'::character varying, 'teacher'::character varying, 'student'::character varying])::text[]))) not valid;

alter table "public"."users" validate constraint "users_role_check";

alter table "public"."users" add constraint "users_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'blocked'::character varying, 'pending'::character varying])::text[]))) not valid;

alter table "public"."users" validate constraint "users_status_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.approve_university_application(p_super_admin_id uuid, p_application_id uuid, p_university_settings jsonb DEFAULT NULL::jsonb)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
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

    -- Get application details
    SELECT * INTO app_record
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

    -- Check if university code exists using hash comparison
    IF check_university_code_exists(app_record.university_code) THEN
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
        -- Create university with automatic encryption (including code)
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

        -- Update user with university assignment and set to active
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
            'message', 'University application approved and university created with full encryption'
        );

    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.change_password(p_user_id uuid, p_old_password character varying, p_new_password character varying)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    user_record RECORD;
    password_valid BOOLEAN;
    new_password_hash VARCHAR(255);
BEGIN
    -- Get user details
    SELECT * INTO user_record
    FROM users 
    WHERE id = p_user_id 
    AND status = 'active';
    
    IF user_record.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not found',
            'error_code', 'USER_NOT_FOUND'
        );
    END IF;
    
    -- Verify old password
    password_valid := (user_record.password_hash = crypt(p_old_password, user_record.password_hash));
    
    IF NOT password_valid THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Current password is incorrect',
            'error_code', 'INVALID_OLD_PASSWORD'
        );
    END IF;
    
    -- Hash new password
    new_password_hash := crypt(p_new_password, gen_salt('bf'));
    
    -- Update password
    UPDATE users 
    SET 
        password_hash = new_password_hash,
        password_change_required = false,
        last_password_change = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Log the password change
    INSERT INTO audit_log (user_id, action, table_name, record_id)
    VALUES (p_user_id, 'PASSWORD_CHANGE', 'users', p_user_id);
    
    RETURN json_build_object(
        'success', true,
        'message', 'Password changed successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Password change failed: ' || SQLERRM,
            'error_code', 'PASSWORD_CHANGE_ERROR'
        );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.change_password_authenticated(p_user_id uuid, p_current_password text, p_new_password text, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
 RETURNS TABLE(success boolean, message text, email_sent boolean, email_log_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_user RECORD;
    v_current_password_hash TEXT;
    v_new_password_hash TEXT;
    v_log_id UUID;
    v_email_log_id UUID DEFAULT NULL;
BEGIN
    -- Validate inputs
    IF p_user_id IS NULL OR p_current_password IS NULL OR p_new_password IS NULL THEN
        RETURN QUERY SELECT FALSE, 'All parameters are required', FALSE, NULL::UUID;
        RETURN;
    END IF;

    -- Validate new password strength
    IF LENGTH(p_new_password) < 8 THEN
        RETURN QUERY SELECT FALSE, 'Password must be at least 8 characters long', FALSE, NULL::UUID;
        RETURN;
    END IF;

    -- Check if password contains required character types
    IF NOT (p_new_password ~ '[A-Z]' AND 
            p_new_password ~ '[a-z]' AND 
            p_new_password ~ '[0-9]' AND 
            p_new_password ~ '[^A-Za-z0-9]') THEN
        RETURN QUERY SELECT FALSE, 'Password must contain uppercase, lowercase, number, and special character', FALSE, NULL::UUID;
        RETURN;
    END IF;

    -- Get user details
    SELECT * INTO v_user
    FROM users
    WHERE id = p_user_id AND status = 'active';

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'User not found or inactive', FALSE, NULL::UUID;
        RETURN;
    END IF;

    -- Verify current password
    IF NOT (crypt(p_current_password, v_user.password_hash) = v_user.password_hash) THEN
        -- Log failed attempt
        INSERT INTO password_reset_attempts (
            id, email, ip_address, user_agent, success, failure_reason, attempted_at
        ) VALUES (
            gen_random_uuid(), v_user.email, p_ip_address, p_user_agent, 
            FALSE, 'Invalid current password', NOW()
        );
        
        RETURN QUERY SELECT FALSE, 'Current password is incorrect', FALSE, NULL::UUID;
        RETURN;
    END IF;

    -- Check if new password is same as current
    IF crypt(p_new_password, v_user.password_hash) = v_user.password_hash THEN
        RETURN QUERY SELECT FALSE, 'New password must be different from current password', FALSE, NULL::UUID;
        RETURN;
    END IF;

    -- Hash new password
    v_new_password_hash := crypt(p_new_password, gen_salt('bf', 12));

    -- Update user password
    UPDATE users 
    SET 
        password_hash = v_new_password_hash,
        password_change_required = FALSE,
        last_password_change = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Log successful password change
    INSERT INTO password_reset_attempts (
        id, email, ip_address, user_agent, success, attempted_at
    ) VALUES (
        gen_random_uuid(), v_user.email, p_ip_address, p_user_agent, TRUE, NOW()
    );

    -- Log password change activity
    INSERT INTO activity_logs (
        id, user_id, action_type, resource_type, resource_id, 
        details, ip_address, user_agent, created_at
    ) VALUES (
        gen_random_uuid(), p_user_id, 'password_change', 'user', p_user_id,
        jsonb_build_object(
            'action', 'password_changed_by_user',
            'timestamp', NOW(),
            'method', 'authenticated_change'
        ),
        p_ip_address, p_user_agent, NOW()
    );

    -- Optionally send notification email (if email logging exists)
    BEGIN
        INSERT INTO email_logs (
            id, recipient_email, subject, template_name, 
            template_data, status, created_at
        ) VALUES (
            gen_random_uuid(), v_user.email, 
            'Password Changed Successfully',
            'password_changed_notification',
            jsonb_build_object(
                'user_name', v_user.name,
                'change_time', NOW(),
                'ip_address', COALESCE(p_ip_address, 'Unknown'),
                'user_agent', COALESCE(p_user_agent, 'Unknown')
            ),
            'pending', NOW()
        ) RETURNING id INTO v_email_log_id;
    EXCEPTION 
        WHEN undefined_table THEN
            -- Email logs table doesn't exist, continue without email
            v_email_log_id := NULL;
    END;

    RETURN QUERY SELECT TRUE, 'Password changed successfully', 
                        (v_email_log_id IS NOT NULL), v_email_log_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_password_change_required(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_required BOOLEAN DEFAULT FALSE;
BEGIN
    SELECT COALESCE(password_change_required, FALSE)
    INTO v_required
    FROM users
    WHERE id = p_user_id;

    RETURN v_required;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_university_code_exists(p_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    code_exists BOOLEAN;
BEGIN
    IF p_code IS NULL OR p_code = '' THEN
        RETURN FALSE;
    END IF;

    -- Check if hash exists in database
    SELECT EXISTS(
        SELECT 1 FROM universities
        WHERE code_hash = hash_university_code(p_code)
    ) INTO code_exists;

    RETURN code_exists;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_expired_password_tokens()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Delete expired tokens older than 24 hours
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Also cleanup old password reset attempts (keep last 30 days)
    DELETE FROM password_reset_attempts 
    WHERE attempted_at < NOW() - INTERVAL '30 days';
    
    RETURN v_deleted_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.copy_default_template_to_university(p_university_id uuid, p_template_id uuid DEFAULT NULL::uuid, p_new_template_name character varying DEFAULT NULL::character varying, p_created_by uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    source_template_id UUID;
    new_template_id UUID;
    template_record RECORD;
    question_record RECORD;
BEGIN
    -- Validate university exists
    IF NOT EXISTS (SELECT 1 FROM universities WHERE id = p_university_id) THEN
        RAISE EXCEPTION 'University with ID % does not exist', p_university_id;
    END IF;
    
    -- Determine source template (use provided or default)
    IF p_template_id IS NULL THEN
        SELECT id INTO source_template_id 
        FROM question_templates 
        WHERE is_default = true 
        ORDER BY created_at 
        LIMIT 1;
        
        IF source_template_id IS NULL THEN
            RAISE EXCEPTION 'No default template found';
        END IF;
    ELSE
        source_template_id := p_template_id;
        
        -- Verify template exists and is accessible
        IF NOT EXISTS (
            SELECT 1 FROM question_templates 
            WHERE id = source_template_id 
            AND (is_default = true OR university_id = p_university_id)
        ) THEN
            RAISE EXCEPTION 'Template with ID % not found or not accessible', source_template_id;
        END IF;
    END IF;
    
    -- Get source template details
    SELECT * INTO template_record 
    FROM question_templates 
    WHERE id = source_template_id;
    
    -- Create new template for university
    INSERT INTO question_templates (
        university_id, 
        name, 
        description, 
        is_default, 
        is_active, 
        created_by
    )
    VALUES (
        p_university_id,
        COALESCE(p_new_template_name, template_record.name || ' (Copy)'),
        template_record.description,
        false,
        true,
        p_created_by
    )
    RETURNING id INTO new_template_id;
    
    -- Copy template questions
    FOR question_record IN 
        SELECT tq.*, q.text, q.type, q.category
        FROM template_questions tq
        JOIN questions q ON q.id = tq.question_id
        WHERE tq.template_id = source_template_id
        ORDER BY tq.order_index
    LOOP
        -- First, ensure the question exists for this university or create a copy
        DECLARE
            university_question_id UUID;
        BEGIN
            -- Check if university already has this question (by text match)
            SELECT id INTO university_question_id
            FROM questions 
            WHERE university_id = p_university_id 
            AND text = question_record.text
            AND type = question_record.type
            AND category = question_record.category;
            
            -- If not found, create a copy of the default question for this university
            IF university_question_id IS NULL THEN
                INSERT INTO questions (
                    university_id,
                    text,
                    type,
                    category,
                    scale,
                    options,
                    required,
                    priority,
                    is_active,
                    is_default,
                    created_by
                )
                SELECT 
                    p_university_id,
                    text,
                    type,
                    category,
                    scale,
                    options,
                    required,
                    priority,
                    is_active,
                    false, -- Not default for university-specific
                    p_created_by
                FROM questions 
                WHERE id = question_record.question_id
                RETURNING id INTO university_question_id;
            END IF;
            
            -- Add question to new template
            INSERT INTO template_questions (
                template_id,
                question_id,
                order_index,
                is_required,
                custom_priority
            )
            VALUES (
                new_template_id,
                university_question_id,
                question_record.order_index,
                question_record.is_required,
                question_record.custom_priority
            );
        END;
    END LOOP;
    
    RAISE NOTICE 'Template copied successfully. New template ID: %', new_template_id;
    RETURN new_template_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_default_template()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    template_id UUID;
    question_record RECORD;
    order_counter INTEGER := 1;
BEGIN
    -- Create default template
    INSERT INTO question_templates (name, description, is_default, is_active, created_by)
    VALUES ('Standard Course Evaluation', 'Comprehensive course evaluation template with instructor, content, delivery, and assessment questions', true, true, NULL)
    RETURNING id INTO template_id;
    
    -- Add questions to template (first 12 questions, excluding the last 3 text questions for a standard template)
    FOR question_record IN 
        SELECT id FROM questions 
        WHERE is_default = true 
        AND type IN ('rating', 'yes_no')
        ORDER BY priority, created_at
        LIMIT 12
    LOOP
        INSERT INTO template_questions (template_id, question_id, order_index)
        VALUES (template_id, question_record.id, order_counter);
        
        order_counter := order_counter + 1;
    END LOOP;
    
    RAISE NOTICE 'Default template created with ID: %', template_id;
    RETURN template_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_department(p_university_admin_id uuid, p_faculty_id uuid, p_department_name character varying, p_department_code character varying, p_department_description text, p_moderator_name character varying, p_moderator_email character varying, p_moderator_phone character varying, p_temp_password character varying)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    department_id UUID;
    moderator_id UUID;
    university_id UUID;
    password_hash VARCHAR(255);
BEGIN
    -- Get university admin's university and verify faculty belongs to it
    SELECT u.university_id INTO university_id
    FROM users u
    WHERE u.id = p_university_admin_id 
    AND u.role = 'university_admin' 
    AND u.status = 'active';
    
    IF university_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'University admin not found or not assigned to university');
    END IF;
    
    -- Verify faculty belongs to this university
    IF NOT EXISTS (SELECT 1 FROM faculties WHERE id = p_faculty_id AND university_id = university_id) THEN
        RETURN json_build_object('success', false, 'error', 'Faculty not found in this university');
    END IF;
    
    -- Check if department code already exists in this faculty
    IF EXISTS (SELECT 1 FROM departments WHERE faculty_id = p_faculty_id AND code = UPPER(p_department_code)) THEN
        RETURN json_build_object('success', false, 'error', 'Department code already exists in this faculty');
    END IF;
    
    -- Check if moderator email already exists
    IF EXISTS (SELECT 1 FROM users WHERE email = p_moderator_email) THEN
        RETURN json_build_object('success', false, 'error', 'Moderator email already exists');
    END IF;
    
    BEGIN
        -- Hash password
        password_hash := crypt(p_temp_password, gen_salt('bf'));
        
        -- Create department moderator user
        INSERT INTO users (
            email, password_hash, role, name, phone,
            university_id, faculty_id, status, approval_status,
            password_change_required, approved_by, approval_date
        )
        VALUES (
            p_moderator_email, password_hash, 'department_moderator', p_moderator_name, p_moderator_phone,
            university_id, p_faculty_id, 'active', 'approved',
            true, p_university_admin_id, NOW()
        )
        RETURNING id INTO moderator_id;
        
        -- Create department
        INSERT INTO departments (
            university_id, faculty_id, name, code, description, moderator_id, created_by
        )
        VALUES (
            university_id, p_faculty_id, p_department_name, UPPER(p_department_code), p_department_description, moderator_id, p_university_admin_id
        )
        RETURNING id INTO department_id;
        
        -- Update user with department assignment
        UPDATE users SET department_id = department_id WHERE id = moderator_id;
        
        RETURN json_build_object(
            'success', true,
            'department_id', department_id,
            'moderator_id', moderator_id,
            'message', 'Department created successfully with moderator'
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_faculty(p_university_admin_id uuid, p_faculty_name character varying, p_faculty_code character varying, p_faculty_description text, p_admin_name character varying, p_admin_email character varying, p_admin_phone character varying, p_temp_password character varying)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    faculty_id UUID;
    admin_id UUID;
    university_id UUID;
    password_hash VARCHAR(255);
BEGIN
    -- Get university admin's university
    SELECT u.university_id INTO university_id
    FROM users u
    WHERE u.id = p_university_admin_id 
    AND u.role = 'university_admin' 
    AND u.status = 'active';
    
    IF university_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'University admin not found or not assigned to university');
    END IF;
    
    -- Check if faculty code already exists in this university
    IF EXISTS (SELECT 1 FROM faculties WHERE university_id = university_id AND code = UPPER(p_faculty_code)) THEN
        RETURN json_build_object('success', false, 'error', 'Faculty code already exists in this university');
    END IF;
    
    -- Check if admin email already exists
    IF EXISTS (SELECT 1 FROM users WHERE email = p_admin_email) THEN
        RETURN json_build_object('success', false, 'error', 'Admin email already exists');
    END IF;
    
    BEGIN
        -- Hash password
        password_hash := crypt(p_temp_password, gen_salt('bf'));
        
        -- Create faculty admin user
        INSERT INTO users (
            email, password_hash, role, name, phone,
            university_id, status, approval_status,
            password_change_required, approved_by, approval_date
        )
        VALUES (
            p_admin_email, password_hash, 'faculty_admin', p_admin_name, p_admin_phone,
            university_id, 'active', 'approved',
            true, p_university_admin_id, NOW()
        )
        RETURNING id INTO admin_id;
        
        -- Create faculty
        INSERT INTO faculties (
            university_id, name, code, description, admin_id, created_by
        )
        VALUES (
            university_id, p_faculty_name, UPPER(p_faculty_code), p_faculty_description, admin_id, p_university_admin_id
        )
        RETURNING id INTO faculty_id;
        
        -- Update user with faculty assignment
        UPDATE users SET faculty_id = faculty_id WHERE id = admin_id;
        
        RETURN json_build_object(
            'success', true,
            'faculty_id', faculty_id,
            'admin_id', admin_id,
            'message', 'Faculty created successfully with admin'
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_semester(p_university_admin_id uuid, p_semester_name character varying, p_academic_year character varying, p_start_date date, p_end_date date, p_registration_start date DEFAULT NULL::date, p_registration_end date DEFAULT NULL::date, p_is_current boolean DEFAULT false)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    semester_id UUID;
    university_id UUID;
BEGIN
    -- Get university admin's university
    SELECT u.university_id INTO university_id
    FROM users u
    WHERE u.id = p_university_admin_id 
    AND u.role = 'university_admin' 
    AND u.status = 'active';
    
    IF university_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'University admin not found or not assigned to university');
    END IF;
    
    -- Check if semester already exists for this university
    IF EXISTS (SELECT 1 FROM semesters WHERE university_id = university_id AND name = p_semester_name AND academic_year = p_academic_year) THEN
        RETURN json_build_object('success', false, 'error', 'Semester already exists for this academic year');
    END IF;
    
    BEGIN
        -- If this semester is set as current, unset all other current semesters
        IF p_is_current THEN
            UPDATE semesters SET is_current = false WHERE university_id = university_id;
        END IF;
        
        -- Create semester
        INSERT INTO semesters (
            university_id, name, academic_year, start_date, end_date,
            registration_start, registration_end, is_current, created_by
        )
        VALUES (
            university_id, p_semester_name, p_academic_year, p_start_date, p_end_date,
            p_registration_start, p_registration_end, p_is_current, p_university_admin_id
        )
        RETURNING id INTO semester_id;
        
        RETURN json_build_object(
            'success', true,
            'semester_id', semester_id,
            'message', 'Semester created successfully'
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_super_admin(p_email character varying, p_password character varying, p_name character varying)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    admin_id UUID;
    password_hash VARCHAR(255);
BEGIN
    -- Check if super admin already exists
    IF EXISTS (SELECT 1 FROM users WHERE role = 'super_admin' AND status = 'active') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Super admin already exists'
        );
    END IF;
    
    -- Hash password
    password_hash := crypt(p_password, gen_salt('bf'));
    
    INSERT INTO users (email, password_hash, role, name, approval_status, status)
    VALUES (p_email, password_hash, 'super_admin', p_name, 'approved', 'active')
    RETURNING id INTO admin_id;
    
    RETURN json_build_object(
        'success', true,
        'admin_id', admin_id,
        'message', 'Super admin created successfully'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_system_backup(admin_id uuid)
 RETURNS TABLE(backup_id uuid, backup_url text, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        bs.backup_id,
        bs.backup_url,
        bs.status
    FROM create_system_backup_with_format(admin_id, 'sql') bs;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_system_backup_with_format(admin_id uuid, export_format text DEFAULT 'excel'::text)
 RETURNS TABLE(backup_id uuid, backup_url text, status text, format text, file_size bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    backup_record_id UUID;
    backup_file_path TEXT;
    backup_timestamp TEXT;
    file_extension TEXT;
    estimated_size BIGINT;
BEGIN
    -- Verify admin permissions
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = admin_id 
        AND role = 'super_admin' 
        AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Access denied. Super admin privileges required.';
    END IF;
    
    -- Validate format
    IF export_format NOT IN ('excel', 'sql') THEN
        RAISE EXCEPTION 'Invalid export format. Must be "excel" or "sql".';
    END IF;
    
    -- Generate backup timestamp and determine file extension
    backup_timestamp := to_char(NOW(), 'YYYY-MM-DD_HH24-MI-SS');
    file_extension := CASE WHEN export_format = 'excel' THEN '.xlsx' ELSE '.sql' END;
    backup_file_path := 'backups/backup_' || backup_timestamp || file_extension;
    
    -- Estimate file size based on format and data volume
    SELECT 
        CASE 
            WHEN export_format = 'excel' THEN
                -- Excel files are typically larger due to formatting
                (COUNT(*) * 150)::BIGINT * 1024  -- ~150KB per 1000 records
            ELSE
                -- SQL dumps are more compact
                (COUNT(*) * 80)::BIGINT * 1024   -- ~80KB per 1000 records
        END
    INTO estimated_size
    FROM (
        SELECT 1 FROM users
        UNION ALL
        SELECT 1 FROM universities
        UNION ALL
        SELECT 1 FROM courses
        UNION ALL
        SELECT 1 FROM responses
    ) combined_data;
    
    -- Create backup log entry
    INSERT INTO backup_logs (
        backup_type,
        status,
        file_path,
        created_by,
        created_at
    ) VALUES (
        export_format,
        'in_progress',
        backup_file_path,
        admin_id,
        NOW()
    ) RETURNING id INTO backup_record_id;
    
    -- In a real implementation, this is where you would:
    -- 1. For Excel: Generate XLSX file with multiple sheets (Users, Universities, Courses, Responses, etc.)
    -- 2. For SQL: Create complete database dump with schema and data
    -- 3. Store the file in secure cloud storage
    -- 4. Generate signed URL for download
    
    -- For now, simulate the backup creation process
    PERFORM pg_sleep(1); -- Simulate processing time
    
    -- Update backup log with completion
    UPDATE backup_logs 
    SET 
        status = 'completed',
        completed_at = NOW(),
        backup_url = '/api/backups/' || backup_record_id::text || '/download',
        file_size = estimated_size
    WHERE id = backup_record_id;
    
    -- Return backup information
    RETURN QUERY
    SELECT 
        backup_record_id as backup_id,
        ('/api/backups/' || backup_record_id::text || '/download') as backup_url,
        'completed'::text as status,
        export_format as format,
        estimated_size as file_size;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_teacher(p_university_admin_id uuid, p_department_id uuid, p_teacher_name character varying, p_teacher_email character varying, p_teacher_initial character varying, p_teacher_phone character varying, p_temp_password character varying)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    teacher_id UUID;
    university_id UUID;
    faculty_id UUID;
    password_hash VARCHAR(255);
BEGIN
    -- Get university admin's university and verify department belongs to it
    SELECT u.university_id INTO university_id
    FROM users u
    WHERE u.id = p_university_admin_id 
    AND u.role = 'university_admin' 
    AND u.status = 'active';
    
    IF university_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'University admin not found or not assigned to university');
    END IF;
    
    -- Get department details and verify it belongs to this university
    SELECT d.faculty_id INTO faculty_id
    FROM departments d
    WHERE d.id = p_department_id AND d.university_id = university_id;
    
    IF faculty_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Department not found in this university');
    END IF;
    
    -- Check if teacher email already exists
    IF EXISTS (SELECT 1 FROM users WHERE email = p_teacher_email) THEN
        RETURN json_build_object('success', false, 'error', 'Teacher email already exists');
    END IF;
    
    -- Check if initial already exists in this department
    IF EXISTS (SELECT 1 FROM users WHERE department_id = p_department_id AND initial = UPPER(p_teacher_initial) AND role = 'teacher') THEN
        RETURN json_build_object('success', false, 'error', 'Teacher initial already exists in this department');
    END IF;
    
    BEGIN
        -- Hash password
        password_hash := crypt(p_temp_password, gen_salt('bf'));
        
        -- Create teacher user
        INSERT INTO users (
            email, password_hash, role, name, phone, initial,
            university_id, faculty_id, department_id, status, approval_status,
            password_change_required, approved_by, approval_date
        )
        VALUES (
            p_teacher_email, password_hash, 'teacher', p_teacher_name, p_teacher_phone, UPPER(p_teacher_initial),
            university_id, faculty_id, p_department_id, 'active', 'approved',
            true, p_university_admin_id, NOW()
        )
        RETURNING id INTO teacher_id;
        
        RETURN json_build_object(
            'success', true,
            'teacher_id', teacher_id,
            'message', 'Teacher created successfully'
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.decrypt_data(encrypted_data text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    encryption_key TEXT;
BEGIN
    IF encrypted_data IS NULL OR encrypted_data = '' THEN
        RETURN NULL;
    END IF;

    encryption_key := get_encryption_key();

    -- Decrypt using AES
    RETURN extensions.pgp_sym_decrypt(
        decode(encrypted_data, 'base64'),
        encryption_key
    );
EXCEPTION
    WHEN OTHERS THEN
        -- If decryption fails, return NULL
        RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_data_in_date_range(p_start_date timestamp with time zone, p_end_date timestamp with time zone)
 RETURNS TABLE(deleted_count integer, table_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  responses_count INTEGER;
  feedback_count INTEGER;
  sessions_count INTEGER;
  courses_count INTEGER;
  semesters_count INTEGER;
  departments_count INTEGER;
  faculties_count INTEGER;
  universities_count INTEGER;
  users_count INTEGER;
  applications_count INTEGER;
  auth_users_count INTEGER;
BEGIN
  -- Delete from tables with foreign key dependencies first

  -- Responses
  DELETE FROM public.responses
  WHERE submission_time >= p_start_date AND submission_time <= p_end_date;
  GET DIAGNOSTICS responses_count = ROW_COUNT;

  -- Teacher feedback
  DELETE FROM public.teacher_feedback
  WHERE created_at >= p_start_date AND created_at <= p_end_date;
  GET DIAGNOSTICS feedback_count = ROW_COUNT;

  -- Response sessions
  DELETE FROM public.response_sessions
  WHERE created_at >= p_start_date AND created_at <= p_end_date;
  GET DIAGNOSTICS sessions_count = ROW_COUNT;

  -- Courses
  DELETE FROM public.courses
  WHERE created_at >= p_start_date AND created_at <= p_end_date;
  GET DIAGNOSTICS courses_count = ROW_COUNT;

  -- Semesters
  DELETE FROM public.semesters
  WHERE created_at >= p_start_date AND created_at <= p_end_date;
  GET DIAGNOSTICS semesters_count = ROW_COUNT;

  -- Departments
  DELETE FROM public.departments
  WHERE created_at >= p_start_date AND created_at <= p_end_date;
  GET DIAGNOSTICS departments_count = ROW_COUNT;

  -- Faculties
  DELETE FROM public.faculties
  WHERE created_at >= p_start_date AND created_at <= p_end_date;
  GET DIAGNOSTICS faculties_count = ROW_COUNT;

  -- Universities
  DELETE FROM public.universities
  WHERE created_at >= p_start_date AND created_at <= p_end_date;
  GET DIAGNOSTICS universities_count = ROW_COUNT;

  -- University applications
  DELETE FROM public.university_applications
  WHERE created_at >= p_start_date AND created_at <= p_end_date;
  GET DIAGNOSTICS applications_count = ROW_COUNT;

  -- Users from public.users (protect super admins)
  -- Note: Users with auth_user_id should be deleted from auth.users instead
  -- This handles legacy users without auth_user_id
  DELETE FROM public.users
  WHERE created_at >= p_start_date
    AND created_at <= p_end_date
    AND role != 'super_admin'
    AND auth_user_id IS NULL;
  GET DIAGNOSTICS users_count = ROW_COUNT;

  -- Delete auth users (which will cascade to public.users due to foreign key)
  -- This only works if we have service_role permissions
  -- For now, we'll just count them but not delete (requires admin API)
  SELECT COUNT(*) INTO auth_users_count
  FROM auth.users au
  WHERE au.created_at >= p_start_date
    AND au.created_at <= p_end_date
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.auth_user_id = au.id
      AND u.role != 'super_admin'
    );

  -- Return results
  RETURN QUERY VALUES
    (responses_count, 'responses'::TEXT),
    (feedback_count, 'teacher_feedback'::TEXT),
    (sessions_count, 'response_sessions'::TEXT),
    (courses_count, 'courses'::TEXT),
    (semesters_count, 'semesters'::TEXT),
    (departments_count, 'departments'::TEXT),
    (faculties_count, 'faculties'::TEXT),
    (universities_count, 'universities'::TEXT),
    (users_count, 'users (legacy)'::TEXT),
    (applications_count, 'university_applications'::TEXT),
    (auth_users_count, 'auth_users (requires manual deletion)'::TEXT);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_template_with_cleanup(p_template_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    template_record RECORD;
    question_record RECORD;
    question_usage_count INTEGER;
BEGIN
    -- Get template details
    SELECT * INTO template_record
    FROM question_templates
    WHERE id = p_template_id;

    -- Verify template exists and is not default
    IF template_record IS NULL THEN
        RAISE EXCEPTION 'Template with ID % not found', p_template_id;
    END IF;

    IF template_record.is_default = true THEN
        RAISE EXCEPTION 'Cannot delete default template with ID %', p_template_id;
    END IF;

    -- For each question in this template, check if it's only used by this template
    FOR question_record IN
        SELECT DISTINCT tq.question_id, q.university_id, q.is_default
        FROM template_questions tq
        JOIN questions q ON q.id = tq.question_id
        WHERE tq.template_id = p_template_id
    LOOP
        -- Only cleanup university-specific questions (not default questions)
        IF question_record.is_default = false AND question_record.university_id IS NOT NULL THEN
            -- Check how many templates use this question
            SELECT COUNT(*) INTO question_usage_count
            FROM template_questions tq
            JOIN question_templates qt ON qt.id = tq.template_id
            WHERE tq.question_id = question_record.question_id
            AND qt.university_id = question_record.university_id
            AND qt.is_active = true;

            -- If this is the only template using this university-specific question, delete it
            IF question_usage_count <= 1 THEN
                DELETE FROM questions WHERE id = question_record.question_id;
                RAISE NOTICE 'Deleted orphaned university question: %', question_record.question_id;
            END IF;
        END IF;
    END LOOP;

    -- Delete template (cascade will handle template_questions)
    DELETE FROM question_templates WHERE id = p_template_id;

    RAISE NOTICE 'Template deleted successfully with proper cleanup';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.encrypt_data(data text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    encryption_key TEXT;
BEGIN
    IF data IS NULL OR data = '' THEN
        RETURN NULL;
    END IF;

    encryption_key := get_encryption_key();

    -- Use AES encryption with the master key
    RETURN encode(
        extensions.pgp_sym_encrypt(data, encryption_key),
        'base64'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.encrypt_university_data()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Encrypt sensitive fields when data is inserted or updated
    IF NEW.name IS NOT NULL AND NEW.name != '' THEN
        NEW.name_encrypted := encrypt_data(NEW.name);
    END IF;

    IF NEW.code IS NOT NULL AND NEW.code != '' THEN
        NEW.code_encrypted := encrypt_data(NEW.code);
        NEW.code_hash := hash_university_code(NEW.code);
    END IF;

    IF NEW.email IS NOT NULL AND NEW.email != '' THEN
        NEW.email_encrypted := encrypt_data(NEW.email);
    END IF;

    IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
        NEW.phone_encrypted := encrypt_data(NEW.phone);
    END IF;

    IF NEW.address IS NOT NULL AND NEW.address != '' THEN
        NEW.address_encrypted := encrypt_data(NEW.address);
    END IF;

    NEW.is_encrypted := true;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.ensure_unique_anonymous_key()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_key VARCHAR;
    key_exists BOOLEAN;
BEGIN
    -- Generate unique anonymous key if not provided
    IF NEW.anonymous_key IS NULL OR NEW.anonymous_key = '' THEN
        LOOP
            new_key := generate_anonymous_key(8);
            SELECT EXISTS(SELECT 1 FROM response_sessions WHERE anonymous_key = new_key) INTO key_exists;
            EXIT WHEN NOT key_exists;
        END LOOP;
        NEW.anonymous_key := new_key;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_and_send_new_password(p_email text, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
 RETURNS TABLE(success boolean, message text, new_password text, user_name text, user_role text, email_sent boolean, email_log_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_user RECORD;
    v_new_password TEXT;
    v_new_password_hash TEXT;
    v_email_log_id UUID DEFAULT NULL;
    v_recent_attempts INTEGER;
    v_blocked_until TIMESTAMPTZ;
BEGIN
    -- Validate input
    IF p_email IS NULL OR LENGTH(TRIM(p_email)) = 0 THEN
        success := FALSE;
        message := 'Email is required';
        new_password := NULL;
        user_name := NULL;
        user_role := NULL;
        email_sent := FALSE;
        email_log_id := NULL;
        RETURN NEXT;
        RETURN;
    END IF;

    -- Normalize email
    p_email := LOWER(TRIM(p_email));

    -- Check for rate limiting (max 3 attempts per hour per email)
    SELECT COUNT(*), MAX(blocked_until)
    INTO v_recent_attempts, v_blocked_until
    FROM password_reset_attempts 
    WHERE email = p_email 
      AND attempted_at > NOW() - INTERVAL '1 hour';

    -- Check if currently blocked
    IF v_blocked_until IS NOT NULL AND v_blocked_until > NOW() THEN
        INSERT INTO password_reset_attempts (
            email, ip_address, user_agent, success, failure_reason, attempted_at
        ) VALUES (
            p_email, p_ip_address, p_user_agent, FALSE, 'Rate limited - blocked', NOW()
        );
        success := FALSE;
        message := 'Too many attempts. Please try again later.';
        new_password := NULL;
        user_name := NULL;
        user_role := NULL;
        email_sent := FALSE;
        email_log_id := NULL;
        RETURN NEXT;
        RETURN;
    END IF;

    -- Apply rate limiting
    IF v_recent_attempts >= 3 THEN
        -- Block for 1 hour
        v_blocked_until := NOW() + INTERVAL '1 hour';
        INSERT INTO password_reset_attempts (
            email, ip_address, user_agent, success, failure_reason, 
            attempted_at, attempts_count, blocked_until
        ) VALUES (
            p_email, p_ip_address, p_user_agent, FALSE, 'Rate limit exceeded', 
            NOW(), v_recent_attempts + 1, v_blocked_until
        );
        success := FALSE;
        message := 'Too many attempts. Please try again in 1 hour.';
        new_password := NULL;
        user_name := NULL;
        user_role := NULL;
        email_sent := FALSE;
        email_log_id := NULL;
        RETURN NEXT;
        RETURN;
    END IF;

    -- Find user by email
    SELECT id, email, name, role, status
    INTO v_user
    FROM users
    WHERE email = p_email;

    IF NOT FOUND THEN
        -- Log failed attempt (don't reveal if email exists)
        INSERT INTO password_reset_attempts (
            email, ip_address, user_agent, success, failure_reason, attempted_at
        ) VALUES (
            p_email, p_ip_address, p_user_agent, FALSE, 'Email not found', NOW()
        );
        -- Return success message for security (don't reveal if email exists)
        success := TRUE;
        message := 'If the email exists in our system, you will receive a new password.';
        new_password := NULL;
        user_name := NULL;
        user_role := NULL;
        email_sent := FALSE;
        email_log_id := NULL;
        RETURN NEXT;
        RETURN;
    END IF;

    -- Check if user is active
    IF v_user.status != 'active' THEN
        INSERT INTO password_reset_attempts (
            email, ip_address, user_agent, success, failure_reason, attempted_at
        ) VALUES (
            p_email, p_ip_address, p_user_agent, FALSE, 'User inactive', NOW()
        );
        success := FALSE;
        message := 'Account is not active. Please contact support.';
        new_password := NULL;
        user_name := NULL;
        user_role := NULL;
        email_sent := FALSE;
        email_log_id := NULL;
        RETURN NEXT;
        RETURN;
    END IF;

    -- Generate secure new password (12 characters with mixed case, numbers, symbols)
    v_new_password := 
        substr('abcdefghijklmnopqrstuvwxyz', floor(random() * 26 + 1)::int, 1) ||
        substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ', floor(random() * 26 + 1)::int, 1) ||
        substr('0123456789', floor(random() * 10 + 1)::int, 1) ||
        substr('!@#$%^&*()', floor(random() * 10 + 1)::int, 1) ||
        array_to_string(ARRAY(
            SELECT substr('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()', 
                        floor(random() * 69 + 1)::int, 1)
            FROM generate_series(1, 8)
        ), '');

    -- Hash the new password
    v_new_password_hash := crypt(v_new_password, gen_salt('bf', 12));

    -- Update user password
    UPDATE users 
    SET 
        password_hash = v_new_password_hash,
        password_change_required = TRUE,
        last_password_change = NOW(),
        updated_at = NOW()
    WHERE id = v_user.id;

    -- Log successful attempt
    INSERT INTO password_reset_attempts (
        email, ip_address, user_agent, success, attempted_at
    ) VALUES (
        p_email, p_ip_address, p_user_agent, TRUE, NOW()
    );

    -- Log activity
    INSERT INTO activity_logs (
        user_id, action_type, resource_type, resource_id,
        details, ip_address, user_agent
    ) VALUES (
        v_user.id, 'password_reset_completed', 'user', v_user.id,
        jsonb_build_object(
            'email', p_email,
            'method', 'new_password_generated',
            'ip_address', COALESCE(p_ip_address, 'Unknown')
        ),
        p_ip_address, p_user_agent
    );

    -- Optionally create email log entry
    BEGIN
        INSERT INTO email_logs (
            recipient_email, subject, template_name,
            template_data, status
        ) VALUES (
            p_email, 'New Password Generated',
            'new_password',
            jsonb_build_object(
                'user_name', v_user.name,
                'new_password', v_new_password
            ),
            'pending'
        ) RETURNING id INTO v_email_log_id;
    EXCEPTION 
        WHEN undefined_table THEN
            v_email_log_id := NULL;
    END;

    success := TRUE;
    message := 'New password generated and sent successfully';
    new_password := v_new_password;
    user_name := v_user.name;
    user_role := v_user.role;
    email_sent := (v_email_log_id IS NOT NULL);
    email_log_id := v_email_log_id;
    RETURN NEXT;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_anonymous_key(length integer DEFAULT 8)
 RETURNS character varying
 LANGUAGE plpgsql
AS $function$
DECLARE
    chars VARCHAR := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_active_templates_for_university(p_university_id uuid)
 RETURNS TABLE(template_id uuid, template_name character varying, template_description text, is_default boolean, question_count bigint, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        qt.id as template_id,
        qt.name as template_name,
        qt.description as template_description,
        qt.is_default,
        COUNT(tq.question_id) as question_count,
        qt.created_at
    FROM question_templates qt
    LEFT JOIN template_questions tq ON tq.template_id = qt.id
    WHERE qt.is_active = true
    AND (qt.university_id = p_university_id OR qt.is_default = true)
    GROUP BY qt.id, qt.name, qt.description, qt.is_default, qt.created_at
    ORDER BY qt.is_default DESC, qt.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_public_universities()
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    universities_data JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', id,
            'name', name,
            'code', code,
            'city', city,
            'state', state,
            'country', country,
            'logo_path', logo_path,
            'website', website
        )
    ) INTO universities_data
    FROM universities 
    WHERE status = 'active'
    ORDER BY name;
    
    RETURN json_build_object(
        'success', true,
        'universities', COALESCE(universities_data, '[]'::json)
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Failed to get universities: ' || SQLERRM
        );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_department_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT department_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_faculty_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT faculty_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT role FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_university_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT university_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1;
$function$
;

-- Encryption function removed as encryption_keys table no longer exists
-- CREATE OR REPLACE FUNCTION public.get_encryption_key()
--  RETURNS text
--  LANGUAGE plpgsql
--  SECURITY DEFINER
-- AS $function$
-- BEGIN
--     RETURN (SELECT key_value FROM encryption_keys WHERE key_name = 'university_master_key');
-- END;
-- $function$
-- ;

CREATE OR REPLACE FUNCTION public.get_excel_backup_data(admin_id uuid)
 RETURNS TABLE(sheet_name text, data jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Verify admin permissions
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = admin_id 
        AND role = 'super_admin' 
        AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Access denied. Super admin privileges required.';
    END IF;
    
    -- Users sheet
    RETURN QUERY
    SELECT 
        'Users'::TEXT as sheet_name,
        jsonb_agg(
            jsonb_build_object(
                'ID', u.id,
                'Email', u.email,
                'Role', u.role,
                'Name', u.name,
                'Initial', u.initial,
                'Phone', u.phone,
                'Status', u.status,
                'Approval Status', u.approval_status,
                'Created At', u.created_at,
                'University', uni.name
            )
        ) as data
    FROM users u
    LEFT JOIN universities uni ON u.university_id = uni.id;
    
    -- Universities sheet
    RETURN QUERY
    SELECT 
        'Universities'::TEXT as sheet_name,
        jsonb_agg(
            jsonb_build_object(
                'ID', uni.id,
                'Name', uni.name,
                'Code', uni.code,
                'Website', uni.website,
                'Address', uni.address,
                'City', uni.city,
                'State', uni.state,
                'Country', uni.country,
                'Email', uni.email,
                'Phone', uni.phone,
                'Status', uni.status,
                'Created At', uni.created_at
            )
        ) as data
    FROM universities uni;
    
    -- Courses sheet
    RETURN QUERY
    SELECT 
        'Courses'::TEXT as sheet_name,
        jsonb_agg(
            jsonb_build_object(
                'ID', c.id,
                'Course Code', c.course_code,
                'Course Title', c.course_title,
                'Credit Hours', c.credit_hours,
                'Sections', c.sections,
                'Status', c.status,
                'Department', d.name,
                'Faculty', f.name,
                'University', u.name,
                'Teacher', usr.name,
                'Created At', c.created_at
            )
        ) as data
    FROM courses c
    LEFT JOIN departments d ON c.department_id = d.id
    LEFT JOIN faculties f ON d.faculty_id = f.id
    LEFT JOIN universities u ON f.university_id = u.id
    LEFT JOIN users usr ON c.teacher_id = usr.id;
    
    -- Responses summary sheet
    RETURN QUERY
    SELECT 
        'Response_Summary'::TEXT as sheet_name,
        jsonb_agg(
            jsonb_build_object(
                'ID', r.id,
                'Session ID', rs.id,
                'Course', c.course_title,
                'Course Code', c.course_code,
                'University', u.name,
                'Student Anonymous ID', r.student_anonymous_id,
                'Status', r.status,
                'Submission Time', r.submission_time,
                'Response Data Keys', (
                    SELECT array_agg(key) 
                    FROM jsonb_object_keys(r.response_data) key
                )
            )
        ) as data
    FROM responses r
    LEFT JOIN response_sessions rs ON r.session_id = rs.id
    LEFT JOIN courses c ON r.course_id = c.id
    LEFT JOIN departments d ON c.department_id = d.id
    LEFT JOIN faculties f ON d.faculty_id = f.id
    LEFT JOIN universities u ON r.university_id = u.id;
    
    -- System Configuration sheet
    RETURN QUERY
    SELECT 
        'System_Config'::TEXT as sheet_name,
        jsonb_agg(
            jsonb_build_object(
                'Key', sc.key,
                'Value', sc.value,
                'Description', sc.description,
                'Updated At', sc.updated_at,
                'Updated By', users_upd.email
            )
        ) as data
    FROM system_config sc
    LEFT JOIN users users_upd ON sc.updated_by = users_upd.id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_growth_trends()
 RETURNS TABLE(metric_name text, current_value bigint, previous_value bigint, growth_percentage numeric, trend_direction text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_month_start TIMESTAMPTZ := date_trunc('month', CURRENT_DATE);
  current_month_end TIMESTAMPTZ := CURRENT_TIMESTAMP;
  previous_month_start TIMESTAMPTZ := date_trunc('month', CURRENT_DATE - INTERVAL '1 month');
  previous_month_end TIMESTAMPTZ := date_trunc('month', CURRENT_DATE);
BEGIN
  RETURN QUERY
  -- Users growth
  SELECT
    'Total Users'::TEXT,
    (SELECT COUNT(*)::BIGINT FROM public.users WHERE created_at >= current_month_start AND created_at < current_month_end),
    (SELECT COUNT(*)::BIGINT FROM public.users WHERE created_at >= previous_month_start AND created_at < previous_month_end),
    CASE
      WHEN (SELECT COUNT(*) FROM public.users WHERE created_at >= previous_month_start AND created_at < previous_month_end) > 0 THEN
        ROUND(
          ((SELECT COUNT(*)::NUMERIC FROM public.users WHERE created_at >= current_month_start AND created_at < current_month_end) -
           (SELECT COUNT(*)::NUMERIC FROM public.users WHERE created_at >= previous_month_start AND created_at < previous_month_end)) /
          NULLIF((SELECT COUNT(*)::NUMERIC FROM public.users WHERE created_at >= previous_month_start AND created_at < previous_month_end), 0) * 100,
          2
        )
      ELSE 0
    END,
    CASE
      WHEN (SELECT COUNT(*) FROM public.users WHERE created_at >= current_month_start) >
           (SELECT COUNT(*) FROM public.users WHERE created_at >= previous_month_start AND created_at < previous_month_end)
      THEN 'up'::TEXT
      ELSE 'down'::TEXT
    END

  UNION ALL

  -- Sessions growth
  SELECT
    'Active Sessions'::TEXT,
    (SELECT COUNT(*)::BIGINT FROM public.response_sessions WHERE created_at >= current_month_start AND created_at < current_month_end),
    (SELECT COUNT(*)::BIGINT FROM public.response_sessions WHERE created_at >= previous_month_start AND created_at < previous_month_end),
    CASE
      WHEN (SELECT COUNT(*) FROM public.response_sessions WHERE created_at >= previous_month_start AND created_at < previous_month_end) > 0 THEN
        ROUND(
          ((SELECT COUNT(*)::NUMERIC FROM public.response_sessions WHERE created_at >= current_month_start AND created_at < current_month_end) -
           (SELECT COUNT(*)::NUMERIC FROM public.response_sessions WHERE created_at >= previous_month_start AND created_at < previous_month_end)) /
          NULLIF((SELECT COUNT(*)::NUMERIC FROM public.response_sessions WHERE created_at >= previous_month_start AND created_at < previous_month_end), 0) * 100,
          2
        )
      ELSE 0
    END,
    CASE
      WHEN (SELECT COUNT(*) FROM public.response_sessions WHERE created_at >= current_month_start) >
           (SELECT COUNT(*) FROM public.response_sessions WHERE created_at >= previous_month_start AND created_at < previous_month_end)
      THEN 'up'::TEXT
      ELSE 'down'::TEXT
    END

  UNION ALL

  -- Responses growth
  SELECT
    'Total Responses'::TEXT,
    (SELECT COUNT(*)::BIGINT FROM public.responses WHERE submission_time >= current_month_start AND submission_time < current_month_end),
    (SELECT COUNT(*)::BIGINT FROM public.responses WHERE submission_time >= previous_month_start AND submission_time < previous_month_end),
    CASE
      WHEN (SELECT COUNT(*) FROM public.responses WHERE submission_time >= previous_month_start AND submission_time < previous_month_end) > 0 THEN
        ROUND(
          ((SELECT COUNT(*)::NUMERIC FROM public.responses WHERE submission_time >= current_month_start AND submission_time < current_month_end) -
           (SELECT COUNT(*)::NUMERIC FROM public.responses WHERE submission_time >= previous_month_start AND submission_time < previous_month_end)) /
          NULLIF((SELECT COUNT(*)::NUMERIC FROM public.responses WHERE submission_time >= previous_month_start AND submission_time < previous_month_end), 0) * 100,
          2
        )
      ELSE 0
    END,
    CASE
      WHEN (SELECT COUNT(*) FROM public.responses WHERE submission_time >= current_month_start) >
           (SELECT COUNT(*) FROM public.responses WHERE submission_time >= previous_month_start AND submission_time < previous_month_end)
      THEN 'up'::TEXT
      ELSE 'down'::TEXT
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_monthly_billing_report(p_year integer DEFAULT NULL::integer, p_month integer DEFAULT NULL::integer)
 RETURNS TABLE(university_id uuid, university_name character varying, billing_month text, sessions_created bigint, responses_collected bigint, unique_active_teachers bigint, unique_active_students bigint, total_usage_score numeric, estimated_cost numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  target_year INTEGER;
  target_month INTEGER;
  period_start TIMESTAMPTZ;
  period_end TIMESTAMPTZ;
BEGIN
  -- Default to current month if not provided
  target_year := COALESCE(p_year, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);
  target_month := COALESCE(p_month, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER);

  period_start := make_date(target_year, target_month, 1);
  period_end := period_start + INTERVAL '1 month';

  RETURN QUERY
  SELECT
    u.id as university_id,
    u.name as university_name,
    TO_CHAR(period_start, 'YYYY-MM') as billing_month,

    COUNT(DISTINCT rs.id)::BIGINT as sessions_created,
    COUNT(DISTINCT r.id)::BIGINT as responses_collected,
    COUNT(DISTINCT rs.teacher_id)::BIGINT as unique_active_teachers,
    COUNT(DISTINCT r.student_anonymous_id)::BIGINT as unique_active_students,

    -- Usage score: weighted combination of metrics
    -- Formula: (sessions * 10) + (responses * 1) + (teachers * 5)
    -- Note: Students are tracked for engagement but NOT included in pricing
    (
      (COUNT(DISTINCT rs.id) * 10) +
      (COUNT(DISTINCT r.id) * 1) +
      (COUNT(DISTINCT rs.teacher_id) * 5)
    )::NUMERIC as total_usage_score,

    -- Estimated cost (pricing model)
    -- $5 per session + $0.10 per response + $2 per active teacher
    -- Students are NOT charged
    (
      (COUNT(DISTINCT rs.id) * 5.00) +
      (COUNT(DISTINCT r.id) * 0.10) +
      (COUNT(DISTINCT rs.teacher_id) * 2.00)
    )::NUMERIC as estimated_cost

  FROM public.universities u
  LEFT JOIN public.response_sessions rs
    ON u.id = rs.university_id
    AND rs.created_at >= period_start
    AND rs.created_at < period_end
  LEFT JOIN public.responses r
    ON rs.id = r.session_id
    AND r.submission_time >= period_start
    AND r.submission_time < period_end
  WHERE u.status = 'active'
  GROUP BY u.id, u.name, period_start
  ORDER BY estimated_cost DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_overall_system_metrics()
 RETURNS TABLE(total_universities bigint, total_users bigint, total_sessions bigint, total_responses bigint, total_faculties bigint, total_departments bigint, total_courses bigint, active_sessions_today bigint, responses_today bigint, overall_response_rate numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::BIGINT FROM public.universities WHERE status = 'active'),
    (SELECT COUNT(*)::BIGINT FROM public.users WHERE status = 'active' AND approval_status = 'approved'),
    (SELECT COUNT(*)::BIGINT FROM public.response_sessions),
    (SELECT COUNT(*)::BIGINT FROM public.responses),
    (SELECT COUNT(*)::BIGINT FROM public.faculties WHERE status = 'active'),
    (SELECT COUNT(*)::BIGINT FROM public.departments WHERE status = 'active'),
    (SELECT COUNT(*)::BIGINT FROM public.courses WHERE status = 'active'),
    (SELECT COUNT(*)::BIGINT FROM public.response_sessions WHERE session_date = CURRENT_DATE),
    (SELECT COUNT(*)::BIGINT FROM public.responses WHERE DATE(submission_time) = CURRENT_DATE),
    CASE
      WHEN (SELECT COUNT(*) FROM public.response_sessions) > 0 THEN
        ROUND(
          (SELECT COUNT(*)::NUMERIC FROM public.responses) /
          NULLIF((SELECT SUM((stats->>'target_responses')::INTEGER)::NUMERIC FROM public.response_sessions), 0) * 100,
          2
        )
      ELSE 0
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_password_change_history(p_user_id uuid, p_limit integer DEFAULT 10)
 RETURNS TABLE(change_date timestamp with time zone, ip_address text, user_agent text, method text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        al.created_at as change_date,
        al.ip_address,
        al.user_agent,
        (al.details->>'method')::TEXT as method
    FROM activity_logs al
    WHERE al.user_id = p_user_id
      AND al.action_type = 'password_change'
      AND al.resource_type = 'user'
    ORDER BY al.created_at DESC
    LIMIT p_limit;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_password_reset_attempts(p_limit integer DEFAULT 100, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, email text, ip_address text, success boolean, failure_reason text, attempted_at timestamp with time zone, attempts_count integer, blocked_until timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        pra.id,
        pra.email,
        pra.ip_address,
        pra.success,
        pra.failure_reason,
        pra.attempted_at,
        pra.attempts_count,
        pra.blocked_until
    FROM password_reset_attempts pra
    ORDER BY pra.attempted_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_public_university_info(p_university_code character varying)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    university_record RECORD;
    faculties_data JSON;
    departments_data JSON;
    teachers_data JSON;
BEGIN
    -- Get university basic info
    SELECT 
        id, name, code, address, city, state, country,
        email, phone, website, logo_path
    INTO university_record
    FROM universities 
    WHERE code = UPPER(p_university_code) 
    AND status = 'active';
    
    IF university_record.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'University not found'
        );
    END IF;
    
    -- Get faculties
    SELECT json_agg(
        json_build_object(
            'id', f.id,
            'name', f.name,
            'code', f.code,
            'dean_name', u.name
        )
    ) INTO faculties_data
    FROM faculties f
    LEFT JOIN users u ON u.id = f.dean_id
    WHERE f.university_id = university_record.id 
    AND f.status = 'active';
    
    -- Get departments with faculty info
    SELECT json_agg(
        json_build_object(
            'id', d.id,
            'name', d.name,
            'code', d.code,
            'faculty_name', f.name,
            'faculty_code', f.code,
            'head_name', u.name
        )
    ) INTO departments_data
    FROM departments d
    JOIN faculties f ON f.id = d.faculty_id
    LEFT JOIN users u ON u.id = d.head_id
    WHERE f.university_id = university_record.id 
    AND d.status = 'active'
    AND f.status = 'active';
    
    -- Get teachers with department and faculty info
    SELECT json_agg(
        json_build_object(
            'id', t.id,
            'name', u.name,
            'email', u.email,
            'phone', u.phone,
            'department_name', d.name,
            'faculty_name', f.name,
            'designation', t.designation,
            'employee_id', t.employee_id
        )
    ) INTO teachers_data
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    JOIN departments d ON d.id = t.department_id
    JOIN faculties f ON f.id = d.faculty_id
    WHERE f.university_id = university_record.id 
    AND t.status = 'active'
    AND u.status = 'active'
    AND d.status = 'active'
    AND f.status = 'active';
    
    RETURN json_build_object(
        'success', true,
        'university', json_build_object(
            'id', university_record.id,
            'name', university_record.name,
            'code', university_record.code,
            'address', university_record.address,
            'city', university_record.city,
            'state', university_record.state,
            'country', university_record.country,
            'email', university_record.email,
            'phone', university_record.phone,
            'website', university_record.website,
            'logo_path', university_record.logo_path,
            'faculties', COALESCE(faculties_data, '[]'::json),
            'departments', COALESCE(departments_data, '[]'::json),
            'teachers', COALESCE(teachers_data, '[]'::json)
        )
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Failed to get university info: ' || SQLERRM
        );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_sql_backup_data(admin_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    sql_dump TEXT := '';
    table_name TEXT;
    sql_statement TEXT;
BEGIN
    -- Verify admin permissions
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = admin_id 
        AND role = 'super_admin' 
        AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Access denied. Super admin privileges required.';
    END IF;
    
    -- Add header information
    sql_dump := sql_dump || '-- CRS Feedback System Database Backup' || E'\n';
    sql_dump := sql_dump || '-- Generated on: ' || NOW()::TEXT || E'\n';
    sql_dump := sql_dump || '-- Database: CRS Feedback System' || E'\n';
    sql_dump := sql_dump || E'\n';
    
    -- Add transaction wrapper
    sql_dump := sql_dump || 'BEGIN;' || E'\n' || E'\n';
    
    -- Note: In a real implementation, you would use pg_dump or similar tools
    -- For this example, we'll generate basic INSERT statements
    
    sql_dump := sql_dump || '-- System Configuration Data' || E'\n';
    sql_dump := sql_dump || 'TRUNCATE TABLE system_config CASCADE;' || E'\n';
    
    FOR sql_statement IN 
        SELECT 'INSERT INTO system_config (id, key, value, description, created_at, updated_at, updated_by) VALUES ' ||
               '(' || quote_literal(id::text) || ', ' ||
               quote_literal(key) || ', ' ||
               quote_literal(value::text) || ', ' ||
               quote_literal(description) || ', ' ||
               quote_literal(created_at::text) || ', ' ||
               quote_literal(updated_at::text) || ', ' ||
               COALESCE(quote_literal(updated_by::text), 'NULL') || ');'
        FROM system_config
    LOOP
        sql_dump := sql_dump || sql_statement || E'\n';
    END LOOP;
    
    sql_dump := sql_dump || E'\n' || '-- Universities Data' || E'\n';
    sql_dump := sql_dump || 'TRUNCATE TABLE universities CASCADE;' || E'\n';
    
    FOR sql_statement IN 
        SELECT 'INSERT INTO universities (id, name, code, website, address, city, state, country, email, phone, status, created_at, updated_at) VALUES ' ||
               '(' || quote_literal(id::text) || ', ' ||
               quote_literal(name) || ', ' ||
               quote_literal(code) || ', ' ||
               COALESCE(quote_literal(website), 'NULL') || ', ' ||
               COALESCE(quote_literal(address), 'NULL') || ', ' ||
               COALESCE(quote_literal(city), 'NULL') || ', ' ||
               COALESCE(quote_literal(state), 'NULL') || ', ' ||
               COALESCE(quote_literal(country), 'NULL') || ', ' ||
               COALESCE(quote_literal(email), 'NULL') || ', ' ||
               COALESCE(quote_literal(phone), 'NULL') || ', ' ||
               quote_literal(status) || ', ' ||
               quote_literal(created_at::text) || ', ' ||
               quote_literal(updated_at::text) || ');'
        FROM universities
    LOOP
        sql_dump := sql_dump || sql_statement || E'\n';
    END LOOP;
    
    -- Add commit
    sql_dump := sql_dump || E'\n' || 'COMMIT;' || E'\n';
    sql_dump := sql_dump || E'\n' || '-- Backup completed successfully' || E'\n';
    
    RETURN sql_dump;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_system_setting(setting_key text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    setting_value JSONB;
BEGIN
    -- Only super admins can access system settings
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'super_admin' 
        AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Access denied. Super admin privileges required.';
    END IF;
    
    SELECT value INTO setting_value
    FROM system_config
    WHERE key = setting_key;
    
    RETURN setting_value;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_template_with_questions(p_template_id uuid)
 RETURNS TABLE(template_id uuid, template_name character varying, template_description text, is_default boolean, usage_count integer, created_at timestamp with time zone, question_id uuid, question_text text, question_type character varying, question_category character varying, question_scale integer, question_options jsonb, question_required boolean, question_priority integer, question_is_active boolean, template_question_order integer, template_question_required boolean, template_custom_priority integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        qt.id as template_id,
        qt.name as template_name,
        qt.description as template_description,
        qt.is_default,
        qt.usage_count,
        qt.created_at,
        q.id as question_id,
        q.text as question_text,
        q.type as question_type,
        q.category as question_category,
        q.scale as question_scale,
        q.options as question_options,
        q.required as question_required,
        q.priority as question_priority,
        q.is_active as question_is_active,
        tq.order_index as template_question_order,
        tq.is_required as template_question_required,
        tq.custom_priority as template_custom_priority
    FROM question_templates qt
    LEFT JOIN template_questions tq ON tq.template_id = qt.id
    LEFT JOIN questions q ON q.id = tq.question_id
    WHERE qt.id = p_template_id
    ORDER BY tq.order_index NULLS LAST;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_university_application_status(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    app_record RECORD;
BEGIN
    -- Get application details
    SELECT 
        ua.*,
        u.name as reviewer_name
    INTO app_record
    FROM university_applications ua
    LEFT JOIN users u ON u.id = ua.reviewed_by
    WHERE ua.user_id = p_user_id;
    
    IF app_record.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No application found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'application', json_build_object(
            'id', app_record.id,
            'university_name', app_record.university_name,
            'university_code', app_record.university_code,
            'application_status', app_record.application_status,
            'created_at', app_record.created_at,
            'review_date', app_record.review_date,
            'reviewer_name', app_record.reviewer_name,
            'rejection_reason', app_record.rejection_reason
        )
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_university_usage_metrics(p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(university_id uuid, university_name character varying, total_sessions bigint, total_responses bigint, active_teachers bigint, active_students bigint, response_rate numeric, avg_session_duration numeric, last_activity timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Default to current month if no dates provided
  IF p_start_date IS NULL THEN
    p_start_date := date_trunc('month', CURRENT_DATE);
  END IF;

  IF p_end_date IS NULL THEN
    p_end_date := CURRENT_TIMESTAMP;
  END IF;

  RETURN QUERY
  SELECT
    u.id as university_id,
    u.name as university_name,

    -- Total sessions created in period
    COALESCE(COUNT(DISTINCT rs.id), 0)::BIGINT as total_sessions,

    -- Total responses collected in period
    COALESCE(COUNT(DISTINCT r.id), 0)::BIGINT as total_responses,

    -- Active teachers (who created sessions in period)
    COALESCE(COUNT(DISTINCT rs.teacher_id), 0)::BIGINT as active_teachers,

    -- Active students (who submitted responses in period)
    COALESCE(COUNT(DISTINCT r.student_anonymous_id), 0)::BIGINT as active_students,

    -- Response rate (responses / sessions target)
    CASE
      WHEN COUNT(DISTINCT rs.id) > 0 THEN
        ROUND((COUNT(DISTINCT r.id)::NUMERIC / NULLIF(SUM((rs.stats->>'target_responses')::INTEGER), 0)) * 100, 2)
      ELSE 0
    END as response_rate,

    -- Average session duration
    COALESCE(AVG(rs.duration_minutes)::NUMERIC, 0) as avg_session_duration,

    -- Last activity timestamp
    GREATEST(
      MAX(rs.created_at),
      MAX(r.submission_time)
    ) as last_activity

  FROM public.universities u
  LEFT JOIN public.response_sessions rs
    ON u.id = rs.university_id
    AND rs.created_at BETWEEN p_start_date AND p_end_date
  LEFT JOIN public.responses r
    ON rs.id = r.session_id
    AND r.submission_time BETWEEN p_start_date AND p_end_date
  WHERE u.status = 'active'
  GROUP BY u.id, u.name
  ORDER BY total_responses DESC, total_sessions DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_users_by_role()
 RETURNS TABLE(role text, user_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    u.role::TEXT,
    COUNT(*)::BIGINT as user_count
  FROM public.users u
  WHERE u.status = 'active'
    AND u.approval_status = 'approved'
  GROUP BY u.role
  ORDER BY user_count DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_auth_user_deleted()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Delete corresponding user from public.users
  -- (CASCADE should handle this, but just to be safe)
  DELETE FROM public.users WHERE auth_user_id = OLD.id;

  RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_auth_user_updated()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Update email if changed
  IF NEW.email <> OLD.email THEN
    UPDATE public.users
    SET
      email = NEW.email,
      updated_at = NOW()
    WHERE auth_user_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
  user_name text;
  user_university_id uuid;
  user_faculty_id uuid;
  user_department_id uuid;
  user_phone text;
  user_initial text;
BEGIN
  -- Extract metadata from raw_user_meta_data
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

  -- Safely convert UUIDs (handle NULL or invalid values)
  BEGIN
    user_university_id := (NEW.raw_user_meta_data->>'university_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    user_university_id := NULL;
  END;

  BEGIN
    user_faculty_id := (NEW.raw_user_meta_data->>'faculty_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    user_faculty_id := NULL;
  END;

  BEGIN
    user_department_id := (NEW.raw_user_meta_data->>'department_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    user_department_id := NULL;
  END;

  user_phone := NEW.raw_user_meta_data->>'phone';
  user_initial := NEW.raw_user_meta_data->>'initial';

  -- Insert into public.users table
  -- SECURITY DEFINER allows this to bypass RLS
  INSERT INTO public.users (
    auth_user_id,
    email,
    name,
    role,
    status,
    approval_status,
    university_id,
    faculty_id,
    department_id,
    phone,
    initial,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role,
    CASE
      WHEN user_role = 'super_admin' THEN 'active'
      ELSE 'pending'
    END,
    CASE
      WHEN user_role = 'super_admin' THEN 'approved'
      ELSE 'pending'
    END,
    user_university_id,
    user_faculty_id,
    user_department_id,
    user_phone,
    user_initial,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (will appear in Postgres logs)
    RAISE WARNING 'Error creating user profile for %: %', NEW.email, SQLERRM;
    -- Re-raise the error to prevent user creation
    RAISE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.hash_password_on_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Only hash if password_hash is not already hashed (doesn't start with $2a$)
    IF NEW.password_hash IS NOT NULL AND NOT NEW.password_hash LIKE '$2a$%' THEN
        NEW.password_hash := crypt(NEW.password_hash, gen_salt('bf'));
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.hash_university_code(code text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    IF code IS NULL OR code = '' THEN
        RETURN NULL;
    END IF;

    -- Create a one-way hash (SHA-256) for uniqueness validation
    -- This allows checking if a code exists without revealing the actual code
    RETURN encode(extensions.digest(UPPER(code), 'sha256'), 'hex');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_template_usage(p_template_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE question_templates 
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = p_template_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template with ID % not found', p_template_id;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_default_questions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Clear existing default questions
    DELETE FROM questions WHERE is_default = true;
    
    -- Insert standard evaluation questions
    INSERT INTO questions (text, type, category, scale, required, priority, is_active, is_default, created_by) VALUES
    ('Rate the instructor''s knowledge of the subject matter', 'rating', 'instructor', 5, true, 1, true, true, NULL),
    ('How clearly did the instructor explain the course concepts?', 'rating', 'instructor', 5, true, 2, true, true, NULL),
    ('Rate the instructor''s teaching effectiveness', 'rating', 'instructor', 5, true, 3, true, true, NULL),
    ('How well was the course content organized?', 'rating', 'content', 5, true, 4, true, true, NULL),
    ('Were the course materials helpful and relevant?', 'rating', 'content', 5, true, 5, true, true, NULL),
    ('How appropriate was the course workload?', 'rating', 'content', 5, true, 6, true, true, NULL),
    ('Rate the effectiveness of the teaching methods used', 'rating', 'delivery', 5, true, 7, true, true, NULL),
    ('How engaging were the class sessions?', 'rating', 'delivery', 5, true, 8, true, true, NULL),
    ('Were assignments and projects helpful for learning?', 'rating', 'assessment', 5, true, 9, true, true, NULL),
    ('How fair and appropriate were the assessment methods?', 'rating', 'assessment', 5, true, 10, true, true, NULL),
    ('Overall, how satisfied are you with this course?', 'rating', 'overall', 5, true, 1, true, true, NULL),
    ('Would you recommend this course to other students?', 'yes_no', 'overall', NULL, true, 1, true, true, NULL),
    ('What did you like most about this course?', 'text', 'overall', NULL, false, 1, true, true, NULL),
    ('What suggestions do you have for improvement?', 'text', 'overall', NULL, false, 1, true, true, NULL),
    ('Additional comments or feedback', 'text', 'overall', NULL, false, 1, true, true, NULL);

    RAISE NOTICE 'Default questions inserted successfully';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_maintenance_mode()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    maintenance_enabled BOOLEAN := false;
BEGIN
    SELECT COALESCE((value->>'maintenance_mode')::boolean, false)
    INTO maintenance_enabled
    FROM system_config
    WHERE key = 'global_settings';
    
    RETURN maintenance_enabled;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.login(p_email character varying, p_password character varying, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    user_record RECORD;
    password_valid BOOLEAN;
    login_result JSON;
    app_status VARCHAR(20);
BEGIN
    -- Get user details
    SELECT * INTO user_record
    FROM users 
    WHERE email = p_email 
    AND status = 'active' 
    AND approval_status = 'approved';
    
    -- Check if user exists
    IF user_record.id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid email or password',
            'error_code', 'INVALID_CREDENTIALS'
        );
    END IF;
    
    -- Verify password
    password_valid := (user_record.password_hash = crypt(p_password, user_record.password_hash));
    
    IF NOT password_valid THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid email or password',
            'error_code', 'INVALID_CREDENTIALS'
        );
    END IF;
    
    -- Update login tracking
    UPDATE users 
    SET 
        last_login = NOW(),
        login_count = COALESCE(login_count, 0) + 1
    WHERE id = user_record.id;
    
    -- Log the login
    INSERT INTO audit_log (user_id, action, table_name, record_id, ip_address, user_agent)
    VALUES (user_record.id, 'LOGIN', 'users', user_record.id, p_ip_address, p_user_agent);
    
    -- Get application status for university admins
    IF user_record.role = 'university_admin' THEN
        SELECT application_status INTO app_status
        FROM university_applications
        WHERE user_id = user_record.id;
    END IF;
    
    -- Build success response
    login_result := json_build_object(
        'success', true,
        'user_id', user_record.id,
        'email', user_record.email,
        'name', user_record.name,
        'role', user_record.role,
        'university_id', user_record.university_id,
        'faculty_id', user_record.faculty_id,
        'department_id', user_record.department_id,
        'password_change_required', COALESCE(user_record.password_change_required, false),
        'last_login', user_record.last_login,
        'message', 'Login successful'
    );
    
    -- Add application status for university admins
    IF user_record.role = 'university_admin' THEN
        login_result := jsonb_set(
            login_result::jsonb,
            '{application_status}',
            to_jsonb(COALESCE(app_status, 'unknown'))
        )::json;
        
        IF app_status = 'pending' THEN
            login_result := jsonb_set(
                login_result::jsonb,
                '{message}',
                '"Login successful - University application is pending approval"'::jsonb
            )::json;
        ELSIF app_status = 'rejected' THEN
            login_result := jsonb_set(
                login_result::jsonb,
                '{message}',
                '"Login successful - University application was rejected"'::jsonb
            )::json;
        END IF;
    END IF;
    
    -- Check if password change is required
    IF COALESCE(user_record.password_change_required, false) = true THEN
        login_result := jsonb_set(
            login_result::jsonb,
            '{password_change_required}',
            'true'::jsonb
        )::json;
        
        login_result := jsonb_set(
            login_result::jsonb,
            '{message}',
            ('"' || (login_result->>'message') || ' - Password change required"')::jsonb
        )::json;
    END IF;
    
    RETURN login_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Login failed: ' || SQLERRM,
            'error_code', 'LOGIN_ERROR'
        );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.register_university_admin(p_email character varying, p_password character varying, p_name character varying, p_phone character varying, p_university_name character varying, p_university_code character varying, p_university_address text DEFAULT NULL::text, p_university_city character varying DEFAULT NULL::character varying, p_university_state character varying DEFAULT NULL::character varying, p_university_country character varying DEFAULT NULL::character varying, p_university_postal_code character varying DEFAULT NULL::character varying, p_university_email character varying DEFAULT NULL::character varying, p_university_phone character varying DEFAULT NULL::character varying, p_university_website character varying DEFAULT NULL::character varying)
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
    
    -- Check if university code already exists
    IF EXISTS (SELECT 1 FROM university_applications WHERE university_code = UPPER(p_university_code)) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'University code already exists in applications'
        );
    END IF;
    
    IF EXISTS (SELECT 1 FROM universities WHERE code = UPPER(p_university_code)) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'University code already exists'
        );
    END IF;
    
    BEGIN
        -- Hash password
        password_hash := crypt(p_password, gen_salt('bf'));
        
        -- Create university admin user (active but without university assignment)
        -- Use the hashed password which starts with $2a$ to bypass the trigger
        INSERT INTO users (
            email, password_hash, role, name, phone, 
            status, approval_status
        )
        VALUES (
            p_email, password_hash, 'university_admin', p_name, p_phone,
            'active', 'approved'
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
$function$
;

CREATE OR REPLACE FUNCTION public.reject_university_application(p_super_admin_id uuid, p_application_id uuid, p_rejection_reason text)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Verify super admin
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_super_admin_id AND role = 'super_admin' AND status = 'active') THEN
        RETURN json_build_object('success', false, 'error', 'Super admin not found');
    END IF;
    
    -- Update application status
    UPDATE university_applications
    SET 
        application_status = 'rejected',
        reviewed_by = p_super_admin_id,
        review_date = NOW(),
        rejection_reason = p_rejection_reason
    WHERE id = p_application_id AND application_status = 'pending';
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'University application not found or already processed');
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'University application rejected'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.reorder_template_questions(p_template_id uuid, p_question_orders jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    question_order JSONB;
BEGIN
    -- Validate template exists
    IF NOT EXISTS (SELECT 1 FROM question_templates WHERE id = p_template_id) THEN
        RAISE EXCEPTION 'Template with ID % not found', p_template_id;
    END IF;
    
    -- Update order for each question
    FOR question_order IN SELECT * FROM jsonb_array_elements(p_question_orders)
    LOOP
        UPDATE template_questions 
        SET order_index = (question_order->>'order_index')::INTEGER
        WHERE template_id = p_template_id 
        AND question_id = (question_order->>'question_id')::UUID;
    END LOOP;
    
    RAISE NOTICE 'Template questions reordered successfully';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.require_password_change(p_user_id uuid, p_admin_id uuid, p_reason text DEFAULT 'Security requirement'::text)
 RETURNS TABLE(success boolean, message text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_user RECORD;
    v_admin RECORD;
BEGIN
    -- Validate admin permissions
    SELECT * INTO v_admin
    FROM users
    WHERE id = p_admin_id 
      AND role IN ('super_admin', 'university_admin', 'faculty_admin', 'department_admin')
      AND status = 'active';

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Insufficient permissions';
        RETURN;
    END IF;

    -- Get target user
    SELECT * INTO v_user
    FROM users
    WHERE id = p_user_id AND status = 'active';

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'User not found or inactive';
        RETURN;
    END IF;

    -- Update user to require password change
    UPDATE users 
    SET 
        password_change_required = TRUE,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Log the action
    INSERT INTO activity_logs (
        id, user_id, action_type, resource_type, resource_id, 
        details, created_at
    ) VALUES (
        gen_random_uuid(), p_admin_id, 'force_password_change', 'user', p_user_id,
        jsonb_build_object(
            'target_user_id', p_user_id,
            'target_user_email', v_user.email,
            'reason', p_reason,
            'timestamp', NOW()
        ),
        NOW()
    );

    RETURN QUERY SELECT TRUE, 'Password change requirement set successfully';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.reset_password_with_token(p_token text, p_new_password text, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
 RETURNS TABLE(success boolean, message text, email_sent boolean, email_log_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_token_record RECORD;
    v_user RECORD;
    v_new_password_hash TEXT;
    v_email_log_id UUID DEFAULT NULL;
BEGIN
    -- Validate inputs
    IF p_token IS NULL OR p_new_password IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Token and new password are required', FALSE, NULL::UUID;
        RETURN;
    END IF;

    -- Validate password strength
    IF LENGTH(p_new_password) < 8 THEN
        RETURN QUERY SELECT FALSE, 'Password must be at least 8 characters long', FALSE, NULL::UUID;
        RETURN;
    END IF;

    IF NOT (p_new_password ~ '[A-Z]' AND 
            p_new_password ~ '[a-z]' AND 
            p_new_password ~ '[0-9]' AND 
            p_new_password ~ '[^A-Za-z0-9]') THEN
        RETURN QUERY SELECT FALSE, 'Password must contain uppercase, lowercase, number, and special character', FALSE, NULL::UUID;
        RETURN;
    END IF;

    -- Validate token first
    SELECT prt.*, u.id as user_id, u.email, u.name, u.role, u.status, u.password_hash
    INTO v_token_record
    FROM password_reset_tokens prt
    JOIN users u ON prt.user_id = u.id
    WHERE prt.token = p_token
      AND prt.used_at IS NULL
    ORDER BY prt.created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Invalid or expired token', FALSE, NULL::UUID;
        RETURN;
    END IF;

    -- Check if token is expired
    IF v_token_record.expires_at < NOW() THEN
        -- Mark token as used
        UPDATE password_reset_tokens 
        SET used_at = NOW()
        WHERE token = p_token;
        
        RETURN QUERY SELECT FALSE, 'Token has expired', FALSE, NULL::UUID;
        RETURN;
    END IF;

    -- Check if user is still active
    IF v_token_record.status != 'active' THEN
        RETURN QUERY SELECT FALSE, 'User account is not active', FALSE, NULL::UUID;
        RETURN;
    END IF;

    -- Check if new password is same as current
    IF crypt(p_new_password, v_token_record.password_hash) = v_token_record.password_hash THEN
        RETURN QUERY SELECT FALSE, 'New password must be different from current password', FALSE, NULL::UUID;
        RETURN;
    END IF;

    -- Hash new password
    v_new_password_hash := crypt(p_new_password, gen_salt('bf', 12));

    -- Update user password
    UPDATE users 
    SET 
        password_hash = v_new_password_hash,
        password_change_required = FALSE,
        last_password_change = NOW(),
        updated_at = NOW()
    WHERE id = v_token_record.user_id;

    -- Mark token as used
    UPDATE password_reset_tokens 
    SET used_at = NOW()
    WHERE token = p_token;

    -- Log successful password reset
    INSERT INTO password_reset_attempts (
        email, ip_address, user_agent, success, attempted_at
    ) VALUES (
        v_token_record.email, p_ip_address, p_user_agent, TRUE, NOW()
    );

    -- Log activity
    INSERT INTO activity_logs (
        user_id, action_type, resource_type, resource_id,
        details, ip_address, user_agent
    ) VALUES (
        v_token_record.user_id, 'password_reset_completed', 'user', v_token_record.user_id,
        jsonb_build_object(
            'method', 'token_reset',
            'token_id', v_token_record.id,
            'ip_address', COALESCE(p_ip_address, 'Unknown')
        ),
        p_ip_address, p_user_agent
    );

    -- Send notification email
    BEGIN
        INSERT INTO email_logs (
            recipient_email, subject, template_name,
            template_data, status
        ) VALUES (
            v_token_record.email, 'Password Reset Successful',
            'password_reset_success',
            jsonb_build_object(
                'user_name', v_token_record.name,
                'reset_time', NOW(),
                'ip_address', COALESCE(p_ip_address, 'Unknown')
            ),
            'pending'
        ) RETURNING id INTO v_email_log_id;
    EXCEPTION 
        WHEN undefined_table THEN
            v_email_log_id := NULL;
    END;

    RETURN QUERY SELECT TRUE, 'Password reset successful', 
                        (v_email_log_id IS NOT NULL), v_email_log_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_check_university_code_exists(code_to_check text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN json_build_object(
        'exists', check_university_code_exists(code_to_check),
        'code', UPPER(code_to_check)
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_current_semester(p_university_admin_id uuid, p_semester_id uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    university_id UUID;
BEGIN
    -- Get university admin's university
    SELECT u.university_id INTO university_id
    FROM users u
    WHERE u.id = p_university_admin_id 
    AND u.role = 'university_admin' 
    AND u.status = 'active';
    
    IF university_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'University admin not found or not assigned to university');
    END IF;
    
    -- Verify semester belongs to this university
    IF NOT EXISTS (SELECT 1 FROM semesters WHERE id = p_semester_id AND university_id = university_id) THEN
        RETURN json_build_object('success', false, 'error', 'Semester not found in this university');
    END IF;
    
    BEGIN
        -- Unset all current semesters for this university
        UPDATE semesters SET is_current = false WHERE university_id = university_id;
        
        -- Set the specified semester as current
        UPDATE semesters SET is_current = true WHERE id = p_semester_id;
        
        RETURN json_build_object(
            'success', true,
            'message', 'Current semester updated successfully'
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object('success', false, 'error', SQLERRM);
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_template_active_status(p_template_id uuid, p_is_active boolean, p_university_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Verify template exists and belongs to university (if specified)
    IF p_university_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM question_templates
            WHERE id = p_template_id
            AND (university_id = p_university_id OR is_default = true)
        ) THEN
            RAISE EXCEPTION 'Template with ID % not found or not accessible to university', p_template_id;
        END IF;
    END IF;

    -- Update template status
    UPDATE question_templates
    SET is_active = p_is_active,
        updated_at = NOW()
    WHERE id = p_template_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template with ID % not found', p_template_id;
    END IF;

    RAISE NOTICE 'Template % set to active: %', p_template_id, p_is_active;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_university_logo(p_university_id uuid, p_logo_path character varying)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Update university logo path
    UPDATE universities 
    SET logo_path = p_logo_path,
        updated_at = NOW()
    WHERE id = p_university_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'University not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'University logo updated successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Failed to update logo: ' || SQLERRM
        );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_university_encrypted(p_id uuid DEFAULT NULL::uuid, p_name text DEFAULT NULL::text, p_code character varying DEFAULT NULL::character varying, p_address text DEFAULT NULL::text, p_city character varying DEFAULT NULL::character varying, p_state character varying DEFAULT NULL::character varying, p_country character varying DEFAULT NULL::character varying, p_postal_code character varying DEFAULT NULL::character varying, p_email character varying DEFAULT NULL::character varying, p_phone character varying DEFAULT NULL::character varying, p_website character varying DEFAULT NULL::character varying, p_settings jsonb DEFAULT NULL::jsonb, p_admin_id uuid DEFAULT NULL::uuid, p_created_by uuid DEFAULT NULL::uuid, p_status character varying DEFAULT 'active'::character varying)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_university_id UUID;
BEGIN
    IF p_id IS NULL THEN
        -- Insert new university
        INSERT INTO universities (
            name, code, address, city, state, country, postal_code,
            email, phone, website, settings, admin_id, created_by, status
        ) VALUES (
            p_name, p_code, p_address, p_city, p_state, p_country, p_postal_code,
            p_email, p_phone, p_website, p_settings, p_admin_id, p_created_by, p_status
        )
        RETURNING id INTO v_university_id;
    ELSE
        -- Update existing university
        UPDATE universities
        SET
            name = COALESCE(p_name, name),
            code = COALESCE(p_code, code),
            address = COALESCE(p_address, address),
            city = COALESCE(p_city, city),
            state = COALESCE(p_state, state),
            country = COALESCE(p_country, country),
            postal_code = COALESCE(p_postal_code, postal_code),
            email = COALESCE(p_email, email),
            phone = COALESCE(p_phone, phone),
            website = COALESCE(p_website, website),
            settings = COALESCE(p_settings, settings),
            admin_id = COALESCE(p_admin_id, admin_id),
            status = COALESCE(p_status, status),
            updated_at = NOW()
        WHERE id = p_id;

        v_university_id := p_id;
    END IF;

    RETURN v_university_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_password_reset_token(p_token text)
 RETURNS TABLE(success boolean, message text, user_id uuid, user_email text, user_name text, user_role text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_token_record RECORD;
    v_user RECORD;
BEGIN
    -- Validate input
    IF p_token IS NULL OR LENGTH(TRIM(p_token)) = 0 THEN
        RETURN QUERY SELECT FALSE, 'Token is required', NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT;
        RETURN;
    END IF;

    -- Find token
    SELECT prt.*, u.email, u.name, u.role, u.status
    INTO v_token_record
    FROM password_reset_tokens prt
    JOIN users u ON prt.user_id = u.id
    WHERE prt.token = p_token
      AND prt.used_at IS NULL
    ORDER BY prt.created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Invalid or expired token', NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT;
        RETURN;
    END IF;

    -- Check if token is expired
    IF v_token_record.expires_at < NOW() THEN
        -- Mark token as used to prevent reuse
        UPDATE password_reset_tokens 
        SET used_at = NOW()
        WHERE token = p_token;
        
        RETURN QUERY SELECT FALSE, 'Token has expired', NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT;
        RETURN;
    END IF;

    -- Check if user is still active
    IF v_token_record.status != 'active' THEN
        RETURN QUERY SELECT FALSE, 'User account is not active', NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT;
        RETURN;
    END IF;

    RETURN QUERY SELECT TRUE, 'Token is valid', 
                        v_token_record.user_id, v_token_record.email, 
                        v_token_record.name, v_token_record.role;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_user_hierarchy()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Validate role-based hierarchy constraints
    CASE NEW.role
        WHEN 'super_admin' THEN
            -- Super admin should not have university/faculty/department assignments
            IF NEW.university_id IS NOT NULL OR NEW.faculty_id IS NOT NULL OR NEW.department_id IS NOT NULL THEN
                RAISE EXCEPTION 'Super admin cannot be assigned to university, faculty, or department';
            END IF;
            
        WHEN 'university_admin' THEN
            -- University admin can exist without university assignment (for application flow)
            -- They will be assigned after approval
            IF NEW.faculty_id IS NOT NULL OR NEW.department_id IS NOT NULL THEN
                RAISE EXCEPTION 'University admin cannot be assigned to faculty or department';
            END IF;
            
        WHEN 'faculty_admin' THEN
            -- Faculty admin must have university and faculty but not department
            -- EXCEPTION: Pending faculty admins can be created without assignments
            IF NEW.approval_status = 'approved' AND (NEW.university_id IS NULL OR NEW.faculty_id IS NULL) THEN
                RAISE EXCEPTION 'Approved faculty admin must be assigned to university and faculty';
            END IF;
            IF NEW.department_id IS NOT NULL THEN
                RAISE EXCEPTION 'Faculty admin cannot be assigned to department';
            END IF;
            
        WHEN 'department_moderator' THEN
            -- Department moderator must have all three assignments
            -- EXCEPTION: Pending department moderators can be created without assignments
            IF NEW.approval_status = 'approved' AND (NEW.university_id IS NULL OR NEW.faculty_id IS NULL OR NEW.department_id IS NULL) THEN
                RAISE EXCEPTION 'Approved department moderator must be assigned to university, faculty, and department';
            END IF;
            
        WHEN 'teacher' THEN
            -- Teacher must have all three assignments and initial
            -- EXCEPTION: Pending teachers can be created without assignments
            IF NEW.approval_status = 'approved' AND (NEW.university_id IS NULL OR NEW.faculty_id IS NULL OR NEW.department_id IS NULL) THEN
                RAISE EXCEPTION 'Approved teacher must be assigned to university, faculty, and department';
            END IF;
            IF NEW.approval_status = 'approved' AND (NEW.initial IS NULL OR LENGTH(TRIM(NEW.initial)) = 0) THEN
                RAISE EXCEPTION 'Approved teacher must have an initial';
            END IF;
            
        WHEN 'student' THEN
            -- Students don't need assignments for anonymous responses
            NULL;
            
    END CASE;
    
    RETURN NEW;
END;
$function$
;


