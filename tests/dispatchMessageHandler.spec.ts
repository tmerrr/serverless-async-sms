import { APIGatewayEvent, Context } from 'aws-lambda';
import * as snsAdapter from '../src/adapters/snsAdapter';
import { handler } from '../src/handlers/dispatchMessage';

type MockApiGatewayEvent = Pick<APIGatewayEvent, 'body'>;
type MockContext = Pick<Context, 'awsRequestId'>;

describe('Dispatch Message Handler', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('when a valid event body is received', () => {
    it('successfully publishes message to SNS ', async () => {
      const publishToQueueSpy = jest
        .spyOn(snsAdapter, 'publishToQueue')
        .mockResolvedValue(undefined);

      const messagePayload = {
        message: 'Hello world!',
        phoneNumber: '+441234567890',
      };
      const event: MockApiGatewayEvent = {
        body: JSON.stringify(messagePayload),
      };
      const context: MockContext = { awsRequestId: 'uuid' };
      const mockCallback = jest.fn();

      const result = await handler(
        event as APIGatewayEvent,
        context as Context,
        mockCallback,
      );
      expect(result).toEqual({
        statusCode: 202,
        body: JSON.stringify({ message: 'Accepted' }),
      });
      expect(publishToQueueSpy).toHaveBeenCalledTimes(1);
      expect(publishToQueueSpy).toHaveBeenCalledWith(
        messagePayload,
        context.awsRequestId,
      );
    });
  });

  describe('when a invalid event body is received with no body', () => {
    it('successfully publishes message to SNS ', async () => {
      const publishToQueueSpy = jest
        .spyOn(snsAdapter, 'publishToQueue')
        .mockResolvedValue(undefined);

      const messagePayload = {
        message: 'Hello world!',
        phoneNumber: '+441234567890',
      };
      const event = {};
      const context: MockContext = { awsRequestId: 'uuid' };
      const mockCallback = jest.fn();

      const result = await handler(
        event as APIGatewayEvent,
        context as Context,
        mockCallback,
      );
      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({ message: '"message" and "phoneNumber" are both required properties' }),
      });
      expect(publishToQueueSpy).not.toHaveBeenCalled();
    });
  });
});
