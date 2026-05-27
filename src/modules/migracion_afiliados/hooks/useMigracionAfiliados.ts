import { useRef, useState, type ChangeEvent, type DragEvent, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ExcelParser } from "../../migracion_datos/utils/excelParser";
import { DignatariosStrategy } from "../utils/strategies/dignatariosStrategy";
import { AfiliadosLibroStrategy } from "../utils/strategies/afiliadosLibroStrategy";
import { AfiliadosMigracionService } from "../services/afiliadosMigracionService";
import { AfiliadosService, CargoResponse } from "../../jac/services/afiliadosService";

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

export function useMigracionAfiliados() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchParams] = useSearchParams();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [jacId, setJacId] = useState<number | "">("");
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
  const [detallesErrores, setDetallesErrores] = useState<{fila: any; asocomunal: string; error: string}[]>([]);
  const [cargos, setCargos] = useState<CargoResponse[]>([]);

  useEffect(() => {
    const paramId = searchParams.get("jacId");
    if (paramId) {
      setJacId(Number(paramId));
    }
  }, [searchParams]);

  useEffect(() => {
    AfiliadosService.findAllCargos().then(setCargos).catch(console.error);
  }, []);

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

  const mapCargos = (data: any[]) => {
    return data.map(row => {
      if (row.cargoNombre) {
         const cargoFound = cargos.find(c => c.nombre.toLowerCase().trim() === row.cargoNombre.toLowerCase().trim());
         if (cargoFound) {
           row.cargoId = cargoFound.id;
         }
      }
      return row;
    });
  };

  const previsualizarDatos = async (fileToProcess?: File) => {
    const targetFile = fileToProcess || archivo;
    if (!targetFile) return;

    setEstado("previsualizando");
    setProgreso(20);

    try {
      const buffer = await targetFile.arrayBuffer();
      setProgreso(40);
      
      let combinedData: any[] = [];
      let totalRaw = 0;

      // 1. Instanciar estrategias
      const dignatariosStrategy = new DignatariosStrategy();
      const afiliadosStrategy = new AfiliadosLibroStrategy();

      // 2. Detectar de manera dinámica e inteligente cuál hoja es cuál en el libro Excel
      let hojaDignatariosIdx = ExcelParser.detectBestSheet(buffer, dignatariosStrategy.getExpectedHeaders());
      let hojaAsociadosIdx = ExcelParser.detectBestSheet(buffer, afiliadosStrategy.getExpectedHeaders());

      console.log(`[useMigracionAfiliados] Hoja de Dignatarios detectada en índice: ${hojaDignatariosIdx}`);
      console.log(`[useMigracionAfiliados] Hoja de Libro de Asociados detectada en índice: ${hojaAsociadosIdx}`);

      // Desempates e inteligencia de fallbacks si hay conflictos o coinciden en el mismo índice
      if (hojaDignatariosIdx === hojaAsociadosIdx && hojaDignatariosIdx !== -1) {
        const sheetNames = ExcelParser.getSheetNames(buffer);
        if (sheetNames.length >= 2) {
          let dIdx = -1;
          let aIdx = -1;
          sheetNames.forEach((name, idx) => {
            const lower = name.toLowerCase();
            if (lower.includes("digna") || lower.includes("direct")) dIdx = idx;
            if (lower.includes("asoc") || lower.includes("libro")) aIdx = idx;
          });
          if (dIdx !== -1 && aIdx !== -1) {
            hojaDignatariosIdx = dIdx;
            hojaAsociadosIdx = aIdx;
          } else {
            hojaDignatariosIdx = 0;
            hojaAsociadosIdx = 1;
          }
        }
      }

      // Si alguna de las hojas no se pudo detectar, hacemos asignación lógica por descarte
      if (hojaDignatariosIdx === -1) {
        hojaDignatariosIdx = hojaAsociadosIdx === 0 ? 1 : 0;
      }
      if (hojaAsociadosIdx === -1) {
        hojaAsociadosIdx = hojaDignatariosIdx === 0 ? 1 : 0;
      }

      console.log(`[useMigracionAfiliados] Índices finales asignados: Dignatarios=${hojaDignatariosIdx}, Asociados=${hojaAsociadosIdx}`);

      // 3. Intentar procesar la hoja de Dignatarios
      try {
          const rawHojaDignatarios = await ExcelParser.parse(buffer, dignatariosStrategy.getExpectedHeaders(), hojaDignatariosIdx);
          totalRaw += rawHojaDignatarios.length;
          const dataHojaDignatarios = dignatariosStrategy.transform(rawHojaDignatarios);
          combinedData = [...combinedData, ...dataHojaDignatarios];
      } catch (e) {
          console.warn("No se pudo procesar la hoja asignada a Dignatarios", e);
      }

      setProgreso(60);

      // 4. Intentar procesar la hoja de Libro de asociados
      try {
          const rawHojaAsociados = await ExcelParser.parse(buffer, afiliadosStrategy.getExpectedHeaders(), hojaAsociadosIdx);
          totalRaw += rawHojaAsociados.length;
          const dataHojaAsociados = afiliadosStrategy.transform(rawHojaAsociados);
          combinedData = [...combinedData, ...dataHojaAsociados];
      } catch(e) {
          console.warn("No se pudo procesar la hoja asignada a Libro de asociados", e);
      }

      setProgreso(80);

      if (combinedData.length === 0) {
        throw new Error("No se detectaron datos válidos en ninguna de las hojas (Dignatarios o Libro de Asociados).");
      }

      // 3. Mapear Cargos
      combinedData = mapCargos(combinedData);

      // 4. De-duplicar por cédula (tomar la unión de campos si hay duplicados)
      const mergedMap = new Map<string, any>();
      for (const row of combinedData) {
          const key = row.cedula ? String(row.cedula).trim() : (row.nombre + row.apellido).trim();
          if (mergedMap.has(key)) {
             const existing = mergedMap.get(key);
             // Merge fields, preferring non-empty values
             for (const field in row) {
                 if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
                     if (!existing[field]) {
                         existing[field] = row[field];
                     }
                 }
             }
          } else {
             mergedMap.set(key, { ...row });
          }
      }
      
      const finalData = Array.from(mergedMap.values());

      const mappedPreview: RegistroPreview[] = finalData.slice(0, 5);

      setPreview(mappedPreview);
      setDatosParaEnviar(finalData);
      setResultado({
        filasDetectadas: totalRaw,
        validas: finalData.length,
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

  const importarArchivo = async () => {
    if (!archivo || datosParaEnviar.length === 0 || jacId === "") {
      setError("Por favor, selecciona una JAC de destino.");
      return;
    }

    setEstado("importando");
    setProgreso(50);

    try {
      const res = await AfiliadosMigracionService.uploadBulk({ data: datosParaEnviar, jacId: Number(jacId) });
      
      if (res) {
        setResultado(prev => ({
          ...prev,
          validas: res.validas ?? prev.validas,
          errores: res.errores ?? 0,
          advertencias: res.advertencias ?? 0,
        }));
        setDetallesErrores(res.detalles ?? []);
      }

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
    jacId,
    setJacId,
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
    importarArchivo,
    resetEstado,
    formatBytes,
    detallesErrores,
  };
}
