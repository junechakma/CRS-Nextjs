-- ============================================================================
-- CRS - Auto-create user profile on auth signup
-- Version: 1.0.0
-- ============================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get role from user metadata, default to 'teacher'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'teacher');

  -- Insert a new user profile (with minimal data - name/institution to be filled later)
  INSERT INTO public.users (id, email, name, role, plan, status)
  VALUES (
    NEW.id,
    NEW.email,
    '', -- Name to be filled during profile completion
    user_role,
    'free',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create a free subscription for the new user
  INSERT INTO public.subscriptions (
    user_id,
    plan,
    courses_limit,
    sessions_limit,
    ai_analytics_limit,
    clo_sets_limit,
    is_active
  )
  VALUES (
    NEW.id,
    'free',
    5,   -- Free plan: 5 courses
    10,  -- Free plan: 10 sessions per course
    10,  -- Free plan: 10 AI analytics requests per month
    2,   -- Free plan: 2 CLO sets
    TRUE
  )
  ON CONFLICT (user_id, is_active) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- RLS Policies for user self-management
-- ============================================================================

-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (for upsert)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for subscriptions
-- ============================================================================

-- Allow users to read their own subscription
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Enable RLS on subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
