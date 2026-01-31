# CRS Supabase Database Migrations

## Overview

This directory contains the SQL migration files for the Class Response System (CRS) database.

## Migration Files

| File | Description |
|------|-------------|
| `001_initial_schema.sql` | Core tables: users, subscriptions, courses, sessions, CLOs |
| `002_functions_and_triggers.sql` | Database functions and auto-update triggers |
| `003_rls_policies.sql` | Row Level Security policies for all tables |
| `004_indexes.sql` | Performance indexes for fast queries and pagination |
| `005_views_and_stats.sql` | Pre-computed views for dashboard statistics |
| `006_seed_data.sql` | Initial data: system settings, base templates |

## How to Run

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order (001 → 006)

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref tbfbrnqmbdvkbdcttnql

# Run migrations
supabase db push
```

### Option 3: Direct Connection

```bash
# Using psql
psql "postgresql://postgres:[PASSWORD]@db.tbfbrnqmbdvkbdcttnql.supabase.co:5432/postgres" -f 001_initial_schema.sql
```

## Database Schema

### Tables (12 total)

| Table | Purpose |
|-------|---------|
| `users` | User profiles (teachers, super_admin) |
| `subscriptions` | Plan management and usage tracking |
| `semesters` | Academic semesters |
| `courses` | Teacher courses with denormalized stats |
| `question_templates` | Feedback templates (base + custom) |
| `template_questions` | Questions within templates |
| `sessions` | Feedback collection sessions |
| `session_questions` | Questions copied to sessions |
| `session_responses` | Anonymous student responses |
| `response_answers` | Individual answers |
| `clo_sets` | Course Learning Outcome sets |
| `clos` | Individual CLOs |
| `clo_question_mappings` | AI-generated CLO mappings |
| `analytics_reports` | Stored analytics and AI insights |
| `activity_log` | Admin activity tracking |
| `system_settings` | System configuration |

### Views for Dashboard Stats

| View | Purpose |
|------|---------|
| `teacher_dashboard_stats` | Teacher's main dashboard statistics |
| `super_admin_dashboard_stats` | System-wide statistics |
| `course_stats` | Course-level aggregated statistics |
| `session_details` | Session information with response rates |
| `clo_set_stats` | CLO set statistics with mappings |
| `subscription_usage` | User subscription usage percentages |
| `question_response_distribution` | Answer distributions per question |

## Subscription Limits

| Feature | Free | Premium ($15/mo) | Custom |
|---------|------|------------------|--------|
| Courses | 5 | Unlimited | Custom |
| Sessions | 10 | Unlimited | Custom |
| AI Analytics | 10 | 100 | Unlimited |
| CLO Sets | 2 | Unlimited | Custom |

## Security

- **RLS Enabled**: All tables have Row Level Security
- **Role-Based Access**: Teachers see only their data, Super Admin sees all
- **Anonymous Submissions**: Students can submit without authentication

## Key Features

### Auto-Generated Access Codes
Sessions automatically get unique 8-character codes (e.g., `AB12-CD34`)

### Denormalized Statistics
Course and session stats are automatically updated via triggers for fast reads

### Subscription Tracking
Usage is automatically tracked and limits are enforced

### Activity Logging
All significant actions are logged for super admin dashboard

## Notes

- Run migrations in order (001 → 006)
- The `handle_new_user()` function auto-creates user profiles on signup
- Base templates (ID starting with 00000000-) are read-only for teachers
- Views should be used for dashboard queries to avoid expensive JOINs
