import { useState } from "react";
import { Plus, Search, X, Pencil, UserX, UserCheck, ShieldCheck, Trash2, RefreshCw, Loader2, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import { useUsuarios, rolesInfo, type UsuarioItem, type CrearUsuarioInput } from "../hooks/useUsuarios";
import type { RolAsignable } from "../services/usuariosApi";
import { useAuth } from "../context/AuthContext";

const card     = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";
const inputCls = "w-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] focus:bg-white dark:focus:bg-gray-800 transition";

// ── Modal: Crear usuario ─────────────────────────────────────────────────────
function ModalCrearUsuario({
  puedeCrearAdmin,
  onClose,
  onSave,
}: {
  puedeCrearAdmin: boolean;
  onClose: () => void;
  onSave: (input: CrearUsuarioInput) => Promise<void>;
}) {
  const [nombre,           setNombre]           = useState("");
  const [apellido,         setApellido]         = useState("");
  const [correo,           setCorreo]           = useState("");
  const [rol,              setRol]              = useState<RolAsignable>("operador");
  const [passwordTemporal, setPasswordTemporal] = useState("");
  const [showPassword,     setShowPassword]     = useState(false);
  const [error,            setError]            = useState("");
  const [loading,          setLoading]          = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim())                 { setError("El nombre es obligatorio");                   return; }
    if (!apellido.trim())               { setError("El apellido es obligatorio");                 return; }
    if (!correo.trim())                 { setError("El correo es obligatorio");                   return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { setError("Ingresa un correo válido");       return; }
    if (passwordTemporal.length < 8)    { setError("La contraseña debe tener al menos 8 caracteres"); return; }

    setLoading(true);
    setError("");
    try {
      await onSave({
        correo:           correo.trim(),
        nombre:           nombre.trim(),
        apellido:         apellido.trim(),
        rol:              puedeCrearAdmin ? rol : "operador",
        passwordTemporal,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  const generarPassword = () => {
    // 12 caracteres mezclando mayuscula, minuscula, digito y simbolo.
    const upper   = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower   = "abcdefghijkmnopqrstuvwxyz";
    const digits  = "23456789";
    const symbols = "!@#$%&*?";
    const all     = upper + lower + digits + symbols;
    const pick    = (pool: string) => pool[Math.floor(Math.random() * pool.length)];
    const base    = [pick(upper), pick(lower), pick(digits), pick(symbols)];
    while (base.length < 12) base.push(pick(all));
    setPasswordTemporal(base.sort(() => Math.random() - 0.5).join(""));
    setShowPassword(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className={`${card} w-full max-w-md rounded-2xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              {puedeCrearAdmin ? "Crear usuario" : "Crear operador"}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              El usuario definirá su contraseña la primera vez vía "Olvidé mi contraseña"
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { void handleSubmit(e); }} className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); setError(""); }}
                placeholder="Juan"
                className={inputCls}
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Apellido</label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => { setApellido(e.target.value); setError(""); }}
                placeholder="Pérez"
                className={inputCls}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Correo electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => { setCorreo(e.target.value); setError(""); }}
              placeholder="usuario@gobcauca.gov.co"
              className={inputCls}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Rol</label>
            {puedeCrearAdmin ? (
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value as RolAsignable)}
                disabled={loading}
                className={`appearance-none ${inputCls} cursor-pointer`}
              >
                <option value="operador">Operador</option>
                <option value="admin">Administrador</option>
              </select>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Badge label="Operador" variant="blue" />
                <span className="text-xs text-gray-400 dark:text-gray-500">Único rol asignable por administradores</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Contraseña temporal
              </label>
              <button
                type="button"
                onClick={generarPassword}
                disabled={loading}
                className="text-xs text-[#1B7F4B] hover:underline font-medium disabled:opacity-50"
              >
                Generar
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordTemporal}
                onChange={(e) => { setPasswordTemporal(e.target.value); setError(""); }}
                placeholder="Mínimo 8 caracteres"
                className={`${inputCls} pr-9`}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              El usuario deberá cambiarla obligatoriamente en su primer inicio de sesión.
            </p>
          </div>

          {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Creando…" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal: Editar usuario ────────────────────────────────────────────────────
function ModalEditarUsuario({
  usuario,
  onClose,
  onSave,
}: {
  usuario: UsuarioItem;
  onClose: () => void;
  onSave: (id: string, nombre: string) => Promise<void>;
}) {
  const [nombre,  setNombre]  = useState(usuario.nombre);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!nombre.trim()) { setError("El nombre no puede estar vacío"); return; }

    setLoading(true);
    setError("");
    try {
      await onSave(usuario.id, nombre.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className={`${card} w-full max-w-sm rounded-2xl p-6`}>
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">Editar usuario</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{usuario.correo}</p>

        <div className="flex flex-col gap-1 mb-4">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nombre completo</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => { setNombre(e.target.value); setError(""); }}
            className={`${inputCls} ${error ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20" : ""}`}
            disabled={loading}
          />
          {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => { void handleGuardar(); }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
function Usuarios() {
  const { user } = useAuth();
  const esSuperadmin = user?.rol === "superadmin";

  const {
    filtered, filters, stats,
    isLoading, error, opLoading,
    crearUsuario, editarUsuario, toggleEstado, eliminarUsuario,
    recargar, limpiarFiltros, setBusqueda, setRol,
  } = useUsuarios();

  const [showCrear, setShowCrear] = useState(false);
  const [editando,  setEditando]  = useState<UsuarioItem | null>(null);

  // Reglas de gestion en la UI (espejo de las del backend):
  // - superadmin: puede gestionar admin y operador, NO a otros superadmin.
  // - admin: solo puede gestionar operador.
  const puedeGestionar = (u: UsuarioItem): boolean => {
    if (u.rol === "superadmin") return false;
    if (esSuperadmin) return true;
    return u.rol === "operador";
  };

  const handleToggleEstado = async (usuario: UsuarioItem) => {
    const desactivando = usuario.estado === "Activo";
    const accion = desactivando ? "desactivar" : "activar";

    const result = await Swal.fire({
      title: `¿${desactivando ? "Desactivar" : "Activar"} usuario?`,
      text: desactivando
        ? `${usuario.nombre} no podrá iniciar sesión hasta ser reactivado.`
        : `${usuario.nombre} volverá a poder iniciar sesión en el sistema.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: desactivando ? "Desactivar" : "Activar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: desactivando ? "#ef4444" : "#1B7F4B",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      await toggleEstado(usuario.id);
      void Swal.fire({
        title: desactivando ? "Usuario desactivado" : "Usuario activado",
        icon: "success",
        confirmButtonColor: "#1B7F4B",
        timer: 1800,
        timerProgressBar: true,
      });
    } catch (err) {
      void Swal.fire({
        title: "Error",
        text: err instanceof Error ? err.message : `No se pudo ${accion} el usuario`,
        icon: "error",
        confirmButtonColor: "#1B7F4B",
      });
    }
  };

  const handleEliminar = async (usuario: UsuarioItem) => {
    const result = await Swal.fire({
      title: `¿Eliminar ${rolesInfo[usuario.rol].label.toLowerCase()}?`,
      text: `Se eliminará permanentemente a ${usuario.nombre}. Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      await eliminarUsuario(usuario.id);
    } catch (err) {
      void Swal.fire({
        title: "Error",
        text: err instanceof Error ? err.message : "No se pudo eliminar el usuario",
        icon: "error",
        confirmButtonColor: "#1B7F4B",
      });
    }
  };

  return (
    <div>
      <PageHeader title="Administración de Usuarios" subtitle="Gestione los usuarios del sistema">
        <button
          onClick={() => setShowCrear(true)}
          className="flex items-center gap-2 bg-[#1B7F4B] hover:bg-[#166340] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shrink-0"
        >
          <Plus size={16} /> {esSuperadmin ? "Crear usuario" : "Crear operador"}
        </button>
      </PageHeader>

      {showCrear && (
        <ModalCrearUsuario
          puedeCrearAdmin={esSuperadmin}
          onClose={() => setShowCrear(false)}
          onSave={crearUsuario}
        />
      )}
      {editando && (
        <ModalEditarUsuario
          usuario={editando}
          onClose={() => setEditando(null)}
          onSave={editarUsuario}
        />
      )}

      {/* Filtros */}
      <div className={`${card} p-4 mb-4`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:flex-[2]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={filters.busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`${inputCls} pl-8`}
            />
          </div>
          <select
            value={filters.rol}
            onChange={(e) => setRol(e.target.value)}
            className={`appearance-none ${inputCls} cursor-pointer sm:w-44`}
          >
            <option value="">Todos los roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Administrador</option>
            <option value="operador">Operador</option>
          </select>
          {(filters.busqueda || filters.rol) && (
            <button
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <X size={14} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className={`${card} overflow-hidden mb-4`}>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400 dark:text-gray-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Cargando usuarios…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={() => { void recargar(); }}
              className="flex items-center gap-2 text-sm text-[#1B7F4B] hover:underline font-medium"
            >
              <RefreshCw size={14} /> Reintentar
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  {["Nombre", "Correo electrónico", "Rol", "Estado", "Acciones"].map((col) => (
                    <th key={col} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-sm text-gray-400 dark:text-gray-500 py-12">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const gestionable = puedeGestionar(u);
                    const motivoBloqueo = !gestionable
                      ? u.rol === "superadmin"
                        ? "Los superadmin no pueden ser modificados"
                        : "Solo un superadmin puede modificar administradores"
                      : undefined;
                    const btnBase     = "p-1.5 rounded-lg transition";
                    const btnDisabled = `${btnBase} opacity-30 cursor-not-allowed text-gray-400`;

                    return (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{u.nombre}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.correo}</td>
                        <td className="px-4 py-3"><Badge label={rolesInfo[u.rol].label} variant={rolesInfo[u.rol].variant} /></td>
                        <td className="px-4 py-3"><Badge label={u.estado} variant={u.estado === "Activo" ? "green" : "gray"} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1" title={motivoBloqueo}>
                            {/* Editar */}
                            <button
                              onClick={() => gestionable && setEditando(u)}
                              disabled={!gestionable || opLoading}
                              title={motivoBloqueo ?? "Editar"}
                              className={!gestionable || opLoading
                                ? btnDisabled
                                : `${btnBase} hover:bg-[#1B7F4B]/10 dark:hover:bg-[#1B7F4B]/20 text-gray-400 hover:text-[#1B7F4B]`
                              }
                            >
                              <Pencil size={15} />
                            </button>

                            {/* Activar / Desactivar */}
                            <button
                              onClick={() => { if (gestionable) void handleToggleEstado(u); }}
                              disabled={!gestionable || opLoading}
                              title={motivoBloqueo ?? (u.estado === "Activo" ? "Desactivar" : "Activar")}
                              className={!gestionable || opLoading
                                ? btnDisabled
                                : `${btnBase} ${u.estado === "Activo"
                                    ? "hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                    : "hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                                  }`
                              }
                            >
                              {u.estado === "Activo" ? <UserX size={15} /> : <UserCheck size={15} />}
                            </button>

                            {/* Eliminar */}
                            <button
                              onClick={() => { if (gestionable) void handleEliminar(u); }}
                              disabled={!gestionable || opLoading}
                              title={motivoBloqueo ?? "Eliminar"}
                              className={!gestionable || opLoading
                                ? btnDisabled
                                : `${btnBase} hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 dark:hover:text-red-400`
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panel inferior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Roles del sistema */}
        <div className={`${card} p-5`}>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldCheck size={14} className="text-gray-400 dark:text-gray-500" /> Roles del sistema
          </h3>
          <div className="flex flex-col gap-2">
            {(["superadmin", "admin", "operador"] as const).map((key) => {
              const r = rolesInfo[key];
              const destacado = key === "superadmin" || key === "admin";
              return (
                <div key={key} className={`rounded-lg border px-4 py-3 ${
                  destacado
                    ? "border-[#1B7F4B]/20 dark:border-[#1B7F4B]/30 bg-[#1B7F4B]/5 dark:bg-[#1B7F4B]/10"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                }`}>
                  <p className={`text-sm font-semibold ${destacado ? "text-[#1B7F4B]" : "text-gray-700 dark:text-gray-200"}`}>
                    {r.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.descripcion.split(".")[0]}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estadísticas */}
        <div className={`${card} p-5`}>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Estadísticas</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Total usuarios",  value: stats.total },
              { label: "Activos",         value: stats.activos },
              { label: "Inactivos",       value: stats.inactivos },
              { label: "Superadmins",     value: stats.superadmins },
              { label: "Administradores", value: stats.admins },
              { label: "Operadores",      value: stats.operadores },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{s.label}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Usuarios;
