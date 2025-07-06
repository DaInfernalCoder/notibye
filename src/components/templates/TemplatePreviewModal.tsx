/**
 * Template Preview Modal Component
 * 
 * Professional modal for previewing email templates with sample data.
 * Inspired by modern SaaS UX patterns like Userpilot.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Mail, Code, X, Send } from 'lucide-react';
import { useDebug } from '@/hooks/useDebug';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string;
  variables: string[];
  is_visual: boolean;
}

interface TemplatePreviewModalProps {
  template: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSendTest?: () => void;
}

export const TemplatePreviewModal = ({ 
  template, 
  isOpen, 
  onClose,
  onSendTest 
}: TemplatePreviewModalProps) => {
  const debug = useDebug({ component: 'TemplatePreviewModal' });

  if (!template) return null;

  // Generate realistic sample data
  const sampleData = {
    customer_name: 'Sarah Johnson',
    customer_email: 'sarah.johnson@acmecorp.com',
    usage_data: 'Used 47 features this month',
    engagement_score: '82%',
    last_seen: '2 days ago',
    company_name: 'Acme Corporation',
    most_used_feature: 'Analytics Dashboard',
    total_events: '2,847',
    active_days: '18 out of 30',
  };

  /**
   * Replace template variables with sample data
   */
  const replaceVariables = (text: string): string => {
    let result = text;
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  };

  const previewSubject = replaceVariables(template.subject);
  const previewContent = replaceVariables(template.body_text || template.body_html);

  debug.log('Rendering template preview', { 
    templateId: template.id, 
    templateName: template.name,
    variableCount: template.variables?.length || 0
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {template.name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Preview with sample customer data
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={template.is_visual ? 'default' : 'secondary'} className="text-xs">
                {template.is_visual ? 'Visual' : 'Text'} Editor
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onSendTest}
                disabled={!onSendTest}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Send Test
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="preview" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="variables" className="gap-2">
                <Code className="w-4 h-4" />
                Variables
              </TabsTrigger>
              <TabsTrigger value="raw" className="gap-2">
                Raw Content
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              <TabsContent value="preview" className="mt-0 h-full">
                <div className="space-y-4">
                  {/* Email Header Simulation */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-4">
                          <span><strong>From:</strong> ChurnGuard &lt;noreply@churnguard.app&gt;</span>
                          <span><strong>To:</strong> {sampleData.customer_email}</span>
                        </div>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      
                      <div className="border-b pb-4 mb-4">
                        <h2 className="text-lg font-semibold text-foreground">
                          {previewSubject}
                        </h2>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <div 
                          className="whitespace-pre-wrap text-foreground leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: template.is_visual 
                              ? replaceVariables(template.body_html)
                              : previewContent.replace(/\n/g, '<br/>')
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    💡 This preview shows how your email will appear to customers with their actual data
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="variables" className="mt-0">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-3">Variables Used in This Template</h3>
                      {template.variables && template.variables.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {template.variables.map((variable) => (
                            <div key={variable} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-mono text-sm font-medium">
                                  {`{${variable}}`}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Sample: {sampleData[variable as keyof typeof sampleData] || 'N/A'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No variables detected in this template</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="raw" className="mt-0">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-3">Subject Line</h3>
                      <code className="block p-3 bg-muted rounded text-sm font-mono">
                        {template.subject}
                      </code>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-3">Email Body</h3>
                      <code className="block p-3 bg-muted rounded text-sm font-mono whitespace-pre-wrap max-h-96 overflow-auto">
                        {template.body_text || template.body_html}
                      </code>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};