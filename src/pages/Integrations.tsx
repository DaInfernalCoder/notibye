import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard, Activity, Mail, Save } from 'lucide-react';

interface Integration {
  id: string;
  service_type: string;
  api_key: string;
  additional_config: any;
  is_active: boolean;
}

const Integrations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [stripeKey, setStripeKey] = useState('');
  const [posthogKey, setPosthogKey] = useState('');
  const [posthogProjectId, setPosthogProjectId] = useState('');
  const [resendKey, setResendKey] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchIntegrations();
  }, [user, navigate]);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      setIntegrations(data || []);

      // Populate form fields with existing data
      data?.forEach((integration) => {
        switch (integration.service_type) {
          case 'stripe':
            setStripeKey(integration.api_key);
            break;
          case 'posthog':
            setPosthogKey(integration.api_key);
            setPosthogProjectId((integration.additional_config as any)?.project_id || '');
            break;
          case 'resend':
            setResendKey(integration.api_key);
            break;
        }
      });
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveIntegration = async (serviceType: string, apiKey: string, additionalConfig = {}) => {
    if (!apiKey.trim()) return;

    try {
      const existingIntegration = integrations.find(i => i.service_type === serviceType);

      if (existingIntegration) {
        // Update existing
        const { error } = await supabase
          .from('user_integrations')
          .update({
            api_key: apiKey,
            additional_config: additionalConfig,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingIntegration.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('user_integrations')
          .insert({
            user_id: user?.id,
            service_type: serviceType,
            api_key: apiKey,
            additional_config: additionalConfig,
            is_active: true,
          });

        if (error) throw error;
      }

      toast({
        title: "Integration saved!",
        description: `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} integration has been configured.`,
      });

      fetchIntegrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    
    try {
      const promises = [];
      
      if (stripeKey.trim()) {
        promises.push(saveIntegration('stripe', stripeKey));
      }
      
      if (posthogKey.trim()) {
        promises.push(saveIntegration('posthog', posthogKey, { project_id: posthogProjectId }));
      }
      
      if (resendKey.trim()) {
        promises.push(saveIntegration('resend', resendKey));
      }

      await Promise.all(promises);

      toast({
        title: "All integrations saved!",
        description: "Your service integrations have been configured successfully.",
      });
    } catch (error) {
      console.error('Error saving integrations:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Service Integrations</h1>
          <p className="text-muted-foreground">
            Connect your tools to start monitoring customer churn automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stripe Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <CardTitle>Stripe</CardTitle>
              </div>
              <CardDescription>
                Connect your Stripe account to receive webhook notifications when customers cancel subscriptions or payments fail.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-key">Secret Key</Label>
                <Input
                  id="stripe-key"
                  type="password"
                  placeholder="sk_live_..."
                  value={stripeKey}
                  onChange={(e) => setStripeKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Find your secret key in your Stripe Dashboard under Developers &gt; API keys
                </p>
              </div>
            </CardContent>
          </Card>

          {/* PostHog Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                <CardTitle>PostHog</CardTitle>
              </div>
              <CardDescription>
                Connect PostHog to analyze user behavior and identify usage patterns before churn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="posthog-key">API Key</Label>
                <Input
                  id="posthog-key"
                  type="password"
                  placeholder="phc_..."
                  value={posthogKey}
                  onChange={(e) => setPosthogKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="posthog-project">Project ID</Label>
                <Input
                  id="posthog-project"
                  placeholder="12345"
                  value={posthogProjectId}
                  onChange={(e) => setPosthogProjectId(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Find these in your PostHog project settings
              </p>
            </CardContent>
          </Card>

          {/* Resend Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <CardTitle>Resend</CardTitle>
              </div>
              <CardDescription>
                Connect Resend to automatically send churn analysis emails to you when customers leave.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resend-key">API Key</Label>
                <Input
                  id="resend-key"
                  type="password"
                  placeholder="re_..."
                  value={resendKey}
                  onChange={(e) => setResendKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Create an API key at resend.com/api-keys
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Follow these steps to complete your setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mt-0.5">1</div>
                  <p>Add your API keys above</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mt-0.5">2</div>
                  <p>Configure webhook endpoints in Stripe for subscription events</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold mt-0.5">3</div>
                  <p>Start receiving automatic churn analysis emails</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveAll} disabled={saving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save All Integrations'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Integrations;