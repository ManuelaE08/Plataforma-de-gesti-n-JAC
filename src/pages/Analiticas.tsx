import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, MapPin, ShieldCheck, Users, XCircle } from "lucide-react";
import type { JacListItem } from "../modules/jac/types";
import PageHeader from "../components/ui/PageHeader";
import KpiCard from "../components/ui/KpiCard";
import BarChart from "../components/BarChart";
import CaucaMapGeoJSON from "../components/CaucaMapGeoJSON";
import DonutChart from "../components/DonutChart";
import { JACService } from "../modules/jac/services/jacService";
import { AfiliadosService } from "../modules/jac/services/afiliadosService";
import { SolicitudesService } from "../modules/solicitudes/services/solicitudes.service";

type Periodo = "7 días" | "30 días" | "90 días";


interface TopItem {
  municipio: string;
  count: number;
}

const PERIOD_OPTIONS: Periodo[] = ["7 días", "30 días", "90 días"];

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

function normalizeMunicipioName(name: string): string {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[-–—]+/g, " - ")
    .replace(/^PIENDAMO.*$/, "PIENDAMO - TUNIA")
    .replace(/^SOTARA.*$/, "SOTARA - PAISPAMPA")
    .replace(/^TOTORO$/, "TOTORO");
}

function parseDateField(value: unknown): Date | undefined {
  if (!value) return undefined;
  const date = new Date(String(value));
  return Number.isNaN(date.valueOf()) ? undefined : date;
}



