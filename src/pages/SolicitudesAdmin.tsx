import { Search, RotateCcw, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { ModalRechazar } from "../components/ui/ModalRechazar";
import { useSolicitudes, estadoVariant, tipoVariant, type TipoAccion, type EstadoSolicitud, type CambioCampo, type SolicitudItem, } from "../hooks/useSolicitudes";

function TablaCambios({ cambios, tipo }: { cambios: CambioCampo[]; tipo: SolicitudItem["tipo"] }) {
  const esEdicion = tipo.startsWith("Editar");
  return (
    <table className="w-full text-xs border border-gray-100 rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider">
          <th className="text-left px-3 py-2 font-semibold">Campo</th>
          {esEdicion && <th className="text-left px-3 py-2 font-semibold">Valor anterior</th>}
          <th className="text-left px-3 py-2 font-semibold">Valor nuevo</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {cambios.map((c, i) => (
          <tr key={i} className="bg-white">
            <td className="px-3 py-2 text-gray-600 font-medium">{c.campo}</td>
            {esEdicion && <td className="px-3 py-2 text-red-500">{c.valorAnterior ?? "—"}</td>}
            <td className="px-3 py-2 text-[#1B7F4B] font-medium">{c.valorNuevo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

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

  const [rechazarId, setRechazarId]   = useState<number | null>(null);
  const [aprobarId,  setAprobarId]    = useState<number | null>(null);
  const [expandidoId, setExpandidoId] = useState<number | null>(null);

  const pendientes = filtered.filter((s) => s.estado === "Pendiente").length;
  const toggle = (id: number) => setExpandidoId((prev) => (prev === id ? null : id));

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

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filtros</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select value={filters.estado} onChange={(e) => setEstado(e.target.value)}
            className="appearance-none w-full border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer">
            <option value="">Todos los estados</option>
            {(["Pendiente", "Aprobada", "Rechazada"] as EstadoSolicitud[]).map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <select value={filters.tipo} onChange={(e) => setTipo(e.target.value)}
            className="appearance-none w-full border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer">
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" placeholder="Buscar por operador..." value={filters.operador}
            onChange={(e) => setOperador(e.target.value)}
            className="w-full border border-gray-200 text-sm text-gray-600 placeholder:text-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all" />
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

      {/* Lista tarjetas */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 flex flex-col items-center">
            <EmptyState message="No se encontraron solicitudes con los criterios seleccionados" />
          </div>
        ) : (
          filtered.map((s) => {
            const expandida = expandidoId === s.id;
            const esPendiente = s.estado === "Pendiente";
            const badgeTipo = s.tipo.startsWith("Crear")
              ? "Nuevo Registro"
              : s.tipo.startsWith("Editar")
              ? "Modificación"
              : "Eliminación";

            return (
              <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Cabecera */}
                <div className="flex items-start justify-between gap-4 px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800">{s.descripcion}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        badgeTipo === "Nuevo Registro" ? "bg-green-100 text-green-700"
                        : badgeTipo === "Modificación" ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-600"
                      }`}>
                        {badgeTipo}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                        {s.entidad}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>Enviado por: <span className="text-gray-600 font-medium">{s.operador}</span></span>
                      <span>{new Date(s.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge label={s.estado} variant={estadoVariant[s.estado]} />
                    <button onClick={() => toggle(s.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
                      {expandida ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Detalle expandible */}
                {expandida && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2">
                      Cambios propuestos
                    </p>
                    <TablaCambios cambios={s.cambios} tipo={s.tipo} />

                    {s.estado === "Rechazada" && s.motivoRechazo && (
                      <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                        <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600">
                          <span className="font-semibold">Motivo: </span>{s.motivoRechazo}
                        </p>
                      </div>
                    )}

                    {esPendiente && (
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => setRechazarId(s.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition"
                        >
                          <XCircle size={14} /> Rechazar
                        </button>
                        <button
                          onClick={() => setAprobarId(s.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#1B7F4B] hover:bg-[#166040] transition"
                        >
                          <CheckCircle size={14} /> Aprobar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default SolicitudesAdmin;