type AwsConfig = {
  topicArn?: string;
};

export const awsConfig: AwsConfig = {
  topicArn: process.env.SNS_TOPIC_ARN,
};
