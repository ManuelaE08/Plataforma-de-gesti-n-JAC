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

export interface BulkUploadParams {
  data: any[];
  jacId: number;
}

export class AfiliadosMigracionService {
  /** POST /afiliados/bulk — Importación masiva */
  static async uploadBulk(params: BulkUploadParams): Promise<any> {
    const res = await fetch(`${base()}/bulk`, {
      method: "POST",
      headers: defaultHeaders,
      credentials: "include",
      body: JSON.stringify({
        data: params.data,
        jacId: params.jacId,
      }),
    });
    return handleResponse<any>(res);
  }
}
