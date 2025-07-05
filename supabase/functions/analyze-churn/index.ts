import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PostHogEvent {
  event: string;
  timestamp: string;
  distinct_id: string;
  properties: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { churnEventId } = await req.json();
    
    if (!churnEventId) {
      throw new Error("Churn event ID is required");
    }

    // Get the churn event details
    const { data: churnEvent, error: churnError } = await supabaseClient
      .from('churn_events')
      .select('*')
      .eq('id', churnEventId)
      .single();

    if (churnError || !churnEvent) {
      throw new Error("Churn event not found");
    }

    // Get user's PostHog integration
    const { data: posthogIntegration } = await supabaseClient
      .from('user_integrations')
      .select('*')
      .eq('user_id', churnEvent.user_id)
      .eq('service_type', 'posthog')
      .eq('is_active', true)
      .single();

    if (!posthogIntegration) {
      console.log("No PostHog integration found for user");
      return new Response(JSON.stringify({ 
        success: false, 
        message: "No PostHog integration configured" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const posthogApiKey = posthogIntegration.api_key;
    const projectId = (posthogIntegration.additional_config as any)?.project_id;
    
    if (!posthogApiKey || !projectId) {
      throw new Error("PostHog configuration incomplete");
    }

    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Query PostHog for user events
    const posthogUrl = `https://app.posthog.com/api/projects/${projectId}/events/`;
    const posthogResponse = await fetch(posthogUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${posthogApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!posthogResponse.ok) {
      throw new Error(`PostHog API error: ${posthogResponse.statusText}`);
    }

    const posthogData = await posthogResponse.json();
    const events: PostHogEvent[] = posthogData.results || [];

    // Filter events for the churned customer email
    const customerEvents = events.filter(event => 
      event.properties?.email === churnEvent.customer_email ||
      event.distinct_id === churnEvent.customer_email
    );

    // Analyze the events
    const eventCounts: Record<string, number> = {};
    const dailyActivity: Record<string, number> = {};
    let lastSeen: Date | null = null;

    customerEvents.forEach(event => {
      // Count event types
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
      
      // Track daily activity
      const eventDate = new Date(event.timestamp).toDateString();
      dailyActivity[eventDate] = (dailyActivity[eventDate] || 0) + 1;
      
      // Track last seen
      const eventTimestamp = new Date(event.timestamp);
      if (!lastSeen || eventTimestamp > lastSeen) {
        lastSeen = eventTimestamp;
      }
    });

    // Calculate metrics
    const totalEvents = customerEvents.length;
    const activeDays = Object.keys(dailyActivity).length;
    const mostUsedFeature = Object.entries(eventCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
    
    // Calculate engagement score (0-1)
    const engagementScore = Math.min(
      (totalEvents / 100) * 0.5 + (activeDays / 30) * 0.5, 
      1.0
    );

    // Store usage analytics
    await supabaseClient
      .from('usage_analytics')
      .insert({
        user_id: churnEvent.user_id,
        customer_email: churnEvent.customer_email,
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString(),
        total_events: totalEvents,
        active_days: activeDays,
        most_used_feature: mostUsedFeature,
        last_seen: lastSeen?.toISOString(),
        engagement_score: engagementScore,
        analytics_data: {
          event_counts: eventCounts,
          daily_activity: dailyActivity,
          raw_events_count: customerEvents.length
        }
      });

    // Update churn event as processed
    await supabaseClient
      .from('churn_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', churnEventId);

    // Generate summary for email
    const usageSummary = {
      customer_email: churnEvent.customer_email,
      event_type: churnEvent.event_type,
      total_events: totalEvents,
      active_days: activeDays,
      most_used_feature: mostUsedFeature,
      last_seen: lastSeen ? new Date(lastSeen).toLocaleDateString() : 'Never',
      engagement_score: Math.round(engagementScore * 100),
      days_since_last_activity: lastSeen ? 
        Math.floor((new Date().getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24)) : 
        null
    };

    // Trigger email sending
    const emailResponse = await supabaseClient.functions.invoke('send-churn-email', {
      body: {
        userId: churnEvent.user_id,
        churnEventId: churnEventId,
        usageSummary: usageSummary
      }
    });

    console.log('Email trigger response:', emailResponse);

    return new Response(JSON.stringify({
      success: true,
      analytics: usageSummary
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Analysis error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});