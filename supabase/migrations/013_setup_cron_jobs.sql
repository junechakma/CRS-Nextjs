-- ============================================================================
-- CRS - Automated Session Status Updates with pg_cron
-- ============================================================================

-- Enable pg_cron extension (requires superuser, should be enabled in Supabase dashboard)
-- If you get permission denied, enable pg_cron in your Supabase dashboard:
-- Dashboard > Database > Extensions > Search for "pg_cron" and enable it

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- SCHEDULE CRON JOBS
-- ============================================================================

-- Schedule auto-completion of expired sessions (runs every minute)
-- This checks for sessions with status='live' where end_time has passed
SELECT cron.schedule(
  'auto-complete-expired-sessions',  -- Job name
  '* * * * *',                        -- Cron expression: every minute
  $$SELECT auto_complete_expired_sessions();$$
);

-- Schedule auto-start of scheduled sessions (runs every minute)
-- This checks for sessions with status='scheduled' where start_time has arrived
SELECT cron.schedule(
  'auto-start-scheduled-sessions',   -- Job name
  '* * * * *',                        -- Cron expression: every minute
  $$SELECT auto_start_scheduled_sessions();$$
);

-- ============================================================================
-- VERIFY CRON JOBS
-- ============================================================================

-- View all scheduled cron jobs
-- SELECT * FROM cron.job;

-- View cron job run history
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- ============================================================================
-- CLEANUP (if needed)
-- ============================================================================

-- To remove a cron job if needed:
-- SELECT cron.unschedule('auto-complete-expired-sessions');
-- SELECT cron.unschedule('auto-start-scheduled-sessions');
