import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { IReporteAnalitico, ITerritorioItem, IDemografiaItem } from "../dtos/ReporteAnalitico.dto";
import type { JacListItem } from "../../jac/types";
import type { AfiliadoResponse } from "../../jac/services/afiliadosService";

export class ReporteAnaliticoService {
  /**
   * Construye el modelo DTO a partir del estado de la aplicación.
   */
  public static construirModeloReporte(
    summary: any,
    periodo: string,
    jacs: JacListItem[],
    demografiaReal: any
  ): IReporteAnalitico {
    // Agrupar JACs por municipio para el análisis territorial
    const municipiosMap = new Map<string, ITerritorioItem>();

    jacs.forEach((jac) => {
      const municipio = jac.municipio || "Desconocido";
      if (!municipiosMap.has(municipio)) {
        municipiosMap.set(municipio, {
          municipio,
          totalJacs: 0,
          activas: 0,
          inactivas: 0,
          totalAfiliados: 0,
        });
      }
      const m = municipiosMap.get(municipio)!;
      m.totalJacs += 1;
      if (jac.organizativo === "Activa") {
        m.activas += 1;
      } else {
        m.inactivas += 1;
      }
      m.totalAfiliados += jac.afiliados || 0;
    });

    const coberturaTerritorial = Array.from(municipiosMap.values()).sort(
      (a, b) => b.totalAfiliados - a.totalAfiliados
    );

    return {
      fechaGeneracion: new Date(),
      periodo,
      resumenEjecutivo: {
        totalJacs: summary.totalJacs,
        totalAsocomunales: summary.totalAsocomunales,
        activas: summary.activeJacs,
        inactivas: summary.inactiveJacs,
        totalAfiliados: summary.totalAffiliados,
        promedioAfiliados: summary.avgAffiliados,
        solicitudesPendientes: summary.pendingRequests,
        solicitudesAprobadasMes: summary.approvedThisMonth,
        solicitudesRechazadasMes: summary.rejectedThisMonth,
      },
      coberturaTerritorial,
      demografia: demografiaReal,
    };
  }

