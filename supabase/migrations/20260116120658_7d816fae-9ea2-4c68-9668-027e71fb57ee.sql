-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to keep the project alive every 6 days
-- Runs at 3:00 AM UTC every 6 days
SELECT cron.schedule(
  'keep-alive-ping',
  '0 3 */6 * *',
  $$
  SELECT net.http_post(
    url := 'https://bjxocgkgatkogdmzrrfk.supabase.co/functions/v1/keep-alive',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqeG9jZ2tnYXRrb2dkbXpycmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzU2NTAsImV4cCI6MjA3ODgxMTY1MH0.5q5E46dkx5io3usx3LRPYJrWyo-IePbaP1JI2sD-FmI"}'::jsonb,
    body := '{"source": "cron", "timestamp": "' || now()::text || '"}'::jsonb
  ) AS request_id;
  $$
);