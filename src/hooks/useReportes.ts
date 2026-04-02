import { useState } from "react";

type EstadoReporte = "Generado" | "Pendiente" | "Error";
type TipoReporte = | "Consolidado JAC" | "Consolidado Asocomunales" | "Estado documental" | "Riesgo organizativo" | "Usuarios" | "Auditoría";

export interface ReporteItem {
  nombre: string;
  tipo: TipoReporte;
  fecha: string;
  formato: "PDF" | "Excel" | "CSV";
  estado: EstadoReporte;
  generadoPor: string;
}

interface ReportesFilters {
  busqueda: string;
  tipo: string;
  formato: string;
  estado: string;
  fecha: string;
}

const reportesData: ReporteItem[] = [
  {
    nombre: "Reporte general de JAC - Marzo 2026",
    tipo: "Consolidado JAC",
    fecha: "2026-03-28",
    formato: "PDF",
    estado: "Generado",
    generadoPor: "Administrador/Auditor",
  },
  {
    nombre: "Asocomunales activas por municipio",
    tipo: "Consolidado Asocomunales",
    fecha: "2026-03-27",
    formato: "Excel",
    estado: "Generado",
    generadoPor: "Administrador/Auditor",
  },
  {
    nombre: "Documentación pendiente de actualización",
    tipo: "Estado documental",
    fecha: "2026-03-26",
    formato: "CSV",
    estado: "Pendiente",
    generadoPor: "Administrador/Auditor",
  },
  {
    nombre: "Organizaciones en riesgo alto",
    tipo: "Riesgo organizativo",
    fecha: "2026-03-24",
    formato: "PDF",
    estado: "Generado",
    generadoPor: "Administrador/Auditor",
  },
  {
    nombre: "Reporte de usuarios y roles",
    tipo: "Usuarios",
    fecha: "2026-03-22",
    formato: "Excel",
    estado: "Error",
    generadoPor: "Administrador/Auditor",
  },
  {
    nombre: "Historial de acciones del sistema",
    tipo: "Auditoría",
    fecha: "2026-03-20",
    formato: "CSV",
    estado: "Generado",
    generadoPor: "Administrador/Auditor",
  },
];

const initialFilters: ReportesFilters = {
  busqueda: "",
  tipo: "",
  formato: "",
  estado: "",
  fecha: "",
};

export const columns: string[] = [
  "Nombre del reporte",
  "Tipo",
  "Fecha",
  "Formato",
  "Estado",
  "Generado por",
  "Acciones",
];

export const estadoVariant: Record<EstadoReporte, "green" | "amber" | "red"> = {
  Generado: "green",
  Pendiente: "amber",
  Error: "red",
};

export function useReportes() {
  const [filters, setFilters] = useState<ReportesFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<ReportesFilters>(initialFilters);

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const filtered = reportesData.filter((item) => {
    const matchBusqueda =
      !appliedFilters.busqueda ||
      [item.nombre, item.tipo, item.generadoPor].some((value) =>
        value.toLowerCase().includes(appliedFilters.busqueda.toLowerCase())
      );

    const matchTipo =
      !appliedFilters.tipo || item.tipo === appliedFilters.tipo;

    const matchFormato =
      !appliedFilters.formato || item.formato === appliedFilters.formato;

    const matchEstado =
      !appliedFilters.estado || item.estado === appliedFilters.estado;

    const matchFecha =
      !appliedFilters.fecha || item.fecha === appliedFilters.fecha;

    return (
      matchBusqueda &&
      matchTipo &&
      matchFormato &&
      matchEstado &&
      matchFecha
    );
  });

  return {
    filters,
    filtered,
    handleSearch,
    handleClear,
    setBusqueda: (value: string) =>
      setFilters((prev) => ({ ...prev, busqueda: value })),
    setTipo: (value: string) =>
      setFilters((prev) => ({ ...prev, tipo: value })),
    setFormato: (value: string) =>
      setFilters((prev) => ({ ...prev, formato: value })),
    setEstado: (value: string) =>
      setFilters((prev) => ({ ...prev, estado: value })),
    setFecha: (value: string) =>
      setFilters((prev) => ({ ...prev, fecha: value })),
  };
}