# Supabase Backend Plan for CRS (Course Response System)

## Database Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION                                │
│  users (Supabase Auth) ─── profiles (extended user data)            │
└─────────────────────────────────────────────────────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────────┐
        ▼                          ▼                              ▼
┌───────────────┐        ┌─────────────────┐            ┌─────────────────┐
│   semesters   │        │ question_temps  │            │  subscriptions  │
└───────┬───────┘        │   (templates)   │            └─────────────────┘
        │                └────────┬────────┘
        ▼                         │
┌───────────────┐        ┌────────▼────────┐
│    courses    │◀───────│template_questions│
└───────┬───────┘        └─────────────────┘
        │
   ┌────┴─────┬───────────────────┐
   ▼          ▼                   ▼
┌─────────┐ ┌─────────┐   ┌───────────────┐
│sessions │ │clo_sets │   │course_students│
└────┬────┘ └────┬────┘   └───────────────┘
     │           │
     ▼           ▼
┌─────────┐ ┌─────────┐
│responses│ │  clos   │
└─────────┘ └────┬────┘
                 │
                 ▼
            ┌─────────────┐
            │clo_documents│
            └─────────────┘
```

---

## Tables List

### 1. **profiles** (extends Supabase Auth users)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'teacher')),
  institution TEXT,
  department TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'custom')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive','banned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. **subscriptions** (user subscription details)

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'premium', 'custom')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  price DECIMAL(10, 2),
  courses_limit INTEGER DEFAULT 5,
  sessions_limit INTEGER DEFAULT 10,
  ai_analytics_limit INTEGER DEFAULT 10,
  ai_analytics_used INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. **semesters**

```sql
CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('current', 'upcoming', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. **courses**

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'indigo',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  avg_rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, code, semester_id)
);
```

### 5. **course_students** (enrollment)

```sql
CREATE TABLE course_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  student_identifier TEXT, -- For anonymous students (email/ID)
  enrolled_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. **question_templates**

```sql
CREATE TABLE question_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL for base template
  name TEXT NOT NULL,
  description TEXT,
  is_base BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. **template_questions**

```sql
CREATE TABLE template_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES question_templates(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rating', 'text', 'multiple', 'boolean', 'numeric')),
  required BOOLEAN DEFAULT FALSE,
  scale INTEGER, -- For rating type (5 or 10)
  options JSONB, -- For multiple choice ["Option 1", "Option 2"]
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. **sessions** (feedback sessions)

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  template_id UUID REFERENCES question_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  access_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'live' CHECK (status IN ('scheduled', 'live', 'completed')),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  scheduled_date DATE,
  total_students INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9. **session_responses** (student feedback)

```sql
CREATE TABLE session_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  student_identifier TEXT, -- For anonymous responses
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10. **response_answers** (individual answers)

```sql
CREATE TABLE response_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES session_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES template_questions(id) ON DELETE CASCADE,
  answer_value TEXT, -- Text answer or numeric value as string
  answer_rating INTEGER, -- For rating questions
  answer_boolean BOOLEAN, -- For yes/no questions
  answer_options JSONB, -- For multiple choice (selected options)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 11. **clo_sets** (Course Learning Outcome Sets)

```sql
CREATE TABLE clo_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'indigo',
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 12. **clos** (individual CLOs)

```sql
CREATE TABLE clos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clo_set_id UUID NOT NULL REFERENCES clo_sets(id) ON DELETE CASCADE,
  code TEXT NOT NULL, -- e.g., "CLO-1"
  description TEXT NOT NULL,
  bloom_level TEXT CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
  mapped_questions INTEGER DEFAULT 0,
  avg_relevance DECIMAL(3, 2) DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 13. **clo_documents** (uploaded documents for AI parsing)

```sql
CREATE TABLE clo_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clo_set_id UUID NOT NULL REFERENCES clo_sets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  parsed_clos JSONB, -- AI extracted CLOs
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);
```

### 14. **clo_question_mappings** (CLO to question mappings)

```sql
CREATE TABLE clo_question_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clo_id UUID NOT NULL REFERENCES clos(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES template_questions(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3, 2) DEFAULT 0, -- 0.00 to 1.00
  ai_reasoning TEXT,
  quality TEXT CHECK (quality IN ('perfect', 'good', 'needs_improvement', 'unmapped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clo_id, question_id)
);
```

### 15. **analytics_reports** (stored analytics/AI reports)

```sql
CREATE TABLE analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  clo_set_id UUID REFERENCES clo_sets(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('session', 'course', 'clo', 'semester')),
  report_data JSONB NOT NULL,
  ai_insights JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 16. **activity_log** (for super admin dashboard)

```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT, -- 'session', 'course', 'user', etc.
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clo_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE clos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clo_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clo_question_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own, super_admin can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admin can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Teachers can only access their own data
CREATE POLICY "Teachers own semesters" ON semesters
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Teachers own courses" ON courses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Teachers own sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Teachers own clo_sets" ON clo_sets
  FOR ALL USING (auth.uid() = user_id);

-- Question templates: Base template readable by all, own templates by owner
CREATE POLICY "Read base template" ON question_templates
  FOR SELECT USING (is_base = TRUE);

CREATE POLICY "Teachers own templates" ON question_templates
  FOR ALL USING (auth.uid() = user_id);

-- Super admin can access base template for editing
CREATE POLICY "Super admin edit base template" ON question_templates
  FOR ALL USING (
    is_base = TRUE AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Students can submit responses to live sessions
CREATE POLICY "Students can submit responses" ON session_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE id = session_id AND status = 'live'
    )
  );

