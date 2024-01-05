import { APIGatewayProxyHandler } from 'aws-lambda';
import { publishToQueue } from '../adapters/snsAdapter';

export const handler: APIGatewayProxyHandler = async (event, context) => {
  const { message, phoneNumber } = JSON.parse(event.body!);
  const { awsRequestId } = context;
  await publishToQueue({
    message,
    phoneNumber,
  }, awsRequestId);
  return {
    statusCode: 202,
    body: JSON.stringify({ message: 'Accepted' }),
  };
};
