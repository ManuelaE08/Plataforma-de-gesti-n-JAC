import { ArrowLeft, Users, MapPin, FileText, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { useAuth } from "../context/AuthContext";
import {
  asocomunalesData,
  docVariant,
  orgVariant,
  aprobVariant,
  rolVariant,
} from "../hooks/useAsocomunales";

function AsocomunalDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const canViewAfiliados = user?.rol === "admin" || user?.rol === "operador";

  const asoc = useMemo(() => {
    return asocomunalesData.find((item) => item.id === Number(id)) ?? null;
  }, [id]);

  if (!asoc) {
    return (
      <div>
        <PageHeader
          title="Detalle de Asocomunal"
          subtitle="Información detallada"
          description="No se encontró la asocomunal solicitada"
        >
          <button
            onClick={() => navigate("/asocomunales")}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 transition-colors"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
        </PageHeader>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <EmptyState message="La asocomunal que intenta consultar no existe o no está disponible" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={asoc.nombre}
        subtitle="Detalle de Asociación Comunal"
        description="Consulte la información general, estados y JAC afiliadas registradas"
      >
        <button
          onClick={() => navigate("/asocomunales")}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al listado
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <MapPin size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Ubicación
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-800">{asoc.municipio}</p>
          <p className="text-sm text-gray-500">{asoc.cobertura}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <Users size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              JAC Afiliadas
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{asoc.afiliadas}</p>
          <p className="text-xs text-gray-400">Registradas en la asocomunal</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <FileText size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Estado documental
            </span>
          </div>
          <Badge label={asoc.documental} variant={docVariant[asoc.documental]} />
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <ShieldCheck size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Estado organizativo
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge label={asoc.organizativo} variant={orgVariant[asoc.organizativo]} />
            <Badge label={asoc.aprobacion} variant={aprobVariant[asoc.aprobacion]} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">
          Información general
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Nombre
            </p>
            <p className="text-gray-800">{asoc.nombre}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Municipio
            </p>
            <p className="text-gray-800">{asoc.municipio}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Cobertura
            </p>
            <p className="text-gray-800">{asoc.cobertura}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Total JAC afiliadas
            </p>
            <p className="text-gray-800">{asoc.afiliadas}</p>
          </div>
        </div>
      </div>

      {canViewAfiliados && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">
              Miembros registrados
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Listado de miembros de la asocomunal y cargo dentro de la organización
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Nombre
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Documento
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Teléfono
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Cargo / rol
                  </th>
                </tr>
              </thead>

              <tbody>
                {asoc.miembros.map((miembro) => (
                  <tr key={miembro.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {miembro.nombre}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {miembro.documento}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {miembro.telefono}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={miembro.rol}
                        variant={rolVariant[miembro.rol]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!canViewAfiliados && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">
            Miembros registrados
          </h2>
          <p className="text-sm text-gray-500">
            No tiene permisos para consultar el detalle de miembros de esta asocomunal.
          </p>
        </div>
      )}
    </div>
  );
}

export default AsocomunalDetalle;