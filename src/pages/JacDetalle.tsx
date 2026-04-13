import { ArrowLeft, Users, MapPin, FileText, ShieldCheck, RotateCcw } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import { useAuth } from "../context/AuthContext";
import {
  jacData, docVariant, orgVariant, aprobVariant, rolVariant,
} from "../hooks/useJac";

function JacDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const canViewAfiliados = user?.rol === "admin" || user?.rol === "operador";

  const jac = useMemo(() => {
    return jacData.find((item) => item.id === Number(id)) ?? null;
  }, [id]);

  // Filtros de afiliados
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedBusqueda(busqueda), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [busqueda]);

  const handleClearAfiliados = () => {
    setBusqueda("");
    setFiltroRol("");
    setDebouncedBusqueda("");
  };

  const miembrosFiltrados = useMemo(() => {
    if (!jac) return [];
    return jac.miembros.filter((m) => {
      const matchNombre =
        !debouncedBusqueda ||
        [m.nombre, m.documento].some((v) =>
          v.toLowerCase().includes(debouncedBusqueda.toLowerCase())
        );
      const matchRol = !filtroRol || m.rol === filtroRol;
      return matchNombre && matchRol;
    });
  }, [jac, debouncedBusqueda, filtroRol]);

  if (!jac) {
    return (
      <div>
        <PageHeader
          title="Detalle de JAC"
          subtitle="Información detallada"
          description="No se encontró la JAC solicitada"
        >
          <button
            onClick={() => navigate("/jac")}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 transition-colors"
          >
            <ArrowLeft size={16} />
            Volver
          </button>
        </PageHeader>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <EmptyState message="La JAC que intenta consultar no existe o no está disponible" inTable={false} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={jac.nombre}
        subtitle="Detalle de Junta de Acción Comunal"
        description="Consulte la información general, estados y afiliados registrados"
      >
        <button
          onClick={() => navigate("/jac")}
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
            <span className="text-xs font-semibold uppercase tracking-wider">Ubicación</span>
          </div>
          <p className="text-sm font-semibold text-gray-800">{jac.municipio}</p>
          <p className="text-sm text-gray-500">{jac.barrio}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <Users size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Afiliados</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{jac.afiliados}</p>
          <p className="text-xs text-gray-400">Registrados en la junta</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <FileText size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Estado documental</span>
          </div>
          <Badge label={jac.documental} variant={docVariant[jac.documental]} />
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <ShieldCheck size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Estado organizativo</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge label={jac.organizativo} variant={orgVariant[jac.organizativo]} />
            <Badge label={jac.aprobacion} variant={aprobVariant[jac.aprobacion]} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Información general</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nombre</p>
            <p className="text-gray-800">{jac.nombre}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Municipio</p>
            <p className="text-gray-800">{jac.municipio}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Barrio / Vereda</p>
            <p className="text-gray-800">{jac.barrio}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total afiliados</p>
            <p className="text-gray-800">{jac.afiliados}</p>
          </div>
        </div>
      </div>

      {canViewAfiliados && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Afiliados registrados</h2>
            <p className="text-xs text-gray-400 mt-1">
              Listado de miembros de la junta y cargo dentro de la organización
            </p>
          </div>

          {/* Filtros de afiliados */}
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 min-w-0">
                <SearchBar
                  placeholder="Buscar por nombre o documento..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-sm text-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer shrink-0"
              >
                <option value="">Todos los roles</option>
                <option value="Presidente">Presidente</option>
                <option value="Vicepresidente">Vicepresidente</option>
                <option value="Secretario">Secretario</option>
                <option value="Tesorero">Tesorero</option>
                <option value="Fiscal">Fiscal</option>
                <option value="Afiliado">Afiliado</option>
              </select>
              {(busqueda || filtroRol) && (
                <button
                  onClick={handleClearAfiliados}
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 text-gray-500 text-sm px-3 py-2 rounded-lg border border-gray-200 transition-colors shrink-0"
                >
                  <RotateCcw size={14} />
                  Limpiar
                </button>
              )}
              <span className="text-xs text-gray-400 shrink-0">
                {miembrosFiltrados.length} de {jac.miembros.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Nombre</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Documento</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Teléfono</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Cargo / rol</th>
                </tr>
              </thead>
              <tbody>
                {miembrosFiltrados.length === 0 ? (
                  <EmptyState message="No se encontraron afiliados con los criterios ingresados" />
                ) : (
                  miembrosFiltrados.map((miembro) => (
                    <tr key={miembro.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{miembro.nombre}</td>
                      <td className="px-4 py-3 text-gray-600 tabular-nums">{miembro.documento}</td>
                      <td className="px-4 py-3 text-gray-600 tabular-nums">{miembro.telefono}</td>
                      <td className="px-4 py-3">
                        <Badge label={miembro.rol} variant={rolVariant[miembro.rol]} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!canViewAfiliados && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Afiliados registrados</h2>
          <p className="text-sm text-gray-500">
            No tiene permisos para consultar el detalle de afiliados de esta JAC.
          </p>
        </div>
      )}
    </div>
  );
}

export default JacDetalle;
