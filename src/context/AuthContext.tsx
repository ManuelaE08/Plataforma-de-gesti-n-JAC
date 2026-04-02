import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { AuthContextType, User } from "../types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

const usuarios: User[] = [
  { id: 1, usuario: "admin", password: "1234", rol: "admin", nombre: "Administrador/Auditor" },
  { id: 2, usuario: "operador", password: "1234", rol: "operador", nombre: "Carlos" },
  { id: 3, usuario: "operador2", password: "1234", rol: "operador", nombre: "Maria" },
  { id: 4, usuario: "usuario", password: "1234", rol: "usuario", nombre: "Usuario" },
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
      // TODO: Reemplazar con la llamada URL real del microservicio cuando esté disponible
      // const response = await fetch(import.meta.env.VITE_ENDPOINT + "/auth/google", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ credential }),
      // });
      // const data = await response.json();
      
      console.log("Credencial de Google recibida. Simulando envío al backend...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Estructura mockeada que el backend podría retornar
      const backendResponse = {
        id: 99,
        usuario: "usuario_google",
        rol: "admin" as const,
        nombre: "Usuario de Google Auth",
        email: "correo@gmail.com"
      };

      setUser({
        id: backendResponse.id,
        usuario: backendResponse.usuario,
        rol: backendResponse.rol,
        nombre: backendResponse.nombre,
        email: backendResponse.email
      });
      
      return true;
    } catch (error) {
      console.error("Error en login de Google:", error);
      return false;
    }
  };

  const logout = () =>  setUser({
        id: 0,
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