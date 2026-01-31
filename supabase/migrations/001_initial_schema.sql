-- ============================================================================
-- CRS (Class Response System) - Initial Database Schema
-- Version: 1.0.0
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SECTION 1: USERS & AUTHENTICATION
-- ============================================================================

-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('super_admin', 'teacher')),
  institution TEXT,
  department TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'custom')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'premium', 'custom')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  price DECIMAL(10, 2) DEFAULT 0,
  -- Limits
  courses_limit INTEGER DEFAULT 5,
  sessions_limit INTEGER DEFAULT 10,
  ai_analytics_limit INTEGER DEFAULT 10,
  clo_sets_limit INTEGER DEFAULT 2,
  -- Usage tracking
  courses_used INTEGER DEFAULT 0,
  sessions_used INTEGER DEFAULT 0,
  ai_analytics_used INTEGER DEFAULT 0,
  clo_sets_used INTEGER DEFAULT 0,
  -- Billing info
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_active_subscription UNIQUE (user_id, is_active)
);

-- ============================================================================
-- SECTION 2: SEMESTERS & COURSES
-- ============================================================================

-- Semesters table
CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('current', 'upcoming', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_semester_dates CHECK (end_date > start_date)
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'indigo' CHECK (color IN ('indigo', 'violet', 'blue', 'emerald', 'amber', 'rose')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  -- Expected students (optional - set by teacher for response rate calculation)
  expected_students INTEGER, -- NULL if unknown, teacher sets this manually
  -- Denormalized stats for fast reads (auto-calculated)
  total_sessions INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  avg_rating DECIMAL(3, 2) DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_course_code_per_user_semester UNIQUE (user_id, code, semester_id)
);

-- ============================================================================
-- SECTION 3: QUESTION TEMPLATES
-- ============================================================================

-- Question templates (base + custom)
CREATE TABLE question_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for base templates
  name TEXT NOT NULL,
  description TEXT,
  is_base BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template questions
CREATE TABLE template_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES question_templates(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rating', 'text', 'multiple', 'boolean', 'numeric')),
  required BOOLEAN DEFAULT FALSE,
  scale INTEGER DEFAULT 5, -- For rating type (typically 5 or 10)
  min_value INTEGER DEFAULT 1, -- For numeric type
  max_value INTEGER DEFAULT 10, -- For numeric type
  options JSONB, -- For multiple choice: ["Option 1", "Option 2"]
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 4: SESSIONS & RESPONSES
-- ============================================================================

-- Feedback sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  template_id UUID REFERENCES question_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  access_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
  -- Timing
  scheduled_date DATE,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  -- Expected students (optional - teacher sets this for response rate calculation)
  -- If NULL, inherits from course.expected_students or response rate is not calculated
  expected_students INTEGER,
  -- Stats (denormalized for fast reads - auto-calculated from responses)
  response_count INTEGER DEFAULT 0,
  avg_completion_time_seconds INTEGER,
  avg_rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session questions (copied from template at session creation)
CREATE TABLE session_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  original_question_id UUID REFERENCES template_questions(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rating', 'text', 'multiple', 'boolean', 'numeric')),
  required BOOLEAN DEFAULT FALSE,
  scale INTEGER DEFAULT 5,
  min_value INTEGER DEFAULT 1,
  max_value INTEGER DEFAULT 10,
  options JSONB,
  order_index INTEGER DEFAULT 0,
  -- Stats for this question (denormalized)
  response_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(3, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anonymous session responses (no student account needed)
CREATE TABLE session_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  -- Anonymous identifier (hashed fingerprint or random)
  anonymous_id TEXT NOT NULL,
  completion_time_seconds INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate submissions from same anonymous user
  CONSTRAINT unique_response_per_session UNIQUE (session_id, anonymous_id)
);

-- Individual answers
CREATE TABLE response_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES session_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES session_questions(id) ON DELETE CASCADE,
  -- Answer storage (use appropriate field based on question type)
  answer_text TEXT, -- For text questions
  answer_rating INTEGER, -- For rating questions (1-5 or 1-10)
  answer_numeric INTEGER, -- For numeric questions
  answer_boolean BOOLEAN, -- For yes/no questions
  answer_choice TEXT, -- For multiple choice (selected option)
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_answer_per_question UNIQUE (response_id, question_id)
);

-- ============================================================================
-- SECTION 5: CLO SYSTEM (No file storage - AI parsed directly)
-- ============================================================================

-- CLO Sets
CREATE TABLE clo_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'indigo' CHECK (color IN ('indigo', 'violet', 'blue', 'emerald', 'amber', 'rose')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'draft')),
  -- Denormalized stats
  clo_count INTEGER DEFAULT 0,
  mapped_questions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual CLOs
CREATE TABLE clos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clo_set_id UUID NOT NULL REFERENCES clo_sets(id) ON DELETE CASCADE,
  code TEXT NOT NULL, -- e.g., "CLO-1", "CLO-2"
  description TEXT NOT NULL,
  bloom_level TEXT CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
  -- Denormalized stats
  mapped_questions INTEGER DEFAULT 0,
  avg_relevance DECIMAL(3, 2) DEFAULT 0,
  coverage_percentage DECIMAL(5, 2) DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLO to Question Mappings (AI-generated)
CREATE TABLE clo_question_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clo_id UUID NOT NULL REFERENCES clos(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES session_questions(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3, 2) DEFAULT 0 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  quality TEXT DEFAULT 'unmapped' CHECK (quality IN ('perfect', 'good', 'needs_improvement', 'unmapped')),
  ai_reasoning TEXT,
  confidence DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_clo_question_mapping UNIQUE (clo_id, question_id)
);

-- ============================================================================
-- SECTION 6: ANALYTICS & ACTIVITY LOGGING
-- ============================================================================

-- Stored analytics reports
CREATE TABLE analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  clo_set_id UUID REFERENCES clo_sets(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('session', 'course', 'clo', 'semester', 'overview')),
  -- Report data stored as JSONB for flexibility
  report_data JSONB NOT NULL DEFAULT '{}',
  ai_insights JSONB,
  sentiment_breakdown JSONB, -- {positive: 0, neutral: 0, negative: 0}
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log for super admin dashboard
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT, -- 'session', 'course', 'user', 'subscription', etc.
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 7: SYSTEM CONFIGURATION
-- ============================================================================

-- System settings (for super admin)
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);
