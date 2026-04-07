// Municipio
export interface Municipio {
  id: number;
  nombre: string;
}

// Jac (referencia básica para mostrar en asocomunal)
export interface JacItem {
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

// Entidad principal: Asocomunal
export interface AsocomunalItem {
  id: number;
  nombre: string;
  estado: boolean;
  presidente?: string | null;
  telefono?: string | null;
  correo?: string | null;
  municipio: Municipio;
  jacs: JacItem[];
}

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

// Filtros de búsqueda
export interface AsocomunalFilters {
  busqueda: string;
  municipio: string;
  estado: string;
}

// Tipos de roles (si aplica)
export type RolAfiliadoAsoc =
  | "Presidente" | "Secretario" | "Tesorero" | "Fiscal" | "Delegado" | "Miembro";