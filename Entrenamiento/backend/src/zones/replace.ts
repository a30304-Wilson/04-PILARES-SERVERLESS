import type { APIGatewayProxyHandler } from 'aws-lambda';
import { zones, findIndex, json, errorResponse, logRequest, parseBody, validateZone, type ZoneInput } from './model.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  logRequest(event);
  const index = findIndex(event.pathParameters?.id);
  if (index === -1) return errorResponse(404, 'Zona no encontrada');
  const parsed = parseBody(event.body);
  if (!parsed.ok) return errorResponse(400, parsed.error);
  const { errors, data } = validateZone(parsed.value, false);
  if (errors.length > 0) return errorResponse(400, errors.join('; '));

  zones[index] = { id: zones[index].id, ...(data as ZoneInput) };
  return json(200, zones[index]);
};