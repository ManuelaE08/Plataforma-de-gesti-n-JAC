import type { UserRole } from "../types/auth";

export const roleLabels: Record<UserRole, string> = {
  usuario: "Usuario",
  operador: "Operador",
  admin: "Administrador",
  superadmin: "Superadmin",
};

export const roleInitials: Record<UserRole, string> = {
  usuario: "US",
  operador: "OP",
  admin: "AA",
  superadmin: "SA",
};
