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

  const loginWithGoogle = async (credential: string): Promise<boolean> => {
    try {
      if (!credential) {
        throw new Error("No se recibió la credencial de Google");
      }

      const baseEndpoint = import.meta.env.VITE_ENDPOINT?.replace(/\/$/, "");
      if (!baseEndpoint) {
        throw new Error("VITE_ENDPOINT no está configurado");
      }

      const response = await fetch(baseEndpoint + "/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          "Error autenticando con Google (" +
            response.status +
            "): " +
            (errorBody || response.statusText)
        );
      }

      const data = (await response.json()) as Partial<User>;
      const rol = data.rol;

      if (!data.usuario || !rol || !data.nombre) {
        throw new Error("La respuesta del backend no contiene los campos requeridos");
      }

      if (rol !== "admin" && rol !== "operador" && rol !== "usuario") {
        throw new Error("El rol retornado por el backend no es válido");
      }

      setUser({
        usuario: data.usuario,
        rol,
        nombre: data.nombre,
        email: data.email,
      });
      
      return true;
    } catch (error) {
      console.error("Error en login de Google:", error);
      return false;
    }
  };

  const logout = () =>  setUser({
        usuario: "usuario_invitado",
        rol: "usuario",
        nombre: "Usuario invitado",
      });;

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout }}>
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