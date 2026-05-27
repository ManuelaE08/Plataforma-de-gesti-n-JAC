import { X } from "lucide-react";
import type { UpdateJACDto, JacItem } from "../types";
import { JacForm } from "./JacForm";
import type { Asocomunal } from "../../asocomunales/types";

interface ModalEditarJacProps {
  onClose: () => void;
  onSave: (id: number, jac: UpdateJACDto) => Promise<void>;
  asocomunales: Asocomunal[];
  jac: JacItem;
}

/**
 * Modal para editar una JAC existente.
 * Usa el componente JacForm para el formulario.
 * La lógica de estado y validaciones está en el hook useJacForm.
 *
 * Patrón: Modal solo maneja UI (abrir/cerrar), formulario maneja lógica.
 */
export function ModalEditarJac({ onClose, onSave, asocomunales, jac }: ModalEditarJacProps) {
  const handleSave = async (data: UpdateJACDto) => {
    await onSave(jac.id, data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Editar JAC</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <JacForm
            asocomunales={asocomunales}
            onSubmit={handleSave}
            initialData={jac}
          />
        </div>
      </div>
    </div>
  );
}
