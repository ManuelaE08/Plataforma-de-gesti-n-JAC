import { BarChart3, TrendingUp, TriangleAlert, FileSpreadsheet } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import KpiCard from "../components/ui/KpiCard";
import { useAnaliticas } from "../hooks/useAnaliticas";

function Analiticas() {
  const { filters, kpis, series, riesgos, setPeriodo, setMunicipio } = useAnaliticas();

  // Constantes globales de diseño institucional
  const card = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";
  
  const selectCls = "appearance-none w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-base text-gray-600 dark:text-gray-300 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%27svg%3E')] bg-[position:right_0.5rem_center] bg-[size:1.5em_1.5em] bg-no-repeat";

  const kpiIcons = { green: TrendingUp, blue: FileSpreadsheet, amber: BarChart3, red: TriangleAlert };
  const kpiIconBg = {
    green: "bg-[#1B7F4B]/10 dark:bg-[#1B7F4B]/20",
    blue:  "bg-[#2563EB]/10 dark:bg-[#2563EB]/20",
    amber: "bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20",
    red:   "bg-red-100 dark:bg-red-900/20",
  };
  const kpiIconColor = {
    green: "text-[#1B7F4B] dark:text-emerald-400",
    blue:  "text-[#2563EB] dark:text-blue-400",
    amber: "text-[#F59E0B] dark:text-amber-400",
    red:   "text-red-500 dark:text-red-400",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analíticas"
        subtitle="Indicadores y comportamiento del sistema"
        description="Consulte métricas clave, distribución territorial y niveles de riesgo"
      />

      {/* Contenedor de Filtros */}
      <div className={`${card} p-4`}>
        {/* Label de sección adaptado a 'text-sm font-semibold uppercase' */}
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Filtros de visualización
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select 
            value={filters.periodo} 
            onChange={(e) => setPeriodo(e.target.value as "7 días" | "30 días" | "90 días")} 
            className={selectCls}
          >
            <option value="7 días">Últimos 7 días</option>
            <option value="30 días">Últimos 30 días</option>
            <option value="90 días">Últimos 90 días</option>
          </select>
          <select 
            value={filters.municipio} 
            onChange={(e) => setMunicipio(e.target.value)} 
            className={selectCls}
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

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((item) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            sub={item.detail}
            icon={kpiIcons[item.tone]}
            iconBg={kpiIconBg[item.tone]}
            iconColor={kpiIconColor[item.tone]}
          />
        ))}
      </div>

      {/* Gráficos y Distribución */}
     <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Distribución Territorial */}
        <div className={`xl:col-span-2 ${card} p-5`}>
          <div className="mb-6">
            {/* Título principal escalado a text-lg */}
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Distribución territorial</h2>
            {/* Subtítulo escalado a text-base */}
            <p className="text-base text-gray-500 dark:text-gray-400 mt-1">Comparativo entre JAC y Asocomunales por municipio</p>
          </div>
          
          <div className="space-y-5">
            {series.map((item) => {
              const max = 34;
              return (
                <div key={item.municipio} className="p-1">
                  <div className="flex items-center justify-between mb-2.5">
                    {/* Nombre del municipio escalado a text-base con font-bold */}
                    <span className="text-base font-bold text-gray-700 dark:text-gray-200">{item.municipio}</span>
                    {/* Contador general escalado a text-base */}
                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">{item.jac + item.asocomunales} organizaciones</span>
                  </div>
                  
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        {/* Etiquetas y valores de barras escalados a text-base */}
                        <span className="text-base font-medium text-gray-500 dark:text-gray-400">JAC</span>
                        <span className="text-base font-semibold text-gray-700 dark:text-gray-200">{item.jac}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1B7F4B] rounded-full transition-all duration-500" style={{ width: `${(item.jac / max) * 100}%` }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        {/* Etiquetas y valores de barras escalados a text-base */}
                        <span className="text-base font-medium text-gray-500 dark:text-gray-400">Asocomunales</span>
                        <span className="text-base font-semibold text-gray-700 dark:text-gray-200">{item.asocomunales}</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${(item.asocomunales / max) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Estado Documental */}
        {/* Estado Documental */}
        <div className={`${card} p-5 flex flex-col justify-between`}>
          <div>
            <div className="mb-6">
              {/* Título principal escalado a text-lg */}
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Estado documental</h2>
              {/* Subtítulo escalado a text-base */}
              <p className="text-base text-gray-500 dark:text-gray-400 mt-1">Nivel general de cumplimiento</p>
            </div>
            
            <div className="flex items-center justify-center py-6">
              {/* Se incrementó levemente de w-40 h-40 a w-44 h-44 para dar espacio a la letra más grande */}
              <div className="w-44 h-44 rounded-full shadow-inner transition-all" style={{ background: "conic-gradient(#1B7F4B 0deg 220deg, #F59E0B 220deg 300deg, #EF4444 300deg 360deg)" }}>
                <div className="w-full h-full p-5">
                  <div className="bg-white dark:bg-gray-800 rounded-full w-full h-full flex flex-col items-center justify-center shadow-sm">
                    {/* Número central destacado */}
                    <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">100%</p>
                    {/* Letra pequeña de 'Monitoreado' incrementada a text-xs / font-bold */}
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">Monitoreado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listado de estados escalado con fuentes base generosas */}
          <div className="space-y-3 mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between text-base">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">Vigente</span>
              <span className="font-bold text-lg text-[#1B7F4B] dark:text-emerald-400">61%</span>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">Por vencer</span>
              <span className="font-bold text-lg text-[#F59E0B] dark:text-amber-400">22%</span>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">Vencido</span>
              <span className="font-bold text-lg text-red-500 dark:text-red-400">17%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Riesgo Organizativo */}
      {/* Riesgo organizativo */}
      <div className={`${card} p-5`}>
        <div className="mb-5">
          {/* Título principal escalado a text-lg */}
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Riesgo organizativo</h2>
          {/* Subtítulo escalado a text-base */}
          <p className="text-base text-gray-500 dark:text-gray-400 mt-1">Entidades priorizadas para seguimiento</p>
        </div>
        
        <div className="space-y-3">
          {riesgos.map((item, index) => {
            // Lógica interna para mapear las clases del punto brillante según el nivel de riesgo
            const getDotClass = (nivel: string) => {
              switch (nivel) {
                case "Alto":
                  return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
                case "Medio":
                  return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
                case "Bajo":
                default:
                  return "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]";
              }
            };

            return (
              <div key={index} className="border border-gray-100 dark:border-gray-700/70 rounded-xl p-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1.5">
                    {/* Nombre de la entidad escalado a text-base font-bold */}
                    <p className="text-base font-bold text-gray-800 dark:text-gray-100">{item.nombre}</p>
                    {/* Municipio escalado a text-sm para mantener jerarquía secundaria */}
                    <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{item.municipio}</p>
                    {/* Causa/Descripción escalada a text-base para una fácil lectura */}
                    <p className="text-base text-gray-600 dark:text-gray-300 pt-1">{item.causa}</p>
                  </div>
                  
                  {/* Nuevo Estilo sustituyendo el Badge: Punto brillante + Texto (text-base) */}
                  <div className="flex items-center gap-2 font-semibold text-base text-gray-700 dark:text-gray-200 self-start sm:self-center shrink-0">
                    <span className={`w-2.5 h-2.5 shrink-0 rounded-full ${getDotClass(item.nivel)}`} />
                    {item.nivel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Analiticas;