import { ImportStrategy } from '../../../migracion_datos/utils/strategies/importStrategy.interface';

const getRowVal = (row: any, keys: string[]): string => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) {
      return row[key].toString().trim();
    }
  }
  return '';
};

const isMarked = (val: any): boolean => {
  if (val === undefined || val === null || val === '') return false;
  const s = val.toString().trim().toUpperCase();
  return s === 'X' || s === '1' || s === 'SI' || s === 'SÍ' || s === 'YES' || s === 'TRUE';
};

const resolveCheckboxField = (row: any, options: Array<{ keys: string[], label: string }>): string => {
  for (const { keys, label } of options) {
    for (const key of keys) {
      if (isMarked(row[key])) return label;
    }
  }
  return '';
};

export class DignatariosStrategy implements ImportStrategy {
  getExpectedHeaders(): string[] {
    return [
      'CARGO', 'AFILIADO', 'CARGO/ROL', 'DIGNATARIO', 'ROL',
      'NOMBRES Y APELLIDOS', 'OMBRES Y APELLIDOS', 'NOMBRE Y APELLIDO', 'NOMBRES', 'NOMBRE',
      'IDENTIFICACION', 'N° DE IDENTIFICACIÓN', 'DOCUMENTO', 'DOCUMENTO DE IDENTIDAD', 'CEDULA', 'CÉDULA'
    ];
  }

  transform(rawData: any[]): any[] {
    if (!rawData || rawData.length === 0) {
      throw new Error('El archivo no contiene registros en la hoja de Dignatarios');
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


      // Género: primero intenta columnas individuales con X (checkbox), luego columna de texto
      const genero = resolveCheckboxField(row, [
        { keys: ['H', 'Hombre', 'HOMBRE', 'MASCULINO'], label: 'H' },
        { keys: ['M', 'Mujer', 'MUJER', 'FEMENINO'], label: 'M' },
        { keys: ['LGTBIQ+', 'LGBTIQ+', 'LGBTIQ', 'LGTBIQ', 'LGBTI', 'DIVERSO'], label: 'LGTBIQ+' },
      ]) || getRowVal(row, ['GÉNERO (H/M/LGTBIQ+)', 'GENERO', 'GÉNERO', 'SEXO']);

      // Grupo étnico: primero intenta columnas individuales con X (checkbox), luego columna de texto
      const grupoEtnico = resolveCheckboxField(row, [
        { keys: ['Afro', 'AFRO', 'Afrocolombiano', 'AFROCOLOMBIANO', 'AFRODESCENDIENTE'], label: 'Afro' },
        { keys: ['Indígena', 'Indigena', 'INDÍGENA', 'INDIGENA'], label: 'Indígena' },
        { keys: ['Mestizo', 'MESTIZO'], label: 'Mestizo' },
        { keys: ['Campesino', 'CAMPESINO'], label: 'Campesino' },
        { keys: ['ROM', 'Gitano', 'GITANO', 'RROM'], label: 'ROM' },
        { keys: ['Raizal', 'RAIZAL'], label: 'Raizal' },
        { keys: ['Palenquero', 'PALENQUERO'], label: 'Palenquero' },
      ]) || getRowVal(row, ['GRUPO ETNICO', 'GRUPO ÉTNICO', 'ETNIA']);

      return {
        cargoNombre: getRowVal(row, ['CARGO', 'AFILIADO', 'Afiliado', 'CARGO/ROL', 'DIGNATARIO', 'ROL']),
        nombre,
        apellido,
        cedula: getRowVal(row, ['IDENTIFICACION', 'N° DE IDENTIFICACIÓN', 'DOCUMENTO', 'DOCUMENTO DE IDENTIDAD', 'CEDULA', 'CÉDULA']),
        lugarExpedicionCedula: getRowVal(row, ['LUGAR DE EXPEDICIÓN DE DOCUMENTO', 'LUGAR DE EXPEDICIÓN', 'LUGAR DE EXPEDICION', 'EXPEDICION', 'EXPEDICIÓN']),
        rangoEdad: getRowVal(row, ['EDAD', 'RANGO DE EDAD', 'RANGO EDAD']),
        ocupacion: getRowVal(row, ['OCUPACION', 'OCUPACIÓN', 'PROFESION', 'PROFESIÓN']),
        genero,
        grupoEtnico,
        direccion: getRowVal(row, ['DIRECCION', 'DIRECCIÓN', 'DIRECCIÓN DE RESIDENCIA', 'DIRECCION DE RESIDENCIA']),
        telefono: getRowVal(row, ['TELÉFONO', 'TELEFONO', 'N° TELEFONICO', 'N° TELEFÓNICO', 'CELULAR']),
      };
    });

    return mappedData.filter(row => {
      const n = (row.nombre + ' ' + row.apellido).toLowerCase();
      const c = row.cedula?.toLowerCase() || '';
      const isHeader = n.includes('nombres y apellidos') || n.includes('ombres y apellidos') || c.includes('identificacion') || c.includes('cédula') || c.includes('cedula') || c.includes('documento') || c.includes('teléfono') || c.includes('telefono');
      return !isHeader && (row.nombre || row.cedula);
    });
  }
}
