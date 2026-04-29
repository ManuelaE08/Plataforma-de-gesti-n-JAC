import type { JACResponse, EstadoJAC } from "../types";

export type JACMapped = JACResponse & {
  estadoLabel: "Activa" | "Inactiva" | "Cancelada";
  nombre: string;
};

const estadoLabelMap: Record<EstadoJAC, "Activa" | "Inactiva" | "Cancelada"> = {
  activa: "Activa",
  inactiva: "Inactiva",
  cancelada: "Cancelada",
};

export class JACAdapter {
  static mapJAC(jac: JACResponse): JACMapped {
    return {
      ...jac,
      estadoLabel: estadoLabelMap[jac.estado] ?? "Inactiva",
      nombre: jac.nombreCompleto,
    };
  }

  static mapJACs(jacs: JACResponse[]): JACMapped[] {
    return jacs.map(JACAdapter.mapJAC);
  }
}
