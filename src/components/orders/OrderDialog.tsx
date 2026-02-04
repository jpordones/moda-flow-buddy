import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useOrders";
import { OrderFormCustomer } from "./OrderFormCustomer";
import { OrderFormItems } from "./OrderFormItems";
import { OrderFormPayment } from "./OrderFormPayment";
import type { Order, OrderFormData, emptyOrderFormData } from "@/types/orders";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

type Step = 'customer' | 'items' | 'payment';

export function OrderDialog({ open, onOpenChange, order }: OrderDialogProps) {
  const { createOrder, updateOrder, isCreating, isUpdating } = useOrders();
  const [step, setStep] = useState<Step>('customer');
  const [formData, setFormData] = useState<OrderFormData>({
    customer_name: '',
    customer_contact: '',
    order_date: new Date().toISOString().split('T')[0],
    notes: '',
    payment_method: 'pix',
    payment_status: 'pendente',
    installments_count: 1,
    order_status: 'novo',
    items: [],
  });

  const isEditing = !!order;
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (order) {
      setFormData({
        customer_name: order.customer_name,
        customer_contact: order.customer_contact || '',
        order_date: order.order_date,
        notes: order.notes || '',
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        installments_count: order.installments_count,
        order_status: order.order_status,
        items: order.order_items?.map(item => ({
          id: item.id,
          product_id: item.product_id || '',
          product_name_snapshot: item.product_name_snapshot,
          base_color: item.base_color || '',
          size: item.size || '',
          print_variant: item.print_variant || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          notes: item.notes || '',
        })) || [],
      });
      setStep('customer');
    } else {
      setFormData({
        customer_name: '',
        customer_contact: '',
        order_date: new Date().toISOString().split('T')[0],
        notes: '',
        payment_method: 'pix',
        payment_status: 'pendente',
        installments_count: 1,
        order_status: 'novo',
        items: [],
      });
      setStep('customer');
    }
  }, [order, open]);

  const handleClose = () => {
    if (!isSaving) {
      onOpenChange(false);
    }
  };

  const handleNext = () => {
    if (step === 'customer') setStep('items');
    else if (step === 'items') setStep('payment');
  };

  const handleBack = () => {
    if (step === 'payment') setStep('items');
    else if (step === 'items') setStep('customer');
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && order) {
        await updateOrder({ orderId: order.id, formData });
      } else {
        await createOrder(formData);
      }
      handleClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  const canProceedFromCustomer = formData.customer_name.trim().length > 0;
  const canProceedFromItems = formData.items.length > 0 && 
    formData.items.every(item => item.product_id && item.quantity > 0);
  const canSubmit = canProceedFromCustomer && canProceedFromItems;

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Pedido' : 'Novo Pedido'}
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {(['customer', 'items', 'payment'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => {
                  if (s === 'customer') setStep(s);
                  else if (s === 'items' && canProceedFromCustomer) setStep(s);
                  else if (s === 'payment' && canProceedFromItems) setStep(s);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {i + 1}
              </button>
              {i < 2 && (
                <div className="w-8 h-0.5 bg-muted mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {step === 'customer' && (
            <OrderFormCustomer
              data={formData}
              onChange={(data) => setFormData({ ...formData, ...data })}
            />
          )}
          {step === 'items' && (
            <OrderFormItems
              items={formData.items}
              onChange={(items) => setFormData({ ...formData, items })}
            />
          )}
          {step === 'payment' && (
            <OrderFormPayment
              data={formData}
              onChange={(data) => setFormData({ ...formData, ...data })}
              total={calculateTotal()}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            {step !== 'customer' && (
              <Button variant="outline" onClick={handleBack} disabled={isSaving}>
                Voltar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
              Cancelar
            </Button>
            {step !== 'payment' ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 'customer' && !canProceedFromCustomer) ||
                  (step === 'items' && !canProceedFromItems)
                }
              >
                Proximo
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canSubmit || isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Salvar' : 'Criar Pedido'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
