import { useState, useEffect, useRef, useCallback } from "react";
import { JACService } from "../modules/jac/services/jacService";
import type { JacItem, EstadoDocumental, EstadoOrganizativo } from "../modules/jac/types";

// ── Tipos re-exportados desde el módulo para que las páginas no cambien sus imports ──
export type { EstadoDocumental, EstadoOrganizativo, RolAfiliado, AfiliadoItem, JacItem } from "../modules/jac/types";

// ── Tipos de filtros ──────────────────────────────────────────────────────────

interface JacFilters {
  busqueda: string;
  municipio: string;
  estado: EstadoOrganizativo | "";
  minAfiliados: string;
  limite: number;
}

const initialFilters: JacFilters = {
  busqueda: "", municipio: "", estado: "", minAfiliados: "", limite: 100,
};

// ── Constantes de UI ──────────────────────────────────────────────────────────

export const columns: string[] = [
  "Nombre de la JAC", "Municipio", "Barrio/Vereda", "Afiliados",
  "Número RUC", "Estado de la JAC", "Opciones",
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
  const [jacData, setJacData] = useState<JacItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JacFilters>(initialFilters);
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carga inicial y busqueda desde el microservicio
  const fetchJacs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nombre = debouncedBusqueda.trim();
      const municipio = filters.municipio;
      const estado = filters.estado ? filters.estado : undefined;
      const hasSearch = Boolean(nombre || municipio || estado);
      const data = hasSearch
        ? await JACService.search({
          nombre: nombre || undefined,
          municipio: municipio || undefined,
          estado,
          limite: filters.limite,
        })
        : await JACService.findAll(filters.limite);
      setJacData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las JAC");
    } finally {
      setLoading(false);
    }
  }, [debouncedBusqueda, filters.estado, filters.municipio, filters.limite]);

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

  // Filtrado local para campos no cubiertos por la busqueda del backend
  const filtered = jacData.filter((j) => {
    const matchAfiliados = !filters.minAfiliados || j.afiliados >= Number(filters.minAfiliados);
    return matchAfiliados;
  });

  const getJacById = (id: number) => jacData.find((item) => item.id === id) ?? null;

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
    // setters de filtros
    filters,
    setBusqueda: (v: string) => setFilters((p) => ({ ...p, busqueda: v })),
    setMunicipio: (v: string) => setFilters((p) => ({ ...p, municipio: v })),
    setEstado: (v: EstadoOrganizativo | "") => setFilters((p) => ({ ...p, estado: v })),
    setMinAfiliados: (v: string) => setFilters((p) => ({ ...p, minAfiliados: v })),
    setLimite: (v: number) => setFilters((p) => ({ ...p, limite: v })),
  };
}
