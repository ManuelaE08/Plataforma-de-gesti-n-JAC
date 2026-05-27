import { Plus, RotateCcw, Ellipsis, Edit, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import { OrganizativoStatus } from "../components/ui/OrganizativoStatus";
import EmptyState from "../components/ui/EmptyState";
import { ModalCrearJac } from "../components/ui/ModalCrearJac";
import { ModalEditarJac } from "../modules/jac/components/ModalEditarJac";
import MunicipioCombobox from "../components/ui/MunicipioCombobox";
import { useJac, columns, type EstadoDocumental, type EstadoOrganizativo } from "../hooks/useJac";
import { useAuth } from "../context/AuthContext";
import { JACService } from "../modules/jac/services/jacService";
import { SolicitudesService } from "../modules/solicitudes/services/solicitudes.service";
import { useSolicitudes } from "../modules/solicitudes/hooks/useSolicitudes";
import { Permissions } from "../utils/permissions";
import type { UpdateJACDto, JacItem } from "../modules/jac/types";
import type { Asocomunal } from "../modules/asocomunales/types";

const card = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";
const selectCls = "appearance-none w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer";
const inputCls = "w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all";

function Jac() {
  const {
    filters, filtered, loading, error, refetch, handleClear, totalLoaded,
    setBusqueda, setMunicipio, setEstado, setMinAfiliados, setLimite, setDocumental,
  } = useJac();

  const navigate = useNavigate();
  const { user } = useAuth();
  const { crearSolicitud: proponerCambio } = useSolicitudes(true);

  const [showModal, setShowModal] = useState(false);
  const [editingJac, setEditingJac] = useState<JacItem | null>(null);
  const [asocomunales, setAsocomunales] = useState<Asocomunal[]>([]);
  const [fetchingJac, setFetchingJac] = useState(false);

  const esAdmin = user?.rol === "admin" || user?.rol === "superadmin";
  const canViewAfiliados = esAdmin || user?.rol === "operador";
  const canCreate = esAdmin || user?.rol === "operador";
  const canEdit = esAdmin || user?.rol === "operador";

  // Obtener asocomunales disponibles
  useEffect(() => {
    const fetchAsocomunales = async () => {
      try {
        const data = await JACService.getAsocomunalesReplica();
        setAsocomunales(data);
      } catch (err) {
        console.error("Error al obtener asocomunales:", err);
      }
    };
    fetchAsocomunales();
  }, []);

  // Obtener JAC completa para edición
  const handleOpenEditModal = async (id: number) => {
    setFetchingJac(true);
    try {
      const jac = await JACService.findOne(id);
      setEditingJac(jac);
    } catch (err) {
      console.error("Error al obtener la JAC:", err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar los datos de la JAC",
        confirmButtonColor: "#1B7F4B"
      });
    } finally {
      setFetchingJac(false);
    }
  };

  const handleSaveEdit = async (id: number, jac: UpdateJACDto) => {
    try {
      // Enriquecer ambos payloads con información para la auditoría
      const payloadAudit: any = { ...jac };
      if (jac.asocomunalId) {
        const aso = asocomunales.find(a => a.id === jac.asocomunalId);
        if (aso) payloadAudit.asocomunalId_nombre = aso.nombre;
      }

      // Enriquecer payloadAnterior con nombre de asocomunal si aplica
      const payloadAnteriorAudit: any = { ...editingJac };
      if (editingJac?.asocomunalId) {
        const aso = asocomunales.find(a => a.id === editingJac.asocomunalId);
        if (aso) {
          payloadAnteriorAudit.asocomunalId_nombre = aso.nombre;
        }
      }

      if (Permissions.isAdmin(user)) {
        await JACService.update(id, jac);
        // Log fire-and-forget en auditoría (no bloquea la UI)
        // Usar payloadAnteriorAudit enriquecido con nombres
        SolicitudesService.registrarAccionAdmin({
          entidadAfectada: "JAC",
          tipoAccion: "EDITAR",
          entidadId: String(id),
          payloadAnterior: payloadAnteriorAudit,  // JAC completa con nombres enriquecidos
          payloadDeseado: payloadAudit,
        }).catch(err => console.warn("[Auditoría] No se pudo registrar el log:", err));
        await Swal.fire({
          icon: "success",
          title: "JAC actualizada",
          text: "La actualización se guardó correctamente.",
          confirmButtonColor: "#1B7F4B",
          timer: 2500,
          timerProgressBar: true
        });
      } else {
        // Usamos editingJac como payloadAnterior (tiene todos los campos)
        await proponerCambio("JAC", "EDITAR", payloadAudit, editingJac, String(id));
        await Swal.fire({
          icon: "info",
          title: "Propuesta enviada",
          text: "Tu propuesta de edición ha sido enviada para revisión del administrador.",
          confirmButtonColor: "#1B7F4B"
        });
      }
      setEditingJac(null);
      refetch();
    } catch (err: unknown) {
      console.error("Error al procesar la JAC:", err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err instanceof Error ? err.message : "No se pudo procesar la acción.",
        confirmButtonColor: "#1B7F4B"
      });
    }
  };

  const visibleColumns = canViewAfiliados
    ? columns
    : columns.filter((col) => col !== "Opciones");

  return (
    <div>
      <PageHeader
        title="Juntas de Acción Comunal"
        subtitle="Gestión de Juntas de Acción Comunal"
        description="Administre y consulte la información de las JAC del departamento"
      >
        {canCreate && (
          <button
            onClick={() => {
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-[#1B7F4B] hover:bg-[#166340] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0"
          >
            <Plus size={16} /> Crear nueva JAC
          </button>
        )}
      </PageHeader>

      {showModal && (
        <ModalCrearJac
          onClose={() => setShowModal(false)}
          onSave={() => refetch()}
        />
      )}

      {editingJac && (
        <ModalEditarJac
          jac={editingJac}
          asocomunales={asocomunales}
          onClose={() => setEditingJac(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Filtros */}
      <div className={`${card} p-4 mb-4`}>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Filtros de búsqueda
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SearchBar
            placeholder="Buscar por nombre o barrio/vereda..."
            value={filters.busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <MunicipioCombobox value={filters.municipio} onChange={setMunicipio} />
          <select value={filters.estado} onChange={(e) => setEstado(e.target.value as EstadoOrganizativo | "")} className={selectCls}>
            <option value="">Todos los estados</option>
            <option value="Activa">Activa</option>
            <option value="Inactiva">Inactiva</option>
            <option value="Cancelada">Cancelada</option>
          </select>
          <select value={filters.documental} onChange={(e) => setDocumental(e.target.value as EstadoDocumental | "")} className={selectCls}>
            <option value="">Todos los estados documentales</option>
            <option value="Vigente">Con RUC</option>
            <option value="Vencida">Sin RUC</option>
          </select>
          <input
            type="number"
            placeholder="Número mínimo de afiliados"
            value={filters.minAfiliados}
            onChange={(e) => setMinAfiliados(e.target.value)}
            className={inputCls}
          />
          <select
            value={filters.limite}
            onChange={(e) => setLimite(Number(e.target.value))}
            className={selectCls}
            title="Cantidad máxima de JAC a Mostrar"
          >
            <option value={50}>Mostrar hasta 50 JAC</option>
            <option value={100}>Mostrar hasta 100 JAC</option>
            <option value={200}>Mostrar hasta 200 JAC</option>
            <option value={500}>Mostrar hasta 500 JAC</option>
            <option value={1000}>Mostrar hasta 1 000 JAC</option>
          </select>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
          >
            <RotateCcw size={16} /> Limpiar filtros
          </button>
        </div>
      </div>

      {/* Alerta de cantidad cargada */}
      {!loading && !error && (
        <div
          className={`rounded-lg px-4 py-2.5 text-sm font-medium mb-4 border ${totalLoaded <= 100
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
            : totalLoaded <= 500
              ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
            }`}
        >
          {totalLoaded === 0
            ? "No se encontraron JAC con los criterios seleccionados."
            : totalLoaded <= 100
              ? `Se Mostraron ${totalLoaded} JAC correctamente.`
              : totalLoaded <= 500
                ? `Se Mostraron ${totalLoaded} JAC. Considere aplicar filtros para reducir la cantidad de registros.`
                : `Se Mostraron ${totalLoaded} JAC. Se recomienda limitar la cantidad de JAC cargadas para mejorar el rendimiento.`}
        </div>
      )}

      {/* Tabla */}
      <div className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {visibleColumns.map((col) => (
                  <th key={col} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={visibleColumns.length} className="px-4 py-8 text-center text-sm text-gray-400">Cargando JAC...</td></tr>
              ) : error ? (
                <tr><td colSpan={visibleColumns.length} className="px-4 py-8 text-center text-sm text-red-500">{error} — <button onClick={refetch} className="underline">Reintentar</button></td></tr>
              ) : filtered.length === 0 ? (
                <EmptyState message="No se encontraron JAC con los criterios seleccionados" />
              ) : (
                filtered.map((jac) => (
                  <tr key={jac.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                      {canViewAfiliados ? (
                        <button
                          onClick={() => navigate(`/jac/${jac.id}`)}
                          className="text-left hover:text-[#1B7F4B] dark:hover:text-emerald-400 transition-colors"
                        >
                          {jac.nombre}
                        </button>
                      ) : (
                        <span>{jac.nombre}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{jac.municipio}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{jac.barrio}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200 tabular-nums font-medium">{jac.afiliados}</td>
                    <td className="px-4 py-3">
                      <OrganizativoStatus
                        estado={
                          jac.organizativo === "Activa" ||
                            jac.organizativo === "Inactiva" ||
                            jac.organizativo === "Cancelada"
                            ? jac.organizativo
                            : "Inactiva"
                        }
                      />
                    </td>

                    {canViewAfiliados && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/jac/${jac.id}`)}
                            className="p-1.5 rounded-lg hover:bg-[#1B7F4B]/10 dark:hover:bg-[#1B7F4B]/20 text-gray-500 dark:text-gray-400 hover:text-[#1B7F4B] dark:hover:text-emerald-400 transition-colors"
                            title="Ver detalle"
                          >
                            <Ellipsis size={20} />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEditModal(jac.id)}
                              disabled={fetchingJac}
                              className="p-1.5 rounded-lg hover:bg-[#1B7F4B]/10 dark:hover:bg-[#1B7F4B]/20 text-gray-500 dark:text-gray-400 hover:text-[#1B7F4B] dark:hover:text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
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

export default Jac;