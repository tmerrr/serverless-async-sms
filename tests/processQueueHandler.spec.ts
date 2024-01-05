import { Context, SQSEvent, SQSRecord } from 'aws-lambda';
import * as snsAdapter from '../src/adapters/snsAdapter';
import { handler } from '../src/handlers/processQueue';
import { SqsMessageBody } from '../src/types';

type MockSQSRecord = Pick<SQSRecord, 'body'>;
type MockSQSEvent = {
  Records: MockSQSRecord[];
};

const setupLoggerSpies = () => {
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'warn').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();
};

const messageBody: SqsMessageBody = {
  message: 'Hello world!',
  phoneNumber: '+441234567890',
  correlationId: 'uuid',
};

const genSqsRecord = (): MockSQSRecord => ({
  body: JSON.stringify({
    Message: JSON.stringify(messageBody),
  }),
});

describe('Process Queue Handler', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    setupLoggerSpies();
  });

  describe('when a valid event body is received', () => {
    it('successfully dispatches an SMS message', async () => {
      const dispatchSmsSpy = jest
        .spyOn(snsAdapter, 'dispatchSms')
        .mockResolvedValue();

      const event: MockSQSEvent = {
        Records: [
          genSqsRecord(),
        ],
      };
      await handler(
        event as SQSEvent,
        {} as Context,
        jest.fn(),
      );

      expect(dispatchSmsSpy).toHaveBeenCalledTimes(1)
    });
  });

  describe('when a valid event body is received with multiple messages', () => {
    it('successfully dispatches correct number of SMS messages', async () => {
      const dispatchSmsSpy = jest
        .spyOn(snsAdapter, 'dispatchSms')
        .mockResolvedValue();

      const messageBody: SqsMessageBody = {
        message: 'Hello world!',
        phoneNumber: '+441234567890',
        correlationId: 'uuid',
      };
      const event: MockSQSEvent = {
        Records: [
          genSqsRecord(),
          genSqsRecord(),
          genSqsRecord(),
        ],
      };
      await handler(
        event as SQSEvent,
        {} as Context,
        jest.fn(),
      );

      expect(dispatchSmsSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('when a one message fails to send the other records are still processed', () => {
    it('successfully dispatches correct number of SMS messages', async () => {
      const dispatchSmsSpy = jest
        .spyOn(snsAdapter, 'dispatchSms')
        .mockRejectedValueOnce(new Error('Mocked Error'))
        .mockResolvedValue();

      const messageBody: SqsMessageBody = {
        message: 'Hello world!',
        phoneNumber: '+441234567890',
        correlationId: 'uuid',
      };
      const event: MockSQSEvent = {
        Records: [
          genSqsRecord(),
          genSqsRecord(),
          genSqsRecord(),
        ],
      };
      await handler(
        event as SQSEvent,
        {} as Context,
        jest.fn(),
      );

      expect(dispatchSmsSpy).toHaveBeenCalledTimes(3);
    });
  });
});
