import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Plus, Zap, Clock, AlertTriangle, Edit, Trash2 } from 'lucide-react';

interface Trigger {
  id: string;
  name: string;
  description: string;
  frequency_type: string;
  frequency_value: string;
  is_active: boolean;
  warning_acknowledged: boolean;
  created_at: string;
  email_templates: {
    name: string;
  } | null;
  trigger_conditions: Array<{
    condition_type: string;
    operator: string;
    threshold_value: number;
    threshold_unit: string;
  }>;
}

const Triggers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTriggers();
  }, [user]);

  const fetchTriggers = async () => {
    if (!user) return;

    try {
      const { data: triggersData, error } = await supabase
        .from('triggers')
        .select(`
          *,
          email_templates!triggers_email_template_id_fkey (name),
          trigger_conditions (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTriggers(triggersData || []);
    } catch (error) {
      console.error('Error fetching triggers:', error);
      toast({
        title: "Error",
        description: "Failed to load triggers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTrigger = async (triggerId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('triggers')
        .update({ is_active: isActive })
        .eq('id', triggerId);

      if (error) throw error;

      setTriggers(prev => prev.map(trigger => 
        trigger.id === triggerId ? { ...trigger, is_active: isActive } : trigger
      ));

      toast({
        title: isActive ? "Trigger activated" : "Trigger deactivated",
        description: `Your trigger has been ${isActive ? 'activated' : 'deactivated'}.`
      });
    } catch (error) {
      console.error('Error updating trigger:', error);
      toast({
        title: "Error",
        description: "Failed to update trigger",
        variant: "destructive"
      });
    }
  };

  const getFrequencyDisplay = (type: string, value: string) => {
    switch (type) {
      case 'realtime':
        return 'Real-time';
      case 'hourly':
        return 'Every hour';
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'custom':
        return `Custom: ${value}`;
      default:
        return type;
    }
  };

  const getConditionSummary = (conditions: Trigger['trigger_conditions']) => {
    if (!conditions.length) return 'No conditions';
    
    const firstCondition = conditions[0];
    const summary = `${firstCondition.condition_type} ${firstCondition.operator} ${firstCondition.threshold_value}${firstCondition.threshold_unit}`;
    
    if (conditions.length > 1) {
      return `${summary} +${conditions.length - 1} more`;
    }
    
    return summary;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading triggers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Triggers</h1>
          <p className="text-muted-foreground">
            Manage your churn prevention triggers
          </p>
        </div>
        <Button onClick={() => navigate('/triggers/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Trigger
        </Button>
      </div>

      {triggers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No triggers yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first trigger to start preventing customer churn.
            </p>
            <Button onClick={() => navigate('/triggers/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Trigger
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {triggers.map((trigger) => (
            <Card key={trigger.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {trigger.name}
                      {!trigger.warning_acknowledged && (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </CardTitle>
                    <CardDescription>{trigger.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={trigger.is_active}
                      onCheckedChange={(checked) => toggleTrigger(trigger.id, checked)}
                    />
                    <Badge variant={trigger.is_active ? 'default' : 'secondary'}>
                      {trigger.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {getFrequencyDisplay(trigger.frequency_type, trigger.frequency_value)}
                    </div>
                    <div>
                      Template: {trigger.email_templates?.name || 'None'}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground">Conditions: </span>
                    {getConditionSummary(trigger.trigger_conditions)}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Triggers;