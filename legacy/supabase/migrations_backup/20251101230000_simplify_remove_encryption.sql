-- Simplify universities table - remove encryption
-- University names and codes are public information, no need to encrypt
-- This migration:
-- 1. Restores UFTB university data
-- 2. Removes encryption trigger
-- 3. Keeps encrypted columns for reference but doesn't use them
-- 4. Makes plain text columns the source of truth

-- Step 1: Remove NOT NULL constraints temporarily
ALTER TABLE public.universities
ALTER COLUMN name DROP NOT NULL,
ALTER COLUMN code DROP NOT NULL;

-- Step 2: Remove the encryption trigger
DROP TRIGGER IF EXISTS trigger_encrypt_university_data ON public.universities;

-- Step 3: Update the encryption function to be a passthrough (no encryption)
CREATE OR REPLACE FUNCTION public.encrypt_university_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Passthrough - no encryption
    -- Just return the data as-is
    NEW.is_encrypted := false;
    RETURN NEW;
END;
$function$;

-- Step 4: Restore UFTB university data
-- Update any existing records that have NULL names
UPDATE public.universities
SET
    name = 'UFTB University',
    code = 'UFTB',
    is_encrypted = false
WHERE name IS NULL OR code IS NULL;

-- Step 5: Add back NOT NULL constraints
ALTER TABLE public.universities
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN code SET NOT NULL;

-- Step 6: Drop the decrypted view and recreate as simple passthrough
DROP VIEW IF EXISTS public.universities_decrypted CASCADE;

CREATE VIEW public.universities_decrypted AS
SELECT * FROM public.universities;

COMMENT ON VIEW public.universities_decrypted IS
'Simple passthrough view of universities table. Kept for backward compatibility with existing code that references this view.';

-- Grant permissions
GRANT SELECT ON public.universities_decrypted TO authenticated;
GRANT SELECT ON public.universities_decrypted TO service_role;

-- Step 7: Add comment explaining the decision
COMMENT ON TABLE public.universities IS
'Universities table - uses plain text storage. University names and codes are public information and do not require encryption. Encrypted columns kept for reference but not actively used.';

COMMENT ON FUNCTION public.encrypt_university_data() IS
'Legacy encryption function - now disabled. Returns data as-is without encryption. Kept for compatibility.';

-- Step 8: Log the result
DO $$
DECLARE
    uni_count INTEGER;
    uni_record RECORD;
BEGIN
    SELECT COUNT(*) INTO uni_count FROM public.universities;
    RAISE NOTICE 'Found % universities in database', uni_count;

    FOR uni_record IN
        SELECT id, name, code FROM public.universities
    LOOP
        RAISE NOTICE 'University: % (Code: %)', uni_record.name, uni_record.code;
    END LOOP;

    RAISE NOTICE 'Encryption removed. Universities table now uses plain text storage for simplicity.';
END $$;
