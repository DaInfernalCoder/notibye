/**
 * Trigger Processing Edge Function
 * 
 * This function runs periodically to:
 * 1. Fetch all active triggers for all users
 * 2. Evaluate trigger conditions against current user data
 * 3. Send emails when conditions are met
 * 4. Log execution results for debugging and analytics
 * 
 * Supports different trigger frequencies:
 * - realtime: Triggered by webhooks/events (not handled here)
 * - hourly: Runs every hour
 * - daily: Runs once per day
 * - weekly: Runs once per week
 * - custom: Uses frequency_value for custom cron schedule
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TriggerCondition {
  id: string;
  condition_type: string;
  operator: string;
  threshold_value: number;
  threshold_unit: string;
  field_name: string;
  logical_operator: string;
  order_index: number;
}

interface Trigger {
  id: string;
  name: string;
  description: string;
  user_id: string;
  email_template_id: string;
  frequency_type: string;
  frequency_value: string;
  is_active: boolean;
  trigger_conditions: TriggerCondition[];
  email_templates: {
    id: string;
    name: string;
    subject: string;
    body_html: string;
    body_text: string;
    variables: string[];
  };
}

interface UsageAnalytics {
  customer_email: string;
  engagement_score: number;
  active_days: number;
  total_events: number;
  last_seen: string;
  most_used_feature: string;
  period_start: string;
  period_end: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

/**
 * Evaluate a single condition against user analytics data
 */
function evaluateCondition(condition: TriggerCondition, analytics: UsageAnalytics): boolean {
  console.log(`🔍 Evaluating condition: ${condition.condition_type} ${condition.operator} ${condition.threshold_value}${condition.threshold_unit}`);
  
  let actualValue: number;
  
  // Extract the value to compare based on condition type
  switch (condition.condition_type) {
    case 'engagement_score':
      actualValue = analytics.engagement_score || 0;
      break;
    case 'active_days':
      actualValue = analytics.active_days || 0;
      break;
    case 'total_events':
      actualValue = analytics.total_events || 0;
      break;
    case 'days_since_last_seen':
      if (analytics.last_seen) {
        const lastSeenDate = new Date(analytics.last_seen);
        const daysDiff = Math.floor((Date.now() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24));
        actualValue = daysDiff;
      } else {
        actualValue = 999; // Treat no last_seen as very high days
      }
      break;
    default:
      console.warn(`⚠️ Unknown condition type: ${condition.condition_type}`);
      return false;
  }
  
  // Apply the operator
  let result = false;
  switch (condition.operator) {
    case '>':
      result = actualValue > condition.threshold_value;
      break;
    case '>=':
      result = actualValue >= condition.threshold_value;
      break;
    case '<':
      result = actualValue < condition.threshold_value;
      break;
    case '<=':
      result = actualValue <= condition.threshold_value;
      break;
    case '=':
    case '==':
      result = actualValue === condition.threshold_value;
      break;
    case '!=':
      result = actualValue !== condition.threshold_value;
      break;
    default:
      console.warn(`⚠️ Unknown operator: ${condition.operator}`);
      return false;
  }
  
  console.log(`📊 Condition result: ${actualValue} ${condition.operator} ${condition.threshold_value} = ${result}`);
  return result;
}

/**
 * Evaluate all conditions for a trigger using logical operators
 */
function evaluateAllConditions(conditions: TriggerCondition[], analytics: UsageAnalytics): boolean {
  if (conditions.length === 0) {
    console.warn('⚠️ No conditions to evaluate');
    return false;
  }
  
  // Sort conditions by order_index
  const sortedConditions = [...conditions].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  
  console.log(`🧮 Evaluating ${sortedConditions.length} conditions for customer: ${analytics.customer_email}`);
  
  // Start with the first condition
  let result = evaluateCondition(sortedConditions[0], analytics);
  
  // Apply logical operators for subsequent conditions
  for (let i = 1; i < sortedConditions.length; i++) {
    const condition = sortedConditions[i];
    const conditionResult = evaluateCondition(condition, analytics);
    
    // The logical_operator on this condition determines how it combines with the previous result
    switch (condition.logical_operator) {
      case 'OR':
        result = result || conditionResult;
        break;
      case 'AND':
      default:
        result = result && conditionResult;
        break;
    }
    
    console.log(`🔗 Applied ${condition.logical_operator}: ${result}`);
  }
  
  console.log(`✅ Final evaluation result: ${result}`);
  return result;
}

