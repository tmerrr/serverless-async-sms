import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { publishToQueue } from '../adapters/snsAdapter';
import { DispatchMessageBody } from '../types';

// const validateEventBody = (eventBody: APIGatewayProxyEvent['body']): DispatchMessageBody => {
//   try {
//     if (!eventBody) {

//     }
//   } catch (err: unknown) {
    
//   }
// };

export const handler: APIGatewayProxyHandler = async (event, context) => {
  const invalidRequestResponse: APIGatewayProxyResult = {
    statusCode: 400,
    body: JSON.stringify({
      message: '"message" and "phoneNumber" are both required properties',
    }),
  };
  const { awsRequestId: correlationId } = context;
  const logContext = { correlationId };
  if (!event.body) {
    console.log('No event body present in event', logContext);
    return invalidRequestResponse;
  }
  const { message, phoneNumber } = JSON.parse(event.body);
  if (!message || !phoneNumber) {
    console.log('Event body is missing required fields', logContext);
    return invalidRequestResponse;
  }
  // const { awsRequestId } = context;
  await publishToQueue({
    message,
    phoneNumber,
  }, correlationId);
  return {
    statusCode: 202,
    body: JSON.stringify({ message: 'Accepted' }),
  };
};
