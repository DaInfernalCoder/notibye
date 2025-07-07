import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
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

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("Missing Stripe signature");
    }

    // Extract Stripe account ID from webhook payload to find the right user
    const rawEvent = JSON.parse(body);
    const stripeAccountId = rawEvent.account;

    // Find user by Stripe account ID or webhook endpoint
    let userId: string | null = null;
    
    if (stripeAccountId) {
      // Try to find user by Stripe account ID in their integration config
      const { data: integration } = await supabaseClient
        .from('user_integrations')
        .select('user_id')
        .eq('service_type', 'stripe')
        .like('additional_config', `%${stripeAccountId}%`)
        .single();
      
      userId = integration?.user_id;
    }

    // If we can't identify the user, store the event anyway for manual review
    if (!userId) {
      console.log("Could not identify user for Stripe webhook, storing event for review");
    }

    // Validate request size to prevent DoS attacks
    if (body.length > 1024 * 1024) { // 1MB limit
      throw new Error("Request payload too large");
    }

    // Get the user's Stripe secret key and webhook secret to verify the webhook
    let stripeSecretKey: string | undefined;
    let webhookSecret: string | undefined;
    
    if (userId) {
      const { data: userIntegration } = await supabaseClient
        .from('user_integrations')
        .select('api_key, additional_config')
        .eq('user_id', userId)
        .eq('service_type', 'stripe')
        .single();
      
      stripeSecretKey = userIntegration?.api_key;
      webhookSecret = userIntegration?.additional_config?.webhook_secret;
    }

    // Use user's Stripe key or fallback to system key for verification
    const stripeKey = stripeSecretKey || Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe configuration not found");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // SECURITY: Always verify webhook signature
    let event;
    const secretToUse = webhookSecret || Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!secretToUse) {
      console.error("No webhook secret configured for user:", userId);
      throw new Error("Webhook verification failed - no secret configured");
    }
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, secretToUse);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      throw new Error("Webhook verification failed");
    }
    
    console.log(`Processing Stripe event: ${event.type} for user: ${userId || 'unknown'}`);

    // Handle subscription and payment events
    if (event.type === "customer.subscription.created" || 
        event.type === "customer.subscription.deleted" || 
        event.type === "customer.subscription.updated" ||
        event.type === "invoice.payment_succeeded" ||
        event.type === "invoice.payment_failed") {
      
      const object = event.data.object as any;
      const customerId = object.customer as string;
      
      // Get customer details
      const customer = await stripe.customers.retrieve(customerId);
      const customerEmail = (customer as any).email;
      
      if (!customerEmail) {
        console.log("No customer email found, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Store the webhook event
      await supabaseClient
        .from('webhook_events')
        .insert({
          user_id: userId,
          stripe_event_id: event.id,
          event_type: event.type,
          customer_id: customerId,
          customer_email: customerEmail,
          event_data: event.data,
          processed: false
        });

      // Create churn event for relevant subscription events
      if (event.type === "customer.subscription.deleted" || 
          event.type === "invoice.payment_failed") {
        
        await supabaseClient
          .from('churn_events')
          .insert({
            user_id: userId,
            customer_id: customerId,
            customer_email: customerEmail,
            event_type: event.type,
            event_data: event.data
          });

        console.log(`Created churn event for customer: ${customerEmail}`);
      }

      // For subscription creation/success, we could trigger "customer success" emails
      if (event.type === "customer.subscription.created" ||
          event.type === "invoice.payment_succeeded") {
        
        // This could trigger welcome emails or engagement campaigns
        console.log(`Positive subscription event for customer: ${customerEmail}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Webhook error:", error.message);
    
    // Don't expose sensitive error details to prevent information leakage
    const publicError = error.message.includes("verification failed") || 
                       error.message.includes("configuration not found") ||
                       error.message.includes("payload too large") ||
                       error.message.includes("signature")
      ? error.message 
      : "Webhook processing failed";
    
    return new Response(JSON.stringify({ error: publicError }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});