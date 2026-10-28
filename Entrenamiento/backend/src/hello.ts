import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
 
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Evidencia: esta petición llegó a nuestra función.
  console.log('EVENT RECIBIDO:', event);
 
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Festival Control · equipo preparado',
      service: "hello"
    })
  };
};