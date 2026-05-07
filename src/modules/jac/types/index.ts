// ── Enums / literales ────────────────────────────────────────────────────────

export type EstadoDocumental  = "Vigente" | "Vencida" | "Por vencer";
export type EstadoOrganizativo = "Activa" | "Inactiva";
export type EstadoAprobacion  = "Activo" | "Pendiente" | "Rechazado";
export type TipoJac           = "Barrio" | "Vereda";
export type RolAfiliado =
  | "Presidente" | "Vicepresidente" | "Secretario"
  | "Tesorero"   | "Fiscal"         | "Afiliado";

// ── Respuestas del microservicio ──────────────────────────────────────────────

/** Miembro de una JAC tal como lo devuelve el backend (AfiliadoItemDto). */
export interface AfiliadoItem {
  id: number;
  nombre: string;
  documento: string;
  telefono: string;
  rol: RolAfiliado;
}

/** JAC completa tal como la devuelve el backend (JacItemDto). */
export interface JacItem {
  id: number;
  nombre: string;
  municipio: string;
  barrio: string;
  afiliados: number;
  documental: EstadoDocumental;
  organizativo: EstadoOrganizativo;
  aprobacion: EstadoAprobacion;
  /** Tipo de territorio que cubre la JAC (Barrio urbano / Vereda rural). */
  tipo: TipoJac;
  /** Mínimo legal de afiliados para sostener la JAC activa según su tipo. */
  minimoAfiliados: number;
  /** `true` cuando la JAC está activa pero no alcanza el mínimo legal. */
  enRiesgo: boolean;
  miembros: AfiliadoItem[];
}

// ── DTOs de entrada ───────────────────────────────────────────────────────────

export interface CreateJACDto {
  asocomunalId?: number;
  estado?: EstadoOrganizativo;
  nombreCorto?: string;
  nombreCompleto: string;
  numeroRUC?: string;
}

export interface UpdateJACDto {
  asocomunalId?: number;
  estado?: EstadoOrganizativo;
  nombreCorto?: string;
  nombreCompleto?: string;
  numeroRUC?: string;
}

export interface SearchJACDto {
  nombre?: string;
  municipio?: string;
  estado?: EstadoOrganizativo;
  limite?: number;
}

// ── Filtros del hook ──────────────────────────────────────────────────────────

export interface JACFilters {
  busqueda: string;
  municipio: string;
  estado: string;
  documental: string;
  minAfiliados: string;
}
