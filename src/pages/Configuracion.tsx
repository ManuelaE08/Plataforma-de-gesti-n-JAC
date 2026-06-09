import { Bell, Moon, Sun, Building2, Globe, Clock, Lock } from "lucide-react";
import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import { useTema } from "../context/TemaContext";

function Toggle({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] ${
        enabled ? "bg-[#1B7F4B]" : "bg-gray-200 dark:bg-gray-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function NotifRow({
  label,
  desc,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <p className="text-base font-semibold text-gray-800 dark:text-gray-100">{label}</p>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
      </div>
      <Toggle enabled={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}

/** Etiqueta reutilizable para marcar una sección como deshabilitada / próximamente. */
function BadgeProximamente() {
  return (
    <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700/60 px-2.5 py-1 rounded-full">
      <Lock size={12} />
      No disponible
    </span>
  );
}

function Configuracion() {
  const { tema, toggleTema } = useTema();

  // Valores informativos solo de lectura: la edición está deshabilitada por ahora.
  const institucion = {
    nombre: "Gobernación del Cauca",
    nit: "891500126-1",
    direccion: "Carrera 7 No. 4-36, Popayán, Cauca",
    telefono: "(602) 8209900",
  };

  // Estado visual de los toggles (deshabilitados); se mantienen como referencia.
  const notifs = {
    correo: true,
    nuevosRegistros: true,
    reportesAutomaticos: false,
    recordatorios: true,
  };

  // No-op: las notificaciones están deshabilitadas.
  const setNotif = (_key: keyof typeof notifs) => (_v: boolean) => {};

  const inputCls = "w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-base text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all";
  const disabledContainerCls = "w-full rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 text-base text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 opacity-90";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        subtitle="Administre las preferencias del sistema"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Columna de Información Institucional — deshabilitada */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
            <Building2 size={20} className="text-gray-400" />
            Información institucional
            <BadgeProximamente />
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Esta sección estará disponible próximamente. La edición se encuentra deshabilitada por el momento.
          </p>

          <fieldset disabled className="flex flex-col gap-5 opacity-60 select-none" aria-disabled="true">
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Nombre de la institución
              </label>
              <input
                type="text"
                value={institucion.nombre}
                readOnly
                className={`${inputCls} cursor-not-allowed`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                NIT
              </label>
              <input
                type="text"
                value={institucion.nit}
                readOnly
                className={`${inputCls} cursor-not-allowed`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={institucion.direccion}
                readOnly
                className={`${inputCls} cursor-not-allowed`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Teléfono
              </label>
              <input
                type="text"
                value={institucion.telefono}
                readOnly
                className={`${inputCls} cursor-not-allowed`}
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-lg text-base font-semibold text-white bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
              >
                Guardar cambios
              </button>
            </div>
          </fieldset>
        </div>

        {/* Columna de Notificaciones — deshabilitada */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
            <Bell size={20} className="text-gray-400" />
            Notificaciones
            <BadgeProximamente />
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Esta sección estará disponible próximamente. La configuración se encuentra deshabilitada por el momento.
          </p>
          <div className="divide-y divide-gray-100 dark:divide-gray-700 opacity-60 select-none">
            <NotifRow
              label="Notificaciones por correo"
              desc="Recibir alertas en su correo electrónico"
              value={notifs.correo}
              onChange={setNotif("correo")}
              disabled
            />
            <NotifRow
              label="Alertas de nuevos registros"
              desc="Notificar cuando se creen nuevas JAC"
              value={notifs.nuevosRegistros}
              onChange={setNotif("nuevosRegistros")}
              disabled
            />
            <NotifRow
              label="Reportes automáticos"
              desc="Generar reportes mensuales automáticos"
              value={notifs.reportesAutomaticos}
              onChange={setNotif("reportesAutomaticos")}
              disabled
            />
            <NotifRow
              label="Recordatorios de actualización"
              desc="Recordar actualizar datos periódicamente"
              value={notifs.recordatorios}
              onChange={setNotif("recordatorios")}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Sección de Preferencias del Sistema */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Globe size={20} className="text-gray-400" />
          Preferencias del sistema
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
              <Globe size={14} /> Idioma
            </label>
            <div className={disabledContainerCls}>
              Español
            </div>
          </div>
          <div>
            <label className="flex text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
              <Clock size={14} /> Zona horaria
            </label>
            <div className={disabledContainerCls}>
              (GMT-5) Bogotá, Colombia
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              {tema === "oscuro" ? (
                <Moon size={20} className="text-gray-400" />
              ) : (
                <Sun size={20} className="text-yellow-500" />
              )}
              Modo oscuro
            </p>
            <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
              Cambiar la apariencia del sistema
            </p>
          </div>
          <Toggle enabled={tema === "oscuro"} onChange={() => toggleTema()} />
        </div>
      </div>
    </div>
  );
}

export default Configuracion;