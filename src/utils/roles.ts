import type { User } from "../types/auth";
import { Permissions } from "./permissions";

/** Superadmin, admin u operador: acceso a endpoints con datos completos (no /public). */
export function isPrivilegedUser(user: User | null): boolean {
  return Permissions.canViewConfidential(user);
}
