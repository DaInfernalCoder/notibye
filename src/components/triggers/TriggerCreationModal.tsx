import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface TriggerCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (triggerData: any) => void;
}

interface TriggerData {
  name: string;
  description: string;
  conditionType: string;
  timeValue: string;
  timeUnit: string;
  engagementThreshold: string;
  actionType: string;
  emailTemplate: string;
  activateImmediately: boolean;
}

export function TriggerCreationModal({ open, onOpenChange, onComplete }: TriggerCreationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [triggerData, setTriggerData] = useState<TriggerData>({
    name: '',
    description: '',
    conditionType: '',
    timeValue: '',
    timeUnit: 'days',
    engagementThreshold: '',
    actionType: 'email',
    emailTemplate: '',
    activateImmediately: true,
  });

  const steps = [
    { number: 1, title: 'Trigger Basics', description: 'Name and describe your trigger' },
    { number: 2, title: 'Define Conditions', description: 'Set up when the trigger should fire' },
    { number: 3, title: 'Set Action', description: 'Choose what happens when triggered' },
    { number: 4, title: 'Review & Activate', description: 'Confirm settings and activate' },
  ];

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleComplete = () => {
    onComplete(triggerData);
    onOpenChange(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return triggerData.name.length > 0;
      case 2:
        return triggerData.conditionType && triggerData.timeValue && triggerData.engagementThreshold;
      case 3:
        return triggerData.actionType;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const getEstimatedMatches = () => {
    // Mock estimation based on selected conditions
    const base = parseInt(triggerData.timeValue) || 1;
    const multiplier = triggerData.timeUnit === 'days' ? 1 : 7;
    return Math.max(1, Math.floor((base * multiplier) / 2));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Create New Trigger</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                currentStep >= step.number 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background text-muted-foreground border-border'
              }`}>
                {currentStep > step.number ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-px mx-2 ${
                  currentStep > step.number ? 'bg-primary' : 'bg-border'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Trigger Basics */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Trigger Basics</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Give your trigger a clear name and description
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trigger-name">Trigger Name *</Label>
                <Input
                  id="trigger-name"
                  placeholder="e.g., Inactive Users"
                  value={triggerData.name}
                  onChange={(e) => setTriggerData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger-description">Description</Label>
                <Textarea
                  id="trigger-description"
                  placeholder="e.g., Users who haven't logged in for 14 days"
                  value={triggerData.description}
                  onChange={(e) => setTriggerData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Define Conditions */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Define Conditions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set the criteria that will trigger this automation
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>When a user...</Label>
                  <Select value={triggerData.conditionType} onValueChange={(value) => 
                    setTriggerData(prev => ({ ...prev, conditionType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inactive">hasn't logged in</SelectItem>
                      <SelectItem value="no-feature">stopped using key feature</SelectItem>
                      <SelectItem value="low-usage">has low activity</SelectItem>
                      <SelectItem value="payment-failed">has failed payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label>For...</Label>
                    <Input
                      type="number"
                      placeholder="14"
                      value={triggerData.timeValue}
                      onChange={(e) => setTriggerData(prev => ({ ...prev, timeValue: e.target.value }))}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>&nbsp;</Label>
                    <Select value={triggerData.timeUnit} onValueChange={(value) => 
                      setTriggerData(prev => ({ ...prev, timeUnit: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">days</SelectItem>
                        <SelectItem value="weeks">weeks</SelectItem>
                        <SelectItem value="months">months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>And their engagement is...</Label>
                  <Select value={triggerData.engagementThreshold} onValueChange={(value) => 
                    setTriggerData(prev => ({ ...prev, engagementThreshold: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select threshold" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">below 30%</SelectItem>
                      <SelectItem value="medium">below 50%</SelectItem>
                      <SelectItem value="high">below 70%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {triggerData.conditionType && triggerData.timeValue && triggerData.engagementThreshold && (
                  <Card className="bg-accent/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{getEstimatedMatches()} customers</Badge>
                        <span className="text-sm text-muted-foreground">
                          currently match these conditions
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Set Action */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Set Action</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose what happens when conditions are met
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Action Type</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="email-action" 
                        name="action" 
                        value="email"
                        checked={triggerData.actionType === 'email'}
                        onChange={(e) => setTriggerData(prev => ({ ...prev, actionType: e.target.value }))}
                      />
                      <Label htmlFor="email-action">Send email campaign</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="cohort-action" 
                        name="action" 
                        value="cohort"
                        checked={triggerData.actionType === 'cohort'}
                        onChange={(e) => setTriggerData(prev => ({ ...prev, actionType: e.target.value }))}
                      />
                      <Label htmlFor="cohort-action">Add to cohort</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="task-action" 
                        name="action" 
                        value="task"
                        checked={triggerData.actionType === 'task'}
                        onChange={(e) => setTriggerData(prev => ({ ...prev, actionType: e.target.value }))}
                      />
                      <Label htmlFor="task-action">Create task for team</Label>
                    </div>
                  </div>
                </div>

                {triggerData.actionType === 'email' && (
                  <div className="space-y-2">
                    <Label>Email Template</Label>
                    <Select value={triggerData.emailTemplate} onValueChange={(value) => 
                      setTriggerData(prev => ({ ...prev, emailTemplate: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="re-engagement">Re-engagement Email</SelectItem>
                        <SelectItem value="feature-highlight">Feature Highlight</SelectItem>
                        <SelectItem value="success-story">Customer Success Story</SelectItem>
                        <SelectItem value="custom">Create Custom Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Review & Activate */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Review & Activate</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Review your trigger settings before activation
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{triggerData.name}</CardTitle>
                  {triggerData.description && (
                    <CardDescription>{triggerData.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Conditions</h4>
                    <p className="text-sm text-muted-foreground">
                      Triggers when users {triggerData.conditionType === 'inactive' ? "haven't logged in" : triggerData.conditionType} 
                      {' '}for {triggerData.timeValue} {triggerData.timeUnit} and engagement is {triggerData.engagementThreshold}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Action</h4>
                    <p className="text-sm text-muted-foreground">
                      {triggerData.actionType === 'email' ? `Send "${triggerData.emailTemplate}" email template` : 
                       triggerData.actionType === 'cohort' ? 'Add to cohort' : 'Create task for team'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Estimated Impact</h4>
                    <Badge variant="outline">{getEstimatedMatches()} customers will be affected</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="activate-immediately"
                  checked={triggerData.activateImmediately}
                  onCheckedChange={(checked) => setTriggerData(prev => ({ ...prev, activateImmediately: checked }))}
                />
                <Label htmlFor="activate-immediately">Activate immediately</Label>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          
          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleComplete}>
                  Save as Draft
                </Button>
                <Button onClick={handleComplete} className="gap-2">
                  Activate Trigger
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}