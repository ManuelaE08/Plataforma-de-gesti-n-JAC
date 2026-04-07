import { Bell, Moon, Sun, Building2, Globe, Clock, Mail, FileText, RefreshCw } from "lucide-react";
import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import { useTema } from "../components/Layout";

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
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B7F4B]/50 ${
        enabled ? "bg-[#1B7F4B]" : "bg-gray-200"
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
    <div className="flex items-center justify-between gap-6 py-3">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
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

  // Notificaciones
  const [notifs, setNotifs] = useState({
    correo: true,
    nuevosRegistros: true,
    reportesAutomaticos: false,
    recordatorios: true,
  });

  const setNotif = (key: keyof typeof notifs) => (v: boolean) =>
    setNotifs((p) => ({ ...p, [key]: v }));

  return (
    <div>
      <PageHeader
        title="Configuración"
        subtitle="Administre las preferencias del sistema"
      />

      {/* Fila 1: Información institucional + Notificaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">

        {/* Información institucional — 3/5 */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 size={15} className="text-gray-400" />
            Información institucional
          </h2>
          <form onSubmit={handleGuardar} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Nombre de la institución
              </label>
              <input
                type="text"
                value={institucion.nombre}
                onChange={(e) =>
                  setInstitucion((p) => ({ ...p, nombre: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/40 focus:border-[#1B7F4B] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                NIT
              </label>
              <input
                type="text"
                value={institucion.nit}
                onChange={(e) =>
                  setInstitucion((p) => ({ ...p, nit: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/40 focus:border-[#1B7F4B] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={institucion.direccion}
                onChange={(e) =>
                  setInstitucion((p) => ({ ...p, direccion: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/40 focus:border-[#1B7F4B] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={institucion.telefono}
                onChange={(e) =>
                  setInstitucion((p) => ({ ...p, telefono: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/40 focus:border-[#1B7F4B] transition"
              />
            </div>
            <button
              type="submit"
              className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
                guardado
                  ? "bg-green-600"
                  : "bg-[#1B7F4B] hover:bg-[#166040]"
              }`}
            >
              {guardado ? "✓ Cambios guardados" : "Guardar cambios"}
            </button>
          </form>
        </div>

        {/* Notificaciones — 2/5 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Bell size={15} className="text-gray-400" />
            Notificaciones
          </h2>
          <div className="divide-y divide-gray-100">
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

      {/* Fila 2: Preferencias del sistema */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Globe size={15} className="text-gray-400" />
          Preferencias del sistema
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <Globe size={12} /> Idioma
            </label>
            <div className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 bg-gray-50">
              Español
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <Clock size={12} /> Zona horaria
            </label>
            <div className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 bg-gray-50">
              (GMT-5) Bogotá, Colombia
            </div>
          </div>
        </div>

        {/* Modo oscuro */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
              {tema === "oscuro" ? (
                <Moon size={15} className="text-gray-500" />
              ) : (
                <Sun size={15} className="text-yellow-500" />
              )}
              Modo oscuro
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
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