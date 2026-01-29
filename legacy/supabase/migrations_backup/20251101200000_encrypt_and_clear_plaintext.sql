-- Step 1: Remove NOT NULL constraints from plain text columns
-- These columns will be NULL after encryption (data in encrypted columns instead)
ALTER TABLE public.universities
ALTER COLUMN name DROP NOT NULL,
ALTER COLUMN code DROP NOT NULL;

-- Step 2: Create or replace universities_decrypted view
-- This view reads from encrypted columns and decrypts them
DROP VIEW IF EXISTS public.universities_decrypted CASCADE;

CREATE VIEW public.universities_decrypted AS
SELECT
    id,
    COALESCE(decrypt_data(name_encrypted), name) as name,
    COALESCE(decrypt_data(code_encrypted), code) as code,
    COALESCE(decrypt_data(address_encrypted), address) as address,
    city,
    state,
    country,
    postal_code,
    COALESCE(decrypt_data(email_encrypted), email) as email,
    COALESCE(decrypt_data(phone_encrypted), phone) as phone,
    website,
    settings,
    stats,
    status,
    admin_id,
    created_by,
    created_at,
    updated_at,
    is_encrypted
FROM public.universities;

COMMENT ON VIEW public.universities_decrypted IS
'Decrypted view of universities table. Automatically decrypts encrypted columns. Use this view for all SELECT queries.';

-- Grant permissions on the view
GRANT SELECT ON public.universities_decrypted TO authenticated;
GRANT SELECT ON public.universities_decrypted TO service_role;

-- Now update the encryption trigger to CLEAR plain text after encrypting
-- This ensures sensitive data is only stored in encrypted columns

CREATE OR REPLACE FUNCTION public.encrypt_university_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Encrypt sensitive fields when data is inserted or updated
    -- AND clear the plain text columns for security

    IF NEW.name IS NOT NULL AND NEW.name != '' THEN
        NEW.name_encrypted := encrypt_data(NEW.name);
        NEW.name := NULL;  -- Clear plain text
    END IF;

    IF NEW.code IS NOT NULL AND NEW.code != '' THEN
        NEW.code_encrypted := encrypt_data(NEW.code);
        NEW.code_hash := hash_university_code(NEW.code);
        NEW.code := NULL;  -- Clear plain text
    END IF;

    IF NEW.email IS NOT NULL AND NEW.email != '' THEN
        NEW.email_encrypted := encrypt_data(NEW.email);
        NEW.email := NULL;  -- Clear plain text
    END IF;

    IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
        NEW.phone_encrypted := encrypt_data(NEW.phone);
        NEW.phone := NULL;  -- Clear plain text
    END IF;

    IF NEW.address IS NOT NULL AND NEW.address != '' THEN
        NEW.address_encrypted := encrypt_data(NEW.address);
        NEW.address := NULL;  -- Clear plain text
    END IF;

    NEW.is_encrypted := true;

    RETURN NEW;
END;
$function$;

-- Clear existing plain text data in universities table
-- Since encrypted versions already exist, we can safely NULL out the plain text
UPDATE public.universities
SET
    name = NULL,
    code = NULL,
    email = NULL,
    phone = NULL,
    address = NULL
WHERE is_encrypted = true
AND (name IS NOT NULL OR code IS NOT NULL OR email IS NOT NULL OR phone IS NOT NULL OR address IS NOT NULL);

COMMENT ON FUNCTION public.encrypt_university_data() IS
'Encrypts sensitive university data and clears plain text columns for security. Plain text is only kept in memory during the trigger execution.';

-- Log the changes
DO $$
DECLARE
    cleared_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO cleared_count
    FROM public.universities
    WHERE is_encrypted = true;

    RAISE NOTICE 'Plain text cleared for % universities. Data now only in encrypted columns.', cleared_count;
END $$;
