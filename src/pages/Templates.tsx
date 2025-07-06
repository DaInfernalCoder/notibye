/**
 * Templates Page
 * 
 * Main page for managing email templates. Displays all user templates
 * in a grid layout with options to create, preview, edit, and delete.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/hooks/useDebug';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { TemplatePreviewModal } from '@/components/templates/TemplatePreviewModal';
import { Plus, Mail } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string;
  variables: string[];
  is_visual: boolean;
  created_at: string;
  updated_at: string;
}

const Templates = () => {
  console.log('📧 Templates: Component initializing');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const debug = useDebug({ component: 'Templates' });
  const { fetchUserRecords, deleteRecord, loading } = useSupabaseQuery('Templates');
  
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  debug.log('Templates page rendered', { 
    userId: user?.id, 
    templateCount: templates.length,
    loading 
  });

  /**
   * Fetch all templates for the current user
   */
  useEffect(() => {
    if (user) {
      debug.logEntry('fetchTemplates', { userId: user.id });
      fetchTemplates();
    }
  }, [user]);

  const fetchTemplates = async () => {
    if (!user) {
      debug.logWarning('Attempted to fetch templates without user');
      return;
    }

    try {
      const data = await fetchUserRecords<EmailTemplate>(
        'email_templates',
        user.id,
        {
          orderBy: { column: 'updated_at', ascending: false }
        }
      );

      if (data) {
        debug.logSuccess(`Loaded ${data.length} templates`, { templateCount: data.length });
        setTemplates(data);
      }
    } catch (error) {
      debug.logError('Failed to fetch templates', error);
    }
  };

  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  /**
   * Handle template preview - shows template content with professional modal
   */
  const handlePreview = (template: EmailTemplate) => {
    debug.logEntry('handlePreview', { templateId: template.id, templateName: template.name });
    setPreviewTemplate(template);
  };

  /**
   * Handle template editing - navigate to edit page
   */
  const handleEdit = (template: EmailTemplate) => {
    debug.logEntry('handleEdit', { templateId: template.id, templateName: template.name });
    
    // TODO: Implement template editing
    toast({
      title: "Feature Coming Soon",
      description: "Template editing is under development",
      variant: "default"
    });
    
    debug.log('Edit template clicked (not implemented)', { templateId: template.id });
  };

  /**
   * Handle template deletion with confirmation
   */
  const handleDelete = async (templateId: string) => {
    debug.logEntry('handleDelete', { templateId });
    
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      debug.logError('Template not found for deletion', null, { templateId });
      return;
    }

    try {
      const success = await deleteRecord('email_templates', templateId, {
        successMessage: `"${template.name}" has been deleted successfully`,
        errorMessage: `Failed to delete "${template.name}"`
      });

      if (success) {
        // Remove from local state
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        debug.logSuccess('Template deleted successfully', { templateId, templateName: template.name });
      }
    } catch (error) {
      debug.logError('Failed to delete template', error, { templateId });
    }
  };

  /**
   * Navigate to create template page
   */
  const handleCreateTemplate = () => {
    debug.logEntry('handleCreateTemplate');
    navigate('/app/templates/new');
  };

  // Loading state
  if (loading) {
    debug.log('Showing loading state');
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">
            Create and manage your email templates with dynamic variables
          </p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid or Empty State */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first email template to use in your triggers.
            </p>
            <Button onClick={handleCreateTemplate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={handlePreview}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onSendTest={() => {
          toast({
            title: "Feature Coming Soon",
            description: "Test email sending is under development"
          });
        }}
      />
    </div>
  );
};

export default Templates;