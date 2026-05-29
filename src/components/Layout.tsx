import type { ReactNode } from "react";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { menuByRole } from "../config/menu";
import { roleInitials, roleLabels } from "../config/currentUser";
import { useAuth } from "../context/AuthContext";
import { useTema } from "../context/TemaContext";
import { useNotificaciones } from "../hooks/useNotificaciones";
import { useJac } from "../hooks/useJac";
import {
  LayoutDashboard, Building2, Users, BarChart2, AlertTriangle,
  FileText, GitPullRequest, Upload, UserCog, Settings,
  Bell, LogOut, CheckCircle, AlertCircle, Info, XCircle, X,
  Moon, Sun,
} from "lucide-react";

interface LayoutProps { children: ReactNode; }

const iconMap: Record<string, React.ElementType> = {
  "/": LayoutDashboard, "/jac": Building2, "/asocomunales": Users,
  "/analiticas": BarChart2, "/alertas": AlertTriangle, "/reportes": FileText,
  "/solicitudes": GitPullRequest, "/mis-solicitudes": GitPullRequest,
  "/migracion": Upload, "/usuarios": UserCog, "/configuracion": Settings,
};

const nivelIcon = {
  success: <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />,
  warning: <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />,
  error:   <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />,
  info:    <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />,
};

const nivelBg = {
  success: "bg-green-50 dark:bg-green-950/30",
  warning: "bg-amber-50 dark:bg-amber-950/30",
  error: "bg-red-50 dark:bg-red-950/30",
  info: "bg-blue-50 dark:bg-blue-950/30",
};

interface NavItemProps { path: string; name: string; }

function NavItem({ path, name }: NavItemProps) {
  const location = useLocation();
  const Icon = iconMap[path] || LayoutDashboard;
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group ${
        isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={16} className={isActive ? "text-white shrink-0" : "text-white/60 group-hover:text-white shrink-0"} />
      <span className="leading-tight">{name}</span>
    </Link>
  );
}

function ThemeToggle() {
  const { tema, toggleTema } = useTema();

  return (
    <button
      onClick={toggleTema}
      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-300"
      title={tema === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label={tema === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {tema === "oscuro" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  const isLoggedIn = Boolean(user);
  const activeRole  = user?.rol ?? "usuario";
  const displayName = user?.nombre ?? "Invitado";
  const menu = menuByRole[activeRole];

  const { jacData } = useJac();
  const { notifs } = useNotificaciones(activeRole, user?.id, jacData);

  const [leidas, setLeidas] = useState<Set<string>>(new Set());
  const [eliminadas, setEliminadas] = useState<Set<string>>(new Set());

  const visibles = notifs.filter((n) => !eliminadas.has(n.id));
  const sinLeer = visibles.filter((n) => !leidas.has(n.id)).length;

  const marcarLeida = (id: string) => setLeidas((p) => new Set([...p, id]));
  const eliminarNotif = (id: string) => {
    setEliminadas((p) => new Set([...p, id]));
    setLeidas((p) => new Set([...p, id]));
  };
  const marcarTodasLeidas = () => setLeidas(new Set(visibles.map((n) => n.id)));
  const eliminarTodas = () => setEliminadas(new Set(notifs.map((n) => n.id)));

  const [showNotif, setShowNotif] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); };
  const mostrarBell  = isLoggedIn && (activeRole === "admin" || activeRole === "operador");

  return (
    
      <div className="flex h-screen overflow-hidden bg-[#F5F7FA] dark:bg-gray-900">
        <aside className="w-64 flex flex-col bg-[#1B7F4B] text-white shrink-0 overflow-y-auto">
          <div className="px-5 py-5 border-b border-white/10">
            <p className="text-sm font-bold leading-tight">Plataforma de Gestión JAC</p>
            <p className="text-[11px] text-white/60 mt-0.5">Gobernación del Cauca</p>
          </div>
          <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
            {menu.map((item) => <NavItem key={item.path} path={item.path} name={item.name} />)}
          </nav>
          <div className="px-2 py-3 border-t border-white/10">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                    {roleInitials[activeRole]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-white truncate">{displayName}</p>
                    <p className="text-[10px] text-white/50 truncate capitalize">{roleLabels[activeRole]}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[12px] text-white/60 hover:bg-white/10 hover:text-white transition-all"
                >
                  <LogOut size={14} /><span>Cerrar sesión</span>
                </button>
              </>
            ) : (
              <p className="px-3 py-2 text-[11px] text-white/70">No has iniciado sesión</p>
            )}
          </div>
        </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0" />
          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />

            {mostrarBell && (
              <div className="relative" ref={bellRef}>
                <button
                  onClick={() => setShowNotif((v) => !v)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                  title="Notificaciones"
                >
                  <Bell size={17} />
                  {sinLeer > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border border-white dark:border-gray-800">
                      {sinLeer > 99 ? "99+" : sinLeer}
                    </span>
                  )}
                </button>

                {showNotif && (
                  <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                        Notificaciones
                        {sinLeer > 0 && (
                          <span className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {sinLeer} sin leer
                          </span>
                        )}
                      </p>
                      {visibles.length > 0 && (
                        <div className="flex items-center gap-3">
                          {sinLeer > 0 && (
                            <button onClick={marcarTodasLeidas} className="text-[10px] text-[#1B7F4B] hover:underline font-medium">
                              Marcar leídas
                            </button>
                          )}
                          <button onClick={eliminarTodas} className="text-[10px] text-gray-400 hover:text-red-500 hover:underline font-medium">
                            Eliminar todas
                          </button>
                        </div>
                      )}
                    </div>

                    {visibles.length === 0 ? (
                      <p className="text-sm text-gray-400 px-4 py-6 text-center">Sin notificaciones</p>
                    ) : (
                      <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
                        {visibles.map((n) => {
                          const esLeida = leidas.has(n.id);
                          return (
                            <li
                              key={n.id}
                              className={`group px-4 py-3 flex gap-2.5 transition-colors ${
                                esLeida ? "bg-white dark:bg-gray-800" : nivelBg[n.nivel]
                              } hover:brightness-95 cursor-pointer`}
                              onClick={() => marcarLeida(n.id)}
                            >
                              <div className="mt-0.5">{nivelIcon[n.nivel]}</div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-xs text-gray-800 dark:text-gray-200 leading-snug ${esLeida ? "font-normal opacity-70" : "font-semibold"}`}>
                                    {n.titulo}
                                  </p>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {!esLeida && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); eliminarNotif(n.id); }}
                                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-all"
                                      title="Eliminar notificación"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{n.descripcion}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{n.fecha}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {activeRole === "admin" && visibles.some((n) => n.tipo === "solicitud") && (
                      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <button
                          onClick={() => { navigate("/solicitudes"); setShowNotif(false); }}
                          className="text-xs font-medium text-[#1B7F4B] hover:underline"
                        >
                          Ver todas las solicitudes →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

              {isLoggedIn ? (
                <div className="flex items-center gap-2 border-l border-gray-100 dark:border-gray-700 pl-3">
                  <div className="w-8 h-8 rounded-full bg-[#1B7F4B]/10 flex items-center justify-center text-xs font-bold text-[#1B7F4B]">
                    {roleInitials[activeRole]}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200 leading-tight">{displayName}</p>
                    <p className="text-[10px] text-gray-400 leading-tight capitalize">{roleLabels[activeRole]}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="rounded-lg bg-[#1B7F4B] px-4 py-2 text-xs font-medium text-white hover:bg-[#166A3F] transition-colors"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          </header>

        <main className="flex-1 overflow-y-auto p-6 bg-[#F5F7FA] dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
    
  );
}

export default Layout;