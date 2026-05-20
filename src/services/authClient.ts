import keycloak, { persistRefreshToken } from "../lib/keycloak";

const BASE = (import.meta.env.VITE_AUTH as string | undefined)?.replace(/\/$/, "") ?? "";

async function getValidToken(): Promise<string> {
  try {
    const refreshed = await keycloak.updateToken(30);
    if (refreshed) persistRefreshToken();
  } catch {
    void keycloak.login();
    throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
  }

  if (!keycloak.token) {
    void keycloak.login();
    throw new Error("No hay sesión activa.");
  }

  return keycloak.token;
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; error?: string };
    return data.message ?? data.error ?? `Error ${res.status}`;
  } catch {
    return `Error ${res.status}: ${res.statusText}`;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getValidToken();

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Si el backend rechaza el token, refrescar y reintentar una sola vez
  if (res.status === 401) {
    try {
      await keycloak.updateToken(-1);
      persistRefreshToken();
    } catch {
      void keycloak.login();
      throw new Error("Sesión expirada.");
    }

    if (!keycloak.token) {
      void keycloak.login();
      throw new Error("Sesión expirada.");
    }

    headers.set("Authorization", `Bearer ${keycloak.token}`);
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  }

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res));
  }

  const contentLength = res.headers.get("content-length");
  if (res.status === 204 || contentLength === "0") {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const authClient = {
  get:    <T>(path: string)                    => request<T>(path),
  post:   <T>(path: string, body: unknown)     => request<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)     => request<T>(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: (path: string)                       => request<void>(path, { method: "DELETE" }),
};
