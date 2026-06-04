import type { MenuByRole } from "../types/menu";

export const menuByRole: MenuByRole = {
  usuario: [
    { name: "Dashboard", path: "/inicio" },
    { name: "Juntas de Acción Comunal", path: "/jac" },
    { name: "Asocomunales", path: "/asocomunales" },
  ],
  operador: [
    { name: "Dashboard", path: "/inicio" },
    { name: "Juntas de Acción Comunal", path: "/jac" },
    { name: "Asocomunales", path: "/asocomunales" },
    { name: "Analítica y Estadísticas", path: "/analiticas" },
    { name: "Alertas y Riesgo Organizativo", path: "/alertas" },
    { name: "Reportes", path: "/reportes" },
    { name: "Mis Solicitudes", path: "/mis-solicitudes" },
    { name: "Configuración", path: "/configuracion" },
  ],
  admin: [
    { name: "Dashboard", path: "/inicio" },
    { name: "Juntas de Acción Comunal", path: "/jac" },
    { name: "Asocomunales", path: "/asocomunales" },
    { name: "Analítica y Estadísticas", path: "/analiticas" },
    { name: "Alertas y Riesgo Organizativo", path: "/alertas" },
    { name: "Reportes", path: "/reportes" },
    { name: "Solicitudes Pendientes", path: "/solicitudes" },
    { name: "Migración de Datos", path: "/migracion" },
    { name: "Administración de Usuarios", path: "/usuarios" },
    { name: "Configuración", path: "/configuracion" },
  ],
  superadmin: [
    { name: "Dashboard", path: "/inicio" },
    { name: "Juntas de Acción Comunal", path: "/jac" },
    { name: "Asocomunales", path: "/asocomunales" },
    { name: "Analítica y Estadísticas", path: "/analiticas" },
    { name: "Alertas y Riesgo Organizativo", path: "/alertas" },
    { name: "Reportes", path: "/reportes" },
    { name: "Solicitudes Pendientes", path: "/solicitudes" },
    { name: "Migración de Datos", path: "/migracion" },
    { name: "Administración de Usuarios", path: "/usuarios" },
    { name: "Configuración", path: "/configuracion" },
  ],
};