import { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { AfiliadosService, CreateAfiliadoDto, CargoResponse } from "../services/afiliadosService";

interface ModalAfiliadoFormularioProps {
  isOpen: boolean;
  onClose: () => void;
  jacId: number;
  municipioId?: number;
  afiliadoId?: number | null;
  onSuccess: () => void;
}

export function ModalAfiliadoFormulario({
  isOpen,
  onClose,
  jacId,
  municipioId,
  afiliadoId,
  onSuccess,
}: ModalAfiliadoFormularioProps) {
  const isEdit = !!afiliadoId;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargos, setCargos] = useState<CargoResponse[]>([]);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    lugarExpedicionCedula: "",
    correo: "",
    telefono: "",
    cargoId: "",
    genero: "",
    grupoEtnico: "",
    fechaNacimiento: "",
    ocupacion: "",
    direccion: "",
    discapacitado: false,
  });

  useEffect(() => {
    // Cargar cargos disponibles
    if (isOpen) {
      AfiliadosService.findAllCargos()
        .then(setCargos)
        .catch((err) => console.error("Error cargando cargos:", err));
    }

    // Cargar datos del afiliado si es edición
    if (isEdit && afiliadoId) {
      setIsLoading(true);
      AfiliadosService.findOne(afiliadoId)
        .then((afiliado) => {
          setFormData({
            nombre: afiliado.nombre,
            apellido: afiliado.apellido,
            cedula: afiliado.cedula || "",
            lugarExpedicionCedula: afiliado.lugarExpedicionCedula || "",
            correo: afiliado.correo || "",
            telefono: afiliado.telefono || "",
            cargoId: afiliado.cargoId ? String(afiliado.cargoId) : "",
            genero: afiliado.genero || "",
            grupoEtnico: afiliado.grupoEtnico || "",
            fechaNacimiento: afiliado.fechaNacimiento ? afiliado.fechaNacimiento.split('T')[0] : "",
            ocupacion: afiliado.ocupacion || "",
            direccion: afiliado.direccion || "",
            discapacitado: afiliado.discapacitado || false,
          });
        })
        .catch((err) => setError("Error al cargar afiliado: " + err.message))
        .finally(() => setIsLoading(false));
    } else {
      setFormData({
        nombre: "",
        apellido: "",
        cedula: "",
        lugarExpedicionCedula: "",
        correo: "",
        telefono: "",
        cargoId: "",
        genero: "",
        grupoEtnico: "",
        fechaNacimiento: "",
        ocupacion: "",
        direccion: "",
        discapacitado: false,
      });
      setError(null);
    }
  }, [isOpen, isEdit, afiliadoId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEdit && afiliadoId) {
        await AfiliadosService.update(afiliadoId, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          cedula: formData.cedula || undefined,
          lugarExpedicionCedula: formData.lugarExpedicionCedula || undefined,
          correo: formData.correo || undefined,
          telefono: formData.telefono || undefined,
          cargoId: formData.cargoId ? Number(formData.cargoId) : undefined,
          genero: formData.genero || undefined,
          grupoEtnico: formData.grupoEtnico || undefined,
          fechaNacimiento: formData.fechaNacimiento || undefined,
          ocupacion: formData.ocupacion || undefined,
          direccion: formData.direccion || undefined,
          discapacitado: formData.discapacitado,
        });
        await Swal.fire({ icon: "success", title: "Afiliado actualizado", text: "La información ha sido guardada correctamente.", confirmButtonColor: "#1B7F4B", timer: 2000, timerProgressBar: true });
      } else {
        await AfiliadosService.create({
          nombre: formData.nombre,
          apellido: formData.apellido,
          cedula: formData.cedula || undefined,
          lugarExpedicionCedula: formData.lugarExpedicionCedula || undefined,
          correo: formData.correo || undefined,
          telefono: formData.telefono || undefined,
          cargoId: formData.cargoId ? parseInt(formData.cargoId) : undefined,
          jacId,
          municipioId,
          genero: formData.genero || undefined,
          grupoEtnico: formData.grupoEtnico || undefined,
          fechaNacimiento: formData.fechaNacimiento || undefined,
          ocupacion: formData.ocupacion || undefined,
          direccion: formData.direccion || undefined,
          discapacitado: formData.discapacitado,
        } as CreateAfiliadoDto);
        await Swal.fire({ icon: "success", title: "Afiliado registrado", text: "El nuevo afiliado ha sido creado exitosamente.", confirmButtonColor: "#1B7F4B", timer: 2000, timerProgressBar: true });
      }

      onSuccess();
      onClose();
    } catch (err) {
      await Swal.fire({ icon: "error", title: "Error", text: err instanceof Error ? err.message : "No se pudo procesar la solicitud.", confirmButtonColor: "#1B7F4B" });
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {isEdit ? "Editar Afiliado" : "Nuevo Afiliado"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Nombre *</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Apellido *</label>
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Cédula</label>
            <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Lugar Expedición Cédula</label>
            <input type="text" name="lugarExpedicionCedula" value={formData.lugarExpedicionCedula} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Correo</label>
            <input type="email" name="correo" value={formData.correo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Teléfono</label>
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Género</label>
              <select name="genero" value={formData.genero} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                <option value="">Seleccionar...</option>
                <option value="M">Masculino</option>
                <option value="H">Femenino</option>
                <option value="LGTBIQ+">LGTBIQ+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Grupo Étnico</label>
              <select name="grupoEtnico" value={formData.grupoEtnico} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                <option value="">Seleccionar...</option>
                <option value="Afro">Afro</option>
                <option value="Indígena">Indígena</option>
                <option value="Mestizo">Mestizo</option>
                <option value="Campesino">Campesino</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Fecha Nacimiento</label>
              <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} onClick={(e) => e.currentTarget.showPicker()} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Ocupación</label>
              <input type="text" name="ocupacion" value={formData.ocupacion} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Dirección</label>
            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
          </div>

          <div className="flex items-center gap-2 mt-2 mb-4">
            <input type="checkbox" id="discapacitado" name="discapacitado" checked={formData.discapacitado} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
            <label htmlFor="discapacitado" className="text-sm text-gray-700 dark:text-gray-300">
              ¿Tiene alguna discapacidad?
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Cargo</label>
            <select
              name="cargoId"
              value={formData.cargoId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              <option value="">Seleccionar cargo...</option>
              {cargos.map((cargo) => (
                <option key={cargo.id} value={String(cargo.id)}>
                  {cargo.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading && <Loader size={16} className="animate-spin" />}
              {isEdit ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
