const baseEndpoint = import.meta.env.VITE_AUDITORIA?.replace(/\/$/, "") || "http://localhost:3002";

export class SolicitudesService {
  /**
   * Obtiene TODAS las solicitudes (Para Administradores)
   * GET /solicitudes
   */
  static async getTodas(): Promise<any[]> {
    const response = await fetch(`${baseEndpoint}/solicitudes`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    return await response.json();
  }

  /**
   * Obtiene solicitudes creadas por el usuario activo (Para Operadores)
   * GET /solicitudes/mias
   */
  static async getMias(): Promise<any[]> {
    const response = await fetch(`${baseEndpoint}/solicitudes/mias`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    return await response.json();
  }

  /**
   * Crea una nueva solicitud en el MS Auditoria
   * POST /solicitudes
   */
  static async crear(dto: any): Promise<any> {
    const response = await fetch(`${baseEndpoint}/solicitudes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(JSON.parse(errorText).message || errorText);
    }
    return await response.json();
  }

  /**
   * Aprueba una solicitud (Solo Admin)
   * PATCH /solicitudes/:id/aprobar
   */
  static async aprobar(id: number): Promise<any> {
    const response = await fetch(`${baseEndpoint}/solicitudes/${id}/aprobar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error(`Error al aprobar: ${response.statusText}`);
    return await response.json();
  }

  /**
   * Rechaza una solicitud (Solo Admin)
   * PATCH /solicitudes/:id/rechazar
   */
  static async rechazar(id: number, motivo: string): Promise<any> {
    const response = await fetch(`${baseEndpoint}/solicitudes/${id}/rechazar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
      credentials: "include",
    });
    if (!response.ok) throw new Error(`Error al rechazar: ${response.statusText}`);
    return await response.json();
  }
}
