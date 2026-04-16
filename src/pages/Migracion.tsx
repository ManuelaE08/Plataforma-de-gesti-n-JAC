import { AlertCircle, CheckCircle2, Database, Eye, FileSpreadsheet, FileWarning, RefreshCw, Upload } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import { formatBytes, useMigracion } from "../hooks/useMigracion";

function BadgeEstado({ estado }: { estado: string }) {
  const variant = estado === "Activa" ? "green" : estado === "Pendiente" ? "amber" : "gray";
  return <Badge label={estado} variant={variant} />;
}

function Migracion() {
  const { user } = useAuth();
  const {
    inputRef,
    archivo,
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
    validarArchivo,
    importarArchivo,
    resetEstado,
  } = useMigracion();

  return (
    <div>
      <PageHeader
        title="Migración de Datos"
        subtitle="Importe datos de JAC desde archivos de Excel"
        role={user?.rol === "admin" ? "Administrador/Auditor" : user?.rol === "operador" ? "Operador" : "Usuario"}
      >
        <Badge label="Carga masiva" variant="blue" />
      </PageHeader>

      <div className="space-y-4">
        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">Migración de Datos desde Excel</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Importe registros de JAC desde archivos estructurados y valide la información antes de confirmar la carga.</p>

          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`border border-dashed rounded-xl min-h-[240px] flex flex-col items-center justify-center text-center px-6 cursor-pointer transition-all ${
              arrastrando
                ? "border-[#1B7F4B] bg-[#1B7F4B]/5 dark:bg-[#1B7F4B]/10"
                : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 hover:border-[#1B7F4B]/50"
            }`}
          >
            <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFileChange} />

            <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-4">
              <Upload size={24} className="text-indigo-500" />
            </div>

            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Arrastre su archivo Excel aquí o haga clic para seleccionar</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Formatos soportados .xlsx, .xls, .csv (máx. 10MB)</p>
          </div>

          {archivo && (
            <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <FileSpreadsheet size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{archivo.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{formatBytes(archivo.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {estado !== "listo" && estado !== "importando" && estado !== "importado" && (
                  <button onClick={validarArchivo} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B7F4B] hover:bg-[#166040] text-white text-sm font-medium transition-colors">
                    <CheckCircle2 size={16} />
                    Validar archivo
                  </button>
                )}

                {(estado === "listo" || estado === "importado") && (
                  <button onClick={importarArchivo} disabled={estado === "importado"} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B7F4B] hover:bg-[#166040] disabled:bg-green-600 disabled:cursor-default text-white text-sm font-medium transition-colors">
                    <Database size={16} />
                    {estado === "importado" ? "Importación completada" : "Importar datos"}
                  </button>
                )}

                <button onClick={resetEstado} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
                  <RefreshCw size={16} />
                  Limpiar
                </button>
              </div>
            </div>
          )}

          {(estado === "validando" || estado === "importando") && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-gray-500 dark:text-gray-400">{estado === "validando" ? "Validando estructura y contenido..." : "Importando registros al sistema..."}</span>
                <span className="text-gray-700 dark:text-gray-200 font-medium">{progreso}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div className="h-full bg-[#1B7F4B] transition-all duration-300" style={{ width: `${progreso}%` }} />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">No se pudo procesar el archivo</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Instrucciones</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <CheckCircle2 size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Formato del archivo</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">El archivo debe contener las siguientes columnas: Nombre, Municipio, Barrio/Vereda, Afiliados y Estado.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Validación</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">El sistema validará que los campos requeridos estén completos y que los datos sean coherentes.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Importación</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Una vez validado, podrá revisar los datos antes de confirmar la importación definitiva.</p>
              </div>
            </div>
          </div>
        </section>

        {mostrarPreview && (
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Vista previa de registros</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Se muestran algunas filas detectadas antes de importar.</p>
                </div>
                <button onClick={() => setMostrarPreview((v) => !v)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Eye size={14} />
                  {mostrarPreview ? "Ocultar" : "Ver"}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                      <th className="py-3 pr-4 font-medium">Nombre</th>
                      <th className="py-3 pr-4 font-medium">Municipio</th>
                      <th className="py-3 pr-4 font-medium">Barrio/Vereda</th>
                      <th className="py-3 pr-4 font-medium">Afiliados</th>
                      <th className="py-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 dark:border-gray-700/70 last:border-0">
                        <td className="py-3 pr-4 text-gray-800 dark:text-gray-100">{item.nombre}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{item.municipio}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{item.barrio}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{item.afiliados}</td>
                        <td className="py-3"><BadgeEstado estado={item.estado} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Resumen de validación</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Filas detectadas</span><span className="font-semibold text-gray-800 dark:text-gray-100">{resultado.filasDetectadas}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Registros válidos</span><span className="font-semibold text-green-600">{resultado.validas}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Advertencias</span><span className="font-semibold text-amber-600">{resultado.advertencias}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-500 dark:text-gray-400">Errores</span><span className="font-semibold text-red-600">{resultado.errores}</span></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                <div className="flex items-start gap-3">
                  <FileWarning size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Observaciones</h3>
                    <ul className="mt-2 space-y-2 text-xs text-gray-500 dark:text-gray-400 list-disc pl-4">
                      <li>Se detectaron 2 filas con campos obligatorios vacíos.</li>
                      <li>Hay 5 registros con diferencias menores en nombres de municipio.</li>
                      <li>Revise la vista previa antes de confirmar la importación final.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Migracion;