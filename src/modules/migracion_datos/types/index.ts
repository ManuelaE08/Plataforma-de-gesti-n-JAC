export type MigrationEntity = 'jacs' | 'asocomunales' | 'afiliados';

export interface MigrationOptions {
  file?: File;
  data?: any[];
  entity: MigrationEntity;
  /** Requerido cuando entity === 'afiliados': JAC a la que se asociarán los dignatarios. */
  jacId?: number;
}

export interface MigrationResponse {
  success: boolean;
  message: string;
  totalRecords?: number;
  inserted?: number;
  validas?: number;
  advertencias?: number;
  errores?: number | any[];
}

/** Estructura de cada item del array `errores` devuelto por `/afiliados/importar-excel`. */
export interface AfiliadoImportErrorItem {
  sheet: string;
  fila: number;
  cedula: string;
  motivo: string;
}

/** Estructura completa del payload de error 4xx que devuelve `/afiliados/importar-excel`. */
export interface AfiliadoImportErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  errores?: AfiliadoImportErrorItem[];
}

/**
 * Error tipado lanzado por `MigrationService.uploadAfiliadosExcel` cuando el backend
 * devuelve un 4xx con detalles por fila. El UI puede leer `.detalles` para mostrarlos.
 */
export class AfiliadoImportError extends Error {
  readonly statusCode: number;
  readonly detalles: AfiliadoImportErrorItem[];

  constructor(message: string, statusCode: number, detalles: AfiliadoImportErrorItem[] = []) {
    super(message);
    this.name = "AfiliadoImportError";
    this.statusCode = statusCode;
    this.detalles = detalles;
  }
}
