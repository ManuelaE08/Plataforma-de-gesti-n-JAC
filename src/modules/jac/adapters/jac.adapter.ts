import type { JacItem, JacListItem } from "../types";

/**
 * Adapter para JAC.
 *
 * El microservicio ya devuelve los datos en el formato que consume el frontend
 * (JacItemDto ≡ JacItem y JacListItemDto ≡ JacListItem), por lo que no se
 * necesita transformación. El adapter existe para que, si el contrato del
 * backend cambia, solo haya que tocar este archivo sin modificar el hook
 * ni las páginas.
 */
export class JACAdapter {
  static mapJAC(raw: JacItem): JacItem {
    return raw;
  }

  static mapJACs(raw: JacListItem[]): JacListItem[] {
    return raw;
  }
}
