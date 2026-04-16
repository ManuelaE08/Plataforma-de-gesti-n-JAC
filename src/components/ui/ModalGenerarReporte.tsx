import { X, Plus, Loader2 } from "lucide-react";
import type { NuevoReporteForm } from "../../hooks/useReportes";

interface Props {
  abierto: boolean;
  form: NuevoReporteForm;
  formError: string;
  generando: boolean;
  onCerrar: () => void;
  onSetField: <K extends keyof NuevoReporteForm>(key: K, value: NuevoReporteForm[K]) => void;
  onGenerar: () => void;
}

const TIPOS = [
  "Consolidado JAC",
  "Consolidado Asocomunales",
  "Estado documental",
  "Riesgo organizativo",
  "Usuarios",
  "Auditoría",
] as const;

const FORMATOS = ["PDF", "Excel", "CSV"] as const;

function ModalGenerarReporte({ abierto, form, formError, generando, onCerrar, onSetField, onGenerar }: Props) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCerrar} />

      <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Generar nuevo reporte</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Complete los campos para crear el reporte</p>
          </div>
          <button
            onClick={onCerrar}
            disabled={generando}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nombre del reporte <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Reporte JAC - Abril 2026"
              value={form.nombre}
              onChange={(e) => onSetField("nombre", e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tipo de reporte <span className="text-red-500">*</span>
            </label>
            <select
              value={form.tipo}
              onChange={(e) => onSetField("tipo", e.target.value as NuevoReporteForm["tipo"])}
              className="appearance-none w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
            >
              <option value="">Seleccionar tipo...</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Formato */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Formato de exportación <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FORMATOS.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => onSetField("formato", fmt)}
                  className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                    form.formato === fmt
                      ? "border-[#1B7F4B] bg-[#1B7F4B]/10 text-[#1B7F4B] dark:text-emerald-400"
                      : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {formError && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onCerrar}
            disabled={generando}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onGenerar}
            disabled={generando}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B7F4B] hover:bg-[#166340] disabled:bg-[#1B7F4B]/70 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {generando
              ? <><Loader2 size={15} className="animate-spin" /> Generando...</>
              : <><Plus size={15} /> Generar reporte</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalGenerarReporte;