import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { AuthContextType, User } from "../types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

const usuarios: User[] = [
  { usuario: "admin", password: "1234", rol: "admin", nombre: "Administrador/Auditor" },
  { usuario: "operador", password: "1234", rol: "operador", nombre: "Operador" },
  { usuario: "usuario", password: "1234", rol: "usuario", nombre: "Usuario" },
];

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const login = (usuario: string, password: string): boolean => {
    const found = usuarios.find(
      (u) => u.usuario === usuario && u.password === password
    );
    if (!found) return false;
    setUser(found);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}