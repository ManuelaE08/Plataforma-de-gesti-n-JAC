import { X } from "lucide-react";
import type { CreateJacDto, UpdateJacDto, AsocomunalBasica } from "../types";
import { JacForm } from "./JacForm";

interface ModalCrearJacProps {
  onClose: () => void;
  onSave: (jac: CreateJacDto | UpdateJacDto) => Promise<void>;
  asocomunales: AsocomunalBasica[];
  loading?: boolean;
}

/**
 * Modal para crear una nueva JAC.
 * Usa el componente JacForm para el formulario.
 * La lógica de estado y validaciones está en el hook useJacForm.
 *
 * Patrón: Modal solo maneja UI (abrir/cerrar), formulario maneja lógica.
 */
export function ModalCrearJac({ onClose, onSave, asocomunales, loading = false }: ModalCrearJacProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Crear nueva JAC</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Complete los datos de la Junta de Acción Comunal</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <JacForm
            asocomunales={asocomunales}
            onSubmit={onSave}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}