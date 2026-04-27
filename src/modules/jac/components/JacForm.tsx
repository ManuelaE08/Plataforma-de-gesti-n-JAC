import type { CreateJacDto, UpdateJacDto, Jac, AsocomunalBasica } from "../types";
import { useJacForm } from "../hooks/useJacForm";

interface JacFormProps {
  asocomunales: AsocomunalBasica[];
  onSubmit: (data: CreateJacDto | UpdateJacDto) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<Jac>;
}

/**
 * Componente reutilizable para formularios de JAC.
 * Contiene todos los campos del formulario (nombreCompleto, nombreCorto, asocomunalId, numeroRUC).
 * Es usado por ModalCrearJac y ModalEditarJac.
 * La lógica de estado y validaciones está en el hook useJacForm.
 *
 * Beneficio: Separa la UI del formulario de la lógica, permitiendo reutilización.
 */
export function JacForm({ asocomunales, onSubmit, loading = false, initialData }: JacFormProps) {
  const { form, errors, touched, handleChange, handleBlur, handleSubmit, loading: formLoading } = useJacForm(initialData);

  const field = (
    label: string, 
    key: keyof typeof form, 
    type = "text", 
    placeholder = "",
    required = false
  ) => {
    const showError = touched[key] && !!errors[key];

    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {key === "asocomunalId" ? (
          <select
            value={form[key] || ""}
            onChange={(e) => handleChange(key, e.target.value ? Number(e.target.value) : null)}
            onBlur={() => handleBlur(key)}
            className="border border-gray-200 dark:border-gray-600 px-3 py-2.5 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all"
          >
            <option value="">Sin asocomunal asignada</option>
            {asocomunales.map((asoc) => (
              <option key={asoc.id} value={asoc.id}>
                {asoc.nombre} - {asoc.municipioNombre}
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
            className="border border-gray-200 dark:border-gray-600 px-3 py-2.5 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all"
          />
        )}
        {showError && <span className="text-xs text-red-500 dark:text-red-400">{errors[key]}</span>}
      </div>
    );
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit); }} className="space-y-4">
      {field("Nombre Completo", "nombreCompleto", "text", "Junta de Acción Comunal Barrio...", true)}
      {field("Nombre Corto", "nombreCorto", "text", "JAC...")}
      {field("Asocomunal", "asocomunalId")}
      {field("Número RUC", "numeroRUC", "text", "900123456-1")}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || formLoading}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#1B7F4B] rounded-lg hover:bg-[#1B7F4B]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {formLoading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}