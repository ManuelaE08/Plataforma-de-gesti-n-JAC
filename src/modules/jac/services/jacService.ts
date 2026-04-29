import type { JACResponse, CreateJACDto, UpdateJACDto, SearchJACDto } from "../types";
import { JACAdapter, type JACMapped } from "../adapters/jac.adapter";

const baseEndpoint = import.meta.env.VITE_ENDPOINT?.replace(/\/$/, "");

const BASE = () => {
  if (!baseEndpoint) throw new Error("VITE_ENDPOINT no está configurado");
  return `${baseEndpoint}/jac`;
};

const defaultHeaders = { "Content-Type": "application/json" };
const credentials = "include" as const;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.message ?? text);
    } catch {
      throw new Error(text || response.statusText);
    }
  }
  return response.json() as Promise<T>;
}

/**
 * Servicio para el microservicio de JAC.
 * Todos los fetch incluyen credentials: "include" porque los endpoints requieren autenticación por cookie.
 *
 * Endpoints cubiertos:
 *   GET    /jac             → findAll
 *   GET    /jac/buscar      → search
 *   GET    /jac/:id         → findOne
 *   POST   /jac             → create
 *   PATCH  /jac/:id         → update
 *   DELETE /jac/:id         → remove
 */
export class JACService {
  /** GET /jac — Lista todas las JAC activas. */
  static async findAll(): Promise<JACMapped[]> {
    const response = await fetch(BASE(), {
      method: "GET",
      headers: defaultHeaders,
      credentials,
    });
    const data = await handleResponse<JACResponse[]>(response);
    return JACAdapter.mapJACs(data);
  }

  /** GET /jac/buscar — Busca JAC con filtros opcionales. */
  static async search(filters: SearchJACDto): Promise<JACMapped[]> {
    const params = new URLSearchParams();
    if (filters.nombre)    params.set("nombre", filters.nombre);
    if (filters.municipio) params.set("municipio", filters.municipio);
    if (filters.estado)    params.set("estado", filters.estado);

    const url = `${BASE()}/buscar${params.size ? `?${params.toString()}` : ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: defaultHeaders,
      credentials,
    });
    const data = await handleResponse<JACResponse[]>(response);
    return JACAdapter.mapJACs(data);
  }

  /** GET /jac/:id — Obtiene una JAC por ID. */
  static async findOne(id: number): Promise<JACMapped> {
    const response = await fetch(`${BASE()}/${id}`, {
      method: "GET",
      headers: defaultHeaders,
      credentials,
    });
    const data = await handleResponse<JACResponse>(response);
    return JACAdapter.mapJAC(data);
  }

  /** POST /jac — Crea una nueva JAC. */
  static async create(dto: CreateJACDto): Promise<JACMapped> {
    const response = await fetch(BASE(), {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(dto),
      credentials,
    });
    const data = await handleResponse<JACResponse>(response);
    return JACAdapter.mapJAC(data);
  }

  /** PATCH /jac/:id — Actualiza campos de una JAC. */
  static async update(id: number, dto: UpdateJACDto): Promise<JACMapped> {
    const response = await fetch(`${BASE()}/${id}`, {
      method: "PATCH",
      headers: defaultHeaders,
      body: JSON.stringify(dto),
      credentials,
    });
    const data = await handleResponse<JACResponse>(response);
    return JACAdapter.mapJAC(data);
  }

  /** DELETE /jac/:id — Eliminación lógica (pasa a inactiva). */
  static async remove(id: number): Promise<{ message: string }> {
    const response = await fetch(`${BASE()}/${id}`, {
      method: "DELETE",
      headers: defaultHeaders,
      credentials,
    });
    return handleResponse<{ message: string }>(response);
  }
}
