import { X } from "lucide-react";
import type { CreateAsocomunalDto, UpdateAsocomunalDto, Municipio, Asocomunal } from "../types";
import { AsocomunalForm } from "./AsocomunalForm";

interface ModalEditarAsocomunalProps {
  onClose: () => void;
  onSave: (id: number, asoc: CreateAsocomunalDto | UpdateAsocomunalDto) => Promise<void>;
  municipios: Municipio[];
  asocomunal: Asocomunal;
  loading?: boolean;
}

/**
 * Modal para editar una asocomunal existente.
 * Usa el componente AsocomunalForm para el formulario.
 * La lógica de estado y validaciones está en el hook useAsocomunalForm.
 *
 * Patrón: Modal solo maneja UI (abrir/cerrar), formulario maneja lógica.
 */
export function ModalEditarAsocomunal({ onClose, onSave, municipios, asocomunal, loading = false }: ModalEditarAsocomunalProps) {
  const handleSave = async (data: UpdateAsocomunalDto) => {
    await onSave(asocomunal.id, data);
  };

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

        <div className="p-6">
          <AsocomunalForm
            municipios={municipios}
            onSubmit={handleSave}
            loading={loading}
            initialData={asocomunal}
          />
        </div>
      </div>
    </div>
  );
}