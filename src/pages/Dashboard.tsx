import {
  Building2, Users, ClipboardList, AlertTriangle,
  TrendingUp, FileBarChart2,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import KpiCard from "../components/ui/KpiCard";
import { useDashboard } from "../hooks/useDashboard";

const kpiIcons = [Building2, Users, ClipboardList, AlertTriangle];

function Dashboard() {
  const { kpis, actividadReciente, alertas, distribucionMunicipios } = useDashboard();
  const card = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Resumen general del sistema"
        description="Monitoree indicadores clave, actividad reciente y alertas organizativas"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpis.map((item, index) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            sub={item.sub}
            icon={kpiIcons[index]}
            iconBg={item.iconBg}
            iconColor={item.iconColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className={`xl:col-span-2 ${card} p-5`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Distribución por municipio</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Organizaciones registradas con mayor presencia</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#2563EB] dark:text-blue-400 font-medium">
              <TrendingUp size={14} /> Tendencia estable
            </div>
          </div>
          <div className="space-y-4">
            {distribucionMunicipios.map((item) => (
              <div key={item.municipio}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{item.municipio}</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.total}</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1B7F4B] rounded-full" style={{ width: `${(item.total / 34) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <FileBarChart2 size={16} className="text-[#2563EB] dark:text-blue-400" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Resumen documental</h2>
          </div>
          <div className="flex items-center justify-center py-6">
            <div className="relative w-40 h-40 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(#1B7F4B 0deg 220deg, #F59E0B 220deg 300deg, #EF4444 300deg 360deg)" }} />
              <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full z-10 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">128</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">Registros</p>
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Vigentes</span>
              <span className="font-semibold text-[#1B7F4B]">61%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Por vencer</span>
              <span className="font-semibold text-[#F59E0B]">22%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Vencidos</span>
              <span className="font-semibold text-red-500 dark:text-red-400">17%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className={`${card} p-5`}>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Actividad reciente</h2>
          <div className="space-y-4">
            {actividadReciente.map((item, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 last:pb-0">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${item.estado === "success" ? "bg-[#1B7F4B]" : item.estado === "warning" ? "bg-[#F59E0B]" : "bg-[#2563EB]"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.titulo}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.descripcion}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} p-5`}>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Alertas prioritarias</h2>
          <div className="space-y-4">
            {alertas.map((item, index) => (
              <div key={index} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.nombre}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{item.municipio}</p>
                  </div>
                  <Badge label={item.nivel} variant={item.nivel === "Alto" ? "red" : item.nivel === "Medio" ? "amber" : "green"} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
                  <AlertTriangle size={14} className="mt-0.5 text-[#F59E0B] shrink-0" />
                  <span>{item.motivo}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;