import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Mail, Zap, HelpCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stripeKey, setStripeKey] = useState("");
  const [resendKey, setResendKey] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: "stripe",
      title: "Connect Stripe",
      description: "Add your Stripe API key to monitor customer payments and detect churn patterns",
      icon: CreditCard,
      completed: false,
    },
    {
      id: "email",
      title: "Setup Email",
      description: "Configure Resend to automatically send retention emails to at-risk customers",
      icon: Mail,
      completed: false,
    },
    {
      id: "test",
      title: "Test System",
      description: "Run a test to ensure everything is working correctly",
      icon: Zap,
      completed: false,
    },
  ]);

  const progress = (steps.filter(step => step.completed).length / steps.length) * 100;

  useEffect(() => {
    checkExistingIntegrations();
  }, []);

  const checkExistingIntegrations = async () => {
    if (!user) return;

    try {
      const { data: integrations } = await supabase
        .from("user_integrations")
        .select("service_type")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (integrations) {
        const updatedSteps = steps.map(step => ({
          ...step,
          completed: integrations.some(int => 
            (step.id === "stripe" && int.service_type === "stripe") ||
            (step.id === "email" && int.service_type === "resend")
          )
        }));
        setSteps(updatedSteps);
      }
    } catch (error) {
      console.error("Error checking integrations:", error);
    }
  };

  const saveIntegration = async (serviceType: string, apiKey: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("user_integrations")
        .upsert({
          user_id: user.id,
          service_type: serviceType,
          api_key: apiKey,
          is_active: true,
        }, {
          onConflict: "user_id,service_type"
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error saving ${serviceType} integration:`, error);
      return false;
    }
  };

  const handleStripeSetup = async () => {
    if (!stripeKey.trim()) {
      toast({
        title: "Missing API Key",
        description: "Please enter your Stripe secret key",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const success = await saveIntegration("stripe", stripeKey);
    
    if (success) {
      const updatedSteps = steps.map(step => 
        step.id === "stripe" ? { ...step, completed: true } : step
      );
      setSteps(updatedSteps);
      toast({
        title: "Stripe Connected!",
        description: "Successfully connected your Stripe account",
      });
      setCurrentStep(1);
    } else {
      toast({
        title: "Connection Failed",
        description: "Failed to connect Stripe. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleEmailSetup = async () => {
    if (!resendKey.trim()) {
      toast({
        title: "Missing API Key",
        description: "Please enter your Resend API key",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const success = await saveIntegration("resend", resendKey);
    
    if (success) {
      const updatedSteps = steps.map(step => 
        step.id === "email" ? { ...step, completed: true } : step
      );
      setSteps(updatedSteps);
      toast({
        title: "Email Connected!",
        description: "Successfully connected your Resend account",
      });
      setCurrentStep(2);
    } else {
      toast({
        title: "Connection Failed",
        description: "Failed to connect Resend. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const runTest = async () => {
    setLoading(true);
    
    try {
      // Simulate running the churn flow test
      const { data, error } = await supabase.functions.invoke('analyze-churn', {
        body: { 
          test: true,
          customerEmail: user?.email || 'test@example.com'
        }
      });

      if (error) throw error;

      const updatedSteps = steps.map(step => 
        step.id === "test" ? { ...step, completed: true } : step
      );
      setSteps(updatedSteps);
      
      toast({
        title: "Test Successful!",
        description: "Your notibye setup is working perfectly",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Please check your integrations and try again",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case "stripe":
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Find this in your Stripe Dashboard under Developers → API keys. It starts with "sk_"</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input 
                id="stripe-key"
                type="password"
                placeholder="sk_test_..."
                value={stripeKey}
                onChange={(e) => setStripeKey(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleStripeSetup} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Connecting..." : "Connect Stripe"}
            </Button>
          </div>
        );
      
      case "email":
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="resend-key">Resend API Key</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Get this from your Resend dashboard under API Keys. It starts with "re_"</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input 
                id="resend-key"
                type="password"
                placeholder="re_..."
                value={resendKey}
                onChange={(e) => setResendKey(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleEmailSetup} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Connecting..." : "Connect Resend"}
            </Button>
          </div>
        );
      
      case "test":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-secondary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                We'll run a test to make sure your Stripe and email integrations are working correctly.
              </p>
            </div>
            <Button 
              onClick={runTest} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Testing..." : "Run Test"}
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  const isStepCompleted = (stepIndex: number) => steps[stepIndex]?.completed;
  const canGoToStep = (stepIndex: number) => {
    if (stepIndex === 0) return true;
    return steps.slice(0, stepIndex).every(step => step.completed);
  };

  if (progress === 100) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to notibye!</CardTitle>
          <CardDescription>
            Your churn prevention system is now active and monitoring your customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <Badge variant="secondary" className="text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Get Started with notibye</h1>
          <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = step.completed;
          const canAccess = canGoToStep(index);
          
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => canAccess && setCurrentStep(index)}
                disabled={!canAccess}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted 
                    ? "bg-primary text-primary-foreground" 
                    : isActive 
                    ? "bg-primary/10 text-primary border-2 border-primary" 
                    : canAccess
                    ? "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    : "bg-muted text-muted-foreground/50 cursor-not-allowed"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </button>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  isCompleted ? "bg-primary" : "bg-border"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              steps[currentStep].completed ? "bg-primary/10" : "bg-secondary"
            }`}>
              {React.createElement(steps[currentStep].icon, {
                className: `w-6 h-6 ${steps[currentStep].completed ? "text-primary" : "text-muted-foreground"}`
              })}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {steps[currentStep].title}
                {steps[currentStep].completed && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </CardTitle>
              <CardDescription>
                {steps[currentStep].description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1 || !steps[currentStep].completed}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;