import { ImportStrategy } from './importStrategy.interface';

export class JacImportStrategy implements ImportStrategy {
  getExpectedHeaders(): string[] {
    return ['N°', 'MUNICIPIO', 'NOMBRE CORTO DE LA JUNTA DE ACCIÓN COMUNAL', 'No. CARPETA', 'N° DE CAJA', 'ACTIVA', 'CARGO', 'CORREO ELECTRONICO'];
  }

  transform(rawData: any[]): any[] {
    if (!rawData || rawData.length === 0) {
      throw new Error('El archivo no contiene registros');
    }

    // El parser ya se encarga de omitir los títulos de la tabla
    const mappedData = rawData.map((row) => {
      const numero = row['N°']?.toString().trim();
      const MUNICIPIO = row['MUNICIPIO'];
      const nombreCortoJAC = row['NOMBRE CORTO DE LA JUNTA DE ACCIÓN COMUNAL']?.toString().trim();
      const NoCarpeta = row['No. CARPETA ']?.toString().trim();
      const NoCaja = row['N° DE CAJA']?.toString().trim();
      const ACTIVA = row['ACTIVA']?.toString().trim();
      const OBSERVACIONESARCHIVO = row['OBSERVACIONES ARCHIVO DIGITAL']?.toString().trim();
      const OBSERVACIONESARCHIVOFISICO = row['OBSERVACIONES ARCHIVO FISICO']?.toString().trim();
      const TIPODEORGANISMOSCOMUNAL = row['TIPO DE ORGANISMOS COMUNAL']?.toString().trim();
      const NOMBRECOMPLETOJUNTA = row['NOMBRE COMPLETO JUNTA DE ACCIÓN COMUNAL']?.toString().trim();
      const PRIMERCONSIDERANDOPERSONERIAJURIDICA = row['PRIMER CONSIDERANDO PERSONERIA JURIDICA']?.toString().trim();
      const CARGO = row['CARGO']?.toString().trim();
      const NOMBREDEPRESIDENTE = row['NOMBRE DE PRESIDENTE 2022-2026']?.toString().trim();
      const NUMERODEIDENTIFICACION = row['N° DE IDENTIFICACIÓN']?.toString().trim();
      const LUGARDEEXPEDICION = row['LUGAR DE EXPEDICIÓN']?.toString().trim();
      const CAMBIOPRESIDENETE = row['CAMBIO PRESIDENETE']?.toString().trim();
      const NUMEROTELEFONICO = row['N° TELEFONICO']?.toString().trim();
      const CORREOELECTRONICO = row['CORREO ELECTRONICO']?.toString().trim();
      const ESTADOACTUALIZACION = row['ESTADO DE ACTUALIZACIÓN']?.toString().trim();
      const NOMBREDECOMITES = row['NOMBRE DE COMITES']?.toString().trim();
      const FECHADEAPROBACION = row['FECHA DE APROBACIÓN']?.toString().trim();
      const NUMERODEAFILIADOS = row['N° DE AFILIADOS']?.toString().trim();
      const NUMERORUC = row['N° RUC']?.toString().trim();

      return {
        numero,
        municipio: MUNICIPIO?.toString().trim(),
        nombreCortoJAC,
        noCarpeta: NoCarpeta,
        noCaja: NoCaja,
        activa: ACTIVA,
        observacionesArchivo: OBSERVACIONESARCHIVO,
        observacionesArchivoFisico: OBSERVACIONESARCHIVOFISICO,
        tipoDeOrganismosComunal: TIPODEORGANISMOSCOMUNAL,
        nombreCompletoJunta: NOMBRECOMPLETOJUNTA,
        primerConsiderandoPersoneriaJuridica: PRIMERCONSIDERANDOPERSONERIAJURIDICA,
        cargo: CARGO,
        nombreDePresidente: NOMBREDEPRESIDENTE,
        numeroDeIdentificacion: NUMERODEIDENTIFICACION,
        lugarDeExpedicion: LUGARDEEXPEDICION,
        cambioPresidente: CAMBIOPRESIDENETE,
        numeroTelefonico: NUMEROTELEFONICO,
        correoElectronico: CORREOELECTRONICO,
        estadoActualizacion: ESTADOACTUALIZACION,
        nombreDeComites: NOMBREDECOMITES,
        fechaDeAprobacion: FECHADEAPROBACION,
        numeroDeAfiliados: NUMERODEAFILIADOS,
        numeroRuc: NUMERORUC,
      };
    });

    // Filtramos las filas si están completamente vacías
    return mappedData.filter(row => Object.values(row).some(val => val !== undefined && val !== null && val !== ''));
  }
}
