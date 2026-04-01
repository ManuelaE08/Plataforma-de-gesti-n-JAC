import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import DashboardUsuario from "../pages/DashboardUsuario";
import Jac from "../pages/Jac";
import Asocomunales from "../pages/Asocomunales";
import Usuarios from "../pages/Usuarios";
import Reportes from "../pages/Reportes";
import Analiticas from "../pages/Analiticas";



/**
 * Obtiene el rol del usuario actual desde ,POR AHORA , el almacenamiento local (OJO).
 * * @description
 * La función verifica si el entorno de ejecución es el navegador. 
 * Si no hay acceso al `window` o el rol guardado no es válido, 
 * retorna "usuario" por defecto.
 * * @returns {"usuario" | "operador" | "admin"} El rol almacenado o el rol predeterminado.
 */
function getCurrentRole() {
  if (typeof window === "undefined") {
    return "usuario"; // Valor predeterminado para entornos sin acceso a window
  }

  const savedRole = window.localStorage.getItem("role");
  return savedRole && ["usuario", "operador", "admin"].includes(savedRole) ? savedRole : "usuario";
}

function RootDashboard() {
  const role = getCurrentRole();
  return role === "usuario" ? <DashboardUsuario /> : <Dashboard />;
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
      <p className="text-4xl">🚧</p>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xs">Módulo en desarrollo</p>
    </div>
  );
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Layout><RootDashboard /></Layout>} />
      <Route path="/jac" element={<Layout><Jac /></Layout>} />
      <Route path="/asocomunales" element={<Layout><Asocomunales /></Layout>} />
      <Route path="/usuarios" element={<Layout><Usuarios /></Layout>} />
      <Route path="/reportes" element={<Layout><Reportes /></Layout>} />
      <Route path="/analiticas" element={<Layout><Analiticas /></Layout>} />
      <Route path="/alertas" element={<Layout><ComingSoon title="Alertas y Riesgo Organizativo" /></Layout>} />
      <Route path="/solicitudes" element={<Layout><ComingSoon title="Solicitudes Pendientes" /></Layout>} />
      <Route path="/migracion" element={<Layout><ComingSoon title="Migración de Datos" /></Layout>} />
      <Route path="/configuracion" element={<Layout><ComingSoon title="Configuración" /></Layout>} />
    </Routes>
  );
}

export default AppRouter;