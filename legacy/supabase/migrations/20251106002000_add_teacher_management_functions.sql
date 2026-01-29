-- Add functions for university admins to manage teachers (update, delete, change status)

-- Function to update teacher by university admin
CREATE OR REPLACE FUNCTION public.update_teacher_by_admin(
    p_university_admin_id uuid,
    p_teacher_id uuid,
    p_teacher_name character varying DEFAULT NULL,
    p_teacher_email character varying DEFAULT NULL,
    p_teacher_initial character varying DEFAULT NULL,
    p_teacher_phone character varying DEFAULT NULL,
    p_department_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_university_id uuid;
    v_teacher_university_id uuid;
    v_faculty_id uuid;
BEGIN
    -- Verify the caller is a university admin
    SELECT university_id INTO v_university_id
    FROM users
    WHERE id = p_university_admin_id
    AND role = 'university_admin'
    AND status = 'active';

    IF v_university_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'University admin not found or not active'
        );
    END IF;

    -- Verify the teacher belongs to the same university
    SELECT university_id INTO v_teacher_university_id
    FROM users
    WHERE id = p_teacher_id
    AND role = 'teacher';

    IF v_teacher_university_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Teacher not found'
        );
    END IF;

    IF v_teacher_university_id != v_university_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Teacher does not belong to your university'
        );
    END IF;

    -- If department is being changed, get the faculty_id
    IF p_department_id IS NOT NULL THEN
        SELECT faculty_id INTO v_faculty_id
        FROM departments
        WHERE id = p_department_id
        AND university_id = v_university_id;

        IF v_faculty_id IS NULL THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Department not found in this university'
            );
        END IF;
    END IF;

    -- Update teacher with only provided fields
    UPDATE users
    SET
        name = COALESCE(p_teacher_name, name),
        email = COALESCE(p_teacher_email, email),
        initial = COALESCE(UPPER(p_teacher_initial), initial),
        phone = CASE WHEN p_teacher_phone IS NOT NULL THEN NULLIF(p_teacher_phone, '') ELSE phone END,
        department_id = COALESCE(p_department_id, department_id),
        faculty_id = COALESCE(v_faculty_id, faculty_id),
        updated_at = NOW()
    WHERE id = p_teacher_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Teacher updated successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Function to update teacher status (block/unblock)
CREATE OR REPLACE FUNCTION public.update_teacher_status_by_admin(
    p_university_admin_id uuid,
    p_teacher_id uuid,
    p_status character varying
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_university_id uuid;
    v_teacher_university_id uuid;
BEGIN
    -- Verify the caller is a university admin
    SELECT university_id INTO v_university_id
    FROM users
    WHERE id = p_university_admin_id
    AND role = 'university_admin'
    AND status = 'active';

    IF v_university_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'University admin not found or not active'
        );
    END IF;

    -- Verify the teacher belongs to the same university
    SELECT university_id INTO v_teacher_university_id
    FROM users
    WHERE id = p_teacher_id
    AND role = 'teacher';

    IF v_teacher_university_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Teacher not found'
        );
    END IF;

    IF v_teacher_university_id != v_university_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Teacher does not belong to your university'
        );
    END IF;

    -- Validate status
    IF p_status NOT IN ('active', 'blocked') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid status. Must be active or blocked'
        );
    END IF;

    -- Update teacher status
    UPDATE users
    SET
        status = p_status,
        updated_at = NOW()
    WHERE id = p_teacher_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Teacher status updated successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Function to delete teacher by university admin
CREATE OR REPLACE FUNCTION public.delete_teacher_by_admin(
    p_university_admin_id uuid,
    p_teacher_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_university_id uuid;
    v_teacher_university_id uuid;
BEGIN
    -- Verify the caller is a university admin
    SELECT university_id INTO v_university_id
    FROM users
    WHERE id = p_university_admin_id
    AND role = 'university_admin'
    AND status = 'active';

    IF v_university_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'University admin not found or not active'
        );
    END IF;

    -- Verify the teacher belongs to the same university
    SELECT university_id INTO v_teacher_university_id
    FROM users
    WHERE id = p_teacher_id
    AND role = 'teacher';

    IF v_teacher_university_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Teacher not found'
        );
    END IF;

    IF v_teacher_university_id != v_university_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Teacher does not belong to your university'
        );
    END IF;

    -- Delete teacher from database (cascade will handle related records)
    DELETE FROM users WHERE id = p_teacher_id;

    -- Note: Supabase Auth user should also be deleted via admin API in the service layer

    RETURN json_build_object(
        'success', true,
        'message', 'Teacher deleted successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_teacher_by_admin(uuid, uuid, character varying, character varying, character varying, character varying, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_teacher_status_by_admin(uuid, uuid, character varying) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_teacher_by_admin(uuid, uuid) TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.update_teacher_by_admin IS 'Updates teacher information - uses SECURITY DEFINER to bypass RLS';
COMMENT ON FUNCTION public.update_teacher_status_by_admin IS 'Updates teacher status (active/blocked) - uses SECURITY DEFINER to bypass RLS';
COMMENT ON FUNCTION public.delete_teacher_by_admin IS 'Deletes teacher - uses SECURITY DEFINER to bypass RLS';
