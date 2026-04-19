export interface ImportStrategy<T = any> {
  /** Encabezados esperados del Excel para esta entidad (usados para detectar la fila correcta) */
  getExpectedHeaders(): string[];

  /** Transforma los datos crudos del Excel en objetos tipados */
  transform(rawData: any[]): T[];
}
