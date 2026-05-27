import { ArrowLeft, Users, MapPin, FileText, ShieldCheck, RotateCcw, AlertTriangle, Pencil, Tags, CheckCircle2, Plus, Trash2, Edit, Ellipsis } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import { useAuth } from "../context/AuthContext";
import { rolVariant } from "../hooks/useJac";
import { JACService } from "../modules/jac/services/jacService";
import { AfiliadosService } from "../modules/jac/services/afiliadosService";
import { ModalAfiliadoFormulario } from "../modules/jac/components/ModalAfiliadoFormulario";
import { ModalEditarJac } from "../modules/jac/components/ModalEditarJac";
import { ModalDetalleAfiliado } from "../modules/jac/components/ModalDetalleAfiliado";

//Se agrego SolicitudesService para poder editar las solicitudes
import { SolicitudesService } from "../modules/solicitudes/services/solicitudes.service";
import { Permissions } from "../utils/permissions";
import type { JacItem, UpdateJACDto } from "../modules/jac/types";
import type { Asocomunal } from "../modules/asocomunales/types";

const card = "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm";
const label = "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1";
const selectCls = "appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B7F4B]/30 focus:border-[#1B7F4B] transition-all cursor-pointer shrink-0";

function JacDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthLoading } = useAuth();
  console.log('[JacDetalle] user.rol:', user?.rol);

  // Usar funciones centralizadas de permisos
  const esAdmin = Permissions.isAdmin(user);
  const canViewAfiliados = Permissions.canViewJacs(user);
  const canViewConfidential = esAdmin;

  const [jac, setJac] = useState<JacItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asocomunales, setAsocomunales] = useState<Asocomunal[]>([]);
  const [editingJac, setEditingJac] = useState<JacItem | null>(null);

  useEffect(() => {
    if (!id || isAuthLoading) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = canViewConfidential
      ? JACService.findOne(Number(id))
      : JACService.findOnePublic(Number(id));

    load
      .then((data) => {
        if (!cancelled) setJac(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, canViewConfidential, isAuthLoading]);

  // Cargar asocomunales disponibles
  useEffect(() => {
    const fetchAsocomunales = async () => {
      try {
        const data = await JACService.getAsocomunalesReplica();
        setAsocomunales(data);
      } catch (err) {
        console.error("Error al obtener asocomunales:", err);
      }
    };
    fetchAsocomunales();
  }, []);

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [afiliadoEdit, setAfiliadoEdit] = useState<number | null>(null);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [afiliadoDetalleId, setAfiliadoDetalleId] = useState<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedBusqueda(busqueda), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [busqueda]);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Bloquear acceso si la autenticación ya cargó pero el usuario o su rol no están definidos
    if (!isAuthLoading && (!user || !user.rol)) {
      setAccessDenied(true);
    } else {
      setAccessDenied(false);
    }
  }, [isAuthLoading, user]);

  const handleSaveEditModal = async (id: number, data: UpdateJACDto) => {
    try {
      const payloadAudit: any = { ...data };
      if (data.asocomunalId) {
        const aso = asocomunales.find(a => a.id === data.asocomunalId);
        if (aso) payloadAudit.asocomunalId_nombre = aso.nombre;
      }

      // Enriquecer payloadAnterior con nombre de asocomunal si aplica
      const payloadAnteriorAudit: any = { ...jac };
      if (jac?.asocomunalId) {
        const aso = asocomunales.find(a => a.id === jac.asocomunalId);
        if (aso) {
          payloadAnteriorAudit.asocomunalId_nombre = aso.nombre;
        }
      }

      if (esAdmin) {
        const updated = await JACService.update(id, data);
        setJac(updated);
        try {
          await SolicitudesService.registrarAccionAdmin({
            entidadAfectada: "JAC",
            entidadId: String(id),
            tipoAccion: "EDITAR",
            payloadAnterior: payloadAnteriorAudit,  // JAC enriquecida con nombres
            payloadDeseado: payloadAudit,
          });
        } catch {
          console.warn("No se pudo registrar la acción en auditoría");
        }
        setSuccessMessage("JAC actualizada correctamente");
      } else if (user?.rol === "operador") {
        // Enviar ambos payloads enriquecidos para comparación completa
        await SolicitudesService.crear({
          entidadAfectada: "JAC",
          entidadId: String(id),
          tipoAccion: "EDITAR",
          payloadAnterior: payloadAnteriorAudit,  // JAC enriquecida con nombres
          payloadDeseado: payloadAudit,
        });
        setSuccessMessage("Propuesta de cambio enviada para revisión");
      }

      setEditingJac(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const handleClearAfiliados = () => { setBusqueda(""); setFiltroRol(""); setDebouncedBusqueda(""); };

  const handleAgregarAfiliado = () => {
    setAfiliadoEdit(null);
    setModalOpen(true);
  };

  const handleVerDetalleAfiliado = (id: number) => {
    setAfiliadoDetalleId(id);
    setModalDetalleOpen(true);
  };

  const handleEditarAfiliado = (id: number) => {
    setAfiliadoEdit(id);
    setModalOpen(true);
  };

  const handleEliminarAfiliado = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas eliminar este afiliado de la JAC?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await AfiliadosService.delete(id);
        if (id) {
          setJac((prev) => prev ? { ...prev, miembros: prev.miembros?.filter((m) => m.id !== id) || [] } : null);
        }
        await Swal.fire({
          title: "Eliminado",
          text: "El afiliado ha sido eliminado correctamente.",
          icon: "success",
          confirmButtonColor: "#1B7F4B",
          timer: 2000,
          timerProgressBar: true
        });
      } catch (err) {
        await Swal.fire({
          title: "Error",
          text: err instanceof Error ? err.message : "Hubo un problema al eliminar el afiliado.",
          icon: "error",
          confirmButtonColor: "#1B7F4B"
        });
      }
    }
  };

  const handleModalSuccess = () => {
    if (id) {
      JACService.findOne(Number(id)).then(setJac);
    }
  };

  const miembrosFiltrados = useMemo(() => {
    if (!jac || !jac.miembros) return [];
    return jac.miembros.filter((m) => {
      const matchNombre = !debouncedBusqueda || [m.nombre, m.documento].some((v) => v?.toLowerCase().includes(debouncedBusqueda.toLowerCase()));
      const matchRol = !filtroRol || m.rol === filtroRol;
      return matchNombre && matchRol;
    });
  }, [jac, debouncedBusqueda, filtroRol]);

  if (accessDenied) {
    return (
      <div>
        <PageHeader title="Acceso denegado" subtitle="Acceso restringido" description="No tiene permisos para ver este recurso">
          <button onClick={() => navigate("/jac")} className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
            <ArrowLeft size={16} /> Volver
          </button>
        </PageHeader>
        <div className={`${card} p-5`}>
          <EmptyState message="No tiene permisos para consultar esta página." inTable={false} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Detalle de JAC" subtitle="Información detallada" description="Cargando información de la junta...">
          <button onClick={() => navigate("/jac")} className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
            <ArrowLeft size={16} /> Volver
          </button>
        </PageHeader>
        <div className={`${card} p-8 flex items-center justify-center`}>
          <p className="text-sm text-gray-400 dark:text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !jac) {
    return (
      <div>
        <PageHeader title="Detalle de JAC" subtitle="Información detallada" description="No se encontró la JAC solicitada">
          <button onClick={() => navigate("/jac")} className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
            <ArrowLeft size={16} /> Volver
          </button>
        </PageHeader>
        <div className={card}>
          <EmptyState message={error ?? "La JAC que intenta consultar no existe o no está disponible"} inTable={false} />
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
        <div className="flex items-center gap-2">
          {canViewAfiliados && (
            <button
              onClick={() => setEditingJac(jac)}
              className="flex items-center gap-2 bg-[#1B7F4B] hover:bg-[#166340] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <Edit size={16} /> Editar JAC
            </button>
          )}
          <button onClick={() => navigate("/jac")} className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
            <ArrowLeft size={16} /> Volver al listado
          </button>
        </div>
      </PageHeader>

      {/* Alerta de éxito */}
      {successMessage && (
        <div className="animate-in fade-in slide-in-from-top-2 rounded-lg px-4 py-3 mb-4 border bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="shrink-0" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Alerta de riesgo */}
      {jac.enRiesgo && (
        <div className="rounded-lg px-4 py-3 mb-4 border bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">JAC en riesgo de inactivación</p>
              <p className="mt-0.5">
                Esta junta cuenta con <span className="font-semibold tabular-nums">{jac.afiliados || 0}</span> afiliado{(jac.afiliados || 0) === 1 ? "" : "s"}, por debajo del mínimo legal de <span className="font-semibold tabular-nums">{jac.minimoAfiliados || 0}</span> requerido para una JAC de tipo <span className="font-semibold">{jac.tipo || "desconocido"}</span> (Ley 2166 de 2021, Art. 11).
                Si no se incrementa el número de afiliados activos, la junta podría perder su condición de activa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 ${canViewConfidential ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
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
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{jac.afiliados || 0}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Registrados en la junta</p>
        </div>

        {canViewConfidential && (
          <div className={`${card} p-4 relative group`}>
            <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
              <FileText size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Número RUC</span>
            </div>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {jac.numeroRUC || <span className="text-sm font-normal text-gray-400 italic">No tiene RUC</span>}
            </p>
          </div>
        )}

        <div className={`${card} p-4 relative group`}>
          <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
            <ShieldCheck size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Estado de la JAC</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${jac.estado === "Activa" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" :
              jac.estado === "Inactiva" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" :
                jac.estado === "Cancelada" ? "bg-gray-400 shadow-[0_0_8px_rgba(156,163,175,0.6)]" :
                  "bg-gray-300"
              }`}></span>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {jac.estado || "Desconocido"}
            </p>
          </div>
        </div>

        <div className={`${card} p-4 relative group`}>
          <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
            <Tags size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Tipo JAC</span>
          </div>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {jac.tipo || "No definido"}
          </p>
        </div>
      </div>

      {/* Información general */}
      <div className={`${card} p-5 mb-4`}>
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Información general</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            { label: "Nombre", value: jac.nombre },
            { label: "Municipio", value: jac.municipio },
            { label: "Barrio / Vereda", value: jac.barrio },
          ].map(({ label: l, value }) => (
            <div key={l}>
              <p className={label}>{l}</p>
              <p className="text-gray-800 dark:text-gray-200">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla afiliados */}
      {canViewAfiliados && (
        <div className={`${card} overflow-hidden`}>
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Afiliados registrados</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Listado de miembros de la junta y cargo dentro de la organización</p>
          </div>

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
                <option value="Fiscal Principal">Fiscal Principal</option>
                <option value="Fiscal Suplente">Fiscal Suplente</option>
                <option value="Comisión de Convivencia">Comisión de Convivencia</option>
                <option value="Delegado Asociación">Delegado Asociación</option>
                <option value="Comisión del Deporte">Comisión del Deporte</option>
                <option value="Promotor">Promotor</option>
              </select>
              {(busqueda || filtroRol) && (
                <button onClick={handleClearAfiliados} className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors shrink-0">
                  <RotateCcw size={14} /> Limpiar
                </button>
              )}
              <button onClick={handleAgregarAfiliado} className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded-lg transition-colors shrink-0">
                <Plus size={14} /> Agregar
              </button>
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                {miembrosFiltrados.length} de {(jac.miembros || []).length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  {["Nombre", "Documento", "Teléfono", "Cargo / rol", "Acciones"].map((col) => (
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleVerDetalleAfiliado(miembro.id)} className="p-1.5 rounded-lg hover:bg-[#1B7F4B]/10 dark:hover:bg-[#1B7F4B]/20 text-gray-500 dark:text-gray-400 hover:text-[#1B7F4B] dark:hover:text-emerald-400 transition-colors" title="Ver detalles">
                            <Ellipsis size={20} />
                          </button>
                          <button onClick={() => handleEditarAfiliado(miembro.id)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" title="Editar">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleEliminarAfiliado(miembro.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
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
        <div className={`${card} p-5`}>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Afiliados registrados</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">No tiene permisos para consultar el detalle de afiliados de esta JAC.</p>
        </div>
      )}

      {/* Modal para crear/editar afiliados */}
      <ModalAfiliadoFormulario
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        jacId={jac.id}
        afiliadoId={afiliadoEdit}
        onSuccess={handleModalSuccess}
      />

      {/* Modal para ver detalles de afiliado */}
      <ModalDetalleAfiliado
        isOpen={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        afiliadoId={afiliadoDetalleId}
        rolVariant={rolVariant}
      />

      {/* Modal para editar JAC */}
      {editingJac && (
        <ModalEditarJac
          jac={editingJac}
          asocomunales={asocomunales}
          onClose={() => setEditingJac(null)}
          onSave={handleSaveEditModal}
        />
      )}
    </div>
  );
}

export default JacDetalle;