import type { APIGatewayProxyHandler } from 'aws-lambda';
import { zones, findIndex, json, errorResponse, logRequest } from './model.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  logRequest(event);
  const index = findIndex(event.pathParameters?.id);
  if (index === -1) return errorResponse(404, 'Zona no encontrada');
  return json(200, zones[index]);
};