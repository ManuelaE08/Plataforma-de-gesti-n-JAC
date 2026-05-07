// ── Enums / literales ────────────────────────────────────────────────────────

export type EstadoDocumental = "Vigente" | "Vencida" | "Por vencer";
export type EstadoOrganizativo = "Activa" | "Inactiva";
export type TipoJac = "Barrio" | "Vereda";
export type RolAfiliado =
  | "Presidente" | "Vicepresidente" | "Secretario"
  | "Tesorero" | "Fiscal" | "Afiliado";

// ── Respuestas del microservicio ──────────────────────────────────────────────

/** Miembro de una JAC tal como lo devuelve el backend (AfiliadoItemDto). */
export interface AfiliadoItem {
  id: number;
  nombre: string;
  documento: string;
  telefono: string;
  rol: RolAfiliado;
}

/**
 * Vista ligera de una JAC para listados (`GET /jac`, `GET /jac/buscar`).
 * Solo incluye lo que la tabla principal renderiza.
 */
export interface JacListItem {
  id: number;
  nombre: string;
  municipio: string;
  barrio: string;
  afiliados: number;
  organizativo: EstadoOrganizativo;
}

/**
 * JAC completa para la página de detalle (`GET /jac/:id`).
 */
export interface JacItem {
  id: number;
  nombre: string;
  municipio: string;
  barrio: string;
  afiliados: number;
  organizativo: EstadoOrganizativo;
  /** Tipo de territorio que cubre la JAC (Barrio urbano / Vereda rural). */
  tipo: TipoJac;
  /** Número de RUC tal como está en BD; `null` cuando no está registrado. */
  numeroRuc: string | null;
  /** Mínimo legal de afiliados para sostener la JAC activa según su tipo. */
  minimoAfiliados: number;
  /** `true` cuando la JAC está activa pero no alcanza el mínimo legal. */
  enRiesgo: boolean;
  miembros: AfiliadoItem[];
  asocomunalId?: number | null;
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
  documental?: EstadoDocumental;
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
