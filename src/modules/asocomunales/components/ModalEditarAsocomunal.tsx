import { X } from "lucide-react";
import { useState, useEffect } from "react";
import type { UpdateAsocomunalDto, Municipio, AsocomunalItem } from "../types";

interface ModalEditarAsocomunalProps {
  onClose: () => void;
  onSave: (id: number, asoc: UpdateAsocomunalDto) => void;
  municipios: Municipio[];
  asocomunal: AsocomunalItem;
  loading?: boolean;
}

export function ModalEditarAsocomunal({ onClose, onSave, municipios, asocomunal, loading = false }: ModalEditarAsocomunalProps) {
  const [form, setForm] = useState<UpdateAsocomunalDto>({
    nombre: asocomunal.nombre,
    estado: asocomunal.estado,
    municipioId: asocomunal.municipio.id,
    presidente: asocomunal.presidente || "",
    telefono: asocomunal.telefono || "",
    correo: asocomunal.correo || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm({
      nombre: asocomunal.nombre,
      estado: asocomunal.estado,
      municipioId: asocomunal.municipio.id,
      presidente: asocomunal.presidente || "",
      telefono: asocomunal.telefono || "",
      correo: asocomunal.correo || "",
    });
  }, [asocomunal]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nombre?.trim()) newErrors.nombre = "El nombre es obligatorio";
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
    onSave(asocomunal.id, form);
  };

  const field = (label: string, key: keyof UpdateAsocomunalDto, type = "text", placeholder = "") => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {key === "municipioId" ? (
        <select
          value={form[key] || ""}
          onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
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
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="border border-gray-200 px-3 py-2.5 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all"
        />
      )}
      {errors[key] && <span className="text-xs text-red-500">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Editar Asocomunal</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              onChange={(e) => setForm({ ...form, estado: e.target.checked })}
              className="rounded border-gray-300 text-[#1B7F4B] focus:ring-[#1B7F4B]"
            />
            <label htmlFor="estado" className="text-sm text-gray-600">
              Activo
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#1B7F4B] rounded-lg hover:bg-[#1B7F4B]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}