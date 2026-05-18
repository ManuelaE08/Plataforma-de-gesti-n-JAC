import type { Municipio } from "../types";

const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
const baseEndpoint = `${apiBase}/asocomunales/municipios`;

/**
 * Servicio para interactuar con el microservicio de municipios.
 * Maneja las llamadas HTTP a los endpoints del backend.
 * 
 * Endpoints del backend: GET /municipio, GET /municipio/:id
 */
export class MunicipiosService {
  /**
   * Obtiene la lista de todos los municipios.
   * GET /municipio
   */
  static async getMunicipios(): Promise<Municipio[]> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener municipios: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene un municipio por ID.
   * GET /municipio/:id
   */
  static async getMunicipioById(id: number): Promise<Municipio> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener municipio: ${response.statusText}`);
    }

    return response.json();
  }
}