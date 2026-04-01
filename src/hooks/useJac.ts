import { useState } from "react";

export type EstadoDocumental = "Vigente" | "Vencida" | "Por vencer";
export type EstadoOrganizativo = "Activa" | "Inactiva";
export type EstadoAprobacion = "Activo" | "Pendiente" | "Rechazado";

export interface JacItem {
  nombre: string;
  municipio: string;
  barrio: string;
  afiliados: number;
  documental: EstadoDocumental;
  organizativo: EstadoOrganizativo;
  aprobacion: EstadoAprobacion;
}

interface JacFilters {
  busqueda: string;
  municipio: string;
  estado: string;
  documental: string;
  minAfiliados: string;
  fecha: string;
}

const jacData: JacItem[] = [
  {
    nombre: "JAC Barrio El Recuerdo",
    municipio: "Popayán",
    barrio: "El Recuerdo",
    afiliados: 125,
    documental: "Vigente",
    organizativo: "Activa",
    aprobacion: "Activo",
  },
  {
    nombre: "JAC Vereda La Meseta",
    municipio: "Santander",
    barrio: "La Meseta",
    afiliados: 89,
    documental: "Vencida",
    organizativo: "Activa",
    aprobacion: "Pendiente",
  },
  {
    nombre: "JAC Comunidad Los Pinos",
    municipio: "Patía",
    barrio: "Los Pinos",
    afiliados: 156,
    documental: "Vigente",
    organizativo: "Activa",
    aprobacion: "Activo",
  },
  {
    nombre: "JAC Barrio Centro",
    municipio: "Timbío",
    barrio: "Centro",
    afiliados: 210,
    documental: "Por vencer",
    organizativo: "Activa",
    aprobacion: "Activo",
  },
  {
    nombre: "JAC Vereda El Porvenir",
    municipio: "Piendamó",
    barrio: "El Porvenir",
    afiliados: 78,
    documental: "Vencida",
    organizativo: "Inactiva",
    aprobacion: "Rechazado",
  },
  {
    nombre: "JAC Barrio La Esmeralda",
    municipio: "Popayán",
    barrio: "La Esmeralda",
    afiliados: 142,
    documental: "Vigente",
    organizativo: "Activa",
    aprobacion: "Activo",
  },
];

const initialFilters: JacFilters = {
  busqueda: "",
  municipio: "",
  estado: "",
  documental: "",
  minAfiliados: "",
  fecha: "",
};

export const columns: string[] = [
  "Nombre de la JAC",
  "Municipio",
  "Barrio/Vereda",
  "Afiliados",
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

export function useJac() {
  const [filters, setFilters] = useState<JacFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<JacFilters>(initialFilters);

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const filtered = jacData.filter((j) => {
    const matchBusqueda =
      !appliedFilters.busqueda ||
      [j.nombre, j.municipio, j.barrio].some((value) =>
        value.toLowerCase().includes(appliedFilters.busqueda.toLowerCase())
      );

    const matchMunicipio =
      !appliedFilters.municipio || j.municipio === appliedFilters.municipio;

    const matchEstado =
      !appliedFilters.estado || j.organizativo === appliedFilters.estado;

    const matchDocumental =
      !appliedFilters.documental || j.documental === appliedFilters.documental;

    const matchAfiliados =
      !appliedFilters.minAfiliados ||
      j.afiliados >= Number(appliedFilters.minAfiliados);

    return (
      matchBusqueda &&
      matchMunicipio &&
      matchEstado &&
      matchDocumental &&
      matchAfiliados
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
    setMinAfiliados: (value: string) =>
      setFilters((prev) => ({ ...prev, minAfiliados: value })),
    setFecha: (value: string) =>
      setFilters((prev) => ({ ...prev, fecha: value })),
  };
}