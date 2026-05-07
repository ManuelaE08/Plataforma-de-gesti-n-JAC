import { X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { JacItem, EstadoDocumental, EstadoOrganizativo, EstadoAprobacion } from "../../hooks/useJac";
import { JACService } from "../../modules/jac/services/jacService";

interface ModalCrearJacProps {
  initialData?: any;
  onClose: () => void;
  onSave: (jac: any) => void;
}


const inputCls = (hasError: boolean) =>
  `w-full border text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all
   text-gray-700 dark:text-gray-200
   bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800
   placeholder:text-gray-300 dark:placeholder:text-gray-600
   ${hasError
     ? "border-red-300 dark:border-red-600"
     : "border-gray-200 dark:border-gray-600"}`;

const selectCls = "appearance-none w-full border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer";

export function ModalCrearJac({ initialData, onClose, onSave }: ModalCrearJacProps) {
  const [form, setForm] = useState({
    nombre:       initialData?.nombre || "",
    municipio:    initialData?.municipio || "",
    barrio:       initialData?.barrio || "",
    afiliados:    initialData?.afiliados || 0,
    asocomunalId: initialData?.asocomunalId || "" as string | number,
    documental:   initialData?.documental || "Vigente"   as EstadoDocumental,
    organizativo: initialData?.organizativo || "Activa"    as EstadoOrganizativo,
    aprobacion:   initialData?.aprobacion || "Pendiente" as EstadoAprobacion,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [asocomunales, setAsocomunales] = useState<any[]>([]);
  const [loadingAso, setLoadingAso] = useState(true);

  useEffect(() => {
    JACService.getAsocomunalesReplica()
      .then(setAsocomunales)
      .catch(err => console.error("Error cargando asocomunales:", err))
      .finally(() => setLoadingAso(false));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim())    e.nombre    = "El nombre es obligatorio";
    if (!form.barrio.trim())    e.barrio    = "El barrio o vereda es obligatorio";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    
    // Convertir asocomunalId a número o null antes de enviar
    const payload = {
      ...form,
      asocomunalId: form.asocomunalId ? Number(form.asocomunalId) : null
    };
    onSave(payload);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              {initialData ? "Editar JAC" : "Crear nueva JAC"}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Asocie la JAC a una Asocomunal</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Asocomunal Responsable</label>
            <div className="relative">
              <select
                value={form.asocomunalId}
                onChange={(e) => setForm(prev => ({ ...prev, asocomunalId: e.target.value }))}
                className={selectCls}
                disabled={loadingAso}
              >
                <option value="">Seleccione una Asocomunal...</option>
                {asocomunales.map(aso => (
                  <option key={aso.id} value={aso.id}>
                    {aso.nombre} ({aso.municipioNombre})
                  </option>
                ))}
              </select>
              {loadingAso && (
                <div className="absolute right-8 top-2.5">
                  <Loader2 className="animate-spin text-[#1B7F4B]" size={16} />
                </div>
              )}
            </div>
            {errors.asocomunalId && <p className="text-xs text-red-500 dark:text-red-400">{errors.asocomunalId}</p>}
          </div>

          {field("Nombre completo de la JAC", "nombre")}
          {field("Barrio / Vereda / Sector", "barrio")}
          {field("Número de afiliados iniciales", "afiliados", "number")}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 mt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
            <button type="submit"
              disabled={loadingAso}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition-colors disabled:opacity-50">
              Guardar JAC
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}