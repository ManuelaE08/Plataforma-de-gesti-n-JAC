function KpiCard({ label, value, sub, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-1">{label}</p>
        <p className="text-3xl font-bold tabular-nums text-gray-800">{value}</p>
        <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
      </div>
      <div className={`${iconBg} p-2.5 rounded-lg shrink-0 ml-4`}>
        <Icon size={22} className={iconColor} />
      </div>
    </div>
  );
}

export default KpiCard;