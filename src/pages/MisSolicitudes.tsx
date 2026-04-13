import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { ModalCrearSolicitud } from "../components/ui/ModalCrearSolicitud";
import { useSolicitudes, estadoVariant, tipoVariant, type CambioCampo, type SolicitudItem } from "../hooks/useSolicitudes";
import { useAuth } from "../context/AuthContext";

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

function MisSolicitudes() {
  const { user } = useAuth();
  const { filtered, crearSolicitud } = useSolicitudes(user?.id);

  const [showModal, setShowModal] = useState(false);
  const [expandidoId, setExpandidoId] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("");

  const filtradas = filtroEstado
    ? filtered.filter((s) => s.estado === filtroEstado)
    : filtered;

  const toggle = (id: number) => setExpandidoId((prev) => (prev === id ? null : id));

  return (
    <div>
      <PageHeader
        title="Mis Solicitudes"
        subtitle="Seguimiento de solicitudes de cambio"
        description="Envíe y consulte el estado de sus solicitudes propuestas al administrador"
      >
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1B7F4B] hover:bg-[#166340] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0"
        >
          <Plus size={16} />
          Nueva solicitud
        </button>
      </PageHeader>

      {showModal && (
        <ModalCrearSolicitud
          onClose={() => setShowModal(false)}
          onSave={(datos) =>
            crearSolicitud({
              ...datos,
              operador: user?.nombre ?? "Operador",
              operadorId: user?.id ?? 0,
            })
          }
        />
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="appearance-none border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobada">Aprobada</option>
          <option value="Rechazada">Rechazada</option>
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {filtradas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 flex flex-col items-center text-center">
            <EmptyState message="No tienes solicitudes registradas aún" />
          </div>
        ) : (
          filtradas.map((s) => {
            const expandida = expandidoId === s.id;
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
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(s.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge label={s.estado} variant={estadoVariant[s.estado]} />
                    <button
                      onClick={() => toggle(s.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
                    >
                      {expandida ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Detalle */}
                {expandida && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2">
                      Cambios propuestos
                    </p>
                    <TablaCambios cambios={s.cambios} tipo={s.tipo} />
                    {s.estado === "Rechazada" && s.motivoRechazo && (
                      <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                        <p className="text-xs text-red-600">
                          <span className="font-semibold">Motivo del rechazo: </span>
                          {s.motivoRechazo}
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