interface KpiCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ label, value, sub, icon: Icon, iconBg, iconColor }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between">
      <div className="space-y-1.5">
        {/* Label de sección: se mantiene en text-sm font-semibold uppercase */}
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        
        {/* Valor numérico principal */}
        <p className="text-3xl font-bold tabular-nums text-gray-800 dark:text-gray-100 tracking-tight">
          {value}
        </p>
        
        {/* Letra pequeña incrementada: subió de 'text-xs' a 'text-sm' para una lectura mucho más cómoda */}
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 pt-0.5">
          {sub}
        </p>
      </div>
      
      {/* Contenedor del Icono */}
      <div className={`${iconBg} p-2.5 rounded-lg shrink-0 ml-4 transition-colors duration-200`}>
        <Icon size={22} className={iconColor} />
      </div>
    </div>
  );
}

export default KpiCard;