/**
 * Trigger Card Component
 * 
 * Displays individual trigger information in a card format.
 * Handles trigger actions like toggle active state, edit, and delete.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Clock, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { useDebug } from '@/hooks/useDebug';

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

interface TriggerCardProps {
  trigger: Trigger;
  onToggle: (triggerId: string, isActive: boolean) => void;
  onEdit: (trigger: Trigger) => void;
  onDelete: (triggerId: string) => void;
}

export const TriggerCard = ({ trigger, onToggle, onEdit, onDelete }: TriggerCardProps) => {
  const debug = useDebug({ component: 'TriggerCard' });

  /**
   * Handle trigger activation/deactivation
   */
  const handleToggle = (checked: boolean) => {
    debug.logEntry('handleToggle', { 
      triggerId: trigger.id, 
      currentState: trigger.is_active, 
      newState: checked 
    });
    onToggle(trigger.id, checked);
  };

  /**
   * Handle edit trigger action
   */
  const handleEdit = () => {
    debug.logEntry('handleEdit', { triggerId: trigger.id });
    onEdit(trigger);
  };

  /**
   * Handle delete trigger action with confirmation
   */
  const handleDelete = () => {
    debug.logEntry('handleDelete', { triggerId: trigger.id });
    
    if (confirm(`Are you sure you want to delete "${trigger.name}"?`)) {
      debug.log('User confirmed trigger deletion', { triggerId: trigger.id });
      onDelete(trigger.id);
    } else {
      debug.log('User cancelled trigger deletion', { triggerId: trigger.id });
    }
  };

  /**
   * Format frequency type and value for display
   */
  const getFrequencyDisplay = (type: string, value: string) => {
    const displayMap = {
      'realtime': 'Real-time',
      'hourly': 'Every hour',
      'daily': 'Daily',
      'weekly': 'Weekly',
      'custom': `Custom: ${value}`,
    };
    
    return displayMap[type as keyof typeof displayMap] || type;
  };

  /**
   * Generate human-readable condition summary
   */
  const getConditionSummary = (conditions: TriggerCondition[]) => {
    if (!conditions.length) {
      debug.logWarning('Trigger has no conditions', { triggerId: trigger.id });
      return 'No conditions';
    }
    
    const firstCondition = conditions[0];
    const summary = `${firstCondition.condition_type} ${firstCondition.operator} ${firstCondition.threshold_value}${firstCondition.threshold_unit}`;
    
    if (conditions.length > 1) {
      return `${summary} +${conditions.length - 1} more`;
    }
    
    return summary;
  };

  debug.log('Rendering trigger card', { 
    triggerId: trigger.id, 
    triggerName: trigger.name,
    isActive: trigger.is_active,
    conditionCount: trigger.trigger_conditions?.length || 0
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {trigger.name}
              {/* Warning indicator for unacknowledged triggers */}
              {!trigger.warning_acknowledged && (
                <div title="This trigger has warnings that need attention">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
              )}
            </CardTitle>
            <CardDescription>{trigger.description}</CardDescription>
          </div>
          
          {/* Active/Inactive Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              checked={trigger.is_active}
              onCheckedChange={handleToggle}
              title={trigger.is_active ? 'Deactivate trigger' : 'Activate trigger'}
            />
            <Badge variant={trigger.is_active ? 'default' : 'secondary'}>
              {trigger.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Trigger Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getFrequencyDisplay(trigger.frequency_type, trigger.frequency_value)}
            </div>
            <div>
              Template: {trigger.email_templates?.name || 'None'}
            </div>
          </div>
          
          {/* Conditions Summary */}
          <div className="text-sm">
            <span className="text-muted-foreground">Conditions: </span>
            {getConditionSummary(trigger.trigger_conditions)}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEdit}
              title="Edit trigger configuration"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
              title="Delete trigger permanently"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};