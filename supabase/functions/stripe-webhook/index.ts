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

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecretKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("Missing Stripe signature");
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    console.log(`Processing Stripe event: ${event.type}`);

    // Handle relevant events
    if (event.type === "customer.subscription.deleted" || 
        event.type === "invoice.payment_failed" ||
        event.type === "customer.subscription.updated") {
      
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

      // Find the user by email in our integrations table
      const { data: integration } = await supabaseClient
        .from('user_integrations')
        .select('user_id')
        .eq('service_type', 'stripe')
        .eq('additional_config->customer_email', customerEmail)
        .single();

      const userId = integration?.user_id;

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

      // If it's a churn event (cancellation or payment failed), create churn event
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
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Webhook error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});