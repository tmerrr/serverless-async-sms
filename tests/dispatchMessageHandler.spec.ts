import { APIGatewayEvent, Context } from 'aws-lambda';
import * as snsAdapter from '../src/adapters/snsAdapter';
import { handler } from '../src/handlers/dispatchMessage';

type MockApiGatewayEvent = Pick<APIGatewayEvent, 'body'>;

const awsRequestId = 'uuid';
const runHandler = (event: MockApiGatewayEvent) => handler(
  event as APIGatewayEvent,
  { awsRequestId } as Context,
  jest.fn(),
)

const setupLoggerSpies = () => {
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'warn').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();
};

const setupPublishToQueueSpy = (): jest.SpyInstance => jest
  .spyOn(snsAdapter, 'publishToQueue')
  .mockResolvedValueOnce();

describe('Dispatch Message Handler', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    setupLoggerSpies();
  });

  describe('when a valid event body is received', () => {
    it('successfully publishes message to the queue and returns success response', async () => {
      const publishToQueueSpy = setupPublishToQueueSpy();

      const messagePayload = {
        message: 'Hello world!',
        phoneNumber: '+441234567890',
      };
      const event: MockApiGatewayEvent = {
        body: JSON.stringify(messagePayload),
      };

      const result = await runHandler(event);
      expect(result).toEqual({
        statusCode: 202,
        body: JSON.stringify({ message: 'Accepted' }),
      });
      expect(publishToQueueSpy).toHaveBeenCalledTimes(1);
      expect(publishToQueueSpy).toHaveBeenCalledWith(
        messagePayload,
        awsRequestId,
      );
    });
  });

  describe('when the event has no body', () => {
    it('returns a bad request response', async () => {
      const publishToQueueSpy = setupPublishToQueueSpy();
      const event = {};
      const result = await runHandler(event as MockApiGatewayEvent);
      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({ message: '"message" and "phoneNumber" are both required properties' }),
      });
      expect(publishToQueueSpy).not.toHaveBeenCalled();
    });
  });

  describe('when the event body is missing "phoneNumber"', () => {
    it('returns a bad request response', async () => {
      const publishToQueueSpy = setupPublishToQueueSpy();

      const messagePayload = {
        message: 'Hello world!',
      };
      const event = {
        body: JSON.stringify(messagePayload),
      };

      const result = await runHandler(event);
      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({ message: '"message" and "phoneNumber" are both required properties' }),
      });
      expect(publishToQueueSpy).not.toHaveBeenCalled();
    });
  });

  describe('when the event body is missing "message"', () => {
    it('returns a bad request response', async () => {
      const publishToQueueSpy = setupPublishToQueueSpy();

      const messagePayload = {
        phoneNumber: '+441234567890',
      };
      const event = {
        body: JSON.stringify(messagePayload),
      };
      const result = await runHandler(event);
      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({ message: '"message" and "phoneNumber" are both required properties' }),
      });
      expect(publishToQueueSpy).not.toHaveBeenCalled();
    });
  });

  describe('when the event body is invalid JSON', () => {
    it('returns a bad request response', async () => {
      const publishToQueueSpy = setupPublishToQueueSpy();

      const event = {
        body: 'foo bar',
      };

      const result = await runHandler(event);
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

      const result = await runHandler(event);
      expect(result).toEqual({
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
      expect(publishToQueueSpy).toHaveBeenCalled();
    });
  });
});
