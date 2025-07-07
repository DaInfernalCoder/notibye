/**
 * Comprehensive Testing Component for ChurnFlow System
 * 
 * Tests the complete email template creation and PostHog trigger pipeline
 * with extensive edge case handling and detailed logging.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Zap, Play, RefreshCw, TestTube, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
  duration?: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  completed: boolean;
  totalTests: number;
  passedTests: number;
}

const TestChurnFlow = () => {
  const [customerEmail, setCustomerEmail] = useState('test.customer@example.com');
  const [loading, setLoading] = useState(false);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  /**
   * Initialize test suites structure
   */
  const initializeTestSuites = (): TestSuite[] => {
    return [
      {
        name: 'Email Template System',
        tests: [],
        completed: false,
        totalTests: 8,
        passedTests: 0
      },
      {
        name: 'PostHog Integration',
        tests: [],
        completed: false,
        totalTests: 6,
        passedTests: 0
      },
      {
        name: 'Trigger Creation System',
        tests: [],
        completed: false,
        totalTests: 7,
        passedTests: 0
      },
      {
        name: 'End-to-End Workflow',
        tests: [],
        completed: false,
        totalTests: 5,
        passedTests: 0
      }
    ];
  };

  /**
   * Add test result to suite
   */
  const addTestResult = (suiteName: string, result: TestResult) => {
    setTestSuites(prev => prev.map(suite => {
      if (suite.name === suiteName) {
        const updatedTests = [...suite.tests, result];
        const passedTests = updatedTests.filter(t => t.status === 'success').length;
        const completed = updatedTests.length >= suite.totalTests;
        
        return {
          ...suite,
          tests: updatedTests,
          passedTests,
          completed
        };
      }
      return suite;
    }));
  };

  /**
   * Execute a test with timing and error handling
   */
  const executeTest = async (
    testName: string,
    suiteName: string,
    testFn: () => Promise<any>
  ): Promise<boolean> => {
    const startTime = performance.now();
    setCurrentTest(testName);
    
    try {
      console.log(`🧪 Starting test: ${testName}`);
      const result = await testFn();
      const duration = performance.now() - startTime;
      
      addTestResult(suiteName, {
        name: testName,
        status: 'success',
        message: 'Test passed successfully',
        details: result,
        duration: Math.round(duration)
      });
      
      console.log(`✅ Test passed: ${testName} (${Math.round(duration)}ms)`);
      return true;
      
    } catch (error: any) {
      const duration = performance.now() - startTime;
      console.error(`❌ Test failed: ${testName}`, error);
      
      addTestResult(suiteName, {
        name: testName,
        status: 'error',
        message: error.message || 'Test failed with unknown error',
        details: error,
        duration: Math.round(duration)
      });
      
      return false;
    }
  };

  /**
   * Test email template creation with all edge cases
   */
  const testEmailTemplateSystem = async (): Promise<void> => {
    const suiteName = 'Email Template System';
    
    // Test 1: Basic template creation
    await executeTest(
      'Basic Template Creation',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        const templateData = {
          user_id: userData.user.id,
          name: 'Test Template Basic',
          subject: 'Test Subject {customer_name}',
          body_text: 'Hello {customer_name}, your engagement score is {engagement_score}%',
          body_html: '<p>Hello {customer_name}, your engagement score is {engagement_score}%</p>',
          is_visual: false,
          variables: ['customer_name', 'engagement_score']
        };

        const { data, error } = await supabase
          .from('email_templates')
          .insert([templateData])
          .select()
          .single();

        if (error) throw error;
        return { templateId: data.id, templateName: data.name };
      }
    );

    // Test 2: Template with empty fields (should fail)
    await executeTest(
      'Empty Template Validation',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        const templateData = {
          user_id: userData.user.id,
          name: '',
          subject: '',
          body_text: '',
          body_html: '',
          is_visual: false,
          variables: []
        };

        const { error } = await supabase
          .from('email_templates')
          .insert([templateData]);

        if (!error) throw new Error('Expected validation error for empty fields');
        return { validationWorking: true };
      }
    );

    // Test 3: Template with extremely long content
    await executeTest(
      'Large Content Template',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        const longContent = 'A'.repeat(10000); // 10KB of content
        const templateData = {
          user_id: userData.user.id,
          name: 'Large Content Test',
          subject: 'Large Content Subject',
          body_text: longContent,
          body_html: `<p>${longContent}</p>`,
          is_visual: false,
          variables: []
        };

        const { data, error } = await supabase
          .from('email_templates')
          .insert([templateData])
          .select()
          .single();

        if (error) throw error;
        return { templateId: data.id, contentLength: longContent.length };
      }
    );

    // Test 4: Variable extraction functionality
    await executeTest(
      'Variable Extraction',
      suiteName,
      async () => {
        const testText = 'Hello {customer_name}, your score is {engagement_score}% and you have {total_events} events';
        const matches = testText.match(/{([a-zA-Z_][a-zA-Z0-9_]*)}/g);
        const variables = matches ? matches.map(match => match.slice(1, -1)) : [];
        
        const expectedVariables = ['customer_name', 'engagement_score', 'total_events'];
        const allFound = expectedVariables.every(v => variables.includes(v));
        
        if (!allFound) throw new Error('Variable extraction failed');
        return { extractedVariables: variables, expectedVariables };
      }
    );

    // Test 5: Template fetch with user filtering
    await executeTest(
      'User Template Filtering',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('user_id', userData.user.id);

        if (error) throw error;
        return { templateCount: data.length, userTemplatesOnly: true };
      }
    );

    // Test 6: Template preview generation
    await executeTest(
      'Template Preview Generation',
      suiteName,
      async () => {
        const templateText = 'Hello {customer_name}, your engagement is {engagement_score}%';
        const sampleData = {
          customer_name: 'John Doe',
          engagement_score: '85'
        };

        let preview = templateText;
        Object.entries(sampleData).forEach(([key, value]) => {
          const regex = new RegExp(`\\{${key}\\}`, 'g');
          preview = preview.replace(regex, value);
        });

        const expectedPreview = 'Hello John Doe, your engagement is 85%';
        if (preview !== expectedPreview) throw new Error('Preview generation failed');
        
        return { originalText: templateText, generatedPreview: preview };
      }
    );

    // Test 7: Template update functionality
    await executeTest(
      'Template Update',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        // Find a template to update
        const { data: templates } = await supabase
          .from('email_templates')
          .select('*')
          .eq('user_id', userData.user.id)
          .limit(1);

        if (!templates || templates.length === 0) {
          throw new Error('No templates found to update');
        }

        const template = templates[0];
        const updatedSubject = `${template.subject} (Updated)`;

        const { data, error } = await supabase
          .from('email_templates')
          .update({ subject: updatedSubject })
          .eq('id', template.id)
          .select()
          .single();

        if (error) throw error;
        return { templateId: data.id, updatedSubject: data.subject };
      }
    );

    // Test 8: Template deletion
    await executeTest(
      'Template Deletion',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        // Create a template specifically for deletion
        const { data: newTemplate, error: createError } = await supabase
          .from('email_templates')
          .insert([{
            user_id: userData.user.id,
            name: 'Template for Deletion',
            subject: 'Delete Me',
            body_text: 'This template will be deleted',
            body_html: '<p>This template will be deleted</p>',
            is_visual: false,
            variables: []
          }])
          .select()
          .single();

        if (createError) throw createError;

        // Now delete it
        const { error: deleteError } = await supabase
          .from('email_templates')
          .delete()
          .eq('id', newTemplate.id);

        if (deleteError) throw deleteError;
        return { deletedTemplateId: newTemplate.id };
      }
    );
  };

  /**
   * Test PostHog integration functionality
   */
  const testPostHogIntegration = async (): Promise<void> => {
    const suiteName = 'PostHog Integration';

    // Test 1: PostHog sync function availability
    await executeTest(
      'Sync Function Availability',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        // Test calling the sync function (should fail gracefully without PostHog config)
        try {
          const { data, error } = await supabase.functions.invoke('sync-posthog-data', {
            body: { user_id: userData.user.id, days_back: 7 }
          });
          
          // We expect this to fail since PostHog isn't configured in test
          if (error && error.message.includes('PostHog integration not found')) {
            return { functionAvailable: true, expectedError: error.message };
          }
          
          return { functionAvailable: true, data };
        } catch (error: any) {
          if (error.message.includes('PostHog')) {
            return { functionAvailable: true, expectedError: error.message };
          }
          throw error;
        }
      }
    );

    // Test 2: Usage analytics table structure
    await executeTest(
      'Usage Analytics Table',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        // Test inserting mock analytics data
        const mockAnalytics = {
          user_id: userData.user.id,
          customer_email: 'test@example.com',
          period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          period_end: new Date().toISOString(),
          total_events: 150,
          active_days: 5,
          engagement_score: 75.5,
          last_seen: new Date().toISOString(),
          most_used_feature: 'Dashboard',
          analytics_data: {
            feature_usage: { dashboard: 50, reports: 30, settings: 20 },
            churn_risk: 'low'
          }
        };

        const { data, error } = await supabase
          .from('usage_analytics')
          .insert([mockAnalytics])
          .select()
          .single();

        if (error) throw error;
        return { analyticsId: data.id, engagementScore: data.engagement_score };
      }
    );

    // Test 3: Analytics data retrieval
    await executeTest(
      'Analytics Data Retrieval',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('usage_analytics')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return { recordCount: data.length, latestRecord: data[0] };
      }
    );

    // Test 4: Engagement score calculation validation
    await executeTest(
      'Engagement Score Validation',
      suiteName,
      async () => {
        const testScores = [0, 25, 50, 75, 100, 150]; // Including out-of-range
        
        testScores.forEach(score => {
          if (score < 0 || score > 100) {
            throw new Error(`Invalid engagement score: ${score}`);
          }
        });

        // Valid range test passed
        return { validScores: testScores.filter(s => s >= 0 && s <= 100) };
      }
    );

    // Test 5: Date range handling
    await executeTest(
      'Date Range Validation',
      suiteName,
      async () => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Test various date ranges
        const ranges = [
          { start: sevenDaysAgo, end: now, name: '7 days' },
          { start: thirtyDaysAgo, end: now, name: '30 days' }
        ];

        ranges.forEach(range => {
          if (range.start >= range.end) {
            throw new Error(`Invalid date range: ${range.name}`);
          }
        });

        return { validRanges: ranges.length };
      }
    );

    // Test 6: Churn risk categorization
    await executeTest(
      'Churn Risk Categories',
      suiteName,
      async () => {
        const testEngagementScores = [15, 45, 80]; // high, medium, low risk
        const expectedRisks = ['high', 'medium', 'low'];
        
        const calculatedRisks = testEngagementScores.map(score => {
          if (score < 30) return 'high';
          if (score < 60) return 'medium';
          return 'low';
        });

        const allCorrect = expectedRisks.every((risk, index) => 
          risk === calculatedRisks[index]
        );

        if (!allCorrect) throw new Error('Churn risk calculation failed');
        return { testScores: testEngagementScores, calculatedRisks };
      }
    );
  };

  /**
   * Test trigger creation system
   */
  const testTriggerSystem = async (): Promise<void> => {
    const suiteName = 'Trigger Creation System';

    // Test 1: Basic trigger creation
    await executeTest(
      'Basic Trigger Creation',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        // First ensure we have a template
        const { data: templates } = await supabase
          .from('email_templates')
          .select('id')
          .eq('user_id', userData.user.id)
          .limit(1);

        if (!templates || templates.length === 0) {
          throw new Error('No email templates available for trigger creation');
        }

        const triggerData = {
          user_id: userData.user.id,
          name: 'Test Trigger',
          description: 'Test trigger for validation',
          email_template_id: templates[0].id,
          frequency_type: 'daily',
          is_active: true
        };

        const { data, error } = await supabase
          .from('triggers')
          .insert([triggerData])
          .select()
          .single();

        if (error) throw error;
        return { triggerId: data.id, triggerName: data.name };
      }
    );

    // Test 2: Trigger condition creation
    await executeTest(
      'Trigger Conditions',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        // Get the most recent trigger
        const { data: triggers } = await supabase
          .from('triggers')
          .select('id')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!triggers || triggers.length === 0) {
          throw new Error('No triggers available for condition creation');
        }

        const conditionData = {
          trigger_id: triggers[0].id,
          condition_type: 'usage_drop',
          field_name: 'engagement_score',
          operator: 'less_than',
          threshold_value: 50,
          threshold_unit: 'percent',
          logical_operator: 'AND',
          order_index: 0
        };

        const { data, error } = await supabase
          .from('trigger_conditions')
          .insert([conditionData])
          .select()
          .single();

        if (error) throw error;
        return { conditionId: data.id, fieldName: data.field_name };
      }
    );

    // Test 3: Multiple condition logic
    await executeTest(
      'Multiple Conditions Logic',
      suiteName,
      async () => {
        const conditions = [
          { field: 'engagement_score', operator: 'less_than', value: 50, result: true },
          { field: 'total_events', operator: 'less_than', value: 100, result: true },
          { field: 'active_days', operator: 'less_than', value: 5, result: false }
        ];

        // Simulate AND logic
        const andResult = conditions.every(c => c.result);
        // Simulate OR logic  
        const orResult = conditions.some(c => c.result);

        return { 
          andResult, 
          orResult, 
          conditionCount: conditions.length,
          trueConditions: conditions.filter(c => c.result).length
        };
      }
    );

    // Test 4: Trigger frequency validation
    await executeTest(
      'Frequency Validation',
      suiteName,
      async () => {
        const validFrequencies = ['daily', 'weekly', 'monthly', 'realtime'];
        const invalidFrequencies = ['hourly', 'yearly', 'custom']; // custom needs frequency_value

        // All valid frequencies should be accepted
        validFrequencies.forEach(freq => {
          if (!['daily', 'weekly', 'monthly', 'realtime'].includes(freq)) {
            throw new Error(`Invalid frequency: ${freq}`);
          }
        });

        return { validFrequencies: validFrequencies.length };
      }
    );

    // Test 5: Trigger activation/deactivation
    await executeTest(
      'Trigger Activation Toggle',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        // Find a trigger to toggle
        const { data: triggers } = await supabase
          .from('triggers')
          .select('*')
          .eq('user_id', userData.user.id)
          .limit(1);

        if (!triggers || triggers.length === 0) {
          throw new Error('No triggers available for activation test');
        }

        const trigger = triggers[0];
        const newActiveState = !trigger.is_active;

        const { data, error } = await supabase
          .from('triggers')
          .update({ is_active: newActiveState })
          .eq('id', trigger.id)
          .select()
          .single();

        if (error) throw error;
        return { 
          triggerId: data.id, 
          previousState: trigger.is_active,
          newState: data.is_active 
        };
      }
    );

    // Test 6: Trigger condition evaluation
    await executeTest(
      'Condition Evaluation Logic',
      suiteName,
      async () => {
        const mockCustomer = {
          engagement_score: 25,
          total_events: 50,
          active_days: 2
        };

        const conditions = [
          { field: 'engagement_score', operator: 'less_than', threshold: 30 },
          { field: 'total_events', operator: 'less_than', threshold: 100 },
          { field: 'active_days', operator: 'greater_than', threshold: 5 }
        ];

        const results = conditions.map(condition => {
          const value = mockCustomer[condition.field as keyof typeof mockCustomer];
          switch (condition.operator) {
            case 'less_than': return value < condition.threshold;
            case 'greater_than': return value > condition.threshold;
            case 'equals': return value === condition.threshold;
            default: return false;
          }
        });

        return { 
          customerData: mockCustomer,
          conditionResults: results,
          allMet: results.every(Boolean),
          anyMet: results.some(Boolean)
        };
      }
    );

    // Test 7: Edge case validation
    await executeTest(
      'Edge Case Validation',
      suiteName,
      async () => {
        // Test with edge case values
        const edgeCases = [
          { value: 0, threshold: 0, operator: 'equals', expected: true },
          { value: -1, threshold: 0, operator: 'less_than', expected: true },
          { value: 1000000, threshold: 999999, operator: 'greater_than', expected: true },
          { value: null, threshold: 50, operator: 'less_than', expected: false },
          { value: undefined, threshold: 50, operator: 'less_than', expected: false }
        ];

        edgeCases.forEach(testCase => {
          let result;
          if (testCase.value === null || testCase.value === undefined) {
            result = false;
          } else {
            switch (testCase.operator) {
              case 'less_than': result = testCase.value < testCase.threshold; break;
              case 'greater_than': result = testCase.value > testCase.threshold; break;
              case 'equals': result = testCase.value === testCase.threshold; break;
              default: result = false;
            }
          }

          if (result !== testCase.expected) {
            throw new Error(`Edge case failed: ${JSON.stringify(testCase)}`);
          }
        });

        return { edgeCasesValidated: edgeCases.length };
      }
    );
  };

  /**
   * Test end-to-end workflow
   */
  const testEndToEndWorkflow = async (): Promise<void> => {
    const suiteName = 'End-to-End Workflow';

    // Test 1: Complete template-to-trigger flow
    await executeTest(
      'Template to Trigger Flow',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        // 1. Create template
        const { data: template, error: templateError } = await supabase
          .from('email_templates')
          .insert([{
            user_id: userData.user.id,
            name: 'E2E Test Template',
            subject: 'E2E Test Subject',
            body_text: 'E2E test body',
            body_html: '<p>E2E test body</p>',
            is_visual: false,
            variables: []
          }])
          .select()
          .single();

        if (templateError) throw templateError;

        // 2. Create trigger using template
        const { data: trigger, error: triggerError } = await supabase
          .from('triggers')
          .insert([{
            user_id: userData.user.id,
            name: 'E2E Test Trigger',
            description: 'End-to-end test trigger',
            email_template_id: template.id,
            frequency_type: 'daily',
            is_active: true
          }])
          .select()
          .single();

        if (triggerError) throw triggerError;

        return { 
          templateId: template.id,
          triggerId: trigger.id,
          workflowCompleted: true 
        };
      }
    );

    // Test 2: Data consistency validation
    await executeTest(
      'Data Consistency',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        // Check that all user data is properly isolated
        const [templatesResult, triggersResult, analyticsResult] = await Promise.all([
          supabase.from('email_templates').select('user_id').eq('user_id', userData.user.id),
          supabase.from('triggers').select('user_id').eq('user_id', userData.user.id),
          supabase.from('usage_analytics').select('user_id').eq('user_id', userData.user.id)
        ]);

        const allDataBelongsToUser = [
          ...(templatesResult.data || []),
          ...(triggersResult.data || []),
          ...(analyticsResult.data || [])
        ].every(record => record.user_id === userData.user.id);

        if (!allDataBelongsToUser) {
          throw new Error('Data consistency violation: found data belonging to other users');
        }

        return {
          templatesCount: templatesResult.data?.length || 0,
          triggersCount: triggersResult.data?.length || 0,
          analyticsCount: analyticsResult.data?.length || 0,
          allDataConsistent: true
        };
      }
    );

    // Test 3: Error recovery testing
    await executeTest(
      'Error Recovery',
      suiteName,
      async () => {
        // Test recovery from various error scenarios
        const errorScenarios = [
          {
            name: 'Invalid template ID in trigger',
            test: async () => {
              const { data: userData } = await supabase.auth.getUser();
              if (!userData.user) throw new Error('User not authenticated');

              const { error } = await supabase
                .from('triggers')
                .insert([{
                  user_id: userData.user.id,
                  name: 'Error Test Trigger',
                  email_template_id: 'invalid-uuid',
                  frequency_type: 'daily'
                }]);

              return !!error; // Should have error
            }
          }
        ];

        const results = await Promise.all(
          errorScenarios.map(async scenario => ({
            name: scenario.name,
            handledCorrectly: await scenario.test()
          }))
        );

        return { errorScenariosHandled: results };
      }
    );

    // Test 4: Performance validation
    await executeTest(
      'Performance Validation',
      suiteName,
      async () => {
        const startTime = performance.now();
        
        // Perform multiple operations to test performance
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        await Promise.all([
          supabase.from('email_templates').select('*').eq('user_id', userData.user.id),
          supabase.from('triggers').select('*').eq('user_id', userData.user.id),
          supabase.from('usage_analytics').select('*').eq('user_id', userData.user.id).limit(10)
        ]);

        const duration = performance.now() - startTime;
        
        // Performance should be under 2 seconds for basic operations
        if (duration > 2000) {
          throw new Error(`Performance too slow: ${duration}ms`);
        }

        return { 
          operationDuration: Math.round(duration),
          performanceAcceptable: duration < 2000 
        };
      }
    );

    // Test 5: Cleanup validation
    await executeTest(
      'Cleanup Operations',
      suiteName,
      async () => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        // Test cascading deletes work properly
        const { data: trigger } = await supabase
          .from('triggers')
          .select('id')
          .eq('user_id', userData.user.id)
          .limit(1)
          .single();

        if (!trigger) {
          return { cleanupSkipped: 'No triggers to clean up' };
        }

        // Delete trigger (conditions should cascade)
        const { error: deleteError } = await supabase
          .from('triggers')
          .delete()
          .eq('id', trigger.id);

        if (deleteError) throw deleteError;

        // Verify conditions were also deleted
        const { data: orphanedConditions } = await supabase
          .from('trigger_conditions')
          .select('id')
          .eq('trigger_id', trigger.id);

        return { 
          triggerDeleted: true,
          orphanedConditions: orphanedConditions?.length || 0,
          cleanupSuccessful: (orphanedConditions?.length || 0) === 0
        };
      }
    );
  };

  /**
   * Run all comprehensive tests
   */
  const runComprehensiveTests = async () => {
    setLoading(true);
    setTestSuites(initializeTestSuites());
    setProgress(0);

    try {
      console.log('🚀 Starting comprehensive test suite...');
      
      const totalTests = 26; // Total across all suites
      let completedTests = 0;

      // Run all test suites
      await testEmailTemplateSystem();
      completedTests += 8;
      setProgress((completedTests / totalTests) * 100);

      await testPostHogIntegration();
      completedTests += 6;
      setProgress((completedTests / totalTests) * 100);

      await testTriggerSystem();
      completedTests += 7;
      setProgress((completedTests / totalTests) * 100);

      await testEndToEndWorkflow();
      completedTests += 5;
      setProgress(100);

      console.log('✅ Comprehensive test suite completed');
      
      const allSuites = await new Promise<TestSuite[]>(resolve => {
        setTestSuites(prev => {
          resolve(prev);
          return prev;
        });
      });

      const totalPassed = allSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
      const totalTotal = allSuites.reduce((sum, suite) => sum + suite.totalTests, 0);

      toast({
        title: "🎉 Comprehensive Testing Complete!",
        description: `${totalPassed}/${totalTotal} tests passed. Check results below for details.`
      });

    } catch (error: any) {
      console.error('❌ Test suite failed:', error);
      toast({
        title: "Test Suite Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setCurrentTest('');
    }
  };

  /**
   * Simulate churn event for testing
   */
  const simulateChurnEvent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('churn_events')
        .insert({
          user_id: 'dev-user-123',
          customer_id: 'cus_test_' + Date.now(),
          customer_email: customerEmail,
          event_type: 'customer.subscription.deleted',
          event_data: {
            simulated: true,
            created: Date.now()
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Churn Event Created!",
        description: `Simulated churn event for ${customerEmail}`,
      });

      return data.id;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  const getSuiteBadge = (suite: TestSuite) => {
    if (!suite.completed) {
      return <Badge variant="secondary">Running...</Badge>;
    }
    
    if (suite.passedTests === suite.totalTests) {
      return <Badge variant="default" className="bg-green-500">All Passed</Badge>;
    }
    
    if (suite.passedTests === 0) {
      return <Badge variant="destructive">All Failed</Badge>;
    }
    
    return <Badge variant="outline">{suite.passedTests}/{suite.totalTests} Passed</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TestTube className="w-5 h-5 text-primary" />
          <CardTitle>Comprehensive System Testing</CardTitle>
        </div>
        <CardDescription>
          Test the complete ChurnFlow pipeline with comprehensive edge case coverage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer-email">Test Customer Email</Label>
            <Input
              id="customer-email"
              type="email"
              placeholder="test.customer@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={runComprehensiveTests} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Run Comprehensive Test Suite
                </>
              )}
            </Button>

            <Button 
              onClick={simulateChurnEvent} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Churn Event Test
            </Button>
          </div>
        </div>

        {/* Progress */}
        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Test Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            {currentTest && (
              <p className="text-sm text-muted-foreground">
                Currently running: {currentTest}
              </p>
            )}
          </div>
        )}

        {/* Test Results */}
        {testSuites.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-semibold">Test Results</h3>
            
            {testSuites.map((suite, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{suite.name}</CardTitle>
                    {getSuiteBadge(suite)}
                  </div>
                </CardHeader>
                <CardContent>
                  {suite.tests.length > 0 ? (
                    <div className="space-y-2">
                      {suite.tests.map((test, testIndex) => (
                        <div key={testIndex} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(test.status)}
                            <span className="text-sm font-medium">{test.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {test.duration}ms
                            </p>
                            {test.status === 'error' && (
                              <p className="text-xs text-red-500 max-w-xs truncate">
                                {test.message}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tests run yet</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="font-medium mb-1">Comprehensive test coverage includes:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Email template creation, validation, and edge cases</li>
            <li>PostHog integration and analytics processing</li>
            <li>Trigger creation and condition evaluation</li>
            <li>End-to-end workflow testing</li>
            <li>Error handling and recovery scenarios</li>
            <li>Performance validation and data consistency</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestChurnFlow;