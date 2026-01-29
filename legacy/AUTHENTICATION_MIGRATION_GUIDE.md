# Authentication Migration Guide: Custom Auth → Supabase Auth + RLS

## Overview

This guide explains how to migrate the Class Response System from custom authentication (password_hash in users table) to Supabase Auth, enabling Row Level Security (RLS) for enhanced database security.

## What Changed

### 1. Database Schema
- **Added**: `auth_user_id` column to `users` table (links to Supabase `auth.users`)
- **Created**: Database triggers to auto-create user profiles when signing up via Supabase Auth
- **Updated**: RLS helper functions to use `auth_user_id` instead of `id`

### 2. Authentication Flow
- **Before**: Custom password hashing stored in `password_hash`, localStorage session management
- **After**: Supabase Auth handles authentication, automatic JWT-based sessions

### 3. Frontend Services
- **AuthService**: Now uses `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()`
- **Session Management**: Automatic via Supabase (no manual localStorage)
- **User Retrieval**: Uses `supabase.auth.getSession()` to get current user

## Migration Steps

### Step 1: Apply Database Migrations

Start Docker Desktop, then run:

```bash
# Reset local database with all migrations
supabase db reset

# Or apply migrations to production
supabase db push
```

This applies three new migrations:
1. `20251026000000_add_auth_user_id.sql` - Adds auth_user_id column
2. `20251026000001_auth_triggers.sql` - Creates auto-sync triggers
3. `20251025180000_enable_rls.sql` - Enables RLS with updated policies

### Step 2: Migrate Existing Users (If Any)

If you have existing users with `password_hash`, you need to migrate them. Here's a recommended approach:

#### Option A: User Self-Migration (Recommended)
Users migrate themselves by using the "Forgot Password" flow:

1. User clicks "Forgot Password"
2. System creates a Supabase Auth user with their email
3. User sets a new password
4. System links the auth user to their profile

#### Option B: Admin-Assisted Migration
Create a migration script to:

1. Create Supabase Auth users for all existing users
2. Send password reset emails to all users
3. Users set new passwords on first login

**Example migration script:**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function migrateUsers() {
  // Get all users without auth_user_id
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .is('auth_user_id', null)

  for (const user of users) {
    // Create auth user (they'll need to reset password)
    const { data: authUser, error } = await supabase.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        role: user.role,
        university_id: user.university_id,
        faculty_id: user.faculty_id,
        department_id: user.department_id,
      }
    })

    if (!error && authUser) {
      // Update user profile with auth_user_id
      await supabase
        .from('users')
        .update({ auth_user_id: authUser.user.id })
        .eq('id', user.id)

      // Send password reset email
      await supabase.auth.resetPasswordForEmail(user.email)
    }
  }
}
```

### Step 3: Test the New Authentication Flow

#### Testing Sign Up
```typescript
// New users automatically get auth.users entry
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'SecurePassword123!',
  options: {
    data: {
      name: 'Test User',
      role: 'student',
      university_id: 'uuid-here'
    }
  }
})

// Trigger automatically creates profile in public.users
```

#### Testing Sign In
```typescript
// Sign in with Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'SecurePassword123!'
})

// Get user profile (includes RLS context)
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('auth_user_id', data.user.id)
  .single()
```

#### Testing RLS
```typescript
// As a teacher, query should only return their courses
const { data: courses } = await supabase
  .from('courses')
  .select('*')

// RLS automatically filters based on auth.uid()
```

### Step 4: Update Environment Variables (if needed)

Ensure you have the correct Supabase keys:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Note**: Do NOT use the service role key in frontend code!

## Key Benefits of This Migration

### 1. Database-Level Security
- **Before**: Anyone with anon key could query any table
- **After**: RLS policies enforce row-level access control
- **Result**: Data is protected even if someone gets your anon key

### 2. Proper Session Management
- **Before**: Manual localStorage, no token expiration
- **After**: JWT tokens with automatic refresh and expiration
- **Result**: More secure session handling

### 3. Built-in Features
- **Email verification**: Supabase handles email confirmation
- **Password reset**: Built-in forgot password flow
- **OAuth**: Easy to add social logins later
- **MFA**: Can enable multi-factor authentication

### 4. Compliance Ready
- **GDPR**: Supabase Auth is GDPR compliant
- **Security**: Industry-standard authentication
- **Audit**: Built-in user activity tracking

## RLS Policy Examples

Here's how RLS protects your data:

### Users can only see their own data
```sql
-- Students can only see their own responses
CREATE POLICY "students_select_own_responses"
ON "public"."responses"
FOR SELECT
TO authenticated
USING (student_id = auth.uid()::text);
```

### Role-based access
```sql
-- Teachers can see courses they teach
CREATE POLICY "teachers_select_own_courses"
ON "public"."courses"
FOR SELECT
TO authenticated
USING (
  teacher_id = get_current_user_id()
  OR get_current_user_role() IN ('super_admin', 'university_admin')
);
```

## Troubleshooting

### Issue: "User not found" after migration
**Solution**: User needs to be migrated to Supabase Auth first

### Issue: "Permission denied" errors
**Solution**: Check that RLS policies are correctly applied and user has proper role

### Issue: "Invalid JWT" errors
**Solution**: Clear browser storage and sign in again

### Issue: Existing users can't log in
**Solution**: They need to use "Forgot Password" to migrate their account

## Rollback Plan (Emergency Only)

If you need to rollback:

1. Revert the authService changes
2. Drop RLS policies: `ALTER TABLE users DISABLE ROW LEVEL SECURITY`
3. Continue using password_hash authentication

**Note**: Not recommended as it removes security improvements

## Next Steps After Migration

1. **Monitor**: Check Supabase Auth dashboard for user sign-ups
2. **Email Templates**: Customize email templates in Supabase dashboard
3. **MFA**: Consider enabling multi-factor authentication
4. **OAuth**: Add social login providers (Google, GitHub, etc.)
5. **Analytics**: Set up user analytics and monitoring

## Support

If you encounter issues:
1. Check Supabase Auth logs in dashboard
2. Review RLS policies: `SELECT * FROM pg_policies WHERE schemaname = 'public'`
3. Test with different user roles
4. Consult Supabase documentation: https://supabase.com/docs/guides/auth

## Summary

This migration transforms your authentication from a custom implementation to a production-ready, secure system with:

- ✅ Row Level Security (database-level protection)
- ✅ JWT-based sessions (secure, auto-refreshing)
- ✅ Built-in email verification and password reset
- ✅ Scalable architecture (ready for OAuth, MFA)
- ✅ GDPR compliance
- ✅ Protection against common security vulnerabilities

The system is now significantly more secure and maintainable!
