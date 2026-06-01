import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Database, Download, FileSpreadsheet, FileText, FileWarning, Loader2, MapPin, RefreshCw, Search, Upload, Building2, X, XCircle } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";
import { formatBytes, useMigracion } from "../hooks/useMigracion";
import { JACService } from "../modules/jac/services/jacService";
import type { JacListItem } from "../modules/jac/types";

// Plantilla Excel y guía PDF para la importación de afiliados. Si el archivo no
// existe en `src/assets`, el botón se deshabilita y se muestra el aviso.
const plantillasGlob = import.meta.glob("../assets/formato-*.xlsx", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const instruccionesGlob = import.meta.glob("../assets/instrucciones-*.pdf", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const plantillaAfiliados = {
  url: plantillasGlob["../assets/formato-afiliados.xlsx"],
  fileName: "formato-afiliados.xlsx",
};

const instruccionesAfiliados = {
  url: instruccionesGlob["../assets/instrucciones-afiliados.pdf"],
  fileName: "instrucciones-afiliados.pdf",
};

function Migracion() {
  useAuth();
  const {
    inputRef,
    archivo,
    arrastrando,
    estado,
    error,
    progreso,
    resultado,
    onFileChange,
    onDrop,
    onDragOver,
    onDragLeave,
    importarArchivo,
    resetEstado,
    detallesErrores,
    jacSeleccionada,
    jacQuery,
    setJacQuery,
    jacResultados,
    jacBuscando,
    jacError,
    buscarJACs,
    seleccionarJAC,
    limpiarJacSeleccionada,
  } = useMigracion();

  const [resultadosAbiertos, setResultadosAbiertos] = useState(false);
  const buscadorJacRef = useRef<HTMLDivElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Pre-selección de JAC al llegar desde otra pantalla (ej. botón "Importar
  // Excel" en JacDetalle, que navega a `/migracion?jacId=N`). Una sola vez.
  useEffect(() => {
    const jacIdParam = searchParams.get("jacId");
    if (!jacIdParam) return;

    const jacId = Number(jacIdParam);
    if (!Number.isNaN(jacId) && !jacSeleccionada) {
      JACService.findOne(jacId)
        .then((detalle) => {
          const asListItem: JacListItem = {
            id: detalle.id,
            nombre: detalle.nombre,
            municipio: detalle.municipio,
            barrio: detalle.barrio,
            afiliados: detalle.afiliados,
            organizativo: detalle.estado,
          };
          seleccionarJAC(asListItem);
        })
        .catch((err) => {
          console.warn("[Migracion] No se pudo precargar la JAC:", err);
        });
    }

    // Limpiamos el param para que recargar no re-dispare el efecto y para que
    // un "Cambiar JAC" manual posterior no se pise con la pre-selección.
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce de la búsqueda de JAC (350ms).
  useEffect(() => {
    const handle = setTimeout(() => {
      void buscarJACs(jacQuery);
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jacQuery]);

  // Cierra el dropdown al hacer click fuera.
  useEffect(() => {
    if (!resultadosAbiertos) return;
    const onClick = (e: MouseEvent) => {
      if (!buscadorJacRef.current?.contains(e.target as Node)) {
        setResultadosAbiertos(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [resultadosAbiertos]);

  const cargaBloqueada = !jacSeleccionada;

  const descargarArchivo = (url: string | undefined, fileName: string) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const descargarPlantilla = () => descargarArchivo(plantillaAfiliados.url, plantillaAfiliados.fileName);
  const descargarInstrucciones = () => descargarArchivo(instruccionesAfiliados.url, instruccionesAfiliados.fileName);

  return (
    <div>
      <PageHeader
        title="Migración de Afiliados"
        subtitle="Importe afiliados y dignatarios a una JAC desde un archivo de Excel"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Columna Izquierda (Flujo Principal) */}
        <div className="xl:col-span-2 space-y-5">
          {/* Paso 1: Selección de JAC de destino */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1B7F4B]/10 text-[#1B7F4B] text-[11px] font-bold">1</span>
              JAC a la que se asociarán los afiliados
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 pl-7">
              Busque la Junta de Acción Comunal por nombre. Todos los dignatarios del Excel quedarán vinculados a esta JAC.
            </p>

            {jacSeleccionada ? (
              <div className="flex items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#1B7F4B]/30 bg-[#1B7F4B]/5">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#1B7F4B] text-white flex items-center justify-center shrink-0">
                    <Building2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{jacSeleccionada.nombre}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <MapPin size={12} className="text-gray-400" />
                      <span>{jacSeleccionada.municipio}{jacSeleccionada.barrio ? ` · ${jacSeleccionada.barrio}` : ""}</span>
                      <span className="text-gray-300">•</span>
                      <span>{jacSeleccionada.afiliados} afiliados actuales</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={limpiarJacSeleccionada}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-600 transition-colors shrink-0"
                >
                  Cambiar JAC
                </button>
              </div>
            ) : (
              <div ref={buscadorJacRef} className="relative">
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-900 transition-colors ${
                  resultadosAbiertos
                    ? "border-[#1B7F4B] ring-1 ring-[#1B7F4B]/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}>
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={jacQuery}
                    onChange={(e) => {
                      setJacQuery(e.target.value);
                      setResultadosAbiertos(true);
                    }}
                    onFocus={() => setResultadosAbiertos(true)}
                    placeholder="Escriba el nombre de la JAC..."
                    className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
                  />
                  {jacBuscando && <Loader2 size={16} className="text-[#1B7F4B] animate-spin shrink-0" />}
                  {!jacBuscando && jacQuery && (
                    <button
                      type="button"
                      onClick={() => { setJacQuery(""); setResultadosAbiertos(false); }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      aria-label="Limpiar"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {resultadosAbiertos && jacQuery.trim() && (
                  <div className="absolute z-20 mt-1.5 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                    {jacError ? (
                      <div className="p-3 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>{jacError}</span>
                      </div>
                    ) : jacBuscando ? (
                      <div className="p-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Buscando JACs...</span>
                      </div>
                    ) : jacResultados.length === 0 ? (
                      <div className="p-3 text-xs text-gray-500 dark:text-gray-400 italic">
                        Sin coincidencias para "{jacQuery}".
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {jacResultados.map((jac) => (
                          <li key={jac.id}>
                            <button
                              type="button"
                              onClick={() => { seleccionarJAC(jac); setResultadosAbiertos(false); }}
                              className="w-full text-left px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-start gap-3"
                            >
                              <div className="w-8 h-8 rounded-md bg-[#1B7F4B]/10 text-[#1B7F4B] flex items-center justify-center shrink-0">
                                <Building2 size={14} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{jac.nombre}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                  <MapPin size={10} />
                                  <span>{jac.municipio}{jac.barrio ? ` · ${jac.barrio}` : ""}</span>
                                  <span className="text-gray-300">•</span>
                                  <span>{jac.afiliados} afiliados</span>
                                </p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Paso 2: Zona de Carga */}
          <section className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 ${cargaBloqueada ? "opacity-60" : ""}`}>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1B7F4B]/10 text-[#1B7F4B] text-[11px] font-bold">2</span>
              Gestión del Archivo Excel
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 pl-7">Asegúrese de que el archivo cumpla con el formato oficial de Afiliados.</p>

            {!archivo ? (
              <div
                onDragOver={cargaBloqueada ? undefined : onDragOver}
                onDragLeave={cargaBloqueada ? undefined : onDragLeave}
                onDrop={cargaBloqueada ? undefined : onDrop}
                onClick={() => { if (!cargaBloqueada) inputRef.current?.click(); }}
                className={`border-2 border-dashed rounded-xl min-h-[220px] flex flex-col items-center justify-center text-center px-6 transition-all ${
                  cargaBloqueada
                    ? "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/60 cursor-not-allowed"
                    : arrastrando
                      ? "border-[#1B7F4B] bg-[#1B7F4B]/5 dark:bg-[#1B7F4B]/10 cursor-pointer"
                      : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40 hover:border-[#1B7F4B]/50 cursor-pointer"
                }`}
              >
                <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={onFileChange} disabled={cargaBloqueada} />

                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                  cargaBloqueada
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400"
                    : "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-500"
                }`}>
                  <Upload size={28} />
                </div>

                {cargaBloqueada ? (
                  <>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Seleccione primero la JAC de destino
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Use el buscador del paso anterior para asociar los afiliados a una JAC antes de subir el archivo.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Arrastre su archivo Excel o haga clic para buscar
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Formato soportado: .xlsx (máx. 10MB)</p>
                  </>
                )}
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

            {estado === "importando" && (
              <div className="mt-5 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Sincronizando afiliados con la base de datos...</span>
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
              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-red-800 dark:text-red-400">No se pudo completar la importación</p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
                    {detallesErrores.length > 0 && (
                      <p className="text-[11px] text-red-600/80 dark:text-red-400/80 mt-2">
                        Se detectaron <strong>{detallesErrores.length}</strong> {detallesErrores.length === 1 ? "registro con problema" : "registros con problemas"}. Corrija el archivo y vuelva a intentarlo.
                      </p>
                    )}
                  </div>
                </div>

                {detallesErrores.length > 0 && (
                  <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-gray-900 p-4">
                    <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-3">
                      Detalle de filas rechazadas
                    </p>
                    <div className="max-h-64 overflow-y-auto space-y-1.5">
                      {detallesErrores.map((d, i) => (
                        <div key={i} className="flex flex-wrap items-start gap-2 text-xs bg-red-50/50 dark:bg-red-950/20 rounded-lg px-3 py-2 border border-red-100 dark:border-red-900/30">
                          <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                          {d.sheet && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                              {d.sheet}
                            </span>
                          )}
                          <span className="text-gray-500 dark:text-gray-400 font-medium">Fila {d.fila}</span>
                          {d.label && (
                            <span className="text-gray-700 dark:text-gray-200 font-semibold">· {d.label}</span>
                          )}
                          <span className="text-red-600 dark:text-red-400 w-full sm:flex-1 sm:w-auto sm:text-right">{d.error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

                    {resultado.afiliados ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                          <div className="rounded-lg bg-white/70 dark:bg-gray-800/50 border border-green-200/60 dark:border-green-800/40 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Nuevos afiliados</p>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-100 tabular-nums">{resultado.afiliados.insertados}</p>
                          </div>
                          <div className="rounded-lg bg-white/70 dark:bg-gray-800/50 border border-green-200/60 dark:border-green-800/40 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Actualizados</p>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-100 tabular-nums">{resultado.afiliados.actualizados}</p>
                          </div>
                          <div className="rounded-lg bg-white/70 dark:bg-gray-800/50 border border-green-200/60 dark:border-green-800/40 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">Cargos asignados</p>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-100 tabular-nums">{resultado.afiliados.cargosAsignados}</p>
                          </div>
                        </div>

                        {resultado.afiliados.cargosCreados.length > 0 && (
                          <div className="mt-3 rounded-lg bg-white/70 dark:bg-gray-800/50 border border-green-200/60 dark:border-green-800/40 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1.5">
                              Cargos nuevos creados ({resultado.afiliados.cargosCreados.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {resultado.afiliados.cargosCreados.map((cargo) => (
                                <span key={cargo} className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded bg-[#1B7F4B]/10 text-[#1B7F4B] border border-[#1B7F4B]/20">
                                  {cargo}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3">
                          JAC destino: <span className="font-semibold">#{resultado.afiliados.jacId}</span>{jacSeleccionada ? ` · ${jacSeleccionada.nombre}` : ""}
                        </p>
                      </>
                    ) : (
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Total enviados: <strong>{resultado.filasDetectadas}</strong></span>
                        <span className="text-green-700 dark:text-green-400">✓ Importados: <strong>{resultado.validas}</strong></span>
                        {resultado.errores > 0 && (
                          <span className="text-red-600 dark:text-red-400">✗ Fallidos: <strong>{resultado.errores}</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Seleccione la JAC</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">Busque y elija la Junta de Acción Comunal a la que pertenecerán los afiliados y dignatarios del archivo.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">2</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Descargue la plantilla de Excel</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    Descargue la plantilla oficial de Afiliados y compárela con su archivo antes de cargarlo. Revisar que los
                    encabezados y el orden de las columnas coincidan evita errores en la importación.
                  </p>
                  <button
                    type="button"
                    onClick={descargarPlantilla}
                    disabled={!plantillaAfiliados.url}
                    className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1B7F4B] hover:bg-[#166040] text-white text-xs font-bold transition-all shadow-sm disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
                    title={plantillaAfiliados.url ? `Descargar ${plantillaAfiliados.fileName}` : "Plantilla aún no disponible"}
                  >
                    <Download size={14} />
                    <span>Descargar plantilla Afiliados</span>
                  </button>
                  {!plantillaAfiliados.url && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2">
                      La plantilla aún no está disponible en el proyecto.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 dark:bg-rose-900/30 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">3</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Lea el instructivo de formato (PDF)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    Descargue el instructivo en PDF de Afiliados. Allí se explica, columna por columna, cómo debe ir cada dato
                    (formato, valores permitidos y obligatoriedad). Es <span className="font-semibold">obligatorio</span> leerlo
                    antes de preparar su Excel.
                  </p>
                  <button
                    type="button"
                    onClick={descargarInstrucciones}
                    disabled={!instruccionesAfiliados.url}
                    className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
                    title={instruccionesAfiliados.url ? `Descargar ${instruccionesAfiliados.fileName}` : "Instructivo aún no disponible"}
                  >
                    <FileText size={14} />
                    <span>Descargar instructivo Afiliados</span>
                  </button>
                  {!instruccionesAfiliados.url && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2">
                      El instructivo aún no está disponible en el proyecto.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-sky-50 text-sky-500 dark:bg-sky-900/30 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">4</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Revisión de Hojas</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">El sistema leerá la hoja de Dignatarios y la de Asociados. Las cédulas repetidas se fusionarán para crear un solo registro completo.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-900/30 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">5</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Importación</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">Tras subir el archivo, presione "Importar Ahora". El backend valida todo el libro; si hay errores no se modifica la base de datos.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}

export default Migracion;
