import { Search, RotateCcw, CheckCircle, XCircle, ChevronDown, ChevronUp, ClipboardList, History } from "lucide-react";
import { useState } from "react";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import { ModalRechazar } from "../../../components/ui/ModalRechazar";
import { useSolicitudes, estadoVariant, type TipoAccion, type EstadoSolicitud, type CambioCampo, type SolicitudItem } from "../hooks/useSolicitudes";

const card = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";
const input = "w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E4B400]/30 focus:border-[#E4B400] transition-all";
const selectCls = `appearance-none ${input} cursor-pointer`;

// ─── Tabla de cambios ────────────────────────────────────────────────────────
function TablaCambios({ cambios, tipo }: { cambios: CambioCampo[]; tipo: SolicitudItem["tipo"] }) {
  const esEdicion = tipo.startsWith("Editar");
  return (
    <table className="w-full text-xs border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <th className="text-left px-3 py-2 font-semibold">Campo</th>
          {esEdicion && <th className="text-left px-3 py-2 font-semibold">Valor anterior</th>}
          <th className="text-left px-3 py-2 font-semibold">Valor nuevo</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
        {cambios.map((c, i) => (
          <tr key={i} className="bg-white dark:bg-gray-800">
            <td className="px-3 py-2 text-gray-600 dark:text-gray-300 font-medium">{c.campo}</td>
            {esEdicion && <td className="px-3 py-2 text-red-500 dark:text-red-400">{c.valorAnterior ?? "—"}</td>}
            <td className="px-3 py-2 text-[#E4B400] dark:text-yellow-400 font-medium">{c.valorNuevo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Tarjeta de solicitud ────────────────────────────────────────────────────
function TarjetaSolicitud({
  s, expandidoId, toggle, esPendienteTab,
  onAprobar, onRechazar,
}: {
  s: SolicitudItem;
  expandidoId: number | null;
  toggle: (id: number) => void;
  esPendienteTab: boolean;
  onAprobar?: (id: number) => void;
  onRechazar?: (id: number) => void;
}) {
  const expandida = expandidoId === s.id;
  const esPendiente = s.estado === "Pendiente";
  const badgeTipo = s.tipo.startsWith("Crear") ? "Nuevo Registro"
    : s.tipo.startsWith("Editar") ? "Modificación"
      : "Cambio de Estado";

  return (
    <div className={`${card} overflow-hidden`}>
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{s.descripcion}</span>

            {/* Badge tipo (Nuevo Registro / Modificación / etc.) */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeTipo === "Nuevo Registro" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : badgeTipo === "Modificación" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              }`}>
              {badgeTipo}
            </span>

            {/* Badge entidad */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {s.entidad}
            </span>

            {/* Badge origen: Acción Admin vs Propuesta Operador (solo en historial) */}
            {!esPendienteTab && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.esAccionAdmin
                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                }`}>
                {s.esAccionAdmin ? "Acción directa Admin" : "Propuesta Operador"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
            <span>
              {s.esAccionAdmin ? "Realizado por:" : "Enviado por:"}
              {" "}<span className="text-gray-600 dark:text-gray-300 font-medium">{s.operador}</span>
              {s.operadorEmail && s.operadorEmail !== s.operador && (
                <span className="ml-1 text-gray-400 dark:text-gray-500">({s.operadorEmail})</span>
              )}
            </span>
            <span>{new Date(s.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</span>
            {s.revisadoPorAdmin && !s.esAccionAdmin && (
              <span>
                {s.estado === "Aprobada" ? "Aprobado por:" : "Rechazado por:"}
                {" "}<span className="text-gray-600 dark:text-gray-300 font-medium">{s.revisadoPorAdmin}</span>
                {s.revisadoPorAdminEmail && s.revisadoPorAdminEmail !== s.revisadoPorAdmin && (
                  <span className="ml-1 text-gray-400 dark:text-gray-500">({s.revisadoPorAdminEmail})</span>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge label={s.estado} variant={estadoVariant[s.estado]} />
          <button onClick={() => toggle(s.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 transition">
            {expandida ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {expandida && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-4 mb-2">
            {s.esAccionAdmin ? "Cambios aplicados" : "Cambios propuestos"}
          </p>
          {s.cambios.length > 0 ? (
            <TablaCambios cambios={s.cambios} tipo={s.tipo} />
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">Sin detalle de campos disponible.</p>
          )}

          {s.estado === "Rechazada" && s.motivoRechazo && (
            <div className="mt-3 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 rounded-lg px-3 py-2.5">
              <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400">
                <span className="font-semibold">Motivo: </span>{s.motivoRechazo}
              </p>
            </div>
          )}

          {esPendiente && onAprobar && onRechazar && (
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => onRechazar(s.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <XCircle size={14} /> Rechazar
              </button>
              <button
                onClick={() => onAprobar(s.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#E4B400] hover:bg-[#cfa200] transition"
              >
                <CheckCircle size={14} /> Aprobar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TIPOS: TipoAccion[] = [
  "Crear JAC", "Editar JAC",
  "Crear Asocomunal", "Editar Asocomunal", "Cambio de estado Asocomunal",
];

// ─── Componente principal ────────────────────────────────────────────────────
function SolicitudesAdmin() {
  const {
    filters, filtered, aprobar, rechazar,
    handleSearch, handleClear,
    setTipo, setOperador, setFechaDesde, setFechaHasta,
    loading,
  } = useSolicitudes();

  const [tab, setTab] = useState<"pendientes" | "historial">("pendientes");
  const [rechazarId, setRechazarId] = useState<number | null>(null);
  const [aprobarId, setAprobarId] = useState<number | null>(null);
  const [expandidoId, setExpandidoId] = useState<number | null>(null);

  const toggle = (id: number) => setExpandidoId((prev) => (prev === id ? null : id));

  // Separar por pestaña
  const pendientes = filtered.filter((s) => s.estado === "Pendiente");
  const historial = filtered.filter((s) => s.estado !== "Pendiente");
  const listaMostrada = tab === "pendientes" ? pendientes : historial;

  return (
    <div>
      <PageHeader
        title="Auditoría y Solicitudes"
        subtitle="Gestión de cambios"
        description="Revise solicitudes pendientes y consulte el historial de cambios aplicados"
      >
        {pendientes.length > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/40 text-xs font-semibold px-3 py-1.5 rounded-full">
            {pendientes.length} pendiente{pendientes.length > 1 ? "s" : ""}
          </span>
        )}
      </PageHeader>

      {/* Modal rechazar */}
      {rechazarId !== null && (
        <ModalRechazar
          onClose={() => setRechazarId(null)}
          onConfirm={(motivo) => { rechazar(rechazarId, motivo); setRechazarId(null); }}
        />
      )}

      {/* Modal aprobar */}
      {aprobarId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">¿Aprobar solicitud?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">El registro quedará publicado y visible en el sistema.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setAprobarId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                Cancelar
              </button>
              <button onClick={() => { aprobar(aprobarId); setAprobarId(null); }} className="px-4 py-2 text-sm font-semibold text-white bg-[#E4B400] hover:bg-[#cfa200] rounded-lg transition-colors">
                Sí, aprobar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pestañas */}
      <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setTab("pendientes")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "pendientes"
            ? "border-[#E4B400] text-[#E4B400] dark:text-yellow-400"
            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
          <ClipboardList size={15} />
          Pendientes
          {pendientes.length > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
              {pendientes.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("historial")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "historial"
            ? "border-[#E4B400] text-[#E4B400] dark:text-yellow-400"
            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
          <History size={15} />
          Historial
          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            {historial.length}
          </span>
        </button>
      </div>

      {/* Filtros */}
      <div className={`${card} p-4 mb-4`}>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Filtros</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select value={filters.tipo} onChange={(e) => setTipo(e.target.value)} className={selectCls}>
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" placeholder="Buscar por operador..." value={filters.operador} onChange={(e) => setOperador(e.target.value)} className={input} />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Desde</label>
            <input type="date" value={filters.fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className={input} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Hasta</label>
            <input type="date" value={filters.fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className={input} />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Los filtros se aplican automáticamente en tiempo real
          </p>
          <button onClick={handleClear} className="ml-auto inline-flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
            <RotateCcw size={16} /> Limpiar filtros
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className={`${card} py-16 flex flex-col items-center`}>
            <p className="text-sm text-gray-400 dark:text-gray-500">Cargando solicitudes...</p>
          </div>
        ) : listaMostrada.length === 0 ? (
          <div className={`${card} py-16 flex flex-col items-center`}>
            <EmptyState message={
              tab === "pendientes"
                ? "No hay solicitudes pendientes de revisión"
                : "No hay registros en el historial"
            } />
          </div>
        ) : (
          listaMostrada.map((s) => (
            <TarjetaSolicitud
              key={s.id}
              s={s}
              expandidoId={expandidoId}
              toggle={toggle}
              esPendienteTab={tab === "pendientes"}
              onAprobar={tab === "pendientes" ? (id) => setAprobarId(id) : undefined}
              onRechazar={tab === "pendientes" ? (id) => setRechazarId(id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default SolicitudesAdmin;