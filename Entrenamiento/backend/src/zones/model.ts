import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const ZONE_STATUSES = ['OPEN', 'FULL', 'CLOSED'] as const;
export type ZoneStatus = (typeof ZONE_STATUSES)[number];

export interface Zone {
  id: string;
  name: string;
  capacity: number;
  status: ZoneStatus;
}
export type ZoneInput = Omit<Zone, 'id'>;

// Catálogo en memoria: se pierde al reiniciar offline o en un cold start de Lambda.
export const zones: Zone[] = [
  { id: 'ZONE-07', name: 'Garden Stage', capacity: 2500, status: 'OPEN' },
  { id: 'ZONE-08', name: 'Main Gate', capacity: 5000, status: 'OPEN' }
];

export const findIndex = (id: string | undefined) => zones.findIndex(z => z.id === id);

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
};

export function json(statusCode: number, body: unknown): APIGatewayProxyResult {
  return { statusCode, headers, body: JSON.stringify(body) };
}
export const errorResponse = (statusCode: number, message: string) => json(statusCode, { message });

// Esta línea es la que verás en los logs de CloudWatch.
export function logRequest(event: APIGatewayProxyEvent): void {
  console.log(JSON.stringify({
    method: event.httpMethod,
    path: event.path,
    pathParameters: event.pathParameters,
    body: event.body
  }));
}

type ParsedBody =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; error: string };

export function parseBody(raw: string | null): ParsedBody {
  if (!raw) return { ok: false, error: 'El cuerpo de la petición está vacío' };
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return { ok: false, error: 'El cuerpo debe ser un objeto JSON' };
    }
    return { ok: true, value: value as Record<string, unknown> };
  } catch {
    return { ok: false, error: 'El cuerpo no es JSON válido' };
  }
}

// partial = false → POST/PUT (todos los campos obligatorios)
// partial = true  → PATCH (solo se validan los campos recibidos)
export function validateZone(body: Record<string, unknown>, partial: boolean) {
  const errors: string[] = [];
  const data: Partial<ZoneInput> = {};
  const { name, capacity, status } = body;

  if (name !== undefined || !partial) {
    if (typeof name === 'string' && name.trim() !== '') data.name = name.trim();
    else errors.push('name debe ser un texto no vacío');
  }
  if (capacity !== undefined || !partial) {
    if (typeof capacity === 'number' && Number.isInteger(capacity) && capacity > 0) data.capacity = capacity;
    else errors.push('capacity debe ser un entero mayor que 0');
  }
  if (status !== undefined || !partial) {
    if (typeof status === 'string' && (ZONE_STATUSES as readonly string[]).includes(status)) {
      data.status = status as ZoneStatus;
    } else errors.push('status debe ser uno de: ' + ZONE_STATUSES.join(', '));
  }
  if (partial && errors.length === 0 && Object.keys(data).length === 0) {
    errors.push('PATCH necesita al menos un campo: name, capacity o status');
  }
  return { errors, data };
}