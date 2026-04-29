export type EstadoJAC = "activa" | "inactiva" | "cancelada";

export interface AsocomunalResumen {
  id: number;
  nombre: string;
  municipioId: number | null;
  municipioNombre: string | null;
  estado: boolean;
}

export interface JACResponse {
  id: number;
  asocomunalId: number | null;
  estado: EstadoJAC;
  nombreCorto: string | null;
  nombreCompleto: string;
  numeroRUC: string | null;
  asocomunal?: AsocomunalResumen | null;
}

export interface CreateJACDto {
  asocomunalId?: number;
  estado?: EstadoJAC;
  nombreCorto?: string;
  nombreCompleto: string;
  numeroRUC?: string;
}

export interface UpdateJACDto {
  asocomunalId?: number;
  estado?: EstadoJAC;
  nombreCorto?: string;
  nombreCompleto?: string;
  numeroRUC?: string;
}

export interface SearchJACDto {
  nombre?: string;
  municipio?: string;
  estado?: EstadoJAC;
}

export interface JACFilters {
  busqueda: string;
  municipio: string;
  estado: string;
}
