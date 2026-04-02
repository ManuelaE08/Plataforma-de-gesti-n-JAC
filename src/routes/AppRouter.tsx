import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import DashboardUsuario from "../pages/DashboardUsuario";
import Jac from "../pages/Jac";
import Asocomunales from "../pages/Asocomunales";
import Usuarios from "../pages/Usuarios";
import Reportes from "../pages/Reportes";
import Analiticas from "../pages/Analiticas";
import { AlignVerticalSpaceBetween } from "lucide-react";
import Alertas from "../pages/Alertas";
import Solicitudes from "../pages/Solicitudes";
import JacDetalle from "../pages/JacDetalle";

import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";



function RootDashboard() {
  const { user } = useAuth();
  return user?.rol === "usuario" || user === null ? <DashboardUsuario /> : <Dashboard />;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
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
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout><RootDashboard /></Layout>} />
      <Route path="/jac" element={<Layout><Jac /></Layout>} />
      <Route path="/jac/:id" element={<Layout><JacDetalle /></Layout>} />
      <Route path="/asocomunales" element={<Layout><Asocomunales /></Layout>} />
      <Route path="/usuarios" element={<ProtectedLayout><Usuarios /></ProtectedLayout>} />
      <Route path="/reportes" element={<ProtectedLayout><Reportes /></ProtectedLayout>} />
      <Route path="/analiticas" element={<ProtectedLayout><Analiticas /></ProtectedLayout>} />
      <Route path="/alertas" element={<ProtectedLayout><Alertas /></ProtectedLayout>} />
      <Route path="/solicitudes" element={<ProtectedLayout><Solicitudes /></ProtectedLayout>} />
      <Route path="/migracion" element={<ProtectedLayout><ComingSoon title="Migración de Datos" /></ProtectedLayout>} />
      <Route path="/configuracion" element={<ProtectedLayout><ComingSoon title="Configuración" /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default AppRouter;