import { ArrowLeft, MapPin, Users, Phone, Mail, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";
import SearchBar from "../../../components/ui/SearchBar";
import EmptyState from "../../../components/ui/EmptyState";
import { useAuth } from "../../../context/AuthContext";
import { AsocomunalesService } from "../services/asocomunalesService";
import type { Asocomunal } from "../types";

const card    = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";
const lbl     = "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1";
const btnBack = "flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors";

function AsocomunalDetalle() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [asoc,    setAsoc]    = useState<Asocomunal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const [busquedaJac,       setBusquedaJac]       = useState("");
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBusqueda(busquedaJac), 300);
    return () => clearTimeout(timer);
  }, [busquedaJac]);

  useEffect(() => {
    const fetchAsocomunal = async () => {
      try {
        setLoading(true);
        if (id) { const data = await AsocomunalesService.getAsocomunalWithJacs(Number(id)); setAsoc(data); }
      } catch (err) {
        console.error("Error cargando asocomunal:", err);
        setError("No se pudo cargar la asocomunal");
      } finally {
        setLoading(false);
      }
    };
    fetchAsocomunal();
  }, [id]);

  const canViewJacs = user?.rol === "admin" || user?.rol === "superadmin" || user?.rol === "operador";
  const jacsFiltradas = asoc?.jacs.filter((j) =>
    !debouncedBusqueda || j.nombre.toLowerCase().includes(debouncedBusqueda.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div>
        <PageHeader title="Cargando..." subtitle="Detalle de Asociación Comunal" />
        <div className={`${card} p-6 text-center`}>
          <p className="text-gray-500 dark:text-gray-400">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error || !asoc) {
    return (
      <div>
        <PageHeader
          title="Detalle de Asocomunal"
          subtitle="Información detallada"
          description={error || "No se encontró la asocomunal solicitada"}
        >
          <button onClick={() => navigate("/asocomunales")} className={btnBack}>
            <ArrowLeft size={16} /> Volver
          </button>
        </PageHeader>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={asoc.nombre}
        subtitle="Detalle de Asociación Comunal"
        description={`Información de la asocomunal del municipio de ${asoc.municipio.nombre}`}
      >
        <button onClick={() => navigate("/asocomunales")} className={btnBack}>
          <ArrowLeft size={16} /> Volver al listado
        </button>
      </PageHeader>

      {/* Cards resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <div className={`${card} p-4`}>
          <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
            <MapPin size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Municipio</span>
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{asoc.municipio.nombre}</p>
        </div>

        <div className={`${card} p-4`}>
          <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
            <Users size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">JACs Afiliadas</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{asoc.jacs.length}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Registradas</p>
        </div>

        <div className={`${card} p-4`}>
          <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Estado</span>
          </div>
          <Badge label={asoc.estado ? "Activo" : "Inactivo"} variant={asoc.estado ? "green" : "gray"} />
        </div>

        <div className={`${card} p-4`}>
          <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Contacto</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{asoc.correo   || "—"}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{asoc.telefono || "—"}</p>
        </div>
      </div>

      {/* Información general */}
      <div className={`${card} p-5 mb-4`}>
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Información general</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
          <div>
            <p className={lbl}>Presidente</p>
            <p className="text-gray-800 dark:text-gray-200">{asoc.presidente || "No especificado"}</p>
          </div>
          <div>
            <p className={lbl}>Teléfono</p>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-gray-400 dark:text-gray-500" />
              <p className="text-gray-800 dark:text-gray-200">{asoc.telefono || "No especificado"}</p>
            </div>
          </div>
          <div>
            <p className={lbl}>Correo</p>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-gray-400 dark:text-gray-500" />
              <p className="text-gray-800 dark:text-gray-200">{asoc.correo || "No especificado"}</p>
            </div>
          </div>
          <div>
            <p className={lbl}>Total JAC afiliadas</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{asoc.jacs.length}</p>
          </div>
        </div>
      </div>

      {/* JAC Afiliadas — con permisos */}
      {canViewJacs && (
        <div className={`${card} overflow-hidden`}>
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">JAC Afiliadas</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Listado de Juntas de Acción Comunal registradas bajo esta asocomunal</p>
          </div>

          {/* Filtros */}
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 min-w-0">
                <SearchBar placeholder="Buscar por nombre de JAC..." value={busquedaJac} onChange={(e) => setBusquedaJac(e.target.value)} />
              </div>
              {busquedaJac && (
                <button
                  onClick={() => { setBusquedaJac(""); setDebouncedBusqueda(""); }}
                  className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors shrink-0"
                >
                  <RotateCcw size={14} /> Limpiar
                </button>
              )}
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                {jacsFiltradas.length} de {asoc.jacs.length}
              </span>
            </div>
          </div>

          {jacsFiltradas.length === 0 ? (
            <EmptyState key="empty-state" message="No se encontraron JAC con los criterios ingresados" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Nombre</th>
                    <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {jacsFiltradas.map((jac) => (
                    <tr key={jac.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{jac.nombre}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          jac.estado
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        }`}>
                          {jac.estado ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sin permisos */}
      {!canViewJacs && (
        <div className={`${card} p-5`}>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">JAC Afiliadas</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">No tiene permisos para consultar el detalle de JAC afiliadas a esta asocomunal.</p>
        </div>
      )}
    </div>
  );
}

export default AsocomunalDetalle;