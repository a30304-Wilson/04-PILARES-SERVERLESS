import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
 
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  let body: unknown;

  try {
    body = JSON.parse(event.body ?? 'null');
  } catch {
    return { 
      statusCode: 400, body: JSON.stringify({ message: 'JSON inválido' }) 
    };
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { 
      statusCode: 400, body: JSON.stringify({ message: 'Se espera un objeto JSON' }) 
    };
  }

  if (
    !('artist' in body) || typeof body.artist !== 'string' || !body.artist.trim() ||
    !('space' in body) || typeof body.space !== 'string' || !body.space.trim() ||
    !('time' in body) || typeof body.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time)
  ) {
    return { 
      statusCode: 400, body: JSON.stringify({ message: 'artist, space y time (HH:mm) son obligatorios' }) 
    };
  }

  const status = 'status' in body ? body.status : 'CONFIRMED';

  if (status !== 'CONFIRMED' && status !== 'CANCELLED') {
    return { statusCode: 400, body: JSON.stringify({ message: 'status debe ser CONFIRMED o CANCELLED' }) };
  }

  console.log('POST evento:', body.artist);

  return {
    statusCode: 201,
    body: JSON.stringify({ 
      id: 'EVT-NEW', 
      artist: body.artist.trim(), 
      space: body.space.trim(), 
      time: body.time, 
      status 
    })
  };
};
 