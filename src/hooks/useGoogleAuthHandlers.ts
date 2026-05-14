import type { CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface UseGoogleAuthHandlersOptions {
  onFailure?: (message: string) => void;
  navigateTo?: string;
}

export function useGoogleAuthHandlers({
  onFailure,
  navigateTo = "/",
}: UseGoogleAuthHandlersOptions = {}) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onFailure?.("No se recibió la credencial de Google");
      return;
    }

    const ok = await loginWithGoogle(credentialResponse.credential);

    if (ok.success) {
      navigate(navigateTo);
      return;
    }

    onFailure?.(ok.message || "Error validando el acceso con Google");
  };

  const handleGoogleError = () => {
    onFailure?.("El inicio de sesión de Google falló");
  };

  return {
    handleGoogleSuccess,
    handleGoogleError,
  };
}