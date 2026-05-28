import { ImportStrategy } from '../../../migracion_datos/utils/strategies/importStrategy.interface';

const getRowVal = (row: any, keys: string[]): string => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) {
      return row[key].toString().trim();
    }
  }
  return '';
};

/**
 * Detecta si una celda de Excel está marcada con una X (checkbox).
 * Soporta: 'X', 'x', '1', 'SI', 'SÍ', 'YES', true, 1 numérico.
 * Excluye valores vacíos, '0', 'NO', 'FALSE'.
 */
const isMarked = (val: any): boolean => {
  if (val === undefined || val === null || val === '') return false;
  const s = val.toString().trim().toUpperCase();
  return s === 'X' || s === '1' || s === 'SI' || s === 'SÍ' || s === 'YES' || s === 'TRUE';
};

/**
 * Busca entre las columnas individuales de checkbox cuál está marcada con X
 * y devuelve la etiqueta canónica correspondiente, o '' si ninguna está marcada.
 * @param row - La fila del Excel.
 * @param options - Array de {keys: string[], label: string} donde keys son los posibles
 *                  nombres de columna que representan esa opción en el Excel.
 */
const resolveCheckboxField = (row: any, options: Array<{ keys: string[], label: string }>): string => {
  for (const { keys, label } of options) {
    for (const key of keys) {
      if (isMarked(row[key])) return label;
    }
  }
  return '';
};

export class AfiliadosLibroStrategy implements ImportStrategy {
  getExpectedHeaders(): string[] {
    return [
      'NOMBRES Y APELLIDOS', 'OMBRES Y APELLIDOS', 'NOMBRE Y APELLIDO', 'NOMBRES', 'NOMBRE',
      'FECHA DE NACIMIENTO', 'FECHA NACIMIENTO', 'NACIMIENTO', 'FECHA DE NACIMIENTO (DD/MM/AAAA)',
      'IDENTIFICACION', 'N° DE IDENTIFICACIÓN', 'DOCUMENTO', 'DOCUMENTO DE IDENTIDAD', 'CEDULA', 'CÉDULA'
    ];
  }

