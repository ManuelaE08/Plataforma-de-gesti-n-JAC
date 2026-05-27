import { FileText, RotateCcw, Download, Eye, Plus } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import ModalGenerarReporte from "../components/ui/ModalGenerarReporte";
import { useReportes, columns } from "../hooks/useReportes";

function Reportes() {
  const {
    filters, filtered, handleClear,
    setBusqueda, setTipo, setFormato, setEstado, setFecha,
    modalAbierto, form, formError, generando,
    abrirModal, cerrarModal, setFormField, generarReporte,
  } = useReportes();

  // Clases y constantes del Sistema de Diseño Institucional
  const card = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";
  const labelCls = "text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1";
  const focusRing = "focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B]";
  
  // Constante de select institucional con flecha personalizada en SVG e incremento de fuente (text-base)
  const selectCls = "appearance-none w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-base text-gray-600 dark:text-gray-300 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[size:1.5em_1.5em] bg-no-repeat";

  // Renderizador de puntos LED difuminados únicamente aplicados para la columna de Estado Operativo
  const renderStatusDot = (status: string) => {
    const statusLower = status?.toLowerCase();
    let dotClass = "bg-gray-400 shadow-[0_0_8px_rgba(156,163,175,0.6)]";

    if (["generado", "exito", "activo"].includes(statusLower)) {
      dotClass = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]";
    } else if (["error", "fallido"].includes(statusLower)) {
      dotClass = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
    } else if (["pendiente", "en cola"].includes(statusLower)) {
      dotClass = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
    }

    return (
      <div className="flex items-center gap-2 font-semibold text-base text-gray-800 dark:text-gray-100">
        <span className={`w-2.5 h-2.5 shrink-0 rounded-full ${dotClass}`} />
        <span>{status}</span>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Reportes"
        subtitle="Generación y consulta de reportes"
        description="Consulte, filtre y descargue reportes consolidados del sistema"
      >
        <button
          onClick={abrirModal}
          className={`flex items-center gap-2 bg-[#1B7F4B] hover:bg-[#166340] text-white text-base font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0 ${focusRing}`}
        >
          <Plus size={16} />
          Generar reporte
        </button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className={card + " p-4"}>
          <p className={labelCls}>Reportes generados</p>
          <p className="text-3xl font-bold tabular-nums text-gray-800 dark:text-gray-100">24</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Últimos 30 días</p>
        </div>
        <div className={card + " p-4"}>
          <p className={labelCls}>Pendientes</p>
          <p className="text-3xl font-bold tabular-nums text-amber-500">3</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">En cola de generación</p>
        </div>
        <div className={card + " p-4"}>
          <p className={labelCls}>Exportaciones</p>
          <p className="text-3xl font-bold tabular-nums text-[#1B7F4B]">12</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">PDF, Excel y CSV</p>
        </div>
      </div>

      {/* Filtros */}
      <div className={card + " p-4 mb-4"}>
        <p className={labelCls + " mb-3"}>Filtros de búsqueda</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SearchBar
            placeholder="Buscar por nombre, tipo o usuario..."
            value={filters.busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <div className="relative w-full">
            <select value={filters.tipo} onChange={(e) => setTipo(e.target.value)} className={selectCls}>
              <option value="">Todos los tipos</option>
              <option value="Consolidado JAC">Consolidado JAC</option>
              <option value="Consolidado Asocomunales">Consolidado Asocomunales</option>
              <option value="Estado documental">Estado documental</option>
              <option value="Riesgo organizativo">Riesgo organizativo</option>
              <option value="Usuarios">Usuarios</option>
              <option value="Auditoría">Auditoría</option>
            </select>
          </div>
          <div className="relative w-full">
            <select value={filters.formato} onChange={(e) => setFormato(e.target.value)} className={selectCls}>
              <option value="">Todos los formatos</option>
              <option value="PDF">PDF</option>
              <option value="Excel">Excel</option>
              <option value="CSV">CSV</option>
            </select>
          </div>
          <div className="relative w-full">
            <select value={filters.estado} onChange={(e) => setEstado(e.target.value)} className={selectCls}>
              <option value="">Todos los estados</option>
              <option value="Generado">Generado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Error">Error</option>
            </select>
          </div>
          <div className="relative w-full">
            <input
              type="date"
              value={filters.fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={`w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-base text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 transition-all tabular-nums ${focusRing}`}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button 
            onClick={handleClear} 
            className={`inline-flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-200 text-base font-semibold px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors ${focusRing}`}
          >
            <RotateCcw size={16} />
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className={card + " overflow-hidden"}>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {columns.map((col) => (
                  <th key={col} className="text-left text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState message="No se encontraron reportes con los criterios seleccionados" />
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={index} className="border-b border-gray-50 dark:border-gray-700/70 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400 shrink-0" />
                        <span>{item.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.tipo}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 tabular-nums">{item.fecha}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100 font-bold">{item.formato}</td>
                    <td className="px-4 py-3">
                      {renderStatusDot(item.estado)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.generadoPor}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors ${focusRing}`} title="Ver">
                          <Eye size={16} />
                        </button>
                        <button className={`p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-500 hover:text-[#1B7F4B] transition-colors ${focusRing}`} title="Descargar">
                          <Download size={16} />
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