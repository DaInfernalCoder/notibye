import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import TestChurnFlow from "@/components/TestChurnFlow";
import Onboarding from "@/components/Onboarding";

const Dashboard = () => {
  const { user } = useAuth();
  const [hasIntegrations, setHasIntegrations] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserIntegrations();
  }, [user]);

  const checkUserIntegrations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: integrations } = await supabase
        .from("user_integrations")
        .select("service_type")
        .eq("user_id", user.id)
        .eq("is_active", true);

      const hasStripe = integrations?.some(int => int.service_type === "stripe");
      const hasResend = integrations?.some(int => int.service_type === "resend");
      
      setHasIntegrations(hasStripe && hasResend);
    } catch (error) {
      console.error("Error checking integrations:", error);
      setHasIntegrations(false);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if user hasn't set up integrations
  if (hasIntegrations === false) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Onboarding />
        </div>
      </div>
    );
  }

  // Show main dashboard for users with complete setup
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Your churn prevention system is active and monitoring.
          </p>
        </div>

        <TestChurnFlow />
      </div>
    </div>
  );
};

export default Dashboard;