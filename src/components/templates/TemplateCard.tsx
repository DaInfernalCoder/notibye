/**
 * Template Card Component
 * 
 * Displays individual email template information in a card format.
 * Handles template actions like preview, edit, and delete.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Code, Palette } from 'lucide-react';
import { useDebug } from '@/hooks/useDebug';

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

interface TemplateCardProps {
  template: EmailTemplate;
  onPreview: (template: EmailTemplate) => void;
  onEdit: (template: EmailTemplate) => void;
  onDelete: (templateId: string) => void;
}

export const TemplateCard = ({ template, onPreview, onEdit, onDelete }: TemplateCardProps) => {
  const debug = useDebug({ component: 'TemplateCard' });

  const handlePreview = () => {
    debug.logEntry('handlePreview', { templateId: template.id });
    onPreview(template);
  };

  const handleEdit = () => {
    debug.logEntry('handleEdit', { templateId: template.id });
    onEdit(template);
  };

  const handleDelete = () => {
    debug.logEntry('handleDelete', { templateId: template.id });
    
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      debug.log('User confirmed template deletion', { templateId: template.id });
      onDelete(template.id);
    } else {
      debug.log('User cancelled template deletion', { templateId: template.id });
    }
  };

  // Format the last updated date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      debug.logError('Failed to format date', error, { dateString });
      return 'Unknown';
    }
  };

  debug.log('Rendering template card', { 
    templateId: template.id, 
    templateName: template.name,
    variableCount: template.variables?.length || 0
  });

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription className="text-sm">
              {template.subject}
            </CardDescription>
          </div>
          
          {/* Template Type Badge */}
          <div className="flex items-center gap-1">
            <Badge variant={template.is_visual ? 'default' : 'secondary'} className="text-xs">
              {template.is_visual ? (
                <>
                  <Palette className="w-3 h-3 mr-1" />
                  Visual
                </>
              ) : (
                <>
                  <Code className="w-3 h-3 mr-1" />
                  Text
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Variables Section */}
          {template.variables && template.variables.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Variables: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {template.variables.map((variable, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {`{${variable}}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground">
            Updated {formatDate(template.updated_at)}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreview}
              title="Preview template with sample data"
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEdit}
              title="Edit template"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
              title="Delete template permanently"
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