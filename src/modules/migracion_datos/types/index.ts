export type MigrationEntity = 'jacs' | 'asocomunales';

export interface MigrationOptions {
  file?: File;
  data?: any[];
  entity: MigrationEntity;
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
