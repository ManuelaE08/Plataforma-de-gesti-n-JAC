import { X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { TipoAccion, CambioCampo } from "../../hooks/useSolicitudes";


interface ModalCrearSolicitudProps {
  onClose: () => void;
  onSave: (datos: {
    tipo: TipoAccion;
    descripcion: string;
    entidad: "JAC" | "Asocomunal";
    cambios: CambioCampo[];
  }) => void;
}


const tiposAccion: TipoAccion[] = [
  "Crear JAC", "Editar JAC", "Eliminar JAC",
  "Crear Asocomunal", "Editar Asocomunal", "Eliminar Asocomunal",
];


// Campos predefinidos según tipo de acción
const camposPreset: Record<TipoAccion, CambioCampo[]> = {
  "Crear JAC": [
    { campo: "Nombre", valorNuevo: "" },
    { campo: "Municipio", valorNuevo: "" },
    { campo: "Barrio/Vereda", valorNuevo: "" },
    { campo: "Afiliados", valorNuevo: "" },
    { campo: "Estado", valorNuevo: "" },
  ],
  "Editar JAC": [
    { campo: "Campo a modificar", valorAnterior: "", valorNuevo: "" },
  ],
  "Eliminar JAC": [
    { campo: "Nombre de la JAC", valorNuevo: "" },
    { campo: "Motivo", valorNuevo: "" },
  ],
  "Crear Asocomunal": [
    { campo: "Nombre", valorNuevo: "" },
    { campo: "Municipio", valorNuevo: "" },
    { campo: "JAC asociadas", valorNuevo: "" },
    { campo: "Estado", valorNuevo: "" },
  ],
  "Editar Asocomunal": [
    { campo: "Campo a modificar", valorAnterior: "", valorNuevo: "" },
  ],
  "Eliminar Asocomunal": [
    { campo: "Nombre de la Asocomunal", valorNuevo: "" },
    { campo: "Motivo", valorNuevo: "" },
  ],
};


function getEntidad(tipo: TipoAccion): "JAC" | "Asocomunal" {
  return tipo.includes("Asocomunal") ? "Asocomunal" : "JAC";
}


function getDescripcion(tipo: TipoAccion, cambios: CambioCampo[]): string {
  const nombre = cambios.find(
    (c) => c.campo === "Nombre" || c.campo === "Nombre de la JAC" || c.campo === "Nombre de la Asocomunal"
  )?.valorNuevo;
  return nombre ? `${nombre}` : tipo;
}


export function ModalCrearSolicitud({ onClose, onSave }: ModalCrearSolicitudProps) {
  const [tipo, setTipo] = useState<TipoAccion>("Crear JAC");
  const [cambios, setCambios] = useState<CambioCampo[]>(camposPreset["Crear JAC"]);
  const [errors, setErrors] = useState<Record<number, string>>({});


  const esEdicion = tipo.startsWith("Editar");


  const handleTipoChange = (nuevoTipo: TipoAccion) => {
    setTipo(nuevoTipo);
    setCambios(camposPreset[nuevoTipo].map((c) => ({ ...c })));
    setErrors({});
  };


  const updateCampo = (i: number, key: keyof CambioCampo, value: string) => {
    setCambios((prev) => prev.map((c, idx) => idx === i ? { ...c, [key]: value } : c));
    setErrors((prev) => { const e = { ...prev }; delete e[i]; return e; });
  };


  const agregarFila = () => {
    setCambios((prev) => [
      ...prev,
      esEdicion
        ? { campo: "", valorAnterior: "", valorNuevo: "" }
        : { campo: "", valorNuevo: "" },
    ]);
  };


  const eliminarFila = (i: number) => {
    setCambios((prev) => prev.filter((_, idx) => idx !== i));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<number, string> = {};
    cambios.forEach((c, i) => {
      if (!c.campo.trim() || !c.valorNuevo.trim()) {
        newErrors[i] = "Completa todos los campos";
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({
      tipo,
      entidad: getEntidad(tipo),
      descripcion: getDescripcion(tipo, cambios),
      cambios,
    });
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">


        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Nueva solicitud de cambio</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Seleccione el tipo de acción y complete los campos del cambio propuesto
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>


        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5 overflow-y-auto flex-1">


          {/* Tipo de acción */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Tipo de acción
            </label>
            <select
              value={tipo}
              onChange={(e) => handleTipoChange(e.target.value as TipoAccion)}
              className="appearance-none w-full border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
            >
              {tiposAccion.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>


          {/* Tabla de cambios */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Cambios propuestos
              </label>
              {esEdicion && (
                <button
                  type="button"
                  onClick={agregarFila}
                  className="inline-flex items-center gap-1 text-xs text-[#1B7F4B] dark:text-emerald-400 hover:underline font-medium"
                >
                  <Plus size={13} /> Agregar campo
                </button>
              )}
            </div>


            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3">
                      Campo
                    </th>
                    {esEdicion && (
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3">
                        Valor anterior
                      </th>
                    )}
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Valor nuevo
                    </th>
                    {esEdicion && <th className="w-8" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {cambios.map((c, i) => (
                    <tr key={i} className={errors[i] ? "bg-red-50 dark:bg-red-900/20" : "bg-white dark:bg-gray-800"}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={c.campo}
                          onChange={(e) => updateCampo(i, "campo", e.target.value)}
                          placeholder="Ej: Nombre"
                          className="w-full text-xs rounded border border-gray-200 dark:border-gray-600 px-2 py-1.5 text-gray-700 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1B7F4B]/40 focus:border-[#1B7F4B] transition bg-transparent"
                        />
                      </td>
                      {esEdicion && (
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={c.valorAnterior ?? ""}
                            onChange={(e) => updateCampo(i, "valorAnterior", e.target.value)}
                            placeholder="Valor actual"
                            className="w-full text-xs rounded border border-gray-200 dark:border-gray-600 px-2 py-1.5 text-red-500 dark:text-red-400 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-red-300 focus:border-red-300 transition bg-transparent"
                          />
                        </td>
                      )}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={c.valorNuevo}
                          onChange={(e) => updateCampo(i, "valorNuevo", e.target.value)}
                          placeholder="Valor propuesto"
                          className="w-full text-xs rounded border border-gray-200 dark:border-gray-600 px-2 py-1.5 text-[#1B7F4B] dark:text-emerald-400 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#1B7F4B]/40 focus:border-[#1B7F4B] transition bg-transparent"
                        />
                      </td>
                      {esEdicion && (
                        <td className="px-2 py-2">
                          {cambios.length > 1 && (
                            <button
                              type="button"
                              onClick={() => eliminarFila(i)}
                              className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 dark:text-gray-600 hover:text-red-400 transition"
                              title="Eliminar fila"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {Object.keys(errors).length > 0 && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">
                Completa todos los campos antes de enviar.
              </p>
            )}
          </div>
        </form>


        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#1B7F4B] hover:bg-[#166340] rounded-lg transition-colors"
          >
            Enviar solicitud
          </button>
        </div>
      </div>
    </div>
  );
}