import { Building2, Users, MapPin, UserCheck, FileCheck, FileX } from "lucide-react";
import KpiCard from "../components/ui/KpiCard";
import PageHeader from "../components/ui/PageHeader";

const kpis = [
  { label: "TOTAL DE JAC", value: "1,245", sub: "+12% desde el mes pasado", icon: Building2, iconBg: "bg-[#1B7F4B]/10", iconColor: "text-[#1B7F4B]" },
  { label: "TOTAL DE ASOCOMUNALES", value: "42", sub: "+3 nuevas este mes", icon: Users, iconBg: "bg-[#2563EB]/10", iconColor: "text-[#2563EB]" },
  { label: "MUNICIPIOS", value: "42", sub: "Cobertura completa", icon: MapPin, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { label: "TOTAL DE AFILIADOS", value: "85,420", sub: "+6% este trimestre", icon: UserCheck, iconBg: "bg-[#F59E0B]/10", iconColor: "text-[#F59E0B]" },
  { label: "JAC CON DOCUMENTACIÓN VIGENTE", value: "1,089", sub: "87% del total", icon: FileCheck, iconBg: "bg-[#1B7F4B]/10", iconColor: "text-[#1B7F4B]" },
  { label: "JAC CON DOCUMENTACIÓN VENCIDA", value: "156", sub: "13% requieren actualización", icon: FileX, iconBg: "bg-red-100", iconColor: "text-red-500" },
];

const municipios = [
  { name: "Popayán", value: 210 }, { name: "Santander", value: 178 },
  { name: "Patía", value: 85 }, { name: "Timbío", value: 70 },
  { name: "Piendamó", value: 60 }, { name: "Bolívar", value: 55 },
  { name: "Miranda", value: 45 }, { name: "Cajibío", value: 40 },
];

function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" role="Administrador/Auditor" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Barras */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-5">JAC por Municipio</h3>
          <div className="flex items-end gap-3 h-40">
            {municipios.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500 tabular-nums">{m.value}</span>
                <div className="w-full bg-[#1B7F4B] rounded-t-sm" style={{ height: `${(m.value / 210) * 100}%` }} />
                <span className="text-[9px] text-gray-400 truncate w-full text-center">{m.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribución Rural vs Urbano</h3>
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <svg viewBox="0 0 120 120" width="140" height="140">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" strokeWidth="18" />
              <circle cx="60" cy="60" r="45" fill="none" stroke="#1B7F4B" strokeWidth="18" strokeDasharray="195.4 87.6" strokeDashoffset="70.7" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" r="45" fill="none" stroke="#2563EB" strokeWidth="18" strokeDasharray="87.6 195.4" strokeDashoffset="-124.7" transform="rotate(-90 60 60)" />
              <text x="60" y="56" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1B7F4B">Rural</text>
              <text x="60" y="70" textAnchor="middle" fontSize="10" fill="#6b7280">69%</text>
            </svg>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1B7F4B]" /><span className="text-xs text-gray-600">Rural: 69%</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#2563EB]" /><span className="text-xs text-gray-600">Urbano: 31%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribución geográfica de organizaciones</h3>
        <div className="bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center justify-center py-12 gap-3">
          <MapPin size={36} className="text-[#1B7F4B]" />
          <p className="text-sm font-medium text-gray-600">Mapa del Departamento del Cauca</p>
          <p className="text-xs text-[#2563EB]">Visualización de la distribución de JAC y Asocomunales por municipio</p>
          <div className="flex items-center gap-6 mt-3">
            {[{ color: "bg-[#2563EB]", label: "JAC Urbanas", n: "380" }, { color: "bg-[#1B7F4B]", label: "JAC Rurales", n: "865" }, { color: "bg-purple-500", label: "Asocomunales", n: "42" }].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-full ${s.color}`} /><span className="text-xs text-gray-500">{s.label}</span></div>
                <span className="text-sm font-bold text-gray-700 tabular-nums">{s.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;