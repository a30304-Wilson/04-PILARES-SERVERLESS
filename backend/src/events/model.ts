import type { APIGatewayProxyResult } from 'aws-lambda';
 
export type EventStatus = 'CONFIRMED' | 'CANCELLED';
export interface FestivalEvent {
  id: string;
  artist: string;
  space: string;
  time: string;
  status: EventStatus;
}
export type EventInput = Omit<FestivalEvent, 'id'>;
 
export const catalog: FestivalEvent[] = [
  { id: 'EVT-101', artist: 'Neon Waves', space: 'Main Stage', time: '22:30', status: 'CONFIRMED' },
  { id: 'EVT-102', artist: 'Midnight Session', space: 'Club Stage', time: '23:45', status: 'CONFIRMED' }
];
 
export const json = (statusCode: number, value: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(value)
});
 
export function readBody(text: string | null): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text ?? 'null');
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? value as Record<string, unknown> : null;
  } catch { return null; }
}
 
export function isEventInput(value: Record<string, unknown> | null): value is EventInput {
  return value !== null &&
    typeof value.artist === 'string' && value.artist.trim().length > 0 &&
    typeof value.space === 'string' && value.space.trim().length > 0 &&
    typeof value.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value.time) &&
    (value.status === 'CONFIRMED' || value.status === 'CANCELLED');
}
 