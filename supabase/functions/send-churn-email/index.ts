import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

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

    const { userId, churnEventId, usageSummary } = await req.json();
    
    if (!userId || !usageSummary) {
      throw new Error("Missing required parameters");
    }

    // Get user's email integration (Resend)
    const { data: emailIntegration } = await supabaseClient
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('service_type', 'resend')
      .eq('is_active', true)
      .single();

    // Get user profile for founder email
    const { data: userProfile } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!userProfile?.email) {
      throw new Error("User profile not found");
    }

    const founderEmail = userProfile.email;
    
    // Use user's Resend key if available, otherwise use default
    const resendApiKey = emailIntegration?.api_key || Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      throw new Error("No Resend API key configured");
    }

    const resend = new Resend(resendApiKey);

    // Generate email content
    const subject = `🚨 Customer Churn Alert: ${usageSummary.customer_email}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚨 Churn Alert</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">One of your customers has churned</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0;">Customer Details</h2>
          <p><strong>Email:</strong> ${usageSummary.customer_email}</p>
          <p><strong>Churn Event:</strong> ${usageSummary.event_type.replace('_', ' ').replace('.', ' ')}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="background: #fff; border: 2px solid #e9ecef; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0;">📊 Usage Analysis (Last 30 Days)</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
              <div style="font-size: 32px; font-weight: bold; color: #667eea;">${usageSummary.total_events}</div>
              <div style="color: #666; font-size: 14px;">Total Events</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
              <div style="font-size: 32px; font-weight: bold; color: #764ba2;">${usageSummary.active_days}</div>
              <div style="color: #666; font-size: 14px;">Active Days</div>
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <strong>Most Used Feature:</strong> ${usageSummary.most_used_feature}
          </div>
          <div style="margin-bottom: 15px;">
            <strong>Last Seen:</strong> ${usageSummary.last_seen}
            ${usageSummary.days_since_last_activity ? 
              `(${usageSummary.days_since_last_activity} days ago)` : ''}
          </div>
          <div style="margin-bottom: 15px;">
            <strong>Engagement Score:</strong> 
            <span style="background: ${usageSummary.engagement_score > 50 ? '#28a745' : usageSummary.engagement_score > 25 ? '#ffc107' : '#dc3545'}; 
                         color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">
              ${usageSummary.engagement_score}%
            </span>
          </div>
        </div>

        <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1976d2; margin-top: 0;">💡 Insights & Recommendations</h3>
          ${usageSummary.engagement_score < 25 ? 
            '<p><strong>Low Engagement:</strong> This customer had very low engagement. Consider improving onboarding or feature discovery.</p>' : ''}
          ${usageSummary.days_since_last_activity && usageSummary.days_since_last_activity > 7 ? 
            '<p><strong>Inactive User:</strong> Customer was inactive for over a week before churning. Consider re-engagement campaigns.</p>' : ''}
          ${usageSummary.most_used_feature !== 'none' ? 
            `<p><strong>Feature Focus:</strong> Customer mainly used "${usageSummary.most_used_feature}". Consider highlighting related features to similar users.</p>` : ''}
        </div>

        <div style="text-align: center; padding: 20px;">
          <p style="color: #666; font-size: 14px;">
            This email was generated automatically by ChurnFlow.<br>
            Review your dashboard for more detailed analytics and trends.
          </p>
        </div>
      </div>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: 'ChurnFlow <noreply@churnflow.com>',
      to: [founderEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log('Email sent successfully:', emailResponse);

    // Store sent email record
    await supabaseClient
      .from('sent_emails')
      .insert({
        user_id: userId,
        churn_event_id: churnEventId,
        recipient_email: founderEmail,
        subject: subject,
        email_content: htmlContent,
        usage_summary: usageSummary
      });

    return new Response(JSON.stringify({
      success: true,
      email_id: emailResponse.data?.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Email sending error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});