import type { UserRole } from "./auth";

export interface MenuItem {
  name: string;
  path: string;
}

export type MenuByRole = Record<UserRole, MenuItem[]>;