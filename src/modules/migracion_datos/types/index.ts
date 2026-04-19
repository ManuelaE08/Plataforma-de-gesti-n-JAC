export type MigrationEntity = 'jacs' | 'asocomunales';

export interface MigrationOptions {
  file: File;
  entity: MigrationEntity;
}

export interface MigrationResponse {
  success: boolean;
  message: string;
  totalRecords?: number;
  inserted?: number;
  errors?: any[];
}
