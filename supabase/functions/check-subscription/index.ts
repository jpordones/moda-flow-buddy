import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Product IDs for each plan
const PRODUCT_IDS = {
  starter: "prod_TkQezjupyhbVqv",
  professional: "prod_TkQrjKBmFDU0aW",
  enterprise: "prod_TkQriZDjoN79WT",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logStep("No valid authorization header, returning free plan");
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan_type: "free",
        product_id: null,
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    
    // Create Supabase client with the user's token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { 
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false } 
      }
    );

    // Use getClaims for JWT validation
    logStep("Validating token with getClaims");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims?.sub) {
      logStep("Token validation failed, returning free plan", { error: claimsError?.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan_type: "free",
        product_id: null,
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email as string | undefined;
    logStep("User authenticated via claims", { userId, email: userEmail });

    if (!userEmail) {
      logStep("No email in claims, fetching from getUser");
      // Fallback to getUser if email not in claims
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );
      
      const { data: userData, error: userError } = await serviceClient.auth.admin.getUserById(userId);
      if (userError || !userData?.user?.email) {
        logStep("Could not get user email, returning free plan");
        return new Response(JSON.stringify({ 
          subscribed: false,
          plan_type: "free",
          product_id: null,
          subscription_end: null
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      const email = userData.user.email;
      return await checkStripeSubscription(stripeKey, email, corsHeaders);
    }

    return await checkStripeSubscription(stripeKey, userEmail, corsHeaders);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    // Return free plan on error instead of 500
    return new Response(JSON.stringify({ 
      subscribed: false,
      plan_type: "free",
      product_id: null,
      subscription_end: null,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});

async function checkStripeSubscription(
  stripeKey: string, 
  email: string, 
  corsHeaders: Record<string, string>
) {
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const customers = await stripe.customers.list({ email, limit: 1 });
  
  if (customers.data.length === 0) {
    logStep("No Stripe customer found, returning free plan");
    return new Response(JSON.stringify({ 
      subscribed: false,
      plan_type: "free",
      product_id: null,
      subscription_end: null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  const customerId = customers.data[0].id;
  logStep("Found Stripe customer", { customerId });

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  });
  
  const hasActiveSub = subscriptions.data.length > 0;
  let productId = null;
  let planType = "free";
  let subscriptionEnd = null;

  if (hasActiveSub) {
    const subscription = subscriptions.data[0];
    subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
    
    productId = subscription.items.data[0].price.product as string;
    logStep("Product ID", { productId });
    
    // Determine plan type from product ID
    if (productId === PRODUCT_IDS.starter) {
      planType = "starter";
    } else if (productId === PRODUCT_IDS.professional) {
      planType = "professional";
    } else if (productId === PRODUCT_IDS.enterprise) {
      planType = "enterprise";
    }
    logStep("Determined plan type", { planType });
  } else {
    logStep("No active subscription found");
  }

  return new Response(JSON.stringify({
    subscribed: hasActiveSub,
    plan_type: planType,
    product_id: productId,
    subscription_end: subscriptionEnd
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}
