import { useState } from "react";
import { Plus, Search, Filter, Trash2, Edit2 } from "lucide-react";
import { useJac } from "../hooks/useJac";
import { useAsocomunalesForJac } from "../hooks/useAsocomunalesForJac";
import { ModalCrearJac } from "../components/ModalCrearJac";
import { ModalEditarJac } from "../components/ModalEditarJac";
import type { Jac } from "../types";

/**
 * Ejemplo de página de JACs que muestra cómo usar todos los componentes del módulo.
 * 
 * Funcionalidades:
 * - Listar JACs con filtros
 * - Crear nueva JAC
 * - Editar JAC existente
 * - Eliminar JAC (soft delete)
 * - Búsqueda por nombre, municipio y estado
 */
export default function JacPage() {
  const {
    jacs,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    createJac,
    updateJac,
    deleteJac,
  } = useJac();

  const { asocomunales, loading: loadingAsocomunales } = useAsocomunalesForJac();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJac, setEditingJac] = useState<Jac | null>(null);
  const [savingJac, setSavingJac] = useState(false);

  // Manejo de creación de JAC
  /*const handleCreate = async (data: any) => {
    setSavingJac(true);
    try {
      await createJac(data);
      console.log("JAC creada correctamente");
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating JAC:", err);
      alert("Error al crear JAC: " + (err instanceof Error ? err.message : "Error desconocido"));
    } finally {
      setSavingJac(false);
    }
  };
  */
 
const handleCreate = async (data: any) => {
  try {
    console.log("INTENTANDO CREAR:", data);

    await createJac(data);

    console.log("JAC creada correctamente");

    setShowCreateModal(false);
  } catch (error) {
    console.error("Error en handleCreate:", error);
  }
};

  // Manejo de edición de JAC
  const handleUpdate = async (id: number, data: any) => {
    setSavingJac(true);
    try {
      await updateJac(id, data);
      setEditingJac(null);
    } catch (err) {
      console.error("Error updating JAC:", err);
      alert("Error al actualizar JAC: " + (err instanceof Error ? err.message : "Error desconocido"));
    } finally {
      setSavingJac(false);
    }
  };

  // Manejo de eliminación de JAC
  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Está seguro que desea desactivar la JAC "${nombre}"?`)) {
      return;
    }

    try {
      await deleteJac(id);
    } catch (err) {
      console.error("Error deleting JAC:", err);
      alert("Error al eliminar JAC: " + (err instanceof Error ? err.message : "Error desconocido"));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Juntas de Acción Comunal
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Administre y consulte la información de las JAC del departamento
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
          <Filter size={16} />
          FILTROS DE BÚSQUEDA
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda por nombre */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Buscar por nombre o barrio/vereda...
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={filters.nombre}
                onChange={(e) => updateFilters({ nombre: e.target.value })}
                placeholder="Buscar..."
                className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Filtro por municipio */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Municipio
            </label>
            <input
              type="text"
              value={filters.municipio}
              onChange={(e) => updateFilters({ municipio: e.target.value })}
              placeholder="Todos los municipios"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Estado
            </label>
            <select
              value={filters.estado}
              onChange={(e) => updateFilters({ estado: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            >
              <option value="">Todos los estados</option>
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
            </select>
          </div>

          {/* Botón limpiar filtros */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Botón crear JAC */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B7F4B] text-white rounded-lg hover:bg-[#1B7F4B]/90 transition-colors"
        >
          <Plus size={20} />
          Crear nueva JAC
        </button>
      </div>

      {/* Tabla de JACs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando JACs...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : jacs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron JACs</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre de la JAC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Municipio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Barrio/Vereda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {jacs.map((jac) => (
                <tr key={jac.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {jac.nombreCompleto}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {jac.municipioNombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {jac.barrio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        jac.estadoLabel === "Activa"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {jac.estadoLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingJac(jac)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(jac.id, jac.nombreCompleto)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modales */}
      {showCreateModal && (
        <ModalCrearJac
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
          asocomunales={asocomunales}
          loading={savingJac || loadingAsocomunales}
        />
      )}

      {editingJac && (
        <ModalEditarJac
          onClose={() => setEditingJac(null)}
          onSave={handleUpdate}
          asocomunales={asocomunales}
          jac={editingJac}
          loading={savingJac || loadingAsocomunales}
        />
      )}
    </div>
  );
}