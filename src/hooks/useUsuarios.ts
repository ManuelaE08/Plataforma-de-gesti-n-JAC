import { useState } from "react";

export type RolUsuario = "admin" | "operador" | "usuario";
export type EstadoUsuario = "Activo" | "Inactivo";

export interface UsuarioItem {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  ultimaActividad: string;
}

export const rolesInfo: Record<RolUsuario, { label: string; descripcion: string; variant: "green" | "blue" | "gray" }> = {
  admin:    { label: "Administrador", descripcion: "Acceso completo al sistema, incluyendo aprobación de solicitudes y configuración.", variant: "green" },
  operador: { label: "Operador",      descripcion: "Puede crear y editar registros mediante solicitudes de aprobación.",              variant: "blue"  },
  usuario:  { label: "Usuario",       descripcion: "Solo lectura: puede consultar registros pero no proponer cambios.",               variant: "gray"  },
};

export const usuariosData: UsuarioItem[] = [
  { id: 1, nombre: "Juan Díaz",      correo: "juan.diaz@gobcauca.gov.co",      rol: "admin",    estado: "Activo",   ultimaActividad: "Hace 2 horas" },
  { id: 2, nombre: "María González", correo: "maria.gonzalez@gobcauca.gov.co", rol: "operador", estado: "Activo",   ultimaActividad: "Hace 4 horas" },
  { id: 3, nombre: "Ana Rodríguez",  correo: "ana.rodriguez@gobcauca.gov.co",  rol: "operador", estado: "Activo",   ultimaActividad: "Hace 1 día" },
  { id: 4, nombre: "Patricia Silva", correo: "patricia.silva@gobcauca.gov.co", rol: "admin",    estado: "Activo",   ultimaActividad: "Hace 3 horas" },
  { id: 5, nombre: "Carlos Medina",  correo: "carlos.medina@gobcauca.gov.co",  rol: "operador", estado: "Inactivo", ultimaActividad: "Hace 5 días" },
  { id: 6, nombre: "Laura Torres",   correo: "laura.torres@gobcauca.gov.co",   rol: "usuario",  estado: "Activo",   ultimaActividad: "Hace 1 hora" },
];

export const actividadRecienteData = [
  { texto: "Juan Díaz inició sesión",        tiempo: "Hace 2 horas" },
  { texto: "María González creó una JAC",    tiempo: "Hace 4 horas" },
  { texto: "Carlos Pérez generó un reporte", tiempo: "Hace 6 horas" },
];

interface UsuarioFilters {
  busqueda: string;
  rol: string;
}

const initialFilters: UsuarioFilters = { busqueda: "", rol: "" };

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>(usuariosData);
  const [filters,  setFilters]  = useState<UsuarioFilters>(initialFilters);

  const filtered = usuarios.filter((u) => {
    const matchBusqueda =
      !filters.busqueda ||
      u.nombre.toLowerCase().includes(filters.busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(filters.busqueda.toLowerCase());
    const matchRol = !filters.rol || u.rol === filters.rol;
    return matchBusqueda && matchRol;
  });

  const stats = {
    total:     usuarios.length,
    activos:   usuarios.filter((u) => u.estado === "Activo").length,
    admins:    usuarios.filter((u) => u.rol === "admin").length,
    operadores:usuarios.filter((u) => u.rol === "operador").length,
    usuarios:  usuarios.filter((u) => u.rol === "usuario").length,
    inactivos: usuarios.filter((u) => u.estado === "Inactivo").length,
  };

  const crearUsuario = (correo: string, rol: RolUsuario) => {
    const newId = Math.max(...usuarios.map((u) => u.id)) + 1;
    setUsuarios((prev) => [
      ...prev,
      {
        id: newId,
        nombre: correo.split("@")[0],
        correo,
        rol,
        estado: "Activo",
        ultimaActividad: "Recién creado",
      },
    ]);
  };

  const editarRol = (id: number, rol: RolUsuario) =>
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, rol } : u)));

  const toggleEstado = (id: number) =>
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, estado: u.estado === "Activo" ? "Inactivo" : "Activo" } : u
      )
    );

  const limpiarFiltros = () => setFilters(initialFilters);

  return {
    filtered, filters, stats, actividadReciente: actividadRecienteData,
    crearUsuario, editarRol, toggleEstado, limpiarFiltros,
    setBusqueda: (v: string) => setFilters((p) => ({ ...p, busqueda: v })),
    setRol:      (v: string) => setFilters((p) => ({ ...p, rol: v })),
  };
}