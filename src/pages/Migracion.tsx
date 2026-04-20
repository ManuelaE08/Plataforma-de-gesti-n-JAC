import { AlertCircle, CheckCircle2, Database, Eye, FileSpreadsheet, FileWarning, RefreshCw, Upload, Building2, Users, X } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import { formatBytes, useMigracion } from "../hooks/useMigracion";

function Migracion() {
  const { user } = useAuth();
  const {
    inputRef,
    archivo,
    tipoEntidad,
    setTipoEntidad,
    arrastrando,
    estado,
    error,
    progreso,
    mostrarPreview,
    resultado,
    preview,
    setMostrarPreview,
    onFileChange,
    onDrop,
    onDragOver,
    onDragLeave,
    previsualizarDatos,
    importarArchivo,
    resetEstado,
  } = useMigracion();

  const columns = preview.length > 0 ? Object.keys(preview[0]) : [];

  return (
    <div>
      <PageHeader
        title="Migración de Datos"
        subtitle="Importe registros masivamente desde archivos de Excel"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Columna Izquierda (Flujo Principal) */}
        <div className="xl:col-span-2 space-y-5">
          {/* Paso 1: Selector de Entidad */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1B7F4B]/10 text-[#1B7F4B] text-[11px] font-bold">1</span>
              Seleccione el tipo de entidad
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setTipoEntidad("jacs")}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  tipoEntidad === "jacs"
                    ? "border-[#1B7F4B] bg-[#1B7F4B]/5 text-[#1B7F4B] ring-1 ring-[#1B7F4B]/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-[#1B7F4B]/50 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-600 dark:text-gray-400"
                }`}
              >
                <div className={`p-2.5 rounded-lg ${tipoEntidad === "jacs" ? "bg-[#1B7F4B] text-white shadow-sm" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                  <Building2 size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">JACs</p>
                  <p className="text-[11px] opacity-70 mt-0.5">Juntas de Acción Comunal</p>
                </div>
              </button>

              <button
                onClick={() => setTipoEntidad("asocomunales")}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  tipoEntidad === "asocomunales"
                    ? "border-[#1B7F4B] bg-[#1B7F4B]/5 text-[#1B7F4B] ring-1 ring-[#1B7F4B]/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-[#1B7F4B]/50 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-600 dark:text-gray-400"
                }`}
              >
                <div className={`p-2.5 rounded-lg ${tipoEntidad === "asocomunales" ? "bg-[#1B7F4B] text-white shadow-sm" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                  <Users size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">Asocomunales</p>
                  <p className="text-[11px] opacity-70 mt-0.5">Asociaciones Comunales</p>
                </div>
              </button>
            </div>
          </section>

          {/* Paso 2: Zona de Carga */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1B7F4B]/10 text-[#1B7F4B] text-[11px] font-bold">2</span>
              Gestión del Archivo Excel
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 pl-7">Asegúrese de que el archivo cumpla con el formato de {tipoEntidad === "jacs" ? "la Juntas de Acción Comunal" : "los Asocomunales"}.</p>

            {!archivo ? (
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl min-h-[220px] flex flex-col items-center justify-center text-center px-6 cursor-pointer transition-all ${
                  arrastrando
                    ? "border-[#1B7F4B] bg-[#1B7F4B]/5 dark:bg-[#1B7F4B]/10"
                    : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40 hover:border-[#1B7F4B]/50"
                }`}
              >
                <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFileChange} />

                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors bg-indigo-50 dark:bg-indigo-900/40 text-indigo-500">
                  <Upload size={28} />
                </div>

                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Arrastre su archivo Excel o haga clic para buscar
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Formatos soportados: .xlsx, .xls, .csv (máx. 10MB)</p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800">
                    <FileSpreadsheet size={24} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{archivo.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatBytes(archivo.size)} • Listo para importar</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-700">
                  <button 
                    onClick={() => previsualizarDatos(archivo)} 
                    disabled={estado === "importando" || error !== ""}
                    className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[13px] font-bold transition-all shadow-sm disabled:opacity-50"
                  >
                     <Eye size={16} />
                     <span>Ver Resumen</span>
                  </button>

                  <button 
                    onClick={importarArchivo} 
                    disabled={estado === 'importando' || estado === 'importado' || error !== ""} 
                    className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B7F4B] hover:bg-[#166040] text-white text-[13px] font-bold transition-all shadow-sm disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                     {estado === "importando" ? <RefreshCw size={16} className="animate-spin" /> : <Database size={16} />}
                     <span>{estado === "importado" ? "Completado" : "Importar Ahora"}</span>
                  </button>

                  <button onClick={resetEstado} className="p-2 sm:ml-1 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/30 transition-all shadow-sm" title="Quitar archivo">
                     <X size={18} />
                  </button>
                </div>
              </div>
            )}

            {(estado === "previsualizando" || estado === "importando") && (
              <div className="mt-5 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-medium text-gray-600 dark:text-gray-300">{estado === "previsualizando" ? "Analizando y mapeando estructura del Excel..." : "Sincronizando registros con la base de datos..."}</span>
                  <span className="text-[#1B7F4B] font-bold">{progreso}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div className="h-full bg-[#1B7F4B] transition-all duration-300 relative" style={{ width: `${progreso}%` }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-800 dark:text-red-400">Hubo un problema con el archivo</p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            )}
            
            {estado === "importado" && (
                <div className="mt-5 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3 text-green-800 dark:text-green-400">
                  <CheckCircle2 className="shrink-0" />
                  <p className="text-sm font-semibold">Los datos han sido importados exitosamente a la plataforma.</p>
                </div>
            )}
          </section>
        </div>

        {/* Columna Derecha (Instrucciones de Importación) */}
        <div className="space-y-4 h-full">
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 h-full flex flex-col">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <FileWarning size={18} className="text-[#1B7F4B]" />
              Instrucciones Previas
            </h3>
            
            <div className="space-y-6 flex-1">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">1</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Confirmar Tipo</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">Selecciona si importarás datos de JACs o Asocomunales. Cada entidad lee nombres de columnas distintos extraídos de la plantilla oficial.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">2</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Revisión de Variables</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">Asegúrate de que la primera hoja del Excel contenga los datos y que no haya celdas protegidas o macros que bloqueen la lectura.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-900/30 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">3</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Carga Automática</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">Tras arrastrar el archivo, el sistema procesará la ruta automáticamente mostrándote una previsualización de la estructura antes de que la importes.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>

      {/* Flotante / Modal de Previsualización */}
      {mostrarPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 shrink-0 dark:bg-gray-800/80 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye className="text-[#1B7F4B]" size={22} />
                  Resumen de Importación
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Analizando registros mapeados para la entidad tipo <span className="font-semibold uppercase">{tipoEntidad}</span></p>
              </div>
              <button onClick={() => setMostrarPreview(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Métricas Visuales Superiores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Filas en Excel</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{resultado.filasDetectadas}</p>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Total Válidos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{resultado.validas}</p>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-amber-700 dark:text-amber-500 font-semibold uppercase tracking-wider mb-0.5">Advertencias</p>
                    <p className="text-2xl font-bold text-amber-800 dark:text-amber-400 leading-none">{resultado.advertencias}</p>
                  </div>
                </div>
              </div>

              {/* Tabla de Datos Dinámica */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden flex flex-col border-t-4 border-t-[#1B7F4B]">
                <div className="bg-white dark:bg-gray-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Database size={16} className="text-gray-400"/> Estructura de Columnas Mapeadas
                  </h3>
                  <div className="text-[11px] font-semibold text-[#1B7F4B] bg-[#1B7F4B]/10 px-2.5 py-1 rounded-md">
                    Previsualizando primeras {preview.length} filas
                  </div>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-max text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 font-semibold text-xs border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        {columns.map((col) => (
                          <th key={col} className="px-5 py-3 whitespace-nowrap uppercase tracking-wider">
                            {col.replace(/([A-Z])/g, ' $1').trim()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                      {preview.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                          {columns.map((col) => (
                            <td key={col} className="px-5 py-3 text-gray-700 dark:text-gray-200 max-w-[250px] truncate" title={row[col]?.toString() || ''}>
                              {row[col] ? (
                                <span className={col.toLowerCase().includes('activa') && row[col] === 'SI' ? 'text-green-600 font-semibold' : ''}>
                                  {row[col].toString()}
                                </span>
                              ) : (
                                <span className="text-gray-300 dark:text-gray-600 italic text-[11px]">vacío</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {preview.length === 0 && (
                        <tr>
                          <td colSpan={100} className="px-5 py-8 text-center text-gray-400 italic">No hay registros para mostrar.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer (Solo para cerrar) */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0 flex justify-center sm:justify-end">
              <button 
                onClick={() => setMostrarPreview(false)} 
                className="px-8 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cerrar Previsualización
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Migracion;
