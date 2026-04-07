import type { AsocomunalItem, CreateAsocomunalDto, UpdateAsocomunalDto } from "../types";

const baseEndpoint = import.meta.env.VITE_ENDPOINT?.replace(/\/$/, "");

/**
 * Servicio para interactuar con el microservicio de asocomunales.
 * Maneja las llamadas HTTP a los endpoints del backend.
 * 
 * Endpoints del backend: POST/GET/PATCH/DELETE /asocomunal
 */
export class AsocomunalesService {
  /**
   * Obtiene la lista de todas las asocomunales.
   * GET /asocomunal
   */
  static async getAsocomunales(): Promise<AsocomunalItem[]> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener asocomunales: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene una asocomunal por ID.
   * GET /asocomunal/:id
   */
  static async getAsocomunalById(id: number): Promise<AsocomunalItem> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener asocomunal: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtiene una asocomunal con sus JACs afiliadas.
   * GET /asocomunal/:id/jacs
   */
  static async getAsocomunalWithJacs(id: number): Promise<AsocomunalItem> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal/${id}/jacs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener asocomunal con JACs: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Crea una nueva asocomunal.
   * POST /asocomunal
   */
  static async createAsocomunal(data: CreateAsocomunalDto): Promise<AsocomunalItem> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al crear asocomunal: ${errorText || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Actualiza una asocomunal existente.
   * PATCH /asocomunal/:id
   */
  static async updateAsocomunal(id: number, data: UpdateAsocomunalDto): Promise<AsocomunalItem> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar asocomunal: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Activa una asocomunal.
   * PATCH /asocomunal/:id/activate
   */
  static async activateAsocomunal(id: number): Promise<AsocomunalItem> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal/${id}/activate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al activar asocomunal: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Desactiva una asocomunal.
   * PATCH /asocomunal/:id/deactivate
   */
  static async deactivateAsocomunal(id: number): Promise<AsocomunalItem> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal/${id}/deactivate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al desactivar asocomunal: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Elimina una asocomunal por ID.
   * DELETE /asocomunal/:id
   */
  static async deleteAsocomunal(id: number): Promise<AsocomunalItem> {
    if (!baseEndpoint) {
      throw new Error("VITE_ENDPOINT no está configurado");
    }

    const response = await fetch(`${baseEndpoint}/asocomunal/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar asocomunal: ${response.statusText}`);
    }

    return response.json();
  }
}