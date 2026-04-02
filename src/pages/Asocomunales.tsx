import { Plus, RotateCcw, UserRound, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import { ModalCrearAsocomunal } from "../components/ui/ModalCrearAsocomunal";
import {
  useAsocomunales, columns, docVariant, orgVariant, aprobVariant,
} from "../hooks/useAsocomunales";
import { useAuth } from "../context/AuthContext";

function Asocomunales() {
  const {
    filters, filtered, handleClear,
    setBusqueda, setMunicipio, setEstado, setDocumental, setMinAfiliadas,
  } = useAsocomunales();

  const navigate = useNavigate();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const canViewActions = user?.rol === "admin" || user?.rol === "operador";
  const canDelete      = user?.rol === "admin";
  const canCreate      = user?.rol === "admin" || user?.rol === "operador";

  const visibleColumns = canViewActions
    ? columns
    : columns.filter((col) => col !== "Acciones");

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
          onClose={() => setShowModal(false)}
          onSave={(nueva) => {
            console.log("Nueva Asocomunal:", nueva);
            // TODO: conectar con el backend o agregar al estado global
          }}
        />
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Filtros de búsqueda
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SearchBar
            placeholder="Buscar por nombre, municipio o cobertura..."
            value={filters.busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <select
            value={filters.municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            className="appearance-none w-full bg-white border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
          >
            <option value="">Todos los municipios</option>
            <option value="Popayán">Popayán</option>
            <option value="Santander de Quilichao">Santander de Quilichao</option>
            <option value="Patía">Patía</option>
            <option value="Timbío">Timbío</option>
            <option value="Piendamó">Piendamó</option>
            <option value="Miranda">Miranda</option>
          </select>

          <select
            value={filters.estado}
            onChange={(e) => setEstado(e.target.value)}
            className="appearance-none w-full bg-white border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="Activa">Activa</option>
            <option value="Inactiva">Inactiva</option>
          </select>

          <select
            value={filters.documental}
            onChange={(e) => setDocumental(e.target.value)}
            className="appearance-none w-full bg-white border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
          >
            <option value="">Todos los estados documentales</option>
            <option value="Vigente">Vigente</option>
            <option value="Por vencer">Por vencer</option>
            <option value="Vencida">Vencida</option>
          </select>

          <input
            type="number"
            placeholder="Número mínimo de JAC afiliadas"
            value={filters.minAfiliadas}
            onChange={(e) => setMinAfiliadas(e.target.value)}
            className="w-full bg-white border border-gray-200 text-sm text-gray-600 placeholder:text-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all"
          />
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
                {visibleColumns.map((col) => (
                  <th key={col} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <EmptyState message="No se encontraron asocomunales con los criterios seleccionados" />
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{item.municipio}</td>
                    <td className="px-4 py-3 text-gray-600">{item.cobertura}</td>
                    <td className="px-4 py-3 text-gray-700 tabular-nums font-medium">{item.afiliadas}</td>
                    <td className="px-4 py-3">
                      <Badge label={item.documental} variant={docVariant[item.documental]} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={item.organizativo} variant={orgVariant[item.organizativo]} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={item.aprobacion} variant={aprobVariant[item.aprobacion]} />
                    </td>
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
                          {canDelete && (
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
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

export default Asocomunales;