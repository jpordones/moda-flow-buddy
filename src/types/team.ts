export type AppRole = 'admin' | 'manager' | 'seller' | 'viewer';

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  team_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: AppRole;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  is_owner: boolean;
  joined_at: string;
}

export const roleLabels: Record<AppRole, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  seller: 'Vendedor',
  viewer: 'Visualizador'
};

export const roleDescriptions: Record<AppRole, string> = {
  admin: 'Acesso total ao sistema, pode gerenciar usuários e configurações',
  manager: 'Pode gerenciar produtos, estoque e convidar membros',
  seller: 'Pode visualizar e criar pedidos, acessar produtos',
  viewer: 'Apenas visualização de dados'
};

export const roleColors: Record<AppRole, string> = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  manager: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  seller: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};
