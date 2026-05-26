import {
  AfiliadoImportError,
  AfiliadoImportErrorResponse,
  ImportarAfiliadosResultDto,
  MigrationOptions,
  MigrationResponse,
} from "../types";

const baseEndpoint = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export class MigrationService {
  static async uploadExcel({ file, entity }: MigrationOptions): Promise<MigrationResponse> {
    if (!file) throw new Error("No file provided");
    const formData = new FormData();
    formData.append("file", file);

    const endpoint = entity === "asocomunales"
      ? `${baseEndpoint}/asocomunales/import-file`
      : `${baseEndpoint}/jacs/import`;

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en migración: ${errorText || response.statusText}`);
    }

    return await response.json();
  }

  static async uploadJSON({ data, entity }: MigrationOptions): Promise<MigrationResponse> {
    if (!data) throw new Error("No data provided");

    const endpoint = entity === "asocomunales"
      ? `${baseEndpoint}/asocomunales/import`
      : `${baseEndpoint}/jacs/import`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en migración: ${errorText || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * POST /afiliados/importar-excel — multipart.
   * Sube el Excel oficial de dignatarios/asociados y lo asocia a una JAC existente.
   *
   * Requiere rol ADMIN: el Bearer token lo adjunta automáticamente el interceptor
   * `attachBearerTokenInterceptor` cuando la URL empieza por `VITE_API_BASE_URL`.
   *
   * En caso de error 4xx con `errores[]`, lanza un `AfiliadoImportError` cuyo
   * `detalles` ya viene parseado para el UI.
   */
  static async uploadAfiliadosExcel({ file, jacId }: { file: File; jacId: number }): Promise<ImportarAfiliadosResultDto> {
    if (!file) throw new Error("No file provided");
    if (jacId === undefined || jacId === null) {
      throw new Error("Debe seleccionar una JAC antes de importar afiliados.");
    }

    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("jacId", String(jacId));

    const response = await fetch(`${baseEndpoint}/afiliados/importar-excel`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      // Intentamos parsear el body como JSON estructurado del backend.
      const rawText = await response.text();
      let payload: AfiliadoImportErrorResponse | null = null;
      try {
        payload = rawText ? (JSON.parse(rawText) as AfiliadoImportErrorResponse) : null;
      } catch {
        payload = null;
      }

      if (payload && Array.isArray(payload.errores) && payload.errores.length > 0) {
        throw new AfiliadoImportError(
          payload.message ?? "La importación contiene errores. No se modificó la base de datos.",
          payload.statusCode ?? response.status,
          payload.errores,
        );
      }

      const fallback = payload?.message ?? rawText ?? response.statusText;
      throw new AfiliadoImportError(
        fallback || `Error ${response.status} al importar afiliados.`,
        response.status,
        [],
      );
    }

    return (await response.json()) as ImportarAfiliadosResultDto;
  }
}
