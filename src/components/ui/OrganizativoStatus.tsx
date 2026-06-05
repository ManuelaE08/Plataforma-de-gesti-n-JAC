export type EstadoOrganizativoLabel = "Activa" | "Inactiva" | "Cancelada";

export function booleanToOrganizativo(activo: boolean): EstadoOrganizativoLabel {
  return activo ? "Activa" : "Inactiva";
}

function dotClass(estado: EstadoOrganizativoLabel): string {
  switch (estado) {
    case "Activa":
      return "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]";
    case "Inactiva":
      return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
    case "Cancelada":
      return "bg-gray-400 shadow-[0_0_8px_rgba(156,163,175,0.6)]";
    default:
      return "bg-gray-300";
  }
}

interface OrganizativoStatusProps {
  /** Etiqueta organizativa o booleano (true = Activa, false = Inactiva). */
  estado: EstadoOrganizativoLabel | boolean;
  className?: string;
}

/** Indicador de estado alineado con la tabla de JAC (punto + texto). */
export function OrganizativoStatus({ estado, className = "" }: OrganizativoStatusProps) {
  const labelRaw =
    typeof estado === "boolean" ? booleanToOrganizativo(estado) : estado;

  // Normalizar capitalización para soportar "activa", "inactiva", "cancelada"
  const label = typeof labelRaw === "string"
    ? (labelRaw.charAt(0).toUpperCase() + labelRaw.slice(1).toLowerCase()) as EstadoOrganizativoLabel
    : labelRaw;

  return (
    <div
      className={`flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 ${className}`}
    >
      <span className={`w-2 h-2 shrink-0 rounded-full ${dotClass(label)}`} />
      {label}
    </div>
  );
}
