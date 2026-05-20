import { Building2, ChevronDown, ChevronUp } from "lucide-react";
import type { Asocomunal } from "../data/mockData";
import { useState } from "react";

interface AsocomunalSectionProps {
  asocomunales: Asocomunal[];
}

function AsocomunalSection({ asocomunales }: AsocomunalSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6">
      <div className="mb-5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Asocomunales</p>
        <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Red de asociaciones municipales</p>
      </div>

      <div className="space-y-4">
        {asocomunales.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-850 transition-shadow duration-300 hover:shadow-md">
              <button
                type="button"
                onClick={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D1FAE5] dark:bg-emerald-950 text-[#166534] dark:text-emerald-400 shrink-0"><Building2 size={20} /></span>
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{item.nombre}</p>
                    <p className="text-base text-slate-500 dark:text-slate-400">{item.municipio}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-gray-650 bg-white dark:bg-gray-700 px-2.5 py-1 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {item.jacsAfiliadas.length} JACs afiliadas
                  </span>
                  {isExpanded ? <ChevronUp size={18} className="text-slate-600 dark:text-slate-400" /> : <ChevronDown size={18} className="text-slate-600 dark:text-slate-400" />}
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900 px-5 py-4">
                  <p className="mb-3 text-base font-bold text-slate-800 dark:text-slate-200">JACs Afiliadas:</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {item.jacsAfiliadas.map((jacName) => (
                      <span key={jacName} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-gray-750 bg-slate-100 dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                        {jacName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AsocomunalSection;
