import { useState, useEffect } from "react";
import { SolicitudesService } from "../services/solicitudes.service";
import { useAuth } from "../../../context/AuthContext";

export type EstadoSolicitud = "Pendiente" | "Aprobada" | "Rechazada";
export type TipoAccion =
  | "Crear JAC" | "Editar JAC" | "Eliminar JAC"
  | "Crear Asocomunal" | "Editar Asocomunal" | "Eliminar Asocomunal";

export interface CambioCampo {
  campo: string;
  valorAnterior?: string;
  valorNuevo: string;
}

// Interfaz para la UI (Mapeada desde el Backend)
export interface SolicitudItem {
  id: number;
  tipo: string;
  descripcion: string;
  entidad: string;
  operador: string;
  operadorId: string;
  fecha: string;
  estado: EstadoSolicitud;
  motivoRechazo?: string;
  cambios: CambioCampo[];
}

interface SolicitudFilters {
  estado: string;
  tipo: string;
  operador: string;
  fechaDesde: string;
  fechaHasta: string;
}

const initialFilters: SolicitudFilters = {
  estado: "", tipo: "", operador: "", fechaDesde: "", fechaHasta: "",
};

export const estadoVariant: Record<EstadoSolicitud, "amber" | "green" | "red"> = {
  Pendiente: "amber", Aprobada: "green", Rechazada: "red",
};

// Función para mapear lo que llega del back a lo que espera la UI
const mapearSolicitud = (back: any): SolicitudItem => {
  const isCreation = back.tipoAccion === "CREAR";
  const entityNombre = back.entidadAfectada; // JAC o ASOCOMUNAL
  const tipoStr = isCreation ? `Crear ${entityNombre}` : back.tipoAccion === "EDITAR" ? `Editar ${entityNombre}` : `Eliminar ${entityNombre}`;
  
  // Convertir payload a array de cambios para la tabla
  const desired = back.payloadDeseado || {};
  const previous = back.payloadAnterior || {};
  
  // Mapeo amigable de nombres de campos técnicos a etiquetas legibles
  const fieldLabels: Record<string, string> = {
    nombre: "Nombre",
    municipioId: "Municipio",
    presidente: "Presidente",
    telefono: "Teléfono",
    correo: "Correo electrónico",
    estado: "Estado (Activo/Inactivo)",
    documental: "Estado Documental",
    organizativo: "Estado Organizativo",
    descripcion: "Descripción",
    barrio: "Barrio/Vereda"
  };

  // Obtenemos todas las llaves involucradas en el nuevo estado (desired)
  // ya que son los campos que el formulario envió
  const campos = Object.keys(desired)
    .filter(key => key !== 'id') // Ignorar ID
    .map(key => {
      let valAnt = previous[key];
      let valNue = desired[key];

      // Caso especial: municipioId en desired vs municipio.id en previous
      if (key === 'municipioId' && previous.municipio?.id) {
        valAnt = previous.municipio.nombre || previous.municipio.id;
      }

      // Intentar convertir booleanos a texto amigable
      if (typeof valNue === 'boolean') {
        valNue = valNue ? "Activo" : "Inactivo";
        valAnt = valAnt === true ? "Activo" : valAnt === false ? "Inactivo" : valAnt;
      }

      return {
        campo: fieldLabels[key] || key,
        valorAnterior: valAnt !== undefined ? String(valAnt) : "—",
        valorNuevo: valNue !== undefined ? String(valNue) : "—"
      };
    })
    .filter(c => c.valorAnterior !== c.valorNuevo); // Solo mostrar diferencias reales

  // Intentar extraer un "nombre" o descripcion representativa
  const desc = desired.nombre || previous.nombre || `${entityNombre} #${back.entidadId || 'Nueva'}`;

  return {
    id: back.id,
    tipo: tipoStr,
    descripcion: desc,
    entidad: entityNombre,
    operador: back.usuarioOperador?.nombre || back.operadorId, 
    operadorId: back.operadorId,
    fecha: new Date(back.fechaCreacion || back.creadoEn).toISOString().split("T")[0],
    estado: back.estado === "PENDIENTE" ? "Pendiente" : back.estado === "APROBADA" ? "Aprobada" : "Rechazada",
    motivoRechazo: back.motivoRechazo,
    cambios: campos
  };
};

export function useSolicitudes(isOperadorView?: boolean, skipFetch = false) {
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [filters, setFilters] = useState<SolicitudFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<SolicitudFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchSolicitudes = async () => {
    // Si skipFetch es true o si intentamos ver "todas" sin ser admin, abortamos
    if (skipFetch) return;
    if (!isOperadorView && user?.rol !== "admin") return;

    setLoading(true);
    try {
      const data = isOperadorView 
        ? await SolicitudesService.getMias()
        : await SolicitudesService.getTodas();
        
      setSolicitudes(data.map(mapearSolicitud));
    } catch (e) {
      console.error("Error fetching solicitudes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [isOperadorView, skipFetch, user?.rol]);


  const filtered = solicitudes.filter((s) => {
    const matchEstado   = !appliedFilters.estado   || s.estado === appliedFilters.estado;
    const matchTipo     = !appliedFilters.tipo     || s.tipo === appliedFilters.tipo;
    const matchOperador = !appliedFilters.operador ||
      s.operador.toLowerCase().includes(appliedFilters.operador.toLowerCase());
    const matchDesde = !appliedFilters.fechaDesde || s.fecha >= appliedFilters.fechaDesde;
    const matchHasta = !appliedFilters.fechaHasta || s.fecha <= appliedFilters.fechaHasta;
    return matchEstado && matchTipo && matchOperador && matchDesde && matchHasta;
  });

  const aprobar = async (id: number) => {
    try {
      await SolicitudesService.aprobar(id);
      await fetchSolicitudes(); // Refrescar
    } catch(e) {
      alert(e);
    }
  };

  const rechazar = async (id: number, motivo: string) => {
    try {
      await SolicitudesService.rechazar(id, motivo);
      await fetchSolicitudes(); // Refrescar
    } catch(e) {
      alert(e);
    }
  };

  const crearSolicitud = async (entidadAfectada: string, tipoAccion: string, payloadDeseado: any, payloadAnterior?: any, entidadId?: string) => {
    try {
      await SolicitudesService.crear({ 
        entidadAfectada, 
        tipoAccion, 
        payloadDeseado, 
        payloadAnterior,
        entidadId
      });
      await fetchSolicitudes();
    } catch(e) {
      alert("Error al crear: " + e);
    }
  };

  const notificaciones = isOperadorView
    ? solicitudes.filter((s) => s.estado !== "Pendiente").slice(0, 5)
    : [];

  return {
    filters,
    filtered,
    loading,
    aprobar,
    rechazar,
    crearSolicitud,
    notificaciones,
    handleSearch: () => setAppliedFilters(filters),
    handleClear: () => {
      setFilters(initialFilters);
      setAppliedFilters(initialFilters);
    },
    setEstado:     (v: string) => setFilters((p) => ({ ...p, estado: v })),
    setTipo:       (v: string) => setFilters((p) => ({ ...p, tipo: v })),
    setOperador:   (v: string) => setFilters((p) => ({ ...p, operador: v })),
    setFechaDesde: (v: string) => setFilters((p) => ({ ...p, fechaDesde: v })),
    setFechaHasta: (v: string) => setFilters((p) => ({ ...p, fechaHasta: v })),
  };
}