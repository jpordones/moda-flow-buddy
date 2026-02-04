export type OrderStatus = 
  | 'novo'
  | 'aguardando_pagamento'
  | 'pago'
  | 'em_producao'
  | 'personalizacao_pendente'
  | 'separando'
  | 'pronto_envio'
  | 'enviado'
  | 'entregue'
  | 'cancelado'
  | 'devolvido'
  | 'em_estoque'
  | 'problema';

export type PaymentStatus = 
  | 'pendente'
  | 'pago'
  | 'parcial'
  | 'estornado'
  | 'cancelado';

export type PaymentMethod = 
  | 'pix'
  | 'cartao'
  | 'dinheiro'
  | 'boleto'
  | 'transferencia'
  | 'outro';

export interface OrderItem {
  id: string;
  team_id: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  base_color: string | null;
  size: string | null;
  print_variant: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  notes: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  team_id: string;
  created_by_user_id: string;
  customer_name: string;
  customer_contact: string | null;
  order_date: string;
  notes: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  installments_count: number;
  total_amount: number;
  currency: string;
  order_status: OrderStatus;
  source: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderFormData {
  customer_name: string;
  customer_contact: string;
  order_date: string;
  notes: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  installments_count: number;
  order_status: OrderStatus;
  items: OrderItemFormData[];
}

export interface OrderItemFormData {
  id?: string;
  product_id: string;
  product_name_snapshot: string;
  base_color: string;
  size: string;
  print_variant: string;
  quantity: number;
  unit_price: number;
  notes: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  novo: 'Novo',
  aguardando_pagamento: 'Aguardando Pagamento',
  pago: 'Pago',
  em_producao: 'Em Produção',
  personalizacao_pendente: 'Personalização Pendente',
  separando: 'Separando/Preparando',
  pronto_envio: 'Pronto para Envio',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
  devolvido: 'Devolvido/Trocado',
  em_estoque: 'Em Estoque',
  problema: 'Problema/Atenção',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  novo: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  aguardando_pagamento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  pago: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  em_producao: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  personalizacao_pendente: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  separando: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  pronto_envio: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  enviado: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  entregue: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  devolvido: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  em_estoque: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  problema: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  parcial: 'Parcial',
  estornado: 'Estornado',
  cancelado: 'Cancelado',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  pago: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  parcial: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  estornado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelado: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  cartao: 'Cartão',
  dinheiro: 'Dinheiro',
  boleto: 'Boleto',
  transferencia: 'Transferência',
  outro: 'Outro',
};

export const INSTALLMENT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const emptyOrderFormData: OrderFormData = {
  customer_name: '',
  customer_contact: '',
  order_date: new Date().toISOString().split('T')[0],
  notes: '',
  payment_method: 'pix',
  payment_status: 'pendente',
  installments_count: 1,
  order_status: 'novo',
  items: [],
};

export const emptyOrderItemFormData: OrderItemFormData = {
  product_id: '',
  product_name_snapshot: '',
  base_color: '',
  size: '',
  print_variant: '',
  quantity: 1,
  unit_price: 0,
  notes: '',
};
