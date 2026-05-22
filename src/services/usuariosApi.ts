import { authClient } from "./authClient";

export type RolAPI = "superadmin" | "admin" | "operador";
export type RolAsignable = Exclude<RolAPI, "superadmin">;

export interface UsuarioAPI {
  id: string;
  nombre: string;
  correo: string;
  rol: RolAPI;
  activo: boolean;
  ultimaActividad?: string;
}

export interface CrearUsuarioPayload {
  correo: string;
  nombre: string;
  apellido: string;
  rol: RolAsignable;
  passwordTemporal: string;
}

export interface ActualizarUsuarioPayload {
  nombre?: string;
  activo?: boolean;
}

export const usuariosApi = {
  listar:     ()                                         => authClient.get<UsuarioAPI[]>("/usuarios"),
  crear:      (payload: CrearUsuarioPayload)             => authClient.post<UsuarioAPI>("/usuarios", payload),
  actualizar: (id: string, p: ActualizarUsuarioPayload) => authClient.patch<UsuarioAPI>(`/usuarios/${id}`, p),
  eliminar:   (id: string)                              => authClient.delete(`/usuarios/${id}`),
};
