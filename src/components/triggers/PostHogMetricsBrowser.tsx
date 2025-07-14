import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Search, Activity, TrendingUp, Users, Eye, Clock, AlertCircle } from 'lucide-react';

interface PostHogMetric {
  id: string;
  name: string;
  description: string;
  type: 'event' | 'property' | 'cohort' | 'insight';
  category: string;
  sample_value?: string | number;
  aggregation?: 'count' | 'sum' | 'avg' | 'unique';
}

interface PostHogCondition {
  id: string;
  metric: PostHogMetric;
  operator: string;
  threshold_value: number;
  threshold_unit: string;
  time_period: string;
  logical_operator: 'AND' | 'OR';
}

interface PostHogMetricsBrowserProps {
  onConditionAdd: (condition: PostHogCondition) => void;
  existingConditions: PostHogCondition[];
}

// Mock PostHog data - replace with actual API calls
const MOCK_POSTHOG_METRICS: PostHogMetric[] = [
  // User Activity Events
  { id: 'login', name: 'Login Events', description: 'User login count', type: 'event', category: 'User Activity', sample_value: 45, aggregation: 'count' },
  { id: 'pageview', name: 'Page Views', description: 'Page view count', type: 'event', category: 'User Activity', sample_value: 342, aggregation: 'count' },
  { id: 'session_duration', name: 'Session Duration', description: 'Average session length', type: 'property', category: 'User Activity', sample_value: 180, aggregation: 'avg' },
  { id: 'feature_usage', name: 'Feature Usage', description: 'Core feature interactions', type: 'event', category: 'User Activity', sample_value: 23, aggregation: 'count' },
  
  // Engagement Metrics
  { id: 'daily_active_users', name: 'Daily Active Users', description: 'Users active in last 24h', type: 'insight', category: 'Engagement', sample_value: 156, aggregation: 'unique' },
  { id: 'button_clicks', name: 'Button Clicks', description: 'Total button interactions', type: 'event', category: 'Engagement', sample_value: 89, aggregation: 'count' },
  { id: 'form_submissions', name: 'Form Submissions', description: 'Forms completed', type: 'event', category: 'Engagement', sample_value: 12, aggregation: 'count' },
  { id: 'search_queries', name: 'Search Queries', description: 'Search functionality usage', type: 'event', category: 'Engagement', sample_value: 67, aggregation: 'count' },
  
  // Business Metrics
  { id: 'revenue_events', name: 'Revenue Events', description: 'Purchase/payment events', type: 'event', category: 'Business', sample_value: 8, aggregation: 'count' },
  { id: 'subscription_events', name: 'Subscription Events', description: 'Subscription changes', type: 'event', category: 'Business', sample_value: 3, aggregation: 'count' },
  { id: 'support_tickets', name: 'Support Tickets', description: 'Help desk interactions', type: 'event', category: 'Business', sample_value: 5, aggregation: 'count' },
  
  // Churn Signals
  { id: 'error_events', name: 'Error Events', description: 'Application errors encountered', type: 'event', category: 'Churn Signals', sample_value: 15, aggregation: 'count' },
  { id: 'cancellation_flow', name: 'Cancellation Flow', description: 'Users in cancellation process', type: 'event', category: 'Churn Signals', sample_value: 2, aggregation: 'count' },
  { id: 'low_engagement', name: 'Low Engagement Score', description: 'Users with declining activity', type: 'insight', category: 'Churn Signals', sample_value: 34, aggregation: 'unique' },
  { id: 'support_escalation', name: 'Support Escalations', description: 'High-priority support cases', type: 'event', category: 'Churn Signals', sample_value: 7, aggregation: 'count' },
];

const CHURN_PRESET_CONDITIONS = [
  {
    name: 'Inactive Users',
    description: 'Users who haven\'t logged in recently',
    metric: 'login',
    operator: 'less_than',
    threshold_value: 1,
    threshold_unit: 'count',
    time_period: '7d'
  },
  {
    name: 'Low Engagement',
    description: 'Users with declining activity',
    metric: 'daily_active_users',
    operator: 'less_than',
    threshold_value: 30,
    threshold_unit: 'percent',
    time_period: '14d'
  },
  {
    name: 'Error-Prone Users',
    description: 'Users experiencing many errors',
    metric: 'error_events',
    operator: 'greater_than',
    threshold_value: 10,
    threshold_unit: 'count',
    time_period: '7d'
  },
  {
    name: 'Feature Abandonment',
    description: 'Users who stopped using key features',
    metric: 'feature_usage',
    operator: 'less_than',
    threshold_value: 5,
    threshold_unit: 'count',
    time_period: '30d'
  }
];

