-- Criar tabela de notificações
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'critical')),
  category TEXT NOT NULL CHECK (category IN ('stock', 'financial', 'product', 'system', 'plan')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_text TEXT,
  action_link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  extra_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Criar índices para performance
CREATE INDEX idx_notifications_team_unread ON public.notifications (team_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_team_category ON public.notifications (team_id, category);
CREATE INDEX idx_notifications_created_at ON public.notifications (created_at DESC);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Política para visualizar notificações da equipe
CREATE POLICY "Users can view their team notifications"
ON public.notifications FOR SELECT
USING (
  (team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid()))
  OR 
  (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
);

-- Política para criar notificações (sistema ou usuário autenticado)
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (
  (team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid()))
  OR 
  (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
);

-- Política para atualizar notificações (marcar como lida/dispensada)
CREATE POLICY "Users can update their team notifications"
ON public.notifications FOR UPDATE
USING (
  (team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid()))
  OR 
  (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
);

-- Política para deletar notificações
CREATE POLICY "Users can delete their team notifications"
ON public.notifications FOR DELETE
USING (
  (team_id IN (SELECT team_id FROM user_roles WHERE user_id = auth.uid()))
  OR 
  (team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid()))
);