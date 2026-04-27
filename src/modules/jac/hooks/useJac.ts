import { useState, useEffect, useCallback } from "react";
import type { Jac, CreateJacDto, UpdateJacDto, JacFilters } from "../types";
import { JacService } from "../services/jacService";

/**
 * Hook para manejar el estado y operaciones de JACs.
 * Centraliza toda la lógica de negocio relacionada con JACs.
 * 
 * Funcionalidades:
 * - Listar JACs (con filtros)
 * - Crear nueva JAC
 * - Actualizar JAC existente
 * - Eliminar JAC (soft delete)
 * - Activar/Desactivar JAC
 * - Manejo de estados de carga y errores
 */
export function useJac() {
  const [jacs, setJacs] = useState<(Jac & {
    estadoLabel: "Activa" | "Inactiva";
    municipioNombre: string;
    barrio: string;
  })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JacFilters>({
    nombre: "",
    municipio: "",
    estado: "",
  });

  /**
   * Carga las JACs aplicando los filtros actuales.
   */
  const loadJacs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result;

      // Si hay filtros activos, usar el endpoint de búsqueda
      if (filters.nombre || filters.municipio || filters.estado) {
        result = await JacService.searchJacs({
          nombre: filters.nombre || undefined,
          municipio: filters.municipio || undefined,
          estado: filters.estado as "activa" | "inactiva" | undefined,
        });
      } else {
        // Sin filtros, obtener todas las JACs activas
        result = await JacService.getAllJacs();
      }

      setJacs(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar JACs";
      setError(errorMessage);
      console.error("Error loading JACs:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Carga inicial de JACs.
   */
  useEffect(() => {
    loadJacs();
  }, [loadJacs]);

  /**
   * Actualiza los filtros y recarga las JACs.
   */
  const updateFilters = useCallback((newFilters: Partial<JacFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Limpia todos los filtros.
   */
  const clearFilters = useCallback(() => {
    setFilters({
      nombre: "",
      municipio: "",
      estado: "",
    });
  }, []);

  /**
   * Crea una nueva JAC.
   */
  const createJac = useCallback(async (data: CreateJacDto) => {
    setLoading(true);
    setError(null);

    try {
      await JacService.createJac(data);
      await loadJacs(); // Recargar la lista
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear JAC";
      setError(errorMessage);
      console.error("Error creating JAC:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadJacs]);

  /**
   * Actualiza una JAC existente.
   */
  const updateJac = useCallback(async (id: number, data: UpdateJacDto) => {
    setLoading(true);
    setError(null);

    try {
      await JacService.updateJac(id, data);
      await loadJacs(); // Recargar la lista
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar JAC";
      setError(errorMessage);
      console.error("Error updating JAC:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadJacs]);

  /**
   * Elimina una JAC (soft delete).
   */
  const deleteJac = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await JacService.deleteJac(id);
      await loadJacs(); // Recargar la lista
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar JAC";
      setError(errorMessage);
      console.error("Error deleting JAC:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadJacs]);

  /**
   * Activa una JAC.
   */
  const activateJac = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await JacService.activateJac(id);
      await loadJacs(); // Recargar la lista
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al activar JAC";
      setError(errorMessage);
      console.error("Error activating JAC:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadJacs]);

  /**
   * Obtiene una JAC por ID.
   */
  const getJacById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const jac = await JacService.getJacById(id);
      return jac;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al obtener JAC";
      setError(errorMessage);
      console.error("Error getting JAC:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    jacs,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    loadJacs,
    createJac,
    updateJac,
    deleteJac,
    activateJac,
    getJacById,
  };
}