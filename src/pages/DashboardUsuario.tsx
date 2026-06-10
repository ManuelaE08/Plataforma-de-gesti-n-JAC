import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, FileText, Network, type LucideIcon } from "lucide-react";
import BarChart from "../components/BarChart";
import SegmentedDonut from "../components/SegmentedDonut";
import CaucaMapGeoJSON from "../components/CaucaMapGeoJSON";
import MunicipioSearch from "../components/MunicipioSearch";
import PopInNumber from "../components/transitions/PopInNumber";
import RevealText from "../components/transitions/RevealText";
import HoverSpringGroup from "../components/transitions/HoverSpringGroup";
import { JACService, type PublicStats, type EstadosJacResumen } from "../modules/jac/services/jacService";
import type { JacListItem } from "../modules/jac/types";

const EMPTY_STATS: PublicStats = {
  activeJacsCount: 0,
  totalJACS: 0,
  rucCount: 0,
  urbanCount: 0,
  ruralCount: 0,
  totalAsocomunales: 0,
  topMunicipios: [],
};

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  replayKey?: unknown;
  accentClass?: string;
}

function KpiCard({ title, value, icon: Icon, hint, replayKey, accentClass }: KpiCardProps) {
  return (
    <div
      className={`relative h-full overflow-hidden rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm ${accentClass ?? ""}`}
    >
      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <div className="mt-4">
              <PopInNumber
                value={value}
                replayKey={replayKey}
                className="text-4xl font-bold text-slate-900 dark:text-white"
              />
            </div>
            {hint && (
              <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">{hint}</p>
            )}
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 shadow-sm">
            <Icon size={26} className="text-[#1B7F4B] dark:text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardUsuario() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<PublicStats | null>(null);
  const [jacs, setJacs] = useState<JacListItem[]>([]);
  const [estados, setEstados] = useState<EstadosJacResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cross-fade skeleton → contenido (transitions-dev #14)
  const [revealed, setRevealed] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        // Las estadísticas son críticas; el listado (mapa) y el resumen de
        // estados son opcionales y degradan con elegancia si fallan.
        const [statsResult, jacsResult, estadosResult] = await Promise.allSettled([
          JACService.getPublicStats(),
          JACService.findAllPublic(4000),
          JACService.getEstadosResumen(),
        ]);

        if (!active) return;

        if (statsResult.status === "rejected") {
          throw statsResult.reason;
        }
        setStats(statsResult.value);
        if (jacsResult.status === "fulfilled") {
          setJacs(jacsResult.value);
        }
        if (estadosResult.status === "fulfilled") {
          setEstados(estadosResult.value);
        }
        setLoading(false);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Error al cargar estadísticas del Cauca."
          );
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, []);

  // Una vez que llegan los datos, dispara el reveal y desmonta el skeleton
  // tras la duración de la transición.
  useEffect(() => {
    if (loading || error || !stats) return;
    const raf = requestAnimationFrame(() => setRevealed(true));
    const timer = setTimeout(() => setShowSkeleton(false), 500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [loading, error, stats]);

  // Conteo de estados: usa el endpoint dedicado si está disponible; si no,
  // cae al cálculo desde el listado público (que puede traer solo activas).
  const estadoData = useMemo(() => {
    if (estados) {
      return {
        activa: estados.activa,
        inactiva: estados.inactiva,
        cancelada: estados.cancelada,
        total: estados.total,
      };
    }
    const counts = { activa: 0, inactiva: 0, cancelada: 0, total: 0 };
    for (const j of jacs) {
      if (j.organizativo === "Activa") counts.activa++;
      else if (j.organizativo === "Inactiva") counts.inactiva++;
      else if (j.organizativo === "Cancelada") counts.cancelada++;
    }
    counts.total = counts.activa + counts.inactiva + counts.cancelada;
    return counts;
  }, [estados, jacs]);

  // Municipios únicos para el buscador (nombres tal cual los devuelve el backend).
  const municipios = useMemo(() => {
    const set = new Set<string>();
    for (const j of jacs) if (j.municipio) set.add(j.municipio);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [jacs]);

  const goToMunicipio = (municipio: string) => {
    if (!municipio) return;
    navigate(`/jac?municipio=${encodeURIComponent(municipio)}`);
  };

  if (error && !stats) {
    return (
      <div className="min-h-screen px-2 py-4 sm:px-3 lg:px-5 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 text-center shadow-md">
          <p className="text-base font-semibold text-red-650 dark:text-red-400">Error de conexión</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {error || "No se pudieron obtener las estadísticas en este momento."}
          </p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              window.location.reload();
            }}
            className="mt-4 bg-[#1B7F4B] hover:bg-[#166340] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Reintentar conexión
          </button>
        </div>
      </div>
    );
  }

  const data = stats ?? EMPTY_STATS;
  const rucPercent =
    data.activeJacsCount > 0 ? Math.round((data.rucCount / data.activeJacsCount) * 100) : 0;
  const strokeOffset = 2 * Math.PI * 34 * (1 - rucPercent / 100);
  const jacPorAsocomunal =
    data.totalAsocomunales > 0
      ? (data.activeJacsCount / data.totalAsocomunales).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen px-2 py-4 sm:px-3 lg:px-5">
      <div className="mx-auto w-full max-w-[calc(100vw-1.5rem)]">
        {/* Header — visible de inmediato con entrada escalonada (#18) */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-gray-700 bg-gradient-to-br from-[#1B7F4B] to-[#0F5132] p-6 sm:p-8 shadow-sm">
          <RevealText>
            <span className="t-stagger-line t-stagger-line--1 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-50 w-fit">
              Datos abiertos · Cauca
            </span>
            <h1 className="t-stagger-line t-stagger-line--2 mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Dashboard Comunal
            </h1>
            <p className="t-stagger-line t-stagger-line--3 mt-2 max-w-2xl text-base text-emerald-50/90">
              Resumen estadístico y directorio de Juntas de Acción Comunal y Asocomunales del
              departamento del Cauca.
            </p>
          </RevealText>
        </section>

        {/* Cuerpo: skeleton overlay → contenido real con cross-blur (#14) */}
        <div className={`t-skel ${revealed ? "is-revealed" : ""}`}>
          <div className="t-skel-content">
            {/* KPIs con contadores animados (#02) y lift por grupo (#11) */}
            <HoverSpringGroup className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <KpiCard
                title="Juntas de Acción Comunal"
                value={data.totalJACS}
                icon={Building2}
                hint={`${data.activeJacsCount} activas en el departamento`}
                replayKey={revealed}
                accentClass="bg-[#F0FDF4] dark:bg-emerald-950/20"
              />
              <KpiCard
                title="Asocomunales"
                value={data.totalAsocomunales}
                icon={Network}
                hint="Federaciones de JAC del Cauca"
                replayKey={revealed}
              />
              <KpiCard
                title="JAC por Asocomunal"
                value={jacPorAsocomunal}
                icon={Building2}
                hint="Promedio de juntas por federación"
                replayKey={revealed}
              />
            </HoverSpringGroup>

            {/* Buscador de municipio — atajo al directorio filtrado */}
            <section className="mt-8">
              <p className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                Busca un municipio para ver sus JAC
              </p>
              <MunicipioSearch
                municipios={municipios}
                onSelect={goToMunicipio}
                placeholder="Escribe el nombre de un municipio…"
              />
            </section>

            {/* Fila 1: Mapa + Distribución Urbano / Rural */}
            <section className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
              {/* key fuerza el remontaje cuando llegan los datos para que
                  Leaflet recalcule conteos/tooltips (se montan una sola vez). */}
              <CaucaMapGeoJSON key={jacs.length} jacs={jacs} onSelect={goToMunicipio} />
              <SegmentedDonut
                title="Distribución Urbano / Rural"
                subtitle="Origen de las JAC activas"
                badge={`${data.activeJacsCount} JAC`}
                segments={[
                  { label: "Urbanas", value: data.urbanCount, color: "#34D399" },
                  { label: "Rurales", value: data.ruralCount, color: "#A7F3D0" },
                ]}
              />
            </section>

            {/* Fila 2: Más JACs afiliadas + Estado de las JAC */}
            <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BarChart items={data.topMunicipios} />
              <SegmentedDonut
                title="Estado de las JAC"
                subtitle="Activas, inactivas y canceladas"
                badge={`${estadoData.total} JAC`}
                segments={[
                  { label: "Activas", value: estadoData.activa, color: "#4ADE80" },
                  { label: "Inactivas", value: estadoData.inactiva, color: "#FBBF24" },
                  { label: "Canceladas", value: estadoData.cancelada, color: "#F87171" },
                ]}
              />
            </section>

            <section className="mt-8">
              {/* Widget Cobertura RUC */}
              <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="text-[#1B7F4B] dark:text-emerald-400" size={20} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Cobertura RUC (Registro Único Comunal)
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Proporción de Juntas de Acción Comunal en el departamento del Cauca que cuentan
                    con el Registro Único Comunal (RUC) formalizado y activo.
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0 bg-slate-50 dark:bg-gray-900/40 p-4 rounded-xl border border-slate-100 dark:border-gray-750">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="34" className="stroke-slate-200 dark:stroke-gray-700 fill-none" strokeWidth="6" />
                      <circle cx="40" cy="40" r="34" className="stroke-[#1B7F4B] dark:stroke-emerald-400 fill-none transition-all duration-1000" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 34}`} strokeDashoffset={strokeOffset} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-base font-extrabold text-slate-800 dark:text-white">{rucPercent}%</span>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-[#1B7F4B] dark:text-emerald-400 leading-none">
                      <PopInNumber value={data.rucCount} replayKey={revealed} /> / {data.activeJacsCount}
                    </p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">JACs con RUC Activo</p>
                  </div>
                </div>
              </div>
            </section>

            <footer className="mt-8 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p>Plataforma JAC y Asocomunales</p>
                <p className="font-semibold text-[#1B7F4B]">Gobernación del Cauca © 2026</p>
              </div>
            </footer>
          </div>

          {/* Skeleton overlay mientras carga */}
          {showSkeleton && (
            <div
              className={`t-skel-skeleton ${revealed ? "pointer-events-none" : "is-pulsing"}`}
              aria-hidden="true"
            >
              <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-36" />
                ))}
              </section>
              <section className="mt-8 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm h-14" />
              <section className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
                <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-[680px]" />
                <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-[680px]" />
              </section>
              <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-[400px]" />
                <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-[400px]" />
              </section>
              <section className="mt-8 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-40" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardUsuario;
