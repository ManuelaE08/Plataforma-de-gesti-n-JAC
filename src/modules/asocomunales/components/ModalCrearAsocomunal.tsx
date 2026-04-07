import { X } from "lucide-react";
import { useState } from "react";
import type { CreateAsocomunalDto, Municipio } from "../types";

interface ModalCrearAsocomunalProps {
  onClose: () => void;
  onSave: (asoc: CreateAsocomunalDto) => void;
  municipios: Municipio[];
  loading?: boolean;
}

const initialForm: CreateAsocomunalDto = {
  nombre: "",
  estado: true,
  municipioId: 0,
  presidente: "",
  telefono: "",
  correo: "",
};

export function ModalCrearAsocomunal({ onClose, onSave, municipios, loading = false }: ModalCrearAsocomunalProps) {
  const [form, setForm] = useState<CreateAsocomunalDto>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.municipioId || form.municipioId === 0) newErrors.municipioId = "El municipio es obligatorio";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(form);
    setForm(initialForm);
  };

  const field = (label: string, key: keyof CreateAsocomunalDto, type = "text", placeholder = "") => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={String(form[key] || "")}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            [key]: type === "number" ? (e.target.value ? Number(e.target.value) : 0) : e.target.value,
          }))
        }
        disabled={loading}
        className={`w-full border text-sm text-gray-700 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          errors[key] ? "border-red-300" : "border-gray-200"
        }`}
      />
      {errors[key] && <p className="text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Crear nueva Asocomunal</h2>
            <p className="text-xs text-gray-400 mt-0.5">Complete los datos de la asociación comunal</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {field("Nombre de la Asocomunal", "nombre", "text", "Ej: Asocomunal Popayán")}

          {/* Municipio - Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Municipio</label>
            <select
              value={form.municipioId || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  municipioId: e.target.value ? Number(e.target.value) : 0,
                }))
              }
              disabled={loading}
              className={`appearance-none w-full border text-sm text-gray-700 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.municipioId ? "border-red-300" : "border-gray-200"
              }`}
            >
              <option value="">Seleccionar municipio...</option>
              {municipios.map((mun) => (
                <option key={mun.id} value={mun.id}>
                  {mun.nombre}
                </option>
              ))}
            </select>
            {errors.municipioId && <p className="text-xs text-red-500">{errors.municipioId}</p>}
          </div>

          {field("Presidente", "presidente", "text", "Nombre del presidente")}
          {field("Teléfono", "telefono", "tel", "Ej: 3101234567")}
          {field("Correo", "correo", "email", "Ej: info@asocomunal.com")}

          {/* Estado */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Estado</label>
            <select
              value={form.estado ? "Activo" : "Inactivo"}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  estado: e.target.value === "Activo",
                }))
              }
              disabled={loading}
              className="appearance-none w-full border border-gray-200 text-sm text-gray-700 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Guardar Asocomunal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}