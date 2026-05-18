export type UserRole = "admin" | "operador" | "usuario";

export interface User {
  id?: number;
  sub?: string;
  usuario: string;
  rol: UserRole;
  nombre: string;
  email?: string;
  foto?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthLoading: boolean;
  login: () => void;
  logout: () => void;
}
