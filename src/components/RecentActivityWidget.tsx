import { useMemo } from "react";
import { Sparkles, Calendar, ArrowUpRight, Award } from "lucide-react";
import { JACS_MOCK } from "../data/mockData";

export default function RecentActivityWidget() {
  const recentJacs = useMemo(() => {
    // Tomamos las últimas 4 JACs añadidas al mock para simular actividad viva
    return JACS_MOCK.slice(-4).reverse();
  }, []);

  const relativeTimes = ["Hace 4 horas", "Ayer", "Hace 2 días", "Hace 5 días"];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition hover:shadow-md flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-[#2563EB] dark:text-blue-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Actividad Reciente
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Últimas organizaciones registradas en Cauca
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {recentJacs.map((jac, idx) => (
          <div key={jac.nombre} className="relative flex gap-3 pb-4 last:pb-0">
            {/* Línea conectora del timeline */}
            {idx !== 3 && (
              <span className="absolute top-6 left-[18px] bottom-0 w-0.5 bg-slate-100 dark:bg-gray-700" />
            )}

            {/* Icono/Burbuja de Estado */}
            <div className="relative shrink-0 w-9 h-9 rounded-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-750 flex items-center justify-center text-[#E4B400] dark:text-yellow-400">
              <Award size={15} />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {relativeTimes[idx] ?? "Hace unos días"}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E4B400] dark:text-yellow-400 uppercase tracking-wider bg-yellow-50 dark:bg-yellow-950/20 px-2 py-0.5 rounded border border-yellow-100 dark:border-yellow-900/30">
                  {jac.tipoZona}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">
                {jac.nombre}
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Municipio de {jac.municipio}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
