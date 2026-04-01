import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import Jac from "../pages/Jac";
import Asocomunales from "../pages/Asocomunales";
import Usuarios from "../pages/Usuarios";
import Reportes from "../pages/Reportes";
import Analiticas from "../pages/Analiticas";

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
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
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