import { Plus, RotateCcw, Ellipsis, CircleEllipsis, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import { ModalCrearJac } from "../components/ui/ModalCrearJac";
import { useJac, columns, docVariant, orgVariant, aprobVariant, type EstadoDocumental, type EstadoOrganizativo } from "../hooks/useJac";
import { useAuth } from "../context/AuthContext";
import { JACService } from "../modules/jac/services/jacService";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const card      = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";
const selectCls = "appearance-none w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer";
const inputCls  = "w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all";

function Jac() {
  const {
    filters, filtered, loading, error, refetch, handleClear, totalLoaded,
    setBusqueda, setMunicipio, setEstado, setDocumental, setMinAfiliados, setLimite,
  } = useJac();

  const navigate = useNavigate();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [jacAEditar, setJacAEditar] = useState<any>(null);

  const canViewAfiliados = user?.rol === "admin" || user?.rol === "operador";
  const canDelete        = user?.rol === "admin";
  const canCreate        = user?.rol === "admin";

  const visibleColumns = canViewAfiliados
    ? columns
    : columns.filter((col) => col !== "Acciones");

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
              setJacAEditar(null);
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
          initialData={jacAEditar}
          onClose={() => {
            setShowModal(false);
            setJacAEditar(null);
          }}
          onSave={async (nueva) => {
            try {
              if (user?.rol === "admin") {
                const dto = {
                  nombreCompleto: nueva.nombre,
                  nombreCorto:    nueva.barrio,
                  asocomunalId:   nueva.asocomunalId,
                };

                if (jacAEditar) {
                  await JACService.update(jacAEditar.id, dto);
                  await Swal.fire({
                    icon: "success",
                    title: "¡Actualizado!",
                    text: "La JAC ha sido actualizada correctamente.",
                    timer: 2000
                  });
                } else {
                  await JACService.create(dto);
                  await Swal.fire({
                    icon: "success",
                    title: "¡Creado!",
                    text: "La JAC ha sido creada correctamente.",
                    timer: 2000
                  });
                }
                refetch();
              } else {
                await Swal.fire({
                  icon: "info",
                  title: "Modo Operador",
                  text: "La funcionalidad de propuestas para JACs se implementará en el siguiente paso.",
                });
              }
              setShowModal(false);
              setJacAEditar(null);
            } catch (err: any) {
              console.error("Error al procesar JAC:", err);
              await Swal.fire({ icon: "error", title: "Error", text: "No se pudo completar la operación." });
            }
          }}
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
          <select value={filters.municipio} onChange={(e) => setMunicipio(e.target.value)} className={selectCls}>
            <option value="">Todos los municipios</option>
            <option value="Popayán">Popayán</option>
            <option value="Santander">Santander</option>
            <option value="Patía">Patía</option>
            <option value="Timbío">Timbío</option>
            <option value="Piendamó">Piendamó</option>
          </select>
          <select value={filters.estado} onChange={(e) => setEstado(e.target.value as EstadoOrganizativo | "")} className={selectCls}>
            <option value="">Todos los estados</option>
            <option value="Activa">Activa</option>
            <option value="Inactiva">Inactiva</option>
          </select>
          <select value={filters.documental} onChange={(e) => setDocumental(e.target.value as EstadoDocumental | "")} className={selectCls}>
            <option value="">Todos los estados documentales</option>
            <option value="Vigente">Vigente</option>
            <option value="Por vencer">Por vencer</option>
            <option value="Vencida">Vencida</option>
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
            title="Cantidad máxima de JAC a cargar"
          >
            <option value={50}>Cargar hasta 50 JAC</option>
            <option value={100}>Cargar hasta 100 JAC</option>
            <option value={200}>Cargar hasta 200 JAC</option>
            <option value={500}>Cargar hasta 500 JAC</option>
            <option value={1000}>Cargar hasta 1 000 JAC</option>
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
          className={`rounded-lg px-4 py-2.5 text-sm font-medium mb-4 border ${
            totalLoaded <= 100
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              : totalLoaded <= 500
              ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          }`}
        >
          {totalLoaded === 0
            ? "No se encontraron JAC con los criterios seleccionados."
            : totalLoaded <= 100
            ? `Se cargaron ${totalLoaded} JAC correctamente.`
            : totalLoaded <= 500
            ? `Se cargaron ${totalLoaded} JAC. Considere aplicar filtros para reducir la cantidad de registros.`
            : `Se cargaron ${totalLoaded} JAC. Se recomienda limitar la cantidad de JAC cargadas para mejorar el rendimiento.`}
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
                    <td className="px-4 py-3"><Badge label={jac.documental}   variant={docVariant[jac.documental]} /></td>
                    <td className="px-4 py-3"><Badge label={jac.organizativo} variant={orgVariant[jac.organizativo]} /></td>
                    
                    {canViewAfiliados && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setJacAEditar(jac);
                              setShowModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Editar"
                          >
                            <Pencil size={20} />
                          </button>

                          <button
                            onClick={() => navigate(`/jac/${jac.id}`)}
                            className="p-1.5 rounded-lg hover:bg-[#1B7F4B]/10 dark:hover:bg-[#1B7F4B]/20 text-gray-500 dark:text-gray-400 hover:text-[#1B7F4B] dark:hover:text-emerald-400 transition-colors"
                            title="Ver detalle"
                          >
                            <Ellipsis size={20} />
                          </button>
                          {canDelete && (
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={20} />
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