export function PostHogMetricsBrowser({ onConditionAdd, existingConditions }: PostHogMetricsBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState<PostHogMetric | null>(null);
  const [conditionBuilder, setConditionBuilder] = useState({
    operator: 'less_than',
    threshold_value: 1,
    threshold_unit: 'count',
    time_period: '7d'
  });
  const { toast } = useToast();

  const categories = ['all', ...new Set(MOCK_POSTHOG_METRICS.map(m => m.category))];
  
  const filteredMetrics = MOCK_POSTHOG_METRICS.filter(metric => {
    const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metric.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || metric.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'User Activity': return <Activity className="w-4 h-4" />;
      case 'Engagement': return <TrendingUp className="w-4 h-4" />;
      case 'Business': return <Users className="w-4 h-4" />;
      case 'Churn Signals': return <AlertCircle className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const handlePresetCondition = (preset: typeof CHURN_PRESET_CONDITIONS[0]) => {
    const metric = MOCK_POSTHOG_METRICS.find(m => m.id === preset.metric);
    if (!metric) return;

    const condition: PostHogCondition = {
      id: crypto.randomUUID(),
      metric,
      operator: preset.operator,
      threshold_value: preset.threshold_value,
      threshold_unit: preset.threshold_unit,
      time_period: preset.time_period,
      logical_operator: 'AND'
    };

    onConditionAdd(condition);
    toast({
      title: "Condition Added",
      description: `Added "${preset.name}" condition`
    });
  };

  const handleCustomCondition = () => {
    if (!selectedMetric) {
      toast({
        title: "Select a Metric",
        description: "Please select a PostHog metric first",
        variant: "destructive"
      });
      return;
    }

    const condition: PostHogCondition = {
      id: crypto.randomUUID(),
      metric: selectedMetric,
      operator: conditionBuilder.operator,
      threshold_value: conditionBuilder.threshold_value,
      threshold_unit: conditionBuilder.threshold_unit,
      time_period: conditionBuilder.time_period,
      logical_operator: 'AND'
    };

    onConditionAdd(condition);
    setSelectedMetric(null);
    toast({
      title: "Custom Condition Added",
      description: `Added condition for "${selectedMetric.name}"`
    });
  };

  const getConditionPreview = () => {
    if (!selectedMetric) return '';
    
    const timeLabel = conditionBuilder.time_period === '7d' ? 'last 7 days' : 
                     conditionBuilder.time_period === '14d' ? 'last 14 days' :
                     conditionBuilder.time_period === '30d' ? 'last 30 days' : 'selected period';
    
    const operatorLabel = conditionBuilder.operator === 'less_than' ? 'less than' :
                         conditionBuilder.operator === 'greater_than' ? 'greater than' : 'equals';
    
    return `Trigger when ${selectedMetric.name} is ${operatorLabel} ${conditionBuilder.threshold_value} ${conditionBuilder.threshold_unit === 'percent' ? '%' : 'times'} in ${timeLabel}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">PostHog Metrics Browser</h3>
        <p className="text-sm text-muted-foreground">
          Browse your PostHog data to create custom trigger conditions
        </p>
      </div>

      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets">Churn Presets</TabsTrigger>
          <TabsTrigger value="custom">Custom Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Common Churn Patterns</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CHURN_PRESET_CONDITIONS.map((preset, index) => (
                <Card key={index} className="hover:bg-accent cursor-pointer" onClick={() => handlePresetCondition(preset)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{preset.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        {preset.time_period}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {preset.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {preset.threshold_value} {preset.threshold_unit} {preset.operator.replace('_', ' ')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search metrics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.slice(1).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {filteredMetrics.map((metric) => (
                <Card 
                  key={metric.id} 
                  className={`cursor-pointer hover:bg-accent ${selectedMetric?.id === metric.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedMetric(metric)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(metric.category)}
                        <div>
                          <h5 className="font-medium text-sm">{metric.name}</h5>
                          <p className="text-xs text-muted-foreground">{metric.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{metric.sample_value}</div>
                        <div className="text-xs text-muted-foreground">{metric.aggregation}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedMetric && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configure Condition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>When {selectedMetric.name} is...</Label>
                      <Select
                        value={conditionBuilder.operator}
                        onValueChange={(value) => setConditionBuilder(prev => ({ ...prev, operator: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="less_than">Less Than</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="equals">Equals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Threshold</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={conditionBuilder.threshold_value}
                          onChange={(e) => setConditionBuilder(prev => ({ ...prev, threshold_value: Number(e.target.value) }))}
                          className="flex-1"
                        />
                        <Select
                          value={conditionBuilder.threshold_unit}
                          onValueChange={(value) => setConditionBuilder(prev => ({ ...prev, threshold_unit: value }))}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="count">#</SelectItem>
                            <SelectItem value="percent">%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Time Period</Label>
                      <Select
                        value={conditionBuilder.time_period}
                        onValueChange={(value) => setConditionBuilder(prev => ({ ...prev, time_period: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="14d">Last 14 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Preview:</strong> {getConditionPreview()}
                    </AlertDescription>
                  </Alert>

                  <Button onClick={handleCustomCondition} className="w-full">
                    Add This Condition
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {existingConditions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Added Conditions ({existingConditions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {existingConditions.map((condition, index) => (
                <div key={condition.id} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                  {index > 0 && <span className="text-muted-foreground">{condition.logical_operator}</span>}
                  <span>{condition.metric.name}</span>
                  <span className="text-muted-foreground">{condition.operator.replace('_', ' ')}</span>
                  <span>{condition.threshold_value}{condition.threshold_unit === 'percent' ? '%' : ''}</span>
                  <span className="text-muted-foreground">in {condition.time_period}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}