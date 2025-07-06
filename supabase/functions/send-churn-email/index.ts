/**
 * Send Churn Email Edge Function
 * 
 * This function handles sending churn prevention emails using Resend API.
 * It receives email content from the trigger processor and sends formatted emails
 * to customers who meet trigger conditions.
 * 
 * Features:
 * - HTML and text email support
 * - Error handling and logging
 * - Email delivery tracking
 * - Template variable replacement verification
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  templateName?: string;
  triggerName?: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

/**
 * Validate email request parameters
 */
function validateEmailRequest(body: any): EmailRequest | null {
  if (!body || typeof body !== 'object') {
    console.error('❌ Invalid request body - not an object');
    return null;
  }
  
  const { to, subject, html } = body;
  
  if (!to || typeof to !== 'string') {
    console.error('❌ Invalid or missing "to" email address');
    return null;
  }
  
  if (!subject || typeof subject !== 'string') {
    console.error('❌ Invalid or missing email subject');
    return null;
  }
  
  if (!html || typeof html !== 'string') {
    console.error('❌ Invalid or missing HTML content');
    return null;
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    console.error(`❌ Invalid email format: ${to}`);
    return null;
  }
  
  return {
    to,
    subject,
    html,
    text: body.text || '',
    templateName: body.templateName || 'Unknown',
    triggerName: body.triggerName || 'Unknown'
  };
}

/**
 * Sanitize HTML content to prevent issues
 */
function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a proper library
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

/**
 * Create fallback text content from HTML if text is not provided
 */
function createTextFallback(html: string): string {
  // Simple HTML to text conversion
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Main email sending handler
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.error(`❌ Method not allowed: ${req.method}`);
    return new Response(JSON.stringify({ 
      error: 'Method not allowed',
      allowed_methods: ['POST']
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  try {
    console.log('📧 Starting email send process...');
    const startTime = Date.now();
    
    // Check if Resend API key is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY environment variable not set');
      return new Response(JSON.stringify({
        error: 'Email service not configured',
        message: 'RESEND_API_KEY is required'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const emailRequest = validateEmailRequest(body);
    
    if (!emailRequest) {
      return new Response(JSON.stringify({
        error: 'Invalid email request',
        message: 'Required fields: to, subject, html'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    console.log(`📬 Sending email to: ${emailRequest.to}`);
    console.log(`📝 Subject: ${emailRequest.subject}`);
    console.log(`🏷️ Template: ${emailRequest.templateName}`);
    console.log(`⚡ Trigger: ${emailRequest.triggerName}`);
    
    // Sanitize HTML content
    const sanitizedHtml = sanitizeHtml(emailRequest.html);
    
    // Create text fallback if not provided
    const textContent = emailRequest.text || createTextFallback(sanitizedHtml);
    
    // Prepare email payload
    const emailPayload = {
      from: "ChurnGuard <noreply@churnguard.app>", // Update this to your verified domain
      to: [emailRequest.to],
      subject: emailRequest.subject,
      html: sanitizedHtml,
      text: textContent,
      // Add metadata for tracking
      tags: [
        { name: 'type', value: 'churn-prevention' },
        { name: 'template', value: emailRequest.templateName },
        { name: 'trigger', value: emailRequest.triggerName }
      ]
    };
    
    console.log('🚀 Sending email via Resend...');
    
    // Send the email
    const emailResponse = await resend.emails.send(emailPayload);
    
    const duration = Date.now() - startTime;
    
    if (emailResponse.error) {
      console.error('❌ Resend API error:', emailResponse.error);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Email delivery failed',
        details: emailResponse.error,
        recipient: emailRequest.to,
        duration_ms: duration
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    console.log(`✅ Email sent successfully in ${duration}ms`);
    console.log(`📬 Email ID: ${emailResponse.data?.id}`);
    
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      email_id: emailResponse.data?.id,
      recipient: emailRequest.to,
      subject: emailRequest.subject,
      template: emailRequest.templateName,
      trigger: emailRequest.triggerName,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    console.error('❌ Fatal error in email sending:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);