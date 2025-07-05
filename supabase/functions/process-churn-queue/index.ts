import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get unprocessed churn events
    const { data: churnEvents, error } = await supabaseClient
      .from('churn_events')
      .select('*')
      .is('processed_at', null)
      .order('created_at', { ascending: true })
      .limit(10); // Process in batches

    if (error) {
      throw error;
    }

    if (!churnEvents || churnEvents.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No unprocessed churn events found",
        processed: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const processedEvents = [];

    // Process each churn event
    for (const event of churnEvents) {
      try {
        console.log(`Processing churn event: ${event.id} for ${event.customer_email}`);
        
        // Call the analyze-churn function
        const analysisResponse = await supabaseClient.functions.invoke('analyze-churn', {
          body: { churnEventId: event.id }
        });

        if (analysisResponse.error) {
          console.error(`Analysis failed for event ${event.id}:`, analysisResponse.error);
          continue;
        }

        processedEvents.push({
          event_id: event.id,
          customer_email: event.customer_email,
          status: 'processed'
        });

        console.log(`Successfully processed churn event: ${event.id}`);
        
        // Add a small delay between processing to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing churn event ${event.id}:`, error);
        processedEvents.push({
          event_id: event.id,
          customer_email: event.customer_email,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      message: `Processed ${processedEvents.length} churn events`,
      processed: processedEvents.length,
      events: processedEvents
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Queue processing error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});