  /**
   * Genera el PDF a partir del DTO y lanza su descarga.
   */
  public static generarPDF(data: IReporteAnalitico): void {
    const doc = new jsPDF("p", "pt", "letter");

    const marginX = 40;
    let cursorY = 50;

    // --- PORTADA Y CABECERA ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138); // slate-900 / blue-800
    doc.text("Informe Ejecutivo de Analíticas", marginX, cursorY);

    cursorY += 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Generado el: ${data.fechaGeneracion.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })} - Período analizado: ${data.periodo}`,
      marginX,
      cursorY
    );

    cursorY += 40;

    // --- SECCIÓN 1: RESUMEN EJECUTIVO ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("1. Resumen Ejecutivo", marginX, cursorY);
    cursorY += 20;

    const resumenData = [
      ["Total JAC Registradas", String(data.resumenEjecutivo.totalJacs)],
      ["JAC Activas", String(data.resumenEjecutivo.activas)],
      ["JAC Inactivas", String(data.resumenEjecutivo.inactivas)],
      ["Total Asocomunales", String(data.resumenEjecutivo.totalAsocomunales)],
      ["Total Afiliados", String(data.resumenEjecutivo.totalAfiliados)],
      ["Promedio Afiliados / JAC", String(data.resumenEjecutivo.promedioAfiliados)],
      ["Solicitudes Pendientes", String(data.resumenEjecutivo.solicitudesPendientes)],
      ["Solicitudes Aprobadas (Mes)", String(data.resumenEjecutivo.solicitudesAprobadasMes)],
    ];

    autoTable(doc, {
      startY: cursorY,
      head: [["Indicador", "Valor"]],
      body: resumenData,
      theme: "grid",
      headStyles: { fillColor: [30, 58, 138] },
      styles: { fontSize: 10, cellPadding: 6 },
      columnStyles: { 0: { fontStyle: "bold" } },
      margin: { left: marginX, right: marginX },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 30;

    // --- SECCIÓN 2: COBERTURA TERRITORIAL ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("2. Cobertura Territorial", marginX, cursorY);
    cursorY += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Municipios ordenados por mayor cantidad de afiliados.", marginX, cursorY);
    cursorY += 15;

    const topMunicipios = data.coberturaTerritorial.slice(0, 15); // Mostrar top 15 para no saturar

    const territorioData = topMunicipios.map((m) => [
      m.municipio,
      String(m.totalJacs),
      String(m.activas),
      String(m.inactivas),
      String(m.totalAfiliados),
    ]);

    autoTable(doc, {
      startY: cursorY,
      head: [["Municipio", "Total JAC", "Activas", "Inactivas", "Afiliados"]],
      body: territorioData,
      theme: "grid",
      headStyles: { fillColor: [27, 127, 75] }, // verde
      styles: { fontSize: 9, cellPadding: 5 },
      margin: { left: marginX, right: marginX },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 30;

    // Verificar si necesitamos salto de página
    if (cursorY > 600) {
      doc.addPage();
      cursorY = 50;
    }

    // --- SECCIÓN 3: CARACTERIZACIÓN DEMOGRÁFICA ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`3. Caracterización Demográfica - ${data.demografia.lugar}`, marginX, cursorY);
    cursorY += 15;

    const createDemographyTable = (title: string, items: IDemografiaItem[], startY: number) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text(title, marginX, startY);
      
      autoTable(doc, {
        startY: startY + 10,
        head: [["Categoría", "Porcentaje", "Cantidad"]],
        body: items.map((i) => [i.label, `${i.porcentaje}%`, String(i.count)]),
        theme: "plain",
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
        styles: { fontSize: 9, cellPadding: 4, lineColor: [226, 232, 240], lineWidth: 0.5 },
        margin: { left: marginX, right: marginX },
      });
      return (doc as any).lastAutoTable.finalY + 20;
    };

    cursorY = createDemographyTable("Género", data.demografia.genero, cursorY);
    
    if (cursorY > 600) {
      doc.addPage();
      cursorY = 50;
    }
    
    cursorY = createDemographyTable("Grupo Étnico", data.demografia.etnia, cursorY);
    cursorY = createDemographyTable("Edad", data.demografia.edad, cursorY);

    if (cursorY > 600) {
      doc.addPage();
      cursorY = 50;
    }
    
    cursorY = createDemographyTable("Nivel Educativo", data.demografia.estudios, cursorY);
    cursorY = createDemographyTable("Ocupación", data.demografia.ocupacion, cursorY);

    if (cursorY > 600) {
      doc.addPage();
      cursorY = 50;
    }

    // --- SECCIÓN 4: CONCLUSIONES AUTOMÁTICAS ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("4. Conclusiones y Hallazgos", marginX, cursorY);
    cursorY += 20;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);

    const conclusiones = this.generarConclusionesAutomaticas(data);
    
    conclusiones.forEach((conclusion) => {
      // Split text to fit width
      const lines = doc.splitTextToSize(`• ${conclusion}`, doc.internal.pageSize.width - marginX * 2);
      doc.text(lines, marginX, cursorY);
      cursorY += (lines.length * 15) + 5;
      
      if (cursorY > 750) {
        doc.addPage();
        cursorY = 50;
      }
    });

    // Pie de página
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount} - Generado por Plataforma JAC y Asocomunales`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 20,
        { align: "center" }
      );
    }

    doc.save(`Reporte_Analiticas_${new Date().getTime()}.pdf`);
  }

  /**
   * Genera un arreglo de strings con conclusiones basadas en los datos
   */
  private static generarConclusionesAutomaticas(data: IReporteAnalitico): string[] {
    const conclusiones: string[] = [];

    // Conclusión sobre JACs activas
    if (data.resumenEjecutivo.totalJacs > 0) {
      const porcentajeActivas = Math.round((data.resumenEjecutivo.activas / data.resumenEjecutivo.totalJacs) * 100);
      conclusiones.push(`El ${porcentajeActivas}% de las JAC registradas en el sistema se encuentran activas (${data.resumenEjecutivo.activas} de ${data.resumenEjecutivo.totalJacs}).`);
    }

    // Conclusión sobre concentración de afiliados en municipios
    if (data.coberturaTerritorial.length > 0) {
      const topMunicipio = data.coberturaTerritorial[0];
      conclusiones.push(`La mayor concentración de afiliados se encuentra en el municipio de ${topMunicipio.municipio}, con un total de ${topMunicipio.totalAfiliados} afiliados agrupados en ${topMunicipio.totalJacs} JAC.`);
    }

    // Conclusión sobre demografía - Género
    if (data.demografia.genero.length > 0) {
      const mayorGenero = [...data.demografia.genero].sort((a, b) => b.porcentaje - a.porcentaje)[0];
      conclusiones.push(`En términos de género, la población está compuesta mayoritariamente por el género ${mayorGenero.label} representando el ${mayorGenero.porcentaje}% del total analizado.`);
    }

    // Conclusión sobre demografía - Edad
    if (data.demografia.edad.length > 0) {
      const mayorEdad = [...data.demografia.edad].sort((a, b) => b.porcentaje - a.porcentaje)[0];
      conclusiones.push(`El grupo etario predominante corresponde a ${mayorEdad.label}, conformando el ${mayorEdad.porcentaje}% de los afiliados.`);
    }

    // Conclusión sobre demografía - Nivel Educativo
    if (data.demografia.estudios.length > 0) {
      const mayorEstudio = [...data.demografia.estudios].sort((a, b) => b.porcentaje - a.porcentaje)[0];
      conclusiones.push(`El nivel educativo predominante entre la población registrada es ${mayorEstudio.label} (${mayorEstudio.porcentaje}%).`);
    }

    return conclusiones;
  }
}
