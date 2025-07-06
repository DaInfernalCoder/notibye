import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Zap, Plus, Trash2, AlertTriangle, Play } from 'lucide-react';

interface TriggerCondition {
  id: string;
  condition_type: string;
  field_name: string;
  operator: string;
  threshold_value: number;
  threshold_unit: string;
  logical_operator: 'AND' | 'OR';
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
}

const TriggerCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency_type: 'daily',
    frequency_value: '',
    email_template_id: '',
  });

  const [conditions, setConditions] = useState<TriggerCondition[]>([{
    id: crypto.randomUUID(),
    condition_type: 'usage_drop',
    field_name: 'events_count',
    operator: 'less_than',
    threshold_value: 50,
    threshold_unit: 'percent',
    logical_operator: 'AND'
  }]);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject')
        .eq('user_id', user.id);

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const addCondition = () => {
    setConditions(prev => [...prev, {
      id: crypto.randomUUID(),
      condition_type: 'usage_drop',
      field_name: 'events_count',
      operator: 'less_than',
      threshold_value: 50,
      threshold_unit: 'percent',
      logical_operator: 'AND'
    }]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(prev => prev.filter(c => c.id !== id));
    }
  };

  const updateCondition = (id: string, field: keyof TriggerCondition, value: any) => {
    setConditions(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const getFrequencyWarning = () => {
    if (formData.frequency_type === 'realtime') {
      return "Real-time triggers can send multiple emails per day. Consider if this might be too frequent for your customers.";
    }
    return null;
  };

  const generatePreview = () => {
    const selectedTemplate = templates.find(t => t.id === formData.email_template_id);
    
    return {
      triggerName: formData.name || 'Untitled Trigger',
      conditions: conditions.map(c => ({
        description: `${c.field_name} ${c.operator.replace('_', ' ')} ${c.threshold_value}${c.threshold_unit === 'percent' ? '%' : ''}`
      })),
      frequency: formData.frequency_type === 'custom' ? formData.frequency_value : formData.frequency_type,
      template: selectedTemplate?.name || 'No template selected',
      sampleCustomer: {
        email: 'customer@example.com',
        usage_drop: '60%',
        last_seen: '3 days ago'
      }
    };
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Trigger name is required", variant: "destructive" });
      return false;
    }
    if (!formData.email_template_id) {
      toast({ title: "Error", description: "Please select an email template", variant: "destructive" });
      return false;
    }
    if (formData.frequency_type === 'custom' && !formData.frequency_value.trim()) {
      toast({ title: "Error", description: "Custom frequency value is required", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      // Create trigger
      const { data: triggerData, error: triggerError } = await supabase
        .from('triggers')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          email_template_id: formData.email_template_id,
          frequency_type: formData.frequency_type,
          frequency_value: formData.frequency_value || null,
          is_active: true,
          warning_acknowledged: formData.frequency_type === 'realtime'
        })
        .select()
        .single();

      if (triggerError) throw triggerError;

      // Create conditions
      const conditionsToInsert = conditions.map((condition, index) => ({
        trigger_id: triggerData.id,
        condition_type: condition.condition_type,
        field_name: condition.field_name,
        operator: condition.operator,
        threshold_value: condition.threshold_value,
        threshold_unit: condition.threshold_unit,
        logical_operator: condition.logical_operator,
        order_index: index
      }));

      const { error: conditionsError } = await supabase
        .from('trigger_conditions')
        .insert(conditionsToInsert);

      if (conditionsError) throw conditionsError;

      toast({
        title: "Trigger created successfully!",
        description: `${formData.name} is now active and monitoring for churn signals.`
      });

      navigate('/app/triggers');
    } catch (error) {
      console.error('Error creating trigger:', error);
      toast({
        title: "Error",
        description: "Failed to create trigger. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const preview = generatePreview();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/app/triggers')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Triggers
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Trigger</h1>
          <p className="text-muted-foreground">
            Set up a new churn prevention trigger with custom conditions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Trigger Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Low Usage Alert"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this trigger does..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Trigger Conditions</CardTitle>
              <CardDescription>
                Define when this trigger should fire. Multiple conditions can be combined with AND/OR logic.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {conditions.map((condition, index) => (
                <div key={condition.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Condition {index + 1}</Badge>
                      {index > 0 && (
                        <Select
                          value={condition.logical_operator}
                          onValueChange={(value: 'AND' | 'OR') => updateCondition(condition.id, 'logical_operator', value)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    {conditions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(condition.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>PostHog Field</Label>
                      <Select
                        value={condition.field_name}
                        onValueChange={(value) => updateCondition(condition.id, 'field_name', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="events_count">Events Count</SelectItem>
                          <SelectItem value="session_duration">Session Duration</SelectItem>
                          <SelectItem value="page_views">Page Views</SelectItem>
                          <SelectItem value="feature_usage">Feature Usage</SelectItem>
                          <SelectItem value="last_seen">Last Seen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Condition Type</Label>
                      <Select
                        value={condition.condition_type}
                        onValueChange={(value) => updateCondition(condition.id, 'condition_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usage_drop">Usage Drop</SelectItem>
                          <SelectItem value="no_activity">No Activity</SelectItem>
                          <SelectItem value="threshold">Threshold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Operator</Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="less_than">Less Than</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not Equals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Threshold</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={condition.threshold_value}
                          onChange={(e) => updateCondition(condition.id, 'threshold_value', Number(e.target.value))}
                          className="flex-1"
                        />
                        <Select
                          value={condition.threshold_unit}
                          onValueChange={(value) => updateCondition(condition.id, 'threshold_unit', value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percent">%</SelectItem>
                            <SelectItem value="absolute">#</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addCondition}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Condition
              </Button>
            </CardContent>
          </Card>

          {/* Frequency & Template */}
          <Card>
            <CardHeader>
              <CardTitle>Frequency & Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Check Frequency</Label>
                <Select
                  value={formData.frequency_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, frequency_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                {formData.frequency_type === 'custom' && (
                  <Input
                    placeholder="e.g., 0 9 * * 1 (Every Monday at 9 AM)"
                    value={formData.frequency_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency_value: e.target.value }))}
                  />
                )}

                {getFrequencyWarning() && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{getFrequencyWarning()}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email Template *</Label>
                <Select
                  value={formData.email_template_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, email_template_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {templates.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No templates found. <button 
                      type="button"
                      onClick={() => navigate('/app/templates/new')}
                      className="text-primary hover:underline"
                    >
                      Create one first
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Preview</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {previewMode ? 'Hide' : 'Show'} Preview
                </Button>
              </CardTitle>
              <CardDescription>
                See how your trigger will work with sample data
              </CardDescription>
            </CardHeader>
            {previewMode && (
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Trigger: {preview.triggerName}</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Conditions:</span>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {preview.conditions.map((condition, index) => (
                          <li key={index}>{condition.description}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium">Frequency:</span> {preview.frequency}
                    </div>
                    <div>
                      <span className="font-medium">Template:</span> {preview.template}
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-2">Sample Execution:</h5>
                  <div className="text-sm space-y-1">
                    <div>Customer: {preview.sampleCustomer.email}</div>
                    <div>Usage Drop: {preview.sampleCustomer.usage_drop}</div>
                    <div>Last Seen: {preview.sampleCustomer.last_seen}</div>
                    <div className="mt-2 p-2 bg-green-50 rounded text-green-800">
                      ✅ Trigger would fire - sending email
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Trigger'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/app/triggers')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TriggerCreate;