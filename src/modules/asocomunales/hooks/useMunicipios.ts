import { useState, useEffect } from "react";
import type { Municipio } from "../types";
import { MunicipiosService } from "../services/municipiosService";

/**
 * Hook personalizado para obtener y gestionar la lista de municipios.
 * 
 * Realiza la petición inicial al backend y maneja los estados de carga y error.
 * 
 * @returns {Object} Objeto con municipios, estado de carga y error.
 * @property {Municipio[]} municipios - Lista de municipios.
 * @property {boolean} loading - Estado de carga.
 * @property {string | null} error - Mensaje de error si ocurre alguno.
 */
export function useMunicipios() {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMunicipios = async () => {
      try {
        setLoading(true);
        const data = await MunicipiosService.getMunicipios();
        setMunicipios(data);
      } catch (err) {
        console.error("Error cargando municipios:", err);
        setError("Error al cargar municipios");
      } finally {
        setLoading(false);
      }
    };

    fetchMunicipios();
  }, []);

  return {
    municipios,
    loading,
    error,
  };
}