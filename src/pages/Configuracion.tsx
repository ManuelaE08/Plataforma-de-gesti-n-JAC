import { Bell, Moon, Sun, Building2, Globe, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import { useTema } from "../context/TemaContext";

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] ${
        enabled ? "bg-[#1B7F4B]" : "bg-gray-200 dark:bg-gray-600"
      }`}
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
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <p className="text-base font-semibold text-gray-800 dark:text-gray-100">{label}</p>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
      </div>
      <Toggle enabled={value} onChange={onChange} />
    </div>
  );
}

function Configuracion() {
  const { tema, toggleTema } = useTema();

  const [institucion, setInstitucion] = useState({
    nombre: "Gobernación del Cauca",
    nit: "891500126-1",
    direccion: "Carrera 7 No. 4-36, Popayán, Cauca",
    telefono: "(602) 8209900",
  });
  const [guardado, setGuardado] = useState(false);

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  const [notifs, setNotifs] = useState({
    correo: true,
    nuevosRegistros: true,
    reportesAutomaticos: false,
    recordatorios: true,
  });

  const setNotif = (key: keyof typeof notifs) => (v: boolean) =>
    setNotifs((p) => ({ ...p, [key]: v }));

  const inputCls = "w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-base text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all";
  const disabledContainerCls = "w-full rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2 text-base text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 opacity-90";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        subtitle="Administre las preferencias del sistema"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Columna de Información Institucional */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Building2 size={20} className="text-gray-400" />
            Información institucional
          </h2>
          
          <form onSubmit={handleGuardar} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Nombre de la institución
              </label>
              <input
                type="text"
                value={institucion.nombre}
                onChange={(e) => setInstitucion((p) => ({ ...p, nombre: e.target.value }))}
                className={inputCls}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                NIT
              </label>
              <input
                type="text"
                value={institucion.nit}
                onChange={(e) => setInstitucion((p) => ({ ...p, nit: e.target.value }))}
                className={inputCls}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={institucion.direccion}
                onChange={(e) => setInstitucion((p) => ({ ...p, direccion: e.target.value }))}
                className={inputCls}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Teléfono
              </label>
              <input
                type="text"
                value={institucion.telefono}
                onChange={(e) => setInstitucion((p) => ({ ...p, telefono: e.target.value }))}
                className={inputCls}
              />
            </div>
            
            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                className={`w-full py-3 rounded-lg text-base font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] ${
                  guardado ? "bg-green-600" : "bg-[#1B7F4B] hover:bg-[#166340]"
                }`}
              >
                {guardado ? "✓ Cambios guardados" : "Guardar cambios"}
              </button>

              {/* Indicador de estado minimalista tipo LED solicitado */}
              {guardado && (
                <div className="flex items-center gap-2 font-semibold text-base justify-center pt-1">
                  <span className="w-2.5 h-2.5 shrink-0 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <span className="text-gray-700 dark:text-gray-200">Estado: Configuración actualizada</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Columna de Notificaciones */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Bell size={20} className="text-gray-400" />
            Notificaciones
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <NotifRow
              label="Notificaciones por correo"
              desc="Recibir alertas en su correo electrónico"
              value={notifs.correo}
              onChange={setNotif("correo")}
            />
            <NotifRow
              label="Alertas de nuevos registros"
              desc="Notificar cuando se creen nuevas JAC"
              value={notifs.nuevosRegistros}
              onChange={setNotif("nuevosRegistros")}
            />
            <NotifRow
              label="Reportes automáticos"
              desc="Generar reportes mensuales automáticos"
              value={notifs.reportesAutomaticos}
              onChange={setNotif("reportesAutomaticos")}
            />
            <NotifRow
              label="Recordatorios de actualización"
              desc="Recordar actualizar datos periódicamente"
              value={notifs.recordatorios}
              onChange={setNotif("recordatorios")}
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