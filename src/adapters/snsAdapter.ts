import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { awsConfig } from '../config';

const client = new SNSClient();

export type MessageContent = {
  message: string;
  phoneNumber: string;
};

export const publishToQueue = async (
  messageContent: MessageContent,
  correlationId?: string,
) => {
  const command = new PublishCommand({
    TopicArn: awsConfig.topicArn,
    Message: JSON.stringify({
      correlationId,
      ...messageContent,
    }),
  });
  await client.send(command);
};

export const dispatchSms = async (messageContent: MessageContent) => {
  const command = new PublishCommand({
    PhoneNumber: messageContent.phoneNumber,
    Message: messageContent.message,
  });
  await client.send(command);
};
