import type { Municipio, CreateAsocomunalDto, UpdateAsocomunalDto, Asocomunal } from "../types";
import { useAsocomunalForm } from "../hooks/useAsocomunalForm";

interface AsocomunalFormProps {
  municipios: Municipio[];
  onSubmit: (data: CreateAsocomunalDto | UpdateAsocomunalDto) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<Asocomunal>;
}

/**
 * Componente reutilizable para formularios de asocomunales.
 * Contiene todos los campos del formulario (nombre, municipioId, estado, presidente, teléfono, correo).
 * Es usado por ModalCrearAsocomunal y ModalEditarAsocomunal.
 * La lógica de estado y validaciones está en el hook useAsocomunalForm.
 *
 * Beneficio: Separa la UI del formulario de la lógica, permitiendo reutilización.
 */
export function AsocomunalForm({ municipios, onSubmit, loading = false, initialData }: AsocomunalFormProps) {
  const { form, errors, handleChange, handleSubmit, loading: formLoading } = useAsocomunalForm(initialData);

  const field = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {key === "municipioId" ? (
        <select
          value={form[key] || ""}
          onChange={(e) => handleChange(key, Number(e.target.value))}
          className="border border-gray-200 px-3 py-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all"
        >
          <option value="">Selecciona un municipio</option>
          {municipios.map((mun) => (
            <option key={mun.id} value={mun.id}>
              {mun.nombre}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={String(form[key] || "")}
          onChange={(e) => handleChange(key, e.target.value)}
          className="border border-gray-200 px-3 py-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all"
        />
      )}
      {errors[key] && <span className="text-xs text-red-500">{errors[key]}</span>}
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit); }} className="space-y-4">
      {field("Nombre", "nombre", "text", "Nombre de la asocomunal")}
      {field("Municipio", "municipioId")}
      {field("Presidente", "presidente", "text", "Nombre del presidente")}
      {field("Teléfono", "telefono", "tel", "Número de teléfono")}
      {field("Correo", "correo", "email", "Correo electrónico")}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="estado"
          checked={form.estado || false}
          onChange={(e) => handleChange("estado", e.target.checked)}
          className="rounded border-gray-300 text-[#1B7F4B] focus:ring-[#1B7F4B]"
        />
        <label htmlFor="estado" className="text-sm text-gray-600">
          Activo
        </label>
      </div>

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