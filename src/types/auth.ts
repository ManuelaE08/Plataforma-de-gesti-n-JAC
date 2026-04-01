export type UserRole = "admin" | "operador" | "usuario";

export interface User {
  usuario: string;
  password: string;
  rol: UserRole;
  nombre: string;
}

export interface AuthContextType {
  user: User | null;
  login: (usuario: string, password: string) => boolean;
  logout: () => void;
}