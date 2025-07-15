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
  const handleTriggerCreationComplete = async (triggerData: any) => {
    debug.logEntry('handleTriggerCreationComplete', triggerData);
    
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save trigger to database
      const result = await executeQuery(async () => {
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Create trigger
        return supabase
          .from('triggers')
          .insert({
            user_id: user.id,
            name: triggerData.name,
            description: triggerData.description || '',
            frequency_type: 'daily',
            frequency_value: null,
            email_template_id: null,
            is_active: triggerData.activateImmediately,
            warning_acknowledged: false
          })
          .select()
          .single();
      }, {
        successMessage: `"${triggerData.name}" has been ${triggerData.activateImmediately ? 'activated' : 'saved as draft'}`,
        errorMessage: "Failed to create trigger",
        showSuccessToast: true
      });

      if (result) {
        // Refresh triggers list
        fetchTriggers();
      }
    } catch (error) {
      debug.logError('Failed to create trigger', error);
    }
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
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Triggers</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your churn prevention triggers
          </p>
        </div>
        <Button onClick={handleCreateTrigger} className="w-full sm:w-auto" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Create Trigger</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {/* Customer Analytics Insights - hide on mobile */}
      <div className="hidden md:block">
        <CustomerInsights />
      </div>

      {/* Triggers List or Empty State */}
      {triggers.length === 0 ? (
        <Card className="bg-card border border-border shadow-card">
          <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
            <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">No triggers yet</h3>
            <p className="text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
              Triggers watch for customer behavior in PostHog and automatically send emails to prevent churn.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <Button onClick={handleCreateTrigger} size="default" className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Create Your First Trigger
              </Button>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm">
                <Button 
                  variant="link" 
                  onClick={() => navigate('/app/integrations')}
                  className="text-muted-foreground hover:text-primary text-xs sm:text-sm"
                >
                  Connect PostHog first
                </Button>
                <span className="text-muted-foreground hidden sm:inline">•</span>
                <Button 
                  variant="link" 
                  className="text-muted-foreground hover:text-primary text-xs sm:text-sm"
                >
                  Learn about triggers
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
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