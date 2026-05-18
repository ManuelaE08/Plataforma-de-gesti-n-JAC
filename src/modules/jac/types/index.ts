// ── Enums / literales ────────────────────────────────────────────────────────

export type EstadoDocumental = "Vigente" | "Vencida" | "Por vencer";
export type EstadoOrganizativo = "Activa" | "Inactiva";
export type TipoJac           = "Barrio" | "Vereda";

/**
 * Valores aceptados por el backend para el campo `tipo` al crear/actualizar
 * una JAC. Coinciden con el enum `TipoJAC` en `jac.entity.ts`.
 */
export type TipoJacEnum = "barrio" | "vereda";
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

/** Detalle público de JAC (`GET /jac/public/:id`) — sin PII. */
export interface JacPublicItem {
  id: number;
  nombre: string;
  municipio: string;
  barrio: string;
  afiliados: number;
  estado: EstadoOrganizativo;
  tipo: TipoJac;
  minimoAfiliados: number;
  enRiesgo: boolean;
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
  documental: EstadoDocumental;
  estado: EstadoOrganizativo;
  /** Tipo de territorio que cubre la JAC (Barrio urbano / Vereda rural). */
  tipo: TipoJac;
  /** Número de RUC tal como está en BD; `null` cuando no está registrado. */
  numeroRUC: string | null;
  /** Mínimo legal de afiliados para sostener la JAC activa según su tipo. */
  minimoAfiliados: number;
  /** `true` cuando la JAC está activa pero no alcanza el mínimo legal. */
  enRiesgo: boolean;
  miembros: AfiliadoItem[];
  asocomunalId?: number | null;
}

// ── DTOs de entrada ───────────────────────────────────────────────────────────

/**
 * Datos para crear una JAC.
 *
 * @remarks
 * - `asocomunalId` y `tipo` son obligatorios.
 * - El backend siempre crea la JAC con estado `inactiva`,
 *   por lo que el campo no se envía desde el frontend.
 * - `nombreCorto` y `numeroRUC` son opcionales.
 */
export interface CreateJACDto {
  asocomunalId: number;
  tipo: TipoJacEnum;
  nombreCompleto: string;
  nombreCorto?: string;
  numeroRUC?: string;
}

export interface UpdateJACDto {
  asocomunalId?: number;
  /** El backend acepta los valores del enum en minúscula: 'activa' | 'inactiva' | 'cancelada' */
  estado?: "activa" | "inactiva" | "cancelada";
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
