import { MigrationOptions, MigrationResponse } from "../types";

const baseEndpoint = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export class MigrationService {
  static async uploadExcel({ file, entity }: MigrationOptions): Promise<MigrationResponse> {
    if (!file) throw new Error("No file provided");
    const formData = new FormData();
    formData.append("file", file);
    
    const endpoint = entity === "asocomunales" 
      ? `${baseEndpoint}/asocomunales/import-file` 
      : `${baseEndpoint}/jacs/import`;

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en migración: ${errorText || response.statusText}`);
    }

    return await response.json();
  }

  static async uploadJSON({ data, entity }: MigrationOptions): Promise<MigrationResponse> {
    if (!data) throw new Error("No data provided");

    const endpoint = entity === "asocomunales" 
      ? `${baseEndpoint}/asocomunales/import` 
      : `${baseEndpoint}/jacs/import`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en migración: ${errorText || response.statusText}`);
    }

    return await response.json();
  }
}
