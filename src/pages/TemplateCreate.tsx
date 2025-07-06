import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Palette, Code } from 'lucide-react';

const TemplateCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body_text: '',
    is_visual: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/templates')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Templates
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Email Template</h1>
          <p className="text-muted-foreground">
            Design a new email template with dynamic variables
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Template Configuration
          </CardTitle>
          <CardDescription>
            This feature is coming soon! We're building the email template builder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              placeholder="e.g., Churn Prevention Email"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              placeholder="e.g., We miss you! Here's what you've been missing..."
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              disabled
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {formData.is_visual ? (
                  <Palette className="w-4 h-4" />
                ) : (
                  <Code className="w-4 h-4" />
                )}
                <Label htmlFor="is_visual">
                  {formData.is_visual ? 'Visual Editor' : 'Text Editor'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.is_visual 
                  ? 'Use the visual drag-and-drop editor'
                  : 'Write plain text with variables'
                }
              </p>
            </div>
            <Switch
              id="is_visual"
              checked={formData.is_visual}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visual: checked }))}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Content</Label>
            <Textarea
              id="body"
              placeholder="Write your email content here... Use {customer_name}, {usage_data}, etc."
              value={formData.body_text}
              onChange={(e) => setFormData(prev => ({ ...prev, body_text: e.target.value }))}
              rows={8}
              disabled
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              🚧 This page is under construction. Soon you'll be able to:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Use a visual drag-and-drop email builder</li>
              <li>Add dynamic variables like {`{customer_name}`}, {`{usage_data}`}</li>
              <li>Preview emails with sample data</li>
              <li>Send test emails to yourself</li>
              <li>Toggle between visual and text modes</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button disabled>
              Create Template
            </Button>
            <Button variant="outline" onClick={() => navigate('/templates')}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateCreate;