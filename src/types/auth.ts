export type UserRole = "admin" | "operador" | "usuario";

export interface User {
  id?: number;
  sub?: string;
  usuario: string;
  password?: string;
  rol: UserRole;
  nombre: string;
  email?: string;
  foto?: string;
  jwt?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthLoading: boolean;
  login: (usuario: string, password: string) => boolean;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  logout: () => void;
}
