import { useState } from "react";
import { Plus, Search, X, Pencil, UserX, UserCheck, ShieldCheck } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import { useUsuarios, rolesInfo, type RolUsuario, type UsuarioItem } from "../hooks/useUsuarios";

const card   = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";
const inputCls = "w-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] focus:bg-white dark:focus:bg-gray-800 transition";
const selectCls = `appearance-none ${inputCls} cursor-pointer`;

function ModalCrearUsuario({ onClose, onSave }: { onClose: () => void; onSave: (correo: string, rol: RolUsuario) => void }) {
  const [correo, setCorreo] = useState("");
  const [rol,    setRol]    = useState<RolUsuario>("operador");
  const [error,  setError]  = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim()) { setError("El correo es obligatorio"); return; }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(correo)) { setError("Ingresa un correo válido"); return; }
    onSave(correo.trim(), rol);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className={`${card} w-full max-w-md rounded-2xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Crear usuario</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">El usuario accederá mediante su cuenta de Google</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Correo electrónico</label>
            <input
              type="email" value={correo}
              onChange={(e) => { setCorreo(e.target.value); setError(""); }}
              placeholder="usuario@gobcauca.gov.co"
              className={`${inputCls} ${error ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20" : ""}`}
            />
            {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
            <p className="text-xs text-gray-400 dark:text-gray-500">El nombre será sincronizado automáticamente desde Google.</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Rol</label>
            <select value={rol} onChange={(e) => setRol(e.target.value as RolUsuario)} className={selectCls}>
              <option value="usuario">Usuario</option>
              <option value="operador">Operador</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="text-xs text-gray-400 dark:text-gray-500">{rolesInfo[rol].descripcion}</p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition">Crear usuario</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalEditarRol({ usuario, onClose, onSave }: { usuario: UsuarioItem; onClose: () => void; onSave: (id: number, rol: RolUsuario) => void }) {
  const [rol, setRol] = useState<RolUsuario>(usuario.rol);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className={`${card} w-full max-w-sm rounded-2xl p-6`}>
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">Editar rol</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{usuario.nombre} · {usuario.correo}</p>
        <select value={rol} onChange={(e) => setRol(e.target.value as RolUsuario)} className={`${selectCls} mb-2`}>
          <option value="usuario">Usuario</option>
          <option value="operador">Operador</option>
          <option value="admin">Administrador</option>
        </select>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{rolesInfo[rol].descripcion}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancelar</button>
          <button onClick={() => { onSave(usuario.id, rol); onClose(); }} className="px-4 py-2 text-sm font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition">Guardar</button>
        </div>
      </div>
    </div>
  );
}

function Usuarios() {
  const {
    filtered, filters, stats, actividadReciente,
    crearUsuario, editarRol, toggleEstado, limpiarFiltros,
    setBusqueda, setRol,
  } = useUsuarios();

  const [showCrear, setShowCrear] = useState(false);
  const [editando,  setEditando]  = useState<UsuarioItem | null>(null);

  return (
    <div>
      <PageHeader title="Administración de Usuarios" subtitle="Gestione los usuarios y permisos del sistema">
        <button onClick={() => setShowCrear(true)} className="flex items-center gap-2 bg-[#1B7F4B] hover:bg-[#166340] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shrink-0">
          <Plus size={16} /> Crear usuario
        </button>
      </PageHeader>

      {showCrear && <ModalCrearUsuario onClose={() => setShowCrear(false)} onSave={crearUsuario} />}
      {editando  && <ModalEditarRol usuario={editando} onClose={() => setEditando(null)} onSave={editarRol} />}

      {/* Filtros */}
      <div className={`${card} p-4 mb-4`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text" placeholder="Buscar por nombre o correo..." value={filters.busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`${inputCls} pl-8`}
            />
          </div>
          <select value={filters.rol} onChange={(e) => setRol(e.target.value)} className={selectCls}>
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="operador">Operador</option>
            <option value="usuario">Usuario</option>
          </select>
          {(filters.busqueda || filters.rol) && (
            <button onClick={limpiarFiltros} className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <X size={14} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className={`${card} overflow-hidden mb-4`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {["Nombre", "Correo electrónico", "Rol", "Estado", "Acciones"].map((col) => (
                  <th key={col} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-sm text-gray-400 dark:text-gray-500 py-12">No se encontraron usuarios</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{u.nombre}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.correo}</td>
                    <td className="px-4 py-3"><Badge label={rolesInfo[u.rol].label} variant={rolesInfo[u.rol].variant} /></td>
                    <td className="px-4 py-3"><Badge label={u.estado} variant={u.estado === "Activo" ? "green" : "gray"} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditando(u)} title="Editar rol"
                          className="p-1.5 rounded-lg hover:bg-[#1B7F4B]/10 dark:hover:bg-[#1B7F4B]/20 text-gray-400 hover:text-[#1B7F4B] transition">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => toggleEstado(u.id)} title={u.estado === "Activo" ? "Desactivar" : "Activar"}
                          className={`p-1.5 rounded-lg transition ${u.estado === "Activo"
                            ? "hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            : "hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                          }`}>
                          {u.estado === "Activo" ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel inferior */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Roles */}
        <div className={`${card} p-5`}>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldCheck size={14} className="text-gray-400 dark:text-gray-500" /> Roles del sistema
          </h3>
          <div className="flex flex-col gap-2">
            {(Object.entries(rolesInfo) as [RolUsuario, typeof rolesInfo[RolUsuario]][]).map(([key, r]) => (
              <div key={key} className={`rounded-lg border px-4 py-3 ${
                key === "admin"
                  ? "border-[#1B7F4B]/20 dark:border-[#1B7F4B]/30 bg-[#1B7F4B]/5 dark:bg-[#1B7F4B]/10"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
              }`}>
                <p className={`text-sm font-semibold ${key === "admin" ? "text-[#1B7F4B]" : "text-gray-700 dark:text-gray-200"}`}>{r.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.descripcion.split(".")[0]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Estadísticas */}
        <div className={`${card} p-5`}>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Estadísticas</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Total usuarios",  value: stats.total },
              { label: "Activos",         value: stats.activos },
              { label: "Administradores", value: stats.admins },
              { label: "Operadores",      value: stats.operadores },
              { label: "Usuarios",        value: stats.usuarios },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{s.label}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className={`${card} p-5`}>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Actividad reciente</h3>
          <div className="flex flex-col gap-3">
            {actividadReciente.map((a, i) => (
              <div key={i}>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{a.texto}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">{a.tiempo}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Usuarios;