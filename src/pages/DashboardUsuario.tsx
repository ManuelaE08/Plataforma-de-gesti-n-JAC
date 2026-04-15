import { useState } from "react";
import { Building2, CalendarDays, CircleCheck, MapPin } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import KpiCard from "../components/ui/KpiCard";
import PageHeader from "../components/ui/PageHeader";
import { useGoogleAuthHandlers } from "../hooks/useGoogleAuthHandlers";

const kpis = [
  {
    id: "jac-asignadas",
    label: "Mis JAC asignadas",
    value: "12",
    sub: "2 pendientes de actualización",
    icon: Building2,
    iconBg: "bg-[#1B7F4B]/10 dark:bg-[#1B7F4B]/20",
    iconColor: "text-[#1B7F4B]",
  },
  {
    id: "tramites-curso",
    label: "Trámites en curso",
    value: "4",
    sub: "1 requiere tu revisión hoy",
    icon: CircleCheck,
    iconBg: "bg-[#2563EB]/10 dark:bg-[#2563EB]/20",
    iconColor: "text-[#2563EB] dark:text-blue-400",
  },
  {
    id: "municipios-activos",
    label: "Municipios activos",
    value: "3",
    sub: "Cobertura de tu zona",
    icon: MapPin,
    iconBg: "bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20",
    iconColor: "text-[#F59E0B] dark:text-amber-400",
  },
];

const upcoming = [
  { id: "actividad-1", title: "Renovación documental JAC El Progreso",      date: "02 Abr 2026" },
  { id: "actividad-2", title: "Validación de acta Asocomunal Centro",        date: "04 Abr 2026" },
  { id: "actividad-3", title: "Actualización de afiliados JAC La Esperanza", date: "07 Abr 2026" },
];

function DashboardUsuario() {
  const [authMessage, setAuthMessage] = useState<string>("");
  const { handleGoogleSuccess, handleGoogleError } = useGoogleAuthHandlers({
    onFailure: setAuthMessage,
    navigateTo: "/",
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen de tus juntas, trámites y próximos vencimientos"
      >
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          shape="rectangular"
          theme="outline"
          text="signin_with"
        />
      </PageHeader>

      {authMessage && (
        <div className="mb-4 rounded-lg border border-[#1B7F4B]/20 dark:border-[#1B7F4B]/30 bg-[#1B7F4B]/5 dark:bg-[#1B7F4B]/10 px-4 py-3 text-sm text-[#1B7F4B]">
          {authMessage}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-6">
        {kpis.map(({ id, ...kpi }) => (
          <KpiCard key={id} {...kpi} />
        ))}
      </div>

      {/* Próximas actividades */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-100">
            Próximas actividades
          </h3>
          <div className="space-y-3">
            {upcoming.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2"
              >
                <p className="text-sm text-gray-700 dark:text-gray-200">{item.title}</p>
                <span className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-300 shrink-0 ml-3">
                  <CalendarDays size={12} />
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardUsuario;