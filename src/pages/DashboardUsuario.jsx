import { useState } from "react";
import { Building2, CalendarDays, CircleCheck, MapPin } from "lucide-react";
import KpiCard from "../components/ui/KpiCard";
import PageHeader from "../components/ui/PageHeader";

const kpis = [
  {
    label: "MIS JAC ASIGNADAS",
    value: "12",
    sub: "2 pendientes de actualización",
    icon: Building2,
    iconBg: "bg-[#1B7F4B]/10",
    iconColor: "text-[#1B7F4B]",
  },
  {
    label: "TRÁMITES EN CURSO",
    value: "4",
    sub: "1 requiere tu revisión hoy",
    icon: CircleCheck,
    iconBg: "bg-[#2563EB]/10",
    iconColor: "text-[#2563EB]",
  },
  {
    label: "MUNICIPIOS ACTIVOS",
    value: "3",
    sub: "Cobertura de tu zona",
    icon: MapPin,
    iconBg: "bg-[#F59E0B]/10",
    iconColor: "text-[#F59E0B]",
  },
];

const upcoming = [
  { title: "Renovación documental JAC El Progreso", date: "02 Abr 2026" },
  { title: "Validación de acta Asocomunal Centro", date: "04 Abr 2026" },
  { title: "Actualización de afiliados JAC La Esperanza", date: "07 Abr 2026" },
];

function DashboardUsuario() {
  const [authMessage, setAuthMessage] = useState("");

  const handleGoogleLogin = () => {
    const hasClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
    setAuthMessage(
      hasClientId
        ? "Client ID detectado. El siguiente paso es redirigir al flujo OAuth de tu backend."
        : "Aún no hay VITE_GOOGLE_CLIENT_ID configurado en variables de entorno."
    );
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        role="Usuario"
        subtitle="Resumen de tus juntas, trámites y próximos vencimientos"
      >
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-xs font-bold text-[#DB4437]">
            G
          </span>
          Iniciar sesión con Google
        </button>
      </PageHeader>

      {authMessage && (
        <div className="mb-4 rounded-lg border border-[#1B7F4B]/20 bg-[#1B7F4B]/5 px-4 py-3 text-sm text-[#1B7F4B]">
          {authMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        {kpis.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Próximas actividades</h3>
          <div className="space-y-3">
            {upcoming.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
              >
                <p className="text-sm text-gray-700">{item.title}</p>
                <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-500">
                  <CalendarDays size={12} />
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Accesos rápidos</h3>
          <div className="space-y-2 text-sm">
            <button className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors">
              Ver juntas asignadas
            </button>
            <button className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors">
              Actualizar documentación
            </button>
            <button className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors">
              Consultar asocomunales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardUsuario;
