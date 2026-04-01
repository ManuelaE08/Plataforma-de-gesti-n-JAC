import type { UserRole } from "../types/auth";

interface CurrentUser {
  nombre: string;
  rol: UserRole;
}

export const currentUser: CurrentUser = {
  nombre: "Pepe Pérez",
  rol: "usuario",
};

export const roleLabels: Record<UserRole, string> = {
  usuario: "Usuario",
  operador: "Operador",
  admin: "Administrador/Auditor",
};

export const roleInitials: Record<UserRole, string> = {
  usuario: "US",
  operador: "OP",
  admin: "AA",
};