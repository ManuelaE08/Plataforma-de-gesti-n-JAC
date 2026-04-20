import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ExcelParser } from "../modules/migracion_datos/utils/excelParser";
import { JacImportStrategy } from "../modules/migracion_datos/utils/strategies/jacImportStrategy";
import { AsocomunalImportStrategy } from "../modules/migracion_datos/utils/strategies/asocomunalImportStrategy";
import { MigrationService } from "../modules/migracion_datos/services/migrationService";
import { MigrationEntity } from "../modules/migracion_datos/types";

export type EstadoCarga = "idle" | "archivo" | "previsualizando" | "listo" | "importando" | "importado" | "error";

export type RegistroPreview = Record<string, any>;

interface MigracionResultado {
  filasDetectadas: number;
  validas: number;
  advertencias: number;
  errores: number;
}

const formatosPermitidos = [".xlsx", ".xls", ".csv"];
const tamanoMaximoMb = 10;

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function useMigracion() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [tipoEntidad, setTipoEntidad] = useState<MigrationEntity>("jacs");
  const [arrastrando, setArrastrando] = useState(false);
  const [estado, setEstado] = useState<EstadoCarga>("idle");
  const [error, setError] = useState("");
  const [progreso, setProgreso] = useState(0);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [preview, setPreview] = useState<RegistroPreview[]>([]);
  const [resultado, setResultado] = useState<MigracionResultado>({
    filasDetectadas: 0,
    validas: 0,
    advertencias: 0,
    errores: 0,
  });

  const resetEstado = () => {
    setArchivo(null);
    setEstado("idle");
    setError("");
    setProgreso(0);
    setMostrarPreview(false);
    setPreview([]);
    setResultado({ filasDetectadas: 0, validas: 0, advertencias: 0, errores: 0 });
    setArrastrando(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const previsualizarDatos = async (fileToProcess?: File) => {
    const targetFile = fileToProcess || archivo;
    if (!targetFile) return;

    setEstado("previsualizando");
    setProgreso(20);

    try {
      const strategy = tipoEntidad === "jacs" ? new JacImportStrategy() : new AsocomunalImportStrategy();
      const expectedHeaders = strategy.getExpectedHeaders();
      
      const buffer = await targetFile.arrayBuffer();
      setProgreso(50);
      
      const rawData = await ExcelParser.parse(buffer, expectedHeaders);
      setProgreso(80);
      
      const transformedData = strategy.transform(rawData);
      
      if (transformedData.length === 0) {
        throw new Error("No se detectaron datos válidos en el archivo.");
      }

      // Tomar las primeras 5 filas tal como salen de la estrategia
      const mappedPreview: RegistroPreview[] = transformedData.slice(0, 5);

      setPreview(mappedPreview);
      setResultado({
        filasDetectadas: rawData.length,
        validas: transformedData.length,
        advertencias: 0,
        errores: 0,
      });
      
      setProgreso(100);
      setEstado("listo");
      setMostrarPreview(true);
    } catch (err: any) {
      setError(err.message || "Error al procesar el archivo Excel.");
      setEstado("error");
    }
  };

  const procesarArchivo = (file: File) => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase() || ""}`;
    if (!formatosPermitidos.includes(extension)) {
      setError("Formato no permitido. Solo se aceptan archivos .xlsx, .xls y .csv.");
      setEstado("error");
      return;
    }

    if (file.size > tamanoMaximoMb * 1024 * 1024) {
      setError(`El archivo supera el tamaño máximo permitido de ${tamanoMaximoMb}MB.`);
      setEstado("error");
      return;
    }

    setArchivo(file);
    setEstado("archivo");
    setError("");
    setProgreso(0);
    setMostrarPreview(false);
    
    // Auto-previsualizar
    previsualizarDatos(file);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) procesarArchivo(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files?.[0];
    if (file) procesarArchivo(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(true);
  };

  const onDragLeave = () => {
    setArrastrando(false);
  };

  // previsualizarDatos moved above procesarArchivo

  const importarArchivo = async () => {
    if (!archivo) return;

    setEstado("importando");
    setProgreso(50);

    try {
      await MigrationService.uploadExcel({ file: archivo, entity: tipoEntidad });
      setProgreso(100);
      setEstado("importado");
    } catch (err: any) {
      setError(err.message || "Error al importar los datos.");
      setEstado("error");
    }
  };

  return {
    inputRef,
    archivo,
    tipoEntidad,
    setTipoEntidad,
    arrastrando,
    estado,
    error,
    progreso,
    mostrarPreview,
    resultado,
    preview,
    setMostrarPreview,
    onFileChange,
    onDrop,
    onDragOver,
    onDragLeave,
    previsualizarDatos,
    importarArchivo,
    resetEstado,
    formatBytes,
  };
}
