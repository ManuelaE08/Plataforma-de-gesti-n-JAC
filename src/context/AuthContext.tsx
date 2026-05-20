import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AuthContextType, User, UserRole } from "../types/auth";
import keycloak, { initKeycloak, persistRefreshToken, clearPersistedSession } from "../lib/keycloak";

const AuthContext = createContext<AuthContextType | null>(null);

function isValidRole(rol: unknown): rol is UserRole {
  return rol === "superadmin" || rol === "admin" || rol === "operador";
}

function buildUserFromToken(): User | null {
  const parsed = keycloak.tokenParsed;
  if (!parsed) return null;

  const realmRoles: unknown[] = (parsed as Record<string, unknown>)?.realm_access
    ? ((parsed as Record<string, { roles?: unknown[] }>).realm_access?.roles ?? [])
    : [];

  // Si tiene varios roles del sistema, gana el de mayor privilegio.
  const rolesValidos = realmRoles.filter(isValidRole);
  const prioridad: UserRole[] = ["superadmin", "admin", "operador"];
  const rol = prioridad.find((r) => rolesValidos.includes(r));
  if (!rol) return null;

  const nombre =
    (parsed as Record<string, unknown>).name ||
    (parsed as Record<string, unknown>).preferred_username ||
    (parsed as Record<string, unknown>).email;

  if (!nombre || typeof nombre !== "string") return null;

  const usuario =
    (parsed as Record<string, unknown>).preferred_username ||
    (parsed as Record<string, unknown>).email ||
    (parsed as Record<string, unknown>).sub;

  if (!usuario || typeof usuario !== "string") return null;

  return {
    sub: typeof parsed.sub === "string" ? parsed.sub : undefined,
    usuario,
    rol,
    nombre,
    email: typeof (parsed as Record<string, unknown>).email === "string"
      ? (parsed as Record<string, unknown>).email as string
      : undefined,
  };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    initKeycloak()
      .then((authenticated) => {
        if (!active) return;

        if (authenticated) {
          const sessionUser = buildUserFromToken();

          if (!sessionUser) {
            clearPersistedSession();
            void keycloak.logout({ redirectUri: window.location.origin });
            setUser(null);
          } else {
            persistRefreshToken();
            setUser(sessionUser);
          }
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        console.error("Error inicializando Keycloak:", err);
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = () => {
    void keycloak.login();
  };

  const logout = () => {
    setUser(null);
    clearPersistedSession();
    void keycloak.logout({ redirectUri: window.location.origin });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, login, logout }}>
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
