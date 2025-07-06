-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_visual BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create triggers table
CREATE TABLE public.triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  email_template_id UUID,
  frequency_type TEXT NOT NULL CHECK (frequency_type IN ('realtime', 'hourly', 'daily', 'weekly', 'custom')),
  frequency_value TEXT, -- for custom cron expressions
  is_active BOOLEAN DEFAULT true,
  warning_acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (email_template_id) REFERENCES public.email_templates(id) ON DELETE SET NULL
);

-- Create trigger conditions table
CREATE TABLE public.trigger_conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_id UUID NOT NULL,
  condition_type TEXT NOT NULL, -- 'usage_drop', 'no_activity', 'custom'
  field_name TEXT, -- PostHog field to monitor
  operator TEXT NOT NULL, -- 'greater_than', 'less_than', 'equals', 'not_equals'
  threshold_value NUMERIC,
  threshold_unit TEXT, -- 'percent', 'absolute', 'days'
  logical_operator TEXT DEFAULT 'AND', -- 'AND', 'OR' for combining conditions
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (trigger_id) REFERENCES public.triggers(id) ON DELETE CASCADE
);

-- Create trigger executions table
CREATE TABLE public.trigger_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_id UUID NOT NULL,
  customer_email TEXT NOT NULL,
  customer_id TEXT,
  execution_data JSONB DEFAULT '{}'::jsonb,
  email_sent BOOLEAN DEFAULT false,
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (trigger_id) REFERENCES public.triggers(id) ON DELETE CASCADE
);

-- Enable RLS on all tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trigger_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trigger_executions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_templates
CREATE POLICY "Users can view their own email templates" 
ON public.email_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email templates" 
ON public.email_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email templates" 
ON public.email_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email templates" 
ON public.email_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for triggers
CREATE POLICY "Users can view their own triggers" 
ON public.triggers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own triggers" 
ON public.triggers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own triggers" 
ON public.triggers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own triggers" 
ON public.triggers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for trigger_conditions
CREATE POLICY "Users can view their own trigger conditions" 
ON public.trigger_conditions 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.triggers WHERE id = trigger_id));

CREATE POLICY "Users can create their own trigger conditions" 
ON public.trigger_conditions 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM public.triggers WHERE id = trigger_id));

CREATE POLICY "Users can update their own trigger conditions" 
ON public.trigger_conditions 
FOR UPDATE 
USING (auth.uid() = (SELECT user_id FROM public.triggers WHERE id = trigger_id));

CREATE POLICY "Users can delete their own trigger conditions" 
ON public.trigger_conditions 
FOR DELETE 
USING (auth.uid() = (SELECT user_id FROM public.triggers WHERE id = trigger_id));

-- Create RLS policies for trigger_executions
CREATE POLICY "Users can view their own trigger executions" 
ON public.trigger_executions 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.triggers WHERE id = trigger_id));

CREATE POLICY "Users can create their own trigger executions" 
ON public.trigger_executions 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM public.triggers WHERE id = trigger_id));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_triggers_updated_at
BEFORE UPDATE ON public.triggers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();