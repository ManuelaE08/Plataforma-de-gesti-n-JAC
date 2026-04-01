import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [usuario, setUsuario] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { login } = useAuth();
  const navigate = useNavigate();

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
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Usuario
            </label>
            <input
              type="text"
              placeholder="usuario@cauca.gov.co"
              value={usuario}
              onChange={(e) => {
                setUsuario(e.target.value);
                setError("");
              }}
              className="border border-gray-200 px-3 py-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Contraseña
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full border border-gray-200 px-3 py-2.5 pr-10 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="bg-[#1B7F4B] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#166340] active:bg-[#124f33] transition-colors mt-1"
          >
            Ingresar
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-400 mt-5">
          Acceso restringido al personal autorizado
        </p>
      </div>
    </div>
  );
}

export default Login;