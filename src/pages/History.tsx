import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { History as HistoryIcon, Search, Mail, AlertCircle } from 'lucide-react';

interface TriggerExecution {
  id: string;
  customer_email: string;
  customer_id: string;
  execution_data: any;
  email_sent: boolean;
  error_message: string;
  executed_at: string;
  triggers: {
    name: string;
  };
}

const History = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [executions, setExecutions] = useState<TriggerExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExecutions();
  }, [user]);

  const fetchExecutions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trigger_executions')
        .select(`
          *,
          triggers!trigger_executions_trigger_id_fkey (name)
        `)
        .order('executed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setExecutions(data || []);
    } catch (error) {
      console.error('Error fetching executions:', error);
      toast({
        title: "Error",
        description: "Failed to load execution history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredExecutions = executions.filter(execution =>
    execution.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    execution.triggers?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Execution History</h1>
        <p className="text-muted-foreground">
          View the history of trigger executions and sent emails
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by email or trigger name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredExecutions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <HistoryIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'No matching executions' : 'No executions yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Try adjusting your search terms.' 
                : 'Trigger executions will appear here once your triggers start running.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredExecutions.map((execution) => (
            <Card key={execution.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {execution.email_sent ? (
                        <Mail className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {execution.customer_email}
                    </CardTitle>
                    <CardDescription>
                      Trigger: {execution.triggers?.name || 'Unknown'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={execution.email_sent ? 'default' : 'destructive'}>
                      {execution.email_sent ? 'Email Sent' : 'Failed'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(execution.executed_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              {(execution.error_message || execution.execution_data) && (
                <CardContent>
                  {execution.error_message && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md mb-3">
                      <p className="text-sm text-destructive font-medium">Error:</p>
                      <p className="text-sm text-destructive">{execution.error_message}</p>
                    </div>
                  )}
                  
                  {execution.execution_data && Object.keys(execution.execution_data).length > 0 && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-2">Execution Data:</p>
                      <pre className="text-xs text-muted-foreground overflow-x-auto">
                        {JSON.stringify(execution.execution_data, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;