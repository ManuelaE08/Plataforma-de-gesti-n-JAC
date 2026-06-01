// ── Enums / literales ────────────────────────────────────────────────────────

export type EstadoDocumental = "Vigente" | "Vencida" | "Por vencer";
export type EstadoOrganizativo = "Activa" | "Inactiva" | "Cancelada";
export type TipoJac = "Barrio" | "Vereda";

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
  /** ID de la Asocomunal a la que pertenece la JAC (para edición). */
  asocomunalId?: number | null;
  /** Nombre de la Asocomunal (para mostrar en formularios). */
  asocomunalNombre?: string | null;
}

// ── DTOs de entrada ───────────────────────────────────────────────────────────

/**
 * Datos para crear una JAC.
 *
 * @remarks
 * - `asocomunalId` y `tipo` son obligatorios.
 * - El backend siempre crea la JAC con estado `inactiva`,
 *   por lo que el campo no se envía desde el frontend.
 * - `nombreCorto`, `numeroRUC`, `nit` y `numeroPersoneriaJuridica` son opcionales.
 */
export interface CreateJACDto {
  asocomunalId: number;
  tipo: TipoJacEnum;
  nombreCompleto: string;
  nombreCorto?: string;
  numeroRUC?: string;
  nit?: string;
  numeroPersoneriaJuridica?: string;
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

// ── Alertas y riesgo organizativo ─────────────────────────────────────────────

/**
 * Categorías de alerta que el backend puede contar y listar.
 * - `riesgo_activa`   → afiliados < mínimo legal Y estado Activa (CRÍTICO, rojo).
 * - `riesgo_inactiva` → afiliados < mínimo legal Y estado Inactiva (naranja).
 * - `sin_ruc`         → sin número de RUC registrado.
 * - `sin_nit`         → sin NIT registrado.
 * - `sin_ruc_nit`     → sin RUC y sin NIT a la vez.
 */
export type AlertaCategoria =
  | "riesgo_activa"
  | "riesgo_inactiva"
  | "sin_ruc"
  | "sin_nit"
  | "sin_ruc_nit";

/**
 * Conteos agregados de cada categoría de alerta. Es lo único que se pide al
 * cargar la pantalla: una sola llamada barata (COUNT en el backend), sin traer
 * las filas. Evita descargar miles de JAC (sobre todo "sin NIT", que son todas).
 */
export interface AlertasResumen {
  riesgoActiva: number;
  riesgoInactiva: number;
  sinRuc: number;
  sinNit: number;
  sinRucNit: number;
  /** Total de JAC en el sistema, para dar contexto a los porcentajes. */
  totalJacs: number;
}

/** Fila de detalle de una JAC en alerta (se pide solo bajo demanda y paginada). */
export interface AlertaJacItem {
  id: number;
  nombre: string;
  municipio: string;
  barrio: string;
  tipo: TipoJac;
  afiliados: number;
  minimoAfiliados: number;
  estado: EstadoOrganizativo;
  numeroRUC: string | null;
  nit: string | null;
}

/** Respuesta paginada del detalle de una categoría de alerta. */
export interface AlertasJacPage {
  items: AlertaJacItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Parámetros para pedir el detalle paginado de una categoría. */
export interface AlertasQuery {
  categoria: AlertaCategoria;
  page?: number;
  limit?: number;
  /** Búsqueda libre por nombre o municipio (filtra en el backend). */
  busqueda?: string;
}

// ── Filtros del hook ──────────────────────────────────────────────────────────

export interface JACFilters {
  busqueda: string;
  municipio: string;
  estado: string;
  documental: string;
  minAfiliados: string;
}
