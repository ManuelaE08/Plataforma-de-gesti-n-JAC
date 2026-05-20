interface BarChartItem {
  municipio: string;
  count: number;
}

interface BarChartProps {
  items: BarChartItem[];
}

function BarChart({ items }: BarChartProps) {
  const maxCount = items.length > 0 ? Math.max(...items.map((item) => item.count)) : 1;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Top {items.length} Municipios</p>
          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Más JACs afiliadas</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const progress = Math.max((item.count / maxCount) * 100, 6);

          return (
            <div
              key={item.municipio}
              className="w-full rounded-2xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/40 px-4 py-4"
            >
              <div className="flex items-center justify-between gap-2 text-base font-bold text-slate-900 dark:text-white">
                <span>{item.municipio}</span>
                <span className="rounded-full bg-slate-900/5 dark:bg-white/10 px-3 py-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{item.count}</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-[#1B7F4B] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type { BarChartItem };
export default BarChart;
