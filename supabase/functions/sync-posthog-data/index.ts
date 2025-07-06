import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PostHogEvent {
  distinct_id: string;
  event: string;
  timestamp: string;
  properties: Record<string, any>;
  person?: {
    properties: {
      email?: string;
      name?: string;
    };
  };
}

interface AnalyticsData {
  customer_email: string;
  period_start: string;
  period_end: string;
  total_events: number;
  active_days: number;
  engagement_score: number;
  last_seen: string;
  most_used_feature: string;
  analytics_data: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting PostHog data sync...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request data
    const { user_id, days_back = 30 } = await req.json();
    
    if (!user_id) {
      throw new Error('user_id is required');
    }

    console.log(`📊 Syncing PostHog data for user: ${user_id}, days_back: ${days_back}`);

    // Get user's PostHog integration
    const { data: integration, error: integrationError } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', user_id)
      .eq('service_type', 'posthog')
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      throw new Error('PostHog integration not found or inactive');
    }

    const posthogConfig = integration.additional_config;
    const posthogApiKey = integration.api_key;
    const posthogProjectId = posthogConfig?.project_id;

    if (!posthogApiKey || !posthogProjectId) {
      throw new Error('PostHog API key or project ID not configured');
    }

    console.log(`🔑 Using PostHog project: ${posthogProjectId}`);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days_back);

    // Fetch events from PostHog
    const posthogUrl = `https://app.posthog.com/api/projects/${posthogProjectId}/events/`;
    const posthogResponse = await fetch(posthogUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${posthogApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!posthogResponse.ok) {
      const errorText = await posthogResponse.text();
      console.error('PostHog API error:', errorText);
      throw new Error(`PostHog API error: ${posthogResponse.status} ${errorText}`);
    }

    const posthogData = await posthogResponse.json();
    const events: PostHogEvent[] = posthogData.results || [];

    console.log(`📈 Retrieved ${events.length} events from PostHog`);

    // Process events and group by user
    const userAnalytics = new Map<string, any>();

    events.forEach(event => {
      const email = event.person?.properties?.email || event.distinct_id;
      if (!email || !email.includes('@')) return; // Skip non-email identifiers

      if (!userAnalytics.has(email)) {
        userAnalytics.set(email, {
          events: [],
          activeDays: new Set(),
          featureUsage: new Map(),
          lastSeen: new Date(0),
        });
      }

      const userData = userAnalytics.get(email);
      userData.events.push(event);
      userData.activeDays.add(new Date(event.timestamp).toDateString());
      userData.lastSeen = new Date(Math.max(userData.lastSeen.getTime(), new Date(event.timestamp).getTime()));

      // Track feature usage
      const feature = event.event;
      userData.featureUsage.set(feature, (userData.featureUsage.get(feature) || 0) + 1);
    });

    console.log(`👥 Processing analytics for ${userAnalytics.size} users`);

    // Convert to analytics records
    const analyticsRecords: AnalyticsData[] = [];
    
    for (const [email, userData] of userAnalytics) {
      const totalEvents = userData.events.length;
      const activeDays = userData.activeDays.size;
      
      // Calculate engagement score (0-100)
      const maxDays = days_back;
      const engagementScore = Math.min(100, Math.round(
        (activeDays / maxDays * 40) + // 40% for consistency
        (Math.min(totalEvents, 100) / 100 * 40) + // 40% for volume
        (userData.lastSeen > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 20 : 0) // 20% for recency
      ));

      // Find most used feature
      let mostUsedFeature = 'Unknown';
      let maxUsage = 0;
      for (const [feature, count] of userData.featureUsage) {
        if (count > maxUsage) {
          maxUsage = count;
          mostUsedFeature = feature;
        }
      }

      // Calculate last seen friendly format
      const daysSinceLastSeen = Math.floor((Date.now() - userData.lastSeen.getTime()) / (24 * 60 * 60 * 1000));
      const lastSeenText = daysSinceLastSeen === 0 ? 'today' : 
                          daysSinceLastSeen === 1 ? 'yesterday' : 
                          `${daysSinceLastSeen} days ago`;

      analyticsRecords.push({
        customer_email: email,
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString(),
        total_events: totalEvents,
        active_days: activeDays,
        engagement_score: engagementScore,
        last_seen: userData.lastSeen.toISOString(),
        most_used_feature: mostUsedFeature,
        analytics_data: {
          feature_usage: Object.fromEntries(userData.featureUsage),
          daily_activity: userData.activeDays.size,
          churn_risk: engagementScore < 30 ? 'high' : engagementScore < 60 ? 'medium' : 'low',
          sync_timestamp: new Date().toISOString(),
        }
      });
    }

    console.log(`💾 Saving ${analyticsRecords.length} analytics records...`);

    // Clear existing data for this period and user
    const { error: deleteError } = await supabase
      .from('usage_analytics')
      .delete()
      .eq('user_id', user_id)
      .gte('period_start', startDate.toISOString())
      .lte('period_end', endDate.toISOString());

    if (deleteError) {
      console.error('Error deleting old analytics:', deleteError);
    }

    // Insert new analytics data
    const recordsWithUserId = analyticsRecords.map(record => ({
      ...record,
      user_id: user_id
    }));

    const { data: insertedData, error: insertError } = await supabase
      .from('usage_analytics')
      .insert(recordsWithUserId)
      .select();

    if (insertError) {
      console.error('Error inserting analytics:', insertError);
      throw insertError;
    }

    console.log(`✅ Successfully synced ${insertedData?.length || 0} analytics records`);

    // Return summary
    const summary = {
      success: true,
      records_processed: analyticsRecords.length,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: days_back
      },
      engagement_distribution: {
        high: analyticsRecords.filter(r => r.engagement_score >= 70).length,
        medium: analyticsRecords.filter(r => r.engagement_score >= 40 && r.engagement_score < 70).length,
        low: analyticsRecords.filter(r => r.engagement_score < 40).length,
      },
      churn_risk: {
        high: analyticsRecords.filter(r => r.engagement_score < 30).length,
        medium: analyticsRecords.filter(r => r.engagement_score >= 30 && r.engagement_score < 60).length,
        low: analyticsRecords.filter(r => r.engagement_score >= 60).length,
      }
    };

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ PostHog sync error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});