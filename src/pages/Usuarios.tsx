import { useState } from "react";
import { Plus, Search, X, Pencil, UserX, UserCheck, ShieldCheck, Trash2, RefreshCw, Loader2, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import PageHeader from "../components/ui/PageHeader";
import { useUsuarios, rolesInfo, type UsuarioItem, type CrearUsuarioInput } from "../hooks/useUsuarios";
import type { RolAsignable } from "../services/usuariosApi";
import { useAuth } from "../context/AuthContext";
import { Permissions } from "../utils/permissions";

// ── CONSTANTES DE DISEÑO INSTITUCIONAL ───────────────────────────────────────
const card = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";

const focusRing = "focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B]";

const inputCls = `w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-base text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg px-3 py-2 ${focusRing} transition`;

const selectCls = `appearance-none w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-base text-gray-600 dark:text-gray-300 rounded-lg pl-3 pr-10 py-2 ${focusRing} transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[size:1.5em_1.5em] bg-no-repeat`;

const labelCls = "text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400";

const btnInteractiveCls = `p-1.5 rounded-lg transition ${focusRing}`;

// ── COMPONENTE MINIMALISTA: DOT DE ESTADO ────────────────────────────────────
function StatusDot({ type, label }: { type: "green" | "red" | "amber" | "gray" | "blue"; label: string }) {
  const dotShadows = {
    green: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]",
    red: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
    amber: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
    gray: "bg-gray-400 shadow-[0_0_8px_rgba(156,163,175,0.6)]",
    blue: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]", // Soporte para rol Operador/Admin neutral
  };

  return (
    <div className="flex items-center gap-2 font-semibold text-base">
      <span className={`w-2.5 h-2.5 shrink-0 rounded-full ${dotShadows[type]}`} />
      <span className="text-gray-700 dark:text-gray-200">{label}</span>
    </div>
  );
}

