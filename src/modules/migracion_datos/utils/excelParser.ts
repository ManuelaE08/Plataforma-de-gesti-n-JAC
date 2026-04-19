import * as xlsx from 'xlsx';

export class ExcelParser {
  /**
   * Lee un ArrayBuffer y devuelve un arreglo de objetos JSON con los datos de la primera hoja.
   * @param buffer - El contenido del archivo Excel.
   * @param expectedHeaders - Encabezados esperados (provistos por la estrategia) para detectar la fila correcta.
   */
  static async parse(buffer: ArrayBuffer, expectedHeaders: string[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      try {
        const workbook = xlsx.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
          throw new Error('El archivo Excel no contiene hojas de cálculo.');
        }

        const sheet = workbook.Sheets[sheetName];

        // Replicar los valores de las celdas combinadas en todas las celdas individuales correspondientes
        if (sheet['!merges']) {
          sheet['!merges'].forEach((merge) => {
            const startCol = merge.s.c;
            const endCol = merge.e.c;
            const startRow = merge.s.r;
            const endRow = merge.e.r;

            const originCellAddress = xlsx.utils.encode_cell({ c: startCol, r: startRow });
            const originCell = sheet[originCellAddress];

            if (originCell) {
              for (let r = startRow; r <= endRow; r++) {
                for (let c = startCol; c <= endCol; c++) {
                  if (r === startRow && c === startCol) continue;
                  sheet[xlsx.utils.encode_cell({ c, r })] = { ...originCell };
                }
              }
            }
          });
        }

        // Detectar la fila de encabezados usando los headers provistos por la estrategia
        const headerRow = ExcelParser.detectHeaderRow(sheet, expectedHeaders);
        console.log(`[ExcelParser] Fila de encabezados detectada en índice: ${headerRow}`);

        const data = xlsx.utils.sheet_to_json(sheet, { range: headerRow });
        console.log(`[ExcelParser] Se leyeron ${data.length} filas.`);

        resolve(data);
      } catch (error: any) {
        console.error('[ExcelParser] Error:', error);
        reject(new Error(error.message || 'Error al leer el archivo Excel. Asegúrese de que tenga formato válido.'));
      }
    });
  }

  /**
   * Busca en las primeras filas de la hoja cuál contiene los encabezados esperados.
   * @param sheet - La hoja de cálculo.
   * @param expectedHeaders - Encabezados provistos por la estrategia activa.
   * @returns El índice de la fila de encabezados (0-indexed), o 3 como fallback.
   */
  private static detectHeaderRow(sheet: xlsx.WorkSheet, expectedHeaders: string[]): number {
    const ref = sheet['!ref'];
    if (!ref) return 3;

    const range = xlsx.utils.decode_range(ref);
    const maxRowsToScan = Math.min(range.e.r, 10);

    for (let r = 0; r <= maxRowsToScan; r++) {
      const rowValues: string[] = [];
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddress = xlsx.utils.encode_cell({ c, r });
        const cell = sheet[cellAddress];
        if (cell && cell.v !== undefined && cell.v !== null) {
          rowValues.push(cell.v.toString().trim());
        }
      }

      // Verificar si esta fila contiene al menos 2 de los encabezados esperados
      const matchCount = expectedHeaders.filter(header => rowValues.includes(header)).length;
      if (matchCount >= 2) {
        return r;
      }
    }

    // Fallback: asumir fila 4 (índice 3) como en el backend original
    console.warn('[ExcelParser] No se detectaron encabezados automáticamente, usando fila 4 por defecto.');
    return 3;
  }
}
