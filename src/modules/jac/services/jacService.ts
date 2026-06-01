import type {
  JacItem, JacListItem, JacPublicItem, CreateJACDto, UpdateJACDto, SearchJACDto,
  AlertasResumen, AlertasJacPage, AlertasQuery,
} from "../types";
import { JACAdapter } from "../adapters/jac.adapter";

const baseEndpoint = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

function base(): string {
  if (!baseEndpoint) throw new Error("VITE_API_BASE_URL no está configurado");
  return `${baseEndpoint}/jacs`;
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
  /** GET /jac?limite=N — Lista todas las JAC con un límite de registros. */
  static async findAll(limite: number = 100): Promise<JacListItem[]> {
    const res = await fetch(`${base()}?limite=${limite}`, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });
    const data = await handleResponse<JacListItem[]>(res);
    return JACAdapter.mapJACs(data);
  }

  /** GET /jac/buscar?nombre=&municipio=&estado=&documental=&limite= — Búsqueda con filtros del backend. */
  static async search(filters: SearchJACDto): Promise<JacListItem[]> {
    const params = new URLSearchParams();
    if (filters.nombre)     params.set("nombre",     filters.nombre.toLowerCase());
    if (filters.municipio)  params.set("municipio",  filters.municipio.toLowerCase());
    if (filters.estado)     params.set("estado",     filters.estado.toLowerCase());
    if (filters.documental) params.set("documental", filters.documental);
    if (filters.limite)     params.set("limite",     String(filters.limite));

    const qs  = params.size ? `?${params.toString()}` : "";
    const res = await fetch(`${base()}/buscar${qs}`, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });
    const data = await handleResponse<JacListItem[]>(res);
    return JACAdapter.mapJACs(data);
  }

  /** GET /jac/public?limite=N — Lista JACs sin autenticación. */
  static async findAllPublic(limite: number = 100): Promise<JacListItem[]> {
    const res = await fetch(`${base()}/public?limite=${limite}`, {
      method: "GET",
      headers: defaultHeaders,
    });
    const data = await handleResponse<JacListItem[]>(res);
    return JACAdapter.mapJACs(data);
  }

  /** GET /jac/public/buscar — Búsqueda pública sin PII. */
  static async searchPublic(filters: SearchJACDto): Promise<JacListItem[]> {
    const params = new URLSearchParams();
    if (filters.nombre)     params.set("nombre",     filters.nombre.toLowerCase());
    if (filters.municipio)  params.set("municipio",  filters.municipio.toLowerCase());
    if (filters.estado)     params.set("estado",     filters.estado.toLowerCase());
    if (filters.documental) params.set("documental", filters.documental);
    if (filters.limite)     params.set("limite",     String(filters.limite));

    const qs  = params.size ? `?${params.toString()}` : "";
    const res = await fetch(`${base()}/public/buscar${qs}`, {
      method: "GET",
      headers: defaultHeaders,
    });
    const data = await handleResponse<JacListItem[]>(res);
    return JACAdapter.mapJACs(data);
  }

  /** GET /jac/public/:id — Detalle público sin miembros ni RUC. */
  static async findOnePublic(id: number): Promise<JacItem> {
    const res = await fetch(`${base()}/public/${id}`, {
      method: "GET",
      headers: defaultHeaders,
    });
    const data = await handleResponse<JacPublicItem>(res);
    return JACAdapter.mapPublicToJacItem(data);
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

  /** GET /asocomunales — Obtiene la réplica de asocomunales desde el MS de JACs. */
  static async getAsocomunalesReplica(): Promise<any[]> {
    const endpoint = `${base()}/asocomunales`;
    const res = await fetch(endpoint, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });
    return handleResponse<any[]>(res);
  }

  /** GET /jacs/public/stats — Obtiene las estadísticas consolidadas públicas del Dashboard. */
  static async getPublicStats(): Promise<PublicStats> {
    const res = await fetch(`${base()}/public/stats`, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });
    return handleResponse<PublicStats>(res);
  }

  /**
   * GET /jacs/alertas/resumen — Conteos agregados de cada categoría de alerta.
   * Una sola llamada barata (COUNT en backend); no descarga filas.
   */
  static async getAlertasResumen(): Promise<AlertasResumen> {
    const res = await fetch(`${base()}/alertas/resumen`, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });
    return handleResponse<AlertasResumen>(res);
  }

  /**
   * GET /jacs/alertas?categoria=&page=&limit=&busqueda=
   * Detalle paginado de las JAC de una categoría de alerta. Se invoca solo
   * cuando el usuario abre una tarjeta; nunca se trae todo de golpe.
   */
  static async getAlertasJacs(query: AlertasQuery): Promise<AlertasJacPage> {
    const params = new URLSearchParams();
    params.set("categoria", query.categoria);
    params.set("page",  String(query.page  ?? 1));
    params.set("limit", String(query.limit ?? 10));
    if (query.busqueda?.trim()) params.set("busqueda", query.busqueda.trim().toLowerCase());

    const res = await fetch(`${base()}/alertas?${params.toString()}`, {
      method: "GET",
      headers: defaultHeaders,
      credentials: "include",
    });
    return handleResponse<AlertasJacPage>(res);
  }
}

export interface PublicStats {
  activeJacsCount: number;
  totalJACS: number;
  rucCount: number;
  urbanCount: number;
  ruralCount: number;
  totalAsocomunales: number;
  topMunicipios: Array<{ municipio: string; count: number }>;
}
