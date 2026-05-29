import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Database, Download, Eye, FileSpreadsheet, FileWarning, IdCard, Loader2, MapPin, RefreshCw, Search, Upload, Building2, Users, X, XCircle } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import { formatBytes, useMigracion } from "../hooks/useMigracion";
import type { MigrationEntity } from "../modules/migracion_datos/types";
import { JACService } from "../modules/jac/services/jacService";
import type { JacListItem } from "../modules/jac/types";

// Plantillas Excel descargables. Si en `src/assets` no existe el archivo correspondiente,
// la entrada simplemente no aparecerá en el glob y el botón mostrará el aviso de "no disponible".
const plantillasGlob = import.meta.glob("../assets/formato-*.xlsx", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const plantillaPorEntidad: Record<MigrationEntity, { url: string | undefined; fileName: string }> = {
  jacs: {
    url: plantillasGlob["../assets/formato-jacs.xlsx"],
    fileName: "formato-jacs.xlsx",
  },
  asocomunales: {
    url: plantillasGlob["../assets/formato-asocomunales.xlsx"],
    fileName: "formato-asocomunales.xlsx",
  },
  afiliados: {
    url: plantillasGlob["../assets/formato-afiliados.xlsx"],
    fileName: "formato-afiliados.xlsx",
  },
};

const etiquetaEntidad: Record<MigrationEntity, string> = {
  jacs: "JACs",
  asocomunales: "Asocomunales",
  afiliados: "Afiliados",
};

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

  // Pre-selección al llegar desde otra pantalla (ej. botón "Importar Excel" en
  // JacDetalle, que navega a `/migracion?tipo=afiliados&jacId=N`).
  // Se ejecuta una sola vez por carga; tras aplicar, limpiamos los query params
  // para que un cambio manual posterior no se pise.
  useEffect(() => {
    const tipo = searchParams.get("tipo");
    const jacIdParam = searchParams.get("jacId");

    if (tipo !== "afiliados" && !jacIdParam) return;

    if (tipo === "afiliados" && tipoEntidad !== "afiliados") {
      setTipoEntidad("afiliados");
    }

    if (jacIdParam) {
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
    }

    // Limpiamos los params para que recargar no re-dispare el efecto y para
    // que un "Cambiar JAC" manual del usuario no se pise con la pre-selección.
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce de la búsqueda de JAC (350ms).
  useEffect(() => {
    if (tipoEntidad !== "afiliados") return;
    const handle = setTimeout(() => {
      void buscarJACs(jacQuery);
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jacQuery, tipoEntidad]);

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

  const columns = preview.length > 0 ? Object.keys(preview[0]) : [];

  const plantillaActual = plantillaPorEntidad[tipoEntidad];
  const requiereJac = tipoEntidad === "afiliados";
  const cargaBloqueada = requiereJac && !jacSeleccionada;

  const descargarPlantilla = () => {
    if (!plantillaActual?.url) return;
    const link = document.createElement("a");
    link.href = plantillaActual.url;
    link.download = plantillaActual.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

              <button
                onClick={() => setTipoEntidad("afiliados")}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  tipoEntidad === "afiliados"
                    ? "border-[#1B7F4B] bg-[#1B7F4B]/5 text-[#1B7F4B] ring-1 ring-[#1B7F4B]/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-[#1B7F4B]/50 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-600 dark:text-gray-400"
                }`}
              >
                <div className={`p-2.5 rounded-lg ${tipoEntidad === "afiliados" ? "bg-[#1B7F4B] text-white shadow-sm" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                  <IdCard size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">Afiliados</p>
                  <p className="text-[11px] opacity-70 mt-0.5">Miembros de las JAC</p>
                </div>
              </button>
            </div>
          </section>

          {/* Paso 2 (solo Afiliados): Selección de JAC de destino */}
          {requiereJac && (
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1B7F4B]/10 text-[#1B7F4B] text-[11px] font-bold">2</span>
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
          )}

          {/* Paso 2/3: Zona de Carga */}
          <section className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 ${cargaBloqueada ? "opacity-60" : ""}`}>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1B7F4B]/10 text-[#1B7F4B] text-[11px] font-bold">{requiereJac ? 3 : 2}</span>
              Gestión del Archivo Excel
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 pl-7">Asegúrese de que el archivo cumpla con el formato de {etiquetaEntidad[tipoEntidad]}.</p>

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
                <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFileChange} disabled={cargaBloqueada} />

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
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Formatos soportados: .xlsx, .xls, .csv (máx. 10MB)</p>
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
                  {tipoEntidad !== "afiliados" && (
                    <button
                      onClick={() => previsualizarDatos(archivo)}
                      disabled={estado === "importando" || error !== ""}
                      className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[13px] font-bold transition-all shadow-sm disabled:opacity-50"
                    >
                      <Eye size={16} />
                      <span>Ver Resumen</span>
                    </button>
                  )}

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

                {detallesErrores && detallesErrores.length > 0 && (
                  <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/10 p-4">
                    <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-3">Registros que no se pudieron importar:</p>
                    <div className="max-h-44 overflow-y-auto space-y-1.5">
                      {detallesErrores.map((d, i) => (
                        <div key={i} className="flex flex-wrap items-start gap-2 text-xs bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-red-100 dark:border-red-900/30">
                          <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                          {d.sheet && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              {d.sheet}
                            </span>
                          )}
                          <span className="text-gray-500 font-medium">Fila {d.fila}:</span>
                          {d.label && (
                            <span className="text-gray-700 dark:text-gray-200 font-semibold">{d.label}</span>
                          )}
                          <span className="text-red-600 dark:text-red-400 w-full sm:flex-1 sm:w-auto sm:text-right">{d.error}</span>
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
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Confirmar Tipo</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">Selecciona si importarás datos de Asocomunales o Afiliados. Cada entidad lee nombres de columnas distintos extraídos de la plantilla oficial.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">2</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Verifique formato excel de migración</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                    Descargue la plantilla oficial para <span className="font-semibold">{etiquetaEntidad[tipoEntidad]}</span> y compárela
                    con su archivo antes de cargarlo. Revisar que los encabezados y el orden de las columnas coincidan evita errores
                    en la importación.
                  </p>
                  <button
                    type="button"
                    onClick={descargarPlantilla}
                    disabled={!plantillaActual?.url}
                    className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1B7F4B] hover:bg-[#166040] text-white text-xs font-bold transition-all shadow-sm disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
                    title={plantillaActual?.url ? `Descargar ${plantillaActual.fileName}` : "Plantilla aún no disponible"}
                  >
                    <Download size={14} />
                    <span>Descargar plantilla {etiquetaEntidad[tipoEntidad]}</span>
                  </button>
                  {!plantillaActual?.url && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2">
                      La plantilla aún no está disponible en el proyecto.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-sky-50 text-sky-500 dark:bg-sky-900/30 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">3</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Revisión de Variables</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">Asegúrate de que la primera hoja del Excel contenga los datos y que no haya celdas protegidas o macros que bloqueen la lectura.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-500 dark:bg-amber-900/30 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">4</div>
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
