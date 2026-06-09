import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { isPrivilegedUser } from "../utils/roles";
import { JACService } from "../modules/jac/services/jacService";
import type { JacListItem, EstadoDocumental, EstadoOrganizativo } from "../modules/jac/types";

// ── Tipos re-exportados desde el módulo para que las páginas no cambien sus imports ──
export type { EstadoDocumental, EstadoOrganizativo, RolAfiliado, AfiliadoItem, JacItem, JacListItem, TipoJac } from "../modules/jac/types";

// ── Tipos de filtros ──────────────────────────────────────────────────────────

interface JacFilters {
  busqueda: string;
  municipio: string;
  estado: EstadoOrganizativo | "";
  documental: EstadoDocumental | "";
  minAfiliados: string;
  limite: number;
  sinAsocomunal: boolean; // [AGREGADO] Filtro para JACs sin asocomunal asignada
}

const initialFilters: JacFilters = {
  busqueda: "", municipio: "", estado: "", documental: "", minAfiliados: "", limite: 100,
  sinAsocomunal: false, // [AGREGADO] Por defecto muestra todas las JAC
};

// ── Constantes de UI ──────────────────────────────────────────────────────────

export const columns: string[] = [
  "Nombre de la JAC", "Municipio", "Barrio/Vereda", "Afiliados", "Estado","Opciones",
];

export const orgVariant: Record<string, "green" | "gray" | "red"> = {
  Activa: "green", Inactiva: "gray", Cancelada: "red"
};
export const rolVariant: Record<string, "green" | "blue" | "amber" | "gray"> = {
  Presidente: "green", Vicepresidente: "blue", Secretario: "blue",
  Tesorero: "amber", Fiscal: "amber", Afiliado: "gray",
};

// ── Hook principal ────────────────────────────────────────────────────────────

export function useJac() {
  const { user, isAuthLoading } = useAuth();
  const privileged = isPrivilegedUser(user);

  const [jacData,  setJacData]  = useState<JacListItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [filters,  setFilters]  = useState<JacFilters>(initialFilters);
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchJacs = useCallback(async () => {
    if (isAuthLoading) return;
    if (filters.sinAsocomunal && !user) return; // [AGREGADO] evita fetch a endpoint protegido sin sesión
    setLoading(true);
    setError(null);
    try {
      const nombre = debouncedBusqueda.trim();
      const municipio = filters.municipio;
      const estado = filters.estado ? filters.estado : undefined;
      const documental = filters.documental ? filters.documental : undefined;
      const hasSearch = Boolean(nombre || municipio || estado || documental);
      const searchFilters = {
        nombre: nombre || undefined,
        municipio: municipio || undefined,
        estado,
        documental,
        limite: filters.limite,
      };

      // [AGREGADO] Si el filtro sinAsocomunal está activo, llama al endpoint dedicado
      // ignorando los demás filtros del backend; de lo contrario, flujo normal.
      const data = filters.sinAsocomunal
        ? await JACService.findAllWithoutAsocomunal()
        : privileged
          ? hasSearch
            ? await JACService.search(searchFilters)
            : await JACService.findAll(filters.limite)
          : hasSearch
            ? await JACService.searchPublic(searchFilters)
            : await JACService.findAllPublic(filters.limite);

      setJacData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las JAC");
    } finally {
      setLoading(false);
    }
  // [AGREGADO] filters.sinAsocomunal incluido en dependencias para que el fetch
  // se re-ejecute cada vez que cambie ese filtro
  }, [debouncedBusqueda, filters.estado, filters.municipio, filters.documental, filters.limite, filters.sinAsocomunal, privileged, isAuthLoading]);

  useEffect(() => {
    fetchJacs();
  }, [fetchJacs]);

  // Debounce del campo de texto
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedBusqueda(filters.busqueda);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters.busqueda]);

  const handleClear = () => {
    setFilters(initialFilters); // sinAsocomunal vuelve a false automáticamente
    setDebouncedBusqueda("");
  };

  // Filtrado local solo para el mínimo de afiliados (los demás filtros viajan al backend).
 // Filtrado local — cuando sinAsocomunal está activo los demás filtros se aplican
  // aquí en el frontend sobre las 262 JACs; de lo contrario solo aplica minAfiliados.
  const filtered = jacData.filter((j) => {
      if (filters.minAfiliados && j.afiliados < Number(filters.minAfiliados)) return false;

      if (filters.sinAsocomunal) {
        if (filters.busqueda) {
          const q = filters.busqueda.toLowerCase();
          const matchNombre = j.nombre?.toLowerCase().includes(q);
          const matchBarrio = j.barrio?.toLowerCase().includes(q);
          if (!matchNombre && !matchBarrio) return false;
        }
        if (filters.municipio && j.municipio !== filters.municipio) return false;
        if (filters.estado && j.organizativo !== filters.estado) return false;
      }

      return true;
    // [AGREGADO] Aplica el límite cuando sinAsocomunal está activo
    }).slice(0, filters.sinAsocomunal ? filters.limite : undefined);

  const getJacById = (id: number) => jacData.find((item) => item.id === id) ?? null;

  const deleteJac = useCallback(async (id: number): Promise<void> => {
    await JACService.remove(id);
    await fetchJacs();
  }, [fetchJacs]);

  return {
    // datos
    jacData,
    filtered,
    loading,
    error,
    // [MODIFICADO] Refleja los registros filtrados, no los crudos del backend
    totalLoaded: filtered.length,
    // acciones
    refetch: fetchJacs,
    handleClear,
    getJacById,
    deleteJac,
    // setters de filtros
    filters,
    setBusqueda: (v: string) => setFilters((p) => ({ ...p, busqueda: v })),
    setMunicipio: (v: string) => setFilters((p) => ({ ...p, municipio: v })),
    setEstado: (v: EstadoOrganizativo | "") => setFilters((p) => ({ ...p, estado: v })),
    setDocumental: (v: EstadoDocumental | "") => setFilters((p) => ({ ...p, documental: v })),
    setMinAfiliados: (v: string) => setFilters((p) => ({ ...p, minAfiliados: v })),
    setLimite: (v: number) => setFilters((p) => ({ ...p, limite: v })),
    // [AGREGADO] Setter para activar/desactivar el filtro de JACs sin asocomunal
    setSinAsocomunal: (v: boolean) => setFilters((p) => ({ ...p, sinAsocomunal: v })),
  };
}