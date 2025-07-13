/**
 * Triggers Page
 * 
 * Main page for managing churn prevention triggers. Displays all user triggers
 * in a list layout with options to create, edit, delete, and toggle active state.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/hooks/useDebug';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import CustomerInsights from '@/components/analytics/CustomerInsights';
import { TriggerCard } from '@/components/triggers/TriggerCard';
import { TriggerCreationModal } from '@/components/triggers/TriggerCreationModal';
import { Plus, Zap } from 'lucide-react';

interface TriggerCondition {
  condition_type: string;
  operator: string;
  threshold_value: number;
  threshold_unit: string;
}

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
  trigger_conditions: TriggerCondition[];
}

const Triggers = () => {
  console.log('⚡ Triggers: Component initializing');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const debug = useDebug({ component: 'Triggers' });
  const { executeQuery, updateRecord, loading } = useSupabaseQuery('Triggers');
  
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  debug.log('Triggers page rendered', { 
    userId: user?.id, 
    triggerCount: triggers.length,
    loading 
  });

  /**
   * Fetch all triggers for the current user with related data
   */
  useEffect(() => {
    if (user) {
      debug.logEntry('fetchTriggers', { userId: user.id });
      fetchTriggers();
    }
  }, [user]);

  const fetchTriggers = async () => {
    if (!user) {
      debug.logWarning('Attempted to fetch triggers without user');
      return;
    }

    try {
      const data = await executeQuery(async () => {
        // Import supabase directly since the hook doesn't support complex joins yet
        const { supabase } = await import('@/integrations/supabase/client');
        
        return supabase
          .from('triggers')
          .select(`
            *,
            email_templates!triggers_email_template_id_fkey (name),
            trigger_conditions (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
      }, {
        errorMessage: 'Failed to load triggers',
        showErrorToast: true
      });

      if (data) {
        debug.logSuccess(`Loaded ${data.length} triggers`, { triggerCount: data.length });
        setTriggers(data);
      }
    } catch (error) {
      debug.logError('Failed to fetch triggers', error);
    }
  };

  /**
   * Toggle trigger active/inactive state
   */
  const handleToggle = async (triggerId: string, isActive: boolean) => {
    debug.logEntry('handleToggle', { triggerId, isActive });
    
    try {
      const result = await updateRecord('triggers', triggerId, { is_active: isActive }, {
        successMessage: `Trigger ${isActive ? 'activated' : 'deactivated'} successfully`,
        errorMessage: 'Failed to update trigger'
      });

      if (result) {
        // Update local state
        setTriggers(prev => prev.map(trigger => 
          trigger.id === triggerId ? { ...trigger, is_active: isActive } : trigger
        ));
        
        debug.logSuccess('Trigger toggled successfully', { triggerId, isActive });
      }
    } catch (error) {
      debug.logError('Failed to toggle trigger', error, { triggerId, isActive });
    }
  };

  /**
   * Handle trigger editing - navigate to edit page
   */
  const handleEdit = (trigger: Trigger) => {
    debug.logEntry('handleEdit', { triggerId: trigger.id, triggerName: trigger.name });
    
    // TODO: Implement trigger editing
    toast({
      title: "Feature Coming Soon",
      description: "Trigger editing is under development",
      variant: "default"
    });
    
    debug.log('Edit trigger clicked (not implemented)', { triggerId: trigger.id });
  };

  /**
   * Handle trigger deletion with confirmation
   */
  const handleDelete = async (triggerId: string) => {
    debug.logEntry('handleDelete', { triggerId });
    
    const trigger = triggers.find(t => t.id === triggerId);
    if (!trigger) {
      debug.logError('Trigger not found for deletion', null, { triggerId });
      return;
    }

    try {
      // Import deleteRecord method or use executeQuery directly
      const success = await executeQuery(async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        return supabase
          .from('triggers')
          .delete()
          .eq('id', triggerId);
      }, {
        successMessage: `"${trigger.name}" has been deleted successfully`,
        errorMessage: `Failed to delete "${trigger.name}"`,
        showSuccessToast: true
      });

      if (success !== null) {
        // Remove from local state
        setTriggers(prev => prev.filter(t => t.id !== triggerId));
        debug.logSuccess('Trigger deleted successfully', { triggerId, triggerName: trigger.name });
      }
    } catch (error) {
      debug.logError('Failed to delete trigger', error, { triggerId });
    }
  };

  /**
   * Navigate to create trigger page
   */
  const handleCreateTrigger = () => {
    debug.logEntry('handleCreateTrigger');
    setShowCreateModal(true);
  };

  /**
   * Handle trigger creation completion
   */
  const handleTriggerCreationComplete = (triggerData: any) => {
    debug.logEntry('handleTriggerCreationComplete', triggerData);
    
    // TODO: Implement actual trigger creation with Supabase
    toast({
      title: "Trigger Created!",
      description: `"${triggerData.name}" has been ${triggerData.activateImmediately ? 'activated' : 'saved as draft'}`,
    });
    
    // Refresh triggers list
    fetchTriggers();
  };

  // Loading state
  if (loading) {
    debug.log('Showing loading state');
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
      {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Triggers</h1>
            <p className="text-muted-foreground">
              Manage your churn prevention triggers
            </p>
          </div>
          <Button onClick={handleCreateTrigger}>
            <Plus className="w-4 h-4 mr-2" />
            Create Trigger
          </Button>
        </div>

        {/* Customer Analytics Insights */}
        <CustomerInsights />

        {/* Triggers List or Empty State */}
      {triggers.length === 0 ? (
        <Card className="bg-white border border-border shadow-card">
          <CardContent className="text-center py-12">
            <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-3">No triggers yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              Triggers watch for customer behavior in PostHog and automatically send emails to prevent churn.
            </p>
            <div className="space-y-3">
              <Button onClick={handleCreateTrigger} size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Create Your First Trigger
              </Button>
              <div className="flex items-center gap-4 text-sm">
                <Button 
                  variant="link" 
                  onClick={() => navigate('/app/integrations')}
                  className="text-muted-foreground hover:text-primary"
                >
                  Connect PostHog first
                </Button>
                <span className="text-muted-foreground">•</span>
                <Button 
                  variant="link" 
                  className="text-muted-foreground hover:text-primary"
                >
                  Learn about triggers
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {triggers.map((trigger) => (
            <TriggerCard
              key={trigger.id}
              trigger={trigger}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Trigger Creation Modal */}
      <TriggerCreationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onComplete={handleTriggerCreationComplete}
      />
    </div>
  );
};

export default Triggers;