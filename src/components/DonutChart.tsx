import { useMemo } from "react";

interface DonutChartProps {
  urban: number;
  rural: number;
  total: number;
}

function DonutChart({ urban, rural, total }: DonutChartProps) {
  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const urbanValue = total > 0 ? urban : 0;
  const ruralValue = total > 0 ? rural : 0;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6 flex flex-col h-full justify-between">
      <div>
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Distribución Urbano / Rural
          </p>
          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            Origen de las JAC
          </p>
        </div>

        <div className="flex flex-col items-center justify-center my-6">
          <svg
            viewBox="0 0 240 240"
            className="h-[280px] w-[280px] sm:h-[320px] sm:w-[320px] lg:h-[350px] lg:w-[350px] transition-all"
          >
            <circle cx="120" cy="120" r="95" className="fill-slate-50/50 dark:fill-gray-900/50 transition-colors" />
            <circle cx="120" cy="120" r={radius} fill="none" stroke="#E5E7EB" className="stroke-slate-200 dark:stroke-gray-700 transition-colors" strokeWidth="26" />
            <circle cx="120" cy="120" r={radius} fill="none" stroke="#34D399" strokeWidth="26"
              strokeDasharray={`${(ruralValue / total) * circumference} ${circumference}`}
              strokeDashoffset={0} strokeLinecap="round" transform="rotate(-90 120 120)" />
            <circle cx="120" cy="120" r={radius} fill="none" stroke="#1B7F4B" strokeWidth="26"
              strokeDasharray={`${(urbanValue / total) * circumference} ${circumference}`}
              strokeDashoffset={-((ruralValue / total) * circumference)}
              strokeLinecap="round" transform="rotate(-90 120 120)" />
            <circle cx="120" cy="120" r="69" className="fill-white dark:fill-gray-800 transition-colors" />
            <text x="120" y="116" textAnchor="middle" className="text-[34px] font-extrabold fill-slate-900 dark:fill-white transition-colors" dominantBaseline="middle">
              {total}
            </text>
            <text x="120" y="146" textAnchor="middle" className="text-xs font-bold fill-slate-500 dark:fill-slate-400 tracking-wider uppercase transition-colors" dominantBaseline="middle">
              Total JACs activas
            </text>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* Urbanas */}
        <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B7F4B] text-white">
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white">Urbanas</p>
          </div>

          <div className="mt-4 flex items-end gap-2">
            <span className="text-4xl font-extrabold leading-none text-[#1B7F4B]">
              {urbanValue}
            </span>
            <span className="mb-0.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
              JACs
            </span>
          </div>

          <div className="mt-4 border-t border-slate-200 dark:border-gray-700 pt-3">
            <div className="inline-flex items-center rounded-xl bg-[#1B7F4B]/10 px-3 py-1.5">
              <span className="text-2xl font-extrabold text-[#1B7F4B]">
                {total > 0 ? Math.round((urbanValue / total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Rurales */}
        <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#34D399] text-white">
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white">Rurales</p>
          </div>

          <div className="mt-4 flex items-end gap-2">
            <span className="text-4xl font-extrabold leading-none text-[#34D399]">
              {ruralValue}
            </span>
            <span className="mb-0.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
              JACs
            </span>
          </div>

          <div className="mt-4 border-t border-slate-200 dark:border-gray-700 pt-3">
            <div className="inline-flex items-center rounded-xl bg-[#34D399]/10 px-3 py-1.5">
              <span className="text-2xl font-extrabold text-[#34D399]">
                {total > 0 ? Math.round((ruralValue / total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonutChart;