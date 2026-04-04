import { X } from "lucide-react";
import { useState } from "react";
import type { TipoAccion } from "../../hooks/useSolicitudes";

interface ModalCrearSolicitudProps {
  onClose: () => void;
  onSave: (datos: { tipo: TipoAccion; descripcion: string }) => void;
}

const tiposAccion: TipoAccion[] = [
  "Crear JAC", "Editar JAC", "Eliminar JAC",
  "Crear Asocomunal", "Editar Asocomunal", "Eliminar Asocomunal",
];

export function ModalCrearSolicitud({ onClose, onSave }: ModalCrearSolicitudProps) {
  const [tipo, setTipo] = useState<TipoAccion>("Crear JAC");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) { setError("La descripción es obligatoria"); return; }
    onSave({ tipo, descripcion: descripcion.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Nueva solicitud de cambio</h2>
            <p className="text-xs text-gray-400 mt-0.5">Describa el cambio que desea proponer al administrador</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Tipo de acción</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoAccion)}
              className="appearance-none w-full border border-gray-200 text-sm text-gray-700 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
            >
              {tiposAccion.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Descripción del cambio</label>
            <textarea
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalle qué cambio propone y sobre qué registro..."
              className={`w-full border text-sm text-gray-700 rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all resize-none ${error ? "border-red-300" : "border-gray-200"}`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition-colors">
              Enviar solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}