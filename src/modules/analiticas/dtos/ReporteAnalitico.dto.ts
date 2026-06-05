export interface IDemografiaItem {
  label: string;
  porcentaje: number;
  count: number;
}

export interface IResumenEjecutivo {
  totalJacs: number;
  totalAsocomunales: number;
  activas: number;
  inactivas: number;
  totalAfiliados: number;
  promedioAfiliados: number;
  solicitudesPendientes: number;
  solicitudesAprobadasMes: number;
  solicitudesRechazadasMes: number;
}

export interface ITerritorioItem {
  municipio: string;
  totalJacs: number;
  activas: number;
  inactivas: number;
  totalAfiliados: number;
}

export interface IReporteAnalitico {
  fechaGeneracion: Date;
  periodo: string;
  resumenEjecutivo: IResumenEjecutivo;
  coberturaTerritorial: ITerritorioItem[];
  demografia: {
    lugar: string;
    totalRegistros: number;
    genero: IDemografiaItem[];
    etnia: IDemografiaItem[];
    edad: IDemografiaItem[];
    estudios: IDemografiaItem[];
    ocupacion: IDemografiaItem[];
    discapacidad: IDemografiaItem[];
  };
}