/**
 * Replace template variables with actual customer data
 */
function replaceTemplateVariables(template: string, analytics: UsageAnalytics): string {
  let result = template;
  
  // Common variable replacements
  const replacements = {
    'customer_email': analytics.customer_email,
    'engagement_score': analytics.engagement_score?.toString() || '0',
    'active_days': analytics.active_days?.toString() || '0',
    'total_events': analytics.total_events?.toString() || '0',
    'most_used_feature': analytics.most_used_feature || 'N/A',
    'last_seen': analytics.last_seen ? new Date(analytics.last_seen).toLocaleDateString() : 'Never',
    'period_start': new Date(analytics.period_start).toLocaleDateString(),
    'period_end': new Date(analytics.period_end).toLocaleDateString(),
  };
  
  // Replace all variables in the format {variable_name}
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
}

/**
 * Check if a trigger should run based on its frequency and last execution
 */
async function shouldTriggerRun(trigger: Trigger): Promise<boolean> {
  console.log(`⏰ Checking if trigger "${trigger.name}" should run (frequency: ${trigger.frequency_type})`);
  
  // Get the last execution time for this trigger
  const { data: lastExecution, error } = await supabase
    .from('trigger_executions')
    .select('executed_at')
    .eq('trigger_id', trigger.id)
    .order('executed_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('❌ Error fetching last execution:', error);
    return false;
  }
  
  const now = new Date();
  const lastExecutionTime = lastExecution ? new Date(lastExecution.executed_at) : null;
  
  console.log(`📅 Last execution: ${lastExecutionTime?.toISOString() || 'Never'}`);
  
  switch (trigger.frequency_type) {
    case 'realtime':
      // Realtime triggers are handled by webhooks, not this cron job
      return false;
    
    case 'hourly':
      if (!lastExecutionTime) return true;
      const hoursSinceLastRun = (now.getTime() - lastExecutionTime.getTime()) / (1000 * 60 * 60);
      return hoursSinceLastRun >= 1;
    
    case 'daily':
      if (!lastExecutionTime) return true;
      const daysSinceLastRun = (now.getTime() - lastExecutionTime.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLastRun >= 1;
    
    case 'weekly':
      if (!lastExecutionTime) return true;
      const weeksSinceLastRun = (now.getTime() - lastExecutionTime.getTime()) / (1000 * 60 * 60 * 24 * 7);
      return weeksSinceLastRun >= 1;
    
    case 'custom':
      // For custom frequencies, we'll run it and let the cron schedule handle the timing
      // This is a simplified approach - in production, you'd parse the cron expression
      return true;
    
    default:
      console.warn(`⚠️ Unknown frequency type: ${trigger.frequency_type}`);
      return false;
  }
}

/**
 * Process a single trigger for all applicable customers
 */
async function processTrigger(trigger: Trigger): Promise<void> {
  console.log(`🚀 Processing trigger: "${trigger.name}" for user: ${trigger.user_id}`);
  
  // Check if this trigger should run based on its frequency
  const shouldRun = await shouldTriggerRun(trigger);
  if (!shouldRun) {
    console.log(`⏭️ Skipping trigger "${trigger.name}" - not time to run yet`);
    return;
  }
  
  // Get all usage analytics for this user's customers
  const { data: analyticsData, error: analyticsError } = await supabase
    .from('usage_analytics')
    .select('*')
    .eq('user_id', trigger.user_id);
  
  if (analyticsError) {
    console.error('❌ Error fetching usage analytics:', analyticsError);
    return;
  }
  
  if (!analyticsData || analyticsData.length === 0) {
    console.log(`📊 No usage analytics found for user: ${trigger.user_id}`);
    return;
  }
  
  console.log(`📊 Found ${analyticsData.length} customer analytics records to evaluate`);
  
  // Process each customer's analytics
  for (const analytics of analyticsData) {
    try {
      console.log(`\n👤 Evaluating customer: ${analytics.customer_email}`);
      
      // Evaluate all conditions for this customer
      const conditionsMet = evaluateAllConditions(trigger.trigger_conditions, analytics);
      
      if (conditionsMet) {
        console.log(`🎯 Conditions met for ${analytics.customer_email} - sending email`);
        
        // Prepare email content with variable replacement
        const emailSubject = replaceTemplateVariables(trigger.email_templates.subject, analytics);
        const emailBodyHtml = replaceTemplateVariables(trigger.email_templates.body_html, analytics);
        const emailBodyText = replaceTemplateVariables(trigger.email_templates.body_text || '', analytics);
        
        // Call the send-churn-email function
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-churn-email', {
          body: {
            to: analytics.customer_email,
            subject: emailSubject,
            html: emailBodyHtml,
            text: emailBodyText,
            templateName: trigger.email_templates.name,
            triggerName: trigger.name
          }
        });
        
        // Log the execution result
        const executionData = {
          trigger_id: trigger.id,
          customer_email: analytics.customer_email,
          customer_id: analytics.customer_email, // Using email as ID for now
          email_sent: !emailError,
          error_message: emailError ? JSON.stringify(emailError) : null,
          execution_data: {
            conditions_evaluated: trigger.trigger_conditions.length,
            analytics_used: {
              engagement_score: analytics.engagement_score,
              active_days: analytics.active_days,
              last_seen: analytics.last_seen
            },
            email_template: trigger.email_templates.name
          }
        };
        
        const { error: logError } = await supabase
          .from('trigger_executions')
          .insert([executionData]);
        
        if (logError) {
          console.error('❌ Error logging trigger execution:', logError);
        } else {
          console.log(`📝 Logged trigger execution for ${analytics.customer_email}`);
        }
        
        if (emailError) {
          console.error(`❌ Error sending email to ${analytics.customer_email}:`, emailError);
        } else {
          console.log(`✅ Email sent successfully to ${analytics.customer_email}`);
        }
      } else {
        console.log(`❌ Conditions not met for ${analytics.customer_email}`);
      }
    } catch (error) {
      console.error(`❌ Error processing customer ${analytics.customer_email}:`, error);
    }
  }
}

/**
 * Main handler function
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('🔄 Starting trigger processing job...');
    const startTime = Date.now();
    
    // Fetch all active triggers with their conditions and email templates
    const { data: triggers, error: triggersError } = await supabase
      .from('triggers')
      .select(`
        *,
        trigger_conditions (*),
        email_templates (*)
      `)
      .eq('is_active', true);
    
    if (triggersError) {
      console.error('❌ Error fetching triggers:', triggersError);
      throw triggersError;
    }
    
    if (!triggers || triggers.length === 0) {
      console.log('📭 No active triggers found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No active triggers to process',
        processed: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    console.log(`🎯 Found ${triggers.length} active triggers to process`);
    
    // Process each trigger
    let processedCount = 0;
    for (const trigger of triggers) {
      try {
        await processTrigger(trigger as Trigger);
        processedCount++;
      } catch (error) {
        console.error(`❌ Error processing trigger ${trigger.name}:`, error);
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Trigger processing completed in ${duration}ms. Processed ${processedCount}/${triggers.length} triggers`);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${processedCount} triggers`,
      processed: processedCount,
      total: triggers.length,
      duration_ms: duration
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    console.error('❌ Fatal error in trigger processing:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);