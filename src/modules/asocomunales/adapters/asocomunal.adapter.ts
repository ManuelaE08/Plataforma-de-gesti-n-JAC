import type { Asocomunal } from "../types";

/**
 * Adapter para transformar datos de asocomunales del backend.
 * Separa la lógica de transformación de datos de la lógica de negocio.
 * Facilita cambios en la estructura del backend sin afectar el frontend.
 *
 * Ejemplo: Convierte estado boolean a "Activo"/"Inactivo" para UI.
 */
export class AsocomunalAdapter {
  /**
   * Transforma una asocomunal del backend a un formato optimizado para el frontend.
   * Agrega campos calculados como estadoLabel y municipioNombre.
   */
  static mapAsocomunal(asocomunal: Asocomunal): Asocomunal & {
    estadoLabel: "Activo" | "Inactivo";
    municipioNombre: string;
  } {
    return {
      ...asocomunal,
      estadoLabel: asocomunal.estado ? "Activo" : "Inactivo",
      municipioNombre: asocomunal.municipio.nombre,
    };
  }

  /**
   * Transforma una lista de asocomunales.
   */
  static mapAsocomunales(asocomunales: Asocomunal[]): (Asocomunal & {
    estadoLabel: "Activo" | "Inactivo";
    municipioNombre: string;
  })[] {
    return asocomunales.map(this.mapAsocomunal);
  }
}