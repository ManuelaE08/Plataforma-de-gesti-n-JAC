export interface KpiItem {
  label: string;
  value: string;
  sub: string;
  iconBg: string;
  iconColor: string;
}

export interface ActividadItem {
  titulo: string;
  descripcion: string;
  fecha: string;
  estado: "success" | "warning" | "info";
}

export interface AlertaItem {
  nombre: string;
  municipio: string;
  nivel: "Alto" | "Medio" | "Bajo";
  motivo: string;
}

export function useDashboard() {
  const kpis: KpiItem[] = [
    {
      label: "JAC registradas",
      value: "128",
      sub: "+12 este mes",
      iconBg: "bg-[#E4B400]/10",
      iconColor: "text-[#E4B400]",
    },
    {
      label: "Asocomunales",
      value: "26",
      sub: "+3 este trimestre",
      iconBg: "bg-[#2563EB]/10",
      iconColor: "text-[#2563EB]",
    },
    {
      label: "Pendientes por revisión",
      value: "14",
      sub: "Solicitudes activas",
      iconBg: "bg-[#F59E0B]/10",
      iconColor: "text-[#F59E0B]",
    },
    {
      label: "Alertas activas",
      value: "9",
      sub: "Riesgo organizativo",
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
    },
  ];

  const actividadReciente: ActividadItem[] = [
    {
      titulo: "Nueva JAC registrada",
      descripcion: "JAC Barrio San Camilo fue creada en Popayán.",
      fecha: "Hace 2 horas",
      estado: "success",
    },
    {
      titulo: "Reporte generado",
      descripcion: "Se exportó el consolidado de estado documental.",
      fecha: "Hace 4 horas",
      estado: "info",
    },
    {
      titulo: "Asocomunal pendiente",
      descripcion: "Asocomunal Norte del Cauca requiere validación.",
      fecha: "Hoy",
      estado: "warning",
    },
    {
      titulo: "Actualización de usuarios",
      descripcion: "Se modificaron permisos de operador regional.",
      fecha: "Ayer",
      estado: "info",
    },
  ];

  const alertas: AlertaItem[] = [
    {
      nombre: "JAC Vereda El Porvenir",
      municipio: "Piendamó",
      nivel: "Alto",
      motivo: "Documentación vencida e inactividad.",
    },
    {
      nombre: "Asocomunal Timbío",
      municipio: "Timbío",
      nivel: "Medio",
      motivo: "Pendiente de actualización documental.",
    },
    {
      nombre: "JAC Barrio Centro",
      municipio: "Timbío",
      nivel: "Bajo",
      motivo: "Documentos próximos a vencer.",
    },
  ];

  const distribucionMunicipios = [
    { municipio: "Popayán", total: 34 },
    { municipio: "Santander", total: 18 },
    { municipio: "Patía", total: 16 },
    { municipio: "Timbío", total: 14 },
    { municipio: "Piendamó", total: 12 },
  ];

  return {
    kpis,
    actividadReciente,
    alertas,
    distribucionMunicipios,
  };
}