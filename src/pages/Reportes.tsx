import { FileText, RotateCcw, Download, Eye, Plus } from "lucide-react";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import ModalGenerarReporte from "../components/ui/ModalGenerarReporte";
import { useReportes, columns, estadoVariant } from "../hooks/useReportes";

function Reportes() {
  const {
    filters, filtered, handleClear,
    setBusqueda, setTipo, setFormato, setEstado, setFecha,
    modalAbierto, form, formError, generando,
    abrirModal, cerrarModal, setFormField, generarReporte,
  } = useReportes();

  return (
    <div>
      <PageHeader
        title="Reportes"
        subtitle="Generación y consulta de reportes"
        description="Consulte, filtre y descargue reportes consolidados del sistema"
      >
        <button
          onClick={abrirModal}
          className="flex items-center gap-2 bg-[#1B7F4B] hover:bg-[#166340] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0"
        >
          <Plus size={16} />
          Generar reporte
        </button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Reportes generados</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">24</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Últimos 30 días</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Pendientes</p>
          <p className="text-3xl font-bold text-amber-500">3</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">En cola de generación</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Exportaciones</p>
          <p className="text-3xl font-bold text-[#2563EB]">12</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PDF, Excel y CSV</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Filtros de búsqueda</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SearchBar
            placeholder="Buscar por nombre, tipo o usuario..."
            value={filters.busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select value={filters.tipo} onChange={(e) => setTipo(e.target.value)} className="appearance-none w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer">
            <option value="">Todos los tipos</option>
            <option value="Consolidado JAC">Consolidado JAC</option>
            <option value="Consolidado Asocomunales">Consolidado Asocomunales</option>
            <option value="Estado documental">Estado documental</option>
            <option value="Riesgo organizativo">Riesgo organizativo</option>
            <option value="Usuarios">Usuarios</option>
            <option value="Auditoría">Auditoría</option>
          </select>
          <select value={filters.formato} onChange={(e) => setFormato(e.target.value)} className="appearance-none w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer">
            <option value="">Todos los formatos</option>
            <option value="PDF">PDF</option>
            <option value="Excel">Excel</option>
            <option value="CSV">CSV</option>
          </select>
          <select value={filters.estado} onChange={(e) => setEstado(e.target.value)} className="appearance-none w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer">
            <option value="">Todos los estados</option>
            <option value="Generado">Generado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Error">Error</option>
          </select>
          <input
            type="date"
            value={filters.fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all"
          />
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleClear} className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-200 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
            <RotateCcw size={16} />
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {columns.map((col) => (
                  <th key={col} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <EmptyState message="No se encontraron reportes con los criterios seleccionados" />
              ) : (
                filtered.map((item, index) => (
                  <tr key={index} className="border-b border-gray-50 dark:border-gray-700/70 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className="text-gray-400" />
                        <span>{item.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.tipo}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 tabular-nums">{item.fecha}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200 font-medium">{item.formato}</td>
                    <td className="px-4 py-3">
                      <Badge label={item.estado} variant={estadoVariant[item.estado]} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.generadoPor}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" title="Ver">
                          <Eye size={15} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-[#2563EB] transition-colors" title="Descargar">
                          <Download size={15} />
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

      {/* Modal */}
      <ModalGenerarReporte
        abierto={modalAbierto}
        form={form}
        formError={formError}
        generando={generando}
        onCerrar={cerrarModal}
        onSetField={setFormField}
        onGenerar={generarReporte}
      />
    </div>
  );
}

export default Reportes;