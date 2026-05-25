import type { User } from "../types/auth";

/** Admin u operador: acceso a endpoints con datos completos. */
export function isPrivilegedUser(user: User | null): boolean {
  return user?.rol === "admin" || user?.rol === "superadmin" || user?.rol === "operador";
}
