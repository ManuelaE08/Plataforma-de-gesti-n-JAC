import type { User } from "../types/auth";

/**
 * Funciones de validación de permisos centralizadas
 * Evita repetición de código en toda la aplicación
 */

export const Permissions = {
  /**
   * Solo superadmin
   */
  isSuperAdmin: (user: User | null | undefined): boolean => {
    return user?.rol === "superadmin";
  },

  /**
   * Superadmin o admin
   */
  isAdmin: (user: User | null | undefined): boolean => {
    return user?.rol === "admin" || user?.rol === "superadmin";
  },

  /**
   * Es operador
   */
  isOperador: (user: User | null | undefined): boolean => {
    return user?.rol === "operador";
  },

  /**
   * Es usuario regular (no tiene permisos de administración)
   */
  isRegularUser: (user: User | null | undefined): boolean => {
    return user?.rol === "usuario";
  },

  /**
   * Puede ver información confidencial (superadmin, admin, operador)
   */
  canViewConfidential: (user: User | null | undefined): boolean => {
    return (
      user?.rol === "superadmin" ||
      user?.rol === "admin" ||
      user?.rol === "operador"
    );
  },

  /**
   * Puede ver listado de JACs (superadmin, admin, operador)
   */
  canViewJacs: (user: User | null | undefined): boolean => {
    return (
      user?.rol === "superadmin" ||
      user?.rol === "admin" ||
      user?.rol === "operador"
    );
  },

  /**
   * Puede acceder al dashboard administrativo (superadmin, admin)
   */
  canAccessAdminDashboard: (user: User | null | undefined): boolean => {
    return user?.rol === "admin" || user?.rol === "superadmin";
  },

  /**
   * Puede gestionar usuarios (solo superadmin)
   */
  canManageUsers: (user: User | null | undefined): boolean => {
    return user?.rol === "superadmin";
  },

  /**
   * Puede crear/editar JACs (superadmin, admin)
   */
  canCreateEditJac: (user: User | null | undefined): boolean => {
    return user?.rol === "admin" || user?.rol === "superadmin";
  },
};

/**
 * Hook helper para usar permisos en componentes
 */
export const usePermissions = (user: User | null | undefined) => {
  return {
    isSuperAdmin: Permissions.isSuperAdmin(user),
    isAdmin: Permissions.isAdmin(user),
    isOperador: Permissions.isOperador(user),
    isRegularUser: Permissions.isRegularUser(user),
    canViewConfidential: Permissions.canViewConfidential(user),
    canViewJacs: Permissions.canViewJacs(user),
    canAccessAdminDashboard: Permissions.canAccessAdminDashboard(user),
    canManageUsers: Permissions.canManageUsers(user),
    canCreateEditJac: Permissions.canCreateEditJac(user),
  };
};
