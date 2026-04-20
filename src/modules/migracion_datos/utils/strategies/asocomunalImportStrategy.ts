import { ImportStrategy } from './importStrategy.interface';

export class AsocomunalImportStrategy implements ImportStrategy {
  getExpectedHeaders(): string[] {
    return ['N°', 'MUNICIPIO', 'ASOCOMUNALES', 'CONSIDERANDO', 'ESTADO DE LA JAC', 'NOMBRE DEL PRESIDENTE', 'N° CEDULA', 'NUMERO DE CONTACTO', 'CORREO ELECTRONICO'];
  }

  transform(rawData: any[]): any[] {
    if (!rawData || rawData.length === 0) {
      throw new Error('El archivo no contiene registros');
    }

    const mappedData = rawData.map((row) => {
      // Ignorar filas completamente vacías al mapear
      const isEmptyRow = Object.keys(row).length === 0 || Object.values(row).every(val => val === undefined || val === null || val === '');

      const no = row['N°']?.toString().trim();
      const municipio = row['MUNICIPIO']?.toString().trim();
      const asocomunal = row['ASOCOMUNALES']?.toString().trim();
      const considerando = row['CONSIDERANDO']?.toString().trim();
      const estadoJAC = row['ESTADO DE LA JAC']?.toString().trim();
      const nombrePresidente = row['NOMBRE DEL PRESIDENTE']?.toString().trim();
      const numeroCedula = row['N° CEDULA']?.toString().trim();
      const numeroContacto = row['NUMERO DE CONTACTO']?.toString().trim();
      const correoElectronico = row['CORREO ELECTRONICO']?.toString().trim();

      return {
        no,
        municipio,
        asocomunal,
        considerando,
        estadoJAC,
        nombrePresidente,
        numeroCedula,
        numeroContacto,
        correoElectronico,
      };
    });

    // Filtramos las filas si están completamente vacías
    return mappedData.filter(row => Object.values(row).some(val => val !== undefined && val !== null && val !== ''));
  }
}
