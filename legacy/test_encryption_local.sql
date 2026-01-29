-- =============================================
-- TEST ENCRYPTION LOCALLY
-- =============================================

-- Test 1: Insert a test university
INSERT INTO universities (
    name,
    code,
    email,
    phone,
    address,
    created_by
) VALUES (
    'Test University',
    'TEST',
    'admin@test.edu',
    '+1-555-TEST-123',
    '123 Test Street, Test City',
    NULL
);

-- Test 2: Check encrypted data in base table (what DBAs see)
SELECT
    id,
    name,
    name_encrypted,
    code,
    code_encrypted,
    code_hash,
    email,
    email_encrypted,
    is_encrypted
FROM universities
WHERE code = 'TEST';

-- Test 3: Check decrypted data in view (what frontend sees)
SELECT
    id,
    name,
    code,
    email,
    phone,
    address
FROM universities_decrypted
WHERE code = 'TEST';

-- Test 4: Check code uniqueness validation
SELECT rpc_check_university_code_exists('TEST');
SELECT rpc_check_university_code_exists('NONEXISTENT');

-- Test 5: Verify encryption functions exist
SELECT proname, prosrc
FROM pg_proc
WHERE proname IN (
    'encrypt_data',
    'decrypt_data',
    'hash_university_code',
    'check_university_code_exists',
    'rpc_check_university_code_exists'
);

-- Cleanup
DELETE FROM universities WHERE code = 'TEST';
