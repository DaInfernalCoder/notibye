-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run the process-triggers function every hour
SELECT cron.schedule(
  'process-triggers-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
      url:='https://celmmsdzizebswawmdee.supabase.co/functions/v1/process-triggers',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbG1tc2R6aXplYnN3YXdtZGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDgwNTMsImV4cCI6MjA2NzIyNDA1M30.92JMtwj-8tXbSArQecKkpyuCcTqBy6Kwn5gwgMF4MOA"}'::jsonb,
      body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Also create a daily cron job for daily triggers
SELECT cron.schedule(
  'process-triggers-daily',
  '0 9 * * *', -- Every day at 9 AM
  $$
  SELECT
    net.http_post(
      url:='https://celmmsdzizebswawmdee.supabase.co/functions/v1/process-triggers',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbG1tc2R6aXplYnN3YXdtZGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDgwNTMsImV4cCI6MjA2NzIyNDA1M30.92JMtwj-8tXbSArQecKkpyuCcTqBy6Kwn5gwgMF4MOA"}'::jsonb,
      body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Create a weekly cron job for weekly triggers  
SELECT cron.schedule(
  'process-triggers-weekly',
  '0 9 * * 1', -- Every Monday at 9 AM
  $$
  SELECT  
    net.http_post(
      url:='https://celmmsdzizebswawmdee.supabase.co/functions/v1/process-triggers',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbG1tc2R6aXplYnN3YXdtZGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDgwNTMsImV4cCI6MjA2NzIyNDA1M30.92JMtwj-8tXbSArQecKkpyuCcTqBy6Kwn5gwgMF4MOA"}'::jsonb,
      body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);