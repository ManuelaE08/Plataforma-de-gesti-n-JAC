import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL as string,
  realm: import.meta.env.VITE_KEYCLOAK_REALM as string,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string,
});

// Singleton para que StrictMode (doble mount en dev) no llame init() dos veces
let initPromise: Promise<boolean> | null = null;

const REFRESH_TOKEN_KEY = "kc_refresh_token";

export function initKeycloak(): Promise<boolean> {
  if (initPromise) return initPromise;

  const storedRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined;

  initPromise = keycloak
    .init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
      pkceMethod: "S256",
      checkLoginIframe: false,   // evita el polling iframe bloqueado por el navegador
      refreshToken: storedRefreshToken,
    })
    .then((authenticated) => {
      if (authenticated && keycloak.refreshToken) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, keycloak.refreshToken);
      } else if (!authenticated) {
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      }
      return authenticated;
    })
    .catch((err) => {
      // Si el refreshToken guardado expiró, limpiar y reintentar sin él
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      initPromise = null;
      throw err;
    });

  return initPromise;
}

export function persistRefreshToken() {
  if (keycloak.refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, keycloak.refreshToken);
  }
}

export function clearPersistedSession() {
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

let fetchPatched = false;

export function attachBearerTokenInterceptor() {
  if (fetchPatched || typeof window === 'undefined' || !window.fetch) {
    return;
  }

  fetchPatched = true;
  const originalFetch = window.fetch.bind(window);
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

  window.fetch = async (input: RequestInfo, init: RequestInit = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const normalizedUrl = url.toString();
    const shouldAttach = !init?.headers || !new Headers(init.headers).has('Authorization');
    const isApiRequest = baseUrl ? normalizedUrl.startsWith(baseUrl) : normalizedUrl.startsWith(window.location.origin);

    if (shouldAttach && isApiRequest) {
      try {
        await keycloak.updateToken(30);
        if (keycloak.token) {
          const headers = new Headers(init.headers);
          headers.set('Authorization', `Bearer ${keycloak.token}`);
          init = { ...init, headers };
        }
      } catch {
        // continuar, el request puede fallar y el flujo de login lo atenderá.
      }
    }

    return originalFetch(input, init);
  };
}

export default keycloak;
