import type { JacItem, CreateJACDto, UpdateJACDto, SearchJACDto } from "../types";
import { JACAdapter } from "../adapters/jac.adapter";

const baseEndpoint = import.meta.env.VITE_JAC_ENDPOINT?.replace(/\/$/, "");

function base(): string {
  if (!baseEndpoint) throw new Error("VITE_JAC_ENDPOINT no está configurado");
  return `${baseEndpoint}/jac`;
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

/**
 * Servicio de JAC.
 * Todos los fetch incluyen `credentials: "include"` porque el microservicio
 * protege sus endpoints con una cookie de sesión/rol.
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
  /** GET /jac — Lista todas las JAC. */
  static async findAll(): Promise<JacItem[]> {
    const res = await fetch(base(), {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });
    const data = await handleResponse<JacItem[]>(res);
    return JACAdapter.mapJACs(data);
  }

  /** GET /jac/buscar?nombre=&municipio=&estado= — Búsqueda con filtros del backend. */
  static async search(filters: SearchJACDto): Promise<JacItem[]> {
    const params = new URLSearchParams();
    if (filters.nombre)    params.set("nombre",    filters.nombre.toLowerCase());
    if (filters.municipio) params.set("municipio", filters.municipio.toLowerCase());
    if (filters.estado)    params.set("estado",    filters.estado.toLowerCase());

    const qs  = params.size ? `?${params.toString()}` : "";
    const res = await fetch(`${base()}/buscar${qs}`, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });
    const data = await handleResponse<JacItem[]>(res);
    return JACAdapter.mapJACs(data);
  }

  /** GET /jac/:id — Una JAC por ID con sus miembros. */
  static async findOne(id: number): Promise<JacItem> {
    const res = await fetch(`${base()}/${id}`, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });
    const data = await handleResponse<JacItem>(res);
    return JACAdapter.mapJAC(data);
  }

  /** POST /jac — Crea una nueva JAC. */
  static async create(dto: CreateJACDto): Promise<JacItem> {
    const res = await fetch(base(), {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(dto),
      credentials: "include",
    });
    const data = await handleResponse<JacItem>(res);
    return JACAdapter.mapJAC(data);
  }

  /** PATCH /jac/:id — Actualiza campos de una JAC. */
  static async update(id: number, dto: UpdateJACDto): Promise<JacItem> {
    const res = await fetch(`${base()}/${id}`, {
      method: "PATCH",
      headers: defaultHeaders,
      body: JSON.stringify(dto),
      credentials: "include",
    });
    const data = await handleResponse<JacItem>(res);
    return JACAdapter.mapJAC(data);
  }

  /** DELETE /jac/:id — Eliminación lógica (cambia estado a inactiva). */
  static async remove(id: number): Promise<{ message: string }> {
    const res = await fetch(`${base()}/${id}`, {
      method: "DELETE",
      headers: defaultHeaders,
      credentials: "include",
    });
    return handleResponse<{ message: string }>(res);
  }
}
