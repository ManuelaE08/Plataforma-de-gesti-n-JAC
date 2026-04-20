import { useState, useEffect } from "react";
import DropzoneExcel from "./DropzoneExcel";
import { useMigration } from "../hooks/useMigration";
import { MigrationEntity } from "../types";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import PreviewTable from "./PreviewTable";
import { ExcelParser } from "../utils/excelParser";
import { JacImportStrategy } from "../utils/strategies/jacImportStrategy";
import { AsocomunalImportStrategy } from "../utils/strategies/asocomunalImportStrategy";

export interface MigrationFormProps {
  entity: MigrationEntity;
  onSuccess?: () => void;
}

export default function MigrationForm({ entity, onSuccess }: MigrationFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const { startMigration, loading, error, successResponse, resetMigration } = useMigration();

  useEffect(() => {
    if (!file) {
      setPreviewData(null);
      setPreviewError(null);
      return;
    }

    const parseExcel = async () => {
      setIsParsing(true);
      setPreviewError(null);

      try {
        // 1. Crear la estrategia según la entidad seleccionada
        const strategy = entity === "jacs"
          ? new JacImportStrategy()
          : new AsocomunalImportStrategy();

        // 2. Obtener los encabezados esperados desde la estrategia
        const expectedHeaders = strategy.getExpectedHeaders();

        // 3. Parsear el Excel pasándole los encabezados (el parser es genérico)
        const buffer = await file.arrayBuffer();
        const rawData = await ExcelParser.parse(buffer, expectedHeaders);

        // 4. Transformar los datos según la estrategia
        const transformedData = strategy.transform(rawData);

        if (transformedData.length === 0) {
          throw new Error('No se detectaron datos válidos. Verifique que los títulos de las columnas coincidan con la plantilla esperada.');
        }

        setPreviewData(transformedData);
      } catch (err: any) {
        setPreviewError(err.message || 'Error analizando la estructura del archivo.');
        setPreviewData(null);
      } finally {
        setIsParsing(false);
      }
    };

    parseExcel();
  }, [file, entity]);

  const handleFileSelect = (newFile: File | null) => {
    setFile(newFile);
    resetMigration(); // Limpiar errores pasados al cambiar archivo
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      await startMigration(file, entity);
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch {
      // El error ya está en el hook
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Archivo Excel Local</label>
          <DropzoneExcel file={file} onFileSelect={handleFileSelect} />
        </div>

        {isParsing && (
          <div className="flex justify-center items-center py-4">
            <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
            <span className="ml-2 text-sm text-neutral-600 font-medium">Analizando archivo...</span>
          </div>
        )}

        {previewError && (
          <div className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800 uppercase tracking-wider text-[11px]">Aviso de Previsualización</p>
              <p className="text-sm text-amber-700 font-medium mt-1">{previewError}</p>
            </div>
          </div>
        )}

        {!isParsing && previewData && previewData.length > 0 && (
          <PreviewTable data={previewData} entity={entity} />
        )}

        {error && (
          <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800 uppercase tracking-wider text-[11px]">Error en la migración</p>
              <p className="text-sm text-red-700 font-medium mt-1">{error}</p>
            </div>
          </div>
        )}

        {successResponse && (
          <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800 uppercase tracking-wider text-[11px]">Migración Completada</p>
              <p className="text-sm text-green-700 font-medium mt-1">{successResponse.message}</p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-neutral-100 flex justify-end">
          <button
            type="submit"
            disabled={!file || loading || isParsing || !!previewError}
            className={`px-5 py-3 rounded-lg text-white font-medium text-sm flex items-center gap-2 transition-all shadow-sm
              ${(!file || loading || isParsing || !!previewError)
                ? 'bg-neutral-300 cursor-not-allowed text-neutral-500 shadow-none'
                : 'bg-primary hover:brightness-95 active:brightness-90'}
            `}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Procesando...
              </>
            ) : (
              'Iniciar Migración'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

