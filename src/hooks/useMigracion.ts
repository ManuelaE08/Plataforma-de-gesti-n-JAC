import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { MigrationService } from "../modules/migracion_datos/services/migrationService";
import { AfiliadoImportError } from "../modules/migracion_datos/types";
import { JACService } from "../modules/jac/services/jacService";
import type { JacListItem } from "../modules/jac/types";

export type EstadoCarga = "idle" | "archivo" | "listo" | "importando" | "importado" | "error";

interface MigracionResultado {
  filasDetectadas: number;
  validas: number;
  advertencias: number;
  errores: number;
  /** Detalle específico de la importación de afiliados cuando termina en éxito. */
  afiliados?: {
    jacId: number;
    insertados: number;
    actualizados: number;
    cargosAsignados: number;
    cargosCreados: string[];
  };
}

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
  const [arrastrando, setArrastrando] = useState(false);
  const [estado, setEstado] = useState<EstadoCarga>("idle");
  const [error, setError] = useState("");
  const [progreso, setProgreso] = useState(0);
  const [resultado, setResultado] = useState<MigracionResultado>({
    filasDetectadas: 0,
    validas: 0,
    advertencias: 0,
    errores: 0,
  });
  /**
   * Detalles de errores normalizados para el UI. `label` es la etiqueta humana del
   * registro fallido (ej. "Cédula 1061750123"). `sheet` indica la hoja del libro
   * Excel (los formatos de afiliados son multi-hoja).
   */
  const [detallesErrores, setDetallesErrores] = useState<
    { sheet?: string; fila: number | string; label: string; error: string }[]
  >([]);

  // Búsqueda y selección de la JAC a la que se asociarán los afiliados.
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

  const procesarArchivo = (file: File) => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase() || ""}`;

    // El endpoint de afiliados solo acepta .xlsx.
    if (extension !== ".xlsx") {
      setError("Formato no permitido. La importación de afiliados solo acepta archivos .xlsx.");
      setEstado("error");
      return;
    }

    if (file.size > tamanoMaximoMb * 1024 * 1024) {
      setError(`El archivo supera el tamaño máximo permitido de ${tamanoMaximoMb}MB.`);
      setEstado("error");
      return;
    }

    setArchivo(file);
    setEstado("listo");
    setError("");
    setProgreso(0);
    setDetallesErrores([]);
    setResultado({ filasDetectadas: 0, validas: 0, advertencias: 0, errores: 0 });
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

  const importarArchivo = async () => {
    if (!archivo) return;

    if (!jacSeleccionada) {
      setError("Debes seleccionar la JAC a la que se asociarán los afiliados antes de importar.");
      setEstado("error");
      return;
    }

    setEstado("importando");
    setProgreso(50);

    try {
      const res = await MigrationService.uploadAfiliadosExcel({
        file: archivo,
        jacId: jacSeleccionada.id,
      });
      // El backend devuelve un ImportarAfiliadosResultDto cuando termina ok:
      //   { jacId, afiliadosInsertados, afiliadosActualizados,
      //     cargosAsignados, cargosCreados[], errores[] }
      const totalProcesado = res.afiliadosInsertados + res.afiliadosActualizados;
      setResultado({
        filasDetectadas: totalProcesado,
        validas: totalProcesado,
        advertencias: 0,
        errores: res.errores?.length ?? 0,
        afiliados: {
          jacId: res.jacId,
          insertados: res.afiliadosInsertados,
          actualizados: res.afiliadosActualizados,
          cargosAsignados: res.cargosAsignados,
          cargosCreados: res.cargosCreados ?? [],
        },
      });
      setDetallesErrores([]);
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
        setResultado((prev) => ({ ...prev, errores: err.detalles.length }));
        setError(err.message);
      } else {
        const message = err instanceof Error ? err.message : "Error al importar los datos.";
        setError(message);
      }
      setEstado("error");
    }
  };

  return {
    inputRef,
    archivo,
    arrastrando,
    estado,
    error,
    progreso,
    resultado,
    onFileChange,
    onDrop,
    onDragOver,
    onDragLeave,
    importarArchivo,
    resetEstado,
    formatBytes,
    detallesErrores,
    // Selector de JAC de destino
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
