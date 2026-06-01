import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import DashboardUsuario from "../pages/DashboardUsuario";
import Jac from "../pages/Jac";
import Asocomunales from "../modules/asocomunales/pages/Asocomunales";
import Usuarios from "../pages/Usuarios";
import Reportes from "../pages/Reportes";
import Analiticas from "../pages/Analiticas";
import Alertas from "../pages/Alertas";
import SolicitudesAdmin from "../modules/solicitudes/pages/SolicitudesAdmin";
import MisSolicitudes from "../modules/solicitudes/pages/MisSolicitudes";
import JacDetalle from "../pages/JacDetalle";
import AsocomunalDetalle from "../modules/asocomunales/pages/AsocomunalDetalle";
import Migracion from "../pages/Migracion";
import { useAuth } from "../context/AuthContext";
import { Permissions } from "../utils/permissions";
import Configuracion from "../pages/Configuracion";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isAuthLoading } = useAuth();
  if (isAuthLoading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

/**
 * Restringe el acceso a rutas exclusivas de admin/superadmin. Si llega un
 * operador o un usuario público (escribiendo la URL a mano), lo redirige
 * a la raíz silenciosamente.
 */
function AdminOnlyLayout({ children }: { children: ReactNode }) {
  const { user, isAuthLoading } = useAuth();
  if (isAuthLoading) return null;
  if (!Permissions.isAdmin(user)) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function AppRouter() {
  const { isAuthLoading } = useAuth();
  if (isAuthLoading) return null;

  return (
    <Routes>
      <Route path="/" element={<Layout><DashboardUsuario /></Layout>} />
      <Route path="/jac" element={<Layout><Jac /></Layout>} />
      <Route path="/jac/:id" element={<Layout><JacDetalle /></Layout>} />
      <Route path="/asocomunales" element={<Layout><Asocomunales /></Layout>} />
      <Route path="/asocomunales/:id" element={<Layout><AsocomunalDetalle /></Layout>} />
      <Route path="/usuarios" element={<ProtectedLayout><Usuarios /></ProtectedLayout>} />
      <Route path="/reportes" element={<ProtectedLayout><Reportes /></ProtectedLayout>} />
      <Route path="/analiticas" element={<ProtectedLayout><Analiticas /></ProtectedLayout>} />
      <Route path="/alertas" element={<ProtectedLayout><Alertas /></ProtectedLayout>} />
      <Route path="/solicitudes" element={<Layout><SolicitudesAdmin /></Layout>} />
      <Route path="/mis-solicitudes" element={<Layout><MisSolicitudes /></Layout>} />
      <Route path="/migracion" element={<AdminOnlyLayout><Migracion /></AdminOnlyLayout>} />
      <Route path="/configuracion" element={<Layout><Configuracion /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