// ── MODAL: CREAR USUARIO ─────────────────────────────────────────────────────
function ModalCrearUsuario({
  puedeCrearAdmin,
  onClose,
  onSave,
}: {
  puedeCrearAdmin: boolean;
  onClose: () => void;
  onSave: (input: CrearUsuarioInput) => Promise<void>;
}) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState<RolAsignable>("operador");
  const [passwordTemporal, setPasswordTemporal] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { setError("El nombre es obligatorio"); return; }
    if (!apellido.trim()) { setError("El apellido es obligatorio"); return; }
    if (!correo.trim()) { setError("El correo es obligatorio"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { setError("Ingresa un correo válido"); return; }
    if (passwordTemporal.length < 8) { setError("La contraseña debe tener al menos 8 caracteres"); return; }

    setLoading(true);
    setError("");
    try {
      await onSave({
        correo: correo.trim(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        rol: puedeCrearAdmin ? rol : "operador",
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
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const digits = "23456789";
    const symbols = "!@#$%&*?";
    const all = upper + lower + digits + symbols;
    const pick = (pool: string) => pool[Math.floor(Math.random() * pool.length)];
    const base = [pick(upper), pick(lower), pick(digits), pick(symbols)];
    while (base.length < 12) base.push(pick(all));
    setPasswordTemporal(base.sort(() => Math.random() - 0.5).join(""));
    setShowPassword(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className={`${card} w-full max-w-md rounded-2xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {puedeCrearAdmin ? "Crear usuario" : "Crear operador"}
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-0.5">
              El usuario definirá su contraseña la primera vez vía "Olvidé mi contraseña"
            </p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition ${focusRing}`}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { void handleSubmit(e); }} className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Nombre</label>
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
              <label className={labelCls}>Apellido</label>
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
            <label className={labelCls}>Correo electrónico</label>
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
            <label className={labelCls}>Rol</label>
            {puedeCrearAdmin ? (
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value as RolAsignable)}
                disabled={loading}
                className={selectCls}
              >
                <option value="operador">Operador</option>
                <option value="admin">Administrador</option>
              </select>
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg">
                <StatusDot type="blue" label="Operador" />
                <span className="text-base text-gray-500 dark:text-gray-400">Único rol asignable por administradores</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className={labelCls}>Contraseña temporal</label>
              <button
                type="button"
                onClick={generarPassword}
                disabled={loading}
                className={`text-sm text-[#1B7F4B] hover:text-[#166340] font-semibold hover:underline disabled:opacity-50 transition rounded px-1 ${focusRing}`}
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
                className={`${inputCls} pr-10`}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${focusRing}`}
                title={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-base text-gray-500 dark:text-gray-400">
              El usuario deberá cambiarla obligatoriamente en su primer inicio de sesión.
            </p>
          </div>

          {error && <p className="text-base font-semibold text-red-500 dark:text-red-400">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 ${focusRing}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 text-base font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition disabled:opacity-60 ${focusRing}`}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Creando…" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── MODAL: EDITAR USUARIO ────────────────────────────────────────────────────
function ModalEditarUsuario({
  usuario,
  onClose,
  onSave,
}: {
  usuario: UsuarioItem;
  onClose: () => void;
  onSave: (id: string, nombre: string) => Promise<void>;
}) {
  const [nombre, setNombre] = useState(usuario.nombre);
  const [error, setError] = useState("");
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
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Editar usuario</h2>
        <p className="text-base text-gray-500 dark:text-gray-400 mb-4">{usuario.correo}</p>

        <div className="flex flex-col gap-1 mb-4">
          <label className={labelCls}>Nombre completo</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => { setNombre(e.target.value); setError(""); }}
            className={`${inputCls} ${error ? "border-red-500 dark:border-red-500" : ""}`}
            disabled={loading}
          />
          {error && <p className="text-base font-semibold text-red-500 dark:text-red-400">{error}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className={`px-4 py-2 text-base font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 ${focusRing}`}
          >
            Cancelar
          </button>
          <button
            onClick={() => { void handleGuardar(); }}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 text-base font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition disabled:opacity-60 ${focusRing}`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
function Usuarios() {
  const { user } = useAuth();
  const esSuperadmin = Permissions.isSuperAdmin(user);

  const {
    filtered, filters, stats,
    isLoading, error, opLoading,
    crearUsuario, editarUsuario, toggleEstado, eliminarUsuario,
    recargar, limpiarFiltros, setBusqueda, setRol,
  } = useUsuarios();

  const [showCrear, setShowCrear] = useState(false);
  const [editando, setEditando] = useState<UsuarioItem | null>(null);

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

  // Mapeos de variantes semánticas de roles para usar en StatusDot
  const getRolDotVariant = (rol: string): "red" | "amber" | "blue" | "gray" => {
    if (rol === "superadmin") return "red";
    if (rol === "admin") return "amber";
    return "blue";
  };

  return (
    <div>
      <PageHeader title="Administración de Usuarios" subtitle="Gestione los usuarios del sistema">
        <button
          onClick={() => setShowCrear(true)}
          className={`flex items-center gap-2 bg-[#1B7F4B] hover:bg-[#166340] text-white text-base font-semibold px-4 py-2.5 rounded-lg transition shrink-0 ${focusRing}`}
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
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={filters.busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`${inputCls} pl-10`}
            />
          </div>
          <div className="sm:w-52">
            <select
              value={filters.rol}
              onChange={(e) => setRol(e.target.value)}
              className={selectCls}
            >
              <option value="">Todos los roles</option>
              <option value="superadmin">Superadmin</option>
              <option value="admin">Administrador</option>
              <option value="operador">Operador</option>
            </select>
          </div>
          {(filters.busqueda || filters.rol) && (
            <button
              onClick={limpiarFiltros}
              className={`inline-flex items-center gap-1.5 text-base text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${focusRing}`}
            >
              <X size={16} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className={`${card} overflow-hidden mb-4`}>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400 dark:text-gray-500">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-base">Cargando usuarios…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-base text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={() => { void recargar(); }}
              className={`flex items-center gap-2 text-base text-[#1B7F4B] hover:text-[#166340] hover:underline font-semibold rounded px-1 ${focusRing}`}
            >
              <RefreshCw size={16} /> Reintentar
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  {["Nombre", "Correo electrónico", "Rol", "Estado", "Acciones"].map((col) => (
                    <th key={col} className={`${labelCls} text-left px-4 py-3`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700 bg-white dark:bg-gray-900">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-base text-gray-400 dark:text-gray-500 py-12">
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

                    const btnDisabled = `${btnInteractiveCls} opacity-20 cursor-not-allowed text-gray-400`;

                    return (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                        <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-100">{u.nombre}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.correo}</td>
                        <td className="px-4 py-3">
                          <StatusDot type={getRolDotVariant(u.rol)} label={rolesInfo[u.rol].label} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusDot type={u.estado === "Activo" ? "green" : "gray"} label={u.estado} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5" title={motivoBloqueo}>
                            {/* Editar */}
                            <button
                              onClick={() => gestionable && setEditando(u)}
                              disabled={!gestionable || opLoading}
                              title={motivoBloqueo ?? "Editar"}
                              className={!gestionable || opLoading
                                ? btnDisabled
                                : `${btnInteractiveCls} hover:bg-[#1B7F4B]/10 dark:hover:bg-[#1B7F4B]/20 text-gray-400 hover:text-[#1B7F4B]`
                              }
                            >
                              <Pencil size={16} />
                            </button>

                            {/* Activar / Desactivar */}
                            <button
                              onClick={() => { if (gestionable) void handleToggleEstado(u); }}
                              disabled={!gestionable || opLoading}
                              title={motivoBloqueo ?? (u.estado === "Activo" ? "Desactivar" : "Activar")}
                              className={!gestionable || opLoading
                                ? btnDisabled
                                : `${btnInteractiveCls} ${u.estado === "Activo"
                                  ? "hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                  : "hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                                }`
                              }
                            >
                              {u.estado === "Activo" ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>

                            {/* Eliminar */}
                            <button
                              onClick={() => { if (gestionable) void handleEliminar(u); }}
                              disabled={!gestionable || opLoading}
                              title={motivoBloqueo ?? "Eliminar"}
                              className={!gestionable || opLoading
                                ? btnDisabled
                                : `${btnInteractiveCls} hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 dark:hover:text-red-400`
                              }
                            >
                              <Trash2 size={16} />
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
          <h3 className={`${labelCls} mb-3 flex items-center gap-2`}>
            <ShieldCheck size={16} className="text-gray-400 dark:text-gray-500" /> Roles del sistema
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
                  <p className={`text-base font-bold ${destacado ? "text-[#1B7F4B]" : "text-gray-700 dark:text-gray-200"}`}>
                    {r.label}
                  </p>
                  <p className="text-base text-gray-500 dark:text-gray-400 mt-0.5">{r.descripcion.split(".")[0]}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estadísticas */}
        <div className={`${card} p-5`}>
          <h3 className={labelCls} mb-3>Estadísticas</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Total usuarios", value: stats.total },
              { label: "Activos", value: stats.activos },
              { label: "Inactivos", value: stats.inactivos },
              { label: "Superadmins", value: stats.superadmins },
              { label: "Administradores", value: stats.admins },
              { label: "Operadores", value: stats.operadores },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between text-base border-b border-gray-50 dark:border-gray-700/50 pb-1 last:border-none">
                <span className="text-gray-600 dark:text-gray-300">{s.label}</span>
                <span className="font-bold text-gray-800 dark:text-gray-100">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Usuarios;