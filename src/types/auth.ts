export type UserRole = "admin" | "operador" | "usuario";

export interface User {
  id: number;
  usuario: string;
  password?: string;
  rol: UserRole;
  nombre: string;
  email?: string;
  foto?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (usuario: string, password: string) => boolean;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  logout: () => void;
}
