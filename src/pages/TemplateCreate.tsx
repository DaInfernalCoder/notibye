/**
 * Modern Template Creation Page
 * 
 * Redesigned with Userpilot-inspired UX patterns:
 * - Clean modal-style layout with side panels
 * - Professional tabs and component organization  
 * - Real-time preview with proper variable handling
 * - Modern animations and interactions
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/hooks/useDebug';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Mail, 
  Palette, 
  Code, 
  Eye, 
  Plus, 
  Save, 
  Send,
  Sparkles,
  FileText,
  Settings
} from 'lucide-react';

// Available template variables with descriptions
const TEMPLATE_VARIABLES = [
  { 
    name: 'customer_name', 
    description: 'Customer\'s full name',
    category: 'Personal',
    example: 'Sarah Johnson'
  },
  { 
    name: 'customer_email', 
    description: 'Customer\'s email address',
    category: 'Personal',
    example: 'sarah@company.com'
  },
  { 
    name: 'company_name', 
    description: 'Customer\'s company name',
    category: 'Personal',
    example: 'Acme Corporation'
  },
  { 
    name: 'engagement_score', 
    description: 'Customer engagement percentage',
    category: 'Analytics',
    example: '82%'
  },
  { 
    name: 'total_events', 
    description: 'Total number of events',
    category: 'Analytics',
    example: '2,847'
  },
  { 
    name: 'active_days', 
    description: 'Number of active days',
    category: 'Analytics',
    example: '18'
  },
  { 
    name: 'last_seen', 
    description: 'Last activity date',
    category: 'Analytics',
    example: '2 days ago'
  },
  { 
    name: 'most_used_feature', 
    description: 'Most frequently used feature',
    category: 'Analytics',
    example: 'Analytics Dashboard'
  },
];

const TemplateCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const debug = useDebug({ component: 'TemplateCreate' });
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body_text: '',
    body_html: '',
    is_visual: false,
    variables: [] as string[],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  
  debug.log('Template create form rendered', { 
    formData, 
    isSubmitting, 
    activeTab,
    userId: user?.id 
  });

  /**
   * Extract variables from text content automatically
   */
  useEffect(() => {
    const extractVariables = (text: string) => {
      const matches = text.match(/{([a-zA-Z_][a-zA-Z0-9_]*)}/g);
      if (!matches) return [];
      
      const variables = matches.map(match => match.slice(1, -1));
      return [...new Set(variables)];
    };

    const textVariables = extractVariables(formData.body_text);
    const subjectVariables = extractVariables(formData.subject);
    const allVariables = [...new Set([...textVariables, ...subjectVariables])];
    
    if (JSON.stringify(allVariables) !== JSON.stringify(formData.variables)) {
      debug.log('Variables auto-detected', { variables: allVariables });
      setFormData(prev => ({ ...prev, variables: allVariables }));
    }
  }, [formData.body_text, formData.subject, formData.variables, debug]);

  /**
   * Handle form field updates
   */
  const handleInputChange = (field: string, value: string | boolean) => {
    debug.log(`Updating field: ${field}`, { value });
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Add a variable to the current cursor position in textarea
   */
  const addVariable = (variableName: string) => {
    debug.logEntry('addVariable', { variableName });
    
    const textarea = document.getElementById('body_text') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = formData.body_text;
      const newText = currentText.substring(0, start) + `{${variableName}}` + currentText.substring(end);
      
      handleInputChange('body_text', newText);
      
      // Restore cursor position after variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableName.length + 2, start + variableName.length + 2);
      }, 0);
    } else {
      // Fallback: append to end
      const newText = formData.body_text + (formData.body_text ? ' ' : '') + `{${variableName}}`;
      handleInputChange('body_text', newText);
    }
  };

  /**
   * Generate preview with sample data
   */
  const generatePreview = (text: string) => {
    const sampleData = {
      customer_name: 'Sarah Johnson',
      customer_email: 'sarah.johnson@acmecorp.com',
      company_name: 'Acme Corporation',
      engagement_score: '82%',
      total_events: '2,847',
      active_days: '18',
      last_seen: '2 days ago',
      most_used_feature: 'Analytics Dashboard',
    };
    
    let preview = text;
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      preview = preview.replace(regex, value);
    });
    
    return preview;
  };

  /**
   * Submit the template
   */
  const handleSubmit = async () => {
    console.log('🔥 TEMPLATE CREATION STARTED');
    console.log('User:', user);
    console.log('Form data:', formData);

    // Check Supabase auth session directly
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔐 Supabase session:', { session, sessionError });

    if (!user && !session?.user) {
      console.error('❌ No user found during submission');
      debug.logError('No user found during submission', null, { context: 'handleSubmit' });
      toast({
        title: "Authentication Error", 
        description: "You must be logged in to create templates. Please sign in first.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    const authUserId = user?.id || session?.user?.id;
    if (!authUserId) {
      console.error('❌ No user ID available');
      toast({
        title: "Authentication Error",
        description: "Unable to determine user identity. Please sign in again.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Validation
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body_text.trim()) {
      console.error('❌ Form validation failed');
      debug.logWarning('Form validation failed', { 
        name: !!formData.name.trim(),
        subject: !!formData.subject.trim(),
        body: !!formData.body_text.trim()
      });
      
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    debug.logEntry('handleSubmit', { templateName: formData.name });

    try {
      const templateData = {
        user_id: authUserId,
        name: formData.name.trim(),
        subject: formData.subject.trim(),
        body_text: formData.body_text.trim(),
        body_html: formData.is_visual ? formData.body_html.trim() : formData.body_text.trim(),
        is_visual: formData.is_visual,
        variables: formData.variables,
      };

      console.log('📤 Attempting to insert template data:', templateData);
      debug.log('Submitting template data', templateData);

      // Test Supabase connection first
      const { data: testData, error: testError } = await supabase
        .from('email_templates')
        .select('count(*)')
        .limit(1);
      
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }

      console.log('✅ Supabase connection test passed');

      // Use direct Supabase call instead of hook for better error handling
      const { data, error } = await supabase
        .from('email_templates')
        .insert([templateData])
        .select()
        .single();

      console.log('🏠 Database response:', { data, error });

      if (error) {
        console.error('❌ Database error during template creation:', error);
        debug.logError('Database error during template creation', error);
        
        // More specific error handling
        if (error.code === '23505') {
          throw new Error('A template with this name already exists');
        } else if (error.code === '42501') {
          throw new Error('Permission denied. Please check your authentication');
        } else {
          throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
        }
      }

      if (!data) {
        console.error('❌ No data returned from insert');
        throw new Error('No data returned from database insert');
      }

      console.log('✅ Template created successfully:', data);
      debug.logSuccess('Template created successfully', { templateId: data.id });
      
      toast({
        title: "Template Created",
        description: `"${formData.name}" has been created successfully!`
      });

      navigate('/app/templates');
      
    } catch (error: any) {
      console.error('❌ Template creation failed:', error);
      debug.logError('Template creation failed', error);
      
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('Error details:', { 
        message: errorMessage, 
        error,
        user: user?.id,
        formValid: !!(formData.name.trim() && formData.subject.trim() && formData.body_text.trim())
      });
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cancel and return to templates
   */
  const handleCancel = () => {
    debug.logEntry('handleCancel');
    navigate('/app/templates');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCancel}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Create Email Template</h1>
                  <p className="text-sm text-muted-foreground">
                    Design personalized email templates with dynamic variables
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                size="sm"
                disabled
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Test Email
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name.trim() || !formData.subject.trim() || !formData.body_text.trim()}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Editor */}
          <div className="col-span-12 lg:col-span-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="design" className="gap-2">
                  <Palette className="w-4 h-4" />
                  Design
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="space-y-6">
                {/* Template Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5" />
                      Template Information
                    </CardTitle>
                    <CardDescription>
                      Set up the basic details for your email template
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Template Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Churn Prevention Email"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="transition-all"
                        />
                      </div>
                      <div className="flex items-center space-x-3 pt-6">
                        <Label htmlFor="editor-toggle" className="text-sm font-medium">
                          Text Editor
                        </Label>
                        <Switch
                          id="editor-toggle"
                          checked={formData.is_visual}
                          onCheckedChange={(checked) => handleInputChange('is_visual', checked)}
                        />
                        <Label htmlFor="editor-toggle" className="text-sm font-medium">
                          Visual Editor
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Email Subject Line *</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., We miss you, {customer_name}! Here's what you've been missing..."
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="transition-all"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Content Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {formData.is_visual ? (
                        <Palette className="w-5 h-5" />
                      ) : (
                        <Code className="w-5 h-5" />
                      )}
                      Email Content
                    </CardTitle>
                    <CardDescription>
                      {formData.is_visual 
                        ? 'Use the visual editor to design your email layout'
                        : 'Write your email content with dynamic variables'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {formData.is_visual ? (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 text-center bg-muted/20">
                        <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Visual Editor Coming Soon</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Our drag-and-drop visual editor is in development. Switch to text mode to create your template now.
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => handleInputChange('is_visual', false)}
                          className="gap-2"
                        >
                          <Code className="w-4 h-4" />
                          Switch to Text Editor
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="body_text">Email Content *</Label>
                          <Textarea
                            id="body_text"
                            placeholder="Write your email content here...

Hi {customer_name},

We noticed you haven't been active on our platform for {last_seen}. We'd love to help you get the most out of your {company_name} account.

Your current engagement score is {engagement_score}, and we think we can help you improve it!

Best regards,
The Team"
                            value={formData.body_text}
                            onChange={(e) => handleInputChange('body_text', e.target.value)}
                            rows={16}
                            className="font-mono text-sm resize-none transition-all"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Code className="w-3 h-3" />
                          Use variables like {'{customer_name}'} to personalize emails for each recipient
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Eye className="w-5 h-5" />
                      Email Preview
                    </CardTitle>
                    <CardDescription>
                      See how your email will look to recipients with sample data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg bg-card">
                      {/* Email Header */}
                      <div className="border-b p-4 bg-muted/30">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span><strong>From:</strong> ChurnGuard &lt;noreply@churnguard.app&gt;</span>
                            <span><strong>To:</strong> sarah.johnson@acmecorp.com</span>
                          </div>
                          <span>{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Email Subject */}
                      <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold">
                          {generatePreview(formData.subject) || 'No subject entered'}
                        </h2>
                      </div>
                      
                      {/* Email Body */}
                      <div className="p-6">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {generatePreview(formData.body_text) || 'No content entered'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Settings className="w-5 h-5" />
                      Template Settings
                    </CardTitle>
                    <CardDescription>
                      Configure advanced options for your template
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Editor Type</h4>
                        <div className="flex items-center space-x-3">
                          <Label htmlFor="editor-toggle-2" className="text-sm">
                            Text Editor
                          </Label>
                          <Switch
                            id="editor-toggle-2"
                            checked={formData.is_visual}
                            onCheckedChange={(checked) => handleInputChange('is_visual', checked)}
                          />
                          <Label htmlFor="editor-toggle-2" className="text-sm">
                            Visual Editor
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Choose between text-based or visual email editor
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-medium mb-2">Variables Detected</h4>
                        {formData.variables.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {formData.variables.map((variable) => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {`{${variable}}`}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No variables detected in your template
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Variables Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Template Variables</CardTitle>
                  <CardDescription>
                    Click any variable to add it to your email content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['Personal', 'Analytics'].map((category) => (
                    <div key={category}>
                      <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {TEMPLATE_VARIABLES
                          .filter(variable => variable.category === category)
                          .map((variable) => (
                            <div 
                              key={variable.name} 
                              className="group flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => addVariable(variable.name)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-mono text-sm font-medium group-hover:text-primary transition-colors">
                                  {`{${variable.name}}`}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {variable.description}
                                </div>
                                <div className="text-xs text-muted-foreground/70 mt-1">
                                  e.g., {variable.example}
                                </div>
                              </div>
                              <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('preview')}
                    className="w-full gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="w-full gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Test Email
                    <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCreate;