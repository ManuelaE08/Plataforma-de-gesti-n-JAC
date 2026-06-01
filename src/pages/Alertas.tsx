import {
  TriangleAlert, Search, X, ChevronLeft, ChevronRight, Eye,
  ShieldAlert, FileWarning, Building2, Loader2, RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import { useAlertas, type AlertaSeveridad, type CategoriaMeta } from "../hooks/useAlertas";

const card = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";
const focusRing = "focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B]";

/** Paleta por severidad: borde/acento de la tarjeta, color del número y del punto. */
const severidadStyles: Record<AlertaSeveridad, {
  ring: string; numero: string; dot: string; chip: string; iconBg: string;
}> = {
  critica: {
    ring: "hover:border-red-300 dark:hover:border-red-700",
    numero: "text-red-600 dark:text-red-400",
    dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
    chip: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    iconBg: "bg-red-50 text-red-500 dark:bg-red-900/30",
  },
  alta: {
    ring: "hover:border-orange-300 dark:hover:border-orange-700",
    numero: "text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]",
    chip: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    iconBg: "bg-orange-50 text-orange-500 dark:bg-orange-900/30",
  },
  media: {
    ring: "hover:border-amber-300 dark:hover:border-amber-700",
    numero: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    iconBg: "bg-amber-50 text-amber-500 dark:bg-amber-900/30",
  },
  info: {
    ring: "hover:border-blue-300 dark:hover:border-blue-700",
    numero: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]",
    chip: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    iconBg: "bg-blue-50 text-blue-500 dark:bg-blue-900/30",
  },
};

function iconoCategoria(meta: CategoriaMeta) {
  if (meta.categoria === "riesgo_activa" || meta.categoria === "riesgo_inactiva") return ShieldAlert;
  return FileWarning;
}

