import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Plus, Zap, Activity, TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  activeTriggers: number;
  totalExecutions: number;
  emailsSent: number;
  successRate: number;
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
  });
  const [recentTriggers, setRecentTriggers] = useState<RecentTrigger[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Calculate stats
      const activeTriggers = triggersData?.filter(t => t.is_active).length || 0;
      const totalExecutions = executionsData?.length || 0;
      const emailsSent = executionsData?.filter(e => e.email_sent).length || 0;
      const successRate = totalExecutions > 0 ? Math.round((emailsSent / totalExecutions) * 100) : 0;

      setStats({
        activeTriggers,
        totalExecutions,
        emailsSent,
        successRate,
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your churn prevention triggers and performance
          </p>
        </div>
        <Button onClick={() => navigate('/triggers/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Trigger
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Triggers</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTriggers}</div>
            <p className="text-xs text-muted-foreground">
              Currently monitoring for churn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExecutions}</div>
            <p className="text-xs text-muted-foreground">
              Triggers fired this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailsSent}</div>
            <p className="text-xs text-muted-foreground">
              Prevention emails delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            {stats.successRate >= 80 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Email delivery success
            </p>
          </CardContent>
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
              <div className="text-center py-4">
                <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No triggers created yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate('/triggers/new')}
                >
                  Create Your First Trigger
                </Button>
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