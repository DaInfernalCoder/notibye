import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Webhook, Brain, Mail, Play, RefreshCw } from 'lucide-react';

const TestChurnFlow = () => {
  const [customerEmail, setCustomerEmail] = useState('john.doe@example.com');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStepTest = async (step: 'webhook' | 'analyze' | 'email') => {
    setLoading(true);
    try {
      let result;
      
      switch (step) {
        case 'webhook':
          result = await supabase.functions.invoke('stripe-webhook', {
            body: {
              type: 'customer.subscription.deleted',
              data: {
                object: {
                  customer: 'cus_test_' + Date.now(),
                  id: 'sub_test_' + Date.now()
                }
              }
            }
          });
          break;
          
        case 'analyze':
          result = await supabase.functions.invoke('analyze-churn', {
            body: {
              customerEmail: customerEmail,
              test: true
            }
          });
          break;
          
        case 'email':
          result = await supabase.functions.invoke('send-churn-email', {
            body: {
              customerEmail: customerEmail,
              usageSummary: {
                totalEvents: 45,
                activeDays: 12,
                engagementScore: 0.65,
                mostUsedFeature: 'Dashboard'
              }
            }
          });
          break;
      }

      if (result.error) throw result.error;

      toast({
        title: `${step.charAt(0).toUpperCase() + step.slice(1)} Test Successful!`,
        description: `The ${step} component is working correctly`,
      });
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runFullFlow = async () => {
    setLoading(true);
    try {
      const result = await supabase.functions.invoke('process-churn-queue', {
        body: {
          testMode: true,
          customerEmail: customerEmail
        }
      });

      if (result.error) throw result.error;

      toast({
        title: "Full Flow Complete!",
        description: "Churn prevention system tested successfully",
      });
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Monitor and test your churn prevention system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-lg text-center space-y-2">
              <Webhook className="w-8 h-8 mx-auto text-primary" />
              <h3 className="font-semibold">Stripe Connected</h3>
              <p className="text-sm text-muted-foreground">Monitoring payments</p>
            </div>
            
            <div className="p-4 border rounded-lg text-center space-y-2">
              <Brain className="w-8 h-8 mx-auto text-primary" />
              <h3 className="font-semibold">AI Active</h3>
              <p className="text-sm text-muted-foreground">Analyzing churn risk</p>
            </div>
            
            <div className="p-4 border rounded-lg text-center space-y-2">
              <Mail className="w-8 h-8 mx-auto text-primary" />
              <h3 className="font-semibold">Emails Ready</h3>
              <p className="text-sm text-muted-foreground">Retention campaigns active</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Test Individual Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => handleStepTest('webhook')} 
                disabled={loading}
                variant="outline"
                className="h-16 flex flex-col gap-2"
              >
                <Webhook className="w-5 h-5" />
                Test Webhook
              </Button>
              
              <Button 
                onClick={() => handleStepTest('analyze')} 
                disabled={loading}
                variant="outline"
                className="h-16 flex flex-col gap-2"
              >
                <Brain className="w-5 h-5" />
                Test Analysis
              </Button>
              
              <Button 
                onClick={() => handleStepTest('email')} 
                disabled={loading}
                variant="outline"
                className="h-16 flex flex-col gap-2"
              >
                <Mail className="w-5 h-5" />
                Test Email
              </Button>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Full System Test</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="test-email">Test Customer Email</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <Button 
                onClick={runFullFlow}
                disabled={loading}
                className="w-full sm:w-auto min-w-[160px]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Full Test
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground p-4 bg-secondary/20 rounded-lg">
            <p className="font-medium mb-2">How the system works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Stripe detects subscription cancellation</li>
              <li>AI analyzes customer behavior patterns</li>
              <li>Personalized retention email is sent automatically</li>
              <li>Customer receives targeted win-back offer</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestChurnFlow;