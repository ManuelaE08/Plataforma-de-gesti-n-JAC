import type { Jac, CreateJacDto, UpdateJacDto, JacSearchParams } from "../types";
import { JacAdapter } from "../adapters/jac.adapter";

const baseEndpoint = import.meta.env.VITE_ENDPOINT?.replace(/\/$/, "");

/**
 * Servicio para interactuar con el microservicio de JAC.
 * Maneja las llamadas HTTP a los endpoints del backend.
 * 
 * Endpoints del backend:
 * - POST   /jac              - Crear JAC
 * - GET    /jac              - Listar todas las JAC activas
 * - GET    /jac/buscar       - Buscar JAC con filtros
 * - GET    /jac/:id          - Obtener JAC por ID
 * - PATCH  /jac/:id          - Actualizar JAC
 * - DELETE /jac/:id          - Eliminar JAC (lógico)
 * 
 * Autenticación: Cookie HTTP-Only → rol=admin
 */
export class JacService {
  /**
   * Crea una nueva JAC.
   * POST /jac
   */
  static async createJac(data: CreateJacDto): Promise<Jac> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/jac`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Incluye la cookie de autenticación
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = Array.isArray(errorData.message)
            ? errorData.message.join(", ")
            : errorData.message;
        }
      } catch {
        // Si no es JSON, usar el texto tal cual
      }
      throw new Error(errorMessage);
    }

    const newJac: Jac = await response.json();
    return JacAdapter.mapJac(newJac);
  }

  /**
   * Obtiene la lista de todas las JACs activas.
   * GET /jac
   */
  static async getAllJacs(): Promise<(Jac & {
    estadoLabel: "Activa" | "Inactiva";
    municipioNombre: string;
    barrio: string;
  })[]> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/jac`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error al obtener JACs: ${response.statusText}`);
    }

    const jacs: Jac[] = await response.json();
    return JacAdapter.mapJacs(jacs);
  }

  /**
   * Busca JACs con filtros opcionales.
   * GET /jac/buscar?nombre=...&municipio=...&estado=...
   */
  static async searchJacs(params: JacSearchParams): Promise<(Jac & {
    estadoLabel: "Activa" | "Inactiva";
    municipioNombre: string;
    barrio: string;
  })[]> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    // Construir query params
    const queryParams = new URLSearchParams();
    if (params.nombre) queryParams.append("nombre", params.nombre);
    if (params.municipio) queryParams.append("municipio", params.municipio);
    if (params.estado) queryParams.append("estado", params.estado);

    const url = `${baseEndpoint}/jac/buscar${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error al buscar JACs: ${response.statusText}`);
    }

    const jacs: Jac[] = await response.json();
    return JacAdapter.mapJacs(jacs);
  }

  /**
   * Obtiene una JAC por ID.
   * GET /jac/:id
   */
  static async getJacById(id: number): Promise<Jac> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/jac/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`JAC con ID ${id} no encontrada`);
      }
      throw new Error(`Error al obtener JAC: ${response.statusText}`);
    }

    const jac: Jac = await response.json();
    return JacAdapter.mapJac(jac);
  }

  /**
   * Actualiza una JAC existente.
   * PATCH /jac/:id
   */
  static async updateJac(id: number, data: UpdateJacDto): Promise<Jac> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/jac/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = Array.isArray(errorData.message)
            ? errorData.message.join(", ")
            : errorData.message;
        }
      } catch {
        // Si no es JSON, usar el texto tal cual
      }
      throw new Error(errorMessage);
    }

    const updated: Jac = await response.json();
    return JacAdapter.mapJac(updated);
  }

  /**
   * Elimina una JAC (lógico - cambia estado a inactivo).
   * DELETE /jac/:id
   */
  static async deleteJac(id: number): Promise<{ message: string }> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/jac/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`JAC con ID ${id} no encontrada`);
      }
      throw new Error(`Error al eliminar JAC: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Activa una JAC (cambia estadoId a 1).
   * PATCH /jac/:id con estadoId: 1
   */
  static async activateJac(id: number): Promise<Jac> {
    return this.updateJac(id, { estadoId: 1 });
  }

  /**
   * Desactiva una JAC (cambia estadoId a 2).
   * Usa el endpoint DELETE que hace el soft delete
   */
  static async deactivateJac(id: number): Promise<{ message: string }> {
    return this.deleteJac(id);
  }
}