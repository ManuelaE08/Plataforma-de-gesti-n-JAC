import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AuthContextType, User } from "../types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

type AuthBackendPayload = Partial<
  Pick<User, "sub" | "usuario" | "email" | "nombre" | "rol">
>;

interface AuthBackendResponse extends AuthBackendPayload {
  payload?: AuthBackendPayload;
  user?: AuthBackendPayload;
}

const baseEndpoint = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

function isValidRole(rol: unknown): rol is User["rol"] {
  return rol === "admin" || rol === "operador" || rol === "usuario";
}

function normalizePayload(data: AuthBackendResponse): AuthBackendPayload {
  return data.user ?? data.payload ?? data;
}

function buildUserFromPayload(payload: AuthBackendPayload): User {
  const rol = payload.rol;
  if (!isValidRole(rol)) {
    throw new Error("El rol retornado por el backend no es válido");
  }

  if (!payload.nombre) {
    throw new Error("La respuesta del backend no contiene el nombre del usuario");
  }

  const usuario = payload.usuario || payload.email || payload.sub;
  if (!usuario) {
    throw new Error("La respuesta del backend no contiene un identificador de usuario");
  }

  return {
    sub: payload.sub,
    usuario,
    rol,
    nombre: payload.nombre,
    email: payload.email,
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const loadSessionFromCookie = async (): Promise<User | null> => {
    if (!baseEndpoint) {
      return null;
    }

    const response = await fetch(`${baseEndpoint}/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as AuthBackendResponse;
    return buildUserFromPayload(normalizePayload(data));
  };

  useEffect(() => {
    let active = true;

    const bootstrapSession = async () => {
      try {
        const sessionUser = await loadSessionFromCookie();
        if (active) {
          setUser(sessionUser);
        }
      } catch (error) {
        console.error("No se pudo restaurar la sesión desde cookie:", error);
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsAuthLoading(false);
        }
      }
    };

    void bootstrapSession();

    return () => {
      active = false;
    };
  }, []);

  const loginWithGoogle = async (credential: string): Promise<boolean> => {
    try {
      if (!credential) {
        throw new Error("No se recibió la credencial de Google");
      }

      if (!baseEndpoint) {
        throw new Error("VITE_API_BASE_URL no está configurado");
      }

      const response = await fetch(`${baseEndpoint}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

      let nextUser: User | null = null;
      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        const data = (await response.json()) as AuthBackendResponse;
        try {
          nextUser = buildUserFromPayload(normalizePayload(data));
        } catch {
          nextUser = null;
        }
      }

      if (!nextUser) {
        nextUser = await loadSessionFromCookie();
      }

      if (!nextUser) {
        throw new Error("No fue posible recuperar la sesión después del login");
      }

      setUser(nextUser);
      return true;
    } catch (error) {
      console.error("Error en login de Google:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);

    if (!baseEndpoint) {
      return;
    }

    void fetch(`${baseEndpoint}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, loginWithGoogle, logout }}>
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