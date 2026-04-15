import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ label, value, sub, icon: Icon, iconBg, iconColor }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between">
      <div>
        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-1">
          {label}
        </p>
        <p className="text-3xl font-bold tabular-nums text-gray-800 dark:text-gray-100">{value}</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
      </div>
      <div className={`${iconBg} p-2.5 rounded-lg shrink-0 ml-4`}>
        <Icon size={22} className={iconColor} />
      </div>
    </div>
  );
}

export default KpiCard;