import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  role?: string;
  children?: ReactNode;
}

function PageHeader({
  title,
  subtitle,
  description,
  role,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {title}
          </h1>
          {role && (
            <span className="bg-[#1B7F4B]/10 text-[#1B7F4B] text-sm font-medium px-2.5 py-1 rounded-full">
              Rol: {role}
            </span>
          )}
        </div>
        
        {subtitle && (
          <p className="text-base text-gray-600 dark:text-gray-500">
            {subtitle}
          </p>
        )}
        {description && (
          <p className="text-base text-gray-600 dark:text-gray-500 mt-0.5">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export default PageHeader;