import React, { act } from 'react';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockedFunction,
} from 'vitest';

import { useJac } from '../useJac';
import { useAuth } from '../../context/AuthContext';
import { JACService } from '../../modules/jac/services/jacService';

vi.mock('../../context/AuthContext');

const mockAuth = useAuth as MockedFunction<typeof useAuth>;

const createMockAuth = () => ({
  user: null,
  isAuthLoading: false,
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
});

describe('useJac', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockAuth.mockReturnValue(createMockAuth());
  });

  afterEach(() => {
    cleanup();
  });

  it('carga JACs públicas cuando el usuario no está autenticado', async () => {
    const mockList = [
      {
        id: 1,
        nombre: 'JAC Prueba',
        municipio: 'Popayán',
        barrio: 'Centro',
        afiliados: 42,
        organizativo: 'Activa',
      },
    ];

    vi.spyOn(
      JACService,
      'findAllPublic'
    ).mockResolvedValue(mockList as any);

    const { result } = renderHook(() => useJac());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(JACService.findAllPublic).toHaveBeenCalledTimes(1);

    expect(result.current.jacData).toEqual(mockList);

    expect(result.current.filtered).toEqual(mockList);

    expect(result.current.getJacById(1)).toEqual(mockList[0]);
  });

  it('resetea filtros con handleClear', async () => {
    vi.spyOn(
      JACService,
      'findAllPublic'
    ).mockResolvedValue([]);

    const { result } = renderHook(() => useJac());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.setBusqueda('prueba');
      result.current.setMunicipio('Popayán');
      result.current.setEstado('Activa');
      result.current.setDocumental('Vigente');
      result.current.setMinAfiliados('10');
      result.current.setLimite(200);
    });

    await waitFor(() => {
      expect(result.current.filters.busqueda).toBe('prueba');
    });

    expect(result.current.filters.municipio).toBe('Popayán');

    expect(result.current.filters.estado).toBe('Activa');

    expect(result.current.filters.documental).toBe('Vigente');

    expect(result.current.filters.minAfiliados).toBe('10');

    expect(result.current.filters.limite).toBe(200);

    act(() => {
      result.current.handleClear();
    });

    await waitFor(() => {
      expect(result.current.filters.busqueda).toBe('');
    });

    expect(result.current.filters.municipio).toBe('');

    expect(result.current.filters.estado).toBe('');

    expect(result.current.filters.documental).toBe('');

    expect(result.current.filters.minAfiliados).toBe('');

    expect(result.current.filters.limite).toBe(100);
  });
});