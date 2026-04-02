import { useState } from "react";

export type EstadoDocumental = "Vigente" | "Vencida" | "Por vencer";
export type EstadoOrganizativo = "Activa" | "Inactiva";
export type EstadoAprobacion = "Activo" | "Pendiente" | "Rechazado";
export type RolAfiliado = | "Presidente" | "Vicepresidente" | "Secretario" | "Tesorero" | "Fiscal" | "Afiliado";

export interface AfiliadoItem {
  id: number;
  nombre: string;
  documento: string;
  telefono: string;
  rol: RolAfiliado;
}

export interface JacItem {
  id: number;
  nombre: string;
  municipio: string;
  barrio: string;
  afiliados: number;
  documental: EstadoDocumental;
  organizativo: EstadoOrganizativo;
  aprobacion: EstadoAprobacion;
  miembros: AfiliadoItem[];
}

interface JacFilters {
  busqueda: string;
  municipio: string;
  estado: string;
  documental: string;
  minAfiliados: string;
  fecha: string;
}

const initialFilters: JacFilters = {
  busqueda: "",
  municipio: "",
  estado: "",
  documental: "",
  minAfiliados: "",
  fecha: "",
};

export const jacData: JacItem[] = [
  {
    id: 1,
    nombre: "JAC Barrio El Recuerdo",
    municipio: "Popayán",
    barrio: "El Recuerdo",
    afiliados: 125,
    documental: "Vigente",
    organizativo: "Activa",
    aprobacion: "Activo",
    miembros: [
      {
        id: 1,
        nombre: "María López",
        documento: "1.061.223.456",
        telefono: "3104567890",
        rol: "Presidente",
      },
      {
        id: 2,
        nombre: "Carlos Pérez",
        documento: "1.061.555.234",
        telefono: "3124561234",
        rol: "Vicepresidente",
      },
      {
        id: 3,
        nombre: "Ana Gómez",
        documento: "1.061.897.111",
        telefono: "3003214567",
        rol: "Secretario",
      },
      {
        id: 4,
        nombre: "Luis Muñoz",
        documento: "1.061.654.987",
        telefono: "3201112233",
        rol: "Afiliado",
      },
    ],
  },
  {
    id: 2,
    nombre: "JAC Vereda La Meseta",
    municipio: "Santander",
    barrio: "La Meseta",
    afiliados: 89,
    documental: "Vencida",
    organizativo: "Activa",
    aprobacion: "Pendiente",
    miembros: [
      {
        id: 5,
        nombre: "Jorge Mina",
        documento: "1.144.223.987",
        telefono: "3119988776",
        rol: "Presidente",
      },
      {
        id: 6,
        nombre: "Sandra Ruiz",
        documento: "1.144.889.765",
        telefono: "3154545454",
        rol: "Tesorero",
      },
      {
        id: 7,
        nombre: "Paola Díaz",
        documento: "1.144.222.111",
        telefono: "3014445566",
        rol: "Afiliado",
      },
    ],
  },
  {
    id: 3,
    nombre: "JAC Comunidad Los Pinos",
    municipio: "Patía",
    barrio: "Los Pinos",
    afiliados: 156,
    documental: "Vigente",
    organizativo: "Activa",
    aprobacion: "Activo",
    miembros: [
      {
        id: 8,
        nombre: "Andrés Chocué",
        documento: "1.055.333.222",
        telefono: "3101122334",
        rol: "Presidente",
      },
      {
        id: 9,
        nombre: "Liliana Campo",
        documento: "1.055.888.999",
        telefono: "3212233445",
        rol: "Fiscal",
      },
      {
        id: 10,
        nombre: "Diego Fernández",
        documento: "1.055.666.444",
        telefono: "3189988776",
        rol: "Afiliado",
      },
    ],
  },
  {
    id: 4,
    nombre: "JAC Barrio Centro",
    municipio: "Timbío",
    barrio: "Centro",
    afiliados: 210,
    documental: "Por vencer",
    organizativo: "Activa",
    aprobacion: "Activo",
    miembros: [
      {
        id: 11,
        nombre: "Mónica Hurtado",
        documento: "1.077.555.333",
        telefono: "3172223344",
        rol: "Presidente",
      },
      {
        id: 12,
        nombre: "Pedro Imbachí",
        documento: "1.077.111.888",
        telefono: "3209988771",
        rol: "Secretario",
      },
      {
        id: 13,
        nombre: "Laura Cobo",
        documento: "1.077.999.000",
        telefono: "3017788990",
        rol: "Afiliado",
      },
    ],
  },
  {
    id: 5,
    nombre: "JAC Vereda El Porvenir",
    municipio: "Piendamó",
    barrio: "El Porvenir",
    afiliados: 78,
    documental: "Vencida",
    organizativo: "Inactiva",
    aprobacion: "Rechazado",
    miembros: [
      {
        id: 14,
        nombre: "Edgar Paz",
        documento: "1.088.223.111",
        telefono: "3156667788",
        rol: "Presidente",
      },
      {
        id: 15,
        nombre: "Rosa Ramos",
        documento: "1.088.555.444",
        telefono: "3005556677",
        rol: "Afiliado",
      },
    ],
  },
  {
    id: 6,
    nombre: "JAC Barrio La Esmeralda",
    municipio: "Popayán",
    barrio: "La Esmeralda",
    afiliados: 142,
    documental: "Vigente",
    organizativo: "Activa",
    aprobacion: "Activo",
    miembros: [
      {
        id: 16,
        nombre: "Diana Collazos",
        documento: "1.099.333.777",
        telefono: "3112345678",
        rol: "Presidente",
      },
      {
        id: 17,
        nombre: "Camilo Ordóñez",
        documento: "1.099.444.888",
        telefono: "3202223344",
        rol: "Vicepresidente",
      },
      {
        id: 18,
        nombre: "Juliana Paz",
        documento: "1.099.555.999",
        telefono: "3012228899",
        rol: "Afiliado",
      },
    ],
  },
];

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

export const rolVariant: Record<
  RolAfiliado,
  "green" | "blue" | "amber" | "gray"
> = {
  Presidente: "green",
  Vicepresidente: "blue",
  Secretario: "blue",
  Tesorero: "amber",
  Fiscal: "amber",
  Afiliado: "gray",
};

export function useJac() {
  const [filters, setFilters] = useState<JacFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<JacFilters>(initialFilters);

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

  const getJacById = (id: number) => {
    return jacData.find((item) => item.id === id) ?? null;
  };

  return {
    filters,
    filtered,
    handleSearch,
    handleClear,
    getJacById,
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