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

      // Fetch trigger executions with real counts
      const { data: executionsData, error: executionsError } = await supabase
        .from('trigger_executions')
        .select('email_sent, trigger_id')
        .in('trigger_id', triggersData?.map(t => t.id) || []);

      if (executionsError) throw executionsError;

      // Fetch at-risk customers from usage analytics
      const { data: atRiskData, error: atRiskError } = await supabase
        .from('usage_analytics')
        .select('id')
        .eq('user_id', user.id)
        .or('engagement_score.lt.0.3,last_seen.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (atRiskError) console.warn('Error fetching at-risk customers:', atRiskError);

      // Calculate real stats
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

      // Calculate real execution counts per trigger
      const triggerExecutionCounts = triggersData?.map(trigger => ({
        ...trigger,
        _count: { 
          trigger_executions: executionsData?.filter(e => e.trigger_id === trigger.id).length || 0
        }
      })) || [];

      setRecentTriggers(triggerExecutionCounts.slice(0, 5));

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
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Churn prevention insights and analytics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={syncPostHogData} 
            variant="outline"
            disabled={syncingPostHog}
            className="w-full sm:w-auto bg-card/80 backdrop-blur-sm border-border text-xs sm:text-sm"
            size="sm"
          >
            {syncingPostHog ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Syncing...</span>
                <span className="sm:hidden">Sync...</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sync PostHog</span>
                <span className="sm:hidden">Sync</span>
              </>
            )}
          </Button>
          <Button 
            onClick={() => navigate('/app/triggers/new')}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Create Trigger</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>

      {/* Onboarding Checklist - only show on larger screens */}
      <div className="hidden lg:flex justify-end">
        <div className="w-80">
          <OnboardingChecklist />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {/* At-Risk Customers Card */}
        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border border-destructive/20 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 bg-gradient-to-br from-destructive/10 to-destructive/20 rounded-full -translate-y-3 sm:-translate-y-4 md:-translate-y-6 translate-x-3 sm:translate-x-4 md:translate-x-6"></div>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-destructive/10 rounded-lg sm:rounded-xl">
                <AlertTriangle className="w-4 h-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-destructive" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">
              {stats.atRiskCustomers}
            </div>
            <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">At-Risk Customers</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Users showing churn signals
            </p>
          </CardContent>
        </Card>

        {/* Active Triggers Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full -translate-y-3 sm:-translate-y-4 md:-translate-y-6 translate-x-3 sm:translate-x-4 md:translate-x-6"></div>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl">
                <Zap className="w-4 h-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-primary" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">
              {stats.activeTriggers}
            </div>
            <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Active Triggers</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Currently monitoring
            </p>
          </CardContent>
        </Card>

        {/* Total Executions Card */}
        <Card className="bg-gradient-to-br from-success/5 to-success/10 border border-success/20 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 bg-gradient-to-br from-success/10 to-success/20 rounded-full -translate-y-3 sm:-translate-y-4 md:-translate-y-6 translate-x-3 sm:translate-x-4 md:translate-x-6"></div>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-success/10 rounded-lg sm:rounded-xl">
                <TrendingUp className="w-4 h-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-success" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">
              {stats.totalExecutions}
            </div>
            <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Total Executions</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Trigger executions completed
            </p>
          </CardContent>
        </Card>

        {/* Success Rate Card */}
        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-full -translate-y-3 sm:-translate-y-4 md:-translate-y-6 translate-x-3 sm:translate-x-4 md:translate-x-6"></div>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-secondary/10 rounded-lg sm:rounded-xl">
                <Activity className="w-4 h-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-secondary" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">
              {stats.successRate}%
            </div>
            <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Success Rate</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>
        </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <Card className="bg-card/80 backdrop-blur-sm border border-border">
          <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
            <CardTitle className="text-foreground text-lg sm:text-xl">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Get started with your churn prevention setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
            <Button 
              variant="outline" 
              className="w-full justify-start bg-card/50 border-border hover:bg-accent text-sm"
              onClick={() => navigate('/app/integrations')}
              size="sm"
            >
              <Activity className="w-4 h-4 mr-2" />
              Connect Integrations
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start bg-card/50 border-border hover:bg-accent text-sm"
              onClick={() => navigate('/app/triggers/new')}
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Create First Trigger
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start bg-card/50 border-border hover:bg-accent text-sm"
              onClick={() => navigate('/app/templates/new')}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Build Email Template
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card/80 backdrop-blur-sm border border-border">
          <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
            <CardTitle className="text-foreground text-lg sm:text-xl">Recent Activity</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Real-time churn prevention updates
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {recentTriggers.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No activity yet</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Create your first trigger to start monitoring customer behavior
                </p>
                <Button 
                  onClick={() => navigate('/app/triggers/new')}
                  className="bg-primary hover:bg-primary/90 text-xs sm:text-sm"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Trigger
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recentTriggers.slice(0, 4).map((trigger, index) => (
                  <div key={trigger.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-accent/50 rounded-lg">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-semibold text-primary">
                        {trigger.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                        {trigger.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {trigger.is_active ? 'Active trigger' : 'Inactive'} • {trigger._count.trigger_executions} executions
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground hidden sm:block">
                      {new Date(trigger.created_at).toLocaleDateString()}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${trigger.is_active ? 'bg-success' : 'bg-muted-foreground'}`} />
                  </div>
                ))}
                {recentTriggers.length > 4 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3 sm:mt-4 bg-card/50 border-border text-xs sm:text-sm"
                    onClick={() => navigate('/app/triggers')}
                  >
                    View All Triggers
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;