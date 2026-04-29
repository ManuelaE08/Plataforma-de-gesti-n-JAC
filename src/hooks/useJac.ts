import { useState, useEffect, useRef, useCallback } from "react";
import { JACService } from "../modules/jac/services/jacService";

// ── Tipos re-exportados desde el módulo para que las páginas no cambien sus imports ──
export type { EstadoDocumental, EstadoOrganizativo, EstadoAprobacion, RolAfiliado, AfiliadoItem, JacItem } from "../modules/jac/types";
import type { JacItem } from "../modules/jac/types";

// ── Tipos de filtros ──────────────────────────────────────────────────────────

interface JacFilters {
  busqueda: string;
  municipio: string;
  estado: string;
  documental: string;
  minAfiliados: string;
}

const initialFilters: JacFilters = {
  busqueda: "", municipio: "", estado: "", documental: "", minAfiliados: "",
};

// ── Constantes de UI ──────────────────────────────────────────────────────────

export const columns: string[] = [
  "Nombre de la JAC", "Municipio", "Barrio/Vereda", "Afiliados",
  "Estado documental", "Estado organizativo", "Estado de aprobación", "Acciones",
];

export const docVariant: Record<string, "green" | "red" | "amber"> = {
  Vigente: "green", Vencida: "red", "Por vencer": "amber",
};
export const orgVariant: Record<string, "green" | "gray"> = {
  Activa: "green", Inactiva: "gray",
};
export const aprobVariant: Record<string, "green" | "amber" | "red"> = {
  Activo: "green", Pendiente: "amber", Rechazado: "red",
};
export const rolVariant: Record<string, "green" | "blue" | "amber" | "gray"> = {
  Presidente: "green", Vicepresidente: "blue", Secretario: "blue",
  Tesorero: "amber", Fiscal: "amber", Afiliado: "gray",
};

// ── Hook principal ────────────────────────────────────────────────────────────

export function useJac() {
  const [jacData,  setJacData]  = useState<JacItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [filters,  setFilters]  = useState<JacFilters>(initialFilters);
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carga inicial de datos desde el microservicio
  const fetchJacs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await JACService.findAll();
      setJacData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las JAC");
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Filtrado en cliente (instantáneo tras la carga)
  const filtered = jacData.filter((j) => {
    const matchBusqueda =
      !debouncedBusqueda ||
      [j.nombre, j.municipio, j.barrio].some((v) =>
        v.toLowerCase().includes(debouncedBusqueda.toLowerCase())
      );
    const matchMunicipio  = !filters.municipio    || j.municipio    === filters.municipio;
    const matchEstado     = !filters.estado       || j.organizativo === filters.estado;
    const matchDocumental = !filters.documental   || j.documental   === filters.documental;
    const matchAfiliados  = !filters.minAfiliados || j.afiliados    >= Number(filters.minAfiliados);
    return matchBusqueda && matchMunicipio && matchEstado && matchDocumental && matchAfiliados;
  });

  const getJacById = (id: number) => jacData.find((item) => item.id === id) ?? null;

  return {
    // datos
    jacData,
    filtered,
    loading,
    error,
    // acciones
    refetch: fetchJacs,
    handleClear,
    getJacById,
    // setters de filtros
    filters,
    setBusqueda:     (v: string) => setFilters((p) => ({ ...p, busqueda: v })),
    setMunicipio:    (v: string) => setFilters((p) => ({ ...p, municipio: v })),
    setEstado:       (v: string) => setFilters((p) => ({ ...p, estado: v })),
    setDocumental:   (v: string) => setFilters((p) => ({ ...p, documental: v })),
    setMinAfiliados: (v: string) => setFilters((p) => ({ ...p, minAfiliados: v })),
  };
}
