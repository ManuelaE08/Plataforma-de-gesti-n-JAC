import { useState, useEffect } from "react";
import type { Municipio } from "../types";
import { MunicipiosService } from "../services/municipiosService";

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