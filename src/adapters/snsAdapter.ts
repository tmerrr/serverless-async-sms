import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { awsConfig } from '../config';
import { DispatchMessageBody } from '../types';

// basic adapter functions to abstract away the SNSClient and aws config
// also handles renaming to AWS attributes, such as "message" to "Message"

const client = new SNSClient();

export const publishToQueue = async (
  messageContent: DispatchMessageBody,
  correlationId?: string,
) => {
  const command = new PublishCommand({
    TopicArn: awsConfig.topicArn,
    Message: JSON.stringify({
      ...messageContent,
      correlationId,
    }),
  });
  await client.send(command);
};

export const dispatchSms = async (messageContent: DispatchMessageBody) => {
  const command = new PublishCommand({
    PhoneNumber: messageContent.phoneNumber,
    Message: messageContent.message,
  });
  await client.send(command);
};
