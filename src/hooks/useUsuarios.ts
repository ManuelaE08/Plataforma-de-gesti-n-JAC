import { useState, useEffect } from "react";
import { usuariosApi } from "../services/usuariosApi";
import type { UsuarioAPI, RolAsignable } from "../services/usuariosApi";

export type RolUsuario   = "superadmin" | "admin" | "operador" | "usuario";
export type EstadoUsuario = "Activo" | "Inactivo";

export interface UsuarioItem {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  ultimaActividad: string;
}

export const rolesInfo: Record<RolUsuario, { label: string; descripcion: string; variant: "green" | "blue" | "gray" }> = {
  superadmin: { label: "Superadmin",    descripcion: "Acceso total. Puede gestionar administradores y operadores.",                         variant: "green" },
  admin:      { label: "Administrador", descripcion: "Acceso completo al sistema, incluyendo aprobación de solicitudes y configuración.",   variant: "green" },
  operador:   { label: "Operador",      descripcion: "Puede crear y editar registros mediante solicitudes de aprobación.",                  variant: "blue"  },
  usuario:    { label: "Usuario",       descripcion: "Solo lectura: puede consultar registros pero no proponer cambios.",                   variant: "gray"  },
};

function normalizar(u: UsuarioAPI): UsuarioItem {
  return {
    id:               u.id,
    nombre:           u.nombre,
    correo:           u.correo,
    rol:              u.rol as RolUsuario,
    estado:           u.activo ? "Activo" : "Inactivo",
    ultimaActividad:  u.ultimaActividad ?? "—",
  };
}

interface Filters { busqueda: string; rol: string; }
const initialFilters: Filters = { busqueda: "", rol: "" };

export interface CrearUsuarioInput {
  correo: string;
  nombre: string;
  apellido: string;
  rol: RolAsignable;
  passwordTemporal: string;
}

export function useUsuarios() {
  const [usuarios,   setUsuarios]  = useState<UsuarioItem[]>([]);
  const [filters,    setFilters]   = useState<Filters>(initialFilters);
  const [isLoading,  setIsLoading] = useState(true);
  const [error,      setError]     = useState<string | null>(null);
  const [opLoading,  setOpLoading] = useState(false);

  const cargar = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usuariosApi.listar();
      setUsuarios(data.map(normalizar));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar los usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void cargar(); }, []);

  const filtered = usuarios.filter((u) => {
    const matchBusqueda =
      !filters.busqueda ||
      u.nombre.toLowerCase().includes(filters.busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(filters.busqueda.toLowerCase());
    const matchRol = !filters.rol || u.rol === filters.rol;
    return matchBusqueda && matchRol;
  });

  const stats = {
    total:       usuarios.length,
    activos:     usuarios.filter((u) => u.estado === "Activo").length,
    inactivos:   usuarios.filter((u) => u.estado === "Inactivo").length,
    superadmins: usuarios.filter((u) => u.rol === "superadmin").length,
    admins:      usuarios.filter((u) => u.rol === "admin").length,
    operadores:  usuarios.filter((u) => u.rol === "operador").length,
  };

  const crearUsuario = async (input: CrearUsuarioInput): Promise<void> => {
    setOpLoading(true);
    try {
      const nuevo = await usuariosApi.crear(input);
      setUsuarios((prev) => [...prev, normalizar(nuevo)]);
    } finally {
      setOpLoading(false);
    }
  };

  const editarUsuario = async (id: string, nombre: string): Promise<void> => {
    setOpLoading(true);
    try {
      const actualizado = await usuariosApi.actualizar(id, { nombre });
      setUsuarios((prev) => prev.map((u) => (u.id === id ? normalizar(actualizado) : u)));
    } finally {
      setOpLoading(false);
    }
  };

  const toggleEstado = async (id: string): Promise<void> => {
    const objetivo = usuarios.find((u) => u.id === id);
    if (!objetivo) return;
    setOpLoading(true);
    try {
      const actualizado = await usuariosApi.actualizar(id, {
        activo: objetivo.estado === "Inactivo",
      });
      setUsuarios((prev) => prev.map((u) => (u.id === id ? normalizar(actualizado) : u)));
    } finally {
      setOpLoading(false);
    }
  };

  const eliminarUsuario = async (id: string): Promise<void> => {
    setOpLoading(true);
    try {
      await usuariosApi.eliminar(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setOpLoading(false);
    }
  };

  return {
    filtered, filters, stats,
    isLoading, error, opLoading,
    crearUsuario, editarUsuario, toggleEstado, eliminarUsuario,
    recargar: cargar,
    limpiarFiltros: () => setFilters(initialFilters),
    setBusqueda: (v: string) => setFilters((p) => ({ ...p, busqueda: v })),
    setRol:      (v: string) => setFilters((p) => ({ ...p, rol: v })),
  };
}
