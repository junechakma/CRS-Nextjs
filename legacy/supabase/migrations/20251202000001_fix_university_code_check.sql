-- Fix university code check to work without code_hash column
-- This allows the function to work on databases that don't have encryption enabled

CREATE OR REPLACE FUNCTION "public"."check_university_code_exists"("p_code" "text")
RETURNS boolean
LANGUAGE "plpgsql"
SECURITY DEFINER
AS $$
DECLARE
    code_exists BOOLEAN;
BEGIN
    IF p_code IS NULL OR p_code = '' THEN
        RETURN FALSE;
    END IF;

    -- Check if code exists in database using plain code column
    -- This works whether code_hash exists or not
    SELECT EXISTS(
        SELECT 1 FROM universities
        WHERE UPPER(code) = UPPER(p_code)
    ) INTO code_exists;

    RETURN code_exists;
END;
$$;

COMMENT ON FUNCTION "public"."check_university_code_exists"("p_code" "text") IS 'Checks if a university code exists using case-insensitive comparison';
