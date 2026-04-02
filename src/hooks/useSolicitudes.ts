import { useMemo, useState } from "react";

export type TipoSolicitud = | "Registro JAC" | "Registro Asocomunal" | "Actualización documental" | "Cambio de estado";
export type EstadoSolicitud = | "Pendiente" | "En revisión" | "Aprobada" | "Rechazada";

export interface SolicitudItem {
  id: number;
  solicitante: string;
  entidad: string;
  municipio: string;
  tipo: TipoSolicitud;
  estado: EstadoSolicitud;
  fecha: string;
  observacion: string;
}

interface SolicitudesFilters {
  busqueda: string;
  municipio: string;
  tipo: string;
  estado: string;
}

const initialFilters: SolicitudesFilters = {
  busqueda: "",
  municipio: "",
  tipo: "",
  estado: "",
};

const solicitudesData: SolicitudItem[] = [
  {
    id: 1,
    solicitante: "María Fernanda López",
    entidad: "JAC Barrio El Recuerdo",
    municipio: "Popayán",
    tipo: "Registro JAC",
    estado: "Pendiente",
    fecha: "2026-03-30",
    observacion: "Solicitud enviada para validación inicial.",
  },
  {
    id: 2,
    solicitante: "Carlos Andrade",
    entidad: "Asocomunal Norte del Cauca",
    municipio: "Santander",
    tipo: "Registro Asocomunal",
    estado: "En revisión",
    fecha: "2026-03-29",
    observacion: "En verificación de documentos soporte.",
  },
  {
    id: 3,
    solicitante: "Luisa Gómez",
    entidad: "JAC Los Pinos",
    municipio: "Patía",
    tipo: "Actualización documental",
    estado: "Aprobada",
    fecha: "2026-03-27",
    observacion: "Documentación validada correctamente.",
  },
  {
    id: 4,
    solicitante: "Andrés Muñoz",
    entidad: "JAC Barrio Centro",
    municipio: "Timbío",
    tipo: "Cambio de estado",
    estado: "Rechazada",
    fecha: "2026-03-26",
    observacion: "Faltan soportes para justificar el cambio.",
  },
  {
    id: 5,
    solicitante: "Sandra Pérez",
    entidad: "JAC La Esmeralda",
    municipio: "Popayán",
    tipo: "Actualización documental",
    estado: "Pendiente",
    fecha: "2026-03-25",
    observacion: "Pendiente revisión por parte del auditor.",
  },
  {
    id: 6,
    solicitante: "Jorge Mina",
    entidad: "Asocomunal Timbío",
    municipio: "Timbío",
    tipo: "Cambio de estado",
    estado: "En revisión",
    fecha: "2026-03-24",
    observacion: "Se solicitaron aclaraciones adicionales.",
  },
];

export const columns: string[] = [
  "Solicitante",
  "Entidad",
  "Municipio",
  "Tipo",
  "Estado",
  "Fecha",
  "Observación",
  "Acciones",
];

export const estadoVariant: Record<
  EstadoSolicitud,
  "amber" | "blue" | "green" | "red"
> = {
  Pendiente: "amber",
  "En revisión": "blue",
  Aprobada: "green",
  Rechazada: "red",
};

export function useSolicitudes() {
  const [filters, setFilters] = useState<SolicitudesFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<SolicitudesFilters>(initialFilters);

  const resumen = useMemo(() => {
    const pendientes = solicitudesData.filter(
      (item) => item.estado === "Pendiente"
    ).length;
    const revision = solicitudesData.filter(
      (item) => item.estado === "En revisión"
    ).length;
    const aprobadas = solicitudesData.filter(
      (item) => item.estado === "Aprobada"
    ).length;

    return { pendientes, revision, aprobadas };
  }, []);

  const filtered = useMemo(() => {
    return solicitudesData.filter((item) => {
      const matchBusqueda =
        !appliedFilters.busqueda ||
        [item.solicitante, item.entidad, item.tipo].some((value) =>
          value.toLowerCase().includes(appliedFilters.busqueda.toLowerCase())
        );

      const matchMunicipio =
        !appliedFilters.municipio || item.municipio === appliedFilters.municipio;

      const matchTipo = !appliedFilters.tipo || item.tipo === appliedFilters.tipo;

      const matchEstado =
        !appliedFilters.estado || item.estado === appliedFilters.estado;

      return matchBusqueda && matchMunicipio && matchTipo && matchEstado;
    });
  }, [appliedFilters]);

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  return {
    filters,
    filtered,
    resumen,
    handleSearch,
    handleClear,
    setBusqueda: (value: string) =>
      setFilters((prev) => ({ ...prev, busqueda: value })),
    setMunicipio: (value: string) =>
      setFilters((prev) => ({ ...prev, municipio: value })),
    setTipo: (value: string) =>
      setFilters((prev) => ({ ...prev, tipo: value })),
    setEstado: (value: string) =>
      setFilters((prev) => ({ ...prev, estado: value })),
  };
}