import { useState, useEffect, useRef } from "react";

type EstadoReporte = "Generado" | "Pendiente" | "Error";
type TipoReporte =
  | "Consolidado JAC" | "Consolidado Asocomunales" | "Estado documental"
  | "Riesgo organizativo" | "Usuarios" | "Auditoría";

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

const initialFilters: ReportesFilters = {
  busqueda: "", tipo: "", formato: "", estado: "", fecha: "",
};

const reportesData: ReporteItem[] = [
  { nombre: "Reporte general de JAC - Marzo 2026",        tipo: "Consolidado JAC",            fecha: "2026-03-28", formato: "PDF",   estado: "Generado",  generadoPor: "Administrador/Auditor" },
  { nombre: "Asocomunales activas por municipio",          tipo: "Consolidado Asocomunales",   fecha: "2026-03-27", formato: "Excel", estado: "Generado",  generadoPor: "Administrador/Auditor" },
  { nombre: "Documentación pendiente de actualización",    tipo: "Estado documental",          fecha: "2026-03-26", formato: "CSV",   estado: "Pendiente", generadoPor: "Administrador/Auditor" },
  { nombre: "Organizaciones en riesgo alto",               tipo: "Riesgo organizativo",        fecha: "2026-03-24", formato: "PDF",   estado: "Generado",  generadoPor: "Administrador/Auditor" },
  { nombre: "Reporte de usuarios y roles",                 tipo: "Usuarios",                   fecha: "2026-03-22", formato: "Excel", estado: "Error",     generadoPor: "Administrador/Auditor" },
  { nombre: "Historial de acciones del sistema",           tipo: "Auditoría",                  fecha: "2026-03-20", formato: "CSV",   estado: "Generado",  generadoPor: "Administrador/Auditor" },
];

export const columns: string[] = [
  "Nombre del reporte", "Tipo", "Fecha", "Formato", "Estado", "Generado por", "Acciones",
];

export const estadoVariant: Record<EstadoReporte, "green" | "amber" | "red"> = {
  Generado: "green", Pendiente: "amber", Error: "red",
};

export function useReportes() {
  const [filters, setFilters] = useState<ReportesFilters>(initialFilters);
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedBusqueda(filters.busqueda), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters.busqueda]);

  const handleClear = () => {
    setFilters(initialFilters);
    setDebouncedBusqueda("");
  };

  const filtered = reportesData.filter((item) => {
    const matchBusqueda =
      !debouncedBusqueda ||
      [item.nombre, item.tipo, item.generadoPor].some((v) =>
        v.toLowerCase().includes(debouncedBusqueda.toLowerCase())
      );
    const matchTipo    = !filters.tipo    || item.tipo    === filters.tipo;
    const matchFormato = !filters.formato || item.formato === filters.formato;
    const matchEstado  = !filters.estado  || item.estado  === filters.estado;
    const matchFecha   = !filters.fecha   || item.fecha   === filters.fecha;
    return matchBusqueda && matchTipo && matchFormato && matchEstado && matchFecha;
  });

  return {
    filters,
    filtered,
    handleClear,
    setBusqueda: (v: string) => setFilters((p) => ({ ...p, busqueda: v })),
    setTipo:     (v: string) => setFilters((p) => ({ ...p, tipo: v })),
    setFormato:  (v: string) => setFilters((p) => ({ ...p, formato: v })),
    setEstado:   (v: string) => setFilters((p) => ({ ...p, estado: v })),
    setFecha:    (v: string) => setFilters((p) => ({ ...p, fecha: v })),
  };
}
