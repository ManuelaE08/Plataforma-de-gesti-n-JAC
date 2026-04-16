import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";

export type EstadoCarga = "idle" | "archivo" | "validando" | "listo" | "importando" | "importado" | "error";

export interface RegistroPreview {
  id: number;
  nombre: string;
  municipio: string;
  barrio: string;
  afiliados: number;
  estado: string;
}

interface MigracionResultado {
  filasDetectadas: number;
  validas: number;
  advertencias: number;
  errores: number;
}

const formatosPermitidos = [".xlsx", ".xls", ".csv"];
const tamanoMaximoMb = 10;

const previewBase: RegistroPreview[] = [
  { id: 1, nombre: "JAC Bello Horizonte", municipio: "Popayán", barrio: "Bello Horizonte", afiliados: 124, estado: "Activa" },
  { id: 2, nombre: "JAC La Esmeralda", municipio: "Santander de Quilichao", barrio: "La Esmeralda", afiliados: 98, estado: "Activa" },
  { id: 3, nombre: "JAC El Recuerdo", municipio: "Patía", barrio: "El Recuerdo", afiliados: 67, estado: "Pendiente" },
  { id: 4, nombre: "JAC San José", municipio: "Piendamó", barrio: "San José", afiliados: 143, estado: "Activa" },
];

function validarArchivoLocal(file: File) {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() || ""}`;

  if (!formatosPermitidos.includes(extension)) {
    return "Formato no permitido. Solo se aceptan archivos .xlsx, .xls y .csv.";
  }

  if (file.size > tamanoMaximoMb * 1024 * 1024) {
    return `El archivo supera el tamaño máximo permitido de ${tamanoMaximoMb}MB.`;
  }

  return "";
}

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
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [resultado, setResultado] = useState<MigracionResultado>({
    filasDetectadas: 0,
    validas: 0,
    advertencias: 0,
    errores: 0,
  });

  const preview = useMemo(() => previewBase, []);

  const resetEstado = () => {
    setArchivo(null);
    setEstado("idle");
    setError("");
    setProgreso(0);
    setMostrarPreview(false);
    setResultado({ filasDetectadas: 0, validas: 0, advertencias: 0, errores: 0 });
    setArrastrando(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const procesarArchivo = (file: File) => {
    const validacion = validarArchivoLocal(file);

    if (validacion) {
      setArchivo(null);
      setEstado("error");
      setError(validacion);
      setResultado({ filasDetectadas: 0, validas: 0, advertencias: 0, errores: 0 });
      setProgreso(0);
      setMostrarPreview(false);
      return;
    }

    setArchivo(file);
    setEstado("archivo");
    setError("");
    setProgreso(0);
    setMostrarPreview(false);
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

  const validarArchivo = () => {
    if (!archivo) return;

    setEstado("validando");
    setProgreso(20);
    window.setTimeout(() => setProgreso(48), 350);
    window.setTimeout(() => setProgreso(72), 700);
    window.setTimeout(() => {
      setProgreso(100);
      setEstado("listo");
      setMostrarPreview(true);
      setResultado({ filasDetectadas: 128, validas: 121, advertencias: 5, errores: 2 });
    }, 1000);
  };

  const importarArchivo = () => {
    if (!archivo) return;

    setEstado("importando");
    setProgreso(25);
    window.setTimeout(() => setProgreso(55), 350);
    window.setTimeout(() => setProgreso(82), 700);
    window.setTimeout(() => {
      setProgreso(100);
      setEstado("importado");
    }, 1050);
  };

  return {
    inputRef,
    archivo,
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
    validarArchivo,
    importarArchivo,
    resetEstado,
    formatBytes,
  };
}
