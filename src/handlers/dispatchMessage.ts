import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { publishToQueue } from '../adapters/snsAdapter';
import { DispatchMessageBody, LogContext } from '../types';

const genResponse = (statusCode: number, message: string): APIGatewayProxyResult => ({
  statusCode,
  body: JSON.stringify({ message }),
});

const invalidRequestResponse: APIGatewayProxyResult = genResponse(
  400,
  '"message" and "phoneNumber" are both required properties',
);

const parseEventBody = (eventBody: APIGatewayProxyEvent['body']): DispatchMessageBody | null => {
  if (!eventBody) {
    return null;
  }

  try {
    return JSON.parse(eventBody);
  } catch (err: unknown) {
    return null;
  }
}

export const handler: APIGatewayProxyHandler = async (event, context) => {
  const logContext: LogContext = {};
  try {
    const { awsRequestId: correlationId } = context;
    logContext.correlationId = correlationId;
    const eventBody = parseEventBody(event.body);
    if (!eventBody) {
      console.warn('Invalid body provided in event', logContext);
      return invalidRequestResponse;
    }
    const { message, phoneNumber } = eventBody;
    if (!message || !phoneNumber) {
      console.warn('Event body is missing required fields', logContext);
      return invalidRequestResponse;
    }
    console.log('Validated event body, publishing message to queue...', logContext);
    await publishToQueue({
      message,
      phoneNumber,
    }, correlationId);
    console.log('Successfully published message to queue', logContext);
    return genResponse(202, 'Accepted');
  } catch (err: unknown) {
    console.error('An unexpected error occurred', err, logContext);
    return genResponse(500, 'Internal Server Error');
  }
};
