-- Check if encrypted columns exist in universities table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'universities'
AND table_schema = 'public'
AND column_name LIKE '%encrypted%' OR column_name = 'is_encrypted' OR column_name = 'code_hash'
ORDER BY column_name;

-- Check if encryption trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'universities'
AND trigger_schema = 'public';

-- Check a sample university record to see if data is encrypted
SELECT
    id,
    name,
    code,
    name_encrypted,
    code_encrypted,
    is_encrypted
FROM universities
LIMIT 1;
