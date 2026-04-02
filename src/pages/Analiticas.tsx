import {
  BarChart3,
  TrendingUp,
  TriangleAlert,
  FileSpreadsheet,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import { useAnaliticas } from "../hooks/useAnaliticas";

function Analiticas() {
  const { filters, kpis, series, riesgos, setPeriodo, setMunicipio } =
    useAnaliticas();

  const toneMap = {
    green: {
      card: "bg-[#1B7F4B]/10",
      text: "text-[#1B7F4B]",
    },
    blue: {
      card: "bg-[#2563EB]/10",
      text: "text-[#2563EB]",
    },
    amber: {
      card: "bg-[#F59E0B]/10",
      text: "text-[#F59E0B]",
    },
    red: {
      card: "bg-red-100",
      text: "text-red-500",
    },
  };

  return (
    <div>
      <PageHeader
        title="Analíticas"
        subtitle="Indicadores y comportamiento del sistema"
        description="Consulte métricas clave, distribución territorial y niveles de riesgo"
      />

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Filtros de visualización
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={filters.periodo}
            onChange={(e) =>
              setPeriodo(e.target.value as "7 días" | "30 días" | "90 días")
            }
            className="appearance-none w-full bg-white border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
          >
            <option value="7 días">Últimos 7 días</option>
            <option value="30 días">Últimos 30 días</option>
            <option value="90 días">Últimos 90 días</option>
          </select>

          <select
            value={filters.municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            className="appearance-none w-full bg-white border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer"
          >
            <option value="">Todos los municipios</option>
            <option value="Popayán">Popayán</option>
            <option value="Santander">Santander</option>
            <option value="Patía">Patía</option>
            <option value="Timbío">Timbío</option>
            <option value="Piendamó">Piendamó</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpis.map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                toneMap[item.tone].card
              }`}
            >
              {item.tone === "green" && (
                <TrendingUp size={18} className={toneMap[item.tone].text} />
              )}
              {item.tone === "blue" && (
                <FileSpreadsheet size={18} className={toneMap[item.tone].text} />
              )}
              {item.tone === "amber" && (
                <BarChart3 size={18} className={toneMap[item.tone].text} />
              )}
              {item.tone === "red" && (
                <TriangleAlert size={18} className={toneMap[item.tone].text} />
              )}
            </div>

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {item.label}
            </p>
            <p className="text-3xl font-bold text-gray-800 tabular-nums">
              {item.value}
            </p>
            <p className="text-xs text-gray-400 mt-1">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="xl:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-gray-800">
              Distribución territorial
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Comparativo entre JAC y Asocomunales por municipio
            </p>
          </div>

          <div className="space-y-4">
            {series.map((item) => {
              const max = 34;
              return (
                <div key={item.municipio}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {item.municipio}
                    </span>
                    <span className="text-xs text-gray-400">
                      {item.jac + item.asocomunales} organizaciones
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">JAC</span>
                        <span className="text-xs font-medium text-gray-700">
                          {item.jac}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1B7F4B] rounded-full"
                          style={{ width: `${(item.jac / max) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Asocomunales</span>
                        <span className="text-xs font-medium text-gray-700">
                          {item.asocomunales}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2563EB] rounded-full"
                          style={{ width: `${(item.asocomunales / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">
            Estado documental
          </h2>

          <div className="flex items-center justify-center py-4">
            <div
              className="w-40 h-40 rounded-full"
              style={{
                background:
                  "conic-gradient(#1B7F4B 0deg 220deg, #F59E0B 220deg 300deg, #EF4444 300deg 360deg)",
              }}
            >
              <div className="w-full h-full p-5">
                <div className="bg-white rounded-full w-full h-full flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-gray-800">100%</p>
                  <p className="text-[11px] text-gray-400">Monitoreado</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Vigente</span>
              <span className="font-semibold text-[#1B7F4B]">61%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Por vencer</span>
              <span className="font-semibold text-[#F59E0B]">22%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Vencido</span>
              <span className="font-semibold text-red-500">17%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Riesgo organizativo
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Entidades priorizadas para seguimiento
          </p>
        </div>

        <div className="space-y-4">
          {riesgos.map((item, index) => (
            <div
              key={index}
              className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.nombre}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.municipio}</p>
                  <p className="text-sm text-gray-500 mt-2">{item.causa}</p>
                </div>

                <Badge
                  label={item.nivel}
                  variant={
                    item.nivel === "Alto"
                      ? "red"
                      : item.nivel === "Medio"
                      ? "amber"
                      : "green"
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Analiticas;