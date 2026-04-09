import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plan, UserPlan, UserSubscription, PlanType } from '@/types/subscription';
import { toast } from 'sonner';

const DEFAULT_FREE_PLAN: UserPlan = {
  plan_id: '',
  plan_name: 'Gratuito',
  plan_type: 'free',
  max_products: 5,
  max_cost_analyses: 10,
  has_export_pdf: false,
  has_export_excel: false,
  has_stock_management: false,
  has_cash_flow: false,
  has_reports: false,
  has_multi_users: false,
  max_users: 1,
  has_priority_support: false,
  subscription_status: 'active'
};

export function useSubscription() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      return;
    }

    setPlans(data as Plan[]);
  }, []);

  const fetchCurrentPlan = useCallback(async () => {
    if (!user) {
      setCurrentPlan(DEFAULT_FREE_PLAN);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .rpc('get_user_plan', { p_user_id: user.id });

    if (error) {
      console.error('Error fetching user plan:', error);
      setCurrentPlan(DEFAULT_FREE_PLAN);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      setCurrentPlan(data[0] as UserPlan);
    } else {
      setCurrentPlan(DEFAULT_FREE_PLAN);
    }
    setLoading(false);
  }, [user]);

  const fetchSubscription = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error);
      return;
    }

    setSubscription(data as UserSubscription | null);
  }, [user]);

  const upgradePlan = useCallback(async (_planType: PlanType) => {
    if (!user) {
      toast.error('Você precisa estar logado para fazer upgrade');
      return false;
    }

    toast.info('Para fazer upgrade, escolha seu plano e finalize pelo checkout seguro.');
    window.location.href = '/app/planos';
    return false;
  }, [user]);

  const canUseFeature = useCallback((feature: keyof UserPlan): boolean => {
    if (!currentPlan) return false;
    const value = currentPlan[feature];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    return false;
  }, [currentPlan]);

  const isWithinLimit = useCallback((type: 'products' | 'cost_analyses', currentCount: number): boolean => {
    if (!currentPlan) return false;
    const limit = type === 'products' ? currentPlan.max_products : currentPlan.max_cost_analyses;
    return limit === -1 || currentCount < limit;
  }, [currentPlan]);

  const getRemainingLimit = useCallback((type: 'products' | 'cost_analyses', currentCount: number): number => {
    if (!currentPlan) return 0;
    const limit = type === 'products' ? currentPlan.max_products : currentPlan.max_cost_analyses;
    if (limit === -1) return Infinity;
    return Math.max(0, limit - currentCount);
  }, [currentPlan]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    fetchCurrentPlan();
    fetchSubscription();
  }, [fetchCurrentPlan, fetchSubscription]);

  return {
    plans,
    currentPlan,
    subscription,
    loading,
    upgradePlan,
    canUseFeature,
    isWithinLimit,
    getRemainingLimit,
    refreshPlan: fetchCurrentPlan
  };
}
