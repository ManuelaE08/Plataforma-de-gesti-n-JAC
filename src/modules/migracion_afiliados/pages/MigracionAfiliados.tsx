import { AlertCircle, CheckCircle2, Database, Eye, FileSpreadsheet, FileWarning, RefreshCw, Upload, Building2, X, XCircle } from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import { useEffect, useState } from "react";
import { formatBytes, useMigracionAfiliados } from "../hooks/useMigracionAfiliados";
import { JACService } from "../../jac/services/jacService";
import { JacListItem } from "../../jac/types";

function MigracionAfiliados() {
  const {
    inputRef,
    archivo,
    jacId,
    setJacId,
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
    importarArchivo,
    resetEstado,
    detallesErrores,
  } = useMigracionAfiliados();

  const [jacs, setJacs] = useState<JacListItem[]>([]);

  useEffect(() => {
    JACService.findAll(1000).then(setJacs).catch(console.error);
  }, []);

  const columns = preview.length > 0 ? Object.keys(preview[0]) : [];

  return (
    <div>
      <PageHeader
        title="Migración de Afiliados"
        subtitle="Importe afiliados y dignatarios a una JAC desde un archivo Excel"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Columna Izquierda (Flujo Principal) */}
        <div className="xl:col-span-2 space-y-5">
          {/* Paso 1: Selector de JAC */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1B7F4B]/10 text-[#1B7F4B] text-[11px] font-bold">1</span>
              Seleccione la JAC de destino
            </h2>
            <div className="w-full">
              <select
                value={jacId}
                onChange={(e) => setJacId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:border-[#1B7F4B] focus:ring-1 focus:ring-[#1B7F4B] outline-none transition-all"
              >
                <option value="">-- Seleccionar JAC --</option>
                {jacs.map(j => (
                   <option key={j.id} value={j.id}>{j.nombre || j.nombreCortoJAC || j.nombreCompletoJunta}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Paso 2: Zona de Carga */}
          <section className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-5 transition-all ${jacId === "" ? 'opacity-50 pointer-events-none border-gray-100 dark:border-gray-700' : 'border-gray-100 dark:border-gray-700'}`}>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1B7F4B]/10 text-[#1B7F4B] text-[11px] font-bold">2</span>
              Gestión del Archivo Excel
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 pl-7">Sube el formato oficial que contiene la "Relación de Dignatarios" (Hoja 1) y el "Libro de Asociados" (Hoja 2).</p>

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
                    onClick={() => setMostrarPreview(true)} 
                    disabled={estado === "importando" || error !== "" || preview.length === 0}
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
                  <span className="font-medium text-gray-600 dark:text-gray-300">{estado === "previsualizando" ? "Analizando y combinando hojas de Excel..." : "Sincronizando afiliados con la base de datos..."}</span>
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
              <div className="mt-5 space-y-3">
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  resultado.errores === 0
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                }`}>
                  {resultado.errores === 0
                    ? <CheckCircle2 className="shrink-0 text-green-600" size={20} />
                    : <AlertCircle className="shrink-0 text-amber-600" size={20} />
                  }
                  <div className="w-full">
                    <p className={`text-sm font-bold mb-2 ${resultado.errores === 0 ? 'text-green-800 dark:text-green-400' : 'text-amber-800 dark:text-amber-400'}`}>
                      {resultado.errores === 0 ? 'Importación completada exitosamente' : 'Importación completada con advertencias'}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Total únicos: <strong>{resultado.validas}</strong></span>
                      <span className="text-green-700 dark:text-green-400">✓ Procesados: <strong>{resultado.validas}</strong></span>
                      {resultado.errores > 0 && (
                        <span className="text-red-600 dark:text-red-400">✗ Fallidos: <strong>{resultado.errores}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {detallesErrores && detallesErrores.length > 0 && (
                  <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/10 p-4">
                    <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-3">Observaciones de importación:</p>
                    <div className="max-h-44 overflow-y-auto space-y-1.5">
                      {detallesErrores.map((d: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-amber-100 dark:border-amber-900/30">
                          <XCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-200 font-semibold">{d.asocomunal}</span>
                          <span className="text-amber-600 dark:text-amber-400 ml-auto text-right">{d.error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Seleccionar la JAC</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">Debes elegir a qué JAC pertenecerán los afiliados que vas a cargar. Si un afiliado trae cargo directivo, se asignará a esa JAC.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">2</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Revisión de Hojas</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">El sistema leerá la Hoja 1 (Dignatarios) y la Hoja 2 (Asociados). Las cédulas repetidas se fusionarán para crear un solo registro completo.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-900/30 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">3</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Carga Automática</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">Tras arrastrar el archivo, el sistema lo procesará automáticamente y te mostrará una previsualización antes de importar.</p>
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Analizando registros fusionados (Dignatarios y Afiliados)</p>
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Filas (Bruto)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{resultado.filasDetectadas}</p>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Personas Únicas</p>
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
                    <Database size={16} className="text-gray-400"/> Estructura a Importar
                  </h3>
                  <div className="text-[11px] font-semibold text-[#1B7F4B] bg-[#1B7F4B]/10 px-2.5 py-1 rounded-md">
                    Previsualizando {preview.length} afiliados
                  </div>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-max text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 font-semibold text-xs border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        {columns.filter(c => c !== 'cargoId').map((col) => (
                          <th key={col} className="px-5 py-3 whitespace-nowrap uppercase tracking-wider">
                            {col.replace(/([A-Z])/g, ' $1').trim()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                      {preview.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                          {columns.filter(c => c !== 'cargoId').map((col) => (
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

export default MigracionAfiliados;
