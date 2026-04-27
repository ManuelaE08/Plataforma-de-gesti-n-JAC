import type { Jac, EstadoJac } from "../types";

/**
 * Adapter para transformar datos de JACs del backend.
 * Separa la lógica de transformación de datos de la lógica de negocio.
 * Facilita cambios en la estructura del backend sin afectar el frontend.
 *
 * Ejemplo: Convierte estadoId (1/2) a "Activa"/"Inactiva" para UI.
 */
export class JacAdapter {
  /**
   * Transforma una JAC del backend a un formato optimizado para el frontend.
   * Agrega campos calculados como estadoLabel y municipioNombre.
   */
  static mapJac(jac: Jac): Jac & {
    estadoLabel: EstadoJac;
    municipioNombre: string;
    barrio: string;
  } {
    return {
      ...jac,
      estadoLabel: jac.estadoId === 1 ? "Activa" : "Inactiva",
      municipioNombre: jac.asocomunal?.municipioNombre || "Sin municipio",
      barrio: jac.nombreCorto || jac.nombreCompleto,
    };
  }

  /**
   * Transforma una lista de JACs.
   */
  static mapJacs(jacs: Jac[]): (Jac & {
    estadoLabel: EstadoJac;
    municipioNombre: string;
    barrio: string;
  })[] {
    return jacs.map(this.mapJac);
  }

  /**
   * Extrae el nombre del barrio/vereda del nombre completo o corto.
   * Ejemplo: "Junta de Acción Comunal Barrio El Pino" -> "El Pino"
   */
  static extractBarrio(nombreCompleto: string, nombreCorto?: string | null): string {
    if (nombreCorto) {
      // Intentar extraer del nombre corto
      const match = nombreCorto.match(/(?:JAC|Barrio|Vereda)\s+(.+)/i);
      if (match) return match[1];
      return nombreCorto;
    }

    // Intentar extraer del nombre completo
    const patterns = [
      /Barrio\s+(.+)/i,
      /Vereda\s+(.+)/i,
      /Comunal\s+(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = nombreCompleto.match(pattern);
      if (match) return match[1];
    }

    return nombreCompleto;
  }
}