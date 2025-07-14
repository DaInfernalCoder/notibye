import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Plus, Zap, Activity, TrendingUp, TrendingDown, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';

interface DashboardStats {
  activeTriggers: number;
  totalExecutions: number;
  emailsSent: number;
  successRate: number;
  atRiskCustomers: number;
}

interface RecentTrigger {
  id: string;
  name: string;
  is_active: boolean;
  frequency_type: string;
  created_at: string;
  _count: {
    trigger_executions: number;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    activeTriggers: 0,
    totalExecutions: 0,
    emailsSent: 0,
    successRate: 0,
    atRiskCustomers: 0,
  });
  const [recentTriggers, setRecentTriggers] = useState<RecentTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingPostHog, setSyncingPostHog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch triggers
      const { data: triggersData, error: triggersError } = await supabase
        .from('triggers')
        .select('*')
        .eq('user_id', user.id);

      if (triggersError) throw triggersError;

      // Fetch trigger executions
      const { data: executionsData, error: executionsError } = await supabase
        .from('trigger_executions')
        .select('email_sent')
        .in('trigger_id', triggersData?.map(t => t.id) || []);

      if (executionsError) throw executionsError;

      // Fetch at-risk customers from usage analytics (customers with low engagement or recent churn events)
      const { data: atRiskData, error: atRiskError } = await supabase
        .from('usage_analytics')
        .select('id')
        .eq('user_id', user.id)
        .or('engagement_score.lt.0.3,last_seen.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (atRiskError) console.warn('Error fetching at-risk customers:', atRiskError);

      // Calculate stats
      const activeTriggers = triggersData?.filter(t => t.is_active).length || 0;
      const totalExecutions = executionsData?.length || 0;
      const emailsSent = executionsData?.filter(e => e.email_sent).length || 0;
      const successRate = totalExecutions > 0 ? Math.round((emailsSent / totalExecutions) * 100) : 0;
      const atRiskCustomers = atRiskData?.length || 0;

      setStats({
        activeTriggers,
        totalExecutions,
        emailsSent,
        successRate,
        atRiskCustomers,
      });

      // Mock recent triggers (simplified for demo)
      setRecentTriggers(triggersData?.slice(0, 5).map(trigger => ({
        ...trigger,
        _count: { trigger_executions: Math.floor(Math.random() * 10) }
      })) || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const syncPostHogData = async () => {
    if (!user) return;
    
    setSyncingPostHog(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-posthog-data', {
        body: { user_id: user.id, days_back: 30 }
      });

      if (error) throw error;

      toast({
        title: "PostHog Data Synced!",
        description: `Processed ${data.records_processed} customer records`,
      });

      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error: any) {
      console.error('PostHog sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync PostHog data",
        variant: "destructive",
      });
    } finally {
      setSyncingPostHog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-base text-muted-foreground mt-1">
            Monitor your churn prevention performance
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={syncPostHogData} 
            variant="outline"
            disabled={syncingPostHog}
          >
            {syncingPostHog ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 mr-2" />
                Sync PostHog
              </>
            )}
          </Button>
          <Button onClick={() => navigate('/app/triggers/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Trigger
          </Button>
        </div>
      </div>

      {/* Onboarding Checklist */}
      <div className="flex justify-end">
        <div className="w-80">
          <OnboardingChecklist />
        </div>
      </div>

      {/* 3-column Stats Grid - Linear pattern */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* At-Risk Customers Card */}
        <Card className="bg-white border border-border rounded-lg p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">At-Risk Customers</h3>
              <p className="text-sm text-muted-foreground">Users showing churn signals</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">
            {stats.atRiskCustomers}
          </div>
          <p className="text-sm text-muted-foreground">
            Identified in last 7 days
          </p>
        </Card>

        {/* Active Triggers Card */}
        <Card className="bg-white border border-border rounded-lg p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Active Triggers</h3>
              <p className="text-sm text-muted-foreground">Currently monitoring</p>
            </div>
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">
            {stats.activeTriggers}
          </div>
          <p className="text-sm text-muted-foreground">
            Preventing churn 24/7
          </p>
        </Card>

        {/* Recent Activity Card */}
        <Card className="bg-white border border-border rounded-lg p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">Recent Activity</h3>
              <p className="text-sm text-muted-foreground">Last 24 hours</p>
            </div>
            <Activity className="w-6 h-6 text-success" />
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">
            {stats.emailsSent}
          </div>
          <p className="text-sm text-muted-foreground">
            Emails sent to at-risk users
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your churn prevention setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/integrations')}
            >
              <Activity className="w-4 h-4 mr-2" />
              Connect Integrations
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/triggers/new')}
            >
              <Zap className="w-4 h-4 mr-2" />
              Create First Trigger
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/templates/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Build Email Template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Triggers</CardTitle>
            <CardDescription>
              Your latest churn prevention triggers
            </CardDescription>
          </CardHeader>
          <CardContent>
        {recentTriggers.length === 0 ? (
          <div className="text-center py-6">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No triggers yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Triggers watch for customer behavior in PostHog and automatically send emails to prevent churn.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/app/triggers/new')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Trigger
              </Button>
              <div>
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={() => navigate('/app/integrations')}
                  className="text-xs"
                >
                  Connect PostHog first
                </Button>
              </div>
            </div>
          </div>
            ) : (
              <div className="space-y-3">
                {recentTriggers.map((trigger) => (
                  <div key={trigger.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {trigger.is_active ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        )}
                        <span className="font-medium text-sm">{trigger.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {trigger.frequency_type}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {trigger._count.trigger_executions} runs
                    </span>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/triggers')}
                >
                  View All Triggers
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;