import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Palette, Code, Eye, Plus, X, Save, Send } from 'lucide-react';

// Common email variables available for templates
const AVAILABLE_VARIABLES = [
  { name: 'customer_name', description: 'Customer\'s name' },
  { name: 'customer_email', description: 'Customer\'s email address' },
  { name: 'usage_data', description: 'Recent usage statistics' },
  { name: 'engagement_score', description: 'Customer engagement score' },
  { name: 'last_seen', description: 'Last activity date' },
  { name: 'company_name', description: 'Customer\'s company name' },
  { name: 'most_used_feature', description: 'Most frequently used feature' },
  { name: 'total_events', description: 'Total number of events' },
  { name: 'active_days', description: 'Number of active days' },
];

const TemplateCreate = () => {
  console.log('🎨 TemplateCreate: Component initializing');
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body_text: '',
    body_html: '',
    is_visual: false, // Start with text editor for simplicity
    variables: [] as string[],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  console.log('🎨 TemplateCreate: Form state', { formData, isSubmitting, previewMode });

  // Extract variables from text content
  useEffect(() => {
    const extractVariables = (text: string) => {
      const matches = text.match(/{([a-zA-Z_][a-zA-Z0-9_]*)}/g);
      if (!matches) return [];
      
      const variables = matches.map(match => match.slice(1, -1)); // Remove { }
      return [...new Set(variables)]; // Remove duplicates
    };

    const textVariables = extractVariables(formData.body_text);
    const subjectVariables = extractVariables(formData.subject);
    const allVariables = [...new Set([...textVariables, ...subjectVariables])];
    
    if (JSON.stringify(allVariables) !== JSON.stringify(formData.variables)) {
      console.log('🎨 TemplateCreate: Variables updated', allVariables);
      setFormData(prev => ({ ...prev, variables: allVariables }));
    }
  }, [formData.body_text, formData.subject, formData.variables]);

  const handleInputChange = (field: string, value: string | boolean) => {
    console.log(`🎨 TemplateCreate: Updating ${field}:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addVariable = (variableName: string) => {
    console.log('🎨 TemplateCreate: Adding variable:', variableName);
    // Simply append to end of text for now - cursor position is complex
    const currentText = formData.body_text;
    const newText = currentText + (currentText ? ' ' : '') + `{${variableName}}`;
    
    handleInputChange('body_text', newText);
  };

  const generateSampleData = () => {
    const sampleData = {
      customer_name: 'John Smith',
      customer_email: 'john@example.com',
      usage_data: '25 events this week',
      engagement_score: '78%',
      last_seen: '2 days ago',
      company_name: 'Acme Corp',
      most_used_feature: 'Analytics Dashboard',
      total_events: '1,234',
      active_days: '15',
    };
    
    console.log('🎨 TemplateCreate: Generating preview with sample data:', sampleData);
    return sampleData;
  };

  const renderPreview = (text: string) => {
    const sampleData = generateSampleData();
    let preview = text;
    
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      preview = preview.replace(regex, value);
    });
    
    return preview;
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error('❌ TemplateCreate: No user found');
      toast({
        title: "Error",
        description: "You must be logged in to create templates",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim() || !formData.subject.trim() || !formData.body_text.trim()) {
      console.warn('⚠️ TemplateCreate: Missing required fields');
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    console.log('🎨 TemplateCreate: Submitting template', formData);

    try {
      // For now, body_html is same as body_text since we're using text editor
      const templateData = {
        user_id: user.id,
        name: formData.name.trim(),
        subject: formData.subject.trim(),
        body_text: formData.body_text.trim(),
        body_html: formData.is_visual ? formData.body_html : formData.body_text.trim(),
        is_visual: formData.is_visual,
        variables: formData.variables,
      };

      console.log('🎨 TemplateCreate: Inserting template data:', templateData);

      const { data, error } = await supabase
        .from('email_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) {
        console.error('❌ TemplateCreate: Database error:', error);
        throw error;
      }

      console.log('✅ TemplateCreate: Template created successfully:', data);

      toast({
        title: "Template Created",
        description: `"${formData.name}" has been created successfully!`
      });

      // Navigate back to templates list
      navigate('/app/templates');
    } catch (error) {
      console.error('❌ TemplateCreate: Failed to create template:', error);
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    console.log('🎨 TemplateCreate: User cancelled');
    navigate('/app/templates');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCancel}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Template Details
              </CardTitle>
              <CardDescription>
                Configure the basic information for your email template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Churn Prevention Email"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., We miss you! Here's what you've been missing..."
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {formData.is_visual ? (
                      <Palette className="w-5 h-5" />
                    ) : (
                      <Code className="w-5 h-5" />
                    )}
                    Email Content
                  </CardTitle>
                  <CardDescription>
                    {formData.is_visual 
                      ? 'Use the visual editor to design your email'
                      : 'Write your email content with variables'
                    }
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="editor-toggle" className="text-sm">Text</Label>
                    <Switch
                      id="editor-toggle"
                      checked={formData.is_visual}
                      onCheckedChange={(checked) => handleInputChange('is_visual', checked)}
                    />
                    <Label htmlFor="editor-toggle" className="text-sm">Visual</Label>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {previewMode ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <h4 className="font-medium mb-2">Subject Preview:</h4>
                    <p className="text-sm">{renderPreview(formData.subject) || 'No subject entered'}</p>
                  </div>
                  <div className="border rounded-lg p-4 bg-muted/20 min-h-[200px]">
                    <h4 className="font-medium mb-2">Content Preview:</h4>
                    <div className="text-sm whitespace-pre-wrap">
                      {renderPreview(formData.body_text) || 'No content entered'}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Preview shows how the email will look with sample data
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.is_visual ? (
                    <div className="border rounded-lg p-8 text-center bg-muted/20">
                      <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Visual Editor Coming Soon</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        The drag-and-drop visual editor is under development.
                        Switch to text mode to create your template now.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => handleInputChange('is_visual', false)}
                      >
                        Switch to Text Editor
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="body">Email Content *</Label>
                        <Textarea
                          id="body"
                          placeholder="Write your email content here..."
                          value={formData.body_text}
                          onChange={(e) => handleInputChange('body_text', e.target.value)}
                          rows={12}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Use variables like {`{customer_name}`} or {`{usage_data}`} to personalize emails
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name.trim() || !formData.subject.trim() || !formData.body_text.trim()}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Creating...' : 'Create Template'}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Variables Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Variables</CardTitle>
              <CardDescription>
                Click to add variables to your template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {AVAILABLE_VARIABLES.map((variable) => (
                <div key={variable.name} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{`{${variable.name}}`}</div>
                    <div className="text-xs text-muted-foreground">{variable.description}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addVariable(variable.name)}
                    className="gap-1"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Detected Variables */}
          {formData.variables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Used Variables</CardTitle>
                <CardDescription>
                  Variables detected in your template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formData.variables.map((variable) => (
                    <Badge key={variable} variant="secondary" className="text-xs">
                      {`{${variable}}`}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="w-full gap-2"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="w-full gap-2"
              >
                <Send className="w-4 h-4" />
                Send Test Email
                <span className="text-xs">(Soon)</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TemplateCreate;