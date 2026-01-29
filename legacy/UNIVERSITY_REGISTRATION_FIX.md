# University Registration Flow Fix

## Problem Description

When a university admin registered and submitted their university application, they were not appearing in the "Pending University Applications" section of the Super Admin Dashboard. Instead, they were showing in "Other Pending User Approvals" section or the application status page showed "No application found".

## Root Causes

1. **Issue 1**: The `register_university_admin()` database function was setting new university admin users with `status: 'active'` and `approval_status: 'approved'` immediately, when they should be 'pending' until approved.

2. **Issue 2**: The registration flow was a 2-step process:
   - Step 1: User creates account (via Supabase Auth)
   - Step 2: User submits university application
   - There was no link between the user record and their application, causing the "No application found" issue.

3. **Issue 3**: Users without applications were appearing mixed with users who had submitted applications.

## Solutions Implemented

### 1. Fixed User Status (Migration: `20251101150000_fix_university_registration_flow.sql`)

Updated the `register_university_admin()` function to set new university admin users with:
- `status`: 'pending'
- `approval_status`: 'pending'
- `application_date`: NOW()

### 2. Added Application Linkage (Migration: `20251101160000_add_application_id_to_users.sql`)

- Added `application_id` column to `users` table to link users with their university applications
- Updated `UniversityApplicationForm.tsx` to set `application_id` when creating/updating applications
- This solves the "No application found" issue

### 3. Updated Dashboard Queries

- Modified `SuperAdminService.getPendingUsers()` to exclude university admins who have submitted applications
- University admins with applications now appear ONLY in "Pending University Applications" section
- Other users appear in "Other Pending User Approvals" section

Now when a university admin registers and submits their application:
1. ✅ User is created with pending status
2. ✅ User submits application → `application_id` is set on user record
3. ✅ Application appears in "Pending University Applications" section
4. ✅ Application status page shows their application correctly
5. ✅ Super admin can approve → University created, user activated, all IDs linked

## What Happens on Approval

When a Super Admin approves a university application using the `approve_university_application()` function:

1. ✅ Creates a new university record in the `universities` table
2. ✅ Updates the user's `university_id` to link them to the new university
3. ✅ Sets the user's `status` to 'active' and `approval_status` to 'approved'
4. ✅ Sets the university's `admin_id` to the user's ID
5. ✅ Updates the application status to 'approved' in `university_applications` table

## Files Changed

1. **Database Migrations**:
   - `supabase/migrations/20251101150000_fix_university_registration_flow.sql` - Fixed `register_university_admin()` function
   - `supabase/migrations/20251101160000_add_application_id_to_users.sql` - Added `application_id` column to users table
   - `supabase/migrations/20251101170000_fix_university_applications_rls.sql` - Fixed Row Level Security policies

2. **Frontend Components**:
   - `src/features/university-admin/components/UniversityApplicationForm.tsx:161-198` - Updated to set `application_id` on user record
   - `src/features/super-admin/services/superAdminService.ts:120-151` - Updated `getPendingUsers()` to exclude university admins with applications

3. **No Changes Needed** (already working correctly):
   - `src/features/super-admin/pages/SuperAdminDashboard.tsx` - Dashboard display logic
   - `src/features/university-admin/pages/ApplicationPendingPage.tsx` - Now works correctly with `application_id` link

## Testing Instructions

### Test the Complete Flow:

1. **Register a New University Admin**:
   - Navigate to `/register/university-admin`
   - Fill out the registration form with:
     - Admin name, email, password, phone
   - Submit the form

2. **Submit University Application**:
   - After registration, you'll be redirected to the application form
   - Fill out university details:
     - University name
     - University code (unique, e.g., "TEST01")
     - Address, city, state, country
     - Contact information
   - Submit the application

3. **Verify Pending Status**:
   - Log in as Super Admin
   - Navigate to the Super Admin Dashboard
   - Check the "Pending University Applications" section
   - You should see the new application with:
     - University name
     - University code
     - Admin name and email
     - Application date
     - Action buttons (View, Approve, Reject)

