/**
 * Servicio para gestionar afiliados/personas en las JACs
 */

const baseEndpoint = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

function base(): string {
  if (!baseEndpoint) throw new Error("VITE_API_BASE_URL no está configurado");
  return `${baseEndpoint}/afiliados`;
}

const defaultHeaders = { "Content-Type": "application/json" };

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.message ?? text);
    } catch {
      throw new Error(text || res.statusText);
    }
  }
  return res.json() as Promise<T>;
}

export interface CreateAfiliadoDto {
  nombre: string;
  apellido: string;
  cedula?: string;
  lugarExpedicionCedula?: string;
  correo?: string;
  telefono?: string;
  jacId: number; // JAC a la que pertenece
  municipioId?: number;
  cargoId?: number | string; // Cargo opcional del afiliado
  genero?: string;
  grupoEtnico?: string;
  fechaNacimiento?: string;
  rangoEdad?: string;
  ocupacion?: string;
  direccion?: string;
  estudiosRealizados?: string;
  discapacitado?: boolean;
}

export interface UpdateAfiliadoDto {
  nombre?: string;
  apellido?: string;
  cedula?: string;
  lugarExpedicionCedula?: string;
  correo?: string;
  telefono?: string;
  cargoId?: number | string;
  genero?: string;
  grupoEtnico?: string;
  fechaNacimiento?: string;
  rangoEdad?: string;
  ocupacion?: string;
  direccion?: string;
  estudiosRealizados?: string;
  discapacitado?: boolean;
}

export interface AfiliadoResponse {
  id: number;
  nombre: string;
  apellido: string;
  cedula?: string;
  lugarExpedicionCedula?: string;
  correo?: string;
  telefono?: string;
  jacId: number;
  municipioId?: number;
  cargoId?: number;
  rol?: string;
  documento?: string;
  genero?: string;
  grupoEtnico?: string;
  fechaNacimiento?: string;
  rangoEdad?: string;
  ocupacion?: string;
  direccion?: string;
  estudiosRealizados?: string;
  discapacitado?: boolean;
}

export interface CargoResponse {
  id: number;
  nombre: string;
  descripcion?: string;
}

export class AfiliadosService {
  /** POST /afiliados — Crear nuevo afiliado */
  static async create(dto: CreateAfiliadoDto): Promise<AfiliadoResponse> {
    const res = await fetch(base(), {
      method: "POST",
      headers: defaultHeaders,
      credentials: "include",
      body: JSON.stringify(dto),
    });
    return handleResponse<AfiliadoResponse>(res);
  }

  /** GET /afiliados — Listar todos los afiliados */
  static async findAll(): Promise<AfiliadoResponse[]> {
    const res = await fetch(base(), {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });
    return handleResponse<AfiliadoResponse[]>(res);
  }

  /** GET /afiliados/:id — Obtener un afiliado por ID */
  static async findOne(id: number): Promise<AfiliadoResponse> {
    const res = await fetch(`${base()}/${id}`, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });
    return handleResponse<AfiliadoResponse>(res);
  }

  /** PATCH /afiliados/:id — Actualizar afiliado */
  static async update(id: number, dto: UpdateAfiliadoDto): Promise<AfiliadoResponse> {
    const res = await fetch(`${base()}/${id}`, {
      method: "PATCH",
      headers: defaultHeaders,
      credentials: "include",
      body: JSON.stringify(dto),
    });
    return handleResponse<AfiliadoResponse>(res);
  }

  /** DELETE /afiliados/:id — Eliminar afiliado */
  static async delete(id: number): Promise<{ message: string }> {
    const res = await fetch(`${base()}/${id}`, {
      method: "DELETE",
      headers: defaultHeaders,
      credentials: "include",
    });
    return handleResponse<{ message: string }>(res);
  }

  /** POST /afiliados/:id/cargo — Asignar cargo a afiliado */
  static async assignCargo(
    id: number,
    cargoId: number,
    fechaInicio: string
  ): Promise<{ message: string }> {
    const res = await fetch(`${base()}/${id}/cargo`, {
      method: "POST",
      headers: defaultHeaders,
      credentials: "include",
      body: JSON.stringify({ cargoId, fechaInicio }),
    });
    return handleResponse<{ message: string }>(res);
  }

  /** GET /afiliados/:id/cargos — Obtener historial de cargos */
  static async findCargos(id: number): Promise<any[]> {
    const res = await fetch(`${base()}/${id}/cargos`, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });
    return handleResponse<any[]>(res);
  }

  /** GET /afiliados/catalogo/cargos — Obtener lista de cargos disponibles */
  static async findAllCargos(): Promise<CargoResponse[]> {
    const res = await fetch(`${base()}/catalogo/cargos`, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });
    return handleResponse<CargoResponse[]>(res);
  }
}
