function PageHeader({ title, subtitle, description, role, children }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          {role && (
            <span className="bg-[#1B7F4B]/10 text-[#1B7F4B] text-xs font-semibold px-2.5 py-1 rounded-full">
              Rol: {role}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default PageHeader;