import { Plus, RotateCcw, UserRound, Edit } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";
import SearchBar from "../../../components/ui/SearchBar";
import EmptyState from "../../../components/ui/EmptyState";
import { ModalCrearAsocomunal } from "../components/ModalCrearAsocomunal";
import { ModalEditarAsocomunal } from "../components/ModalEditarAsocomunal";
import { useAsocomunales } from "../hooks/useAsocomunales";
import { useMunicipios } from "../hooks/useMunicipios";
import { useAuth } from "../../../context/AuthContext";
import { useSolicitudes } from "../../solicitudes/hooks/useSolicitudes";
import { SolicitudesService } from "../../solicitudes/services/solicitudes.service";
import type { Asocomunal, CreateAsocomunalDto, UpdateAsocomunalDto } from "../types";

const card = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";
const selectCls = "appearance-none w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer disabled:opacity-50";

/**
 * Componente principal para la gestión de Asocomunales.
 * 
 * Renderiza la lista de Asocomunales con filtros, modales para creación y edición,
 * y permite la gestión de su estado (activación/desactivación).
 */

function Asocomunales() {
  const {
    data, filtered, loading, error, filters, handleClear,
    setBusqueda, setMunicipio, setEstado,
    createAsocomunal, updateAsocomunal, toggleAsocomunalStatus,
  } = useAsocomunales();

  const { crearSolicitud: proponerCambio } = useSolicitudes(true); // true para que el operador solo vea lo suyo o nada (evita Forbidden)

  const { municipios, loading: municipiosLoading } = useMunicipios();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [editingAsocomunal, setEditingAsocomunal] = useState<Asocomunal | null>(null);
  const [creatingLoading, setCreatingLoading] = useState(false);

  const esAdmin = user?.rol === "admin" || user?.rol === "superadmin";
  const canViewActions = esAdmin || user?.rol === "operador";
  //Nuevo cambio, se permite la creacion de asocomunales por parte de los operadores
  const canCreate = esAdmin || user?.rol === "operador";

  const canDirectEdit = esAdmin;

  const handleSaveEdit = async (id: number, asoc: CreateAsocomunalDto | UpdateAsocomunalDto) => {
    try {
      if (esAdmin) {
        const currentAsoc = data.find(a => a.id === id);
        await updateAsocomunal(id, asoc as UpdateAsocomunalDto);
        // Log fire-and-forget en auditoría (no bloquea la UI)
        SolicitudesService.registrarAccionAdmin({
          entidadAfectada: "ASOCOMUNAL",
          tipoAccion: "EDITAR",
          entidadId: String(id),
          payloadAnterior: currentAsoc,
          payloadDeseado: asoc,
        }).catch(err => console.warn("[Auditoría] No se pudo registrar el log:", err));
        await Swal.fire({ icon: "success", title: "Asocomunal actualizada", text: "La actualización se guardó correctamente.", confirmButtonColor: "#1B7F4B", timer: 2500, timerProgressBar: true });
      } else {
        // Buscamos la asocomunal actual para enviarla como payloadAnterior
        const currentAsoc = data.find(a => a.id === id);
        await proponerCambio("ASOCOMUNAL", "EDITAR", asoc, currentAsoc, String(id));
        await Swal.fire({ icon: "info", title: "Propuesta enviada", text: "Tu propuesta de edición ha sido enviada para revisión del administrador.", confirmButtonColor: "#1B7F4B" });
      }
      setEditingAsocomunal(null);
    } catch (err: unknown) {
      console.error("Error al procesar la asocomunal:", err);
      await Swal.fire({ icon: "error", title: "Error", text: err instanceof Error ? err.message : "No se pudo procesar la acción.", confirmButtonColor: "#1B7F4B" });
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const actionText = currentStatus ? "desactivar" : "activar";
    const result = await Swal.fire({
      title: "¿Estás seguro?", text: `¿Deseas ${actionText} esta asocomunal?`, icon: "warning",
      showCancelButton: true, confirmButtonColor: currentStatus ? "#d33" : "#1B7F4B",
      cancelButtonColor: "#6b7280", confirmButtonText: `Sí, ${actionText}`, cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        if (esAdmin) {
          await toggleAsocomunalStatus(id, !currentStatus);
          // Log fire-and-forget en auditoría solo si es admin
          SolicitudesService.registrarAccionAdmin({
            entidadAfectada: "ASOCOMUNAL",
            tipoAccion: currentStatus ? "DESACTIVAR" : "ACTIVAR",
            entidadId: String(id),
            payloadDeseado: { estado: !currentStatus },
          }).catch(err => console.warn("[Auditoría] No se pudo registrar el log:", err));

          await Swal.fire({
            title: "¡Éxito!",
            text: `La asocomunal fue ${currentStatus ? "desactivada" : "activada"} correctamente.`,
            icon: "success",
            confirmButtonColor: "#1B7F4B",
            timer: 2000,
            timerProgressBar: true
          });
        } else {
          // Si es operador, propone el cambio
          const currentAsoc = data.find(a => a.id === id);
          const tipoAccion = currentStatus ? "DESACTIVAR" : "ACTIVAR";
          
          await proponerCambio(
            "ASOCOMUNAL",
            tipoAccion as any,
            { estado: !currentStatus },
            currentAsoc,
            String(id)
          );

          await Swal.fire({
            icon: "info",
            title: "Solicitud enviada",
            text: `Tu solicitud para ${actionText} esta asocomunal ha sido enviada para revisión.`,
            confirmButtonColor: "#1B7F4B"
          });
        }
      } catch (err: unknown) {
        console.error(`Error al ${actionText} la asocomunal:`, err);
        await Swal.fire({
          title: "Error",
          text: `Hubo un problema al intentar ${actionText} la asocomunal.`,
          icon: "error",
          confirmButtonColor: "#1B7F4B"
        });
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="Asocomunales"
        subtitle="Gestión de asociaciones comunales"
        description="Administre y consulte la información de las asocomunales registradas"
      >
        {canCreate && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#1B7F4B] hover:bg-[#166340] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0">
            <Plus size={16} /> Crear nueva Asocomunal
          </button>
        )}
      </PageHeader>


      {showModal && (
        <ModalCrearAsocomunal
          municipios={municipios}
          loading={creatingLoading}
          onClose={() => setShowModal(false)}
          onSave={async (nueva: CreateAsocomunalDto | UpdateAsocomunalDto) => {
            try {
              setCreatingLoading(true);
              if (esAdmin) {
                await createAsocomunal(nueva as CreateAsocomunalDto);
                // Log fire-and-forget en auditoría
                SolicitudesService.registrarAccionAdmin({
                  entidadAfectada: "ASOCOMUNAL",
                  tipoAccion: "CREAR",
                  payloadDeseado: nueva,
                }).catch(err => console.warn("[Auditoría] No se pudo registrar el log:", err));
                await Swal.fire({ icon: "success", title: "Asocomunal creada", text: "La nueva asocomunal ha sido registrada correctamente.", confirmButtonColor: "#1B7F4B", timer: 2500, timerProgressBar: true });
              } else {
                await proponerCambio("ASOCOMUNAL", "CREAR", nueva);
                await Swal.fire({ icon: "info", title: "Propuesta enviada", text: "Tu solicitud de creación ha sido enviada al administrador.", confirmButtonColor: "#1B7F4B" });
              }
              setShowModal(false);
            } catch (error: unknown) {
              await Swal.fire({ icon: "error", title: "Error", text: error instanceof Error ? error.message : "No se pudo procesar la solicitud.", confirmButtonColor: "#1B7F4B" });
            } finally {
              setCreatingLoading(false);
            }
          }}
        />
      )}

      {editingAsocomunal && (
        <ModalEditarAsocomunal
          asocomunal={editingAsocomunal}
          municipios={municipios}
          loading={creatingLoading}
          onClose={() => setEditingAsocomunal(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Estado carga */}
      {loading && (
        <div className={`${card} p-4 mb-4`}>
          <p className="text-center text-gray-500 dark:text-gray-400">Cargando asocomunales...</p>
        </div>
      )}

      {/* Estado error */}
      {error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-red-200 dark:border-red-700/50 mb-4">
          <p className="text-center text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <div className={`${card} p-4 mb-4`}>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Filtros de búsqueda
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SearchBar
            placeholder="Buscar por nombre..."
            value={filters.busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            value={filters.municipio ?? ""}
            onChange={(e) => setMunicipio(e.target.value ? Number(e.target.value) : null)}
            className={selectCls}
            disabled={municipiosLoading}
          >
            <option value="">Todos los municipios</option>
            {municipios.map((mun) => <option key={mun.id} value={mun.id}>{mun.nombre}</option>)}
          </select>
          <select
            value={filters.estado === null ? "" : filters.estado.toString()}
            onChange={(e) => setEstado(e.target.value ? e.target.value === "true" : null)}
            className={selectCls}
          >
            <option value="">Todos los estados</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleClear} className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
            <RotateCcw size={16} /> Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {["Nombre", "Municipio", "Presidente", "Contacto", "Estado", ...(canViewActions ? ["Acciones"] : [])].map((col) => (
                  <th key={col} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <EmptyState message="No se encontraron asocomunales con los criterios seleccionados" />
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{item.nombre}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.municipio.nombre}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.presidente || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {item.telefono
                        ? <button className="text-[#1B7F4B] dark:text-emerald-400 hover:underline">{item.telefono}</button>
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={item.estado ? "Activo" : "Inactivo"} variant={item.estado ? "green" : "gray"} />
                    </td>
                    {canViewActions && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/asocomunales/${item.id}`)}
                            className="p-1.5 rounded-lg hover:bg-[#1B7F4B]/10 dark:hover:bg-[#1B7F4B]/20 text-gray-500 dark:text-gray-400 hover:text-[#1B7F4B] dark:hover:text-emerald-400 transition-colors"
                            title="Ver detalle"
                          >
                            <UserRound size={15} />
                          </button>
                          {canCreate && (
                            <button
                              onClick={() => setEditingAsocomunal(item)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                              title="Editar"
                            >
                              <Edit size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStatus(item.id, item.estado)}
                            className={`p-1.5 rounded-lg transition-colors ${item.estado
                              ? "hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                              : "hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400"
                              }`}
                            title={item.estado ? "Desactivar" : "Activar"}
                          >
                            <RotateCcw size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Asocomunales;