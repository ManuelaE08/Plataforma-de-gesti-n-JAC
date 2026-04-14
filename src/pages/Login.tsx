import { GoogleLogin } from "@react-oauth/google";
import { Shield, ArrowRight, MapPin, Users, FileText, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGoogleAuthHandlers } from "../hooks/useGoogleAuthHandlers";
import { useState, useEffect } from "react";
import logoGobernacion from "../assets/logo-gobernacion.png";

// ── Utilidades de tema ──────────────────────────────────────────────────────
function getInitialTheme(): boolean {
  const saved = localStorage.getItem("login-theme");
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("login-theme", isDark ? "dark" : "light");
}

// ── Datos del panel lateral ─────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Users,
    title: "Gestión de Juntas",
    desc: "Administra las Juntas de Acción Comunal del departamento.",
  },
  {
    icon: FileText,
    title: "Trámites Digitales",
    desc: "Procesa documentos y trámites de forma eficiente.",
  },
  {
    icon: MapPin,
    title: "Cobertura Regional",
    desc: "Atención a los 42 municipios del Cauca.",
  },
];

// ── Componente principal ────────────────────────────────────────────────────
function Login() {
  const [error, setError] = useState<string>("");
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);

  const navigate = useNavigate();
  const { handleGoogleSuccess, handleGoogleError } = useGoogleAuthHandlers({
    onFailure: setError,
    navigateTo: "/",
  });

  // Aplicar clase dark al <html> cada vez que cambia el estado
  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col transition-colors duration-300">

      {/* ── Barra superior institucional ──────────────────────────────────── */}
      <header className="w-full bg-white dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] px-6 py-3 flex items-center justify-between shadow-sm transition-colors duration-300">

        {/* Izquierda: logo + identidad */}
        <div className="flex items-center gap-3">
          <img
            src={logoGobernacion}
            alt="Escudo Gobernación del Cauca"
            className="h-9 w-auto object-contain"
          />
          <div className="leading-tight">
            <span className="text-[#1E293B] dark:text-[#F1F5F9] font-semibold text-sm block">
              Gobernación del Cauca
            </span>
            <span className="text-[#64748B] dark:text-[#94A3B8] text-[11px]">
              Plataforma de Gestión JAC
            </span>
          </div>
        </div>

        {/* Derecha: toggle tema + ir al inicio */}
        <div className="flex items-center gap-2">
          {/* Botón dark/light */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            className="w-9 h-9 flex items-center justify-center rounded-lg
                       text-[#64748B] dark:text-[#94A3B8]
                       bg-[#F1F5F9] dark:bg-[#334155]
                       hover:bg-[#E2E8F0] dark:hover:bg-[#475569]
                       border border-[#E2E8F0] dark:border-[#475569]
                       transition-colors duration-200"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Ir al inicio */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-[#1B7F4B] font-medium
                       border border-[#1B7F4B] rounded-lg px-3 py-1.5
                       hover:bg-[#1B7F4B] hover:text-white
                       transition-colors duration-200"
          >
            Ir al inicio
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* ── Contenido principal ───────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl flex rounded-2xl shadow-lg overflow-hidden border border-[#E2E8F0] dark:border-[#334155]">

          {/* Panel izquierdo decorativo */}
          <div
            className="hidden md:flex flex-col justify-between w-1/2 p-10
                        bg-gradient-to-br from-[#145F38] via-[#1B7F4B] to-[#22A05B]
                        dark:from-[#0D3B22] dark:via-[#145F38] dark:to-[#1B7F4B]
                        text-white relative overflow-hidden transition-colors duration-300"
          >
            {/* Círculos decorativos */}
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/5" />
            <div className="absolute -bottom-20 -right-12 w-72 h-72 rounded-full bg-white/5" />
            <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white/5" />

            {/* Encabezado + logo del escudo */}
            <div className="relative z-10">
              {/* Logo gobernación en el panel lateral */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-white/90 flex items-center justify-center p-1.5 shadow-md">
                  <img
                    src={logoGobernacion}
                    alt="Escudo Gobernación del Cauca"
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div>
                  <p className="font-bold text-base leading-tight">Sistema JAC</p>
                  <p className="text-white/70 text-xs">Departamento del Cauca</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold leading-snug mb-3">
                Gestión integral de Juntas de Acción Comunal
              </h2>
              <p className="text-white/75 text-sm leading-relaxed">
                Plataforma oficial de la Gobernación del Cauca para la
                administración y seguimiento de las organizaciones comunales del
                departamento.
              </p>
            </div>

            {/* Características */}
            <div className="relative z-10 flex flex-col gap-4 mt-8">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-white/65 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="relative z-10 text-white/40 text-[10px] mt-8">
              © {new Date().getFullYear()} Gobernación del Cauca · Todos los derechos reservados
            </p>
          </div>

          {/* Panel derecho: formulario */}
          <div className="flex-1 bg-white dark:bg-[#1E293B] flex flex-col justify-center px-8 py-12 md:px-12 transition-colors duration-300">

            {/* Logo móvil */}
            <div className="flex items-center gap-3 mb-8 md:hidden">
              <img
                src={logoGobernacion}
                alt="Escudo Gobernación del Cauca"
                className="h-8 w-auto object-contain"
              />
              <span className="font-semibold text-[#1E293B] dark:text-[#F1F5F9] text-sm">
                Gobernación del Cauca
              </span>
            </div>

            {/* Encabezado del formulario */}
            <div className="mb-8">
              <div className="w-11 h-11 rounded-xl bg-[#E8F5EE] dark:bg-[#0D3B22] flex items-center justify-center mb-4">
                <span className="text-[#1B7F4B] dark:text-[#4ADE80] font-bold text-base">
                  JAC
                </span>
              </div>
              <h1 className="text-2xl font-bold text-[#1E293B] dark:text-[#F1F5F9]">
                Bienvenido
              </h1>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-sm mt-1">
                Inicia sesión con tu cuenta institucional para acceder a la plataforma.
              </p>
            </div>

            {/* Separador */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-[#334155]" />
              <span className="text-[#64748B] dark:text-[#94A3B8] text-xs font-medium">
                Acceder con
              </span>
              <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-[#334155]" />
            </div>

            {/* Botón Google */}
            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                shape="rectangular"
                theme={isDark ? "filled_black" : "outline"}
                text="signin_with"
                size="large"
              />
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 mb-4">
                <span className="text-red-500 text-xs mt-0.5">⚠</span>
                <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>
              </div>
            )}

            {/* Aviso acceso restringido */}
            <div className="mt-6 pt-6 border-t border-[#E2E8F0] dark:border-[#334155]">
              <div className="flex items-start gap-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-lg px-4 py-3 border border-[#E2E8F0] dark:border-[#334155]">
                <Shield size={14} className="text-[#64748B] dark:text-[#94A3B8] mt-0.5 shrink-0" />
                <p className="text-[#64748B] dark:text-[#94A3B8] text-xs leading-relaxed">
                  Acceso restringido al personal autorizado por la Gobernación del
                  Cauca. Si no tienes acceso, contacta al administrador del sistema.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Login;
