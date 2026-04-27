/**
 * Tipos de datos para el módulo de JAC (Juntas de Acción Comunal).
 * 
 * Este archivo define las interfaces y tipos utilizados en el módulo de JAC,
 * incluyendo las entidades del backend y los DTOs para operaciones CRUD.
 */

// Importamos los tipos necesarios de asocomunales
export interface Municipio {
  id: number;
  nombre: string;
}

// Asocomunal básica (para mostrar en JAC)
export interface AsocomunalBasica {
  id: number;
  nombre: string;
  municipioId: number;
  municipioNombre: string;
  estado: boolean;
}

// Entidad principal: JAC (modelo de respuesta del backend)
export interface Jac {
  id: number;
  asocomunalId: number | null;
  estadoId: number; // 1 = activo, 2 = inactivo
  nombreCorto: string | null;
  nombreCompleto: string;
  numeroRUC: string | null;
  asocomunal: AsocomunalBasica | null;
}

// DTO para crear JAC
export interface CreateJacDto {
  nombreCompleto: string;
  nombreCorto?: string | null;
  asocomunalId?: number | null;
  numeroRUC?: string | null;
}

// DTO para actualizar JAC
export interface UpdateJacDto {
  nombreCompleto?: string;
  nombreCorto?: string | null;
  asocomunalId?: number | null;
  numeroRUC?: string | null;
  estadoId?: number;
}

// Filtros para la lista de JACs
export interface JacFilters {
  nombre: string; // Búsqueda en nombreCompleto y nombreCorto
  municipio: string; // Búsqueda en municipio de la asocomunal
  estado: "activa" | "inactiva" | ""; // Estado de la JAC
}

// Estados de JAC
export type EstadoJac = "Activa" | "Inactiva";

// Respuesta de búsqueda de JACs
export interface JacSearchParams {
  nombre?: string;
  municipio?: string;
  estado?: "activa" | "inactiva";
}