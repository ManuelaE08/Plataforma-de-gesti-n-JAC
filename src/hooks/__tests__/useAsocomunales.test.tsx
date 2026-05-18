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

import { useAsocomunales } from '../../modules/asocomunales/hooks/useAsocomunales';
import { useAuth } from '../../context/AuthContext';
import { AsocomunalesService } from '../../modules/asocomunales/services/asocomunalesService';

vi.mock('../../context/AuthContext');

const mockAuth = useAuth as MockedFunction<typeof useAuth>;

const createMockAuth = () => ({
  user: null,
  isAuthLoading: false,
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
});

describe('useAsocomunales', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockAuth.mockReturnValue(createMockAuth());
  });

  afterEach(() => {
    cleanup();
  });

  it('carga asocomunales públicas cuando el usuario no es privilegiado', async () => {
    const mockItems = [
      {
        id: 1,
        nombre: 'Asocomunal Prueba',
        municipio: {
          id: 1,
          nombre: 'Popayán',
        },
        estado: true,
      },
    ];

    vi.spyOn(
      AsocomunalesService,
      'getAsocomunalesPublic'
    ).mockResolvedValue(mockItems as any);

    const { result } = renderHook(() => useAsocomunales());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(
      AsocomunalesService.getAsocomunalesPublic
    ).toHaveBeenCalledTimes(1);

    expect(result.current.data).toEqual(mockItems);

    expect(result.current.filtered).toEqual(mockItems);
  });

  it('resetea filtros con handleClear', async () => {
    vi.spyOn(
      AsocomunalesService,
      'getAsocomunalesPublic'
    ).mockResolvedValue([]);

    const { result } = renderHook(() => useAsocomunales());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.setBusqueda('abc');
      result.current.setMunicipio(1);
      result.current.setEstado(true);
    });

    expect(result.current.filters.busqueda).toBe('abc');

    expect(result.current.filters.municipio).toBe(1);

    expect(result.current.filters.estado).toBe(true);

    act(() => {
      result.current.handleClear();
    });

    expect(result.current.filters.busqueda).toBe('');

    expect(result.current.filters.municipio).toBeNull();

    expect(result.current.filters.estado).toBeNull();
  });
});