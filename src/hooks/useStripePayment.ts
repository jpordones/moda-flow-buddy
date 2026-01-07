import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PlanType } from '@/types/subscription';
import { toast } from 'sonner';

interface StripeSubscription {
  subscribed: boolean;
  plan_type: PlanType;
  product_id: string | null;
  subscription_end: string | null;
}

export function useStripePayment() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [stripeSubscription, setStripeSubscription] = useState<StripeSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setStripeSubscription(null);
      return;
    }

    setCheckingSubscription(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('check-subscription');

      if (fnError) {
        console.error('Error checking subscription:', fnError);
        return;
      }

      setStripeSubscription(data as StripeSubscription);
    } catch (err) {
      console.error('Error checking subscription:', err);
    } finally {
      setCheckingSubscription(false);
    }
  }, [user]);

  const subscribe = async (planType: PlanType) => {
    if (!user) {
      toast.error('Você precisa estar logado para assinar');
      return;
    }

    if (planType === 'free') {
      toast.info('Você já está no plano gratuito');
      return;
    }

    if (planType === 'enterprise') {
      window.open('mailto:contato@fedcom.com.br?subject=Interesse no Plano Enterprise', '_blank');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: { planType }
      });

      if (fnError) throw fnError;
      if (!data?.url) throw new Error('No checkout URL returned');

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao iniciar checkout: ' + err.message);
      console.error('Subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('customer-portal');

      if (fnError) throw fnError;
      if (!data?.url) throw new Error('No portal URL returned');

      window.open(data.url, '_blank');
    } catch (err: any) {
      toast.error('Erro ao abrir portal: ' + err.message);
      console.error('Portal error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check subscription on mount and when user changes
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Check for success/canceled params in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success('Assinatura realizada com sucesso!');
      checkSubscription();
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('canceled') === 'true') {
      toast.info('Checkout cancelado');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkSubscription]);

  return { 
    subscribe, 
    loading, 
    error, 
    stripeSubscription,
    checkingSubscription,
    checkSubscription,
    openCustomerPortal
  };
}