  transform(rawData: any[]): any[] {
    if (!rawData || rawData.length === 0) {
      throw new Error('El archivo no contiene registros en la hoja de Libro de Asociados');
    }

    const mappedData = rawData.map((row) => {
      const nombreYApellido = getRowVal(row, ['NOMBRES Y APELLIDOS', 'OMBRES Y APELLIDOS', 'NOMBRE Y APELLIDO', 'NOMBRES', 'NOMBRE']);
      const parts = nombreYApellido.split(' ').filter(Boolean);
      let nombre = '';
      let apellido = '';
      if (parts.length > 2) {
        nombre = parts.slice(0, 2).join(' ');
        apellido = parts.slice(2).join(' ');
      } else if (parts.length === 2) {
        nombre = parts[0];
        apellido = parts[1];
      } else {
        nombre = parts[0] || '';
        apellido = '';
      }

      // Convertir fecha de excel
      let fechaNacimientoStr = getRowVal(row, ['FECHA DE NACIMIENTO', 'FECHA NACIMIENTO', 'NACIMIENTO', 'FECHA DE NACIMIENTO (DD/MM/AAAA)']);
      let fechaNacimiento = null;
      if (fechaNacimientoStr) {
         try {
           const numericVal = Number(fechaNacimientoStr);
           if (!isNaN(numericVal) && numericVal > 0) {
              // Excel serial date to JS Date
              fechaNacimiento = new Date((numericVal - (25567 + 2)) * 86400 * 1000).toISOString().split('T')[0];
           } else {
              // Try to parse string
              const parts = fechaNacimientoStr.split('/');
              if (parts.length === 3) {
                 // Assuming DD/MM/YYYY
                 fechaNacimiento = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              } else {
                 fechaNacimiento = new Date(fechaNacimientoStr).toISOString().split('T')[0];
              }
           }
         } catch(e) {
            // ignore
         }
      }

      return {
        nombre,
        apellido,
        cedula: getRowVal(row, ['IDENTIFICACION', 'N° DE IDENTIFICACIÓN', 'DOCUMENTO', 'DOCUMENTO DE IDENTIDAD', 'CEDULA', 'CÉDULA']),
        lugarExpedicionCedula: getRowVal(row, ['LUGAR DE EXPEDICIÓN DE DOCUMENTO', 'LUGAR DE EXPEDICIÓN', 'LUGAR DE EXPEDICION', 'EXPEDICION', 'EXPEDICIÓN']),
        fechaNacimiento: fechaNacimiento,
        rangoEdad: getRowVal(row, ['RANGO DE EDAD', 'EDAD', 'RANGO EDAD']),
        estudiosRealizados: getRowVal(row, ['ESTUDIOS REALIZADOS', 'ESTUDIOS', 'ESTUDIO', 'NIVEL DE ESTUDIOS']),
        ocupacion: getRowVal(row, ['OCUPACION', 'OCUPACIÓN', 'PROFESION', 'PROFESIÓN']),
        // Género: primero intenta detectar columnas de checkbox (X), luego columna de texto único
        genero: resolveCheckboxField(row, [
          { keys: ['H', 'Hombre', 'HOMBRE', 'MASCULINO', 'M (HOMBRE)'], label: 'H' },
          { keys: ['M', 'Mujer', 'MUJER', 'FEMENINO', 'M (MUJER)'], label: 'M' },
          { keys: ['LGTBIQ+', 'LGBTIQ+', 'LGBTIQ', 'LGTBIQ', 'LGBTI', 'DIVERSO'], label: 'LGTBIQ+' },
        ]) || getRowVal(row, ['GÉNERO (H/M/LGTBIQ+)', 'GENERO', 'GÉNERO', 'SEXO']),
        // Grupo étnico: primero intenta detectar columnas de checkbox (X), luego columna de texto único
        grupoEtnico: resolveCheckboxField(row, [
          { keys: ['Afro', 'AFRO', 'Afrocolombiano', 'AFROCOLOMBIANO', 'AFRODESCENDIENTE'], label: 'Afro' },
          { keys: ['Indígena', 'Indigena', 'INDÍGENA', 'INDIGENA'], label: 'Indígena' },
          { keys: ['Mestizo', 'MESTIZO'], label: 'Mestizo' },
          { keys: ['Campesino', 'CAMPESINO'], label: 'Campesino' },
          { keys: ['ROM', 'Gitano', 'GITANO', 'RROM'], label: 'ROM' },
          { keys: ['Raizal', 'RAIZAL'], label: 'Raizal' },
          { keys: ['Palenquero', 'PALENQUERO'], label: 'Palenquero' },
        ]) || getRowVal(row, ['GRUPO ETNICO', 'GRUPO ÉTNICO', 'ETNIA', 'GRUPO_ETNICO']),
        discapacitado: getRowVal(row, ['DISCAPACITADO (SI/NO)', 'DISCAPACITADO', 'DISCAPACIDAD']).toUpperCase() === 'SI' ? true : getRowVal(row, ['DISCAPACITADO (SI/NO)', 'DISCAPACITADO', 'DISCAPACIDAD']).toUpperCase() === 'NO' ? false : undefined,
        telefono: getRowVal(row, ['TELÉFONO', 'TELEFONO', 'N° TELEFONICO', 'N° TELEFÓNICO', 'CELULAR']),
        correo: getRowVal(row, ['CORREO ELECTRÓNICO', 'CORREO ELECTRONICO', 'CORREO']),
        direccion: getRowVal(row, ['DIRECCION', 'DIRECCIÓN', 'DIRECCIÓN DE RESIDENCIA', 'DIRECCION DE RESIDENCIA']),
      };
    });

    return mappedData.filter(row => {
      const n = (row.nombre + ' ' + row.apellido).toLowerCase();
      const c = row.cedula?.toLowerCase() || '';
      const isHeader = n.includes('nombres y apellidos') || n.includes('ombres y apellidos') || c.includes('identificacion') || c.includes('cédula') || c.includes('cedula') || c.includes('documento') || c.includes('fecha de nacimiento');
      return !isHeader && (row.nombre || row.cedula);
    });
  }
}
