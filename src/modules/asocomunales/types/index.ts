/**
 * Tipos de datos para el módulo de Asocomunales.
 * 
 * Este archivo define las interfaces y tipos utilizados en el módulo de Asocomunales,
 * incluyendo las entidades del backend y los DTOs para operaciones CRUD.
 */


// Municipio
export interface Municipio {
  id: number;
  nombre: string;
}

// Jac (referencia básica para mostrar en asocomunal)
export interface JacItem {
  estado: any;
  id: number;
  nombre: string;
  barrio?: string;
  municipio?: Municipio;
}

// Afiliado de la Asocomunal
export interface AfiliadoAsocItem {
  id: number;
  nombre: string;
  documento: string;
  telefono: string;
  rol: RolAfiliadoAsoc;
}

/** Respuesta del endpoint público GET /asocomunales/public */
export interface AsocomunalPublicApi {
  id: number;
  nombre: string;
  estado: boolean;
  municipio: Municipio;
  jacsCount: number;
  jacs?: Array<{ nombre: string; estado: boolean }>;
}

// Entidad principal: Asocomunal (modelo de respuesta del backend)
export interface Asocomunal {
  id: number;
  nombre: string;
  estado: boolean;
  presidente?: string | null;
  telefono?: string | null;
  correo?: string | null;
  municipio: Municipio;
  jacs: JacItem[];
}

// Alias para compatibilidad (puedes migrar a Asocomunal gradualmente)
export type AsocomunalItem = Asocomunal;

// DTO para crear asocomunal
export interface CreateAsocomunalDto {
  nombre: string;
  estado?: boolean;
  municipioId: number;
  presidente?: string | null;
  telefono?: string | null;
  correo?: string | null;
}

// DTO para actualizar asocomunal
export interface UpdateAsocomunalDto {
  nombre?: string;
  estado?: boolean;
  municipioId?: number;
  presidente?: string | null;
  telefono?: string | null;
  correo?: string | null;
}

// Filtros para la lista de asocomunales
export interface AsocomunalFilters {
  busqueda: string;
  municipio: number | null; // Cambiado a number | null
  estado: boolean | null; // Cambiado a boolean | null
}

// Tipos de roles (si aplica)
export type RolAfiliadoAsoc =
  | "Presidente" | "Secretario" | "Tesorero" | "Fiscal" | "Delegado" | "Miembro";