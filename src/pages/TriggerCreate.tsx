import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Zap, Plus, Trash2, AlertTriangle, Play, TestTube, CheckCircle, XCircle } from 'lucide-react';

// Types for better TypeScript support and debugging
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

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

// Mock customer data for testing purposes
const MOCK_CUSTOMERS = [
  {
    email: 'john@example.com',
    events_count: 25,
    session_duration: 180,
    page_views: 12,
    feature_usage: 3,
    last_seen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    email: 'sarah@example.com',
    events_count: 85,
    session_duration: 450,
    page_views: 34,
    feature_usage: 8,
    last_seen: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    email: 'mike@example.com',
    events_count: 5,
    session_duration: 60,
    page_views: 3,
    feature_usage: 1,
    last_seen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  }
];

const TriggerCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Step-by-step wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form data with better organization
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency_type: 'daily',
    frequency_value: '',
    email_template_id: '',
  });

  // Conditions with improved default
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
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    console.log('TriggerCreate: Component mounted, fetching templates');
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    console.log('TriggerCreate: Fetching email templates for user:', user?.id);
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject')
        .eq('user_id', user.id);

      if (error) {
        console.error('TriggerCreate: Error fetching templates:', error);
        throw error;
      }
      
      console.log('TriggerCreate: Successfully fetched templates:', data?.length || 0);
      setTemplates(data || []);
    } catch (error) {
      console.error('TriggerCreate: Failed to fetch templates:', error);
      toast({
        title: "Warning",
        description: "Could not load email templates. You can still create a trigger.",
        variant: "destructive"
      });
    }
  };

  // Improved condition management with better UX
  const addCondition = () => {
    console.log('TriggerCreate: Adding new condition');
    const newCondition = {
      id: crypto.randomUUID(),
      condition_type: 'usage_drop',
      field_name: 'events_count',
      operator: 'less_than',
      threshold_value: 50,
      threshold_unit: 'percent',
      logical_operator: 'AND' as const
    };
    setConditions(prev => {
      console.log('TriggerCreate: Total conditions after add:', prev.length + 1);
      return [...prev, newCondition];
    });
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      console.log('TriggerCreate: Removing condition:', id);
      setConditions(prev => {
        const updated = prev.filter(c => c.id !== id);
        console.log('TriggerCreate: Total conditions after remove:', updated.length);
        return updated;
      });
    } else {
      console.log('TriggerCreate: Cannot remove last condition');
    }
  };

  const updateCondition = (id: string, field: keyof TriggerCondition, value: any) => {
    console.log('TriggerCreate: Updating condition:', id, field, value);
    setConditions(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  // Enhanced testing functionality
  const testTriggerConditions = async () => {
    console.log('TriggerCreate: Starting trigger test with conditions:', conditions);
    setIsTesting(true);
    setTestResults([]);

    try {
      const results: TestResult[] = [];

      // Test against mock customers
      for (const customer of MOCK_CUSTOMERS) {
        console.log('TriggerCreate: Testing customer:', customer.email);
        
        let conditionResults: boolean[] = [];
        
        // Evaluate each condition
        for (const condition of conditions) {
          const result = evaluateCondition(condition, customer);
          conditionResults.push(result);
          console.log(`TriggerCreate: Condition "${condition.field_name} ${condition.operator} ${condition.threshold_value}" for ${customer.email}:`, result);
        }

        // Apply logical operators (simplified for demo)
        const finalResult = conditionResults.some(Boolean); // OR logic for demo
        
        results.push({
          success: finalResult,
          message: `${customer.email}: ${finalResult ? 'Would trigger' : 'Would not trigger'}`,
          details: {
            customer: customer.email,
            conditions: conditionResults,
            triggered: finalResult
          }
        });
      }

      console.log('TriggerCreate: Test completed, results:', results);
      setTestResults(results);
      
      toast({
        title: "Test completed!",
        description: `Tested ${MOCK_CUSTOMERS.length} customers. ${results.filter(r => r.success).length} would trigger.`
      });

    } catch (error) {
      console.error('TriggerCreate: Test failed:', error);
      toast({
        title: "Test failed",
        description: "Could not complete trigger test",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Condition evaluation logic
  const evaluateCondition = (condition: TriggerCondition, customer: any): boolean => {
    const fieldValue = customer[condition.field_name];
    
    if (fieldValue === undefined) {
      console.warn('TriggerCreate: Field not found:', condition.field_name);
      return false;
    }

    let threshold = condition.threshold_value;
    
    // Handle percentage calculations
    if (condition.threshold_unit === 'percent' && condition.condition_type === 'usage_drop') {
      // Assume baseline of 100 for percentage calculations
      threshold = 100 - threshold;
    }

    switch (condition.operator) {
      case 'less_than':
        return fieldValue < threshold;
      case 'greater_than':
        return fieldValue > threshold;
      case 'equals':
        return fieldValue === threshold;
      case 'not_equals':
        return fieldValue !== threshold;
      default:
        console.warn('TriggerCreate: Unknown operator:', condition.operator);
        return false;
    }
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < totalSteps) {
      console.log('TriggerCreate: Moving to step:', currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      console.log('TriggerCreate: Moving to step:', currentStep - 1);
      setCurrentStep(currentStep - 1);
    }
  };

  // Enhanced validation with better error messages
  const validateCurrentStep = (): boolean => {
    console.log('TriggerCreate: Validating step:', currentStep);
    
    switch (currentStep) {
      case 1: // Basic Info
        if (!formData.name.trim()) {
          toast({ title: "Please enter a trigger name", variant: "destructive" });
          return false;
        }
        break;
      case 2: // Conditions
        if (conditions.length === 0) {
          toast({ title: "Please add at least one condition", variant: "destructive" });
          return false;
        }
        break;
      case 3: // Frequency & Template
        if (!formData.email_template_id) {
          toast({ title: "Please select an email template", variant: "destructive" });
          return false;
        }
        if (formData.frequency_type === 'custom' && !formData.frequency_value.trim()) {
          toast({ title: "Please enter a custom frequency value", variant: "destructive" });
          return false;
        }
        break;
    }
    return true;
  };

  // Enhanced form submission
  const handleSubmit = async () => {
    console.log('TriggerCreate: Starting form submission');
    console.log('TriggerCreate: Form data:', formData);
    console.log('TriggerCreate: Conditions:', conditions);
    
    if (!user) {
      console.error('TriggerCreate: No user found');
      return;
    }

    setLoading(true);
    try {
      // Create trigger
      console.log('TriggerCreate: Creating trigger in database');
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

      if (triggerError) {
        console.error('TriggerCreate: Error creating trigger:', triggerError);
        throw triggerError;
      }

      console.log('TriggerCreate: Trigger created successfully:', triggerData.id);

      // Create conditions
      console.log('TriggerCreate: Creating conditions in database');
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

      if (conditionsError) {
        console.error('TriggerCreate: Error creating conditions:', conditionsError);
        throw conditionsError;
      }

      console.log('TriggerCreate: All conditions created successfully');

      toast({
        title: "🎉 Trigger created successfully!",
        description: `${formData.name} is now active and monitoring for churn signals.`
      });

      navigate('/app/triggers');
    } catch (error) {
      console.error('TriggerCreate: Form submission failed:', error);
      toast({
        title: "Failed to create trigger",
        description: "Please check your inputs and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get user-friendly field names
  const getFieldDisplayName = (fieldName: string) => {
    const fieldNames = {
      events_count: 'Total Events',
      session_duration: 'Session Duration (minutes)',
      page_views: 'Page Views',
      feature_usage: 'Feature Usage Count',
      last_seen: 'Last Seen (days ago)'
    };
    return fieldNames[fieldName as keyof typeof fieldNames] || fieldName;
  };

  // Progress calculation
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Header with improved navigation */}
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Create Trigger</h1>
          <p className="text-muted-foreground">
            Step {currentStep} of {totalSteps}: Set up your churn prevention trigger
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <Progress value={progress} className="w-32 mb-1" />
          {Math.round(progress)}% complete
        </div>
      </div>

      {/* Step-by-step wizard */}
      <Card className="min-h-[600px]">
        <CardContent className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Basic Information</h2>
                <p className="text-muted-foreground">
                  Let's start with the basics. Give your trigger a clear name and description.
                </p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="name">Trigger Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Low Usage Alert"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Choose a descriptive name you'll recognize later
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., Alerts when customers haven't used key features in the past week"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Help your team understand what this trigger does
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Conditions */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Set Conditions</h2>
                <p className="text-muted-foreground">
                  Define when this trigger should fire. You can add multiple conditions.
                </p>
              </div>

              <div className="space-y-4">
                {conditions.map((condition, index) => (
                  <Card key={condition.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>When this metric</Label>
                        <Select
                          value={condition.field_name}
                          onValueChange={(value) => updateCondition(condition.id, 'field_name', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="events_count">Total Events</SelectItem>
                            <SelectItem value="session_duration">Session Duration</SelectItem>
                            <SelectItem value="page_views">Page Views</SelectItem>
                            <SelectItem value="feature_usage">Feature Usage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Is</Label>
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
                            <SelectItem value="equals">Exactly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Value</Label>
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
                            </SelectContent>
                          </Select>
                        </div>
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
                            <SelectItem value="threshold">Threshold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Condition preview */}
                    <div className="mt-3 p-3 bg-muted rounded text-sm">
                      <strong>Preview:</strong> Trigger when {getFieldDisplayName(condition.field_name)} {condition.operator.replace('_', ' ')} {condition.threshold_value}{condition.threshold_unit === 'percent' ? '%' : ''}
                    </div>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addCondition}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Condition
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Frequency & Template */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Frequency & Email</h2>
                <p className="text-muted-foreground">
                  Choose how often to check for these conditions and which email to send.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
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
                        <SelectItem value="daily">Daily (Recommended)</SelectItem>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="realtime">Real-time (Advanced)</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {formData.frequency_type === 'realtime' && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Real-time triggers can send multiple emails per day. This might annoy customers.
                        </AlertDescription>
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
                        <SelectValue placeholder="Choose an email template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} - {template.subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {templates.length === 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No email templates found. <button 
                            type="button"
                            onClick={() => navigate('/app/templates/new')}
                            className="text-primary hover:underline font-medium"
                          >
                            Create one first
                          </button>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Quick Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {formData.name || 'Untitled'}</div>
                    <div><strong>Conditions:</strong> {conditions.length}</div>
                    <div><strong>Frequency:</strong> {formData.frequency_type}</div>
                    <div><strong>Template:</strong> {templates.find(t => t.id === formData.email_template_id)?.name || 'None selected'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Test & Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Test & Review</h2>
                <p className="text-muted-foreground">
                  Test your trigger with sample data before activating it.
                </p>
              </div>

              <Tabs defaultValue="test" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="test">Test Trigger</TabsTrigger>
                  <TabsTrigger value="review">Review Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="test" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Test with Sample Data</h3>
                    <Button
                      onClick={testTriggerConditions}
                      disabled={isTesting}
                      className="gap-2"
                    >
                      {isTesting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4" />
                          Run Test
                        </>
                      )}
                    </Button>
                  </div>

                  {testResults.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Test Results:</h4>
                      {testResults.map((result, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border rounded">
                          {result.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={result.success ? 'text-green-700' : 'text-gray-600'}>
                            {result.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      These are simulated results with sample data. Real triggers will use actual customer data from PostHog.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="review" className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Trigger Configuration</h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Name:</strong> {formData.name}</div>
                        <div><strong>Description:</strong> {formData.description || 'None'}</div>
                        <div><strong>Frequency:</strong> {formData.frequency_type}</div>
                        <div><strong>Email Template:</strong> {templates.find(t => t.id === formData.email_template_id)?.name || 'None'}</div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Conditions ({conditions.length})</h4>
                      {conditions.map((condition, index) => (
                        <div key={condition.id} className="text-sm py-1">
                          {index > 0 && <span className="text-muted-foreground">{condition.logical_operator} </span>}
                          {getFieldDisplayName(condition.field_name)} {condition.operator.replace('_', ' ')} {condition.threshold_value}{condition.threshold_unit === 'percent' ? '%' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>

        {/* Navigation footer */}
        <div className="border-t p-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < totalSteps ? (
              <Button
                onClick={() => {
                  if (validateCurrentStep()) {
                    nextStep();
                  }
                }}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Create Trigger
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TriggerCreate;