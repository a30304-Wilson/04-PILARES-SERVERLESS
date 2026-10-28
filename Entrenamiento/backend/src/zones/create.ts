import type { APIGatewayProxyHandler } from 'aws-lambda';
import { zones, findIndex, json, errorResponse, logRequest, parseBody, validateZone, type Zone, type ZoneInput } from './model.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  logRequest(event);
  const parsed = parseBody(event.body);
  if (!parsed.ok) return errorResponse(400, parsed.error);
  const { errors, data } = validateZone(parsed.value, false);
  if (errors.length > 0) return errorResponse(400, errors.join('; '));

  const requestedId = parsed.value.id;
  const id = typeof requestedId === 'string' && requestedId.trim() !== ''
    ? requestedId.trim()
    : 'ZONE-' + Date.now().toString(36).toUpperCase();
  if (findIndex(id) !== -1) return errorResponse(409, 'Ya existe una zona con ese id');

  const zone: Zone = { id, ...(data as ZoneInput) };
  zones.push(zone);
  return json(201, zone);
};