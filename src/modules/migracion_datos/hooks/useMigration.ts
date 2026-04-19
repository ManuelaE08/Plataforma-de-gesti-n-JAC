import { useState } from "react";
import { MigrationService } from "../services/migrationService";
import { MigrationEntity, MigrationResponse } from "../types";

export function useMigration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<MigrationResponse | null>(null);

  const startMigration = async (file: File, entity: MigrationEntity) => {
    setLoading(true);
    setError(null);
    setSuccessResponse(null);

    try {
      const response = await MigrationService.uploadExcel({ file, entity });
      setSuccessResponse(response);
      return response;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error inesperado al subir el archivo.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetMigration = () => {
    setError(null);
    setSuccessResponse(null);
  };

  return {
    loading,
    error,
    successResponse,
    startMigration,
    resetMigration,
  };
}
