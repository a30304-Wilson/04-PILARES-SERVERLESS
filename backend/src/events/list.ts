import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { catalog, json } from './model.js';
 
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('LIST eventos:', event.httpMethod);
  return json(200, catalog);
};
 