function Alertas() {
  const navigate = useNavigate();
  const {
    resumen, loadingResumen, errorResumen, refetchResumen, conteoDe, categorias,
    categoriaAbierta, abrirCategoria, cerrarCategoria,
    detalle, loadingDetalle, errorDetalle,
    page, setPage, busqueda, setBusqueda, pageSize,
  } = useAlertas();

  const metaAbierta = categorias.find((c) => c.categoria === categoriaAbierta) ?? null;

  return (
    <div>
      <PageHeader
        title="Alertas y Riesgo Organizativo"
        subtitle="Seguimiento de riesgos legales y documentales de las JAC"
        description="Identifique las Juntas que requieren atención por afiliados insuficientes o falta de formalización (RUC / NIT)."
      />

      {/* Estado de error del resumen */}
      {errorResumen && (
        <div className={`${card} p-4 mb-4 border-red-200 dark:border-red-800`}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-2">
              <TriangleAlert size={18} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{errorResumen}</p>
            </div>
            <button
              onClick={refetchResumen}
              className={`inline-flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-200 text-sm font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors ${focusRing}`}
            >
              <RotateCcw size={14} /> Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Tarjetas de categoría (conteos agregados) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        {categorias.map((meta) => {
          const s = severidadStyles[meta.severidad];
          const Icono = iconoCategoria(meta);
          const conteo = conteoDe(meta.categoria);
          const activa = categoriaAbierta === meta.categoria;
          const pct = resumen && resumen.totalJacs > 0
            ? Math.round((conteo / resumen.totalJacs) * 100)
            : 0;

          return (
            <button
              key={meta.categoria}
              onClick={() => (activa ? cerrarCategoria() : abrirCategoria(meta.categoria))}
              className={`${card} text-left p-4 transition-all ${s.ring} ${
                activa ? "ring-2 ring-[#1B7F4B]/40 border-[#1B7F4B]/40" : ""
              } ${focusRing}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.iconBg}`}>
                  <Icono size={18} />
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.chip}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {meta.severidad === "critica" ? "Crítica"
                    : meta.severidad === "alta" ? "Alta"
                    : meta.severidad === "media" ? "Media" : "Informativa"}
                </span>
              </div>

              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-3">{meta.titulo}</p>

              <div className="flex items-end gap-2 mt-1">
                {loadingResumen ? (
                  <Loader2 size={22} className="animate-spin text-gray-300 dark:text-gray-600 my-1.5" />
                ) : (
                  <span className={`text-3xl font-bold tabular-nums ${s.numero}`}>{conteo}</span>
                )}
                {!loadingResumen && resumen && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                    {pct}% del total
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{meta.descripcion}</p>

              <p className="text-[11px] font-semibold text-[#1B7F4B] mt-2">
                {activa ? "Ocultar detalle ▲" : "Ver JAC afectadas ▼"}
              </p>
            </button>
          );
        })}

        {/* Tarjeta de contexto: total de JAC */}
        <div className={`${card} p-4 flex flex-col justify-center`}>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total de JAC</p>
          {loadingResumen ? (
            <Loader2 size={22} className="animate-spin text-gray-300 dark:text-gray-600 my-1.5" />
          ) : (
            <p className="text-3xl font-bold tabular-nums text-gray-800 dark:text-gray-100">{resumen?.totalJacs ?? 0}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Registradas en el sistema</p>
        </div>
      </div>

      {/* Panel de detalle (solo cuando hay una categoría abierta) */}
      {metaAbierta && (
        <div className={`${card} overflow-hidden mb-4`}>
          {/* Encabezado del panel */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${severidadStyles[metaAbierta.severidad].dot}`} />
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 truncate">{metaAbierta.titulo}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {detalle ? `${detalle.total} JAC` : "Cargando..."} · {metaAbierta.descripcion}
                </p>
              </div>
            </div>
            <button
              onClick={cerrarCategoria}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ${focusRing}`}
              title="Cerrar detalle"
            >
              <X size={18} />
            </button>
          </div>

          {/* Buscador del detalle */}
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <SearchBar
              placeholder="Buscar dentro de esta categoría por nombre o municipio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Tabla / estados */}
          {errorDetalle ? (
            <div className="p-6 text-center text-sm text-red-500">{errorDetalle}</div>
          ) : loadingDetalle ? (
            <div className="p-10 flex items-center justify-center gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" /> Cargando JAC afectadas...
            </div>
          ) : !detalle || detalle.items.length === 0 ? (
            <EmptyState message="No se encontraron JAC en esta categoría con los criterios indicados" inTable={false} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      {["JAC", "Municipio", "Tipo", "Afiliados", "Estado", "RUC / NIT", "Acción"].map((c) => (
                        <th key={c} className="text-left text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.items.map((jac) => {
                      const faltanAfiliados = jac.afiliados < jac.minimoAfiliados;
                      return (
                        <tr key={jac.id} className="border-b border-gray-50 dark:border-gray-700/70 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <Building2 size={16} className="text-gray-400 mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-bold text-gray-800 dark:text-gray-100 truncate">{jac.nombre}</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 truncate">{jac.barrio}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{jac.municipio}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{jac.tipo}</td>
                          <td className="px-4 py-3">
                            <span className={`tabular-nums font-semibold ${faltanAfiliados ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-200"}`}>
                              {jac.afiliados}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500 text-sm"> / {jac.minimoAfiliados}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-2 text-sm font-semibold ${
                              jac.estado === "Activa" ? "text-green-600 dark:text-green-400"
                                : jac.estado === "Inactiva" ? "text-orange-600 dark:text-orange-400"
                                : "text-gray-500 dark:text-gray-400"
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${
                                jac.estado === "Activa" ? "bg-green-500"
                                  : jac.estado === "Inactiva" ? "bg-orange-500" : "bg-gray-400"
                              }`} />
                              {jac.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-0.5 text-sm">
                              <span className={jac.numeroRUC ? "text-gray-600 dark:text-gray-300" : "text-red-500"}>
                                RUC: {jac.numeroRUC || "—"}
                              </span>
                              <span className={jac.nit ? "text-gray-600 dark:text-gray-300" : "text-red-500"}>
                                NIT: {jac.nit || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => navigate(`/jac/${jac.id}`)}
                              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-[#1B7F4B] dark:hover:text-emerald-400 transition-colors ${focusRing}`}
                              title="Ver detalle de la JAC"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mostrando <span className="font-semibold">{(detalle.page - 1) * pageSize + 1}</span>
                  {"–"}
                  <span className="font-semibold">{Math.min(detalle.page * pageSize, detalle.total)}</span>
                  {" de "}
                  <span className="font-semibold">{detalle.total}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={detalle.page <= 1}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums px-1">
                    {detalle.page} / {detalle.totalPages || 1}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={detalle.page >= detalle.totalPages}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                  >
                    Siguiente <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Ayuda contextual */}
      {!metaAbierta && (
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <TriangleAlert size={18} className="text-amber-500" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">¿Cómo leer estas alertas?</h2>
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 leading-relaxed">
            <li><span className="font-semibold text-red-600 dark:text-red-400">Activas en riesgo</span>: están funcionando como activas pero por debajo del mínimo legal de afiliados; podrían perder su condición (Ley 2166 de 2021, Art. 11).</li>
            <li><span className="font-semibold text-orange-600 dark:text-orange-400">Inactivas por afiliados</span>: no alcanzan el mínimo para activarse.</li>
            <li><span className="font-semibold text-amber-600 dark:text-amber-400">Sin RUC</span> / <span className="font-semibold text-orange-600 dark:text-orange-400">Sin RUC ni NIT</span>: pendientes de formalización documental.</li>
            <li><span className="font-semibold text-blue-600 dark:text-blue-400">Sin NIT</span>: suele abarcar la mayoría del directorio; úsela como referencia, no como urgencia.</li>
          </ul>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Haga clic en cualquier tarjeta para ver el listado de JAC afectadas (cargado por páginas).
          </p>
        </div>
      )}
    </div>
  );
}

export default Alertas;
