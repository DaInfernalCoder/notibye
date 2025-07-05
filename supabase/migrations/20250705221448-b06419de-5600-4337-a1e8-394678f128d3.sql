-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user integrations table for storing API keys and service connections
CREATE TABLE public.user_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('stripe', 'posthog', 'resend')),
  api_key TEXT NOT NULL,
  additional_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_type)
);

-- Create churn events table
CREATE TABLE public.churn_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sent emails table
CREATE TABLE public.sent_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  churn_event_id UUID REFERENCES public.churn_events(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_content TEXT NOT NULL,
  usage_summary JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churn_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for user_integrations
CREATE POLICY "Users can view their own integrations" 
ON public.user_integrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations" 
ON public.user_integrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" 
ON public.user_integrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations" 
ON public.user_integrations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for churn_events
CREATE POLICY "Users can view their own churn events" 
ON public.churn_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own churn events" 
ON public.churn_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for sent_emails
CREATE POLICY "Users can view their own sent emails" 
ON public.sent_emails 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sent emails" 
ON public.sent_emails 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_integrations_updated_at
  BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();