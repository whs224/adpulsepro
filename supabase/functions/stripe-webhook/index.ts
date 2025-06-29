import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const pricingPlans = {
  starter: { credits: 100, maxTeamMembers: 1 },
  growth: { credits: 500, maxTeamMembers: 3 },
  scale: { credits: 2000, maxTeamMembers: 10 }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No signature found");
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
    );

    console.log(`Processing ${event.type} event`);

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object, supabaseClient);
        break;
      
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object, supabaseClient);
        break;
      
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, supabaseClient);
        break;
      
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object, supabaseClient);
        break;
      
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object, supabaseClient);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function handleCheckoutCompleted(session: any, supabaseClient: any) {
  if (session.mode === "subscription") {
    const userId = session.metadata?.user_id;
    const planName = session.metadata?.plan_name;
    
    if (userId && planName) {
      const plan = pricingPlans[planName];
      if (plan) {
        // Update or create user credits
        await supabaseClient
          .from('user_credits')
          .upsert({
            user_id: userId,
            plan_name: planName,
            total_credits: plan.credits,
            used_credits: 0,
            max_team_members: plan.maxTeamMembers,
            billing_cycle_start: new Date().toISOString(),
            billing_cycle_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true
          }, {
            onConflict: 'user_id'
          });
      }
    }
  }
}

async function handleSubscriptionUpdated(subscription: any, supabaseClient: any) {
  const userId = subscription.metadata?.user_id;
  const planName = subscription.metadata?.plan_name;
  
  if (userId && planName) {
    const plan = pricingPlans[planName];
    if (plan) {
      // Update user credits for plan change
      await supabaseClient
        .from('user_credits')
        .update({
          plan_name: planName,
          total_credits: plan.credits,
          max_team_members: plan.maxTeamMembers,
          billing_cycle_start: new Date().toISOString(),
          billing_cycle_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    }
  }
}

async function handleSubscriptionDeleted(subscription: any, supabaseClient: any) {
  const userId = subscription.metadata?.user_id;
  
  if (userId) {
    // Deactivate user credits
    await supabaseClient
      .from('user_credits')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  }
}

async function handlePaymentSucceeded(invoice: any, supabaseClient: any) {
  const subscription = invoice.subscription;
  if (subscription) {
    const userId = subscription.metadata?.user_id;
    const planName = subscription.metadata?.plan_name;
    
    if (userId && planName) {
      const plan = pricingPlans[planName];
      if (plan) {
        // Reset credits for new billing cycle
        await supabaseClient
          .from('user_credits')
          .update({
            used_credits: 0,
            billing_cycle_start: new Date().toISOString(),
            billing_cycle_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }
    }
  }
}

async function handlePaymentFailed(invoice: any, supabaseClient: any) {
  const subscription = invoice.subscription;
  if (subscription) {
    const userId = subscription.metadata?.user_id;
    
    if (userId) {
      // Optionally handle failed payments (e.g., send notification, suspend access)
      console.log(`Payment failed for user ${userId}`);
    }
  }
} 