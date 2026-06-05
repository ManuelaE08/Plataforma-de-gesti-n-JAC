import { useEffect, useMemo, useState } from "react";
import { 
  Building2, 
  CalendarDays, 
  MapPin, 
  ShieldCheck, 
  Users, 
  XCircle, 
  GraduationCap, 
  Briefcase, 
  Layers,
  FileDown
} from "lucide-react";
import type { JacListItem } from "../modules/jac/types";
import PageHeader from "../components/ui/PageHeader";
import KpiCard from "../components/ui/KpiCard";
import CaucaMapGeoJSON from "../components/CaucaMapGeoJSON";
import { JACService } from "../modules/jac/services/jacService";
import { AfiliadosService, type AfiliadoResponse } from "../modules/jac/services/afiliadosService";
import { SolicitudesService } from "../modules/solicitudes/services/solicitudes.service";
import { ReporteAnaliticoService } from "../modules/analiticas/services/ReporteAnaliticoService";

const PERIOD_OPTIONS = ["7 días", "30 días", "90 días"] as const;

type Periodo = (typeof PERIOD_OPTIONS)[number];

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

function getMunicipioFromAfiliado(afiliado: AfiliadoResponse, jacs: JacListItem[]): string | null {
  if (!afiliado.jacId) {
    return null;
  }
  const jac = jacs.find((item) => item.id === afiliado.jacId);
  return jac?.municipio ?? null;
}

function parseDateField(value: unknown): Date | undefined {
  if (!value) return undefined;
  const date = new Date(String(value));
  return Number.isNaN(date.valueOf()) ? undefined : date;
}

function calcularEdad(fechaNacimientoStr: string): number {
  const nacimiento = new Date(fechaNacimientoStr);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return Number.isNaN(edad) ? 0 : edad;
}

