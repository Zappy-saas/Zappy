import type { Role } from '@prisma/client';
export type Permission = 'restaurant:read' | 'restaurant:write' | 'members:read' | 'audit:read';
const permissions: Record<Role, readonly Permission[]> = {
  OWNER: ['restaurant:read', 'restaurant:write', 'members:read', 'audit:read'],
  MANAGER: ['restaurant:read', 'restaurant:write', 'members:read', 'audit:read'],
  WAITER: ['restaurant:read'], KITCHEN: ['restaurant:read'], CASHIER: ['restaurant:read'],
};
export function can(role: Role, permission: Permission) { return permissions[role].includes(permission); }
export const roleLabels: Record<Role, string> = { OWNER: 'Proprietário', MANAGER: 'Gerente', WAITER: 'Atendente', KITCHEN: 'Cozinha', CASHIER: 'Caixa' };
