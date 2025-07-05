import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Zap, Play, RefreshCw } from 'lucide-react';

const TestChurnFlow = () => {
  const [customerEmail, setCustomerEmail] = useState('john.doe@example.com');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const simulateChurnEvent = async () => {
    setLoading(true);
    try {
      // Create a simulated churn event
      const { data, error } = await supabase
        .from('churn_events')
        .insert({
          user_id: 'dev-user-123', // Our dev user
          customer_id: 'cus_test_' + Date.now(),
          customer_email: customerEmail,
          event_type: 'customer.subscription.deleted',
          event_data: {
            simulated: true,
            created: Date.now()
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Churn Event Created!",
        description: `Simulated churn event for ${customerEmail}`,
      });

      return data.id;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processChurnQueue = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-churn-queue');
      
      if (error) throw error;

      toast({
        title: "Queue Processed!",
        description: `${data.processed} churn events were processed`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const runFullFlow = async () => {
    // First create the churn event
    const churnEventId = await simulateChurnEvent();
    
    if (churnEventId) {
      // Wait a moment then process the queue
      setTimeout(async () => {
        await processChurnQueue();
      }, 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <CardTitle>Test ChurnFlow</CardTitle>
        </div>
        <CardDescription>
          Simulate customer churn events and test the full pipeline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer-email">Customer Email</Label>
          <Input
            id="customer-email"
            type="email"
            placeholder="customer@example.com"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={simulateChurnEvent} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Creating Event...
              </>
            ) : (
              'Simulate Churn Event'
            )}
          </Button>

          <Button 
            onClick={processChurnQueue} 
            disabled={processing}
            variant="outline"
            className="w-full"
          >
            {processing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing Queue...
              </>
            ) : (
              'Process Churn Queue'
            )}
          </Button>

          <Button 
            onClick={runFullFlow}
            disabled={loading || processing}
            variant="hero"
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Full Flow
          </Button>
        </div>

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="font-medium mb-1">How it works:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Create simulated churn event</li>
            <li>Analyze user behavior with PostHog data</li>
            <li>Generate insights and engagement scores</li>
            <li>Send churn analysis email via Resend</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestChurnFlow;