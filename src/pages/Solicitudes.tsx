import {
  Search,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  ClipboardList,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import {
  useSolicitudes,
  columns,
  estadoVariant,
} from "../hooks/useSolicitudes";

function Solicitudes() {
  const {
    filters,
    filtered,
    resumen,
    handleSearch,
    handleClear,
    setBusqueda,
    setMunicipio,
    setTipo,
    setEstado,
  } = useSolicitudes();

  return (
    <div>
      <PageHeader
        title="Solicitudes"
        subtitle="Gestión de solicitudes y revisiones"
        description="Consulte, filtre y gestione los trámites pendientes del sistema"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Pendientes
          </p>
          <p className="text-3xl font-bold text-[#F59E0B]">{resumen.pendientes}</p>
          <p className="text-xs text-gray-400 mt-1">A la espera de revisión</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            En revisión
          </p>
          <p className="text-3xl font-bold text-[#2563EB]">{resumen.revision}</p>
          <p className="text-xs text-gray-400 mt-1">Con validación en curso</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Aprobadas
          </p>
          <p className="text-3xl font-bold text-[#1B7F4B]">{resumen.aprobadas}</p>
          <p className="text-xs text-gray-400 mt-1">Trámites finalizados</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Filtros de búsqueda avanzados
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SearchBar
            placeholder="Buscar por solicitante, entidad o tipo..."
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
          </select>

          <select
            value={filters.tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="appearance-none w-full bg-white border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
          >
            <option value="">Todos los tipos</option>
            <option value="Registro JAC">Registro JAC</option>
            <option value="Registro Asocomunal">Registro Asocomunal</option>
            <option value="Actualización documental">Actualización documental</option>
            <option value="Cambio de estado">Cambio de estado</option>
          </select>

          <select
            value={filters.estado}
            onChange={(e) => setEstado(e.target.value)}
            className="appearance-none w-full bg-white border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En revisión">En revisión</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Rechazada">Rechazada</option>
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
                <EmptyState message="No se encontraron solicitudes con los criterios seleccionados" />
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.solicitante}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <ClipboardList size={15} className="text-gray-400 mt-0.5 shrink-0" />
                        <span className="text-gray-700">{item.entidad}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.municipio}</td>
                    <td className="px-4 py-3 text-gray-600">{item.tipo}</td>
                    <td className="px-4 py-3">
                      <Badge label={item.estado} variant={estadoVariant[item.estado]} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.fecha}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs">
                      {item.observacion}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                          <Eye size={15} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-[#1B7F4B] transition-colors">
                          <CheckCircle2 size={15} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <XCircle size={15} />
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

export default Solicitudes;