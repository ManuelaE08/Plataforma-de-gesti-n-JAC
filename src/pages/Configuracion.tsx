import { useState } from "react";
import { User, Lock, CheckCircle } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";

type Tab = "perfil" | "contrasena";

function Configuracion() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("perfil");

  // Perfil
  const [perfil, setPerfil] = useState({
    nombre: user?.nombre ?? "",
    email: user?.email ?? "",
  });
  const [perfilGuardado, setPerfilGuardado] = useState(false);
  const [perfilErrors, setPerfilErrors] = useState<Record<string, string>>({});

  // Contraseña
  const [pass, setPass] = useState({ actual: "", nueva: "", confirmar: "" });
  const [passGuardado, setPassGuardado] = useState(false);
  const [passErrors, setPassErrors] = useState<Record<string, string>>({});

  const handleGuardarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!perfil.nombre.trim()) errs.nombre = "El nombre es obligatorio";
    if (!perfil.email.trim()) errs.email = "El correo es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.email))
      errs.email = "Ingrese un correo válido";
    if (Object.keys(errs).length > 0) { setPerfilErrors(errs); return; }
    setPerfilErrors({});
    setPerfilGuardado(true);
    setTimeout(() => setPerfilGuardado(false), 3000);
    // TODO: conectar con el backend
  };

  const handleGuardarContrasena = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!pass.actual) errs.actual = "Ingrese su contraseña actual";
    if (!pass.nueva) errs.nueva = "Ingrese la nueva contraseña";
    else if (pass.nueva.length < 8) errs.nueva = "Mínimo 8 caracteres";
    if (!pass.confirmar) errs.confirmar = "Confirme la nueva contraseña";
    else if (pass.nueva !== pass.confirmar) errs.confirmar = "Las contraseñas no coinciden";
    if (Object.keys(errs).length > 0) { setPassErrors(errs); return; }
    setPassErrors({});
    setPass({ actual: "", nueva: "", confirmar: "" });
    setPassGuardado(true);
    setTimeout(() => setPassGuardado(false), 3000);
    // TODO: conectar con el backend
  };

  const inputClass = (error?: string) =>
    `w-full border text-sm text-gray-700 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all ${error ? "border-red-300" : "border-gray-200"}`;

  return (
    <div>
      <PageHeader
        title="Configuración"
        subtitle="Ajustes de cuenta"
        description="Administre su perfil y credenciales de acceso"
      />

      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm mb-4 w-fit">
        <button
          onClick={() => setTab("perfil")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "perfil"
              ? "bg-[#1B7F4B] text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <User size={15} />
          Perfil
        </button>
        <button
          onClick={() => setTab("contrasena")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "contrasena"
              ? "bg-[#1B7F4B] text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Lock size={15} />
          Contraseña
        </button>
      </div>

      {tab === "perfil" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
          <h2 className="text-sm font-semibold text-gray-800 mb-1">Información personal</h2>
          <p className="text-xs text-gray-400 mb-5">Actualice su nombre y correo electrónico</p>

          <form onSubmit={handleGuardarPerfil} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Nombre completo</label>
              <input
                type="text"
                value={perfil.nombre}
                onChange={(e) => setPerfil((p) => ({ ...p, nombre: e.target.value }))}
                className={inputClass(perfilErrors.nombre)}
              />
              {perfilErrors.nombre && <p className="text-xs text-red-500">{perfilErrors.nombre}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Correo electrónico</label>
              <input
                type="email"
                value={perfil.email}
                onChange={(e) => setPerfil((p) => ({ ...p, email: e.target.value }))}
                className={inputClass(perfilErrors.email)}
              />
              {perfilErrors.email && <p className="text-xs text-red-500">{perfilErrors.email}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Rol</label>
              <input
                type="text"
                value={user?.rol ?? ""}
                disabled
                className="w-full border border-gray-100 text-sm text-gray-400 rounded-lg px-3 py-2 bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400">El rol es asignado por el administrador</p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition-colors"
              >
                Guardar cambios
              </button>
              {perfilGuardado && (
                <span className="flex items-center gap-1.5 text-sm text-[#1B7F4B] font-medium">
                  <CheckCircle size={15} />
                  Cambios guardados
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {tab === "contrasena" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
          <h2 className="text-sm font-semibold text-gray-800 mb-1">Cambiar contraseña</h2>
          <p className="text-xs text-gray-400 mb-5">Use una contraseña segura de al menos 8 caracteres</p>

          <form onSubmit={handleGuardarContrasena} className="flex flex-col gap-4">
            {[
              { label: "Contraseña actual", key: "actual" as const },
              { label: "Nueva contraseña", key: "nueva" as const },
              { label: "Confirmar nueva contraseña", key: "confirmar" as const },
            ].map(({ label, key }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">{label}</label>
                <input
                  type="password"
                  value={pass[key]}
                  onChange={(e) => setPass((p) => ({ ...p, [key]: e.target.value }))}
                  className={inputClass(passErrors[key])}
                />
                {passErrors[key] && <p className="text-xs text-red-500">{passErrors[key]}</p>}
              </div>
            ))}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition-colors"
              >
                Actualizar contraseña
              </button>
              {passGuardado && (
                <span className="flex items-center gap-1.5 text-sm text-[#1B7F4B] font-medium">
                  <CheckCircle size={15} />
                  Contraseña actualizada
                </span>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Configuracion;