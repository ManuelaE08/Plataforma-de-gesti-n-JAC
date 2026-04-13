import { useState } from "react";

export type EstadoSolicitud = "Pendiente" | "Aprobada" | "Rechazada";
export type TipoAccion =
  | "Crear JAC"
  | "Editar JAC"
  | "Eliminar JAC"
  | "Crear Asocomunal"
  | "Editar Asocomunal"
  | "Eliminar Asocomunal";

export interface CambioCampo {
  campo: string;
  valorAnterior?: string;
  valorNuevo: string;
}

export interface SolicitudItem {
  id: number;
  tipo: TipoAccion;
  descripcion: string;
  entidad: "JAC" | "Asocomunal";
  operador: string;
  operadorId: number;
  fecha: string;
  estado: EstadoSolicitud;
  motivoRechazo?: string;
  cambios: CambioCampo[];
}

interface SolicitudFilters {
  estado: string;
  tipo: string;
  operador: string;
  fechaDesde: string;
  fechaHasta: string;
}

const initialFilters: SolicitudFilters = {
  estado: "", tipo: "", operador: "", fechaDesde: "", fechaHasta: "",
};

export const estadoVariant: Record<EstadoSolicitud, "amber" | "green" | "red"> = {
  Pendiente: "amber",
  Aprobada: "green",
  Rechazada: "red",
};

export const tipoVariant: Record<TipoAccion, "blue" | "amber" | "red"> = {
  "Crear JAC": "blue",
  "Editar JAC": "amber",
  "Eliminar JAC": "red",
  "Crear Asocomunal": "blue",
  "Editar Asocomunal": "amber",
  "Eliminar Asocomunal": "red",
};

export const solicitudesData: SolicitudItem[] = [
  {
    id: 1,
    tipo: "Crear JAC",
    entidad: "JAC",
    descripcion: "JAC Barrio San Joaquín",
    operador: "Carlos Operador",
    operadorId: 2,
    fecha: "2025-03-28",
    estado: "Pendiente",
    cambios: [
      { campo: "Nombre", valorNuevo: "JAC Barrio San Joaquín" },
      { campo: "Municipio", valorNuevo: "Popayán" },
      { campo: "Barrio/Vereda", valorNuevo: "San Joaquín" },
      { campo: "Afiliados", valorNuevo: "72" },
      { campo: "Estado", valorNuevo: "Activa" },
    ],
  },
  {
    id: 2,
    tipo: "Editar JAC",
    entidad: "JAC",
    descripcion: "JAC Vereda La Meseta",
    operador: "María Operadora",
    operadorId: 3,
    fecha: "2025-03-29",
    estado: "Aprobada",
    cambios: [
      { campo: "Estado documental", valorAnterior: "Por vencer", valorNuevo: "Vigente" },
      { campo: "Afiliados", valorAnterior: "89", valorNuevo: "94" },
    ],
  },
  {
    id: 3,
    tipo: "Eliminar JAC",
    entidad: "JAC",
    descripcion: "JAC Barrio Centro",
    operador: "Carlos Operador",
    operadorId: 2,
    fecha: "2025-03-30",
    estado: "Rechazada",
    motivoRechazo: "La JAC tiene afiliados activos registrados. No puede eliminarse.",
    cambios: [
      { campo: "Acción", valorNuevo: "Eliminar registro completo" },
      { campo: "Motivo", valorNuevo: "Duplicado en el sistema" },
    ],
  },
  {
    id: 4,
    tipo: "Crear Asocomunal",
    entidad: "Asocomunal",
    descripcion: "Asocomunal Sur del Cauca",
    operador: "María Operadora",
    operadorId: 3,
    fecha: "2025-04-01",
    estado: "Pendiente",
    cambios: [
      { campo: "Nombre", valorNuevo: "Asocomunal Sur del Cauca" },
      { campo: "Municipio", valorNuevo: "Patía" },
      { campo: "JAC asociadas", valorNuevo: "12" },
      { campo: "Estado", valorNuevo: "Activa" },
    ],
  },
  {
    id: 5,
    tipo: "Editar Asocomunal",
    entidad: "Asocomunal",
    descripcion: "Asocomunal Piendamó",
    operador: "Carlos Operador",
    operadorId: 2,
    fecha: "2025-04-01",
    estado: "Pendiente",
    cambios: [
      { campo: "Cobertura", valorAnterior: "Zona norte", valorNuevo: "Zona norte y sur" },
    ],
  },
  {
    id: 6,
    tipo: "Crear JAC",
    entidad: "JAC",
    descripcion: "JAC Vereda El Tablón",
    operador: "María Operadora",
    operadorId: 3,
    fecha: "2025-04-02",
    estado: "Aprobada",
    cambios: [
      { campo: "Nombre", valorNuevo: "JAC Vereda El Tablón" },
      { campo: "Municipio", valorNuevo: "Miranda" },
      { campo: "Barrio/Vereda", valorNuevo: "El Tablón" },
      { campo: "Afiliados", valorNuevo: "58" },
      { campo: "Estado", valorNuevo: "Activa" },
    ],
  },
  {
    id: 7,
    tipo: "Eliminar Asocomunal",
    entidad: "Asocomunal",
    descripcion: "Asocomunal Miranda",
    operador: "Carlos Operador",
    operadorId: 2,
    fecha: "2025-04-02",
    estado: "Rechazada",
    motivoRechazo: "Requiere aprobación del consejo departamental antes de proceder.",
    cambios: [
      { campo: "Acción", valorNuevo: "Eliminar registro completo" },
      { campo: "Motivo", valorNuevo: "Fusión con Norte del Cauca" },
    ],
  },
];

