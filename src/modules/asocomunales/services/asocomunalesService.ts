import type { Asocomunal, CreateAsocomunalDto, UpdateAsocomunalDto } from "../types";
import { AsocomunalAdapter } from "../adapters/asocomunal.adapter";

const baseEndpoint = import.meta.env.VITE_ENDPOINT?.replace(/\/$/, "");

/**
 * Servicio para interactuar con el microservicio de asocomunales.
 * Maneja las llamadas HTTP a los endpoints del backend.
 * Aplica adapters para transformar datos antes de retornarlos al frontend.
 *
 * Endpoints del backend: POST/GET/PATCH/DELETE /asocomunal
 *
 * Patrón: Service llama al backend, aplica adapter, retorna datos transformados.
 */
export class AsocomunalesService {
  /**
   * Obtiene la lista de todas las asocomunales.
   * GET /asocomunal
   * Aplica el adapter para agregar campos calculados.
   */
  static async getAsocomunales(): Promise<Asocomunal[]> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error al obtener asocomunales: ${response.statusText}`);
    }

    const data: Asocomunal[] = await response.json();
    return AsocomunalAdapter.mapAsocomunales(data);
  }

  /**
   * Obtiene una asocomunal por ID.
   * GET /asocomunal/:id
   * Aplica el adapter para agregar campos calculados.
   */
  static async getAsocomunalById(id: number): Promise<Asocomunal> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error al obtener asocomunal: ${response.statusText}`);
    }

    const data: Asocomunal = await response.json();
    return AsocomunalAdapter.mapAsocomunal(data);
  }

  /**
   * Obtiene una asocomunal con sus JACs afiliadas.
   * GET /asocomunal/:id/jacs
   * Aplica el adapter para agregar campos calculados.
   */
  static async getAsocomunalWithJacs(id: number): Promise<Asocomunal> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal/${id}/jacs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error al obtener asocomunal con JACs: ${response.statusText}`);
    }

    const data: Asocomunal = await response.json();
    return AsocomunalAdapter.mapAsocomunal(data);
  }

  /**
   * Crea una nueva asocomunal.
   * POST /asocomunal
   */
  static async createAsocomunal(data: CreateAsocomunalDto): Promise<Asocomunal> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Si no es JSON, usar el texto tal cual
      }
      throw new Error(errorMessage);
    }

    const created: Asocomunal = await response.json();
    return AsocomunalAdapter.mapAsocomunal(created);
  }

  /**
   * Actualiza una asocomunal existente.
   * PATCH /asocomunal/:id
   */
  static async updateAsocomunal(id: number, data: UpdateAsocomunalDto): Promise<Asocomunal> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Si no es JSON, usar el texto tal cual
      }
      throw new Error(errorMessage);
    }

    const updated: Asocomunal = await response.json();
    return AsocomunalAdapter.mapAsocomunal(updated);
  }

  /**
   * Activa una asocomunal.
   * PATCH /asocomunal/:id/activate
   */
  static async activateAsocomunal(id: number): Promise<Asocomunal> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal/${id}/activate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error al activar asocomunal: ${response.statusText}`);
    }

    const activated: Asocomunal = await response.json();
    return AsocomunalAdapter.mapAsocomunal(activated);
  }

  /**
   * Desactiva una asocomunal.
   * PATCH /asocomunal/:id/deactivate
   */
  static async deactivateAsocomunal(id: number): Promise<Asocomunal> {
    const response = await fetch(`${baseEndpoint}/asocomunal/${id}`, {
      method: "DELETE",
      credentials: "include",
    });



    if (!response.ok) {
      throw new Error(`Error al desactivar asocomunal: ${response.statusText}`);
    }

    const deactivated: Asocomunal = await response.json();
    return AsocomunalAdapter.mapAsocomunal(deactivated);
  }

  /**
   * Elimina una asocomunal por ID.
   * DELETE /asocomunal/:id
   */
  static async deleteAsocomunal(id: number): Promise<Asocomunal> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar asocomunal: ${response.statusText}`);
    }

    const deleted: Asocomunal = await response.json();
    return AsocomunalAdapter.mapAsocomunal(deleted);
  }
}