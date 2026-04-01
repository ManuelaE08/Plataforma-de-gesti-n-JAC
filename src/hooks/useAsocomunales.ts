import { useState } from "react";

export type EstadoDocumental = "Vigente" | "Vencida" | "Por vencer";
export type EstadoOrganizativo = "Activa" | "Inactiva";
export type EstadoAprobacion = "Activo" | "Pendiente" | "Rechazado";

export interface AsocomunalItem {
  nombre: string;
  municipio: string;
  cobertura: string;
  afiliadas: number;
  documental: EstadoDocumental;
  organizativo: EstadoOrganizativo;
  aprobacion: EstadoAprobacion;
}

interface AsocomunalFilters {
  busqueda: string;
  municipio: string;
  estado: string;
  documental: string;
  minAfiliadas: string;
  fecha: string;
}

const asocomunalesData: AsocomunalItem[] = [
  {
    nombre: "Asocomunal Popayán Urbana",
    municipio: "Popayán",
    cobertura: "Comunas 1, 2, 3 y 4",
    afiliadas: 24,
    documental: "Vigente",
    organizativo: "Activa",
    aprobacion: "Activo",
  },
  {
    nombre: "Asocomunal Norte del Cauca",
    municipio: "Santander de Quilichao",
    cobertura: "Zona urbana y rural",
    afiliadas: 18,
    documental: "Por vencer",
    organizativo: "Activa",
    aprobacion: "Pendiente",
  },
  {
    nombre: "Asocomunal Patía",
    municipio: "Patía",
    cobertura: "Corregimientos y veredas",
    afiliadas: 14,
    documental: "Vigente",
    organizativo: "Activa",
    aprobacion: "Activo",
  },
  {
    nombre: "Asocomunal Timbío",
    municipio: "Timbío",
    cobertura: "Cabecera municipal",
    afiliadas: 11,
    documental: "Vencida",
    organizativo: "Inactiva",
    aprobacion: "Rechazado",
  },
  {
    nombre: "Asocomunal Piendamó",
    municipio: "Piendamó",
    cobertura: "Zona centro y rural",
    afiliadas: 16,
    documental: "Vigente",
    organizativo: "Activa",
    aprobacion: "Activo",
  },
  {
    nombre: "Asocomunal Miranda",
    municipio: "Miranda",
    cobertura: "Municipio y veredas",
    afiliadas: 9,
    documental: "Por vencer",
    organizativo: "Activa",
    aprobacion: "Pendiente",
  },
];

const initialFilters: AsocomunalFilters = {
  busqueda: "",
  municipio: "",
  estado: "",
  documental: "",
  minAfiliadas: "",
  fecha: "",
};

export const columns: string[] = [
  "Nombre de la Asocomunal",
  "Municipio",
  "Cobertura",
  "JAC afiliadas",
  "Estado documental",
  "Estado organizativo",
  "Estado de aprobación",
  "Acciones",
];

export const docVariant: Record<EstadoDocumental, "green" | "red" | "amber"> = {
  Vigente: "green",
  Vencida: "red",
  "Por vencer": "amber",
};

export const orgVariant: Record<EstadoOrganizativo, "green" | "gray"> = {
  Activa: "green",
  Inactiva: "gray",
};

export const aprobVariant: Record<EstadoAprobacion, "green" | "amber" | "red"> = {
  Activo: "green",
  Pendiente: "amber",
  Rechazado: "red",
};

export function useAsocomunales() {
  const [filters, setFilters] = useState<AsocomunalFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<AsocomunalFilters>(initialFilters);

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const filtered = asocomunalesData.filter((item) => {
    const matchBusqueda =
      !appliedFilters.busqueda ||
      [item.nombre, item.municipio, item.cobertura].some((value) =>
        value.toLowerCase().includes(appliedFilters.busqueda.toLowerCase())
      );

    const matchMunicipio =
      !appliedFilters.municipio || item.municipio === appliedFilters.municipio;

    const matchEstado =
      !appliedFilters.estado || item.organizativo === appliedFilters.estado;

    const matchDocumental =
      !appliedFilters.documental || item.documental === appliedFilters.documental;

    const matchAfiliadas =
      !appliedFilters.minAfiliadas ||
      item.afiliadas >= Number(appliedFilters.minAfiliadas);

    return (
      matchBusqueda &&
      matchMunicipio &&
      matchEstado &&
      matchDocumental &&
      matchAfiliadas
    );
  });

  return {
    filters,
    filtered,
    handleSearch,
    handleClear,
    setBusqueda: (value: string) =>
      setFilters((prev) => ({ ...prev, busqueda: value })),
    setMunicipio: (value: string) =>
      setFilters((prev) => ({ ...prev, municipio: value })),
    setEstado: (value: string) =>
      setFilters((prev) => ({ ...prev, estado: value })),
    setDocumental: (value: string) =>
      setFilters((prev) => ({ ...prev, documental: value })),
    setMinAfiliadas: (value: string) =>
      setFilters((prev) => ({ ...prev, minAfiliadas: value })),
    setFecha: (value: string) =>
      setFilters((prev) => ({ ...prev, fecha: value })),
  };
}