import { useMemo } from "react";
import { jacData } from "./useJac";
import { asocomunalesData } from "./useAsocomunales";
import { useSolicitudes } from "./useSolicitudes";

export type TipoNotificacion =
  | "solicitud"
  | "documento_vencido"
  | "documento_por_vencer"
  | "riesgo_organizativo"
  | "nuevo_usuario"
  | "migracion";

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  descripcion: string;
  fecha: string;
  nivel: "info" | "warning" | "error" | "success";
}

const nuevosUsuariosMock: Notificacion[] = [
  {
    id: "nu-1",
    tipo: "nuevo_usuario",
    titulo: "Nuevo usuario registrado",
    descripcion: "Pedro Revisión se unió con Google Auth",
    fecha: "2025-04-02",
    nivel: "info",
  },
];

const migracionesMock: Notificacion[] = [
  {
    id: "mig-1",
    tipo: "migracion",
    titulo: "Migración completada",
    descripcion: "Se importaron 142 registros JAC correctamente",
    fecha: "2025-04-01",
    nivel: "success",
  },
  {
    id: "mig-2",
    tipo: "migracion",
    titulo: "Migración con errores",
    descripcion: "3 registros no pudieron importarse por datos incompletos",
    fecha: "2025-04-01",
    nivel: "error",
  },
];

export function useNotificaciones(rol: string, userId?: number) {
  const hoy = new Date().toISOString().split("T")[0];

  const { filtered: solicitudes, notificaciones: misResultados } =
    useSolicitudes(rol === "operador" ? userId : undefined);

  const pendientesAdmin = solicitudes.filter((s) => s.estado === "Pendiente");

  const notifs = useMemo<Notificacion[]>(() => {
    const result: Notificacion[] = [];

    if (rol === "operador") {
      misResultados.forEach((s) => {
        result.push({
          id: `sol-${s.id}`,
          tipo: "solicitud",
          titulo: s.estado === "Aprobada" ? "Solicitud aprobada" : "Solicitud rechazada",
          descripcion: s.descripcion,
          fecha: s.fecha,
          nivel: s.estado === "Aprobada" ? "success" : "error",
        });
      });

      jacData
        .filter((j) => j.documental === "Vencida")
        .forEach((j) => {
          result.push({
            id: `jac-venc-${j.id}`,
            tipo: "documento_vencido",
            titulo: "Documento vencido — JAC",
            descripcion: `${j.nombre} tiene documentación vencida`,
            fecha: hoy,
            nivel: "error",
          });
        });

      jacData
        .filter((j) => j.documental === "Por vencer")
        .forEach((j) => {
          result.push({
            id: `jac-pvenc-${j.id}`,
            tipo: "documento_por_vencer",
            titulo: "Documento por vencer — JAC",
            descripcion: `${j.nombre} tiene documentación próxima a vencer`,
            fecha: hoy,
            nivel: "warning",
          });
        });

      asocomunalesData
        .filter((a) => a.documental === "Vencida")
        .forEach((a) => {
          result.push({
            id: `asoc-venc-${a.id}`,
            tipo: "documento_vencido",
            titulo: "Documento vencido — Asocomunal",
            descripcion: `${a.nombre} tiene documentación vencida`,
            fecha: hoy,
            nivel: "error",
          });
        });

      asocomunalesData
        .filter((a) => a.documental === "Por vencer")
        .forEach((a) => {
          result.push({
            id: `asoc-pvenc-${a.id}`,
            tipo: "documento_por_vencer",
            titulo: "Documento por vencer — Asocomunal",
            descripcion: `${a.nombre} tiene documentación próxima a vencer`,
            fecha: hoy,
            nivel: "warning",
          });
        });

      jacData
        .filter((j) => j.organizativo === "Inactiva")
        .forEach((j) => {
          result.push({
            id: `jac-inac-${j.id}`,
            tipo: "riesgo_organizativo",
            titulo: "Riesgo organizativo — JAC",
            descripcion: `${j.nombre} está marcada como inactiva`,
            fecha: hoy,
            nivel: "warning",
          });
        });
    }

    if (rol === "admin") {
      pendientesAdmin.forEach((s) => {
        result.push({
          id: `sol-${s.id}`,
          tipo: "solicitud",
          titulo: "Solicitud pendiente",
          descripcion: `${s.operador}: ${s.descripcion}`,
          fecha: s.fecha,
          nivel: "warning",
        });
      });

      jacData
        .filter((j) => j.documental === "Vencida")
        .forEach((j) => {
          result.push({
            id: `jac-venc-${j.id}`,
            tipo: "documento_vencido",
            titulo: "Documento vencido — JAC",
            descripcion: `${j.nombre} requiere actualización documental`,
            fecha: hoy,
            nivel: "error",
          });
        });

      asocomunalesData
        .filter((a) => a.documental === "Vencida")
        .forEach((a) => {
          result.push({
            id: `asoc-venc-${a.id}`,
            tipo: "documento_vencido",
            titulo: "Documento vencido — Asocomunal",
            descripcion: `${a.nombre} requiere actualización documental`,
            fecha: hoy,
            nivel: "error",
          });
        });

      jacData
        .filter((j) => j.documental === "Por vencer")
        .forEach((j) => {
          result.push({
            id: `jac-pvenc-${j.id}`,
            tipo: "documento_por_vencer",
            titulo: "Documento por vencer — JAC",
            descripcion: `${j.nombre} vence pronto`,
            fecha: hoy,
            nivel: "warning",
          });
        });

      asocomunalesData
        .filter((a) => a.documental === "Por vencer")
        .forEach((a) => {
          result.push({
            id: `asoc-pvenc-${a.id}`,
            tipo: "documento_por_vencer",
            titulo: "Documento por vencer — Asocomunal",
            descripcion: `${a.nombre} vence pronto`,
            fecha: hoy,
            nivel: "warning",
          });
        });

      result.push(...nuevosUsuariosMock, ...migracionesMock);
    }

    const orden = { error: 0, warning: 1, success: 2, info: 3 };
    return result.sort((a, b) => orden[a.nivel] - orden[b.nivel]);
  }, [rol, userId, misResultados.length, pendientesAdmin.length]);

  return { notifs, count: notifs.length };
}