-- Super admin full access policies
CREATE POLICY "Super admin full access courses" ON courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admin full access sessions" ON sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admin full access activity_log" ON activity_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );
```

---

## Database Functions

### Generate Unique Access Code

```sql
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  result := result || '-';
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### Update Session Response Count Trigger

```sql
CREATE OR REPLACE FUNCTION update_session_response_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sessions
  SET response_count = (
    SELECT COUNT(*) FROM session_responses WHERE session_id = NEW.session_id
  ),
  updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER session_response_count_trigger
  AFTER INSERT ON session_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_session_response_count();
```

### Check Subscription Limits

```sql
CREATE OR REPLACE FUNCTION check_subscription_limit(p_user_id UUID, p_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_current INTEGER;
BEGIN
  SELECT
    CASE p_type
      WHEN 'courses' THEN courses_limit
      WHEN 'sessions' THEN sessions_limit
      WHEN 'ai_analytics' THEN ai_analytics_limit
    END
  INTO v_limit
  FROM subscriptions
  WHERE user_id = p_user_id AND is_active = TRUE;

  -- If no subscription found, use free tier defaults
  IF v_limit IS NULL THEN
    v_limit := CASE p_type
      WHEN 'courses' THEN 5
      WHEN 'sessions' THEN 10
      WHEN 'ai_analytics' THEN 10
    END;
  END IF;

  -- Get current count
  CASE p_type
    WHEN 'courses' THEN
      SELECT COUNT(*) INTO v_current FROM courses WHERE user_id = p_user_id;
    WHEN 'sessions' THEN
      SELECT COUNT(*) INTO v_current FROM sessions WHERE user_id = p_user_id;
    WHEN 'ai_analytics' THEN
      SELECT COALESCE(ai_analytics_used, 0) INTO v_current
      FROM subscriptions WHERE user_id = p_user_id;
  END CASE;

  RETURN COALESCE(v_current, 0) < v_limit;
END;
$$ LANGUAGE plpgsql;
```

### Increment AI Analytics Usage

```sql
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE subscriptions
  SET ai_analytics_used = ai_analytics_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id AND is_active = TRUE;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
```

### Update Course Average Rating

```sql
CREATE OR REPLACE FUNCTION update_course_avg_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_course_id UUID;
  v_avg DECIMAL(3,2);
BEGIN
  -- Get course_id from session
  SELECT course_id INTO v_course_id
  FROM sessions WHERE id = NEW.session_id;

  -- Calculate average rating from all rating answers
  SELECT AVG(ra.answer_rating)::DECIMAL(3,2) INTO v_avg
  FROM response_answers ra
  JOIN session_responses sr ON ra.response_id = sr.id
  JOIN sessions s ON sr.session_id = s.id
  JOIN template_questions tq ON ra.question_id = tq.id
  WHERE s.course_id = v_course_id
    AND tq.type = 'rating'
    AND ra.answer_rating IS NOT NULL;

  UPDATE courses
  SET avg_rating = COALESCE(v_avg, 0),
      updated_at = NOW()
  WHERE id = v_course_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_rating_trigger
  AFTER INSERT ON response_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_course_avg_rating();
```

### Log Activity

```sql
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO activity_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;
```

### Auto-update Updated_at Timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER semesters_updated_at BEFORE UPDATE ON semesters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER question_templates_updated_at BEFORE UPDATE ON question_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER clo_sets_updated_at BEFORE UPDATE ON clo_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Storage Buckets

