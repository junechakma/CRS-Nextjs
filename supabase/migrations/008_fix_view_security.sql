-- ============================================================================
-- CRS - Fix View Security (Security Invoker)
-- This migration fixes the SECURITY DEFINER warnings by setting views to
-- use SECURITY INVOKER, which respects RLS policies of the querying user
-- ============================================================================

-- Set security_invoker on all views to respect RLS policies

ALTER VIEW teacher_dashboard_stats SET (security_invoker = on);
ALTER VIEW super_admin_dashboard_stats SET (security_invoker = on);
ALTER VIEW plan_distribution SET (security_invoker = on);
ALTER VIEW course_stats SET (security_invoker = on);
ALTER VIEW session_details SET (security_invoker = on);
ALTER VIEW clo_set_stats SET (security_invoker = on);
ALTER VIEW recent_activity SET (security_invoker = on);
ALTER VIEW monthly_response_trends SET (security_invoker = on);
ALTER VIEW teacher_monthly_trends SET (security_invoker = on);
ALTER VIEW top_performing_teachers SET (security_invoker = on);
ALTER VIEW subscription_usage SET (security_invoker = on);
ALTER VIEW question_response_distribution SET (security_invoker = on);