function Analiticas() {
  const [periodo, setPeriodo] = useState<Periodo>("30 días");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalJacs: 0,
    totalAsocomunales: 0,
    activeJacs: 0,
    inactiveJacs: 0,
    totalAffiliados: 0,
    avgAffiliados: 0,
    pendingRequests: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
  });
  const [topJacs, setTopJacs] = useState<TopItem[]>([]);
  const [jacs, setJacs] = useState<JacListItem[]>([]);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [stats, fetchedJacs, afiliados, solicitudes] = await Promise.all([
          JACService.getPublicStats(),
          JACService.findAll(1000),
          AfiliadosService.findAll().catch(() => []),
          (async () => {
            try {
              return await SolicitudesService.getTodas();
            } catch {
              return await SolicitudesService.getMias();
            }
          })(),
        ]);

        if (!active) return;

        const activeJacs = stats.activeJacsCount;
        const inactiveJacs = stats.totalJACS - stats.activeJacsCount;
        const totalAffiliados = afiliados.length > 0 ? afiliados.length : fetchedJacs.reduce((sum, item) => sum + item.afiliados, 0);
        const avgAffiliados = fetchedJacs.length > 0 ? Math.round(totalAffiliados / fetchedJacs.length) : 0;

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const approvedThisMonth = solicitudes.filter((item) => {
          const date = parseDateField(item?.fecha);
          return item?.estado === "Aprobada" && date?.getMonth() === thisMonth && date?.getFullYear() === thisYear;
        }).length;

        const rejectedThisMonth = solicitudes.filter((item) => {
          const date = parseDateField(item?.fecha);
          return item?.estado === "Rechazada" && date?.getMonth() === thisMonth && date?.getFullYear() === thisYear;
        }).length;

        const pendingRequests = solicitudes.filter((item) => item?.estado === "Pendiente").length;
        const topJacsItems = stats.topMunicipios.slice(0, 10).map((item) => ({ municipio: item.municipio, count: item.count }));

        setSummary({
          totalJacs: stats.totalJACS,
          totalAsocomunales: stats.totalAsocomunales,
          activeJacs,
          inactiveJacs,
          totalAffiliados,
          avgAffiliados,
          pendingRequests,
          approvedThisMonth,
          rejectedThisMonth,
        });
        setJacs(fetchedJacs);
        setTopJacs(topJacsItems);
      } catch (fetchError: any) {
        setError(fetchError?.message || "No se pudo cargar la información de analíticas.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const selectedJacs = useMemo(() => {
    if (!selectedMunicipio) return [];
    const normalizedSelected = normalizeMunicipioName(selectedMunicipio);
    return jacs.filter((item) => normalizeMunicipioName(item.municipio) === normalizedSelected);
  }, [jacs, selectedMunicipio]);

  const selectedStats = useMemo(() => {
    const active = selectedJacs.filter((item) => item.organizativo === "Activa").length;
    const inactive = selectedJacs.length - active;
    const totalAfiliados = selectedJacs.reduce((sum, item) => sum + item.afiliados, 0);
    return { active, inactive, totalAfiliados };
  }, [selectedJacs]);

  const filteredTopJacs = useMemo(() => topJacs.slice(0, 10), [topJacs]);

  return (
    <div className="min-h-screen px-2 py-4 sm:px-3 lg:px-5">
      <div className="mx-auto w-full max-w-[calc(100vw-1.5rem)]">
        <PageHeader
          title="Analíticas Ejecutivas"
          subtitle="Visión de decisión para JAC y Asocomunales del Cauca"
          description="Indicadores operativos, territoriales y de participaci–n para administradores y operadores."
        />

        {loading ? (
          <div className="mt-8 grid gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-32 rounded-3xl bg-slate-200 dark:bg-gray-700 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/50 dark:bg-red-950/10">
            <p className="font-semibold">Error al cargar los datos.</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : (
          <>
            <section className="mt-8 grid gap-4 xl:grid-cols-4">
              <KpiCard
                label="JAC registradas"
                value={formatNumber(summary.totalJacs)}
                sub="Total de juntas activas e inactivas"
                icon={Building2}
                iconBg="bg-[#1B7F4B]/10 dark:bg-[#1B7F4B]/20"
                iconColor="text-[#1B7F4B] dark:text-emerald-400"
              />
              <KpiCard
                label="Asocomunales"
                value={formatNumber(summary.totalAsocomunales)}
                sub="Entidades asociadas al sistema"
                icon={ShieldCheck}
                iconBg="bg-[#2563EB]/10 dark:bg-[#2563EB]/20"
                iconColor="text-[#2563EB] dark:text-blue-400"
              />
              <KpiCard
                label="Afiliados totales"
                value={formatNumber(summary.totalAffiliados)}
                sub="Registro acumulado en el sistema"
                icon={Users}
                iconBg="bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20"
                iconColor="text-[#F59E0B] dark:text-amber-400"
              />
              <KpiCard
                label="Promedio afiliados / JAC"
                value={formatNumber(summary.avgAffiliados)}
                sub="Media de miembros por junta"
                icon={CalendarDays}
                iconBg="bg-[#EF4444]/10 dark:bg-red-900/20"
                iconColor="text-red-500 dark:text-red-400"
              />
            </section>

            {/* Fila 2: Mapa de Cobertura Territorial (directamente bajo los KPI) */}
            <section className="mt-6 rounded-3xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-2xl bg-[#1B7F4B]/10 p-3 text-[#1B7F4B] dark:bg-[#1B7F4B]/20 dark:text-emerald-300">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Mapa de JAC</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Cobertura territorial y análisis municipal</p>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-[1.8fr_1.2fr]">
                <div>
                  <CaucaMapGeoJSON
                    jacs={jacs}
                    selectedMunicipio={selectedMunicipio ?? undefined}
                    onSelect={(municipio) => setSelectedMunicipio(municipio)}
                  />
                </div>
                <div className="rounded-3xl border border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/60 p-6 shadow-inner flex flex-col justify-between min-h-[500px]">
                  {selectedMunicipio ? (
                    <div className="flex flex-col h-full justify-between gap-6">
                      <div>
                        <div className="mb-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Municipio seleccionado</p>
                          <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">{selectedMunicipio}</p>
                        </div>
                        <div className="grid gap-3">
                          <div className="rounded-2xl bg-white p-4 dark:bg-gray-950 shadow-sm border border-slate-100 dark:border-gray-800">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">JAC registradas</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{selectedJacs.length}</p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-white p-4 dark:bg-gray-950 shadow-sm border border-slate-100 dark:border-gray-800">
                              <p className="text-xs font-medium text-emerald-600">Activas</p>
                              <p className="mt-1 text-2xl font-bold text-emerald-600">{selectedStats.active}</p>
                            </div>
                            <div className="rounded-2xl bg-white p-4 dark:bg-gray-950 shadow-sm border border-slate-100 dark:border-gray-800">
                              <p className="text-xs font-medium text-amber-600">Inactivas</p>
                              <p className="mt-1 text-2xl font-bold text-amber-600">{selectedStats.inactive}</p>
                            </div>
                          </div>
                          <div className="rounded-2xl bg-white p-4 dark:bg-gray-950 shadow-sm border border-slate-100 dark:border-gray-800">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Afiliados totales</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{selectedStats.totalAfiliados}</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white p-4 dark:bg-gray-950 shadow-sm flex-1 flex flex-col min-h-[220px]">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-3">Listado de JAC en {selectedMunicipio}</p>
                        <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[260px]">
                          {selectedJacs.length === 0 ? (
                            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-6 dark:border-gray-800 dark:bg-gray-900">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">No se encontraron JAC registradas para este municipio.</p>
                            </div>
                          ) : (
                            selectedJacs.map((jac) => (
                              <div key={jac.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-gray-800 dark:bg-gray-900">
                                <p className="font-semibold text-xs text-slate-900 dark:text-white">{jac.nombre}</p>
                                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                  {jac.barrio} – {jac.organizativo} – {jac.afiliados} afiliados
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-center items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-slate-500 dark:border-gray-700 dark:bg-gray-950 dark:text-slate-300">
                      <MapPin size={48} className="text-slate-300 dark:text-slate-600 mb-4 animate-bounce" />
                      <p className="font-bold text-slate-850 dark:text-slate-200">Selecciona un municipio</p>
                      <p className="mt-2 text-xs leading-5 max-w-xs">Haz clic en cualquier municipio en el mapa para ver de forma detallada sus estadísticas y las JAC registradas.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Fila 3: Tarjetas de estadísticas de soporte/análisis en 3 columnas */}
            {/* Contenedor principal: Mantiene las 3 columnas y estira los hijos equitativamente */}
<section className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-3 items-stretch">
  
  {/* COLUMNA IZQUIERDA: Dos tarjetas independientes que juntas igualan la altura de la derecha */}
  <div className="lg:col-span-2 flex flex-col gap-4">
    
    {/* TARJETA 1: Estado Organizativo */}
    <div className="flex-1 rounded-3xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Estado organizativo</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Activas / Inactivas</p>
          </div>
          <div className="rounded-3xl bg-slate-100 px-4 py-2 text-sm text-slate-700 dark:bg-gray-900 dark:text-slate-300 font-medium">
            Cauca
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Activas</span>
              <span>{formatNumber(summary.activeJacs)}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-[#1B7F4B]"
                style={{ width: `${summary.totalJacs ? (summary.activeJacs / summary.totalJacs) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Inactivas</span>
              <span>{formatNumber(summary.inactiveJacs)}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-[#F59E0B]"
                style={{ width: `${summary.totalJacs ? (summary.inactiveJacs / summary.totalJacs) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* TARJETA 2: Período */}
    <div className="flex-1 rounded-3xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Período</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{periodo}</p>
          </div>
          <select
            value={periodo}
            onChange={(event) => setPeriodo(event.target.value as Periodo)}
            className="appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-[#1B7F4B] focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/20 dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        
        <div className="mt-6 grid gap-4">
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-gray-900 dark:text-slate-300">
            <p className="font-semibold">Solicitudes pendientes</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{formatNumber(summary.pendingRequests)}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-gray-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Aprobadas este mes</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-300">{formatNumber(summary.approvedThisMonth)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-gray-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Rechazadas este mes</p>
              <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-300">{formatNumber(summary.rejectedThisMonth)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  {/* TARJETA 3: Distribución (Modificada para ser una sola tarjeta limpia sin sub-contenedores) */}
 
    {/* El gráfico ahora respira directamente en el flujo de la tarjeta principal */}
    <DonutChart 
      urban={summary.totalJacs ? summary.totalAffiliados : 0} 
      rural={summary.totalJacs ? summary.totalAffiliados : 0} 
      total={summary.totalJacs} 
    />



</section>

            <section className="mt-6 grid gap-4 xl:grid-cols-2">
                <BarChart items={filteredTopJacs} />
            </section>

            <footer className="mt-8 rounded-3xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p>Panel ejecutivo JAC / Asocomunales - Cauca</p>
                <p className="font-semibold text-[#1B7F4B]">Gobernación del Cauca – 2026</p>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

export default Analiticas;
