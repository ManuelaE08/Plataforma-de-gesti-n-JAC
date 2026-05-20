import { useDashboard } from '../useDashboard';

describe('useDashboard', () => {
  it('devuelve los indicadores del dashboard', () => {
    const { kpis, actividadReciente, alertas, distribucionMunicipios } = useDashboard();

    expect(kpis).toHaveLength(4);
    expect(kpis[0]).toMatchObject({ label: 'JAC registradas', value: '128' });

    expect(actividadReciente).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ titulo: 'Nueva JAC registrada' }),
        expect.objectContaining({ estado: 'success' }),
      ]),
    );

    expect(alertas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nivel: 'Alto' }),
        expect.objectContaining({ nombre: 'Asocomunal Timbío' }),
      ]),
    );

    expect(distribucionMunicipios).toEqual(
      expect.arrayContaining([
        { municipio: 'Popayán', total: 34 },
        { municipio: 'Piendamó', total: 12 },
      ]),
    );
  });
});
