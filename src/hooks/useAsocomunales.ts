import { useState, useEffect, useRef } from "react";

export type EstadoDocumental = "Vigente" | "Vencida" | "Por vencer";
export type EstadoOrganizativo = "Activa" | "Inactiva";
export type EstadoAprobacion = "Activo" | "Pendiente" | "Rechazado";
export type RolAfiliadoAsoc =
  | "Presidente" | "Vicepresidente" | "Secretario"
  | "Tesorero" | "Fiscal" | "Delegado";

export interface AfiliadoAsocItem {
  id: number;
  nombre: string;
  documento: string;
  telefono: string;
  rol: RolAfiliadoAsoc;
}

export interface AsocomunalItem {
  id: number;
  nombre: string;
  municipio: string;
  cobertura: string;
  afiliadas: number;
  documental: EstadoDocumental;
  organizativo: EstadoOrganizativo;
  aprobacion: EstadoAprobacion;
  miembros: AfiliadoAsocItem[];
}

interface AsocomunalFilters {
  busqueda: string;
  municipio: string;
  estado: string;
  documental: string;
  minAfiliadas: string;
}

const initialFilters: AsocomunalFilters = {
  busqueda: "", municipio: "", estado: "", documental: "", minAfiliadas: "",
};

export const asocomunalesData: AsocomunalItem[] = [
  {
    id: 1, nombre: "Asocomunal Popayán Urbana", municipio: "Popayán",
    cobertura: "Comunas 1, 2, 3 y 4", afiliadas: 24,
    documental: "Vigente", organizativo: "Activa", aprobacion: "Activo",
    miembros: [
      { id: 1, nombre: "Claudia Muñoz",     documento: "1.061.112.233", telefono: "3101234567", rol: "Presidente" },
      { id: 2, nombre: "Hernando Ruiz",     documento: "1.061.445.667", telefono: "3124447788", rol: "Vicepresidente" },
      { id: 3, nombre: "Patricia Lemos",    documento: "1.061.778.990", telefono: "3005559900", rol: "Secretario" },
      { id: 4, nombre: "Gilberto Torres",   documento: "1.061.321.654", telefono: "3209876543", rol: "Tesorero" },
      { id: 5, nombre: "Esperanza Coral",   documento: "1.061.987.123", telefono: "3157778899", rol: "Delegado" },
    ],
  },
  {
    id: 2, nombre: "Asocomunal Norte del Cauca", municipio: "Santander de Quilichao",
    cobertura: "Zona urbana y rural", afiliadas: 18,
    documental: "Por vencer", organizativo: "Activa", aprobacion: "Pendiente",
    miembros: [
      { id: 6, nombre: "Fernando Mina",  documento: "1.144.333.111", telefono: "3112223344", rol: "Presidente" },
      { id: 7, nombre: "Lucía Prado",    documento: "1.144.555.888", telefono: "3153334455", rol: "Secretario" },
      { id: 8, nombre: "Mauricio Campo", documento: "1.144.777.222", telefono: "3014445566", rol: "Delegado" },
    ],
  },
  {
    id: 3, nombre: "Asocomunal Patía", municipio: "Patía",
    cobertura: "Corregimientos y veredas", afiliadas: 14,
    documental: "Vigente", organizativo: "Activa", aprobacion: "Activo",
    miembros: [
      { id: 9,  nombre: "Alberto Chicue", documento: "1.055.221.443", telefono: "3101122334", rol: "Presidente" },
      { id: 10, nombre: "Nohora Valdés",  documento: "1.055.664.887", telefono: "3212233445", rol: "Fiscal" },
      { id: 11, nombre: "Ramiro Ibarra",  documento: "1.055.998.776", telefono: "3189988776", rol: "Delegado" },
    ],
  },
  {
    id: 4, nombre: "Asocomunal Timbío", municipio: "Timbío",
    cobertura: "Cabecera municipal", afiliadas: 11,
    documental: "Vencida", organizativo: "Inactiva", aprobacion: "Rechazado",
    miembros: [
      { id: 12, nombre: "Beatriz Hurtado", documento: "1.077.443.221", telefono: "3172223344", rol: "Presidente" },
      { id: 13, nombre: "Camilo Imbachí",  documento: "1.077.665.443", telefono: "3209988771", rol: "Delegado" },
    ],
  },
  {
    id: 5, nombre: "Asocomunal Piendamó", municipio: "Piendamó",
    cobertura: "Zona centro y rural", afiliadas: 16,
    documental: "Vigente", organizativo: "Activa", aprobacion: "Activo",
    miembros: [
      { id: 14, nombre: "Sonia Paz",      documento: "1.088.112.334", telefono: "3156667788", rol: "Presidente" },
      { id: 15, nombre: "Javier Ramos",   documento: "1.088.556.778", telefono: "3005556677", rol: "Vicepresidente" },
      { id: 16, nombre: "Milena Arce",    documento: "1.088.990.112", telefono: "3119998877", rol: "Tesorero" },
      { id: 17, nombre: "Nelson Bolaños", documento: "1.088.334.556", telefono: "3207776655", rol: "Delegado" },
    ],
  },
  {
    id: 6, nombre: "Asocomunal Miranda", municipio: "Miranda",
    cobertura: "Municipio y veredas", afiliadas: 9,
    documental: "Por vencer", organizativo: "Activa", aprobacion: "Pendiente",
    miembros: [
      { id: 18, nombre: "Gustavo Leal",       documento: "1.033.221.443", telefono: "3101234455", rol: "Presidente" },
      { id: 19, nombre: "Carolina Solarte",   documento: "1.033.445.667", telefono: "3152345566", rol: "Secretario" },
      { id: 20, nombre: "Víctor Quiñones",    documento: "1.033.889.001", telefono: "3013456677", rol: "Delegado" },
    ],
  },
];

