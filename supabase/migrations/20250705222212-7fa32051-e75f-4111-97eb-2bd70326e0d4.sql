-- Create waitlist signups table
CREATE TABLE public.waitlist_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add webhook events table for storing Stripe webhook data
CREATE TABLE public.webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  customer_id TEXT,
  customer_email TEXT,
  event_data JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add usage analytics table for PostHog data
CREATE TABLE public.usage_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  total_events INTEGER DEFAULT 0,
  active_days INTEGER DEFAULT 0,
  most_used_feature TEXT,
  last_seen TIMESTAMP WITH TIME ZONE,
  engagement_score DECIMAL(3,2) DEFAULT 0.0,
  analytics_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for webhook_events
CREATE POLICY "Users can view their own webhook events" 
ON public.webhook_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own webhook events" 
ON public.webhook_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for usage_analytics
CREATE POLICY "Users can view their own usage analytics" 
ON public.usage_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own usage analytics" 
ON public.usage_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for waitlist_signups (public read)
CREATE POLICY "Anyone can view waitlist signups" 
ON public.waitlist_signups 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert waitlist signups" 
ON public.waitlist_signups 
FOR INSERT 
WITH CHECK (true);