import { Plus, ChevronDown } from "lucide-react";
import { useState } from "react";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { ModalCrearSolicitud } from "../components/ui/ModalCrearSolicitud";
import { useSolicitudes, estadoVariant, tipoVariant } from "../hooks/useSolicitudes";
import { useAuth } from "../context/AuthContext";

function MisSolicitudes() {
  const { user } = useAuth();
  const { filtered, crearSolicitud } = useSolicitudes(user?.id);

  const [showModal, setShowModal] = useState(false);
  const [expandidoId, setExpandidoId] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("");

  const filtradas = filtroEstado
    ? filtered.filter((s) => s.estado === filtroEstado)
    : filtered;

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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Tipo de acción", "Descripción", "Fecha", "Estado", ""].map((col, i) => (
                  <th key={i} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <EmptyState message="No tienes solicitudes registradas aún" />
              ) : (
                filtradas.map((s) => (
                  <>
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Badge label={s.tipo} variant={tipoVariant[s.tipo]} />
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs">
                        <p className="truncate">{s.descripcion}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 tabular-nums">
                        {new Date(s.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={s.estado} variant={estadoVariant[s.estado]} />
                      </td>
                      <td className="px-4 py-3">
                        {s.estado === "Rechazada" && s.motivoRechazo && (
                          <button
                            onClick={() => setExpandidoId(expandidoId === s.id ? null : s.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Ver motivo de rechazo"
                          >
                            <ChevronDown size={16} className={`transition-transform ${expandidoId === s.id ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandidoId === s.id && s.motivoRechazo && (
                      <tr key={`motivo-${s.id}`} className="bg-red-50">
                        <td colSpan={5} className="px-4 py-3">
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

export default MisSolicitudes;