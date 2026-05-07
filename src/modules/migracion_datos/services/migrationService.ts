import { MigrationOptions, MigrationResponse } from "../types";

const asocomunalesEndpoint = import.meta.env.VITE_ASOCOMUNALES_ENDPOINT?.replace(/\/$/, "") || "http://localhost:3001";
const jacEndpoint = import.meta.env.VITE_JAC_ENDPOINT?.replace(/\/$/, "") || "http://localhost:3002";

export class MigrationService {
  static async uploadExcel({ file, entity }: MigrationOptions): Promise<MigrationResponse> {
    if (!file) throw new Error("No file provided");
    const formData = new FormData();
    formData.append("file", file);
    
    const endpointPath = entity === "asocomunales" ? "/asocomunal/import-file" : "/jac/import";
    const base = entity === "asocomunales" ? asocomunalesEndpoint : jacEndpoint;

    const response = await fetch(`${base}${endpointPath}`, {
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

    const endpointPath = entity === "asocomunales" ? "/asocomunal/import" : "/jac/import";
    const base = entity === "asocomunales" ? asocomunalesEndpoint : jacEndpoint;

    const response = await fetch(`${base}${endpointPath}`, {
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
