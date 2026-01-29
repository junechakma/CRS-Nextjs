-- Remove legacy password system completely
-- We are now 100% using Supabase Auth for authentication
-- The password_hash column in public.users should always be NULL

-- Drop the old password hashing trigger
DROP TRIGGER IF EXISTS hash_password_trigger ON public.users;

-- Drop the old password hashing function
DROP FUNCTION IF EXISTS public.hash_password_on_insert() CASCADE;

-- Make sure password_hash is NULL for all users using Supabase Auth
-- (Users with auth_user_id should not have a password_hash)
UPDATE public.users
SET password_hash = NULL
WHERE auth_user_id IS NOT NULL
AND password_hash IS NOT NULL;

-- Add a constraint to prevent password_hash from being set for Supabase Auth users
-- This ensures the legacy password system is not accidentally used
CREATE OR REPLACE FUNCTION public.prevent_password_hash_for_auth_users()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If this is a Supabase Auth user (has auth_user_id), password_hash must be NULL
  IF NEW.auth_user_id IS NOT NULL AND NEW.password_hash IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot set password_hash for Supabase Auth users. Authentication is managed by Supabase Auth.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce the constraint
CREATE TRIGGER prevent_password_hash_for_auth_users_trigger
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_password_hash_for_auth_users();

-- Update the comment on password_hash column
COMMENT ON COLUMN public.users.password_hash IS 'DEPRECATED - Only for legacy non-Supabase Auth users. All new users must use Supabase Auth (auth_user_id). This column must be NULL for Supabase Auth users.';

-- Add comment for the new function
COMMENT ON FUNCTION public.prevent_password_hash_for_auth_users IS 'Prevents setting password_hash for Supabase Auth users to ensure all authentication goes through Supabase Auth';
