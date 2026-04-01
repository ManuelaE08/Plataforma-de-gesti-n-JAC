import {
  TriangleAlert,
  Search,
  RotateCcw,
  Eye,
  ShieldAlert,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import {
  useAlertas,
  columns,
  nivelVariant,
  estadoVariant,
} from "../hooks/useAlertas";

function Alertas() {
  const {
    filters,
    filtered,
    resumen,
    handleSearch,
    handleClear,
    setBusqueda,
    setMunicipio,
    setTipo,
    setNivel,
    setEstado,
  } = useAlertas();

  return (
    <div>
      <PageHeader
        title="Alertas"
        role="Administrador/Auditor"
        subtitle="Seguimiento de riesgos y novedades"
        description="Monitoree alertas activas, prioridades y casos en seguimiento"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Alertas activas
          </p>
          <p className="text-3xl font-bold text-red-500">{resumen.activas}</p>
          <p className="text-xs text-gray-400 mt-1">Requieren atención inmediata</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            En seguimiento
          </p>
          <p className="text-3xl font-bold text-[#2563EB]">{resumen.seguimiento}</p>
          <p className="text-xs text-gray-400 mt-1">Casos con monitoreo activo</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Prioridad alta
          </p>
          <p className="text-3xl font-bold text-[#F59E0B]">{resumen.altas}</p>
          <p className="text-xs text-gray-400 mt-1">Riesgo elevado identificado</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Filtros de búsqueda avanzados
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SearchBar
            placeholder="Buscar por entidad, municipio o tipo..."
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
            value={filters.tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="appearance-none w-full bg-white border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            <option value="Documental">Documental</option>
            <option value="Organizativa">Organizativa</option>
            <option value="Aprobación">Aprobación</option>
            <option value="Inactividad">Inactividad</option>
          </select>

          <select
            value={filters.nivel}
            onChange={(e) => setNivel(e.target.value)}
            className="appearance-none w-full bg-white border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
          >
            <option value="">Todos los niveles</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>

          <select
            value={filters.estado}
            onChange={(e) => setEstado(e.target.value)}
            className="appearance-none w-full bg-white border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="Activa">Activa</option>
            <option value="En seguimiento">En seguimiento</option>
            <option value="Resuelta">Resuelta</option>
          </select>
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
                <EmptyState message="No se encontraron alertas con los criterios seleccionados" />
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <ShieldAlert size={16} className="text-[#F59E0B] mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800">{item.entidad}</p>
                          <p className="text-xs text-gray-400">{item.tipoEntidad}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.tipoEntidad}</td>
                    <td className="px-4 py-3 text-gray-600">{item.municipio}</td>
                    <td className="px-4 py-3 text-gray-600">{item.tipo}</td>
                    <td className="px-4 py-3">
                      <Badge label={item.nivel} variant={nivelVariant[item.nivel]} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={item.estado} variant={estadoVariant[item.estado]} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.fecha}</td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <TriangleAlert size={16} className="text-[#F59E0B]" />
          <h2 className="text-sm font-semibold text-gray-800">
            Observación general
          </h2>
        </div>

        <p className="text-sm text-gray-500">
          Este módulo puede conectarse después con reglas automáticas del backend
          para generar alertas a partir de vencimientos documentales, inactividad,
          rechazos o inconsistencias detectadas en auditoría.
        </p>
      </div>
    </div>
  );
}

export default Alertas;