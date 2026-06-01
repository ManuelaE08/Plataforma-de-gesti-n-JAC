import { useCallback, useEffect, useRef, useState } from "react";
import { JACService } from "../modules/jac/services/jacService";
import type {
  AlertaCategoria,
  AlertasResumen,
  AlertaJacItem,
  AlertasJacPage,
} from "../modules/jac/types";

/** Severidad visual de cada categoría, para pintar tarjetas y badges. */
export type AlertaSeveridad = "critica" | "alta" | "media" | "info";

export interface CategoriaMeta {
  categoria: AlertaCategoria;
  titulo: string;
  descripcion: string;
  severidad: AlertaSeveridad;
}

/**
 * Metadatos de cada categoría de alerta. El orden define cómo se muestran:
 * primero lo más crítico (riesgo de pérdida de personería), luego lo documental.
 */
export const categoriasAlerta: CategoriaMeta[] = [
  {
    categoria: "riesgo_activa",
    titulo: "Activas en riesgo",
    descripcion: "Activas pero por debajo del mínimo legal de afiliados. Pueden perder su condición de activa.",
    severidad: "critica",
  },
  {
    categoria: "riesgo_inactiva",
    titulo: "Inactivas por afiliados",
    descripcion: "Inactivas que no alcanzan el mínimo legal de afiliados para activarse.",
    severidad: "alta",
  },
  {
    categoria: "sin_ruc",
    titulo: "Sin número de RUC",
    descripcion: "JAC sin Registro Único Comunal registrado.",
    severidad: "media",
  },
  {
    categoria: "sin_ruc_nit",
    titulo: "Sin RUC ni NIT",
    descripcion: "JAC que no tienen ni RUC ni NIT. Prioridad de formalización.",
    severidad: "alta",
  },
  {
    categoria: "sin_nit",
    titulo: "Sin NIT",
    descripcion: "JAC sin NIT registrado (la mayoría del directorio).",
    severidad: "info",
  },
];

const PAGE_SIZE = 10;

export function useAlertas() {
  // ── Resumen (conteos agregados) ──────────────────────────────────────────
  const [resumen, setResumen] = useState<AlertasResumen | null>(null);
  const [loadingResumen, setLoadingResumen] = useState(true);
  const [errorResumen, setErrorResumen] = useState<string | null>(null);

  const fetchResumen = useCallback(async () => {
    setLoadingResumen(true);
    setErrorResumen(null);
    try {
      const data = await JACService.getAlertasResumen();
      setResumen(data);
    } catch (err) {
      setErrorResumen(err instanceof Error ? err.message : "Error al cargar el resumen de alertas");
    } finally {
      setLoadingResumen(false);
    }
  }, []);

  useEffect(() => {
    fetchResumen();
  }, [fetchResumen]);

  // ── Detalle de una categoría (bajo demanda, paginado) ──────────────────────
  const [categoriaAbierta, setCategoriaAbierta] = useState<AlertaCategoria | null>(null);
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const [detalle, setDetalle] = useState<AlertasJacPage | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce del buscador del detalle.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedBusqueda(busqueda);
      setPage(1);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [busqueda]);

  // Carga el detalle cuando hay categoría abierta, cambia la página o la búsqueda.
  useEffect(() => {
    if (!categoriaAbierta) {
      setDetalle(null);
      return;
    }
    let cancelled = false;
    setLoadingDetalle(true);
    setErrorDetalle(null);

    JACService.getAlertasJacs({
      categoria: categoriaAbierta,
      page,
      limit: PAGE_SIZE,
      busqueda: debouncedBusqueda || undefined,
    })
      .then((data) => { if (!cancelled) setDetalle(data); })
      .catch((err) => { if (!cancelled) setErrorDetalle(err instanceof Error ? err.message : "Error al cargar el detalle"); })
      .finally(() => { if (!cancelled) setLoadingDetalle(false); });

    return () => { cancelled = true; };
  }, [categoriaAbierta, page, debouncedBusqueda]);

  const abrirCategoria = useCallback((categoria: AlertaCategoria) => {
    setCategoriaAbierta((prev) => (prev === categoria ? prev : categoria));
    setPage(1);
    setBusqueda("");
    setDebouncedBusqueda("");
  }, []);

  const cerrarCategoria = useCallback(() => {
    setCategoriaAbierta(null);
    setDetalle(null);
    setBusqueda("");
    setDebouncedBusqueda("");
    setPage(1);
  }, []);

  /** Devuelve el conteo de una categoría a partir del resumen ya cargado. */
  const conteoDe = useCallback((categoria: AlertaCategoria): number => {
    if (!resumen) return 0;
    switch (categoria) {
      case "riesgo_activa":   return resumen.riesgoActiva;
      case "riesgo_inactiva": return resumen.riesgoInactiva;
      case "sin_ruc":         return resumen.sinRuc;
      case "sin_nit":         return resumen.sinNit;
      case "sin_ruc_nit":     return resumen.sinRucNit;
    }
  }, [resumen]);

  return {
    // resumen
    resumen,
    loadingResumen,
    errorResumen,
    refetchResumen: fetchResumen,
    conteoDe,
    categorias: categoriasAlerta,
    // detalle
    categoriaAbierta,
    abrirCategoria,
    cerrarCategoria,
    detalle,
    loadingDetalle,
    errorDetalle,
    page,
    setPage,
    busqueda,
    setBusqueda,
    pageSize: PAGE_SIZE,
  };
}

export type { AlertaCategoria, AlertaJacItem };