4. **Approve the Application**:
   - Click "Approve" on the application
   - Verify success message

5. **Verify Approval Results**:
   - Check that the university now appears in the Universities list
   - Verify the university admin can now log in
   - Verify the user's `university_id` is set correctly
   - Verify the university's `admin_id` is set to the user's ID
   - Check that the application status is 'approved' in the database

### Database Verification Queries:

```sql
-- Check pending applications
SELECT * FROM university_applications WHERE application_status = 'pending';

-- Check user status with application linkage
SELECT
    id,
    name,
    email,
    role,
    status,
    approval_status,
    university_id,
    application_id
FROM users
WHERE role = 'university_admin';

-- Check users linked to applications
SELECT
    u.id as user_id,
    u.name as user_name,
    u.email,
    u.status,
    u.application_id,
    ua.id as app_id,
    ua.university_name,
    ua.university_code,
    ua.application_status
FROM users u
LEFT JOIN university_applications ua ON u.application_id = ua.id
WHERE u.role = 'university_admin'
ORDER BY u.created_at DESC;

-- Check universities
SELECT id, name, code, admin_id FROM universities_decrypted;

-- Verify complete user-application-university linkage
SELECT
    u.name as user_name,
    u.email,
    u.status as user_status,
    u.application_id,
    ua.university_name,
    ua.university_code,
    ua.application_status,
    u.university_id,
    uni.name as actual_university_name,
    uni.admin_id
FROM users u
LEFT JOIN university_applications ua ON u.application_id = ua.id
LEFT JOIN universities_decrypted uni ON u.university_id = uni.id
WHERE u.role = 'university_admin'
ORDER BY u.created_at DESC;
```

## Migrations Applied

All migrations have been applied to the production database successfully on 2025-11-01:
1. ✅ `20251101150000_fix_university_registration_flow.sql` - Fixed user registration status
2. ✅ `20251101160000_add_application_id_to_users.sql` - Added application_id column
3. ✅ `20251101170000_fix_university_applications_rls.sql` - Fixed Row Level Security policies

## Current Registration Flow

### For New University Admins:

1. **Registration** (`/register/university-admin`):
   - User creates account with email, password, name
   - User record created with `status: 'pending'`, `approval_status: 'pending'`
   - No `application_id` yet

2. **Email Verification**:
   - User receives verification email from Supabase Auth
   - User clicks link to verify email

3. **Login & Application Submission** (`/university-admin/apply`):
   - User logs in and is redirected to application form
   - User fills out university details
   - Application created in `university_applications` table
   - User record updated with `application_id` link

4. **Pending Status** (`/university-admin/pending`):
   - Application status page now correctly shows the application
   - User can see: university name, code, status, dates
   - User can edit/resubmit if needed

5. **Super Admin Approval** (Dashboard):
   - Application appears in "Pending University Applications" section
   - Super admin clicks "Approve"
   - Function executes: creates university, links user, activates account

6. **Post-Approval**:
   - User can now access university admin dashboard
   - University appears in universities list
   - All relationships properly linked

## Row Level Security Policies

The following RLS policies are now active on `university_applications` table:

1. **authenticated_select_own_application**: Users can view their own applications, super admins can view all
2. **authenticated_insert_own_application**: University admins can create their applications
3. **authenticated_update_own_application**: Users can update their pending applications
4. **super_admin_full_access**: Super admins have full CRUD access to all applications

These policies ensure:
- ✅ Authenticated users can create applications without RLS violations
- ✅ Users can only see and edit their own applications
- ✅ Super admins can manage all applications
- ✅ Security is maintained while allowing proper functionality

## Notes

- The approval flow properly handles encryption of university data (including the university code)
- Email notifications are sent to all super admins when a new application is submitted
- The `check_university_code_exists()` function handles checking encrypted codes correctly
- All Row Level Security (RLS) policies are properly configured for the application flow
- The `application_id` column provides a clear link between users and their applications, solving the "No application found" issue
- RLS policies use `auth.uid()` to check the authenticated user's ID against the `user_id` in applications
