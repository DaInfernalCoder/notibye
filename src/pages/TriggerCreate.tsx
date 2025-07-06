import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';

const TriggerCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency_type: 'daily',
    frequency_value: '',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/triggers')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Triggers
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Trigger</h1>
          <p className="text-muted-foreground">
            Set up a new churn prevention trigger
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Trigger Configuration
          </CardTitle>
          <CardDescription>
            This feature is coming soon! We're building the trigger creation interface.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Trigger Name</Label>
            <Input
              id="name"
              placeholder="e.g., Low Usage Alert"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this trigger does..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              🚧 This page is under construction. Soon you'll be able to:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Set multiple conditions with AND/OR logic</li>
              <li>Choose trigger frequency (real-time, daily, custom)</li>
              <li>Select email templates with variables</li>
              <li>Preview and test your triggers</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button disabled>
              Create Trigger
            </Button>
            <Button variant="outline" onClick={() => navigate('/triggers')}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TriggerCreate;