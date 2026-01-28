import { ReactNode } from 'react';
import { usePermissions, Permission } from '@/hooks/usePermissions';
import { AppRole } from '@/types/team';

interface PermissionGateProps {
  children: ReactNode;
  /** Required permission to show children */
  permission?: Permission;
  /** Minimum role required */
  minRole?: AppRole;
  /** Fallback component when permission denied */
  fallback?: ReactNode;
  /** If true, hide completely instead of showing fallback */
  hideOnDeny?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions.
 * Use this to hide UI elements from unauthorized users.
 * 
 * @example
 * // Hide delete button for non-managers
 * <PermissionGate minRole="manager">
 *   <Button onClick={handleDelete}>Excluir</Button>
 * </PermissionGate>
 * 
 * @example
 * // Show message when user can't edit
 * <PermissionGate permission="products:edit" fallback={<p>Sem permissão</p>}>
 *   <ProductForm />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  permission,
  minRole,
  fallback = null,
  hideOnDeny = true,
}: PermissionGateProps) {
  const { hasPermission, hasMinRole } = usePermissions();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  }

  if (minRole && hasAccess) {
    hasAccess = hasMinRole(minRole);
  }

  if (!hasAccess) {
    return hideOnDeny ? null : <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook version of PermissionGate for conditional logic
 * 
 * @example
 * const canDelete = useCanAccess({ minRole: 'manager' });
 * if (canDelete) {
 *   // show delete button
 * }
 */
export function useCanAccess(options: { permission?: Permission; minRole?: AppRole }): boolean {
  const { hasPermission, hasMinRole } = usePermissions();

  if (options.permission && !hasPermission(options.permission)) {
    return false;
  }

  if (options.minRole && !hasMinRole(options.minRole)) {
    return false;
  }

  return true;
}
