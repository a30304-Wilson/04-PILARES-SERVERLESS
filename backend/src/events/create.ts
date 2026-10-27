import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { readBody, isEventInput, json } from './model.js';
 
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const input = readBody(event.body);
  if (!isEventInput(input)) return json(400, { message: 'JSON con artist, space, time HH:mm y status válido requerido' });
  console.log('POST evento:', input.artist);
  return json(201, { id: 'EVT-NEW', artist: input.artist, space: input.space, time: input.time, status: input.status });
};
 