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
  GitPullRequest, Upload, UserCog, Settings,
  Bell, LogOut, CheckCircle, AlertCircle, Info, XCircle, X,
  Moon, Sun, Menu,
} from "lucide-react";
import logoGobernacion from "../assets/logo-secretariaGob.png";

interface LayoutProps { children: ReactNode; }

const iconMap: Record<string, React.ElementType> = {
  "/": LayoutDashboard, "/inicio": LayoutDashboard, "/jac": Building2, "/asocomunales": Users,
  "/analiticas": BarChart2, "/alertas": AlertTriangle,
  "/solicitudes": GitPullRequest, "/mis-solicitudes": GitPullRequest,
  "/migracion": Upload, "/usuarios": UserCog, "/configuracion": Settings,
};

const nivelIcon = {
  success: <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />,
  warning: <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />,
  error: <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />,
  info: <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />,
};

const nivelBg = {
  success: "bg-yellow-50 dark:bg-green-950/30",
  warning: "bg-amber-50 dark:bg-amber-950/30",
  error: "bg-red-50 dark:bg-red-950/30",
  info: "bg-blue-50 dark:bg-blue-950/30",
};

interface NavItemProps { path: string; name: string; onNavigate?: () => void; }

function NavItem({ path, name, onNavigate }: NavItemProps) {
  const location = useLocation();
  const Icon = iconMap[path] || LayoutDashboard;
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group ${isActive ? "bg-white/20 dark:bg-gray-800 text-white" : "text-white/90 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800 hover:text-white dark:hover:text-white"
        }`}
    >
      <Icon size={18} className={isActive ? "text-white shrink-0" : "text-white/80 dark:text-gray-400 group-hover:text-white dark:group-hover:text-white shrink-0"} />
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
  const activeRole = user?.rol ?? "usuario";
  const displayName = user?.nombre ?? "Invitado";
  const menu = menuByRole[activeRole];

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const mostrarBell = false//isLoggedIn && (activeRole === "admin" || activeRole === "operador");

  return (

    <div className="flex h-screen overflow-hidden bg-[#F5F7FA] dark:bg-gray-900 transition-colors duration-300">
      {/* Fondo oscuro detrás del drawer en móvil (<992px) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 min-[992px]:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#E4B400] dark:bg-gray-900 dark:border-r dark:border-gray-800 text-white overflow-y-auto transition-all duration-300 shrink-0 min-[992px]:static min-[992px]:z-auto min-[992px]:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-base font-extrabold leading-tight">Plataforma de Gestión JAC</p>
            <p className="text-xs font-medium text-white/80 mt-0.5">Gobernación del Cauca</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="min-[992px]:hidden shrink-0 p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
          {menu.map((item) => <NavItem key={item.path} path={item.path} name={item.name} onNavigate={() => setSidebarOpen(false)} />)}
        </nav>
        <div className="px-2 py-3 border-t border-white/10">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shrink-0">
                  {roleInitials[activeRole]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{displayName}</p>
                  <p className="text-xs font-medium text-white/80 truncate capitalize">{roleLabels[activeRole]}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-all"
              >
                <LogOut size={16} /><span>Cerrar sesión</span>
              </button>
            </>
          ) : (
            <p className="px-3 py-2 text-xs font-medium text-white/90">No has iniciado sesión</p>
          )}
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 gap-4 transition-colors duration-300">
          <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="min-[992px]:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
          </div>
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
                            <button onClick={marcarTodasLeidas} className="text-[10px] text-[#E4B400] dark:text-yellow-500 hover:underline font-medium">
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
                              className={`group px-4 py-3 flex gap-2.5 transition-colors ${esLeida ? "bg-white dark:bg-gray-800" : nivelBg[n.nivel]
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
                          className="text-xs font-medium text-[#E4B400] dark:text-yellow-500 hover:underline"
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
                <div className="w-8 h-8 rounded-full bg-[#E4B400]/10 dark:bg-yellow-500/10 flex items-center justify-center text-xs font-bold text-[#E4B400] dark:text-yellow-500">
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
                className="rounded-lg bg-[#E4B400] dark:bg-yellow-600 px-4 py-2 text-xs font-medium text-white hover:bg-[#cfa200] dark:hover:bg-yellow-500 transition-colors"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-[#F5F7FA] dark:bg-gray-900 transition-colors duration-300">
          {children}
        </main>
        <footer className="relative bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="flex items-center gap-4 pr-4 sm:pr-6">
            {/* Línea horizontal bicolor institucional */}
            <div className="flex h-2.5 flex-1">
              <div className="h-full w-[60%] bg-[#1B7F4B]" />
              <div className="h-full w-[40%] bg-[#E4B400]" />
            </div>

            {/* Logo al final de la línea */}
            <div className="shrink-0 pt-2">
              <img
                src={logoGobernacion}
                alt="Gobernación del Cauca"
                className="h-14 w-auto shrink-0 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
              />
            </div>
          </div>

          {/* Contenido del footer */}
          <div className="mx-auto max-w-7xl px-4 pt-6 pb-10 sm:px-6">
            <div className="flex flex-col gap-2 text-base text-[#1A1A1A] dark:text-white sm:flex-row sm:items-center sm:gap-6">
              <p className="font-medium">Plataforma de Gestión JAC y Asocomunales</p>
              <p className="font-bold text-[#E4B400] dark:text-white">Gobernación del Cauca © 2026</p>
            </div>

            {/* Créditos del equipo de desarrollo (Estilo Neutro / Gris y Extendido) */}
            <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
              {/* Encabezado de Créditos */}
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2 mb-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5F6368] dark:text-gray-400">
                  Desarrollo Académico
                </p>
                <span className="hidden text-gray-400 dark:text-gray-600 sm:inline">•</span>
                <p className="text-xs font-medium text-[#5F6368] dark:text-gray-400">
                  Ingeniería de Sistemas — Universidad del Cauca
                </p>
              </div>

              {/* Distribución en Grid: Ocupa todo el ancho horizontal */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 text-xs text-[#1A1A1A]/80 sm:text-sm">
                {[
                  { name: "Everson Leandro Restrepo Gaviria", email: "eversonrestrepo@unicauca.edu.co" },
                  { name: "Juan David Vela Coronado", email: "juanvela@unicauca.edu.co" },
                  { name: "Duvan Felipe Armero Cuaran", email: "duvanfeli@unicauca.edu.co" },
                  { name: "Karold Dirley Delgado Arciniegas", email: "karolddelgado@unicauca.edu.co" },
                  { name: "Manuela Meneses Erazo", email: "manmeneses@unicauca.edu.co" },
                ].map((dev) => (
                  <div key={dev.email} className="flex flex-col">
                    {/* Enlace Mailto interactivo */}
                    <a
                      href={`mailto:${dev.email}`}
                      title={`Enviar correo a ${dev.name}`}
                      className="group flex flex-col items-start gap-y-0.5"
                    >
                      {/* Nombre */}
                      <span className="font-medium group-hover:text-black dark:group-hover:text-white transition-colors duration-200 leading-tight dark:text-gray-300">
                        {dev.name}
                      </span>
                      {/* Correo secundario */}
                      <span className="text-[11px] font-normal lowercase text-[#5F6368] dark:text-gray-400 transition-colors duration-200 group-hover:text-gray-900 dark:group-hover:text-gray-200 sm:text-xs break-all">
                        {dev.email}
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>

    </div>

  );
}

export default Layout;