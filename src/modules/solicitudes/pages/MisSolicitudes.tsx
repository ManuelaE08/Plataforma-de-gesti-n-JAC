import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import { useSolicitudes, estadoVariant, type CambioCampo, type SolicitudItem } from "../hooks/useSolicitudes";
import { useAuth } from "../../../context/AuthContext";

const card = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";
const select = "appearance-none border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer";

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
            <td className="px-3 py-2 text-[#1B7F4B] dark:text-emerald-400 font-medium">{c.valorNuevo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MisSolicitudes() {
  const { user } = useAuth();
  const { filtered } = useSolicitudes(true);

  const [expandidoId, setExpandidoId] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("");

  const filtradas = filtroEstado ? filtered.filter((s) => s.estado === filtroEstado) : filtered;
  const toggle = (id: number) => setExpandidoId((prev) => (prev === id ? null : id));

  // Contadores para orientar al operador
  const pendientesCount = filtered.filter(s => s.estado === "Pendiente").length;
  const aprobadosCount = filtered.filter(s => s.estado === "Aprobada").length;
  const rechazadosCount = filtered.filter(s => s.estado === "Rechazada").length;

  return (
    <div>
      <PageHeader
        title="Mis Solicitudes"
        subtitle="Seguimiento de cambios propuestos"
        description="Consulte el estado de sus propuestas enviadas al administrador desde la vista de Asocomunales"
      >
        {/* Resumen rápido de estados */}
        <div className="flex items-center gap-2">
          {pendientesCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/40 text-xs font-semibold px-2.5 py-1 rounded-full">
              {pendientesCount} pendiente{pendientesCount > 1 ? "s" : ""}
            </span>
          )}
          {aprobadosCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/40 text-xs font-semibold px-2.5 py-1 rounded-full">
              {aprobadosCount} aprobada{aprobadosCount > 1 ? "s" : ""}
            </span>
          )}
          {rechazadosCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700/40 text-xs font-semibold px-2.5 py-1 rounded-full">
              {rechazadosCount} rechazada{rechazadosCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </PageHeader>

      {/* Filtro */}
      <div className={`${card} p-4 mb-4`}>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className={select}>
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobada">Aprobada</option>
          <option value="Rechazada">Rechazada</option>
        </select>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {filtradas.length === 0 ? (
          <div className={`${card} py-16 flex flex-col items-center text-center`}>
            <EmptyState message="No tienes solicitudes registradas. Crea o edita una Asocomunal para proponer cambios." />
          </div>
        ) : (
          filtradas.map((s) => {
            const expandida = expandidoId === s.id;
            const badgeTipo = s.tipo.startsWith("Crear") ? "Nuevo Registro"
              : s.tipo.startsWith("Editar") ? "Modificación"
              : s.tipo.startsWith("Eliminar") ? "Eliminación"
              : "Cambio de Estado";

            return (
              <div key={s.id} className={`${card} overflow-hidden`}>
                <div className="flex items-start justify-between gap-4 px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{s.descripcion}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        badgeTipo === "Nuevo Registro" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : badgeTipo === "Modificación" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : badgeTipo === "Eliminación" ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      }`}>
                        {badgeTipo}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {s.entidad}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-1 text-xs text-gray-400 dark:text-gray-500">
                      <span>{new Date(s.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      {s.revisadoPorAdmin && s.estado !== "Pendiente" && (
                        <span>
                          {s.estado === "Aprobada" ? " Aprobado por:" : " Rechazado por:"}
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
                      Cambios propuestos
                    </p>
                    <TablaCambios cambios={s.cambios} tipo={s.tipo} />
                    {s.estado === "Rechazada" && s.motivoRechazo && (
                      <div className="mt-3 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 rounded-lg px-3 py-2.5">
                        <p className="text-xs text-red-600 dark:text-red-400">
                          <span className="font-semibold">Motivo del rechazo: </span>{s.motivoRechazo}
                        </p>
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

export default MisSolicitudes;