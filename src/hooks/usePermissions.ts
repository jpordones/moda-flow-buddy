import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/hooks/useTeam';
import { AppRole } from '@/types/team';

// Define permission levels (higher number = more permissions)
const roleLevels: Record<AppRole, number> = {
  viewer: 1,
  seller: 2,
  manager: 3,
  admin: 4,
};

// Define feature permissions by role
const featurePermissions = {
  // Dashboard - everyone can view
  'dashboard:view': ['viewer', 'seller', 'manager', 'admin'],
  
  // Products
  'products:view': ['viewer', 'seller', 'manager', 'admin'],
  'products:create': ['seller', 'manager', 'admin'],
  'products:edit': ['seller', 'manager', 'admin'],
  'products:delete': ['manager', 'admin'],
  
  // Inventory
  'inventory:view': ['viewer', 'seller', 'manager', 'admin'],
  'inventory:manage': ['seller', 'manager', 'admin'],
  
  // Cash Flow
  'cashflow:view': ['viewer', 'seller', 'manager', 'admin'],
  'cashflow:create': ['seller', 'manager', 'admin'],
  'cashflow:edit': ['seller', 'manager', 'admin'],
  'cashflow:delete': ['manager', 'admin'],
  
  // Costs & Pricing
  'costs:view': ['viewer', 'seller', 'manager', 'admin'],
  'costs:edit': ['manager', 'admin'],
  
  // Team Management
  'team:view': ['viewer', 'seller', 'manager', 'admin'],
  'team:invite': ['manager', 'admin'],
  'team:manage': ['admin'],
  'team:remove': ['admin'],
  
  // Settings
  'settings:view': ['viewer', 'seller', 'manager', 'admin'],
  'settings:edit': ['manager', 'admin'],
  'settings:company': ['admin'],
  
  // Plans & Billing
  'billing:view': ['admin'],
  'billing:manage': ['admin'],
  
  // Demand Forecast
  'forecast:view': ['viewer', 'seller', 'manager', 'admin'],
  'forecast:create': ['seller', 'manager', 'admin'],
} as const;

export type Permission = keyof typeof featurePermissions;

export function usePermissions() {
  const { user } = useAuth();
  const { userRole, currentTeam } = useTeam();

  // Check if user has at least a minimum role level
  const hasMinRole = useCallback((minRole: AppRole): boolean => {
    if (!userRole) return false;
    return roleLevels[userRole] >= roleLevels[minRole];
  }, [userRole]);

  // Check if user has a specific permission
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!userRole) return false;
    const allowedRoles = featurePermissions[permission] as readonly string[];
    return allowedRoles.includes(userRole);
  }, [userRole]);

  // Check if user is the team owner
  const isTeamOwner = useCallback((): boolean => {
    if (!user || !currentTeam) return false;
    return currentTeam.owner_id === user.id;
  }, [user, currentTeam]);

  // Check if user is admin (or owner)
  const isAdmin = useCallback((): boolean => {
    return isTeamOwner() || userRole === 'admin';
  }, [isTeamOwner, userRole]);

  // Check if user can manage team members
  const canManageTeam = useCallback((): boolean => {
    return hasMinRole('manager');
  }, [hasMinRole]);

  // Check if user can edit data (not viewer)
  const canEdit = useCallback((): boolean => {
    return hasMinRole('seller');
  }, [hasMinRole]);

  // Check if user can delete/manage (manager+)
  const canManage = useCallback((): boolean => {
    return hasMinRole('manager');
  }, [hasMinRole]);

  return {
    userRole,
    hasMinRole,
    hasPermission,
    isTeamOwner,
    isAdmin,
    canManageTeam,
    canEdit,
    canManage,
    // Convenience getters
    isViewer: userRole === 'viewer',
    isSeller: userRole === 'seller',
    isManager: userRole === 'manager',
  };
}
