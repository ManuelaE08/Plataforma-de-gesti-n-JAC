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

export default keycloak;
