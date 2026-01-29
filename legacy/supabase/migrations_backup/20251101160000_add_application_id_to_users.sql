-- Add application_id column to users table to link users with their university applications
-- This allows us to easily check if a user has submitted an application

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS application_id uuid REFERENCES public.university_applications(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_application_id ON public.users(application_id);

-- Update existing records to link users with their applications
UPDATE public.users u
SET application_id = ua.id
FROM public.university_applications ua
WHERE u.id = ua.user_id AND u.application_id IS NULL;

-- Add comment
COMMENT ON COLUMN public.users.application_id IS 'Reference to the university application if the user is a university admin who has submitted an application';
