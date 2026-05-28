import { X, Mail, Phone, FileText, Badge as BadgeIcon, Briefcase, MapPin, Calendar, Activity, GraduationCap, Map } from "lucide-react";
import { useEffect, useState } from "react";
import { AfiliadosService, AfiliadoResponse } from "../services/afiliadosService";

interface ModalDetalleAfiliadoProps {
  isOpen: boolean;
  onClose: () => void;
  afiliadoId: number | null;
  rolVariant: Record<string, string>;
}

export function ModalDetalleAfiliado({
  isOpen,
  onClose,
  afiliadoId,
  rolVariant,
}: ModalDetalleAfiliadoProps) {
  const [afiliado, setAfiliado] = useState<AfiliadoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !afiliadoId) return;

    setLoading(true);
    setError(null);

    AfiliadosService.findOne(afiliadoId)
      .then(setAfiliado)
      .catch((err) => setError("Error al cargar los detalles: " + err.message))
      .finally(() => setLoading(false));
  }, [isOpen, afiliadoId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Detalles del Afiliado
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">Cargando...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-4 m-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Content */}
        {afiliado && !loading && (
          <div className="p-5 space-y-4">
            {/* Nombre completo */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {afiliado.nombre} {afiliado.apellido}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Nombre completo registrado</p>
            </div>

            {/* Cargo / Rol */}
            {afiliado.rol && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase size={16} className="text-green-700 dark:text-green-400" />
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">
                    Cargo
                  </p>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {afiliado.rol}
                </p>
              </div>
            )}

            {/* Información de contacto */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Información de Contacto
              </h4>

              {afiliado.correo && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Mail size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Correo electrónico</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 break-all">
                      {afiliado.correo}
                    </p>
                  </div>
                </div>
              )}

              {afiliado.telefono && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Phone size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 tabular-nums">
                      {afiliado.telefono}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Información personal */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Información Personal
              </h4>

              {afiliado.cedula && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <FileText size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Número de cédula</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 tabular-nums">
                      {afiliado.cedula}
                    </p>
                  </div>
                </div>
              )}

              {afiliado.lugarExpedicionCedula && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <MapPin size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Lugar de expedición</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {afiliado.lugarExpedicionCedula}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Información personal adicional (solo si hay datos) */}
            {(afiliado.fechaNacimiento || afiliado.genero || afiliado.grupoEtnico || afiliado.ocupacion || afiliado.direccion || afiliado.estudiosRealizados || afiliado.discapacitado !== undefined && afiliado.discapacitado !== null) && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Información Adicional
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {afiliado.fechaNacimiento && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg col-span-2 sm:col-span-1">
                      <Calendar size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fecha Nacimiento</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{afiliado.fechaNacimiento.split('T')[0]}</p>
                      </div>
                    </div>
                  )}

                  {afiliado.genero && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg col-span-2 sm:col-span-1">
                      <BadgeIcon size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Género</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{afiliado.genero}</p>
                      </div>
                    </div>
                  )}

                  {afiliado.grupoEtnico && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg col-span-2 sm:col-span-1">
                      <BadgeIcon size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Grupo Étnico</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{afiliado.grupoEtnico}</p>
                      </div>
                    </div>
                  )}

                  {afiliado.ocupacion && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg col-span-2 sm:col-span-1">
                      <Briefcase size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ocupación</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{afiliado.ocupacion}</p>
                      </div>
                    </div>
                  )}

                  {afiliado.estudiosRealizados && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg col-span-2 sm:col-span-1">
                      <GraduationCap size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Estudios</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{afiliado.estudiosRealizados}</p>
                      </div>
                    </div>
                  )}

                  {(afiliado.discapacitado === true || afiliado.discapacitado === false) && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg col-span-2 sm:col-span-1">
                      <Activity size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Discapacidad</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{afiliado.discapacitado ? "Sí" : "No"}</p>
                      </div>
                    </div>
                  )}

                  {afiliado.direccion && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg col-span-2">
                      <Map size={16} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Dirección</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{afiliado.direccion}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ID */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">ID del afiliado</p>
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300">#{afiliado.id}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
