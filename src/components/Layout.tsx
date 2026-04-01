import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { menuByRole } from "../config/menu";
import { currentUser, roleInitials, roleLabels } from "../config/currentUser";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart2,
  AlertTriangle,
  FileText,
  GitPullRequest,
  Upload,
  UserCog,
  Settings,
  ChevronRight,
  Bell,
  Search,
  LogOut,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const iconMap: Record<string, React.ElementType> = {
  "/": LayoutDashboard,
  "/jac": Building2,
  "/asocomunales": Users,
  "/analiticas": BarChart2,
  "/alertas": AlertTriangle,
  "/reportes": FileText,
  "/solicitudes": GitPullRequest,
  "/migracion": Upload,
  "/usuarios": UserCog,
  "/configuracion": Settings,
};

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/jac": "Juntas de Acción Comunal",
  "/asocomunales": "Asocomunales",
  "/analiticas": "Analítica y Estadísticas",
  "/alertas": "Alertas y Riesgo Organizativo",
  "/reportes": "Reportes",
  "/solicitudes": "Solicitudes Pendientes",
  "/migracion": "Migración de Datos",
  "/usuarios": "Administración de Usuarios",
  "/configuracion": "Configuración",
};
interface NavItemProps {
  path: string;
  name: string;
}

function NavItem({ path, name }: NavItemProps) {
  const location = useLocation();
  const Icon = iconMap[path] || LayoutDashboard;
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group ${
        isActive
          ? "bg-white/20 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon
        size={16}
        className={
          isActive
            ? "text-white shrink-0"
            : "text-white/60 group-hover:text-white shrink-0"
        }
      />
      <span className="leading-tight">{name}</span>
    </Link>
  );
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const menu = menuByRole[currentUser.rol];
  const currentPage = pageNames[location.pathname] || "Página";

  return (
    <div className="flex h-screen bg-neutral overflow-hidden">
      <aside className="w-64 flex flex-col bg-[#1B7F4B] text-white shrink-0 overflow-y-auto">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="text-sm font-bold leading-tight">
            Plataforma de Gestión JAC
          </p>
          <p className="text-[11px] text-white/60 mt-0.5">
            Gobernación del Cauca
          </p>
        </div>

        <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
          {menu.map((item) => (
            <NavItem key={item.path} path={item.path} name={item.name} />
          ))}
        </nav>

        <div className="px-2 py-3 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
              {roleInitials[currentUser.rol]}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-white truncate">
                {currentUser.nombre}
              </p>
              <p className="text-[10px] text-white/50 truncate capitalize">
                {roleLabels[currentUser.rol]}
              </p>
            </div>
          </div>

          <button
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[12px] text-white/60 hover:bg-white/10 hover:text-white transition-all"
            disabled
          >
            <LogOut size={14} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
            <span className="text-gray-400 shrink-0">Inicio</span>
            <ChevronRight size={13} className="shrink-0" />
            <span className="text-[#1B7F4B] font-medium truncate">
              {currentPage}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-64">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar organizaciones, municipios..."
                className="bg-transparent text-xs text-gray-600 placeholder:text-gray-400 outline-none w-full"
              />
            </div>

            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
              <Bell size={17} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border border-white" />
            </button>

            <div className="flex items-center gap-2 border-l border-gray-100 pl-3">
              <div className="w-8 h-8 rounded-full bg-[#1B7F4B]/10 flex items-center justify-center text-xs font-bold text-[#1B7F4B]">
                {roleInitials[currentUser.rol]}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-gray-700 leading-tight">
                  {currentUser.nombre}
                </p>
                <p className="text-[10px] text-gray-400 leading-tight capitalize">
                  {roleLabels[currentUser.rol]}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-[#F5F7FA]">
          {children}
        </main>
      </div>
    </div>
  );
}


export default Layout;