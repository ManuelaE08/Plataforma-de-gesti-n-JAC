import { X } from "lucide-react";
import { useState } from "react";
import type { JacItem, EstadoDocumental, EstadoOrganizativo } from "../../hooks/useJac";

interface ModalCrearJacProps {
  onClose: () => void;
  onSave: (jac: Omit<JacItem, "id" | "miembros">) => void;
}

const initialForm = {
  nombre: "",
  municipio: "",
  barrio: "",
  afiliados: 0,
  documental: "Vigente" as EstadoDocumental,
  organizativo: "Activa" as EstadoOrganizativo,
};

const inputCls = (hasError: boolean) =>
  `w-full border text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all
   text-gray-700 dark:text-gray-200
   bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800
   placeholder:text-gray-300 dark:placeholder:text-gray-600
   ${hasError
    ? "border-red-300 dark:border-red-600"
    : "border-gray-200 dark:border-gray-600"}`;

export function ModalCrearJac({ onClose, onSave }: ModalCrearJacProps) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.municipio.trim()) e.municipio = "El municipio es obligatorio";
    if (!form.barrio.trim()) e.barrio = "El barrio o vereda es obligatorio";
    if (form.afiliados < 0) e.afiliados = "El número de afiliados no puede ser negativo";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSave(form);
    onClose();
  };

  const field = (label: string, key: keyof typeof form, type = "text") => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      <input
        type={type}
        value={String(form[key])}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
        className={inputCls(!!errors[key])}
      />
      {errors[key] && <p className="text-xs text-red-500 dark:text-red-400">{errors[key]}</p>}
    </div>
  );

  const selectField = (label: string, key: keyof typeof form, options: string[]) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      <select
        value={String(form[key])}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        className="appearance-none w-full border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
      >
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Crear nueva JAC</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Complete los datos de la junta de acción comunal</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {field("Nombre de la JAC", "nombre")}
          {field("Municipio", "municipio")}
          {field("Barrio / Vereda", "barrio")}
          {field("Número de afiliados", "afiliados", "number")}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 mt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition-colors">
              Guardar JAC
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}