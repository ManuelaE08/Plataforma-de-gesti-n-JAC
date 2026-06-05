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
}

const initialFilters: JacFilters = {
  busqueda: "", municipio: "", estado: "", documental: "", minAfiliados: "", limite: 100,
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

export function useJac(initialMunicipio: string = "") {
  const { user, isAuthLoading } = useAuth();
  const privileged = isPrivilegedUser(user);

  const [jacData,  setJacData]  = useState<JacListItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [filters,  setFilters]  = useState<JacFilters>({ ...initialFilters, municipio: initialMunicipio });
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchJacs = useCallback(async () => {
    if (isAuthLoading) return;

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
      const data = privileged
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
  }, [debouncedBusqueda, filters.estado, filters.municipio, filters.documental, filters.limite, privileged, isAuthLoading]);

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
    setFilters(initialFilters);
    setDebouncedBusqueda("");
  };

  // Filtrado local solo para el mínimo de afiliados (los demás filtros viajan al backend).
  const filtered = jacData.filter((j) => {
    return !filters.minAfiliados || j.afiliados >= Number(filters.minAfiliados);
  });

  const getJacById = (id: number) => jacData.find((item) => item.id === id) ?? null;

  /**
   * Eliminación lógica de una JAC.
   * El backend cambia su estado a `inactiva` (no se borra de la BD); por eso
   * después llamamos `fetchJacs()` para que la lista refleje el nuevo estado.
   */
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
    totalLoaded: jacData.length,
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
  };
}
