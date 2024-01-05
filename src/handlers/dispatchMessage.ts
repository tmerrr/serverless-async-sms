import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { publishToQueue } from '../adapters/snsAdapter';
import { DispatchMessageBody, LogContext } from '../types';

export const handler: APIGatewayProxyHandler = async (event, context) => {
  const logContext: LogContext = {};
  try {
    // correlationId is used for tracing in logs
    // is also published to the queue so the queue processor can use the same correlation Id
    // this way logs could be filtered on correlation Id to view the entire cycle of a request
    const { awsRequestId: correlationId } = context;
    logContext.correlationId = correlationId;
    const eventBody = parseEventBody(event.body);
    // could extract body validation even further and maybe use a JSON schema to ensure the correct properties have been sent
    // felt that may be overkill in this case as some validators are quite large packages and we only need to validate two props for now
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
    // would replace console with an actual logger and serialize the error and log context
    console.error('An unexpected error occurred', err, logContext);
    return genResponse(500, 'Internal Server Error');
  }
};

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

const genResponse = (statusCode: number, message: string): APIGatewayProxyResult => ({
  statusCode,
  body: JSON.stringify({ message }),
});

const invalidRequestResponse: APIGatewayProxyResult = genResponse(
  400,
  '"message" and "phoneNumber" are both required properties',
);
