import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PaymentRecord {
  id: string;
  user_id: string;
  subscription_id: string | null;
  stripe_invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded' | 'canceled';
  description: string | null;
  invoice_pdf_url: string | null;
  receipt_url: string | null;
  failure_reason: string | null;
  created_at: string;
}

export function usePaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!user) {
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use raw query since types might not be updated yet
      const { data, error: fetchError } = await supabase
        .from('payment_history' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPayments((data as unknown as PaymentRecord[]) || []);
    } catch (err: any) {
      console.error('Error fetching payment history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const totalPaid = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter(p => p.status === 'refunded')
    .reduce((sum, p) => sum + Math.abs(p.amount), 0);

  return {
    payments,
    loading,
    error,
    refresh: fetchPayments,
    totalPaid,
    totalRefunded,
  };
}
