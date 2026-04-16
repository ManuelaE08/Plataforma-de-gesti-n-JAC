import { ArrowLeft, Users, MapPin, FileText, ShieldCheck, RotateCcw } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import { useAuth } from "../context/AuthContext";
import { jacData, docVariant, orgVariant, aprobVariant, rolVariant } from "../hooks/useJac";

const card      = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";
const label     = "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1";
const selectCls = "appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer shrink-0";

function JacDetalle() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const canViewAfiliados = user?.rol === "admin" || user?.rol === "operador";

  const jac = useMemo(() => jacData.find((item) => item.id === Number(id)) ?? null, [id]);

  const [busqueda,          setBusqueda]          = useState("");
  const [filtroRol,         setFiltroRol]         = useState("");
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedBusqueda(busqueda), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [busqueda]);

  const handleClearAfiliados = () => { setBusqueda(""); setFiltroRol(""); setDebouncedBusqueda(""); };

  const miembrosFiltrados = useMemo(() => {
    if (!jac) return [];
    return jac.miembros.filter((m) => {
      const matchNombre = !debouncedBusqueda || [m.nombre, m.documento].some((v) => v.toLowerCase().includes(debouncedBusqueda.toLowerCase()));
      const matchRol = !filtroRol || m.rol === filtroRol;
      return matchNombre && matchRol;
    });
  }, [jac, debouncedBusqueda, filtroRol]);

  if (!jac) {
    return (
      <div>
        <PageHeader title="Detalle de JAC" subtitle="Información detallada" description="No se encontró la JAC solicitada">
          <button onClick={() => navigate("/jac")} className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
            <ArrowLeft size={16} /> Volver
          </button>
        </PageHeader>
        <div className={card}>
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
        <button onClick={() => navigate("/jac")} className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
          <ArrowLeft size={16} /> Volver al listado
        </button>
      </PageHeader>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <div className={`${card} p-4`}>
          <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
            <MapPin size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Ubicación</span>
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{jac.municipio}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{jac.barrio}</p>
        </div>

        <div className={`${card} p-4`}>
          <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
            <Users size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Afiliados</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{jac.afiliados}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Registrados en la junta</p>
        </div>

        <div className={`${card} p-4`}>
          <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
            <FileText size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Estado documental</span>
          </div>
          <Badge label={jac.documental} variant={docVariant[jac.documental]} />
        </div>

        <div className={`${card} p-4`}>
          <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
            <ShieldCheck size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Estado organizativo</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge label={jac.organizativo} variant={orgVariant[jac.organizativo]} />
            <Badge label={jac.aprobacion}   variant={aprobVariant[jac.aprobacion]} />
          </div>
        </div>
      </div>

      {/* Información general */}
      <div className={`${card} p-5 mb-4`}>
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Información general</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            { label: "Nombre",          value: jac.nombre },
            { label: "Municipio",       value: jac.municipio },
            { label: "Barrio / Vereda", value: jac.barrio },
            { label: "Total afiliados", value: String(jac.afiliados) },
          ].map(({ label: l, value }) => (
            <div key={l}>
              <p className={label}>{l}</p>
              <p className="text-gray-800 dark:text-gray-200">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla afiliados — con permisos */}
      {canViewAfiliados && (
        <div className={`${card} overflow-hidden`}>
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Afiliados registrados</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Listado de miembros de la junta y cargo dentro de la organización</p>
          </div>

          {/* Filtros afiliados */}
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 min-w-0">
                <SearchBar placeholder="Buscar por nombre o documento..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
              </div>
              <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} className={selectCls}>
                <option value="">Todos los roles</option>
                <option value="Presidente">Presidente</option>
                <option value="Vicepresidente">Vicepresidente</option>
                <option value="Secretario">Secretario</option>
                <option value="Tesorero">Tesorero</option>
                <option value="Fiscal">Fiscal</option>
                <option value="Afiliado">Afiliado</option>
              </select>
              {(busqueda || filtroRol) && (
                <button onClick={handleClearAfiliados} className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors shrink-0">
                  <RotateCcw size={14} /> Limpiar
                </button>
              )}
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                {miembrosFiltrados.length} de {jac.miembros.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  {["Nombre", "Documento", "Teléfono", "Cargo / rol"].map((col) => (
                    <th key={col} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {miembrosFiltrados.length === 0 ? (
                  <EmptyState message="No se encontraron afiliados con los criterios ingresados" />
                ) : (
                  miembrosFiltrados.map((miembro) => (
                    <tr key={miembro.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{miembro.nombre}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 tabular-nums">{miembro.documento}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 tabular-nums">{miembro.telefono}</td>
                      <td className="px-4 py-3"><Badge label={miembro.rol} variant={rolVariant[miembro.rol]} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sin permisos */}
      {!canViewAfiliados && (
        <div className={`${card} p-5`}>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Afiliados registrados</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">No tiene permisos para consultar el detalle de afiliados de esta JAC.</p>
        </div>
      )}
    </div>
  );
}

export default JacDetalle;