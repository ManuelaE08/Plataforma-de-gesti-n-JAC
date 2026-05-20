import { useState, useEffect } from "react";
import { Building2, MapPin, FileText } from "lucide-react";
import StatCard from "../components/StatCard";
import DonutChart from "../components/DonutChart";
import BarChart from "../components/BarChart";
import { JACService, type PublicStats } from "../modules/jac/services/jacService";

function DashboardUsuario() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const data = await JACService.getPublicStats();
        if (active) {
          setStats(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Error al cargar estadísticas del Cauca.");
          setLoading(false);
        }
      }
    };
    fetchStats();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen px-2 py-4 sm:px-3 lg:px-5 animate-pulse">
        <div className="mx-auto w-full max-w-[calc(100vw-1.5rem)]">
          {/* Header Skeleton */}
          <section className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
            <div className="h-8 w-48 bg-slate-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="mt-3 h-4 w-96 bg-slate-200 dark:bg-gray-700 rounded-lg"></div>
          </section>

          {/* Cards Skeleton */}
          <section className="mt-8 grid gap-4 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-36"></div>
            ))}
          </section>

          {/* Charts Skeleton */}
          <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:px-0">
            <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-[400px]"></div>
            <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-[400px]"></div>
          </section>

          {/* Bottom Widget skeleton */}
          <section className="mt-8 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm h-40"></section>
        </div>
      </div>
    );
  }

  if (error || !stats) {
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

  const rucPercent = stats.activeJacsCount > 0 ? Math.round((stats.rucCount / stats.activeJacsCount) * 100) : 0;
  const strokeOffset = 2 * Math.PI * 34 * (1 - rucPercent / 100);

  return (
    <div className="min-h-screen px-2 py-4 sm:px-3 lg:px-5">
      <div className="mx-auto w-full max-w-[calc(100vw-1.5rem)]">
        <section className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
              Resumen estadístico y directorio de JAC y Asocomunales del departamento del Cauca.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-4 xl:grid-cols-3">
          <StatCard
            title="Total JACs Activas"
            value={stats.activeJacsCount}
            label="Estado Activa"
            icon={Building2}
            accentClass="bg-[#F0FDF4] dark:bg-emerald-950/20"
          />
          <StatCard
            title="Asocomunales"
            value={stats.totalAsocomunales}
            label="Organizaciones públicas"
            icon={Building2}
            accentClass="bg-white dark:bg-gray-800"
          />
          <StatCard
            title="Municipios"
            value={42}
            label="Cobertura Cauca"
            icon={MapPin}
            accentClass="bg-white dark:bg-gray-800"
          />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:px-0">
          <DonutChart urban={stats.urbanCount} rural={stats.ruralCount} total={stats.activeJacsCount} />
          <BarChart items={stats.topMunicipios} />
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
                Proporción de Juntas de Acción Comunal en el departamento del Cauca que cuentan con el Registro Único Comunal (RUC) formalizado y activo.
              </p>
              <div className="mt-4 flex items-center gap-2.5 text-xs text-slate-400 dark:text-slate-500">
              </div>
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
                <p className="text-3xl font-extrabold text-[#1B7F4B] dark:text-emerald-400 leading-none">{stats.rucCount} / {stats.activeJacsCount}</p>
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
    </div>
  );
}

export default DashboardUsuario;
