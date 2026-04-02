import { useMemo, useState } from "react";

export type NivelAlerta = "Alta" | "Media" | "Baja";
export type EstadoAlerta = "Activa" | "En seguimiento" | "Resuelta";
export type TipoAlerta =
  | "Documental"
  | "Organizativa"
  | "Aprobación"
  | "Inactividad";

export interface AlertaItem {
  id: number;
  entidad: string;
  tipoEntidad: "JAC" | "Asocomunal";
  municipio: string;
  tipo: TipoAlerta;
  nivel: NivelAlerta;
  estado: EstadoAlerta;
  fecha: string;
  descripcion: string;
}

interface AlertasFilters {
  busqueda: string;
  municipio: string;
  tipo: string;
  nivel: string;
  estado: string;
}

const initialFilters: AlertasFilters = {
  busqueda: "",
  municipio: "",
  tipo: "",
  nivel: "",
  estado: "",
};

const alertasData: AlertaItem[] = [
  {
    id: 1,
    entidad: "JAC Vereda El Porvenir",
    tipoEntidad: "JAC",
    municipio: "Piendamó",
    tipo: "Documental",
    nivel: "Alta",
    estado: "Activa",
    fecha: "2026-03-29",
    descripcion: "Documentación vencida y sin actualización reciente.",
  },
  {
    id: 2,
    entidad: "Asocomunal Timbío",
    tipoEntidad: "Asocomunal",
    municipio: "Timbío",
    tipo: "Organizativa",
    nivel: "Media",
    estado: "En seguimiento",
    fecha: "2026-03-28",
    descripcion: "Disminución en actividad organizativa reportada.",
  },
  {
    id: 3,
    entidad: "JAC Barrio Centro",
    tipoEntidad: "JAC",
    municipio: "Timbío",
    tipo: "Aprobación",
    nivel: "Baja",
    estado: "Activa",
    fecha: "2026-03-27",
    descripcion: "Pendiente validación final del proceso de aprobación.",
  },
  {
    id: 4,
    entidad: "JAC La Esmeralda",
    tipoEntidad: "JAC",
    municipio: "Popayán",
    tipo: "Inactividad",
    nivel: "Media",
    estado: "Activa",
    fecha: "2026-03-26",
    descripcion: "Sin novedades registradas en el último periodo.",
  },
  {
    id: 5,
    entidad: "Asocomunal Norte del Cauca",
    tipoEntidad: "Asocomunal",
    municipio: "Santander",
    tipo: "Documental",
    nivel: "Alta",
    estado: "En seguimiento",
    fecha: "2026-03-24",
    descripcion: "Soportes vencidos y observaciones sin subsanar.",
  },
  {
    id: 6,
    entidad: "JAC Los Pinos",
    tipoEntidad: "JAC",
    municipio: "Patía",
    tipo: "Organizativa",
    nivel: "Baja",
    estado: "Resuelta",
    fecha: "2026-03-21",
    descripcion: "Se normalizó el estado organizativo tras revisión.",
  },
];

export const columns: string[] = [
  "Entidad",
  "Tipo",
  "Municipio",
  "Categoría",
  "Nivel",
  "Estado",
  "Fecha",
  "Acciones",
];

export const nivelVariant: Record<NivelAlerta, "red" | "amber" | "green"> = {
  Alta: "red",
  Media: "amber",
  Baja: "green",
};

export const estadoVariant: Record<EstadoAlerta, "red" | "blue" | "green"> = {
  Activa: "red",
  "En seguimiento": "blue",
  Resuelta: "green",
};

export function useAlertas() {
  const [filters, setFilters] = useState<AlertasFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<AlertasFilters>(initialFilters);

  const resumen = useMemo(() => {
    const activas = alertasData.filter((item) => item.estado === "Activa").length;
    const seguimiento = alertasData.filter(
      (item) => item.estado === "En seguimiento"
    ).length;
    const altas = alertasData.filter((item) => item.nivel === "Alta").length;

    return { activas, seguimiento, altas };
  }, []);

  const filtered = useMemo(() => {
    return alertasData.filter((item) => {
      const matchBusqueda =
        !appliedFilters.busqueda ||
        [item.entidad, item.municipio, item.tipo].some((value) =>
          value.toLowerCase().includes(appliedFilters.busqueda.toLowerCase())
        );

      const matchMunicipio =
        !appliedFilters.municipio || item.municipio === appliedFilters.municipio;

      const matchTipo = !appliedFilters.tipo || item.tipo === appliedFilters.tipo;

      const matchNivel =
        !appliedFilters.nivel || item.nivel === appliedFilters.nivel;

      const matchEstado =
        !appliedFilters.estado || item.estado === appliedFilters.estado;

      return (
        matchBusqueda &&
        matchMunicipio &&
        matchTipo &&
        matchNivel &&
        matchEstado
      );
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
    setNivel: (value: string) =>
      setFilters((prev) => ({ ...prev, nivel: value })),
    setEstado: (value: string) =>
      setFilters((prev) => ({ ...prev, estado: value })),
  };
}