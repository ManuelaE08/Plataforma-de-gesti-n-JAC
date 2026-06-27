import type { UpdateJACDto, JacItem } from "../types";
import { useJacForm } from "../hooks/useJacForm";
import type { Asocomunal } from "../../asocomunales/types";

interface JacFormProps {
  asocomunales: Asocomunal[];
  onSubmit: (data: UpdateJACDto) => Promise<void>;
  initialData?: Partial<JacItem>;
}

/**
 * Componente reutilizable para formularios de JAC.
 * Contiene campos para editar nombre y asocomunal asociada.
 * La lógica de estado y validaciones está en el hook useJacForm.
 *
 * Patrón: Modal solo maneja UI (abrir/cerrar), formulario maneja lógica.
 */
export function JacForm({ asocomunales, onSubmit, initialData }: JacFormProps) {
  const { form, errors, touched, handleChange, handleBlur, handleSubmit, loading: formLoading } = useJacForm(initialData);

  const field = (label: string, key: keyof UpdateJACDto, type = "text", placeholder = "") => {
    const showError = touched[key] && !!errors[key];

    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
        {key === "asocomunalId" ? (
          <select
            value={form[key] || ""}
            onChange={(e) => handleChange(key, e.target.value ? Number(e.target.value) : undefined)}
            onBlur={() => handleBlur(key)}
            className="border border-gray-200 dark:border-gray-600 px-3 py-2.5 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E4B400]/30 focus:border-[#E4B400] transition-all"
          >
            <option value="">Selecciona una asocomunal</option>
            {asocomunales.map((aso) => (
              <option key={aso.id} value={aso.id}>
                {aso.nombre}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={String(form[key] || "")}
            onChange={(e) => handleChange(key, e.target.value)}
            onBlur={() => handleBlur(key)}
            className="border border-gray-200 dark:border-gray-600 px-3 py-2.5 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E4B400]/30 focus:border-[#E4B400] transition-all"
          />
        )}
        {showError && <span className="text-xs text-red-500 dark:text-red-400">{errors[key]}</span>}
      </div>
    );
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit); }} className="space-y-4">
      {field("Nombre de la JAC", "nombreCompleto", "text", "Nombre completo")}
      {field("Número RUC", "numeroRUC", "text", "RUC (opcional)")}
      
      {/* Campo Estado */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Estado de la JAC</label>
        <select
          value={form.estado || ""}
          onChange={(e) => handleChange("estado", e.target.value as "activa" | "inactiva" | "cancelada" | "")}
          onBlur={() => handleBlur("estado")}
          className="border border-gray-200 dark:border-gray-600 px-3 py-2.5 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E4B400]/30 focus:border-[#E4B400] transition-all"
        >
          <option value="">Sin cambio</option>
          <option value="activa">Activa</option>
          <option value="inactiva">Inactiva</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {field("Asocomunal", "asocomunalId")}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={formLoading}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#E4B400] rounded-lg hover:bg-[#E4B400]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {formLoading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
