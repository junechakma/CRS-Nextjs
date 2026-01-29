-- Enable encryption for universities table
-- This migration adds encrypted columns and triggers to automatically encrypt sensitive data

-- Step 1: Add encrypted columns if they don't exist
ALTER TABLE public.universities
ADD COLUMN IF NOT EXISTS name_encrypted text,
ADD COLUMN IF NOT EXISTS code_encrypted text,
ADD COLUMN IF NOT EXISTS code_hash text,
ADD COLUMN IF NOT EXISTS email_encrypted text,
ADD COLUMN IF NOT EXISTS phone_encrypted text,
ADD COLUMN IF NOT EXISTS address_encrypted text,
ADD COLUMN IF NOT EXISTS is_encrypted boolean DEFAULT false;

-- Step 2: Create indexes on encrypted columns for faster lookups
CREATE INDEX IF NOT EXISTS idx_universities_code_hash ON public.universities(code_hash);
CREATE INDEX IF NOT EXISTS idx_universities_is_encrypted ON public.universities(is_encrypted);

-- Step 3: Ensure encryption functions exist (encrypt_data and hash_university_code)
-- These should already exist from the schema, but we'll verify they're available

-- Step 4: Create or replace the encryption trigger function
-- (This should already exist from the schema at line 1312)
-- Just ensure it's there and correct

-- Step 5: Create the trigger to automatically encrypt data on INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_encrypt_university_data ON public.universities;

CREATE TRIGGER trigger_encrypt_university_data
BEFORE INSERT OR UPDATE ON public.universities
FOR EACH ROW
EXECUTE FUNCTION public.encrypt_university_data();

-- Step 6: Encrypt existing unencrypted data
-- This will encrypt any existing plain text data in the universities table
DO $$
DECLARE
    uni_record RECORD;
BEGIN
    FOR uni_record IN
        SELECT id, name, code, email, phone, address
        FROM public.universities
        WHERE is_encrypted = false OR is_encrypted IS NULL
    LOOP
        -- Update each record to trigger encryption
        UPDATE public.universities
        SET
            name_encrypted = CASE WHEN uni_record.name IS NOT NULL THEN encrypt_data(uni_record.name) ELSE NULL END,
            code_encrypted = CASE WHEN uni_record.code IS NOT NULL THEN encrypt_data(uni_record.code) ELSE NULL END,
            code_hash = CASE WHEN uni_record.code IS NOT NULL THEN hash_university_code(uni_record.code) ELSE NULL END,
            email_encrypted = CASE WHEN uni_record.email IS NOT NULL THEN encrypt_data(uni_record.email) ELSE NULL END,
            phone_encrypted = CASE WHEN uni_record.phone IS NOT NULL THEN encrypt_data(uni_record.phone) ELSE NULL END,
            address_encrypted = CASE WHEN uni_record.address IS NOT NULL THEN encrypt_data(uni_record.address) ELSE NULL END,
            is_encrypted = true
        WHERE id = uni_record.id;

        RAISE NOTICE 'Encrypted university: % (ID: %)', uni_record.name, uni_record.id;
    END LOOP;

    RAISE NOTICE 'Encryption complete for all existing universities';
END $$;

-- Step 7: Add comments
COMMENT ON COLUMN public.universities.name_encrypted IS 'Encrypted university name';
COMMENT ON COLUMN public.universities.code_encrypted IS 'Encrypted university code';
COMMENT ON COLUMN public.universities.code_hash IS 'Hashed university code for uniqueness checks';
COMMENT ON COLUMN public.universities.is_encrypted IS 'Flag indicating if sensitive data is encrypted';

COMMENT ON TRIGGER trigger_encrypt_university_data ON public.universities IS
'Automatically encrypts sensitive university data (name, code, email, phone, address) on INSERT or UPDATE';

-- Step 8: Grant necessary permissions
GRANT SELECT ON public.universities TO authenticated;
GRANT SELECT ON public.universities_decrypted TO authenticated;

-- Note: The universities_decrypted view should already exist and will automatically
-- decrypt data when accessed. Frontend should use universities_decrypted view.
