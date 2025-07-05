import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, Activity, Mail, CreditCard } from 'lucide-react';

interface Integration {
  id: string;
  service_type: string;
  is_active: boolean;
  created_at: string;
}

interface ChurnEvent {
  id: string;
  customer_email: string;
  event_type: string;
  created_at: string;
  processed_at: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [churnEvents, setChurnEvents] = useState<ChurnEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      // Fetch integrations
      const { data: integrationsData, error: integrationsError } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user?.id);

      if (integrationsError) throw integrationsError;

      // Fetch recent churn events
      const { data: eventsData, error: eventsError } = await supabase
        .from('churn_events')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (eventsError) throw eventsError;

      setIntegrations(integrationsData || []);
      setChurnEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'stripe':
        return <CreditCard className="w-5 h-5" />;
      case 'posthog':
        return <Activity className="w-5 h-5" />;
      case 'resend':
        return <Mail className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getServiceName = (service: string) => {
    switch (service) {
      case 'stripe':
        return 'Stripe';
      case 'posthog':
        return 'PostHog';
      case 'resend':
        return 'Resend';
      default:
        return service;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Monitor your churn analytics and manage integrations.
          </p>
        </div>

        {/* Integrations Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Service Integrations</h2>
            <Button onClick={() => navigate('/integrations')} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['stripe', 'posthog', 'resend'].map((service) => {
              const integration = integrations.find(i => i.service_type === service);
              const isConnected = !!integration?.is_active;

              return (
                <Card key={service}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getServiceIcon(service)}
                        <CardTitle className="text-base">{getServiceName(service)}</CardTitle>
                      </div>
                      <Badge variant={isConnected ? 'default' : 'secondary'}>
                        {isConnected ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {service === 'stripe' && 'Payment processing and subscription webhooks'}
                      {service === 'posthog' && 'Product analytics and user behavior tracking'}
                      {service === 'resend' && 'Email notifications and churn alerts'}
                    </CardDescription>
                    {!isConnected && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 w-full"
                        onClick={() => navigate('/integrations')}
                      >
                        Connect {getServiceName(service)}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Churn Events */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Churn Events</h2>
          
          {churnEvents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No churn events yet</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your integrations to start monitoring customer churn.
                </p>
                <Button onClick={() => navigate('/integrations')}>
                  Set Up Integrations
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {churnEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{event.customer_email}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.event_type} • {new Date(event.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={event.processed_at ? 'default' : 'secondary'}>
                        {event.processed_at ? 'Processed' : 'Pending'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;