| Bucket Name | Purpose | Public |
|-------------|---------|--------|
| `clo-documents` | CLO document uploads (PDF, DOCX) | No |
| `avatars` | User profile pictures | Yes |
| `report-exports` | Generated PDF reports | No |

### Storage Policies

```sql
-- Avatars bucket: Public read, authenticated upload
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL
  );

-- CLO documents: Only owner can access
CREATE POLICY "Owner access clo documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'clo-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Report exports: Only owner can access
CREATE POLICY "Owner access reports" ON storage.objects
  FOR ALL USING (
    bucket_id = 'report-exports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Edge Functions (Supabase Functions)

| Function Name | Purpose | Trigger |
|--------------|---------|---------|
| `parse-clo-document` | AI parsing of uploaded CLO documents | On document upload |
| `generate-session-analytics` | Generate session analytics report | On demand |
| `generate-clo-mappings` | AI-based CLO to question mapping | On demand |
| `send-session-notification` | Email notification when session goes live | On session status change |
| `stripe-webhook` | Handle Stripe subscription events | Stripe webhook |
| `increment-ai-usage` | Track AI analytics usage | After AI call |
| `auto-end-sessions` | Auto-complete expired sessions | Cron (every 5 min) |

---

## Indexes for Performance

```sql
-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_plan ON profiles(plan);

-- Courses
CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_courses_semester_id ON courses(semester_id);
CREATE INDEX idx_courses_status ON courses(status);

-- Sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_course_id ON sessions(course_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_access_code ON sessions(access_code);
CREATE INDEX idx_sessions_scheduled_date ON sessions(scheduled_date);

-- Session Responses
CREATE INDEX idx_session_responses_session_id ON session_responses(session_id);
CREATE INDEX idx_session_responses_submitted_at ON session_responses(submitted_at);

-- Response Answers
CREATE INDEX idx_response_answers_response_id ON response_answers(response_id);
CREATE INDEX idx_response_answers_question_id ON response_answers(question_id);

-- CLO Sets
CREATE INDEX idx_clo_sets_user_id ON clo_sets(user_id);
CREATE INDEX idx_clo_sets_course_id ON clo_sets(course_id);

-- CLOs
CREATE INDEX idx_clos_clo_set_id ON clos(clo_set_id);

-- Activity Log
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_activity_log_entity_type ON activity_log(entity_type);
```

---

## Summary

### Total Tables: **16**

| # | Table | Purpose |
|---|-------|---------|
| 1 | `profiles` | Extended user data (teachers, admins, students) |
| 2 | `subscriptions` | User subscription plans and limits |
| 3 | `semesters` | Academic semesters |
| 4 | `courses` | Teacher courses |
| 5 | `course_students` | Student enrollments |
| 6 | `question_templates` | Feedback templates (base + custom) |
| 7 | `template_questions` | Questions within templates |
| 8 | `sessions` | Feedback collection sessions |
| 9 | `session_responses` | Student feedback submissions |
| 10 | `response_answers` | Individual question answers |
| 11 | `clo_sets` | Course Learning Outcome sets |
| 12 | `clos` | Individual CLOs |
| 13 | `clo_documents` | Uploaded documents for AI parsing |
| 14 | `clo_question_mappings` | CLO to question relationships |
| 15 | `analytics_reports` | Stored analytics and AI insights |
| 16 | `activity_log` | Admin activity tracking |

### Storage Buckets: **3**

| Bucket | Purpose |
|--------|---------|
| `clo-documents` | CLO document uploads |
| `avatars` | User profile pictures |
| `report-exports` | Generated PDF reports |

### Edge Functions: **7**

| Function | Purpose |
|----------|---------|
| `parse-clo-document` | AI document parsing |
| `generate-session-analytics` | Analytics generation |
| `generate-clo-mappings` | AI CLO mapping |
| `send-session-notification` | Email notifications |
| `stripe-webhook` | Payment handling |
| `increment-ai-usage` | Usage tracking |
| `auto-end-sessions` | Session cleanup |

---

## Subscription Limits Reference

| Feature | Free | Premium ($15/mo) | Custom |
|---------|------|------------------|--------|
| Courses | 5 | Unlimited | Custom |
| Sessions | 10 | Unlimited | Custom |
| AI Analytics | 10 | 100 | Custom |
| CLO Sets | 2 | Unlimited | Custom |
| Document Uploads | 5 | 50 | Custom |

---

## Next Steps

1. Create Supabase project
2. Run SQL migrations to create tables
3. Set up storage buckets
4. Configure RLS policies
5. Deploy edge functions
6. Set up Stripe integration
7. Configure authentication providers
8. Test all endpoints
