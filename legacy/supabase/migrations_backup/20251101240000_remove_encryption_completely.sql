-- Complete removal of encryption system from universities table
-- This migration:
-- 1. Drops the universities_decrypted view
-- 2. Drops the encryption trigger
-- 3. Drops encryption functions
-- 4. Removes encrypted columns from universities table
-- 5. Cleans up all encryption-related artifacts

-- Step 1: Drop the decrypted view
DROP VIEW IF EXISTS public.universities_decrypted CASCADE;

-- Step 2: Drop the encryption trigger
DROP TRIGGER IF EXISTS trigger_encrypt_university_data ON public.universities;

-- Step 3: Drop encryption functions
DROP FUNCTION IF EXISTS public.encrypt_university_data() CASCADE;
DROP FUNCTION IF EXISTS public.encrypt_data(text) CASCADE;
DROP FUNCTION IF EXISTS public.decrypt_data(bytea) CASCADE;
DROP FUNCTION IF EXISTS public.hash_university_code(text) CASCADE;

-- Step 4: Remove encrypted columns from universities table
ALTER TABLE public.universities
DROP COLUMN IF EXISTS name_encrypted,
DROP COLUMN IF EXISTS code_encrypted,
DROP COLUMN IF EXISTS email_encrypted,
DROP COLUMN IF EXISTS phone_encrypted,
DROP COLUMN IF EXISTS address_encrypted,
DROP COLUMN IF EXISTS code_hash,
DROP COLUMN IF EXISTS is_encrypted;

-- Step 5: Ensure plain text columns have proper constraints
ALTER TABLE public.universities
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN code SET NOT NULL;

-- Step 6: Add indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_universities_code ON public.universities(code);
CREATE INDEX IF NOT EXISTS idx_universities_admin_id ON public.universities(admin_id);
CREATE INDEX IF NOT EXISTS idx_universities_status ON public.universities(status);

-- Step 7: Update table comment
COMMENT ON TABLE public.universities IS
'Universities table - stores university information in plain text. University names and codes are public information.';

-- Step 8: Log the cleanup
DO $$
DECLARE
    uni_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO uni_count FROM public.universities;
    RAISE NOTICE 'Encryption system completely removed. % universities with plain text data.', uni_count;
    RAISE NOTICE 'All encrypted columns, views, triggers, and functions have been dropped.';
END $$;
