import { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { AfiliadosService, CreateAfiliadoDto, CargoResponse } from "../services/afiliadosService";
import { SolicitudesService } from "../../solicitudes/services/solicitudes.service";
import { useAuth } from "../../../context/AuthContext";
import { Permissions } from "../../../utils/permissions";

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
  const { user } = useAuth();
  // Maker-Checker: el operador propone (solicitud al MS Auditoría);
  // el admin aplica el cambio directo y deja el registro de auditoría.
  const isAdmin = Permissions.isAdmin(user);
  const isOperador = user?.rol === "operador";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargos, setCargos] = useState<CargoResponse[]>([]);
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [municipiosMap, setMunicipiosMap] = useState<Record<string, string[]>>({});
  const [selectedDepto, setSelectedDepto] = useState<string>("");

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
    estudiosRealizados: "",
    discapacitado: false,
  });

  useEffect(() => {
    // Cargar cargos disponibles
    if (isOpen) {
      AfiliadosService.findAllCargos()
        .then(setCargos)
        .catch((err) => console.error("Error cargando cargos:", err));

      // Cargar Departamentos y Municipios desde Datos Abiertos Colombia (Divipola)
      if (departamentos.length === 0) {
        fetch('https://www.datos.gov.co/resource/gdxc-w37w.json?$limit=2000')
          .then(res => res.json())
          .then(data => {
            if (!Array.isArray(data)) {
              throw new Error("Formato de datos incorrecto desde Divipola");
            }
            const map: Record<string, string[]> = {};
            data.forEach((item: any) => {
              const depto = item.dpto;
              const muni = item.nom_mpio;
              if (depto && muni) {
                if (!map[depto]) map[depto] = [];
                if (!map[depto].includes(muni)) {
                  map[depto].push(muni);
                }
              }
            });
            Object.keys(map).forEach(k => map[k].sort());
            setDepartamentos(Object.keys(map).sort());
            setMunicipiosMap(map);
          })
          .catch(err => console.error("Error cargando Divipola:", err));
      }
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
            estudiosRealizados: afiliado.estudiosRealizados || "",
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
        estudiosRealizados: "",
        discapacitado: false,
      });
      setSelectedDepto("");
      setError(null);
    }
  }, [isOpen, isEdit, afiliadoId]);

  // Intentar autoseleccionar el departamento si estamos en edición y el municipio existe en la lista
  useEffect(() => {
    if (formData.lugarExpedicionCedula && Object.keys(municipiosMap).length > 0 && !selectedDepto) {
      for (const [depto, munis] of Object.entries(municipiosMap)) {
        if (munis.includes(formData.lugarExpedicionCedula)) {
          setSelectedDepto(depto);
          break;
        }
      }
    }
  }, [formData.lugarExpedicionCedula, municipiosMap, selectedDepto]);

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

    // Nombre legible del cargo para enriquecer el payload de auditoría
    const cargoNombre = formData.cargoId
      ? cargos.find((c) => c.id === Number(formData.cargoId))?.nombre
      : undefined;

    try {
      if (isEdit && afiliadoId) {
        const updateDto = {
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
          estudiosRealizados: formData.estudiosRealizados || undefined,
          discapacitado: formData.discapacitado,
        };
        const payloadAudit: Record<string, unknown> = { ...updateDto };
        if (cargoNombre) payloadAudit.cargoId_nombre = cargoNombre;

        if (isAdmin) {
          await AfiliadosService.update(afiliadoId, updateDto);
          try {
            await SolicitudesService.registrarAccionAdmin({
              entidadAfectada: "AFILIADO",
              entidadId: String(afiliadoId),
              tipoAccion: "EDITAR",
              payloadDeseado: payloadAudit,
            });
          } catch {
            console.warn("No se pudo registrar la acción en auditoría");
          }
          await Swal.fire({ icon: "success", title: "Afiliado actualizado", text: "La información ha sido guardada correctamente.", confirmButtonColor: "#E4B400", timer: 2000, timerProgressBar: true });
        } else if (isOperador) {
          await SolicitudesService.crear({
            entidadAfectada: "AFILIADO",
            entidadId: String(afiliadoId),
            tipoAccion: "EDITAR",
            payloadDeseado: payloadAudit,
          });
          await Swal.fire({ icon: "success", title: "Propuesta enviada", text: "Su solicitud de edición ha sido enviada para revisión del administrador.", confirmButtonColor: "#E4B400" });
        }
      } else {
        const createDto = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          cedula: formData.cedula || undefined,
          lugarExpedicionCedula: formData.lugarExpedicionCedula || undefined,
          correo: formData.correo || undefined,
          telefono: formData.telefono || undefined,
          cargoId: formData.cargoId ? Number(formData.cargoId) : undefined,
          jacId,
          municipioId,
          genero: formData.genero || undefined,
          grupoEtnico: formData.grupoEtnico || undefined,
          fechaNacimiento: formData.fechaNacimiento || undefined,
          ocupacion: formData.ocupacion || undefined,
          estudiosRealizados: formData.estudiosRealizados || undefined,
          discapacitado: formData.discapacitado,
        } as CreateAfiliadoDto;
        const payloadAudit: Record<string, unknown> = { ...createDto };
        if (cargoNombre) payloadAudit.cargoId_nombre = cargoNombre;

        if (isAdmin) {
          await AfiliadosService.create(createDto);
          try {
            await SolicitudesService.registrarAccionAdmin({
              entidadAfectada: "AFILIADO",
              tipoAccion: "CREAR",
              payloadDeseado: payloadAudit,
            });
          } catch {
            console.warn("No se pudo registrar la acción en auditoría");
          }
          await Swal.fire({ icon: "success", title: "Afiliado registrado", text: "El nuevo afiliado ha sido creado exitosamente.", confirmButtonColor: "#E4B400", timer: 2000, timerProgressBar: true });
        } else if (isOperador) {
          await SolicitudesService.crear({
            entidadAfectada: "AFILIADO",
            tipoAccion: "CREAR",
            payloadDeseado: payloadAudit,
          });
          await Swal.fire({ icon: "success", title: "Propuesta enviada", text: "Su solicitud de creación ha sido enviada para revisión del administrador.", confirmButtonColor: "#E4B400" });
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      await Swal.fire({ icon: "error", title: "Error", text: err instanceof Error ? err.message : "No se pudo procesar la solicitud.", confirmButtonColor: "#E4B400" });
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Dpto. Expedición Cédula</label>
              <select 
                value={selectedDepto} 
                onChange={(e) => {
                  setSelectedDepto(e.target.value);
                  setFormData(prev => ({ ...prev, lugarExpedicionCedula: "" }));
                }}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                <option value="">Seleccionar...</option>
                {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Mpio. Expedición Cédula</label>
              <select 
                name="lugarExpedicionCedula" 
                value={formData.lugarExpedicionCedula} 
                onChange={handleChange}
                disabled={!selectedDepto}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 disabled:opacity-50"
              >
                <option value="">Seleccionar...</option>
                {selectedDepto && (municipiosMap[selectedDepto] || []).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
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
                <option value="Indigena">Indígena</option>
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
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Estudios Realizados</label>
              <select name="estudiosRealizados" value={formData.estudiosRealizados} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                <option value="">Seleccionar...</option>
                <option value="Ninguno">Ninguno</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
                <option value="Técnico">Técnico</option>
                <option value="Tecnólogo">Tecnólogo</option>
                <option value="Pregrado">Pregrado</option>
                <option value="Postgrado">Postgrado</option>
              </select>
            </div>
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
              {isOperador
                ? (isEdit ? "Proponer edición" : "Proponer creación")
                : (isEdit ? "Actualizar" : "Crear")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
