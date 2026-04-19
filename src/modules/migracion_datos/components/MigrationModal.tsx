import { X } from "lucide-react";
import MigrationForm from "./MigrationForm";
import { MigrationEntity } from "../types";

export interface MigrationModalProps {
  entity: MigrationEntity;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MigrationModal({ entity, onClose, onSuccess }: MigrationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Importar {entity === "asocomunales" ? "Asocomunales" : "JACs"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Sube un archivo de Excel para registrar datos masivamente.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <MigrationForm entity={entity} onSuccess={() => {
              if (onSuccess) onSuccess();
          }} />
        </div>
      </div>
    </div>
  );
}
