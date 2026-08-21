/**
 * Tests para el cliente API del storefront.
 * Cubren: token en memoria (sin storage), decodificación de expiración JWT,
 * refresh silencioso con credentials, limpieza en logout,
 * y reintento ante 410 SESSION_EXPIRED.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setAccessToken,
  getAccessToken,
  decodeAccessTokenExpiry,
  refreshSession,
  logout,
  getMyProfile,
} from './client';
import type { SessionResponse } from '../types/api';

function b64url(obj: unknown): string {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const sessionResponse: SessionResponse = {
  access_token: `header.${b64url({ exp: 1700000000, sub: 'u1' })}.sig`,
  expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  user: {
    id: 'u1',
    display_name: 'Cliente',
    email: 'cliente@merkee.shop',
    role: 'cliente',
    must_change_password: false,
    phone: null,
  },
};

function mockFetchResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('storefront client: access token en memoria', () => {
  beforeEach(() => {
    setAccessToken(null);
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no persiste el token en localStorage ni sessionStorage', () => {
    setAccessToken('token-en-memoria');
    expect(getAccessToken()).toBe('token-en-memoria');
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('permite limpiar el token en memoria', () => {
    setAccessToken('token');
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });
});

describe('storefront client: decodeAccessTokenExpiry', () => {
  it('decodifica exp de un JWT en milisegundos', () => {
    const token = `h.${b64url({ exp: 1700000000 })}.s`;
    expect(decodeAccessTokenExpiry(token)).toBe(1700000000 * 1000);
  });

  it('retorna null para token malformado o sin exp', () => {
    expect(decodeAccessTokenExpiry('no-es-jwt')).toBeNull();
    expect(decodeAccessTokenExpiry(`h.${b64url({ sub: 'u1' })}.s`)).toBeNull();
  });
});

describe('storefront client: refresh silencioso', () => {
  beforeEach(() => {
    setAccessToken(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refreshSession envía credentials include y actualiza el token en memoria', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(sessionResponse, 200));
    vi.stubGlobal('fetch', fetchMock);

    const result = await refreshSession();

    expect(result.access_token).toBe(sessionResponse.access_token);
    expect(getAccessToken()).toBe(sessionResponse.access_token);
    const call = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(call[1].credentials).toBe('include');
    expect(call[1].method).toBe('POST');
  });

  it('logout limpia el token en memoria', async () => {
    setAccessToken('token-a-limpiar');
    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(undefined, 204));
    vi.stubGlobal('fetch', fetchMock);

    await logout();

    expect(getAccessToken()).toBeNull();
  });
});

describe('storefront client: reintento 410 SESSION_EXPIRED', () => {
  beforeEach(() => {
    setAccessToken('token-vigente');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hace refresh + reintento una vez ante 410 SESSION_EXPIRED', async () => {
    const userProfile = { id: 'u1', display_name: 'Cliente', email: 'cliente@merkee.shop', role: 'cliente' as const, must_change_password: false, phone: null };
    const error410 = { status: 410, code: 'SESSION_EXPIRED', message: 'Sesión expirada' };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockFetchResponse(error410, 410))
      .mockResolvedValueOnce(mockFetchResponse(sessionResponse, 200))
      .mockResolvedValueOnce(mockFetchResponse(userProfile, 200));
    vi.stubGlobal('fetch', fetchMock);

    const result = await getMyProfile();

    // Primera llamada: request original (410)
    // Segunda llamada: refresh session
    // Tercera llamada: reintento del request original
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result).toEqual(userProfile);
    expect(getAccessToken()).toBe(sessionResponse.access_token);
  });

  it('NO reintenta ante 410 CART_RESERVATION_EXPIRED', async () => {
    const error410 = { status: 410, code: 'CART_RESERVATION_EXPIRED', message: 'Reserva expirada' };

    const fetchMock = vi.fn().mockResolvedValue(mockFetchResponse(error410, 410));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMyProfile()).rejects.toMatchObject({
      status: 410,
      code: 'CART_RESERVATION_EXPIRED',
    });

    // Solo 1 llamada: no se hizo refresh ni reintento
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('limpia token y timer si refresh falla ante 410 SESSION_EXPIRED', async () => {
    const error410 = { status: 410, code: 'SESSION_EXPIRED', message: 'Sesión expirada' };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockFetchResponse(error410, 410))
      .mockRejectedValueOnce(new Error('Refresh falló'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMyProfile()).rejects.toBeTruthy();

    // Token limpiado tras refresh fallido
    expect(getAccessToken()).toBeNull();
  });

  it('no reintenta más de una vez ante 410 SESSION_EXPIRED (sin loop)', async () => {
    const error410 = { status: 410, code: 'SESSION_EXPIRED', message: 'Sesión expirada' };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockFetchResponse(error410, 410))
      .mockResolvedValueOnce(mockFetchResponse(sessionResponse, 200))
      .mockResolvedValueOnce(mockFetchResponse(error410, 410)); // Segundo 410 tras reintento
    vi.stubGlobal('fetch', fetchMock);

    await expect(getMyProfile()).rejects.toMatchObject({
      status: 410,
      code: 'SESSION_EXPIRED',
    });

    // 3 llamadas: original, refresh, reintento (que vuelve a fallar 410 pero sin reintentar de nuevo)
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
