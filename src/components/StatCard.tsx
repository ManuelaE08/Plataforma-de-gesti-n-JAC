import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  accentClass?: string;
}

function StatCard({ title, value,icon: Icon, accentClass }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-transform duration-300 hover:scale-[1.02] ${accentClass ?? ""}`}>
      <div className="relative p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{title}</p>
            <p className="mt-4 text-4xl font-bold text-slate-900 dark:text-white">{value}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 shadow-sm">
            <Icon size={26} className="text-[#1B7F4B] dark:text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
