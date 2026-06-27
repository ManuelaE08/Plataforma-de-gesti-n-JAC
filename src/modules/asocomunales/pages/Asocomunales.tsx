import { Plus, RotateCcw, Ellipsis, Edit, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { OrganizativoStatus } from "../../../components/ui/OrganizativoStatus";
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
import { Permissions } from "../../../utils/permissions";
import type { Asocomunal, CreateAsocomunalDto, UpdateAsocomunalDto } from "../types";

const card = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";

// Select optimizado a text-base con flecha nativa integrada vía SVG
const selectCls = "appearance-none w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-base text-gray-600 dark:text-gray-300 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#E4B400]/30 focus:border-[#E4B400] transition-all cursor-pointer disabled:opacity-50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat";

/**
 * Componente principal para la gestión de Asocomunales.
 */
function Asocomunales() {
  const {
    data, filtered, loading, error, filters, handleClear,
    setBusqueda, setMunicipio, setEstado,
    createAsocomunal, updateAsocomunal, toggleAsocomunalStatus,
  } = useAsocomunales();

  const { crearSolicitud: proponerCambio } = useSolicitudes(true);

  const { municipios, loading: municipiosLoading } = useMunicipios();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [editingAsocomunal, setEditingAsocomunal] = useState<Asocomunal | null>(null);
  const [creatingLoading, setCreatingLoading] = useState(false);

  const esAdmin = Permissions.isAdmin(user);
  const canViewActions = esAdmin || Permissions.isOperador(user);
  const canCreate = esAdmin || Permissions.isOperador(user);

  const handleSaveEdit = async (id: number, asoc: CreateAsocomunalDto | UpdateAsocomunalDto) => {
    try {
      const payloadAudit: any = { ...asoc };
      if (asoc.municipioId) {
        const muni = municipios.find(m => m.id === asoc.municipioId);
        if (muni) payloadAudit.municipioId_nombre = muni.nombre;
      }

      // Enriquecer payloadAnterior con nombre del municipio si aplica
      const currentAsoc = data.find(a => a.id === id);
      const payloadAnteriorAudit: any = { ...currentAsoc };
      if (currentAsoc?.municipio?.id) {
        // El municipio ya está disponible en currentAsoc.municipio
        payloadAnteriorAudit.municipioId = currentAsoc.municipio.id;
        payloadAnteriorAudit.municipioId_nombre = currentAsoc.municipio.nombre;
      }

      if (Permissions.isAdmin(user)) {
        await updateAsocomunal(id, asoc as UpdateAsocomunalDto);
        SolicitudesService.registrarAccionAdmin({
          entidadAfectada: "ASOCOMUNAL",
          tipoAccion: "EDITAR",
          entidadId: String(id),
          payloadAnterior: payloadAnteriorAudit,
          payloadDeseado: payloadAudit,
        }).catch(err => console.warn("[Auditoría] No se pudo registrar el log:", err));
        await Swal.fire({ icon: "success", title: "Asocomunal actualizada", text: "La actualización se guardó correctamente.", confirmButtonColor: "#E4B400", timer: 2500, timerProgressBar: true });
      } else {
        // Operador propone edición
        await proponerCambio("ASOCOMUNAL", "EDITAR", payloadAudit, payloadAnteriorAudit, String(id));
        await Swal.fire({ icon: "info", title: "Propuesta enviada", text: "Tu propuesta de edición ha sido enviada para revisión del administrador.", confirmButtonColor: "#E4B400" });
      }
      setEditingAsocomunal(null);
    } catch (err: unknown) {
      console.error("Error al procesar la asocomunal:", err);
      await Swal.fire({ icon: "error", title: "Error", text: err instanceof Error ? err.message : "No se pudo procesar la acción.", confirmButtonColor: "#E4B400" });
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const actionText = currentStatus ? "desactivar" : "activar";
    const result = await Swal.fire({
      title: "¿Estás seguro?", text: `¿Deseas ${actionText} esta asocomunal?`, icon: "warning",
      showCancelButton: true, confirmButtonColor: currentStatus ? "#d33" : "#E4B400",
      cancelButtonColor: "#6b7280", confirmButtonText: `Sí, ${actionText}`, cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      try {
        if (esAdmin) {
          await toggleAsocomunalStatus(id, !currentStatus);
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
            confirmButtonColor: "#E4B400",
            timer: 2000,
            timerProgressBar: true
          });
        } else {
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
            confirmButtonColor: "#E4B400"
          });
        }
      } catch (err: unknown) {
        console.error(`Error al ${actionText} la asocomunal:`, err);
        await Swal.fire({
          title: "Error",
          text: `Hubo un problema al intentar ${actionText} la asocomunal.`,
          icon: "error",
          confirmButtonColor: "#E4B400"
        });
      }
    }
  };

  const canViewConfidential = Permissions.canViewConfidential(user);

  const headers = canViewConfidential
    ? ["Nombre", "Municipio", "Presidente", "Contacto", "Estado", ...(canViewActions ? ["Acciones"] : [])]
    : ["Nombre", "Municipio", "Estado"];

  return (
    <div>
      <PageHeader
        title="Asocomunales"
        subtitle="Gestión de asociaciones comunales"
        description="Administre y consulte la información de las asocomunales registradas"
      >
        {canCreate && (
          /* Botón ajustado con fuente text-base e icono size={18} */
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#E4B400] hover:bg-[#cfa200] text-white text-base font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0 shadow-sm">
            <Plus size={18} /> Crear nueva Asocomunal
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
              // Enriquecer el payload con el nombre del municipio para auditoría
              const payloadAudit: any = { ...nueva };
              if (nueva.municipioId) {
                const muni = municipios.find(m => m.id === nueva.municipioId);
                if (muni) payloadAudit.municipioId_nombre = muni.nombre;
              }

              if (esAdmin) {
                await createAsocomunal(nueva as CreateAsocomunalDto);
                SolicitudesService.registrarAccionAdmin({
                  entidadAfectada: "ASOCOMUNAL",
                  tipoAccion: "CREAR",
                  payloadDeseado: payloadAudit,
                }).catch(err => console.warn("[Auditoría] No se pudo registrar el log:", err));
                await Swal.fire({ icon: "success", title: "Asocomunal creada", text: "La nueva asocomunal ha sido registrada correctamente.", confirmButtonColor: "#E4B400", timer: 2500, timerProgressBar: true });
              } else {
                await proponerCambio("ASOCOMUNAL", "CREAR", payloadAudit);
                await Swal.fire({ icon: "info", title: "Propuesta enviada", text: "Tu solicitud de creación ha sido enviada al administrador.", confirmButtonColor: "#E4B400" });
              }
              setShowModal(false);
            } catch (error: unknown) {
              await Swal.fire({ icon: "error", title: "Error", text: error instanceof Error ? error.message : "No se pudo procesar la solicitud.", confirmButtonColor: "#E4B400" });
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

      {loading && (
        <div className={`${card} p-4 mb-4`}>
          <p className="text-center text-base text-gray-500 dark:text-gray-400">Cargando asocomunales...</p>
        </div>
      )}

      {error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-red-200 dark:border-red-700/50 mb-4">
          <p className="text-center text-base text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Filtros */}
{/* Filtros */}
      <div className={`${card} p-4 mb-4`}>
        {/* Label de sección adaptado a 'text-sm font-semibold uppercase' */}
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
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
            <option value="true">Activa</option>
            <option value="false">Inactiva</option>
          </select>
        </div>
        <div className="flex items-center gap-3 mt-4">
          {/* Botón limpiar filtros con texto base, icono size={18} y anillo de enfoque institucional */}
          <button 
            onClick={handleClear} 
            className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-base font-medium px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E4B400]/30 focus:border-[#E4B400]"
          >
            <RotateCcw size={18} /> Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
{/* Tabla */}
      <div className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          {/* El contenedor principal de la tabla cambia a text-base para las celdas */}
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {headers.map((col) => (
                  // Encabezados (<th>) adaptados a 'text-sm font-semibold uppercase'
                  <th key={col} className="text-left text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={headers.length} className="px-4 py-8 text-center text-base text-gray-400 dark:text-gray-500 animate-pulse">
                    Cargando asocomunales...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={headers.length} className="px-4 py-8 text-center text-base text-red-500 dark:text-red-400 font-medium">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="px-4 py-4">
                    <EmptyState message="No se encontraron asocomunales con los criterios seleccionados" />
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  // Celdas (<td>) heredan 'text-base' de la tabla, con estilos específicos para fuentes secundarias si aplica
                  <tr key={item.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                      {canViewConfidential ? (
                        <button
                          onClick={() => navigate(`/asocomunales/${item.id}`)}
                          className="text-left hover:text-[#E4B400] dark:hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E4B400]/30 rounded"
                        >
                          {item.nombre}
                        </button>
                      ) : (
                        <span>{item.nombre}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.municipio.nombre}</td>
                    
                    {canViewConfidential && (
                      <>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.presidente || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {item.telefono ? (
                            <div className="flex flex-col">
                              {item.telefono.split(/[,;]+/).map((tel, idx) => (
                                <span key={idx} className="text-[#E4B400] dark:text-yellow-400 font-medium">
                                  {tel.trim()}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                      </>
                    )}

                    <td className="px-4 py-3">
                      {/* El componente interno OrganizativoStatus debería renderizar texto con la clase 'text-sm font-medium' (Badges) */}
                      <OrganizativoStatus estado={item.estado} />
                    </td>

                    {canViewActions && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/asocomunales/${item.id}`)}
                            className="p-1.5 rounded-lg hover:bg-[#E4B400]/10 dark:hover:bg-[#E4B400]/20 text-gray-500 dark:text-gray-400 hover:text-[#E4B400] dark:hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E4B400]/30"
                            title="Ver detalle"
                          >
                            <Ellipsis size={20} />
                          </button>
                          
                          {canCreate && (
                            <button
                              onClick={() => setEditingAsocomunal(item)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleStatus(item.id, item.estado)}
                            className={`p-1.5 rounded-lg transition-colors focus:outline-none ${
                              item.estado
                                ? "hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 focus:ring-2 focus:ring-red-500/30"
                                : "hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 focus:ring-2 focus:ring-[#E4B400]/30"
                            }`}
                            title={item.estado ? "Desactivar" : "Activar"}
                          >
                            <RotateCcw size={20} />
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
      </div>
    </div>
  );
}

export default Asocomunales;