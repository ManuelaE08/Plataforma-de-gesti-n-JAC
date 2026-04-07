import { X } from "lucide-react";
import type { CreateAsocomunalDto, Municipio } from "../types";
import { AsocomunalForm } from "./AsocomunalForm";

interface ModalCrearAsocomunalProps {
  onClose: () => void;
  onSave: (asoc: CreateAsocomunalDto) => void;
  municipios: Municipio[];
  loading?: boolean;
}

/**
 * Modal para crear una nueva asocomunal.
 * Usa el componente AsocomunalForm para el formulario.
 * La lógica de estado y validaciones está en el hook useAsocomunalForm.
 *
 * Patrón: Modal solo maneja UI (abrir/cerrar), formulario maneja lógica.
 */
export function ModalCrearAsocomunal({ onClose, onSave, municipios, loading = false }: ModalCrearAsocomunalProps) {
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

        <div className="px-6 py-5">
          <AsocomunalForm
            municipios={municipios}
            onSubmit={onSave}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}