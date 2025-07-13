import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStep {
  id: string;
  title: string;
  completed: boolean;
  action?: () => void;
}

export function OnboardingChecklist() {
  const { user } = useAuth();
  const [steps, setSteps] = useState<OnboardingStep[]>([
    { id: 'connect', title: 'Connect PostHog account', completed: false },
    { id: 'trigger', title: 'Create your first trigger', completed: false },
    { id: 'review', title: 'Review at-risk customers', completed: false },
  ]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in localStorage
    const isDismissed = localStorage.getItem('onboarding-dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    checkStepCompletion();
  }, [user]);

  const checkStepCompletion = async () => {
    if (!user) return;

    try {
      // Check PostHog integration
      const { data: integrations } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('service_type', 'posthog')
        .eq('is_active', true);

      // Check triggers
      const { data: triggers } = await supabase
        .from('triggers')
        .select('*')
        .eq('user_id', user.id);

      // Check usage analytics (proxy for at-risk customers review)
      const { data: analytics } = await supabase
        .from('usage_analytics')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      setSteps(prev => prev.map(step => ({
        ...step,
        completed: 
          (step.id === 'connect' && integrations && integrations.length > 0) ||
          (step.id === 'trigger' && triggers && triggers.length > 0) ||
          (step.id === 'review' && analytics && analytics.length > 0)
      })));

    } catch (error) {
      console.error('Error checking onboarding completion:', error);
    }
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const handleDismiss = () => {
    localStorage.setItem('onboarding-dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed || progress === 100) {
    return null;
  }

  return (
    <Card className="bg-white border border-border shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Get Started</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="w-6 h-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{completedSteps}/{totalSteps} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3">
            {step.completed ? (
              <CheckCircle className="w-5 h-5 text-success" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
            <span className={`text-sm font-medium ${
              step.completed ? 'text-success line-through' : 'text-foreground'
            }`}>
              {step.title}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}