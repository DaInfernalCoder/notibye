import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, TrendingDown, TrendingUp, Activity, AlertTriangle } from 'lucide-react';

interface CustomerAnalytics {
  id: string;
  customer_email: string;
  engagement_score: number;
  total_events: number;
  active_days: number;
  last_seen: string;
  most_used_feature: string;
  analytics_data: any; // Changed from specific type to any to handle Json type
}

const CustomerInsights = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<CustomerAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    avgEngagement: 0
  });

  useEffect(() => {
    if (user) {
      fetchCustomerAnalytics();
    }
  }, [user]);

  const fetchCustomerAnalytics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('usage_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('engagement_score', { ascending: false })
        .limit(50);

      if (error) throw error;

      setCustomers(data || []);

      // Calculate stats with safe property access
      const total = data?.length || 0;
      const highRisk = data?.filter(c => c.analytics_data && typeof c.analytics_data === 'object' && (c.analytics_data as any).churn_risk === 'high').length || 0;
      const mediumRisk = data?.filter(c => c.analytics_data && typeof c.analytics_data === 'object' && (c.analytics_data as any).churn_risk === 'medium').length || 0;
      const lowRisk = data?.filter(c => c.analytics_data && typeof c.analytics_data === 'object' && (c.analytics_data as any).churn_risk === 'low').length || 0;
      const avgEngagement = total > 0 ? Math.round(data.reduce((sum, c) => sum + (c.engagement_score || 0), 0) / total) : 0;

      setStats({ total, highRisk, mediumRisk, lowRisk, avgEngagement });
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChurnRisk = (customer: CustomerAnalytics): string => {
    if (customer.analytics_data && typeof customer.analytics_data === 'object') {
      return (customer.analytics_data as any).churn_risk || 'low';
    }
    return 'low';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <AlertTriangle className="w-3 h-3" />;
      case 'medium': return <TrendingDown className="w-3 h-3" />;
      case 'low': return <TrendingUp className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const daysSince = Math.floor((Date.now() - new Date(lastSeen).getTime()) / (24 * 60 * 60 * 1000));
    return daysSince === 0 ? 'today' : daysSince === 1 ? 'yesterday' : `${daysSince} days ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-20 bg-muted rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Customers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
                <div className="text-xs text-muted-foreground">High Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.mediumRisk}</div>
                <div className="text-xs text-muted-foreground">Medium Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.lowRisk}</div>
                <div className="text-xs text-muted-foreground">Low Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.avgEngagement}%</div>
                <div className="text-xs text-muted-foreground">Avg Engagement</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Analytics</CardTitle>
          <CardDescription>
            PostHog-powered engagement insights and churn risk analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
              <p className="text-muted-foreground mb-4">
                Sync PostHog data to see customer engagement insights
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {customers.slice(0, 10).map((customer) => (
                <div key={customer.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{customer.customer_email}</span>
                        <Badge 
                          variant="outline" 
                         className={`text-xs ${getRiskColor(getChurnRisk(customer))}`}
                        >
                          {getRiskIcon(getChurnRisk(customer))}
                          {getChurnRisk(customer)} risk
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last seen: {formatLastSeen(customer.last_seen)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{customer.engagement_score}%</div>
                      <div className="text-xs text-muted-foreground">Engagement</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress value={customer.engagement_score} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{customer.total_events} events</span>
                      <span>{customer.active_days} active days</span>
                      <span>Uses: {customer.most_used_feature}</span>
                    </div>
                  </div>
                </div>
              ))}

              {customers.length > 10 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Showing top 10 customers. Total: {customers.length}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerInsights;