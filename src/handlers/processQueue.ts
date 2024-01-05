import { SQSHandler, SQSRecord } from 'aws-lambda';
import { dispatchSms } from '../adapters/snsAdapter';
import { LogContext, SqsMessageBody, SqsRecordBody } from '../types';

export const handler: SQSHandler = async (event) => {
  const { Records: records } = event;
  // decided to use a traditional loop over Promise.all to ensure each message is processed incrementally
  // guards against overloading the SNS Client if there is a large volume of records in the Queue
  for (const record of records) {
    await processRecord(record);
  }
};

// handles the processing of an individual record
// error handler ensures no errors are thrown but the failing record is logged
// this ensures processing of other records on the queue is not interrupted
// this could be improved in the future to maybe make use of a dead letter queue instead
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
