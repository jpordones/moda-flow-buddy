-- =============================================================================
-- MELHORIAS DE RLS E SEGURANÇA - ADAPTADO PARA SCHEMA EXISTENTE
-- =============================================================================

-- 1. ADICIONAR COLUNA public_email NA TABELA PROFILES
-- =============================================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_email TEXT;

-- 2. ATUALIZAR POLÍTICA DE PROFILES PARA PERMITIR VER MEMBROS DA EQUIPE
-- =============================================================================

-- Remover política antiga de SELECT
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Nova política: usuários podem ver próprio perfil E perfis de membros da mesma equipe
CREATE POLICY "Users can view own and team profiles"
ON profiles FOR SELECT
USING (
  id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles ur1
    INNER JOIN user_roles ur2 ON ur1.team_id = ur2.team_id
    WHERE ur1.user_id = auth.uid()
    AND ur2.user_id = profiles.id
  )
  OR EXISTS (
    SELECT 1 FROM teams t
    INNER JOIN user_roles ur ON t.id = ur.team_id
    WHERE t.owner_id = auth.uid()
    AND ur.user_id = profiles.id
  )
);

-- 3. FUNÇÃO AUXILIAR PARA OBTER EMAIL DE MEMBRO (SECURITY DEFINER)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_team_member_email(member_user_id UUID, requesting_team_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_role TEXT;
  member_email TEXT;
BEGIN
  -- Verifica se o solicitante é membro da equipe
  SELECT role::TEXT INTO requester_role
  FROM user_roles
  WHERE user_id = auth.uid()
  AND team_id = requesting_team_id;

  -- Se não é membro da equipe, retorna NULL
  IF requester_role IS NULL THEN
    -- Verifica se é owner da equipe
    IF NOT EXISTS (SELECT 1 FROM teams WHERE id = requesting_team_id AND owner_id = auth.uid()) THEN
      RETURN NULL;
    END IF;
  END IF;

  -- Busca o email público do perfil
  SELECT public_email INTO member_email
  FROM profiles
  WHERE id = member_user_id;

  RETURN member_email;
END;
$$;

-- 4. TABELA DE AUDITORIA
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas owners e admins podem ver logs
CREATE POLICY "Owners and admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (
  is_team_owner(auth.uid(), team_id)
  OR has_role(auth.uid(), team_id, 'admin')
);

-- Sistema pode inserir logs (via service role)
CREATE POLICY "Authenticated users can insert own audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 5. FUNÇÃO PARA VALIDAÇÃO DE FORÇA DE SENHA
-- =============================================================================

CREATE OR REPLACE FUNCTION public.check_password_strength(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Mínimo 8 caracteres
  IF LENGTH(password) < 8 THEN
    RETURN FALSE;
  END IF;

  -- Deve conter letra maiúscula
  IF password !~ '[A-Z]' THEN
    RETURN FALSE;
  END IF;

  -- Deve conter letra minúscula
  IF password !~ '[a-z]' THEN
    RETURN FALSE;
  END IF;

  -- Deve conter número
  IF password !~ '[0-9]' THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- 6. ÍNDICES PARA PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_team 
ON user_roles(user_id, team_id);

CREATE INDEX IF NOT EXISTS idx_team_invitations_team_accepted 
ON team_invitations(team_id, accepted_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_team_created 
ON audit_logs(team_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_current_team 
ON profiles(current_team_id);