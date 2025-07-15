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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">
              Churn prevention insights and analytics
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={syncPostHogData} 
              variant="outline"
              disabled={syncingPostHog}
              className="bg-white/80 backdrop-blur-sm border-slate-200/50"
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
            <Button 
              onClick={() => navigate('/app/triggers/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* At-Risk Customers Card */}
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-100/20 to-orange-100/20 rounded-full -translate-y-6 translate-x-6"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100/80 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-sm font-medium text-red-600 bg-red-100/50 px-2 py-1 rounded-full">
                  -2.3%
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {stats.atRiskCustomers}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">At-Risk Customers</h3>
              <p className="text-sm text-slate-600">
                Users showing churn signals
              </p>
            </CardContent>
          </Card>

          {/* Active Triggers Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/20 to-cyan-100/20 rounded-full -translate-y-6 translate-x-6"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100/80 rounded-xl">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-100/50 px-2 py-1 rounded-full">
                  +{stats.activeTriggers > 0 ? '12.3' : '0.0'}%
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {stats.activeTriggers}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Active Triggers</h3>
              <p className="text-sm text-slate-600">
                Currently monitoring
              </p>
            </CardContent>
          </Card>

          {/* Total Executions Card */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100/20 to-emerald-100/20 rounded-full -translate-y-6 translate-x-6"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100/80 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-100/50 px-2 py-1 rounded-full">
                  +{stats.successRate}%
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {stats.totalExecutions}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Total Executions</h3>
              <p className="text-sm text-slate-600">
                Trigger executions completed
              </p>
            </CardContent>
          </Card>

          {/* Success Rate Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100/20 to-indigo-100/20 rounded-full -translate-y-6 translate-x-6"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100/80 rounded-xl">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-100/50 px-2 py-1 rounded-full">
                  +1.2%
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {stats.successRate}%
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Success Rate</h3>
              <p className="text-sm text-slate-600">
                Successfully processed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-900">Quick Actions</CardTitle>
              <CardDescription className="text-slate-600">
                Get started with your churn prevention setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-white/50 border-slate-200/50 hover:bg-slate-50"
                onClick={() => navigate('/app/integrations')}
              >
                <Activity className="w-4 h-4 mr-2" />
                Connect Integrations
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-white/50 border-slate-200/50 hover:bg-slate-50"
                onClick={() => navigate('/app/triggers/new')}
              >
                <Zap className="w-4 h-4 mr-2" />
                Create First Trigger
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-white/50 border-slate-200/50 hover:bg-slate-50"
                onClick={() => navigate('/app/templates/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Build Email Template
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-900">Recent Activity</CardTitle>
              <CardDescription className="text-slate-600">
                Real-time churn prevention updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTriggers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No activity yet</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Create your first trigger to start monitoring customer behavior
                  </p>
                  <Button 
                    onClick={() => navigate('/app/triggers/new')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Trigger
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTriggers.slice(0, 4).map((trigger, index) => (
                    <div key={trigger.id} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-700">
                          {trigger.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {trigger.name}
                        </p>
                        <p className="text-xs text-slate-600">
                          {trigger.is_active ? 'Active trigger' : 'Inactive'} • {trigger._count.trigger_executions} executions
                        </p>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(trigger.created_at).toLocaleDateString()}
                      </div>
                      <div className={`w-2 h-2 rounded-full ${trigger.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                    </div>
                  ))}
                  {recentTriggers.length > 4 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4 bg-white/50 border-slate-200/50"
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
    </div>
  );
};

export default Dashboard;