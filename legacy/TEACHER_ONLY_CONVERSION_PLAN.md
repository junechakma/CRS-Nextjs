# Class Response System - Teacher-Only Conversion Plan

**Date:** January 21, 2026
**Project:** Transform multi-role university system into teacher-focused platform
**Estimated Duration:** 14-17 days

---

## Table of Contents

1. [Current System Architecture](#current-system-architecture)
2. [Target System Architecture](#target-system-architecture)
3. [Conversion Plan](#conversion-plan)
4. [Migration Files](#migration-files)
5. [Tech Stack Comparison](#tech-stack-comparison)
6. [Payment Integration](#payment-integration)
7. [Email & Security](#email--security)
8. [Timeline & Effort](#timeline--effort)
9. [Risks & Mitigation](#risks--mitigation)

---

## Current System Architecture

### User Roles Present
- **super_admin** - System-wide administrator
- **university_admin** - University management
- **faculty_admin** - Faculty-level administrator
- **department_moderator** - Department management
- **teacher** - Course instructor
- **student** - Anonymous responder

### Complex Approval Workflows
- University application approval (super_admin → university_admin)
- Teacher creation approval (auto-approved but requires admin)
- Faculty/Department admin approvals
- Status tracking: `pending` → `approved` → `active`

### Hierarchical Structure
```
Universities
  └── Faculties
      └── Departments
          └── Teachers
              └── Courses
                  └── Sessions (with anonymous_key)
```

### Core Features (to Preserve)
- ✅ Course creation and management
- ✅ Response sessions with autonomous code generation (`anonymous_key`)
- ✅ CLO/PLO mapping (AI-powered with Gemini 2.5 Flash)
- ✅ Analytics and reporting
- ✅ Anonymous student responses
- ✅ Session management with time-based activation

### Database Tables (Current)
- `users` (with roles and approval fields)
- `universities`, `faculties`, `departments`
- `university_applications`
- `courses`
- `response_sessions`
- `responses`
- `question_templates`
- `course_clos` (Course Learning Outcomes)
- `clo_mappings` (CLO to Question mappings)
- `backup_logs`, `audit_log`, `activity_logs`
- `password_reset_tokens`, `password_reset_attempts`

---

## Target System Architecture

### Single User Role
- **teacher** - The only authenticated user role
- Students access anonymously via session codes (no authentication)

### Simplified Structure
```
Teacher
  └── Courses (optional: institution_name text field)
      └── Sessions (auto-generated anonymous_key)
          └── Responses (anonymous students)
```

### Key Features
1. **No approvals** - Teachers self-register and immediately access system
2. **Direct course creation** - No department/faculty constraints
3. **Autonomous session codes** - Auto-generated UUID on session creation
4. **CLO/PLO mapping** - Preserved as-is with AI analysis
5. **Analytics dashboard** - Teacher-focused analytics
6. **Anonymous responses** - Students access via session code only
7. **Payment integration** - SSLCommerz for subscriptions/premium features
8. **Email control** - SMTP configuration for transactional emails

### New Features to Add
- 💳 **Payment/Subscription system** (SSLCommerz)
- 📧 **Email service** (SMTP/SendGrid/custom)
- 🔒 **Enhanced security** (2FA, session management)
- 📱 **QR code generation** for session sharing
- 📊 **Export reports** (PDF/Excel)

---

## Conversion Plan

### Phase 1: Database Schema Transformation

#### 1.1 User Management Simplification
**File:** `supabase/migrations/20260121001_simplify_user_roles.sql`

**Remove columns from `users` table:**
- `role` (optional: keep for future expansion, default 'teacher')
- `approval_status` ❌
- `approved_by` ❌
- `approval_date` ❌
- `password_change_required` ❌
- `university_id` (make optional for stats grouping)
- `faculty_id` ❌
- `department_id` ❌

**Keep essential columns:**
- `id`, `auth_user_id`, `email`, `name`, `phone`, `initial`
- `status` (active/inactive only)
- `created_at`, `updated_at`

**Add new columns:**
- `institution_name` VARCHAR (optional, for self-reporting)
- `subscription_tier` VARCHAR (free/premium/pro)
- `subscription_status` VARCHAR (active/expired/cancelled)
- `subscription_expires_at` TIMESTAMP
- `payment_customer_id` VARCHAR (SSLCommerz customer ID)

```sql
-- Remove approval-related columns
ALTER TABLE users DROP COLUMN IF EXISTS approval_status;
ALTER TABLE users DROP COLUMN IF EXISTS approved_by;
ALTER TABLE users DROP COLUMN IF EXISTS approval_date;
ALTER TABLE users DROP COLUMN IF EXISTS password_change_required;
ALTER TABLE users DROP COLUMN IF EXISTS role; -- Or set default 'teacher'

-- Make org fields nullable
ALTER TABLE users ALTER COLUMN university_id DROP NOT NULL;
ALTER TABLE users ALTER COLUMN faculty_id DROP NOT NULL;
ALTER TABLE users ALTER COLUMN department_id DROP NOT NULL;

-- Add subscription fields
ALTER TABLE users ADD COLUMN institution_name VARCHAR(255);
ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN payment_customer_id VARCHAR(100);

-- Add index for subscription queries
CREATE INDEX idx_users_subscription ON users(subscription_tier, subscription_status);
```

#### 1.2 Remove Approval/Admin Tables
**File:** `supabase/migrations/20260121002_remove_admin_tables.sql`

**Drop tables:**
```sql
DROP TABLE IF EXISTS university_applications CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS password_reset_attempts CASCADE;
DROP TABLE IF EXISTS backup_logs CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;

-- Keep activity_logs for security auditing (optional)
-- DROP TABLE IF EXISTS activity_logs CASCADE;
```

#### 1.3 Simplify Organization Structure
**File:** `supabase/migrations/20260121003_simplify_organization.sql`

**Option A - Complete Removal (Recommended for pure teacher-only):**
```sql
-- Remove foreign keys from courses
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_university_id_fkey;
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_faculty_id_fkey;
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_department_id_fkey;

-- Drop organization tables
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS faculties CASCADE;
DROP TABLE IF EXISTS universities CASCADE;

-- Make organization fields nullable in courses
ALTER TABLE courses ALTER COLUMN university_id DROP NOT NULL;
ALTER TABLE courses ALTER COLUMN faculty_id DROP NOT NULL;
ALTER TABLE courses ALTER COLUMN department_id DROP NOT NULL;

-- Add simple text fields
ALTER TABLE courses ADD COLUMN institution_name VARCHAR(255);
ALTER TABLE courses ADD COLUMN program_name VARCHAR(255);
```

**Option B - Lightweight Retention (if you want optional grouping):**
```sql
-- Keep tables but make them optional
-- Teachers can create virtual departments/faculties
ALTER TABLE universities ALTER COLUMN admin_id DROP NOT NULL;
ALTER TABLE faculties ALTER COLUMN admin_id DROP NOT NULL;
ALTER TABLE departments ALTER COLUMN moderator_id DROP NOT NULL;

-- Add teacher ownership
ALTER TABLE universities ADD COLUMN is_virtual BOOLEAN DEFAULT false;
ALTER TABLE faculties ADD COLUMN is_virtual BOOLEAN DEFAULT false;
ALTER TABLE departments ADD COLUMN is_virtual BOOLEAN DEFAULT false;
```

#### 1.4 Streamline Courses Table
**File:** `supabase/migrations/20260121004_streamline_courses.sql`

```sql
-- Make organization optional
ALTER TABLE courses ALTER COLUMN university_id DROP NOT NULL;
ALTER TABLE courses ALTER COLUMN faculty_id DROP NOT NULL;
ALTER TABLE courses ALTER COLUMN department_id DROP NOT NULL;

-- Add simple text fields for context
ALTER TABLE courses ADD COLUMN IF NOT EXISTS institution_name VARCHAR(255);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS program_name VARCHAR(255);

-- Add premium features flag
ALTER TABLE courses ADD COLUMN is_premium_feature BOOLEAN DEFAULT false;

-- Update existing courses to have institution names
UPDATE courses c
SET institution_name = (
  SELECT name FROM universities WHERE id = c.university_id
)
WHERE university_id IS NOT NULL;
```

#### 1.5 Update Response Sessions
**File:** `supabase/migrations/20260121005_update_response_sessions.sql`

```sql
-- Remove organization fields
ALTER TABLE response_sessions ALTER COLUMN university_id DROP NOT NULL;
ALTER TABLE response_sessions ALTER COLUMN faculty_id DROP NOT NULL;
ALTER TABLE response_sessions ALTER COLUMN department_id DROP NOT NULL;

-- Ensure anonymous_key is always generated
ALTER TABLE response_sessions ALTER COLUMN anonymous_key SET DEFAULT gen_random_uuid()::text;

-- Add readable session code
ALTER TABLE response_sessions ADD COLUMN session_code VARCHAR(20);

-- Create function to generate readable codes
CREATE OR REPLACE FUNCTION generate_session_code()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude confusing chars
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..3 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  result := result || '-';
  FOR i IN 1..3 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  result := result || '-';
  FOR i IN 1..3 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Create trigger to auto-generate session codes
CREATE OR REPLACE FUNCTION set_session_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.session_code IS NULL THEN
    NEW.session_code := generate_session_code();
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM response_sessions WHERE session_code = NEW.session_code) LOOP
      NEW.session_code := generate_session_code();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_session_code ON response_sessions;
CREATE TRIGGER trigger_set_session_code
BEFORE INSERT ON response_sessions
FOR EACH ROW
EXECUTE FUNCTION set_session_code();

-- Create index for fast code lookups
CREATE INDEX idx_session_code ON response_sessions(session_code);
```

#### 1.6 Create Payment Tables
**File:** `supabase/migrations/20260121006_create_payment_tables.sql`

```sql
-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- free, premium, pro
  display_name VARCHAR(100) NOT NULL,
  price_bdt DECIMAL(10,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  features JSONB NOT NULL, -- List of features
  max_courses INTEGER,
  max_sessions_per_month INTEGER,
  max_responses_per_session INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),

  -- SSLCommerz fields
  transaction_id VARCHAR(100) UNIQUE NOT NULL, -- SSLCommerz tran_id
  payment_status VARCHAR(50) NOT NULL, -- pending, success, failed, cancelled
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BDT',

  -- SSLCommerz response data
  sslcommerz_data JSONB, -- Store full response
  card_type VARCHAR(50),
  card_brand VARCHAR(50),
  bank_tran_id VARCHAR(100),

  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Payment history/logs
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES payment_transactions(id),
  event_type VARCHAR(50) NOT NULL, -- initiated, validated, success, failed
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (name, display_name, price_bdt, duration_months, features, max_courses, max_sessions_per_month, max_responses_per_session) VALUES
('free', 'Free Plan', 0, 0, '["5 courses", "10 sessions/month", "50 responses/session", "Basic analytics"]', 5, 10, 50),
('premium', 'Premium Plan', 500, 1, '["20 courses", "50 sessions/month", "200 responses/session", "Advanced analytics", "CLO mapping", "Export reports"]', 20, 50, 200),
('pro', 'Professional Plan', 1200, 3, '["Unlimited courses", "Unlimited sessions", "Unlimited responses", "AI analytics", "Priority support", "Custom branding"]', NULL, NULL, NULL);

-- Create indexes
CREATE INDEX idx_transactions_user ON payment_transactions(user_id);
CREATE INDEX idx_transactions_status ON payment_transactions(payment_status);
CREATE INDEX idx_transactions_created ON payment_transactions(created_at DESC);
```

#### 1.7 Clean Up Functions
**File:** `supabase/migrations/20260121007_remove_admin_functions.sql`

```sql
-- Drop admin-related functions
DROP FUNCTION IF EXISTS approve_university_application CASCADE;
DROP FUNCTION IF EXISTS create_teacher CASCADE;
DROP FUNCTION IF EXISTS create_teacher_record CASCADE;
DROP FUNCTION IF EXISTS is_university_admin CASCADE;
DROP FUNCTION IF EXISTS get_user_university_id CASCADE;
DROP FUNCTION IF EXISTS is_super_admin CASCADE;
DROP FUNCTION IF EXISTS set_user_approved_by CASCADE;
DROP FUNCTION IF EXISTS create_system_backup CASCADE;
DROP FUNCTION IF EXISTS create_system_backup_with_format CASCADE;

-- Keep these functions (update if needed)
-- check_password_change_required - Remove or update
-- change_password_authenticated - Keep for Supabase Auth
-- cleanup_expired_password_tokens - Remove if not using
```

#### 1.8 Simplify RLS Policies
**File:** `supabase/migrations/20260121008_simplify_rls_policies.sql`

```sql
-- Drop all existing RLS policies
DROP POLICY IF EXISTS "university_admin_read_university_users" ON users;
DROP POLICY IF EXISTS "university_admin_insert_university_users" ON users;
DROP POLICY IF EXISTS "university_admin_update_university_users" ON users;
DROP POLICY IF EXISTS "enable_read_own_profile" ON users;
DROP POLICY IF EXISTS "enable_update_own_profile" ON users;

-- USERS TABLE - Teachers manage their own profile
CREATE POLICY "teachers_read_own_profile"
ON users FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

CREATE POLICY "teachers_update_own_profile"
ON users FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- COURSES TABLE - Teachers manage their own courses
DROP POLICY IF EXISTS "teachers_manage_own_courses" ON courses;

CREATE POLICY "teachers_read_own_courses"
ON courses FOR SELECT
TO authenticated
USING (teacher_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "teachers_insert_own_courses"
ON courses FOR INSERT
TO authenticated
WITH CHECK (teacher_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "teachers_update_own_courses"
ON courses FOR UPDATE
TO authenticated
USING (teacher_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
WITH CHECK (teacher_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "teachers_delete_own_courses"
ON courses FOR DELETE
TO authenticated
USING (teacher_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- RESPONSE SESSIONS - Teachers manage their own sessions
DROP POLICY IF EXISTS "anonymous_access_active_sessions" ON response_sessions;

CREATE POLICY "teachers_manage_own_sessions"
ON response_sessions FOR ALL
TO authenticated
USING (teacher_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
WITH CHECK (teacher_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Anonymous users can view active sessions
CREATE POLICY "anonymous_view_active_sessions"
ON response_sessions FOR SELECT
TO anon
USING (status = 'active');

-- RESPONSES - Teachers can view, anonymous can insert
DROP POLICY IF EXISTS "anonymous_insert_responses" ON responses;
DROP POLICY IF EXISTS "anonymous_check_own_responses" ON responses;

CREATE POLICY "teachers_view_course_responses"
ON responses FOR SELECT
TO authenticated
USING (teacher_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "anonymous_submit_responses"
ON responses FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM response_sessions
    WHERE id = responses.session_id AND status = 'active'
  )
);

CREATE POLICY "anonymous_view_own_responses"
ON responses FOR SELECT
TO anon
USING (true);

-- CLO TABLES - Teachers manage their own CLOs
CREATE POLICY "teachers_manage_own_clos"
ON course_clos FOR ALL
TO authenticated
USING (
  course_id IN (
    SELECT id FROM courses
    WHERE teacher_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  )
)
WITH CHECK (
  course_id IN (
    SELECT id FROM courses
    WHERE teacher_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
  )
);

-- PAYMENT TRANSACTIONS - Users view their own
CREATE POLICY "users_view_own_transactions"
ON payment_transactions FOR SELECT
TO authenticated
USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Subscription plans readable by all authenticated users
CREATE POLICY "authenticated_read_plans"
ON subscription_plans FOR SELECT
TO authenticated
USING (is_active = true);
```

#### 1.9 Update Auth Trigger
**File:** `supabase/migrations/20260121009_update_auth_trigger.sql`

```sql
-- Update handle_new_user to create teacher profile immediately
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_name TEXT;
  user_phone VARCHAR(20);
  user_institution VARCHAR(255);
BEGIN
  -- Extract metadata from raw_user_meta_data
  user_name := NEW.raw_user_meta_data->>'name';
  user_phone := NEW.raw_user_meta_data->>'phone';
  user_institution := NEW.raw_user_meta_data->>'institution_name';

  -- Insert into public.users table
  -- All users are teachers by default and immediately active
  INSERT INTO public.users (
    auth_user_id,
    email,
    name,
    phone,
    institution_name,
    status,
    subscription_tier,
    subscription_status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(user_name, split_part(NEW.email, '@', 1)),
    user_phone,
    user_institution,
    'active',
    'free',
    'active',
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (will appear in Postgres logs)
    RAISE WARNING 'Error creating user profile for %: %', NEW.email, SQLERRM;
    -- Re-raise the error to prevent user creation
    RAISE;
END;
$function$;

COMMENT ON FUNCTION public.handle_new_user IS 'Creates teacher profile when auth user is created. All users are teachers and immediately active.';
```

#### 1.10 Data Migration & Cleanup
**File:** `supabase/migrations/20260121010_data_migration.sql`

```sql
-- Archive non-teacher users (optional)
CREATE TABLE IF NOT EXISTS archived_users AS
SELECT * FROM users WHERE role != 'teacher' OR role IS NULL;

-- Keep only teacher users
DELETE FROM users WHERE role != 'teacher' AND role IS NOT NULL;

-- Update remaining teacher records
UPDATE users
SET
  status = 'active',
  subscription_tier = 'free',
  subscription_status = 'active';

-- Update courses with institution names from old structure
UPDATE courses c
SET
  institution_name = COALESCE(
    (SELECT name FROM universities WHERE id = c.university_id),
    'Unknown Institution'
  ),
  program_name = COALESCE(
    (SELECT name FROM departments WHERE id = c.department_id),
    'General Program'
  )
WHERE institution_name IS NULL;

-- Generate session codes for existing sessions
UPDATE response_sessions
SET session_code = generate_session_code()
WHERE session_code IS NULL;

-- Clean up orphaned records
DELETE FROM responses WHERE session_id NOT IN (SELECT id FROM response_sessions);
DELETE FROM response_sessions WHERE course_id NOT IN (SELECT id FROM courses);
DELETE FROM courses WHERE teacher_id NOT IN (SELECT id FROM users);

-- Vacuum tables
VACUUM ANALYZE users;
VACUUM ANALYZE courses;
VACUUM ANALYZE response_sessions;
VACUUM ANALYZE responses;
```

---

### Phase 2: Backend API Updates

#### 2.1 Create Payment Service
**File:** `src/services/paymentService.ts`

```typescript
import { supabase } from '../lib/supabase'

export interface PaymentInitiationRequest {
  userId: string
  planId: string
  successUrl: string
  failUrl: string
  cancelUrl: string
}

export interface SSLCommerzConfig {
  storeId: string
  storePassword: string
  isLive: boolean
}

class PaymentService {
  private config: SSLCommerzConfig

  constructor() {
    this.config = {
      storeId: import.meta.env.VITE_SSLCOMMERZ_STORE_ID,
      storePassword: import.meta.env.VITE_SSLCOMMERZ_STORE_PASSWORD,
      isLive: import.meta.env.VITE_SSLCOMMERZ_IS_LIVE === 'true'
    }
  }

  async initiatePayment(request: PaymentInitiationRequest) {
    try {
      // Get plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', request.planId)
        .single()

      if (planError || !plan) {
        throw new Error('Plan not found')
      }

      // Get user details
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', request.userId)
        .single()

      if (userError || !user) {
        throw new Error('User not found')
      }

      // Generate unique transaction ID
      const transactionId = `TXN-${Date.now()}-${user.id.substring(0, 8)}`

      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: request.userId,
          plan_id: request.planId,
          transaction_id: transactionId,
          payment_status: 'pending',
          amount: plan.price_bdt,
          currency: 'BDT'
        })
        .select()
        .single()

      if (txError) {
        throw new Error('Failed to create transaction')
      }

      // Prepare SSLCommerz request
      const sslCommerzUrl = this.config.isLive
        ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
        : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'

      const postData = {
        store_id: this.config.storeId,
        store_passwd: this.config.storePassword,
        total_amount: plan.price_bdt,
        currency: 'BDT',
        tran_id: transactionId,
        success_url: request.successUrl,
        fail_url: request.failUrl,
        cancel_url: request.cancelUrl,
        cus_name: user.name,
        cus_email: user.email,
        cus_phone: user.phone || 'N/A',
        product_name: plan.display_name,
        product_category: 'Subscription',
        product_profile: 'general',
        shipping_method: 'NO',
        num_of_item: 1
      }

      // Call SSLCommerz API
      const response = await fetch(sslCommerzUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(postData)
      })

      const result = await response.json()

      if (result.status === 'SUCCESS') {
        // Log initiation
        await supabase.from('payment_logs').insert({
          transaction_id: transaction.id,
          event_type: 'initiated',
          event_data: result
        })

        return {
          success: true,
          gatewayUrl: result.GatewayPageURL,
          transactionId: transactionId
        }
      } else {
        throw new Error('SSLCommerz initiation failed')
      }
    } catch (error) {
      console.error('Payment initiation error:', error)
      throw error
    }
  }

  async validatePayment(transactionId: string, valId: string) {
    try {
      const validationUrl = this.config.isLive
        ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
        : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'

      const response = await fetch(
        `${validationUrl}?val_id=${valId}&store_id=${this.config.storeId}&store_passwd=${this.config.storePassword}`
      )

      const result = await response.json()

      if (result.status === 'VALID' || result.status === 'VALIDATED') {
        // Update transaction
        await supabase
          .from('payment_transactions')
          .update({
            payment_status: 'success',
            completed_at: new Date().toISOString(),
            sslcommerz_data: result,
            card_type: result.card_type,
            card_brand: result.card_brand,
            bank_tran_id: result.bank_tran_id
          })
          .eq('transaction_id', transactionId)

        // Update user subscription
        const { data: transaction } = await supabase
          .from('payment_transactions')
          .select('*, subscription_plans(*)')
          .eq('transaction_id', transactionId)
          .single()

        if (transaction) {
          const expiresAt = new Date()
          expiresAt.setMonth(
            expiresAt.getMonth() + transaction.subscription_plans.duration_months
          )

          await supabase
            .from('users')
            .update({
              subscription_tier: transaction.subscription_plans.name,
              subscription_status: 'active',
              subscription_expires_at: expiresAt.toISOString(),
              payment_customer_id: result.card_no
            })
            .eq('id', transaction.user_id)
        }

        // Log success
        await supabase.from('payment_logs').insert({
          transaction_id: transaction.id,
          event_type: 'success',
          event_data: result
        })

        return { success: true, data: result }
      } else {
        throw new Error('Payment validation failed')
      }
    } catch (error) {
      console.error('Payment validation error:', error)
      throw error
    }
  }

  async handleFailedPayment(transactionId: string, reason: string) {
    await supabase
      .from('payment_transactions')
      .update({
        payment_status: 'failed',
        completed_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId)

    await supabase.from('payment_logs').insert({
      transaction_id: transactionId,
      event_type: 'failed',
      event_data: { reason }
    })
  }

  async getSubscriptionPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_bdt', { ascending: true })

    if (error) throw error
    return data
  }

  async getUserTransactions(userId: string) {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}

export const paymentService = new PaymentService()
```

#### 2.2 Create Email Service
**File:** `src/services/emailService.ts`

```typescript
interface EmailConfig {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  fromEmail: string
  fromName: string
}

interface EmailTemplate {
  subject: string
  htmlBody: string
  textBody: string
}

class EmailService {
  private config: EmailConfig

  constructor() {
    this.config = {
      smtpHost: import.meta.env.VITE_SMTP_HOST,
      smtpPort: parseInt(import.meta.env.VITE_SMTP_PORT || '587'),
      smtpUser: import.meta.env.VITE_SMTP_USER,
      smtpPassword: import.meta.env.VITE_SMTP_PASSWORD,
      fromEmail: import.meta.env.VITE_FROM_EMAIL,
      fromName: import.meta.env.VITE_FROM_NAME || 'Class Response System'
    }
  }

  async sendEmail(to: string, template: EmailTemplate) {
    // For client-side, you'll need a backend API endpoint
    // This is a placeholder showing the structure
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to,
          subject: template.subject,
          html: template.htmlBody,
          text: template.textBody
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      return { success: true }
    } catch (error) {
      console.error('Email sending error:', error)
      throw error
    }
  }

  // Email templates
  getWelcomeEmail(name: string): EmailTemplate {
    return {
      subject: 'Welcome to Class Response System',
      htmlBody: `
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for joining Class Response System.</p>
        <p>You can now:</p>
        <ul>
          <li>Create courses</li>
          <li>Generate session codes</li>
          <li>Collect anonymous student feedback</li>
          <li>Analyze CLO/PLO mappings with AI</li>
        </ul>
        <p><a href="${window.location.origin}/dashboard">Get Started</a></p>
      `,
      textBody: `Welcome, ${name}! Thank you for joining Class Response System.`
    }
  }

  getPaymentSuccessEmail(name: string, plan: string, amount: number): EmailTemplate {
    return {
      subject: 'Payment Successful - Subscription Activated',
      htmlBody: `
        <h1>Payment Successful!</h1>
        <p>Dear ${name},</p>
        <p>Your payment of ৳${amount} for the <strong>${plan}</strong> plan has been processed successfully.</p>
        <p>Your subscription is now active and you have access to all premium features.</p>
        <p><a href="${window.location.origin}/dashboard">Access Dashboard</a></p>
      `,
      textBody: `Payment Successful! Your ${plan} subscription is now active.`
    }
  }

  getSessionCreatedEmail(teacherName: string, sessionCode: string, courseCode: string): EmailTemplate {
    const sessionUrl = `${window.location.origin}/session/${sessionCode}`
    return {
      subject: `New Session Created - ${courseCode}`,
      htmlBody: `
        <h1>Session Created Successfully</h1>
        <p>Dear ${teacherName},</p>
        <p>Your session for <strong>${courseCode}</strong> has been created.</p>
        <h2>Session Code: <strong>${sessionCode}</strong></h2>
        <p>Share this code with your students:</p>
        <p><a href="${sessionUrl}">${sessionUrl}</a></p>
      `,
      textBody: `Session Code: ${sessionCode}. Share with students: ${sessionUrl}`
    }
  }
}

export const emailService = new EmailService()
```

---

### Phase 3: Frontend Transformation

#### 3.1 Remove Admin Features
**Delete these directories:**
```bash
rm -rf src/features/super-admin/
rm -rf src/features/university-admin/
rm -rf src/features/faculty-admin/
rm -rf src/features/department-moderator/
```

#### 3.2 Update Authentication Components
**File:** `src/features/auth/components/RegisterForm.tsx`

```typescript
// Simplified teacher registration
export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
          phone: formData.phone,
          institution_name: formData.institution
        }
      }
    })

    if (error) {
      // Handle error
      return
    }

    // Success - redirect to dashboard
    navigate('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input label="Full Name" value={formData.name} onChange={...} />
      <Input label="Email" type="email" value={formData.email} onChange={...} />
      <Input label="Phone" value={formData.phone} onChange={...} />
      <Input label="Institution (optional)" value={formData.institution} onChange={...} />
      <Input label="Password" type="password" value={formData.password} onChange={...} />
      <Input label="Confirm Password" type="password" value={formData.confirmPassword} onChange={...} />
      <Button type="submit">Create Account</Button>
    </form>
  )
}
```

#### 3.3 Create Subscription/Payment Components
**File:** `src/features/payment/components/SubscriptionPlans.tsx`

```typescript
import { useState, useEffect } from 'react'
import { paymentService } from '../../../services/paymentService'
import { Card, Button } from '../../../shared/components/ui'

export function SubscriptionPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    const data = await paymentService.getSubscriptionPlans()
    setPlans(data)
  }

  const handleUpgrade = async (planId: string) => {
    setLoading(true)
    try {
      const result = await paymentService.initiatePayment({
        userId: user.id,
        planId: planId,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/failed`,
        cancelUrl: `${window.location.origin}/payment/cancelled`
      })

      if (result.success) {
        // Redirect to SSLCommerz payment gateway
        window.location.href = result.gatewayUrl
      }
    } catch (error) {
      console.error('Payment initiation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card key={plan.id} className="p-6">
          <h3 className="text-2xl font-bold">{plan.display_name}</h3>
          <div className="text-4xl font-bold my-4">
            ৳{plan.price_bdt}
            <span className="text-sm text-gray-500">/{plan.duration_months}mo</span>
          </div>
          <ul className="space-y-2 mb-6">
            {JSON.parse(plan.features).map((feature, idx) => (
              <li key={idx} className="flex items-center">
                <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            onClick={() => handleUpgrade(plan.id)}
            disabled={loading}
            className="w-full"
          >
            {plan.name === 'free' ? 'Current Plan' : 'Upgrade'}
          </Button>
        </Card>
      ))}
    </div>
  )
}
```

#### 3.4 Create Session Code Display Component
**File:** `src/features/teacher/components/SessionCodeDisplay.tsx`

```typescript
import { useState } from 'react'
import { Copy, QrCode, Share2 } from 'lucide-react'
import QRCode from 'qrcode'
import { Button } from '../../../shared/components/ui'

interface SessionCodeDisplayProps {
  sessionCode: string
  anonymousKey: string
}

export function SessionCodeDisplay({ sessionCode, anonymousKey }: SessionCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const sessionUrl = `${window.location.origin}/session/${sessionCode}`

  const generateQR = async () => {
    try {
      const url = await QRCode.toDataURL(sessionUrl, {
        width: 300,
        margin: 2
      })
      setQrDataUrl(url)
    } catch (error) {
      console.error('QR generation failed:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show toast notification
  }

  const shareSession = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Join Session',
        text: `Join my session with code: ${sessionCode}`,
        url: sessionUrl
      })
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Session Access</h3>

      <div className="mb-4">
        <label className="text-sm text-gray-600">Session Code</label>
        <div className="flex items-center gap-2 mt-1">
          <div className="text-3xl font-mono font-bold tracking-wider bg-white px-4 py-2 rounded border-2 border-blue-300">
            {sessionCode}
          </div>
          <Button onClick={() => copyToClipboard(sessionCode)} size="sm">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm text-gray-600">Session URL</label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="text"
            value={sessionUrl}
            readOnly
            className="flex-1 px-3 py-2 border rounded font-mono text-sm"
          />
          <Button onClick={() => copyToClipboard(sessionUrl)} size="sm">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={generateQR} variant="outline">
          <QrCode className="w-4 h-4 mr-2" />
          Generate QR Code
        </Button>
        <Button onClick={shareSession} variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {qrDataUrl && (
        <div className="mt-4 text-center">
          <img src={qrDataUrl} alt="Session QR Code" className="mx-auto" />
          <p className="text-sm text-gray-500 mt-2">
            Students can scan this QR code to join
          </p>
        </div>
      )}
    </div>
  )
}
```

#### 3.5 Update Routing
**File:** `src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './features/auth/hooks/useAuth'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TeacherDashboard from './features/teacher/pages/TeacherDashboard'
import CoursesPage from './features/teacher/pages/CoursesPage'
import SessionsPage from './features/teacher/pages/ResponseSessionsPage'
import SessionAnalyticsPage from './features/teacher/pages/SessionAnalyticsPage'
import CLOAnalyticsPage from './features/teacher/pages/CLOAnalyticsPage'
import SubscriptionPage from './features/payment/pages/SubscriptionPage'
import StudentSessionPage from './features/student/pages/StudentFeedbackPage'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/session/:code" element={<StudentSessionPage />} />

        {/* Protected teacher routes */}
        <Route path="/dashboard" element={
          user ? <TeacherDashboard /> : <Navigate to="/login" />
        } />
        <Route path="/courses" element={
          user ? <CoursesPage /> : <Navigate to="/login" />
        } />
        <Route path="/sessions" element={
          user ? <SessionsPage /> : <Navigate to="/login" />
        } />
        <Route path="/sessions/:id/analytics" element={
          user ? <SessionAnalyticsPage /> : <Navigate to="/login" />
        } />
        <Route path="/clo-mapping" element={
          user ? <CLOAnalyticsPage /> : <Navigate to="/login" />
        } />
        <Route path="/subscription" element={
          user ? <SubscriptionPage /> : <Navigate to="/login" />
        } />

        {/* Payment callback routes */}
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/failed" element={<PaymentFailedPage />} />
        <Route path="/payment/cancelled" element={<PaymentCancelledPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

---

## Tech Stack Comparison

### Option 1: Current Stack (Cloudflare + Supabase) ⭐ RECOMMENDED

#### Pros
- ✅ **Already implemented** - Your current system uses Supabase
- ✅ **Built-in authentication** - Supabase Auth handles everything
- ✅ **Real-time capabilities** - WebSocket subscriptions included
- ✅ **PostgreSQL** - Full SQL database with RLS (Row Level Security)
- ✅ **Auto-generated APIs** - REST and GraphQL endpoints
- ✅ **File storage** - Built-in storage for images/documents
- ✅ **Edge functions** - Serverless functions at the edge
- ✅ **Global CDN** - Fast delivery worldwide via Cloudflare
- ✅ **Free tier** - 500MB database, 50,000 monthly active users
- ✅ **Modern stack** - TypeScript, React, Vite

#### Cons
- ⚠️ **Email control** - Limited SMTP control (must use Supabase or external)
- ⚠️ **Vendor lock-in** - Some features tied to Supabase
- ⚠️ **Costs scale** - Can get expensive at high usage

#### Email Solution
**Use Custom SMTP with Supabase Edge Functions:**
```typescript
// Supabase Edge Function: send-email
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SmtpClient } from 'https://deno.land/x/smtp/mod.ts'

serve(async (req) => {
  const { to, subject, html } = await req.json()

  const client = new SmtpClient()
  await client.connectTLS({
    hostname: Deno.env.get('SMTP_HOST'),
    port: 587,
    username: Deno.env.get('SMTP_USER'),
    password: Deno.env.get('SMTP_PASSWORD')
  })

  await client.send({
    from: Deno.env.get('FROM_EMAIL'),
    to: to,
    subject: subject,
    content: html,
    html: html
  })

  await client.close()

  return new Response(JSON.stringify({ success: true }))
})
```

**Or use SendGrid/Mailgun/AWS SES:**
- Full control over email templates
- Delivery tracking
- Better deliverability

#### SSLCommerz Integration
**Using Supabase Edge Function:**
```typescript
// Edge function: initiate-payment
serve(async (req) => {
  const { userId, planId } = await req.json()

  // Create transaction record
  const { data: transaction } = await supabaseClient
    .from('payment_transactions')
    .insert({ user_id: userId, plan_id: planId })
    .select()
    .single()

  // Call SSLCommerz API
  const sslResponse = await fetch('https://sandbox.sslcommerz.com/gwprocess/v4/api.php', {
    method: 'POST',
    body: new URLSearchParams({
      store_id: Deno.env.get('SSLCOMMERZ_STORE_ID'),
      store_passwd: Deno.env.get('SSLCOMMERZ_STORE_PASSWORD'),
      tran_id: transaction.transaction_id,
      // ... other params
    })
  })

  return new Response(JSON.stringify(await sslResponse.json()))
})
```

#### Cost Estimate (Monthly)
- **Free tier**: $0 (up to 500MB DB, 50K users)
- **Pro tier**: $25/month (8GB DB, 100K users, better support)
- **Cloudflare**: Free (or $20/month for Pro features)
- **Total**: $0-$45/month

---

### Option 2: Hostinger + PHP + MySQL

#### Pros
- ✅ **Full control** - Complete access to server, email, files
- ✅ **Cheap** - $3-10/month for shared hosting
- ✅ **PHP familiarity** - Easy to find developers
- ✅ **Direct SMTP** - Full email configuration
- ✅ **No vendor lock-in** - Can move anywhere

#### Cons
- ❌ **Need to rebuild backend** - All Supabase code must be rewritten
- ❌ **Manual auth** - Implement JWT, sessions, password reset
- ❌ **No real-time** - Would need WebSockets or polling
- ❌ **Slower development** - More boilerplate code
- ❌ **Security burden** - You handle SQL injection, XSS, etc.
- ❌ **Scaling issues** - Shared hosting has limits
- ❌ **No auto APIs** - Must write every endpoint manually

#### Example Backend Structure
```
backend/
├── config/
│   ├── database.php
│   └── mail.php
├── controllers/
│   ├── AuthController.php
│   ├── CourseController.php
│   ├── SessionController.php
│   └── PaymentController.php
├── models/
│   ├── User.php
│   ├── Course.php
│   └── Transaction.php
├── middleware/
│   └── AuthMiddleware.php
└── routes/
    └── api.php
```

#### Email Solution
**Direct PHPMailer/SMTP:**
```php
use PHPMailer\PHPMailer\PHPMailer;

$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = 'smtp.your-domain.com';
$mail->SMTPAuth = true;
$mail->Username = 'noreply@your-domain.com';
$mail->Password = 'your-password';
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port = 587;

$mail->setFrom('noreply@your-domain.com', 'Class Response System');
$mail->addAddress($userEmail, $userName);
$mail->Subject = 'Welcome to Class Response System';
$mail->Body = $htmlContent;
$mail->send();
```

#### Cost Estimate (Monthly)
- **Hostinger Premium**: $4-10/month
- **SSL Certificate**: Free (Let's Encrypt)
- **Total**: $4-10/month

---

### Recommendation: Stick with Supabase + Add Email Service

**Best approach for your case:**

1. **Keep Supabase** - Your system is already built on it
2. **Add custom email** via Edge Function + SMTP/SendGrid
3. **SSLCommerz integration** via Edge Function
4. **Deploy on Cloudflare Pages** - Free, fast, global

**Why?**
- ✅ Minimal migration work
- ✅ Modern, scalable architecture
- ✅ Better developer experience
- ✅ Easier to maintain
- ✅ Can add full email control
- ✅ Professional and reliable

**Email Setup Options:**

| Service | Cost | Features |
|---------|------|----------|
| **SendGrid** | Free (100/day), $15/mo (40K/mo) | Templates, analytics, high deliverability |
| **Mailgun** | Free (5K/mo), $35/mo (50K/mo) | Developer-friendly, good API |
| **AWS SES** | $0.10 per 1,000 emails | Cheapest, requires AWS account |
| **Custom SMTP** | Free (if you have domain) | Full control, needs server setup |

**My recommendation:** Use **SendGrid** for emails
- Easy integration
- Free tier sufficient for starting
- Built-in templates
- Good deliverability
- Email tracking

---

## Payment Integration (SSLCommerz)

### Setup Steps

1. **Register with SSLCommerz**
   - Go to https://sslcommerz.com
   - Sign up for merchant account
   - Get Store ID and Store Password
   - Start with Sandbox mode

2. **Configure Environment Variables**
```env
# .env
VITE_SSLCOMMERZ_STORE_ID=your_store_id
VITE_SSLCOMMERZ_STORE_PASSWORD=your_store_password
VITE_SSLCOMMERZ_IS_LIVE=false
```

3. **Create Supabase Edge Function**
```bash
supabase functions new payment-webhook
```

4. **Implement Webhook Handler**
```typescript
// Handle IPN (Instant Payment Notification) from SSLCommerz
serve(async (req) => {
  const data = await req.json()

  if (data.status === 'VALID' || data.status === 'VALIDATED') {
    // Update transaction
    await supabaseClient
      .from('payment_transactions')
      .update({
        payment_status: 'success',
        completed_at: new Date().toISOString(),
        sslcommerz_data: data
      })
      .eq('transaction_id', data.tran_id)

    // Update user subscription
    const { data: transaction } = await supabaseClient
      .from('payment_transactions')
      .select('*, subscription_plans(*)')
      .eq('transaction_id', data.tran_id)
      .single()

    if (transaction) {
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + transaction.subscription_plans.duration_months)

      await supabaseClient
        .from('users')
        .update({
          subscription_tier: transaction.subscription_plans.name,
          subscription_status: 'active',
          subscription_expires_at: expiresAt.toISOString()
        })
        .eq('id', transaction.user_id)
    }
  }

  return new Response('OK')
})
```

### Payment Flow

```
User clicks "Upgrade"
  ↓
Frontend calls initiatePayment()
  ↓
Create transaction record (pending)
  ↓
Call SSLCommerz API
  ↓
Redirect user to payment gateway
  ↓
User completes payment
  ↓
SSLCommerz redirects to success URL
  ↓
Frontend validates with backend
  ↓
Backend validates with SSLCommerz
  ↓
Update transaction (success)
  ↓
Update user subscription
  ↓
Send confirmation email
```

---

## Email & Security

### Email Configuration

#### Option 1: SendGrid (Recommended)
```typescript
// Supabase Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { to, subject, html } = await req.json()

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }]
      }],
      from: {
        email: Deno.env.get('FROM_EMAIL'),
        name: 'Class Response System'
      },
      subject: subject,
      content: [{
        type: 'text/html',
        value: html
      }]
    })
  })

  return new Response(JSON.stringify({ success: response.ok }))
})
```

**Environment Variables:**
```env
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@your-domain.com
```

#### Option 2: Custom SMTP
```typescript
// Using Deno SMTP client
import { SmtpClient } from 'https://deno.land/x/smtp/mod.ts'

const client = new SmtpClient()
await client.connectTLS({
  hostname: Deno.env.get('SMTP_HOST'),
  port: 587,
  username: Deno.env.get('SMTP_USER'),
  password: Deno.env.get('SMTP_PASSWORD')
})

await client.send({
  from: Deno.env.get('FROM_EMAIL'),
  to: to,
  subject: subject,
  content: html,
  html: html
})

await client.close()
```

**Environment Variables:**
```env
SMTP_HOST=smtp.your-domain.com
SMTP_PORT=587
SMTP_USER=noreply@your-domain.com
SMTP_PASSWORD=your-password
FROM_EMAIL=noreply@your-domain.com
```

### Security Implementation

#### 1. Row Level Security (RLS)
Already implemented in Phase 1 migrations - ensures users can only access their own data.

#### 2. Two-Factor Authentication (2FA)
```typescript
// Enable 2FA
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp'
})

// Generate QR code for user to scan
const qrCode = data.totp.qr_code

// Verify 2FA code
const { data: verified, error } = await supabase.auth.mfa.verify({
  factorId: factorId,
  challengeId: challengeId,
  code: userEnteredCode
})
```

#### 3. Rate Limiting
```typescript
// Supabase Edge Function middleware
const rateLimiter = new Map()

function checkRateLimit(ip: string, limit: number, window: number) {
  const now = Date.now()
  const key = `${ip}:${Math.floor(now / window)}`

  const current = rateLimiter.get(key) || 0
  if (current >= limit) {
    return false
  }

  rateLimiter.set(key, current + 1)
  return true
}

serve(async (req) => {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  if (!checkRateLimit(ip, 100, 60000)) { // 100 requests per minute
    return new Response('Too many requests', { status: 429 })
  }

  // Handle request
})
```

#### 4. Content Security Policy
```typescript
// Cloudflare Pages Headers
export const onRequest: PagesFunction = async (context) => {
  const response = await context.next()

  response.headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://*.supabase.co"
  )
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}
```

#### 5. Input Validation
```typescript
// Use Zod for validation
import { z } from 'zod'

const courseSchema = z.object({
  course_code: z.string().min(3).max(20).regex(/^[A-Z0-9-]+$/),
  course_title: z.string().min(5).max(200),
  credit_hours: z.number().min(1).max(6),
  sections: z.array(z.string()).min(1)
})

function validateCourse(data: unknown) {
  return courseSchema.safeParse(data)
}
```

#### 6. Session Management
```typescript
// Automatic session refresh
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Session refreshed')
  }

  if (event === 'SIGNED_OUT') {
    // Clear local data
    localStorage.clear()
    window.location.href = '/login'
  }
})

// Set session timeout (Supabase default is 1 hour, refresh token 1 week)
```

#### 7. Audit Logging
```sql
-- Keep activity_logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_action ON activity_logs(action_type, created_at DESC);
```

```typescript
// Log sensitive actions
async function logActivity(
  userId: string,
  actionType: string,
  resourceType: string,
  resourceId: string,
  details: any
) {
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action_type: actionType,
    resource_type: resourceType,
    resource_id: resourceId,
    details: details,
    ip_address: getClientIp(),
    user_agent: navigator.userAgent
  })
}

// Example usage
await logActivity(
  user.id,
  'payment_initiated',
  'transaction',
  transaction.id,
  { amount: transaction.amount, plan: transaction.plan_id }
)
```

---

## Timeline & Effort

### Detailed Schedule

| Phase | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| **Phase 1** | Database migrations (10 files) | 2 days | None |
| **Phase 2** | Payment service implementation | 1 day | Phase 1 |
| | Email service implementation | 1 day | Phase 1 |
| **Phase 3** | Remove admin features | 0.5 days | Phase 1 |
| | Update authentication | 0.5 days | Phase 1 |
| | Subscription UI components | 1 day | Phase 2 |
| | Session code display | 0.5 days | Phase 1 |
| | Update routing | 0.5 days | All above |
| | Course management updates | 1 day | Phase 1 |
| **Phase 4** | Backend API updates | 1 day | Phase 1, 2 |
| **Phase 5** | Data migration scripts | 0.5 days | Phase 1 |
| | Data migration execution | 0.5 days | All migrations |
| **Phase 6** | Database testing | 1 day | Phase 5 |
| | Frontend testing | 1 day | Phase 3 |
| | Integration testing | 1 day | All phases |
| | SSLCommerz testing | 0.5 days | Phase 2 |
| | Email testing | 0.5 days | Phase 2 |
| **Phase 7** | Staging deployment | 0.5 days | Phase 6 |
| | Production deployment | 0.5 days | Testing complete |
| | Monitoring setup | 0.5 days | Deployment |

**Total Estimated Time: 15-17 days**

### Parallel Work Opportunities
- Email service can be developed parallel to payment service
- Frontend components can start once migrations are done
- Testing can begin as features are completed

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss during migration | HIGH | LOW | Full database backup, rollback scripts, staged migration |
| Payment integration issues | MEDIUM | MEDIUM | Sandbox testing, SSLCommerz support, transaction logging |
| Email deliverability problems | MEDIUM | LOW | Use reputable service (SendGrid), SPF/DKIM setup, monitor bounce rates |
| Breaking existing workflows | MEDIUM | MEDIUM | Feature parity testing, user acceptance testing, gradual rollout |
| RLS policy gaps | HIGH | LOW | Comprehensive security audit, penetration testing |
| Performance degradation | MEDIUM | LOW | Database indexing, query optimization, load testing |
| User adoption issues | MEDIUM | MEDIUM | Clear migration guide, onboarding tutorials, support documentation |
| SSLCommerz downtime | LOW | LOW | Status page monitoring, fallback to manual payment |

### Rollback Plan

1. **Database Rollback**
   ```bash
   # Restore from backup
   psql -h db.xxx.supabase.co -U postgres -d postgres < backup_before_migration.sql
   ```

2. **Code Rollback**
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main
   ```

3. **DNS Rollback** (if needed)
   - Point domain back to old system
   - Update Cloudflare DNS records

---

## Next Steps

### Immediate Actions

1. **Review this plan** - Discuss with stakeholders
2. **Choose tech stack** - Supabase vs PHP/MySQL
3. **Get SSLCommerz credentials** - Register and get sandbox access
4. **Choose email service** - SendGrid vs Custom SMTP
5. **Set up development environment** - Branch, backup, test database

### Week 1: Database & Backend
- ✅ Create all migration files
- ✅ Test migrations on development database
- ✅ Implement payment service
- ✅ Implement email service
- ✅ Create Edge Functions

### Week 2: Frontend & Integration
- ✅ Remove admin features
- ✅ Update authentication
- ✅ Build subscription UI
- ✅ Update session management
- ✅ Integration testing

### Week 3: Testing & Deployment
- ✅ Full system testing
- ✅ SSLCommerz payment testing
- ✅ Email delivery testing
- ✅ Security audit
- ✅ Staging deployment
- ✅ Production deployment

---

## Success Criteria

The conversion is successful when:

- ✅ Teachers can self-register without approval
- ✅ Teachers can create courses without organization constraints
- ✅ Sessions generate autonomous codes automatically
- ✅ Students can access sessions anonymously
- ✅ Payment system works end-to-end
- ✅ Email notifications are delivered
- ✅ CLO/PLO mapping works as before
- ✅ Analytics dashboards function correctly
- ✅ No data loss from migration
- ✅ Performance is acceptable (< 2s page load)
- ✅ Security audit passes
- ✅ All tests pass

---

## Conclusion

This plan provides a comprehensive roadmap to transform your Class Response System from a complex multi-role university management system into a streamlined, teacher-focused platform.

**Key Takeaways:**

1. **Keep Supabase** - Minimal migration work, modern architecture
2. **Add SendGrid** - Professional email with full control
3. **Integrate SSLCommerz** - Handle payments via Edge Functions
4. **Preserve core features** - CLO/PLO mapping, analytics, anonymous access
5. **15-17 days** - Realistic timeline with testing
6. **Low risk** - Comprehensive backup and rollback strategy

**Ready to proceed?** Let's start with Phase 1 migrations!

---

**Document Version:** 1.0
**Last Updated:** January 21, 2026
**Author:** Claude Code Assistant
