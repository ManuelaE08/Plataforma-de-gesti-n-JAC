import { useState, useEffect, useRef } from "react";
import type {
  Asocomunal,
  AsocomunalFilters,
  CreateAsocomunalDto,
  UpdateAsocomunalDto,
} from "../types";
import { AsocomunalesService } from "../services/asocomunalesService";

const initialFilters: AsocomunalFilters = {
  busqueda: "",
  municipio: null,
  estado: null,
};

/**
 * Hook personalizado para gestionar el estado y operaciones de asocomunales.
 * Maneja la carga de datos, filtros, CRUD y estado de carga/error.
 * Separa la lógica de negocio de los componentes UI.
 *
 * Flujo: Component → Hook → Service → Backend
 */
export function useAsocomunales() {
  const [data, setData] = useState<Asocomunal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AsocomunalFilters>(initialFilters);
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar datos del backend al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const asocomunales = await AsocomunalesService.getAsocomunales();
        setData(asocomunales);
      } catch (err) {
        console.error("Error cargando asocomunales:", err);
        setError("Error al cargar asocomunales");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedBusqueda(filters.busqueda);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters.busqueda]);

  const handleClear = () => {
    setFilters(initialFilters);
    setDebouncedBusqueda("");
  };

  // Filtrar por búsqueda, municipio y estado
  const filtered = data.filter((item) => {
    const matchBusqueda =
      !debouncedBusqueda ||
      item.nombre.toLowerCase().includes(debouncedBusqueda.toLowerCase());

    const matchMunicipio =
      filters.municipio === null || (item.municipio && Number(item.municipio.id) === filters.municipio);

    const matchEstado =
      filters.estado === null ||
      String(item.estado) === String(filters.estado);

    return matchBusqueda && matchMunicipio && matchEstado;
  });

  // Funciones para CRUD
  const createAsocomunal = async (newAsoc: CreateAsocomunalDto) => {
    try {
      const created = await AsocomunalesService.createAsocomunal(newAsoc);
      setData((prev) => [...prev, created]);
      return created;
    } catch (err) {
      console.error("Error creando asocomunal:", err);
      throw err;
    }
  };

  const updateAsocomunal = async (id: number, updates: UpdateAsocomunalDto) => {
    try {
      const updated = await AsocomunalesService.updateAsocomunal(id, updates);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      console.error("Error actualizando asocomunal:", err);
      throw err;
    }
  };

  const deleteAsocomunal = async (id: number) => {
    try {
      await AsocomunalesService.deleteAsocomunal(id);
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error eliminando asocomunal:", err);
      throw err;
    }
  };

  const toggleAsocomunalStatus = async (id: number, activate: boolean) => {
    try {
      const updated = activate
        ? await AsocomunalesService.activateAsocomunal(id)
        : await AsocomunalesService.deactivateAsocomunal(id);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      console.error(`Error ${activate ? "activando" : "desactivando"} asocomunal:`, err);
      throw err;
    }
  };

  return {
    data,
    filtered,
    loading,
    error,
    filters,
    handleClear,
    createAsocomunal,
    updateAsocomunal,
    deleteAsocomunal,
    toggleAsocomunalStatus,
    setBusqueda: (v: string) => setFilters((p) => ({ ...p, busqueda: v })),
    setMunicipio: (v: number | null) => setFilters((p) => ({ ...p, municipio: v })),
    setEstado: (v: boolean | null) => setFilters((p) => ({ ...p, estado: v })),
  };
}