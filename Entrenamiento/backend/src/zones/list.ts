import type { APIGatewayProxyHandler } from 'aws-lambda';
import { zones, json, logRequest } from './model.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  logRequest(event);
  return json(200, zones);
};