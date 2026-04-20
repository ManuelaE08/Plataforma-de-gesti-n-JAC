import { MigrationOptions, MigrationResponse } from "../types";

const baseEndpoint = import.meta.env.VITE_ENDPOINT?.replace(/\/$/, "") || "http://localhost:3000";

export class MigrationService {
  static async uploadExcel({ file, entity }: MigrationOptions): Promise<MigrationResponse> {
    const formData = new FormData();
    formData.append("file", file);
    
    // Suponiendo endpoints como /asocomunal/import o /jac/import basados en el backend (ej. NestJS).
    // Si tienes un endpoint global /migracion, cámbialo aquí.
    const endpointPath = entity === "asocomunales" ? "/asocomunal/import" : "/jac/import";
    
    const response = await fetch(`${baseEndpoint}${endpointPath}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en migración: ${errorText || response.statusText}`);
    }

    return await response.json();
  }
}