export function useSolicitudes(operadorId?: number) {
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>(solicitudesData);
  const [filters, setFilters] = useState<SolicitudFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<SolicitudFilters>(initialFilters);

  const base = operadorId
    ? solicitudes.filter((s) => s.operadorId === operadorId)
    : solicitudes;

  const filtered = base.filter((s) => {
    const matchEstado   = !appliedFilters.estado   || s.estado === appliedFilters.estado;
    const matchTipo     = !appliedFilters.tipo     || s.tipo === appliedFilters.tipo;
    const matchOperador = !appliedFilters.operador ||
      s.operador.toLowerCase().includes(appliedFilters.operador.toLowerCase());
    const matchDesde = !appliedFilters.fechaDesde || s.fecha >= appliedFilters.fechaDesde;
    const matchHasta = !appliedFilters.fechaHasta || s.fecha <= appliedFilters.fechaHasta;
    return matchEstado && matchTipo && matchOperador && matchDesde && matchHasta;
  });

  const aprobar = (id: number) =>
    setSolicitudes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: "Aprobada" } : s))
    );

  const rechazar = (id: number, motivo: string) =>
    setSolicitudes((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, estado: "Rechazada", motivoRechazo: motivo } : s
      )
    );

  const crearSolicitud = (
    nueva: Omit<SolicitudItem, "id" | "fecha" | "estado" | "motivoRechazo">
  ) => {
    const newId = Math.max(...solicitudes.map((s) => s.id)) + 1;
    setSolicitudes((prev) => [
      ...prev,
      {
        ...nueva,
        id: newId,
        fecha: new Date().toISOString().split("T")[0],
        estado: "Pendiente",
      },
    ]);
  };

  const notificaciones = operadorId
    ? solicitudes.filter(
        (s) => s.operadorId === operadorId && s.estado !== "Pendiente"
      )
    : [];

  return {
    filters,
    filtered,
    aprobar,
    rechazar,
    crearSolicitud,
    notificaciones,
    handleSearch: () => setAppliedFilters(filters),
    handleClear: () => {
      setFilters(initialFilters);
      setAppliedFilters(initialFilters);
    },
    setEstado:     (v: string) => setFilters((p) => ({ ...p, estado: v })),
    setTipo:       (v: string) => setFilters((p) => ({ ...p, tipo: v })),
    setOperador:   (v: string) => setFilters((p) => ({ ...p, operador: v })),
    setFechaDesde: (v: string) => setFilters((p) => ({ ...p, fechaDesde: v })),
    setFechaHasta: (v: string) => setFilters((p) => ({ ...p, fechaHasta: v })),
  };
}