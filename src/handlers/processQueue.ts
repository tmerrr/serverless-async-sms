import { SQSHandler, SQSRecord } from 'aws-lambda';
import { dispatchSms } from '../adapters/snsAdapter';
import { LogContext, SqsMessageBody, SqsRecordBody } from '../types';

const processRecord = async (record: SQSRecord): Promise<void> => {
  const logContext: LogContext = {};
  try {
    const recordBody: SqsRecordBody = JSON.parse(record.body);
    const {
      correlationId,
      message,
      phoneNumber,
    }: SqsMessageBody = JSON.parse(recordBody.Message);
    logContext.correlationId = correlationId;
    console.log('Sending SMS message...', logContext);
    await dispatchSms({ message, phoneNumber });
    console.log('Successfully sent SMS message', logContext);
  } catch (err: unknown) {
    console.error('An unknown error occurred', err, logContext)
  }
};

export const handler: SQSHandler = async (event) => {
  const { Records: records } = event;
  for (const record of records) {
    await processRecord(record);
  }
};
