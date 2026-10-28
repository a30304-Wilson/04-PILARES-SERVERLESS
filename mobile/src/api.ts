import type { FestivalEvent, EventInput, EventStatus } from './types';
 
// URL base sin /events al final. Sustituye sólo este valor en el bloque 09.
export const API_URL = 'http://localhost:3000/dev';
 
async function request(path: string, method = 'GET', body?: unknown): Promise<unknown> {
  const response = await fetch(API_URL + path, {
    method,
    ...(body !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {})
  });
  const value: unknown = await response.json();
  if (!response.ok) {
    const message = typeof value === 'object' && value !== null && 'message' in value
      ? String(value.message) : response.statusText;
    throw new Error('HTTP ' + response.status + ': ' + message);
  }
  return value;
}
 
function isFestivalEvent(value: unknown): value is FestivalEvent {
  return typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'artist' in value && typeof value.artist === 'string' &&
    'space' in value && typeof value.space === 'string' &&
    'time' in value && typeof value.time === 'string' &&
    'status' in value && (value.status === 'CONFIRMED' || value.status === 'CANCELLED');
}
 
export async function getEvents(): Promise<FestivalEvent[]> {
  const value = await request('/events');
  if (!Array.isArray(value) || !value.every(isFestivalEvent)) throw new Error('La API no devolvió una lista de actuaciones válida');
  return value;
}
 
export const createEvent = (input: EventInput) => request('/events', 'POST', input);
export const replaceEvent = (id: string, input: EventInput) => request('/events/' + encodeURIComponent(id), 'PUT', input);
export const updateEvent = (id: string, status: EventStatus) => request('/events/' + encodeURIComponent(id), 'PATCH', { status });
export const deleteEvent = (id: string) => request('/events/' + encodeURIComponent(id), 'DELETE');
 