export const columns: string[] = [
  "Nombre de la Asocomunal", "Municipio", "Cobertura", "JAC afiliadas",
  "Estado documental", "Estado organizativo", "Estado de aprobación", "Acciones",
];

export const docVariant: Record<EstadoDocumental, "green" | "red" | "amber"> = {
  Vigente: "green", Vencida: "red", "Por vencer": "amber",
};
export const orgVariant: Record<EstadoOrganizativo, "green" | "gray"> = {
  Activa: "green", Inactiva: "gray",
};
export const aprobVariant: Record<EstadoAprobacion, "green" | "amber" | "red"> = {
  Activo: "green", Pendiente: "amber", Rechazado: "red",
};
export const rolVariant: Record<RolAfiliadoAsoc, "green" | "blue" | "amber" | "gray"> = {
  Presidente: "green", Vicepresidente: "blue", Secretario: "blue",
  Tesorero: "amber", Fiscal: "amber", Delegado: "gray",
};

export function useAsocomunales() {
  const [filters, setFilters] = useState<AsocomunalFilters>(initialFilters);
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedBusqueda(filters.busqueda);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters.busqueda]);

  const handleClear = () => {
    setFilters(initialFilters);
    setDebouncedBusqueda("");
  };

  const filtered = asocomunalesData.filter((item) => {
    const matchBusqueda =
      !debouncedBusqueda ||
      [item.nombre, item.municipio, item.cobertura].some((v) =>
        v.toLowerCase().includes(debouncedBusqueda.toLowerCase())
      );
    const matchMunicipio  = !filters.municipio    || item.municipio    === filters.municipio;
    const matchEstado     = !filters.estado       || item.organizativo === filters.estado;
    const matchDocumental = !filters.documental   || item.documental   === filters.documental;
    const matchAfiliadas  = !filters.minAfiliadas || item.afiliadas    >= Number(filters.minAfiliadas);
    return matchBusqueda && matchMunicipio && matchEstado && matchDocumental && matchAfiliadas;
  });

  return {
    filters,
    filtered,
    handleClear,
    setBusqueda:     (v: string) => setFilters((p) => ({ ...p, busqueda: v })),
    setMunicipio:    (v: string) => setFilters((p) => ({ ...p, municipio: v })),
    setEstado:       (v: string) => setFilters((p) => ({ ...p, estado: v })),
    setDocumental:   (v: string) => setFilters((p) => ({ ...p, documental: v })),
    setMinAfiliadas: (v: string) => setFilters((p) => ({ ...p, minAfiliadas: v })),
  };
}