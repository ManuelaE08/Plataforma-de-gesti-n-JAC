import { Plus, Search, RotateCcw, UserRound, Trash2 } from "lucide-react";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import {
  useJac,
  columns,
  docVariant,
  orgVariant,
  aprobVariant,
} from "../hooks/useJac";

function Jac() {
  const {
    filters,
    filtered,
    handleSearch,
    handleClear,
    setBusqueda,
    setMunicipio,
    setEstado,
    setDocumental,
    setMinAfiliados,
    setFecha,
  } = useJac();

  return (
    <div>
      <PageHeader
        title="Juntas de Acción Comunal"
        role="Administrador/Auditor"
        subtitle="Gestión de Juntas de Acción Comunal"
        description="Administre y consulte la información de las JAC del departamento"
      >
        <button className="flex items-center gap-2 bg-[#1B7F4B] hover:bg-[#166340] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0">
          <Plus size={16} />
          Crear nueva JAC
        </button>
      </PageHeader>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Filtros de búsqueda avanzados
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SearchBar
            placeholder="Buscar por nombre o barrio/vereda..."
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
            <option value="Santander">Santander</option>
            <option value="Patía">Patía</option>
            <option value="Timbío">Timbío</option>
            <option value="Piendamó">Piendamó</option>
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
            placeholder="Número mínimo de afiliados"
            value={filters.minAfiliados}
            onChange={(e) => setMinAfiliados(e.target.value)}
            className="w-full bg-white border border-gray-200 text-sm text-gray-600 placeholder:text-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all"
          />

          <input
            type="date"
            value={filters.fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full bg-white border border-gray-200 text-sm text-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSearch}
            className="inline-flex items-center gap-2 bg-[#1B7F4B] hover:bg-[#166340] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <Search size={16} />
            Buscar
          </button>

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
                {columns.map((column) => (
                  <th
                    key={column}
                    className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <EmptyState message="No se encontraron JAC con los criterios seleccionados" />
              ) : (
                filtered.map((jac, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{jac.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{jac.municipio}</td>
                    <td className="px-4 py-3 text-gray-600">{jac.barrio}</td>
                    <td className="px-4 py-3 text-gray-700 tabular-nums font-medium">{jac.afiliados}</td>
                    <td className="px-4 py-3">
                      <Badge label={jac.documental} variant={docVariant[jac.documental]} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={jac.organizativo} variant={orgVariant[jac.organizativo]} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={jac.aprobacion} variant={aprobVariant[jac.aprobacion]} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                          <UserRound size={15} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
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