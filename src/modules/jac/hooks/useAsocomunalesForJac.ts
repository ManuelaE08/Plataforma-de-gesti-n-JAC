import { useState, useEffect } from "react";
import type { AsocomunalBasica } from "../types";

const baseEndpoint = import.meta.env.VITE_ENDPOINT?.replace(/\/$/, "");

/**
 * Hook para cargar las asocomunales disponibles.
 * Útil para poblar el selector de asocomunal en el formulario de JAC.
 */
export function useAsocomunalesForJac() {
  const [asocomunales, setAsocomunales] = useState<AsocomunalBasica[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAsocomunales = async () => {
      if (!baseEndpoint) {
        setError("VITE_ENDPOINT no está configurado");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${baseEndpoint}/asocomunal`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Error al cargar asocomunales: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Mapear al formato que necesita el formulario
        const mapped: AsocomunalBasica[] = data.map((asoc: any) => ({
          id: asoc.id,
          nombre: asoc.nombre,
          municipioId: asoc.municipio?.id || 0,
          municipioNombre: asoc.municipio?.nombre || "Sin municipio",
          estado: asoc.estado,
        }));

        setAsocomunales(mapped);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar asocomunales";
        setError(errorMessage);
        console.error("Error loading asocomunales:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAsocomunales();
  }, []);

  return { asocomunales, loading, error };
}