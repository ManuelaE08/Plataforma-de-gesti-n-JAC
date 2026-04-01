import { useMemo, useState } from "react";

type Periodo = "7 días" | "30 días" | "90 días";
type NivelRiesgo = "Alto" | "Medio" | "Bajo";

interface Filters {
  periodo: Periodo;
  municipio: string;
}

export interface KpiAnalitica {
  label: string;
  value: string;
  detail: string;
  tone: "green" | "blue" | "amber" | "red";
}

export interface MunicipioSerie {
  municipio: string;
  jac: number;
  asocomunales: number;
}

export interface RiesgoItem {
  nombre: string;
  municipio: string;
  nivel: NivelRiesgo;
  causa: string;
}

const initialFilters: Filters = {
  periodo: "30 días",
  municipio: "",
};

const baseKpis: Record<Periodo, KpiAnalitica[]> = {
  "7 días": [
    { label: "Registros nuevos", value: "18", detail: "Última semana", tone: "green" },
    { label: "Solicitudes", value: "9", detail: "Pendientes de revisión", tone: "amber" },
    { label: "Alertas", value: "5", detail: "Riesgo organizativo", tone: "red" },
    { label: "Reportes", value: "11", detail: "Generados", tone: "blue" },
  ],
  "30 días": [
    { label: "Registros nuevos", value: "64", detail: "Último mes", tone: "green" },
    { label: "Solicitudes", value: "27", detail: "Pendientes de revisión", tone: "amber" },
    { label: "Alertas", value: "12", detail: "Riesgo organizativo", tone: "red" },
    { label: "Reportes", value: "24", detail: "Generados", tone: "blue" },
  ],
  "90 días": [
    { label: "Registros nuevos", value: "142", detail: "Último trimestre", tone: "green" },
    { label: "Solicitudes", value: "51", detail: "Pendientes de revisión", tone: "amber" },
    { label: "Alertas", value: "19", detail: "Riesgo organizativo", tone: "red" },
    { label: "Reportes", value: "58", detail: "Generados", tone: "blue" },
  ],
};

const municipiosData: MunicipioSerie[] = [
  { municipio: "Popayán", jac: 34, asocomunales: 8 },
  { municipio: "Santander", jac: 18, asocomunales: 5 },
  { municipio: "Patía", jac: 16, asocomunales: 4 },
  { municipio: "Timbío", jac: 14, asocomunales: 3 },
  { municipio: "Piendamó", jac: 12, asocomunales: 3 },
];

const riesgoData: RiesgoItem[] = [
  {
    nombre: "JAC Vereda El Porvenir",
    municipio: "Piendamó",
    nivel: "Alto",
    causa: "Documentación vencida e inactividad reciente",
  },
  {
    nombre: "Asocomunal Timbío",
    municipio: "Timbío",
    nivel: "Medio",
    causa: "Pendiente de actualización documental",
  },
  {
    nombre: "JAC Barrio Centro",
    municipio: "Timbío",
    nivel: "Bajo",
    causa: "Soportes próximos a vencer",
  },
  {
    nombre: "JAC La Esmeralda",
    municipio: "Popayán",
    nivel: "Medio",
    causa: "Observaciones en validación organizativa",
  },
];

export function useAnaliticas() {
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const kpis = useMemo(() => baseKpis[filters.periodo], [filters.periodo]);

  const series = useMemo(() => {
    if (!filters.municipio) return municipiosData;
    return municipiosData.filter((item) => item.municipio === filters.municipio);
  }, [filters.municipio]);

  const riesgos = useMemo(() => {
    if (!filters.municipio) return riesgoData;
    return riesgoData.filter((item) => item.municipio === filters.municipio);
  }, [filters.municipio]);

  return {
    filters,
    kpis,
    series,
    riesgos,
    setPeriodo: (value: Periodo) =>
      setFilters((prev) => ({ ...prev, periodo: value })),
    setMunicipio: (value: string) =>
      setFilters((prev) => ({ ...prev, municipio: value })),
  };
}