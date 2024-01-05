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
    it('successfully publishes message to the queue and returns success response', async () => {
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

  describe('when the event has no body', () => {
    it('returns a bad request response', async () => {
      const publishToQueueSpy = jest
        .spyOn(snsAdapter, 'publishToQueue')
        .mockResolvedValue(undefined);

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

  describe('when the event body is missing "phoneNumber"', () => {
    it('returns a bad request response', async () => {
      const publishToQueueSpy = jest
        .spyOn(snsAdapter, 'publishToQueue')
        .mockResolvedValue(undefined);

      const messagePayload = {
        message: 'Hello world!',
      };
      const event = {
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
        statusCode: 400,
        body: JSON.stringify({ message: '"message" and "phoneNumber" are both required properties' }),
      });
      expect(publishToQueueSpy).not.toHaveBeenCalled();
    });
  });

  describe('when the event body is missing "message"', () => {
    it('returns a bad request response', async () => {
      const publishToQueueSpy = jest
        .spyOn(snsAdapter, 'publishToQueue')
        .mockResolvedValue(undefined);

      const messagePayload = {
        phoneNumber: '+441234567890',
      };
      const event = {
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
        statusCode: 400,
        body: JSON.stringify({ message: '"message" and "phoneNumber" are both required properties' }),
      });
      expect(publishToQueueSpy).not.toHaveBeenCalled();
    });
  });

  describe('when the event body is invalid JSON', () => {
    it('returns a bad request response', async () => {
      const publishToQueueSpy = jest
        .spyOn(snsAdapter, 'publishToQueue')
        .mockResolvedValue(undefined);

      const event = {
        body: 'foo bar',
      };
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

  describe('when the message fails to publish to the queue', () => {
    it('returns an internal server error response', async () => {
      const publishToQueueSpy = jest
        .spyOn(snsAdapter, 'publishToQueue')
        .mockRejectedValueOnce(new Error('Mock Error'));

      const messagePayload = {
        message: 'Hello world!',
        phoneNumber: '+441234567890',
      };
      const event = {
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
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
      expect(publishToQueueSpy).toHaveBeenCalled();
    });
  });
});
