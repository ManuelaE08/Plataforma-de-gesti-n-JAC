import { useState, useEffect } from "react";
import { SolicitudesService } from "../services/solicitudes.service";
import { useAuth } from "../../../context/AuthContext";

export type EstadoSolicitud = "Pendiente" | "Aprobada" | "Rechazada";
export type TipoAccion =
  | "Crear JAC" | "Editar JAC"
  | "Crear Asocomunal" | "Editar Asocomunal" | "Cambio de estado Asocomunal";

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
  /** true cuando el admin registró la acción directamente (no es propuesta de operador) */
  esAccionAdmin: boolean;
  /** Nombre del admin que aprobó o rechazó (null si aun está pendiente) */
  revisadoPorAdmin?: string;
  /** Email del operador que propuso el cambio */
  operadorEmail?: string;
  /** Email del admin que resolvió la solicitud */
  revisadoPorAdminEmail?: string;
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
  const entityNombre = back.entidadAfectada as string; // ej: "ASOCOMUNAL" o "JAC"
  // Normalizar nombre de entidad (ASOCOMUNAL → Asocomunal, JAC → JAC)
  const entityNormalizado = entityNombre.charAt(0).toUpperCase() + entityNombre.slice(1).toLowerCase();
  
  const tipoMap: Record<string, string> = {
    CREAR: `Crear ${entityNormalizado}`,
    EDITAR: `Editar ${entityNormalizado}`,
    ELIMINAR: `Eliminar ${entityNormalizado}`,
    ACTIVAR: `Activar ${entityNormalizado}`,
    DESACTIVAR: `Desactivar ${entityNormalizado}`,
  };
  const tipoStr = tipoMap[back.tipoAccion] ?? `${back.tipoAccion} ${entityNormalizado}`;

  // Convertir payload a array de cambios para la tabla
  let desired = back.payloadDeseado || {};
  
  // DEBUG: Si el payload es string, parsearlo
  if (typeof desired === 'string') {
    try {
      desired = JSON.parse(desired);
    } catch (e) {
      console.warn("[useSolicitudes] No se pudo parsear payloadDeseado como JSON", desired);
      desired = {};
    }
  }
  
  // Si payloadDeseado está vacío para CREAR/EDITAR, intentar recuperar de payloadAnterior
  if (Object.keys(desired).length === 0 && back.payloadAnterior) {
    console.warn("[useSolicitudes] payloadDeseado vacío, usando payloadAnterior como fallback", back.payloadAnterior);
    desired = back.payloadAnterior;
  }
  
  let previous = back.payloadAnterior || {};
  
  // Si payloadAnterior es string, parsearlo
  if (typeof previous === 'string') {
    try {
      previous = JSON.parse(previous);
    } catch (e) {
      console.warn("[useSolicitudes] No se pudo parsear payloadAnterior como JSON", previous);
      previous = {};
    }
  }

  // Mapeo amigable de nombres de campos técnicos a etiquetas legibles
  const fieldLabels: Record<string, string> = {
    nombre: "Nombre",
    nombreCompleto: "Nombre",
    nombreCorto: "Barrio/Vereda",
    tipo: "Tipo (Barrio/Vereda)",
    municipioId: "Municipio",
    municipioId_nombre: "Municipio",
    presidente: "Presidente",
    telefono: "Teléfono",
    correo: "Correo electrónico",
    estado: "Estado",
    numeroRUC: "Número RUC",
    documental: "Estado Documental",
    organizativo: "Estado Organizativo",
    descripcion: "Descripción",
    barrio: "Barrio/Vereda",
    asocomunalId: "Asocomunal",
    asocomunalId_nombre: "Asocomunal",
    // Campos de Afiliado (Persona)
    apellido: "Apellido",
    cedula: "Cédula",
    documento: "Documento",
    lugarExpedicionCedula: "Lugar expedición cédula",
    cargoId: "Cargo",
    cargoId_nombre: "Cargo",
    genero: "Género",
    grupoEtnico: "Grupo étnico",
    fechaNacimiento: "Fecha de nacimiento",
    ocupacion: "Ocupación",
    estudiosRealizados: "Estudios realizados",
    discapacitado: "¿Discapacidad?",
  };

  // Mapeo de equivalencias entre nombres de campo en payloads anteriores vs nuevos
  // Porque el backend devuelve ciertos campos con un nombre y el formulario los envía con otro
  const fieldMapping: Record<string, string> = {
    nombreCompleto: "nombre",           // Formulario: nombreCompleto → Backend: nombre
    nombreCorto: "barrio",              // Formulario: nombreCorto → Backend: barrio
    asocomunalId_nombre: "asocomunalNombre", // Versión nombre-legible de asocomunalId
    municipioId_nombre: "municipioNombre",   // Versión nombre-legible de municipioId
  };

  // Obtenemos todas las llaves involucradas en el nuevo estado (desired)
  // ya que son los campos que el formulario envió
  const campos = Object.keys(desired)
    .filter(key => {
      // Ignorar ID
      if (key === 'id') return false;
      // Si existe el campo _nombre, ignorar el ID correspondiente
      if (key === 'municipioId' && desired.municipioId_nombre) return false;
      if (key === 'asocomunalId' && desired.asocomunalId_nombre) return false;
      if (key === 'cargoId' && desired.cargoId_nombre) return false;
      // jacId es enlace interno del afiliado, no aporta al revisor
      if (key === 'jacId') return false;
      return true;
    })
    .map(key => {
      let valAnt = previous[key];
      let valNue = desired[key];

      // Caso especial: buscar en el mapping si el campo nuevo tiene un equivalente en el anterior
      const fieldInPrevious = fieldMapping[key];
      if (fieldInPrevious && valAnt === undefined) {
        valAnt = previous[fieldInPrevious];
      }

      // Caso especial: municipioId_nombre - mostrar nombre del municipio
      if (key === 'municipioId_nombre') {
        // Buscar anterior: primero en municipio.nombre, luego en municipioId_nombre, luego en municipio.id
        valAnt = previous.municipio?.nombre || 
                 previous.municipioId_nombre || 
                 previous.municipio?.id ||
                 "—";
        valNue = desired.municipioId_nombre;
      }

      // Caso especial: asocomunalId_nombre - mostrar nombre de la asocomunal
      if (key === 'asocomunalId_nombre') {
        // Buscar anterior: primero en asocomunalNombre, luego en asocomunalId_nombre
        valAnt = previous.asocomunalNombre || 
                 previous.asocomunalId_nombre ||
                 "—";
        valNue = desired.asocomunalId_nombre;
      }

      // Caso especial: municipioId en desired vs municipio.id en previous
      if (key === 'municipioId' && previous.municipio?.id) {
        valAnt = previous.municipio.nombre || previous.municipio.id;
        valNue = desired.municipioId;
      }

      // Caso especial: asocomunalId - buscar el nombre asociado
      if (key === 'asocomunalId') {
        // Valor anterior: buscar asocomunalNombre en el mismo payload
        if (previous.asocomunalNombre) {
          valAnt = previous.asocomunalNombre;
        }
        // Si tenemos un ID anterior, intentar obtener nombre del payload
        // (para EDITAR, el backend debería mandar el nombre anterior)
        valNue = desired.asocomunalId;
      }

      // --- MEJORA: Buscar nombre amigable enviado en el payload ---
      // Si el payload contiene "campo_nombre", lo usamos para mostrar el valor nuevo
      if (desired[`${key}_nombre`]) {
        valNue = desired[`${key}_nombre`];
      }
      // Lo mismo para el anterior si fuera necesario (aunque normalmente previous ya trae el objeto)
      if (previous[`${key}_nombre`] && !previous.municipio?.id) {
        valAnt = previous[`${key}_nombre`];
      }

      // Convertir tipo de JAC a texto legible
      if (key === 'tipo') {
        if (valNue === 'barrio') valNue = 'Barrio';
        if (valNue === 'vereda') valNue = 'Vereda';
        if (valAnt === 'barrio') valAnt = 'Barrio';
        if (valAnt === 'vereda') valAnt = 'Vereda';
      }

      // Discapacidad: Sí/No en lugar de Activo/Inactivo
      if (key === 'discapacitado') {
        valNue = valNue === true ? "Sí" : valNue === false ? "No" : valNue;
        valAnt = valAnt === true ? "Sí" : valAnt === false ? "No" : valAnt;
      }

      // Intentar convertir booleanos a texto amigable
      if (typeof valNue === 'boolean') {
        valNue = valNue ? "Activo" : "Inactivo";
        valAnt = valAnt === true ? "Activo" : valAnt === false ? "Inactivo" : valAnt;
      }

      // Normalizar estado a minúsculas para comparación consistente
      if (key === 'estado' && valAnt) {
        valAnt = String(valAnt).toLowerCase();
      }
      if (key === 'estado' && valNue) {
        valNue = String(valNue).toLowerCase();
      }

      return {
        campo: fieldLabels[key] || key,
        valorAnterior: valAnt !== undefined && valAnt !== null && valAnt !== "" ? String(valAnt) : "—",
        valorNuevo: valNue !== undefined && valNue !== null && valNue !== "" ? String(valNue) : "—"
      };
    })
    .filter(c => {
      // Para CREAR: mostrar todos los campos no vacíos
      const isCrearAction = back.tipoAccion === "CREAR" || 
                            back.tipoAccion?.startsWith("CREAR");
      
      if (isCrearAction) {
        return c.valorNuevo !== "—"; // Solo excluir campos completamente vacíos
      }
      
      // Para EDITAR/ELIMINAR: SOLO mostrar campos que realmente cambiaron
      const cambioDiferente = c.valorAnterior !== c.valorNuevo;
      return cambioDiferente; // Solo campos con cambios reales
    });

  // DEBUG: Log para ver todos los campos calculados
  const isCrearAction = back.tipoAccion === "CREAR" || back.tipoAccion?.startsWith("CREAR");
  const isEditarAction = back.tipoAccion === "EDITAR" || back.tipoAccion?.startsWith("EDITAR");
  
  if (isCrearAction || isEditarAction) {
    console.log(`[useSolicitudes] ${back.tipoAccion} for ${back.entidadAfectada}:`, {
      tipoAccion: back.tipoAccion,
      desiredKeys: Object.keys(desired),
      desiredValues: desired,
      previousKeys: Object.keys(previous),
      previousValues: previous,
      camposCalculados: campos,
    });
  }

  // Intentar extraer un "nombre" o descripcion representativa
  const desc = desired.nombreCompleto || desired.nombre || previous.nombreCompleto || previous.nombre || `${entityNombre} #${back.entidadId || 'Nueva'}`;

  // Es acción directa del admin cuando él mismo figura como operador y revisor
  const esAccionAdmin = !!back.revisadoPorAdminId && back.operadorId === back.revisadoPorAdminId;

  // Nombre legible del admin revisor
  const revisadoPorAdmin = back.revisadoPorAdminNombre || back.revisadoPorAdminId || undefined;

  return {
    id: back.id,
    tipo: tipoStr,
    descripcion: desc,
    entidad: entityNombre,
    operador: back.operadorNombre || back.usuarioOperador?.nombre || back.operadorId,
    operadorId: back.operadorId,
    fecha: new Date(back.fechaCreacion || back.creadoEn).toISOString().split("T")[0],
    estado: back.estado === "PENDIENTE" ? "Pendiente" : back.estado === "APROBADA" ? "Aprobada" : "Rechazada",
    motivoRechazo: back.motivoRechazo,
    cambios: campos,
    esAccionAdmin,
    revisadoPorAdmin,
    operadorEmail: back.operadorId,          // operadorId contiene el email
    revisadoPorAdminEmail: back.revisadoPorAdminId || undefined,
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
    if (!isOperadorView && user?.rol !== "admin" && user?.rol !== "superadmin") return;

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

  // Aplicar filtros en tiempo real (sin necesidad de clickear "Buscar")
  useEffect(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const filtered = solicitudes.filter((s) => {
    const matchEstado = !appliedFilters.estado || s.estado === appliedFilters.estado;
    
    // Lógica especial para "Cambio de estado Asocomunal" que matchea tanto ACTIVAR como DESACTIVAR
    let matchTipo = false;
    if (!appliedFilters.tipo) {
      matchTipo = true;
    } else if (appliedFilters.tipo === "Cambio de estado Asocomunal") {
      matchTipo = s.tipo.includes("Activar Asocomunal") || s.tipo.includes("Desactivar Asocomunal");
    } else {
      matchTipo = s.tipo.toLowerCase() === appliedFilters.tipo.toLowerCase();
    }
    
    const matchOperador = !appliedFilters.operador ||
      s.operador.toLowerCase().includes(appliedFilters.operador.toLowerCase());
    
    // Comparar fechas correctamente (formato YYYY-MM-DD)
    const matchDesde = !appliedFilters.fechaDesde || s.fecha >= appliedFilters.fechaDesde;
    const matchHasta = !appliedFilters.fechaHasta || s.fecha <= appliedFilters.fechaHasta;
    
    return matchEstado && matchTipo && matchOperador && matchDesde && matchHasta;
  });

  const aprobar = async (id: number) => {
    try {
      await SolicitudesService.aprobar(id);
      await fetchSolicitudes(); // Refrescar
    } catch (e) {
      alert(e);
    }
  };

  const rechazar = async (id: number, motivo: string) => {
    try {
      await SolicitudesService.rechazar(id, motivo);
      await fetchSolicitudes(); // Refrescar
    } catch (e) {
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
    } catch (e) {
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
    handleSearch: () => {}, // Ya no es necesario, filtrado es en tiempo real
    handleClear: () => {
      setFilters(initialFilters);
      setAppliedFilters(initialFilters);
    },
    setEstado: (v: string) => setFilters((p) => ({ ...p, estado: v })),
    setTipo: (v: string) => setFilters((p) => ({ ...p, tipo: v })),
    setOperador: (v: string) => setFilters((p) => ({ ...p, operador: v })),
    setFechaDesde: (v: string) => setFilters((p) => ({ ...p, fechaDesde: v })),
    setFechaHasta: (v: string) => setFilters((p) => ({ ...p, fechaHasta: v })),
  };
}