import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { awsConfig } from '../config';
import { DispatchMessageBody } from '../types';

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
