import type { Asocomunal, AsocomunalPublicApi } from "../types";

/**
 * Adapter para transformar datos de asocomunales del backend.
 * Separa la lógica de transformación de datos de la lógica de negocio.
 * Facilita cambios en la estructura del backend sin afectar el frontend.
 *
 * Ejemplo: Convierte estado boolean a "Activa"/"Inactiva" para UI.
 */
export class AsocomunalAdapter {
  /**
   * Mapea el estado de una JAC a formato "Activa" | "Inactiva" | "Cancelada"
   */
  private static mapJacEstado(estado: any): "Activa" | "Inactiva" | "Cancelada" {
    if (typeof estado === "boolean") {
      return estado ? "Activa" : "Inactiva";
    }
    if (typeof estado === "string") {
      const lower = estado.toLowerCase();
      if (lower === "activa" || lower === "active") return "Activa";
      if (lower === "inactiva" || lower === "inactive") return "Inactiva";
      if (lower === "cancelada" || lower === "cancelled" || lower === "canceled") return "Cancelada";
    }
    return "Inactiva"; // default
  }

  /**
   * Transforma una asocomunal del backend a un formato optimizado para el frontend.
   * Agrega campos calculados como estadoLabel y municipioNombre.
   * Mapea también el estado de las JACs afiliadas.
   */
  static mapAsocomunal(asocomunal: Asocomunal): Asocomunal & {
    estadoLabel: "Activa" | "Inactiva";
    municipioNombre: string;
  } {
    return {
      ...asocomunal,
      jacs: (asocomunal.jacs ?? []).map(jac => ({
        ...jac,
        estado: this.mapJacEstado(jac.estado) as any, // mapear estado de cada JAC
      })),
      municipio: asocomunal.municipio ?? { id: 0, nombre: "" },
      estadoLabel: asocomunal.estado ? "Activa" : "Inactiva",
      municipioNombre: asocomunal.municipio?.nombre ?? "",
    };
  }

  /**
   * Transforma una lista de asocomunales.
   */
  static mapAsocomunales(asocomunales: Asocomunal[]): (Asocomunal & {
    estadoLabel: "Activa" | "Inactiva";
    municipioNombre: string;
  })[] {
    return asocomunales.map((item) => AsocomunalAdapter.mapAsocomunal(item));
  }

  static mapPublicAsocomunal(raw: AsocomunalPublicApi): Asocomunal & {
    estadoLabel: "Activa" | "Inactiva";
    municipioNombre: string;
  } {
    const asocomunal: Asocomunal = {
      id: raw.id,
      nombre: raw.nombre,
      estado: raw.estado,
      municipio: raw.municipio,
      jacs: (raw.jacs ?? []).map((jac, index) => ({
        id: index,
        nombre: jac.nombre,
        estado: jac.estado,
      })),
    };
    return AsocomunalAdapter.mapAsocomunal(asocomunal);
  }

  static mapPublicAsocomunales(raw: AsocomunalPublicApi[]): (Asocomunal & {
    estadoLabel: "Activa" | "Inactiva";
    municipioNombre: string;
  })[] {
    return raw.map((item) => AsocomunalAdapter.mapPublicAsocomunal(item));
  }
}