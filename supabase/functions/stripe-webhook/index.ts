import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Plan mapping based on Stripe Price IDs
const PRICE_TO_PLAN: Record<string, string> = {
  "price_1SmvnbEnIl17o7v12slvumEl": "starter",
  "price_1SmvzKEnIl17o7v1BtzYcs1w": "professional",
  "price_1SmvzaEnIl17o7v1tSbcLM3s": "enterprise",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Event verified", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { sessionId: session.id });

        const userId = session.metadata?.user_id;
        const planType = session.metadata?.plan_type;

        if (!userId || !planType) {
          logStep("Missing metadata", { userId, planType });
          break;
        }

        // Get plan ID from database
        const { data: plan, error: planError } = await supabase
          .from("plans")
          .select("id")
          .eq("type", planType)
          .single();

        if (planError || !plan) {
          logStep("Plan not found", { planType, error: planError });
          break;
        }

        // Get subscription details from Stripe
        let subscriptionDetails: Stripe.Subscription | null = null;
        if (session.subscription) {
          subscriptionDetails = await stripe.subscriptions.retrieve(session.subscription as string);
        }

        // Check if subscription exists
        const { data: existingSub } = await supabase
          .from("user_subscriptions")
          .select("id")
          .eq("user_id", userId)
          .single();

        const periodEnd = subscriptionDetails?.current_period_end 
          ? new Date(subscriptionDetails.current_period_end * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const subscriptionData = {
          user_id: userId,
          plan_id: plan.id,
          status: "active",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          stripe_price_id: subscriptionDetails?.items?.data[0]?.price?.id || null,
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd,
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        };

        let subscriptionId: string | null = null;

        if (existingSub) {
          // Update existing subscription
          const { error } = await supabase
            .from("user_subscriptions")
            .update(subscriptionData)
            .eq("id", existingSub.id);

          subscriptionId = existingSub.id;

          if (error) {
            logStep("Error updating subscription", { error });
          } else {
            logStep("Subscription updated", { userId, planType });
          }
        } else {
          // Create new subscription
          const { data: newSub, error } = await supabase
            .from("user_subscriptions")
            .insert(subscriptionData)
            .select("id")
            .single();

          subscriptionId = newSub?.id || null;

          if (error) {
            logStep("Error creating subscription", { error });
          } else {
            logStep("Subscription created", { userId, planType });
          }
        }

        // Record payment in history
        if (session.amount_total && subscriptionId) {
          await supabase.from("payment_history").insert({
            user_id: userId,
            subscription_id: subscriptionId,
            amount: session.amount_total / 100,
            currency: (session.currency || "brl").toUpperCase(),
            status: "succeeded",
            description: `Assinatura ${planType} - Primeiro pagamento`,
          });
          logStep("Payment history recorded");
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.payment_succeeded", { invoiceId: invoice.id });

        if (invoice.subscription) {
          const periodEnd = invoice.lines.data[0]?.period?.end;
          
          // Update subscription
          const { data: sub, error } = await supabase
            .from("user_subscriptions")
            .update({
              status: "active",
              current_period_end: periodEnd 
                ? new Date(periodEnd * 1000).toISOString() 
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription)
            .select("id, user_id")
            .single();

          if (error) {
            logStep("Error updating subscription on payment success", { error });
          } else {
            logStep("Subscription renewed", { subscriptionId: invoice.subscription });

            // Record payment in history (for renewals)
            if (sub && invoice.amount_paid > 0) {
              await supabase.from("payment_history").insert({
                user_id: sub.user_id,
                subscription_id: sub.id,
                stripe_invoice_id: invoice.id,
                stripe_payment_intent_id: invoice.payment_intent as string || null,
                amount: invoice.amount_paid / 100,
                currency: (invoice.currency || "brl").toUpperCase(),
                status: "succeeded",
                description: "Renovação mensal da assinatura",
                invoice_pdf_url: invoice.invoice_pdf,
                receipt_url: invoice.hosted_invoice_url,
              });
              logStep("Renewal payment recorded in history");
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.payment_failed", { invoiceId: invoice.id });

        if (invoice.subscription) {
          // Update subscription status
          const { data: sub, error } = await supabase
            .from("user_subscriptions")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription)
            .select("id, user_id")
            .single();

          if (error) {
            logStep("Error updating subscription on payment failure", { error });
          } else {
            logStep("Subscription marked as past_due", { subscriptionId: invoice.subscription });

            // Record failed payment in history
            if (sub) {
              const charge = invoice.charge ? await stripe.charges.retrieve(invoice.charge as string) : null;
              
              await supabase.from("payment_history").insert({
                user_id: sub.user_id,
                subscription_id: sub.id,
                stripe_invoice_id: invoice.id,
                amount: invoice.amount_due / 100,
                currency: (invoice.currency || "brl").toUpperCase(),
                status: "failed",
                description: "Falha no pagamento da assinatura",
                failure_reason: charge?.failure_message || "Pagamento recusado",
              });
              logStep("Failed payment recorded in history");
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.deleted", { subscriptionId: subscription.id });

        // Get free plan ID
        const { data: freePlan } = await supabase
          .from("plans")
          .select("id")
          .eq("type", "free")
          .single();

        const updateData: Record<string, any> = {
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        };

        if (freePlan) {
          updateData.plan_id = freePlan.id;
        }

        const { error } = await supabase
          .from("user_subscriptions")
          .update(updateData)
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          logStep("Error cancelling subscription", { error });
        } else {
          logStep("Subscription cancelled and downgraded to free", { subscriptionId: subscription.id });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.updated", { subscriptionId: subscription.id });

        const priceId = subscription.items.data[0]?.price?.id;
        const planType = priceId ? PRICE_TO_PLAN[priceId] : null;

        if (planType) {
          const { data: plan } = await supabase
            .from("plans")
            .select("id")
            .eq("type", planType)
            .single();

          if (plan) {
            const { error } = await supabase
              .from("user_subscriptions")
              .update({
                plan_id: plan.id,
                stripe_price_id: priceId,
                status: subscription.status === "active" ? "active" : subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_subscription_id", subscription.id);

            if (error) {
              logStep("Error updating subscription", { error });
            } else {
              logStep("Subscription updated to new plan", { planType, cancelAtPeriodEnd: subscription.cancel_at_period_end });
            }
          }
        } else {
          // Just update status and period
          const { error } = await supabase
            .from("user_subscriptions")
            .update({
              status: subscription.status === "active" ? "active" : subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscription.id);

          if (error) {
            logStep("Error updating subscription status", { error });
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        logStep("Processing charge.refunded", { chargeId: charge.id });

        // Find the user by customer ID
        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("id, user_id")
          .eq("stripe_customer_id", charge.customer as string)
          .single();

        if (sub) {
          await supabase.from("payment_history").insert({
            user_id: sub.user_id,
            subscription_id: sub.id,
            stripe_charge_id: charge.id,
            amount: -(charge.amount_refunded / 100), // Negative for refund
            currency: (charge.currency || "brl").toUpperCase(),
            status: "refunded",
            description: "Reembolso processado",
            receipt_url: charge.receipt_url,
          });
          logStep("Refund recorded in history");
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