export default function Analiticas() {
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
  const [jacs, setJacs] = useState<JacListItem[]>([]);
  const [afiliados, setAfiliados] = useState<AfiliadoResponse[]>([]);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);
  const [demografiaMunicipio, setDemografiaMunicipio] = useState<string | null>(null);
  const [demografiaSearchTerm, setDemografiaSearchTerm] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleGenerarReporte = async () => {
    try {
      setIsGeneratingPdf(true);
      const dto = ReporteAnaliticoService.construirModeloReporte(summary, periodo, jacs, demografiaReal);
      ReporteAnaliticoService.generarPDF(dto);
    } catch (err: any) {
      console.error("Error al generar el reporte:", err);
      alert("Error al generar el reporte: " + (err?.message || "Error desconocido"));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const stats = await JACService.getPublicStats();
        const [fetchedJacs, afiliadosResponse, solicitudes] = await Promise.all([
          JACService.findAll(stats.totalJACS),
          AfiliadosService.findAll().catch(() => [] as AfiliadoResponse[]),
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
        const totalAffiliados = afiliadosResponse.length > 0 ? afiliadosResponse.length : fetchedJacs.reduce((sum, item) => sum + item.afiliados, 0);
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
        setAfiliados(afiliadosResponse);
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

  const municipioOptions = useMemo(() => {
    return Array.from(new Set(jacs.map((item) => item.municipio).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  }, [jacs]);

  const normalizedDemografiaSearchTerm = normalizeMunicipioName(demografiaSearchTerm);
  const filteredMunicipios = useMemo(() => {
    if (!normalizedDemografiaSearchTerm) return municipioOptions;
    return municipioOptions.filter((name) => normalizeMunicipioName(name).includes(normalizedDemografiaSearchTerm));
  }, [municipioOptions, normalizedDemografiaSearchTerm]);

  const selectedStats = useMemo(() => {
    const active = selectedJacs.filter((item) => item.organizativo === "Activa").length;
    const inactive = selectedJacs.length - active;
    const totalAfiliados = selectedJacs.reduce((sum, item) => sum + item.afiliados, 0);
    return { active, inactive, totalAfiliados };
  }, [selectedJacs]);

  const demografiaReal = useMemo(() => {
    const nombreLugar = demografiaMunicipio ?? "Todo el Departamento (Cauca)";
    const afiliadosFiltrados = demografiaMunicipio
      ? afiliados.filter((a) => {
          const municipio = getMunicipioFromAfiliado(a, jacs);
          return municipio && normalizeMunicipioName(municipio) === normalizeMunicipioName(demografiaMunicipio);
        })
      : afiliados;

    const total = afiliadosFiltrados.length || 1;
    const generoCount: Record<string, number> = { Femenino: 0, Masculino: 0, "LGTBIQ+": 0 };
    const etniaCount: Record<string, number> = { Afro: 0, Indigena: 0, Mestizo: 0, Campesino: 0 };
    const edadCount = { jovenes: 0, adultos: 0, maduros: 0, mayores: 0 };
    const estudiosCount: Record<string, number> = { Primaria: 0, "Secundaria / Bachillerato": 0, "Técnico / Tecnólogo": 0, "Profesional / Posgrado": 0 };
    const ocupacionCount: Record<string, number> = {
      "Agricultura / Campo": 0,
      "Independiente / Comercio": 0,
      "Hogar / Labores de Cuidado": 0,
      "Empleado / Servicios": 0,
    };
    let discapacitadosCount = 0;

    afiliadosFiltrados.forEach((a) => {
      if (a.genero && generoCount[a.genero] !== undefined) {
        generoCount[a.genero]++;
      }
      if (a.grupoEtnico && etniaCount[a.grupoEtnico] !== undefined) {
        etniaCount[a.grupoEtnico]++;
      }

      const edad = calcularEdad(a.fechaNacimiento ?? "");
      if (edad >= 18 && edad <= 28) edadCount.jovenes++;
      else if (edad >= 29 && edad <= 45) edadCount.adultos++;
      else if (edad >= 46 && edad <= 64) edadCount.maduros++;
      else if (edad >= 65) edadCount.mayores++;

      if (a.estudiosRealizados && estudiosCount[a.estudiosRealizados] !== undefined) {
        estudiosCount[a.estudiosRealizados]++;
      }

      if (a.ocupacion && ocupacionCount[a.ocupacion] !== undefined) {
        ocupacionCount[a.ocupacion]++;
      }

      if (Boolean(a.discapacitado)) discapacitadosCount++;
    });

    const obtenerPct = (val: number) => Math.round((val / total) * 100);

    return {
      lugar: nombreLugar,
      totalRegistros: afiliadosFiltrados.length,
      genero: [
        { label: "Femenino", porcentaje: obtenerPct(generoCount.Femenino), count: generoCount.Femenino, color: "bg-pink-500" },
        { label: "Masculino", porcentaje: obtenerPct(generoCount.Masculino), count: generoCount.Masculino, color: "bg-blue-500" },
        { label: "LGTBIQ+", porcentaje: obtenerPct(generoCount["LGTBIQ+"]), count: generoCount["LGTBIQ+"], color: "bg-indigo-500" },
      ],
      etnia: [
        { label: "Afro", porcentaje: obtenerPct(etniaCount.Afro), count: etniaCount.Afro, color: "bg-amber-700" },
        { label: "Indígena", porcentaje: obtenerPct(etniaCount.Indigena), count: etniaCount.Indigena, color: "bg-emerald-600" },
        { label: "Mestizo", porcentaje: obtenerPct(etniaCount.Mestizo), count: etniaCount.Mestizo, color: "bg-slate-500" },
        { label: "Campesino", porcentaje: obtenerPct(etniaCount.Campesino), count: etniaCount.Campesino, color: "bg-orange-500" },
      ],
      edad: [
        { label: "18 - 28 años (Jóvenes)", porcentaje: obtenerPct(edadCount.jovenes), count: edadCount.jovenes, color: "bg-cyan-500" },
        { label: "29 - 45 años", porcentaje: obtenerPct(edadCount.adultos), count: edadCount.adultos, color: "bg-teal-500" },
        { label: "46 - 64 años", porcentaje: obtenerPct(edadCount.maduros), count: edadCount.maduros, color: "bg-sky-600" },
        { label: "65+ años (Adulto Mayor)", porcentaje: obtenerPct(edadCount.mayores), count: edadCount.mayores, color: "bg-violet-500" },
      ],
      estudios: [
        { label: "Primaria", porcentaje: obtenerPct(estudiosCount.Primaria), count: estudiosCount.Primaria },
        { label: "Secundaria / Bachillerato", porcentaje: obtenerPct(estudiosCount.Secundaria), count: estudiosCount.Secundaria },
        { label: "Técnico / Tecnólogo", porcentaje: obtenerPct(estudiosCount.Tecnico), count: estudiosCount.Tecnico },
        { label: "Profesional / Posgrado", porcentaje: obtenerPct(estudiosCount.Profesional), count: estudiosCount.Profesional },
      ],
      ocupacion: [
        { label: "Agricultura / Campo", porcentaje: obtenerPct(ocupacionCount.Agricultura), count: ocupacionCount.Agricultura },
        { label: "Independiente / Comercio", porcentaje: obtenerPct(ocupacionCount.Comercio), count: ocupacionCount.Comercio },
        { label: "Hogar / Labores de Cuidado", porcentaje: obtenerPct(ocupacionCount.Hogar), count: ocupacionCount.Hogar },
        { label: "Empleado / Servicios", porcentaje: obtenerPct(ocupacionCount.Empleado), count: ocupacionCount.Empleado },
      ],
      discapacidad: [
        { label: "Población con Discapacidad", porcentaje: obtenerPct(discapacitadosCount), count: discapacitadosCount, color: "bg-rose-500" },
        { label: "Sin condición reportada", porcentaje: obtenerPct(total - discapacitadosCount), count: total - discapacitadosCount, color: "bg-slate-200 dark:bg-gray-700" },
      ],
    };
  }, [afiliados, jacs, demografiaMunicipio]);

  return (
    <div className="min-h-screen px-2 py-4 sm:px-3 lg:px-5">
      <div className="mx-auto w-full max-w-[calc(100vw-1.5rem)]">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <PageHeader
              title="Analíticas Ejecutivas"
              subtitle="Visión de decisión para JAC y Asocomunales del Cauca"
              description="Indicadores operativos, territoriales y de participación para administradores y operadores."
            />
          </div>
          <div className="md:mt-6">
            <button
              onClick={handleGenerarReporte}
              disabled={loading || isGeneratingPdf}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
            >
              <FileDown size={20} />
              {isGeneratingPdf ? "Generando..." : "Generar Informe PDF"}
            </button>
          </div>
        </div>

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
            {/* Fila 1: KPIs */}
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

            {/* Fila 2: Mapa de Cobertura Territorial */}
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
                        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Municipio seleccionado</p>
                          <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{selectedMunicipio}</p>
                        </div>
                        <button
                          onClick={() => setSelectedMunicipio(null)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 hover:text-red-800"
                        >
                          <XCircle size={16} /> Quitar filtro
                        </button>
                      </div>
                        <div className="grid gap-3">
                          <div className="rounded-2xl bg-white p-4 dark:bg-gray-950 shadow-sm border border-slate-100 dark:border-gray-800">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">JAC registradas</p>
                            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{selectedJacs.length}</p>
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
                        <p className="text-base font-bold text-slate-800 dark:text-slate-300 mb-3">Listado de JAC en {selectedMunicipio}</p>
                        <div className="space-y-4 overflow-y-auto pr-1 flex-1 max-h-[320px]">
                          {selectedJacs.length === 0 ? (
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 dark:border-gray-800 dark:bg-gray-900">
                              <p className="text-base font-semibold text-slate-900 dark:text-white">No se encontraron JAC registradas para este municipio.</p>
                            </div>
                          ) : (
                            selectedJacs.map((jac) => (
                              <div key={jac.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4 dark:border-gray-800 dark:bg-gray-900">
                                <p className="font-semibold text-sm text-slate-900 dark:text-white">{jac.nombre}</p>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
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

            {/* INDICADORES DEMOGRÁFICOS DE AFILIADOS */}
            <section className="mt-6 rounded-3xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6 border-b border-slate-100 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Analítica de Población</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Indicadores Demográficos de Afiliados</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 relative overflow-visible">
                    <label htmlFor="demografia-search" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Buscar municipio</label>
                    <input
                      id="demografia-search"
                      type="search"
                      value={demografiaSearchTerm}
                      onChange={(event) => setDemografiaSearchTerm(event.target.value)}
                      placeholder="Municipio para analítica..."
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-900 dark:text-slate-100"
                    />
                    {demografiaSearchTerm && (
                      <div className="absolute inset-x-0 top-full z-50 mt-3 rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                        <div className="p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">Selecciona un municipio</p>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{filteredMunicipios.length} resultado(s)</span>
                          </div>
                          <div className="grid gap-2 max-h-56 overflow-y-auto">
                            {filteredMunicipios.length > 0 ? (
                              filteredMunicipios.slice(0, 8).map((name) => (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => {
                                    setDemografiaMunicipio(name);
                                    setDemografiaSearchTerm("");
                                  }}
                                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-900 transition hover:border-indigo-300 hover:bg-indigo-100 dark:border-gray-700 dark:bg-gray-950 dark:text-slate-100"
                                >
                                  {name}
                                </button>
                              ))
                            ) : (
                              <p className="text-sm text-slate-500 dark:text-slate-400">No se han encontrado municipios con ese nombre.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 sm:items-end">
                    {demografiaMunicipio && (
                      <div className="inline-flex items-center gap-3 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300">
                        <span>Filtrando: {demografiaMunicipio}</span>
                        <button
                          type="button"
                          onClick={() => setDemografiaMunicipio(null)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100 text-indigo-700 transition hover:bg-indigo-200 hover:text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/70"
                          aria-label="Quitar filtro"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid Principal Temático */}
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                
                {/* Bloque 1: Género y Grupo Étnico */}
                <div className="rounded-3xl border border-slate-100 dark:border-gray-700 bg-slate-50/40 dark:bg-gray-900/30 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 font-bold text-slate-800 dark:text-slate-200 mb-5">
                      <Layers size={18} className="text-indigo-500" />
                      <span className="text-xl">GENERO</span>
                    </div>
                    
                    {/* Subgrup: Género */}
                    <div className="mb-6">
                      <div className="space-y-4">
                        {demografiaReal.genero.map((g) => (
                          <div key={g.label}>
                            <div className="flex justify-between text-base font-medium text-slate-600 dark:text-slate-400 mb-2">
                              <span>{g.label}</span>
                              <span className="font-bold">{g.porcentaje}% · {g.count}</span>
                            </div>
                            <div className="h-4 w-full bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className={`h-full ${g.color}`} style={{ width: `${g.porcentaje}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subgrup: Grupo Étnico */}
                    <div>
                      <div className="flex items-center gap-3 font-bold text-slate-800 dark:text-slate-200 mb-5">
                        <Layers size={16} className="text-indigo-500" />
                        <span className="text-xl">GRUPO ETNICO</span>
                      </div>
                      <div className="space-y-4">
                        {demografiaReal.etnia.map((e) => (
                          <div key={e.label}>
                            <div className="flex justify-between text-base font-medium text-slate-600 dark:text-slate-400 mb-2">
                              <span>{e.label}</span>
                              <span className="font-bold">{e.porcentaje}% · {e.count}</span>
                            </div>
                            <div className="h-4 w-full bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className={`h-full ${e.color}`} style={{ width: `${e.porcentaje}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bloque 2: Rangos de Edad y Discapacidad */}
                <div className="rounded-3xl border border-slate-100 dark:border-gray-700 bg-slate-50/40 dark:bg-gray-900/30 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 font-bold text-slate-800 dark:text-slate-200 mb-5">
                      <CalendarDays size={18} className="text-indigo-500" />
                      <span className="text-xl">DISTRIBUCION POR EDADES</span>
                    </div>

                    {/* Subgrup: Edad */}
                    <div className="mb-6">
                      <div className="space-y-4">
                        {demografiaReal.edad.map((ed) => (
                          <div key={ed.label}>
                            <div className="flex justify-between text-base font-medium text-slate-600 dark:text-slate-400 mb-2">
                              <span>{ed.label}</span>
                              <span className="font-bold">{ed.porcentaje}% · {ed.count}</span>
                            </div>
                            <div className="h-4 w-full bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className={`h-full ${ed.color}`} style={{ width: `${ed.porcentaje}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subgrup: Discapacidad */}
                    <div>
                      <div className="flex items-center gap-3 font-bold text-slate-800 dark:text-slate-200 mb-5">
                        <ShieldCheck size={16} className="text-indigo-500" />
                        <span className="text-xl">INCLUSION Y DISCAPACIDAD</span>
                      </div>
                      <div className="space-y-4 mt-2">
                        <div className="flex h-4 w-full rounded-full overflow-hidden bg-slate-200 dark:bg-gray-700">
                          <div className="bg-rose-500 h-full" style={{ width: `${demografiaReal.discapacidad[0].porcentaje}%` }}></div>
                          <div className="bg-emerald-500 h-full" style={{ width: `${demografiaReal.discapacidad[1].porcentaje}%` }}></div>
                        </div>
                        <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
                          {demografiaReal.discapacidad.map((d, index) => (
                            <div key={d.label} className="flex items-center gap-2 text-base">
                              <span className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                              <span className="text-slate-500 dark:text-slate-300">{d.label}: <strong>{d.porcentaje}%</strong> ({d.count})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bloque 3: Educación y Ocupación */}
                <div className="rounded-3xl border border-slate-100 dark:border-gray-700 bg-slate-50/40 dark:bg-gray-900/30 p-6 flex flex-col justify-between md:col-span-2 xl:col-span-1">
                  <div>
                    <div className="flex items-center gap-3 font-bold text-slate-800 dark:text-slate-200 mb-5">
                      <GraduationCap size={18} className="text-indigo-500" />
                      <span className="text-xl">ESTUDIOS Y OCUPACION</span>
                    </div>

                    {/* Subgrup: Estudios Realizados */}
                    <div className="mb-6">
                      <div className="space-y-4">
                        {demografiaReal.estudios.map((est) => (
                          <div key={est.label} className="flex items-center justify-between text-base">
                            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                              <GraduationCap size={16} className="text-slate-400" />
                              {est.label}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white bg-slate-200/60 dark:bg-gray-800 px-4 py-1.5 rounded-md">
                              {est.porcentaje}% · {est.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subgrup: Ocupación */}
                    <div>
                      <div className="flex items-center gap-3 font-bold text-slate-800 dark:text-slate-200 mb-5">
                        <Briefcase size={16} className="text-indigo-500" />
                        <span className="text-xl">OCUPACION PRINCIPAL</span>
                      </div>
                      <div className="space-y-4">
                        {demografiaReal.ocupacion.map((oc) => (
                          <div key={oc.label} className="flex items-center justify-between text-base">
                            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                              <Briefcase size={16} className="text-slate-400" />
                              {oc.label}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white bg-slate-200/60 dark:bg-gray-800 px-4 py-1.5 rounded-md">
                              {oc.porcentaje}% · {oc.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Fila 4: Tarjetas de estadísticas de soporte/análisis en 2 columnas principales */}
            <section className="mt-6 grid gap-4 grid-cols-1 lg:grid-cols-2 items-stretch">
              
              {/* TARJETA 1: Estado Organizativo */}
              <div className="rounded-3xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm flex flex-col justify-between">
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

              {/* TARJETA 2: Período y Solicitudes */}
              <div className="rounded-3xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm flex flex-col justify-between">
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
                        <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">{formatNumber(summary.rejectedThisMonth)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </section>
          </>
        )}
      </div>
    </div>
  );
}