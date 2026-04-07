import { Plus, RotateCcw, UserRound, Edit } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";
import SearchBar from "../../../components/ui/SearchBar";
import EmptyState from "../../../components/ui/EmptyState";
import { ModalCrearAsocomunal } from "../components/ModalCrearAsocomunal";
import { ModalEditarAsocomunal } from "../components/ModalEditarAsocomunal";
import { useAsocomunales } from "../hooks/useAsocomunales";
import { useMunicipios } from "../hooks/useMunicipios";
import { useAuth } from "../../../context/AuthContext";

function Asocomunales() {
  const {
    filtered, loading, error, filters, handleClear,
    setBusqueda, setMunicipio, setEstado,
    createAsocomunal, updateAsocomunal, toggleAsocomunalStatus,
  } = useAsocomunales();

  const { municipios, loading: municipiosLoading } = useMunicipios();

  const navigate = useNavigate();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingAsocomunal, setEditingAsocomunal] = useState(null);
  const [creatingLoading, setCreatingLoading] = useState(false);

  const canViewActions = user?.rol === "admin" || user?.rol === "operador";
  const canCreate = user?.rol === "admin" || user?.rol === "operador";

  const handleEdit = (asocomunal) => {
    setEditingAsocomunal(asocomunal);
  };

  const handleSaveEdit = async (id, updates) => {
    try {
      await updateAsocomunal(id, updates);
      setEditingAsocomunal(null);
    } catch (err) {
      alert("Error al actualizar la asocomunal");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleAsocomunalStatus(id, !currentStatus);
    } catch (err) {
      alert(`Error al ${currentStatus ? "desactivar" : "activar"} la asocomunal`);
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
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#1B7F4B] hover:bg-[#166340] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0"
          >
            <Plus size={16} />
            Crear nueva Asocomunal
          </button>
        )}
      </PageHeader>

      {showModal && (
        <ModalCrearAsocomunal
          municipios={municipios}
          loading={creatingLoading}
          onClose={() => setShowModal(false)}
          onSave={async (nueva) => {
            try {
              setCreatingLoading(true);
              await createAsocomunal(nueva);
              setShowModal(false);
            } catch (error) {
              console.error("Error creando asocomunal:", error);
              // TODO: mostrar error al usuario
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
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
          <p className="text-center text-gray-500">Cargando asocomunales...</p>
        </div>
      )}

      {error && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-200 mb-4">
          <p className="text-center text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Filtros de búsqueda
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SearchBar
            placeholder="Buscar por nombre..."
            value={filters.busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <select
            value={filters.municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            className="appearance-none w-full bg-white border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer disabled:opacity-50"
            disabled={municipiosLoading}
          >
            <option value="">Todos los municipios</option>
            {municipios.map((mun) => (
              <option key={mun.id} value={mun.id}>
                {mun.nombre}
              </option>
            ))}
          </select>

          <select
            value={filters.estado}
            onChange={(e) => setEstado(e.target.value)}
            className="appearance-none w-full bg-white border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-200 transition-colors"
          >
            <RotateCcw size={16} />
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                  Nombre
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                  Municipio
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                  Presidente
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                  Contacto
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                  Estado
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                  JACs
                </th>
                {canViewActions && (
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <EmptyState message="No se encontraron asocomunales con los criterios seleccionados" />
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{item.municipio.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{item.presidente || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.telefono && <button className="text-[#1B7F4B] hover:underline">{item.telefono}</button>}
                      {!item.telefono && "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={item.estado ? "Activo" : "Inactivo"} variant={item.estado ? "green" : "gray"} />
                    </td>
                    <td className="px-4 py-3 text-gray-700 tabular-nums font-medium">{item.jacs?.length || 0}</td>
                    {canViewActions && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/asocomunales/${item.id}`)}
                            className="p-1.5 rounded-lg hover:bg-[#1B7F4B]/10 text-gray-500 hover:text-[#1B7F4B] transition-colors"
                            title="Ver detalle"
                          >
                            <UserRound size={15} />
                          </button>
                          {canCreate && (
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                              title="Editar"
                            >
                              <Edit size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStatus(item.id, item.estado)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              item.estado
                                ? "hover:bg-red-50 text-gray-400 hover:text-red-500"
                                : "hover:bg-green-50 text-gray-400 hover:text-green-500"
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