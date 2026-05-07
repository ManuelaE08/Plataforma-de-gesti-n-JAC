import { useState } from "react";
import { MigrationService } from "../services/migrationService";
import { MigrationEntity } from "../types";
import { ExcelParser } from "../utils/excelParser";
import { JacImportStrategy } from "../utils/strategies/jacImportStrategy";
import { AsocomunalImportStrategy } from "../utils/strategies/asocomunalImportStrategy";

export interface ImportSummary {
  total: number;
  validas: number;
  errores: number;
  advertencias: number;
  detalles: { fila: any; asocomunal: string; error: string }[];
}

export function useMigration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const startMigration = async (file: File, entity: MigrationEntity) => {
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      // 1. Parsear y transformar el Excel en el frontend (igual que la previsualización)
      const strategy = entity === "jacs" ? new JacImportStrategy() : new AsocomunalImportStrategy();
      const buffer = await file.arrayBuffer();
      const rawData = await ExcelParser.parse(buffer, strategy.getExpectedHeaders());
      const transformedData = strategy.transform(rawData);

      if (transformedData.length === 0) {
        throw new Error("No se detectaron datos válidos en el archivo.");
      }

      // 2. Enviar los datos como JSON al microservicio
      const response = await MigrationService.uploadJSON({ data: transformedData, entity });
      console.log("[useMigration] Respuesta cruda del backend:", response);

      // 3. Guardar el resumen recibido del backend
      setSummary({
        total: (response as any).total ?? transformedData.length,
        validas: (response as any).validas ?? 0,
        errores: typeof (response as any).errores === "number" ? (response as any).errores : 0,
        advertencias: (response as any).advertencias ?? 0,
        detalles: (response as any).detalles ?? [],
      });

      return response;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error inesperado al importar los datos.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetMigration = () => {
    setError(null);
    setSummary(null);
  };

  return {
    loading,
    error,
    summary,
    startMigration,
    resetMigration,
  };
}
