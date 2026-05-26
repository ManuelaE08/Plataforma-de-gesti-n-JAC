import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ExcelParser } from "../modules/migracion_datos/utils/excelParser";
import { JacImportStrategy } from "../modules/migracion_datos/utils/strategies/jacImportStrategy";
import { AsocomunalImportStrategy } from "../modules/migracion_datos/utils/strategies/asocomunalImportStrategy";
import { MigrationService } from "../modules/migracion_datos/services/migrationService";
import { AfiliadoImportError, type MigrationEntity } from "../modules/migracion_datos/types";
import { JACService } from "../modules/jac/services/jacService";
import type { JacListItem } from "../modules/jac/types";

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
  const [tipoEntidad, setTipoEntidad] = useState<MigrationEntity>("asocomunales");
  const [arrastrando, setArrastrando] = useState(false);
  const [estado, setEstado] = useState<EstadoCarga>("idle");
  const [error, setError] = useState("");
  const [progreso, setProgreso] = useState(0);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [preview, setPreview] = useState<RegistroPreview[]>([]);
  const [datosParaEnviar, setDatosParaEnviar] = useState<any[]>([]);
  const [resultado, setResultado] = useState<MigracionResultado>({
    filasDetectadas: 0,
    validas: 0,
    advertencias: 0,
    errores: 0,
  });
  /**
   * Detalles de errores normalizados para el UI. `label` es la etiqueta humana del
   * registro fallido (ej. "Cédula 1061750123" o el nombre del asocomunal). `sheet`
   * solo aplica para la migración de afiliados (libros Excel multi-hoja).
   */
  const [detallesErrores, setDetallesErrores] = useState<
    { sheet?: string; fila: number | string; label: string; error: string }[]
  >([]);

  // Búsqueda y selección de JAC (sólo usado cuando tipoEntidad === "afiliados")
  const [jacSeleccionada, setJacSeleccionada] = useState<JacListItem | null>(null);
  const [jacQuery, setJacQuery] = useState("");
  const [jacResultados, setJacResultados] = useState<JacListItem[]>([]);
  const [jacBuscando, setJacBuscando] = useState(false);
  const [jacError, setJacError] = useState("");

  const resetEstado = () => {
    setArchivo(null);
    setEstado("idle");
    setError("");
    setProgreso(0);
    setMostrarPreview(false);
    setPreview([]);
    setDatosParaEnviar([]);
    setDetallesErrores([]);
    setResultado({ filasDetectadas: 0, validas: 0, advertencias: 0, errores: 0 });
    setArrastrando(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const buscarJACs = async (nombre: string) => {
    const term = nombre.trim();
    if (!term) {
      setJacResultados([]);
      setJacError("");
      return;
    }
    setJacBuscando(true);
    setJacError("");
    try {
      const res = await JACService.search({ nombre: term, limite: 10 });
      setJacResultados(res);
    } catch (err: any) {
      setJacError(err.message ?? "Error al buscar JACs.");
      setJacResultados([]);
    } finally {
      setJacBuscando(false);
    }
  };

  const seleccionarJAC = (jac: JacListItem) => {
    setJacSeleccionada(jac);
    setJacQuery("");
    setJacResultados([]);
  };

  const limpiarJacSeleccionada = () => {
    setJacSeleccionada(null);
    setJacQuery("");
    setJacResultados([]);
    setJacError("");
  };

  const previsualizarDatos = async (fileToProcess?: File) => {
    const targetFile = fileToProcess || archivo;
    if (!targetFile) return;

    if (tipoEntidad === "afiliados" && !jacSeleccionada) {
      setError("Debes seleccionar la JAC a la que se asociarán los afiliados antes de procesar el archivo.");
      setEstado("error");
      return;
    }

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
      setDatosParaEnviar(transformedData);
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

    // El endpoint de afiliados solo acepta .xlsx; los otros admiten .xls y .csv también.
    const formatosValidos = tipoEntidad === "afiliados" ? [".xlsx"] : formatosPermitidos;
    if (!formatosValidos.includes(extension)) {
      setError(
        tipoEntidad === "afiliados"
          ? "Formato no permitido. La importación de afiliados solo acepta archivos .xlsx."
          : "Formato no permitido. Solo se aceptan archivos .xlsx, .xls y .csv.",
      );
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
    setDetallesErrores([]);
    setResultado({ filasDetectadas: 0, validas: 0, advertencias: 0, errores: 0 });

    if (tipoEntidad === "afiliados") {
      // Para afiliados el backend valida todo: no parseamos el Excel en el frontend.
      setEstado("listo");
      return;
    }

    // Auto-previsualizar para entidades cuyo parseo aún vive en el frontend.
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

    if (tipoEntidad === "afiliados" && !jacSeleccionada) {
      setError("Debes seleccionar la JAC a la que se asociarán los afiliados antes de importar.");
      setEstado("error");
      return;
    }

    // Las entidades que parsea el frontend (asocomunales) requieren datosParaEnviar listos.
    if (tipoEntidad !== "afiliados" && datosParaEnviar.length === 0) return;

    setEstado("importando");
    setProgreso(50);

    try {
      if (tipoEntidad === "afiliados") {
        const res = await MigrationService.uploadAfiliadosExcel({
          file: archivo,
          jacId: jacSeleccionada!.id,
        });
        const resAny = res as any;
        setResultado({
          filasDetectadas: resAny.totalRecords ?? resAny.totalProcesadas ?? resAny.validas ?? 0,
          validas: resAny.validas ?? resAny.inserted ?? 0,
          advertencias: resAny.advertencias ?? 0,
          errores: typeof resAny.errores === "number" ? resAny.errores : 0,
        });
        setDetallesErrores([]);
        setProgreso(100);
        setEstado("importado");
        return;
      }

      // ASOCOMUNALES (y, en su momento, otras entidades vía JSON).
      const res = await MigrationService.uploadJSON({ data: datosParaEnviar, entity: tipoEntidad });
      if (res) {
        const resAny = res as any;
        setResultado(prev => ({
          ...prev,
          validas: resAny.validas ?? prev.validas,
          errores: resAny.errores ?? 0,
          advertencias: resAny.advertencias ?? 0,
        }));
        // El backend de asocomunales devuelve `detalles: [{fila, asocomunal, error}]`.
        const detallesRaw = Array.isArray(resAny.detalles) ? resAny.detalles : [];
        setDetallesErrores(
          detallesRaw.map((d: any) => ({
            fila: d.fila,
            label: d.asocomunal ?? "",
            error: d.error ?? "",
          })),
        );
      }

      setProgreso(100);
      setEstado("importado");
    } catch (err: unknown) {
      if (err instanceof AfiliadoImportError) {
        // Mapeamos el contrato del backend al formato unificado del UI.
        setDetallesErrores(
          err.detalles.map((d) => ({
            sheet: d.sheet,
            fila: d.fila,
            label: d.cedula ? `Cédula ${d.cedula}` : "Registro",
            error: d.motivo,
          })),
        );
        setResultado(prev => ({ ...prev, errores: err.detalles.length }));
        setError(err.message);
      } else {
        const message = err instanceof Error ? err.message : "Error al importar los datos.";
        setError(message);
      }
      setEstado("error");
    }
  };

  const cambiarTipoEntidad = (nueva: MigrationEntity) => {
    if (nueva === tipoEntidad) return;
    setTipoEntidad(nueva);
    limpiarJacSeleccionada();
    // Si había un archivo cargado para otra entidad, lo reseteamos para evitar mezclas.
    if (archivo) resetEstado();
  };

  return {
    inputRef,
    archivo,
    tipoEntidad,
    setTipoEntidad: cambiarTipoEntidad,
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
    detallesErrores,
    // Selector de JAC (sólo afiliados)
    jacSeleccionada,
    jacQuery,
    setJacQuery,
    jacResultados,
    jacBuscando,
    jacError,
    buscarJACs,
    seleccionarJAC,
    limpiarJacSeleccionada,
  };
}
