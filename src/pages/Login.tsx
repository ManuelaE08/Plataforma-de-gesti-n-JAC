import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGoogleAuthHandlers } from "../hooks/useGoogleAuthHandlers";

function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [usuario, setUsuario] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const { handleGoogleSuccess, handleGoogleError } = useGoogleAuthHandlers({
    onFailure: setError,
    navigateTo: "/",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    const ok = login(usuario, password);

    if (ok) {
      navigate("/");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8">
        <div className="mb-7 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#1B7F4B] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">JAC</span>
          </div>

          <h1 className="text-xl font-bold text-gray-800">Iniciar Sesión</h1>
          <p className="text-sm text-gray-400 mt-1">
            Plataforma de Gestión JAC · Gobernación del Cauca
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex justify-center mb-2">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              shape="rectangular"
              theme="outline"
              text="signin_with"
            />
          </div>
        </form>

        <p className="text-center text-[11px] text-gray-400 mt-5">
          Acceso restringido al personal autorizado
        </p>
      </div>
    </div>
  );
}

export default Login;