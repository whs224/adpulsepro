
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const pricingPlans = {
  starter: {
    // Using test mode price - you'll need to create actual prices in your Stripe dashboard
    price: 2900, // $29.00 in cents
    credits: 100,
    maxTeamMembers: 1,
  },
  growth: {
    price: 7900, // $79.00 in cents
    credits: 500,
    maxTeamMembers: 3,
  },
  scale: {
    price: 19900, // $199.00 in cents
    credits: 2000,
    maxTeamMembers: 10,
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    // Parse request body
    const { planName } = await req.json();
    
    if (!planName || !pricingPlans[planName]) {
      throw new Error("Invalid plan name");
    }

    const plan = pricingPlans[planName];

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if user already has a Stripe customer record
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        metadata: {
          supabase_user_id: user.id
        }
      });
      customerId = customer.id;
    }

    // Create subscription checkout session with inline price data
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `AdPulse ${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan`,
              description: `${plan.credits} AI messages per month, up to ${plan.maxTeamMembers} team member${plan.maxTeamMembers > 1 ? 's' : ''}`
            },
            unit_amount: plan.price,
            recurring: {
              interval: "month"
            }
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?subscription=success`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      metadata: {
        user_id: user.id,
        plan_name: planName,
        credits: plan.credits.toString(),
        max_team_members: plan.maxTeamMembers.toString()
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_name: planName,
          credits: plan.credits.toString(),
          max_team_members: plan.maxTeamMembers.toString()
        }
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Subscription creation failed:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
