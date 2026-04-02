import { Search, RotateCcw, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { ModalRechazar } from "../components/ui/ModalRechazar";
import {
  useSolicitudes,
  estadoVariant,
  tipoVariant,
  type TipoAccion,
  type EstadoSolicitud,
} from "../hooks/useSolicitudes";

const TIPOS: TipoAccion[] = [
  "Crear JAC", "Editar JAC", "Eliminar JAC",
  "Crear Asocomunal", "Editar Asocomunal", "Eliminar Asocomunal",
];

function SolicitudesAdmin() {
  const {
    filters, filtered, aprobar, rechazar,
    handleSearch, handleClear,
    setEstado, setTipo, setOperador, setFechaDesde, setFechaHasta,
  } = useSolicitudes();

  const [rechazarId, setRechazarId] = useState<number | null>(null);
  const [aprobarId, setAprobarId] = useState<number | null>(null);
  const [expandidoId, setExpandidoId] = useState<number | null>(null);

  const pendientes = filtered.filter((s) => s.estado === "Pendiente").length;

  return (
    <div>
      <PageHeader
        title="Solicitudes Pendientes"
        subtitle="Auditoría y aprobación"
        description="Gestione las solicitudes de cambio propuestas por los operadores"
      >
        {pendientes > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full">
            {pendientes} pendiente{pendientes > 1 ? "s" : ""}
          </span>
        )}
      </PageHeader>

      {rechazarId !== null && (
        <ModalRechazar
          onClose={() => setRechazarId(null)}
          onConfirm={(motivo) => rechazar(rechazarId, motivo)}
        />
      )}

      {aprobarId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-2">¿Aprobar solicitud?</h2>
            <p className="text-sm text-gray-500 mb-6">El registro quedará publicado y visible en el sistema.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setAprobarId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => { aprobar(aprobarId); setAprobarId(null); }}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition-colors"
              >
                Sí, aprobar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filtros</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select
            value={filters.estado}
            onChange={(e) => setEstado(e.target.value)}
            className="appearance-none w-full border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
          >
            <option value="">Todos los estados</option>
            {(["Pendiente", "Aprobada", "Rechazada"] as EstadoSolicitud[]).map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          <select
            value={filters.tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="appearance-none w-full border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
          >
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <input
            type="text"
            placeholder="Buscar por operador..."
            value={filters.operador}
            onChange={(e) => setOperador(e.target.value)}
            className="w-full border border-gray-200 text-sm text-gray-600 placeholder:text-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all"
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Desde</label>
            <input type="date" value={filters.fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full border border-gray-200 text-sm text-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Hasta</label>
            <input type="date" value={filters.fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full border border-gray-200 text-sm text-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all" />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleSearch} className="inline-flex items-center gap-2 bg-[#1B7F4B] hover:bg-[#166340] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
            <Search size={16} /> Buscar
          </button>
          <button onClick={handleClear} className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-200 transition-colors">
            <RotateCcw size={16} /> Limpiar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Tipo de acción", "Descripción", "Operador", "Fecha", "Estado", "Acciones"].map((col) => (
                  <th key={col} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <EmptyState message="No se encontraron solicitudes con los criterios seleccionados" />
              ) : (
                filtered.map((s) => (
                  <>
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Badge label={s.tipo} variant={tipoVariant[s.tipo]} />
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs">
                        <p className="truncate">{s.descripcion}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.operador}</td>
                      <td className="px-4 py-3 text-gray-600 tabular-nums">
                        {new Date(s.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={s.estado} variant={estadoVariant[s.estado]} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {s.estado === "Pendiente" && (
                            <>
                              <button
                                onClick={() => setAprobarId(s.id)}
                                className="p-1.5 rounded-lg hover:bg-[#1B7F4B]/10 text-gray-400 hover:text-[#1B7F4B] transition-colors"
                                title="Aprobar"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => setRechazarId(s.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                title="Rechazar"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {s.estado === "Rechazada" && s.motivoRechazo && (
                            <button
                              onClick={() => setExpandidoId(expandidoId === s.id ? null : s.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Ver motivo"
                            >
                              <ChevronDown size={16} className={`transition-transform ${expandidoId === s.id ? "rotate-180" : ""}`} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandidoId === s.id && s.motivoRechazo && (
                      <tr key={`motivo-${s.id}`} className="bg-red-50">
                        <td colSpan={6} className="px-4 py-3">
                          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Motivo del rechazo</p>
                          <p className="text-sm text-red-700">{s.motivoRechazo}</p>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SolicitudesAdmin;