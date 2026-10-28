import { ZONE_STATUSES } from './types';
import type { Zone, ZoneInput } from './types';

// Evita errores de tipos si el proyecto no incluye @types/node.
declare const process: { env: Record<string, string | undefined> };

// Cambia local/cloud con EXPO_PUBLIC_API_URL (sin barra final, hasta /dev).
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/dev';

async function request(path: string, method = 'GET', body?: unknown): Promise<unknown> {
  const response = await fetch(API_URL + path, {
    method,
    ...(body !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {})
  });
  const text = await response.text();
  let value: unknown = null;
  if (text) {
    try { value = JSON.parse(text); } catch { value = null; }
  }
  if (!response.ok) {
    const message = typeof value === 'object' && value !== null && 'message' in value
      ? String(value.message) : response.statusText;
    throw new Error('HTTP ' + response.status + ': ' + message);
  }
  return value;
}

function isZone(value: unknown): value is Zone {
  return typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'name' in value && typeof value.name === 'string' &&
    'capacity' in value && typeof value.capacity === 'number' &&
    'status' in value && (ZONE_STATUSES as readonly unknown[]).includes(value.status);
}

export async function getZones(): Promise<Zone[]> {
  const value = await request('/zones');
  if (!Array.isArray(value) || !value.every(isZone)) throw new Error('La API no devolvió una lista de zonas válida');
  return value;
}

export const createZone = (input: ZoneInput & { id?: string }) => request('/zones', 'POST', input);
export const replaceZone = (id: string, input: ZoneInput) => request('/zones/' + encodeURIComponent(id), 'PUT', input);
export const patchZone = (id: string, changes: Partial<ZoneInput>) => request('/zones/' + encodeURIComponent(id), 'PATCH', changes);
export const deleteZone = (id: string) => request('/zones/' + encodeURIComponent(id), 'DELETE');