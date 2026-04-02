import { X } from "lucide-react";
import { useState } from "react";

interface ModalRechazarProps {
  onClose: () => void;
  onConfirm: (motivo: string) => void;
}

export function ModalRechazar({ onClose, onConfirm }: ModalRechazarProps) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) { setError("El motivo de rechazo es obligatorio"); return; }
    onConfirm(motivo.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Rechazar solicitud</h2>
            <p className="text-xs text-gray-400 mt-0.5">Indique el motivo para que el operador sea notificado</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Motivo del rechazo</label>
            <textarea
              rows={4}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explique por qué se rechaza esta solicitud..."
              className={`w-full border text-sm text-gray-700 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all resize-none ${error ? "border-red-300" : "border-gray-200"}`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
              Confirmar rechazo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}